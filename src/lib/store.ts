// FILE: lib/store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AnimationSpeeds {
  listLoad: number;
  filter: number;
}

interface SensitiveFields {
  numeroProcesso: boolean;
  nomesDasPartes: boolean;
  etiquetaNome: boolean;
  emailNotificacao: boolean; // Adicionado
}

interface SettingsState {
  animationSpeeds: AnimationSpeeds;
  blurLevel: number;
  sensitiveFields: SensitiveFields;
  itemsPerPage: number; // Adicionado
  setAnimationSpeed: (type: keyof AnimationSpeeds, speed: number) => void;
  setBlurLevel: (level: number) => void;
  toggleSensitiveField: (field: keyof SensitiveFields) => void;
  setItemsPerPage: (items: number) => void; // Adicionado
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      animationSpeeds: {
        listLoad: 1,
        filter: 0.5,
      },
      blurLevel: 2,
      sensitiveFields: {
        numeroProcesso: true,
        nomesDasPartes: true,
        etiquetaNome: false,
        emailNotificacao: true, // Adicionado
      },
      itemsPerPage: 10, // Adicionado
      setAnimationSpeed: (type, speed) =>
        set((state) => ({
          animationSpeeds: { ...state.animationSpeeds, [type]: speed },
        })),
      setBlurLevel: (level) => set({ blurLevel: level }),
      toggleSensitiveField: (field) =>
        set((state) => ({
          sensitiveFields: {
            ...state.sensitiveFields,
            [field]: !state.sensitiveFields[field],
          },
        })),
      setItemsPerPage: (items) => set({ itemsPerPage: items }), // Adicionado
    }),
    {
      name: 'juscheck-settings-storage-v3', // Versão do storage atualizada
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
