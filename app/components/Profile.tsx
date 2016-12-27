import * as React from 'react';

export default class Profile extends React.Component<any, any> {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="profile">
                THIS IS #{this.props.params.userId}'s PROFILE!
            </div>
        )
    }
}