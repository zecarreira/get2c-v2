"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import type { DGEGIndicators } from "@/lib/validations/upload";

interface FiltersProps {
  indicators: DGEGIndicators;
  onFilterChange: (filtered: DGEGIndicators) => void;
}

export function Filters({ indicators, onFilterChange }: FiltersProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");

  // Extrair anos e setores únicos
  const years = useMemo(
    () => indicators.emissionsByYear.map((e) => e.year).sort((a, b) => b - a),
    [indicators.emissionsByYear]
  );

  const sectors = useMemo(
    () => indicators.emissionsBySector.map((s) => s.sector).sort(),
    [indicators.emissionsBySector]
  );

  // Aplicar filtros
  const applyFilters = (year: string, sector: string) => {
    // Começar sempre com os dados originais
    let filteredEmissionsByYear = [...indicators.emissionsByYear];
    let filteredEmissionsBySector = [...indicators.emissionsBySector];
    let filteredTopEmitters = [...indicators.topEmitters];

    // Filtrar por ano
    if (year !== "all") {
      const yearNum = parseInt(year);
      filteredEmissionsByYear = filteredEmissionsByYear.filter(
        (e) => e.year === yearNum
      );
    }

    // Filtrar por setor
    if (sector !== "all") {
      filteredEmissionsBySector = filteredEmissionsBySector.filter(
        (s) => s.sector === sector
      );
      filteredTopEmitters = filteredTopEmitters.filter(
        (e) => e.sector === sector
      );
    }

    // Recalcular totais baseado nos dados filtrados
    const totalEmissions = filteredEmissionsByYear.reduce(
      (sum, e) => sum + e.totalEmissions,
      0
    );
    const totalEnergyConsumption = filteredEmissionsByYear.reduce(
      (sum, e) => sum + e.totalEnergy,
      0
    );
    const totalCompanies = filteredEmissionsByYear.reduce(
      (sum, e) => sum + e.companyCount,
      0
    );

    // Se filtrado por setor, usar os totais do setor
    let sectorTotalEmissions = totalEmissions;
    let sectorTotalEnergy = totalEnergyConsumption;
    let sectorCompanyCount = totalCompanies;

    if (sector !== "all") {
      const sectorData = filteredEmissionsBySector[0];
      if (sectorData) {
        sectorTotalEmissions = sectorData.totalEmissions;
        sectorTotalEnergy = sectorData.totalEnergy;
        sectorCompanyCount = sectorData.companyCount;
      }
    }

    // Usar os valores do setor se filtrado, senão usar os do ano
    const finalTotalEmissions =
      sector !== "all" ? sectorTotalEmissions : totalEmissions;
    const finalTotalEnergy =
      sector !== "all" ? sectorTotalEnergy : totalEnergyConsumption;
    const finalCompanyCount =
      sector !== "all" ? sectorCompanyCount : totalCompanies;

    const averageEnergyPerCompany =
      finalCompanyCount > 0 ? finalTotalEnergy / finalCompanyCount : 0;
    const averageCarbonIntensity =
      finalTotalEnergy > 0 ? finalTotalEmissions / finalTotalEnergy : 0;

    const filtered: DGEGIndicators = {
      emissionsByYear: filteredEmissionsByYear,
      emissionsBySector: filteredEmissionsBySector,
      topEmitters: filteredTopEmitters,
      totalEmissions: finalTotalEmissions,
      totalEnergyConsumption: finalTotalEnergy,
      totalCompanies: finalCompanyCount,
      averageEnergyPerCompany,
      averageCarbonIntensity,
      // Manter forecast e rankings originais (ou filtrar se necessário)
      forecast: indicators.forecast,
      rankings: indicators.rankings,
    };

    onFilterChange(filtered);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    applyFilters(value, selectedSector);
  };

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    applyFilters(selectedYear, value);
  };

  const clearFilters = () => {
    setSelectedYear("all");
    setSelectedSector("all");
    onFilterChange(indicators);
  };

  const hasActiveFilters = selectedYear !== "all" || selectedSector !== "all";

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filtros:</span>
      </div>

      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os anos</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedSector} onValueChange={handleSectorChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {sectors.map((sector) => (
            <SelectItem key={sector} value={sector}>
              {sector}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <>
          <div className="flex gap-2">
            {selectedYear !== "all" && (
              <Badge variant="secondary">
                Ano: {selectedYear}
                <button
                  onClick={() => handleYearChange("all")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedSector !== "all" && (
              <Badge variant="secondary">
                Setor: {selectedSector}
                <button
                  onClick={() => handleSectorChange("all")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </>
      )}
    </div>
  );
}
