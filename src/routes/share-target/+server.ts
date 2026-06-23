import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET({ url }: RequestEvent) {
  const text = url.searchParams.get('text') || '';
  const title = url.searchParams.get('title') || '';
  const sharedUrl = url.searchParams.get('url') || '';
  const combined = [text, title, sharedUrl].filter(Boolean).join('\n');
  if (combined) {
    redirect(302, `/?sharedText=${encodeURIComponent(combined)}`);
  }
  redirect(302, '/');
}