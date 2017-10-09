import * as React from 'react';
import * as moment from 'moment';
import * as marked from 'marked';
import {connect} from 'react-redux';
import {readNotification} from './actions';

import '../../../styles/profile/profile_management_notifications.scss';

export class ProfileNotification extends React.Component<any,any> {
    
    newTimeout: any;
    constructor(props: any) {
        super(props);
        this.state = {isRead: props.item.is_read, isNew: true};
        this.setNotNew = this.setNotNew.bind(this);
    }

    hoverHandle() {
        if (this.state.isRead) {
            return;
        }
        this.setState({isRead: true}, () => {
            this.props.read(this.props.item.id);
        });
        
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

    setNotNew() {
        this.setState({isNew: false});
    }

    componentDidMount() {
        this.newTimeout = setTimeout(this.setNotNew, 0);
    }

    componentWillUnmount() {
        this.newTimeout && clearTimeout(this.newTimeout);
    }

    render() {
        let {isRead, isNew} = this.state;
        let dateStr = this.getDateRepresentation();
        let textStr = this.getTextRepresentation();
        return <div className={"profile_notification" + (isRead ? "" : " unread") + (isNew ? " new" : "") } 
                    onMouseMove={this.hoverHandle.bind(this)}>
            <div className="notification_date">{dateStr}</div>
            <div className="notification_text" dangerouslySetInnerHTML={ {__html: textStr} }></div>
        </div>;
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        read: (id: any) => { dispatch(readNotification(id)) }
    }
}

export default connect(null, mapDispatchToProps)(ProfileNotification);
