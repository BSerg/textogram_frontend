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
import {MediaQuerySerice} from "../services/MediaQueryService";

export default class Base extends React.Component<any, any> {
    private intervalId: number;

    constructor(props: any) {
        super(props);
        this.state = {
            isDesktop: MediaQuerySerice.getIsDesktop()
        }
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
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

    handleMediaQuery(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    componentDidMount() {
        UserAction.onChange([GET_ME, LOGIN, LOGOUT], this.startNotifications.bind(this));
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    componentWillUnmount() {
        UserAction.unbind([GET_ME, LOGIN, LOGOUT], this.startNotifications.bind(this));
        MediaQuerySerice.unbind(this.handleMediaQuery);
    }

    render() {
        return (
            <div className="container">
                <Menu />
                <div className="content">
                    {this.props.children}
                </div>
                <MenuButton/>
                {!this.state.isDesktop ? <PopupPanel/> : null}
                <Notification/>
                <Modal/>
            </div>
        )
    }
}