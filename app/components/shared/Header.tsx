import * as React from 'react';
import '../../styles/shared/header.scss';

interface IHeaderProps {
    children?: any
}

export default class Header extends React.Component<IHeaderProps, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return (<div className="header">{this.props.children}</div>);
    }
}