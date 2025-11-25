"use client";

import { useEffect, useState } from "react";
import { CompaniesAPI } from "@/infra/companies";
import { Company } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import CompanyModal from "./components/CompanyModal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@/infra/companies/companies.payloads";

type SortField = "name" | "email" | "room" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminClientsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [nameFilter, setNameFilter] = useState<string>("");
  const [roomFilter, setRoomFilter] = useState<string>("");

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);
  const [modalLoading, setModalLoading] = useState(false);

  // Dialog and toast states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "info" | "warning">("info");

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await CompaniesAPI.findAllCompanies();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (err) {
        setError("Erro ao carregar clientes. Tente novamente.");
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Apply local filters, search and sorting
  useEffect(() => {
    let result = [...companies];

    // Apply name filter
    if (nameFilter.trim()) {
      result = result.filter((company) =>
        company.user?.name
          ?.toLowerCase()
          .includes(nameFilter.trim().toLowerCase())
      );
    }

    // Apply room filter
    if (roomFilter.trim()) {
      const roomNumber = parseInt(roomFilter.trim());
      if (!isNaN(roomNumber)) {
        result = result.filter(
          (company) => company.room?.number === roomNumber
        );
      } else {
        // If not a valid number, try partial match on string representation
        result = result.filter((company) =>
          company.room?.number?.toString().includes(roomFilter.trim())
        );
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareValue = 0;

      if (sortField === "name") {
        const nameA = a.user?.name || "";
        const nameB = b.user?.name || "";
        compareValue = nameA.localeCompare(nameB);
      } else if (sortField === "email") {
        const emailA = a.user?.email || "";
        const emailB = b.user?.email || "";
        compareValue = emailA.localeCompare(emailB);
      } else if (sortField === "room") {
        const roomA = a.room?.number || 0;
        const roomB = b.room?.number || 0;
        compareValue = roomA - roomB;
      } else if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        compareValue = dateA - dateB;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredCompanies(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [companies, nameFilter, roomFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Clear all filters
  const handleClearFilters = () => {
    setNameFilter("");
    setRoomFilter("");
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

  // Handle delete - open confirmation dialog
  const handleDelete = (id: string) => {
    setCompanyToDelete(id);
    setConfirmDialogOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      await CompaniesAPI.deleteCompany(companyToDelete);
      // Refresh companies list
      const data = await CompaniesAPI.findAllCompanies();
      setCompanies(data);
      setToastMessage("Cliente excluído com sucesso!");
      setToastVariant("success");
      setToastOpen(true);
    } catch (err) {
      setToastMessage("Erro ao excluir cliente. Tente novamente.");
      setToastVariant("error");
      setToastOpen(true);
      console.error("Error deleting company:", err);
    } finally {
      setCompanyToDelete(null);
    }
  };

  // Handle edit - open modal with company data
  const handleEdit = (id: string) => {
    const company = companies.find((c) => c.id === id);
    if (company) {
      setEditingCompany(company);
      setModalOpen(true);
    }
  };

  // Handle create - open empty modal
  const handleCreate = () => {
    setEditingCompany(undefined);
    setModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCompany(undefined);
  };

  // Handle modal submit
  const handleModalSubmit = async (
    data: CreateCompanyPayload | UpdateCompanyPayload
  ) => {
    try {
      setModalLoading(true);

      if (editingCompany) {
        // Update company
        await CompaniesAPI.updateCompany(editingCompany.id, data as UpdateCompanyPayload);
      } else {
        // Create company
        await CompaniesAPI.createCompany(data as CreateCompanyPayload);
      }

      // Refresh companies list
      const updatedCompanies = await CompaniesAPI.findAllCompanies();
      setCompanies(updatedCompanies);

      // Close modal
      handleModalClose();
      setToastMessage(
        editingCompany
          ? "Empresa atualizada com sucesso!"
          : "Empresa criada com sucesso!"
      );
      setToastVariant("success");
      setToastOpen(true);
    } catch (err) {
      console.error("Error saving company:", err);
      setToastMessage(
        editingCompany
          ? "Erro ao atualizar empresa. Tente novamente."
          : "Erro ao criar empresa. Tente novamente."
      );
      setToastVariant("error");
      setToastOpen(true);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Gerenciamento de Clientes
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Visualize e gerencie os clientes cadastrados no sistema
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Criar Empresa
        </Button>
      </div>

      {/* Filters Section */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-card-foreground">
          Filtros
        </h2>
        <div className="flex flex-row items-end gap-4">
          {/* Name Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Buscar por Nome
            </label>
            <Input
              placeholder="Nome da empresa"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Room Number Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Filtrar por Sala
            </label>
            <Input
              type="number"
              placeholder="Ex: 101"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="mt-4">
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
        ) : filteredCompanies.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum cliente encontrado.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("name")}
                  >
                    Nome da Empresa
                    {sortField === "name" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("email")}
                  >
                    Email
                    {sortField === "email" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort("room")}
                  >
                    Sala
                    {sortField === "room" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort("createdAt")}
                  >
                    Data de Criação
                    {sortField === "createdAt" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      {company.user?.name || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.user?.email || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {company.room?.number || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(company.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(company.id)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(company.id)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                  {Math.min(endIndex, filteredCompanies.length)} de{" "}
                  {filteredCompanies.length} resultados
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

      {/* Company Modal */}
      <CompanyModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        company={editingCompany}
        loading={modalLoading}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setCompanyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
      />

      {/* Toast Notification */}
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        variant={toastVariant}
      />
    </div>
  );
}
