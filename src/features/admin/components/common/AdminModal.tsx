/**
 * AdminModal — generic overlay modal wrapper.
 */
import React from 'react';
import { Icon } from '@/components/ui/Icon';

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const AdminModal = React.memo(function AdminModal({
  title,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: AdminModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-6 w-full ${maxWidth} my-8 max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-surface-900">{title}</h3>
          <button
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 transition-colors"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
});
