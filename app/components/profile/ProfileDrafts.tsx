import * as React from 'react';
import ProfileArticles from './ProfileArticles';
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');


interface IDraftsProps {
    closeCallback: () => void
}

interface IDraftsState {
    menuOpen?: boolean
}


export default class ProfileDrafts extends React.Component<IDraftsProps, any> {

    constructor() {
        super();
        this.state = {items: []};
    }

    render() {
        return (
            <div className="profile_additional profile_drafts">
                { this.props.closeCallback ? (<div onClick={this.props.closeCallback} className="profile_additional_close">
                    <CloseIcon />
                </div>) : null }
                <div className="profile_additional_container">
                    <ProfileArticles section={"drafts"} isSelf={true} />
                </div>
            </div>)
    }
}