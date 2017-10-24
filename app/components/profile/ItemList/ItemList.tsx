import * as React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import ArticlePreview from './ArticlePreview';
import {AuthorPreview} from './AuthorPreview';
import Loading from '../../shared/Loading';
import './styles/ItemList.scss';


import {setLoading, setApiSettings, getNextItems} from './itemListActions';

export class ItemList extends React.Component<any, any> {
    
    getTimeout: any;
    div: HTMLDivElement;

    constructor() {
        super();
        this.state = {searchString: ''};
        this.handleScroll = this.handleScroll.bind(this);
    }

    static defaultProps: any = { search: true };

    setApiSettings(props: any) {
        this.props.setApiSettings(props, this.state.searchString);
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
            nextProps.match.params.section !== this.props.match.params.section ||
            (!!nextProps.author !== !!this.props.author) ||
            (nextProps.author && this.props.author && nextProps.author.id !== this.props.author.id)
        ) {
            this.setApiSettings(nextProps);
            this.setState({searchString: ''});
        }

    }

    getItemComponent() {
        if (this.props.ItemComponent) {
            return this.props.ItemComponent;
        }

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

    handleScroll() {
        let rect: ClientRect = this.div.getBoundingClientRect();
        if ((rect.bottom <= window.innerHeight) && this.props.canGetNext) {
            this.props.getNextItems();
        }
    }

    componentDidMount() {
        this.setApiSettings(this.props);
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    render() {
        let {items, pinnedItems, loading, search, isUserPage} = this.props;
        let ItemComponent = this.getItemComponent();
        if (!ItemComponent) {
            return null;
        }
        let {searchString} = this.state;
        return <div className="item_list" ref={(div) => {this.div = div}}>
            {
                pinnedItems.map((item: any) => {
                    return <ItemComponent key={item.id} item={item}/>
                })
            }
            {search && <div className="item_list_search" >
                <input type="text" placeholder="Поиск" value={searchString} onChange={this.inputHandler.bind(this)}  />
            </div>}

            {
                items.map((item: any) => {
                    return <ItemComponent key={item.id} item={item}/>
                })
            }

            { loading && <Loading /> }

        </div>;
    }
}


const mapStateToProps = (state: any, ownProps: any) => {
    let isUserPage = ownProps.match.params.slug && !ownProps.match.params.subsection && ['drafts', 'feed'].indexOf(ownProps.match.params.slug) === -1;
    let author = state.authorData.author;
    let pinnedItems = (author && author.nickname && state.authorData.pinnedItems[author.nickname]) || [];
    return {
        author,
        pinnedItems: isUserPage ? pinnedItems : [],
        items: state.itemList.items,
        loading: state.itemList.loading,
        searchString: state.itemList.searchString,
        canGetNext: !state.itemList.loading && !!state.itemList.nextUrl,
        isUserPage
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        setLoading: () =>{ dispatch(setLoading()) },
        setApiSettings: (newUrl: string, newParams: any) => {dispatch(setApiSettings(newUrl, newParams))},
        getNextItems: () => { dispatch(getNextItems()); }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ItemList));