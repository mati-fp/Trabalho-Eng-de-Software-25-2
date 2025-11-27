"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./ConfirmDialog";
import Toast from "@/components/ui/toast";
import { IP } from "@/types";
import { IpRequestsAPI } from "@/infra/ip-requests";
import { IpsAPI } from "@/infra/ips";

interface IpActionsMenuProps {
  ip: IP;
  onActionComplete?: () => void;
}

export default function IpActionsMenu({ ip, onActionComplete }: IpActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "renew" | "cancel" | null;
  }>({ open: false, action: null });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "info" | "warning">("info");

  // Calcular posição do menu quando abrir
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setMenuPosition({
            top: rect.bottom + 4,
            left: rect.right - 192, // 192px = w-48 (largura do menu)
          });
        }
      };
      
      // Usar requestAnimationFrame para garantir que o DOM esteja atualizado
      requestAnimationFrame(updatePosition);
      
      // Atualizar posição no scroll
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      setMenuPosition(null);
    }
  }, [isOpen]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleRenew = () => {
    setConfirmDialog({ open: true, action: "renew" });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setConfirmDialog({ open: true, action: "cancel" });
    setIsOpen(false);
  };

  const handleConfirmRenew = async (expirationDate?: string) => {
    if (!expirationDate) {
      setToastMessage("Data de expiração é obrigatória.");
      setToastVariant("error");
      setToastOpen(true);
      return;
    }

    try {
      await IpRequestsAPI.createIpRequest({
        requestType: "renewal",
        ipId: ip.id,
        expirationDate: expirationDate,
        justification: "pedido de renovação",
      });

      setToastMessage("Solicitação de renovação criada com sucesso!");
      setToastVariant("success");
      setToastOpen(true);
      setConfirmDialog({ open: false, action: null });
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      console.error("Error creating renewal request:", err);
      setToastMessage("Erro ao criar solicitação de renovação. Tente novamente.");
      setToastVariant("error");
      setToastOpen(true);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await IpsAPI.unassignIp(ip.id);

      setToastMessage("IP cancelado com sucesso!");
      setToastVariant("success");
      setToastOpen(true);
      setConfirmDialog({ open: false, action: null });
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      console.error("Error canceling IP:", err);
      setToastMessage("Erro ao cancelar IP. Tente novamente.");
      setToastVariant("error");
      setToastOpen(true);
    }
  };

  return (
    <>
      <div className="relative" ref={buttonRef}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && menuPosition && (
        <div
          ref={menuRef}
          className="fixed z-[100] w-48 rounded-md border bg-popover shadow-md"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="p-1">
            <button
              onClick={handleRenew}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Renovar IP
            </button>
            <button
              onClick={handleCancel}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent transition-colors text-destructive"
            >
              <X className="h-4 w-4" />
              Cancelar IP
            </button>
          </div>
        </div>
      )}

      {/* Diálogo de confirmação para Renovar */}
      {confirmDialog.action === "renew" && (
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, action: null })}
          onConfirm={handleConfirmRenew}
          title="Renovar IP"
          message="Selecione a nova data de expiração para o IP:"
          confirmLabel="Renovar"
          isRenew={true}
          ip={ip}
        />
      )}

      {/* Diálogo de confirmação para Cancelar */}
      {confirmDialog.action === "cancel" && (
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, action: null })}
          onConfirm={handleConfirmCancel}
          title="Cancelar IP"
          message={`Tem certeza que deseja cancelar o IP ${ip.address}? Esta ação não pode ser desfeita.`}
          confirmLabel="Sim"
          cancelLabel="Não"
          variant="destructive"
        />
      )}

      {/* Toast Notification */}
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        variant={toastVariant}
      />
    </>
  );
}

