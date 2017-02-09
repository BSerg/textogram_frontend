import * as events from 'events';


export default class Service extends events.EventEmitter {

    eventName: string;

    constructor(eventName: string) {
        super();
        this.eventName = eventName;
        this.setMaxListeners(0);
    }

    listen(callback: (data: any) => any) {
        this.on(this.eventName, callback);
    }

    unbind(callback: (data: any) => any) {
        this.removeListener(this.eventName, callback);
    }

}