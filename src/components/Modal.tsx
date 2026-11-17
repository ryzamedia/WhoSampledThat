import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onClose={onClose} className="modal">
      <div className="modal-backdrop" aria-hidden="true" />
      <div className="modal-position">
        <DialogPanel className="modal-panel">
          <div className="modal-heading">
            <DialogTitle>{title}</DialogTitle>
            <button
              className="icon-button"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
