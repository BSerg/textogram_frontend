import * as React from 'react';
// import {MenuAction, TOGGLE} from '../../actions/MenuAction';
import LeftSideButton from "./LeftSideButton";
import '../../styles/shared/menu_button.scss';

import {connect} from 'react-redux';
import {openMenu} from '../../store/menu';

interface MenuButtonStateInterface {
    hidden?: boolean,
    menuDisplayed?: boolean,
}

export class MenuButton1 extends React.Component<any, MenuButtonStateInterface> {

    constructor(props: any) {
        super(props);
        this.state = {hidden: false, menuDisplayed: false};
        this.setMenuDisplayed = this.setMenuDisplayed.bind(this);
    }

    handleClick() {
        // MenuAction.do(TOGGLE, true);
    }

    setMenuDisplayed() {
        // this.setState({menuDisplayed: MenuAction.getStore().open});
    }

    componentDidMount() {
        this.setMenuDisplayed();
        // MenuAction.onChange(TOGGLE, this.setMenuDisplayed);
    }

    componentWillUnmount() {
        // MenuAction.unbind(TOGGLE, this.setMenuDisplayed)
    }

    render() {

        return (
            <LeftSideButton hidden={this.state.hidden || this.state.menuDisplayed} className="menu_button" onClick={this.handleClick}/>
        )
    }
}

export const MenuButton = (props: {menuDisplayed: boolean, openMenu: () => any}) => <LeftSideButton 
    hidden={props.menuDisplayed} 
    className="menu_button" 
    onClick={props.openMenu}/>;

const mapStateToProps = (state: any, ownProps: any) => {
    return {
        menuDisplayed: state.menu.open
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        openMenu: () => { dispatch(openMenu()) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuButton);