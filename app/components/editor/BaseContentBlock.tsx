import * as React from 'react';
import {Captions, Constants} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import {ActivateContentBlockAction, ACTIVATE_CONTENT_BLOCK} from '../../actions/editor/ActivateContentBlockAction';
import '../../styles/editor/base_content_block.scss';

interface IBaseContnentBlockProps {
    className?: string
    id?: number|string
    onActive?: () => any
    onBlur?: () => any
    onClick?: () => any
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
        id: Math.random().toString().substr(2, 7)
    };

    handleActivate() {
        let store: any = ActivateContentBlockAction.getStore();
        if ((store.id == this.props.id) !== this.state.isActive) {
            this.setState({isActive: store.id == this.props.id}, () => {
                if (this.state.isActive && this.props.onActive) {
                    this.props.onActive();
                } else if (!this.state.isActive && this.props.onBlur) {
                    this.props.onBlur();
                }
            });
        }
    }

    handleClick() {
        this.props.onClick && this.props.onClick();
    }

    componentDidMount() {
        ActivateContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleActivate.bind(this));
    }

    componentWillUnmount() {
        ActivateContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleActivate.bind(this));
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