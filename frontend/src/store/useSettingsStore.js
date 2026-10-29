import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LANGUAGE, LANGUAGE, STORAGE_KEYS } from '../config/constants';

const LANGUAGES = Object.values(LANGUAGE);

// UI settings, persisted in localStorage. More settings (volume, timing bar) come in later phases.
export const useSettingsStore = create(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => {
        if (LANGUAGES.includes(language)) set({ language });
      },
    }),
    { name: STORAGE_KEYS.SETTINGS, version: 1 },
  ),
);
