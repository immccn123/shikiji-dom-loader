import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";

import { rollup } from "rollup";

import * as fs from "fs";

const main = await rollup({
	input: ["src/main.js"],
	plugins: [
		resolve(),
		commonjs(),
		replace({
			values: { "System.": "ShikijiDOMLoader." },
		}),
	],
});

await main.write({
	dir: "dist",
	format: "system",
	plugins: [terser()],
	chunkFileNames: "[name].js",
	systemNullSetters: true,
});

try {
	fs.mkdirSync("temp");
} catch {}

const f = fs.openSync("temp/main.js", "w");
fs.writeSync(
	f,
	fs.readFileSync("src/preloader.js").toString() +
		"\n\n" +
		fs.readFileSync("dist/main.js").toString()
);

const withPreloader = await rollup({
	input: "temp/main.js",
	plugins: [
		resolve(),
		commonjs(),
		replace({
			values: { "System.": "ShikijiDOMLoader." },
		}),
	],
});

await withPreloader.write({
	file: "dist/shikiji-dom-loader.js",
	format: "iife",
	plugins: [terser()],
});
