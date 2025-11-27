import { useState, useCallback } from "react";
import { IpHistoryAPI } from "@/infra/ip-history/ip-history.infra";
import { IpHistory } from "@/types";
import { formatDate } from "@/lib/utils";

// Helper function to escape CSV values
const escapeCsvValue = (value: string | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Helper function to get action label in Portuguese
const getActionLabel = (action: string): string => {
  const actionMap: Record<string, string> = {
    assigned: "Atribuído",
    released: "Liberado",
    renewed: "Renovado",
    cancelled: "Cancelado",
    expired: "Expirado",
    requested: "Solicitado",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };
  return actionMap[action] || action;
};

// Convert IP History item to CSV row
const historyToCsvRow = (item: IpHistory): string => {
  const row = [
    escapeCsvValue(item.ip.address),
    escapeCsvValue(getActionLabel(item.action)),
    escapeCsvValue(formatDate(item.performedAt, true)),
    escapeCsvValue(item.company?.user?.name || "-"),
    escapeCsvValue(item.performedBy.name),
    escapeCsvValue(item.macAddress || "-"),
    escapeCsvValue(item.expirationDate ? formatDate(item.expirationDate) : "-"),
    escapeCsvValue(item.notes || "-"),
  ];
  return row.join(",");
};

export type ExportType = "all" | "ip" | "company";

export interface UseExportIpHistoryParams {
  exportType?: ExportType;
  ipId?: string;
  
  companyId?: string;
}

export const useExportIpHistory = (params?: UseExportIpHistoryParams) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

  const exportToCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      setExportProgress({ current: 0, total: 0 });

      const exportType = params?.exportType || "all";
      let allHistory: IpHistory[] = [];

      if (exportType === "ip" && params?.ipId) {
        // Fetch all history for a specific IP
        allHistory = await IpHistoryAPI.findIpHistoryByIp(params.ipId);
        setExportProgress({ current: 1, total: 1 });
      } else if (exportType === "company" && params?.companyId) {
        // Fetch all history for a specific company
        allHistory = await IpHistoryAPI.findIpHistoryByCompany(params.companyId);
        setExportProgress({ current: 1, total: 1 });
      } else {
        // Fetch all history with pagination
        const firstPageResponse = await IpHistoryAPI.findAllIpHistory({
          page: 1,
          limit: 100,
        });

        const totalPages = firstPageResponse.meta.totalPages;
        allHistory = [...firstPageResponse.data];

        setExportProgress({ current: 1, total: totalPages });

        // Fetch remaining pages
        for (let page = 2; page <= totalPages; page++) {
          const response = await IpHistoryAPI.findAllIpHistory({
            page,
            limit: 100,
          });
          allHistory.push(...response.data);
          setExportProgress({ current: page, total: totalPages });
        }
      }

      // Create CSV content
      const csvHeaders = [
        "Endereço IP",
        "Ação",
        "Data/Hora",
        "Empresa",
        "Executado por",
        "Endereço MAC",
        "Data de Expiração",
        "Notas",
      ];

      const csvRows = allHistory.map(historyToCsvRow);
      const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

      // Add BOM for Excel UTF-8 support
      const BOM = "\uFEFF";
      const csvWithBom = BOM + csvContent;

      // Create blob and download
      const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with current date and context
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
      let filename = `historico-ips-${dateStr}-${timeStr}.csv`;
      
      if (exportType === "ip") {
        filename = `historico-ip-${params?.ipId}-${dateStr}-${timeStr}.csv`;
      } else if (exportType === "company") {
        filename = `historico-empresa-${params?.companyId}-${dateStr}-${timeStr}.csv`;
      }
      
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error("Error exporting IP history:", error);
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
      throw error;
    }
  }, [params]);

  return {
    exportToCsv,
    isExporting,
    exportProgress,
  };
};

