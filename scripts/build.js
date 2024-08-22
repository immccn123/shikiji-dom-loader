import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";

import path from "path";
import { promisify } from "util";
import chalk from "chalk";
import { gzipSize } from "gzip-size";

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

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

const distDir = path.join(process.cwd(), "dist");

function getFileSize(bytes) {
	const sizes = ["B", "KB", "MB", "GB"];
	let i = 0;
	let adjustedSize = bytes;

	while (adjustedSize >= 1024 && i < sizes.length - 1) {
		adjustedSize /= 1024;
		i++;
	}

	return `${adjustedSize.toFixed(2)} ${sizes[i]}`;
}

async function printFileDetails(filePath) {
	try {
		const stats = await stat(filePath);
		const fileSize = getFileSize(stats.size);
		const data = await readFile(filePath);
		const gzippedSize = await gzipSize(data);
		const file = path.parse(filePath);

		console.log(
			`${chalk.green(file.name + file.ext)} - ${chalk.blue(
				fileSize
			)} - ${chalk.yellow((gzippedSize / 1024).toFixed(2))} KB (gzip)`
		);
	} catch (err) {
		console.error(chalk.red(`Error processing file: ${filePath}`), err);
	}
}

async function traverseDirectory(dir) {
	try {
		const files = await readdir(dir);

		for (const file of files) {
			const filePath = path.join(dir, file);
			const stats = await stat(filePath);

			if (stats.isDirectory()) {
				await traverseDirectory(filePath);
			} else {
				await printFileDetails(filePath);
			}
		}
	} catch (err) {
		console.error(chalk.red(`Error reading directory: ${dir}`));
	}
}

traverseDirectory(distDir);
