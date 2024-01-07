/// <reference lib="WebWorker" />

import { getHighlighter } from "shikiji";

const LANGUAGE_REGEXP = /language-([\w\+]+)/;
const highlighter = await getHighlighter();
const theme =
	window.ShikijiDOMLoaderTheme ??
	/** @type {import("shikiji").BundledTheme} */ (
		document.currentScript?.getAttribute("data-theme")
	) ??
	"material-theme-lighter";

const currentScript = /** @type {HTMLScriptElement} */ (document.currentScript);

await highlighter.loadTheme(theme);
highlighter.setTheme(theme);

/**
 * @param {string} html
 */
const createElementFromHTML = (html) => {
	const el = document.createElement("div");
	el.innerHTML = html;
	return /** @type {HTMLPreElement} */ (el.firstChild);
};

window.ShikijiDOMLoader.highlightAll = async () => {
	const elements = document.querySelectorAll("pre code[class*=language-]");

	for (let i = 0; i < elements.length; i++) {
		const el = elements[i];

		if (el.getAttribute("data-shiki-load")) return;

		/** @type {import("shikiji").BundledLanguage | undefined} */
		let lang = undefined;

		el.classList.forEach((name) => {
			const match = name.match(LANGUAGE_REGEXP)?.[1];
			// @ts-ignore
			if (match) lang = match;
		});

		if (lang === undefined) {
			console.warn(
				`[Shikiji DOM Loader] Language data doesn't found in element with class ${el.className}. Treat as markdown.`
			);
		}

		lang ??= "markdown";

		await highlighter.loadLanguage(lang);
		const preElement = /** @type {HTMLPreElement} */ (el.parentElement);

		if (!el.textContent)
			throw new Error(
				"[Shikiji DOM Loader] No textContent found in code element."
			);

		const html = highlighter.codeToHtml(el.textContent, {
			lang,
			theme,
		});

		const newElement = createElementFromHTML(html);
		preElement.className += ` ${newElement.className}`;
		preElement.style.backgroundColor = newElement.style.backgroundColor;
		preElement.style.color = newElement.style.color;
		preElement.innerHTML = newElement.innerHTML;
		preElement.setAttribute("data-shiki-load", "true");
	}

	let readyState = document.readyState;

	if (
		readyState === "loading" ||
		(readyState === "interactive" && currentScript && currentScript.defer)
	) {
		document.addEventListener(
			"DOMContentLoaded",
			window.ShikijiDOMLoader.highlightAll
		);
	}
};

window.ShikijiDOMLoader.highlightAll();
