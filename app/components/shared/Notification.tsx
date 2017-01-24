import * as React from 'react';
import {NotificationAction, SHOW_NOTIFICATION, CLOSE_NOTIFICATION} from '../../actions/shared/NotificationAction';
import '../../styles/shared/notification.scss';

const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');


interface INotificationProps {
    autoClose?: boolean
    autoCloseDelay?: number
}

interface INotificationState {
    opened?: boolean
    content?: any
    contentHistory?: any[]
}

export default class Notification extends React.Component<INotificationProps, INotificationState> {
    private closeTimeout: number;

    constructor(props: any) {
        super(props);
        this.closeTimeout = -1;
        this.state = {
            opened: false,
            content: null,
            contentHistory: []
        }
    }

    static defaultProps = {
        autoClose: true,
        autoCloseDelay: 5000
    };

    handleOpen() {
        console.log('SHOW NOTIFICATION');
        window.clearTimeout(this.closeTimeout);
        let store: any = NotificationAction.getStore();
        let content = store.content;
        this.state.contentHistory.push(content);
        this.setState({opened: true, content: content, contentHistory: this.state.contentHistory}, () => {
            if (this.props.autoClose) {
                this.closeTimeout = window.setTimeout(() => {
                    this.handleClose();
                }, this.props.autoCloseDelay)
            }
        });
    }

    handleClose() {
        this.setState({opened: false, content: null});
    }

    componentDidMount() {
        NotificationAction.onChange(SHOW_NOTIFICATION, this.handleOpen.bind(this));
        NotificationAction.onChange(CLOSE_NOTIFICATION, this.handleClose.bind(this));
    }

    componentWillUnmount() {
        NotificationAction.unbind(SHOW_NOTIFICATION, this.handleOpen.bind(this));
        NotificationAction.unbind(CLOSE_NOTIFICATION, this.handleClose.bind(this));
    }

    render() {
        let className = 'notification';
        if (this.state.opened) {
            className += ' opened';
        }
        return (
            <div className={className}>
                {this.state.content}
                <CloseIcon onClick={this.handleClose.bind(this)} className="notification__close"/>
            </div>
        )
    }
}