import * as React from 'react';
import {Link} from 'react-router';

import '../../styles/shared/author_list.scss';

const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');
const ConfirmIcon = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');

interface IAuthorListPropsInterface {
    items: any[],
    clickUnSubscribe?: (itemId: number|string) => {}
}

export default class AuthorList extends React.Component<IAuthorListPropsInterface, any> {

    clickUnSubscribe(itemId: number|string, e: any) {
        e.stopPropagation();
        if (this.props.clickUnSubscribe) {
            this.props.clickUnSubscribe(itemId);
        }
    }

    render() {

        return (<div className="author_list">
            {
                this.props.items.map((item: any, index: number) => {

                    console.log(item);


                    return (<div key={index} className="author_list__author">

                        <Link to={"/profile/" + item.id}>
                            <div className="avatar" style={ {
                                background: `url('${item.avatar || ''}') no-repeat center center`
                              } }></div>
                        </Link>

                        <div className="name">
                            <Link to={"/profile/" + item.id}>
                                <span>{item.first_name} </span> <span>{item.last_name}</span>
                            </Link>
                        </div>

                        <div className="filler"></div>

                        { this.props.clickUnSubscribe ? (
                            <div className="close" onClick={this.clickUnSubscribe.bind(this, item.id)}><CloseIcon /></div>) : null
                        }

                    </div>)
                })
            }
        </div>)
    }
}
