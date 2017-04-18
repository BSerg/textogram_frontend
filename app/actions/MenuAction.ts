import * as React from 'react';
import Action from './Action';
import {MediaQuerySerice} from '../services/MediaQueryService';

export const TOGGLE = 'toggle';

class MenuActionClass extends Action{

    constructor() {
        super({open: Boolean(parseInt(localStorage.getItem('menuOpen'))) && !process.env.IS_LENTACH });
        let open = Boolean(parseInt(localStorage.getItem('menuOpen')) && !process.env.IS_LENTACH );
        document.body.style.marginTop = (open && MediaQuerySerice.getIsDesktop()) ? '55px' : '0';
        document.body.style.height = (open && MediaQuerySerice.getIsDesktop()) ? 'calc(100% - 55px)' : '100%';

    }
}

export const MenuAction = new MenuActionClass();

MenuAction.register(TOGGLE, (store, open: boolean = false) => {
    store.open = open;
    document.body.style.marginTop = (open && MediaQuerySerice.getIsDesktop()) ? '55px' : '0';
    document.body.style.height = (open && MediaQuerySerice.getIsDesktop()) ? 'calc(100% - 55px)' : '100%';

    localStorage.setItem('menuOpen', open ? '1' : '0');
});
