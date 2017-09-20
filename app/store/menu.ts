import {ACTIONS} from './constants';

const initalState = { open: false };

export const openMenu = () => {
    return {type: ACTIONS.MENU_OPEN, open: true}
}

export const closeMenu = () => {
    return {type: ACTIONS.MENU_OPEN, open: false}
}

export default function menu(state=initalState, action: any) {
    if (action.type == ACTIONS.MENU_OPEN) {
        return {...state, open: !!action.open};
    }
    return state;
}