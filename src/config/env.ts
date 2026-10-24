import 'dotenv/config';

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  uiBaseUrl: required('UI_BASE_URL', 'https://www.saucedemo.com'),
  apiBaseUrl: required('API_BASE_URL', 'https://restful-booker.herokuapp.com'),
  apiUser: required('API_USERNAME'),
  apiPassword: required('API_PASSWORD'),
};
