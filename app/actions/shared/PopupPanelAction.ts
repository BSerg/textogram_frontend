import Action from '../Action';

export const OPEN_POPUP = 'open_popup';
export const CLOSE_POPUP = 'close_popup';
export const REPLACE_POPUP = 'replace_popup';
export const BACK_POPUP = 'back_popup';


export const PopupPanelAction = new Action({
    contentStack: [],
    contentMap: {}
});


PopupPanelAction.registerAsync(OPEN_POPUP, (store, data: {content: any, id?: string}) => {
    return new Promise((resolve, reject) => {
        const id = data.id || Math.random().toString().substr(2, 7);
        if (!store.contentMap[id]) {
            store.contentStack.push({id: id, content: data.content});
        }
        store.contentMap[id] = data.content;
        console.log('OPEN', store)
        resolve(id);
    });
});


PopupPanelAction.register(CLOSE_POPUP, (store, data?: {id: string}) => {
    if (data && data.id) {
        let item = store.contentMap[data.id];
        if (item) {
            store.contentStack.splice(store.contentStack.indexOf(item), 1);
            delete store.contentMap[data.id];
        }
    } else {
        store.contentStack = [];
        store.contentMap = {};
    }
});


PopupPanelAction.register(REPLACE_POPUP, (store, data?: {content: any}) => {
    store.content = data.content;
    console.log('REPLACE', store)
});


PopupPanelAction.register(BACK_POPUP, (store, data?: any) => {
    console.log('BACK POPUP');
    if (store.contentHistory.length) {
        store.content = store.contentHistory.pop();
    } else {
        store.content = null;
    }
    console.log(store)
});



