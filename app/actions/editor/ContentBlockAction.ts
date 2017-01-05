import * as React from 'react';
import Action from '../Action';
import {ContentAction, DELETE_CONTENT} from './ContentAction';
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from '../shared/PopupPanelAction';

export const ACTIVATE_CONTENT_BLOCK = 'activate_content_block';
export const DEACTIVATE_CONTENT_BLOCK = 'deactivate_content_block';
export const DELETE_CONTENT_BLOCK = 'delete_content_block';

export interface IActivateContentBlockActionData {
    id: string
}

export const ContentBlockAction = new Action();

ContentBlockAction.register(ACTIVATE_CONTENT_BLOCK, (store, data: IActivateContentBlockActionData) => {
    store.id = data.id;
});

ContentBlockAction.register(DEACTIVATE_CONTENT_BLOCK, (store, data: any) => {
    store.id = -1;
});

ContentBlockAction.register(DELETE_CONTENT_BLOCK, (store, data: {id: string}) => {
    store.forDelete = {id: data.id};
});

