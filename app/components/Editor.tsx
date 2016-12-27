import * as React from 'react';
import TitleBlock from './editor/TitleBlock'
import BlockHandler from './editor/BlockHandler';
import {Captions, BlockContentTypes} from '../constants'

import Error from './Error';
import {api} from '../api';

import '../styles/editor.scss';
import AxiosXHR = Axios.AxiosXHR;


interface IEditorState {
    article?: any,
    error?: any
}


export default class Editor extends React.Component<any, IEditorState> {
    constructor(props: any) {
        super(props);
    }

    handleChange(content: string, contentText: string) {
        console.log(content, contentText);
    }

    componentDidMount() {
        api.get(`/articles/editor/${this.props.params.articleSlug}/`).then((response: any) => {
            console.log(response);
            this.setState({article: response.data});
        }). catch((error) => {
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        this.setState({error: <Error code={404} msg="Page not found"/>});
                        break;
                    case 500:
                        this.setState({error: <Error/>});
                        break;
                }
            }
        })
    }

    render() {
        return (
            <div className="editor">
                <div className="editor__wrapper">
                    {this.state && this.state.article && !this.state.error ?
                        [
                            <TitleBlock key="titleBlock" articleSlug={this.props.params.articleSlug}
                                title={this.state.article.title}
                                cover={this.state.article.cover}/>,
                            <BlockHandler articleSlug={this.props.params.articleSlug}
                                          blockPosition={0}
                                          items={[
                                              BlockContentTypes.SWAP_BLOCKS,
                                              BlockContentTypes.ADD
                                          ]}/>,
                            <div className="add_content_help">{Captions.editor.add_content_help}</div>
                        ] : null
                    }
                    {this.state && this.state.error ? this.state.error : null}
                </div>
            </div>
        )
    }
}