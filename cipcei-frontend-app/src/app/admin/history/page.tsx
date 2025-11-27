"use client";

import { useEffect, useState } from "react";
import { IpHistoryAPI } from "@/infra/ip-history/ip-history.infra";
import { IpHistory } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getIpActionBadge } from "@/components/ui/table-badge";
import { formatDate } from "@/lib/utils";
import { useExportIpHistory } from "@/hooks";

type SortField = "address" | "action" | "performedAt";
type SortOrder = "asc" | "desc";

export default function AdminHistoryPage() {
  const [history, setHistory] = useState<IpHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<IpHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Export hook
  const { exportToCsv, isExporting, exportProgress } = useExportIpHistory();

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("performedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 100;

  // Fetch IP History from API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await IpHistoryAPI.findAllIpHistory({
          page: currentPage,
          limit: itemsPerPage,
        });

        setHistory(response.data);
        setFilteredHistory(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.totalItems);
      } catch (err) {
        setError("Erro ao carregar histórico. Tente novamente.");
        console.error("Error fetching IP history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage]);

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

  // Refresh history list
  const handleRefreshHistory = async () => {
    try {
      const response = await IpHistoryAPI.findAllIpHistory({
        page: currentPage,
        limit: itemsPerPage,
      });

      setHistory(response.data);
      setFilteredHistory(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalItems);
    } catch (err) {
      console.error("Error refreshing history:", err);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handleExport = async () => {
    try {
      await exportToCsv();
    } catch (err) {
      console.error("Error exporting:", err);
      setError("Erro ao exportar histórico. Tente novamente.");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Histórico de Atividades
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Visualize o histórico de atividades dos endereços IP do sistema
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
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">{error}</div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum registro de histórico encontrado.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("address")}
                  >
                    Endereço IP
                    {sortField === "address" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort("action")}
                  >
                    Ação
                    {sortField === "action" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort("performedAt")}
                  >
                    Data/Hora
                    {sortField === "performedAt" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead className="text-center">Empresa</TableHead>
                  <TableHead className="text-center">Executado por</TableHead>
                  <TableHead className="text-center">Endereço MAC</TableHead>
                  <TableHead className="text-center">Data de Expiração</TableHead>
                  <TableHead className="text-center">Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.ip.address}
                    </TableCell>
                    <TableCell className="text-center">
                      {getIpActionBadge(item.action)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(item.performedAt, true)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.company?.user?.name || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.performedBy.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.macAddress || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.expirationDate ? (
                        formatDate(item.expirationDate)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.notes || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {endIndex} de {totalItems}{" "}
                  resultados
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center px-3 text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
