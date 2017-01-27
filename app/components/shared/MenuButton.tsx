import * as React from 'react';
import '../../styles/shared/menu_button.scss';

interface MenuButtonPropsInterface {
    disabled?: boolean,
    hideDelay?: number,
}

interface MenuButtonStateInterface {
    hidden: boolean
}

export default class MenuButton extends React.Component<MenuButtonPropsInterface, MenuButtonStateInterface> {
    private lastScrollPosition: number;
    private scrollDelta: number;
    private scrollDirection: string;
    private hideTimeout: number;

    constructor(props: any) {
        super(props);
        this.state = {hidden: false};
        this.hideTimeout = null;
        this.scrollDelta = 0;
    }

    static defaultProps = {
        disabled: false,
        hideDelay: 0
    };

    handleClick() {
        console.log('MENU BUTTON CLICKED');
    }

    checkScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
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
        document.addEventListener('scroll', this.checkScroll.bind(this));
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.checkScroll.bind(this));
    }

    render() {
        let className = 'menu_button';
        if (this.state.hidden) {
            className += ' hidden';
        }
        return (
            <div className={className} onClick={this.handleClick}></div>
        )
    }
}