// Types for DGEG Excel data processing

export interface CompanyData {
  company: string;
  sector: string;
  year: number;
  energyConsumption: number; // MWh or similar unit
  co2Emissions: number; // tonnes CO₂
}

export interface YearlyEmissions {
  year: number;
  totalEmissions: number;
  totalEnergy: number;
  companyCount: number;
  carbonIntensity: number; // t CO₂ / MWh
}

export interface CompanyEmissions {
  company: string;
  sector: string;
  totalEmissions: number;
  totalEnergy: number;
  carbonIntensity: number; // t CO₂ / MWh
}

export interface SectorData {
  sector: string;
  totalEmissions: number;
  totalEnergy: number;
  companyCount: number;
  carbonIntensity: number; // t CO₂ / MWh
}

export interface ForecastData {
  year: number;
  predictedEmissions: number;
  confidence: number; // 0-100%
}

export interface TopReducer {
  company: string;
  sector: string;
  reductionPercent: number;
  previousEmissions: number;
  currentEmissions: number;
}

export interface Rankings {
  topEmitters: CompanyEmissions[];
  topReducers: TopReducer[];
  mostEfficient: CompanyEmissions[];
  leastEfficient: CompanyEmissions[];
}

export interface DGEGIndicators {
  // Total CO₂ emissions per year
  emissionsByYear: YearlyEmissions[];

  // Average energy consumption per company
  averageEnergyPerCompany: number;

  // Top 5 companies with highest emissions
  topEmitters: CompanyEmissions[];

  // Additional indicators
  totalCompanies: number;
  totalEmissions: number;
  totalEnergyConsumption: number;

  // Emissions by sector
  emissionsBySector: SectorData[];

  // Carbon intensity (t CO₂ / MWh)
  averageCarbonIntensity: number;

  // Forecast for next years
  forecast?: ForecastData[];

  // Rankings
  rankings?: Rankings;
}

export interface ProcessingResult {
  success: boolean;
  data?: DGEGIndicators;
  error?: string;
  rowsProcessed?: number;
}
