import * as React from 'react';
import '../../styles/shared/menu_button.scss';
import {MenuAction, TOGGLE} from '../../actions/MenuAction';

interface MenuButtonPropsInterface {
    disabled?: boolean,
    hideDelay?: number,
    hideScrollDelta?: number
}

interface MenuButtonStateInterface {
    hidden?: boolean,
    menuDisplayed?: boolean,
}

export default class MenuButton extends React.Component<MenuButtonPropsInterface, MenuButtonStateInterface> {
    private lastScrollPosition: number;
    private scrollDelta: number;
    private scrollDirection: string;
    private hideTimeout: number;

    constructor(props: any) {
        super(props);
        this.state = {hidden: false, menuDisplayed: false};
        this.hideTimeout = null;
        this.scrollDelta = 0;
        this.checkScroll = this.checkScroll.bind(this);
        this.setMenuDisplayed = this.setMenuDisplayed.bind(this);
    }

    static defaultProps = {
        disabled: false,
        hideDelay: 0,
        hideScrollDelta: 100
    };

    handleClick() {
        MenuAction.do(TOGGLE, true);
    }

    checkScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop == 0) {
            this.setState({hidden: false});
        }
        if (scrollTop >= this.lastScrollPosition){
            this.scrollDelta += (scrollTop - this.lastScrollPosition);
        } else {
            this.scrollDelta = 0;
            this.setState({hidden: false});
        }
        if (this.scrollDelta > this.props.hideScrollDelta) {
            window.clearTimeout(this.hideTimeout);
            this.hideTimeout = window.setTimeout(() => {
                this.setState({hidden: true});
            }, this.props.hideDelay);        }
        this.lastScrollPosition = scrollTop;
    }

    setMenuDisplayed() {
        this.setState({menuDisplayed: MenuAction.getStore().open});
    }

    componentDidMount() {

        document.addEventListener('scroll', this.checkScroll);
        this.setMenuDisplayed();
        MenuAction.onChange(TOGGLE, this.setMenuDisplayed);
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.checkScroll);
        MenuAction.unbind(TOGGLE, this.setMenuDisplayed)
    }

    render() {

        let className = 'menu_button';
        if (this.state.hidden || this.state.menuDisplayed) {
            className += ' hidden';
        }
        return (
            <div className={className} onClick={this.handleClick}></div>
        )
    }
}