/**
 * auth.service.ts
 * Clean service layer for authentication operations.
 * Components and stores MUST use this — never call Supabase directly.
 *
 * Architecture: component → hook/store → auth.service → supabase
 */
export {
  supabaseRegister    as register,
  supabaseLogin       as login,
  supabaseLogout      as logout,
  supabaseGetCurrentUser as getCurrentUser,
  supabaseSendPasswordReset as sendPasswordReset,
  supabaseUpdatePassword    as updatePassword,
  supabaseUpdateProfile     as updateProfile,
  supabaseUpdateSettings    as updateSettings,
  supabaseUpdateProgress    as updateProgress,
  supabaseCheckUsername     as checkUsername,
} from '@/lib/supabase-auth';
