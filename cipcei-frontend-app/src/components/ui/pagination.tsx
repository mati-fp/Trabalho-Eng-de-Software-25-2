"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
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
  );
}

