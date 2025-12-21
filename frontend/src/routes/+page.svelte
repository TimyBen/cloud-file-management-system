<script lang="ts">
  import ThemeToggle from '$components/ui/ThemeToggle.svelte';
</script>

<svelte:head>
  <title>CloudBox – Secure File Storage & Compliance</title>
  <meta
    name="description"
    content="CloudBox is a secure, compliant file storage platform with access control, retention policies, and audit-ready logs."
  />
</svelte:head>

<section
  class="min-h-screen grid place-items-center px-6 py-14"
  style="
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    background-image:
      radial-gradient(circle at top left,
        rgba(99, 102, 241, 0.15),
        transparent 55%);
  "
>
  <div class="absolute top-6 right-6 z-10">
    <ThemeToggle />
  </div>
  <div
    class="w-full max-w-5xl grid items-center gap-11
           lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
  >
    <!-- Left: Hero copy -->
    <div class="grid gap-6">
      <div
        class="inline-flex items-center gap-2 rounded-full border
               border-slate-300/60 dark:border-slate-400/40
               bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1 text-xs backdrop-blur-md"
        style="
          border-color: hsl(var(--border) / 0.6);
          background-color: hsl(var(--card) / 0.8);
        "
      >
        <span
          class="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.35)]"
        ></span>
        <span style="color: hsl(var(--muted-foreground))">File security • Compliance • Collaboration</span>
      </div>

      <h1
        class="text-4xl leading-tight tracking-tight sm:text-5xl
              font-semibold"
      >
        Secure file storage<br />
        built for
        <span
          class="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent"
        >
          teams & audits
        </span>
        .
      </h1>

      <p class="max-w-md text-sm" style="color: hsl(var(--muted-foreground))">
        Upload, share, and retain files with confidence. CloudBox gives you
        role-based access, automated retention policies, and full audit logs
        out of the box.
      </p>

      <div class="flex flex-wrap items-center gap-3">
        <a
          href="/auth/register"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-tr
                 from-indigo-500 to-cyan-400 px-6 py-2.5 text-sm font-medium text-white
                 shadow-lg hover:from-indigo-400 hover:to-cyan-300
                 transition-colors"
          style="
            background: linear-gradient(135deg,
              hsl(var(--primary)),
              hsl(173, 80%, 40%)
            );
            box-shadow: 0 10px 15px -3px hsl(var(--primary) / 0.3);
          "
        >
          Get started free
        </a>

        <a
          href="/auth/login"
          class="inline-flex items-center justify-center rounded-full border
                 bg-slate-50/80 dark:bg-slate-900/80 px-6 py-2.5 text-sm font-medium
                 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          style="
            border-color: hsl(var(--border));
            background-color: hsl(var(--card) / 0.8);
            color: hsl(var(--foreground));
          "
        >
          Sign in
        </a>
      </div>

      <div class="mt-1 flex flex-wrap gap-5 text-xs" style="color: hsl(var(--muted-foreground))">
        <div>
          <span class="block text-sm font-semibold" style="color: hsl(var(--foreground))">99.9%</span>
          <span class="opacity-80">Uptime</span>
        </div>
        <div>
          <span class="block text-sm font-semibold" style="color: hsl(var(--foreground))">AES-256</span>
          <span class="opacity-80">Encryption at rest</span>
        </div>
        <div>
          <span class="block text-sm font-semibold" style="color: hsl(var(--foreground))">S3</span>
          <span class="opacity-80">Backed storage</span>
        </div>
      </div>
    </div>

    <!-- Right: Fake dashboard preview -->
    <div
      class="grid gap-3 rounded-2xl border p-4 shadow-2xl"
      style="
        border-color: hsl(var(--border));
        background-color: hsl(var(--card));
        box-shadow: 0 25px 50px -12px hsl(var(--foreground) / 0.1);
      "
    >
      <div class="flex items-center justify-between text-[0.78rem]" style="color: hsl(var(--foreground))">
        <span>CloudBox Dashboard</span>

        <span
          class="inline-flex items-center gap-1 rounded-full border
                 px-2 py-0.5 text-[0.7rem]"
          style="
            border-color: hsl(142, 76%, 36% / 0.6);
            background-color: hsl(var(--card) / 0.8);
            color: hsl(var(--muted-foreground));
          "
        >
          <span class="h-2 w-2 rounded-full" style="background-color: hsl(142, 76%, 36%)"></span>
          Connected to API
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 text-[0.78rem]">
        <div
          class="grid gap-1 rounded-xl border p-3"
          style="
            border-color: hsl(var(--border));
            background-color: hsl(var(--card));
          "
        >
          <div class="text-[0.7rem]" style="color: hsl(var(--muted-foreground))">Storage used</div>
          <div class="text-sm font-semibold" style="color: hsl(var(--foreground))">12.4 GB</div>
          <div class="text-xs" style="color: hsl(var(--muted-foreground))">of 100 GB</div>
          <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full" style="background-color: hsl(var(--primary) / 0.2)">
            <div
              class="h-full w-[12.4%]"
              style="background: linear-gradient(to right, hsl(var(--primary)), hsl(173, 80%, 40%))"
            ></div>
          </div>
        </div>

        <div
          class="grid gap-1 rounded-xl border p-3"
          style="
            border-color: hsl(var(--border));
            background-color: hsl(var(--card));
          "
        >
          <div class="text-[0.7rem]" style="color: hsl(var(--muted-foreground))">Files</div>
          <div class="text-sm font-semibold" style="color: hsl(var(--foreground))">842</div>
          <div class="text-xs" style="color: hsl(var(--muted-foreground))">14 shared externally</div>
        </div>

        <div
          class="grid gap-1 rounded-xl border p-3"
          style="
            border-color: hsl(var(--border));
            background-color: hsl(var(--card));
          "
        >
          <div class="text-[0.7rem]" style="color: hsl(var(--muted-foreground))">Policies</div>
          <div class="text-sm font-semibold" style="color: hsl(var(--foreground))">5</div>
          <div class="text-xs" style="color: hsl(var(--muted-foreground))">Retention &amp; purge rules</div>
        </div>

        <div
          class="grid gap-1 rounded-xl border p-3"
          style="
            border-color: hsl(var(--border));
            background-color: hsl(var(--card));
          "
        >
          <div class="text-[0.7rem]" style="color: hsl(var(--muted-foreground))">Last activity</div>
          <div class="flex items-center gap-1.5 text-xs">
            <span class="h-1.5 w-1.5 rounded-full" style="background-color: hsl(173, 80%, 40%)"></span>
            <span class="truncate" style="color: hsl(var(--muted-foreground))">
              <span>user@example.com</span> uploaded
            </span>
          </div>
          <div class="text-xs" style="color: hsl(var(--muted-foreground))">2 minutes ago</div>
        </div>
      </div>

      <div
        class="mt-1 flex flex-wrap gap-2 border-t pt-2 text-[0.7rem]"
        style="border-color: hsl(var(--border))"
      >
        <span
          class="rounded-full border px-2 py-0.5"
          style="
            border-color: hsl(var(--border));
            background-color: hsl(var(--card));
            color: hsl(var(--muted-foreground));
          "
          >/health ✓</span
        >
        <span
          class="rounded-full border px-2 py-0.5"
          style="
            border-color: hsl(var(--border));
            background-color: hsl(var(--card));
            color: hsl(var(--muted-foreground));
          "
          >/version v1.0.0</span
        >
        <span
          class="rounded-full border px-2 py-0.5"
          style="
            border-color: hsl(var(--border));
            background-color: hsl(var(--card));
            color: hsl(var(--muted-foreground));
          "
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
      class="rounded-xl border p-4 shadow-sm"
      style="
        border-color: hsl(var(--border));
        background-color: hsl(var(--card));
      "
    >
      <h3 class="mb-1 text-sm font-semibold" style="color: hsl(var(--foreground))">
        RBAC &amp; user management
      </h3>
      <p style="color: hsl(var(--muted-foreground))">
        Promote users to <code class="rounded px-1 text-[0.75rem]" style="background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground))"
          >admin</code
        >, manage roles, and control access to files and policies from a single
        dashboard.
      </p>
    </div>

    <div
      class="rounded-xl border p-4 shadow-sm"
      style="
        border-color: hsl(var(--border));
        background-color: hsl(var(--card));
      "
    >
      <h3 class="mb-1 text-sm font-semibold" style="color: hsl(var(--foreground))">
        Retention &amp; compliance
      </h3>
      <p style="color: hsl(var(--muted-foreground))">
        Attach retention rules to files, extend retention windows, and purge
        securely when policies expire.
      </p>
    </div>

    <div
      class="rounded-xl border p-4 shadow-sm"
      style="
        border-color: hsl(var(--border));
        background-color: hsl(var(--card));
      "
    >
      <h3 class="mb-1 text-sm font-semibold" style="color: hsl(var(--foreground))">
        API-first architecture
      </h3>
      <p style="color: hsl(var(--muted-foreground))">
        Fully documented REST API for auth, files, and compliance so your UI
        always stays in sync with the backend.
      </p>
    </div>
  </div>
</section>