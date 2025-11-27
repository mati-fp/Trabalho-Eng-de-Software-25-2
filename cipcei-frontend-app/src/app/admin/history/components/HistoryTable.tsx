"use client";

import { IpHistory } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getIpActionBadge } from "@/components/ui/table-badge";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import HistoryIconButton from "./HistoryIconButton";

type SortField = "address" | "action" | "performedAt";
type SortOrder = "asc" | "desc";

interface HistoryTableProps {
  history: IpHistory[];
  loading: boolean;
  error: string | null;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  showRedirectIcons?: boolean;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export default function HistoryTable({
  history,
  loading,
  error,
  sortField,
  sortOrder,
  onSort,
  showRedirectIcons = false,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 100,
  onPageChange,
}: HistoryTableProps) {
  const router = useRouter();
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    type: "ip" | "company";
    id: string;
    message: string;
    rowId: string;
  } | null>(null);

  const handleIpClick = (ipId: string) => {
    router.push(`/admin/history/ip/${ipId}`);
  };

  const handleCompanyClick = (companyId: string) => {
    router.push(`/admin/history/company/${companyId}`);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Carregando...</div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">{error}</div>;
  }

  if (history.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhum registro de histórico encontrado.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("address")}
            >
              Endereço IP
              {sortField === "address" && (
                <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-center"
              onClick={() => onSort("action")}
            >
              Ação
              {sortField === "action" && (
                <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-center"
              onClick={() => onSort("performedAt")}
            >
              Data/Hora
              {sortField === "performedAt" && (
                <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
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
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span>{item.ip.address}</span>
                  {showRedirectIcons && item.ip.id && (
                    <HistoryIconButton
                      onClick={() => handleIpClick(item.ip.id)}
                      tooltipMessage="Acessar histórico desse IP"
                      ariaLabel="Acessar histórico desse IP"
                      rowId={item.id}
                      itemId={item.ip.id}
                      hoveredTooltip={hoveredTooltip}
                      onTooltipChange={setHoveredTooltip}
                      type="ip"
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {getIpActionBadge(item.action)}
              </TableCell>
              <TableCell className="text-center">
                {formatDate(item.performedAt, true)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {item.company?.user?.name || (
                    <span className="text-muted-foreground">-</span>
                  )}
                  {showRedirectIcons && item.company?.id && (
                    <HistoryIconButton
                      onClick={() => handleCompanyClick(item.company!.id)}
                      tooltipMessage="Acessar histórico dessa empresa"
                      ariaLabel="Acessar histórico dessa empresa"
                      rowId={item.id}
                      itemId={item.company!.id}
                      hoveredTooltip={hoveredTooltip}
                      onTooltipChange={setHoveredTooltip}
                      type="company"
                    />
                  )}
                </div>
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
                {item.notes || <span className="text-muted-foreground">-</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {endIndex} de {totalItems} resultados
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || totalPages <= 1}
            >
              Anterior
            </Button>
            <div className="flex items-center px-3 text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages <= 1}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

