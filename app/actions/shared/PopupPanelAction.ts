import Action from '../Action';

export const OPEN_POPUP = 'open_popup';
export const CLOSE_POPUP = 'close_popup';


export const PopupPanelAction = new Action();


PopupPanelAction.register(OPEN_POPUP, (store, data: {content: any}) => {
    store.content = data.content
});


PopupPanelAction.register(CLOSE_POPUP, (store, data?: {content: any}) => {
    store.content = null;
});

