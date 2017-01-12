import * as React from 'react';
import {Captions} from '../constants';

import {UserAction, GET_ME, LOGIN, LOGOUT} from '../actions/user/UserAction';
import Error from './Error';
import Header from './shared/Header';
import ContentEditable from './shared/ContentEditable';

import '../styles/common.scss';
import '../styles/profile_management.scss';

interface IProfileManagementState {
    user?: any,
    error?: any,
    userName?: null | string,
    userNameContent?: null | string,
}

export default class ProfileManagement extends React.Component<any, IProfileManagementState> {

    constructor() {
        super();
        this.state = this.getStateData();
        this.checkUser = this.checkUser.bind(this);
        this.userNameChange = this.userNameChange.bind(this);
        this.saveUserName = this.saveUserName.bind(this);
    }

    getStateData(): IProfileManagementState {
        let user = UserAction.getStore().user;
        let userName = user ?user.first_name + " " + user.last_name : "";
        let userNameContent = this.getUserNameContent(userName);
        return {
            user: user,
            userName: userName,
            userNameContent: userNameContent,
            error: user ? null : <Error code={404} msg="page not found" /> };
    }

    getUserNameContent(userName: string): string {
        userName = userName.replace(/\s\s+/g, ' ');
        let arr = userName.split(" ");
        let first: string;
        let rest: string;
        if (arr.length <= 1) {
            first = userName;
            rest = "";
        }
        else {
            first = arr.splice(0, 1).join("");
            rest = arr.join(" ");
        }
        console.log(first);
        console.log(rest);
        return "<div class='editable'>" + "<span>" + first + " </span>" + "<span>" + rest + "</span>" + "</div>";
    }

    checkUser() {
        this.setState(this.getStateData);
    }

    userNameChange(content: string, contentText: string) {
        this.setState({userName: contentText});
    }

    saveUserName() {
        this.setState({userNameContent: this.getUserNameContent(this.state.userName)});
    }

    componentDidMount() {
        UserAction.onChange(GET_ME, this.checkUser);
        UserAction.onChange(LOGIN, this.checkUser);
        UserAction.onChange(LOGOUT, this.checkUser);
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.checkUser);
        UserAction.unbind(LOGIN, this.checkUser);
        UserAction.unbind(LOGOUT, this.checkUser);
    }

    render() {
        if (this.state.error) return (this.state.error);
        return (
            <div id="profile_management">
                <Header>{Captions.management.title}</Header>
                <div className="profile__avatar"><img src={this.state.user.avatar}/></div>
                <div className="profile__username">
                    <ContentEditable
                        elementType="inline"
                        allowLineBreak={false}
                        placeholder={Captions.management.usernamePlaceholder}
                        alignContent="center"
                        onChange={this.userNameChange}
                        onBlur={this.saveUserName}
                        content={ this.state.userNameContent } />
                </div>

            </div>);
    }
}