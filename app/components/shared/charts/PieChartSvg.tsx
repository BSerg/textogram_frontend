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
    total?: number;
    displayNodeIndex?: number;
    animateTimeout?: number;
}


export default class PieChartSvg extends React.Component<IChartProps, IChartState> {

    SVG_WIDTH: number = 500;
    SVG_HEIGHT: number = 500;

    PIE_RADIUS: number = 200;

    refs: {
        svgCanvas: SVGElement;
        info: HTMLDivElement;
    };

    static defaultProps: {colors: string[], bgColor: string, borderColor: string,
        sort: boolean, displayPercent: boolean, showLegend: boolean} = {
        sort: true,
        displayPercent: true,
        showLegend: true,
        colors: ['#333333', '#777777', '#444444', '#999999', '#555555', '#222222', '#9A9A9A'],
        bgColor: '#FFFFFF',
        borderColor: '#000000',
    };

    constructor() {
        super();
        this.state = {values: [], displayNodeIndex: null, arcs: [], total: 0};
    }



    processValues(values: IChartNode[]): IChartNode[] {
        if (!this.props.sort) {
            return values;
        }
        return values.sort((a: IChartNode, b: IChartNode) => {
            return a.value == b.value ? 0 : (a.value > b.value ? -1 : 1);
        });
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



    getArcPath(index: number) {

        let startAngle: number = this.state.arcs[index].start;
        let endAngle: number = this.state.arcs[index].end;

        let radius: number = (index == this.state.displayNodeIndex) ? this.PIE_RADIUS * 1.05 : this.PIE_RADIUS;

        let largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

        let d = ["M", this.SVG_WIDTH / 2, this.SVG_HEIGHT / 2, "L", ((this.SVG_WIDTH/2) + radius * Math.cos(endAngle)),
            ((this.SVG_HEIGHT/2) + radius*Math.sin(endAngle)), "A", radius, radius, 0, largeArcFlag, 0, ((this.SVG_WIDTH/2) + radius * Math.cos(startAngle)),
            ((this.SVG_HEIGHT/2) + radius * Math.sin(startAngle)), "z"

        ];
        return d.join(" ");
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
        this.setState({arcs: arcs, total: total});
    }

    positionInfoDiv(x: number, y: number) {
        let top: number = y + 10;
        let left: number = x + 10;

        let width: number = this.refs.info.getBoundingClientRect().width;
        if ((left + width) > window.innerWidth) {
            left = window.innerWidth - width;
        }

        this.refs.info.style.top = top + 'px';
        this.refs.info.style.left = left + 'px';
    }

    moveHandle(index: number, e: any) {
        let clientX: number = e.clientX;
        let clientY: number = e.clientY;
        if (this.state.displayNodeIndex != index) {
            this.setState({displayNodeIndex: index}, this.positionInfoDiv.bind(this, clientX, clientY));
        }
        this.positionInfoDiv(clientX, clientY);

    }

    mouseLeaveHandle() {
        if (this.state.displayNodeIndex != null) {
            this.setState({displayNodeIndex: null});
        }
    }

    componentWillReceiveProps(nextProps: IChartProps) {
        this.setState({values: this.processValues(nextProps.values), displayNodeIndex: null, arcs: [], total: 0}, this.draw.bind(this));
    }

    componentDidMount() {
        this.setState({values: this.processValues(this.props.values)}, this.draw.bind(this));
    }

    render() {
        let displayValue: string = (this.state.displayNodeIndex != null && this.state.total) ? (
            this.props.displayPercent ? ( (Math.floor(1000 * this.state.values[this.state.displayNodeIndex].value / this.state.total)) /10 + ' %' ) : this.state.values[this.state.displayNodeIndex].value.toString()
        ) : '';
        return (
            <div className="chart_builder chart_pie">
                {
                    this.props.title ? (<div className="chart_title">{this.props.title}</div>) : null
                }
                <div className="chart_data">
                    <div>
                        <svg ref="svgCanvas" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
                             fill="transparent" onMouseLeave={this.mouseLeaveHandle.bind(this)}
                             xmlnsXlink="http://www.w3.org/1999/xlink" viewBox={[0, 0, this.SVG_WIDTH, this.SVG_HEIGHT].join(" ")} >
                            {
                                this.state.arcs.map((arc: any, index: number) => {
                                    return (<path d={this.getArcPath(index)} key={index} stroke={arc.color} fill={arc.color}
                                                  onMouseMove={this.moveHandle.bind(this, index)}
                                                  style={{opacity: (this.state.displayNodeIndex != null && this.state.displayNodeIndex != index ? 0.2 : 1) }}/>)
                                })
                            }
                        </svg>
                    </div>
                    {
                        this.props.showLegend && this.state.arcs.length ? (
                            <div className="chart_legend">
                                {
                                    this.state.values.map((val, index: number) => {
                                        return (
                                            <div key={index} className={ (this.state.displayNodeIndex != null && index != this.state.displayNodeIndex) ? "chart_legend_inactive" : "" }>
                                                <div style={{backgroundColor: this.state.arcs[index].color}}></div>
                                                <div>{ val.label }</div>
                                            </div>)
                                    })
                                }

                            </div>

                        ) : null
                    }
                </div>

                <div ref="info" className={"chart_info" + (this.state.displayNodeIndex == null ? " chart_info_hidden" : "")}>
                    <div>{ this.state.displayNodeIndex != null ? this.state.values[this.state.displayNodeIndex].label : '' }</div>
                    <div>{ displayValue }</div>
                </div>


            </div>)
    }
}