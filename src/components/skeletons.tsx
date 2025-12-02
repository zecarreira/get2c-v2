"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function IndicatorCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const CHART_HEIGHTS = [
  "h-[60%]",
  "h-[75%]",
  "h-[50%]",
  "h-[85%]",
  "h-[65%]",
  "h-[70%]",
];

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-around gap-2 pt-4">
          {CHART_HEIGHTS.map((height, i) => (
            <Skeleton key={i} className={`w-12 ${height}`} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Indicator Cards */}
      <IndicatorCardsSkeleton />

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Full Width Chart */}
      <ChartSkeleton />
    </div>
  );
}

export function UploadProgressSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-2 w-full" />
        </div>
      </div>
      <div className="text-center">
        <Skeleton className="h-4 w-[150px] mx-auto" />
      </div>
    </div>
  );
}
