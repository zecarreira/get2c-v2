import { describe, it, expect } from "vitest";
import {
  validateCompanyData,
  excelFileSchema,
  companyDataSchema,
  MAX_FILE_SIZE,
} from "@/lib/validations/upload";

describe("upload validations", () => {
  describe("excelFileSchema", () => {
    it("deve aceitar ficheiro .xlsx válido", () => {
      const result = excelFileSchema.safeParse({
        name: "data.xlsx",
        size: 1024,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      expect(result.success).toBe(true);
    });

    it("deve aceitar ficheiro .xls válido", () => {
      const result = excelFileSchema.safeParse({
        name: "data.xls",
        size: 1024,
        type: "application/vnd.ms-excel",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar ficheiros com extensão inválida", () => {
      const result = excelFileSchema.safeParse({
        name: "data.pdf",
        size: 1024,
        type: "application/pdf",
      });

      expect(result.success).toBe(false);
    });

    it("deve rejeitar ficheiros vazios", () => {
      const result = excelFileSchema.safeParse({
        name: "data.xlsx",
        size: 0,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      expect(result.success).toBe(false);
    });

    it("deve rejeitar ficheiros demasiado grandes", () => {
      const result = excelFileSchema.safeParse({
        name: "data.xlsx",
        size: MAX_FILE_SIZE + 1,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("companyDataSchema", () => {
    it("deve validar dados de empresa válidos", () => {
      const result = companyDataSchema.safeParse({
        company: "EDP",
        sector: "Energia",
        year: 2023,
        energyConsumption: 500000,
        co2Emissions: 150000,
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar ano inválido (muito antigo)", () => {
      const result = companyDataSchema.safeParse({
        company: "EDP",
        sector: "Energia",
        year: 1800,
        energyConsumption: 500000,
        co2Emissions: 150000,
      });

      expect(result.success).toBe(false);
    });

    it("deve rejeitar emissões negativas", () => {
      const result = companyDataSchema.safeParse({
        company: "EDP",
        sector: "Energia",
        year: 2023,
        energyConsumption: 500000,
        co2Emissions: -100,
      });

      expect(result.success).toBe(false);
    });

    it("deve usar valor default para setor em falta", () => {
      const result = companyDataSchema.safeParse({
        company: "EDP",
        year: 2023,
        energyConsumption: 500000,
        co2Emissions: 150000,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sector).toBe("Não especificado");
      }
    });
  });

  describe("validateCompanyData", () => {
    it("deve filtrar dados inválidos e manter válidos", () => {
      const data = [
        {
          company: "EDP",
          sector: "Energia",
          year: 2023,
          energyConsumption: 500000,
          co2Emissions: 150000,
        },
        {
          company: "Invalid",
          sector: "Test",
          year: 1800,
          energyConsumption: 100,
          co2Emissions: 50,
        }, // ano inválido
        {
          company: "Galp",
          sector: "Petróleo",
          year: 2023,
          energyConsumption: 600000,
          co2Emissions: 200000,
        },
      ];

      const result = validateCompanyData(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].company).toBe("EDP");
        expect(result.data[1].company).toBe("Galp");
      }
    });

    it("deve retornar erro se nenhum dado for válido", () => {
      const data = [
        {
          company: "",
          sector: "Test",
          year: 2023,
          energyConsumption: 100,
          co2Emissions: -50,
        },
      ];

      const result = validateCompanyData(data);

      expect(result.success).toBe(false);
    });
  });
});
