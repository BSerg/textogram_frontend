import * as React from "react";
import Action from "../Action";
import {api} from "../../api";
import {BlockContentTypes} from "../../constants";
const uuid4 = require('uuid/v4');

export const SWAP_CONTENT = 'swap_content';
export const CREATE_CONTENT = 'create_content';
export const RESET_CONTENT = 'reset_content';
export const UPDATE_CONTENT = 'update_content';
export const DELETE_CONTENT = 'delete_content';
export const UPDATE_TITLE_CONTENT = 'update_title_content';
export const UPDATE_COVER_CONTENT = 'update_cover_content';

export interface IContentData {
    id?: string
    type: BlockContentTypes
    [prop: string]: any
}

class ContentActionClass extends Action {
    private saveContentDelay: number;

    constructor() {
        super({
            content: {title: null, cover: null, blocks: []},
            contentBlockMap: {}
        });
    }

    saveContent(store: any, data: {articleId: number, autoSave?: boolean}) {
        window.clearTimeout(this.saveContentDelay);
        return new Promise((resolve, reject) => {
            if (data.autoSave) {
                this.saveContentDelay = window.setTimeout(() => {
                    api.patch(`/articles/editor/${data.articleId}/`, {content: store.content}).then((response: any) => {
                        console.log(response);
                        resolve(response.data.content);
                    }).catch((err: any) => {
                        reject(err);
                    });
                }, 1000);
            } else {
                resolve('OK');
            }
        });
    }
}

export const ContentAction = new ContentActionClass();

ContentAction.registerAsync(RESET_CONTENT, (store, data: {articleId: number, autoSave?: boolean, content: {title: string|null, cover: {id: number, image: string}|null, blocks: IContentData[]}}) => {
    store.content = data.content;
    store.content.blocks.forEach((item: IContentData) => {
        store.contentBlockMap[item.id] = item;
    });
    return ContentAction.saveContent(store, {articleId: data.articleId, autoSave: data.autoSave});
});

ContentAction.register(CREATE_CONTENT, (store, data: {contentBlock: IContentData, position: number}) => {
    data.contentBlock.id = uuid4();
    store.content.blocks.splice(data.position, 0, data.contentBlock);
    store.content.blocks.forEach((item: IContentData) => {
        store.contentBlockMap[item.id] = item;
    });
});

ContentAction.register(UPDATE_CONTENT, (store, data: {contentBlock: IContentData}) => {
    if (store.contentBlockMap[data.contentBlock.id]) {
        Object.assign(store.contentBlockMap[data.contentBlock.id], data.contentBlock);
    }
});

ContentAction.register(DELETE_CONTENT, (store, data: {id: string}) => {
    let deletingItem = store.contentBlockMap[data.id];
    if (deletingItem) {
        store.content.blocks.splice(store.content.blocks.indexOf(deletingItem), 1);
        delete store.contentBlockMap[data.id];
    }
    console.log(store)
});

ContentAction.register(UPDATE_TITLE_CONTENT, (store, data: {articleId: number, title: string}) => {
    store.content.title = data.title;
});

ContentAction.register(
    UPDATE_COVER_CONTENT,
    (
        store,
        data: {
            articleId: number,
            cover: {id: number, image: string} | null
        }
    ) => {
    store.content.cover = data.cover;
});

ContentAction.register(SWAP_CONTENT, (store, data: {position: number}) => {
    if (data.position >= 1 && data.position < store.content.blocks.length) {
        let swappedBlock = store.content.blocks.splice(data.position, 1)[0];
        store.content.blocks.splice(data.position - 1, 0, swappedBlock);
    }
});
