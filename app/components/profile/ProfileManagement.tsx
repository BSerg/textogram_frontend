import * as React from 'react';
import {connect} from 'react-redux';
import {ProfileMenu} from './ProfileShared';
import {Captions, Constants} from '../../constants';
import ProfileAuthor from './ProfileAuthor';

export class ProfileManagement extends React.Component<any, any> {

    SECTION_ACCOUNT = 'account';
    SECTION_NOTIFICATIONS = 'notifications';
    SECTION_STATISTICS = 'statistics';

    SECTIONS: {name: string, caption: string, to: string, section?: any}[] = [
        {name: this.SECTION_ACCOUNT, caption: Captions.management.sectionAccount, to: '/manage/account'},
        {name: this.SECTION_NOTIFICATIONS, caption: Captions.management.sectionNotifications, to: '/manage/notifications'},
        {name: this.SECTION_STATISTICS, caption: Captions.management.sectionStatistics, to: '/manage/statistics'},
    ];

    render() {
        let {user, error} = this.props;
        if (!user || error) {
            return null;
        }
        return <div id="profile">
            <div id="profile_content">
                <ProfileAuthor editable={true}/>
                <div className="profile_content_filler"></div>
                <div className="profile_content_data">
                    <ProfileMenu items={this.SECTIONS}/>
                </div>

            </div>
        </div>;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    return {
        user: state.userData.user,
        error: state.userData.error,
        isDesktop: state.screen.isDesktop,
    }
}


export default connect(mapStateToProps, null)(ProfileManagement);