import * as React from 'react';
import {ModalAction, OPEN_MODAL, CLOSE_MODAL, BACK_MODAL} from '../../actions/shared/ModalAction';

import '../../styles/shared/modal.scss'


interface IModalState {
    opened: boolean
    content: any
    contentHistory?: any[]
}


export default class Modal extends React.Component<any, IModalState> {
    constructor(props: any) {
        super(props);
        this.state = {
            opened: false,
            content: null
        };
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleBackModal = this.handleBackModal.bind(this);
    }

    handleOpenModal() {
        let store: any = ModalAction.getStore();
        this.setState({opened: true, content: store.content});
    }

    handleCloseModal() {
        let store: any = ModalAction.getStore();
        this.setState({opened: false, content: store.content});
    }

    handleBackModal() {
        let store: any = ModalAction.getStore();
        this.setState({opened: this.state.opened, content: store.content});
    }

    componentDidMount() {
        ModalAction.onChange(OPEN_MODAL, this.handleOpenModal);
        ModalAction.onChange(CLOSE_MODAL, this.handleCloseModal);
        ModalAction.onChange(BACK_MODAL, this.handleBackModal);
    }

    componentWillUnmount() {
        ModalAction.unbind(OPEN_MODAL, this.handleOpenModal);
        ModalAction.unbind(CLOSE_MODAL, this.handleCloseModal);
        ModalAction.unbind(BACK_MODAL, this.handleBackModal);
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


