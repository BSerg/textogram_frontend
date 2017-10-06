import * as React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import ArticlePreview from './ArticlePreview';
import {AuthorPreview} from './AuthorPreview';


import {setLoading, setApiSettings} from './itemListActions';

export class ItemList extends React.Component<any, any> {
    
    getTimeout: any;

    constructor() {
        super();
        this.state = {searchString: ''};
        this.getTimeout = null;
    }

    setApiSettings(props: any) {
        let apiUrl;
        let requestParams: any = {};
        let params = props.match.params;

        if (params.subsection) {
            apiUrl = '/users/';
            let id = (props.author && props.author.id) || '';
            switch(params.subsection) {
                case('following'):
                    requestParams['subscribed_by'] = id;
                    break;
                case('followers'):
                    requestParams['subscribed_to'] = id;
                    break;
                default:
                    break;
            }
            if (this.state.searchString) {
                requestParams['search_string'] = this.state.searchString;
            }

        }
        else if (params.slug && !params.subsection) {
            switch(params.slug) {
                case ('drafts'):
                    requestParams['drafts'] = true;
                    apiUrl = '/articles/';
                    break;
                case ('feed'):
                    requestParams['feed'] = true;
                    apiUrl = '/_/articles/';
                    break;
                default:
                    requestParams['user'] = (props.author && props.author.id) || '';
                    apiUrl = '/_/articles/';
            }
            if (this.state.searchString) {
                apiUrl = `${apiUrl}search/`;
                requestParams['q'] = this.state.searchString;
            }
        }
        if (apiUrl) {
            this.props.setApiSettings(apiUrl, requestParams);
        }
    }


    inputHandler(e: any) {
        this.getTimeout && clearTimeout(this.getTimeout);
        this.setState({searchString: e.target.value}, () => {
            this.props.setLoading();
            this.getTimeout && clearTimeout(this.getTimeout);

            this.getTimeout = setTimeout(() => {
                this.setApiSettings(this.props);
            }, 1000);
        });
        
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.match.params.slug !== this.props.match.params.slug ||
            nextProps.match.params.subsection !== this.props.match.params.subsection ||
            (!!nextProps.author !== !!this.props.author) ||
            (nextProps.author && this.props.author && nextProps.author.id !== this.props.author.id)
        ) {
            this.setApiSettings(nextProps);
        }

    }

    getItemComponent() {
        if (this.props.ItemListComponent) {
            return this.props.ItemListComponent;
        }
        if (this.props.match.params.subsection === 'followers' || this.props.match.params.subsection === 'following') {
            return AuthorPreview;
        }
        else if (this.props.match.params.slug && !this.props.match.params.subsection) {
            return ArticlePreview;
        }
        return null;
        
    }

    componentDidMount() {
        this.setApiSettings(this.props);
    }

    render() {
        let {items} = this.props;

        let ItemComponent = this.getItemComponent();
        if (!ItemComponent) {
            return null;
        }
        let {searchString} = this.state;
        return <div className="item_list">
            <div className="item_list_search" >
                <input type="text" placeholder="Поиск" value={searchString} onChange={this.inputHandler.bind(this)}  />
            </div>

            {
                items.map((item: any) => {
                    return <ItemComponent key={item.id} item={item}/>
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
        setLoading: () =>{ dispatch(setLoading()) },
        setApiSettings: (newUrl: string, newParams: any) => {dispatch(setApiSettings(newUrl, newParams))},
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ItemList));