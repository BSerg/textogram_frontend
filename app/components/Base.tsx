import * as React from 'react';
import MenuButton from './shared/MenuButton';
import Modal from './shared/Modal';
import PopupPanel from './shared/PopupPanel';
import Notification from './shared/Notification';
import Menu from './Menu';

import {UserAction, GET_ME, LOGIN, LOGOUT} from '../actions/user/UserAction';
import {NotificationAction, CHECK} from '../actions/NotificationAction';

import {Constants} from '../constants';

import '../styles/base.scss';

export default class Base extends React.Component<any, any> {
    private intervalId: number;

    constructor(props: any) {
        super(props);
    }


    startNotifications() {
        if (!UserAction.getStore().user || this.intervalId != null) return;
        NotificationAction.do(CHECK, null);
        this.intervalId = window.setInterval(() => {
            NotificationAction.do(CHECK, null);
        }, Constants.notificationIntervalTime);
    }

    stopNotifications() {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
    }

    componentDidMount() {
        UserAction.onChange(GET_ME, this.startNotifications.bind(this));
        UserAction.onChange(LOGIN, this.startNotifications.bind(this));
        UserAction.onChange(LOGOUT, this.stopNotifications.bind(this));
    }

    render() {
        return (
            <div className="container">
                <Menu />
                <div className="content">
                    {this.props.children}
                </div>
                <MenuButton/>
                <PopupPanel/>
                <Notification/>
                <Modal/>
            </div>
        )
    }
}