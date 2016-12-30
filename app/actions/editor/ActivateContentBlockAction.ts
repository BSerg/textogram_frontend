import * as React from 'react';
import Action from '../Action';

export const ACTIVATE_CONTENT_BLOCK = 'activate_content_block';
export const DEACTIVATE_CONTENT_BLOCK = 'deactivate_content_block';
export interface IActivateContentBlockActionData {
    id: string
}

export const ActivateContentBlockAction = new Action();

ActivateContentBlockAction.register(ACTIVATE_CONTENT_BLOCK, (store, data: IActivateContentBlockActionData) => {
    store.id = data.id;
});

