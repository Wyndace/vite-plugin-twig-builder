import twigPkg from 'twig';
const {cache, renderFile } = twigPkg;
import fs from 'fs';
import path from 'path';
import { ServerResponse, IncomingMessage } from 'http';
import { Connect} from 'vite';
import TwigPagesConfig from '../types/TwigPagesConfig';

cache(false);

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

export async function handleTwigDevRequest(
    req: Connect.IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    config: TwigPagesConfig
): Promise<boolean> {
    const url = req.url || '';
    if (url === '/' || url === '/index.html' || url.endsWith('.html')) {
        const page = url === '/' ? 'index' : url.replace(/^\//, '').replace(/\.html$/, '');
        const tries = config.extensions.map(ext => `${page}${ext}`);
        let twigPath: string | null = null;
        for (const name of tries) {
            const p = path.resolve(config.dir, name);
            if (fs.existsSync(p)) {
                twigPath = p;
                break;
            }
        }
        if (twigPath) {
            try {
                const html = await renderTwigFile(twigPath, config.root);
                res.setHeader('Content-Type', 'text/html');
                res.end(html);
            } catch (e) {
                res.statusCode = 500;
                res.end(`Twig render error: ${e}`);
            }
            return true;
        }
    }
    return false;
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