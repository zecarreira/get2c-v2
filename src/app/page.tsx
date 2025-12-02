"use client";

import { useState, useRef } from "react";
import { FileUpload } from "@/components/file-upload";
import { IndicatorCards } from "@/components/indicator-cards";
import { Charts } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DGEGIndicators } from "@/lib/validations/upload";
import {
  Leaf,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  Trophy,
  Sparkles,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { ExportPDFButton } from "@/components/export-pdf";
import { DashboardSkeleton } from "@/components/skeletons";
import { Filters } from "@/components/filters";
import { TrendAnalysis } from "@/components/trend-analysis";
import { EmptyState } from "@/components/empty-state";
import { UploadHistory } from "@/components/upload-history";
import { Rankings } from "@/components/rankings";
import { ForecastChart } from "@/components/forecast-chart";
import { CarbonIntensity } from "@/components/carbon-intensity";
import {
  useUploadHistory,
  type UploadHistoryItem,
} from "@/hooks/use-local-storage";
import { useI18n } from "@/lib/i18n/context";
import { toast } from "sonner";

export default function Home() {
  const [data, setData] = useState<DGEGIndicators | null>(null);
  const [filteredData, setFilteredData] = useState<DGEGIndicators | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const [rowsProcessed, setRowsProcessed] = useState<number | undefined>();
  const [fileSize, setFileSize] = useState<number | undefined>();
  const fileUploadRef = useRef<HTMLDivElement>(null);

  const { addToHistory } = useUploadHistory();
  const { t } = useI18n();

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error);
        setData(null);
        toast.error("Erro ao processar ficheiro", {
          description: result.error,
        });
      } else {
        setData(result.data);
        setFilteredData(result.data);
        setFileName(result.fileName);
        setRowsProcessed(result.rowsProcessed);
        setFileSize(result.fileSize);
        setError(undefined);

        // Adicionar ao histórico com dados completos
        addToHistory({
          fileName: result.fileName,
          fileSize: result.fileSize,
          rowsProcessed: result.rowsProcessed,
          totalEmissions: result.data.totalEmissions,
          totalCompanies: result.data.totalCompanies,
          data: result.data,
        });

        toast.success("Ficheiro processado com sucesso!", {
          description: `${result.rowsProcessed} registos analisados`,
        });
      }
    } catch {
      setError("Erro de conexão. Por favor tente novamente.");
      setData(null);
      toast.error("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setFilteredData(null);
    setFileName(undefined);
    setRowsProcessed(undefined);
    setFileSize(undefined);
    setError(undefined);
  };

  const handleFilterChange = (filtered: DGEGIndicators) => {
    setFilteredData(filtered);
  };

  const handleSelectHistory = (item: UploadHistoryItem) => {
    if (item.data) {
      setData(item.data);
      setFilteredData(item.data);
      setFileName(item.fileName);
      setRowsProcessed(item.rowsProcessed);
      setFileSize(item.fileSize);
      setError(undefined);
      toast.success(t("uploadSuccess"), {
        description: `${item.rowsProcessed} ${t("records")}`,
      });
    } else {
      toast.error(t("uploadError"), {
        description: "Dados não disponíveis para este histórico",
      });
    }
  };

  const displayData = filteredData || data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur dark:bg-slate-950/95 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">{t("title")}</h1>
                <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data && (
                <>
                  <ExportPDFButton indicators={data} fileName={fileName} />
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t("uploadButton")}
                  </Button>
                </>
              )}
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!data ? (
          /* Upload Section */
          <div className="max-w-4xl mx-auto space-y-8">
            <EmptyState
              dropzone={
                <div ref={fileUploadRef}>
                  <FileUpload
                    onUpload={handleUpload}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              }
            />

            {/* Upload History */}
            <UploadHistory onSelectHistory={handleSelectHistory} />
          </div>
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {rowsProcessed} registos processados •{" "}
                    {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <Filters indicators={data} onFilterChange={handleFilterChange} />

            {/* Tabs for different views */}
            <Tabs defaultValue="indicators" className="w-full">
              <TabsList className="grid w-full max-w-3xl grid-cols-6">
                <TabsTrigger value="indicators">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t("dashboard")}</span>
                </TabsTrigger>
                <TabsTrigger value="charts">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {t("emissionsByYear").split(" ")[0]}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="trends">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t("trends")}</span>
                </TabsTrigger>
                <TabsTrigger value="intensity">
                  <Zap className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t("intensity")}</span>
                </TabsTrigger>
                <TabsTrigger value="rankings">
                  <Trophy className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t("rankings")}</span>
                </TabsTrigger>
                <TabsTrigger value="forecast">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t("forecast")}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="indicators" className="mt-6">
                {displayData && <IndicatorCards data={displayData} />}
              </TabsContent>

              <TabsContent value="charts" className="mt-6">
                {displayData && <Charts data={displayData} />}
              </TabsContent>

              <TabsContent value="trends" className="mt-6">
                {displayData && <TrendAnalysis indicators={displayData} />}
              </TabsContent>

              <TabsContent value="intensity" className="mt-6">
                {displayData && <CarbonIntensity indicators={displayData} />}
              </TabsContent>

              <TabsContent value="rankings" className="mt-6">
                {displayData && <Rankings indicators={displayData} />}
              </TabsContent>

              <TabsContent value="forecast" className="mt-6">
                {displayData && <ForecastChart indicators={displayData} />}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto dark:border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Carbon Footprint Tracker</p>
            <p>José Carreira</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
