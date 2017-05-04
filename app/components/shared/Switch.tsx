import * as React from 'react';
import '../../styles/shared/switch.scss';


interface ISwitchProps {
    isActive?: boolean
    disabled?: boolean
    onChange?: (isActive: boolean) => any
    className?: string
}

interface ISwitchState {
    isActive?: boolean
}

export default class Switch extends React.Component<ISwitchProps, ISwitchState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isActive: this.props.isActive
        }
    }

    static defaultProps = {
        isActive: false,
        disabled: false
    };

    toggle() {
        if (this.props.disabled) return;
        this.setState({isActive: !this.state.isActive}, () => {
            this.props.onChange && this.props.onChange(this.state.isActive);
        });
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.state.isActive != nextProps.isActive) {
            this.setState({isActive: nextProps.isActive});
        }
    }

    render() {
        let className = 'switch';
        if (this.state.isActive) {
            className += ' active';
        }
        if (this.props.disabled) {
            className += ' disabled';
        }
        if (this.props.className) {
            className += ' ' + this.props.className;
        }

        return (
            <div onClick={this.toggle.bind(this)} className={className}>
                <div className="switch__bg"/>
                <div className="switch__switcher"/>
            </div>
        )
    }
}