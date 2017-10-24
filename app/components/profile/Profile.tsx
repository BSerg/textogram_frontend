import * as React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import ItemList from './ItemList/ItemList';
// import ProfileAuthor from './ProfileAuthor';
import {Helmet} from 'react-helmet';
import {Captions} from '../../constants';
import {getAuthor, setAuthorNull} from './actions/authorActions';
import ArticlePreview from '../shared/ArticlePreview';
import {ProfileMenu, ProfileWrapper} from './ProfileShared';
import {Error404} from '../Error';

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
                /*{caption: Captions.profile.menuSubscriptions, to: '/feed' },
                {caption: Captions.profile.menuArticles, to: '/' + this.props.author.nickname},
                {caption: Captions.profile.menuDrafts, to: '/drafts'}*/
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

    checkError(): boolean {
        if (this.props.match.params.subsection && ['following', 'followers'].indexOf(this.props.match.params.subsection) === -1) {
            return true;
        }
        return false
    }

    componentDidMount() {
        this.props.getAuthor(this.props.match.params.slug);
    }

    componentWillUnmount() {
        this.props.setAuthorNull();
    }

    render() {
        let {author, isSelf, notFound, user} = this.props;
        if (notFound || this.checkError()) {
            return <Error404 />
        }
        if (!author) {
            return null;
        }
        let menuItems =  this.getMenuItems();
        let editable = user && author && user.id === author.id;
        return <ProfileWrapper editable={editable}>
            <Helmet>
                <title>{`${author.first_name} ${author.last_name} | ${process.env.SITE_NAME}`}</title>
                <meta name="title" content={`${author.first_name} ${author.last_name} | ${process.env.SITE_NAME}`} />
            </Helmet>
            <ProfileMenu items={menuItems}/>
            <ItemList />
        </ProfileWrapper>
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    return {
        user: state.userData.user,
        author: state.authorData.author,
        notFound: state.authorData.notFound,
        isSelf: state.authorData.author && state.userData.user && state.userData.user.nickname && (state.authorData.author.nickname === state.userData.user.nickname),
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        getAuthor: (slug: any) => { dispatch(getAuthor(slug)) },
        setAuthorNull: () => {dispatch(setAuthorNull())},
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);