import * as React from 'react';
import '../../styles/shared/loading.scss';

interface ILoadingProps {
    className?: string;
}

interface ILoadingState {
    indicatedIndex?: number;
    // interval?: number;
}

export default class Loading extends React.Component<ILoadingProps, ILoadingState> {

    interval: number;

    NUMBER_OF_INDICATORS: number = 3;
    INTERVAL_DURATION: number = 200;

    constructor() {
        super();
        this.state = {indicatedIndex: 0};
        this.changeIndicators = this.changeIndicators.bind(this);
    }

    changeIndicators() {
        let indicatedIndex = this.state.indicatedIndex;
        indicatedIndex++;
        if (indicatedIndex > (this.NUMBER_OF_INDICATORS - 1)) {
            indicatedIndex = 0;
        }
        this.setState({indicatedIndex: indicatedIndex});
    }

    componentDidMount() {
        this.interval = window.setInterval(this.changeIndicators, this.INTERVAL_DURATION);
    }

    componentWillUnmount() {
        window.clearInterval(this.interval);
    }

    render() {

        let indicators: boolean[] = [];

        for (let i = 0; i < this.NUMBER_OF_INDICATORS; i++) {
            indicators.push(i == this.state.indicatedIndex);
        }

        let className = "loading" + (this.props.className ? (" " + this.props.className) : "");

        return (<div className={className}>
            {
                indicators.map((indicated: boolean, index: number) => {
                    return (<div key={index} className={ indicated ? "indicated" : "" }></div>)
                })
            }

        </div>)
    }
}