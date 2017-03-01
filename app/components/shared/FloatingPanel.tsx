import * as React from 'react';
import '../../styles/shared/floating_panel.scss';


interface IFloatingPanel {
    fixed?: boolean
    content: any
    className?: string
}

interface IFloatingPanelState {
    pinned: boolean
}

export default class FloatingPanel extends React.Component<IFloatingPanel, IFloatingPanelState> {
    scrollPosition: number;

    refs: {
        element: HTMLDivElement
    };

    constructor(props: any) {
        super(props);
        this.state = {
            pinned: false,
        };
        this.scrollPosition = null;
        this.handleScroll = this.handleScroll.bind(this);
    }

    static defaultProps = {
        fixed: false,
        scrollValueOnFix: 0
    };

    handleScroll() {
        console.log(this.scrollPosition, window.pageYOffset)
        let pinned = this.scrollPosition ? this.scrollPosition <= window.pageYOffset : this.refs.element.getBoundingClientRect().top <= 50;
        if (pinned != this.state.pinned) {
            if (pinned) {
                this.scrollPosition = window.pageYOffset;
            } else {
                this.scrollPosition = null;
            }
            this.setState({pinned: pinned});
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        this.handleScroll();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    render() {
        let className = 'floating_panel';
        if (this.props.className) className += ' ' + this.props.className;
        if (this.props.fixed && this.state.pinned) className += ' pinned';
        return (
            <div ref="element" className={className} dangerouslySetInnerHTML={{__html: this.props.content}}/>
        )
    }
}