"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FormErrors {
  macAddress?: string;
  equipmentType?: string;
  operatingSystem?: string;
  roomLocation?: string;
  usagePeriod?: string;
}

export default function RequestIpPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [macAddress, setMacAddress] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");
  const [roomLocation, setRoomLocation] = useState("");
  const [usagePeriod, setUsagePeriod] = useState<string>("");
  const [justification, setJustification] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Definir data padrão (30 dias a partir de hoje) ao montar o componente
  useEffect(() => {
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(today.getDate() + 30);
    setUsagePeriod(defaultDate.toISOString().split("T")[0]);
  }, []);

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

    // Validar Tipo de Equipamento
    if (!equipmentType) {
      newErrors.equipmentType = "Tipo de equipamento é obrigatório";
    }

    // Validar Sistema Operacional
    if (!operatingSystem) {
      newErrors.operatingSystem = "Sistema operacional é obrigatório";
    }

    // Validar Sala/Local
    if (!roomLocation.trim()) {
      newErrors.roomLocation = "Sala/Local é obrigatório";
    }

    // Validar Prazo de Utilização (Data)
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
    const payload = {
      macAddress: macAddress.trim(),
      equipmentType,
      operatingSystem,
      roomLocation: roomLocation.trim(),
      expirationDate: usagePeriod,
      justification: justification.trim() || undefined,
      companyId: profile?.companyId,
    };

    // Apenas printar o payload conforme solicitado
    console.log("Form Payload:", payload);

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
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
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
                  <p className="text-xs text-muted-foreground">
                    Formato: XX:XX:XX:XX:XX:XX
                  </p>
                  {errors.macAddress && (
                    <p className="text-sm text-destructive">{errors.macAddress}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="equipmentType"
                    className="text-sm font-medium text-foreground"
                  >
                    Tipo de Equipamento <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={equipmentType}
                    onValueChange={(value) => {
                      setEquipmentType(value);
                      if (errors.equipmentType) {
                        setErrors({ ...errors, equipmentType: undefined });
                      }
                    }}
                  >
                    <SelectTrigger
                      id="equipmentType"
                      className={`${errors.equipmentType ? "border-destructive" : ""} w-full`}
                      aria-invalid={!!errors.equipmentType}
                    >
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="notebook">Notebook</SelectItem>
                      <SelectItem value="servidor">Servidor</SelectItem>
                      <SelectItem value="roteador">Roteador</SelectItem>
                      <SelectItem value="switch">Switch</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.equipmentType && (
                    <p className="text-sm text-destructive">{errors.equipmentType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="operatingSystem"
                    className="text-sm font-medium text-foreground"
                  >
                    Sistema Operacional <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={operatingSystem}
                    onValueChange={(value) => {
                      setOperatingSystem(value);
                      if (errors.operatingSystem) {
                        setErrors({ ...errors, operatingSystem: undefined });
                      }
                    }}
                  >
                    <SelectTrigger
                      id="operatingSystem"
                      className={`${errors.operatingSystem ? "border-destructive" : ""} w-full`}
                      aria-invalid={!!errors.operatingSystem}
                    >
                      <SelectValue placeholder="Selecione o SO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                      <SelectItem value="macos">macOS</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.operatingSystem && (
                    <p className="text-sm text-destructive">{errors.operatingSystem}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="roomLocation"
                  className="text-sm font-medium text-foreground"
                >
                  Sala/Local <span className="text-destructive">*</span>
                </label>
                <Input
                  id="roomLocation"
                  type="text"
                  placeholder="Ex: Sala 201, Laboratório 3"
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
            </div>
            <div className="space-y-2">
              <label
                htmlFor="justification"
                className="text-sm font-medium text-foreground"
              >
                Motivo da solicitação (opcional)
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

