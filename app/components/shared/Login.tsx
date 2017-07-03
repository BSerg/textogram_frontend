import * as React from 'react';
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from '../../actions/shared/ModalAction';
import {UserAction, LOGIN} from '../../actions/user/UserAction';
import '../../styles/shared/login.scss';

const VisibilityIcon = require('-!babel-loader!svg-react-loader!../../assets/images/profile_visibility_icon.svg?name=VisibilityIcon');
const VisibilityOffIcon = require('-!babel-loader!svg-react-loader!../../assets/images/profile_visibility_off_icon.svg?name=VisibilityOffIcon');
const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/close.svg?name=CloseIcon');

interface ILoginProps {
    onLogin?: () => any
}

interface ILoginStateInterface {
    login?: string;
    loginError?: boolean;
    password?: string;
    passwordError?: boolean;
    passwordVisible?: boolean;
}

export default class Login extends React.Component<any, ILoginStateInterface> {

    constructor() {
        super();
        this.state = {login: "", password: "", loginError: false, passwordError: false, passwordVisible: false}
    }

    loginChange(e: any) {
        this.setState({login: e.target.value, loginError: false, passwordError: false});
    }

    passwordChange(e: any) {
        let password: string = e.target.value;
        if (password.match(/^[^\s]*$/)) {
            this.setState({password: password, loginError: false, passwordError: false});
        }
    }

    closeModal() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    formSubmit(e: any) {
        e.preventDefault();
        this.login();
    }

    togglePasswordVisible() {
        this.setState({passwordVisible: !this.state.passwordVisible});
    }

    login() {
        let login: string = this.state.login;
        login = login.replace('+', '');
        UserAction.doAsync(LOGIN, {login: login, password: this.state.password}).then(() => {
            ModalAction.do(CLOSE_MODAL, null);
            this.props.onLogin && this.props.onLogin();
        }).catch((error) => { this.setState({loginError: true, passwordError: true}); });
    }

    componentDidMount() {

    }


    render() {
        return (
            <div className="login">
                <div onClick={this.closeModal.bind(this)} className="close"><CloseIcon /></div>
                <form method="post" onSubmit={this.formSubmit.bind(this)}>
                    <div>
                        <input type="text" name="phone" value={this.state.login}
                               onChange={this.loginChange.bind(this)} className={this.state.loginError ? "error" : ""}/>
                        <div className="hint">ЛОГИН (НОМЕР ТЕЛЕФОНА ИЛИ E-MAIL)</div>

                    </div>
                    <div>
                        <input type={ this.state.passwordVisible ? "text" : "password"}
                               name="password" value={this.state.password}
                               className={this.state.loginError ? "error" : ""}
                               placeholder="Пароль"
                               onChange={this.passwordChange.bind(this)}/>
                        <div className={"hint hint_clickable" + (this.state.passwordError ? " hint_error" : "")}>ЗАБЫЛИ ПАРОЛЬ?</div>

                        <div className="input_icon" onClick={this.togglePasswordVisible.bind(this)}>
                            {this.state.passwordVisible ? (<VisibilityIcon />) : (<VisibilityOffIcon />)}
                        </div>

                    </div>
                    <div><button type="submit" name="submit" onClick={this.formSubmit.bind(this)}>ВОЙТИ</button></div>
                </form>


        </div>)
    }
}