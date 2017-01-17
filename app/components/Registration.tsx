import * as React from 'react';

import {ModalAction, CLOSE_MODAL} from '../actions/shared/ModalAction';
import {api} from '../api';
import {Captions} from '../constants';
import '../styles/registration.scss';

const CloseIcon = require('babel!svg-react!../assets/images/close.svg?name=CloseIcon');
const VisibilityIcon = require('babel!svg-react!../assets/images/profile_visibility_icon.svg?name=VisibilityIcon');
const VisibilityOffIcon = require('babel!svg-react!../assets/images/profile_visibility_off_icon.svg?name=VisibilityOffIcon');
const BackIcon = require('babel!svg-react!../assets/images/back.svg?name=BackIcon');
const ConfirmIcon = require('babel!svg-react!../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');

interface IRegistrationStateInterface {
    phone?: string,
    code?: string;
    password?: string,
    passwordAgain?: string,
    hash?: string,
    userName?: string,
    phoneError?: string,
    codeError?: string,
    passwordError?: string,
    currentStep?: number,

}

export default class Registration extends React.Component<any, IRegistrationStateInterface> {

    STEP_SEND_PHONE: number = 1;
    STEP_SEND_CODE: number = 2;
    STEP_SEND_REGISTRATION_DATA: number = 3;

    constructor() {
        super();
        this.state = {currentStep: this.STEP_SEND_PHONE}
    }

    sendData() {
        let data: any = {};
        api.post('registration/', data).then((response: any) => {

        }).catch()
    }

    confirmCode() {

    }

    back() {
        this.setState({currentStep: this.STEP_SEND_PHONE, phone: null, code: null, hash: null, password: null, passwordAgain: null});
    }

    cancel() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    register() {

    }

    render() {
        if (this.state.currentStep != this.STEP_SEND_PHONE && this.state.currentStep != this.STEP_SEND_CODE && this.state.currentStep != this.STEP_SEND_REGISTRATION_DATA)
            return null;
        return (
            <div className="registration">
                <div className="registration__controls top">
                    <div><CloseIcon /></div>
                </div>
                <div className="registration__content">

                    <div className="registration__description">
                        { this.state.currentStep == this.STEP_SEND_PHONE ? Captions.registration.phoneDescription : null }
                        { this.state.currentStep == this.STEP_SEND_CODE ? Captions.registration.codeDescription : null }

                    </div>

                    {
                        this.state.currentStep == this.STEP_SEND_PHONE ? (
                            <div className="registration__input">
                                <form>
                                    <input type="text" name="phone" ref="phone" />
                                </form>
                            </div>
                        ) : null
                    }

                    {
                        this.state.currentStep == this.STEP_SEND_CODE ? (
                            <div className="registration__input">
                                <form><input type="text" name="code" ref="code" /></form>
                            </div>
                        ) : null
                    }


                </div>

                <div className="registration__controls bottom">
                    { this.state.currentStep == this.STEP_SEND_CODE ? <div onClick={this.back.bind(this)}><BackIcon /></div> : null }
                    <div>{ this.state.currentStep == this.STEP_SEND_REGISTRATION_DATA ? Captions.registration.register : <ConfirmIcon />}</div>
                </div>
            </div>
        )
    }
}