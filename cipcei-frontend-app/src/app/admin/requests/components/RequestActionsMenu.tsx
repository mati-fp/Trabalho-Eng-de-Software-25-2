"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { IpRequest } from "@/types";
import { IpRequestsAPI, ApproveIpRequestPayload, RejectIpRequestPayload } from "@/infra/ip-requests";

interface RequestActionsMenuProps {
  request: IpRequest;
  onActionComplete: () => void;
}

export default function RequestActionsMenu({
  request,
  onActionComplete,
}: RequestActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | null;
  }>({ open: false, action: null });
  const [inputValue, setInputValue] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "info" | "warning">("info");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calcular posição do menu quando abrir
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 100; // Altura aproximada do menu
      
      // Posicionar acima do botão
      setMenuPosition({
        top: buttonRect.top - menuHeight - 8, // 8px de espaçamento
        right: window.innerWidth - buttonRect.right,
      });
    }
  }, [isOpen]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
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

  // Reset input when dialog opens
  useEffect(() => {
    if (confirmDialog.open) {
      setInputValue("");
    }
  }, [confirmDialog.open]);

  const handleApprove = () => {
    setConfirmDialog({ open: true, action: "approve" });
    setIsOpen(false);
  };

  const handleReject = () => {
    setConfirmDialog({ open: true, action: "reject" });
    setIsOpen(false);
  };

  const handleConfirmApprove = async () => {
    try {
      const payload: ApproveIpRequestPayload = {};
      if (inputValue.trim()) {
        payload.notes = inputValue.trim();
      }

      await IpRequestsAPI.approveIpRequest(request.id, payload);

      setToastMessage("Solicitação aprovada com sucesso!");
      setToastVariant("success");
      setToastOpen(true);
      setConfirmDialog({ open: false, action: null });
      setInputValue("");
      onActionComplete();
    } catch (err) {
      setToastMessage("Erro ao aprovar solicitação. Tente novamente.");
      setToastVariant("error");
      setToastOpen(true);
      console.error("Error approving request:", err);
    }
  };

  const handleConfirmReject = async () => {
    if (!inputValue.trim()) {
      setToastMessage("O motivo da rejeição é obrigatório.");
      setToastVariant("error");
      setToastOpen(true);
      return;
    }

    try {
      const payload: RejectIpRequestPayload = {
        rejectionReason: inputValue.trim(),
      };

      await IpRequestsAPI.rejectIpRequest(request.id, payload);

      setToastMessage("Solicitação rejeitada com sucesso!");
      setToastVariant("success");
      setToastOpen(true);
      setConfirmDialog({ open: false, action: null });
      setInputValue("");
      onActionComplete();
    } catch (err) {
      setToastMessage("Erro ao rejeitar solicitação. Tente novamente.");
      setToastVariant("error");
      setToastOpen(true);
      console.error("Error rejecting request:", err);
    }
  };

  const hasActions = request.status === "pending";

  return (
    <>
      <div className="relative">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon-sm"
          onClick={() => hasActions && setIsOpen(!isOpen)}
          disabled={!hasActions}
          className="h-8 w-8"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && hasActions && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Menu posicionado fixo acima do botão */}
          <div
            ref={menuRef}
            className="fixed z-50 w-48 rounded-md border bg-popover shadow-md"
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
            }}
          >
            <div className="p-1">
              <button
                onClick={handleApprove}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-green-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprovar
              </button>
              <button
                onClick={handleReject}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent transition-colors text-destructive"
              >
                <XCircle className="h-4 w-4" />
                Rejeitar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Dialog for Approve */}
      {confirmDialog.action === "approve" && (
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => {
            setConfirmDialog({ open: false, action: null });
            setInputValue("");
          }}
          onConfirm={handleConfirmApprove}
          title="Aprovar Solicitação"
          message="Tem certeza que deseja aprovar esta solicitação?"
          confirmLabel="Aprovar"
          cancelLabel="Cancelar"
          variant="default"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notas adicionais
            </label>
            <Input
              type="text"
              placeholder="Notas adicionais (opcional)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleConfirmApprove();
                }
              }}
              autoFocus
            />
          </div>
        </ConfirmDialog>
      )}

      {/* Confirmation Dialog for Reject */}
      {confirmDialog.action === "reject" && (
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => {
            setConfirmDialog({ open: false, action: null });
            setInputValue("");
          }}
          onConfirm={handleConfirmReject}
          title="Rejeitar Solicitação"
          message="Tem certeza que deseja rejeitar esta solicitação?"
          confirmLabel="Rejeitar"
          cancelLabel="Cancelar"
          variant="destructive"
          confirmDisabled={!inputValue.trim()}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Motivo da rejeição
              <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              type="text"
              placeholder="Motivo da rejeição"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && inputValue.trim()) {
                  e.preventDefault();
                  handleConfirmReject();
                }
              }}
              autoFocus
            />
          </div>
        </ConfirmDialog>
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

