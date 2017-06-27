import * as React from 'react';
import '../../styles/shared/image_editor_alt.scss';

interface IImage {
    id: number
    image: string
    width?: number;
    height?: number;
    offset_x?: number;
    offset_y?: number;
    zoom?: number;

    position_x?: number
    position_y?: number
    image_width?: number
    image_height?: number
}

interface IProps {
    image: IImage
    enableZoom?: boolean
    enableDrag?: boolean
    foregroundColor?: string
    width: number
    height: number
    maxZoom?: number
    onChange?: (image: IImage, imageBase64?: string) => any
}

export default class ImageEditorRefactored extends React.Component<IProps, any> {
    image: IImage;
    imageObject: HTMLImageElement;
    canvasCtx: CanvasRenderingContext2D;
    width: number;
    height: number;
    dragInitPoint: {x: number, y: number};
    dragProcess: boolean;
    zoomValue: number;

    constructor(props: any) {
        super(props);
        this.image = this.props.image;
        this.width = this.props.width;
        this.height = this.props.height;
        this.dragProcess = false;
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
    }

    static defaultProps = {
        enableZoom: true,
        enableDrag: true,
        foregroundColor: 'rgba(0, 0, 0, 0.5)',
        maxZoom: 2,
    };

    refs: {
        canvas: HTMLCanvasElement,
        zoomInput: HTMLInputElement
    };

    fitImage(image: IImage) {
        let _image = Object.assign({offset_x: 0, offset_y: 0, zoom: 1}, image);
        _image.zoom = Math.max(1, _image.zoom);
        _image.zoom = Math.min(this.props.maxZoom, _image.zoom);
        let aspectRatio = _image.width / _image.height;
        let canvasAspectRatio = this.width / this.height;

        // fit size
        if (aspectRatio >= canvasAspectRatio) {
            _image.height = this.height;
            _image.width = aspectRatio * _image.height;
        } else {
            _image.width = this.width;
            _image.height = _image.width / aspectRatio;
        }

        // fix offset
        let _image_real_width = _image.width * _image.zoom;
        let _image_real_height = _image.height * _image.zoom;

        let _image_x = this.width / 2 + _image.offset_x - _image_real_width / 2;
        let _image_y = this.height / 2 + _image.offset_y - _image_real_height / 2;
        if (_image_x > 0) _image.offset_x = _image_real_width / 2 - this.width / 2;
        if (_image_x + _image_real_width < this.width) {
            _image.offset_x = this.width / 2 - _image_real_width / 2;
        }
        if (_image_y > 0) _image.offset_y = _image_real_height / 2 - this.height / 2;
        if (_image_y + _image_real_height < this.height) {
            _image.offset_y = this.height / 2 - _image_real_height / 2;
        }
        return _image
    }

    handleZoom() {
        let zoomValue = (parseInt(this.refs.zoomInput.value) * (this.props.maxZoom - 1)/10 + 1);
        let dZoom = zoomValue - this.image.zoom;
        this.image.offset_x += this.image.offset_x / 2 * dZoom;
        this.image.offset_y += this.image.offset_y / 2 * dZoom;
        this.image.zoom = zoomValue;
        this.setState({image: this.fitImage(this.image)}, () => {
            this.drawImage();
            this.props.onChange && this.props.onChange(this.image, this._getBase64Image());
        });
    }

    handleMouseDown(e: Event) {
        if (!this.props.enableDrag) return;
        let dragPoint = {x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY};
        if (!this.dragProcess) {
            this.setState({
                dragProcess: true,
                dragInitPoint: dragPoint
            }, () => {
                document.addEventListener('mousemove', this.handleMouseMove);
                document.addEventListener('mouseup', this.handleMouseUp);
            });
        }
    }

    handleMouseUp(e: Event) {
        if (this.dragProcess) {
            this.setState({
                dragProcess: false,
                image: this.image,
                imageObject: this.imageObject,
                dragInitPoint: this.dragInitPoint
            }, () => {
                document.removeEventListener('mousemove', this.handleMouseMove);
                document.removeEventListener('mouseup', this.handleMouseUp);
                this.props.onChange && this.props.onChange(this.image, this._getBase64Image());
            });
        }
    }

    handleMouseMove(e: Event) {
        if (this.dragInitPoint) {
            let dX = (e as MouseEvent).clientX - this.dragInitPoint.x;
            let dY = (e as MouseEvent).clientY - this.dragInitPoint.y;
            this.dragInitPoint = {x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY};
            this.image.offset_x += dX;
            this.image.offset_y += dY;
            this.drawImage();
        }
    }

    handleTouch(e: TouchEvent) {
        let touch = e.changedTouches[0];
        let eventMap: any = {
            touchstart: "mousedown",
            touchmove: "mousemove",
            touchend: "mouseup"
        };
        let simulatedEvent: any = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(
            eventMap[e.type], true, true, window, 1, touch.screenX, touch.screenY,
            touch.clientX, touch.clientY, false, false, false, false, 0, null
        );
        touch.target.dispatchEvent(simulatedEvent);
        e.preventDefault();
        e.stopPropagation();
    }

    private _getBase64Image() {
        let tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.width;
        tempCanvas.height = this.height;
        let ctx = tempCanvas.getContext('2d');
        let x = this.width / 2 + this.image.offset_x - this.image.width * this.image.zoom / 2,
            y = this.height / 2 + this.image.offset_y - this.image.height * this.image.zoom / 2,
            width = this.image.width * this.image.zoom,
            height = this.image.height * this.image.zoom;
        ctx.drawImage(this.imageObject, x, y, width, height);
        return tempCanvas.toDataURL();
    }

    private _drawImage(img: HTMLImageElement) {
        let x = this.width / 2 + this.image.offset_x - this.image.width * this.image.zoom / 2,
            y = this.height / 2 + this.image.offset_y - this.image.height * this.image.zoom / 2,
            width = this.image.width * this.image.zoom,
            height = this.image.height * this.image.zoom;

        this.canvasCtx.clearRect(0, 0, this.width, this.height);
        this.canvasCtx.drawImage(img, x, y, width, height);
        this.canvasCtx.fillStyle = this.props.foregroundColor;
        this.canvasCtx.fillRect(0, 0, this.width, this.height);
    }

    private drawImage() {
        if (!this.imageObject) {
            let image = new Image();
            image.onload = () => {
                this.imageObject = image;
                this.image.width = image.width;
                this.image.height = image.height;
                this.image = this.fitImage(this.image);
                this._drawImage(image);
            };
            image.crossOrigin = 'anonymous';
            image.src = this.image.image + '?_=' + new Date().getTime();
        } else {
            this.image = this.fitImage(this.image);
            this._drawImage(this.imageObject);
        }
    }

    initCanvas() {
        let ctx = this.refs.canvas.getContext('2d');
        this.setState({canvasCtx: ctx}, () => {
            this.drawImage();
        });
    }

    componentDidMount() {
        document.addEventListener("touchstart", this.handleTouch, true);
        document.addEventListener("touchmove", this.handleTouch, true);
        document.addEventListener("touchend", this.handleTouch, true);
        document.addEventListener("touchcancel", this.handleTouch, true);
        this.initCanvas();
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener("touchstart", this.handleTouch, true);
        document.removeEventListener("touchmove", this.handleTouch, true);
        document.removeEventListener("touchend", this.handleTouch, true);
        document.removeEventListener("touchcancel", this.handleTouch, true);
    }

    componentWillReceiveProps(nextProps: IProps) {
        if (nextProps != this.props) {
            this.setState({
                image: nextProps.image,
                width: nextProps.width,
                height: nextProps.height,
            }, () => {
                this.drawImage();
            });
        }
    }

    render() {
        return (
            <div className="image_editor_alt">
                <canvas ref="canvas"
                        width={this.width}
                        height={this.height}
                        onMouseDown={this.handleMouseDown.bind(this)}/>
                {this.props.enableZoom ?
                    <div className="image_editor_alt__control"
                         style={{width: this.height - 60 + 'px', right: -this.height / 2 + 200 + 'px'}}>
                        <input type="range" min="0" max="10" step="1"
                               ref="zoomInput"
                               value={(this.image.zoom - 1) * 10}
                               onChange={this.handleZoom.bind(this)}/>
                    </div> : null
                }
            </div>
        )
    }
}