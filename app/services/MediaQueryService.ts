import {Constants} from "../constants";
import Service from "./Service";

class MediaQueryServiceClass extends Service{

    private isDesktop: boolean;
    private screenWidth: number;
    private screenHeight: number;

    constructor() {
        super('mediaQueryEvent');
        this.isDesktop = window.innerWidth >= Constants.desktopWidth;
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
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

    listen(callback: (isDesktop: boolean) => any) {
        super.listen(callback);
    }

    unbind(callback: (isDesktop: boolean) => any) {
        super.unbind(callback);
    }

    getIsDesktop(): boolean {
        return this.isDesktop;
    }

    getScreenWidth(): number {
        return this.screenWidth;
    }

    getScreenHeight(): number {
        return this.screenHeight;
    }

}

export const MediaQuerySerice = new MediaQueryServiceClass();
