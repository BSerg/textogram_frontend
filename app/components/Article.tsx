import * as React from 'react';

export default class Article extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="article">
                THIS IS THE ARTICLE!
                <div style={{height: '1000px', backgroundColor: 'gray'}}></div>
            </div>
        )
    }
}