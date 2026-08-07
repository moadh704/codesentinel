/**
 * Browser-stored AI provider keys (Settings page).
 * Used when creating a scan so the API can call the selected provider.
 * Keys never leave the user's browser except on authenticated scan requests.
 */

const STORAGE = {
  deepseek: 'api_deepseek',
  claude: 'api_claude',
  gpt4: 'api_openai',
  gemini: 'api_gemini',
  groq: 'api_groq',
};

export const PROVIDER_LABELS = {
  deepseek: 'DeepSeek',
  claude: 'Claude (Anthropic)',
  gpt4: 'GPT-4o (OpenAI)',
  gemini: 'Gemini (Google)',
  groq: 'Groq (Llama)',
};

export function loadApiKeys() {
  return {
    deepseek: localStorage.getItem(STORAGE.deepseek) || '',
    claude: localStorage.getItem(STORAGE.claude) || '',
    gpt4: localStorage.getItem(STORAGE.gpt4) || '',
    gemini: localStorage.getItem(STORAGE.gemini) || '',
    groq: localStorage.getItem(STORAGE.groq) || '',
  };
}

export function saveApiKeys(keys) {
  Object.entries(STORAGE).forEach(([provider, storageKey]) => {
    const value = (keys[provider] || '').trim();
    if (value) {
      localStorage.setItem(storageKey, value);
    } else {
      localStorage.removeItem(storageKey);
    }
  });
}

/** Key for the selected scan provider, or empty string if missing. */
export function getApiKeyForProvider(provider) {
  const storageKey = STORAGE[provider];
  if (!storageKey) return '';
  return (localStorage.getItem(storageKey) || '').trim();
}

export function hasApiKeyForProvider(provider) {
  return Boolean(getApiKeyForProvider(provider));
}
