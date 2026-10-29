import { useCallback } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { translate } from './translate';

// Returns t(key, params) bound to the current UI language.
export function useT() {
  const language = useSettingsStore((state) => state.language);
  return useCallback((key, params) => translate(language, key, params), [language]);
}
