import * as React from 'react';
import {Captions, Constants} from '../../constants';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';

import ProfileManagementNotifications from './ProfileManagementNotifications';
import ProfileManagementAccount from './ProfileManagementAccount';
import ProfileManagementStatistics from './ProfileManagementStatistics';
import EditableImageModal from '../shared/EditableImageModal';
import ContentEditable from '../shared/ContentEditable';
import {ProfileSocialLinkList} from "./ProfileAuthor";

import Loading from '../shared/Loading';
import {ModalAction, OPEN_MODAL} from '../../actions/shared/ModalAction';

import {connect} from 'react-redux';

import {toggleEdit} from '../../store/user/user';

// import 

// import Error from "../Error";


class ProfileManagementClass extends React.Component<any, any> {

    refs: {
        inputAvatar: HTMLInputElement;
        inputName: HTMLInputElement;
        inputDescription: HTMLInputElement;
    };


    SECTION_ACCOUNT = 'account';
    SECTION_NOTIFICATIONS = 'notifications';
    SECTION_STATISTICS = 'statistics';

    SECTIONS: {name: string, caption: string, to: string, section: any}[] = [
        {name: this.SECTION_ACCOUNT, caption: Captions.management.sectionAccount, to: '/manage/account', section: <ProfileManagementAccount />},
        {name: this.SECTION_NOTIFICATIONS, caption: Captions.management.sectionNotifications, to: '/manage/notifications', section: <ProfileManagementNotifications />},
        {name: this.SECTION_STATISTICS, caption: Captions.management.sectionStatistics, to: '/manage/statistics', section: <ProfileManagementStatistics/>},
    ];


    setSection(sectionName: string) {
        this.setState({currentSection:
            (this.SECTIONS.map((section) => {return section.name}).indexOf(sectionName) != -1) ?
                sectionName : this.SECTION_ACCOUNT });
    }

    formSubmit(type: string, e: any) {
        e.preventDefault();
    }

    saveUserData(type: string) {
        let fd = new FormData();
        let stateData: any = {};
        if (type == 'name') {
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
        /*UserAction.doAsync(UPDATE_USER, fd).then(() => {
            this.setState(stateData);
        }).catch(() => {this.setState(stateData)});*/
    }

    textEdit(type: string, e: any) {
        let val: string = e.target.value;
        if (type == 'name' ) {
            if (val.length > Constants.maxUsernameLength) {
                return;
            }
            this.state.nameSaveTimeout && window.clearTimeout(this.state.nameSaveTimeout);
            this.setState({newName: val}, () => {
                this.state.nameSaveTimeout = window.setTimeout(() => {
                    this.saveUserData('name');
                }, 500);
            });
        }
        else if (type == 'description') {
            if (val.length > Constants.maxDescriptionLength) {
                return;
            }
            this.setState({newDescription: val});
        }
    }

    inputClick() {
        this.refs.inputAvatar.click();
    }

    contentEdit(content: string, contentText: string ) {
        /*this.state.descriptionSaveTimeout && window.clearTimeout(this.state.descriptionSaveTimeout);
        this.setState({newDescription: contentText}, () => {
            this.state.descriptionSaveTimeout = window.setTimeout(() => {
                this.saveUserData('description');
            }, 500);
        });*/
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

            /*UserAction.doAsync(UPDATE_USER, fd).then(() => {
                this.setState({avatarUploading: false});
            }).catch(() => { this.setState({avatarUploading: false}) });*/
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

    componentDidMount() {

    }


    render() {
        let {user, loading, avatarUploading, isDesktop, nameEdit, descriptionEdit, newName, newDescription, toggleEdit} = this.props;
        if (loading || !user) {
            return <div id="profile" className="profile_loading"><Loading /></div>;
        }

        let currentSection = this.props.match.params.section;
        let section = this.SECTIONS.find((el: any, index: number, arr: any[]) => {
            return el.name == currentSection
        });

        return (
            <div id="profile">
                <div id="profile_content">
                    <div className="profile_content_main">

                        <div className="profile_userdata">
                            <div className={"profile_avatar profile_avatar_editable" + (avatarUploading ? " uploading" : "") }
                                 key="avatar" onClick={this.inputClick.bind(this)}>
                                 { user.avatar ? (<img src={user.avatar}/>) : (
                                     <div className="profile_avatar_dummy"></div>) }

                                {
                                    avatarUploading ? (<div className="avatar_upload"><Loading/></div>) : null
                                }

                            </div>

                            <input accept="image/jpeg,image/png" style={{visibility: 'hidden', position: 'fixed', top: '-1000px', left: '-1000px'}} type="file" ref="inputAvatar" onChange={this.uploadAvatar.bind(this)} />


                            <div className="profile_user_text">
                                <div key="username" className="username">
                                    {
                                        nameEdit ? (
                                            <form onSubmit={this.formSubmit.bind(this, 'name')}>
                                                <input ref="inputName" type="text" value={newName}
                                                       onBlur={toggleEdit.bind(this, 'name', false)}
                                                       onChange={this.textEdit.bind(this, 'name') }/>
                                                <input type="submit" style={{visibility: 'hidden'}}/>
                                            </form>
                                        ) : (<span onClick={toggleEdit.bind(this, 'name', true)}>
                                                {user.first_name} {user.last_name}
                                        </span>)
                                    }

                                </div>

                                <div className={"description" + ( descriptionEdit ? " editable" : "")}
                                     onFocus={toggleEdit.bind('description', true)}>
                                    <ContentEditable
                                        content={newDescription}
                                        elementType="inline"
                                        placeholder="Введите описание"
                                        onChange={this.contentEdit.bind(this)}
                                        onBlur={toggleEdit.bind('description', false)}
                                        maxTextLength={Constants.maxDescriptionLength}
                                        allowLineBreak={false}/>
                                </div>

                            </div>
                        </div>

                        <ProfileSocialLinkList items={user.social_links}/>

                        <div className="divider"></div>

                        <div className="subscription">
                            <Link to={'/' + user.nickname + '/following'}  >Читаемые <span>{ user.subscriptions }</span></Link>
                            <Link to={'/' + user.nickname + '/followers'} >Читатели <span>{ user.subscribers }</span></Link>

                        </div>

                        {
                             isDesktop ? [
                                 <div key="divider" className="divider"></div>,
                                 <div key="subscription" className="desktop_subscription"></div>
                             ] : null
                        }
                    </div>

                    <div className="profile_content_filler"></div>

                    <div className="profile_content_data">
                        <div className="profile_menu">
                            { this.SECTIONS.map((section: {name: string, caption: string, to: string}, index  ) => {
                                    return (<Link key={index} to={section.to}
                                                className={ "menu_item" + (section.name == currentSection ? " active" : "")}>
                                        { section.caption }
                                    </Link>)
                                }) }
                        </div>
                        {section.section}
                    </div>
                </div>
            </div>)
    }
}

let ProfileManagement = withRouter(ProfileManagementClass);


const mapStateToProps = (state: any, ownProps: any) => {
    return {
        ...state.userData,
        isDesktop: state.screen.isDesktop,
    }
};

export const mapDispatchToProps = (dispatch: any) => {
    return {
        toggleEdit: (type: string, edit: boolean) => {dispatch(toggleEdit(type, edit))}
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileManagement);
