import * as React from 'react';
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from '../../actions/shared/PopupPanelAction';
import '../../styles/shared/popup_panel.scss';

type PopupType = 'simple' | 'with_close_button';

interface IPopupPanelProps {
    type?: PopupType
    autoClose?: boolean
    autoCloseDelay?: number
}

interface IPopupPanelState {
    opened?: boolean
    content?: any
    contentHistory?: any[]
}

export default class PopupPanel extends React.Component<IPopupPanelProps, IPopupPanelState> {
    private closeTimeout: number;

    constructor(props: any) {
        super(props);
        this.closeTimeout = -1;
        this.state = {
            opened: false,
            content: null,
            contentHistory: []
        }
    }

    static defaultProps = {
        type: 'simple',
        autoClose: false,
        autoCloseDelay: 3000
    };

    handleOpen() {
        window.clearTimeout(this.closeTimeout);
        let store: any = PopupPanelAction.getStore();
        let content = store.content;
        this.state.contentHistory.push(content);
        this.setState({opened: true, content: content, contentHistory: this.state.contentHistory}, () => {
            if (this.props.autoClose) {
                this.closeTimeout = window.setTimeout(() => {
                    this.handleClose();
                }, this.props.autoCloseDelay)
            }
        });
    }

    handleClose() {
        let content;
        // this.state.contentHistory.splice(this.state.contentHistory.indexOf())
        this.setState({opened: false, content: null});
    }

    componentDidMount() {
        PopupPanelAction.onChange(OPEN_POPUP, this.handleOpen.bind(this));
        PopupPanelAction.onChange(CLOSE_POPUP, this.handleClose.bind(this));
    }

    componentWillUnmount() {
        PopupPanelAction.unbind(OPEN_POPUP, this.handleOpen.bind(this));
        PopupPanelAction.unbind(CLOSE_POPUP, this.handleClose.bind(this));
    }

    render() {
        let className = 'popup_panel';
        if (this.state.opened) {
            className += ' opened';
        }
        return (
            <div className={className}>
                {this.state.content}
            </div>
        )
    }
}