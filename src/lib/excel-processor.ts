import * as XLSX from "xlsx";
import type {
  CompanyData,
  DGEGIndicators,
  YearlyEmissions,
  CompanyEmissions,
  SectorData,
} from "@/types";
import {
  validateCompanyData,
  type ProcessingResult,
} from "@/lib/validations/upload";

/**
 * Column mapping for DGEG Excel files
 * Adjust these based on the actual Excel structure
 */
const COLUMN_MAPPING = {
  company: ["empresa", "company", "nome", "name", "entidade", "entity"],
  sector: ["setor", "sector", "atividade", "activity", "cae"],
  year: ["ano", "year", "período", "period"],
  energyConsumption: [
    "consumo",
    "consumption",
    "energia",
    "energy",
    "consumo_energia",
    "energy_consumption",
    "mwh",
    "kwh",
    "gj",
  ],
  co2Emissions: [
    "emissoes",
    "emissions",
    "co2",
    "carbono",
    "carbon",
    "emissoes_co2",
    "co2_emissions",
    "tco2",
    "tonnes_co2",
  ],
};

/**
 * Find the actual column name in the Excel headers
 */
function findColumn(
  headers: string[],
  possibleNames: string[]
): string | undefined {
  const normalizedHeaders = headers.map((h) =>
    String(h).toLowerCase().trim().replace(/\s+/g, "_")
  );

  for (const name of possibleNames) {
    const index = normalizedHeaders.findIndex(
      (h) => h.includes(name) || name.includes(h)
    );
    if (index !== -1) {
      return headers[index];
    }
  }
  return undefined;
}

/**
 * Parse numeric value from cell
 */
function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.,\-]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  }
  return 0;
}

/**
 * Extract data from Excel file buffer
 */
export function extractDataFromExcel(buffer: Buffer): CompanyData[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("O ficheiro Excel está vazio");
  }

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  if (jsonData.length === 0) {
    throw new Error("Não foram encontrados dados no ficheiro Excel");
  }

  // Get headers from first row
  const headers = Object.keys(jsonData[0] || {});

  // Find column mappings
  const companyCol = findColumn(headers, COLUMN_MAPPING.company);
  const sectorCol = findColumn(headers, COLUMN_MAPPING.sector);
  const yearCol = findColumn(headers, COLUMN_MAPPING.year);
  const energyCol = findColumn(headers, COLUMN_MAPPING.energyConsumption);
  const emissionsCol = findColumn(headers, COLUMN_MAPPING.co2Emissions);

  // Validate required columns
  if (!companyCol && !emissionsCol) {
    throw new Error(
      `Colunas obrigatórias não encontradas. Colunas disponíveis: ${headers.join(
        ", "
      )}`
    );
  }

  // Extract and transform data
  const data: CompanyData[] = [];

  for (const row of jsonData) {
    const company = companyCol
      ? String(row[companyCol] || "Desconhecido")
      : "Empresa";
    const sector = sectorCol
      ? String(row[sectorCol] || "Não especificado")
      : "Geral";
    const year = yearCol ? parseNumber(row[yearCol]) : new Date().getFullYear();
    const energyConsumption = energyCol ? parseNumber(row[energyCol]) : 0;
    const co2Emissions = emissionsCol ? parseNumber(row[emissionsCol]) : 0;

    // Skip rows with no meaningful data
    if (energyConsumption > 0 || co2Emissions > 0) {
      data.push({
        company,
        sector,
        year,
        energyConsumption,
        co2Emissions,
      });
    }
  }

  return data;
}

/**
 * Calculate indicators from extracted data
 */
export function calculateIndicators(data: CompanyData[]): DGEGIndicators {
  if (data.length === 0) {
    return {
      emissionsByYear: [],
      averageEnergyPerCompany: 0,
      topEmitters: [],
      totalCompanies: 0,
      totalEmissions: 0,
      totalEnergyConsumption: 0,
      emissionsBySector: [],
      averageCarbonIntensity: 0,
      forecast: [],
      rankings: {
        topEmitters: [],
        topReducers: [],
        mostEfficient: [],
        leastEfficient: [],
      },
    };
  }

  // 1. Total CO₂ emissions per year (with energy for carbon intensity)
  const yearMap = new Map<
    number,
    { emissions: number; energy: number; companies: Set<string> }
  >();
  for (const item of data) {
    const existing = yearMap.get(item.year) || {
      emissions: 0,
      energy: 0,
      companies: new Set<string>(),
    };
    existing.emissions += item.co2Emissions;
    existing.energy += item.energyConsumption;
    existing.companies.add(item.company);
    yearMap.set(item.year, existing);
  }

  const emissionsByYear: YearlyEmissions[] = Array.from(yearMap.entries())
    .map(([year, { emissions, energy, companies }]) => ({
      year,
      totalEmissions: Math.round(emissions * 100) / 100,
      totalEnergy: Math.round(energy * 100) / 100,
      companyCount: companies.size,
      carbonIntensity:
        energy > 0 ? Math.round((emissions / energy) * 1000) / 1000 : 0,
    }))
    .sort((a, b) => a.year - b.year);

  // 2. Unique companies and average energy (with carbon intensity per company)
  const companyMap = new Map<
    string,
    {
      emissions: number;
      energy: number;
      sector: string;
      yearlyData: Map<number, { emissions: number }>;
    }
  >();
  for (const item of data) {
    const existing = companyMap.get(item.company) || {
      emissions: 0,
      energy: 0,
      sector: item.sector,
      yearlyData: new Map(),
    };
    existing.emissions += item.co2Emissions;
    existing.energy += item.energyConsumption;

    // Track yearly data for reduction calculation
    const yearData = existing.yearlyData.get(item.year) || { emissions: 0 };
    yearData.emissions += item.co2Emissions;
    existing.yearlyData.set(item.year, yearData);

    companyMap.set(item.company, existing);
  }

  const totalCompanies = companyMap.size;
  const totalEnergyConsumption = data.reduce(
    (sum, item) => sum + item.energyConsumption,
    0
  );
  const averageEnergyPerCompany =
    totalCompanies > 0
      ? Math.round((totalEnergyConsumption / totalCompanies) * 100) / 100
      : 0;

  // 3. Build company emissions array with carbon intensity
  const allCompanyEmissions: CompanyEmissions[] = Array.from(
    companyMap.entries()
  ).map(([company, { emissions, energy, sector }]) => ({
    company,
    sector,
    totalEmissions: Math.round(emissions * 100) / 100,
    totalEnergy: Math.round(energy * 100) / 100,
    carbonIntensity:
      energy > 0 ? Math.round((emissions / energy) * 1000) / 1000 : 0,
  }));

  // 4. Top 5 companies with highest emissions
  const topEmitters = [...allCompanyEmissions]
    .sort((a, b) => b.totalEmissions - a.totalEmissions)
    .slice(0, 5);

  // 5. Total emissions and average carbon intensity
  const totalEmissions =
    Math.round(data.reduce((sum, item) => sum + item.co2Emissions, 0) * 100) /
    100;

  const averageCarbonIntensity =
    totalEnergyConsumption > 0
      ? Math.round((totalEmissions / totalEnergyConsumption) * 1000) / 1000
      : 0;

  // 6. Emissions by sector (with carbon intensity)
  const sectorMap = new Map<
    string,
    { emissions: number; energy: number; companies: Set<string> }
  >();
  for (const item of data) {
    const existing = sectorMap.get(item.sector) || {
      emissions: 0,
      energy: 0,
      companies: new Set<string>(),
    };
    existing.emissions += item.co2Emissions;
    existing.energy += item.energyConsumption;
    existing.companies.add(item.company);
    sectorMap.set(item.sector, existing);
  }

  const emissionsBySector: SectorData[] = Array.from(sectorMap.entries())
    .map(([sector, { emissions, energy, companies }]) => ({
      sector,
      totalEmissions: Math.round(emissions * 100) / 100,
      totalEnergy: Math.round(energy * 100) / 100,
      companyCount: companies.size,
      carbonIntensity:
        energy > 0 ? Math.round((emissions / energy) * 1000) / 1000 : 0,
    }))
    .sort((a, b) => b.totalEmissions - a.totalEmissions);

  // 7. Calculate forecast (simple linear regression)
  const forecast = calculateForecast(emissionsByYear);

  // 8. Calculate rankings
  const rankings = calculateRankings(allCompanyEmissions, companyMap);

  return {
    emissionsByYear,
    averageEnergyPerCompany,
    topEmitters,
    totalCompanies,
    totalEmissions,
    totalEnergyConsumption: Math.round(totalEnergyConsumption * 100) / 100,
    emissionsBySector,
    averageCarbonIntensity,
    forecast,
    rankings,
  };
}

/**
 * Calculate forecast using simple linear regression
 */
function calculateForecast(
  emissionsByYear: YearlyEmissions[]
): DGEGIndicators["forecast"] {
  if (emissionsByYear.length < 2) return [];

  const years = emissionsByYear.map((e) => e.year);
  const emissions = emissionsByYear.map((e) => e.totalEmissions);

  // Simple linear regression
  const n = years.length;
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = emissions.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((sum, x, i) => sum + x * emissions[i], 0);
  const sumXX = years.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² for confidence
  const yMean = sumY / n;
  const ssTotal = emissions.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssResidual = emissions.reduce((sum, y, i) => {
    const predicted = slope * years[i] + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;
  const confidence = Math.max(0, Math.min(100, Math.round(rSquared * 100)));

  // Predict next 3 years
  const lastYear = Math.max(...years);
  const forecast = [];
  for (let i = 1; i <= 3; i++) {
    const predictedYear = lastYear + i;
    const predictedEmissions = Math.max(
      0,
      Math.round((slope * predictedYear + intercept) * 100) / 100
    );
    forecast.push({
      year: predictedYear,
      predictedEmissions,
      confidence: Math.max(10, confidence - i * 10), // Confidence decreases for further predictions
    });
  }

  return forecast;
}

/**
 * Calculate rankings
 */
function calculateRankings(
  allCompanyEmissions: CompanyEmissions[],
  companyMap: Map<
    string,
    {
      emissions: number;
      energy: number;
      sector: string;
      yearlyData: Map<number, { emissions: number }>;
    }
  >
): DGEGIndicators["rankings"] {
  // Top emitters (already sorted)
  const topEmitters = [...allCompanyEmissions]
    .sort((a, b) => b.totalEmissions - a.totalEmissions)
    .slice(0, 10);

  // Most efficient (lowest carbon intensity, excluding zero energy)
  const mostEfficient = [...allCompanyEmissions]
    .filter((c) => c.totalEnergy > 0)
    .sort((a, b) => a.carbonIntensity - b.carbonIntensity)
    .slice(0, 10);

  // Least efficient (highest carbon intensity)
  const leastEfficient = [...allCompanyEmissions]
    .filter((c) => c.totalEnergy > 0)
    .sort((a, b) => b.carbonIntensity - a.carbonIntensity)
    .slice(0, 10);

  // Top reducers (companies that reduced emissions year over year)
  interface TopReducer {
    company: string;
    sector: string;
    reductionPercent: number;
    previousEmissions: number;
    currentEmissions: number;
  }
  const topReducers: TopReducer[] = [];

  for (const [company, data] of companyMap.entries()) {
    const years = Array.from(data.yearlyData.keys()).sort((a, b) => a - b);
    if (years.length >= 2) {
      const firstYear = years[0];
      const lastYear = years[years.length - 1];
      const firstEmissions = data.yearlyData.get(firstYear)?.emissions || 0;
      const lastEmissions = data.yearlyData.get(lastYear)?.emissions || 0;

      if (firstEmissions > 0 && lastEmissions < firstEmissions) {
        const reductionPercent =
          Math.round(
            ((firstEmissions - lastEmissions) / firstEmissions) * 10000
          ) / 100;
        topReducers.push({
          company,
          sector: data.sector,
          reductionPercent,
          previousEmissions: Math.round(firstEmissions * 100) / 100,
          currentEmissions: Math.round(lastEmissions * 100) / 100,
        });
      }
    }
  }

  topReducers.sort((a, b) => b.reductionPercent - a.reductionPercent);

  return {
    topEmitters,
    topReducers: topReducers.slice(0, 10),
    mostEfficient,
    leastEfficient,
  };
}

/**
 * Main function to process Excel file
 */
export function processExcelFile(buffer: Buffer): ProcessingResult {
  try {
    const rawData = extractDataFromExcel(buffer);

    if (rawData.length === 0) {
      return {
        success: false,
        error: "Não foram encontrados dados válidos no ficheiro Excel",
      };
    }

    // Validate extracted data with Zod
    const validation = validateCompanyData(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const indicators = calculateIndicators(validation.data);

    return {
      success: true,
      data: indicators,
      rowsProcessed: validation.data.length,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao processar ficheiro Excel",
    };
  }
}
