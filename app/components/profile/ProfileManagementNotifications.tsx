import * as React from 'react';

import {api} from '../../api';
import axios from 'axios';
import Loading from '../shared/Loading';

import {UserNotificationAction, CHECK_NOTIFICATIONS, DECREASE_NOTIFICATIONS_NUMBER} from '../../actions/user/UserNotificationAction';

import * as moment from 'moment';
import * as marked from 'marked';



import '../../styles/profile/profile_management_notifications.scss';

interface INotification {
    id: number | string;
    date: string;
    text: string;
    is_read: boolean;
}

interface INotificationProps {
    item: INotification;
}

interface INotificationState {
    isRead?: boolean;
    isUpdating?: boolean;
    isNew?: boolean;
    // newTimeout?: number;
}

class ProfileNotification extends React.Component<INotificationProps, INotificationState> {

    newTimeout: number;

    constructor() {
        super();
        this.state = {isRead: true, isUpdating: false, isNew: true};
        this.setNotNew = this.setNotNew.bind(this);
    }

    getDateRepresentation(): string {
        try {
            return moment(this.props.item.date).format('DD.MM.YY, hh:mm');
        }
        catch (error) {
            return '';
        }
    }

    getTextRepresentation(): string {
        try {
            return marked(this.props.item.text);
        }
        catch (error) {
            return this.props.item.text;
        }
    }

    hoverHandle() {
        if (!this.state.isRead && !this.state.isUpdating) {
            this.setState({isUpdating: true}, () => {
                api.patch('/notifications/' + this.props.item.id + '/', {is_read: true}).then((response) => {
                    this.setState({isRead: response.data.is_read}, () => {
                        UserNotificationAction.do(DECREASE_NOTIFICATIONS_NUMBER, null);
                    });

                }).catch((error) => {})
            });
        }
    }

    setNotNew() {
        this.setState({isNew: false});
    }

    componentDidMount() {
        this.setState({isRead: this.props.item.is_read});
        this.newTimeout = window.setTimeout(this.setNotNew, 0);
    }

    componentWillUnmount() {
        this.newTimeout && window.clearTimeout(this.newTimeout);
    }

    render() {
        let dateStr = this.getDateRepresentation();
        let textStr = this.getTextRepresentation();
        return (<div className={"profile_notification" + (this.state.isRead ? "" : " unread") + (this.state.isNew ? " new" : "")} onMouseMove={this.hoverHandle.bind(this)}>
            <div className="notification_date">{dateStr}</div>
            <div className="notification_text" dangerouslySetInnerHTML={ {__html: textStr} }></div>
        </div>)
    }
}


interface INotificationsState {
    items?: any[];
    isLoading?: boolean;
    // cancelSource?: any;
    nextUrl?: string;
}

export default class ProfileManagementNotifications extends React.Component<any, INotificationsState> {

    refs: {
        main: HTMLDivElement;
    };

    cancelSource: any;

    constructor() {
        super();

        this.state = {items: [], isLoading: false, nextUrl: ''};
        this.handleScroll = this.handleScroll.bind(this);
        this.checkNewItems = this.checkNewItems.bind(this);
    }

    loadItems(more: boolean = false, newItems: boolean = false) {

        if (this.state.isLoading) {
            return;
        }
        let items = more ? this.state.items : [];

        this.cancelSource && this.cancelSource.cancel();

        this.cancelSource = axios.CancelToken.source();

        this.setState({isLoading: true, items: items}, () => {

            let apiUrl = (more && !newItems) ? this.state.nextUrl : '/notifications/';

            let requestParams = (newItems && items.length ) ? { 'new_after': items[0].id } : {};



            api.get(apiUrl, {cancelToken: this.cancelSource.token, params: requestParams}).then((response: any) => {

                let stateData: any = { isLoading: false };

                if (newItems) {
                    items = response.data.next ? response.data.results : response.data.results.concat(items);
                }
                else {
                    items = items.concat(response.data.results);
                    stateData.nextUrl = response.data.next;
                }
                stateData.items = items;
                // items = newItems ? response.data.results.concat(items) : items.concat(response.data.results);
                this.setState(stateData);
            }).catch((error) => {
                this.setState({isLoading: false});
            });
        });
    }

    checkNewItems() {
        if (UserNotificationAction.getStore().count && UserNotificationAction.getStore().last &&
            (!this.state.items.length || (this.state.items[0].id < UserNotificationAction.getStore().last.id) )
        ) {
            this.loadItems(true, true);
        }
    }

    handleScroll() {
        let rect: ClientRect = this.refs.main.getBoundingClientRect();
        if ((rect.bottom <= window.innerHeight) && !this.state.isLoading && this.state.nextUrl) {
            this.loadItems(true, false);
        }
    }

    componentDidMount() {
        this.loadItems();
        window.addEventListener('scroll', this.handleScroll);
        UserNotificationAction.onChange(CHECK_NOTIFICATIONS, this.checkNewItems);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        UserNotificationAction.unbind(CHECK_NOTIFICATIONS, this.checkNewItems);
        if (this.cancelSource) {
            this.cancelSource.cancel();
        }
    }

    render() {

        return (
            <div ref="main">
                {
                    this.state.items.map((item: INotification, index) => {
                        return (<ProfileNotification item={item} key={item.id}/>)
                    })
                }

                { this.state.isLoading ? <Loading /> : null }

            </div>)
    }
}