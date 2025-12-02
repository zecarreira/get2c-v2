"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Gauge, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { DGEGIndicators } from "@/lib/validations/upload";
import { useI18n } from "@/lib/i18n/context";

interface CarbonIntensityProps {
  indicators: DGEGIndicators;
}

export function CarbonIntensity({ indicators }: CarbonIntensityProps) {
  const { language } = useI18n();

  const formatNumber = (num: number) => {
    return num.toLocaleString(language === "pt" ? "pt-PT" : "en-US", {
      maximumFractionDigits: 3,
    });
  };

  // Get sector data sorted by carbon intensity
  const sectorData = [...indicators.emissionsBySector]
    .filter((s) => s.totalEnergy > 0)
    .sort((a, b) => b.carbonIntensity - a.carbonIntensity);

  // Calculate trend
  const yearlyIntensity = indicators.emissionsByYear
    .filter((y) => y.totalEnergy > 0)
    .map((y) => ({
      year: y.year,
      intensity: y.carbonIntensity,
    }));

  let trend: "up" | "down" | "stable" = "stable";
  let trendPercent = 0;

  if (yearlyIntensity.length >= 2) {
    const first = yearlyIntensity[0].intensity;
    const last = yearlyIntensity[yearlyIntensity.length - 1].intensity;
    trendPercent = Math.abs(Math.round(((last - first) / first) * 100));
    if (last < first * 0.95) trend = "down";
    else if (last > first * 1.05) trend = "up";
  }

  // Color scale for bars
  const getBarColor = (intensity: number) => {
    const avg = indicators.averageCarbonIntensity;
    if (intensity <= avg * 0.7) return "#10b981"; // Green - efficient
    if (intensity <= avg * 1.3) return "#f59e0b"; // Yellow - average
    return "#ef4444"; // Red - inefficient
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-purple-500" />
            {language === "pt" ? "Intensidade Carbónica" : "Carbon Intensity"}
          </CardTitle>
          <CardDescription>
            {language === "pt"
              ? "Emissões de CO₂ por unidade de energia consumida (t CO₂/MWh)"
              : "CO₂ emissions per unit of energy consumed (t CO₂/MWh)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Intensity */}
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {language === "pt" ? "Média Geral" : "Overall Average"}
                </span>
                <Gauge className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {formatNumber(indicators.averageCarbonIntensity)}
              </p>
              <p className="text-xs text-muted-foreground">t CO₂ / MWh</p>
            </div>

            {/* Trend */}
            <div
              className={`p-4 rounded-lg border ${
                trend === "down"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : trend === "up"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {language === "pt" ? "Tendência" : "Trend"}
                </span>
                {trend === "down" && (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                {trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
                {trend === "stable" && (
                  <Minus className="h-4 w-4 text-slate-500" />
                )}
              </div>
              <p
                className={`text-2xl font-bold ${
                  trend === "down"
                    ? "text-green-700 dark:text-green-300"
                    : trend === "up"
                    ? "text-red-700 dark:text-red-300"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {trend === "down" ? "↓" : trend === "up" ? "↑" : "—"}{" "}
                {trendPercent}%
              </p>
              <p className="text-xs text-muted-foreground">
                {trend === "down"
                  ? language === "pt"
                    ? "Melhoria na eficiência"
                    : "Efficiency improvement"
                  : trend === "up"
                  ? language === "pt"
                    ? "Pioria na eficiência"
                    : "Efficiency decline"
                  : language === "pt"
                  ? "Sem alteração significativa"
                  : "No significant change"}
              </p>
            </div>

            {/* Best Sector */}
            {sectorData.length > 0 && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {language === "pt"
                      ? "Setor Mais Eficiente"
                      : "Most Efficient Sector"}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    #1
                  </Badge>
                </div>
                <p className="text-lg font-semibold text-green-700 dark:text-green-300 truncate">
                  {sectorData[sectorData.length - 1]?.sector}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(
                    sectorData[sectorData.length - 1]?.carbonIntensity || 0
                  )}{" "}
                  t CO₂/MWh
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sector Comparison Chart */}
      {sectorData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === "pt"
                ? "Intensidade Carbónica por Setor"
                : "Carbon Intensity by Sector"}
            </CardTitle>
            <CardDescription>
              {language === "pt"
                ? "Comparação da eficiência energética entre setores"
                : "Energy efficiency comparison between sectors"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorData}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(value) => `${value}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="sector"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      `${formatNumber(value)} t CO₂/MWh`,
                      language === "pt" ? "Intensidade" : "Intensity",
                    ]}
                  />
                  <Bar
                    dataKey="carbonIntensity"
                    radius={[0, 4, 4, 0]}
                    animationDuration={1000}
                  >
                    {sectorData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.carbonIntensity)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-muted-foreground">
                  {language === "pt" ? "Eficiente" : "Efficient"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-muted-foreground">
                  {language === "pt" ? "Médio" : "Average"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-muted-foreground">
                  {language === "pt" ? "Ineficiente" : "Inefficient"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
