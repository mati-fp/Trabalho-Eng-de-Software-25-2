"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IpHistoryAPI } from "@/infra/ip-history/ip-history.infra";
import { IpHistory } from "@/types";
import { Button } from "@/components/ui/button";
import { useExportIpHistory } from "@/hooks";
import HistoryTable from "../../components/HistoryTable";

type SortField = "address" | "action" | "performedAt";
type SortOrder = "asc" | "desc";

export default function AdminHistoryCompanyPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [history, setHistory] = useState<IpHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<IpHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Export hook
  const { exportToCsv, isExporting, exportProgress } = useExportIpHistory({
    exportType: "company",
    companyId: companyId,
  });

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("performedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Fetch IP History from API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await IpHistoryAPI.findIpHistoryByCompany(companyId);

        setHistory(response);
        setFilteredHistory(response);
      } catch (err) {
        setError("Erro ao carregar histórico. Tente novamente.");
        console.error("Error fetching IP history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchHistory();
    }
  }, [companyId]);

  // Apply local sorting
  useEffect(() => {
    let result = [...history];

    // Apply sorting
    result.sort((a, b) => {
      let compareValue = 0;

      if (sortField === "address") {
        compareValue = a.ip.address.localeCompare(b.ip.address);
      } else if (sortField === "action") {
        compareValue = a.action.localeCompare(b.action);
      } else if (sortField === "performedAt") {
        compareValue =
          new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime();
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredHistory(result);
  }, [history, sortField, sortOrder]);

  // Toggle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleExport = async () => {
    try {
      await exportToCsv();
    } catch (err) {
      console.error("Error exporting:", err);
      setError("Erro ao exportar histórico. Tente novamente.");
    }
  };

  const companyName =
    history.length > 0 && history[0].company?.user?.name
      ? history[0].company.user.name
      : companyId;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Histórico da Empresa: {companyName}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Visualize o histórico completo de atividades desta empresa
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting || loading}
          variant="default"
        >
          {isExporting
            ? `Exportando... (${exportProgress.current}/${exportProgress.total})`
            : "Exportar CSV"}
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <HistoryTable
          history={filteredHistory}
          loading={loading}
          error={error}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          showRedirectIcons={false}
          showPagination={false}
        />
      </div>
    </div>
  );
}

