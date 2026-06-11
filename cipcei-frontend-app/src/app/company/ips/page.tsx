"use client";

import { useEffect, useState } from "react";
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
import IpActionsMenu from "./components/IpActionsMenu";
import { CompaniesAPI } from "@/infra/companies";
import { getIpStatusBadge } from "@/components/ui/table-badge";
import { formatDate } from "@/lib/utils";
import Pagination from "@/components/ui/pagination";

type SortField = "address" | "status";
type SortOrder = "asc" | "desc";

export default function IpsPage() {
  const [ips, setIps] = useState<IP[]>([]);
  const [filteredIps, setFilteredIps] = useState<IP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("address");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Fetch IPs from API
  useEffect(() => {
    const fetchIps = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await CompaniesAPI.getMyIps({});
        setIps(data);
      } catch (err) {
        setError("Erro ao carregar IPs. Tente novamente.");
        console.error("Error fetching IPs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIps();
  }, []);

  // Apply local filters (status + search) and sorting
  useEffect(() => {
    let result = [...ips];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((ip) => ip.status === statusFilter);
    }

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
  }, [ips, statusFilter, searchQuery, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredIps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIps = filteredIps.slice(startIndex, endIndex);

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter("all");
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

  // Refresh IPs list
  const handleRefreshIps = async () => {
    try {
      setError(null);
      const data = await CompaniesAPI.getMyIps({});
      setIps(data);
    } catch (err) {
      setError("Erro ao atualizar IPs. Tente novamente.");
      console.error("Error refreshing IPs:", err);
    }
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
        <div className="flex items-end gap-4 ">
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
                  <TableHead className="text-center">Endereço MAC</TableHead>
                  <TableHead className="text-center">Sala</TableHead>
                  <TableHead className="w-[100px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentIps.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-medium">{ip.address}</TableCell>
                    <TableCell className="text-center">{getIpStatusBadge(ip.status)}</TableCell>
                    <TableCell className="text-center">
                      {ip.macAddress || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {ip.room?.number || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <IpActionsMenu ip={ip} onActionComplete={handleRefreshIps} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredIps.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

