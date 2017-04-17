import * as React from 'react';
import ProfileArticles from './ProfileArticles';
import {MenuAction, TOGGLE} from '../../actions/MenuAction';

const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');


interface IDraftsProps {
    closeCallback: () => void
}




interface IDraftsState {
    menuOpen?: boolean
}


export default class ProfileDrafts extends React.Component<IDraftsProps, IDraftsState> {

    constructor() {
        super();
        this.state = {menuOpen: Boolean(MenuAction.getStore().open)};
        this.setMenuOpen = this.setMenuOpen.bind(this);
    }

    setMenuOpen() {
        this.setState({menuOpen: Boolean(MenuAction.getStore().open)});

    }

    componentDidMount() {
        MenuAction.onChange(TOGGLE, this.setMenuOpen)
    }

    
    componentWillUnmount() {
        MenuAction.unbind(TOGGLE, this.setMenuOpen);
    }

    render() {
        return (
            <div className={"profile_additional profile_drafts" + (this.state.menuOpen ? " adjusted" : "")}>
                { this.props.closeCallback ? (<div onClick={this.props.closeCallback} className="profile_additional_close">
                    <CloseIcon />
                </div>) : null }
                <div className="profile_additional_container">
                    <ProfileArticles section={"drafts"} isSelf={true} />
                </div>
            </div>)
    }
}