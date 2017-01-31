import * as React from 'react';
import Action from './Action';
import {Constants} from '../constants';

export const RESIZE = 'resize';

class MediaQueryActionClass extends Action {
    constructor() {
        super({isDesktop: false});
    }
}

export const MediaQueryAction = new MediaQueryActionClass();

MediaQueryAction.register(RESIZE, (store) => {
    // console.log('resoyz');
    // console.log(window.innerWidth);
    store.isDesktop = window.innerWidth >= Constants.desktopWidth;
});