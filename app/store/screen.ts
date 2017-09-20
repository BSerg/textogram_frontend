import {ACTIONS} from './constants';

export function setScreenSize(width: number|string, height: number|string) {
    return {type: ACTIONS.SCREEN_SET_SIZE, width, height};
}

const initialState = {
    width: 1024,
    height: 768,
    isDesktop: true
}

export default function screen(state=initialState, action: any) {
    switch(action.type) {
        case (ACTIONS.SCREEN_SET_SIZE):
            let width = parseInt(action.width, 10) || 0,
            height = parseInt(action.height, 10) || 0,
            isDesktop = width >= 1024;
            return {...state, width, height, isDesktop};
        default:
            return state;
    }
}