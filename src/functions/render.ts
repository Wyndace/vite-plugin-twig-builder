import twigPkg from 'twig';
const { renderFile } = twigPkg;
import fs from 'fs';
import path from 'path';
import { ServerResponse, IncomingMessage } from 'http';
import { Connect} from 'vite';
import TwigPagesConfig from '../types/TwigPagesConfig';

function isFileWithSpecificExtensions(filePath: string, extensions: string[]) {
    return extensions.some((extension) => filePath.endsWith(extension));
}

function getFilesWithSpecificExtensionsInDir(dir: string, extensions: string[]): string[] {
    const files = fs.readdirSync(dir);
    const matchedFiles = [];
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            matchedFiles.push(...getFilesWithSpecificExtensionsInDir(filePath, extensions));
        } else {
            if (isFileWithSpecificExtensions(filePath, extensions)) {
                matchedFiles.push(filePath);
            }
        }
    }
    return matchedFiles;
}


function renderTwigFile(filePath: string, base?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        renderFile(filePath, {
            settings: {
                views: base,
                "twig options": null,
            }
        }, (err, html) => {
            if (err) {
                reject(err);
            } else {
                resolve(html);
            }
        })
    });
}

export async function handleTwigDevRequest(req: Connect.IncomingMessage, res: ServerResponse<IncomingMessage>, config: TwigPagesConfig) {
    if (req.url && req.url.endsWith('.html')) {
        const pageName = req.url.replace(/^\//, '').replace(/\.html$/, '');
        let twigPath = path.join(config.dir || './src/pages', `${pageName}.twig`);
        if (!fs.existsSync(twigPath)) {
            twigPath = path.join(config.dir || './src/pages', `${pageName}.twig.html`);
        }
        if (fs.existsSync(twigPath)) {
            try {
                const html = await renderTwigFile(twigPath, config.root || './src');
                res.setHeader('Content-Type', 'text/html');
                res.end(html);
                return true; // handled
            } catch (err) {
                res.statusCode = 500;
                res.end(`Twig render error: ${err}`);
                return true;
            }
        }
    }
    return false; // not handled
}
export async function renderAndWriteFilesInDir(dir: string, extensions: string[], outDir: string, base?: string) {
    const files = getFilesWithSpecificExtensionsInDir(dir, extensions);
    for (const filePath of files) {
        console.log(`Rendering ${filePath}...`);
        const html = await renderTwigFile(filePath, base);
        const relative = path.relative(dir, filePath);
        const outPath = path.join(outDir, relative
            .replace(/^src\/pages\//, '')
            .replace(/\.twig\.html$/, '.html')
            .replace(/\.twig$/, '.html'));

        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, html, 'utf8');
        console.log(`Written: ${outPath}`);
    }
}