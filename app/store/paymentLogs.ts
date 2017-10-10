import {ACTIONS} from './constants';

const initialState: any = {
    profits: {
        items: [],
        loading: false,
        nextUrl: null,
    },
    withdrawals: {
        items: [],
        loading: false,
        nextUrl: null
    }
}

export default function paymentLogs(state=initialState, action: any) {
    switch(action.type) {
        case (ACTIONS.PAYMENT_LOGS_SET):
            let newState = {...state};
            console.log(action.state);
            newState[action.key] = {...action.state};
            // console.log(newState);
            return {...newState};
        default:
            return state;
    }

}