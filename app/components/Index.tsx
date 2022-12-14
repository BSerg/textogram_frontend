import * as React from 'react';
import {Link} from 'react-router-dom';
import {UserAction, GET_ME, LOGIN} from '../actions/user/UserAction';
import '../styles/lentach_index.scss';
import LentachIndex from "./LentachIndex";
import DefaultIndex from './DefaultIndex';


export default class Index extends React.Component<any, any> {
    constructor() {
        super();
        this.state = {
            authenticated: process.env.IS_BROWSER && !!localStorage.getItem('authToken')
        };
        this.redirectToProfile = this.redirectToProfile.bind(this);
    }

    refs: {
        fakeAuthToken: HTMLInputElement
    };

    fakeAuth() {
        if (process.env.IS_BROWSER) {
            let token = this.refs.fakeAuthToken.value;
            localStorage.setItem('authToken', token);
            this.setState({authenticated: true});
        }

    }

    logout() {
        if (process.env.IS_BROWSER) {
            localStorage.removeItem('authToken');
            this.setState({authenticated: false});
        }
    }

    redirectToProfile() {
        if (UserAction.getStore().user && UserAction.getStore().user.id) {
            if (process.env.IS_LENTACH) {
                this.props.history.push('/' + UserAction.getStore().user.nickname);
            }
            else {
                this.props.history.push('/feed');
            }
        }

    }

    componentDidMount() {
        // this.redirectToProfile();
        // UserAction.onChange(GET_ME, this.redirectToProfile);
        // UserAction.onChange(LOGIN, this.redirectToProfile);
    }

    componentWillUnmount() {
        // UserAction.unbind(GET_ME, this.redirectToProfile);
        // UserAction.unbind(LOGIN, this.redirectToProfile);
    }

    render() {
        return (process.env.IS_LENTACH ? <LentachIndex/> :<DefaultIndex />)
    }
}