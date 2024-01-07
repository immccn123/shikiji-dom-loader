/// <reference path="../preloader.d.ts" />

window.ShikijiDOMLoader = new (class {
	constructor() {
		const currentScript = /** @type {HTMLScriptElement} */ (
			document.currentScript
		);
		this.loadingScript = this.base = currentScript.src;
	}
	loadingScript = "";
	base = "";
	/** @type {Record<string, Record<string, unknown>>} */
	modulesData = {};
	/** @param {string} moduleUrl  */
	getModuleUrl = (moduleUrl) => {
		const url = new URL(moduleUrl, this.base);
		return url.toString();
	};
	/** @param {string} moduleUrl  */
	import = (moduleUrl) => {
		const self = this;
		return new Promise((resolve, reject) => {
			const moduleKey = self.getModuleUrl(moduleUrl);
			this.loadingScript = moduleKey;

			const el = document.createElement("script");
			el.src = moduleKey;

			function resolver() {
				// document.body.removeChild(el);
				resolve(self.modulesData[moduleKey]);
				removeEventListener(
					`_ShikijiDOMLoader__register__module__${moduleKey}`,
					resolver
				);
			}
			addEventListener(
				`_ShikijiDOMLoader__register__module__${moduleKey}`,
				resolver
			);

			el.onerror = (e) => {
				document.body.removeChild(el);
				reject(e);
			};

			document.body.appendChild(el);
		});
	};
	/**
	 * @param {string} moduleName
	 * @param {string} name
	 * @param {unknown} data
	 */
	export = (moduleName, name, data) => {
		if (!this.modulesData[moduleName]) this.modulesData[moduleName] = {};
		this.modulesData[moduleName][name] = data;
	};
	/**
	 * @param {string[]} dependencies
	 * @param {import("../preloader").ModuleLoaderFn} loader
	 */
	register = async (dependencies, loader) => {
		const registerModuleKey = this.loadingScript; // this might be changed
		const registerModule = loader(
			(name, data) => this.export(registerModuleKey, name, data),
			{
				import: this.import,
			}
		);
		for (let depId = 0; depId < dependencies.length; depId++) {
			const dep = dependencies[depId];
			const key = this.getModuleUrl(dep);
			if (!this.modulesData[key]) {
				await this.import(dep);
			}
			const module = this.modulesData[key];
			(registerModule.setters[depId] ?? (() => {}))(module);
		}
		await registerModule.execute();
		dispatchEvent(
			new CustomEvent(
				`_ShikijiDOMLoader__register__module__${registerModuleKey}`
			)
		);
	};
})();
