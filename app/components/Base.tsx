import * as React from 'react';
import MenuButton from './shared/MenuButton';
import Modal from './shared/Modal';
import PopupPanel from './shared/PopupPanel';
import Menu from './Menu';

import '../styles/base.scss';

export default class Base extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <div className="container">
                <div className="content">
                    {this.props.children}
                </div>
                <MenuButton/>
                <Menu />
                <Modal/>
                <PopupPanel/>
            </div>
        )
    }
}