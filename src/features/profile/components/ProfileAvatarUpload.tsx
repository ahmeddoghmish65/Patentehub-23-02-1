import React, { useRef, useCallback } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { uploadAvatar } from '../services/profileService';

interface ProfileAvatarUploadProps {
  avatar: string;
  name: string;
  onAvatarChange: (dataUrl: string) => void;
  onAvatarDelete: () => void;
  onFileTooLarge?: () => void;
  /** If true, renders the edit-page variant (banner style). Default is the main profile hover style. */
  editVariant?: boolean;
}

export const ProfileAvatarUpload = React.memo(function ProfileAvatarUpload({
  avatar,
  name,
  onAvatarChange,
  onAvatarDelete,
  onFileTooLarge,
  editVariant = false,
}: ProfileAvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const result = await uploadAvatar(file, onAvatarChange);
      if (!result.ok && result.error === 'file_too_large') onFileTooLarge?.();
      // Reset so the same file can be re-selected
      e.target.value = '';
    },
    [onAvatarChange, onFileTooLarge],
  );

  if (editVariant) {
    return (
      <div className="relative shrink-0">
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
          />
        ) : (
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border-4 border-white/30 shadow-xl">
            <span className="text-3xl font-black text-white">{name.charAt(0)}</span>
          </div>
        )}
        <button
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-surface-200 rounded-full flex items-center justify-center shadow-lg hover:bg-surface-50 dark:hover:bg-surface-300 transition-colors"
          onClick={() => fileRef.current?.click()}
          type="button"
        >
          <Icon name="camera_alt" size={14} className="text-primary-600" />
        </button>
        {avatar && (
          <button
            className="absolute -top-1 -left-1 w-6 h-6 bg-danger-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:bg-danger-600 transition-colors"
            onClick={onAvatarDelete}
            type="button"
          >
            <Icon name="close" size={12} className="text-white" />
          </button>
        )}
      </div>
    );
  }

  // Main profile card variant (hover overlay)
  return (
    <div className="relative group shrink-0">
      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-20 h-20 rounded-2xl object-cover shadow-lg cursor-pointer"
          onClick={() => fileRef.current?.click()}
        />
      ) : (
        <div
          className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
        </div>
      )}
      <div
        className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <Icon name="camera_alt" size={22} className="text-white" />
      </div>
      {avatar && (
        <button
          className="absolute -top-1 -left-1 w-6 h-6 bg-danger-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-danger-600"
          onClick={onAvatarDelete}
          type="button"
        >
          <Icon name="close" size={14} className="text-white" />
        </button>
      )}
    </div>
  );
});
