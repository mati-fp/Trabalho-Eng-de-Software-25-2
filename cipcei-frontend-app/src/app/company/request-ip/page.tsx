"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Toast from "@/components/ui/toast";
import { CreateIpRequestPayload, IpRequestsAPI } from "@/infra/ip-requests";

interface FormErrors {
  macAddress?: string;
  userName?: string;
  justification?: string;
}

export default function RequestIpPage() {
  const router = useRouter();

  const [macAddress, setMacAddress] = useState("");
  const [userName, setUserName] = useState("");
  const [justification, setJustification] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<
    "success" | "error" | "info" | "warning"
  >("info");

  // Validação de formato MAC Address
  const validateMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar MAC Address
    if (!macAddress.trim()) {
      newErrors.macAddress = "Endereço MAC é obrigatório";
    } else if (!validateMacAddress(macAddress.trim())) {
      newErrors.macAddress = "Formato inválido. Use: XX:XX:XX:XX:XX:XX";
    }

    // Validar nome do responsável
    if (!userName.trim()) {
      newErrors.userName = "Nome do responsável é obrigatório";
    }

    // Validar Justificativa
    if (!justification.trim()) {
      newErrors.justification = "Justificativa é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setMacAddress("");
    setUserName("");
    setJustification("");
    setErrors({});
  };

  // Função de submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const payload: CreateIpRequestPayload = {
      requestType: "new",
      justification: justification.trim(),
      macAddress: macAddress.trim(),
      userName: userName.trim(),
    };

    try {
      await IpRequestsAPI.createIpRequest(payload);

      setToastMessage(
        "Solicitação enviada! Acompanhe o status em Minhas solicitações."
      );
      setToastVariant("success");
      setToastOpen(true);
      resetForm();

      // Redireciona para a lista de solicitações após um breve intervalo
      setTimeout(() => {
        router.push("/company/requests");
      }, 1500);
    } catch (error) {
      console.error("Error submitting form:", error);
      setToastMessage("Erro ao enviar a solicitação. Tente novamente.");
      setToastVariant("error");
      setToastOpen(true);
      setLoading(false);
    }
  };

  // Função de cancelar
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Solicitar Endereço IP
          </CardTitle>
          <CardDescription>
            Preencha todas as informações necessárias para solicitar um endereço IP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="macAddress"
                    className="text-sm font-medium text-foreground"
                  >
                    Endereço MAC <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="macAddress"
                    type="text"
                    placeholder="00:1A:2B:3C:4D:5E"
                    value={macAddress}
                    onChange={(e) => {
                      setMacAddress(e.target.value);
                      if (errors.macAddress) {
                        setErrors({ ...errors, macAddress: undefined });
                      }
                    }}
                    className={errors.macAddress ? "border-destructive" : ""}
                    aria-invalid={!!errors.macAddress}
                  />
                  {errors.macAddress && (
                    <p className="text-sm text-destructive">{errors.macAddress}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="userName"
                    className="text-sm font-medium text-foreground"
                  >
                    Nome do responsável <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Pessoa que utilizará o IP"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (errors.userName) {
                        setErrors({ ...errors, userName: undefined });
                      }
                    }}
                    className={errors.userName ? "border-destructive" : ""}
                    aria-invalid={!!errors.userName}
                  />
                  {errors.userName && (
                    <p className="text-sm text-destructive">{errors.userName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="justification"
                  className="text-sm font-medium text-foreground"
                >
                  Justificativa <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="justification"
                  placeholder="Descreva o motivo da solicitação e como o IP será utilizado..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
                {errors.justification && (
                  <p className="text-sm text-destructive">{errors.justification}</p>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="default" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        variant={toastVariant}
      />
    </div>
  );
}
