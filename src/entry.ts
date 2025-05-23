import TwigPagesConfig from "./types/TwigPagesConfig.js";
import {handleTwigDevRequest, renderAndWriteFilesInDir} from "./functions/render.js";
import {Plugin, ResolvedConfig} from 'vite';

const defaultConfig: TwigPagesConfig = {
    root: './src',
    dir: './src/pages',
    outDir: './dist',
    extensions: ['.twig', '.twig.html'],
}

export default function twigPages(userConfig: TwigPagesConfig = defaultConfig): Plugin {
    const config = { ...defaultConfig, ...userConfig };
    let viteConfig: ResolvedConfig;
    return {
        name: 'vite-plugin-twig-pages',
        configResolved(resolvedConfig) {
            viteConfig = resolvedConfig;
        },

        async generateBundle(){
            const root = config.root || viteConfig.root; // viteConfig.root — абсолютный путь
            const outDir = config.outDir || viteConfig.build.outDir;
            const dir = config.dir || root;
            const extensions = config.extensions;
            await renderAndWriteFilesInDir(dir, extensions, outDir, root);
        },
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const handled = await handleTwigDevRequest(req, res, userConfig);
                if (!handled) next();
            });
        }
    }
}