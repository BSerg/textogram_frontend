import * as React from 'react';
import {
    PopupPanelAction, OPEN_POPUP, CLOSE_POPUP, BACK_POPUP,
    REPLACE_POPUP
} from '../../actions/shared/PopupPanelAction';
import '../../styles/shared/popup_panel.scss';

type PopupType = 'simple' | 'notification';

interface IPopupPanelProps {
    type?: PopupType
}

interface IPopupItem {
    id?: string
    content: any
}

interface IPopupPanelState {
    opened?: boolean
    content?: any
    items?: IPopupItem[]
}

export default class PopupPanel extends React.Component<IPopupPanelProps, IPopupPanelState> {

    constructor(props: any) {
        super(props);
        this.state = {
            opened: false,
            content: null,
            items: []
        };
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.update = this.update.bind(this);
    }

    static defaultProps = {
        type: 'simple',
    };

    handleOpen() {
        let store: any = PopupPanelAction.getStore();
        let content = store.content;
        this.setState({opened: true, content: content});
    }

    handleClose() {
        this.setState({opened: false, content: null});
    }

    update() {
        let store = PopupPanelAction.getStore();
        this.setState({items: store.contentStack});
    }

    componentDidMount() {
        PopupPanelAction.onChange([OPEN_POPUP, BACK_POPUP, REPLACE_POPUP, CLOSE_POPUP], this.update);
        // PopupPanelAction.onChange([OPEN_POPUP, BACK_POPUP, REPLACE_POPUP], this.handleOpen);
        // PopupPanelAction.onChange(CLOSE_POPUP, this.handleClose);
    }

    componentWillUnmount() {
        PopupPanelAction.unbind([OPEN_POPUP, BACK_POPUP, REPLACE_POPUP, CLOSE_POPUP], this.update);
        // PopupPanelAction.unbind([OPEN_POPUP, BACK_POPUP, REPLACE_POPUP], this.handleOpen);
        // PopupPanelAction.unbind(CLOSE_POPUP, this.handleClose);
    }

    render() {
        let className = 'popup_panel';
        if (this.state.items.length) {
            className += ' opened';
        }
        return (
            <div className={className}>
                {this.state.items.length ?
                    this.state.items[this.state.items.length - 1].content : null
                }
                {this.state.content}
                {this.props.type == 'notification' ? <div className="popup_panel__close"/> : null}
            </div>
        )
    }
}