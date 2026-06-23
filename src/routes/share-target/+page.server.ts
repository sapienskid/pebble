import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const text = formData.get('text')?.toString() || '';
    const title = formData.get('title')?.toString() || '';
    const url = formData.get('url')?.toString() || '';

    const parts = [text, title, url].filter(Boolean);
    const combined = parts.join('\n');

    if (combined) {
      redirect(302, `/?sharedText=${encodeURIComponent(combined)}`);
    }

    redirect(302, '/');
  }
};
