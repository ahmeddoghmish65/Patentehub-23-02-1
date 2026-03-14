import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store';
import {
  getProfileChangeDates,
  saveProfileEdit,
  checkUsernameAvailability,
} from '../services/profileService';
import type { ProfileEditForm, UsernameStatus } from '../types/profile.types';

const DEFAULT_FORM: ProfileEditForm = {
  firstName: '', lastName: '', username: '', bio: '',
  email: '', phone: '', phoneCode: '+39',
  gender: '', birthDate: '', province: '', italianLevel: '',
  privacyHideStats: false,
};

export function useUpdateProfile() {
  const { user } = useAuthStore();

  const [editForm, setEditForm] = useState<ProfileEditForm>(DEFAULT_FORM);
  const [changeDates, setChangeDates] = useState<{ name?: string; username?: string }>({});
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [phoneError, setPhoneError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const openEditPage = useCallback(async () => {
    if (!user) return;
    const nameParts = user.name.split(' ');
    const storedBio = user.bio || localStorage.getItem(`bio_${user.id}`) || '';
    setEditForm({
      firstName: user.firstName || nameParts[0] || '',
      lastName: user.lastName || nameParts.slice(1).join(' ') || '',
      username: user.username || '',
      bio: storedBio,
      email: user.email,
      phone: user.phone || '',
      phoneCode: user.phoneCode || '+39',
      gender: user.gender || '',
      birthDate: user.birthDate || '',
      province: user.province || '',
      italianLevel: user.italianLevel || '',
      privacyHideStats: user.privacyHideStats || false,
    });
    const dates = await getProfileChangeDates(user.id);
    setChangeDates({ name: dates.nameChangeDate, username: dates.usernameChangeDate });
    setSaveMsg('');
    setPhoneError('');
    setUsernameStatus('idle');
  }, [user]);

  const handleUsernameChange = useCallback(
    async (val: string) => {
      if (!user) return;
      setEditForm(f => ({ ...f, username: val }));
      if (!val || val === user.username) { setUsernameStatus('idle'); return; }
      if (!/^[a-zA-Z0-9_.]{3,20}$/.test(val)) { setUsernameStatus('invalid'); return; }
      setUsernameStatus('checking');
      const available = await checkUsernameAvailability(val, user.id);
      setUsernameStatus(available ? 'ok' : 'taken');
    },
    [user],
  );

  const handlePhoneChange = useCallback((val: string) => {
    setEditForm(f => ({ ...f, phone: val }));
    const raw = val.replace(/\D/g, '');
    if (val && (raw.length < 7 || raw.length > 15)) setPhoneError('phone_invalid');
    else setPhoneError('');
  }, []);

  const handleSaveEdit = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    setSaveMsg('');

    // Client-side phone validation
    const rawPhone = editForm.phone.replace(/\D/g, '');
    if (editForm.phone && (rawPhone.length < 7 || rawPhone.length > 15)) {
      setPhoneError('phone_invalid_long');
      return false;
    }
    setPhoneError('');

    // Client-side username validation before save
    if (editForm.username && editForm.username !== user.username) {
      if (usernameStatus === 'taken') { setSaveMsg('username_taken'); return false; }
      if (!/^[a-zA-Z0-9_.]{3,20}$/.test(editForm.username)) { setSaveMsg('username_invalid'); return false; }
    }

    const result = await saveProfileEdit(
      user.id,
      {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        username: editForm.username,
        bio: editForm.bio,
        email: editForm.email,
        phone: editForm.phone,
        phoneCode: editForm.phoneCode,
        gender: editForm.gender,
        birthDate: editForm.birthDate,
        province: editForm.province,
        italianLevel: editForm.italianLevel,
        privacyHideStats: editForm.privacyHideStats,
      },
      user.name,
      user.username,
    );

    if (!result.ok) {
      setSaveMsg(result.error ?? 'error');
      return false;
    }

    setSaveMsg('saved');
    return true;
  }, [user, editForm, usernameStatus]);

  return {
    editForm,
    setEditForm,
    changeDates,
    usernameStatus,
    phoneError,
    saveMsg,
    setSaveMsg,
    openEditPage,
    handleUsernameChange,
    handlePhoneChange,
    handleSaveEdit,
  };
}
