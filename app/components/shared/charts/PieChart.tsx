import * as React from 'react';

import '../../../styles/shared/chart_builder.scss';


interface IChartNode {
    label: string;
    value: number;
}

interface IChartProps {
    values: IChartNode[];
    title?: string;
    sort?: boolean;
    displayPercent?: boolean;
    showLegend?: boolean;
    colors?: string[];
    bgColor?: string;
    borderColor?: string;

}

interface IChartState {
    values?: IChartNode[];
    arcs?: {start: number, end: number, color: string}[];
    displayNodeIndex?: number;
    animateTimeout?: number;
}


export default class PieChart extends React.Component<IChartProps, IChartState> {

    CANVAS_WIDTH: number = 1000;
    CANVAS_HEIGHT: number = 1000;
    PIE_RADIUS: number = 400;

    refs: {
        canvas: HTMLCanvasElement;
        info: HTMLDivElement;
    };

    static defaultProps: {colors: string[], bgColor: string, borderColor: string,
        sort: boolean, displayPercent: boolean, showLegend: boolean} = {
        sort: true,
        displayPercent: true,
        showLegend: true,
        colors: [],
        bgColor: '#FFFFFF',
        borderColor: '#000000',
    };

    constructor() {
        super();
        this.state = {values: [], displayNodeIndex: null, arcs: []};
    }

    clear(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.props.bgColor;
        ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        let lineWidth: number = this.refs.canvas.width/this.refs.canvas.getBoundingClientRect().width;
        this.drawLine(ctx, 0, 0, this.refs.canvas.width, 0, lineWidth, this.props.borderColor);
        this.drawLine(ctx, this.refs.canvas.width, 0, this.refs.canvas.width, this.refs.canvas.height, lineWidth, this.props.borderColor);
        this.drawLine(ctx, this.refs.canvas.width, this.refs.canvas.height, 0, this.refs.canvas.height, lineWidth, this.props.borderColor);
        this.drawLine(ctx, 0, this.refs.canvas.height, 0, 0, lineWidth, this.props.borderColor);
    }

    numToHex(n: number): string {
        let hex: string = Math.round(n).toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    getColor(index: number, total: number): string {
        if (this.props.colors.length) {
            return this.props.colors[ index % this.props.colors.length];
        }
        else {
            if (index == 0) {
                return '#00FF00';
            }
            return ("#" + this.numToHex(255 * (index/total))
            + this.numToHex(255 - (255 * (index/total)))
            + this.numToHex( index < (total / 2) ? 255 * index * 2/total : 255 - (255 * index/total ))).toUpperCase();
        }
    }

    draw() {
        let total: number = 0;
        this.state.values.forEach((val: IChartNode) => {
            total += val.value;
        });
        let lastEnd: number = -Math.PI / 2;
        let arcs: {start: number, end: number, color: string}[] = this.state.values.map((val: IChartNode, index: number) => {
            let start: number = lastEnd;
            lastEnd += Math.PI*2*(val.value/total);
            return {start: start, end: lastEnd, color: this.getColor(index, this.state.values.length)};
        });
        this.setState({arcs: arcs}, this.redrawArcs.bind(this));
    }

    drawLine(ctx: CanvasRenderingContext2D, x: number, y: number, x1: number, y1: number, lineWidth: number, lineColor: string ) {
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    drawArc(ctx: CanvasRenderingContext2D, start: number, end: number, radius: number, color: string, alpha: number = 1) {

        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.refs.canvas.width / 2, this.refs.canvas.height / 2);
        ctx.arc(this.refs.canvas.width / 2, this.refs.canvas.height / 2, radius, start, end, false);
        ctx.lineTo(this.refs.canvas.width / 2, this.refs.canvas.height / 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    redrawArcs() {
        let ctx = this.refs.canvas.getContext('2d');
        this.clear(ctx);

        this.state.arcs.forEach((arc, index: number) => {
            this.drawArc(ctx, arc.start, arc.end,
                (index == this.state.displayNodeIndex) ? this.PIE_RADIUS * 1.05 : this.PIE_RADIUS, arc.color,
                (this.state.displayNodeIndex != null && index != this.state.displayNodeIndex) ? 0.5 : 1
            );
        });
    }


    processValues(values: IChartNode[]): IChartNode[] {
        if (!this.props.sort) {
            return values;
        }
        return values.sort((a: IChartNode, b: IChartNode) => {
            return a.value == b.value ? 0 : (a.value > b.value ? -1 : 1);
        });
    }

    mouseMoveHandle(e: any) {
        if (!this.state.arcs) {
            return;
        }
        let rect: ClientRect = this.refs.canvas.getBoundingClientRect();
        let x: number = (e.clientX - rect.left) * (this.refs.canvas.width / rect.width);
        let y: number = (e.clientY - rect.top) * (this.refs.canvas.height / rect.height);

        let displayNodeIndex: number = null;
        if ( Math.pow(x - this.refs.canvas.width / 2, 2) + Math.pow(y - this.refs.canvas.height/2, 2) < Math.pow(this.PIE_RADIUS, 2) ) {

            let angleRadians: number = Math.atan2(y - this.refs.canvas.height / 2 , x - this.refs.canvas.width/ 2);
            if (x < this.refs.canvas.width / 2 && y < this.refs.canvas.width / 2) {
                angleRadians += Math.PI * 2
            }
            this.state.arcs.forEach((arc, index: number) => {
                if ((angleRadians >= arc.start && angleRadians < arc.end) ) {
                    displayNodeIndex = index;
                }
            });
        }
        if (displayNodeIndex != this.state.displayNodeIndex) {
            this.setState({displayNodeIndex: displayNodeIndex}, this.redrawArcs.bind(this));
        }
        this.positionInfoDiv(e.clientX, e.clientY);
    }

    positionInfoDiv(x: number, y: number) {
        this.refs.info.style.top = y + 10 + 'px';
        this.refs.info.style.left = x + 10 + 'px';
    }

    mouseLeaveHandle(e: any) {
        if (this.state.displayNodeIndex != null) {
            this.setState({displayNodeIndex: null}, this.redrawArcs.bind(this));
        }
    }

    componentWillReceiveProps(nextProps: IChartProps) {
        this.setState({values: this.processValues(nextProps.values)}, this.draw.bind(this));
    }

    componentDidMount() {
        this.setState({values: this.processValues(this.props.values)}, this.draw.bind(this));
    }

    render() {
        return (<div className="chart_builder">
            <canvas ref="canvas" width={this.CANVAS_WIDTH} height={this.CANVAS_HEIGHT}
                    onMouseMove={this.mouseMoveHandle.bind(this)}
                    onMouseLeave={ this.mouseLeaveHandle.bind(this) } />
            <div ref="info" className={"chart_info" + (this.state.displayNodeIndex == null ? " chart_info_hidden" : "")}>
                <div>{ this.state.displayNodeIndex != null ? this.state.values[this.state.displayNodeIndex].label : '' }</div>
                <div>{ this.state.displayNodeIndex != null ? this.state.values[this.state.displayNodeIndex].value : '' }</div>
            </div>

            {
                this.props.showLegend && this.state.arcs.length ? (
                    <div className="chart_legend">
                        {
                            this.state.values.map((val, index: number) => {
                                return (
                                    <div key={index}>
                                        <div style={{backgroundColor: this.state.arcs[index].color}}></div>
                                        <div>{ val.label }</div>
                                    </div>)
                            })
                        }

                    </div>

                    ) : null
            }
        </div>)
    }
}