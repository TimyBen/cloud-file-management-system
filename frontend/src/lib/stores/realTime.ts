// $lib/stores/realTime.ts
import { browser } from '$app/environment';
import { files } from './files';

let ws: WebSocket | null = null;
let pollInterval: NodeJS.Timeout | null = null;

export function initRealTimeUpdates() {
	if (!browser) return;

	// Option 1: WebSocket (preferred for real-time)
	initWebSocket();

	// Option 2: Polling (fallback)
	// startPolling();
}

function initWebSocket() {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const wsUrl = `${protocol}//${window.location.host}/ws/files`;

	ws = new WebSocket(wsUrl);

	ws.onopen = () => {
		console.log('WebSocket connected for file updates');
	};

	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (data.type === 'files_updated') {
			// Refresh files from server
			refreshFiles();
		}
	};

	ws.onclose = () => {
		console.log('WebSocket disconnected, reconnecting...');
		setTimeout(initWebSocket, 3000);
	};
}

function startPolling(interval = 30000) {
	pollInterval = setInterval(() => {
		refreshFiles();
	}, interval);
}

export function cleanupRealTime() {
	if (ws) ws.close();
	if (pollInterval) clearInterval(pollInterval);
}

async function refreshFiles() {
	// This would call your API to get fresh files
	// and update the store
}