import * as React from "react";
import {Captions, BlockContentTypes} from "../../constants";
import {ContentAction, UPDATE_CONTENT} from "../../actions/editor/ContentAction";
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import "../../styles/editor/photo_modal.scss";
import {MediaQuerySerice} from "../../services/MediaQueryService";

const DeleteButton = require('babel!svg-react!../../assets/images/redactor_icon_delete.svg?name=DeleteButton');
const ConfirmButton = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmButton');
const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');
const CloseButton = require('babel!svg-react!../../assets/images/close.svg?name=CloseButton');
const ArrowButton = require('babel!svg-react!../../assets/images/arrow.svg?name=ArrowButton');


interface IPhoto {
    id: number
    image: string
    preview?: string
    caption?: string
}

interface IPhotoDesktopModalProps {
    contentBlockId: string
    photos: IPhoto[]
    initPhotoIndex: number
}

interface IPhotoDesktopModalState {
    photos?: IPhoto[]
    currentPhotoIndex?: number
    isDesktop?: boolean
}


export class PhotoModal extends React.Component<IPhotoDesktopModalProps, IPhotoDesktopModalState> {
    constructor(props: any) {
        super(props);
        this.state = {
            photos: this.props.photos,
            currentPhotoIndex: this.props.initPhotoIndex,
            isDesktop: MediaQuerySerice.getIsDesktop()
        };
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
    }

    refs: {
        inputCaption: HTMLInputElement
    };

    static defaultProps = {
        isDesktop: false
    };

    back() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    handleCaption() {
        this.state.photos[this.state.currentPhotoIndex].caption = this.refs.inputCaption.value;
        this.setState({photos: this.state.photos}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: {
                id: this.props.contentBlockId,
                type: BlockContentTypes.PHOTO,
                photos: this.state.photos
            }})
        });
    }

    handleSubmit(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.refs.inputCaption.blur();
    }

    nextPhoto() {
        this.state.currentPhotoIndex++;
        if (this.state.currentPhotoIndex >= this.state.photos.length) {
            this.state.currentPhotoIndex = 0;
        }
        this.setState({currentPhotoIndex: this.state.currentPhotoIndex});
    }

    prevPhoto() {
        this.state.currentPhotoIndex--;
        if (this.state.currentPhotoIndex < 0) {
            this.state.currentPhotoIndex = this.state.photos.length - 1;
        }
        this.setState({currentPhotoIndex: this.state.currentPhotoIndex});
    }

    getPrevPhotoIndex() {
        if (this.state.photos.length < 2) {
            return null;
        } else if (this.state.photos.length == 2 && this.state.currentPhotoIndex == 1) {
            return 0;
        } else {
            return this.state.currentPhotoIndex == 0 ? this.state.photos.length - 1 : this.state.currentPhotoIndex - 1;
        }
    }

    getNextPhotoIndex() {
        if (this.state.photos.length < 2) {
            return null;
        } else if (this.state.photos.length == 2 && this.state.currentPhotoIndex == 0) {
            return 1;
        } else {
            return this.state.currentPhotoIndex == this.state.photos.length - 1 ? 0 : this.state.currentPhotoIndex + 1;
        }
    }

    getImageStyle(index: number) {
        if (index == null) {
            return {background: 'transparent'};
        } else {
            return {background: `url('${this.state.photos[index].image}') no-repeat center center`};
        }
    }

    handleMediaQuery(isDesktop: boolean) {
        if (this.state.isDesktop != isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    componentWillMount() {
        MediaQuerySerice.unbind(this.handleMediaQuery);
    }

    render() {
        return (
            <div className="photo_modal">
                <div className="photo_modal__header">
                    {this.state.isDesktop ?
                        [
                            <div className="photo_modal__prev" onClick={this.prevPhoto.bind(this)}>
                                <ArrowButton/>НАЗАД
                            </div>,
                            <div className="photo_modal__counter">
                                {this.state.currentPhotoIndex + 1}/{this.state.photos.length}
                            </div>,
                            <div className="photo_modal__next" onClick={this.nextPhoto.bind(this)}>
                                ДАЛЕЕ<ArrowButton/>
                            </div>,
                            <div className="photo_modal__close" onClick={this.back.bind(this)}>
                                <CloseButton/>
                            </div>
                        ] :
                        [
                            <BackButton className="photo_modal__back" onClick={this.back.bind(this)}/>,
                            <div className="photo_modal__counter">
                                {this.state.currentPhotoIndex + 1}/{this.state.photos.length}
                            </div>
                        ]
                    }
                </div>
                {this.state.isDesktop ?
                    <div className="photo_modal__viewport">
                        <div className="photo_modal__image photo_modal__prev"
                             style={this.getImageStyle(this.getPrevPhotoIndex())} onClick={this.prevPhoto.bind(this)}/>
                        <div className="photo_modal__image"
                             style={this.getImageStyle(this.state.currentPhotoIndex)} onClick={this.nextPhoto.bind(this)}/>
                        <div className="photo_modal__image photo_modal__next"
                             style={this.getImageStyle(this.getNextPhotoIndex())} onClick={this.nextPhoto.bind(this)}/>

                    </div>
                    : <div className="photo_modal__image"
                           style={this.getImageStyle(this.state.currentPhotoIndex)}
                           onClick={this.nextPhoto.bind(this)}/>
                }
                <div className="photo_modal__caption">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <input ref="inputCaption"
                               type="text"
                               placeholder={Captions.editor.enter_caption}
                               value={this.state.photos[this.state.currentPhotoIndex].caption || ''}
                               onChange={this.handleCaption.bind(this)}
                               autoComplete="off"/>
                    </form>
                </div>
            </div>
        );
    }
}