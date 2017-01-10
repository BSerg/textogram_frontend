import * as React from 'react';
import {Captions, Constants} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK, DELETE_CONTENT_BLOCK} from '../../actions/editor/ContentBlockAction';
import {ContentAction, DELETE_CONTENT} from '../../actions/editor/ContentAction';
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from '../../actions/shared/PopupPanelAction';
import ContentBlockPopup from './ContentBlockPopup'
import '../../styles/editor/base_content_block.scss';

interface IBaseContnentBlockProps {
    className?: string
    id: number|string
    onActive?: () => any
    onBlur?: () => any
    onClick?: () => any
    popupContent?: JSX.Element
    disableDefaultPopup?: boolean
}

interface IBaseContnentBlockState {
    isActive: boolean
}


export default class BaseContentBlock extends React.Component<IBaseContnentBlockProps, IBaseContnentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isActive: false
        }
    }

    static defaultProps = {
        disablePopup: false
    };

    handleActivate() {
        let store: any = ContentBlockAction.getStore();
        if ((store.id == this.props.id) !== this.state.isActive) {
            this.setState({isActive: store.id == this.props.id}, () => {
                if (this.state.isActive && this.props.onActive) {
                    this.props.onActive();
                } else if (!this.state.isActive && this.props.onBlur) {
                    this.props.onBlur();
                }
                if (this.state.isActive && !this.props.disableDefaultPopup) {
                    PopupPanelAction.do(
                        OPEN_POPUP,
                        {
                            content: this.props.popupContent || <ContentBlockPopup onDelete={this.handleDelete.bind(this)}/>
                        }
                    );
                }
            });
        }
    }

    handleClick() {
        this.props.onClick && this.props.onClick();
    }

    handleDelete() {
        ContentAction.do(DELETE_CONTENT, {id: this.props.id})
    }

    componentDidMount() {
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleActivate.bind(this));
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleActivate.bind(this));
    }

    render() {
        let className = 'base_content_block';
        if (this.state.isActive) {
            className += ' active';
        }
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <div id={this.props.id.toString()} className={className} onClick={this.handleClick.bind(this)}>
                {this.props.children}
            </div>
        )
    }
}