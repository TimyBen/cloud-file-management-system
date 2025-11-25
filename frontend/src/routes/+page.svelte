<script lang="ts">
  // If you're using Tailwind, you usually don't need to import app.css here
  // unless you have custom globals.
  // import '../app.css';
</script>

<svelte:head>
  <title>CloudBox – Secure File Storage & Compliance</title>
  <meta
    name="description"
    content="CloudBox is a secure, compliant file storage platform with access control, retention policies, and audit-ready logs."
  />
</svelte:head>

<section
  class="min-h-screen grid place-items-center px-6 py-14 bg-slate-950 text-slate-50
         bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.16),transparent_55%)]"
>
  <div
    class="w-full max-w-5xl grid items-center gap-11
           lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
  >
    <!-- Left: Hero copy -->
    <div class="grid gap-6">
      <div
        class="inline-flex items-center gap-2 rounded-full border border-slate-400/40
               bg-slate-900/80 px-3 py-1 text-xs backdrop-blur-md"
      >
        <span
          class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.35)]"
        ></span>
        <span>File security • Compliance • Collaboration</span>
      </div>

      <h1
        class="text-4xl leading-tight tracking-tight sm:text-5xl
               font-semibold"
      >
        Secure file storage<br />
        built for
        <span
          class="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent"
        >
          teams & audits
        </span>
        .
      </h1>

      <p class="max-w-md text-sm text-slate-200/80">
        Upload, share, and retain files with confidence. CloudBox gives you
        role-based access, automated retention policies, and full audit logs
        out of the box.
      </p>

      <div class="flex flex-wrap items-center gap-3">
        <a
          href="/auth/register"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-tr
                 from-indigo-500 to-cyan-400 px-6 py-2.5 text-sm font-medium text-white
                 shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-cyan-300
                 transition-colors"
        >
          Get started free
        </a>

        <a
          href="/auth/login"
          class="inline-flex items-center justify-center rounded-full border border-slate-500/60
                 bg-slate-900/80 px-6 py-2.5 text-sm font-medium text-slate-100
                 hover:bg-slate-800 transition-colors"
        >
          Sign in
        </a>
      </div>

      <div class="mt-1 flex flex-wrap gap-5 text-xs text-slate-200/80">
        <div>
          <span class="block text-sm font-semibold text-slate-50">99.9%</span>
          <span class="opacity-80">Uptime</span>
        </div>
        <div>
          <span class="block text-sm font-semibold text-slate-50">AES-256</span>
          <span class="opacity-80">Encryption at rest</span>
        </div>
        <div>
          <span class="block text-sm font-semibold text-slate-50">S3</span>
          <span class="opacity-80">Backed storage</span>
        </div>
      </div>
    </div>

    <!-- Right: Fake dashboard preview -->
    <div
      class="grid gap-3 rounded-2xl border border-slate-500/40
             bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.95),#020617)]
             p-4 shadow-2xl shadow-slate-950/90"
    >
      <div class="flex items-center justify-between text-[0.78rem] text-slate-100/90">
        <span>CloudBox Dashboard</span>

        <span
          class="inline-flex items-center gap-1 rounded-full border border-emerald-400/60
                 bg-slate-900/80 px-2 py-0.5 text-[0.7rem]"
        >
          <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          Connected to API
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 text-[0.78rem]">
        <div
          class="grid gap-1 rounded-xl border border-slate-900 bg-slate-900/95 p-3"
        >
          <div class="text-[0.7rem] text-slate-300/80">Storage used</div>
          <div class="text-sm font-semibold text-slate-50">12.4 GB</div>
          <div class="text-xs text-slate-300/80">of 100 GB</div>
          <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-indigo-900/70">
            <div
              class="h-full w-[12.4%] bg-gradient-to-r from-indigo-400 to-cyan-300"
            ></div>
          </div>
        </div>

        <div
          class="grid gap-1 rounded-xl border border-slate-900 bg-slate-900/95 p-3"
        >
          <div class="text-[0.7rem] text-slate-300/80">Files</div>
          <div class="text-sm font-semibold text-slate-50">842</div>
          <div class="text-xs text-slate-300/80">14 shared externally</div>
        </div>

        <div
          class="grid gap-1 rounded-xl border border-slate-900 bg-slate-900/95 p-3"
        >
          <div class="text-[0.7rem] text-slate-300/80">Policies</div>
          <div class="text-sm font-semibold text-slate-50">5</div>
          <div class="text-xs text-slate-300/80">Retention &amp; purge rules</div>
        </div>

        <div
          class="grid gap-1 rounded-xl border border-slate-900 bg-slate-900/95 p-3"
        >
          <div class="text-[0.7rem] text-slate-300/80">Last activity</div>
          <div class="flex items-center gap-1.5 text-xs">
            <span class="h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
            <span class="truncate">
              <span class="text-slate-200/90">user@example.com</span> uploaded
              <strong class="font-semibold"> contract-q4.pdf</strong>
            </span>
          </div>
          <div class="text-xs text-slate-300/80">2 minutes ago</div>
        </div>
      </div>

      <div
        class="mt-1 flex flex-wrap gap-2 border-t border-slate-900 pt-2 text-[0.7rem]"
      >
        <span
          class="rounded-full border border-slate-500/60 bg-slate-900/90 px-2 py-0.5"
          >/health ✓</span
        >
        <span
          class="rounded-full border border-slate-500/60 bg-slate-900/90 px-2 py-0.5"
          >/version v1.0.0</span
        >
        <span
          class="rounded-full border border-slate-500/60 bg-slate-900/90 px-2 py-0.5"
          >/status ok</span
        >
      </div>
    </div>
  </div>

  <!-- Simple feature strip -->
  <div
    class="mt-10 w-full max-w-5xl grid gap-5 text-[0.82rem]
           md:grid-cols-3"
  >
    <div
      class="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm"
    >
      <h3 class="mb-1 text-sm font-semibold text-slate-50">
        RBAC &amp; user management
      </h3>
      <p class="text-slate-200/80">
        Promote users to <code class="rounded bg-slate-800 px-1 text-[0.75rem]"
          >admin</code
        >, manage roles, and control access to files and policies from a single
        dashboard.
      </p>
    </div>

    <div
      class="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm"
    >
      <h3 class="mb-1 text-sm font-semibold text-slate-50">
        Retention &amp; compliance
      </h3>
      <p class="text-slate-200/80">
        Attach retention rules to files, extend retention windows, and purge
        securely when policies expire.
      </p>
    </div>

    <div
      class="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm"
    >
      <h3 class="mb-1 text-sm font-semibold text-slate-50">
        API-first architecture
      </h3>
      <p class="text-slate-200/80">
        Fully documented REST API for auth, files, and compliance so your UI
        always stays in sync with the backend.
      </p>
    </div>
  </div>
</section>
