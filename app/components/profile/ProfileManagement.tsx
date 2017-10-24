import * as React from 'react';
import {connect} from 'react-redux';
import {ProfileMenu} from './ProfileShared';
import {Captions, Constants} from '../../constants';
import {ProfileWrapper} from './ProfileShared';
import ProfileManagementAccount from './ProfileManagementAccount/ProfileManagementAccount';
import ProfileNotifications from './ProfileNotifications/ProfileNotifications';
import ProfileStatistics from './ProfileStatistics/ProfileStatistics';
import ProfilePayments from './ProfilePayments/ProfilePayments';
import '../../styles/profile/profile_management_account.scss';


export class ProfileManagement extends React.Component<any, any> {

    SECTION_ACCOUNT = 'account';
    SECTION_NOTIFICATIONS = 'notifications';
    SECTION_STATISTICS = 'statistics';
    SECTION_PAYMENTS = 'payments';

    SECTIONS: {name: string, caption: string, to: string, component?: any}[] = [
        {name: this.SECTION_ACCOUNT, caption: Captions.management.sectionAccount, to: `/manage/${this.SECTION_ACCOUNT}`, component: ProfileManagementAccount},
        {name: this.SECTION_NOTIFICATIONS, caption: Captions.management.sectionNotifications, to: `/manage/${this.SECTION_NOTIFICATIONS}`, component: ProfileNotifications},
        {name: this.SECTION_STATISTICS, caption: Captions.management.sectionStatistics, to: `/manage/${this.SECTION_STATISTICS}`, component: ProfileStatistics},
        {name: this.SECTION_PAYMENTS, caption: Captions.management.sectionPayments, to: `/manage/${this.SECTION_PAYMENTS}`, component: ProfilePayments},
    ];


    render() {
        let {user, error, match, isDesktop} = this.props;
        if (!user || error) {
            return null;
        }
        let section = this.SECTIONS.find((val: any, index: number, obj: any) => {
            return val.name === match.params.section;
        });
        let SectionComponent = (section && section.component);
        return <ProfileWrapper editable={true}>
            { isDesktop && <ProfileMenu items={this.SECTIONS}/>}
            {SectionComponent && <SectionComponent />}
        </ProfileWrapper>
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