"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, FileSpreadsheet, Clock } from "lucide-react";
import {
  useUploadHistory,
  type UploadHistoryItem,
} from "@/hooks/use-local-storage";
import { useI18n } from "@/lib/i18n/context";

interface UploadHistoryProps {
  onSelectHistory?: (item: UploadHistoryItem) => void;
}

export function UploadHistory({ onSelectHistory }: UploadHistoryProps) {
  const { history, clearHistory, isLoaded } = useUploadHistory();
  const { t, language } = useI18n();

  if (!isLoaded) {
    return null;
  }

  if (history.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "pt" ? "pt-PT" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              {t("uploadHistory")}
            </CardTitle>
            <CardDescription>{t("lastProcessedFiles")}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {t("clear")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onSelectHistory?.(item)}
              >
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.uploadDate)}
                    <span>•</span>
                    {formatFileSize(item.fileSize)}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs">
                    {item.rowsProcessed} {t("records")}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.totalEmissions.toLocaleString(
                      language === "pt" ? "pt-PT" : "en-US"
                    )}{" "}
                    t CO₂
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
