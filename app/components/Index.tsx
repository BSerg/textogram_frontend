import * as React from 'react';
import {Link} from 'react-router';
import {UserAction, GET_ME, LOGIN} from '../actions/user/UserAction';
import '../styles/lentach_index.scss';
import LentachIndex from "./LentachIndex";


export default class Index extends React.Component<any, any> {
    constructor() {
        super();
        this.state = {
            authenticated: !!localStorage.getItem('authToken')
        };
        this.redirectToProfile = this.redirectToProfile.bind(this);
    }

    refs: {
        fakeAuthToken: HTMLInputElement
    };

    fakeAuth() {
        let token = this.refs.fakeAuthToken.value;
        localStorage.setItem('authToken', token);
        this.setState({authenticated: true});
    }

    logout() {
        localStorage.removeItem('authToken');
        this.setState({authenticated: false});
    }

    redirectToProfile() {
        if (UserAction.getStore().user && UserAction.getStore().user.id)
            this.props.router.push('profile/' + UserAction.getStore().user.id);
    }

    componentDidMount() {
        UserAction.onChange(GET_ME, this.redirectToProfile);
        UserAction.onChange(LOGIN, this.redirectToProfile);
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.redirectToProfile);
        UserAction.unbind(LOGIN, this.redirectToProfile);
    }

    render() {
        return (
            process.env.IS_LENTACH ?
                <LentachIndex/> :
                <div className="index">
                    <h1>__TEXTIUS__</h1>
                </div>
            )
    }
}