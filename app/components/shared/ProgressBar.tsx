import * as React from 'react';

import '../../styles/shared/progress_bar.scss';

const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');

export enum PROGRESS_BAR_TYPE {
    INDETERMINATE = 1,
    DETERMINATE = 2
}


interface IProgressBarProps {
    type?: PROGRESS_BAR_TYPE;
    value?: number;
    total?: number;
    label: string;
    className?: string;
    onCancel?: () => any;
}

interface IProgressBarState {
    value: number
    total: number
}


export default class ProgressBar extends React.Component<IProgressBarProps, IProgressBarState> {
    constructor(props: any) {
        super(props);
        this.state = {
            value: this.props.value,
            total: this.props.total
        }
    }

    static defaultProps = {
        type: PROGRESS_BAR_TYPE.INDETERMINATE,
        value: 0,
        total: 0,
    };

    handleCancel() {
        this.props.onCancel && this.props.onCancel();
    }

    componentDidMount() {
        switch (this.props.type) {
            case PROGRESS_BAR_TYPE.INDETERMINATE:
                console.log('INDETERMINATE');
        }
    }

    render() {
        let barStyle = {};
        let className = 'progress_bar';
        this.props.className && (className += ' ' + this.props.className);
        let progress = 0;
        switch (this.props.type) {
            case PROGRESS_BAR_TYPE.INDETERMINATE:
                className += ' indeterminate';
                break;
            case PROGRESS_BAR_TYPE.DETERMINATE:
                className += ' determinate';
                progress = this.props.total ? this.props.value * 100 / this.props.total : 0;
                barStyle = {width: progress + '%'};
                break;
        }

        return (
            <div className={className}>
                <div className="progress_bar__bar_container">
                    <div className="progress_bar__bar">
                        {progress ? <div className="progress_bar__item" style={barStyle}/> : null}
                    </div>
                    <div className="progress_bar__cancel" onClick={this.handleCancel.bind(this)}>
                        <CloseIcon/>
                    </div>
                </div>
                <div className="progress_bar__label">{this.props.label}</div>
            </div>
        )
    }
}