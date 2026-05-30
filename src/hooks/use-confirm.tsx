import { useState } from "react";
import { ConfirmModal } from "@/components/shared/confirm-modal";

export function useConfirm() {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
  const [config, setConfig] = useState({ title: "", description: "" });

  const confirm = (title: string, description?: string) => new Promise<boolean>((resolve) => {
    setConfig({ 
      title, 
      description: description || "This action cannot be undone." 
    });
    setPromise({ resolve });
  });

  const handleClose = () => {
    promise?.resolve(false);
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    setPromise(null);
  };

  const ConfirmationModal = () => (
    <ConfirmModal
      isOpen={promise !== null}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={config.title}
      description={config.description}
    />
  );

  return [ConfirmationModal, confirm] as const;
}
