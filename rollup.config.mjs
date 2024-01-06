import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
	input: ["src/main.js"],
	output: [
		{
			dir: "dist",
			format: "system",
			// plugins: [terser()],
			chunkFileNames: "[name].js",
			name: "shijikiDOMLoader",
			systemNullSetters: true,
		},
	],
	plugins: [resolve(), commonjs()],
};
