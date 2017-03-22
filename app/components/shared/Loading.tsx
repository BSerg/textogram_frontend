import * as React from 'react';
import '../../styles/shared/loading.scss';

interface ILoadingState {
    indicators?: boolean[];
    interval?: number;
}

export default class Loading extends React.Component<any, ILoadingState> {

    NUMBER_OF_INDICATORS: number = 3;
    INTERVAL_DURATION: number = 300;

    constructor() {
        super();
        this.state = {indicators: [true, false, false]};
        this.changeIndicators = this.changeIndicators.bind(this);
    }

    changeIndicators() {
        let nextIndex = 0;
        this.state.indicators.forEach((indicated: boolean, index: number) => {
            if (indicated) {
                nextIndex = index + 1;
            }
        });

        if (nextIndex > (this.NUMBER_OF_INDICATORS - 1)) {
            nextIndex = 0;
        }
        let indicators: boolean[] = [];
        for (let i = 0; i < this.NUMBER_OF_INDICATORS; i++) {
            indicators.push(i == nextIndex);
        }
        this.setState({indicators: indicators});
    }

    componentDidMount() {

        this.state.interval = window.setInterval(this.changeIndicators, this.INTERVAL_DURATION);
    }

    componentWillUnmount() {
        window.clearInterval(this.state.interval);
    }

    render() {
        return (<div className="loading">
            {
                this.state.indicators.map((indicated: boolean, index: number) => {
                    return (<div key={index} className={ indicated ? "indicated" : "" }></div>)
                })
            }

        </div>)
    }
}