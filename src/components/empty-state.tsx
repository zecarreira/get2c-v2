"use client";

import { useState, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Upload,
  BarChart3,
  Download,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface EmptyStateProps {
  dropzone?: ReactNode;
}

export function EmptyState({ dropzone }: EmptyStateProps) {
  const [showTips, setShowTips] = useState(false);
  const [showStructure, setShowStructure] = useState(false);
  const { t } = useI18n();

  const steps = [
    {
      icon: FileSpreadsheet,
      title: `1. ${t("prepareFile")}`,
      description: t("prepareFileDesc"),
    },
    {
      icon: Upload,
      title: `2. ${t("uploadFile")}`,
      description: t("uploadFileDesc"),
    },
    {
      icon: BarChart3,
      title: `3. ${t("visualize")}`,
      description: t("visualizeDesc"),
    },
  ];

  const expectedColumns = [
    {
      name: "Empresa",
      required: true,
      description: "Nome da empresa ou entidade",
    },
    {
      name: "Setor",
      required: false,
      description: "Setor de atividade (opcional)",
    },
    {
      name: "Ano",
      required: false,
      description: "Ano de referência dos dados",
    },
    {
      name: "Emissões CO2 (t)",
      required: true,
      description: "Emissões em toneladas de CO₂",
    },
    {
      name: "Consumo Energia (MWh)",
      required: false,
      description: "Consumo energético em MWh",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30">
          <BarChart3 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">{t("welcome")}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("welcomeDesc")}
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-full" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <step.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-base">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dropzone */}
      {dropzone && <div>{dropzone}</div>}

      {/* Download Sample Button */}
      <div className="flex items-center justify-center">
        <Button variant="outline" size="lg" asChild>
          <a href="/sample-dgeg-data.xlsx" download>
            <Download className="mr-2 h-5 w-5" />
            {t("downloadSample")}
          </a>
        </Button>
      </div>

      {/* Expected Columns Info - Collapsible */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowStructure(!showStructure)}
        >
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t("expectedStructure")}
            <ArrowRight
              className={`h-4 w-4 ml-auto transition-transform ${
                showStructure ? "rotate-90" : ""
              }`}
            />
          </CardTitle>
          <CardDescription>{t("expectedStructureDesc")}</CardDescription>
        </CardHeader>
        {showStructure && (
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">
                      {t("column")}
                    </th>
                    <th className="text-center py-2 font-medium">
                      {t("required")}
                    </th>
                    <th className="text-left py-2 font-medium">
                      {t("description")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expectedColumns.map((col) => (
                    <tr key={col.name} className="border-b last:border-0">
                      <td className="py-2">
                        <code className="px-2 py-1 bg-muted rounded text-xs">
                          {col.name}
                        </code>
                      </td>
                      <td className="py-2 text-center">
                        {col.required ? (
                          <Badge variant="destructive" className="text-xs">
                            {t("yes")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {t("no")}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {col.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tips Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowTips(!showTips)}
        >
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            {t("tips")}
            <ArrowRight
              className={`h-4 w-4 ml-auto transition-transform ${
                showTips ? "rotate-90" : ""
              }`}
            />
          </CardTitle>
        </CardHeader>
        {showTips && (
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {[
                "O sistema reconhece automaticamente colunas em português e inglês",
                "Ficheiros até 10MB são suportados",
                "Linhas sem dados de emissões ou consumo são ignoradas automaticamente",
                "Pode usar o ficheiro de exemplo como template",
                "Os dados não são guardados no servidor - tudo é processado localmente",
              ].map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
