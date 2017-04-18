import * as React from 'react';
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from '../../actions/shared/ModalAction';
import {UserAction, LOGIN} from '../../actions/user/UserAction';
import '../../styles/shared/login.scss';

const VisibilityIcon = require('babel!svg-react!../../assets/images/profile_visibility_icon.svg?name=VisibilityIcon');
const VisibilityOffIcon = require('babel!svg-react!../../assets/images/profile_visibility_off_icon.svg?name=VisibilityOffIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');

interface ILoginProps {
    onLogin?: () => any
}

interface ILoginStateInterface {
    phone?: string;
    phoneError?: boolean;
    password?: string;
    passwordError?: boolean;
    passwordVisible?: boolean;
}

export default class Login extends React.Component<any, ILoginStateInterface> {

    constructor() {
        super();
        this.state = {phone: "+7", password: "", phoneError: false, passwordError: false, passwordVisible: false}
    }

    phoneChange(e: any) {
        let phone: string = e.target.value;
        if (phone.match(/^\+*\d{0,11}$/)) {
            this.setState({phone: phone, phoneError: false, passwordError: false});
        }
    }

    passwordChange(e: any) {
        let password: string = e.target.value;
        if (password.match(/^[^\s]*$/)) {
            this.setState({password: password, phoneError: false, passwordError: false});
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
        let phone: string = this.state.phone;
        phone = phone.replace('+', '');
        UserAction.doAsync(LOGIN, {phone: phone, password: this.state.password}).then(() => {
            ModalAction.do(CLOSE_MODAL, null);
            this.props.onLogin && this.props.onLogin();
        }).catch((error) => { this.setState({phoneError: true, passwordError: true}); });


    }

    componentDidMount() {

    }


    render() {
        return (
            <div className="login">
                <div onClick={this.closeModal.bind(this)} className="close"><CloseIcon /></div>
                <form method="post" onSubmit={this.formSubmit.bind(this)}>
                    <div>
                        <input type="text" name="phone" value={this.state.phone}
                               onChange={this.phoneChange.bind(this)} className={this.state.phoneError ? "error" : ""}/>
                        <div className="hint">ЛОГИН (НОМЕР ТЕЛЕФОНА)</div>

                    </div>
                    <div>
                        <input type={ this.state.passwordVisible ? "text" : "password"}
                               name="password" value={this.state.password}
                               className={this.state.phoneError ? "error" : ""}
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