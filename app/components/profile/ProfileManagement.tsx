import * as React from 'react';
import {Captions} from '../../constants';
import {withRouter} from 'react-router';

import ProfileManagementNotifications from './ProfileManagementNotifications';
import ProfileManagementAccount from './ProfileManagementAccount';
import ProfileAuthorList from './ProfileAuthorList';
import {MediaQuerySerice} from '../../services/MediaQueryService';

import EditableImageModal from '../shared/EditableImageModal';

import ContentEditable from '../shared/ContentEditable';

import ProfileSocialLinkList from "./ProfileSocialLinkList";

import Loading from '../shared/Loading';

import {UserAction, GET_ME, LOGOUT, LOGIN, SAVE_USER, UPDATE_USER, USER_REJECT} from '../../actions/user/UserAction';
import {ModalAction, OPEN_MODAL} from '../../actions/shared/ModalAction';


import Error from "../Error";

interface IManagementProps {
    router?: any;
}

interface IManagementState {
    user?: any;
    error?: any;
    currentSection?: string;
    isDesktop?: boolean;
    additionalPage?: any;
    newName?: string;
    newDescription?: string;
    nameEdit?: boolean;
    descriptionEdit?: boolean;
    avatarUploading?: boolean;

    nameSaveTimeout?: number;
    descriptionSaveTimeout?: number;
}

class ProfileManagementClass extends React.Component<IManagementProps, IManagementState> {

    refs: {
        inputAvatar: HTMLInputElement;
        inputName: HTMLInputElement;
        inputDescription: HTMLInputElement;
    };


    SECTION_ACCOUNT = 'account';
    SECTION_NOTIFICATIONS = 'notifications';

    constructor() {
        super();
        let user = UserAction.getStore().user ? JSON.parse(JSON.stringify(UserAction.getStore().user)) : null;
        this.state = {currentSection: 'account', additionalPage: null, isDesktop: MediaQuerySerice.getIsDesktop(),
            user: user, newName: user ? (user.first_name + ' ' + user.last_name) : '', newDescription: user ? user.description : '',
            avatarUploading: false, nameEdit: false, descriptionEdit: false
        };
        this.setUser = this.setUser.bind(this);
        this.setError = this.setError.bind(this);
        this.checkDesktop = this.checkDesktop.bind(this);
    }

    setUser() {
        let user = UserAction.getStore().user ? JSON.parse(JSON.stringify(UserAction.getStore().user)) : null;
        //let newName = user ? (user.first_name + ' ' + user.last_name) : '';
        //newName = newName.trim();
        this.setState({
            user: user,
            error: UserAction.getStore().user ? null : <Error/>,
            //newName: user ? (user.first_name + (user.last_name ? (' ' + user.last_name) : '')) : '',
            newDescription: (user && !this.state.newDescription) ? user.description : ''
        });
    }

    setError() {
        this.setState({error: UserAction.getStore().user ? null : <Error/>})
    }

    setSection(sectionName: string) {
        this.setState({currentSection: sectionName});
    }

    showAuthors(subscribedTo: boolean = false) {
        this.setState({additionalPage: <ProfileAuthorList userId={this.state.user.id} isDesktop={this.state.isDesktop}
                                                          closeCallback={ () => { this.setState({additionalPage: null}) } }
                                                          subscribedTo={subscribedTo} />});
    }

    formSubmit(type: string, e: any) {
        e.preventDefault();
        // this.saveUserData(type);
    }

    saveUserData(type: string) {
        let fd = new FormData();
        let stateData: any = {};
        if (type == 'name') {
            //stateData.nameEdit = false;
            if (!this.state.newName) return;
            let userNameArr = this.state.newName.split(' ');
            if (!userNameArr[0]) {
                return;
            }
            fd.append('first_name', userNameArr[0]);

            fd.append('last_name', userNameArr.length > 1 ? userNameArr.slice(1).join(' ') : '');
        }
        else if (type == 'description') {
            // stateData.descriptionEdit = false;
            fd.append('description', this.state.newDescription);
        }
        UserAction.doAsync(UPDATE_USER, fd).then(() => {
            this.setState(stateData);
        }).catch(() => {this.setState(stateData)});
    }

    checkDesktop(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    toggleEdit(type: string, edit: boolean) {

        let stateData: any = {};

        if (type == 'name') {
            stateData = {nameEdit: edit, descriptionEdit: false, newName: this.state.user.first_name + ' ' + this.state.user.last_name};
            // this.setState();
        }
        else if (type == 'description') {
            stateData = {descriptionEdit: edit, nameEdit: false, newDescription: '' + this.state.user.description}
        }
        this.setState(stateData, () => {
            if (type == 'name' && edit) {
                this.refs.inputName && this.refs.inputName.focus();
            }
            else if (type == 'description') {
                // this.refs.inputDescription && this.refs.inputDescription.focus();
            }
        });
        this.setState(stateData);
    }

    textEdit(type: string, e: any) {
        let val: string = e.target.value;
        if (type == 'name' ) {
            this.state.nameSaveTimeout && window.clearTimeout(this.state.nameSaveTimeout);
            this.setState({newName: val}, () => {
                this.state.nameSaveTimeout = window.setTimeout(() => {
                    this.saveUserData('name');
                }, 500);
            });
        }
        else if (type == 'description') {
            this.setState({newDescription: val});
        }
    }

    inputClick() {
        this.refs.inputAvatar.click();
    }

    contentEdit(content: string, contentText: string ) {
        this.state.descriptionSaveTimeout && window.clearTimeout(this.state.descriptionSaveTimeout);
        this.setState({newDescription: contentText}, () => {
            this.state.descriptionSaveTimeout = window.setTimeout(() => {
                this.saveUserData('description');
            }, 500);
        });
    }

    contentKeyDown(e: any) {
        // if (e.keyCode == 13) {
        //     this.saveUserData('description');
        // }
    }

    avatarSave(imageData: any) {
        this.setState({avatarUploading: true}, () => {

            let byteString = window.atob(imageData.split(',')[1]);
            let ab = new ArrayBuffer(byteString.length);
            let ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            let file = new Blob([ia], {type: 'image/png'});

            let fd = new FormData();
            fd.append('avatar', file);

            UserAction.doAsync(UPDATE_USER, fd).then(() => {
                this.setState({avatarUploading: false});
            }).catch(() => { this.setState({avatarUploading: false}) });
        })
    }

    uploadAvatar() {
        let file = this.refs.inputAvatar.files[0];
        if (!file) return;
        let _URL = window.URL;
        let img = new Image();
        img.onload = () => {
            this.refs.inputAvatar.value = '';
            ModalAction.do(OPEN_MODAL, { content: <EditableImageModal width={400} height={400} outputWidth={400}
                                                                          onConfirm={this.avatarSave.bind(this)}
                                                                          foregroundShape="circle"
                                                                          outputHeight={400} image={img} />});
        };
        img.src = _URL.createObjectURL(file);
    }

    showNotifications() {
        this.setState({ currentSection: this.SECTION_NOTIFICATIONS }, () => {
            this.props.router.push('/manage/');
        });
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.router.location.query.show == 'notifications' ) {
            this.showNotifications();
        }
    }

    componentDidMount() {

        if (this.props.router.location.query.show == 'notifications') {
            this.showNotifications();
        }

        MediaQuerySerice.listen(this.checkDesktop);
        UserAction.onChange([GET_ME, LOGIN, LOGOUT, SAVE_USER, UPDATE_USER, USER_REJECT], this.setUser);
    }

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.checkDesktop);
        UserAction.unbind([GET_ME, LOGIN, LOGOUT, SAVE_USER, UPDATE_USER, USER_REJECT], this.setUser);
        this.state.nameSaveTimeout && window.clearTimeout(this.state.nameSaveTimeout);
        this.state.descriptionSaveTimeout && window.clearTimeout(this.state.descriptionSaveTimeout);
    }

    render() {

        if (this.state.error) {
            return (this.state.error);
        }

        if (!this.state.user) {
            return (<div id="profile" className="profile_loading"><Loading /></div>);
        }

        let sections: {name: string, caption: string}[] = [
            {name: this.SECTION_ACCOUNT, caption: Captions.management.sectionAccount},
            {name: this.SECTION_NOTIFICATIONS, caption: Captions.management.sectionNotifications}];

        let section: any = null;

        if (this.state.currentSection == this.SECTION_NOTIFICATIONS) {
            section = <ProfileManagementNotifications/>;
        }

        switch (this.state.currentSection) {
            case (this.SECTION_ACCOUNT):
                section = <ProfileManagementAccount/>;
                break;
            case (this.SECTION_NOTIFICATIONS):
                section = <ProfileManagementNotifications/>;
                break;
        }

        return (
            <div id="profile">
                <div id="profile_content">
                    <div className="profile_content_main">
                        <div className={"profile_avatar profile_avatar_editable" + (this.state.avatarUploading ? " uploading" : "") }
                             key="avatar" onClick={this.inputClick.bind(this)}>
                             { this.state.user.avatar ? (<img src={this.state.user.avatar}/>) : (
                                 <div className="profile_avatar_dummy"></div>) }

                            {
                                this.state.avatarUploading ? (<div className="avatar_upload"><Loading/></div>) : null
                            }

                        </div>

                        <input accept="image/jpeg,image/png" style={{visibility: 'hidden', position: 'fixed', top: '-1000px', left: '-1000px'}} type="file" ref="inputAvatar" onChange={this.uploadAvatar.bind(this)} />

                        <div key="username" className="username">
                            {
                                this.state.nameEdit ? (
                                    <form onSubmit={this.formSubmit.bind(this, 'name')}>
                                        <input ref="inputName" type="text" value={this.state.newName}
                                               onBlur={this.toggleEdit.bind(this, 'name', false)}
                                               onChange={this.textEdit.bind(this, 'name') }/>
                                        <input type="submit" style={{visibility: 'hidden'}}/>
                                    </form>
                                ) : (<span onClick={this.toggleEdit.bind(this, 'name', true)}>
                                        {this.state.user.first_name} {this.state.user.last_name}
                                </span>)
                            }

                         </div>


                        <div className={"description" + ( this.state.descriptionEdit ? " editable" : "")}
                             onFocus={this.toggleEdit.bind(this, 'description', true)}>
                            <ContentEditable
                                content={this.state.newDescription}
                                elementType="inline"
                                placeholder="Введите описание"
                                onKeyDown={this.contentKeyDown.bind(this)}
                                onChange={this.contentEdit.bind(this)}
                                onBlur={this.toggleEdit.bind(this, 'description', false)}
                                allowLineBreak={false}/>
                        </div>

                        <ProfileSocialLinkList items={this.state.user.social_links}/>

                        <div className="divider"></div>

                        <div className="subscription">
                            <div onClick={this.showAuthors.bind(this, false)}>Читаемые <span>{ this.state.user.subscriptions }</span></div>
                            <div onClick={this.showAuthors.bind(this, true)}>Читатели <span>{ this.state.user.subscribers }</span></div>
                        </div>

                        {
                             this.state.isDesktop ? [
                                 <div key="divider" className="divider"></div>,
                                 <div key="subscription" className="desktop_subscription"></div>
                             ] : null
                        }
                    </div>

                    <div className="profile_content_filler"></div>

                    {
                        this.state.additionalPage ? (this.state.additionalPage) :

                            (
                                <div className="profile_content_data">
                                    <div className="profile_menu">
                                        { sections.map((section: {name: string, caption: string}, index  ) => {
                                             return (<div key={index}
                                                          className={ "menu_item" + (section.name == this.state.currentSection ? " active" : "")}
                                                          onClick={this.setSection.bind(this, section.name)}>
                                                 { section.caption }
                                             </div>)
                                         }) }
                                    </div>
                                    {section}
                                </div>
                            )
                    }
                </div>
            </div>)
    }
}

let ProfileManagement = withRouter(ProfileManagementClass);

export default ProfileManagement;