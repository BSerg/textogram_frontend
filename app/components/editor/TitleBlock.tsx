import * as React from 'react';
import {Captions, Constants} from '../../constants';
import ContentEditable from '../shared/ContentEditable';

import {TitleBlockAction, UPDATE_COVER_ACTION, UPDATE_TITLE_ACTION} from '../../actions/editor/TitleBlockAction';

import {api} from '../../api';

import '../../styles/editor/title_block.scss';

interface TitleBlockPropsInterface {
    title: string|null,
    cover: string|null,
    articleSlug: string
}

interface TitleBlockStateInterface {
    title?: string|null,
    cover?: string|null,
}

export default class TitleBlock extends React.Component<TitleBlockPropsInterface, TitleBlockStateInterface> {
    constructor(props: any) {
        super(props);
        this.state = {
            title: props.title,
            cover: props.cover
        }
    }

    refs: {
        fileInput: HTMLInputElement;
        componentRootElement: HTMLElement
    };

    openFileDialog() {
        this.refs.fileInput.click();
    }

    handleTitle(content: string, contentText: string) {
        TitleBlockAction.do(UPDATE_TITLE_ACTION, {articleSlug: this.props.articleSlug, title: contentText})
    }

    handleCover() {
        var file = this.refs.fileInput.files[0];
        TitleBlockAction.do(UPDATE_COVER_ACTION, {articleSlug: this.props.articleSlug, cover: file});
    }

    deleteCover() {
        TitleBlockAction.do(UPDATE_COVER_ACTION, {articleSlug: this.props.articleSlug, cover: null});
    }

    handleChangeCover() {
        let store: any = TitleBlockAction.getStore();
        console.log(store);
        this.setState({cover: store.cover});
    }

    handleScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.refs.componentRootElement.style.backgroundPositionY = 'calc(50% + ' + 0.2 * scrollTop + 'px)';
    }

    componentDidMount() {
        document.addEventListener('scroll', this.handleScroll.bind(this));
        TitleBlockAction.onChange(UPDATE_COVER_ACTION, this.handleChangeCover.bind(this));
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.handleScroll.bind(this));
        TitleBlockAction.unbind(UPDATE_COVER_ACTION, this.handleChangeCover.bind(this));
    }

    render() {
        let className = 'title_block',
            style = {};
        if (this.state.cover) {
            className += ' inverse';
            style = {background: 'url("' + this.state.cover + '") no-repeat center center', backgroundSize: 'cover'}
        }

        return (
            <div className={className} style={style} ref="componentRootElement">
                {!this.state.cover ?
                    <div onClick={this.openFileDialog.bind(this)} className="title_block__cover_handler">
                        {Captions.editor.add_cover_ru}
                    </div> :
                    <div onClick={this.deleteCover.bind(this)} className="title_block__cover_handler">
                        {Captions.editor.remove_cover_ru}
                    </div>
                }
                <ContentEditable className="title_block__title"
                                 elementType="inline"
                                 allowLineBreak={false}
                                 alignContent="center"
                                 focusOnMount={!this.state.title}
                                 onChange={this.handleTitle.bind(this)}
                                 placeholder={Captions.editor.enter_title_ru}
                                 content={this.state.title}/>
                <input ref="fileInput"
                       type="file"
                       style={{display: 'none'}}
                       accept="image/jpeg,image/png,image/gif"
                       onChange={this.handleCover.bind(this)}/>
            </div>
        )
    }
}