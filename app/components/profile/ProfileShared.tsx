import * as React from 'react';
import {NavLink, Link} from 'react-router-dom';
import SocialIcon from '../shared/SocialIcon';
import ProfileAuthor from './ProfileAuthor';
import AvatarEditor from './AvatarEditor/AvatarEditor';

export const ProfileMenu = (props: {items: {to: string, caption: string}[]}) => props.items.length ? <div className="profile_menu">
{
    props.items.map((item: any) => {
        return <NavLink to={item.to} key={item.to} className="menu_item" activeClassName="active" >{item.caption}</NavLink>
    })
}
</div> : null;


export const ProfileWrapper = (props: {children?: any, editable?: boolean}) => <div id="profile">
    <div id="profile_content">
        {props.editable && <AvatarEditor />}
        <ProfileAuthor editable={props.editable}/>
        <div className="profile_content_filler"></div>
        <div className="profile_content_data">
            { props.children }
        </div>

    </div>
</div>