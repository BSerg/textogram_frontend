import * as React from 'react';
import {ModalAction, CLOSE_MODAL} from '../actions/shared/ModalAction';
import {api} from '../api';
import {Captions} from '../constants';
const CloseIcon = require('-!babel-loader!svg-react-loader!../assets/images/close.svg?name=CloseIcon');
const VisibilityIcon = require('-!babel-loader!svg-react-loader!../assets/images/profile_visibility_icon.svg?name=VisibilityIcon');
const VisibilityOffIcon = require('-!babel-loader!svg-react-loader!../assets/images/profile_visibility_off_icon.svg?name=VisibilityOffIcon');

interface ResetPasswordStateInterface {
    currentStep?: number,
    codeRequested?: boolean,
    hash?: string,
    code?: string,
    codeError?: string | null,
    password?: string,
    passwordError?: string | null,
    passwordVisible?: boolean,
}

export default class ResetPassword extends React.Component<any, ResetPasswordStateInterface> {

    STEP_SEND_CODE: number = 1;
    STEP_SEND_PASSWORD: number = 2;

    STEPS: {step: number, caption: string}[] =
        [
            {step: this.STEP_SEND_CODE, caption: Captions.registration.stepCodeReset},
            {step: this.STEP_SEND_PASSWORD, caption: Captions.registration.stepPasswordReset},
        ];

    PATTERN_INPUT_PASSWORD = /^[^\s]*$/;
    PATTERN_PASSWORD = /^[^\s]{5,}$/;

    constructor() {
        super();
        this.state = {codeRequested: false, currentStep: this.STEP_SEND_CODE, code: "", password: ""};
    }

    cancel() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    sendData() {
        let data: {code?: string, hash?: string, password?: string} = {};

        if (this.state.currentStep ==  this.STEP_SEND_CODE) {
            data.code = this.state.code;
        }
        else if (this.state.currentStep == this.STEP_SEND_PASSWORD) {
            data.hash = this.state.hash;
            data.password = this.state.password;
        }

        if ((this.state.currentStep == this.STEP_SEND_CODE && (this.state.codeError || !this.state.code))
            || (this.state.currentStep == this.STEP_SEND_PASSWORD && (this.state.passwordError || !this.state.password))) {
            return;
        }

        api.post('reset_password/', data).then((response: any) => {
            if (this.state.currentStep == this.STEP_SEND_CODE) {
                this.setState({hash: response.data.hash, currentStep: this.STEP_SEND_PASSWORD});
            }
            else if (this.state.currentStep == this.STEP_SEND_PASSWORD) {
                ModalAction.do(CLOSE_MODAL, null);
            }
        }).catch(() => {
            if (this.state.currentStep == this.STEP_SEND_CODE) {
                this.setState({codeError: 'error'});
            }
            else if (this.state.currentStep == this.STEP_SEND_PASSWORD) {
                this.setState({passwordError: 'error'});
            }
        })

    }

    codeChange(e: any) {
        let code = e.target.value;
        this.setState({code: code, codeError: null})
    }

    passwordChange(e: any) {
        let password: string = e.target.value || '';
        if (password.match(this.PATTERN_INPUT_PASSWORD))
            this.setState({ password: password, passwordError: !password.match(this.PATTERN_PASSWORD) ? 'error': null });
    }

    submitForm(e: any) {
        e.preventDefault();
        this.sendData();
    }

    togglePasswordVisibility() {
        this.setState({passwordVisible: !this.state.passwordVisible});
    }

    componentDidMount() {
        api.post('reset_password/').then((response: any) => {
            this.setState({codeRequested: true});
        }).catch(() => {
            ModalAction.do(CLOSE_MODAL, null);
        })
    }

    render() {
        if (!this.state.codeRequested) return null;
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

                    {
                        this.state.currentStep == this.STEP_SEND_CODE ? (
                            <div className="registration__form">
                                <form onSubmit={this.submitForm.bind(this)}>
                                    <input type="text" name="code" value={this.state.code}
                                           className={ this.state.codeError ? 'error': '' }
                                           placeholder={Captions.registration.codeDescription}
                                           onChange={this.codeChange.bind(this)} />
                                    <button style={{position: 'absolute', opacity: 0}} type="submit">1</button>
                                </form>
                            </div>
                        ) : null
                    }

                    {
                        this.state.currentStep == this.STEP_SEND_PASSWORD ? (
                            <div className="registration__form">
                                <form onSubmit={this.submitForm.bind(this)} autoComplete="false" >

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
                        <div onClick={this.sendData.bind(this)} className={"registration__controls__button" + (!this.state.codeError && this.state.code ? ' active': '')}>
                           {Captions.registration.next}
                        </div> : null }

                    {
                        (this.state.currentStep == this.STEP_SEND_PASSWORD) ? (
                            <div className={"registration__controls__button submit" + (!this.state.passwordError && this.state.password ? ' active': '') }
                                 onClick={this.sendData.bind(this)}>{ Captions.registration.finish }</div>) : null
                    }
                </div>


            </div>)
    }
}