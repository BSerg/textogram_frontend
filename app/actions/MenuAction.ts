import * as React from 'react';
import Action from './Action';
import {MediaQuerySerice} from '../services/MediaQueryService';

export const TOGGLE = 'toggle';

class MenuActionClass extends Action{

    constructor() {
        super({open: false});
    }
}

export const MenuAction = new MenuActionClass();

MenuAction.register(TOGGLE, (store, open: boolean = false) => {
    store.open = open;
    document.body.style.marginTop = (open && MediaQuerySerice.getIsDesktop()) ? '55px' : '0';
    document.body.style.height = (open && MediaQuerySerice.getIsDesktop()) ? 'calc(100% - 55px)' : '100%';
});
