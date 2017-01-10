import * as React from 'react';
import Action from '../Action';
import {ContentAction, DELETE_CONTENT} from './ContentAction';
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from '../shared/PopupPanelAction';
import {api} from '../../api';

export const ADD_IMAGE = 'add_image';
export const UPDATE_IMAGE = 'update_image';
export const DELETE_IMAGE = 'delete_image';

export const PhotoContentBlockAction = new Action();

export interface IPhoto {
    id?: number
    content_item: number
    position: number
    image: File
    caption?: string
}

PhotoContentBlockAction.registerAsync(ADD_IMAGE, (store, data: IPhoto) => {
    return new Promise((resolve, reject) => {
        let formData = new FormData();
        formData.append('content_item', data.content_item);
        formData.append('position', data.position);
        formData.append('image', data.image);
        api.post('/article/content/photo/', formData).then((response: any) => {
            console.log(response);
            resolve(response.data);
            store.image = response.data;
        });
    });
});

PhotoContentBlockAction.registerAsync(UPDATE_IMAGE, (store, data: IPhoto) => {
    Object.assign(store, data);
    return new Promise((resolve, reject) => {
        api.patch(`/article/content/photo/${data.id}/`, data).then((response: any) => {
            console.log(response);
            store.image = response.data;
            resolve(response.data);
        });
    });
});

PhotoContentBlockAction.registerAsync(DELETE_IMAGE, (store, data: IPhoto) => {
    Object.assign(store, data);
    return new Promise((resolve, reject) => {
        api.delete(`/article/content/photo/${data.id}/`).then((response: any) => {
            console.log(response);
            store.image = data;
            resolve(response.data);
        });
    });
});


