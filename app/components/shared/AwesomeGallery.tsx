import * as React from 'react';
import {MediaQuerySerice} from "../../services/MediaQueryService";

import '../../styles/shared/awesome_gallery.scss';

const BackButton = require('-!babel-loader!svg-react-loader!../../assets/images/back.svg?name=BackButton');
const ArrowButton = require('-!babel-loader!svg-react-loader!../../assets/images/arrow.svg?name=ArrowButton');
const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/close_white.svg?name=CloseIcon');


interface IPhoto {id: number, image: string, preview?: string, caption?: string}

interface IPhotoExtended extends IPhoto {
    img?: HTMLImageElement;
    width?: number;
    height?: number;
    ratio?: number;
    drawWidth?: number;
    drawHeight?: number;
    drawX?: number;
    drawY?: number;
    load?: () => any;
}

class AwesomeGalleryPhotoHandler {
    width: number;
    height: number;
    photos: IPhotoExtended[];
    currentPhotoIndex: number;
    photoMap: any;
    isDesktop: boolean;

    constructor(photos: IPhotoExtended[], currentPhotoIndex: number = 0) {
        this.photos = photos;
        this.currentPhotoIndex = currentPhotoIndex;
        this.photoMap = [];
        this.isDesktop = MediaQuerySerice.getIsDesktop();
        this.load();
    }

    setIsDesktop(isDesktop: boolean) {
        this.isDesktop = isDesktop;
    }

    setCurrentPhotoIndex(index: number) {
        this.currentPhotoIndex = index;
    }

    loadPhoto(photo: IPhotoExtended) {
        if (photo.img) return;
        photo.img = null;
        let img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            photo.img = img;
            photo.width = img.width;
            photo.height = img.height;
            photo.ratio = photo.width / photo.height;
            this.update();
        };
        img.src = photo.image;

        if ( img.complete || img.complete === undefined ) {
            img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            img.src = photo.image;
        }
        return photo;
    }

    load() {
        this.photos.forEach((photo: IPhotoExtended) => {
            photo.load = this.loadPhoto.bind(this, photo);
        });
        this.update();
    }

    update() {
        let width = 0, height = Math.max(...this.photos.map((photo: IPhotoExtended) => {return photo.height || 100}));
        let offsetX = 0;
        let interval = this.isDesktop ? height * 0.05 : 0;
        this.photos.forEach((photo: IPhotoExtended, index: number) => {
            if (photo.img) {
                photo.drawWidth = height * photo.ratio;
            } else {
                photo.drawWidth = JSON.parse(JSON.stringify(height));
            }
            photo.drawHeight = height;
            photo.drawX = offsetX;
            photo.drawY = 0;
            width += photo.drawWidth + interval;
            offsetX += photo.drawWidth + interval;
            this.photoMap[index] = {
                x: photo.drawX,
                y: photo.drawY,
                width: photo.drawWidth,
                height: photo.drawHeight,
                centerX: photo.drawX + photo.drawWidth / 2,
                centerY: photo.drawY + photo.drawHeight / 2,
                ratio: photo.drawWidth / photo.drawHeight
            };
        });
        this.width = width;
        this.height = height;
    }
}


interface IAwesomeGalleryItem {
    isCurrent?: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    img: string;
    isVisible?: boolean;
}

class AwesomeGalleryItem extends React.Component<IAwesomeGalleryItem, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        let className = "awesome_gallery__item", 
            style = {
                top: this.props.y + 'px', 
                left: this.props.x + 'px',
                width: this.props.width + 'px',
                height: this.props.height + 'px'
            };
        if (this.props.isCurrent) className += ' active';
        if (this.props.img) {
            Object.assign(style, {background: `url('${this.props.img}')`});
        } else {
            className += ' loading';
        }

        return (
            <div className={className} style={style}></div>
        );
    }
}


interface IProps {
    currentPhotoIndex?: number;
    photos: IPhoto[];
    tick?: number;
    jumpTime?: number;
    background?: string | null;
    onClose?: () => any;
}

interface IState {
    currentPhotoIndex?: number;
    loadedPhotoCount?: number;
    photoHandler?: AwesomeGalleryPhotoHandler;
    isDesktop?: boolean;
    canvasWidth?: number;
    canvasHeight?: number;
    canvasRatio?: number;
    photoFrameWidth?: number;
    photoFrameHeight?: number;
}

export default class AwesomeGallery extends React.Component<IProps, IState> {
    photoCanvasZoom: number;
    photoCanvasOffset: {x: number, y: number};
    photoCenterOffset: {x: number, y: number};
    drawProcess: number;
    photoFrameWidth: number;
    photoFrameHeight: number;
    jumpTimeCountdown: number;
    freeMode: boolean;
    mouseDownPoint: {x: number, y: number} | null;

    refs: {
        canvas: HTMLCanvasElement
    };

    static defaultProps = {
        currentPhotoIndex: 0,
        tick: 25,
        jumpTime: 300,
    };

    constructor(props: any) {
        super(props);
        this.state = {
            photoHandler: new AwesomeGalleryPhotoHandler(this.props.photos, this.props.currentPhotoIndex),
            loadedPhotoCount: 0,
            currentPhotoIndex: this.props.currentPhotoIndex,
            canvasWidth: MediaQuerySerice.getScreenWidth(),
            canvasHeight: MediaQuerySerice.getScreenHeight(),
            canvasRatio: MediaQuerySerice.getScreenWidth() / MediaQuerySerice.getScreenHeight(),
            photoFrameWidth: MediaQuerySerice.getIsDesktop() ? MediaQuerySerice.getScreenWidth() * 0.8 : MediaQuerySerice.getScreenWidth(),
            photoFrameHeight: MediaQuerySerice.getIsDesktop() ? MediaQuerySerice.getScreenHeight() - 128 : MediaQuerySerice.getScreenHeight() - 100,
            isDesktop: MediaQuerySerice.getIsDesktop(),
        };
        this.jumpTimeCountdown = 0;
        this.freeMode = false;
        this.photoCanvasOffset = {x: 0, y: 0};
        this.photoCenterOffset = {x: 0, y: 0},
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleWeelMouse = this.handleWeelMouse.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    close() {
        this.props.onClose && this.props.onClose();
    }

    updatePhotoCanvas() {
        if (this.state.photoHandler) {
            this.state.photoHandler.update();
        }
    }

    update(init: boolean = false) {
        if (!this.state.photoHandler) return;
        let photoCanvasMapItem = this.state.photoHandler.photoMap[this.state.currentPhotoIndex];
        if (photoCanvasMapItem && !this.freeMode) {
            if (photoCanvasMapItem.ratio >= this.state.canvasRatio) {
                this.photoCanvasZoom = this.state.photoFrameWidth / photoCanvasMapItem.width;
            } else {
                this.photoCanvasZoom = this.state.photoFrameHeight / photoCanvasMapItem.height;
            }
            this.photoCanvasOffset.x = photoCanvasMapItem.centerX * this.photoCanvasZoom;
            this.photoCanvasOffset.y = photoCanvasMapItem.centerY * this.photoCanvasZoom;
            this.forceUpdate();
        }
    }

    goToPhoto(index: number) {
        this.freeMode = false;
        this.photoCenterOffset = {x: 0, y: 0};
        if (index >= this.props.photos.length) {
            index = 0;
        } else if (index < 0) {
            index = this.props.photos.length - 1;
        }
        this.setState({currentPhotoIndex: index}, () => {
            this.jumpTimeCountdown = this.props.jumpTime;
            this.state.photoHandler.setCurrentPhotoIndex(this.state.currentPhotoIndex);
            this.state.photoHandler.update();
        });
    }

    nextPhoto() {
        this.goToPhoto(this.state.currentPhotoIndex + 1);
    }

    prevPhoto() {
        this.goToPhoto(this.state.currentPhotoIndex - 1);
    }

    zoom(zoomValue: number) {
        if (zoomValue < 0.05 || zoomValue > 10) return;
        this.freeMode = true;
        let photoData = this.state.photoHandler.photoMap[this.state.currentPhotoIndex];
        this.photoCanvasOffset.x = photoData.centerX * zoomValue;
        this.photoCanvasOffset.y = photoData.centerY * zoomValue;
        this.photoCenterOffset.x *= zoomValue / this.photoCanvasZoom;
        this.photoCenterOffset.y *= zoomValue / this.photoCanvasZoom;
        this.photoCanvasZoom = zoomValue;
        this.forceUpdate();
    }

    getPhotoRect(photoMapItem: any) {
        let x = -this.photoCanvasOffset.x - this.photoCenterOffset.x + this.state.canvasWidth / 2 + photoMapItem.x * this.photoCanvasZoom;
        let y = -this.photoCanvasOffset.y - this.photoCenterOffset.y  + this.state.canvasHeight / 2 + photoMapItem.y * this.photoCanvasZoom;
        let width = photoMapItem.width * this.photoCanvasZoom;
        let height = photoMapItem.height * this.photoCanvasZoom;
        let visible = (x < this.state.canvasWidth && x + width > 0 && y < this.state.canvasHeight && y + height > 0);
        return {x: x, y: y, width: width, height: height, visible: visible};
    }

    handleKeyDown(e: KeyboardEvent) {
        if (e.keyCode == 37) {
            this.prevPhoto();
        } else if (e.keyCode == 39) {
            this.nextPhoto();
        } else if (e.keyCode == 27) {
            e.preventDefault();
            e.stopPropagation();
            this.close();
        }
    }

    handleWeelMouse(e: MouseWheelEvent) {
        let delta = e.wheelDelta || -e.deltaY;
        if (!delta) return;
        if (delta > 0) {
            this.zoom(this.photoCanvasZoom * 1.05);
        } else {
            this.zoom(this.photoCanvasZoom / 1.05);
        }
    }

    handleMouseDown(e: MouseEvent) {
        this.mouseDownPoint = {x: e.clientX, y: e.clientY};
        this.state.photoHandler.photoMap.forEach((p: any, index: number) => {
            let rect = this.getPhotoRect(p);
            if (e.clientX >= rect.x && e.clientX <= rect.x + rect.width && e.clientY >= rect.y && e.clientY <= rect.y + rect.height) {
                if (index != this.state.currentPhotoIndex) {
                    this.goToPhoto(index);
                    return;
                }
            }
        });
    }

    handleMouseUp(e: MouseEvent) {
        this.mouseDownPoint = null;
    }

    handleMouseMove(e: MouseEvent) {
        if (this.mouseDownPoint && this.freeMode) {
            let d = this.state.photoHandler.photoMap[this.state.currentPhotoIndex];
            let deltaX = this.mouseDownPoint.x - e.clientX;
            let deltaY = this.mouseDownPoint.y - e.clientY;

            this.photoCenterOffset.x += deltaX;
            this.photoCenterOffset.x = Math.sign(this.photoCenterOffset.x) * Math.min(Math.abs(this.photoCenterOffset.x), 0.4 * d.width * this.photoCanvasZoom);
            this.photoCenterOffset.y += deltaY;
            this.photoCenterOffset.y = Math.sign(this.photoCenterOffset.y) * Math.min(Math.abs(this.photoCenterOffset.y), 0.4 * d.height * this.photoCanvasZoom);

            this.mouseDownPoint.x = e.clientX;
            this.mouseDownPoint.y = e.clientY;
            this.forceUpdate();
        }
    }

    private getClassName() {
        let className = "awesome_gallery";
        if (this.freeMode) className += ' free_mode';
        return className;
    }

    handleMediaQuery(isDesktop: boolean) {
        this.setState({
            isDesktop: isDesktop,
            canvasWidth: MediaQuerySerice.getScreenWidth(),
            canvasHeight: MediaQuerySerice.getScreenHeight(),
            canvasRatio: MediaQuerySerice.getScreenWidth() / MediaQuerySerice.getScreenHeight(),
            photoFrameWidth: MediaQuerySerice.getIsDesktop() ? MediaQuerySerice.getScreenWidth() * 0.8 : MediaQuerySerice.getScreenWidth(),
            photoFrameHeight: MediaQuerySerice.getIsDesktop() ? MediaQuerySerice.getScreenHeight() - 128 : MediaQuerySerice.getScreenHeight() - 100,
        }, () => {
            this.state.photoHandler.setIsDesktop(isDesktop);
            this.state.photoHandler.update();
        });
    }

    componentDidMount() {
        window.clearInterval(this.drawProcess);
        this.drawProcess = window.setInterval(() => {
            this.update();
        }, this.props.tick);
        MediaQuerySerice.listen(this.handleMediaQuery);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('wheel', this.handleWeelMouse);
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    componentWillUnmount() {
        window.clearInterval(this.drawProcess);
        MediaQuerySerice.unbind(this.handleMediaQuery);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('wheel', this.handleWeelMouse);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
    }

    render() {
        let currentPhoto = this.props.photos.length ? this.props.photos[this.state.currentPhotoIndex] : null;
        let photoRects = this.state.photoHandler.photos.map((photo: IPhotoExtended, index: number) => {
            let rect = Object.assign(this.getPhotoRect(this.state.photoHandler.photoMap[index]), {image: photo.image});
            if (!photo.img && rect.visible) photo.load();
            return rect;
        });
        return (
            <div draggable={false} className={this.getClassName()}>

                {this.state.isDesktop ?
                    <div className="awesome_gallery__header">
                        <div className="awesome_gallery__prev" onClick={this.prevPhoto.bind(this)}>
                            <ArrowButton/> НАЗАД
                        </div>
                        <div className="awesome_gallery__counter">
                            {this.state.currentPhotoIndex + 1}/{this.props.photos.length}
                        </div>
                        <div className="awesome_gallery__next" onClick={this.nextPhoto.bind(this)}>
                            ДАЛЕЕ <ArrowButton/>
                        </div>
                        <div className="awesome_gallery__close" onClick={this.close.bind(this)}><CloseIcon/></div>
                    </div> :
                    <div className="awesome_gallery__header">
                        <BackButton className="awesome_gallery__back" onClick={this.close.bind(this)}/>
                        <div className="awesome_gallery__counter">
                            {this.state.currentPhotoIndex + 1}/{this.props.photos.length}
                        </div>
                    </div>
                }

                {photoRects.map((rect: any, index: number) => {
                    return <AwesomeGalleryItem key={'photo' + index} 
                                               isCurrent={this.state.currentPhotoIndex == index}
                                               img={rect.image} 
                                               x={rect.x} 
                                               y={rect.y} 
                                               width={rect.width} 
                                               height={rect.height}/>
                })}                

                {currentPhoto && currentPhoto.caption ?
                    <div className="awesome_gallery__caption">
                        {currentPhoto.caption}
                    </div> : null
                }
            </div>
        )
    }
}