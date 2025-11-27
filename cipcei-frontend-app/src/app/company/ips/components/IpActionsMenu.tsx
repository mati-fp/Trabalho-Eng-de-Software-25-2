"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./ConfirmDialog";
import { IP } from "@/types";

interface IpActionsMenuProps {
  ip: IP;
}

export default function IpActionsMenu({ ip }: IpActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "renew" | "cancel" | null;
  }>({ open: false, action: null });
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleConfirmRenew = (expirationDate?: string) => {
    console.log("Renovar IP:", ip.id, ip.address, "Nova data de expiração:", expirationDate);
    setConfirmDialog({ open: false, action: null });
  };

  const handleConfirmCancel = () => {
    console.log("Cancelar IP:", ip.id, ip.address);
    setConfirmDialog({ open: false, action: null });
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 top-10 z-50 w-48 rounded-md border bg-popover shadow-md">
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
      </div>

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
    </>
  );
}

