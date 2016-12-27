import * as React from 'react';
import Action from '../Action';
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from '../shared/ModalAction'
import {BlockHandlerModal} from '../../components/editor/BlockHandlerModal';

export const OPEN_BLOCK_HANDLER_MODAL = 'open_block_handler_modal';


export const BlockHandlerAction = new Action();

BlockHandlerAction.register(OPEN_BLOCK_HANDLER_MODAL, (store, data: {articleSlug: string, blockPosition: number}) => {
    let content = React.createElement(BlockHandlerModal, {articleSlug: data.articleSlug, blockPosition: data.blockPosition});
    ModalAction.do(OPEN_MODAL, {content: content});
});

