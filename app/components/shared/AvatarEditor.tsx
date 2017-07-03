import * as React from 'react';
import '../../styles/shared/image_editor.scss';

const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/close.svg?name=CloseIcon');
import {Captions} from '../../constants';

import {ModalAction, CLOSE_MODAL} from '../../actions/shared/ModalAction';
import {UserAction, UPDATE_USER} from '../../actions/user/UserAction';

interface IAvatarEditorPropsInterface {
    image: any;

}

interface  IAvatarEditorStateInterface {
    scale?: number;

    width?: number;
    height?: number;
    border?: number;

    offsetX?: number;
    offsetY?: number;

    downX?: number;
    downY?: number;
    isDown?: boolean;

    posX?: number,
    posY?: number,

    drawWidth?: number;
    drawHeight?: number;

    isUploading?: boolean;

    filter?: string;

}

export default class AvatarEditor extends React.Component<IAvatarEditorPropsInterface, IAvatarEditorStateInterface> {

    DEFAULT_WIDTH: number = 400;
    DEFAULT_HEIGHT: number = 400;
    DEFAULT_BORDER: number = 5;

    FILTER_DEFAULT: string = 'default';
    FILTER_GRAY_SCALE: string = 'gray_scale';
    FILTER_SEPIA: string = 'sepia';
    FILTER_INVERT: string = 'invert';

    FILTERS: string[] = [this.FILTER_DEFAULT, this.FILTER_GRAY_SCALE, this.FILTER_SEPIA, this.FILTER_INVERT];


    refs: {
        canvas: HTMLCanvasElement;
        canvas2: HTMLCanvasElement;
    };

    constructor() {
        super();

        this.state = {
            scale: 1, offsetX: 0, offsetY: 0, isDown: false, posX: 0, posY: 0, width: this.DEFAULT_WIDTH,
            height: this.DEFAULT_HEIGHT, border: this.DEFAULT_BORDER, isUploading: false, filter: this.FILTER_DEFAULT
        };
        this.renderImage = this.renderImage.bind(this);
        this.scaleChange = this.scaleChange.bind(this);
        this.move = this.move.bind(this);
        this.startDown = this.startDown.bind(this);
        this.endDown = this.endDown.bind(this);
        this.__setOffset = this.__setOffset.bind(this);
        this.resizeHandler = this.resizeHandler.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.uploadAvatar = this.uploadAvatar.bind(this);
    }

    getCoordinates(e: any): {pageX: number, pageY: number} {
        return {
            pageX: (e.touches && e.touches[0]) ? e.touches[0].pageX : e.pageX,
            pageY: (e.touches && e.touches[0]) ? e.touches[0].pageY : e.pageY,

        }
    }

    startDown(e: any) {
        if (this.state.isUploading) return;
        let coords = this.getCoordinates(e);
        this.setState({
            downX: coords.pageX - this.refs.canvas.offsetLeft,
            downY: coords.pageY - this.refs.canvas.offsetTop,
            isDown: true,
        });
    }

    endDown(e: any) {
        if (this.state.isUploading) return;
        this.setState({
            posX: this.state.offsetX,
            posY: this.state.offsetY,
            isDown: false
        });
    }

    move(e: any) {
        if (this.state.isUploading) return;
        if (!this.state.isDown) return;
        let coords = this.getCoordinates(e);
        let offsetX = this.state.posX + (this.state.downX - (coords.pageX - this.refs.canvas.offsetLeft));
        let offsetY = this.state.posY + (this.state.downY - (coords.pageY - this.refs.canvas.offsetTop));
        this.__setOffset(offsetX, offsetY);
    }

    scaleChange(e: any) {
        if (this.state.isUploading) return;
        this.setState({scale: Number(e.target.value)}, () => {this.__setOffset()});
    }

    __setOffset(offsetX?: number, offsetY?: number) {
        offsetX = offsetX || this.state.offsetX;
        offsetY = offsetY || this.state.offsetY;

        if (offsetX > (this.state.drawWidth * this.state.scale - this.refs.canvas.width) ) {
            offsetX = this.state.drawWidth * this.state.scale - this.refs.canvas.width;
        }

        if (offsetX < 0) { offsetX = 0; }

        if (offsetY > (this.state.drawHeight * this.state.scale - this.refs.canvas.height)) {
            offsetY = this.state.drawHeight * this.state.scale - this.refs.canvas.height;
        }

        if (offsetY < 0) { offsetY = 0; }

        this.setState({
            offsetX: offsetX,
            offsetY: offsetY,
        }, () => {this.renderImage()});

    }

    renderImage() {
        let ctx = this.refs.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        ctx.drawImage(this.props.image, -this.state.offsetX, -this.state.offsetY,
            this.state.drawWidth * this.state.scale, this.state.drawHeight * this.state.scale);


        let ctx2 = this.refs.canvas2.getContext('2d');
        ctx2.clearRect(0, 0, this.refs.canvas2.width, this.refs.canvas2.height);

        ctx2.drawImage(this.refs.canvas, this.state.border, this.state.border, this.refs.canvas2.width, this.refs.canvas2.height, 0, 0,
            this.refs.canvas2.width, this.refs.canvas2.height);

        if (this.state.filter && this.state.filter != this.FILTER_DEFAULT) {
            let imageData = ctx2.getImageData(0, 0, this.refs.canvas2.width, this.refs.canvas2.height);
            let filteredData = this.__filterData(imageData);
            ctx2.putImageData(filteredData, 0, 0);
        }
    }

    private __filterData(imageData: ImageData): ImageData {

        switch (this.state.filter) {
            case this.FILTER_GRAY_SCALE: {
                return this.__filterGrayScale(imageData);
            }
            case this.FILTER_SEPIA: {
                return this.__filterSepia(imageData);
            }
            case this.FILTER_INVERT: {
                return this.__filterInvert(imageData);
            }
        }
        return imageData
    }

    private __filterSepia(imageData: ImageData): ImageData {
        let pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
            pixels[i]     = (r * 0.393)+(g * 0.769)+(b * 0.189); // red
            pixels[i + 1] = (r * 0.349)+(g * 0.686)+(b * 0.168); // green
            pixels[i + 2] = (r * 0.272)+(g * 0.534)+(b * 0.131); // blue
          }
        return imageData;
    }

    private __filterGrayScale(imageData: ImageData): ImageData {
        let pixels = imageData.data;
        for (let i=0; i< pixels.length; i+=4) {
            var r = pixels[i];
            var g = pixels[i+1];
            var b = pixels[i+2];
            let v = 0.2126*r + 0.7152*g + 0.0722*b;
            pixels[i] = pixels[i+1] = pixels[i+2] = v;
        }
        return imageData;
    }

    private __filterInvert(imageData: ImageData): ImageData {
        let pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255-pixels[i];
            pixels[i+1] = 255-pixels[i+1];
            pixels[i+2] = 255-pixels[i+2];
            // pixels[i+3] = pixels[i+3];
        }

        return imageData;
    }

    resizeHandler() {
        let parent = this.refs.canvas.getBoundingClientRect();
        this.refs.canvas2.style.top = (parent.top + this.state.border) + 'px';
        this.refs.canvas2.style.left = (parent.left + this.state.border) + 'px';
        this.refs.canvas2.style.width = (parent.width - this.state.border * 2) + 'px';
        this.refs.canvas2.style.height = (parent.height - this.state.border * 2) + 'px';
        this.refs.canvas2.style.maxWidth = (parent.width - this.state.border * 2) + 'px';
        this.refs.canvas2.style.maxHeight = (parent.height - this.state.border * 2) + 'px';
    }

    closeModal() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    uploadAvatar() {
        if (this.state.isUploading) return;
        this.setState({isUploading: true}, () => {
            let imageUrl = this.refs.canvas2.toDataURL('image/jpeg');
            let byteString = window.atob(imageUrl.split(',')[1]);
            let ab = new ArrayBuffer(byteString.length);
            let ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            let file = new Blob([ia], {type: 'image/jpeg'});
            let fd = new FormData();
            fd.append('avatar', file);
            UserAction.doAsync(UPDATE_USER, fd).then(() => {
                this.closeModal();
            }).catch(() => {this.setState({ isUploading: false })});
        });


    }

    componentDidMount() {

        let drawWidth;
        let drawHeight;
        let image = this.props.image;
        let aspectRatio = image.width / image.height;

        if (aspectRatio > 1) {
            drawHeight = this.refs.canvas.height;
            drawWidth = drawHeight * aspectRatio;
        }
        else {
            drawWidth = this.refs.canvas.width;
            drawHeight = drawWidth / aspectRatio;
        }

        let offsetX = Math.abs(drawWidth - this.refs.canvas.width)/2;
        let offsetY = Math.abs(drawHeight - this.refs.canvas.height)/2;

        this.setState({
            drawWidth: drawWidth, drawHeight: drawHeight, offsetX: offsetX, offsetY: offsetY, posX: offsetX, posY: offsetY
        }, () => {
            this.renderImage();
        });

        this.resizeHandler();

        window.addEventListener('resize', this.resizeHandler);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
    }

    render() {

        return (
            <div className="image_editor">
                <div className="image_editor__top">
                    <div onClick={this.closeModal}><CloseIcon /></div>
                </div>
                <div className="image_editor__canvas_container">
                    <canvas width={this.state.width} height={this.state.height}
                            className="canvas"
                            ref="canvas" />

                    <canvas onMouseMove={this.move}
                            onMouseDown={this.startDown}
                            onMouseUp={this.endDown}
                            onMouseLeave={this.endDown}
                            onTouchStart={this.startDown}
                            onTouchEnd={this.endDown}
                            onTouchMove={this.move}
                            ref="canvas2"
                            className="canvas2"
                            width={this.state.width - (this.state.border * 2)}
                            height={this.state.height - (this.state.border * 2)}/>
                </div>

                <div className="image_editor__controls">
                    <input type="range" min="1" max="3" step="0.1" value={ this.state.scale } onChange={this.scaleChange} />

                </div>
                <div className="image_editor__bottom">
                    <div onClick={this.uploadAvatar}
                         className={this.state.isUploading ? 'saving' : ''}>{Captions.management.avatarSave}</div>
                </div>

            </div>);
    }
}