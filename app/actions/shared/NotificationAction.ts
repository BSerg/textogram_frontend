import Action from '../Action';

export const SHOW_NOTIFICATION = 'show_notification';
export const CLOSE_NOTIFICATION = 'close_notification';


export const NotificationAction = new Action();


NotificationAction.register(SHOW_NOTIFICATION, (store, data: {content: any}) => {
    store.content = data.content;
});


NotificationAction.register(CLOSE_NOTIFICATION, (store, data?: {content: any}) => {
    store.content = null;
});

