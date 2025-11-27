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
import { IP } from "@/types";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (expirationDate?: string) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isRenew?: boolean;
  ip?: IP;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  isRenew = false,
  ip,
}: ConfirmDialogProps) {
  const [expirationDate, setExpirationDate] = useState("");

  // Calcular data mínima (hoje) e padrão (30 dias a partir de hoje)
  useEffect(() => {
    if (isRenew && open) {
      const today = new Date();
      const defaultDate = new Date(today);
      defaultDate.setDate(today.getDate() + 30);
      setExpirationDate(defaultDate.toISOString().split("T")[0]);
    }
  }, [isRenew, open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (isRenew) {
      onConfirm(expirationDate);
    } else {
      onConfirm();
    }
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="break-words whitespace-pre-line mb-2">{title}</CardTitle>
          <CardDescription className="break-words whitespace-pre-line">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRenew && ip && (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Endereço IP:</span>
                  <span className="font-medium">{ip.address}</span>
                </div>
                {ip.macAddress && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Endereço MAC:</span>
                    <span className="font-medium font-mono">{ip.macAddress}</span>
                  </div>
                )}
                {ip.room?.number && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sala:</span>
                    <span className="font-medium">{ip.room.number}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="expirationDate"
                  className="text-sm font-medium text-foreground"
                >
                  Nova Data de Expiração <span className="text-destructive">*</span>
                </label>
                <Input
                  id="expirationDate"
                  type="date"
                  min={today}
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isRenew && !expirationDate}
          >
            {confirmLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

