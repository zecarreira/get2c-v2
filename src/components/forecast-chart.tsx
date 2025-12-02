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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, AlertTriangle, Target } from "lucide-react";
import type { DGEGIndicators } from "@/lib/validations/upload";
import { useI18n } from "@/lib/i18n/context";

interface ForecastChartProps {
  indicators: DGEGIndicators;
}

export function ForecastChart({ indicators }: ForecastChartProps) {
  const { language } = useI18n();
  const forecast = indicators.forecast;
  const emissionsByYear = indicators.emissionsByYear;

  if (!forecast || forecast.length === 0 || emissionsByYear.length < 2) {
    return null;
  }

  // Combine historical data with forecast
  // Adicionar o último ponto histórico ao início da previsão para conectar as linhas
  const lastHistorical = emissionsByYear[emissionsByYear.length - 1];

  // Dados completos com ambos os valores para o gráfico
  const fullChartData: Array<{
    year: number;
    historical: number | null;
    forecast: number | null;
  }> = [
    ...emissionsByYear.map((e) => ({
      year: e.year,
      historical: e.totalEmissions,
      forecast: e.year === lastHistorical.year ? e.totalEmissions : null,
    })),
    ...forecast.map((f) => ({
      year: f.year,
      historical: null,
      forecast: f.predictedEmissions,
    })),
  ];

  const lastHistoricalYear =
    emissionsByYear[emissionsByYear.length - 1]?.year || 0;
  const lastHistoricalEmissions =
    emissionsByYear[emissionsByYear.length - 1]?.totalEmissions || 0;
  const lastForecastEmissions =
    forecast[forecast.length - 1]?.predictedEmissions || 0;

  const trend = lastForecastEmissions < lastHistoricalEmissions ? "down" : "up";
  const trendPercent =
    lastHistoricalEmissions > 0
      ? Math.abs(
          Math.round(
            ((lastForecastEmissions - lastHistoricalEmissions) /
              lastHistoricalEmissions) *
              100
          )
        )
      : 0;

  const avgConfidence = Math.round(
    forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length
  );

  const formatNumber = (num: number) => {
    return num.toLocaleString(language === "pt" ? "pt-PT" : "en-US", {
      maximumFractionDigits: 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              {language === "pt"
                ? "Previsão de Emissões"
                : "Emissions Forecast"}
            </CardTitle>
            <CardDescription>
              {language === "pt"
                ? "Projeção para os próximos 3 anos baseada na tendência histórica"
                : "3-year projection based on historical trend"}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              avgConfidence >= 70
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : avgConfidence >= 40
                ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
            }
          >
            {language === "pt" ? "Confiança" : "Confidence"}: {avgConfidence}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              {language === "pt" ? "Último Ano Real" : "Last Actual Year"}
            </div>
            <p className="text-lg font-semibold">
              {formatNumber(lastHistoricalEmissions)} t
            </p>
            <p className="text-xs text-muted-foreground">
              {lastHistoricalYear}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              {language === "pt" ? "Previsão Final" : "Final Forecast"}
            </div>
            <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              {formatNumber(lastForecastEmissions)} t
            </p>
            <p className="text-xs text-muted-foreground">
              {forecast[forecast.length - 1]?.year}
            </p>
          </div>

          <div
            className={`p-3 rounded-lg ${
              trend === "down"
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-orange-50 dark:bg-orange-900/20"
            }`}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" />
              {language === "pt" ? "Tendência" : "Trend"}
            </div>
            <p
              className={`text-lg font-semibold ${
                trend === "down"
                  ? "text-green-700 dark:text-green-300"
                  : "text-orange-700 dark:text-orange-300"
              }`}
            >
              {trend === "down" ? "↓" : "↑"} {trendPercent}%
            </p>
            <p className="text-xs text-muted-foreground">
              {trend === "down"
                ? language === "pt"
                  ? "Redução prevista"
                  : "Expected reduction"
                : language === "pt"
                ? "Aumento previsto"
                : "Expected increase"}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fullChartData}>
              <defs>
                <linearGradient
                  id="historicalGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="forecastGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value, name: string) => {
                  if (value === null || value === undefined)
                    return [null, null];
                  const numValue = typeof value === "number" ? value : 0;
                  return [
                    `${formatNumber(numValue)} t CO₂`,
                    name === "historical"
                      ? language === "pt"
                        ? "Histórico"
                        : "Historical"
                      : language === "pt"
                      ? "Previsão"
                      : "Forecast",
                  ];
                }}
                labelFormatter={(label) =>
                  `${language === "pt" ? "Ano" : "Year"}: ${label}`
                }
              />
              <ReferenceLine
                x={lastHistoricalYear}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{
                  value: language === "pt" ? "Hoje" : "Today",
                  position: "top",
                  fontSize: 10,
                }}
              />
              {/* Área histórica (verde) */}
              <Area
                type="monotone"
                dataKey="historical"
                stroke="#10b981"
                fill="url(#historicalGradient)"
                strokeWidth={2}
                dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                connectNulls={false}
                animationDuration={1000}
              />
              {/* Área de previsão (azul) */}
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#3b82f6"
                fill="url(#forecastGradient)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                connectNulls={false}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">
              {language === "pt" ? "Dados históricos" : "Historical data"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">
              {language === "pt" ? "Previsão" : "Forecast"}
            </span>
          </div>
        </div>

        {/* Confidence Warning */}
        {avgConfidence < 50 && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>
                {language === "pt"
                  ? "Confiança baixa: os dados históricos apresentam alta variabilidade"
                  : "Low confidence: historical data shows high variability"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
