import * as events from 'events';
import {Constants} from '../constants';

class MediaQueryServiceClass extends events.EventEmitter{

    private eventName: string = 'mediaQueryEvent';

    private isDesktop: boolean;

    constructor() {
        super();
        this.isDesktop = window.innerWidth >= Constants.desktopWidth;
        this.resizeHandler = this.resizeHandler.bind(this);

        window.addEventListener('resize', this.resizeHandler);
    }

    resizeHandler() {
        let isDesktop = window.innerWidth >= Constants.desktopWidth;
        if (isDesktop != this.isDesktop) {
            this.isDesktop = isDesktop;
            this.emit(this.eventName, this.isDesktop);
        }

    }

    listen(callback: ( isDesktop: boolean ) => any) {
        this.on(this.eventName, callback);
    }

    getIsDesktop(): boolean {
        return this.isDesktop;
    }
}

export const MediaQuerySerice = new MediaQueryServiceClass();
