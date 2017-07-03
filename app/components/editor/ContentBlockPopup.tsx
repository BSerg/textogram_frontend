import * as React from "react";
import {PopupPanelAction, CLOSE_POPUP} from "../../actions/shared/PopupPanelAction";
import {ContentBlockAction, DEACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import "../../styles/editor/content_block_popup.scss";

const DeleteButton = require('-!babel-loader!svg-react-loader!../../assets/images/editor_delete.svg?name=DeleteButton');
const ConfirmButton = require('-!babel-loader!svg-react-loader!../../assets/images/editor_confirm.svg?name=ConfirmButton');
const MoveUpIcon = require('-!babel-loader!svg-react-loader!../../assets/images/editor_up.svg?name=MoveUpIcon');
const MoveDownIcon = require('-!babel-loader!svg-react-loader!../../assets/images/editor_down.svg?name=MoveDownIcon');

interface IContentBlockPopupProps {
    extraContent?: JSX.Element|JSX.Element[]
    onConfirm?: () => any
    onDelete?: () => any
    onMoveUp?: () => any
    onMoveDown?: () => any
}

export default class ContentBlockPopup extends React.Component<IContentBlockPopupProps, any> {
    constructor(props: any) {
        super(props);
    }

    handleDelete(e: any) {
        this.props.onDelete ? this.props.onDelete() : PopupPanelAction.do(CLOSE_POPUP, null);
    }

    handleConfirm(e: any) {
        ContentBlockAction.do(DEACTIVATE_CONTENT_BLOCK, null);
        this.props.onConfirm ? this.props.onConfirm() : PopupPanelAction.do(CLOSE_POPUP, null);
    }

    handleMoveUp() {
        this.props.onMoveUp && this.props.onMoveUp();
    }

    handleMoveDown() {
        this.props.onMoveDown && this.props.onMoveDown();
    }

    render() {
        return (
            <div className="content_block_popup">
                <div onClick={this.handleDelete.bind(this)}>
                    <DeleteButton/>
                </div>
                <div onClick={this.handleMoveUp.bind(this)}>
                    <MoveUpIcon/>
                </div>
                {this.props.extraContent ? this.props.extraContent : null}
                <div onClick={this.handleMoveDown.bind(this)}>
                    <MoveDownIcon/>
                </div>
                <div onClick={this.handleConfirm.bind(this)}>
                    <ConfirmButton/>
                </div>
            </div>
        )
    }
}