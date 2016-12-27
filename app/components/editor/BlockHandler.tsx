import * as React from 'react'
import BlockHandlerButton from './BlockHandlerButton';
import {BlockContentTypes} from '../../constants';
import '../../styles/editor/block_handler.scss';

interface IBlockHandlerProps {
    articleSlug: string
    blockPosition: number,
    items?: Array<BlockContentTypes>,
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
    }

    render() {
        return (
            <div className="block_handler">
                {this.state.items.map((type) => {
                    return <BlockHandlerButton type={type}
                                               size="small"
                                               articleSlug={this.props.articleSlug}
                                               blockPosition={this.props.blockPosition}/>
                })}

            </div>
        )
    }

}