import Action from '../Action';

export const OPEN_MODAL = 'open_modal';
export const CLOSE_MODAL = 'close_modal';
export const BACK_MODAL = 'back_modal';

type State = 'opened' | 'closed';


export const ModalAction = new Action();


ModalAction.register(OPEN_MODAL, (store, data: {content: any}) => {
    store.content = data.content;
    store.contentHistory = store.contentHistory || [];
    store.contentHistory.push(data.content);
});

ModalAction.register(CLOSE_MODAL, (store, data: any) => {
    store.content = null;
});

ModalAction.register(BACK_MODAL, (store, data: any) => {
    if (store.contentHistory.length >= 2) {
        store.content = store.contentHistory[store.contentHistory.length - 1];
    } else {
        store.content = null;
        ModalAction.do(CLOSE_MODAL, null);
    }
});

