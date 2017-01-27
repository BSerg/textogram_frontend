import * as React from "react";
import {Captions} from "../../constants";
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import {IParticipant} from "./DialogContentBlock";
import ContentEditable from "../shared/ContentEditable";
import {UploadImageAction, UPLOAD_IMAGE} from "../../actions/editor/UploadImageAction";
import "../../styles/editor/dialog_modal.scss";
import {
    DialogContentBlockAction, UPDATE_PARTICIPANT,
    CREATE_PARTICIPANT, DELETE_PARTICIPANT
} from "../../actions/editor/DialogContentBlockAction";

const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');


interface IItemProps {
    selected: boolean
    articleId: number
    participant: IParticipant
    onSelect?: (participantId: number) => any
    onUpdate?: (participant: IParticipant) => any
    onDelete?: (participantId: number) => any
}

interface IItemState {
    selected?: boolean,
    participant?: IParticipant
}

class DialogParticipantsModalItem extends React.Component<IItemProps, IItemState> {
    constructor(props: any) {
        super(props);
        this.state = {
            selected: this.props.selected,
            participant: this.props.participant
        }
    }

    refs: {
        inputUpload: HTMLInputElement
    };

    handleSelect() {
        this.setState({selected: true}, () => {
            this.props.onSelect && this.props.onSelect(this.state.participant.id);
        });
    }

    handleChangeName(content: string, contentText: string) {
        console.log(contentText)
        this.state.participant.name = contentText;
        this.setState({participant: this.state.participant}, () => {
            this.props.onUpdate && this.props.onUpdate(this.state.participant);
        });
    }

    openFileDialog() {
        this.refs.inputUpload.click();
    }

    uploadImage() {
        let file = this.refs.inputUpload.files[0];
        UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleId as number, image: file}).then(() => {
            let store = UploadImageAction.getStore();
            this.state.participant.avatar = store.image;
            this.setState({participant: this.state.participant}, () => {
                this.props.onUpdate && this.props.onUpdate(this.state.participant);
            });
        });
    }

    render() {
        let className = "dialog_modal__participant";
        if (this.state.participant.is_interviewer) {
            className += ' interviewer';
        }
        return (
            <div className={className}>
                <input className="dialog_modal__check"
                       type="checkbox"
                       onChange={this.handleSelect.bind(this)}
                       checked={this.state.selected}/>
                {this.state.participant.avatar ?
                    <div onClick={this.openFileDialog.bind(this)} className="dialog_modal__avatar"
                         style={{background: `url('${this.state.participant.avatar.image}') no-repeat center center`}}/>:
                    <div onClick={this.openFileDialog.bind(this)} className="dialog_modal__avatar empty"/>
                }
                <ContentEditable className="dialog_modal__name"
                                 elementType="inline"
                                 content={this.state.participant.name}
                                 onChange={this.handleChangeName.bind(this)}/>
                <input type="file"
                       style={{display: "none"}}
                       ref="inputUpload"
                       accept="image/png,image/jpeg,image/gif"
                       onChange={this.uploadImage.bind(this)}/>
            </div>

        )
    }
}


interface IProps {
    articleId: number
    currentParticipantId: number
    participants: IParticipant[]
    onSelect?: (participant_id: number|string) => any
    onUpdate?: (participants: IParticipant[]) => any
}

interface IState {
    currentParticipantId?: number
    participants?: IParticipant[]
}

export default class DialogParticipantsModal extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            currentParticipantId: this.props.currentParticipantId,
            participants: this.props.participants,
        };
        this.handleUpdateParticipants = this.handleUpdateParticipants.bind(this);
    }

    back() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    handleSelectItem(participantId: number) {
        console.log('SELECTED #' + participantId);
        this.setState({currentParticipantId: participantId}, () => {
        this.props.onSelect && this.props.onSelect(participantId);
        });
    }

    handleUpdateItem(participant: IParticipant) {
        console.log(participant);
        this.state.participants.forEach((p) => {
            if (p.id == participant.id) {
                Object.assign(p, participant);
                DialogContentBlockAction.do(UPDATE_PARTICIPANT, {participant: p});
            }
        });
        this.setState({participants: this.state.participants});
    }

    handleDeleteItem(participantId: number) {
        console.log('DELETE PARTICIPANT #' + participantId);
    }

    chooseParticipant() {
        console.log(`RECIPIENT #${this.state.currentParticipantId} CHOSEN`);
    }

    handleUpdateParticipants() {
        let store = DialogContentBlockAction.getStore();
        this.setState({participants: store.content.participants});
    }

    componentDidMount() {
        DialogContentBlockAction.onChange(
            [CREATE_PARTICIPANT, UPDATE_PARTICIPANT, DELETE_PARTICIPANT],
            this.handleUpdateParticipants
        )
    }

    componentWillUnmount() {
        DialogContentBlockAction.unbind(
            [CREATE_PARTICIPANT, UPDATE_PARTICIPANT, DELETE_PARTICIPANT],
            this.handleUpdateParticipants
        )
    }

    render() {
        return (
            <div className="dialog_modal">
                <div className="dialog_modal__header">
                    <BackButton className="dialog_modal__back" onClick={this.back.bind(this)}/>
                    {Captions.editor.dialog_participants}
                </div>
                <div className="dialog_modal__content">
                    {this.state.participants.map((participant, index) => {
                        return <DialogParticipantsModalItem selected={this.state.currentParticipantId == participant.id}
                                                            articleId={this.props.articleId}
                                                            participant={participant}
                                                            onSelect={this.handleSelectItem.bind(this)}
                                                            onUpdate={this.handleUpdateItem.bind(this)}
                                                            onDelete={this.handleDeleteItem.bind(this)}/>
                    })}
                </div>
                <div className="dialog_modal__choose"
                     onClick={this.chooseParticipant.bind(this)}>{Captions.editor.choose}</div>
            </div>
        )
    }
}