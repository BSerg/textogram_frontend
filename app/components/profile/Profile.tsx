import * as React from 'react';

import {Link} from 'react-router';

import '../../styles/common.scss';
import '../../styles/profile/profile.scss';

import ProfileArticles from './ProfileArticles';
import ProfileAuthors from './ProfileAuthors';

import {api} from '../../api';
import Error from '../Error';
import {UserAction, GET_ME, LOGIN, LOGOUT} from "../../actions/user/UserAction";

import {Captions} from '../../constants';
import SocialIcon from './../shared/SocialIcon';

import {ModalAction, OPEN_MODAL} from '../../actions/shared/ModalAction';
import {MediaQuerySerice} from '../../services/MediaQueryService';

const VKIcon = require('babel!svg-react!../../assets/images/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('babel!svg-react!../../assets/images/profile_social_icon_fb.svg?name=FBIcon');
const ConfirmIcon = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');
const SubscriptionIcon = require('babel!svg-react!../../assets/images/profile_subscription_icon.svg?name=SubscriptionIcon');
const EditIcon = require('babel!svg-react!../../assets/images/edit.svg?name=EditIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');


interface IProfileState {
    user?: any;
    error?: any;
    isSelf?: boolean;
    isDesktop?: boolean;
    showSubscribers?: boolean;
}

export default class Profile extends React.Component<any, IProfileState> {


    constructor(props: any) {
        super(props);
        this.state = {user: null, error: null, isSelf: false, showSubscribers: true, isDesktop: MediaQuerySerice.getIsDesktop()};
        this.checkIsSelf = this.checkIsSelf.bind(this);
        this.checkDesktop = this.checkDesktop.bind(this);
    }

    checkIsSelf() {
        let isSelf: boolean =  Boolean(this.state.user && UserAction.getStore().user && (UserAction.getStore().user.id == this.state.user.id));
        if (isSelf != this.state.isSelf) {
            this.setState({ isSelf: isSelf });
        }
    }

    getUserData(userId: string) {
        this.setState({error: null}, () => {
            api.get('/users/' + userId + '/').then((response: any) => {
                this.setState({
                    user: response.data,
                    showSubscribers: false,
                    isSelf: Boolean(response.data && UserAction.getStore().user && (UserAction.getStore().user.id == response.data.id))

                }, () => {

                    console.log(this.state.user);
                    // this.checkIsSelf();

                });
            }).catch((error) => {
                this.setState({error: <Error code={404} msg="page not found" /> });
            });
        });
    }

    subscribe() {

        api.post('/users/' + this.state.user.id + '/subscribe/').then((response) => {
            this.setIsSubscribed(true);
        }).catch((error: any) => {});
    }

    unSubscribe() {
        api.post('/users/' + this.state.user.id + '/un_subscribe/').then((response) => {
            this.setIsSubscribed(false);
        }).catch((error: any) => {})
    }

    closeSubscribers() {
        this.setState({showSubscribers: false});
    }

    showSubscribers() {
        if (this.state.isDesktop) {
            this.setState({showSubscribers: true});
        }
        else {
            ModalAction.do(OPEN_MODAL, {content: <ProfileAuthors userId={this.state.user.id} closeSubscribers={this.closeSubscribers.bind(this)} />});
        }
    }

    createArticle() {
        api.post('/articles/editor/').then((response: any) => {
            this.props.router.push('/articles/' + response.data.id + '/edit/');
        }).catch((error) => {});
    }

    setIsSubscribed(is_subscribed: boolean) {
        let user = this.state.user;
        user.is_subscribed = is_subscribed;
        user.subscribers += is_subscribed ? 1: -1;
        if (user.subscribers < 0) user.subscribers = 0;
        this.setState({user: user});
    }

    componentWillReceiveProps(nextProps: any) {
        this.getUserData(nextProps.params.userId);
    }

    checkDesktop(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop, showSubscribers: false});
        }
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.checkDesktop);

        this.getUserData(this.props.params.userId);
        UserAction.onChange(GET_ME, this.checkIsSelf);
        UserAction.onChange(LOGIN, this.checkIsSelf);
        UserAction.onChange(LOGOUT, this.checkIsSelf);
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.checkIsSelf);
        UserAction.unbind(LOGIN, this.checkIsSelf);
        UserAction.unbind(LOGOUT, this.checkIsSelf);

        MediaQuerySerice.unbind(this.checkDesktop);
    }

    render() {
        if (this.state && this.state.error) {
            return (this.state.error);
        }
        if (!this.state.user) return null;
        return (

            <div id="profile">

                 <div id="profile_content">
                     <div className="profile_content_main">
                         <div className="avatar" key="avatar">
                             { this.state.user.avatar ? (<img src={this.state.user.avatar}/>) : (
                                 <div className="avatar_dummy"></div>) }

                         </div>

                         <div key="username" className="username">
                             {this.state.user.first_name} {this.state.user.last_name}
                         </div>
                         <div className="description">{ this.state.user.description }</div>

                         {
                             this.state.user.social_links.length ? (
                                 <div className="social_links_list">
                                     { this.state.user.social_links.map((social_link: any, index: number) => {
                                         return (
                                             <div key={index}>
                                                 <Link to={social_link.url} target="_blank" >
                                                     <SocialIcon social={social_link.social} />
                                                 </Link>
                                            </div>)
                                     }) }
                                 </div>
                             ) : null
                         }

                         <div className="divider"></div>

                         <div className="subscription">
                             <div><span>{ this.state.user.subscriptions }</span> читает</div>
                             <div><span>{ this.state.user.subscribers }</span> подписано</div>
                         </div>

                         { this.state.isDesktop ? <div className="divider"></div> : null }

                     </div>
                     <div className="profile_content_filler"></div>

                     <div className="profile_menu"></div>


                 </div>
             </div>
        )
    }
}