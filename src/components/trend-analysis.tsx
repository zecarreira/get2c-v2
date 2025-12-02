"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { DGEGIndicators } from "@/lib/validations/upload";

interface TrendAnalysisProps {
  indicators: DGEGIndicators;
}

interface TrendData {
  year: number;
  emissions: number;
  previousEmissions?: number;
  change?: number;
  changePercent?: number;
}

export function TrendAnalysis({ indicators }: TrendAnalysisProps) {
  const trendData = useMemo(() => {
    const sorted = [...indicators.emissionsByYear].sort(
      (a, b) => a.year - b.year
    );

    return sorted.map((item, index) => {
      const previousEmissions =
        index > 0 ? sorted[index - 1].totalEmissions : undefined;
      const change =
        previousEmissions !== undefined
          ? item.totalEmissions - previousEmissions
          : undefined;
      const changePercent =
        previousEmissions !== undefined && previousEmissions > 0
          ? ((item.totalEmissions - previousEmissions) / previousEmissions) *
            100
          : undefined;

      return {
        year: item.year,
        emissions: item.totalEmissions,
        previousEmissions,
        change,
        changePercent,
      };
    });
  }, [indicators.emissionsByYear]);

  // Calcular tendência geral
  const overallTrend = useMemo(() => {
    if (trendData.length < 2) return null;

    const firstYear = trendData[0];
    const lastYear = trendData[trendData.length - 1];
    const totalChange = lastYear.emissions - firstYear.emissions;
    const totalChangePercent = (totalChange / firstYear.emissions) * 100;

    return {
      change: totalChange,
      changePercent: totalChangePercent,
      direction: totalChange > 0 ? "up" : totalChange < 0 ? "down" : "stable",
      years: lastYear.year - firstYear.year,
    };
  }, [trendData]);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case "down":
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    // Para emissões, "down" é bom (verde), "up" é mau (vermelho)
    switch (direction) {
      case "up":
        return "text-red-600 dark:text-red-400";
      case "down":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-yellow-600 dark:text-yellow-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Tendência */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Tendência Geral */}
        {overallTrend && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                Tendência Geral ({overallTrend.years} anos)
              </CardDescription>
              <CardTitle className="flex items-center gap-2">
                {getTrendIcon(overallTrend.direction)}
                <span className={getTrendColor(overallTrend.direction)}>
                  {overallTrend.changePercent > 0 ? "+" : ""}
                  {overallTrend.changePercent.toFixed(1)}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {overallTrend.direction === "down"
                  ? "Redução nas emissões 🎉"
                  : overallTrend.direction === "up"
                  ? "Aumento nas emissões ⚠️"
                  : "Emissões estáveis"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Variação Ano a Ano */}
        {trendData.length >= 2 && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Último Ano vs Anterior</CardDescription>
              <CardTitle className="flex items-center gap-2">
                {trendData[trendData.length - 1].changePercent !==
                  undefined && (
                  <>
                    {trendData[trendData.length - 1].changePercent! > 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-red-500" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-green-500" />
                    )}
                    <span
                      className={
                        trendData[trendData.length - 1].changePercent! > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {trendData[trendData.length - 1].changePercent! > 0
                        ? "+"
                        : ""}
                      {trendData[trendData.length - 1].changePercent!.toFixed(
                        1
                      )}
                      %
                    </span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {trendData[trendData.length - 1].change !== undefined && (
                  <>
                    {Math.abs(
                      trendData[trendData.length - 1].change!
                    ).toLocaleString("pt-PT")}{" "}
                    t CO₂{" "}
                    {trendData[trendData.length - 1].change! > 0
                      ? "a mais"
                      : "a menos"}
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Média Anual */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Média Anual de Emissões</CardDescription>
            <CardTitle>
              {(
                indicators.totalEmissions /
                Math.max(indicators.emissionsByYear.length, 1)
              ).toLocaleString("pt-PT", { maximumFractionDigits: 0 })}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                t CO₂/ano
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Baseado em {indicators.emissionsByYear.length} ano(s) de dados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução das Emissões ao Longo do Tempo</CardTitle>
          <CardDescription>
            Análise temporal com variação percentual ano a ano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorEmissions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TrendData;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <p className="font-semibold">{data.year}</p>
                          <p className="text-sm">
                            Emissões: {data.emissions.toLocaleString("pt-PT")} t
                            CO₂
                          </p>
                          {data.changePercent !== undefined && (
                            <p
                              className={`text-sm font-medium ${
                                data.changePercent > 0
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              {data.changePercent > 0 ? "+" : ""}
                              {data.changePercent.toFixed(1)}% vs ano anterior
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="emissions"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEmissions)"
                  name="Emissões CO₂"
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Variação Ano a Ano */}
      <Card>
        <CardHeader>
          <CardTitle>Variação Ano a Ano</CardTitle>
          <CardDescription>
            Comparação detalhada entre anos consecutivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Ano</th>
                  <th className="text-right py-2 font-medium">
                    Emissões (t CO₂)
                  </th>
                  <th className="text-right py-2 font-medium">Variação</th>
                  <th className="text-right py-2 font-medium">% Variação</th>
                  <th className="text-center py-2 font-medium">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((item) => (
                  <tr key={item.year} className="border-b last:border-0">
                    <td className="py-2 font-medium">{item.year}</td>
                    <td className="text-right py-2">
                      {item.emissions.toLocaleString("pt-PT")}
                    </td>
                    <td className="text-right py-2">
                      {item.change !== undefined ? (
                        <span
                          className={
                            item.change > 0 ? "text-red-500" : "text-green-500"
                          }
                        >
                          {item.change > 0 ? "+" : ""}
                          {item.change.toLocaleString("pt-PT")}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-right py-2">
                      {item.changePercent !== undefined ? (
                        <span
                          className={
                            item.changePercent > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          {item.changePercent > 0 ? "+" : ""}
                          {item.changePercent.toFixed(1)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-center py-2">
                      {item.change !== undefined && (
                        <Badge
                          variant={item.change > 0 ? "destructive" : "default"}
                          className={item.change <= 0 ? "bg-green-500" : ""}
                        >
                          {item.change > 0
                            ? "↑ Subiu"
                            : item.change < 0
                            ? "↓ Desceu"
                            : "= Igual"}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
