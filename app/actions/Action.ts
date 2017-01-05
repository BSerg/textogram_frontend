import {Dispatcher} from 'flux';
import * as events from 'events';


export default class Action extends events.EventEmitter {
    private dispatcher: any;
    private store: {};

    constructor(initStore: {} = {}) {
        super();
        this.dispatcher = new Dispatcher();
        this.store = initStore;
    }

    private getUpdateEventName(action: string): string {
        return action + '__change';
    }

    private getStartEventName(action: string): string {
        return action + '__start';
    }

    getStore(): any {
        return this.store;
    }

    register(action: string, callback: (store: any, data: any) => any) {
        this.dispatcher.register((payload: {action: string, data: any}) => {
            switch (payload.action) {
                case action:
                    callback(this.store, payload.data);
                    this.emit(this.getUpdateEventName(action));
                    break
            }
        })

    }

    registerAsync(action: string, callback: (store: any, data: any) => any) {
        this.dispatcher.register((payload: {action: string, data: any}) => {
            switch (payload.action) {
                case action:
                    this.emit(this.getStartEventName(action));
                    callback(this.store, payload.data).then(() => {
                        this.emit(this.getUpdateEventName(action));
                    });
                    break
            }
        })

    }

    onChange(action: string, callback: () => any) {
        this.on(this.getUpdateEventName(action), callback);
    }

    unbind(action: string, callback: () => any) {
        this.removeListener(this.getUpdateEventName(action), callback);
    }

    do(action: string, data: any) {
        this.dispatcher.dispatch({action: action, data: data});
    }
}