import * as events from 'events';


export default class Service extends events.EventEmitter {

    private eventName: string;
    private task: () => any;

    constructor(eventName: string, task: () => any) {
        super();
        this.eventName = eventName;
        this.task = task;


        // this.store = initStore;
        // this.setMaxListeners(0);
    }

    // register(action: string, callback: (store: any, data: any) => any) {
    //
    // }
}