import * as React from 'react';
import {MenuAction, TOGGLE} from '../../actions/MenuAction';
import LeftSideButton from "./LeftSideButton";
import '../../styles/shared/menu_button.scss';

interface MenuButtonStateInterface {
    hidden?: boolean,
    menuDisplayed?: boolean,
}

export default class MenuButton extends React.Component<any, MenuButtonStateInterface> {

    constructor(props: any) {
        super(props);
        this.state = {hidden: false, menuDisplayed: false};
        this.setMenuDisplayed = this.setMenuDisplayed.bind(this);
    }

    handleClick() {
        MenuAction.do(TOGGLE, true);
    }

    setMenuDisplayed() {
        this.setState({menuDisplayed: MenuAction.getStore().open});
    }

    componentDidMount() {
        this.setMenuDisplayed();
        MenuAction.onChange(TOGGLE, this.setMenuDisplayed);
    }

    componentWillUnmount() {
        MenuAction.unbind(TOGGLE, this.setMenuDisplayed)
    }

    render() {
        return (
            <LeftSideButton hidden={this.state.hidden || this.state.menuDisplayed} className="menu_button" onClick={this.handleClick}/>
        )
    }
}