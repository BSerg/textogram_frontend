import * as React from 'react';
import {IContentData} from "../actions/editor/ContentAction";
import {api} from "../api";
import Error from "./Error";

import '../styles/article.scss';
import {UserAction, LOGIN, LOGOUT, UPDATE_USER, SAVE_USER} from "../actions/user/UserAction";

const EditButton = require('babel!svg-react!../assets/images/edit.svg?name=EditButton');
const DeleteButton = require('babel!svg-react!../assets/images/redactor_icon_delete.svg?name=DeleteButton');

interface IArticle {
    id: number
    slug: string
    title: string
    cover: {id: number, image: string} | null
    blocks: IContentData[]
    html: string
    published_at: string
    owner: {
        id: number,
        first_name: string,
        last_name: string
    }
}

interface IArticleState {
    article?: IArticle | null
    error?: any
    isSelf?: boolean
}

export default class Article extends React.Component<any, IArticleState> {
    constructor(props: any) {
        super(props);
        this.state = {
            article: null,
            isSelf: false
        }
    }

    handleUser() {
        let user = UserAction.getStore().user;
        if (user && this.state.article) {
            this.setState({isSelf: user.id == this.state.article.owner.id});
        }
    }

    editArticle() {
        this.state.article && this.props.router.push(`/articles/${this.state.article.id}/edit`);
    }

    processArticle() {
        let videoEmbeds = document.getElementsByClassName('embed video');
        for (let i in videoEmbeds) {
            let video = videoEmbeds[i] as HTMLDivElement;
            if (video) {
                try {
                    video.style.height = video.offsetWidth * 450 / 800 + 'px';
                    let iframe = video.getElementsByTagName('iframe')[0];
                    if (iframe) {
                        iframe.addEventListener('load', () => {
                            iframe.style.height = iframe.offsetWidth * 450 / 800 + 'px';
                            video.style.visibility = "visible";
                        });
                    }
                } catch (err) {

                }
            }
        }
        try {
            let posts = document.getElementsByClassName('embed post');
            for (let i in posts) {
                // TWITTER LOAD EMBED
                twttr.widgets && twttr.widgets.load(posts[i]);
            }
        } catch (err) {
            console.log('TWITTER EMBED LOADING ERROR', err);
        }
        try {
            // INSTAGRAM LOAD EMBED
            instgrm.Embeds.process();
        } catch (err) {
            console.log('INSTAGRAM EMBED LOADING ERROR', err);
        }


    }

    componentDidMount() {
        UserAction.onChange([LOGIN, LOGOUT, UPDATE_USER, SAVE_USER], this.handleUser);
        api.get(`/articles/${this.props.params.articleSlug}/`).then((response: any) => {
            let isSelf = UserAction.getStore().user ? UserAction.getStore().user.id == response.data.owner.id : false;
            this.setState({article: response.data, isSelf: isSelf}, () => {
                window.setTimeout(() => {
                    this.processArticle();
                }, 50);
            });
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

    componentWillUnmount() {
        UserAction.unbind([LOGIN, LOGOUT, UPDATE_USER, SAVE_USER], this.handleUser);
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
                    <div id={"article" + this.state.article.id} className="article">
                        <div className={"article__title" + (this.state.article.cover ? ' inverted' : '')} style={coverStyle}>
                            <div className="article__author">
                                <span className="article__first_name">{this.state.article.owner.first_name}</span>
                                {this.state.article.owner.last_name}
                            </div>
                            <h1>{this.state.article.title}</h1>
                            <div className="article__date">{this.state.article.published_at}</div>
                        </div>
                        <div className="content" dangerouslySetInnerHTML={{__html: this.state.article.html}}/>
                        {this.state.isSelf ?
                            <div className="article__tools">
                                {/*<DeleteButton/>*/}
                                <EditButton onClick={this.editArticle.bind(this)}/>
                            </div> : null
                        }
                    </div>
                    : <div className="loading">LOADING...</div>
                : this.state.error
        )
    }
}