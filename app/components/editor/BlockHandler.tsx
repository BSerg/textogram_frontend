import * as React from 'react'
import BlockHandlerButton from './BlockHandlerButton';
import {BlockContentTypes} from '../../constants';
import '../../styles/editor/block_handler.scss';

interface IBlockHandlerProps {
    articleId: number
    blockPosition: number
    items?: Array<BlockContentTypes>
    isLast?: boolean
}

interface IBlockHandlerState {
    items: Array<BlockContentTypes>
}


export default class BlockHandler extends React.Component<IBlockHandlerProps, IBlockHandlerState> {
    constructor(props: any) {
        super(props);
        this.state = {
            items: this.props.items
        }
    }

    static defaultProps = {
        items: [BlockContentTypes.ADD]
    };

    render() {
        let className = 'block_handler';
        if (this.props.isLast) {
            className += ' last';
        }

        return (
            <div className={className}>
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