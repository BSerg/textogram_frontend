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

interface IState {
    image?: IImage
    imageObject?: HTMLImageElement
    canvasCtx?: CanvasRenderingContext2D
    width?: number
    height?: number
    dragInitPoint?: {x: number, y: number}
    dragProcess?: boolean

    zoomValue?: number
}

export default class ImageEditorRefactored extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            image: this.props.image,
            width: this.props.width,
            height: this.props.height,
            dragProcess: false,
        };
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
        let canvasAspectRatio = this.state.width / this.state.height;

        // fit size
        if (aspectRatio >= canvasAspectRatio) {
            _image.height = this.state.height;
            _image.width = aspectRatio * _image.height;
        } else {
            _image.width = this.state.width;
            _image.height = _image.width / aspectRatio;
        }

        // fix offset
        let _image_x = this.state.width / 2 + _image.offset_x - _image.width * _image.zoom / 2;
        let _image_y = this.state.height / 2 + _image.offset_y - _image.height * _image.zoom / 2;
        if (_image_x > 0) _image.offset_x = _image.width * _image.zoom / 2 - this.state.width / 2;
        if (_image_x + _image.width * _image.zoom < this.state.width) {
            _image.offset_x = this.state.width / 2 - _image.width * _image.zoom / 2;
        }
        if (_image_y > 0) _image.offset_y = _image.height * _image.zoom / 2 - this.state.height / 2;
        if (_image_y + _image.height * _image.zoom < this.state.height) {
            _image.offset_y = this.state.height / 2 - _image.height * _image.zoom / 2;
        }
        return _image
    }

    handleZoom() {
        let zoomValue = (parseInt(this.refs.zoomInput.value) * (this.props.maxZoom - 1)/10 + 1);
        let dZoom = zoomValue - this.state.image.zoom;
        console.log(dZoom);
        this.state.image.offset_x += this.state.image.offset_x / 2 * dZoom;
        this.state.image.offset_y += this.state.image.offset_y / 2 * dZoom;
        this.state.image.zoom = zoomValue;
        this.setState({image: this.fitImage(this.state.image)}, () => {
            this.drawImage();
            this.props.onChange && this.props.onChange(this.state.image, this._getBase64Image());
        });
    }

    handleMouseDown(e: Event) {
        if (!this.props.enableDrag) return;
        let dragPoint = {x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY};
        if (!this.state.dragProcess) {
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
        if (this.state.dragProcess) {
            this.setState({
                dragProcess: false,
                image: this.state.image,
                imageObject: this.state.imageObject,
                dragInitPoint: this.state.dragInitPoint
            }, () => {
                document.removeEventListener('mousemove', this.handleMouseMove);
                document.removeEventListener('mouseup', this.handleMouseUp);
                this.props.onChange && this.props.onChange(this.state.image, this._getBase64Image());
            });
        }
    }

    handleMouseMove(e: Event) {
        if (this.state.dragInitPoint) {
            let dX = (e as MouseEvent).clientX - this.state.dragInitPoint.x;
            let dY = (e as MouseEvent).clientY - this.state.dragInitPoint.y;
            this.state.dragInitPoint = {x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY};
            this.state.image.offset_x += dX;
            this.state.image.offset_y += dY;
            if (this.state.image.position_x > 0) {this.state.image.position_x = 0}
            if (this.state.image.position_x + this.state.image.image_width < this.state.width) {
                this.state.image.position_x = this.state.width - this.state.image.image_width;
            }
            if (this.state.image.position_y > 0) {this.state.image.position_y = 0}
            if (this.state.image.position_y + this.state.image.image_height < this.state.height) {
                this.state.image.position_y = this.state.height - this.state.image.image_height;
            }
            this.drawImage();
            this.props.onChange && this.props.onChange(this.state.image, this._getBase64Image());
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
        tempCanvas.width = this.state.width;
        tempCanvas.height = this.state.height;
        let ctx = tempCanvas.getContext('2d');
        let x = this.state.width / 2 + this.state.image.offset_x - this.state.image.width * this.state.image.zoom / 2,
            y = this.state.height / 2 + this.state.image.offset_y - this.state.image.height * this.state.image.zoom / 2,
            width = this.state.image.width * this.state.image.zoom,
            height = this.state.image.height * this.state.image.zoom;
        ctx.drawImage(this.state.imageObject, x, y, width, height);
        return tempCanvas.toDataURL();
    }

    private _drawImage(img: HTMLImageElement) {
        let x = this.state.width / 2 + this.state.image.offset_x - this.state.image.width * this.state.image.zoom / 2,
            y = this.state.height / 2 + this.state.image.offset_y - this.state.image.height * this.state.image.zoom / 2,
            width = this.state.image.width * this.state.image.zoom,
            height = this.state.image.height * this.state.image.zoom;

        this.state.canvasCtx.clearRect(0, 0, this.state.width, this.state.height);
        this.state.canvasCtx.drawImage(img, x, y, width, height);
        this.state.canvasCtx.fillStyle = this.props.foregroundColor;
        this.state.canvasCtx.fillRect(0, 0, this.state.width, this.state.height);
    }

    private drawImage() {
        if (!this.state.imageObject) {
            let image = new Image();
            image.onload = () => {
                this.state.imageObject = image;
                this.state.image.width = image.width;
                this.state.image.height = image.height;
                this.state.image = this.fitImage(this.state.image);
                this._drawImage(image);
            };
            image.src = this.state.image.image;
        } else {
            this.state.image = this.fitImage(this.state.image);
            this._drawImage(this.state.imageObject);
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
                zoomValue: 1
            }, () => {
                this.drawImage();
            });
        }
    }

    render() {
        return (
            <div className="image_editor_alt">
                <canvas ref="canvas"
                        width={this.state.width}
                        height={this.state.height}
                        onMouseDown={this.handleMouseDown.bind(this)}/>
                {this.props.enableZoom ?
                    <div className="image_editor_alt__control"
                         style={{width: this.state.height - 60 + 'px', right: -this.state.height / 2 + 200 + 'px'}}>
                        <input type="range" min="0" max="10" step="1"
                               ref="zoomInput"
                               value={(this.state.image.zoom - 1) * 10}
                               onChange={this.handleZoom.bind(this)}/>
                    </div> : null
                }
            </div>
        )
    }
}