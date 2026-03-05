const optionalServerEnv = {
  EXTERNAL_API_BASE_URL: process.env.EXTERNAL_API_BASE_URL ?? "https://jsonplaceholder.typicode.com",
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
};

export function getRequiredEnv(key: "OPENAI_API_KEY" | "DATABASE_URL"): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const serverEnv = {
  ...optionalServerEnv,
};
