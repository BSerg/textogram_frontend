import * as React from 'react';
import '../../styles/shared/chart_builder.scss';


interface IChartNode {
    label: string;
    value: number;
    label1?: string;
    value1?: number;
}

interface IChartBuilderProps {
    values: IChartNode[];
    title?: string;
    showLegend?: boolean;
    type?: string;
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


export  default class ChartBuilder extends React.Component<IChartBuilderProps, IChartBuilderState> {

    TYPE_LINE = 'line';
    TYPE_PIE = 'pie';

    LINE_CHART_OFFSET_LEFT: number = 40;
    LINE_CHART_OFFSET_RIGHT: number = 20;
    LINE_CHART_OFFSET_TOP: number = 20;
    LINE_CHART_OFFSET_BOTTOM: number = 40;

    LINE_CHART_CIRCLE_RADIUS: number = 5;

    CANVAS_SIZES: any = {
        'line': {width: 1000, height: 300},
        'pine': {width: 400, height: 400},
    };

    refs: {
        canvas: HTMLCanvasElement;
        info: HTMLDivElement;
    };

    constructor() {
        super();
        this.state = {values: [], nodes: [], displayNodeIndex: null};
    }

    static defaultProps: {type: string, bgColor: string, nodeColor: string, lineColor: string} = {
        type: 'line',
        bgColor: '#FAFAFF',
        nodeColor: '#FF3333',
        lineColor: '#33FF33'
    };

    draw() {
        if (this.CANVAS_SIZES[this.props.type]) {
            this.refs.canvas.width = this.CANVAS_SIZES[this.props.type].width;
            this.refs.canvas.height = this.CANVAS_SIZES[this.props.type].height;
        }

        let ctx = this.refs.canvas.getContext('2d');
        ctx.fillStyle = this.props.bgColor;
        ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

        if (this.props.type == 'line') {
            this._drawLineChart(ctx);
        }
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
        let min: number = Math.min(... numbers);
        console.log(max);
        let step: number = (this.refs.canvas.width - this.LINE_CHART_OFFSET_LEFT - this.LINE_CHART_OFFSET_RIGHT) / (this.state.values.length - 1  || 1);
        let ratio: number = (this.refs.canvas.height - this.LINE_CHART_OFFSET_TOP - this.LINE_CHART_OFFSET_BOTTOM) / max;
        return this.state.values.map((v: IChartNode, index: number) => {
            return {x: index * step + this.LINE_CHART_OFFSET_LEFT, y: (max - v.value) * ratio + this.LINE_CHART_OFFSET_TOP}
        });
    }

    _drawLineChart(ctx: CanvasRenderingContext2D) {
        if (this.state.values.length <= 1) {
            return;
        }
        let coords = this._get_lineCoordinateData();
        ctx.strokeStyle = this.props.lineColor;
        this.setState({lineCoordinates: coords}, this._drawLinesAnimated.bind(this, ctx));
    }

    _drawLinesAnimated(ctx: CanvasRenderingContext2D, index: number = 0) {
        if (this.state.lineCoordinates[index + 1]) {

            ctx.beginPath();
            ctx.moveTo(this.state.lineCoordinates[index].x, this.state.lineCoordinates[index].y);
            ctx.lineTo(this.state.lineCoordinates[index + 1].x, this.state.lineCoordinates[index + 1].y);
            ctx.lineWidth = 3;
            ctx.stroke();

            this.state.animateTimeout = window.setTimeout(() => {
                this._drawLinesAnimated(ctx, index + 1);
            }, 100 / this.state.lineCoordinates.length);
        }
        else {
            this._drawPoints(ctx);
        }
    }

    _drawPoints(ctx: CanvasRenderingContext2D) {
        this.state.lineCoordinates.forEach((coord) => {
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, this.LINE_CHART_CIRCLE_RADIUS, 0, 2 * Math.PI, false);
            ctx.fillStyle = this.props.nodeColor;
            ctx.fill();
        });
    }

    mouseMoveHandle(e: any) {
        let rect: ClientRect = this.refs.canvas.getBoundingClientRect();
        let x: number = (e.clientX - rect.left) * (this.refs.canvas.width / rect.width);
        let y: number = (e.clientY - rect.top) * (this.refs.canvas.height / rect.height);
        if (this.props.type == this.TYPE_LINE) {
            this._lineChartHandle(x, y);
        }
    }

    _lineChartHandle(x: number, y: number) {
        if (!this.state.lineCoordinates) {
            return;
        }
        let displayNodeIndex: number = null;
        this.state.lineCoordinates.forEach((coord: {x: number, y: number}, index: number) => {
            if (x >= coord.x - this.LINE_CHART_CIRCLE_RADIUS && x <= coord.x + this.LINE_CHART_CIRCLE_RADIUS
                && y >= coord.y - this.LINE_CHART_CIRCLE_RADIUS && y <= coord.y + this.LINE_CHART_CIRCLE_RADIUS) {

                displayNodeIndex = index;
                // if (index != this.state.displayNodeIndex) {
                //     console.log(index);
                //     this.setState({displayNodeIndex: index}, () => {console.log(this.state.displayNodeIndex)});
                // }
            }
        });
        if (displayNodeIndex != this.state.displayNodeIndex) {
            this.setState({displayNodeIndex: displayNodeIndex});
        }
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
        // let width: number = 1000;
        // let height: number = 300;

        return (
            <div className="chart_builder" style={{position: 'relative'}} >
                <canvas ref="canvas" onMouseMove={this.mouseMoveHandle.bind(this)} />
                {
                    this.state.displayNodeIndex != null ? (
                        <div ref="info">
                            <div>{ this.state.values[this.state.displayNodeIndex].label }</div>
                            <div>{ this.state.values[this.state.displayNodeIndex].value }</div>
                        </div>
                    ) : <div style={{display: 'none'}} ref="info"></div>
                }
            </div>)
    }

}
