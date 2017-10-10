
import {api} from '../../../api';
import {ACTIONS} from '../../../store/constants';

function getUrl(type: string): string {

    return 'api';
}

export function loadItems(type: string) {
    return (dispatch: any, getState: any) => {
        let state = getState().paymentLogs[type];
        if (!state || state.loading) {
            return;
        }
        let url = getUrl(type);
        if (!url) {
            return;
        }
        dispatch(loadItmesFromApi(url, type, state));

    }
}

export function loadMoreItems(type: string) {
    return (dispatch: any, getState: any) => {
        let state = getState().paymentLogs[type];

        if (!state || state.loading || !state.nextUrl) {
            return;
        }
        let url = state.nextUrl;
        if (!url) {
            return;
        }
        dispatch(loadItmesFromApi(url, type, state));

    }
}

function loadItmesFromApi(url: any, type: any, state: any)   {
    return (dispatch: any) => {

        let newState = {...state, loading: true};
        dispatch({type: ACTIONS.PAYMENT_LOGS_SET, key: type, state: newState});
        ///API GET

        setTimeout(() => {
            /*newState.items = newState.items.concat([{id: Math.random() * 100, text: 'Начислено' + Math.random() * 200 + 'TC', date: '2016-03-01'}]);
            newState.loading = false;
            newState.nextUrl = Math.random() > 0.3 ? 'sdasdsa' : null
            dispatch({type: ACTIONS.PAYMENT_LOGS_SET, key: type, state: newState});*/

            newState.loading = false;
            dispatch({type: ACTIONS.PAYMENT_LOGS_SET, key: type, state: newState});
        }, 1000)

    }
}