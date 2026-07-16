import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
};

let cachedConfig: SupabaseConfig | null = null;

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf8');
    const values: Record<string, string> = {};

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) continue;

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim();
      values[key] = value;
    }

    return values;
  } catch {
    return {};
  }
}

export function getSupabaseConfig(): SupabaseConfig {
  if (cachedConfig) return cachedConfig;

  const envFile = loadEnvFile();
  cachedConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || envFile.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      envFile.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      envFile.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || envFile.SUPABASE_SERVICE_ROLE_KEY || '',
  };

  return cachedConfig;
}
