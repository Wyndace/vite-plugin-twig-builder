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
            config.root = config.root || resolvedConfig.build.outDir;
            config.outDir = config.outDir || resolvedConfig.build.outDir;
            config.dir = config.dir || config.root;
        },

        async generateBundle(){
            const root = config.root
            const outDir = config.outDir;
            const dir = config.dir;
            const extensions = config.extensions;
            await renderAndWriteFilesInDir(dir, extensions, outDir, root);
        },
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const handled = await handleTwigDevRequest(req, res, config);
                if (!handled) next();
            });
        }
    }
}