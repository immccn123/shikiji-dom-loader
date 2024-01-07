import { BundledTheme, ThemeInput } from "shikiji";

type ExportFn = (name: string, exports: unknown) => void;
type ModuleLoaderFn = (
	exports: ExportFn,
	module: ModuleController
) => Module;
type SetterFn = (module: unknown) => unknown;
type ExecuteFn = () => unknown;

interface ModuleController {
	import: (name: string) => unknown;
}

interface Module {
	setters: (SetterFn | null)[];
	execute: ExecuteFn;
}

export declare global {
	interface Window {
		ShikijiDOMLoader
		ShikijiDOMLoaderTheme?: BundledTheme
	}
}
