import * as React from 'react';
import {connect} from 'react-redux';
import ImageEditorSimple from '../../shared/ImageEditorSimple';
const ConfirmIcon = require('-!babel-loader!svg-react-loader!../../../assets/images/ok_btn.svg?name=ConfirmIcon');
const CloseIcon = require('-!babel-loader!svg-react-loader!../../../assets/images/cancel_btn.svg?name=CloseIcon');

import {uploadAvatar} from './actions';

export class AvatarEditor extends React.Component<any, any> {
    
    constructor() {
        super();
        this.state = {image: null, imageBase64: null};

    }

    handleImage(imageBase64: string) {
        this.setState({imageBase64: imageBase64});
    }

    

    close() {
        this.setState({image: null});
    }

    handleConfirm() {
        let byteString = window.atob(this.state.imageBase64.split(',')[1]);
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        let file = new Blob([ia], {type: 'image/png'});

        let fd = new FormData();
        fd.append('avatar', file);
        this.props.uploadAvatar(fd);
        this.setState({image: null});   
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.avatarUrl === this.props.avatarUrl) {
            return;
        }
        if (!nextProps.avatarUrl) {
            this.setState({image: null});
        }
        else {
            let img = new Image();
            img.onload = () => {
                this.setState({image: img});
            }
            img.src = nextProps.avatarUrl;
        }
    }

    render() {
        if (!this.state.image) {
            return null;
        }
        return <div className="modal_avatar_editor">
            <div className="editable_image_modal">
            <div className="editable_image_modal__content">
                <ImageEditorSimple image={this.state.image} width={400} height={400} outputWidth={400}
                    outputHeight={400} foregroundShape="circle" onChange={this.handleImage.bind(this)}/>
            </div>
            <div className="editable_image_modal__footer">
                <div key="cancel" className="editable_image_modal__button"
                    onClick={this.close.bind(this)}>
                    <CloseIcon/> Отмена
                </div>
                <div key="confirm" className="editable_image_modal__button"
                    onClick={this.handleConfirm.bind(this)}>
                    <ConfirmIcon/> Сохранить
                </div>
            </div>
        </div>
    </div>
    }

}

const mapStateToProps = (state: any) => {
    return {
        avatarUrl: state.userData.avatarUrl,
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        uploadAvatar: (formData: FormData) => { dispatch(uploadAvatar(formData)) }
    }
}

export const Av = () => <div></div>;

export default connect(mapStateToProps, mapDispatchToProps)(AvatarEditor);