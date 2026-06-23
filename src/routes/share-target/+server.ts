import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

function extractShared(formData: FormData): string {
  const text = formData.get('text')?.toString() || '';
  const title = formData.get('title')?.toString() || '';
  const url = formData.get('url')?.toString() || '';
  return [text, title, url].filter(Boolean).join('\n');
}

export async function POST({ request }: RequestEvent) {
  const formData = await request.formData();
  const combined = extractShared(formData);
  if (combined) {
    redirect(302, `/?sharedText=${encodeURIComponent(combined)}`);
  }
  redirect(302, '/');
}

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