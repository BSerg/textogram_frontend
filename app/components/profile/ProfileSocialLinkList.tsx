import * as React from 'react';
import {Link} from 'react-router';
import SocialIcon from '../shared/SocialIcon';

interface ILinksProps {
    items: any[];
}

export default class ProfileSocialLinkList extends React.Component<ILinksProps, any> {

    render() {

        let items: any[] = [];
        this.props.items.forEach((item: any) => {
            if (!item.is_hidden) {
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
}