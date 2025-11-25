"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { IpRequest } from "@/types";
import { IpRequestsAPI } from "@/infra/ip-requests";

interface CancelRequestButtonProps {
  request: IpRequest;
  onActionComplete: () => void;
}

export default function CancelRequestButton({
  request,
  onActionComplete,
}: CancelRequestButtonProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "info" | "warning">("info");

  const hasActions = request.status === "pending";

  const handleCancel = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await IpRequestsAPI.cancelIpRequest(request.id);

      setToastMessage("Solicitação cancelada com sucesso!");
      setToastVariant("success");
      setToastOpen(true);
      setConfirmDialogOpen(false);
      onActionComplete();
    } catch (err) {
      setToastMessage("Erro ao cancelar solicitação. Tente novamente.");
      setToastVariant("error");
      setToastOpen(true);
      console.error("Error cancelling request:", err);
    }
  };

  if (!hasActions) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        title={hasActions ? "Cancelar" : "Sem ações disponíveis"}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        <XCircle className="h-4 w-4 mr-1" />
        Cancelar
      </Button>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
        }}
        onConfirm={handleConfirmCancel}
        title="Cancelar Solicitação"
        message="Tem certeza que deseja cancelar esta solicitação?"
        confirmLabel="Cancelar Solicitação"
        cancelLabel="Voltar"
        variant="destructive"
      />

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

