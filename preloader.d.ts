type ExportFn = (name: string, exports: unknown) => void;
type ModuleLoaderFn = (
	exports: ExportFn,
	module?: ModuleController
) => Module;
type SetterFn = (module: unknown) => unknown;
type ExecuteFn = () => void;

interface ModuleController {
	import: (name: string) => unknown;
}

interface Module {
	setters: SetterFn[];
	execute: ExecuteFn;
}

export declare global {
	interface Window {
		ShikijiDOMLoader: {
			register: (
				name: string,
				dependencies: string[],
				loader: ModuleLoaderFn
			) => void;
		};
	}
}
