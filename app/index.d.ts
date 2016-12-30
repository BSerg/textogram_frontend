interface IToMarkdown {
    (input: string, options?: any): string
}

declare var toMarkdown: IToMarkdown;

declare module 'to-markdown' {
    export = toMarkdown;
}
