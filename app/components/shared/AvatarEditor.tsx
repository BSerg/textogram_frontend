import * as React from 'react';

interface IAvatarEditorPropsInterface {
    image: any;

}

interface  IAvatarEditorStateInterface {
    scale?: number;
    offsetX?: number;
    offsetY?: number;

    downX?: number;
    downY?: number;
    isDown?: boolean;

    posX?: number,
    posY?: number,

    drawWidth?: number;
    drawHeight?: number;

}

export default class AvatarEditor extends React.Component<IAvatarEditorPropsInterface, IAvatarEditorStateInterface> {

    refs: {
        canvas: HTMLCanvasElement;
    };

    constructor() {
        super();

        this.state = { scale: 1, offsetX: 0, offsetY: 0, isDown: false, posX: 0, posY: 0 };
        this.renderImage = this.renderImage.bind(this);
        this.scaleChange = this.scaleChange.bind(this);
        this.move = this.move.bind(this);
        this.startDown = this.startDown.bind(this);
        this.endDown = this.endDown.bind(this);
        this.setOffset = this.setOffset.bind(this);
    }

    startDown(e: any) {
        this.setState({
            downX: e.pageX - this.refs.canvas.offsetLeft,
            downY: e.pageY - this.refs.canvas.offsetTop,
            isDown: true,
        });
    }

    endDown(e: any) {
        this.setState({
            posX: this.state.offsetX,
            posY: this.state.offsetY,
            isDown: false
        });
    }

    move(e: any) {
        if (!this.state.isDown) return;
        let offsetX = this.state.posX + (this.state.downX - (e.pageX - this.refs.canvas.offsetLeft));
        let offsetY = this.state.posY + (this.state.downY - (e.pageY - this.refs.canvas.offsetTop));
        this.setOffset(offsetX, offsetY);
    }

    scaleChange(e: any) {
        this.setState({scale: Number(e.target.value)}, () => {this.setOffset()});
    }

    setOffset(offsetX?: number, offsetY?: number) {
        offsetX = offsetX || this.state.offsetX;
        offsetY = offsetY || this.state.offsetY;

        if (offsetX > (this.state.drawWidth * this.state.scale - this.refs.canvas.width) ) {
            offsetX = this.state.drawWidth * this.state.scale - this.refs.canvas.width;
        }

        if (offsetX < 0) {
            offsetX = 0;
        }

        if (offsetY > (this.state.drawHeight * this.state.scale - this.refs.canvas.height)) {
            offsetY = this.state.drawHeight * this.state.scale - this.refs.canvas.height;
        }

        if (offsetY < 0) {
            offsetY = 0;
        }

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

        this.setState({drawWidth: drawWidth, drawHeight: drawHeight}, () => {
            this.renderImage();
        });
    }

    render() {

        return (
            <div>
                <div style={ {padding: '30px' } }>
                    <canvas onMouseMove={this.move}
                            onMouseDown={this.startDown}
                            onMouseUp={this.endDown}
                        style={{width: '100%'}}
                        width={500} height={500}
                        ref="canvas" />
                </div>
                <div>
                    <input type="range" min="1" max="2" step="0.1" value={ this.state.scale } onChange={this.scaleChange} />

                </div>

            </div>);
    }
}