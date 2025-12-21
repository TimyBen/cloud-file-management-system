// src/routes/dashboard/files/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import {
  listFiles,
  uploadFile,
  deleteFile
} from '$lib/api';

export const load: PageServerLoad = async () => {
  try {
    const files = await listFiles();
    return { files };
  } catch (e) {
    console.error('load files failed', e);
    return { files: [] };
  }
};

export const actions: Actions = {
  upload: async ({ request }) => {
    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return fail(400, { message: 'No file selected' });
    }

    try {
      const created = await uploadFile(file);
      return { success: true, file: created };
    } catch (e) {
      console.error('upload failed', e);
      return fail(500, { message: 'Upload failed' });
    }
  },

  delete: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id');

    if (!id || typeof id !== 'string') {
      return fail(400, { message: 'Invalid file id' });
    }

    try {
      await deleteFile(id);
      return { success: true };
    } catch (e) {
      console.error('delete failed', e);
      return fail(500, { message: 'Delete failed' });
    }
  }
};
