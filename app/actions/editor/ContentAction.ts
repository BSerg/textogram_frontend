import * as React from "react";
import Action from "../Action";
import {api} from "../../api";
import {BlockContentTypes, Captions} from "../../constants";
import {NotificationAction, SHOW_NOTIFICATION} from "../shared/NotificationAction";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "./ContentBlockAction";
const uuid4 = require('uuid/v4');

export const RESET_CONTENT = 'reset_content';
export const SWAP_CONTENT_BLCK = 'swap_content';
export const MOVE_UP_CONTENT_BLCK = 'move_up_content';
export const MOVE_DOWN_CONTENT_BLCK = 'move_down_content';
export const CREATE_CONTENT_BLCK = 'create_content';
export const UPDATE_CONTENT_BLCK = 'update_content';
export const SOFT_DELETE_CONTENT_BLCK = 'soft_delete_content';
export const RESTORE_CONTENT_BLCK = 'restore_content';
export const DELETE_CONTENT_BLCK = 'delete_content';
export const UPDATE_TITLE_CONTENT = 'update_title_content';
export const UPDATE_THEME_CONTENT = 'update_theme_content';
export const UPDATE_COVER_CONTENT = 'update_cover_content';
export const UPDATE_AUTO_SAVE = 'update_auto_save';

export interface IContentData {
    id?: string
    type: BlockContentTypes
    __meta?: any
    [prop: string]: any
}

interface IContent {
    title: string|null,
    cover: {id: number, image: string}|null,
    blocks: IContentData[]
}

class ContentActionClass extends Action {
    private saveContentDelay: number;

    constructor() {
        super({
            articleId: null,
            autoSave: false,
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
                        console.log(err);
                        reject(err);
                        NotificationAction.do(SHOW_NOTIFICATION, {content: Captions.editor.saving_error, type: 'error'})
                    });
                }, 1000);
            } else {
                resolve('OK');
            }
        });
    }
}

export const ContentAction = new ContentActionClass();

ContentAction.register(UPDATE_AUTO_SAVE, (store, autoSave: boolean) => {
   store.autoSave = autoSave;
});

ContentAction.registerAsync(RESET_CONTENT, (store, data: {articleId: number, autoSave?: boolean, content: IContent}) => {
    store.articleId = data.articleId;
    store.autoSave = data.autoSave;
    store.content = data.content;
    store.content.blocks.forEach((item: IContentData) => {
        store.contentBlockMap[item.id] = item;
    });
    return ContentAction.saveContent(store, {articleId: data.articleId, autoSave: data.autoSave});
});

ContentAction.register(CREATE_CONTENT_BLCK, (store, data: {contentBlock: IContentData, position: number}) => {
    data.contentBlock.id = uuid4();
    store.content.blocks.splice(data.position, 0, data.contentBlock);
    store.content.blocks.forEach((item: IContentData) => {
        store.contentBlockMap[item.id] = item;
    });
    ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: data.contentBlock.id});
});

ContentAction.register(UPDATE_CONTENT_BLCK, (store, data: {contentBlock: IContentData}) => {
    if (store.contentBlockMap[data.contentBlock.id]) {
        Object.assign(store.contentBlockMap[data.contentBlock.id], data.contentBlock);
    }
});

ContentAction.register(SOFT_DELETE_CONTENT_BLCK, (store, data: {id: string}) => {
    let deletingItem = store.contentBlockMap[data.id];
    if (deletingItem) {
        deletingItem.__meta = deletingItem.__meta || {};
        deletingItem.__meta.deleted = true;
    }
});

ContentAction.register(RESTORE_CONTENT_BLCK, (store, data: {id: string}) => {
    let deletingItem = store.contentBlockMap[data.id];
    if (deletingItem) {
        deletingItem.__meta = deletingItem.__meta || {};
        deletingItem.__meta.deleted = false;
    }
});

ContentAction.register(DELETE_CONTENT_BLCK, (store, data: {id: string}) => {
    let deletingItem = store.contentBlockMap[data.id];
    if (deletingItem) {
        store.content.blocks.splice(store.content.blocks.indexOf(deletingItem), 1);
        delete store.contentBlockMap[data.id];
    }
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
            cover: {id: number, image: string} | null,
            coverClipped?: {id: number, image: string} | null
        }
    ) => {
    store.content.cover = data.cover;
    store.content.cover_clipped = data.coverClipped;
});

ContentAction.register(UPDATE_THEME_CONTENT, (store, data: {articleId: number, invertedTheme: boolean}) => {
    store.content.inverted_theme = data.invertedTheme;
});

ContentAction.register(SWAP_CONTENT_BLCK, (store, data: {position: number}) => {
    if (data.position >= 1 && data.position < store.content.blocks.length) {
        let swappedBlock = store.content.blocks.splice(data.position, 1)[0];
        store.content.blocks.splice(data.position - 1, 0, swappedBlock);
    }
});

ContentAction.register(MOVE_UP_CONTENT_BLCK, (store, data: {id: string}) => {
    if (store.contentBlockMap[data.id] != undefined) {
        let contentBlock = store.contentBlockMap[data.id];
        let position = store.content.blocks.indexOf(contentBlock);
        if (position >= 1 && position <= store.content.blocks.length - 1) {
            let swappedBlock = store.content.blocks.splice(position, 1)[0];
            store.content.blocks.splice(position - 1, 0, swappedBlock);
        }
    }

});

ContentAction.register(MOVE_DOWN_CONTENT_BLCK, (store, data: {id: string}) => {
    if (store.contentBlockMap[data.id] != undefined) {
        let contentBlock = store.contentBlockMap[data.id];
        let position = store.content.blocks.indexOf(contentBlock);
        if (position >= 0 && position < store.content.blocks.length - 1) {
            let swappedBlock = store.content.blocks.splice(position, 1)[0];
            store.content.blocks.splice(position + 1, 0, swappedBlock);
        }
    }
});


