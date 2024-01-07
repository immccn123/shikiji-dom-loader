# shikiji-dom-loader

shikiji-dom-loader is a code highlight tool like [prism-autoloader](https://prismjs.com/plugins/autoloader/).

How to use:

- Clone the repo.
- Build it: `pnpm install && pnpm build`
- Copy the entire `dist` folder and serve it to the internet (it is recommended to enable brotli / gzip / zstd compress).
- Then load `dist/shikiji-dom-loader.js` through the `<script>` tag:
    ```html
    <script src="path/to/your/dist/shikiji-dom-loader.js"></script>
    ```

That's it.
