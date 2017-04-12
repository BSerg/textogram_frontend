import * as React from 'react';
import '../../styles/shared/image_editor_simple.scss';


interface IProps {
    image: HTMLImageElement;
    enableZoom?: boolean;
    foregroundColor?: string;
    foregroundShape?: string;
    width: number;
    height: number;
    maxZoom?: number;
    onChange?: (imageBase64?: string) => any;
}

interface IState {
    positionX?: number;
    positionY?: number;
    imageWidth?: number;
    imageHeight?: number;
    canvasCtx?: CanvasRenderingContext2D
    zoomValue?: number
    dragInitPoint?: {x: number, y: number}
    dragProcess?: boolean
}

export default class ImageEditorSimple extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
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
        foregroundColor: 'rgba(0, 0, 0, 0.5)',
        foregroundShape: 'none',
        maxZoom: 2
    };

    refs: {
        canvas: HTMLCanvasElement,
        zoomInput: HTMLInputElement
    };

    translateParams() {
        let width = this.state.imageWidth * this.state.zoomValue;
        let height = this.state.imageHeight * this.state.zoomValue;
        let x = this.state.positionX - (width - this.state.imageWidth) / 2;
        let y = this.state.positionY - (height - this.state.imageHeight) / 2;
        console.log(x, y, width, height);
        return {x: x, y: y, width: width, height: height};
    }

    handleZoom() {
        let zoom = (parseInt(this.refs.zoomInput.value) * (this.props.maxZoom - 1)/10 + 1);
        let dZoom = (zoom - this.state.zoomValue) / this.state.zoomValue;
        let dWidth = this.state.imageWidth * dZoom;
        this.state.imageWidth += dWidth;
        let dHeight = this.state.imageHeight * dZoom;
        this.state.imageHeight += dHeight;
        this.state.positionX -= dWidth/2;
        if (this.state.positionX > 0) this.state.positionX = 0;
        if (this.state.positionX + this.state.imageWidth < this.props.width) {
            this.state.positionX = this.props.width - this.state.imageWidth;
        }
        this.state.positionY -= dHeight/2;
        if (this.state.positionY > 0) this.state.positionY = 0;
        if (this.state.positionY + this.state.imageHeight < this.props.height) {
            this.state.positionY = this.props.height - this.state.imageHeight;
        }
        this.state.zoomValue = zoom;
        this.setState(this.state, () => {
            this.drawImage();
        });
    }

    handleMouseDown(e: Event) {
        let dragPoint = {x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY};
        if (!this.state.dragProcess) {
            this.setState({
                dragProcess: true,
                dragInitPoint: dragPoint
            });
        }
    }

    handleMouseUp(e: Event) {
        if (this.state.dragProcess) {
            this.setState({
                dragProcess: false,
                dragInitPoint: this.state.dragInitPoint
            });
        }
    }

    handleMouseMove(e: Event) {
        if (this.state.dragInitPoint && this.state.dragProcess) {
            let dX = (e as MouseEvent).clientX - this.state.dragInitPoint.x;
            let dY = (e as MouseEvent).clientY - this.state.dragInitPoint.y;
            this.state.dragInitPoint = {x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY};

            this.state.positionX += dX;
            this.state.positionY += dY;
            if (this.state.positionX > 0) {this.state.positionX = 0}
            if (this.state.positionX + this.state.imageWidth < this.props.width) {
                this.state.positionX = this.props.width - this.state.imageWidth;
            }
            if (this.state.positionY > 0) {this.state.positionY = 0}
            if (this.state.positionY + this.state.imageHeight < this.props.height) {
                this.state.positionY = this.props.height - this.state.imageHeight;
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
        tempCanvas.width = this.props.width;
        tempCanvas.height = this.props.height;
        let ctx = tempCanvas.getContext('2d');
        ctx.drawImage(
            this.props.image,
            this.state.positionX,
            this.state.positionY,
            this.state.imageWidth,
            this.state.imageHeight
        );
        return tempCanvas.toDataURL();
    }

    drawImage() {
        this.state.canvasCtx.clearRect(0, 0, this.props.width, this.props.height);
        this.state.canvasCtx.drawImage(
            this.props.image, this.state.positionX, this.state.positionY,
            this.state.imageWidth, this.state.imageHeight
        );
        switch (this.props.foregroundShape) {
            case 'circle':
                this.state.canvasCtx.fillStyle = this.props.foregroundColor;
                this.state.canvasCtx.beginPath();
                this.state.canvasCtx.arc(
                    this.props.width / 2,
                    this.props.height / 2,
                    Math.min(this.props.width, this.props.height) / 2,
                    0,
                    2 * Math.PI
                );
                this.state.canvasCtx.rect(this.props.width, 0, -this.props.width, this.props.height);
                this.state.canvasCtx.fill();
                break;
            case 'fill':
                this.state.canvasCtx.fillStyle = this.props.foregroundColor;
                this.state.canvasCtx.fillRect(0, 0, this.props.width, this.props.height);
                break;
        }
        this.props.onChange && this.props.onChange(this._getBase64Image());
    }

    initDrawImage() {
        let x, y, width, height;
        let aspectRatio = this.props.image.width / this.props.image.height;
        if (aspectRatio >= this.props.width / this.props.height) {
            height = this.props.height;
            width = aspectRatio * height;
            x = (this.props.width - width) / 2;
            y = 0;
        } else {
            width = this.props.width;
            height = width / aspectRatio;
            x = 0;
            y = (this.props.height - height) / 2;
        }
        this.state.positionX = x;
        this.state.positionY = y;
        this.state.imageWidth = width;
        this.state.imageHeight = height;
        this.drawImage();
    }

    initCanvas() {
        let ctx = this.refs.canvas.getContext('2d');
        this.setState({canvasCtx: ctx}, () => {
            this.initDrawImage();
        });
    }

    componentDidMount() {
        this.refs.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.refs.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.refs.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.refs.canvas.addEventListener("touchstart", this.handleTouch, true);
        this.refs.canvas.addEventListener("touchmove", this.handleTouch, true);
        this.refs.canvas.addEventListener("touchend", this.handleTouch, true);
        this.refs.canvas.addEventListener("touchcancel", this.handleTouch, true);
        this.initCanvas();
    }

    componentWillUnmount() {
        this.refs.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.refs.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.refs.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.refs.canvas.removeEventListener("touchstart", this.handleTouch, true);
        this.refs.canvas.removeEventListener("touchmove", this.handleTouch, true);
        this.refs.canvas.removeEventListener("touchend", this.handleTouch, true);
        this.refs.canvas.removeEventListener("touchcancel", this.handleTouch, true);
    }

    render() {
        return (
            <div className="image_editor_simple">
                <canvas ref="canvas"
                        width={this.props.width}
                        height={this.props.height}
                        onMouseDown={this.handleMouseDown.bind(this)}/>
                {this.props.enableZoom ?
                    <div className="image_editor_simple__control">
                        <input type="range" min="0" max="10" step="1"
                               ref="zoomInput"
                               value={(this.state.zoomValue - 1) * 10}
                               onChange={this.handleZoom.bind(this)}/>
                    </div> : null
                }
            </div>
        )
    }
}