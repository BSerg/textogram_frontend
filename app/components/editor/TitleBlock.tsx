import * as React from 'react';
import {Captions, Constants, Validation} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import {UploadImageAction, UPLOAD_IMAGE, UPLOAD_IMAGE_BASE64} from '../../actions/editor/UploadImageAction';
import {ContentAction, UPDATE_TITLE_CONTENT, UPDATE_COVER_CONTENT} from '../../actions/editor/ContentAction';

import {TitleBlockAction, UPDATE_COVER_ACTION, UPDATE_TITLE_ACTION} from '../../actions/editor/TitleBlockAction';

import {api} from '../../api';

import '../../styles/editor/title_block.scss';
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";
import {Validator} from "./utils";
import ImageEditor from "../shared/ImageEditor";
import {MediaQuerySerice} from "../../services/MediaQueryService";


interface ICover {
    id: number
    image: string
    position_x?: number
    position_y?: number
    image_width?: number
    image_height?: number
}

interface ICoverClipped {
    id: number
    image: string
}

interface TitleBlockPropsInterface {
    title: string|null
    cover: ICover|null
    coverClipped?: ICoverClipped|null
    articleSlug: string
    autoSave?: boolean
}

interface TitleBlockStateInterface {
    title?: string|null
    cover?: ICover | null
    coverClipped?: ICoverClipped | null
    isValid?: boolean
    coverLoading?: boolean
    isActive?: boolean
    canvas?: any
}

export default class TitleBlock extends React.Component<TitleBlockPropsInterface, TitleBlockStateInterface> {
    private coverClippedProcess: number;

    constructor(props: any) {
        super(props);
        this.state = {
            title: props.title,
            cover: props.cover,
            coverClipped: props.coverClipped || null,
            coverLoading: false,
            isActive: false,
            canvas: null
        };
        this.handleResize = this.handleResize.bind(this);
        this.coverClippedProcess = -1;
    }

    static defaultProps = {
        autoSave: true
    };

    refs: {
        fileInput: HTMLInputElement;
        componentRootElement: HTMLElement
    };

    isValid(title: string) {
        return Validator.isValid(this.state, Validation.ROOT);
    }

    private updateValidState() {
        if (!this.isValid(this.state.title) && !this.refs.componentRootElement.classList.contains('invalid')) {
            this.refs.componentRootElement.classList.add('invalid');
        } else if (this.isValid(this.state.title) && this.refs.componentRootElement.classList.contains('invalid')) {
            this.refs.componentRootElement.classList.remove('invalid');
        }
    }

    openFileDialog() {
        this.refs.fileInput.click();
    }

    handleTitle(content: string, contentText: string) {
        this.setState({title: contentText}, () => {
            ContentAction.do(UPDATE_TITLE_CONTENT, {articleId: this.props.articleSlug, autoSave: this.props.autoSave, title: this.state.title});
            this.updateValidState();
            if (!this.isValid(this.state.title)) {
                NotificationAction.do(
                    SHOW_NOTIFICATION,
                    {content: Validation.ROOT.title.message}
                );
            }
            this.drawCanvas();
        });
    }

    handleCover() {
        this.setState({coverLoading: true});
        var file = this.refs.fileInput.files[0];
        UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleSlug, image: file}).then((data: any) => {
            this.setState({cover: data, coverLoading: false}, () => {
                ContentAction.do(UPDATE_COVER_CONTENT, {articleId: this.props.articleSlug, autoSave: this.props.autoSave, cover: data});
                this.drawCanvas();
            });
        }).catch((err: any) => {
            this.setState({coverLoading: false});
        });
    }

    deleteCover() {
        this.setState({cover: null, coverClipped: null}, () => {
            ContentAction.do(UPDATE_COVER_CONTENT, {articleId: this.props.articleSlug, autoSave: this.props.autoSave, cover: null});
            this.drawCanvas();
        });
    }

    handleImageEditorChange(image: ICover, imageBase64: string) {
        this.setState({cover: image, }, () => {
            window.clearTimeout(this.coverClippedProcess);
            this.coverClippedProcess = window.setTimeout(() => {
                UploadImageAction.doAsync(UPLOAD_IMAGE_BASE64,  {articleId: this.props.articleSlug, image: imageBase64}).then((data: any) => {
                    console.log('UPLOAD BASE64', data)

                    let updateCoverContent = () => {
                        this.setState({coverClipped: data}, () => {
                            ContentAction.do(UPDATE_COVER_CONTENT, {
                                articleId: this.props.articleSlug,
                                autoSave: this.props.autoSave,
                                cover: image,
                                coverClipped: data
                            });
                        });
                    };

                    if (this.state.coverClipped) {
                        api.delete(`/articles/editor/images/${this.state.coverClipped.id}/`).then(() => {
                            updateCoverContent();
                        })
                    } else {
                        updateCoverContent();
                    }

                });
            }, 1000);
        })
    }

    drawCanvas() {
        if (this.state.cover) {
            let canvas = <ImageEditor image={this.state.cover}
                                      width={this.refs.componentRootElement.offsetWidth}
                                      height={this.refs.componentRootElement.offsetHeight}
                                      onChange={this.handleImageEditorChange.bind(this)}/>;
            this.setState({canvas: canvas});
        } else {
            this.setState({canvas: null});
        }
    }

    handleResize() {
        window.setTimeout(() => {
            this.drawCanvas();
        });
    }

    componentDidMount() {
        this.updateValidState();
        window.setTimeout(() => {
            this.drawCanvas();
        }, 100);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    render() {
        let className = 'title_block',
            style = {};
        if (this.state.cover) {
            className += ' inverse';
        }

        return (
            <div className={className} style={style} ref="componentRootElement">
                {this.props.articleSlug != null ?
                    <div className="title_block__cover_handler_wrapper">
                        {!this.state.cover ?
                            <div onClick={!this.state.coverLoading && this.openFileDialog.bind(this)}
                                 className="title_block__cover_handler">
                                {this.state.coverLoading ? 'Обложка загружается...' : Captions.editor.add_cover_ru}
                            </div> :
                            <div onClick={!this.state.coverLoading && this.deleteCover.bind(this)} className="title_block__cover_handler">
                                {Captions.editor.remove_cover_ru}
                            </div>
                        }
                    </div> : null
                }
                <ContentEditable className="title_block__title"
                                 elementType="inline"
                                 allowLineBreak={false}
                                 alignContent="center"
                                 focusOnMount={!this.state.title}
                                 onChange={this.handleTitle.bind(this)}
                                 placeholder={Captions.editor.enter_title_ru}
                                 content={this.state.title}/>
                <input ref="fileInput"
                       type="file"
                       style={{display: 'none'}}
                       accept="image/jpeg,image/png,image/gif"
                       onChange={this.handleCover.bind(this)}/>
                {this.state.canvas}
            </div>
        )
    }
}