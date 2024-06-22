import { defineBasicStore } from "@/store/store";
import { GraphicsPrefs, SavedBindings } from '@model/prefs';
import { CommandKey } from '@/input/commands';
import { CommandBindings } from '../input/bindings';

const GraphicsSettings = 'graphics';
const InputSettings = 'input';

export const useSettingsStore = defineBasicStore('settings', () => {

	let bindings: SavedBindings = {};
	let graphics: GraphicsPrefs = {}

	function load() {
		loadGraphics();
		loadBindings();
	}

	function loadGraphics() {
		try {
			const str = localStorage.getItem(GraphicsSettings);
			graphics = str ? JSON.parse(str) : undefined;
		} catch (err) {
			console.warn(`failed to load graphics settings: ${err}`);
		}
	}
	function loadBindings() {
		try {
			const str = localStorage.getItem(InputSettings);
			bindings = str ? JSON.parse(str) : undefined;
		} catch (err) {
			console.warn(`failed to load key bindings: ${err}`);
		}
	}

	const writeBindings = () => {
		try {
			const str = JSON.stringify(bindings);
			localStorage.setItem(InputSettings, str);

		} catch (err) {
			console.error(`Save bindings failed: ${err}`);
		}
	}

	const saveBindings = (newBinds: Map<CommandKey, CommandBindings>) => {

		const save: SavedBindings = {};
		for (const cmd of newBinds.keys()) {

			const inputs = newBinds.get(cmd)?.bindings;
			if (inputs) {
				save[cmd] = inputs.map(v => v?.encoding() ?? '');
			}

		}

		bindings = save;

		writeBindings();
	}



	const saveGraphics = () => {
		try {
			const str = JSON.stringify(graphics);
			localStorage.setItem(GraphicsSettings, str);

		} catch (err) {
			console.error(`Save data failed: ${err}`);
		}
	}

	const clear = () => {
		localStorage.removeItem(GraphicsSettings);

	}

	return {
		load,
		getBindings: () => bindings,
		getGraphics: () => graphics,
		clear,
		saveGraphics,
		saveBindings

	}

});


useSettingsStore().load();