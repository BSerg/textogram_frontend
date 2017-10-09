import * as React from 'react';
const NotificationIcon = require('-!babel-loader!svg-react-loader!../../assets/images/notification_icon.svg?name=NotificationIcon');
import {closeMenu} from '../../store/menu';


interface NotificationBlockPropsInterface {
    className?: string;
    router?: any;
    showZero?: boolean;
}

import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {Captions} from '../../constants';

export class NotificationBlock extends React.Component<NotificationBlockPropsInterface|any, any> {
    openNotifications() {
        this.props.history.push('/manage/notifications');
        !this.props.isDesktop && this.props.closeMenu();
    }

    render() {
        let {count, last, className} = this.props;
        return (
            <div className={"menu__notifications " + (className || "") + (!count ? " zero" : "")}
                 onClick={this.openNotifications.bind(this)}>
                <div className="menu__notifications_icon">
                    <NotificationIcon />
                    <div className="menu__notifications_count">{ count < 10 ? count : '9+'}</div>
                </div>
            </div>)
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    
    return {
        count: state.userNotifications.count || 0,
        isDesktop: state.screen.isDesktop,
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        closeMenu: () => {dispatch(closeMenu())},
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NotificationBlock));