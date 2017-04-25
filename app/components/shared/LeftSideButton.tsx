import * as React from 'react';
import '../../styles/shared/left_side_button.scss';

interface ILeftSideButtonProps {
    className?: string;
    tooltip?: string;
    onClick?: () => any;
    small?: boolean;
    hideDelay?: number;
}

export default class LeftSideButton extends React.Component<ILeftSideButtonProps, any> {
    private lastScrollPosition: number;
    private scrollDelta: number;
    private scrollDirection: string;
    private hideTimeout: number;

    constructor(props: any) {
        super(props);
        this.state = {
            hidden: false
        };
        this.hideTimeout = null;
        this.scrollDelta = 0;
        this.checkScroll = this.checkScroll.bind(this);
    }

    static defaultProps = {
        small: false,
        hideDelay: 0
    };

    checkScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop == 0) {
            this.setState({hidden: false});
        }
        if (scrollTop > this.lastScrollPosition){
            this.scrollDelta = 0;
            if (this.scrollDirection != 'down') {
                this.scrollDirection = 'down';
                this.hideTimeout = window.setTimeout(() => {
                    this.setState({hidden: true});
                }, this.props.hideDelay);
            }
        } else {
            if (this.scrollDirection != 'up') {
                this.scrollDirection = 'up';
            } else {
                this.scrollDelta += (scrollTop - this.lastScrollPosition);
            }
        }
        if (this.scrollDelta <= -20) {
            this.hideTimeout = window.setTimeout(() => {
                this.setState({hidden: false});
            }, this.props.hideDelay);        }
        this.lastScrollPosition = scrollTop;
    }

    componentDidMount() {
        document.addEventListener('scroll', this.checkScroll);
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.checkScroll);
    }

    render() {
        let className = 'left_side_button';
        if (this.props.small) className += ' small';
        if (this.props.className) className += ' ' + this.props.className;
        if (this.state.hidden) className += ' hidden';

        let props: any = {className: className};
        if (this.props.tooltip) props['data-tooltip'] = this.props.tooltip;
        if (this.props.onClick) props.onClick = this.props.onClick;

        return (
            <div {...props}>
                {this.props.children}
            </div>
        )
    }
}