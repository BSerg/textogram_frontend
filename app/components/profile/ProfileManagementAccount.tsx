import * as React from 'react';

import {UserAction, SAVE_USER, UPDATE_USER} from '../../actions/user/UserAction';
import SocialIcon from '../shared/SocialIcon';
import {Link} from 'react-router-dom';
import Loading from '../shared/Loading';

import {api} from '../../api';
import axios from 'axios';

import '../../styles/profile/profile_management_account.scss';

const ConfirmIcon = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');

const VisibilityIcon = require('babel!svg-react!../../assets/images/profile_visibility_icon.svg?name=VisibilityIcon');
const VisibilityOffIcon = require('babel!svg-react!../../assets/images/profile_visibility_off_icon.svg?name=VisibilityOffIcon');

interface ISocialLink {
    id: number | null;
    social: string;
    url: string;
    is_auth?: boolean;
    is_hidden?: boolean;

}

interface  IProfileSocialLinkProps {
    item: ISocialLink;
    isAuth?: boolean;
    isActive?: boolean;
    setActiveCallback?: (social: string) => void
}


interface  IProfileSocialLinkState {
    item?: ISocialLink;
    newUrl?: string;
    urlError?: boolean;
    isLoading?: boolean;
    isActive?: boolean;
    placeholder?: string;
}

class ProfileSocialLink extends React.Component<IProfileSocialLinkProps|any, IProfileSocialLinkState|any> {

    constructor() {
        super();
        this.state = {item: {id: null, social: '', url: ''}, newUrl: '', urlError: false, isLoading: false, placeholder: '',
            isActive: false
        };
    }

    changeUrl(e: any) {
        this.setState({newUrl: e.target.value});
    }

    formSubmit(e: any) {
        e.preventDefault();
        this.saveUrl();
    }

    saveUrl(e?: any) {
        e && e.stopPropagation();
        if (this.state.isLoading) {
            return;
        }
        this.setState({isLoading: true}, () => {
            api.post('/social_links/', {social: this.state.item.social, url: this.state.newUrl}).then((response: any) => {
                this.setState({item: response.data, isLoading: false, newUrl: ''}, () => {

                    let user: any = UserAction.getStore().user;
                    user.social_links.push(response.data);
                    UserAction.do(SAVE_USER, user);
                });
            }).catch((error) => {
                this.setState({isLoading: false, urlError: true, newUrl: '', isActive: false});
            });
        });
    }

    deleteUrl() {
        if (this.state.isLoading || !this.state.item.id) {
            return;
        }

        this.setState({isLoading: true}, () => {
            api.delete('/social_links/' + this.state.item.id + '/').then((response: any) => {

                let item = this.state.item;
                let itemId: number = item.id;

                item.id = null;
                item.url = '';

                this.setState({item: item, newUrl: '', isLoading: false}, () => {
                    let user: any = UserAction.getStore().user;
                    let socialLinks: any[] = [];
                    user.social_links.forEach((sl: ISocialLink) => {
                        if (sl.id && (sl.id != itemId)) {
                            socialLinks.push(sl);
                        }
                    });

                    user.social_links = socialLinks;
                    UserAction.do(SAVE_USER, user);
                });

            }).catch((error) => {
                this.setState({isLoading: false});
            })
        })
    }

    toggleHidden() {
        let hidden = !this.state.item.is_hidden;

        api.patch('/social_links/' + this.state.item.id + '/', {is_hidden: hidden}).then((response: any) => {
            let item = this.state.item;
            item.is_hidden = response.data.is_hidden;
            this.setState({item: item}, () => {
                let user = UserAction.getStore().user;
                user.social_links.forEach((sl: ISocialLink) => {
                   if (sl.id == this.state.item.id) {
                       sl.is_hidden = this.state.item.is_hidden;
                   }
                });
                UserAction.do(SAVE_USER, user);
            });
        });
    }

    setActive(active: boolean) {
        this.props.setActiveCallback && this.props.setActiveCallback(this.state.item.social);

        // this.setState({isActive: active, placeholder: active ? 'Вставьте ссылку' : this.getPlaceholder()});
    }

    getPlaceholder():string {

        let placeholderValue: string;

        switch (this.props.item.social) {
            case ('vk'):
                placeholderValue = 'Аккаунт ВКонтатке';
                break;
            case ('fb'):
                placeholderValue = 'Аккаунт Facebook';
                break;
            case ('twitter'):
                placeholderValue = 'Аккаунт Twitter';
                break;
            case ('instagram'):
                placeholderValue = 'Instagram';
                break;
            case ('telegram'):
                placeholderValue = 'Канал в Telegram';
                break;
            case ('google'):
                placeholderValue = 'Google+';
                break;
            case ('web'):
                placeholderValue = 'Личный сайт';
                break;

        }

        return placeholderValue || '';
    }

    componentWillReceiveProps(nextProps: IProfileSocialLinkProps) {
        this.setState({isActive: nextProps.isActive, placeholder: nextProps.isActive ? 'Вставьте ссылку' : this.getPlaceholder()});
    }

    componentDidMount() {
        this.setState({item: this.props.item, newUrl: this.props.item.url, placeholder: this.getPlaceholder()});
    }

    render() {
        if (this.state.isLoading) {
            return (<div className="profile_management_social_link_loading"><Loading/></div>)
        }


        return (<div className="profile_management_social_link">

            <div className="social_link_icon"><SocialIcon social={this.state.item.social} /></div>

            {
                this.state.item.url ? [
                    <div className="url" key="value">
                        <Link to={this.state.item.url} target="_blank">
                            { this.state.item.url }
                        </Link>
                    </div>,

                        !this.state.item.is_auth ?
                            <div key="delete" className="delete" onClick={this.deleteUrl.bind(this)}><CloseIcon /></div> : null,
                ] : [

                    <form key="input" className="input" onSubmit={this.formSubmit.bind(this)}>
                        <input type="text" name="url" value={this.state.newUrl}
                               placeholder={this.state.placeholder}
                               onFocus={this.setActive.bind(this, true)}

                               onChange={this.changeUrl.bind(this)} />
                    </form>,
                    this.state.isActive ? <div key="save" className="confirm" onClick={this.saveUrl.bind(this) }  ><ConfirmIcon /></div> : null
                ]
            }
        </div>);
    }
}


interface IAccountState {
    authAccount?: any;
    socialLinks?: ISocialLink[];
    activeSocial?: string;
    nickname?: string;
    nicknameChecking?: boolean;
    nicknameCorrect?: boolean;
    cancelSource?: any;
    nicknameCheckTimeout?: number;
    userSaving?: boolean;
}

export default class ProfileManagementAccount extends React.Component<any, IAccountState> {

    ACCOUNT_TYPES: string[] = [ 'fb', 'vk', 'instagram', 'twitter', 'google', 'telegram', 'web' ];

    constructor() {
        super();
        this.state = { authAccount: null, socialLinks: [], activeSocial: '', nickname: '', nicknameChecking: false,
            nicknameCorrect: true, userSaving: false, nicknameCheckTimeout: null, cancelSource: null
        };
    }

    nicknameChange(e: any) {
        let val: string = e.target.value;
        if ((val == '' || val.match(/^[A-Za-z][A-Za-z\d_]*$/)) && val.length <= 20 ) {
            this.setState({nickname: val}, this.checkNickname);
        }
    }

    checkNickname() {
        this.state.cancelSource && this.state.cancelSource.cancel();
        if (this.state.nickname.length < 4) {
            this.setState({nicknameChecking: false, nicknameCorrect: false});
        }
        else {
            this.state.cancelSource =  axios.CancelToken.source();
            this.setState({nicknameChecking: true, nicknameCorrect: true}, () => {
                this.state.nicknameCheckTimeout && window.clearTimeout(this.state.nicknameCheckTimeout);
                this.state.nicknameCheckTimeout = window.setTimeout(() => {
                    api.get('/users/check_nickname/',
                            {params: {nickname: this.state.nickname},
                            cancelToken: this.state.cancelSource.token}).then((response: any) => {
                                this.setState({nicknameChecking: false, nicknameCorrect: true});
                    }).catch((error) => {
                        this.setState({nicknameChecking: false, nicknameCorrect: false});
                    });
                }, 1000);
            });
        }


    }

    setActiveSocialCallback(social: string) {
        this.setState({activeSocial: social});
    }

    setData() {
        if (!UserAction.getStore().user || !UserAction.getStore().user.social_links) {
            return;
        }

        let authAccount: ISocialLink = null;

        let links: ISocialLink[] = [];

        this.ACCOUNT_TYPES.forEach((social: string) => {

            let item: ISocialLink = { id: null, url: '', social:  social};

            UserAction.getStore().user.social_links.forEach((sl: ISocialLink) => {
                if (!sl.is_auth && sl.social == item.social) {
                    item.id = sl.id;
                    item.url = sl.url;
                }
                else if (sl.is_auth) {
                    authAccount = sl;
                }
            });
            links.push(item);
        });

        this.setState({socialLinks: links, authAccount: authAccount, nickname: UserAction.getStore().user.nickname});
    }

    saveNickname() {
        this.setState({ userSaving: true}, () => {
            UserAction.doAsync(UPDATE_USER, {nickname: this.state.nickname}).then(() => {
                this.setState({userSaving: false, nickname: UserAction.getStore().user.nickname});
            }).catch(() => {
                this.setState({userSaving: false, nicknameCorrect: false, nickname: UserAction.getStore().user.nickname})
            })
        });
    }

    componentDidMount() {
        this.setData();
    }

    componentWillUnmount() {
        this.state.cancelSource && this.state.cancelSource.cancel();
        this.state.nicknameCheckTimeout && window.clearTimeout(this.state.nicknameCheckTimeout);
    }

    render() {

        let nicknameChanged = UserAction.getStore().user.nickname != this.state.nickname;
        let hint: any = this.state.nickname ? ((nicknameChanged && !this.state.nicknameChecking) ? (this.state.nicknameCorrect ? 'Никнейм доступен' : 'Никнейм не доступен') : null)
            : 'Никнейм не должен быть пустым';

        return (<div>

            {
                !process.env.IS_LENTACH ? (
                    <div className="profile_management_links">
                        <div className="title nickname">Никнейм</div>
                        <div className="main nickname">
                            <div className="nickname_input">
                                <input className={this.state.nicknameCorrect ? "" : "nickname_error" } disabled={this.state.userSaving} type="text" value={this.state.nickname} onChange={this.nicknameChange.bind(this)} />
                                {
                                    (this.state.nicknameChecking || this.state.userSaving ) ? <div className="nickname_confirm"><Loading /></div> :
                                        ((this.state.nicknameCorrect && nicknameChanged) ?
                                            <div className="nickname_confirm active" onClick={this.saveNickname.bind(this)}>
                                                <ConfirmIcon />
                                            </div> : <div className="nickname_confirm"></div>)
                                }
                            </div>

                            <div className={"hint" + (this.state.nicknameCorrect ? "" : " nickname_error") }>{hint}</div>
                        </div>
                    </div>) : null
            }

            {
                this.state.authAccount ? (
                    <div className="profile_management_links">
                        <div className="title">
                            Аккаунт авторизации:
                        </div>
                        <div className="main">

                            <ProfileSocialLink item={this.state.authAccount} />

                        </div>
                    </div>
                ) : null
            }


            <div className="profile_management_links">
                <div className="title">
                    Дополнительные связи:
                </div>
                <div className="main">
                    {
                        this.state.socialLinks.map((socialLink: ISocialLink, index: number) => {
                            return (<ProfileSocialLink key={socialLink.social}
                                                       item={socialLink}
                                                       setActiveCallback={this.setActiveSocialCallback.bind(this)}
                                                       isActive={socialLink.social == this.state.activeSocial}/>)
                        })
                    }
                </div>



            </div>
        </div>)
    }
}