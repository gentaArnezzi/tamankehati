"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";
import { cn } from "./utils";

type ActionType = "approve" | "reject" | "delete" | "confirm" | "info";

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ActionType;
  title?: string;
  description?: string;
  onConfirm: (reason?: string) => void | Promise<void>;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}

const typeConfig = {
  approve: {
    icon: CheckCircle,
    iconColor: "text-green-500",
    title: "Setujui Data",
    description: "Apakah Anda yakin ingin menyetujui data ini?",
    confirmLabel: "Ya, Setujui",
    confirmVariant: "default" as const,
    requireReason: false,
  },
  reject: {
    icon: XCircle,
    iconColor: "text-red-500",
    title: "Tolak Data",
    description: "Apakah Anda yakin ingin menolak data ini?",
    confirmLabel: "Ya, Tolak",
    confirmVariant: "destructive" as const,
    requireReason: true,
  },
  delete: {
    icon: AlertCircle,
    iconColor: "text-red-500",
    title: "Hapus Data",
    description:
      "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
    confirmLabel: "Ya, Hapus",
    confirmVariant: "destructive" as const,
    requireReason: false,
  },
  confirm: {
    icon: Info,
    iconColor: "text-blue-500",
    title: "Konfirmasi",
    description: "Apakah Anda yakin ingin melanjutkan?",
    confirmLabel: "Ya, Lanjutkan",
    confirmVariant: "default" as const,
    requireReason: false,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    title: "Informasi",
    description: "",
    confirmLabel: "OK",
    confirmVariant: "default" as const,
    requireReason: false,
  },
};

export function ActionDialog({
  open,
  onOpenChange,
  type,
  title: customTitle,
  description: customDescription,
  onConfirm,
  onCancel,
  confirmLabel: customConfirmLabel,
  cancelLabel = "Batal",
  isLoading = false,
  requireReason: customRequireReason,
  reasonLabel = "Alasan",
  reasonPlaceholder = "Masukkan alasan...",
}: ActionDialogProps) {
  const [reason, setReason] = React.useState("");
  const config = typeConfig[type];
  const Icon = config.icon;

  const requireReason = customRequireReason ?? config.requireReason ?? false;
  const title = customTitle ?? config.title;
  const description = customDescription ?? config.description;
  const confirmLabel = customConfirmLabel ?? config.confirmLabel;

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      return;
    }
    await onConfirm(reason || undefined);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
    setReason("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn("mt-0.5", config.iconColor)}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {requireReason && (
          <div className="space-y-2">
            <Label htmlFor="reason">{reasonLabel}</Label>
            <Textarea
              id="reason"
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {type !== "info" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="button"
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading || (requireReason && !reason.trim())}
          >
            {isLoading ? "Memproses..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Shortcut components untuk use case umum
interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void | Promise<void>;
  onReject: (reason: string) => void | Promise<void>;
  isLoading?: boolean;
  itemName?: string;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  onApprove,
  onReject,
  isLoading,
  itemName = "data ini",
}: ApprovalDialogProps) {
  const [action, setAction] = React.useState<"approve" | "reject" | null>(null);

  const handleAction = async (
    actionType: "approve" | "reject",
    reason?: string,
  ) => {
    if (actionType === "approve") {
      await onApprove();
    } else if (actionType === "reject" && reason) {
      await onReject(reason);
    }
    setAction(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !action} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Data</DialogTitle>
            <DialogDescription>
              Pilih tindakan untuk {itemName}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setAction("reject")}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Tolak
            </Button>
            <Button
              className="flex-1"
              onClick={() => setAction("approve")}
              disabled={isLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Setujui
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {action === "approve" && (
        <ActionDialog
          open={true}
          onOpenChange={() => setAction(null)}
          type="approve"
          onConfirm={() => handleAction("approve")}
          isLoading={isLoading}
        />
      )}

      {action === "reject" && (
        <ActionDialog
          open={true}
          onOpenChange={() => setAction(null)}
          type="reject"
          onConfirm={(reason) => handleAction("reject", reason)}
          isLoading={isLoading}
          requireReason={true}
        />
      )}
    </>
  );
}
