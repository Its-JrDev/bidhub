import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UiPreferencesState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'ui-preferences-storage',
    }
  )
);
