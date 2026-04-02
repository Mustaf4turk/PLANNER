'use client';

import { useState, useCallback } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const VARIANTS = {
  danger: {
    icon: (
      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    iconBg: 'bg-red-500/15 ring-red-500/20',
    button: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500',
  },
  warning: {
    icon: (
      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    iconBg: 'bg-amber-500/15 ring-amber-500/20',
    button: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
  },
  info: {
    icon: (
      <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-brand-500/15 ring-brand-500/20',
    button: 'bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500',
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Emin misiniz?',
  message = 'Bu işlem geri alınamaz.',
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const style = VARIANTS[variant];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-scale border border-white/10">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-14 h-14 rounded-2xl ${style.iconBg} ring-1 flex items-center justify-center`}>
            {style.icon}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all font-medium text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 ${style.button} text-white font-semibold rounded-xl transition-all hover:shadow-glow text-sm disabled:opacity-50`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Bekleyin...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom hook for easy usage
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
  }>({ onConfirm: () => {} });
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
  }) => {
    setConfig(options);
    setIsOpen(true);
    setLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await config.onConfirm();
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  }, [config]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setIsOpen(false);
    }
  }, [loading]);

  const modalProps: ConfirmModalProps = {
    isOpen,
    onClose: handleClose,
    onConfirm: handleConfirm,
    title: config.title,
    message: config.message,
    confirmText: config.confirmText,
    cancelText: config.cancelText,
    variant: config.variant,
    loading,
  };

  return { confirm, modalProps };
}
