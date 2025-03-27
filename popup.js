import { loginUser, getMe } from './fetch.js';

document.addEventListener('DOMContentLoaded', () => {

	///////////////////////////////////////////////

	const loginView = document.getElementById('loginView');
	const accountView = document.getElementById('accountView');
	const gooseView = document.getElementById('gooseView');

	function display(view) {
		if (view === 'login') {
			loginView.style.display = 'block';
			accountView.style.display = 'none';
			gooseView.style.display = 'none';
		}
		else if (view === 'connected') {
			loginView.style.display = 'none';
			accountView.style.display = 'block';
			gooseView.style.display = 'block';
		}
	}

	chrome.storage.local.get(['gooseUserToken'], async ({ gooseUserToken }) => {
		if (gooseUserToken) {
			try {
				const me = await getMe(gooseUserToken);
				if (me?.email) {
					document.getElementById('accountEmail').textContent = me.email;
					document.getElementById('accountScore').textContent = me.score ?? 'N/A';
					display('connected');
					return;
				}
			} catch (e) {
				console.error("Token invalide");
			}
		}
		display('login');
	});

	document.getElementById('loginSubmit').addEventListener('click', async () => {
		const email = document.getElementById('loginEmail').value;
		const password = document.getElementById('loginPassword').value;
		const loginError = document.getElementById('loginError');
		loginError.style.display = 'none';

		try {
			const res = await loginUser({ email, password });
			if (res.accessToken) {
				await chrome.storage.local.set({ gooseUserToken: res.accessToken });
				location.reload();
			} else {
				loginError.textContent = res.message || "Erreur de connexion";
				loginError.style.display = 'block';
			}
		} catch (err) {
			loginError.textContent = "Erreur de serveur";
			loginError.style.display = 'block';
		}
	});

	document.getElementById('logoutBtn').addEventListener('click', () => {
		chrome.storage.local.remove('gooseUserToken', () => {
			location.reload();
		});
	});

	///////////////////////////////////////////////


	const actions = [
		{ name: 'gooseRGB', label: 'Goose RGB' },
		{ name: 'rotateGoose', label: 'Rotation' },
		{ name: 'gooseClickUrl', label: 'Clique URL' },
		{ name: 'gooseFillInput', label: 'Remplissage input' },
		{ name: 'stealCursor', label: 'Vol du curseur' },
		{ name: 'moveGoose', label: 'Déplacement aléatoire' },
		{ name: 'openTab', label: 'Nouvel Onglet' }
	];

	const actionsList = document.getElementById('actionsList');

	actions.forEach(action => {
		const wrapper = document.createElement('div');
		wrapper.className = 'action-item';

		const label = document.createElement('label');
		label.textContent = action.label;
		label.htmlFor = `toggle-${action.name}`;

		const toggle = document.createElement('input');
		toggle.type = 'checkbox';
		toggle.id = `toggle-${action.name}`;
		toggle.dataset.name = action.name;

		const range = document.createElement('input');
		range.type = 'range';
		range.min = '0';
		range.max = '100';
		range.value = '50';
		range.dataset.name = action.name;

		const valueDisplay = document.createElement('span');
		valueDisplay.textContent = '50';
		valueDisplay.style.marginLeft = '6px';
		range.addEventListener('input', () => {
			valueDisplay.textContent = range.value;
		});

		const rangeContainer = document.createElement('div');
		rangeContainer.style.display = 'flex';
		rangeContainer.style.alignItems = 'center';
		rangeContainer.style.gap = '6px';
		rangeContainer.appendChild(range);
		rangeContainer.appendChild(valueDisplay);

		wrapper.appendChild(label);
		wrapper.appendChild(toggle);
		wrapper.appendChild(rangeContainer);
		actionsList.appendChild(wrapper);
	});

	const modelSelect = document.getElementById('modelSelect');
	console.log(modelSelect);
	chrome.storage.local.get(['gooseChaosConfig'], ({ gooseChaosConfig }) => {
		if (gooseChaosConfig) {
			actions.forEach(action => {
				const toggle = document.getElementById(`toggle-${action.name}`);
				const range = document.querySelector(`input[type="range"][data-name="${action.name}"]`);
				if (gooseChaosConfig[action.name]) {
					toggle.checked = gooseChaosConfig[action.name].enabled;
					range.value = gooseChaosConfig[action.name].weight;
					range.nextSibling.textContent = gooseChaosConfig[action.name].weight;
				}
			});
			if (gooseChaosConfig.model) {
				modelSelect.value = gooseChaosConfig.model;
			}
		}
	});

	document.getElementById('saveBtn').addEventListener('click', () => {
		const config = {};
		actions.forEach(action => {
			const toggle = document.getElementById(`toggle-${action.name}`);
			const range = document.querySelector(`input[type="range"][data-name="${action.name}"]`);
			config[action.name] = {
				enabled: toggle.checked,
				weight: parseInt(range.value)
			};
		});
		config.model = modelSelect.value;
		chrome.storage.local.set({ gooseChaosConfig: config }, () => {
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				if (tabs[0]) {
					chrome.tabs.reload(tabs[0].id);
				}
			});
		});
	});

	document.getElementById('panicBtn').addEventListener('click', () => {
		chrome.runtime.sendMessage({ action: 'panic' });
	});

	// Log fetch endpoints
	chrome.storage.local.get(['gooseChaosFetchLog'], ({ gooseChaosFetchLog }) => {
		const logList = document.getElementById('fetchLog');
		if (gooseChaosFetchLog) {
			gooseChaosFetchLog.slice(-5).forEach(entry => {
				const li = document.createElement('li');
				li.textContent = entry;
				logList.appendChild(li);
			});
		}
	});

	function updateDebugPanel() {
		chrome.storage.local.get(null, (data) => {
			const debugOutput = document.getElementById('debugOutput');
			debugOutput.textContent = JSON.stringify(data, null, 2);
		});
	}

	document.getElementById('refreshDebugBtn').addEventListener('click', updateDebugPanel);
	updateDebugPanel();

});
