import * as React from 'react';
import ImageEditorSimple from "../shared/ImageEditorSimple";
import '../../styles/shared/editable_image_modal.scss';
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import {MediaQuerySerice} from "../../services/MediaQueryService";

const CloseIcon = require('babel!svg-react!../../assets/images/cancel_btn.svg?name=CloseIcon');
const ConfirmIcon = require('babel!svg-react!../../assets/images/ok_btn.svg?name=ConfirmIcon');

interface IEditableImageModalProps {
    image: HTMLImageElement;
    width?: number;
    height?: number;
    outputWidth?: number;
    outputHeight?: number;
    foregroundColor?: string;
    foregroundShape?: string;
    onConfirm?: (imageBase64: string) => any;
    onCancel?: () => any;
}

interface IEditableImageModalState {
    imageBase64?: string|null;
    isDesktop?: boolean;
}

export default class EditableImageModal extends React.Component<IEditableImageModalProps|any, IEditableImageModalState|any> {
    constructor(props: any) {
        super(props);
        this.state = {
            imageBase64: null,
            isDesktop: MediaQuerySerice.getIsDesktop()
        }
    }

    static defaultProps = {
        width: 320,
        height: 320
    };

    handleMediaQuery(isDesktop: boolean) {

        if (this.state.isDesktop != isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    handleImage(imageBase64: string) {
        this.setState({imageBase64: imageBase64});
    }

    handleConfirm() {
        this.props.onConfirm && this.props.onConfirm(this.state.imageBase64);
        ModalAction.do(CLOSE_MODAL, null);
    }

    close() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    render() {
        return (
            <div className="editable_image_modal">
                <div className="editable_image_modal__content">
                    <ImageEditorSimple {...this.props} onChange={this.handleImage.bind(this)}/>
                </div>
                <div className="editable_image_modal__footer">
                    <div key="cancel" className="editable_image_modal__button"
                         onClick={this.close.bind(this)}>
                        <CloseIcon/> Отмена
                    </div>
                    <div key="confirm" className="editable_image_modal__button"
                         onClick={this.handleConfirm.bind(this)}>
                        <ConfirmIcon/> Применить
                    </div>
                </div>
            </div>
        );
    }
}