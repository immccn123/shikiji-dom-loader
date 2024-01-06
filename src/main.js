import { getHighlighter } from "shikiji";

const LANGUAGE_REGEXP = /language-(\w+)/;

const elements = document.querySelectorAll("pre code[class*=language-]");

elements.forEach(async (el) => {
	let language;

	el.classList.forEach((name) => {
		language = name.match(LANGUAGE_REGEXP)?.[1];
	});

	if (!language) return;

	const highlighter = await getHighlighter();
});
