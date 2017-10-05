import * as React from 'react';
import {connect} from 'react-redux';
import ItemList from '../shared/ItemList/ItemList';
import ProfileAuthor from './ProfileAuthor';
import {Helmet} from 'react-helmet';


export class Profile extends React.Component<any, any> {

    render() {
        let {author} = this.props;
        return <div id="profile">
            {
                author ?     <Helmet>
                    <title>{`${author.first_name} ${author.last_name} | ${process.env.SITE_NAME}`}</title>
                    <meta name="title" content={`${author.first_name} ${author.last_name} | ${process.env.SITE_NAME}`} />
                </Helmet> : null
            }
            
            <div id="profile_content">
                <ProfileAuthor />
                <div className="profile_content_filler"></div>
                <div className="profile_content_data">
                    PROFILE
                </div>
            </div>
            
        </div>
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    return {
        author: state.authorData.author,
    }
}

export default connect(mapStateToProps, null)(Profile);