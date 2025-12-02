"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trophy,
  TrendingDown,
  Leaf,
  Factory,
  Medal,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import type { DGEGIndicators } from "@/lib/validations/upload";
import { useI18n } from "@/lib/i18n/context";

interface RankingsProps {
  indicators: DGEGIndicators;
}

export function Rankings({ indicators }: RankingsProps) {
  const { language } = useI18n();
  const rankings = indicators.rankings;

  if (!rankings) {
    return null;
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString(language === "pt" ? "pt-PT" : "en-US", {
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Rankings
        </CardTitle>
        <CardDescription>
          {language === "pt"
            ? "Classificações dinâmicas de empresas"
            : "Dynamic company rankings"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="emitters" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="emitters" className="text-xs">
              <Factory className="h-3 w-3 mr-1" />
              {language === "pt" ? "Emissores" : "Emitters"}
            </TabsTrigger>
            <TabsTrigger value="reducers" className="text-xs">
              <TrendingDown className="h-3 w-3 mr-1" />
              {language === "pt" ? "Redutores" : "Reducers"}
            </TabsTrigger>
            <TabsTrigger value="efficient" className="text-xs">
              <Leaf className="h-3 w-3 mr-1" />
              {language === "pt" ? "Eficientes" : "Efficient"}
            </TabsTrigger>
            <TabsTrigger value="inefficient" className="text-xs">
              <Factory className="h-3 w-3 mr-1" />
              {language === "pt" ? "Ineficientes" : "Inefficient"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emitters" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {rankings.topEmitters.map((company, index) => (
                  <div
                    key={company.company}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{company.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {company.sector}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {formatNumber(company.totalEmissions)} t
                      </p>
                      <p className="text-xs text-muted-foreground">CO₂</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reducers" className="mt-4">
            <ScrollArea className="h-[300px]">
              {rankings.topReducers.length > 0 ? (
                <div className="space-y-2">
                  {rankings.topReducers.map((company) => (
                    <div
                      key={company.company}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-sm">
                        <Medal className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {company.company}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {company.sector}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <ArrowDownRight className="h-4 w-4" />
                          <span className="font-semibold">
                            -{company.reductionPercent}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(company.previousEmissions)} →{" "}
                          {formatNumber(company.currentEmissions)} t
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <TrendingDown className="h-10 w-10 mb-2 opacity-50" />
                  <p>
                    {language === "pt"
                      ? "Sem dados de redução disponíveis"
                      : "No reduction data available"}
                  </p>
                  <p className="text-xs mt-1">
                    {language === "pt"
                      ? "Necessário dados de múltiplos anos"
                      : "Multiple years data required"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="efficient" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {rankings.mostEfficient.map((company, index) => (
                  <div
                    key={company.company}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{company.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {company.sector}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      >
                        {formatNumber(company.carbonIntensity)} t/MWh
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === "pt" ? "Intensidade" : "Intensity"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="inefficient" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {rankings.leastEfficient.map((company, index) => (
                  <div
                    key={company.company}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{company.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {company.sector}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {formatNumber(company.carbonIntensity)} t/MWh
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === "pt" ? "Intensidade" : "Intensity"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
