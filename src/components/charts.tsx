"use client";

import type { DGEGIndicators } from "@/lib/validations/upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface ChartsProps {
  data: DGEGIndicators;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
];

// Animation configuration
const ANIMATION_DURATION = 800;
const ANIMATION_EASING = "ease-out" as const;

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function Charts({ data }: ChartsProps) {
  // Prepare data for charts
  const topEmittersData = data.topEmitters.map((item) => ({
    name:
      item.company.length > 20
        ? item.company.substring(0, 20) + "..."
        : item.company,
    emissões: item.totalEmissions,
  }));

  const sectorData = data.emissionsBySector.slice(0, 6).map((item) => ({
    name:
      item.sector.length > 15
        ? item.sector.substring(0, 15) + "..."
        : item.sector,
    value: item.totalEmissions,
  }));

  const yearlyData = data.emissionsByYear.map((item) => ({
    ano: item.year,
    emissões: item.totalEmissions,
    empresas: item.companyCount,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top Emitters Bar Chart */}
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Top 5 Maiores Emissores</CardTitle>
          <CardDescription>Emissões CO₂ em toneladas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topEmittersData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatNumber} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toLocaleString("pt-PT")} t CO₂`,
                    "Emissões",
                  ]}
                />
                <Bar
                  dataKey="emissões"
                  fill="#0088FE"
                  radius={[0, 4, 4, 0]}
                  animationDuration={ANIMATION_DURATION}
                  animationEasing={ANIMATION_EASING}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sector Pie Chart */}
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Distribuição por Setor</CardTitle>
          <CardDescription>Emissões CO₂ por setor de atividade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={ANIMATION_DURATION}
                  animationEasing={ANIMATION_EASING}
                  label={({ name, percent }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {sectorData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toLocaleString("pt-PT")} t CO₂`,
                    "Emissões",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Emissions Line Chart */}
      {yearlyData.length > 1 && (
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Evolução Anual das Emissões</CardTitle>
            <CardDescription>
              Tendência das emissões CO₂ ao longo dos anos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={yearlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ano" />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={formatNumber}
                    label={{
                      value: "Emissões (t CO₂)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: "Empresas",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "emissões"
                        ? `${value.toLocaleString("pt-PT")} t CO₂`
                        : value,
                      name === "emissões" ? "Emissões" : "Empresas",
                    ]}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="emissões"
                    stroke="#0088FE"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={ANIMATION_DURATION}
                    animationEasing={ANIMATION_EASING}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="empresas"
                    stroke="#00C49F"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    animationDuration={ANIMATION_DURATION}
                    animationEasing={ANIMATION_EASING}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
