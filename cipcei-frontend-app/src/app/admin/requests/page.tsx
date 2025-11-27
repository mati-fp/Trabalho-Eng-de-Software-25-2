"use client";

import { useEffect, useState } from "react";
import { IpRequestsAPI } from "@/infra/ip-requests";
import { IpRequest } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RequestActionsMenu from "./components/RequestActionsMenu";
import { getRequestTypeBadge, getStatusBadge } from "@/components/ui/table-badge";
import { formatDate } from "@/lib/utils";

type SortField = "company" | "requestType" | "status" | "requestedBy" | "requestDate";
type SortOrder = "asc" | "desc";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<IpRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<IpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [companyNameFilter, setCompanyNameFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>("all");

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("requestDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch requests from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await IpRequestsAPI.findAllIpRequests();
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        setError("Erro ao carregar solicitações. Tente novamente.");
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Apply local filters, search and sorting
  useEffect(() => {
    let result = [...requests];

    // Apply company name filter
    if (companyNameFilter.trim()) {
      result = result.filter((request) =>
        request.company?.user?.name
          ?.toLowerCase()
          .includes(companyNameFilter.trim().toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((request) => request.status === statusFilter);
    }

    // Apply request type filter
    if (requestTypeFilter !== "all") {
      result = result.filter((request) => request.requestType === requestTypeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareValue = 0;

      if (sortField === "company") {
        const nameA = a.company?.user?.name || "";
        const nameB = b.company?.user?.name || "";
        compareValue = nameA.localeCompare(nameB);
      } else if (sortField === "requestType") {
        compareValue = a.requestType.localeCompare(b.requestType);
      } else if (sortField === "status") {
        compareValue = a.status.localeCompare(b.status);
      } else if (sortField === "requestedBy") {
        const nameA = a.requestedBy?.name || "";
        const nameB = b.requestedBy?.name || "";
        compareValue = nameA.localeCompare(nameB);
      } else if (sortField === "requestDate") {
        const dateA = new Date(a.requestDate).getTime();
        const dateB = new Date(b.requestDate).getTime();
        compareValue = dateA - dateB;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredRequests(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [requests, companyNameFilter, statusFilter, requestTypeFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Clear all filters
  const handleClearFilters = () => {
    setCompanyNameFilter("");
    setStatusFilter("all");
    setRequestTypeFilter("all");
  };

  // Toggle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Refresh requests list after action
  const handleRefreshRequests = async () => {
    try {
      const data = await IpRequestsAPI.findAllIpRequests();
      setRequests(data);
    } catch (err) {
      console.error("Error refreshing requests:", err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Gerenciamento de Solicitações
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Visualize e gerencie as solicitações de IP do sistema
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-card-foreground">
          Filtros
        </h2>
        <div className="flex flex-row items-end gap-4">
          {/* Company Name Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Buscar por Empresa
            </label>
            <Input
              placeholder="Nome da empresa"
              value={companyNameFilter}
              onChange={(e) => setCompanyNameFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="w-48">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Request Type Filter */}
          <div className="w-48">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Tipo de Solicitação
            </label>
            <Select value={requestTypeFilter} onValueChange={setRequestTypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="new">Nova</SelectItem>
                <SelectItem value="renewal">Renovação</SelectItem>
                <SelectItem value="cancellation">Cancelamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button variant="default" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">{error}</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhuma solicitação encontrada.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("company")}
                  >
                    Empresa
                    {sortField === "company" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort("requestType")}
                  >
                    Tipo
                    {sortField === "requestType" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    {sortField === "status" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("requestedBy")}
                  >
                    Solicitado Por
                    {sortField === "requestedBy" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort("requestDate")}
                  >
                    Data da Solicitação
                    {sortField === "requestDate" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead className="text-center">
                    Data de Expiração
                  </TableHead>
                  <TableHead>
                    Justificativa
                  </TableHead>
                  <TableHead>
                    Notas
                  </TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.company?.user?.name || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getRequestTypeBadge(request.requestType)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      {request.requestedBy?.name || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(request.requestDate, true)}
                    </TableCell>
                    <TableCell className="text-center">
                      {request.expirationDate ? (
                        formatDate(request.expirationDate)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={request.justification}>
                        {request.justification || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === "rejected" && request.rejectionReason ? (
                        <div className="max-w-xs truncate" title={request.rejectionReason}>
                          {request.rejectionReason}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <RequestActionsMenu
                        request={request}
                        onActionComplete={handleRefreshRequests}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, filteredRequests.length)} de{" "}
                  {filteredRequests.length} resultados
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
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
