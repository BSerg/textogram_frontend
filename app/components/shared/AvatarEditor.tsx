import * as React from 'react';

interface IAvatarEditorPropsInterface {
    image: any;

}

export default class AvatarEditor extends React.Component<IAvatarEditorPropsInterface, any> {

    refs: {
        canvas: HTMLCanvasElement;
    };

    constructor() {
        super();
        this.renderImage = this.renderImage.bind(this);
    }

    renderImage() {
        let image = this.props.image;
        let aspectRatio = this.props.image.width / this.props.image.height;

        let ctx = this.refs.canvas.getContext('2d');
        let scale = 1;
        console.log(this.refs.canvas.width);
        console.log(this.refs.canvas.height);
        let drawWidth;
        let drawHeight;

        if (aspectRatio > 1) {
            drawHeight = this.refs.canvas.height;
            drawWidth = drawHeight * aspectRatio;
        }
        else {
            drawWidth = this.refs.canvas.width;
            drawHeight = drawWidth / aspectRatio;
        }

        ctx.drawImage(this.props.image, 0, 0, image.width, image.height, 0, 0, drawWidth, drawHeight);
    }

    componentDidMount() {
        console.log(this.props.image.width);
        console.log(this.props.image.height);
        this.renderImage();

    }

    render() {

        return (
            <div>
                <div style={ {padding: '30px' } }>
                    <canvas style={{width: '100%'}} width={500} height={500} ref="canvas" />
                </div>
                <div>

                </div>

            </div>);
    }
}