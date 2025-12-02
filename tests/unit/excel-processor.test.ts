import { describe, it, expect } from "vitest";
import {
  extractDataFromExcel,
  calculateIndicators,
  processExcelFile,
} from "@/lib/excel-processor";
import * as XLSX from "xlsx";

// Helper para criar um buffer Excel de teste
function createTestExcelBuffer(data: Record<string, unknown>[]): Buffer {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Test");
  return Buffer.from(
    XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
  );
}

describe("excel-processor", () => {
  describe("extractDataFromExcel", () => {
    it("deve extrair dados corretamente de um ficheiro Excel válido", () => {
      const testData = [
        {
          Empresa: "EDP",
          Setor: "Energia",
          Ano: 2023,
          "Emissões CO2 (t)": 150000,
          "Consumo Energia (MWh)": 500000,
        },
        {
          Empresa: "Galp",
          Setor: "Petróleo",
          Ano: 2023,
          "Emissões CO2 (t)": 200000,
          "Consumo Energia (MWh)": 750000,
        },
      ];
      const buffer = createTestExcelBuffer(testData);

      const result = extractDataFromExcel(buffer);

      expect(result).toHaveLength(2);
      expect(result[0].company).toBe("EDP");
      expect(result[0].sector).toBe("Energia");
      expect(result[0].year).toBe(2023);
      expect(result[0].co2Emissions).toBe(150000);
      expect(result[0].energyConsumption).toBe(500000);
    });

    it("deve reconhecer nomes de colunas em inglês", () => {
      const testData = [
        {
          company: "Test Co",
          sector: "Industry",
          year: 2022,
          emissions: 100000,
          energy: 300000,
        },
      ];
      const buffer = createTestExcelBuffer(testData);

      const result = extractDataFromExcel(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].company).toBe("Test Co");
    });

    it("deve ignorar linhas sem dados de emissões ou consumo", () => {
      const testData = [
        {
          Empresa: "EDP",
          Setor: "Energia",
          Ano: 2023,
          "Emissões CO2 (t)": 150000,
          "Consumo Energia (MWh)": 500000,
        },
        {
          Empresa: "Empty",
          Setor: "Outro",
          Ano: 2023,
          "Emissões CO2 (t)": 0,
          "Consumo Energia (MWh)": 0,
        },
      ];
      const buffer = createTestExcelBuffer(testData);

      const result = extractDataFromExcel(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].company).toBe("EDP");
    });

    it("deve lançar erro para ficheiro vazio", () => {
      const buffer = createTestExcelBuffer([]);

      expect(() => extractDataFromExcel(buffer)).toThrow(
        "Não foram encontrados dados"
      );
    });
  });

  describe("calculateIndicators", () => {
    const testData = [
      {
        company: "EDP",
        sector: "Energia",
        year: 2022,
        co2Emissions: 100000,
        energyConsumption: 400000,
      },
      {
        company: "EDP",
        sector: "Energia",
        year: 2023,
        co2Emissions: 120000,
        energyConsumption: 450000,
      },
      {
        company: "Galp",
        sector: "Petróleo",
        year: 2022,
        co2Emissions: 200000,
        energyConsumption: 600000,
      },
      {
        company: "Galp",
        sector: "Petróleo",
        year: 2023,
        co2Emissions: 180000,
        energyConsumption: 550000,
      },
      {
        company: "REN",
        sector: "Energia",
        year: 2023,
        co2Emissions: 50000,
        energyConsumption: 200000,
      },
    ];

    it("deve calcular emissões por ano corretamente", () => {
      const indicators = calculateIndicators(testData);

      expect(indicators.emissionsByYear).toHaveLength(2);

      const year2022 = indicators.emissionsByYear.find((y) => y.year === 2022);
      const year2023 = indicators.emissionsByYear.find((y) => y.year === 2023);

      expect(year2022?.totalEmissions).toBe(300000); // 100000 + 200000
      expect(year2023?.totalEmissions).toBe(350000); // 120000 + 180000 + 50000
    });

    it("deve calcular média de energia por empresa", () => {
      const indicators = calculateIndicators(testData);

      // Total energia: 400000 + 450000 + 600000 + 550000 + 200000 = 2200000
      // Empresas únicas: 3 (EDP, Galp, REN)
      // Média: 2200000 / 3 = 733333.33
      expect(indicators.averageEnergyPerCompany).toBeCloseTo(733333.33, 0);
    });

    it("deve retornar top 5 emissores ordenados", () => {
      const indicators = calculateIndicators(testData);

      expect(indicators.topEmitters).toHaveLength(3); // só temos 3 empresas
      expect(indicators.topEmitters[0].company).toBe("Galp"); // 380000 total
      expect(indicators.topEmitters[1].company).toBe("EDP"); // 220000 total
      expect(indicators.topEmitters[2].company).toBe("REN"); // 50000 total
    });

    it("deve calcular emissões por setor", () => {
      const indicators = calculateIndicators(testData);

      const energiaSector = indicators.emissionsBySector.find(
        (s) => s.sector === "Energia"
      );
      const petroleoSector = indicators.emissionsBySector.find(
        (s) => s.sector === "Petróleo"
      );

      // Energia: EDP (100000 + 120000) + REN (50000) = 270000
      expect(energiaSector?.totalEmissions).toBe(270000);
      // Petróleo: Galp (200000 + 180000) = 380000
      expect(petroleoSector?.totalEmissions).toBe(380000);
    });

    it("deve contar empresas únicas corretamente", () => {
      const indicators = calculateIndicators(testData);
      expect(indicators.totalCompanies).toBe(3);
    });

    it("deve retornar valores zero para array vazio", () => {
      const indicators = calculateIndicators([]);

      expect(indicators.emissionsByYear).toHaveLength(0);
      expect(indicators.averageEnergyPerCompany).toBe(0);
      expect(indicators.topEmitters).toHaveLength(0);
      expect(indicators.totalCompanies).toBe(0);
      expect(indicators.totalEmissions).toBe(0);
    });
  });

  describe("processExcelFile", () => {
    it("deve processar ficheiro Excel válido com sucesso", () => {
      const testData = [
        {
          Empresa: "EDP",
          Setor: "Energia",
          Ano: 2023,
          "Emissões CO2 (t)": 150000,
          "Consumo Energia (MWh)": 500000,
        },
      ];
      const buffer = createTestExcelBuffer(testData);

      const result = processExcelFile(buffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.rowsProcessed).toBe(1);
      }
    });

    it("deve retornar erro para ficheiro sem dados válidos", () => {
      const testData = [
        { Empresa: "Empty", "Emissões CO2 (t)": 0, "Consumo Energia (MWh)": 0 },
      ];
      const buffer = createTestExcelBuffer(testData);

      const result = processExcelFile(buffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("deve retornar erro para buffer inválido", () => {
      const invalidBuffer = Buffer.from("not an excel file");

      const result = processExcelFile(invalidBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
