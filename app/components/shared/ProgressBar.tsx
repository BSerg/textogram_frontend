import * as React from 'react';

import '../../styles/shared/progress_bar.scss';

const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');

export enum PROGRESS_BAR_TYPE {
    INDETERMINATE = 1,
    DETERMINATE = 2
}


interface IProgressBarProps {
    type?: PROGRESS_BAR_TYPE
    value?: number
    label: string
    className?: string
}

interface IProgressBarState {
    value: number
}


export default class ProgressBar extends React.Component<IProgressBarProps, IProgressBarState> {
    constructor(props: any) {
        super(props);
        this.state = {
            value: this.props.value
        }
    }

    static defaultProps = {
        type: PROGRESS_BAR_TYPE.INDETERMINATE,
        value: 0
    };

    componentDidMount() {
        switch (this.props.type) {
            case PROGRESS_BAR_TYPE.INDETERMINATE:
                console.log('INDETERMINATE');
        }
    }

    render() {
        let className = 'progress_bar';
        this.props.className && (className += ' ' + this.props.className);
        switch (this.props.type) {
            case PROGRESS_BAR_TYPE.INDETERMINATE:
                className += ' indeterminate';
                break;
            case PROGRESS_BAR_TYPE.DETERMINATE:
                className += ' determinate';
                break;
        }
        return (
            <div className={className}>
                <div className="progress_bar__bar_container">
                    <div className="progress_bar__bar">
                        <div className="progress_bar__item"/>
                    </div>
                    <CloseIcon className="progress_bar__cancel"/>
                </div>
                <div className="progress_bar__label">{this.props.label}</div>
            </div>
        )
    }
}