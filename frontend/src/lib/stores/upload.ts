import { writable, get } from 'svelte/store';

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'error' | 'canceled';

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  progress: number; // 0..100
  speedBps?: number; // optional
  etaSec?: number;   // optional
  error?: string;
  startedAt?: number;
  finishedAt?: number;
}

function uid() {
  return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatEta(seconds?: number) {
  if (seconds === undefined || seconds === null || !Number.isFinite(seconds)) return '';
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`;
  const m = Math.round(seconds / 60);
  return `${m}m`;
}

function createUploadStore() {
  const { subscribe, update, set } = writable<{
    open: boolean;
    items: UploadItem[];
  }>({ open: false, items: [] });

  // Keep XHR references so we can cancel
  const xhrMap = new Map<string, XMLHttpRequest>();

  function open() {
    update((s) => ({ ...s, open: true }));
  }
  function close() {
    update((s) => ({ ...s, open: false }));
  }
  function toggle() {
    update((s) => ({ ...s, open: !s.open }));
  }
  function clearFinished() {
    update((s) => ({
      ...s,
      items: s.items.filter((i) => i.status === 'uploading' || i.status === 'queued')
    }));
  }

  function enqueue(file: File) {
    const item: UploadItem = {
      id: uid(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'queued',
      progress: 0
    };

    update((s) => ({ ...s, open: true, items: [item, ...s.items] }));
    return item.id;
  }

  function setStatus(id: string, patch: Partial<UploadItem>) {
    update((s) => ({
      ...s,
      items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it))
    }));
  }

  function cancel(id: string) {
    const xhr = xhrMap.get(id);
    if (xhr) {
      xhr.abort();
      xhrMap.delete(id);
    }
    setStatus(id, { status: 'canceled', error: 'Canceled', finishedAt: Date.now() });
  }

  async function uploadSingle(params: {
    file: File;
    apiBase: string;
    token: string;
    mode?: 'new' | 'duplicate' | 'update';
    onUploaded?: (serverFile: any) => void;
  }) {
    const { file, apiBase, token, mode = 'new', onUploaded } = params;

    const id = enqueue(file);
    setStatus(id, { status: 'uploading', startedAt: Date.now(), progress: 0 });

    const xhr = new XMLHttpRequest();
    xhrMap.set(id, xhr);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('mode', mode);

    // Basic speed/eta estimation
    let lastLoaded = 0;
    let lastTs = Date.now();

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;

      const now = Date.now();
      const loaded = e.loaded;
      const total = e.total;

      const progress = Math.round((loaded / total) * 100);

      const dt = Math.max(1, (now - lastTs) / 1000);
      const dLoaded = Math.max(0, loaded - lastLoaded);
      const speedBps = dLoaded / dt;
      const remaining = Math.max(0, total - loaded);
      const etaSec = speedBps > 0 ? remaining / speedBps : undefined;

      lastLoaded = loaded;
      lastTs = now;

      setStatus(id, { progress, speedBps, etaSec });
    };

    xhr.onerror = () => {
      xhrMap.delete(id);
      setStatus(id, {
        status: 'error',
        error: 'Network error',
        finishedAt: Date.now()
      });
    };

    xhr.onabort = () => {
      xhrMap.delete(id);
      // cancel() already sets state, but abort could happen elsewhere too
      setStatus(id, { status: 'canceled', error: 'Canceled', finishedAt: Date.now() });
    };

    xhr.onload = () => {
      xhrMap.delete(id);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText || '{}');
          const serverFile = data?.file ?? data;

          setStatus(id, { status: 'done', progress: 100, finishedAt: Date.now() });

          if (serverFile && onUploaded) onUploaded(serverFile);
        } catch (e: any) {
          setStatus(id, {
            status: 'error',
            error: 'Upload succeeded but response parsing failed',
            finishedAt: Date.now()
          });
        }
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const err = JSON.parse(xhr.responseText || '{}');
          msg = err?.message || msg;
        } catch {}
        setStatus(id, { status: 'error', error: msg, finishedAt: Date.now() });
      }
    };

    xhr.open('POST', `${apiBase}/files/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(fd);

    return id;
  }

  async function uploadMultiple(params: {
    files: FileList | File[];
    apiBase: string;
    token: string;
    onUploadedMany?: (serverFiles: any[]) => void;
  }) {
    // For true per-file progress like Google Drive,
    // we upload each file individually (parallel or sequential).
    const { files: input, apiBase, token, onUploadedMany } = params;
    const list = Array.isArray(input) ? input : Array.from(input);

    const uploadedServerFiles: any[] = [];

    // Sequential uploads reduce pressure and make UX predictable.
    for (const f of list) {
      await uploadSingle({
        file: f,
        apiBase,
        token,
        mode: 'new',
        onUploaded: (sf) => uploadedServerFiles.push(sf)
      });
    }

    if (onUploadedMany) onUploadedMany(uploadedServerFiles);
  }

  return {
    subscribe,
    open,
    close,
    toggle,
    clearFinished,
    cancel,
    uploadSingle,
    uploadMultiple,
    formatEta
  };
}

export const uploadQueue = createUploadStore();
export const formatUploadEta = createUploadStore().formatEta; // unused helper, kept if you want
