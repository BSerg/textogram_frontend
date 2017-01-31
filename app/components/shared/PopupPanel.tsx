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
    items?: IPopupItem[]
}

export default class PopupPanel extends React.Component<IPopupPanelProps, IPopupPanelState> {

    constructor(props: any) {
        super(props);
        this.state = {
            items: []
        };
        this.update = this.update.bind(this);
    }

    static defaultProps = {
        type: 'simple',
    };

    update() {
        let store = PopupPanelAction.getStore();
        this.setState({items: store.contentStack});
    }

    componentDidMount() {
        PopupPanelAction.onChange([OPEN_POPUP, BACK_POPUP, REPLACE_POPUP, CLOSE_POPUP], this.update);
    }

    componentWillUnmount() {
        PopupPanelAction.unbind([OPEN_POPUP, BACK_POPUP, REPLACE_POPUP, CLOSE_POPUP], this.update);
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
            </div>
        )
    }
}