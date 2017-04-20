import * as React from "react";
import {Captions, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import {UploadImageAction, UPLOAD_IMAGE, UPLOAD_IMAGE_BASE64} from "../../actions/editor/UploadImageAction";
import {
    ContentAction, UPDATE_TITLE_CONTENT, UPDATE_COVER_CONTENT,
    RESET_CONTENT
} from "../../actions/editor/ContentAction";
import {api} from "../../api";
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";
import {Validator} from "./utils";
import ImageEditor from "../shared/ImageEditor";
import {MediaQuerySerice} from "../../services/MediaQueryService";
import "../../styles/editor/title_block.scss";


interface ICover {
    id: number
    image: string
    position_x?: number
    position_y?: number
    image_width?: number
    image_height?: number
    editable?: boolean
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
    title?: string|null;
    titleIsLong?: boolean;
    cover?: ICover | null
    coverClipped?: ICoverClipped | null
    isValid?: boolean
    coverLoading?: boolean
    isActive?: boolean
    canvas?: any
    isDesktop?: boolean
}

export default class TitleBlock extends React.Component<TitleBlockPropsInterface, TitleBlockStateInterface> {
    private coverClippedProcess: number;

    constructor(props: any) {
        super(props);
        this.state = {
            title: props.title,
            titleIsLong: props.title ? this.checkTitleIsLong(props.title) : false,
            cover: props.cover,
            coverClipped: props.coverClipped || null,
            coverLoading: false,
            isActive: false,
            canvas: null,
            isDesktop: MediaQuerySerice.getIsDesktop(),
        };
        this.handleResize = this.handleResize.bind(this);
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
        this.coverClippedProcess = -1;
    }

    static defaultProps = {
        autoSave: true,
    };

    refs: {
        fileInput: HTMLInputElement;
        componentRootElement: HTMLElement
    };

    isValid(title: string) {
        return Validator.isValid(this.state, Validation.ROOT);
    }

    checkTitleIsLong(title: string) {
        return title.length > 100;
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
        this.setState({title: contentText, titleIsLong: this.checkTitleIsLong(contentText)}, () => {
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

    uploadCover(articleId: string|null) {
        var file = this.refs.fileInput.files[0];
        UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: articleId, image: file}).then((data: any) => {
            data.editable = file.type != 'image/gif';
            this.setState({cover: data, coverLoading: false}, () => {
                ContentAction.do(UPDATE_COVER_CONTENT, {articleId: articleId, autoSave: this.props.autoSave, cover: data});
                this.drawCanvas();
            });
        }).catch((err: any) => {
            this.setState({coverLoading: false});
        });
    }

    handleCover() {
        this.setState({coverLoading: true});
        if (!this.props.articleSlug) {
            api.post('/articles/editor/', ContentAction.getStore().content).then((response: any) => {
                ContentAction.do(RESET_CONTENT, {articleId: response.data.id, autoSave: false, content: response.data.content});
                this.uploadCover(response.data.id);
            });
        } else {
            this.uploadCover(this.props.articleSlug);
        }
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
                    console.log('UPLOAD BASE64', data);

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

                    if (this.state.coverClipped && this.props.autoSave) {
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

    handleMediaQuery(isDesktop: boolean) {
        if (this.state.isDesktop != isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    componentDidMount() {
        this.updateValidState();
        window.setTimeout(() => {
            this.drawCanvas();
        }, 100);
        window.addEventListener('resize', this.handleResize);
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    render() {
        let className = 'title_block',
            style = {};
        if (!this.state.isDesktop || (this.state.cover && !this.state.cover.editable)) {
            style = {background: `url(${this.state.coverClipped && this.state.coverClipped.image || this.state.cover && this.state.cover.image}) no-repeat center center`};
        }
        if (this.state.cover) {
            className += ' inverse';
        }
        if (this.state.titleIsLong) className += ' long';

        return (
            <div className={className} style={style} ref="componentRootElement">
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
                </div>
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
                {this.state.isDesktop && this.state.cover && this.state.cover.editable ? this.state.canvas : null}
            </div>
        )
    }
}