import * as React from 'react';
import {Link} from 'react-router';
import {UserAction, GET_ME, LOGIN} from '../actions/user/UserAction';

export default class Index extends React.Component<any, any> {
    constructor() {
        super();
        this.state = {
            authenticated: !!localStorage.getItem('authToken')
        }
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
        UserAction.onChange(GET_ME, this.redirectToProfile.bind(this));
        UserAction.onChange(LOGIN, this.redirectToProfile.bind(this));
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.redirectToProfile.bind(this));
        UserAction.unbind(LOGIN, this.redirectToProfile.bind(this));
    }

    render() {
        return (
            <div className="index" style={{textAlign: "center"}}>
                <h2 style={{marginTop: "80px"}}>TEXTIUS!</h2>
                {this.state.authenticated ?
                    [
                        <h4>Hello, Juliy! You are authenticated!</h4>,
                        <Link to="/articles/1/edit">PUSH ME!</Link>,
                        <br/>,
                        <button onClick={this.logout.bind(this)}>Logout</button>
                    ] :
                    [
                        <input ref="fakeAuthToken" type="text" placeholder="Enter token"/>,
                        <button onClick={this.fakeAuth.bind(this)}>Login</button>
                    ]
                }
            </div>
        )
    }
}