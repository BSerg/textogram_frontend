import * as React from 'react';
import '../../../styles/shared/chart_builder.scss';


interface IChartNode {
    label: string;
    value: number;
}

interface IChartProps {
    values: IChartNode[];
    valuePrefix?: string;
    title?: string;
    alwaysShowNodes?: boolean;
    bgColor?: string;
    nodeColor?: string;
    lineColor?: string;
    borderColor?: string;

}

interface IChartState {
    values?: IChartNode[];
    max?: number;
    displayNodeIndex?: number;
    lineCoordinates?: {x: number, y: number}[];
    animateTimeout?: number;
}


export  default class LineChart extends React.Component<IChartProps, IChartState> {

    OFFSET_LEFT: number = 60;
    OFFSET_RIGHT: number = 60;
    OFFSET_TOP: number = 60;
    OFFSET_BOTTOM: number = 60;

    POINT_RADIUS: number = 6;
    LINE_WIDTH: number = 4;
    FONT_SIZE: number = 13;


    CANVAS_WIDTH: number = 600;
    CANVAS_HEIGHT: number = 300;

    refs: {
        canvas: HTMLCanvasElement;
        info: HTMLDivElement;
    };

    constructor() {
        super();
        this.state = {values: [], displayNodeIndex: null, lineCoordinates: [], max: 0};
        this.redraw = this.redraw.bind(this);
    }

    static defaultProps: {bgColor: string, nodeColor: string, borderColor: string, lineColor: string, alwaysShowNodes: boolean} = {
        bgColor: '#FFFFFF',
        borderColor: '#000000',
        nodeColor: '#333333',
        lineColor: '#333333',
        alwaysShowNodes: false,
    };

    clear(ctx: CanvasRenderingContext2D) {
        // ctx.fillStyle = this.props.bgColor;
        // ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

        let lineWidth: number = this.refs.canvas.width/this.refs.canvas.getBoundingClientRect().width;

        // this.drawLine(ctx, 0, 0, this.refs.canvas.width, 0, lineWidth, this.props.borderColor);
        // this.drawLine(ctx, this.refs.canvas.width, 0, this.refs.canvas.width, this.refs.canvas.height, lineWidth, this.props.borderColor);
        // this.drawLine(ctx, this.refs.canvas.width, this.refs.canvas.height, 0, this.refs.canvas.height, lineWidth, this.props.borderColor);
        // this.drawLine(ctx, 0, this.refs.canvas.height, 0, 0, lineWidth, this.props.borderColor);

        this.drawLine(ctx, this.OFFSET_LEFT, this.OFFSET_TOP, this.refs.canvas.width - this.OFFSET_RIGHT, this.OFFSET_TOP, lineWidth, '#BABABA');
        this.drawLine(ctx, this.OFFSET_LEFT, this.OFFSET_TOP + (this.refs.canvas.height - this.OFFSET_TOP - this.OFFSET_BOTTOM) / 2,
            this.refs.canvas.width - this.OFFSET_RIGHT,
            this.OFFSET_TOP + (this.refs.canvas.height - this.OFFSET_TOP - this.OFFSET_BOTTOM) / 2, lineWidth, '#BABABA');
    }

    draw() {
        let ctx = this.refs.canvas.getContext('2d');
        this.clear(ctx);
        if (this.state.values.length <= 1) {
            return;
        }
        let numbers: number[] = this.state.values.map((node: IChartNode) => { return node.value });
        let max: number = Math.max(... numbers);
        if (max <= 0) {
            return;
        }
        max = this._getNearestPrettyNumber(max);
        let step: number = (this.refs.canvas.width - this.OFFSET_LEFT - this.OFFSET_RIGHT) / (this.state.values.length - 1  || 1);
        let ratio: number = (this.refs.canvas.height - this.OFFSET_TOP - this.OFFSET_BOTTOM) / max;
        let coords = this.state.values.map((v: IChartNode, index: number) => {
            return {x: index * step + this.OFFSET_LEFT, y: (max - v.value) * ratio + this.OFFSET_TOP}
        });
        // let coords = this._get_lineCoordinateData();

        this.setState({lineCoordinates: coords, max: max}, this.redraw);
    }

    _getNearestPrettyNumber(n: number): number {
        if (n < 10) {
            return 10;
        }
        if (n.toString().match(/^\d0+$/)) {
            return n;
        }
        let countedNumber: number;
        let delimiter: number = 10;
        while (true) {
            countedNumber = Math.floor(n/delimiter);
            if (countedNumber < 10) {
                break;
            }
            delimiter *= 10;
        }
        return ((countedNumber + 1) * delimiter);
    }

    drawLine(ctx: CanvasRenderingContext2D, x: number, y: number, x1: number, y1: number, lineWidth: number, lineColor: string ) {
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    drawPoints(ctx: CanvasRenderingContext2D) {
        let radius: number = this.POINT_RADIUS * this.refs.canvas.width/this.refs.canvas.getBoundingClientRect().width;
        this.state.lineCoordinates.forEach((coord, index: number) => {
            // if (this.props.alwaysShowNodes || index == this.state.displayNodeIndex) {
            //     ctx.beginPath();
            //     ctx.arc(coord.x, coord.y, radius * ((index == this.state.displayNodeIndex && this.props.alwaysShowNodes) ? 1.5 : 1) , 0, 2 * Math.PI, false);
            //     ctx.fillStyle = this.props.nodeColor;
            //     ctx.fill();
            // }
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, (index == this.state.displayNodeIndex) ? radius : this.LINE_WIDTH/2 , 0, 2 * Math.PI, false);
            ctx.fillStyle = this.props.nodeColor;
            ctx.fill();
        });

    }

    drawText(ctx: CanvasRenderingContext2D) {
        if (!this.state.max) {
            return;
        }
        //ctx.font=   "20px Georgia";
        let fontSize: number = this.FONT_SIZE * this.refs.canvas.width/this.refs.canvas.getBoundingClientRect().width;
        ctx.font= fontSize + "px Open Sans";
        ctx.fillStyle = '#333333';
        ctx.fillText(this.state.max.toString(), this.OFFSET_LEFT, this.OFFSET_TOP + fontSize);
        ctx.fillText(Math.round(this.state.max / 2).toString(), this.OFFSET_LEFT, this.OFFSET_TOP + fontSize + (this.refs.canvas.height - this.OFFSET_TOP - this.OFFSET_BOTTOM) / 2);
    }

    redraw() {
        this.state.animateTimeout && window.clearTimeout(this.state.animateTimeout);
        let ctx = this.refs.canvas.getContext('2d');

        this.clear(ctx);
        let lineWidth: number = this.LINE_WIDTH * this.refs.canvas.width/this.refs.canvas.getBoundingClientRect().width;
        this.state.lineCoordinates.forEach((coord: {x: number, y: number}, index: number) => {
            if (this.state.lineCoordinates[index + 1]) {
                this.drawLine(ctx, coord.x, coord.y, this.state.lineCoordinates[index + 1].x,
                    this.state.lineCoordinates[index + 1].y, lineWidth, this.props.lineColor);
            }
        });
        this.drawPoints(ctx);
        this.drawText(ctx);
    }

    mouseMoveHandle(e: any) {
        if (!this.state.lineCoordinates) {
            return;
        }

        let rect: ClientRect = this.refs.canvas.getBoundingClientRect();
        let clientX: number = e.clientX;
        let clientY: number = e.clientY;

        let x: number = (clientX - rect.left) * (this.refs.canvas.width / rect.width);
        let y: number = (clientY - rect.top) * (this.refs.canvas.height / rect.height);

        let step: number = (this.refs.canvas.width - this.OFFSET_LEFT - this.OFFSET_RIGHT) / (this.state.values.length - 1  || 1);

        let displayNodeIndex: number = null;

        this.state.lineCoordinates.forEach((coord: {x: number, y: number}, index: number) => {
            if (x >= coord.x - step / 2 && x <= coord.x + step / 2 && y >= 0 && y < this.refs.canvas.height) {
                displayNodeIndex = index;
            }
        });
        if (displayNodeIndex != this.state.displayNodeIndex) {
            this.setState({displayNodeIndex: displayNodeIndex}, () => {
                this.redraw();
                this.positionInfoDiv(clientX, clientY, rect);
            });
        }
    }

    positionInfoDiv(x: number, y: number, canvasRect: ClientRect) {
        this.refs.info.style.left = x + 10 + 'px';

        let rect: ClientRect = this.refs.info.getBoundingClientRect();
        if (x + rect.width > canvasRect.right) {
            this.refs.info.style.left = (canvasRect.right - rect.width) + 'px';
        }
        if ( x + rect.width > window.innerWidth) {
            this.refs.info.style.left = window.innerWidth - rect.width > 0 ? (window.innerWidth - rect.width) + 'px' : '0';
        }
        if (this.state.lineCoordinates.length && this.state.displayNodeIndex != null) {
            this.refs.info.style.top = (canvasRect.top + 10 + this.state.lineCoordinates[this.state.displayNodeIndex].y * (canvasRect.height / this.refs.canvas.height)) + 'px';
        }
    }

    componentWillReceiveProps(nextProps: {values: IChartNode[], type?: string}) {
        this.setState({values: nextProps.values}, this.draw.bind(this));
    }

    componentDidMount() {
        this.setState({values: this.props.values}, this.draw.bind(this));
        window.addEventListener('resize', this.redraw);
    }

    componentWillUnmount() {
        this.state.animateTimeout && window.clearTimeout(this.state.animateTimeout);
        window.removeEventListener('resize', this.redraw);
    }

    render() {
        return (
            <div className="chart_builder chart_line" style={{position: 'relative'}} >
                {
                    this.props.title ? (<div className="chart_title">{this.props.title}</div>) : null
                }
                <div className="chart_data">
                    <div>
                        <canvas ref="canvas" width={this.CANVAS_WIDTH} height={this.CANVAS_HEIGHT}
                            onMouseMove={this.mouseMoveHandle.bind(this)} onMouseLeave={this.mouseMoveHandle.bind(this)}/>
                    </div>
                    <div ref="info" onMouseMove={this.mouseMoveHandle.bind(this)} className={"chart_info" + (this.state.displayNodeIndex == null ? " chart_info_hidden" : "")}>
                        <div>{ this.state.displayNodeIndex != null ? this.state.values[this.state.displayNodeIndex].label : '' }</div>
                        <div>{ this.state.displayNodeIndex != null ? (this.props.valuePrefix || '') + this.state.values[this.state.displayNodeIndex].value : '' }</div>
                    </div>

                </div>

            </div>)
    }

}
