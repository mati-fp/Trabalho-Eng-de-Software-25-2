"use client";

import { useEffect, useState } from "react";
import { IpRequestsAPI, ApproveIpRequestPayload, RejectIpRequestPayload } from "@/infra/ip-requests";
import { IpRequest, IpRequestStatus, IpRequestType } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: IpRequestStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
            Pendente
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            Rejeitado
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Get request type badge
  const getRequestTypeBadge = (requestType: IpRequestType) => {
    switch (requestType) {
      case "new":
        return (
          <Badge variant="secondary">
            Nova
          </Badge>
        );
      case "renewal":
        return (
          <Badge variant="secondary">
            Renovação
          </Badge>
        );
      case "cancellation":
        return (
          <Badge variant="secondary">
            Cancelamento
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {requestType}
          </Badge>
        );
    }
  };

  // Handle approve
  const handleApprove = async (request: IpRequest) => {
    if (!confirm("Tem certeza que deseja aprovar esta solicitação?")) {
      return;
    }

    try {
      const notes = prompt("Notas adicionais (opcional):") || undefined;
      
      const payload: ApproveIpRequestPayload = {};
      if (notes) {
        payload.notes = notes;
      }
      // ipId is optional and backend will handle IP assignment for new requests
      // For renewals/cancellations, the request already has an IP reference

      await IpRequestsAPI.approveIpRequest(request.id, payload);
      
      // Refresh requests list
      const data = await IpRequestsAPI.findAllIpRequests();
      setRequests(data);
      
      alert("Solicitação aprovada com sucesso!");
    } catch (err) {
      alert("Erro ao aprovar solicitação. Tente novamente.");
      console.error("Error approving request:", err);
    }
  };

  // Handle reject
  const handleReject = async (request: IpRequest) => {
    if (!confirm("Tem certeza que deseja rejeitar esta solicitação?")) {
      return;
    }

    const rejectionReason = prompt("Motivo da rejeição (obrigatório):");
    if (!rejectionReason || rejectionReason.trim() === "") {
      alert("O motivo da rejeição é obrigatório.");
      return;
    }

    try {
      const payload: RejectIpRequestPayload = {
        rejectionReason: rejectionReason.trim(),
      };

      await IpRequestsAPI.rejectIpRequest(request.id, payload);
      
      // Refresh requests list
      const data = await IpRequestsAPI.findAllIpRequests();
      setRequests(data);
      
      alert("Solicitação rejeitada com sucesso!");
    } catch (err) {
      alert("Erro ao rejeitar solicitação. Tente novamente.");
      console.error("Error rejecting request:", err);
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
                      {formatDate(request.requestDate)}
                    </TableCell>
                    <TableCell className="text-center">
                      {request.status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(request)}
                            title="Aprovar"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(request)}
                            title="Rejeitar"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
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
