import * as React from 'react';
import ImageEditorSimple from "../shared/ImageEditorSimple";
import '../../styles/shared/editable_image_modal.scss';
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import {MediaQuerySerice} from "../../services/MediaQueryService";

const CloseIcon = require('babel!svg-react!../../assets/images/close_small.svg?name=CloseIcon');
const ConfirmIcon = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');

interface IEditableImageModalProps {
    image: HTMLImageElement;
    width: number;
    height: number;
    foregroundColor?: string;
    foregroundShape?: string;
    onConfirm?: (imageBase64: string) => any;
    onCancel?: () => any;
}

interface IEditableImageModalState {
    imageBase64?: string|null;
    isDesktop?: boolean;
}

export default class EditableImageModal extends React.Component<IEditableImageModalProps, IEditableImageModalState> {
    constructor(props: any) {
        super(props);
        this.state = {
            imageBase64: null,
            isDesktop: MediaQuerySerice.getIsDesktop()
        }
    }

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
                {!this.state.isDesktop ?
                    <div className="editable_image_modal__head" onClick={this.close.bind(this)}>
                        <CloseIcon/>
                    </div> : null
                }
                <div className="editable_image_modal__content">
                    <ImageEditorSimple {...this.props} onChange={this.handleImage.bind(this)}/>
                </div>
                <div className="editable_image_modal__footer">
                    {this.state.isDesktop ?
                        [
                            <div key="cancel" className="editable_image_modal__button"
                                 onClick={this.close.bind(this)}>
                                <CloseIcon/> Отмена
                            </div>,
                            <div key="confirm" className="editable_image_modal__button"
                                 onClick={this.handleConfirm.bind(this)}>
                                <ConfirmIcon/> Сохранить
                            </div>
                        ]:
                        [
                            <div className="editable_image_modal__button"
                                 onClick={this.close.bind(this)}><CloseIcon/></div>,
                            <div className="editable_image_modal__button"
                                 onClick={this.handleConfirm.bind(this)}><ConfirmIcon/></div>
                        ]

                    }
                </div>
            </div>
        );
    }
}