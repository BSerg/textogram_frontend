import * as React from 'react';

import {UserAction, SAVE_USER} from '../../actions/user/UserAction';
import SocialIcon from '../shared/SocialIcon';
import {Link} from 'react-router';
import Loading from '../shared/Loading';

import {api} from '../../api';

import '../../styles/profile/profile_management_account.scss';

interface ISocialLink {
    id: number | null;
    social: string;
    url: string;
    is_auth?: boolean;
}

interface  IProfileSocialLinkProps {
    item: ISocialLink;
}


interface  IProfileSocialLinkState {
    item?: ISocialLink;
    newUrl?: string;
    urlError?: boolean;
    isLoading?: boolean;
    placeholder?: string;
}

class ProfileSocialLink extends React.Component<IProfileSocialLinkProps, IProfileSocialLinkState> {

    constructor() {
        super();
        this.state = {item: {id: null, social: '', url: ''}, newUrl: '', urlError: false, isLoading: false, placeholder: ''};
    }

    changeUrl(e: any) {
        this.setState({newUrl: e.target.value});
    }

    formSubmit(e: any) {
        e.preventDefault();
        this.saveUrl();
    }

    saveUrl() {
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
                this.setState({isLoading: false, urlError: true, newUrl: ''});
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

    setPlaceholder() {
        this.setState({placeholder: 'Вставьте ссылку'});
    }

    removePlaceholder() {
        this.setState({placeholder: 'Акк'});
    }

    componentDidMount() {
        this.setState({item: this.props.item, newUrl: this.props.item.url, placeholder: 'Аккк'});
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
                    <div key="delete" className="delete" onClick={this.deleteUrl.bind(this)}>x</div>,
                ] : [

                    <form key="input" className="input" onSubmit={this.formSubmit.bind(this)}>
                        <input type="text" name="url" value={this.state.newUrl}
                               placeholder={this.state.placeholder}
                               onFocus={this.setPlaceholder.bind(this)}
                               onBlur={this.removePlaceholder.bind(this)}
                               onChange={this.changeUrl.bind(this)} />
                    </form>,
                    <div key="save" className="confirm" onClick={this.saveUrl.bind(this) }  >v</div>
                ]
            }
        </div>);
    }
}


interface IAccountState {
    authAccount?: any;
    socialLinks?: ISocialLink[];
}

export default class ProfileManagementAccount extends React.Component<any, IAccountState> {

    ACCOUNT_TYPES: string[] = [ 'fb', 'vk', 'instagram', 'twitter', 'google', 'telegram', 'web' ];

    constructor() {
        super();
        this.state = { authAccount: null, socialLinks: [] };
    }


    setData() {
        if (!UserAction.getStore().user || !UserAction.getStore().user.social_links) {
            return;
        }

        let links: ISocialLink[] = [];

        this.ACCOUNT_TYPES.forEach((social: string) => {

            let item: ISocialLink = { id: null, url: '', social:  social};

            UserAction.getStore().user.social_links.forEach((sl: ISocialLink) => {
                if (!sl.is_auth && sl.social == item.social) {
                    item.id = sl.id;
                    item.url = sl.url;
                }
            });
            links.push(item);
        });

        this.setState({socialLinks: links});
    }

    componentDidMount() {
        this.setData();
    }

    render() {
        return (<div>

            <div className="profile_management_links">
                <div className="title">
                    Дополнительные аккаунты:
                </div>
                <div className="main">
                    {
                        this.state.socialLinks.map((socialLink: ISocialLink, index: number) => {
                            return (<ProfileSocialLink key={socialLink.social} item={socialLink}/>)
                        })
                    }
                </div>



            </div>
        </div>)
    }
}