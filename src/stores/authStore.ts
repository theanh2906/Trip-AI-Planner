import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  guestPromptCount: number;
  isInitializing: boolean;
  isAuthForced: boolean;
  
  setUser: (user: User | null) => void;
  setIsAuthForced: (forced: boolean) => void;
  incrementGuestPrompt: () => void;
  resetGuestPrompts: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      guestPromptCount: 0,
      isInitializing: true,
      isAuthForced: false,

      setUser: (user) => set({ user, isInitializing: false, isAuthForced: false }),

      setIsAuthForced: (forced) => set({ isAuthForced: forced }),
      
      incrementGuestPrompt: () => {
        set((state) => ({ 
          guestPromptCount: Math.min(state.guestPromptCount + 1, 10) // Cap it just in case
        }));
      },

      resetGuestPrompts: () => set({ guestPromptCount: 0 }),

      logout: async () => {
        await signOut(auth);
        set({ user: null });
      },
    }),
    {
      name: 'trip-auth-storage',
      partialize: (state) => ({ guestPromptCount: state.guestPromptCount }),
    }
  )
);

// Subscribe to auth state changes
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
  });
}
