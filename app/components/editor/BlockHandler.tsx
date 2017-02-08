import * as React from 'react'
import BlockHandlerButton from './BlockHandlerButton';
import {BlockContentTypes} from '../../constants';
import '../../styles/editor/block_handler.scss';
import {
    BlockHandlerAction, ACTIVATE_BLOCK_HANDLER,
    DEACTIVATE_BLOCK_HANDLER
} from "../../actions/editor/BlockHandlerAction";

interface IBlockHandlerProps {
    id?: string | null
    articleId: number
    blockPosition: number
    items?: Array<BlockContentTypes>
    isLast?: boolean
}

interface IBlockHandlerState {
    id?: string,
    items?: Array<BlockContentTypes>,
    isActive?: boolean
}


export default class BlockHandler extends React.Component<IBlockHandlerProps, IBlockHandlerState> {
    private hideTimeout: number;

    constructor(props: any) {
        super(props);
        this.state = {
            items: this.props.items,
        };
        this.handleActive = this.handleActive.bind(this);
    }

    static defaultProps = {
        items: [BlockContentTypes.ADD]
    };

    handleActive() {
        let store = BlockHandlerAction.getStore();
        console.log(store);
        if (this.state.isActive != (store.id == this.props.blockPosition)) {
            this.setState({isActive: store.id == this.props.blockPosition});
        }
    }

    handleMouseOver() {
        window.clearTimeout(this.hideTimeout);
        BlockHandlerAction.do(ACTIVATE_BLOCK_HANDLER, {id: this.props.blockPosition});
    }

    handleMouseLeave() {
        this.hideTimeout = window.setTimeout(() => {
            BlockHandlerAction.do(DEACTIVATE_BLOCK_HANDLER, {id: this.props.blockPosition});
        }, 500);
    }

    componentDidMount() {
        BlockHandlerAction.onChange([ACTIVATE_BLOCK_HANDLER, DEACTIVATE_BLOCK_HANDLER], this.handleActive);
    }

    componentWillUnmount() {
        BlockHandlerAction.unbind([ACTIVATE_BLOCK_HANDLER, DEACTIVATE_BLOCK_HANDLER], this.handleActive);
    }

    render() {
        let className = 'block_handler';
        if (this.props.isLast) {
            className += ' last';
        }
        if (this.state.isActive) {
            className += ' active';
        }

        return (
            <div id={this.state.id}
                 className={className}
                 onMouseOver={this.handleMouseOver.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>
                {this.state.items.map((type) => {
                    return <BlockHandlerButton key={"button_" + type} type={type}
                                               size="small"
                                               articleId={this.props.articleId}
                                               blockPosition={this.props.blockPosition}/>
                })}

            </div>
        )
    }

}