import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// A paused/unreachable project must not leave sign-in or rankings spinning forever.
export const timedFetch: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const sourceSignal = init?.signal || (typeof Request !== 'undefined' && input instanceof Request ? input.signal : undefined);
  const cancel = () => controller.abort();
  if (sourceSignal?.aborted) cancel();
  else sourceSignal?.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(cancel, 12000);
  try { return await fetch(input, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timeout); sourceSignal?.removeEventListener('abort', cancel); }
};

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) return {} as any;
  return createBrowserClient(supabaseUrl, supabaseKey, { global: { fetch: timedFetch } });
};
