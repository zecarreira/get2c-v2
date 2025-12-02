import * as XLSX from "xlsx";

// Generate sample DGEG-like data
const companies = [
  { name: "EDP - Energias de Portugal", sector: "Energia" },
  { name: "Galp Energia", sector: "Petróleo e Gás" },
  { name: "REN - Redes Energéticas", sector: "Energia" },
  { name: "Navigator Company", sector: "Papel e Celulose" },
  { name: "Cimpor", sector: "Cimento" },
  { name: "Secil", sector: "Cimento" },
  { name: "The Navigator Company", sector: "Papel e Celulose" },
  { name: "Portucel", sector: "Papel e Celulose" },
  { name: "Pegop - Energia Elétrica", sector: "Energia" },
  { name: "Turbogás", sector: "Energia" },
  {
    name: "CPPE - Companhia Portuguesa de Produção de Electricidade",
    sector: "Energia",
  },
  { name: "Siderurgia Nacional", sector: "Metalurgia" },
  { name: "Celbi - Celulose da Beira Industrial", sector: "Papel e Celulose" },
  { name: "Petrogal", sector: "Petróleo e Gás" },
  { name: "FISIPE - Fibras Sintéticas de Portugal", sector: "Química" },
];

const years = [2019, 2020, 2021, 2022, 2023];

interface DataRow {
  Empresa: string;
  Setor: string;
  Ano: number;
  "Emissões CO2 (t)": number;
  "Consumo Energia (MWh)": number;
}

const data: DataRow[] = [];

// Generate data for each company and year
companies.forEach((company) => {
  const baseEmissions = Math.floor(Math.random() * 500000) + 50000;
  const baseEnergy = Math.floor(Math.random() * 1000000) + 100000;

  years.forEach((year) => {
    // Add some variation per year (±15%)
    const yearVariation = 0.85 + Math.random() * 0.3;
    const emissions = Math.floor(baseEmissions * yearVariation);
    const energy = Math.floor(baseEnergy * yearVariation);

    data.push({
      Empresa: company.name,
      Setor: company.sector,
      Ano: year,
      "Emissões CO2 (t)": emissions,
      "Consumo Energia (MWh)": energy,
    });
  });
});

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(data);

// Set column widths
worksheet["!cols"] = [
  { wch: 50 }, // Empresa
  { wch: 20 }, // Setor
  { wch: 8 }, // Ano
  { wch: 18 }, // Emissões
  { wch: 22 }, // Consumo Energia
];

XLSX.utils.book_append_sheet(workbook, worksheet, "Dados DGEG");

// Write file
XLSX.writeFile(workbook, "public/sample-dgeg-data.xlsx");

console.log("✅ Ficheiro de teste criado: public/sample-dgeg-data.xlsx");
console.log(
  `📊 ${data.length} registos gerados (${companies.length} empresas × ${years.length} anos)`
);
