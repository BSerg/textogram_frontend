import * as React from 'react';
import Login from "./shared/Login";
import '../styles/login_page.scss';

export default class LoginPage extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    handleLogin() {
        this.props.router.push('/');
    }

    render() {
        return (
            <div className="login_page">
                <Login onLogin={this.handleLogin.bind(this)}/>
            </div>
        )
    }
}