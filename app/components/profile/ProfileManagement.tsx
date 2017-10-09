import * as React from 'react';
import {connect} from 'react-redux';
import {ProfileMenu} from './ProfileShared';
import {Captions, Constants} from '../../constants';
import ProfileAuthor from './ProfileAuthor';
import AvatarEditor from './AvatarEditor/AvatarEditor';
import ProfileManagementAccount from './ProfileManagementAccount/ProfileManagementAccount';
import ProfileNotifications from './ProfileNotifications/ProfileNotifications';

import '../../styles/profile/profile_management_account.scss';


export class ProfileManagement extends React.Component<any, any> {

    SECTION_ACCOUNT = 'account';
    SECTION_NOTIFICATIONS = 'notifications';
    SECTION_STATISTICS = 'statistics';

    SECTIONS: {name: string, caption: string, to: string, component?: any}[] = [
        {name: this.SECTION_ACCOUNT, caption: Captions.management.sectionAccount, to: `/manage/${this.SECTION_ACCOUNT}`, component: <ProfileManagementAccount />},
        {name: this.SECTION_NOTIFICATIONS, caption: Captions.management.sectionNotifications, to: `/manage/${this.SECTION_NOTIFICATIONS}`, component: <ProfileNotifications />},
        {name: this.SECTION_STATISTICS, caption: Captions.management.sectionStatistics, to: `/manage/${this.SECTION_STATISTICS}`},
    ];


    render() {
        let {user, error, match} = this.props;
        if (!user || error) {
            return null;
        }
        let section = this.SECTIONS.find((val: any, index: number, obj: any) => {
            return val.name === match.params.section;
        });
        let SectionComponent = (section && section.component) || null;

        return <div id="profile">
            <div id="profile_content">
                <AvatarEditor />
                <ProfileAuthor editable={true}/>
                <div className="profile_content_filler"></div>
                <div className="profile_content_data">
                    <ProfileMenu items={this.SECTIONS}/>
                    {SectionComponent}
                </div>

            </div>
        </div>;
    }
}



const mapStateToProps = (state: any, ownProps: any) => {
    return {
        user: state.userData.user,
        error: state.userData.error,
    }
}


export default connect(mapStateToProps, null)(ProfileManagement);