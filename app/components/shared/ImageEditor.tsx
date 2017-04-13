import * as React from 'react';
import '../../styles/shared/image_editor_alt.scss';

interface IImage {
    id: number
    image: string
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
    zoomValue?: number
    dragInitPoint?: {x: number, y: number}
    dragProcess?: boolean
}

export default class ImageEditor extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            image: this.props.image,
            width: this.props.width,
            height: this.props.height,
            dragProcess: false,
            zoomValue: 1
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
        maxZoom: 2
    };

    refs: {
        canvas: HTMLCanvasElement,
        zoomInput: HTMLInputElement
    };

    private round(value: number, precision: number): number {
        var factor = Math.pow(10, precision);
        var tempNumber = value * factor;
        var roundedTempNumber = Math.round(tempNumber);
        return roundedTempNumber / factor;
    }

    zoom2image(zoom: number): IImage {
        let dZoom = (zoom - this.state.zoomValue) / this.state.zoomValue;
        let im = Object.assign({}, this.state.image);
        let dWidth = im.image_width * dZoom;
        im.image_width += dWidth;
        let dHeight = im.image_height * dZoom;
        im.image_height += dHeight;
        im.position_x -= dWidth/2;
        if (im.position_x > 0) im.position_x = 0;
        if (im.position_x + im.image_width < this.state.width) im.position_x = this.state.width - im.image_width;
        im.position_y -= dHeight/2;
        if (im.position_y > 0) im.position_y = 0;
        if (im.position_y + im.image_height < this.state.height) im.position_y = this.state.height - im.image_height;
        return im;
    }

    image2zoom(image?: IImage): number {
        let im = image || this.state.image;
        let aspectRatio = im.image_width / im.image_height;
        let canvasAspectRatio = this.state.width / this.state.height;
        if (im.image_width != null) {
            if (aspectRatio >= canvasAspectRatio) {
                return im.image_height / this.state.height;
            } else {
                return im.image_width / this.state.width;
            }
        } else {
            return 1;
        }
    }

    handleZoom() {
        let zoomValue = (parseInt(this.refs.zoomInput.value) * (this.props.maxZoom - 1)/100 + 1);
        this.setState({zoomValue: zoomValue, image: this.zoom2image(zoomValue)}, () => {
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
            this.state.image.position_x += dX;
            this.state.image.position_y += dY;
            if (this.state.image.position_x > 0) {this.state.image.position_x = 0}
            if (this.state.image.position_x + this.state.image.image_width < this.state.width) {
                this.state.image.position_x = this.state.width - this.state.image.image_width;
            }
            if (this.state.image.position_y > 0) {this.state.image.position_y = 0}
            if (this.state.image.position_y + this.state.image.image_height < this.state.height) {
                this.state.image.position_y = this.state.height - this.state.image.image_height;
            }
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
        tempCanvas.width = this.state.width;
        tempCanvas.height = this.state.height;
        let ctx = tempCanvas.getContext('2d');
        ctx.drawImage(
            this.state.imageObject,
            this.state.image.position_x,
            this.state.image.position_y,
            this.state.image.image_width,
            this.state.image.image_height
        );
        return tempCanvas.toDataURL();
    }

    private _drawImage(img: HTMLImageElement) {
        let x = this.state.image.position_x,
            y = this.state.image.position_y,
            width = this.state.image.image_width,
            height = this.state.image.image_height;

        if (x == null || y == null || !width || !height) {
            let aspectRatio = img.width / img.height;
            if (aspectRatio >= this.state.width / this.state.height) {
                height = this.state.height;
                width = aspectRatio * height;
                x = (this.state.width - width) / 2;
                y = 0;
            } else {
                width = this.state.width;
                height = width / aspectRatio;
                x = 0;
                y = (this.state.height - height) / 2;
            }
            this.state.image.position_x = x;
            this.state.image.position_y = y;
            this.state.image.image_width = width;
            this.state.image.image_height = height;
        }
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
                this._drawImage(image);
                this.state.zoomValue = this.image2zoom();
                this.setState({zoomValue: this.state.zoomValue});
            };
            image.src = this.state.image.image;
        } else {
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
                        <input type="range" min="0" max="100" step="1"
                               ref="zoomInput"
                               value={(this.state.zoomValue - 1) * 100}
                               onChange={this.handleZoom.bind(this)}/>
                    </div> : null
                }
            </div>
        )
    }
}