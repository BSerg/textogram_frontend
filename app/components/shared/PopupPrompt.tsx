import * as React from 'react';

import {Captions} from '../../constants';
import {PopupPanelAction, CLOSE_POPUP} from "../../actions/shared/PopupPanelAction";

import '../../styles/shared/popup_prompt.scss';


interface IProps {
    confirmLabel?: string
    onConfirm?: () => any
    confirmClass?: any
    cancelLabel?: string
    onCancel?: () => any
    cancelClass?: any
}

export default class PopupPrompt extends React.Component<IProps, any> {
    constructor(props: any) {
        super(props);
    }

    static defaultProps = {
        confirmLabel: Captions.shared.confirmLabel,
        cancelLabel: Captions.shared.cancelLabel,
    };

    handleConfirm() {
        this.props.onConfirm && this.props.onConfirm();
        PopupPanelAction.do(CLOSE_POPUP, null);
    }

    handleCancel() {
        this.props.onCancel&& this.props.onCancel();
        PopupPanelAction.do(CLOSE_POPUP, null);
    }

    render() {
        return (
            <div className="popup_prompt">
                <div className={"popup_prompt__btn" + (this.props.confirmClass ? ' ' + this.props.confirmClass : '')}
                     onClick={this.handleConfirm.bind(this)}>{this.props.confirmLabel}</div>
                <div className={"popup_prompt__btn" + (this.props.cancelClass ? ' ' + this.props.cancelClass: '')}
                     onClick={this.handleCancel.bind(this)}>{this.props.cancelLabel}</div>
            </div>
        )
    }
}