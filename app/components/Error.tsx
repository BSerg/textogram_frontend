import * as React from 'react';

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
            <Error code={404} msg="Page not found"/>
        )
    }
}