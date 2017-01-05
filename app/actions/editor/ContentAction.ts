import * as React from 'react';
import Action from '../Action';
import {api} from '../../api';


export const SWAP_CONTENT = 'swap_content';
export const CREATE_CONTENT = 'create_content';
export const UPDATE_CONTENT = 'update_content';
export const DELETE_CONTENT = 'delete_content';

export interface IContentData {id?: number, position?: number, article: number, [prop: string]: any}

class ContentActionClass extends Action {
    constructor() {
        super({
            content: [],
            contentMap: {},
            actionMap: {}
        });
    }
    updateStore(store: any, data: IContentData): void {
        if (data.id && data.article && store.contentMap[`${data.article}_${data.id}`]) {
            store.content.forEach((item: any) => {
                if (item.id == data.id) {
                    Object.assign(item, data);
                }
            });
            store.content.sort((i1: any, i2: any) => {
                return i1.position - i2.position;
            });
            Object.assign(store.contentMap[`${data.article}_${data.id}`], data);
        } else if (data.id && !store.contentMap[`${data.article}_${data.id}`]) {
            store.content.push(data);
            store.content.sort((i1: any, i2: any) => {
                return i1.position - i2.position;
            });
            store.contentMap[`${data.article}_${data.id}`] = data;
        }
    }
}

export const ContentAction = new ContentActionClass();

ContentAction.setMaxListeners(500);

ContentAction.registerAsync(SWAP_CONTENT, (store, data: {articleId: number, position: number}) => {
    console.log(data);
    return new Promise((resolve, reject) => {
        api.patch(`/articles/editor/${data.articleId}/swap/`, {position: data.position}).then((response: any) => {
            console.log(response);
            store.actionMap[SWAP_CONTENT] = data;
            console.log(store);
            resolve(response.data);
        }).catch((err: any) => {
            console.log(err);
            reject(err);
        });
    })
});

ContentAction.registerAsync(CREATE_CONTENT, (store, data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
        api.post('/articles/content/', data).then((response: any) => {
            console.log(response);
            store.actionMap[CREATE_CONTENT] = response.data;
            console.log(store);
            resolve(response.data);
        }).catch((err: any) => {
            console.log(err);
            reject(err);
        });
    })
});

ContentAction.registerAsync(UPDATE_CONTENT, (store, data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
        api.patch(`/articles/content/${data.id}/`, data).then((response: any) => {
            console.log(response);
            store.actionMap[UPDATE_CONTENT] = response.data;
            console.log(store);
            resolve(response.data);
        }).catch((err: any) => {
            reject(err);
        });
    });
});

ContentAction.registerAsync(DELETE_CONTENT, (store, data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
        api.delete(`/articles/content/${data.id}/`).then((response: any) => {
            console.log(response);
            store.actionMap[DELETE_CONTENT] = data;
            console.log(store);
            resolve('DELETED');
        }).catch((err: any) => {
            reject(err);
        });
    });
});