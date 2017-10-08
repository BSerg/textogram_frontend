import * as React from 'react';
import {connect} from 'react-redux';
import Nickname from './ProfilemanagementAccountNickname';

export function AuthAccount(props: {socialLink: any}) {
    return <div className="profile_management_links">
        <div className="title">
            Аккаунт авторизации:
        </div>
        <div className="main">
            
        </div>
    </div>;
}

export function ProfileAccount(props: any) {
    let {socialLink} = props;
    console.log(socialLink);
    return <div>
        <Nickname />
        {socialLink && <AuthAccount socialLink={socialLink}/>}
    </div>;
}

const mapStateToProps = (state: any) => {
    let socialLinks: any[] = state.userData.user.social_links;
    let socialLink = null;
    
    try {
        socialLink = socialLinks.find((val: any, index: number) => {
            return val.is_auth == true;
        }) || null;
    } catch( error ) {
        socialLink = null
    }
    return {
        socialLink
    }
}

export default connect(mapStateToProps, null)(ProfileAccount);