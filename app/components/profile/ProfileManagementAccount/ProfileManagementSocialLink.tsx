import * as React from 'react';
import SocialIcon from '../../shared/SocialIcon';
import {Link} from 'react-router-dom';
const CloseIcon = require('-!babel-loader!svg-react-loader!../../../assets/images/close.svg?name=CloseIcon');
const ConfirmIcon = require('-!babel-loader!svg-react-loader!../../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');
import Loading from '../../shared/Loading';

import {connect} from 'react-redux';
import {addUrl, deleteUrl} from './actions';

const PLACEHOLDERS: any= {
    vk: 'Аккаунт ВКонтатке',
    fb: 'Аккаунт Facebook',
    twitter: 'Аккаунт Twitter',
    instagram: 'Instagram',
    telegram: 'Канал в Telegram',
    google: 'Google+',
    web: 'Личный сайт',
}

export class ProfileManagementSocialLink extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {url: props.url || ''}
    }

    getPlaceholder():string {
        return PLACEHOLDERS[this.props.social] || '';
    }


    save() {
        this.setState({url: ''});
        this.props.add(this.state.url, this.props.social);
    }

    changeHandler(e: any) {
        this.setState({url: e.target.value});
    }

    formSubmit(e: any) {
        e.preventDefault();
        this.save();
    }

    deleteUrl() {
        this.setState({url: ''});
        this.props.delete(this.props.id, this.props.social);
    }

    render() {
        let {url, social, editable, loading} = this.props;
        if (loading) {
            return (<div className="profile_management_social_link_loading"><Loading/></div>)
        }
        const placeholder = this.getPlaceholder();
        if (!social) {
            return
        }
        let itemsArr: any[];
        let readyToSave = this.state.url && (url !== this.state.url) && !loading;
        if (url) {
            itemsArr = [
                <div className="url" key="value">
                    <Link to={ url} target="_blank">
                        { url }
                    </Link>
                </div>,
                editable ? <div key="delete" className="delete" onClick={this.deleteUrl.bind(this)}><CloseIcon /></div> : null
            ]
        }
        else {
            itemsArr = [
                <form key="input" className="input" onSubmit={this.formSubmit.bind(this)}>
                    <input type="text" name="url" value={this.state.url}
                            placeholder={placeholder}
                            onChange={this.changeHandler.bind(this)} />
                </form>,
                readyToSave ?  <div key="save" className="confirm" onClick={this.save.bind(this) }  ><ConfirmIcon /></div> : null
            ]
        }
        return <div className="profile_management_social_link">
            <div className="social_link_icon"><SocialIcon social={social} /></div>
            {itemsArr}
            
        </div>
    }
}


const mapStateToProps = (state: any, ownProps: any): any => {
    let item = state.userData.user.social_links.find((val: any, index:number) => {
        return val.social == ownProps.social && val.is_auth == !!ownProps.isAuth;
    });
    return {
        url: (item && item.url) || null,
        id: (item && item.id) || null,
        editable: !ownProps.isAuth,
        loading: !ownProps.isAuth && (state.userData.socialLinksLoading[ownProps.social] || false),
    }
}

const mapDispatchToProps = (dispatch:any) => {
    return {
        add: (url: string, social: string) => { dispatch(addUrl(url, social)) },
        delete: (id: any, social: string) => { dispatch(deleteUrl(id, social)) },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileManagementSocialLink);