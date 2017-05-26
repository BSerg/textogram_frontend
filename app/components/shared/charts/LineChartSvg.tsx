import * as React from 'react';
import '../../../styles/shared/chart_builder.scss';
import {displayNumber} from '../../profile/utils';


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
    fillColor?: string;
    borderColor?: string;

}

interface IChartState {
    values?: IChartNode[];
    width?: number;
    height?: number;
    max?: number;
    displayNodeIndex?: number;
    nodeCoordinates?: {x: number, y: number}[];
    animateTimeout?: number;
}


export  default class LineChartSvg extends React.Component<IChartProps, IChartState> {

    OFFSET_LEFT: number = 100;
    OFFSET_RIGHT: number = 20;
    OFFSET_TOP: number = 60;
    OFFSET_BOTTOM: number = 60;

    POINT_RADIUS: number = 4;
    LINE_WIDTH: number = 2;
    FONT_SIZE: number = 13;


    SVG_WIDTH: number = 600;
    SVG_HEIGHT: number = 300;

    refs: {
        svgCanvas: SVGElement;
        info: HTMLDivElement;
        container: HTMLDivElement;
        values: HTMLDivElement;
    };

    constructor() {
        super();
        this.state = {values: [], displayNodeIndex: null, nodeCoordinates: [], max: 0, width: 0, height: 0};
        this.setSizes = this.setSizes.bind(this);
    }

    static defaultProps: {bgColor: string, nodeColor: string, borderColor: string, lineColor: string, fillColor: string, alwaysShowNodes: boolean} = {
        bgColor: '#FFFFFF',
        borderColor: '#000000',
        nodeColor: '#333333',
        lineColor: '#333333',
        fillColor: '#DADADA',
        alwaysShowNodes: false,
    };

    getOffsets(): {top: number, bottom: number, left: number, right: number} {
        return { top: this.OFFSET_TOP * this.state.height / this.SVG_HEIGHT, bottom: this.OFFSET_BOTTOM * this.state.height / this.SVG_HEIGHT,
            left: this.OFFSET_LEFT * this.state.width / this.SVG_WIDTH, right: this.OFFSET_RIGHT * this.state.width / this.SVG_WIDTH
        }
    }

    draw() {
        if (this.state.values.length <= 1) {
            return;
        }
        let offsets = this.getOffsets();
        let max: number = Math.max(... this.state.values.map((node: IChartNode) => { return node.value }));
        if (max <= 0) {
            return;
        }
        max = this._getNearestPrettyNumber(max);
        let step: number = (this.state.width - offsets.left - offsets.right) / (this.state.values.length - 1  || 1);
        let ratio: number = (this.state.height - offsets.top - offsets.bottom) / max;
        let coords = this.state.values.map((v: IChartNode, index: number) => {
            return {x: index * step + offsets.left, y: (max - v.value) * ratio + offsets.top}
        });

        this.setState({nodeCoordinates: coords, max: max});
    }

    _getNearestPrettyNumber(n: number): number {
        if (n <= 10) {
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


    mouseMoveHandle(e: any) {
        if (!this.state.nodeCoordinates) {
            return;
        }
        let offsets = this.getOffsets();

        let rect: ClientRect = this.refs.svgCanvas.getBoundingClientRect();
        let clientX: number = e.clientX;
        let clientY: number = e.clientY;

        let x: number = (clientX - rect.left) * (this.state.width / rect.width);
        let y: number = (clientY - rect.top) * (this.state.height / rect.height);

        let step: number = (this.state.width - offsets.left - offsets.right) / (this.state.values.length - 1  || 1);

        let displayNodeIndex: number = null;

        this.state.nodeCoordinates.forEach((coord: {x: number, y: number}, index: number) => {
            if (x >= coord.x - step / 2 && x <= coord.x + step / 2 && y >= 0 && y < this.state.width) {
                displayNodeIndex = index;
            }
        });
        if (displayNodeIndex != this.state.displayNodeIndex) {
            this.setState({displayNodeIndex: displayNodeIndex}, () => {
                // this.redraw();
                this.positionInfoDiv(rect);
            });
        }
    }

    mouseLeaveHandle() {
        if (this.state.displayNodeIndex != null) {
            this.setState({displayNodeIndex: null});
        }
    }


    positionInfoDiv(canvasRect: ClientRect) {


        if (this.state.displayNodeIndex != null && this.state.nodeCoordinates && this.state.nodeCoordinates.length) {
            let rect: ClientRect = this.refs.info.getBoundingClientRect();

            let x: number = canvasRect.left + this.state.nodeCoordinates[this.state.displayNodeIndex].x * (canvasRect.width / this.state.width) - rect.width / 2;
            let y: number = canvasRect.top + this.state.nodeCoordinates[this.state.displayNodeIndex].y * (canvasRect.height / this.state.height) + 10;

            if ((x + rect.width) > window.innerWidth) {
                x = window.innerWidth - rect.width;
            }
            this.refs.info.style.top = y + 'px';
            this.refs.info.style.left = x + 'px';

        }
    }

    componentWillReceiveProps(nextProps: {values: IChartNode[], type?: string}) {
        this.setState({values: nextProps.values, displayNodeIndex: null, nodeCoordinates: [], max: 0}, this.draw.bind(this));
    }

    setSizes() {

        let containerRect = this.refs.container.getBoundingClientRect();
        let width: number = containerRect.width  > this.SVG_WIDTH ? this.SVG_WIDTH : containerRect.width;



        this.setState({width: width, height: width * this.SVG_HEIGHT/this.SVG_WIDTH}, this.draw.bind(this));
    }

    componentDidMount() {
        this.setState({values: this.props.values}, this.setSizes);
        window.addEventListener('resize', this.setSizes);
    }

    componentWillUnmount() {
        this.state.animateTimeout && window.clearTimeout(this.state.animateTimeout);
        window.removeEventListener('resize', this.setSizes);
    }

    render() {

        let offsets = this.getOffsets();
        let pathFillD: string = "M " + [offsets.left, this.state.height - offsets.bottom].join(" ") + " " + this.state.nodeCoordinates.map((coord) => {
            return coord.x + " " + coord.y + " "
        }).join("") + " " + [this.state.width -  offsets.right, this.state.height - offsets.bottom].join(" ") + " z";

        let pathLineD: string = "M " + this.state.nodeCoordinates.map((coord) => {
            return coord.x + " " + (coord.y - this.LINE_WIDTH/2) + " "
        }).join("");

        let texts: string[] = [displayNumber(this.state.max), displayNumber(Math.round(this.state.max/2)), '0'];

        return (
            <div className="chart_builder chart_line" style={{position: 'relative'}} onMouseLeave={this.mouseLeaveHandle.bind(this)}>
                {
                    this.props.title ? (<div className="chart_title">{this.props.title}</div>) : null
                }


                <div className="chart_data chart_data_line" ref="container">


                    <svg ref="svgCanvas" width={this.state.width} height={this.state.height} xmlns="http://www.w3.org/2000/svg"
                         onMouseMove={this.mouseMoveHandle.bind(this)}
                         fill="transparent" onMouseLeave={this.mouseLeaveHandle.bind(this)}
                         xmlnsXlink="http://www.w3.org/1999/xlink" >

                        {

                            this.state.width ?

                                [offsets.top, this.state.height/2, this.state.height - offsets.bottom].map((yCoord: number, index: number) => {
                                    return <path key={index}
                                                 d={["M", offsets.left, yCoord, this.state.width - offsets.right, yCoord].join(" ")}
                                                 style={{strokeWidth: 2, stroke: "#BABABA"}}/>
                                }) : null
                        }

                        {
                            this.state.nodeCoordinates.length > 1 ? (
                                [
                                    <path key="fill" d={pathFillD} style={{strokeWidth: this.LINE_WIDTH, opacity: 0.3, fill: this.props.fillColor}}/>,
                                    <path key="line" d={pathLineD} style={{strokeWidth: this.LINE_WIDTH, stroke: this.props.lineColor}}/>
                                ]
                            ) : null
                        }

                        {
                            this.state.nodeCoordinates.map((coord: any, index: number) => {
                                return <circle key={index} cx={coord.x} cy={coord.y} r={this.POINT_RADIUS}
                                               style={{fill: this.props.nodeColor, opacity: index == this.state.displayNodeIndex ? 1 : 0 }}/>
                            })
                        }

                        {
                            this.state.width ? [
                                [offsets.top, this.state.height/2, this.state.height - offsets.bottom].map((y: number, index:number) => {
                                    return (<text key={index} x={offsets.left - 10} y={y}>{texts[index]}</text>)
                                })
                            ] : null
                        }

                    </svg>
                </div>


                <div ref="info" onMouseMove={this.mouseMoveHandle.bind(this)} className={"chart_info" + (this.state.displayNodeIndex == null ? " chart_info_hidden" : "")}>
                    <div>{ this.state.displayNodeIndex != null ? this.state.values[this.state.displayNodeIndex].label : '' }</div>
                    <div>{ this.state.displayNodeIndex != null ? (this.props.valuePrefix || '') + this.state.values[this.state.displayNodeIndex].value : '' }</div>
                </div>

            </div>)
    }

}
