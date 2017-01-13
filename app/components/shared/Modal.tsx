import * as React from 'react';
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from '../../actions/shared/ModalAction';

import '../../styles/shared/modal.scss'


interface IModalState {
    opened: boolean
    content: any
}


export default class Modal extends React.Component<any, IModalState> {
    constructor(props: any) {
        super(props);
        this.state = {
            opened: false,
            content: null
        }
    }

    handleOpenModal() {
        let store: any = ModalAction.getStore();
        this.setState({opened: true, content: store.content});
    }

    handleCloseModal() {
        let store: any = ModalAction.getStore();
        this.setState({opened: false, content: store.content});
    }

    componentDidMount() {
        ModalAction.onChange(OPEN_MODAL, this.handleOpenModal.bind(this));
        ModalAction.onChange(CLOSE_MODAL, this.handleCloseModal.bind(this));
    }

    componentWillUnmount() {
        ModalAction.unbind(OPEN_MODAL, this.handleOpenModal.bind(this));
        ModalAction.unbind(CLOSE_MODAL, this.handleCloseModal.bind(this));
    }

    render() {
        let className = 'modal';
        if (this.state.opened) {
            className += ' opened';
        }
        return (
            <div className={className}>
                <div className="modal__content">
                    {this.state.content}
                </div>
            </div>
        )
    }
}


