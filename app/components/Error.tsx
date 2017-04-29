import * as React from 'react';
import '../styles/error.scss';

interface ErrorProps {
    code?: number,
    msg?: string
}

export default class Error extends React.Component<ErrorProps, {}> {
    constructor() {
        super();
    }

    static defaultProps = {
        code: 500,
        msg: "ERROR. We are working on this problem"
    };

    render() {
        return (
            <div className="error">
                ERROR {this.props.code}! {this.props.msg}
            </div>
        )
    }
}

export class Error404 extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="error error404">
                <div className="error__wrapper">
                    <div className="error__image"></div>
                    <div className="error__content">
                        <div className="error__code"></div>
                        <div className="error__msg">Страница не найдена</div>
                    </div>
                </div>
            </div>
        )
    }
}

export class Error403 extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="error error403">
                <div className="error__wrapper">
                    <div className="error__image"></div>
                    <div className="error__content">
                        <div className="error__code"></div>
                        <div className="error__msg">
                            Кажется, у вас нет доступа<br/>
                            к этой странице, сорян
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export class Error500 extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="error error500">
                <div className="error__wrapper">
                    <div className="error__image"></div>
                    <div className="error__content">
                        <div className="error__code"></div>
                        <div className="error__msg">
                            Мы все исправим, а пока держитесь<br/>
                            здесь, всего вам доброго, хорошего<br/>
                            настроения и здоровья
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

