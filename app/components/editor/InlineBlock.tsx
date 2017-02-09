import * as React from "react";
import "../../styles/editor/inline_block.scss";
import {InlineBlockAction, CLOSE_INLINE_BLOCK} from "../../actions/editor/InlineBlockAction";


const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');


interface IInlineBlockState {
}


export default class InlineBlock extends React.Component<any, IInlineBlockState> {
    constructor(props: any) {
        super(props);
    }

    close() {
        InlineBlockAction.do(CLOSE_INLINE_BLOCK, null);
    }

    render() {
        let className = 'inline_block';
        return (
            <div className={className}>
                <div className="inline_block__close" onClick={this.close.bind(this)}>
                    <CloseIcon/>
                </div>
                <div className="inline_block__content">{this.props.children}</div>
            </div>
        )
    }
}