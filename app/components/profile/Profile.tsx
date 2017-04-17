import * as React from 'react';

import {Link, withRouter} from 'react-router';

import '../../styles/common.scss';
import '../../styles/profile/profile.scss';
import '../../styles/profile/profile_additional_page.scss';

import ProfileArticles from './ProfileArticles';
import ProfileAuthors from './ProfileAuthors';
import ProfileAuthorList from './ProfileAuthorList';
import ProfileDrafts from "./ProfileDrafts";

import Loading from '../shared/Loading';

import {api} from '../../api';
import axios from 'axios';

import Error from '../Error';
import {UserAction, GET_ME, LOGIN, LOGOUT, UPDATE_USER_DRAFTS} from "../../actions/user/UserAction";

import {Captions} from '../../constants';

import {ModalAction, OPEN_MODAL} from '../../actions/shared/ModalAction';
import {MediaQuerySerice} from '../../services/MediaQueryService';
import ProfileSocialLinkList from "./ProfileSocialLinkList";

const VKIcon = require('babel!svg-react!../../assets/images/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('babel!svg-react!../../assets/images/profile_social_icon_fb.svg?name=FBIcon');
const ConfirmIcon = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');
const SubscriptionIcon = require('babel!svg-react!../../assets/images/profile_subscription_icon.svg?name=SubscriptionIcon');
const EditIcon = require('babel!svg-react!../../assets/images/edit.svg?name=EditIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');
const SettingsIcon = require('babel!svg-react!../../assets/images/settings.svg?name=SettingsIcon');

interface IProfileProps {
    router?: any;
    params?: any;
}

interface IProfileState {
    user?: any;
    error?: any;
    isSelf?: boolean;
    selfDrafts?: number;
    isDesktop?: boolean;
    showSubscribers?: boolean;
    currentSection?: string;
    isLoading?: boolean;
    canSubscribe?: boolean;
    additionalPage?: any;
    cancelSource?: any;
}

class ProfileClass extends React.Component<IProfileProps, IProfileState> {

    SECTION_FEED: string = 'feed';
    SECTION_ARTICLES: string = 'articles';


    constructor(props: any) {
        super(props);
        this.state = {user: null, error: null, isLoading: false, isSelf: false, selfDrafts: 0, showSubscribers: true,
            isDesktop: MediaQuerySerice.getIsDesktop(), canSubscribe: false, additionalPage: null, cancelSource: null};
        this.checkIsSelf = this.checkIsSelf.bind(this);
        this.checkDesktop = this.checkDesktop.bind(this);
        this.setDrafts = this.setDrafts.bind(this);
    }

    checkIsSelf() {
        let isSelf: boolean =  Boolean(this.state.user && UserAction.getStore().user && (UserAction.getStore().user.id == this.state.user.id));
        let stateData: any = { canSubscribe: Boolean(UserAction.getStore().user && !isSelf) };
        stateData.isSelf = isSelf;
        stateData.currentSection = isSelf ? this.SECTION_FEED : this.SECTION_ARTICLES;
        stateData.selfDrafts = isSelf ? UserAction.getStore().user.drafts || 0 : 0;
        stateData.additionalPage = null;
        if (stateData.isSelf != this.state.isSelf || stateData.canSubscribe != this.state.canSubscribe ) {
            this.setState(stateData);
        }
    }

    setDrafts() {
        if (this.state.isSelf) {
            this.setState({selfDrafts: UserAction.getStore().user.drafts || 0});
        }
    }

    getUserData(userId: string) {
        if (this.state.isLoading) {
            return;
        }
        if (this.state.cancelSource) {
            this.state.cancelSource.cancel();
        }

        this.state.cancelSource =  axios.CancelToken.source();

        this.setState({error: null, isLoading: true, additionalPage: null}, () => {
            api.get('/users/' + userId + '/', { cancelToken: this.state.cancelSource.token }).then((response: any) => {
                let isSelf: boolean = Boolean(response.data && UserAction.getStore().user && (UserAction.getStore().user.id == response.data.id));
                let canSubscribe: boolean = Boolean(UserAction.getStore().user && !isSelf);
                this.setState({
                    user: response.data,
                    showSubscribers: false,
                    isSelf: isSelf,
                    currentSection: isSelf ? this.SECTION_FEED : this.SECTION_ARTICLES,
                    isLoading: false,
                    canSubscribe: canSubscribe,
                    selfDrafts: isSelf ? UserAction.getStore().user.drafts || 0 : 0,
                    additionalPage: null

                }, () => {
                    if (this.props.router.location.query.show == 'drafts') {
                        this.showDrafts();
                    }
                });
            }).catch((error) => {
                if (!axios.isCancel(error)) {
                    this.setState({error: <Error code={404} msg="page not found" />, isLoading: false });
                }

            });
        });
    }

    setSection(sectionName: string) {
        if (this.state.isSelf && [ this.SECTION_FEED, this.SECTION_ARTICLES ].includes(sectionName)) {
            this.setState({currentSection: sectionName});
        }
        else {
            this.setState({currentSection: this.SECTION_ARTICLES})
        }
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

    setIsSubscribed(is_subscribed: boolean) {
        let user = this.state.user;
        user.is_subscribed = is_subscribed;
        user.subscribers += is_subscribed ? 1: -1;
        if (user.subscribers < 0) user.subscribers = 0;
        this.setState({user: user});
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.params.userId != this.props.params.userId) {
            this.getUserData(nextProps.params.userId);
        }
        if ( this.state.isSelf
            && (nextProps.params.userId == this.props.params.userId)
            && (nextProps.router.location.query.show == 'drafts')) {

            this.showDrafts();
        }
    }

    checkDesktop(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop, showSubscribers: false});
        }
    }

    showDrafts() {
        this.setState({additionalPage: <ProfileDrafts closeCallback={ () => {
            this.props.router.push('/profile/' + this.state.user.id);
            this.setState({additionalPage: null})
        }} />});
    }

    showAuthors(subscribedTo: boolean = false) {
        this.setState({additionalPage: <ProfileAuthorList userId={this.state.user.id} isDesktop={this.state.isDesktop}
                                                          closeCallback={ () => { this.setState({additionalPage: null}) } }
                                                          subscribedTo={subscribedTo} />});
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.checkDesktop);

        this.getUserData(this.props.params.userId);
        UserAction.onChange([GET_ME, LOGIN, LOGOUT], this.checkIsSelf);
        UserAction.onChange(UPDATE_USER_DRAFTS, this.setDrafts);
    }

    componentWillUnmount() {
        UserAction.unbind([GET_ME, LOGIN, LOGOUT], this.checkIsSelf);
        UserAction.unbind(UPDATE_USER_DRAFTS, this.setDrafts);
        MediaQuerySerice.unbind(this.checkDesktop);

        if (this.state.cancelSource) {
            this.state.cancelSource.cancel();
        }
    }

    render() {
        if (this.state && this.state.error) {
            return (this.state.error);
        }

        if (this.state.isLoading) {
            return (<div id="profile" className="profile_loading"><Loading /></div>);
        }

        if (!this.state.user) return null;

        let sections: {name: string, caption: string}[] = this.state.isSelf ? [
            {name: this.SECTION_FEED, caption: Captions.profile.menuSubscriptions},
            {name: this.SECTION_ARTICLES, caption: Captions.profile.menuArticles}] : [];

        return (

            <div id="profile">

                <div className="profile_new_article"><Link to="/articles/new/"><EditIcon /></Link></div>

                 <div id="profile_content">
                     <div className="profile_content_main">
                         <div className="profile_avatar" key="avatar">
                             { this.state.user.avatar ? (<img src={this.state.user.avatar}/>) : (
                                 <div className="profile_avatar_dummy"></div>) }

                             {
                                 (this.state.isDesktop && this.state.isSelf) ? (
                                     <Link to="/manage/" className="profile_management_link" ><SettingsIcon /></Link>) : null
                             }

                         </div>

                         <div key="username" className="username">
                             {this.state.user.first_name} {this.state.user.last_name}
                         </div>
                         <div className="description">{ this.state.user.description }</div>

                         <ProfileSocialLinkList items={this.state.user.social_links}/>

                         <div className="divider"></div>

                         <div className="subscription">
                             <div onClick={this.showAuthors.bind(this, false)}>Читаемые <span>{ this.state.user.subscriptions }</span></div>
                             <div onClick={this.showAuthors.bind(this, true)}>Читатели <span>{ this.state.user.subscribers }</span></div>
                             {
                                 (!this.state.isDesktop && this.state.canSubscribe) ? (
                                    this.state.user.is_subscribed ? (
                                        <div onClick={this.unSubscribe.bind(this)}><ConfirmIcon /> {Captions.profile.subscribed}</div>) :
                                        (<div onClick={this.subscribe.bind(this)}>{ Captions.profile.subscribe }</div>)
                                 ) : null
                             }
                         </div>

                         {
                             this.state.isDesktop ? (<div className="divider"></div>) : null
                         }

                         { this.state.isDesktop && this.state.canSubscribe ? (
                             this.state.user.is_subscribed ? (
                                <div className="desktop_subscription" onClick={this.unSubscribe.bind(this)}>
                                    <div><ConfirmIcon /> {Captions.profile.subscribed}</div>
                                    <div className="hover"><CloseIcon /> {Captions.profile.unSubscribe}</div>

                                </div>) :
                                (<div  className="desktop_subscription unsubscribed" onClick={this.subscribe.bind(this)}>
                                    { Captions.profile.subscribe }
                                </div>)
                         ) : <div className="desktop_subscription"></div> }
                     </div>
                     <div className="profile_content_filler"></div>

                     {
                         this.state.additionalPage ? (
                             this.state.additionalPage
                         ) : (
                             <div className="profile_content_data">
                                 {
                                     this.state.isSelf ? (
                                         <div className="profile_menu">
                                             { sections.map((section: {name: string, caption: string}, index  ) => {
                                                 return (<div key={index}
                                                              className={ "menu_item" + (section.name == this.state.currentSection ? " active" : "")}
                                                              onClick={this.setSection.bind(this, section.name)}>
                                                     { section.caption }
                                                 </div>)
                                             }) }

                                             { this.state.isDesktop ? (<div className="filler"></div>) : null }

                                             {
                                                 this.state.isDesktop && this.state.isSelf && this.state.selfDrafts ? (
                                                     <div className="menu_drafts" onClick={this.showDrafts.bind(this)}>
                                                         Черновиков: <span>{this.state.selfDrafts}</span>
                                                     </div>
                                                 ) : null
                                             }
                                         </div>
                                     ) : null
                                 }

                                 <ProfileArticles userId={this.state.user.id} section={this.state.currentSection} isSelf={this.state.isSelf} />
                             </div>
                         )
                     }
                 </div>
             </div>
        )
    }
}

let Profile = withRouter(ProfileClass);

export default Profile;