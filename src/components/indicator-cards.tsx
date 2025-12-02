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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Factory, Zap, Building2, TrendingUp } from "lucide-react";

interface IndicatorCardsProps {
  data: DGEGIndicators;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function IndicatorCards({ data }: IndicatorCardsProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Emissões CO₂
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalEmissions)}
            </div>
            <p className="text-xs text-muted-foreground">toneladas CO₂</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consumo Total Energia
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalEnergyConsumption)}
            </div>
            <p className="text-xs text-muted-foreground">MWh</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Média Energia/Empresa
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.averageEnergyPerCompany)}
            </div>
            <p className="text-xs text-muted-foreground">MWh por empresa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empresas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">empresas analisadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Emitters */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Maiores Emissores</CardTitle>
          <CardDescription>
            Empresas com maior volume de emissões CO₂
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead className="text-right">Emissões (t CO₂)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topEmitters.map((company, index) => (
                <TableRow key={company.company}>
                  <TableCell>
                    <Badge
                      variant={index === 0 ? "default" : "secondary"}
                      className="w-8 justify-center"
                    >
                      {index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {company.company}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {company.sector}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(company.totalEmissions)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Emissions by Year */}
      {data.emissionsByYear.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Emissões por Ano</CardTitle>
            <CardDescription>
              Evolução das emissões CO₂ ao longo dos anos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead className="text-right">Emissões (t CO₂)</TableHead>
                  <TableHead className="text-right">Nº Empresas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.emissionsByYear.map((year) => (
                  <TableRow key={year.year}>
                    <TableCell className="font-medium">{year.year}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(year.totalEmissions)}
                    </TableCell>
                    <TableCell className="text-right">
                      {year.companyCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Emissions by Sector */}
      {data.emissionsBySector.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Emissões por Setor</CardTitle>
            <CardDescription>
              Distribuição das emissões por setor de atividade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setor</TableHead>
                  <TableHead className="text-right">Emissões (t CO₂)</TableHead>
                  <TableHead className="text-right">Energia (MWh)</TableHead>
                  <TableHead className="text-right">Empresas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.emissionsBySector.slice(0, 10).map((sector) => (
                  <TableRow key={sector.sector}>
                    <TableCell className="font-medium">
                      {sector.sector}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(sector.totalEmissions)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(sector.totalEnergy)}
                    </TableCell>
                    <TableCell className="text-right">
                      {sector.companyCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
