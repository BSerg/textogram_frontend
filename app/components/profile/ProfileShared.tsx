import * as React from 'react';
import {NavLink, Link} from 'react-router-dom';
import SocialIcon from '../shared/SocialIcon';

export const ProfileMenu = (props: {items: {to: string, caption: string}[]}) => props.items.length ? <div className="profile_menu">
{
    props.items.map((item: any) => {
        return <NavLink to={item.to} key={item.to} className="menu_item" activeClassName="active" >{item.caption}</NavLink>
    })
}
</div> : null;
