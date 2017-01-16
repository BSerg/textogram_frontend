import Action from '../Action';

export const OPEN_MODAL = 'open_modal';
export const CLOSE_MODAL = 'close_modal';

type State = 'opened' | 'closed';


export const ModalAction = new Action();


ModalAction.register(OPEN_MODAL, (store, data: {content: any}) => {
    store.content = data.content
});


ModalAction.register(CLOSE_MODAL, (store, data: any) => {
    store.content = null;
});

