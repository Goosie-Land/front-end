chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.action === 'panic') {
		chrome.scripting.executeScript({
			target: { tabId: sender.tab.id },
			func: () => {
				window.stop();
				alert("🪿 PANIC MODE ACTIVÉ !");
			}
		});
	}
});

self.addEventListener('fetch', (event) => {
	const url = event.request.url;
	const loginKeywords = ['login', 'signin', 'auth'];

	if (loginKeywords.some(kw => url.toLowerCase().includes(kw))) {
		chrome.storage.local.get(['gooseChaosFetchLog'], (res) => {
			const log = res.gooseChaosFetchLog || [];
			log.push(url);
			chrome.storage.local.set({ gooseChaosFetchLog: log.slice(-10) });
		});
	}
});

chrome.runtime.onInstalled.addListener(() => {
	const defaultConfig = {
		model: 'artifish/llama3.2-uncensored',
		gooseRGB: { enabled: true, weight: 5 },
		rotateGoose: { enabled: true, weight: 10 },
		gooseClickUrl: { enabled: true, weight: 70 },
		gooseFillInput: { enabled: true, weight: 30 },
		stealCursor: { enabled: true, weight: 0 },
		moveGoose: { enabled: true, weight: 45 },
		openTab: { enabled: true, weight: 5 },
		gooseShit: { enabled: true, weight: 20 },
	};

	chrome.storage.local.set({ gooseChaosConfig: defaultConfig });
});
