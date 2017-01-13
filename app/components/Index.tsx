import * as React from 'react';
import {Link} from 'react-router';

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