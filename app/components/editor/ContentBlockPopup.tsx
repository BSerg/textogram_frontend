import * as React from 'react';
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from '../../actions/shared/PopupPanelAction';
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from '../../actions/editor/ContentBlockAction';

import '../../styles/editor/content_block_popup.scss';

const DeleteButton = require('babel!svg-react!../../assets/images/redactor_icon_delete.svg?name=DeleteButton');
const ConfirmButton = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmButton');

interface IContentBlockPopupProps {
    extraContent?: JSX.Element|JSX.Element[]
    onConfirm?: () => any
    onDelete?: () => any
}

export default class ContentBlockPopup extends React.Component<IContentBlockPopupProps, any> {
    constructor(props: any) {
        super(props);
    }

    handleDelete(e: any) {
        e.preventDefault();
        e.stopPropagation();
        let _confirm = confirm('Удалить?');
        if (_confirm) {
            this.props.onDelete && this.props.onDelete();
            PopupPanelAction.do(CLOSE_POPUP, null);
        }
    }

    handleConfirm(e: any) {
        e.preventDefault();
        e.stopPropagation();
        this.props.onConfirm && this.props.onConfirm();
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: -1});
        PopupPanelAction.do(CLOSE_POPUP, null);
    }

    render() {
        return (
            <div className="content_block_popup">
                <div onClick={this.handleDelete.bind(this)}>
                    <DeleteButton/>
                </div>
                {this.props.extraContent ? this.props.extraContent : null}
                <div onClick={this.handleConfirm.bind(this)}>
                    <ConfirmButton/>
                </div>
            </div>
        )
    }
}