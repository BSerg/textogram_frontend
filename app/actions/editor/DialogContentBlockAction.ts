import * as React from "react";
import Action from "../Action";
import {IParticipant} from "../../components/editor/DialogContentBlock";

export const RESET_CONTENT = 'reset_content';
export const CREATE_PARTICIPANT = 'create_participant';
export const UPDATE_PARTICIPANT = 'update_participant';
export const DELETE_PARTICIPANT = 'delete_participant';

export const DialogContentBlockAction = new Action({
    content: {
        remarks: [],
        participants: []
    },
});


DialogContentBlockAction.register(RESET_CONTENT, (store, data: any) => {
    store.content = data;
});


DialogContentBlockAction.register(CREATE_PARTICIPANT, (store, data: {participant: IParticipant}) => {
    store.content.participant.push(data.participant);
});


DialogContentBlockAction.register(UPDATE_PARTICIPANT, (store, data: {participant: IParticipant}) => {
    store.content.participants.forEach((r: IParticipant) => {
        if (r.id == data.participant.id) {
            Object.assign(r, data.participant);
        }
    });
});


DialogContentBlockAction.register(DELETE_PARTICIPANT, (store, data: {participantId: number}) => {
    let participants: IParticipant[] = [];
    store.content.participant.forEach((participant: IParticipant) => {
        if (participant.id != data.participantId) {
            participants.push(participant);
        }
    });
    store.content.participants = participants;
});







