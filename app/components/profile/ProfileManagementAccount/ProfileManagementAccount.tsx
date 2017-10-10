import * as React from 'react';
import {connect} from 'react-redux';
import Nickname from './ProfilemanagementAccountNickname';
import SocialLink from './ProfileManagementSocialLink';

export function AuthAccount(props: {socialLink: any}) {
    return <div className="profile_management_links">
        <div className="title">
            Аккаунт авторизации:
        </div>
        <div className="main">
            <SocialLink social={props.socialLink.social} isAuth={true} />
        </div>
    </div>;
}

export function SocialLinks()  {
    return <div className="profile_management_links">
        <div className="title">
            Дополнительные связи:
        </div>
        <div className="main">
        { 
            [ 'fb', 'vk', 'instagram', 'twitter', 'google', 'telegram', 'web' ].map((social: string) => {
                return <SocialLink key={social} social={social} />
            })
        }
        </div>
    </div>
}

export function ProfileAccount(props: any) {
    let {socialLink} = props;
    return <div>
        <Nickname />
        {socialLink && <AuthAccount socialLink={socialLink}/>}
        <SocialLinks />
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