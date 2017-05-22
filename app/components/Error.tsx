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
        let className = process.env.IS_LENTACH ? 'error_lentach' : 'error';

        return (
            <div className={className + " error404"}>
                <div className="error__wrapper">
                    <div className="error__image"></div>
                    <div className="error__content">
                        <div className="error__code">{!process.env.IS_LENTACH ? 404 : null}</div>
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
        let className = process.env.IS_LENTACH ? 'error_lentach' : 'error';
        return (
            <div className={className + " error403"}>
                <div className="error__wrapper">
                    <div className="error__image"></div>
                    <div className="error__content">
                        <div className="error__code">{!process.env.IS_LENTACH ? 403 : null}</div>
                        {process.env.IS_LENTACH ?
                            <div className="error__msg">
                                Кажется, у вас нет доступа<br/>
                                к этой странице, сорян
                            </div> : <div>У вас нет доступа к этой странице.</div>
                        }
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
        let className = process.env.IS_LENTACH ? 'error_lentach' : 'error';
        return (
            <div className={className + " error500"}>
                <div className="error__wrapper">
                    <div className="error__image"></div>
                    <div className="error__content">
                        <div className="error__code">{!process.env.IS_LENTACH ? 500 : null}</div>
                        {process.env.IS_LENTACH ?
                            <div className="error__msg">
                                Мы все исправим, а пока держитесь<br/>
                                здесь, всего вам доброго, хорошего<br/>
                                настроения и здоровья
                            </div> : <div>Произошла ошибка. Очень скоро мы решим эту проблему.</div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

