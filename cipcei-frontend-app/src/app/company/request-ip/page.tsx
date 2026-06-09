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
  justification?: string;
}

export default function RequestIpPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [macAddress, setMacAddress] = useState("");
  const [roomLocation, setRoomLocation] = useState("");
  const [justification, setJustification] = useState("");
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

