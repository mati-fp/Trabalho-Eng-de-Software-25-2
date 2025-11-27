"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompaniesAPI } from "@/infra/companies";
import { Company } from "@/types";

interface CompanySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function CompanySelect({
  value,
  onValueChange,
  placeholder = "Selecione uma empresa",
  disabled = false,
}: CompanySelectProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CompaniesAPI.findAllCompanies();
        setCompanies(data);
      } catch (err) {
        setError("Erro ao carregar empresas");
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={true}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={true}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Erro ao carregar" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {companies.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              Nenhuma empresa encontrada
            </div>
          ) : (
            companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.user?.name || `Empresa ${company.id.slice(0, 8)}`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

