import * as React from 'react';
import MenuButton from './shared/MenuButton';
import Modal from './shared/Modal';
import PopupPanel from './shared/PopupPanel';
import Notification from './shared/Notification';
import Menu from './menu/Menu';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {UserAction, GET_ME, LOGIN, LOGOUT} from '../actions/user/UserAction';
// import {UserNotificationAction, CHECK_NOTIFICATIONS} from '../actions/user/UserNotificationAction';
import {MenuAction, TOGGLE} from '../actions/MenuAction';
import {Constants} from '../constants';
import '../styles/base.scss';
import {MediaQuerySerice} from "../services/MediaQueryService";

import {Helmet} from 'react-helmet';

import {getUser} from '../store/user/user';
import {setScreenSize} from '../store/screen';

import {getNotifications} from '../store/user/userNotifications';

export class Base extends React.Component<any, any> {
    private intervalId: number;

    constructor(props: any) {
        super(props);
        this.state = {
            userNotificationsInterval: null,
        };

    }

    

    componentWillReceiveProps(nextProps: any) {
        if (!this.props.user && nextProps.user) {
            this.props.getNotifications();
        }
    }

    setScreenSize() {
        this.props.setScreenSize(window.innerWidth, window.innerHeight);
    }

    componentWillMount() {
        if (process.env.IS_BROWSER) {

            let appServer = document.getElementById('app_server');
            if (appServer) {
                appServer.parentNode.removeChild(appServer);
            }
            this.setScreenSize();
            window.addEventListener('resize', this.setScreenSize.bind(this));
        }
        
    }

    componentDidMount() {
        this.props.getUser();
    }

    render() {

        let {user, menuOpen, isDesktop} = this.props;
        return (
            <div className="container">
                <Helmet>
                    <title>{process.env.SITE_NAME}</title>
                    <meta charSet="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                    <meta property="title" content={process.env.SITE_NAME} />
                    <meta property="og:title" content={process.env.SITE_NAME} />
                    <meta property="og:url" content={process.env.SITE_URL} />
                </Helmet>
                <Menu />
                <div className={"content" + (menuOpen ? " content_menu_open" : "")}>
                    {this.props.children}
                </div>
                
                {
                    (!user && process.env.IS_LENTACH) ? null : (<MenuButton/>)
                }
                {!isDesktop ? <PopupPanel/> : null}
                <Notification/>
                <Modal/>
            </div>
        )
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    // console.log(state);
    return {
        user: state.userData.user,
        isDesktop: state.screen.isDesktop,
    }
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        getUser: () => {dispatch(getUser())},
        getNotifications: () => {dispatch(getNotifications())},
        setScreenSize: (width: number, height: number) => {dispatch(setScreenSize(width, height))}
    }
}

// export default process.env.IS_BROWSER ? withRouter(connect(mapStateToProps, mapDispatchToProps)(Base)) : Base;
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Base));