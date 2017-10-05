import * as React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import ItemList from '../shared/ItemList/ItemList';
import ProfileAuthor from './ProfileAuthor';
import {Helmet} from 'react-helmet';
import {Captions} from '../../constants';
import {getAuthor} from './actions/authorActions';

export const ProfileMenu = (props: {items: any[]}) => props.items.length ? <div className="profile_menu">
    {
        props.items.map((item: any) => {
            return <NavLink to={item.to} key={item.to} className="menu_item" activeClassName="active" >{item.caption}</NavLink>
        })
    }
</div> : null;

export class Profile extends React.Component<any, any> {

    getMenuItems() {
        if (this.props.match.params.subsection) {
            return [
                {caption: Captions.profile.following, to: '/' + this.props.author.nickname + '/following' },
                {caption: Captions.profile.followers, to: '/' + this.props.author.nickname + '/followers' }
            ];
        }
        else if (this.props.isSelf) {

            return [
                {caption: Captions.profile.menuSubscriptions, to: '/feed' },
                {caption: Captions.profile.menuArticles, to: '/' + this.props.author.nickname},
                {caption: Captions.profile.menuDrafts, to: '/drafts'}
            ];
        }
        return [];
    }

    componentWillReceiveProps(nextProps: any)  {
        let slug = nextProps.match.params.slug;
        if (slug !== this.props.match.params.slug || (nextProps.user && !this.props.user)) {
            this.props.getAuthor(slug);
        }
    }

    componentDidMount() {
        this.props.getAuthor(this.props.match.params.slug);
    }

    render() {
        let {author, isSelf} = this.props;
        if (!author) {
            return null;
        }
        let menuItems =  this.getMenuItems();
        return <div id="profile">
            <Helmet>
                <title>{`${author.first_name} ${author.last_name} | ${process.env.SITE_NAME}`}</title>
                <meta name="title" content={`${author.first_name} ${author.last_name} | ${process.env.SITE_NAME}`} />
            </Helmet>
            
            <div id="profile_content">
                <ProfileAuthor />
                <div className="profile_content_filler"></div>
                <div className="profile_content_data">
                    <ProfileMenu items={menuItems}/>
                    <ItemList />
                </div>
            </div>
            
        </div>
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    return {
        user: state.userData.user,
        author: state.authorData.author,
        isSelf: state.authorData.author && state.userData.user && state.userData.user.nickname && (state.authorData.author.nickname === state.userData.user.nickname),
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        getAuthor: (slug: any) => { dispatch(getAuthor(slug)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);