import * as React from 'react';

import {connect} from 'react-redux';
import Loading from '../shared/Loading';
import ImageEditorSimple from '../shared/ImageEditorSimple';
const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/cancel_btn.svg?name=CloseIcon');
const ConfirmIcon = require('-!babel-loader!svg-react-loader!../../assets/images/ok_btn.svg?name=ConfirmIcon');
import '../../styles/shared/editable_image_modal.scss';
import './styles/ProfileManagement.scss';

export class ModalAvatarEditor extends React.Component<any, any> {

    constructor() {
        super(); 
    }

    handleImage() {

    }

    close() {

    }

    handleConfirm() {

    }

    render() {
        console.log(this.props.image);
        return <div className="modal_avatar_editor">
            <div className="editable_image_modal">
            <div className="editable_image_modal__content">
                <ImageEditorSimple image={this.props.image} width={400} height={400} outputWidth={400}
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


export class AvatarEditSimple extends React.Component<any, any> {

    input: HTMLInputElement;

    constructor() {
        super();
        this.state = { modalOpen: false, image: null }
    }

    inputClick() {
        if (!this.state.modalOpen) {
            this.input.click();
        }
        
    }

    uploadAvatar() {
        let file = this.input.files[0];
        if (!file) return;
        let _URL = window.URL;
        let img = new Image();
        img.onload = () => {
            this.input.value = '';
            this.setState({image: img, modalOpen: true});
            /*ModalAction.do(OPEN_MODAL, { content: <EditableImageModal width={400} height={400} outputWidth={400}
                                                                          onConfirm={this.avatarSave.bind(this)}
                                                                          foregroundShape="circle"
                                                                          outputHeight={400} image={img} />});*/
        };
        img.src = _URL.createObjectURL(file);
    }

    render() {
        let {avatar, avatarUploading} = this.props;
        let {modalOpen, image} = this.state;
        console.log(avatarUploading);
        return <div onClick={this.inputClick.bind(this)} className={"profile_avatar profile_avatar_editable" + (avatarUploading ? " uploading" : "") }>
                { avatar ? <img  src={avatar}/> : <div className="profile_avatar_dummy"></div> }

            { avatarUploading && <div className="avatar_upload"><Loading/></div>}
            <input accept="image/jpeg,image/png" style={{visibility: 'hidden'}} 
                    type="file" ref={(input) => { this.input = input }} 
                    onChange={this.uploadAvatar.bind(this)} />
            { modalOpen && image && <ModalAvatarEditor image={image} /> }
        </div>;
    }
}

const mapStateToPropsAvatar = (state: any) => {
    console.log(state.userData.user);
    return {
        avatar: state.userData.user.avatar,
        avatarUploading: state.userData.avatarUploading,
    }
}

export const AvatarEdit = connect(mapStateToPropsAvatar, null)(AvatarEditSimple);


export class ProfileUserDataEditable extends React.Component<any, any> {
    render() {
        return <div className="profile_userdata">
            <AvatarEdit />
        </div>
    }
}

export default connect(null, null)(ProfileUserDataEditable);