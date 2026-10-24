import 'dotenv/config';

/**
 * Reads a setting from the environment. Empty values count as missing, because
 * CI passes an empty string when a repository secret is not defined.
 */
function setting(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : fallback;
}

// The defaults are the demo values the practice sites publish for everyone.
// Override them with environment variables (or CI secrets) when needed.
export const env = {
  uiBaseUrl: setting('UI_BASE_URL', 'https://www.saucedemo.com'),
  apiBaseUrl: setting('API_BASE_URL', 'https://restful-booker.herokuapp.com'),
  apiUser: setting('API_USERNAME', 'admin'),
  apiPassword: setting('API_PASSWORD', 'password123'),
};
