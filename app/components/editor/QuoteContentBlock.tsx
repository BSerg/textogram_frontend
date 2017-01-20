import * as React from "react";
import {Captions, BlockContentTypes} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT, IContentData} from "../../actions/editor/ContentAction";
import "../../styles/editor/quote_content_block.scss";
import {UploadImageAction, UPLOAD_IMAGE} from "../../actions/editor/UploadImageAction";

interface IQuoteContent {
    id: string
    type: BlockContentTypes
    value: string
    image: {id: number, image: string} | null
}

interface IQuoteContentBlockProps {
    articleId: number
    content: IContentData
    className?: string
}

interface IQuoteContentBlockState {
    content?: IQuoteContent
    menuOpened?: boolean
    doNotUpdateComponent?: boolean
    isActive?: boolean
}

export default class QuoteContentBlock extends React.Component<IQuoteContentBlockProps, IQuoteContentBlockState> {
    refs: {
        inputUpload: HTMLInputElement
    };

    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IQuoteContent,
            menuOpened: false
        };
        this.handleActivate = this.handleActivate.bind(this);
    }

    handleActivate() {
        let store = ContentBlockAction.getStore();
        this.setState({isActive: store.id == this.props.content.id});
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
        this.closePhotoMenu();
    }

    handleBlur() {
        this.closePhotoMenu();
    }

    handleChange(content: string, contentText: string) {
        console.log(content, contentText);
        this.state.content.value = contentText;
        this.setState({content: this.state.content, doNotUpdateComponent: true}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
        });
    }

    openFileDialog() {
        this.refs.inputUpload.click();
    }

    updateImage() {
        let file = this.refs.inputUpload.files[0];
        UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleId, image: file}).then(() => {
            let store = UploadImageAction.getStore();
            this.state.content.image = store.image;
            this.setState({content: this.state.content}, () => {
                ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
                this.closePhotoMenu();
            });
        })
    }

    deleteImage() {
        this.state.content.image = null;
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
        });
    }

    handleClickPhoto() {
        console.log('HELLO');
        this.handleFocus();
        this.openPhotoMenu();
    }

    openPhotoMenu() {
        if (this.state.isActive) {
            this.setState({menuOpened: true});
        }
    }

    closePhotoMenu() {
        this.setState({menuOpened: false});
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        if (nextState.updateComponent) {
            delete nextState.updateComponent;
            return false;
        }
        return true;
    }

    componentDidMount() {
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleActivate);
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleActivate);
    }

    render() {
        let className = 'content_block_quote';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        let imageStyle = {};
        if (this.state.content.image) {
            imageStyle = {
                background: `url('${this.state.content.image.image}') no-repeat center center`,
                backgroundSize: 'cover'
            }
        }
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                {this.state.content.image ?
                    [
                        <div onClick={this.openPhotoMenu.bind(this)}
                             key="photo"
                             className="content_block_quote__photo"
                             style={imageStyle}/>,
                        (
                            this.state.menuOpened ?
                                <div key="photoMenu" className="content_block_quote__menu">
                                    <div onClick={this.openFileDialog.bind(this)} className="content_block_quote__menu_item">
                                        {Captions.editor.enter_quote_replace}
                                    </div>
                                    <div onClick={this.deleteImage.bind(this)} className="content_block_quote__menu_item">
                                        {Captions.editor.enter_quote_delete}
                                    </div>
                                </div> : null
                        )
                    ] :
                    <div className="content_block_quote__empty_photo" onClick={this.openFileDialog.bind(this)}/>
                }
                <ContentEditable elementType="inline"
                                 allowLineBreak={false}
                                 onFocus={this.handleFocus.bind(this)}
                                 onBlur={this.handleBlur.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={1000}
                                 content={this.state.content.value}
                                 placeholder={Captions.editor.enter_quote}/>
                <input ref="inputUpload"
                       type="file"
                       accept="image/jpeg,image/png,image/gif"
                       style={{display: "none"}}
                       onChange={this.updateImage.bind(this)} />
            </BaseContentBlock>
        )
    }
}