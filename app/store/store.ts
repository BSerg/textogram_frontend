import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import userData from './user/user';
import userNotifications from './user/userNotifications';
import menu from './menu';
import screen from './screen';

import {ACTIONS} from './constants';

const middleware = applyMiddleware(thunk);
const reducers = combineReducers({userData, userNotifications, menu, screen});

export const store = createStore(reducers, middleware);
