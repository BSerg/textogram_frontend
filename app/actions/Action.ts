import {Dispatcher} from 'flux';
import * as events from 'events';


interface IChainData {
    action: string
    data: any
    id?: string
}

interface IChain {
    (...data: IChainData[]): void
}

interface IAction {
    chain: (data: IChainData[]) => void
}

export default class Action extends events.EventEmitter {
    private dispatcher: any;
    private store: {};

    constructor(initStore: {} = {}) {
        super();
        this.dispatcher = new Dispatcher();
        this.store = initStore;
        this.setMaxListeners(0);
    }

    private generateUID() {
        return 'uid' + Math.random().toString().substr(2, 7);
    }

    getUpdateEventName(action: string): string {
        return action + '__change';
    }

    private getStartEventName(action: string): string {
        return action + '__start';
    }

    private getUpdateUIDEventName(action: string, uid: string): string {
        return this.getUpdateEventName(action) + '#' + uid;
    }

    private getErrorUIDEventName(action: string, uid: string): string {
        return this.getUpdateEventName(action) + '#' + uid + '__error';
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
        this.dispatcher.register((payload: {action: string, data: any, uid?: string}) => {
            switch (payload.action) {
                case action:
                    this.emit(this.getStartEventName(action));
                    callback(this.store, payload.data).then((data: any) => {
                        this.emit(this.getUpdateEventName(action), data);
                        if (payload.uid) {
                            this.emit(this.getUpdateUIDEventName(action, payload.uid), data);
                        }
                    }).catch((error: any) => {
                        this.emit(this.getErrorUIDEventName(action, payload.uid), error);
                    });
                    break
            }
        })
    }

    onStart(action: string, callback: () => any) {
        this.on(this.getStartEventName(action), callback);
    }

    onChange(action: string | string[], callback: () => any) {
        if (typeof action == 'string') {
            this.on(this.getUpdateEventName(action), callback);
        } else if (typeof action == 'object') {
            action.forEach((a) => {
                this.on(this.getUpdateEventName(a), callback);
            });
        }
    }

    unbind(action: string | string[], callback: () => any) {
        if (typeof action == 'string') {
            this.removeListener(this.getUpdateEventName(action), callback);
        } else if (typeof action == 'object') {
            action.forEach((a) => {
                this.removeListener(this.getUpdateEventName(a), callback);
            });
        }
    }

    do(action: string, data: any) {
        this.dispatcher.dispatch({action: action, data: data});
    }

    doAsync(action: string, data: any): Promise<any> {
        const uid = this.generateUID();
        let promise = new Promise((resolve, reject) => {
            this.on(this.getUpdateUIDEventName(action, uid), (data: any) => {
                resolve(data);
            });
            this.on(this.getErrorUIDEventName(action, uid), (error: any) => {
                reject(error);
            })
        });
        this.dispatcher.dispatch({action: action, data: data, uid: uid});
        return promise;
    }
}