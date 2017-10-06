import * as React from 'react';
import {Link} from 'react-router-dom';
const ConfirmIcon = require('-!babel-loader!svg-react-loader!../../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');
import './styles/AuthorPreview.scss';


export function AuthorPreview(props: {item: any}) {

    let {item} = props;

    return <Link to={'/' + item.nickname } className="author_preview">
        <div className="author_avatar"><img src={item.avatar} /></div>
        <div className="author_username">{ item.first_name + " " + item.last_name }</div>
        <div>{"Читатют " + item.subscribers }</div>
        <div>{"Текстов " + item.number_of_articles }</div>
        <div className="info">{ item.is_subscribed ? <ConfirmIcon /> : null }</div>
    </Link>;
}