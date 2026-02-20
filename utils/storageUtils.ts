
// Simple obfuscation to prevent plain text storage in local storage.
// In a real-world client-side app without a backend, this is the standard "encryption" approach.
const STORAGE_KEY = 'interior_ai_api_key_v1';

export const saveApiKey = (apiKey: string) => {
  if (!apiKey) return;
  try {
    // Basic encoding to obscure the key
    const encrypted = btoa(apiKey);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (e) {
    console.error("Failed to save API key", e);
  }
};

export const getApiKey = (): string | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    // Decode the key
    return atob(encrypted);
  } catch (e) {
    console.error("Failed to load API key", e);
    return null;
  }
};

export const clearApiKey = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const hasStoredApiKey = (): boolean => {
  return !!getApiKey();
};
