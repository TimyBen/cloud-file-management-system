<script lang="ts">
  export let form;
</script>

<!-- HERO TOP AREA -->
<section
  class="flex flex-col items-center justify-center text-center p-6"
  style="
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  "
>
  <a
    href="/"
    class="text-3xl font-bold mb-2"
    style="
      background: linear-gradient(to right,
        hsl(var(--primary)),
        hsl(173, 80%, 40%)
      );
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    "
  >
    CloudStore AI
  </a>
  <p
    class="max-w-lg text-sm"
    style="color: hsl(var(--muted-foreground))"
  >
    A modern AI-powered cloud file management platform.
  </p>
</section>

<!-- LOGIN WRAPPER -->
<div
  class="min-h-screen flex items-center justify-center px-4"
  style="background-color: hsl(var(--background))"
>
  <form
    method="POST"
    class="w-full max-w-md rounded-2xl border p-6 shadow-xl space-y-4"
    style="
      border-color: hsl(var(--border));
      background-color: hsl(var(--card));
      box-shadow: 0 25px 50px -12px hsl(var(--foreground) / 0.1);
    "
  >
    <h1
      class="text-xl font-semibold text-center"
      style="color: hsl(var(--foreground))"
    >
      Sign In
    </h1>

    {#if form?.error}
      <p
        class="rounded-md border px-3 py-2 text-xs"
        style="
          background-color: hsl(0, 84%, 60% / 0.1);
          border-color: hsl(0, 84%, 60% / 0.4);
          color: hsl(0, 84%, 85%);
        "
      >
        {form.error}
      </p>
    {/if}

    <!-- EMAIL -->
    <div class="space-y-1 text-xs">
      <label
        class="block"
        style="color: hsl(var(--foreground))"
      >
        Email
      </label>
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        required
        class="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
        style="
          border-color: hsl(var(--input));
          background-color: hsl(var(--input));
          color: hsl(var(--foreground));
        "
        on:focus={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--ring))';
          e.currentTarget.style.boxShadow = '0 0 0 1px hsl(var(--ring))';
        }}
        on:blur={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--input))';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>

    <!-- PASSWORD -->
    <div class="space-y-1 text-xs">
      <label
        class="block"
        style="color: hsl(var(--foreground))"
      >
        Password
      </label>
      <input
        type="password"
        name="password"
        placeholder="••••••••"
        required
        class="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
        style="
          border-color: hsl(var(--input));
          background-color: hsl(var(--input));
          color: hsl(var(--foreground));
        "
        on:focus={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--ring))';
          e.currentTarget.style.boxShadow = '0 0 0 1px hsl(var(--ring))';
        }}
        on:blur={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--input))';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>

    <!-- SUBMIT BUTTON -->
    <button
      type="submit"
      class="w-full rounded-full py-2 text-xs font-medium text-white transition-colors"
      style="
        background: linear-gradient(135deg,
          hsl(var(--primary)),
          hsl(173, 80%, 40%)
        );
        box-shadow: 0 10px 15px -3px hsl(var(--primary) / 0.3);
      "
      on:mouseenter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, hsl(var(--primary) / 0.9), hsl(173, 80%, 40% / 0.9))';
      }}
      on:mouseleave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, hsl(var(--primary)), hsl(173, 80%, 40%))';
      }}
    >
      Login
    </button>

    <p
      class="text-center text-[0.7rem]"
      style="color: hsl(var(--muted-foreground))"
    >
      Don't have an account?
      <a
        href="/auth/register"
        class="hover:underline"
        style="color: hsl(173, 80%, 40%)"
        on:mouseenter={(e) => e.currentTarget.style.color = 'hsl(173, 80%, 50%)'}
        on:mouseleave={(e) => e.currentTarget.style.color = 'hsl(173, 80%, 40%)'}
      >
        Create one
      </a>
    </p>
  </form>
</div>