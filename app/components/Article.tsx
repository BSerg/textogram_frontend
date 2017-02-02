import * as React from 'react';
import {IContentData} from "../actions/editor/ContentAction";
import {api} from "../api";
import Error from "./Error";

import '../styles/article.scss';


interface IArticle {
    title: string
    cover: {id: number, image: string} | null
    blocks: IContentData[]
    html: string
    published_at: string
    owner: {
        first_name: string,
        last_name: string
    }
}

interface IArticleState {
    article?: IArticle | null
    error?: any
}

export default class Article extends React.Component<any, IArticleState> {
    constructor(props: any) {
        super(props);
        this.state = {
            article: null
        }
    }

    componentDidMount() {
        api.get(`/articles/${this.props.params.articleSlug}/`).then((response: any) => {
            this.setState({article: response.data});
        }).catch((err: any) => {
            console.log(err);
            if (err.response) {
                switch (err.response.status) {
                    case 404:
                        this.setState({error: <Error code={404} msg="Article not found"/>})
                        break;
                    default:
                        this.setState({error: <Error/>})
                }
            }
        });
    }

    render() {
        let coverStyle = {};
        if (this.state.article && this.state.article.cover) {
            coverStyle = {
                background: `url('${this.state.article.cover}') no-repeat center center`
            }
        }
        return (
            !this.state.error ?
                this.state.article ?
                    <div className="article">
                        <div className="article__title" style={coverStyle}>
                            <div className="article__author">
                                <span className="article__first_name">{this.state.article.owner.first_name}</span>
                                {this.state.article.owner.last_name}
                            </div>
                            <h1>{this.state.article.title}</h1>
                            <div className="article__date">{this.state.article.published_at}</div>
                        </div>
                        <div className="content" dangerouslySetInnerHTML={{__html: this.state.article.html}}/>
                    </div>
                    : <div className="loading">LOADING...</div>
                : this.state.error
        )
    }
}