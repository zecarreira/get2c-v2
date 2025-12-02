"use client";

import { useState, useCallback, useEffect } from "react";

function getStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Inicializar com valor inicial para evitar hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar do localStorage apenas no cliente após a montagem
  useEffect(() => {
    const value = getStoredValue(key, initialValue);
    setStoredValue(value);
    setIsLoaded(true);
  }, [key, initialValue]);

  // Função para atualizar o valor
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Erro ao guardar localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Função para limpar o valor
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Erro ao remover localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return { value: storedValue, setValue, removeValue, isLoaded };
}

// Hook específico para o histórico de uploads
import type { DGEGIndicators } from "@/lib/validations/upload";

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  rowsProcessed: number;
  totalEmissions: number;
  totalCompanies: number;
  // Dados completos para recarregar
  data?: DGEGIndicators;
}

export function useUploadHistory() {
  const { value, setValue, removeValue, isLoaded } = useLocalStorage<
    UploadHistoryItem[]
  >("tech2c-upload-history", []);

  const addToHistory = useCallback(
    (item: Omit<UploadHistoryItem, "id" | "uploadDate">) => {
      const newItem: UploadHistoryItem = {
        ...item,
        id: crypto.randomUUID(),
        uploadDate: new Date().toISOString(),
      };
      setValue((prev) => [newItem, ...prev.slice(0, 9)]); // Manter apenas os últimos 10
      return newItem;
    },
    [setValue]
  );

  const clearHistory = useCallback(() => {
    removeValue();
  }, [removeValue]);

  return { history: value, addToHistory, clearHistory, isLoaded };
}
