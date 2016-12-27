import * as React from 'react';
import {Link} from 'react-router';

export default class Index extends React.Component<any, any> {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="index">
                <h2>HELLO, TEXTORGAM! HELLO!</h2>

                <h4>Go to profile</h4>
                <Link to="/profile/user">Пользователь</Link>

                <h4>Articles</h4>
                <ul>
                    <li>
                        <Link to="/hello">Hello, Article!</Link>
                        <Link to="/hello/edit">Редактировать</Link>
                    </li>
                    <li>
                        <Link to="/new">New Article!</Link>
                        <Link to="/hello/edit">Редактировать</Link>
                    </li>
                    <li>
                        <Link to="/good-bye">Good Bye, Article!</Link>
                        <Link to="/hello/edit">Редактировать</Link>
                    </li>
                </ul>

                <h4>Go to Error page</h4>
                <Link to="/error/page">error page</Link>
            </div>
        )
    }
}