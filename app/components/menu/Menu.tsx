import * as React from 'react';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
import {ModalAction, OPEN_MODAL} from '../../actions/shared/ModalAction';
import Registration from '../Registration';
import {Captions} from '../../constants';
import Login from '../shared/Login';
import LoginBlock from '../shared/LoginBlock';

import '../../styles/menu.scss';
const ExitIcon = require('-!babel-loader!svg-react-loader!../../assets/images/exit-icon.svg?name=ExitIcon');
const InfoIcon = require('-!babel-loader!svg-react-loader!../../assets/images/info-icon.svg?name=InfoIcon');
const SettingsIcon = require('-!babel-loader!svg-react-loader!../../assets/images/settings.svg?name=SettingsIcon');
const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/close.svg?name=CloseIcon');
import NotificationBlock from './MenuNotificationBlock';
const NotificationIcon = require('-!babel-loader!svg-react-loader!../../assets/images/notification_icon.svg?name=NotificationIcon');

import {connect} from 'react-redux';

import {openMenu, closeMenu} from '../../store/menu';

interface DefaultMenuPropsInterface {
    isDesktop: boolean;
    router?: any;
}


interface IDefaultMenuStateInterface {
    phone?: string;
    password?: string;
    patternInputPhone?: any;
    patternPhone?: any;
    loginError?: string;
    isAuthorization?: boolean;

}

const DefaultMenu = (props: {isDesktop: boolean, closeMenu: () => any}) => <div>
    <div className="menu__content main__menu_default">
    <div className={props.isDesktop ? "menu__close" : "menu__close_mobile"} onClick={props.closeMenu}><CloseIcon /></div>
        {
            props.isDesktop ? (<Link to="/" className="menu__user">
                <div className="menu__user_avatar_dummy"></div>
                <div className="menu__user_username">
                    <span>{Captions.main_menu.title}</span>
                </div>
            </Link>) : (

                <div className="menu__user">
                    <div className="menu__user_username">
                        <span>{Captions.main_menu.title}</span>
                    </div>
                </div>
            )
        }

        {
            !props.isDesktop ? (<div style={{color: '#FFFFFF', justifyContent: 'center'}}><LoginBlock /></div>) : null
        }

        {
            props.isDesktop ? ([<div style={{flexGrow: 1}} key="filler"></div>,
                <div className="menu__authorization" key="login">
                    <div className="menu__authorization_caption">Вход через соцсети:</div>
                    <LoginBlock />
                </div>
            
            ]) : null
        }
    </div>
</div>;

interface NotificationBlockPropsInterface {
    className?: string;
    router?: any;
    showZero?: boolean;
}


interface IUserMenuProps {
    user: any;
    isDesktop: boolean;
    router?: any;
}

class UserMenu extends React.Component<IUserMenuProps|any, any> {

    constructor(props: any) {
        super(props)
    }

    logout(e: any) {
        e.stopPropagation();
        window.location.href = process.env.AUTH_SERVICE_URL + '/logout' + '?redirect_url=' + window.location.href;
    }

    stopClosePropagation(e: any) {
        e.stopPropagation();
    }

    closeMenu() {
        // MenuAction.do(TOGGLE, false);
    }

    handleUrlClick(url: string, e: any) {
        e.stopPropagation();
        this.props.history.push(url);
        if (!this.props.isDesktop) {
            // MenuAction.do(TOGGLE, false);
        }

    }

    render() {
        let {isDesktop, closeMenu} = this.props;
        return this.props.isDesktop ? (
            <div className="menu__content">

                <div className="menu__close" onClick={closeMenu}><CloseIcon /></div>

                <div className="menu__links">
                    <div className="menu__link">
                        <Link to="/feed">{ "Подписки" }</Link>
                    </div>
                </div>

                <div className="menu__links">
                    <div className="menu__link">
                        <Link to="/articles/new/">{ Captions.main_menu.create_article }</Link>
                    </div>
                </div>

                <div className="menu__links">
                    <div className="menu__link">
                        <Link to={"/" + this.props.user.nickname}>{ "Мои тексты" }</Link>
                    </div>
                </div>
                <div className="menu__links">
                    <div className="menu__link">
                        <Link to={"/drafts"}>
                            { Captions.main_menu.drafts }
                            {
                                this.props.user.drafts ? <span>({this.props.user.drafts})</span> : ""
                            }
                        </Link>
                    </div>
                </div>

                {
                    process.env.IS_LENTACH ? (
                        <div className="menu__links">
                            <div className="menu__link">
                                <Link to={"/url_shorten/"}>Cокращалка</Link>
                            </div>
                        </div>
                    ) : null
                }

                <div className="menu__controls">
                    <NotificationBlock/>
                    <div><Link to="/manage/account/"><SettingsIcon /></Link></div>
                    <div><Link to="/"><InfoIcon /></Link></div>
                    <div onClick={this.logout.bind(this)}><ExitIcon /></div>
                </div>

            </div>) : (
                <div className="menu__content">
                    <div className="menu__user">
                        <div className="menu__user_avatar" >
                            <img src={ this.props.user.avatar } onClick={this.handleUrlClick.bind(this, '/' + this.props.user.nickname)} />
                        </div>
                        <div className="menu__user_username" onClick={this.handleUrlClick.bind(this, '/' + this.props.user.nickname)}><span>{this.props.user.first_name}</span> <span>{this.props.user.last_name}</span></div>

                        <div className="menu__controls">
                            <NotificationBlock />
                            <div onClick={this.handleUrlClick.bind(this, '/manage/account/')}><SettingsIcon /></div>
                            <div onClick={this.logout.bind(this)}><ExitIcon /></div>
                        </div>
                    </div>

                    <div className="menu__links">
                        <div className="menu__link" onClick={this.handleUrlClick.bind(this, '/feed')}>
                            { "Подписки" }
                        </div>
                        <div className="menu__link" onClick={this.handleUrlClick.bind(this, '/articles/new/')}>
                            { Captions.main_menu.create_article }
                        </div>
                        <div className="menu__link" onClick={this.handleUrlClick.bind(this, '/drafts')}>
                            { Captions.main_menu.drafts }
                            {
                                this.props.user.drafts ? <span>({this.props.user.drafts})</span> : ""
                            }
                        </div>
                    </div>
                    <div onClick={closeMenu} className="menu__close_mobile" ><CloseIcon /></div>
                    <div onClick={this.handleUrlClick.bind(this, '/info/')} className="menu__info" ><InfoIcon /></div>

                </div>)

    }

}

let UserMenuWithRouter = withRouter(UserMenu);


interface IMenuStateInterface {
    open?: boolean
    user?: any
    isDesktop?: boolean;
}

export class Menu extends React.Component<any, IMenuStateInterface|any> {

    componentWillReceiveProps(nextProps: any) {
        let {open, isDesktop} = nextProps;
        document.body.style.marginTop = (open && isDesktop) ? '55px' : '0';
        document.body.style.height = (open && isDesktop) ? 'calc(100% - 55px)' : '100%';
        document.body.style.height = (open && isDesktop) ? 'calc(100% - 55px)' : '100%';
    }

    render() {

        let {user, isDesktop, open, closeMenu} = this.props;

        if (process.env.IS_LENTACH && !user) {
            return null;
        }

        return (
            <div id="main_menu" className={open ? "" : "hidden"}>
                <div  className="main_menu_container">
                { user ?
                    <UserMenuWithRouter user={user} open={open} isDesktop={isDesktop} closeMenu={closeMenu} /> : 
                    <DefaultMenu isDesktop={isDesktop} closeMenu={closeMenu} /> }
                </div>

            </div>);
    }
}

// exp

const mapStateToProps = (state: any, ownProps: any) => {

    return {
        user: state.userData.user,
        isDesktop: state.screen.isDesktop,
        open: state.menu.open,
    }
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        // openMenu: () => {dispatch(openMenu)},
        closeMenu: () => {dispatch(closeMenu())},

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);