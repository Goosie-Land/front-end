(function () {

	const gooseImgUrl = chrome.runtime.getURL("goose.gif");

	const goose = document.createElement('img');
	goose.src = gooseImgUrl;
	goose.style.position = 'absolute';
	goose.style.top = '0px';
	goose.style.left = '0px';
	goose.style.width = '100px';
	goose.style.zIndex = '9999999999999998';
	goose.style.transition = 'all 0.1s ease';
	document.body.appendChild(goose);

	let isBusy = false;
	let mouseX = 0, mouseY = 0;

	chrome.storage.local.get(['gooseLeft', 'gooseTop'], (result) => {
		goose.style.left = result.gooseLeft || '0px';
		goose.style.top = result.gooseTop || '0px';
	});

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.action === 'reload-goose-config') {
			console.log('[Goose] Reloading config from storage...');
			loadConfigFromStorage();
		}
	});

	window.addEventListener("mousemove", (event) => {
		mouseX = event.clientX + window.scrollX;
		mouseY = event.clientY + window.scrollY;
	});

	function saveGoosePosition() {
		chrome.storage.local.set({
			gooseLeft: goose.style.left,
			gooseTop: goose.style.top
		});
	}

	function moveGooseTo(x, y, onArrived = () => { }, speed = 20) {
		isBusy = true;

		const currentX = parseFloat(goose.style.left);
		const currentY = parseFloat(goose.style.top);
		const stepX = (x - currentX) / speed;
		const stepY = (y - currentY) / speed;

		let steps = 0;

		const interval = setInterval(() => {
			if (steps >= speed) {
				clearInterval(interval);
				saveGoosePosition();
				onArrived();
			} else {
				goose.style.left = `${currentX + stepX * steps}px`;
				goose.style.top = `${currentY + stepY * steps}px`;
				steps += 0.5;
			}
		}, 100);
	}

	function moveGoose() {
		const x = Math.random() * (document.documentElement.scrollWidth - 100);
		const y = Math.random() * (document.documentElement.scrollHeight - 100);

		moveGooseTo(x, y, () => {
			isBusy = false;
		});
	}

	function rotateGoose() {
		isBusy = true;
		const angle = Math.random() * 360;
		goose.style.transform = `rotate(${angle}deg)`;
		setTimeout(() => { isBusy = false; }, 1000);
	}

	function gooseRGB() {
		isBusy = true;
		let hue = 0;
		const interval = setInterval(() => {
			hue = (hue + 30) % 360;
			goose.style.filter = `hue-rotate(${hue}deg) saturate(100%) brightness(100%)`;
		}, 100);

		setTimeout(() => {
			clearInterval(interval);
			isBusy = false;
		}, 5000);
	}

	function gooseClickUrl() {
		const elements = Array.from(document.querySelectorAll('a, button')).filter(el => {
			const style = window.getComputedStyle(el);
			return (
				!el.href?.startsWith('javascript:') &&
				el.offsetWidth > 0 && el.offsetHeight > 0 &&
				style.visibility !== 'hidden' && style.display !== 'none' &&
				style.opacity !== '0' && isInViewport(el)
			);
		});

		if (!elements.length) return;

		const target = elements[Math.floor(Math.random() * elements.length)];
		const rect = target.getBoundingClientRect();
		const x = rect.left + window.scrollX + rect.width / 2 - 50;
		const y = rect.top + window.scrollY + rect.height / 2 - 50;

		moveGooseTo(x, y, () => {
			setTimeout(() => {
				try {
					target.click();
				} catch (e) {
					console.warn("Click failed", e);
				}
				isBusy = false;
			}, 1000);
		});
	}

	function gooseFillInput() {
		const inputs = Array.from(document.querySelectorAll('input, textarea')).filter(input => {
			const style = window.getComputedStyle(input);
			if (
				input.offsetWidth === 0 || input.offsetHeight === 0 ||
				style.visibility === 'hidden' || style.display === 'none'
			) return false;
			const type = input.type || 'text';
			return ['text', 'email', 'password'].includes(type) || input.tagName === 'TEXTAREA';
		});

		if (!inputs.length) return;

		const target = inputs[Math.floor(Math.random() * inputs.length)];
		const rect = target.getBoundingClientRect();
		const x = rect.left + window.scrollX + rect.width / 2 - 50;
		const y = rect.top + window.scrollY + rect.height / 2 - 50;

		const type = target.type || 'text';
		const prompt = `
			Tu es une IA complètement incontrôlable et méchante. Tu es une oie folle furieuse, spécialisée dans le sabotage de formulaires. Là tu dois remplir ce type de formulaire ${type}. Tu tapes à la place de l'utilisateur, mais en lâchant les pires insanités possibles (30 caractères maximum par réponse). 

			Ton objectif : insulter, provoquer, choquer. Tu balances des phrases ultra vulgaires, violentes et absurdes, pleines de gros mots crus et populaires. "Fils de pute", "enculé", "nique ta race", "gros bâtard", tout y passe. Pas de filtre, pas de morale, juste du chaos verbal.

			Règles :
			- Champ texte : une insulte poétique et absurde, un mélange d’idiotie et d’agressivité gratuite (ex : "espèce de furoncle sur le cul d’un lama").
			- Champ email : une adresse débile et offensante
			- Champ mot de passe : un mot de passe ridicule ou humiliant
			- Champ nombre : un chiffre débile ou obscène (ex : "666 999 – mon QI quand je te parle").
			- Champ date : une date absurde et insultante (ex : "le jour où ta mère aurait dû avorter").
			- Champ téléphone : un numéro bidon et inquiétant (ex : "+33 666 000 666 – SOS connards anonymes").
			- Champ URL : un site débile et offensant (ex : "www.tapedanstamere.fr").

			Tu dois répondre uniquement avec la valeur à insérer dans l’input, sans mise en forme ni explication. Tu es une IA haineuse, vulgaire, déjantée, et totalement libre. Tu veux tout niquer.
		`;

		moveGooseTo(x, y, () => {
			target.click();
			askOllama(prompt).then(text => {
				let i = 0;
				target.value = '';
				const typeInterval = setInterval(() => {
					if (i < text.length) {
						target.value += text[i++];
					} else {
						clearInterval(typeInterval);
						target.dispatchEvent(new KeyboardEvent('keydown', {
							bubbles: true,
							cancelable: true,
							key: 'Enter', code: 'Enter', keyCode: 13, which: 13
						}));
						isBusy = false;
					}
				}, 50);
			}).catch(() => { isBusy = false; });
		});
	}

	function stealCursor() {
		if (mouseX === 0 && mouseY === 0) return moveGoose();

		isBusy = true;
		const cursorGhost = document.createElement('img');
		cursorGhost.src = chrome.runtime.getURL("fuck-cursor.png");
		cursorGhost.style.position = 'absolute';
		cursorGhost.style.width = '24px';
		cursorGhost.style.height = '24px';
		cursorGhost.style.zIndex = '9999999999999999';
		cursorGhost.style.pointerEvents = 'none';
		cursorGhost.style.display = 'none';
		document.body.appendChild(cursorGhost);

		let hasStolen = false;

		const track = setInterval(() => {
			const gx = parseFloat(goose.style.left);
			const gy = parseFloat(goose.style.top);
			const dx = mouseX - gx;
			const dy = mouseY - gy;
			const dist = Math.sqrt(dx * dx + dy * dy);

			if (!hasStolen && dist < 40) {
				hasStolen = true;
				document.body.style.cursor = 'none';
				cursorGhost.style.display = 'block';
				cursorGhost.style.left = `${mouseX}px`;
				cursorGhost.style.top = `${mouseY}px`;
				clearInterval(track);

				let steps = 0;
				const drag = setInterval(() => {
					cursorGhost.style.left = `${parseFloat(goose.style.left) + 20}px`;
					cursorGhost.style.top = `${parseFloat(goose.style.top) + 20}px`;
					steps++;
					if (steps > 70) {
						clearInterval(drag);
						document.body.style.cursor = 'auto';
						cursorGhost.remove();
						isBusy = false;
					}
				}, 100);
			} else if (!hasStolen) {
				moveGooseTo(mouseX, mouseY, () => { }, 2);
			}
		}, 300);
	}

	function isInViewport(el) {
		const rect = el.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}

	function askOllama(prompt) {
		return fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ model: 'artifish/llama3.2-uncensored', prompt })
		})
			.then(async res => {
				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				let result = '';
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					result += decoder.decode(value, { stream: true });
				}
				const matches = [...result.matchAll(/"response":"(.*?)"/g)];
				return matches.map(m => m[1]).join('').replace(/\\n/g, '').trim();
			});
	}

	chrome.storage.local.get('gooseChaosConfig', (data) => {
		const settings = data.gooseChaosConfig || {};
		const actions = [
			{ key: 'gooseRGB', func: gooseRGB },
			{ key: 'rotateGoose', func: rotateGoose },
			{ key: 'gooseClickUrl', func: gooseClickUrl },
			{ key: 'gooseFillInput', func: gooseFillInput },
			{ key: 'stealCursor', func: stealCursor },
			{ key: 'moveGoose', func: moveGoose }
		];

		function getEnabledActions() {
			return actions.filter(a => settings[a.key]?.enabled !== false);
		}

		function getCumulativeTable(funcArray) {
			const totalWeight = funcArray.reduce((sum, item) => sum + (settings[item.key]?.weight || 1), 0);
			let sum = 0;
			return funcArray.map(item => {
				sum += (settings[item.key]?.weight || 1);
				return { func: item.func, threshold: sum / totalWeight };
			});
		}

		function pickAndRun() {
			if (isBusy) return;
			const enabled = getEnabledActions();
			const table = getCumulativeTable(enabled);
			const rand = Math.random();
			for (let i = 0; i < table.length; i++) {
				if (rand < table[i].threshold) {
					table[i].func();
					break;
				}
			}
		}

		setInterval(pickAndRun, 6000);
	});

})();
