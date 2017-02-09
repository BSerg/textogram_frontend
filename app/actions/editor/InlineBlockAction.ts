import * as React from "react";
import Action from "../Action";

export const OPEN_INLINE_BLOCK = 'open_inline_block';
export const CLOSE_INLINE_BLOCK = 'close_inline_block';


export const InlineBlockAction = new Action();

InlineBlockAction.register(OPEN_INLINE_BLOCK, (store, data: {position: number, content: any}) => {
    Object.assign(store, data);
});

InlineBlockAction.register(CLOSE_INLINE_BLOCK, (store, data: any) => {
    store = {};
});
