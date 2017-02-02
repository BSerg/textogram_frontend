import * as React from 'react';
import {ModalAction, CLOSE_MODAL} from '../actions/shared/ModalAction';
import {api} from '../api';
import {Captions} from '../constants';
const CloseIcon = require('babel!svg-react!../assets/images/close.svg?name=CloseIcon');

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
        this.state = {codeRequested: false, currentStep: this.STEP_SEND_CODE};
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

        if ((this.state.currentStep == this.STEP_SEND_CODE && this.state.codeError) || (this.state.currentStep == this.STEP_SEND_PASSWORD && this.state.passwordError)) {
            return;
        }

        api.post('reset_password/', data).then((response: any) => {
            if (this.state.currentStep == this.STEP_SEND_CODE) {
                this.setState({hash: response.data.hash, currentStep: this.STEP_SEND_PASSWORD});
            }
            else if (this.state.currentStep == this.STEP_SEND_PASSWORD) {
                ModalAction.do(CLOSE_MODAL, null);
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

    componentDidMount() {
        api.post('reset_password/').then((response: any) => {
            console.log(response.data);
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
            </div>)
    }
}