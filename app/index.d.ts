declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

interface IToMarkdown {
    (input: string, options?: any): string
}

declare var toMarkdown: IToMarkdown;

declare module 'to-markdown' {
    export = toMarkdown;
}

declare var twttr: any;

declare var instgrm: any;

declare const VK_APP_ID: string;


declare class ClientJS {
    getFingerprint(): string
}

