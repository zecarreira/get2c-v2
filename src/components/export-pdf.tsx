"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import type { DGEGIndicators } from "@/lib/validations/upload";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportPDFButtonProps {
  indicators: DGEGIndicators;
  fileName?: string;
}

export function ExportPDFButton({
  indicators,
  fileName,
}: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título
      doc.setFontSize(20);
      doc.setTextColor(34, 139, 34); // Verde
      doc.text("Tech2C - Relatório de Emissões", pageWidth / 2, 20, {
        align: "center",
      });

      // Subtítulo
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-PT")}`,
        pageWidth / 2,
        28,
        { align: "center" }
      );
      if (fileName) {
        doc.text(`Ficheiro: ${fileName}`, pageWidth / 2, 34, {
          align: "center",
        });
      }

      // Resumo
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Resumo dos Indicadores", 14, 48);

      // Tabela de resumo
      autoTable(doc, {
        startY: 52,
        head: [["Indicador", "Valor"]],
        body: [
          [
            "Total de Emissões CO₂",
            `${indicators.totalEmissions.toLocaleString("pt-PT")} t`,
          ],
          [
            "Consumo Total de Energia",
            `${indicators.totalEnergyConsumption.toLocaleString("pt-PT")} MWh`,
          ],
          [
            "Média de Energia por Empresa",
            `${indicators.averageEnergyPerCompany.toLocaleString("pt-PT")} MWh`,
          ],
          ["Número de Empresas", indicators.totalCompanies.toString()],
        ],
        theme: "striped",
        headStyles: { fillColor: [34, 139, 34] },
      });

      // Emissões por Ano
      const afterSummary =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 15;
      doc.setFontSize(14);
      doc.text("Emissões por Ano", 14, afterSummary);

      autoTable(doc, {
        startY: afterSummary + 4,
        head: [["Ano", "Emissões (t CO₂)", "Nº Empresas"]],
        body: indicators.emissionsByYear.map((item) => [
          item.year.toString(),
          item.totalEmissions.toLocaleString("pt-PT"),
          item.companyCount.toString(),
        ]),
        theme: "striped",
        headStyles: { fillColor: [34, 139, 34] },
      });

      // Top 5 Emissores
      const afterYears =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 15;
      doc.setFontSize(14);
      doc.text("Top 5 Empresas com Maiores Emissões", 14, afterYears);

      autoTable(doc, {
        startY: afterYears + 4,
        head: [["Posição", "Empresa", "Setor", "Emissões (t CO₂)"]],
        body: indicators.topEmitters.map((item, index) => [
          `${index + 1}º`,
          item.company,
          item.sector,
          item.totalEmissions.toLocaleString("pt-PT"),
        ]),
        theme: "striped",
        headStyles: { fillColor: [34, 139, 34] },
      });

      // Emissões por Setor (nova página se necessário)
      const afterTop =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 15;

      if (afterTop > 250) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Emissões por Setor", 14, 20);
        autoTable(doc, {
          startY: 24,
          head: [["Setor", "Emissões (t CO₂)", "Energia (MWh)", "Nº Empresas"]],
          body: indicators.emissionsBySector.map((item) => [
            item.sector,
            item.totalEmissions.toLocaleString("pt-PT"),
            item.totalEnergy.toLocaleString("pt-PT"),
            item.companyCount.toString(),
          ]),
          theme: "striped",
          headStyles: { fillColor: [34, 139, 34] },
        });
      } else {
        doc.setFontSize(14);
        doc.text("Emissões por Setor", 14, afterTop);
        autoTable(doc, {
          startY: afterTop + 4,
          head: [["Setor", "Emissões (t CO₂)", "Energia (MWh)", "Nº Empresas"]],
          body: indicators.emissionsBySector.map((item) => [
            item.sector,
            item.totalEmissions.toLocaleString("pt-PT"),
            item.totalEnergy.toLocaleString("pt-PT"),
            item.companyCount.toString(),
          ]),
          theme: "striped",
          headStyles: { fillColor: [34, 139, 34] },
        });
      }

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Carbon Tracker - Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Download
      doc.save(
        `relatorio-emissoes-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline">
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />A exportar...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar PDF
        </>
      )}
    </Button>
  );
}
