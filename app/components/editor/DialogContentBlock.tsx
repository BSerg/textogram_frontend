import * as React from "react";
import {Captions, BlockContentTypes, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {
    IContentData, ContentAction, DELETE_CONTENT_BLCK, UPDATE_CONTENT_BLCK,
    MOVE_UP_CONTENT_BLCK, MOVE_DOWN_CONTENT_BLCK
} from "../../actions/editor/ContentAction";
import {Validator} from "./utils";
import {IPhoto} from "../../actions/editor/PhotoContentBlockAction";
import {
    ContentBlockAction, ACTIVATE_CONTENT_BLOCK,
    DEACTIVATE_CONTENT_BLOCK
} from "../../actions/editor/ContentBlockAction";
import {PopupPanelAction, OPEN_POPUP} from "../../actions/shared/PopupPanelAction";
import ContentBlockPopup from "./ContentBlockPopup";
import "../../styles/editor/dialog_content_block.scss";
import {UploadImageAction, UPLOAD_IMAGE, UPLOAD_IMAGE_BASE64} from "../../actions/editor/UploadImageAction";
import {DesktopBlockToolsAction, UPDATE_TOOLS} from "../../actions/editor/DesktopBlockToolsAction";
import EditableImageModal from "../shared/EditableImageModal";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";

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
    isActive?: boolean
}


export default class DialogContentBlock extends React.Component<IDialogContentBlockProps, IDialogContentBlockState> {
    __recipientId: number;

    constructor(props: any) {
        super(props);
        this.state = {
            content: this.processContent(this.props.content),
            isValid: true,
            isActive: false
        };
        this.handleActive = this.handleActive.bind(this);
    }

    refs: {
        inputUpload: HTMLInputElement
    };

    getPosition() {
        let blocks = ContentAction.getStore().content.blocks;
        let index = -1;
        blocks.forEach((block: any, i: number) => {
            if (block.id == this.state.content.id) {
                index = i;
            }
        });
        return index;
    }

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
        ContentAction.do(DELETE_CONTENT_BLCK, {id: this.state.content.id});
        ContentBlockAction.do(DEACTIVATE_CONTENT_BLOCK, null);
    }

    handleMoveUp() {
        ContentAction.do(MOVE_UP_CONTENT_BLCK, {id: this.state.content.id});
    }

    handleMoveDown() {
        ContentAction.do(MOVE_DOWN_CONTENT_BLCK, {id: this.state.content.id});
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
        console.log('HELLO NEW REMARK')
        this.state.content.remarks.push({
            participant_id: this.nextRecipient(),
            value: ""
        });
        this.setState({content: this.state.content}, () => {
            this.focusOnRemark(this.state.content.remarks[this.state.content.remarks.length - 1]);
        });
    }

    openPopupPanel() {
        let extraContent = <div onClick={this.addRemark.bind(this, this.state.content.remarks.length)}><AddButton/></div>;
        PopupPanelAction.do(
            OPEN_POPUP,
            {content: <ContentBlockPopup extraContent={extraContent}
                                         onMoveUp={this.handleMoveUp.bind(this)}
                                         onMoveDown={this.handleMoveDown.bind(this)}
                                         onDelete={this.handleDelete.bind(this)}/>}
        )
    }

    private getDesktopToolsContent() {
        return (
            <div onClick={this.addRemark.bind(this, this.state.content.remarks.length)}><AddButton/></div>
        )
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
        this.openPopupPanel();
    }

    updateRemark(remark: IRemark, content: string, contentText: string) {
        remark.value = contentText;
        this.setState({content: this.state.content}, () => {
            this.updateContent();
        })
    }

    updateContent() {
        ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
    }

    openFileDialog(participantId: number) {
        this.__recipientId = participantId;
        this.refs.inputUpload.click();
    }

    uploadImage() {
        if (this.__recipientId && this.state.content.participantsMap[this.__recipientId]) {
            let file = this.refs.inputUpload.files[0];
            if (!file) {
                this.refs.inputUpload.value = "";
                return;
            }

            let handleConfirm = (imageBase64: string) => {
                UploadImageAction.doAsync(
                    UPLOAD_IMAGE_BASE64,
                    {articleId: this.props.articleId, image: imageBase64}
                ).then((data: any) => {
                    this.state.content.participantsMap[this.__recipientId].avatar = data;
                    this.setState({content: this.state.content}, () => {
                        this.updateContent();
                    });
                });
            };

            let img = new Image();
            img.onload = () => {
                let modalContent = <EditableImageModal image={img}
                                                       outputWidth={64}
                                                       outputHeight={64}
                                                       foregroundColor="rgba(0, 0, 0, 0.5)"
                                                       foregroundShape="circle" onConfirm={handleConfirm}/>;
                ModalAction.do(OPEN_MODAL, {content: modalContent});
            };
            img.src = window.URL.createObjectURL(file);
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
        if (e.keyCode == 13 && index == this.state.content.remarks.length - 1) {
            this.addRemark();
        }
    }

    handleActive() {
        let store = ContentBlockAction.getStore();
        if (this.state.isActive != (store.id == this.state.content.id)) {
            this.setState({isActive: store.id == this.state.content.id}, () => {
                if (this.state.isActive) {
                    DesktopBlockToolsAction.do(UPDATE_TOOLS, {position: this.getPosition(), tools: this.getDesktopToolsContent()});
                }
            });
        }
    }

    componentDidMount() {
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleActive);
        this.handleActive();
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleActive);
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
                                     onClick={this.openFileDialog.bind(this, remark.participant_id)}/>
                                : <div className="content_block_dialog__faceless_participant"
                                       onClick={this.openFileDialog.bind(this, remark.participant_id)}>{participant.name.substr(0, 1)}</div>
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