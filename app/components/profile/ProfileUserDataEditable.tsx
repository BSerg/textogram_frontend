import * as React from 'react';

import {connect} from 'react-redux';
import {setAvatarUrl} from './AvatarEditor/actions';
import Loading from '../shared/Loading';
import ContentEditable from '../shared/ContentEditable';
import {Constants} from '../../constants';
import '../../styles/shared/editable_image_modal.scss';
import './styles/ProfileManagement.scss';
import {saveUserData} from './actions/userActions';


export class AvatarEditSimple extends React.Component<any, any> {

    input: HTMLInputElement;

    inputClick() {
        this.input.click();
    }

    uploadAvatar() {
        let file = this.input.files[0];
        if (!file) return;
        let _URL = window.URL;
        this.props.setAvatarUrl(_URL.createObjectURL(file));
        this.input.value = '';
    }

    render() {
        let {avatar, avatarUploading} = this.props;
        return <div onClick={this.inputClick.bind(this)} className={"profile_avatar profile_avatar_editable" + (avatarUploading ? " uploading" : "") }>
                { avatar ? <img  src={avatar}/> : <div className="profile_avatar_dummy"></div> }

            { avatarUploading && <div className="avatar_upload"><Loading/></div>}
            <input accept="image/jpeg,image/png" style={{visibility: 'hidden'}} 
                    type="file" ref={(input) => { this.input = input }} 
                    onChange={this.uploadAvatar.bind(this)} />
        
        </div>;
    }
}

const mapStateToPropsAvatar = (state: any) => {
    return {
        avatar: state.userData.user.avatar,
        avatarUrl: state.userData.avatarUrl,
        avatarUploading: state.userData.avatarUploading,
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        setAvatarUrl: (url: string) => {dispatch(setAvatarUrl(url))}
    }
}

export const AvatarEdit = connect(mapStateToPropsAvatar, mapDispatchToProps)(AvatarEditSimple);


export class NameEditSimple extends React.Component<any, any> {
    
    usernameSaveTimeout: any;
    descriptionSaveTimeout: any;

    constructor(props: any) {
        super(props);

        this.state = {username: props.username, description: props.description, 
            usernameEdit: false, descriptionEdit: false};
        this.toggleEdit = this.toggleEdit.bind(this);
    }

    saveUserData(type: string) {
        let fd = new FormData();
        let stateData: any = {};
        if (type == 'username') {
            if (!this.state.username) return;
            let usernameArr = this.state.username.split(' ');
            if (!usernameArr[0]) {
                return;
            }
            fd.append('first_name', usernameArr[0]);
            fd.append('last_name', usernameArr.length > 1 ? usernameArr.slice(1).join(' ') : '');
        }
        else if (type == 'description') {
            fd.append('description', this.state.description);
        }
        this.props.save(fd);
    }

    formSubmit(type: string, e: any) {
        e.preventDefault();
    }

    usernameEdit(e: any) {
        let val: string = e.target.value;
        if (val.length > Constants.maxUsernameLength) {
            return;
        }
        // this.state.nameSaveTimeout && window.clearTimeout(this.state.nameSaveTimeout);
        this.usernameSaveTimeout && clearTimeout(this.usernameSaveTimeout);
        this.setState({username: val}, () => {
            this.usernameSaveTimeout = setTimeout(() => {
                this.saveUserData('username');
            }, 500);
        });
    }

    descriptionEdit(content: string, contentText: string) {
        this.descriptionSaveTimeout && clearTimeout(this.descriptionSaveTimeout);
        this.setState({description: contentText}, () => {
            this.descriptionSaveTimeout = setTimeout(() => {
                this.saveUserData('description');
            }, 500);
        });
    }

    toggleEdit(type: string, val: boolean) {
        let state: any = type === 'username' ? { usernameEdit : val } : {'descriptionEdit': val};
        this.setState(state);
    }

    componentWillUnmount() {
        this.usernameSaveTimeout && clearTimeout(this.usernameSaveTimeout);
        this.descriptionSaveTimeout && clearTimeout(this.descriptionSaveTimeout);
    }

    render() {
        let {username, description} = this.props;
        let {usernameEdit, descriptionEdit} = this.state;
        
        return <div className="profile_user_text">
            <div key="username" className="username">
                {
                    usernameEdit ? (
                        <form onSubmit={this.formSubmit.bind(this, 'username')}>
                            <input ref="inputName" type="text" value={this.state.username}
                                    onBlur={this.toggleEdit.bind(this, 'username', false)}
                                    onChange={this.usernameEdit.bind(this) }/>
                            <input type="submit" style={{visibility: 'hidden'}}/>
                        </form>
                    ) : (<span onClick={this.toggleEdit.bind(this, 'username', true)}>
                            {username}
                    </span>)
                }

            </div>

            <div className={"description" + ( descriptionEdit ? " editable" : "")}
                    onFocus={this.toggleEdit.bind('description', true)}>
                <ContentEditable
                    content={this.state.description}
                    elementType="inline"
                    placeholder="Введите описание"
                    onChange={this.descriptionEdit.bind(this)}
                    onBlur={this.toggleEdit.bind('description', false)}
                    maxTextLength={Constants.maxDescriptionLength}
                    allowLineBreak={false}/>
            </div>
        </div>
    }
}

const mapStateToPropsName = (state: any) => {
    return {
        username: `${state.userData.user.first_name} ${state.userData.user.last_name}`,
        description: state.userData.user.description,
    }
}

const mapDispatchToPropsName = (dispatch: any) => {
    return {
        save: (fd: FormData) => { dispatch(saveUserData(fd)); },
    }
}

export const NameEdit = connect(mapStateToPropsName, mapDispatchToPropsName)(NameEditSimple);


export class ProfileUserDataEditable extends React.Component<any, any> {
    render() {
        return <div className="profile_userdata">
            <AvatarEdit />
            <NameEdit />
        </div>
    }
}

export default connect(null, null)(ProfileUserDataEditable);