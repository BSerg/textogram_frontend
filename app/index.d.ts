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