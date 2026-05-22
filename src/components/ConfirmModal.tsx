import React from 'react';
import { Button } from './ui/Button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isLoading }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-xl shadow-lg border p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 text-destructive">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-muted-foreground text-sm">
          {message}
        </p>
        
        <div className="pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="outline" className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground" onClick={onConfirm} isLoading={isLoading}>
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}
