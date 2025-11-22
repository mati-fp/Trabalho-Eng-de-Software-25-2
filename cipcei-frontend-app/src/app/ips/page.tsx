"use client";

import { useEffect, useState } from "react";
import { findAllIps, FindAllIpsParams } from "@/infra/ips";
import { IP } from "@/types";
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

type SortField = "address" | "status";
type SortOrder = "asc" | "desc";

export default function IpsPage() {
  const [ips, setIps] = useState<IP[]>([]);
  const [filteredIps, setFilteredIps] = useState<IP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyNameFilter, setCompanyNameFilter] = useState<string>("");
  const [roomNumberFilter, setRoomNumberFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("address");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch IPs from API
  useEffect(() => {
    const fetchIps = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: FindAllIpsParams = {};

        if (statusFilter !== "all") {
          params.status = statusFilter as "available" | "in_use";
        }

        if (companyNameFilter.trim()) {
          params.companyName = companyNameFilter.trim();
        }

        if (roomNumberFilter.trim()) {
          params.roomNumber = parseInt(roomNumberFilter.trim());
        }

        const data = await findAllIps(params);
        setIps(data);
        setFilteredIps(data);
      } catch (err) {
        setError("Erro ao carregar IPs. Tente novamente.");
        console.error("Error fetching IPs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIps();
  }, [statusFilter, companyNameFilter, roomNumberFilter]);

  // Apply local search and sorting
  useEffect(() => {
    let result = [...ips];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((ip) =>
        ip.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareValue = 0;

      if (sortField === "address") {
        compareValue = a.address.localeCompare(b.address);
      } else if (sortField === "status") {
        compareValue = a.status.localeCompare(b.status);
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredIps(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [ips, searchQuery, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredIps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIps = filteredIps.slice(startIndex, endIndex);

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter("all");
    setCompanyNameFilter("");
    setRoomNumberFilter("");
    setSearchQuery("");
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

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    if (status === "available") {
      return (
        <Badge variant="default" className="bg-secondary text-primary-foreground">
          Disponível
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-primary text-secondary-foreground">
        Alocado
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Gerenciamento de IPs
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Visualize e gerencie os endereços IP do sistema
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-card-foreground">
          Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="in_use">Alocado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Company Name Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Nome da Empresa
            </label>
            <Input
              placeholder="Nome da empresa"
              value={companyNameFilter}
              onChange={(e) => setCompanyNameFilter(e.target.value)}
            />
          </div>

          {/* Room Number Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Número da Sala
            </label>
            <Input
              type="number"
              placeholder="Ex: 101"
              value={roomNumberFilter}
              onChange={(e) => setRoomNumberFilter(e.target.value)}
            />
          </div>

          {/* Search by Address */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Buscar por Endereço
            </label>
            <Input
              placeholder="192.168.0.1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <Button variant="default" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
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
        ) : filteredIps.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum IP encontrado.
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
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    {sortField === "status" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Endereço MAC</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Empresa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentIps.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-medium">{ip.address}</TableCell>
                    <TableCell>{getStatusBadge(ip.status)}</TableCell>
                    <TableCell>
                      {ip.macAddress || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ip.room?.number || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ip.room?.company?.user?.name || (
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
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredIps.length)} de{" "}
                  {filteredIps.length} resultados
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

