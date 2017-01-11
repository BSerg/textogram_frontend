import * as React from 'react';
import Action from './Action';

export const TOGGLE = 'toggle';

class MenuActionClass extends Action{

    constructor() {
        super({open: false});
    }
}

export const MenuAction = new MenuActionClass();

MenuAction.register(TOGGLE, (store) => {
    store.open = !Boolean(store.open);
});
