"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Company } from "@/types";
import {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@/infra/companies/companies.payloads";
import { CreateUserPayload } from "@/infra/users/users.payloads";
import RoomSelect from "@/components/ui/room-select";

interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCompanyPayload | UpdateCompanyPayload) => Promise<void>;
  company?: Company;
  loading?: boolean;
}

export default function CompanyModal({
  open,
  onClose,
  onSubmit,
  company,
  loading = false,
}: CompanyModalProps) {
  const isEditMode = !!company;

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roomId, setRoomId] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when modal opens or company changes
  useEffect(() => {
    if (open) {
      if (isEditMode && company) {
        setName(company.user?.name || "");
        setEmail(company.user?.email || "");
        setRoomId("");
        setPassword("");
        setChangePassword(false);
      } else {
        // Reset form for create mode
        setName("");
        setEmail("");
        setPassword("");
        setRoomId("");
        setChangePassword(false);
      }
      setErrors({});
    }
  }, [open, company, isEditMode]);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!isEditMode && !name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (name.trim() && name.trim().length < 2) {
      newErrors.name = "Nome deve ter no mínimo 2 caracteres";
    } else if (name.trim().length > 100) {
      newErrors.name = "Nome deve ter no máximo 100 caracteres";
    }

    // Email validation
    if (!isEditMode && !email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (email.trim() && !emailRegex.test(email.trim())) {
      newErrors.email = "Email inválido";
    }

    // Password validation
    if (!isEditMode && !password.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (isEditMode && changePassword && !password.trim()) {
      newErrors.password = "Senha é obrigatória quando 'Atribuir nova senha' está marcado";
    } else if (password.trim() && password.length < 8) {
      newErrors.password = "Senha deve ter no mínimo 8 caracteres";
    } else if (password.trim() && password.length > 32) {
      newErrors.password = "Senha deve ter no máximo 32 caracteres";
    }

    // RoomId validation
    if (!isEditMode && !roomId.trim()) {
      newErrors.roomId = "Sala é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (isEditMode) {
        const updatePayload: UpdateCompanyPayload = {};
        const userFields: Partial<CreateUserPayload> = {};

        if (name.trim()) {
          userFields.name = name.trim();
        }
        if (email.trim()) {
          userFields.email = email.trim();
        }
        if (changePassword && password.trim()) {
          userFields.password = password.trim();
        }
        if (Object.keys(userFields).length > 0) {
          userFields.role = "company";
          updatePayload.user = userFields as CreateUserPayload;
        }
        if (roomId.trim()) {
          updatePayload.roomId = roomId.trim();
        }

        if (Object.keys(updatePayload).length > 0) {
          await onSubmit(updatePayload);
        }
      } else {
        const createPayload: CreateCompanyPayload = {
          user: {
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
            role: "company",
          },
          roomId: roomId.trim(),
        };
        await onSubmit(createPayload);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <Card
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Editar Empresa" : "Criar Empresa"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Atualize as informações da empresa. Deixe os campos em branco para não alterá-los."
              : "Preencha os dados para criar uma nova empresa no sistema."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Nome da Empresa {!isEditMode && <span className="text-destructive">*</span>}
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Empresa Exemplo LTDA"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <span className="text-sm text-destructive">{errors.name}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email {!isEditMode && <span className="text-destructive">*</span>}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="empresa@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <span className="text-sm text-destructive">{errors.email}</span>
              )}
            </div>

            {/* Password Field - Edit Mode with Checkbox */}
            {isEditMode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={changePassword}
                    onChange={(e) => {
                      setChangePassword(e.target.checked);
                      if (!e.target.checked) {
                        setPassword("");
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor="changePassword"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Atribuir nova senha
                  </label>
                </div>
                {changePassword && (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
                      Nova Senha <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && (
                      <span className="text-sm text-destructive">{errors.password}</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Password Field - Create Mode */
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Senha <span className="text-destructive">*</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <span className="text-sm text-destructive">{errors.password}</span>
                )}
              </div>
            )}

            {/* Room ID Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="roomId"
                className="text-sm font-medium text-foreground"
              >
                Sala {!isEditMode && <span className="text-destructive">*</span>}
              </label>
              <RoomSelect
                value={roomId}
                onValueChange={setRoomId}
                placeholder="Selecione uma sala"
                disabled={loading}
              />
              {errors.roomId && (
                <span className="text-sm text-destructive">{errors.roomId}</span>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={loading}
            >
              {loading ? "Salvando..." : isEditMode ? "Salvar" : "Criar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

