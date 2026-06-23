import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
  const text = url.searchParams.get('text') || '';
  const title = url.searchParams.get('title') || '';
  const sharedUrl = url.searchParams.get('url') || '';

  const parts = [text, title, sharedUrl].filter(Boolean);
  const combined = parts.join('\n');

  if (combined) {
    redirect(302, `/?sharedText=${encodeURIComponent(combined)}`);
  }

  redirect(302, '/');
};
