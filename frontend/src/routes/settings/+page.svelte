<script lang="ts">
  import ThemeToggle from '$components/ui/ThemeToggle.svelte';
  import { auth } from '$lib/stores/auth';

  let activeTab: 'profile' | 'security' | 'notifications' | 'api' | 'billing' = 'profile';

  // Settings state
  let profileForm = {
    displayName: '',
    email: '',
    company: '',
    jobTitle: ''
  };

  let securityForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  };

  let notificationSettings = {
    emailAlerts: true,
    desktopNotifications: false,
    fileUploads: true,
    shares: true,
    securityAlerts: true,
    weeklyDigest: false
  };

  let apiSettings = {
    apiKey: '••••••••••••••••',
    webhookUrl: '',
    ipWhitelist: ''
  };

  let billingInfo = {
    plan: 'Professional',
    storageUsed: '12.4 GB',
    storageTotal: '100 GB',
    nextBilling: '2024-04-15',
    invoices: [
      { id: 'INV-001', date: '2024-03-15', amount: '$29.00', status: 'paid' },
      { id: 'INV-002', date: '2024-02-15', amount: '$29.00', status: 'paid' }
    ]
  };

  $: user = $auth?.user;

  // Load user data
  $: if (user) {
    profileForm = {
      displayName: user.display_name || '',
      email: user.email || '',
      company: user.company || '',
      jobTitle: user.job_title || ''
    };
  }

  function saveProfile() {
    console.log('Saving profile:', profileForm);
    // API call to save profile
  }

  function changePassword() {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Changing password');
    // API call to change password
  }

  function generateApiKey() {
    console.log('Generating new API key');
    // API call to generate new key
  }

  function copyApiKey() {
    navigator.clipboard.writeText('sk_live_••••••••••••••••');
    alert('API key copied to clipboard');
  }

  function downloadInvoice(invoiceId: string) {
    console.log('Downloading invoice:', invoiceId);
  }
</script>

<svelte:head>
  <title>Settings – CloudBox</title>
</svelte:head>

<div class="min-h-screen" style="background-color: hsl(var(--background));">
  <!-- Settings Header -->
  <div class="border-b sticky top-0 z-10" style="background-color: hsl(var(--card)); border-color: hsl(var(--border));">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-semibold" style="color: hsl(var(--foreground))">Settings</h1>
          <span class="text-xs px-2 py-1 rounded-full border"
                style="border-color: hsl(var(--border)); color: hsl(var(--muted-foreground));">
            v2.0.0
          </span>
        </div>
        <ThemeToggle />
      </div>

      <!-- Settings Tabs -->
      <div class="flex overflow-x-auto gap-1 pb-px -mb-px">
        <button
          class="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
          style="border-color: {activeTab === 'profile' ? 'hsl(var(--primary))' : 'transparent'}; color: {activeTab === 'profile' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}"
          on:click={() => activeTab = 'profile'}
        >
          Profile
        </button>
        <button
          class="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
          style="border-color: {activeTab === 'security' ? 'hsl(var(--primary))' : 'transparent'}; color: {activeTab === 'security' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}"
          on:click={() => activeTab = 'security'}
        >
          Security
        </button>
        <button
          class="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
          style="border-color: {activeTab === 'notifications' ? 'hsl(var(--primary))' : 'transparent'}; color: {activeTab === 'notifications' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}"
          on:click={() => activeTab = 'notifications'}
        >
          Notifications
        </button>
        <button
          class="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
          style="border-color: {activeTab === 'api' ? 'hsl(var(--primary))' : 'transparent'}; color: {activeTab === 'api' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}"
          on:click={() => activeTab = 'api'}
        >
          API & Integrations
        </button>
        <button
          class="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
          style="border-color: {activeTab === 'billing' ? 'hsl(var(--primary))' : 'transparent'}; color: {activeTab === 'billing' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}"
          on:click={() => activeTab = 'billing'}
        >
          Billing
        </button>
      </div>
    </div>
  </div>

  <!-- Settings Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Profile Settings -->
    {#if activeTab === 'profile'}
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Profile Form -->
        <div class="lg:col-span-2">
          <div class="rounded-xl border p-6" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
            <h2 class="text-lg font-semibold mb-4" style="color: hsl(var(--foreground))">Profile Information</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">Display Name</label>
                <input
                  type="text"
                  bind:value={profileForm.displayName}
                  class="w-full px-3 py-2 rounded-md border text-sm"
                  style="background-color: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground));"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">Email</label>
                <input
                  type="email"
                  bind:value={profileForm.email}
                  class="w-full px-3 py-2 rounded-md border text-sm"
                  style="background-color: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground));"
                />
                <p class="text-xs mt-1" style="color: hsl(var(--muted-foreground))">Used for notifications and login</p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">Company</label>
                <input
                  type="text"
                  bind:value={profileForm.company}
                  class="w-full px-3 py-2 rounded-md border text-sm"
                  style="background-color: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground));"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">Job Title</label>
                <input
                  type="text"
                  bind:value={profileForm.jobTitle}
                  class="w-full px-3 py-2 rounded-md border text-sm"
                  style="background-color: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground));"
                />
              </div>

              <div class="pt-4">
                <button
                  on:click={saveProfile}
                  class="px-4 py-2 text-sm rounded-md font-medium transition-colors hover:opacity-90"
                  style="background: linear-gradient(135deg, hsl(var(--primary)), hsl(173, 80%, 40%)); color: white;"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Summary Card -->
        <div>
          <div class="rounded-xl border p-6" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
            <div class="text-center">
              <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                <span class="text-2xl font-bold text-white">
                  {profileForm.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <h3 class="mt-3 font-semibold" style="color: hsl(var(--foreground))">{profileForm.displayName || 'User'}</h3>
              <p class="text-xs" style="color: hsl(var(--muted-foreground))">{profileForm.email}</p>

              <div class="mt-4 pt-4 border-t" style="border-color: hsl(var(--border))">
                <div class="flex justify-between text-sm">
                  <span style="color: hsl(var(--muted-foreground))">Member since</span>
                  <span style="color: hsl(var(--foreground))">Jan 2024</span>
                </div>
                <div class="flex justify-between text-sm mt-2">
                  <span style="color: hsl(var(--muted-foreground))">Role</span>
                  <span class="px-2 py-0.5 rounded-full text-xs" style="background-color: hsl(var(--primary) / 0.1); color: hsl(var(--primary))">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Security Settings -->
    {#if activeTab === 'security'}
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-xl border p-6" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
          <h2 class="text-lg font-semibold mb-4" style="color: hsl(var(--foreground))">Change Password</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">Current Password</label>
              <input
                type="password"
                bind:value={securityForm.currentPassword}
                class="w-full px-3 py-2 rounded-md border text-sm"
                style="background-color: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground));"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">New Password</label>
              <input
                type="password"
                bind:value={securityForm.newPassword}
                class="w-full px-3 py-2 rounded-md border text-sm"
                style="background-color: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground));"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">Confirm New Password</label>
              <input
                type="password"
                bind:value={securityForm.confirmPassword}
                class="w-full px-3 py-2 rounded-md border text-sm"
                style="background-color: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground));"
              />
            </div>

            <div class="pt-4">
              <button
                on:click={changePassword}
                class="px-4 py-2 text-sm rounded-md font-medium transition-colors hover:opacity-90"
                style="background: linear-gradient(135deg, hsl(var(--primary)), hsl(173, 80%, 40%)); color: white;"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-xl border p-6" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
          <h2 class="text-lg font-semibold mb-4" style="color: hsl(var(--foreground))">Two-Factor Authentication</h2>

          <div class="flex items-center justify-between py-3 border-b" style="border-color: hsl(var(--border))">
            <div>
              <p class="font-medium" style="color: hsl(var(--foreground))">Two-factor authentication</p>
              <p class="text-xs mt-1" style="color: hsl(var(--muted-foreground))">Add an extra layer of security to your account</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" bind:checked={securityForm.twoFactorEnabled} />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="mt-4">
            <h3 class="text-sm font-semibold mb-2" style="color: hsl(var(--foreground))">Active Sessions</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <div>
                  <p class="font-medium" style="color: hsl(var(--foreground))">Current session</p>
                  <p class="text-xs" style="color: hsl(var(--muted-foreground))">Chrome on macOS • 192.168.1.1</p>
                </div>
                <span class="text-xs px-2 py-1 rounded-full" style="background-color: hsl(142, 76%, 36% / 0.1); color: hsl(142, 76%, 36%)">Active now</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div>
                  <p style="color: hsl(var(--foreground))">Firefox on Windows</p>
                  <p class="text-xs" style="color: hsl(var(--muted-foreground))">2 days ago • 10.0.0.1</p>
                </div>
                <button class="text-xs text-red-500 hover:text-red-600">Revoke</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Notifications Settings -->
    {#if activeTab === 'notifications'}
      <div class="rounded-xl border p-6 max-w-2xl" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
        <h2 class="text-lg font-semibold mb-4" style="color: hsl(var(--foreground))">Notification Preferences</h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b" style="border-color: hsl(var(--border))">
            <div>
              <p class="font-medium" style="color: hsl(var(--foreground))">Email alerts</p>
              <p class="text-xs" style="color: hsl(var(--muted-foreground))">Receive notifications via email</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" bind:checked={notificationSettings.emailAlerts} />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between py-3 border-b" style="border-color: hsl(var(--border))">
            <div>
              <p class="font-medium" style="color: hsl(var(--foreground))">Desktop notifications</p>
              <p class="text-xs" style="color: hsl(var(--muted-foreground))">Show browser notifications</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" bind:checked={notificationSettings.desktopNotifications} />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="pt-4">
            <h3 class="text-sm font-semibold mb-3" style="color: hsl(var(--foreground))">Notify me about:</h3>

            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <input type="checkbox" id="uploads" bind:checked={notificationSettings.fileUploads} />
                <label for="uploads" class="text-sm" style="color: hsl(var(--foreground))">File uploads</label>
              </div>

              <div class="flex items-center gap-3">
                <input type="checkbox" id="shares" bind:checked={notificationSettings.shares} />
                <label for="shares" class="text-sm" style="color: hsl(var(--foreground))">File shares</label>
              </div>

              <div class="flex items-center gap-3">
                <input type="checkbox" id="security" bind:checked={notificationSettings.securityAlerts} />
                <label for="security" class="text-sm" style="color: hsl(var(--foreground))">Security alerts</label>
              </div>

              <div class="flex items-center gap-3">
                <input type="checkbox" id="digest" bind:checked={notificationSettings.weeklyDigest} />
                <label for="digest" class="text-sm" style="color: hsl(var(--foreground))">Weekly digest</label>
              </div>
            </div>
          </div>

          <div class="pt-4">
            <button
              class="px-4 py-2 text-sm rounded-md font-medium transition-colors hover:opacity-90"
              style="background: linear-gradient(135deg, hsl(var(--primary)), hsl(173, 80%, 40%)); color: white;"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- API & Integrations -->
    {#if activeTab === 'api'}
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-xl border p-6" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
          <h2 class="text-lg font-semibold mb-4" style="color: hsl(var(--foreground))">API Keys</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">API Key</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  bind:value={apiSettings.apiKey}
                  readonly
                  class="flex-1 px-3 py-2 rounded-md border text-sm font-mono bg-gray-50 dark:bg-gray-900"
                  style="border-color: hsl(var(--border));"
                />
                <button
                  on:click={copyApiKey}
                  class="px-3 py-2 rounded-md text-sm border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style="border-color: hsl(var(--border)); color: hsl(var(--foreground));"
                >
                  Copy
                </button>
              </div>
              <p class="text-xs mt-1" style="color: hsl(var(--muted-foreground))">This key grants full access to your account. Keep it secure!</p>
            </div>

            <div>
              <button
                on:click={generateApiKey}
                class="px-4 py-2 text-sm rounded-md font-medium transition-colors hover:opacity-90"
                style="background: linear-gradient(135deg, hsl(var(--primary)), hsl(173, 80%, 40%)); color: white;"
              >
                Regenerate API Key
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-xl border p-6" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
          <h2 class="text-lg font-semibold mb-4" style="color: hsl(var(--foreground))">Webhook Configuration</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">Webhook URL</label>
              <input
                type="url"
                bind:value={apiSettings.webhookUrl}
                placeholder="https://your-app.com/webhook"
                class="w-full px-3 py-2 rounded-md border text-sm"
                style="background-color: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground));"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: hsl(var(--foreground))">IP Whitelist</label>
              <input
                type="text"
                bind:value={apiSettings.ipWhitelist}
                placeholder="192.168.1.1, 10.0.0.0/24"
                class="w-full px-3 py-2 rounded-md border text-sm"
                style="background-color: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground));"
              />
              <p class="text-xs mt-1" style="color: hsl(var(--muted-foreground))">Comma-separated IP addresses or CIDR blocks</p>
            </div>

            <div class="pt-4">
              <button
                class="px-4 py-2 text-sm rounded-md font-medium transition-colors hover:opacity-90"
                style="background: linear-gradient(135deg, hsl(var(--primary)), hsl(173, 80%, 40%)); color: white;"
              >
                Save Webhook Settings
              </button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="rounded-xl border p-6" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
            <h2 class="text-lg font-semibold mb-4" style="color: hsl(var(--foreground))">API Status</h2>

            <div class="flex flex-wrap gap-3">
              <span class="px-3 py-1.5 rounded-full border text-sm flex items-center gap-2"
                    style="border-color: hsl(var(--border));">
                <span class="h-2 w-2 rounded-full bg-green-500"></span>
                /health • OK
              </span>
              <span class="px-3 py-1.5 rounded-full border text-sm"
                    style="border-color: hsl(var(--border));">
                /version • v1.0.0
              </span>
              <span class="px-3 py-1.5 rounded-full border text-sm"
                    style="border-color: hsl(var(--border));">
                /status • 200
              </span>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Billing -->
    {#if activeTab === 'billing'}
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <div class="rounded-xl border p-6" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
            <h2 class="text-lg font-semibold mb-4" style="color: hsl(var(--foreground))">Current Plan</h2>

            <div class="p-4 rounded-lg mb-6" style="background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(173, 80%, 40% / 0.1));">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-2xl font-bold" style="color: hsl(var(--foreground))">{billingInfo.plan}</span>
                  <span class="text-sm ml-2" style="color: hsl(var(--muted-foreground))">Professional Plan</span>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium" style="background-color: hsl(var(--primary) / 0.1); color: hsl(var(--primary))">
                  Active
                </span>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs" style="color: hsl(var(--muted-foreground))">Storage used</p>
                  <p class="text-sm font-semibold" style="color: hsl(var(--foreground))">{billingInfo.storageUsed} / {billingInfo.storageTotal}</p>
                </div>
                <div>
                  <p class="text-xs" style="color: hsl(var(--muted-foreground))">Next billing</p>
                  <p class="text-sm font-semibold" style="color: hsl(var(--foreground))">{new Date(billingInfo.nextBilling).toLocaleDateString()}</p>
                </div>
              </div>

              <div class="mt-3 h-2 w-full rounded-full overflow-hidden" style="background-color: hsl(var(--primary) / 0.2)">
                <div class="h-full rounded-full" style="width: 12.4%; background: linear-gradient(to right, hsl(var(--primary)), hsl(173, 80%, 40%));"></div>
              </div>
            </div>

            <h3 class="font-semibold mb-3" style="color: hsl(var(--foreground))">Invoices</h3>
            <div class="space-y-2">
              {#each billingInfo.invoices as invoice}
                <div class="flex items-center justify-between py-2 border-b text-sm" style="border-color: hsl(var(--border))">
                  <div>
                    <p style="color: hsl(var(--foreground))">{invoice.id}</p>
                    <p class="text-xs" style="color: hsl(var(--muted-foreground))">{new Date(invoice.date).toLocaleDateString()}</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-sm" style="color: hsl(var(--foreground))">{invoice.amount}</span>
                    <span class="px-2 py-0.5 rounded-full text-xs"
                          style="background-color: {invoice.status === 'paid' ? 'hsl(142, 76%, 36% / 0.1)' : 'hsl(38, 92%, 50% / 0.1)'}; color: {invoice.status === 'paid' ? 'hsl(142, 76%, 36%)' : 'hsl(38, 92%, 50%)'};">
                      {invoice.status}
                    </span>
                    <button
                      on:click={() => downloadInvoice(invoice.id)}
                      class="text-xs hover:underline"
                      style="color: hsl(var(--primary))"
                    >
                      Download
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <div>
          <div class="rounded-xl border p-6" style="border-color: hsl(var(--border)); background-color: hsl(var(--card));">
            <h3 class="font-semibold mb-4" style="color: hsl(var(--foreground))">Payment Method</h3>

            <div class="p-4 rounded-lg mb-4 border" style="border-color: hsl(var(--border));">
              <div class="flex items-center gap-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
                <div>
                  <p class="font-medium" style="color: hsl(var(--foreground))">•••• •••• •••• 4242</p>
                  <p class="text-xs" style="color: hsl(var(--muted-foreground))">Expires 12/2025</p>
                </div>
              </div>
            </div>

            <button
              class="w-full px-4 py-2 text-sm rounded-md border font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style="border-color: hsl(var(--border)); color: hsl(var(--foreground));"
            >
              Update Payment Method
            </button>

            <div class="mt-4 pt-4 border-t" style="border-color: hsl(var(--border))">
              <button
                class="w-full px-4 py-2 text-sm rounded-md font-medium transition-colors"
                style="background: linear-gradient(135deg, hsl(var(--primary)), hsl(173, 80%, 40%)); color: white;"
              >
                Change Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>