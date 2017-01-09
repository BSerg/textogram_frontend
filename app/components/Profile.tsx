import * as React from 'react';

import '../styles/profile.scss';

import {api} from '../api';

import Error from './Error';
import {UserAction} from "../actions/user/UserAction";



class ProfileAvatar extends React.Component<any, any> {
    render() {
        return (<div></div>);
    }
}


interface IProfileState {
    user?: any;
    error?: any;
    isSelf?: boolean;
}

export default class Profile extends React.Component<any, IProfileState> {


    constructor(props: any) {
        super(props);
    }

    getUserData(userId: string) {
        api.get('/users/' + userId + '/').then((response: any) => {
            let isSelf =  UserAction.getStore().user && UserAction.getStore().user.id == response.data.id;
            this.setState({user: response.data, isSelf: isSelf}, () => {
                console.log(this.state.user);
            });
        }).catch((error) => {
            this.setState({error: <Error code={404} msg="page not found" /> });
        })
    }

    componentWillReceiveProps(nextProps: any) {
        this.getUserData(nextProps.params.userId);
    }

    componentDidMount() {
        this.getUserData(this.props.params.userId);
    }

    render() {
        if (this.state && this.state.error) {
            return (this.state.error);
        }
        return (
            <div className="profile">

                 <div id="profile_content">
                    {
                        this.state && this.state.user ? [
                            <div  className="profile_header" key="header"></div>,
                            <div className="profile_avatar" key="avatar">
                                <img src={this.state.user.avatar}/>
                            </div>,

                            <div key="username" className="profile_username">
                                <span>{this.state.user.first_name}</span> <span> {this.state.user.last_name}</span>
                            </div>

                        ] : null
                    }
                </div>
            </div>
        )
    }
}