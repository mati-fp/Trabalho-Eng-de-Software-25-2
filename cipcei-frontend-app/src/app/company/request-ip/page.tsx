"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateIpRequestPayload, IpRequestsAPI } from "@/infra/ip-requests";

interface FormErrors {
  macAddress?: string;
  roomLocation?: string;
  usagePeriod?: string;
  justification?: string;
}

export default function RequestIpPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [macAddress, setMacAddress] = useState("");
  const [roomLocation, setRoomLocation] = useState("");
  const [usagePeriod, setUsagePeriod] = useState<string>("");
  const [justification, setJustification] = useState("");
  const [isTemporary, setIsTemporary] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

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

    // Validar Sala/Local
    if (!roomLocation.trim()) {
      newErrors.roomLocation = "Sala é obrigatório";
    }

    // Validar Prazo de Utilização (Data) - apenas se for temporária
    if (isTemporary) {
      if (!usagePeriod || usagePeriod.trim() === "") {
        newErrors.usagePeriod = "Data de expiração é obrigatória";
      } else {
        const selectedDate = new Date(usagePeriod);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(selectedDate.getTime())) {
          newErrors.usagePeriod = "Data inválida";
        } else if (selectedDate < today) {
          newErrors.usagePeriod = "A data de expiração deve ser no futuro";
        }
      }
    }

    // Validar Justificativa
    if (!justification.trim()) {
      newErrors.justification = "Justificativa é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função de submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Criar payload
    const payload: CreateIpRequestPayload = {
      requestType: "new",
      justification: justification.trim(),
      macAddress: macAddress.trim(),
      userName: profile?.name,
      isTemporary: isTemporary,
      expirationDate: isTemporary ? usagePeriod : undefined,
    };

    // Apenas printar o payload conforme solicitado
    console.log("Form Payload:", payload);

    try {
      const response = await IpRequestsAPI.createIpRequest(payload);
      console.log("Response:", response);
    } catch (error) {
      console.error("Error submitting form:", error);
    }

    setLoading(false);
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
                    htmlFor="roomLocation"
                    className="text-sm font-medium text-foreground"
                  >
                    Sala <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="roomLocation"
                    type="text"
                    placeholder="Ex: 201"
                    value={roomLocation}
                    onChange={(e) => {
                      setRoomLocation(e.target.value);
                      if (errors.roomLocation) {
                        setErrors({ ...errors, roomLocation: undefined });
                      }
                    }}
                    className={errors.roomLocation ? "border-destructive" : ""}
                    aria-invalid={!!errors.roomLocation}
                  />
                  {errors.roomLocation && (
                    <p className="text-sm text-destructive">{errors.roomLocation}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isTemporary"
                    checked={isTemporary}
                    onChange={(e) => {
                      setIsTemporary(e.target.checked);
                      if (!e.target.checked) {
                        // Limpar erro de data quando desmarcar
                        if (errors.usagePeriod) {
                          setErrors({ ...errors, usagePeriod: undefined });
                        }
                      } else {
                        // Definir data padrão quando marcar
                        const today = new Date();
                        const defaultDate = new Date(today);
                        defaultDate.setDate(today.getDate() + 30);
                        setUsagePeriod(defaultDate.toISOString().split("T")[0]);
                      }
                    }}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <label
                    htmlFor="isTemporary"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Solicitação temporária
                  </label>
                </div>
                {isTemporary && (
                  <div className="space-y-2">
                    <label
                      htmlFor="usagePeriod"
                      className="text-sm font-medium text-foreground"
                    >
                      Data de Expiração <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="usagePeriod"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={usagePeriod}
                      onChange={(e) => {
                        setUsagePeriod(e.target.value);
                        if (errors.usagePeriod) {
                          setErrors({ ...errors, usagePeriod: undefined });
                        }
                      }}
                      className={errors.usagePeriod ? "border-destructive" : ""}
                      aria-invalid={!!errors.usagePeriod}
                    />
                    {errors.usagePeriod && (
                      <p className="text-sm text-destructive">{errors.usagePeriod}</p>
                    )}
                  </div>
                )}
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
              </div>
              {errors.justification && (
                <p className="text-sm text-destructive">{errors.justification}</p>
              )}
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
              <Button
                type="submit"
                variant="default"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

