import * as React from 'react';
import {withRouter} from 'react-router';

import {ModalAction, CLOSE_MODAL} from '../actions/shared/ModalAction';
import {api} from '../api';
import {Captions} from '../constants';
import '../styles/registration.scss';
import {UserAction, SAVE_USER} from "../actions/user/UserAction";

const CloseIcon = require('babel!svg-react!../assets/images/close.svg?name=CloseIcon');
const VisibilityIcon = require('babel!svg-react!../assets/images/profile_visibility_icon.svg?name=VisibilityIcon');
const VisibilityOffIcon = require('babel!svg-react!../assets/images/profile_visibility_off_icon.svg?name=VisibilityOffIcon');
const BackIcon = require('babel!svg-react!../assets/images/back.svg?name=BackIcon');
const ConfirmIcon = require('babel!svg-react!../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');

interface IRegistrationPropsInterface {
    isForgotPassword?: boolean;
    isSetPhone?: boolean;
    router?: any;
}

interface IRegistrationStateInterface {
    phone?: string,
    code?: string;
    password?: string,
    passwordAgain?: string,
    hash?: string,
    userName?: string,
    phoneError?: string,
    codeError?: string,
    userNameError?: string,
    passwordError?: string,
    currentStep?: number,
    patternInputPhone?: any,
    patternPhone?: any,
    passwordVisible?: boolean,
}

class RegistrationClass extends React.Component<IRegistrationPropsInterface|any, IRegistrationStateInterface|any> {

    static defaultProps: any = {
        isForgotPassword: false,
        isSetPhone: false,
    };

    STEP_SEND_PHONE: number = 1;
    STEP_SEND_CODE: number = 2;
    STEP_SEND_REGISTRATION_DATA: number = 3;

    STEPS: {step: number, caption: string}[] =
        [
            {step: this.STEP_SEND_PHONE, caption: Captions.registration.stepPhoneRegistration},
            {step: this.STEP_SEND_CODE, caption: Captions.registration.stepCodeRegistration},
            {step: this.STEP_SEND_REGISTRATION_DATA, caption: Captions.registration.stepPasswordRegistration},
        ];

    PATTERN_INPUT_PHONE = /^\+7\d{0,10}$/;
    PATTERN_PHONE = /^\+7\d{10}$/;

    PATTERN_INPUT_USERNAME = /^([\wа-я]+\s?)*$/i;
    PATTERN_USERNAME = /^[\wа-я]([\wа-я]+\s?)+$/i;

    PATTERN_INPUT_PASSWORD = /^[^\s]*$/;
    PATTERN_PASSWORD = /^[^\s]{5,}$/;

    constructor() {
        super();
        let patternInputPhone = new RegExp('^\\' + this.getInitialCode() + '\\d{0,10}$');
        let patternPhone = new RegExp('^\\' + this.getInitialCode() + '\\d{10}$');
        this.state = {
            currentStep: this.STEP_SEND_PHONE, phone: this.getInitialCode(), code: '', hash: '', password: '',
            userName: '', patternPhone: patternPhone, patternInputPhone: patternInputPhone, passwordVisible: false
        };
    }

    getInitialCode() {
        return '+7';
    }

    submitForm(e: any) {
        e.preventDefault();
        this.sendData();
    }

    sendData() {
        let data: any = {};
        if (this.state.currentStep ==  this.STEP_SEND_PHONE) {
            if (this.state.phone && !this.state.phoneError) {
                data['phone'] = this.state.phone.substring(1);
            }
            else {
                return;
            }
        }
        else if (this.state.currentStep ==  this.STEP_SEND_CODE) {
            if (this.state.code && !this.state.codeError) {
                data['phone'] = this.state.phone;
                data['code'] = this.state.code;
            }
            else {
                return;
            }
        }

        else if (this.state.currentStep ==  this.STEP_SEND_REGISTRATION_DATA) {
            if (((this.state.userName && !this.state.userNameError) || (this.props.isForgotPassword || this.props.isSetPhone)) && this.state.password  && !this.state.passwordError) {
                data['phone'] = this.state.phone;
                data['hash'] = this.state.hash;
                data['username'] = this.state.userName;
                data['password'] = this.state.password;
                data['password_again'] = this.state.passwordAgain;
            }
            else {
                return;
            }
        }
        let url;

        if (this.props.isForgotPassword) url = 'recover_password/';
        else if (this.props.isSetPhone) url = 'set_phone/';
        else url = 'registration/';

        api.post(url, data).then((response: any) => {
            if (this.state.currentStep == this.STEP_SEND_PHONE) {
                this.setState({phone: response.data.phone, currentStep: this.STEP_SEND_CODE});
            }
            else if (this.state.currentStep == this.STEP_SEND_CODE) {
                this.setState({hash: response.data.hash, phone: response.data.phone,
                    currentStep: this.STEP_SEND_REGISTRATION_DATA, passwordVisible: false});
            }
            else if (this.state.currentStep == this.STEP_SEND_REGISTRATION_DATA) {
                UserAction.do(SAVE_USER, response.data.user);
                if (!this.props.isForgotPassword && !this.props.isSetPhone) {
                    this.props.router.push('/manage');
                }
                ModalAction.do(CLOSE_MODAL, null);
            }


        }).catch((error: any) => {
            if (this.state.currentStep == this.STEP_SEND_PHONE) {
                this.setState({phoneError: 'error'});
            }
            else if (this.state.currentStep == this.STEP_SEND_CODE) {
                this.setState({codeError: 'code'});
            }
            else if (this.state.currentStep == this.STEP_SEND_REGISTRATION_DATA) {
                this.setState({passwordError: 'error', userNameError: 'error'});
            }
        })
    }

    phoneChange(e: any) {
        let phone: string = e.target.value || '';
        if (phone.match(this.state.patternInputPhone)) {
            this.setState({phone: phone, phoneError: !phone.match(this.state.patternPhone) ? 'error' : null});
        }
    }

    codeChange(e: any) {
        let code: string = e.target.value;
        this.setState({code: code, codeError: null});
    }

    userNameChange(e: any) {
        let userName: string = e.target.value || '';
        if (userName.match(this.PATTERN_INPUT_USERNAME))
            this.setState({userName: userName, userNameError: !userName.match(this.PATTERN_USERNAME) ? 'error': null});
    }

    passwordChange(e: any) {
        let password: string = e.target.value || '';
        if (password.match(this.PATTERN_INPUT_PASSWORD))
            this.setState({ password: password, passwordError: !password.match(this.PATTERN_PASSWORD) ? 'error': null });
    }

    togglePasswordVisibility() {
        this.setState({passwordVisible: !this.state.passwordVisible});
    }

    back() {
        this.setState({currentStep: this.STEP_SEND_PHONE, phone: this.getInitialCode(), code: '', codeError: null,
            hash: '', password: '', passwordAgain: ''});
    }

    cancel() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    render() {
        if (this.state.currentStep != this.STEP_SEND_PHONE && this.state.currentStep != this.STEP_SEND_CODE && this.state.currentStep != this.STEP_SEND_REGISTRATION_DATA)
            return null;

        return (
            <div className="registration">
                <div className="registration__controls top">
                    <div onClick={this.cancel}><CloseIcon /></div>
                </div>
                <div className="registration__steps">
                    { this.STEPS.map((step, index) => {
                        return (<div className={step.step <= this.state.currentStep ? "active" : ""} key={step.step}>{step.caption}</div>)
                    }) }
                </div>
                <div className="registration__content">

                    <div className="registration__description">
                        {
                            this.state.currentStep == this.STEP_SEND_PHONE ?
                                (this.props.isSetPhone ? Captions.registration.phoneDescriptionAlt : Captions.registration.phoneDescription) :

                                null }
                        { this.state.currentStep == this.STEP_SEND_CODE ? Captions.registration.codeDescription : null }

                    </div>

                    {
                        this.state.currentStep == this.STEP_SEND_PHONE ? (
                            <div className="registration__form" >
                                <form onSubmit={this.submitForm.bind(this)}>
                                    <input type="text" name="phone" className={ this.state.phoneError ? 'error': '' }
                                           ref="phone" onChange={this.phoneChange.bind(this)}
                                           value={ this.state.phone }/>
                                    <button style={{position: 'absolute', opacity: 0}} type="submit">1</button>
                                </form>
                            </div>
                        ) : null
                    }

                    {
                        this.state.currentStep == this.STEP_SEND_CODE ? (
                            <div className="registration__form">
                                <form onSubmit={this.submitForm.bind(this)}>
                                    <input type="text" name="code" value={this.state.code}
                                           className={ this.state.codeError ? 'error': '' }
                                           onChange={this.codeChange.bind(this)} />
                                    <button style={{position: 'absolute', opacity: 0}} type="submit">1</button>
                                </form>
                            </div>
                        ) : null
                    }

                    {
                        this.state.currentStep == this.STEP_SEND_REGISTRATION_DATA ? (
                            <div className="registration__form">
                                <form onSubmit={this.submitForm.bind(this)} autoComplete="false" >
                                    {
                                        (!this.props.isForgotPassword && !this.props.isSetPhone) ? (
                                            <div>
                                                <input type="text" name="n" value={this.state.userName}
                                                       className={ this.state.userNameError ? 'error': '' }
                                                       placeholder={Captions.registration.usernamePrompt}
                                                       onChange={this.userNameChange.bind(this)} autoComplete="new-password" />
                                            </div>
                                        ) : null
                                    }

                                    <div>
                                        <input type={this.state.passwordVisible ? "text" :"password"}
                                               className={ this.state.passwordError ? 'error': '' }
                                               name="p" value={this.state.password}
                                               placeholder={Captions.registration.passwordPrompt}
                                               onChange={this.passwordChange.bind(this)} autoComplete="new-password" />

                                        <div onClick={this.togglePasswordVisibility.bind(this)}
                                             className={"password_visibility_icon" + (this.state.passwordVisible ? ' visible' : '')}>
                                            { this.state.passwordVisible ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                                        </div>
                                    </div>
                                    <button style={{position: 'absolute', opacity: 0}} type="submit">1</button>
                                </form>
                            </div>
                        ) : null
                    }
                </div>

                <div className="registration__controls bottom">
                    { this.state.currentStep == this.STEP_SEND_CODE ?
                        <div onClick={this.back.bind(this)} className={"registration__controls__button active"}>
                            <BackIcon /> {Captions.registration.changeNumber}
                        </div> : null }
                    {
                        (this.state.currentStep == this.STEP_SEND_PHONE) ? (
                            <div className={"registration__controls__button submit" + (!this.state.phoneError && this.state.phone.length > 2 ? ' active': '' )} onClick={this.sendData.bind(this)}>{ Captions.registration.next }</div>) : null
                    }
                    {
                        (this.state.currentStep == this.STEP_SEND_CODE) ? (
                            <div className={"registration__controls__button submit" + (!this.state.codeError && this.state.code ? ' active': '')} onClick={this.sendData.bind(this)}>{ Captions.registration.next }</div>) : null
                    }
                    {
                        (this.state.currentStep == this.STEP_SEND_REGISTRATION_DATA) ? (
                            <div className={"registration__controls__button submit" + (!this.state.passwordError && this.state.password ? ' active': '') }
                                 onClick={this.sendData.bind(this)}>{ Captions.registration.finish }</div>) : null
                    }
                </div>
            </div>
        )
    }
}

let Registration = withRouter(RegistrationClass);

export default Registration;