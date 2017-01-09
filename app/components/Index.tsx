import * as React from 'react';
import {Link} from 'react-router';
import {UserAction, GET_ME, LOGIN} from '../actions/user/UserAction';


export default class IndexPage extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    redirectToProfile() {
        if (UserAction.getStore().user && UserAction.getStore().user.id)
            this.props.router.push('profile/' + UserAction.getStore().user.id);
    }

    componentDidMount() {
        UserAction.onChange(GET_ME, this.redirectToProfile.bind(this));
        UserAction.onChange(LOGIN, this.redirectToProfile.bind(this));
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.redirectToProfile.bind(this));
        UserAction.unbind(LOGIN, this.redirectToProfile.bind(this));
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