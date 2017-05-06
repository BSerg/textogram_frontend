import * as React from 'react';
import '../../../styles/shared/chart_builder.scss';


interface IChartNode {
    label: string;
    value: number;
}

interface IChartBuilderProps {
    values: IChartNode[];
    title?: string;
    showLegend?: boolean;
    bgColor?: string;
    nodeColor?: string;
    lineColor?: string;

}

interface IChartBuilderState {
    values?: IChartNode[];
    nodes?: any[];
    displayNodeIndex?: number;
    lineCoordinates?: {x: number, y: number}[];
    animateTimeout?: number;
}


export  default class LineChartBuilder extends React.Component<IChartBuilderProps, IChartBuilderState> {

    OFFSET_LEFT: number = 60;
    OFFSET_RIGHT: number = 60;
    OFFSET_TOP: number = 60;
    OFFSET_BOTTOM: number = 60;

    LINE_CHART_CIRCLE_RADIUS: number = 5;
    LINE_WIDTH: number = 3;

    CANVAS_WIDTH: number = 600;
    CANVAS_HEIGHT: number = 300;

    refs: {
        canvas: HTMLCanvasElement;
        info: HTMLDivElement;
    };

    constructor() {
        super();
        this.state = {values: [], nodes: [], displayNodeIndex: null};
    }

    static defaultProps: {bgColor: string, nodeColor: string, borderColor: string, lineColor: string} = {
        bgColor: '#E3E3E3',
        borderColor: '#BFBFBF',
        nodeColor: '#FF3333',
        lineColor: '#33FF33'
    };

    clear(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.props.bgColor;
        ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

    }

    draw() {
        let ctx = this.refs.canvas.getContext('2d');
        this.clear(ctx);
        this._drawLineChart(ctx);
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

    _get_lineCoordinateData(): {x: number, y: number}[] {
        let numbers: number[] = this.state.values.map((node: IChartNode) => { return node.value });
        let max: number = Math.max(... numbers);
        if (max <= 0) {
            return;
        }
        max = this._getNearestPrettyNumber(max);
        let step: number = (this.refs.canvas.width - this.OFFSET_LEFT - this.OFFSET_RIGHT) / (this.state.values.length - 1  || 1);
        let ratio: number = (this.refs.canvas.height - this.OFFSET_TOP - this.OFFSET_BOTTOM) / max;
        return this.state.values.map((v: IChartNode, index: number) => {
            return {x: index * step + this.OFFSET_LEFT, y: (max - v.value) * ratio + this.OFFSET_TOP}
        });
    }

    _drawLineChart(ctx: CanvasRenderingContext2D) {
        if (this.state.values.length <= 1) {
            return;
        }
        let coords = this._get_lineCoordinateData();

        this.setState({lineCoordinates: coords}, this._drawLinesAnimated.bind(this, ctx));
    }

    _drawLine(ctx: CanvasRenderingContext2D, x: number, y: number, x1: number, y1: number, lineWidth: number, lineColor: string ) {
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    _drawLinesAnimated(ctx: CanvasRenderingContext2D, index: number = 0) {
        if (this.state.lineCoordinates[index + 1]) {
            this._drawLine(ctx, this.state.lineCoordinates[index].x, this.state.lineCoordinates[index].y,
                this.state.lineCoordinates[index + 1].x, this.state.lineCoordinates[index + 1].y,
                this.LINE_WIDTH, this.props.lineColor
            );
            this.state.animateTimeout = window.setTimeout(() => {
                this._drawLinesAnimated(ctx, index + 1);
            }, 500 / this.state.lineCoordinates.length);
        }
        else {
            this._drawPoints(ctx);
        }
    }

    _drawPoints(ctx: CanvasRenderingContext2D) {
        this.state.lineCoordinates.forEach((coord, index: number) => {
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, this.LINE_CHART_CIRCLE_RADIUS * (index == this.state.displayNodeIndex ? 2 : 1) , 0, 2 * Math.PI, false);
            ctx.fillStyle = this.props.nodeColor;
            ctx.fill();
        });
    }

    redraw() {
        this.state.animateTimeout && window.clearTimeout(this.state.animateTimeout);
        let ctx = this.refs.canvas.getContext('2d');

        this.clear(ctx);
        this.state.lineCoordinates.forEach((coord: {x: number, y: number}, index: number) => {
            if (this.state.lineCoordinates[index + 1]) {
                this._drawLine(ctx, coord.x, coord.y, this.state.lineCoordinates[index + 1].x,
                    this.state.lineCoordinates[index + 1].y, this.LINE_WIDTH, this.props.lineColor);
            }
        });
        this._drawPoints(ctx);
    }

    mouseMoveHandle(e: any) {
        if (!this.state.lineCoordinates) {
            return;
        }
        let rect: ClientRect = this.refs.canvas.getBoundingClientRect();
        let x: number = (e.clientX - rect.left) * (this.refs.canvas.width / rect.width);
        let y: number = (e.clientY - rect.top) * (this.refs.canvas.height / rect.height);

        let step: number = (this.refs.canvas.width - this.OFFSET_LEFT - this.OFFSET_RIGHT) / (this.state.values.length - 1  || 1);

        let displayNodeIndex: number = null;
        this.state.lineCoordinates.forEach((coord: {x: number, y: number}, index: number) => {
            if (x >= coord.x - step / 2 && x <= coord.x + step / 2) {
                displayNodeIndex = index;
            }
        });
        if (displayNodeIndex != this.state.displayNodeIndex) {
            this.setState({displayNodeIndex: displayNodeIndex}, this.redraw.bind(this));
        }
        this.positionInfoDiv(e.clientX, e.clientY, rect);
    }

    positionInfoDiv(x: number, y: number, canvasRect: ClientRect) {
        this.refs.info.style.top = y + 10 + 'px';
        this.refs.info.style.left = x + 10 + 'px';

        let rect: ClientRect = this.refs.info.getBoundingClientRect();
        if (x + rect.width > canvasRect.right) {
            this.refs.info.style.left = (canvasRect.right - rect.width) + 'px';
        }


    }

    mouseLeaveHandle() {
        this.setState({displayNodeIndex: null},  this.redraw.bind(this));
    }

    componentWillReceiveProps(nextProps: {values: IChartNode[], type?: string}) {
        this.setState({values: nextProps.values, nodes: []}, this.draw.bind(this));
    }

    componentDidMount() {
        this.setState({values: this.props.values}, this.draw.bind(this));
    }

    componentWillUnmount() {
        this.state.animateTimeout && window.clearTimeout(this.state.animateTimeout);
    }

    render() {
        return (
            <div className="chart_builder" style={{position: 'relative'}} >
                <canvas ref="canvas" width={this.CANVAS_WIDTH} height={this.CANVAS_HEIGHT}
                        onMouseMove={this.mouseMoveHandle.bind(this)} onMouseLeave={this.mouseLeaveHandle.bind(this)}/>
                <div ref="info" className={"chart_info" + (this.state.displayNodeIndex == null ? " chart_info_hidden" : "")}>
                    <div>{ this.state.displayNodeIndex != null ? this.state.values[this.state.displayNodeIndex].label : '' }</div>
                    <div>{ this.state.displayNodeIndex != null ? this.state.values[this.state.displayNodeIndex].value : '' }</div>
                </div>
            </div>)
    }

}
