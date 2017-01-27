import * as React from "react";
import {Captions, BlockContentTypes, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {IContentData, ContentAction, DELETE_CONTENT, UPDATE_CONTENT} from "../../actions/editor/ContentAction";
import {Validator} from "./utils";
import {IPhoto} from "../../actions/editor/PhotoContentBlockAction";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {PopupPanelAction, OPEN_POPUP} from "../../actions/shared/PopupPanelAction";
import ContentBlockPopup from "./ContentBlockPopup";
import "../../styles/editor/dialog_content_block.scss";
import {UploadImageAction, UPLOAD_IMAGE} from "../../actions/editor/UploadImageAction";

const AddButton = require('babel!svg-react!../../assets/images/redactor_icon_popup_add.svg?name=AddButton');

export interface IParticipant {
    id: number
    avatar: IPhoto
    name: string
    is_interviewer?: boolean
}

interface IParticipantsMap {
    [id: number]: IParticipant
}

interface IRemark {
    participant_id: number
    value: string
}

interface IDialogContent {
    id: string
    type: BlockContentTypes
    participants: IParticipant[]
    participantsMap?: IParticipantsMap
    remarks: IRemark[]
    __meta?: any
}

interface IDialogContentBlockProps {
    articleId: number
    content: IContentData
    className?: string
}

interface IDialogContentBlockState {
    content?: IDialogContent
    isValid?: boolean
}


export default class DialogContentBlock extends React.Component<IDialogContentBlockProps, IDialogContentBlockState> {
    __recipientId: number;

    constructor(props: any) {
        super(props);
        this.state = {
            content: this.processContent(this.props.content),
            isValid: true
        };
    }

    refs: {
        inputUpload: HTMLInputElement
    };

    private isValid(content: IDialogContent): boolean {
        return Validator.isValid(content, Validation.TEXT);
    }

    processContent(content: IContentData): IDialogContent {
        let _content = content as IDialogContent;
        let participantMap: IParticipantsMap = {};
        _content.participants.forEach((participant) => {
            participantMap[participant.id] = participant;
        });
        _content.participantsMap = participantMap;
        return _content;
    }

    handleDelete() {
        ContentAction.do(DELETE_CONTENT, {id: this.state.content.id});
    }

    nextRecipient() {
        if (this.state.content.remarks.length) {
            let currentParticipantId = this.state.content.remarks[this.state.content.remarks.length - 1].participant_id;
            let index = this.state.content.participants.indexOf(this.state.content.participantsMap[currentParticipantId]);
            let nextParticipant;
            if (index + 1 <= this.state.content.participants.length - 1) {
                nextParticipant = this.state.content.participants[index + 1];
            } else {
                nextParticipant = this.state.content.participants[0];
            }
            return nextParticipant.id;
        } else {
            return this.state.content.participants[0].id;
        }
    }

    focusOnRemark(remark: IRemark) {
        let el = document.getElementById(
                'remark_' + this.state.content.id + "_" + (this.state.content.remarks.indexOf(remark)));
        el.focus();
    }

    addRemark(position?: number) {
        console.log('ADD REMARK IN POSITION: ' + position);
        this.state.content.remarks.push({
            participant_id: this.nextRecipient(),
            value: ""
        });
        this.setState({content: this.state.content}, () => {
            this.focusOnRemark(this.state.content.remarks[this.state.content.remarks.length - 1]);
        });
    }

    openPopupPanel() {
        let extraContent = <AddButton onClick={this.addRemark.bind(this, this.state.content.remarks.length)}/>;
        PopupPanelAction.do(
            OPEN_POPUP,
            {content: <ContentBlockPopup extraContent={extraContent}
                                         onDelete={this.handleDelete.bind(this)}/>}
        )
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
        this.openPopupPanel();
    }

    updateRemark(remark: IRemark, content: string, contentText: string) {
        console.log(remark, content, contentText);
        remark.value = contentText;
        this.setState({content: this.state.content}, () => {
            this.updateContent();
        })
    }

    updateContent() {
        ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
    }

    openFileDialog(participantId: number) {
        this.__recipientId = participantId;
        this.refs.inputUpload.click();
    }

    uploadImage() {
        console.log(this.__recipientId,this.state.content.participantsMap[this.__recipientId])
        if (this.__recipientId && this.state.content.participantsMap[this.__recipientId]) {
            let file = this.refs.inputUpload.files[0];
            UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleId, image: file}).then(() => {
                let image = UploadImageAction.getStore().image;
                this.state.content.participantsMap[this.__recipientId].avatar = image;
                this.setState({content: this.state.content}, () => {
                    this.updateContent();
                });
            })
        }
    }

    handleRemarkKeyDown(remark: IRemark, e: KeyboardEvent) {
        let prevRemark: IRemark, index = this.state.content.remarks.indexOf(remark);
        if (index > 0) {
            prevRemark = this.state.content.remarks[index - 1];
        } else {
            prevRemark = null;
        }
        if (e.keyCode == 8 && !remark.value && index != -1) {
            this.state.content.remarks.splice(index, 1);
            this.setState({content: this.state.content}, () => {
                if (prevRemark) {
                    this.focusOnRemark(prevRemark);
                }
            });
        }
    }

    render() {
        let className = 'content_block_dialog';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        !this.state.isValid && (className += ' invalid');
        return (
            <BaseContentBlock id={this.props.content.id}
                              className={className}
                              onClick={this.handleFocus.bind(this)}
                              disableDefaultPopup={true}>
                {this.state.content.remarks.map((remark, index) => {
                    let participant = this.state.content.participantsMap[remark.participant_id];
                    let className = "content_block_dialog__remark";
                    if (participant.is_interviewer) {
                        className += ' interviewer'
                    }
                    return (
                        <div className={className}>
                            {participant && participant.avatar ?
                                <div className="content_block_dialog__participant"
                                     style={{background: `url('${participant.avatar.image}') no-repeat center center`}}
                                     onClick={this.openFileDialog.bind(this, remark.participant_id)}/> : null
                            }
                            <ContentEditable id={"remark_" + this.props.content.id + "_" + index}
                                             className="content_block_dialog__text"
                                             elementType="inline"
                                             allowLineBreak={false}
                                             onChange={this.updateRemark.bind(this, remark)}
                                             onChangeDelay={0}
                                             onKeyDown={this.handleRemarkKeyDown.bind(this, remark)}
                                             content={remark.value}
                                             placeholder={Captions.editor.enter_text}/>
                        </div>
                    );
                })}
                {!this.state.content.remarks.length ? <div className="help">{Captions.editor.help_dialogue}</div> : null}
                <input type="file" ref="inputUpload" style={{display: "none"}} onChange={this.uploadImage.bind(this)}/>
            </BaseContentBlock>
        )
    }
}