"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import CompanySelect from "@/components/ui/company-select";
import { IP } from "@/types";
import { IpsAPI, AssignIpPayload } from "@/infra/ips";

interface IpActionsButtonProps {
  ip: IP;
  onActionComplete: () => void;
}

export default function IpActionsButton({
  ip,
  onActionComplete,
}: IpActionsButtonProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "assign" | "unassign" | null;
  }>({ open: false, action: null });
  const [companyId, setCompanyId] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "info" | "warning">("info");

  const handleAssign = () => {
    setCompanyId("");
    setMacAddress("");
    setConfirmDialog({ open: true, action: "assign" });
  };

  const handleUnassign = () => {
    setConfirmDialog({ open: true, action: "unassign" });
  };

  const handleConfirmAssign = async () => {
    if (!companyId.trim() || !macAddress.trim()) {
      setToastMessage("Empresa e MAC Address são obrigatórios.");
      setToastVariant("error");
      setToastOpen(true);
      return;
    }

    try {
      const payload: AssignIpPayload = {
        companyId: companyId.trim(),
        macAddress: macAddress.trim(),
      };

      await IpsAPI.assignIp(ip.id, payload);

      setToastMessage("IP atribuído com sucesso!");
      setToastVariant("success");
      setToastOpen(true);
      setConfirmDialog({ open: false, action: null });
      setCompanyId("");
      setMacAddress("");
      onActionComplete();
    } catch (err) {
      setToastMessage("Erro ao atribuir IP. Tente novamente.");
      setToastVariant("error");
      setToastOpen(true);
      console.error("Error assigning IP:", err);
    }
  };

  const handleConfirmUnassign = async () => {
    try {
      await IpsAPI.unassignIp(ip.id);

      setToastMessage("IP desatribuído com sucesso!");
      setToastVariant("success");
      setToastOpen(true);
      setConfirmDialog({ open: false, action: null });
      onActionComplete();
    } catch (err) {
      setToastMessage("Erro ao desatribuir IP. Tente novamente.");
      setToastVariant("error");
      setToastOpen(true);
      console.error("Error unassigning IP:", err);
    }
  };

  return (
    <>
      {ip.status === "available" ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAssign}
          className="text-primary hover:text-primary/80"
        >
          Atribuir
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUnassign}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Desatribuir
        </Button>
      )}

      {/* Confirmation Dialog for Assign */}
      {confirmDialog.action === "assign" && (
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => {
            setConfirmDialog({ open: false, action: null });
            setCompanyId("");
            setMacAddress("");
          }}
          onConfirm={handleConfirmAssign}
          title="Atribuir IP"
          message="Selecione a empresa e informe o endereço MAC para atribuir este IP:"
          confirmLabel="Atribuir"
          cancelLabel="Cancelar"
          variant="default"
          confirmDisabled={!companyId.trim() || !macAddress.trim()}
        >
          <div className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">
                Empresa
                <span className="text-destructive ml-1">*</span>
              </label>
              <div className="text-left">
                <CompanySelect
                  value={companyId}
                  onValueChange={setCompanyId}
                  placeholder="Selecione uma empresa"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">
                Endereço MAC
                <span className="text-destructive ml-1">*</span>
              </label>
              <div className="text-left">
                <Input
                  type="text"
                  placeholder="Ex: 00:1B:44:11:3A:B7"
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && companyId.trim() && macAddress.trim()) {
                      e.preventDefault();
                      handleConfirmAssign();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
          </div>
        </ConfirmDialog>
      )}

      {/* Confirmation Dialog for Unassign */}
      {confirmDialog.action === "unassign" && (
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => {
            setConfirmDialog({ open: false, action: null });
          }}
          onConfirm={handleConfirmUnassign}
          title="Desatribuir IP"
          message={`Tem certeza que deseja desatribuir o IP ${ip.address}?`}
          confirmLabel="Desatribuir"
          cancelLabel="Cancelar"
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

