import * as React from 'react';
import {Captions} from '../../constants';

import ProfileManagementNotifications from './ProfileManagementNotifications';

import Loading from '../shared/Loading';
// import {Error} from '../Error';

import {UserAction, GET_ME, LOGOUT, LOGIN, UPDATE_USER, USER_REJECT} from '../../actions/user/UserAction';
import Error from "../Error";

interface IManagementState {
    user?: any;
    error?: any;
    currentSection?: string;
    isDesktop?: boolean;
}

export default class ProfileManagement extends React.Component<any, IManagementState> {

    SECTION_ACCOUNT = 'account';
    SECTION_NOTIFICATIONS = 'notifications';

    constructor() {
        super();
        this.state = {currentSection: 'notifications', isDesktop: false,
            user: UserAction.getStore().user ? JSON.parse(JSON.stringify(UserAction.getStore().user)) : null};
        this.setUser = this.setUser.bind(this);
        this.setError = this.setError.bind(this);
    }

    setUser() {
        this.setState({
            user: UserAction.getStore().user ? JSON.parse(JSON.stringify(UserAction.getStore().user)) : null,
            error: UserAction.getStore().user ? null : <Error/>
        });
    }

    setError() {
        this.setState({error: UserAction.getStore().user ? null : <Error/>})
    }

    setSection(sectionName: string) {
        this.setState({currentSection: sectionName});
    }

    componentDidMount() {
        UserAction.onChange([GET_ME, LOGIN, LOGOUT, UPDATE_USER, USER_REJECT], this.setUser);
    }

    componentWillUnmount() {
        UserAction.unbind([GET_ME, LOGIN, LOGOUT, UPDATE_USER, USER_REJECT], this.setUser);
    }

    render() {

        if (this.state.error) {
            return (this.state.error);
        }

        if (!this.state.user) {
            return (<div id="profile" className="profile_loading"><Loading /></div>);
        }

        let sections: {name: string, caption: string}[] = [
            {name: this.SECTION_ACCOUNT, caption: Captions.management.sectionAccount},
            {name: this.SECTION_NOTIFICATIONS, caption: Captions.management.sectionNotifications}];

        let section: any = null;

        if (this.state.currentSection == this.SECTION_NOTIFICATIONS) {
            section = <ProfileManagementNotifications/>;
        }

        return (
            <div id="profile">
                <div id="profile_content">
                    <div className="profile_content_main">

                    </div>
                    <div className="profile_content_filler"></div>

                    <div className="profile_content_data">
                        <div className="profile_menu">
                            { sections.map((section: {name: string, caption: string}, index  ) => {
                                 return (<div key={index}
                                              className={ "menu_item" + (section.name == this.state.currentSection ? " active" : "")}
                                              onClick={this.setSection.bind(this, section.name)}>
                                     { section.caption }
                                 </div>)
                             }) }
                        </div>

                        {section}


                    </div>
                </div>




            </div>)
    }
}