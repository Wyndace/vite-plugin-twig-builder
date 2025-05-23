# vite-plugin-twig-builder
> A Vite plugin that renders [Twig](https://twig.symfony.com/) templates into static HTML files during the build process.

> Used in [HalfDeal WebLayout Starter](https://github.com/Wyndace/halfdeal-weblayout-starter) at vite-twig-ssg branch.

## Features
- Renders Twig templates (`.twig`, `.twig.html`) into static HTML during Vite build.
- Supports nested directory structures.
- Customizable input/output directories and extensions.
- Uses Vite's global config for root and output directories (overridable).
- Easy configuration and integration.

## Installation
```bash
  npm install vite-plugin-twig-builder
```

## Usage
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import twigBuilder from 'vite-plugin-twig-builder'

export default defineConfig({
    plugins: [
        twigBuilder({
            // Optional: override defaults (see below for config options)
            root: './src',
            dir: './src/pages',
            outDir: './dist',
            extensions: ['.twig', '.twig.html'],
            ignoredPaths: []
        })
    ]
});
```

## Configuration
You can pass an optional configuration object to `twigBuilder()`:

| Option       | Type         | Default                         | Description                                   |
|--------------|--------------|---------------------------------|-----------------------------------------------|
| `dir`        | `string`     | `./src/pages`                   | Source directory for twig templates           |
| `outDir`     | `string`     | `./dist`                        | Output directory for generated HTML           |
| `root`       | `string`     | `./src`                         | Twig root directory (for layouts/partials)    |
| `extensions` | `string[]`   | `['.twig', '.twig.html']`       | File extensions to process                    |

> **Note:** If you do not specify these options, the plugin will use values from Vite's own config (`root`, `build.outDir`) where appropriate.

## License
This project is licensed under the Apache License 2.0. See [LICENSE](https://raw.githubusercontent.com/Wyndace/vite-plugin-twig-builder/refs/heads/main/LICENSE) for details.

## Author
<p align="center">Vasilev Aleksandr</p>
<p align="center">
    <a href="https://github.com/Wyndace">Github</a> |
    <a href="https://t.me/Wyndace">Telegram</a> |
    <a href="https://t.me/smthonit">Telegram Channel</a> |
    <a href="https://vk.com/stylelifedeal.wyndace">VK</a> |
    <a href ="https://vk.com/smthonit">VK Group</a>
</p>
