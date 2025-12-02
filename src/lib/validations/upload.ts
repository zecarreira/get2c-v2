import { z } from "zod";

// Constantes de validação
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "application/octet-stream", // generic binary (some browsers)
];
export const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];

// Schema para validação de ficheiro Excel
export const excelFileSchema = z.object({
  name: z
    .string()
    .min(1, "Nome do ficheiro é obrigatório")
    .refine(
      (name) =>
        ACCEPTED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)),
      {
        message: "O ficheiro deve ter extensão .xlsx ou .xls",
      }
    ),
  size: z
    .number()
    .min(1, "O ficheiro está vazio")
    .max(
      MAX_FILE_SIZE,
      `O ficheiro é demasiado grande. Tamanho máximo: ${
        MAX_FILE_SIZE / 1024 / 1024
      }MB`
    ),
  type: z.string(),
});

// Schema para dados extraídos de uma linha do Excel
export const companyDataSchema = z.object({
  company: z.string().min(1, "Nome da empresa é obrigatório"),
  sector: z.string().default("Não especificado"),
  year: z
    .number()
    .int("Ano deve ser um número inteiro")
    .min(1900, "Ano inválido")
    .max(2100, "Ano inválido"),
  energyConsumption: z
    .number()
    .min(0, "Consumo de energia não pode ser negativo"),
  co2Emissions: z.number().min(0, "Emissões CO₂ não podem ser negativas"),
});

// Schema para array de dados de empresas
export const companyDataArraySchema = z
  .array(companyDataSchema)
  .min(1, "O ficheiro deve conter pelo menos um registo válido");

// Schema para emissões por ano
export const yearlyEmissionsSchema = z.object({
  year: z.number(),
  totalEmissions: z.number(),
  totalEnergy: z.number(),
  companyCount: z.number(),
  carbonIntensity: z.number(), // t CO₂ / MWh
});

// Schema para emissões por empresa
export const companyEmissionsSchema = z.object({
  company: z.string(),
  sector: z.string(),
  totalEmissions: z.number(),
  totalEnergy: z.number(),
  carbonIntensity: z.number(), // t CO₂ / MWh
});

// Schema para dados por setor
export const sectorDataSchema = z.object({
  sector: z.string(),
  totalEmissions: z.number(),
  totalEnergy: z.number(),
  companyCount: z.number(),
  carbonIntensity: z.number(), // t CO₂ / MWh
});

// Schema para previsão/forecast
export const forecastDataSchema = z.object({
  year: z.number(),
  predictedEmissions: z.number(),
  confidence: z.number(), // 0-100%
});

// Schema para rankings
export const rankingsSchema = z.object({
  topEmitters: z.array(companyEmissionsSchema),
  topReducers: z.array(
    z.object({
      company: z.string(),
      sector: z.string(),
      reductionPercent: z.number(),
      previousEmissions: z.number(),
      currentEmissions: z.number(),
    })
  ),
  mostEfficient: z.array(companyEmissionsSchema), // Ordenado por menor carbonIntensity
  leastEfficient: z.array(companyEmissionsSchema), // Ordenado por maior carbonIntensity
});

// Schema para os indicadores DGEG
export const dgegIndicatorsSchema = z.object({
  emissionsByYear: z.array(yearlyEmissionsSchema),
  averageEnergyPerCompany: z.number(),
  topEmitters: z.array(companyEmissionsSchema),
  totalCompanies: z.number(),
  totalEmissions: z.number(),
  totalEnergyConsumption: z.number(),
  emissionsBySector: z.array(sectorDataSchema),
  // Novos campos
  averageCarbonIntensity: z.number(),
  forecast: z.array(forecastDataSchema).optional(),
  rankings: rankingsSchema.optional(),
});

// Schema para resposta de processamento
export const processingResultSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: dgegIndicatorsSchema,
    rowsProcessed: z.number(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

// Tipos inferidos dos schemas
export type ExcelFile = z.infer<typeof excelFileSchema>;
export type CompanyData = z.infer<typeof companyDataSchema>;
export type YearlyEmissions = z.infer<typeof yearlyEmissionsSchema>;
export type CompanyEmissions = z.infer<typeof companyEmissionsSchema>;
export type SectorData = z.infer<typeof sectorDataSchema>;
export type DGEGIndicators = z.infer<typeof dgegIndicatorsSchema>;
export type ProcessingResult = z.infer<typeof processingResultSchema>;

// Função helper para validar ficheiro
export function validateExcelFile(
  file: File
): { success: true; data: ExcelFile } | { success: false; error: string } {
  const result = excelFileSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Ficheiro inválido",
    };
  }

  // Validação adicional do tipo MIME (mais flexível)
  const isValidType =
    ACCEPTED_EXCEL_TYPES.includes(file.type) ||
    ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

  if (!isValidType) {
    return {
      success: false,
      error:
        "Formato de ficheiro inválido. Por favor, envie um ficheiro Excel (.xlsx ou .xls)",
    };
  }

  return { success: true, data: result.data };
}

// Função helper para validar dados extraídos
export function validateCompanyData(
  data: unknown[]
): { success: true; data: CompanyData[] } | { success: false; error: string } {
  const validData: CompanyData[] = [];
  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const result = companyDataSchema.safeParse(data[i]);
    if (result.success) {
      validData.push(result.data);
    } else {
      // Apenas registar o primeiro erro para não sobrecarregar
      if (errors.length < 3) {
        errors.push(`Linha ${i + 2}: ${result.error.issues[0]?.message}`);
      }
    }
  }

  if (validData.length === 0) {
    return {
      success: false,
      error:
        errors.length > 0
          ? `Nenhum registo válido encontrado. ${errors.join("; ")}`
          : "Nenhum registo válido encontrado no ficheiro",
    };
  }

  return { success: true, data: validData };
}
