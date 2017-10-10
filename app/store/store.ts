import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import userData from './user/user';
import userNotifications from './user/userNotifications';
import menu from './menu';
import screen from './screen';
import itemList from './itemList';
import authorData from './authorData';
import paymentLogs from './paymentLogs';

import {ACTIONS} from './constants';

const middleware = applyMiddleware(thunk);
const reducers = combineReducers({userData, userNotifications, menu, screen, itemList, authorData, 
    paymentLogs});

export const store = createStore(reducers, middleware);
