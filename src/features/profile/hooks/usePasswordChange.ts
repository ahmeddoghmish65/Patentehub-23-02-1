import { useState, useCallback } from 'react';
import { changePassword } from '../services/profileService';

export function usePasswordChange(userId: string) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const reset = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg('');
  }, []);

  const handleChangePassword = useCallback(async () => {
    setPasswordMsg('');
    if (!currentPassword) { setPasswordMsg('password_required'); return; }
    if (!newPassword || newPassword.length < 6) { setPasswordMsg('password_short'); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg('password_mismatch_long'); return; }

    const result = await changePassword(userId, currentPassword, newPassword);
    if (!result.ok) {
      setPasswordMsg(result.error === 'wrong_password' ? 'wrong_password' : 'error_occurred');
      return;
    }
    setPasswordMsg('password_changed');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [userId, currentPassword, newPassword, confirmPassword]);

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordMsg,
    reset,
    handleChangePassword,
  };
}
