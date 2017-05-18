import * as React from 'react';


export default class ArticlePreviewStatistics extends React.Component<{item: any}, any> {

    render() {
        return (
            <div>
                <div>
                    {this.props.item.title}
                </div>

                <div>

                </div>

            </div>)
    }
}