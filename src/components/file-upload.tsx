"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  error?: string;
}

export function FileUpload({ onUpload, isLoading, error }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const { t } = useI18n();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    disabled: isLoading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          isDragActive || dragActive
            ? "border-primary bg-primary/5"
            : "border-slate-300 hover:border-primary/50 hover:bg-slate-50",
          isLoading && "pointer-events-none opacity-60",
          error && "border-red-300 bg-red-50"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div>
                <p className="text-lg font-medium">{t("uploadProcessing")}</p>
              </div>
            </>
          ) : error ? (
            <>
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <p className="text-lg font-medium text-red-700">
                  {t("uploadError")}
                </p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-primary/10">
                {isDragActive ? (
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                ) : (
                  <Upload className="h-10 w-10 text-primary" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive
                    ? t("uploadDragActive")
                    : t("uploadDescription")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("uploadAcceptedFormats")}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-center text-muted-foreground">
        {t("uploadAcceptedFormats")}
      </p>
    </div>
  );
}
