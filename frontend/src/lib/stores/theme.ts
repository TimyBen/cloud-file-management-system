// $lib/stores/theme.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('light');

	function apply(theme: Theme, disableTransitions = false) {
		if (!browser) return;
		const el = document.documentElement;

		// console.log('Applying theme:', theme);

		// Disable transitions during theme change if requested
		if (disableTransitions) {
			el.classList.add('no-transitions');
		}

		if (theme === 'dark') {
			el.classList.add('dark');
		} else {
			el.classList.remove('dark');
		}

		// Force reflow to ensure the class change is applied before re-enabling transitions
		if (disableTransitions) {
			void el.offsetHeight; // Trigger reflow
			el.classList.remove('no-transitions');
		}

		// Persist
		localStorage.setItem('theme', theme);
		// Set cookie for SSR reads
		document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 7}`;
	}

	return {
		subscribe,
		set: (t: Theme) => {
			apply(t);
			set(t);
		},
		toggle: () => {
			update((curr) => {
				const next = curr === 'dark' ? 'light' : 'dark';
				apply(next);
				return next;
			});
		},
		load: () => {
			if (!browser) return;

			// Disable transitions on initial load to prevent flash
			const el = document.documentElement;
			el.classList.add('no-transitions');

			// Resolve preference: localStorage -> prefers-color-scheme -> default light
			const stored = localStorage.getItem('theme') as Theme | null;
			let theme: Theme;

			if (stored) {
				theme = stored;
			} else {
				const prefersDark =
					window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
				theme = prefersDark ? 'dark' : 'light';
			}

			if (theme === 'dark') {
				el.classList.add('dark');
			} else {
				el.classList.remove('dark');
			}

			// Force reflow before re-enabling transitions
			void el.offsetHeight;
			el.classList.remove('no-transitions');

			set(theme);

			// Persist the resolved theme
			localStorage.setItem('theme', theme);
			document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 7}`;
		}
	};
}

export const theme = createThemeStore();
