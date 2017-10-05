import * as React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import {getItems, setSearchString, setSection} from './itemListActions';

export class ItemList extends React.Component<any, any> {
    
    getTimeout: number;

    constructor() {
        super();
        this.getTimeout = null;
    }

    inputHandler(e: any) {
        this.getTimeout && clearTimeout(this.getTimeout);
        this.props.setSearchString(e.target.value);
        setTimeout(() => {
            this.props.getItems();
        }, 500);
    }

    componentWillReceiveProps(nextProps: any) {
        this.props.setSection(nextProps.match.params.slug + (nextProps.match.params.subsection || ''));
    }

    comsponentDidMount() {
        this.props.setSection(this.props.match.params.slug + (this.props.match.params.subsection || ''));
    }

    render() {
        let {items, searchString} = this.props;
        return <div className="item_list">
            <div className="item_list_search" >
                <input type="text" placeholder="Поиск" value={searchString} onChange={this.inputHandler.bind(this)}  />
            </div>

            {
                items.map((item: any) => {
                    return <div key={item.id}>{item.title}</div>
                })
            }

        </div>;
    }
}


const mapStateToProps = (state: any, ownProps: any) => {
    return {
        author: state.authorData.author,
        items: state.itemList.items,
        searchString: state.itemList.searchString,
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        getItems: () => { dispatch(getItems()) },
        setSearchString: (s: any) =>{ dispatch(setSearchString(s)) },
        setSection: (section: any) => { dispatch(setSection(section)) },
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ItemList));