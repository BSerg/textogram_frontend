import * as React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
import {getAuthor, changeSubscription} from './actions/authorActions';
import {Captions} from '../../constants';
const ConfirmIcon = require('-!babel-loader!svg-react-loader!../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');
const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/close.svg?name=CloseIcon');
import SocialIcon from '../shared/SocialIcon';
import ProfileUserDataEditable from './ProfileUserDataEditable';

import '../../styles/common.scss';
import '../../styles/profile/profile.scss';
import '../../styles/profile/profile_additional_page.scss';


export const ProfileSubscribeSimple: any = (props: {canSubscribe: boolean, changeSubscription: () => void, isDesktop: boolean, author: any}) => {
    let {canSubscribe, isDesktop, author} = props;
    if (!canSubscribe) {
        return null;
    }

    if (isDesktop) {
        return <div  className={`desktop_subscription${author.is_subscribed ? '' : ' unsubscribed'}`} onClick={props.changeSubscription}>
            {
                author.is_subscribed ? [
                    <div key="icon"><ConfirmIcon /> {Captions.profile.subscribed}</div>,
                    <div className="hover" key="close"><CloseIcon /> {Captions.profile.unSubscribe}</div>,
                ] :  Captions.profile.subscribe 
            }
        </div>
    }
    else {
        return <div onClick={props.changeSubscription}>
                { author.is_subscribed ? [<ConfirmIcon key="icon" />, <span key="text">{Captions.profile.subscribed}</span>] : Captions.profile.subscribe  }
            </div>;
    }
};

const mapStateToPropsSubscribe = (state: any) => {
    let canSubscribe;
    try {
        canSubscribe = state.userData.user && (state.authorData.author.nickname !== state.userData.user.nickname)
    } catch(err) {
        console.log(err);
        canSubscribe = false;
    }

    return {
        canSubscribe,
        isDesktop: state.screen.isDesktop,
        author: state.authorData.author,
    }
}

const mapDispatchToPropsSubscribe = (dispatch: any) => {
    return {
        changeSubscription: () =>{ dispatch(changeSubscription()) },
    }
}

const ProfileSubscribe = connect(mapStateToPropsSubscribe, mapDispatchToPropsSubscribe)(ProfileSubscribeSimple);

export const ProfileAuthorSubscriptions = (props: {author?: any, isDesktop?: boolean, canSubscribe?: boolean}) => {
    return !process.env.IS_LENTACH ? (
        <div className="subscription">
            <Link to={'/' + props.author.nickname + '/following'}  >Читаемые <span>{  props.author.subscriptions }</span></Link>
            <Link to={'/' + props.author.nickname + '/followers'} >Читатели <span>{  props.author.subscribers }</span></Link>
            {
                !props.isDesktop ? <ProfileSubscribe /> : null
            }
        </div>
    ) : null
}

export const ProfileSocialLinkList = (props: {items: any[]}) => {
    
    let items: any[] = [];
    props.items.forEach((item: any) => {
        if (!item.is_hidden && !item.is_auth) {
            items.push(item);
        }
    });

    return (items.length ? (
        <div className="social_links_list">
            { items.map((item: any, index: number) => {
                return (
                    <div key={index}>
                        <Link to={item.url} target="_blank" >
                            <SocialIcon social={item.social} />
                        </Link>
                </div>)
            }) }
        </div>
    ) : null)
}


export const ProfileUserData = (props: {author: any, isDesktop: boolean}) => <div className="profile_userdata">
        {
            props.isDesktop && <Link to={"/" + props.author.nickname} className="profile_avatar" key="avatar">
                    { props.author.avatar ? (<img src={props.author.avatar}/>) : (
                        <div className="profile_avatar_dummy"></div>) }
                </Link>
        }

        <div className="profile_user_text">
            <Link to={"/" + props.author.nickname} key="username" className="username">
                {props.author.first_name} {props.author.last_name}
            </Link>
            <div className="description">{ props.author.description }</div>
        </div>

        {
            !props.isDesktop && <Link to={"/" + props.author.nickname} className="profile_avatar" key="avatar">
                    { props.author.avatar ? (<img src={props.author.avatar}/>) : (
                        <div className="profile_avatar_dummy"></div>) }
                </Link>
        }
</div>;


export const ProfileAuthor = (props: any) => {

    
    let {author, loading, isDesktop, editable} = props;

    if (!author) {
        return null
    }
    return <div className="profile_content_main">
        { editable ? <ProfileUserDataEditable /> : <ProfileUserData author={author} isDesktop={isDesktop}/>}
        <ProfileSocialLinkList items={author.social_links}/>
        <div className="divider"></div>
        <ProfileAuthorSubscriptions author={author} isDesktop={isDesktop}/>
        {
            isDesktop ? [
                <div className="divider" key="divider"></div>,
                <ProfileSubscribe key="subscribe" />
            ] : null
        }
    </div>;
    
}


const mapStateToProps = (state: any, ownProps: any) => {
    return {
        user: state.userData.user,
        author: ownProps.editable ? state.userData.user : state.authorData.author,
        loading: state.authorData.loading,
        isDesktop: state.screen.isDesktop,

    }
}


export default withRouter(connect(mapStateToProps, null)(ProfileAuthor));