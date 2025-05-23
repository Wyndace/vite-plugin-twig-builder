/**
 *  Copyright 2025 Aleksandr Alekseevich Vasilev (Александр Алексеевич Васильев)
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import TwigBuilderConfig from "./types/TwigBuilderConfig";
import {handleTwigDevRequest, renderAndWriteFilesInDir} from "./functions/render.js";
import {Plugin} from 'vite';

const defaultConfig: TwigBuilderConfig = {
    root: './src',
    dir: './src/pages',
    outDir: './dist',
    extensions: ['.twig', '.twig.html'],
}

export default function twigBuilder(userConfig: TwigBuilderConfig = defaultConfig): Plugin {
    const config = { ...defaultConfig, ...userConfig };
    return {
        name: 'vite-plugin-twig-builder',
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