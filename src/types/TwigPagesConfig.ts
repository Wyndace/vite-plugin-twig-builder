export default interface TwigPagesConfig {
    root: string;
    dir: string;
    outDir: string;
    extensions: string[];
    ignoredPaths?: string[],
}