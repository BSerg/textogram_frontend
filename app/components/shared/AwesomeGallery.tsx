import * as React from 'react';
import {MediaQuerySerice} from "../../services/MediaQueryService";

import '../../styles/shared/awesome_gallery.scss';

const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');
const ArrowButton = require('babel!svg-react!../../assets/images/arrow.svg?name=ArrowButton');
const CloseIcon = require('babel!svg-react!../../assets/images/close_white.svg?name=CloseIcon');


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
}

class AwesomeGalleryPhotoCanvas {
    photos: IPhotoExtended[];
    currentPhotoIndex: number;
    photoMap: any;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    isDesktop: boolean;
    highlightedPhotoIndex: number;

    constructor(photos: IPhotoExtended[], currentPhotoIndex: number = 0) {
        this.canvas = document.createElement('canvas');
        this.photos = photos;
        this.currentPhotoIndex = currentPhotoIndex;
        this.photoMap = [];
        this.isDesktop = MediaQuerySerice.getIsDesktop();
        this.highlightedPhotoIndex = -1;
        this.load();
    }

    setIsDesktop(isDesktop: boolean) {
        this.isDesktop = isDesktop;
    }

    setCurrentPhotoIndex(index: number) {
        this.currentPhotoIndex = index;
    }

    setHighlightedPhotoIndex(index: number) {
        this.highlightedPhotoIndex = index;
    }

    load() {
        this.photos = this.photos.map((photo: IPhotoExtended) => {
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
            return photo;
        });
        this.update();
    }

    update() {
        let width = 0, height = Math.max(...this.photos.map((photo: IPhotoExtended) => {return photo.height}));
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
            }
        });

        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.photos.forEach((photo: IPhotoExtended, index: number) => {
            if (photo.img) {
                this.context.drawImage(photo.img, photo.drawX, photo.drawY, photo.drawWidth, photo.drawHeight);
                if (index != this.currentPhotoIndex) {
                    this.context.fillStyle = this.highlightedPhotoIndex == index ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.75)';
                    this.context.fillRect(photo.drawX, photo.drawY, photo.drawWidth, photo.drawHeight);
                }
            } else {
                this.context.fillStyle = 'rgba(0, 0, 0, 1)';
                this.context.fillRect(photo.drawX, photo.drawY, photo.drawWidth, photo.drawHeight);
            }
        });
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
    photoCanvas?: AwesomeGalleryPhotoCanvas;
    photoCanvasZoom?: number;
    photoCanvasOffset?: {x: number, y: number};
    photoCenterOffset?: {x: number, y: number};
    drawProcess?: number;
    isDesktop?: boolean;
    canvasWidth?: number;
    canvasHeight?: number;
    canvasRatio?: number;
    photoFrameWidth?: number;
    photoFrameHeight?: number;
    jumpTimeCountdown?: number;
    freeMode?: boolean;
}

export default class AwesomeGallery extends React.Component<IProps, IState> {
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
            photoCanvas: new AwesomeGalleryPhotoCanvas(this.props.photos, this.props.currentPhotoIndex),
            loadedPhotoCount: 0,
            currentPhotoIndex: this.props.currentPhotoIndex,
            canvasWidth: MediaQuerySerice.getScreenWidth(),
            canvasHeight: MediaQuerySerice.getScreenHeight(),
            canvasRatio: MediaQuerySerice.getScreenWidth() / MediaQuerySerice.getScreenHeight(),
            photoFrameWidth: MediaQuerySerice.getIsDesktop() ? MediaQuerySerice.getScreenWidth() * 0.8 : MediaQuerySerice.getScreenWidth(),
            photoFrameHeight: MediaQuerySerice.getIsDesktop() ? MediaQuerySerice.getScreenHeight() - 128 : MediaQuerySerice.getScreenHeight() - 100,
            jumpTimeCountdown: 0,
            photoCanvasOffset: {x: 0, y: 0},
            photoCenterOffset: {x: 0, y: 0},
            isDesktop: MediaQuerySerice.getIsDesktop(),
            freeMode: false
        };
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
        if (this.state.photoCanvas) {
            this.state.photoCanvas.update();
        }
    }

    update(init: boolean = false) {
        if (!this.state.photoCanvas) return;
        let photoCanvasMapItem = this.state.photoCanvas.photoMap[this.state.currentPhotoIndex];
        if (!photoCanvasMapItem) return;
        if (!init && this.state.jumpTimeCountdown > 0) {
            let delta = this.props.tick / this.state.jumpTimeCountdown;
            if (this.state.freeMode) {}
            else {
                let targetZoom;
                if (photoCanvasMapItem.ratio >= this.state.canvasRatio) {
                    targetZoom = this.state.photoFrameWidth/photoCanvasMapItem.width;
                    this.state.photoCanvasZoom += (targetZoom - this.state.photoCanvasZoom) * delta;
                } else {
                    targetZoom =this.state.photoFrameHeight/photoCanvasMapItem.height;
                    this.state.photoCanvasZoom += (targetZoom - this.state.photoCanvasZoom) * delta;
                }
                this.state.photoCenterOffset.x *= delta;
                this.state.photoCenterOffset.y *= delta;
                this.state.photoCanvasOffset.x -= (this.state.photoCanvasOffset.x - photoCanvasMapItem.centerX * targetZoom) * delta;
                this.state.photoCanvasOffset.y -= (this.state.photoCanvasOffset.y - photoCanvasMapItem.centerY * targetZoom) * delta;
            }
            this.state.jumpTimeCountdown -= this.props.tick;
        } else {
            if (!this.state.freeMode) {
                if (photoCanvasMapItem.ratio >= this.state.canvasRatio) {
                    this.state.photoCanvasZoom = this.state.photoFrameWidth / photoCanvasMapItem.width;
                } else {
                    this.state.photoCanvasZoom = this.state.photoFrameHeight / photoCanvasMapItem.height;
                }
                this.state.photoCanvasOffset.x = photoCanvasMapItem.centerX * this.state.photoCanvasZoom;
                this.state.photoCanvasOffset.y = photoCanvasMapItem.centerY * this.state.photoCanvasZoom;
            }
        }
    }

    draw() {
        if (this.state.photoCanvas) {
            let ctx = this.refs.canvas.getContext('2d');

            let x, y, width, height;
            x = this.refs.canvas.width / 2 - this.state.photoCanvasOffset.x - this.state.photoCenterOffset.x;
            y = this.refs.canvas.height / 2 - this.state.photoCanvasOffset.y - this.state.photoCenterOffset.y;
            width = this.state.photoCanvas.canvas.width * this.state.photoCanvasZoom;
            height = this.state.photoCanvas.canvas.height * this.state.photoCanvasZoom;

            if (this.props.background) {
                ctx.fillStyle = this.props.background;
                ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
            } else {
                ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
            }
            ctx.drawImage(this.state.photoCanvas.canvas, x, y, width, height);
        }
    }

    goToPhoto(index: number) {
        this.state.freeMode = false;
        this.state.photoCenterOffset = {x: 0, y: 0};
        if (index >= this.props.photos.length) {
            index = 0;
        } else if (index < 0) {
            index = this.props.photos.length - 1;
        }
        this.setState({currentPhotoIndex: index, jumpTimeCountdown: this.props.jumpTime}, () => {
            this.state.photoCanvas.setCurrentPhotoIndex(this.state.currentPhotoIndex);
            this.state.photoCanvas.update();
        });
    }

    nextPhoto() {
        this.goToPhoto(this.state.currentPhotoIndex + 1);
    }

    prevPhoto() {
        this.goToPhoto(this.state.currentPhotoIndex - 1);
    }

    zoom(zoomValue: number) {
        if (zoomValue < 0.01 || zoomValue > 10) return;
        this.state.freeMode = true;
        let photoData = this.state.photoCanvas.photoMap[this.state.currentPhotoIndex];
        this.state.photoCanvasOffset.x = photoData.centerX * zoomValue;
        this.state.photoCanvasOffset.y = photoData.centerY * zoomValue;
        this.state.photoCenterOffset.x *= zoomValue / this.state.photoCanvasZoom;
        this.state.photoCenterOffset.y *= zoomValue / this.state.photoCanvasZoom;
        this.state.photoCanvasZoom = zoomValue;
    }

    getPhotoRect(photoMapItem: any) {
        let x = -this.state.photoCanvasOffset.x - this.state.photoCenterOffset.x + this.refs.canvas.width / 2 + photoMapItem.x * this.state.photoCanvasZoom;
        let y = -this.state.photoCanvasOffset.y - this.state.photoCenterOffset.y  + this.refs.canvas.height / 2 + photoMapItem.y * this.state.photoCanvasZoom;
        let width = photoMapItem.width * this.state.photoCanvasZoom;
        let height = photoMapItem.height * this.state.photoCanvasZoom;
        let visible = (x >= 0 || x + width <= this.state.canvasWidth) && (y >= 0 || y + height <= this.state.canvasHeight);
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
        let delta = e.wheelDelta;
        if (delta > 0) {
            this.zoom(this.state.photoCanvasZoom * 1.05);
        } else {
            this.zoom(this.state.photoCanvasZoom / 1.05);
        }
    }

    handleMouseDown(e: MouseEvent) {
        this.mouseDownPoint = {x: e.clientX, y: e.clientY};
        this.state.photoCanvas.photoMap.forEach((p: any, index: number) => {
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
        this.refs.canvas.style.cursor = 'auto';
    }

    handleMouseMove(e: MouseEvent) {
        if (this.mouseDownPoint) {
            this.refs.canvas.style.cursor = 'move';
            let d = this.state.photoCanvas.photoMap[this.state.currentPhotoIndex];
            let deltaX = this.mouseDownPoint.x - e.clientX;
            let deltaY = this.mouseDownPoint.y - e.clientY;

            // if (d.width * this.state.photoCanvasZoom > this.state.canvasWidth) {
                this.state.photoCenterOffset.x += deltaX;
                this.state.photoCenterOffset.x = Math.sign(this.state.photoCenterOffset.x) * Math.min(Math.abs(this.state.photoCenterOffset.x), 0.4 * d.width * this.state.photoCanvasZoom);
            // }

            // if (d.height * this.state.photoCanvasZoom > this.state.canvasHeight) {
                this.state.photoCenterOffset.y += deltaY;
                this.state.photoCenterOffset.y = Math.sign(this.state.photoCenterOffset.y) * Math.min(Math.abs(this.state.photoCenterOffset.y), 0.4 * d.height * this.state.photoCanvasZoom);
            // }

            this.mouseDownPoint.x = e.clientX;
            this.mouseDownPoint.y = e.clientY;
        } else if (this.state.jumpTimeCountdown == 0) {
            this.refs.canvas.style.cursor = 'auto';
            for (let index = 0; index < this.state.photoCanvas.photoMap.length; index++) {
                let p = this.state.photoCanvas.photoMap[index];
                let rect = this.getPhotoRect(p);
                if (rect.visible && e.clientX >= rect.x && e.clientX <= rect.x + rect.width && e.clientY >= rect.y && e.clientY <= rect.y + rect.height) {
                    this.refs.canvas.style.cursor = 'pointer';
                    this.state.photoCanvas.setHighlightedPhotoIndex(index);
                    this.state.photoCanvas.update();
                    break;
                }
            }
        }

    }

    private getClassName() {
        let className = "awesome_gallery";
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
            this.state.photoCanvas.setIsDesktop(isDesktop);
            this.state.photoCanvas.update();
        });
    }

    componentDidMount() {
        window.clearInterval(this.state.drawProcess);
        this.state.drawProcess = window.setInterval(() => {
            this.update();
            this.draw();
        }, this.props.tick);
        MediaQuerySerice.listen(this.handleMediaQuery);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('wheel', this.handleWeelMouse);
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    componentWillUnmount() {
        window.clearInterval(this.state.drawProcess);
        MediaQuerySerice.unbind(this.handleMediaQuery);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('wheel', this.handleWeelMouse);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
    }

    render() {
        let currentPhoto = this.props.photos.length ? this.props.photos[this.state.currentPhotoIndex] : null;
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

                <canvas draggable={false} width={this.state.canvasWidth} height={this.state.canvasHeight} ref="canvas"/>

                {currentPhoto && currentPhoto.caption ?
                    <div className="awesome_gallery__caption">
                        {currentPhoto.caption}
                    </div> : null
                }
            </div>
        )
    }
}