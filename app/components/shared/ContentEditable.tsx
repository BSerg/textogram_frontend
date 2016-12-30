import * as React from 'react';

import '../../styles/shared/content_editable.scss';

type ElementType = 'inline' | 'p' | 'div' | 'ul' | 'ol';
type AlignContent = 'left' | 'center' | 'right';

interface ContentEditableProps {
    content?: string,
    className?: string,
    editable?: boolean,
    disabled?: boolean,
    onChange?: (content: string, contentText: string) => any,
    onChangeDelay?: number,
    placeholder?: string,
    allowLineBreak?: boolean,
    elementType?: ElementType,
    alignContent?: AlignContent,
    focusOnMount?: boolean,
    onFocus?: () => any,
    onBlur?: () => any,
}

interface ContentEditableState {
    content: string,
    contentText: string
}

export default class ContentEditable extends React.Component<ContentEditableProps, ContentEditableState> {
    private handleChangeDelayProcess: number;

    refs: {
        [key: string]: (Element);
        editableElement: (HTMLElement);
    };
    constructor(props: any) {
        super(props);
        this.state = {content: '', contentText: ''};
    }
    static defaultProps = {
        editable: true,
        disabled: false,
        onChangeDelay: 100,
        placeholder: 'Enter text...',
        allowLineBreak: true,
        elementType: 'p',
        alignContent: 'left',
        focusOnMount: false
    };
    private getElementEmptyContentByType () {
        switch (this.props.elementType) {
            case 'p':
                return `<p class="empty_tag" data-placeholder="${this.props.placeholder}"><br/></p>`;
            case 'div':
                return `<div class="empty_tag" data-placeholder="${this.props.placeholder}"><br/></div>`;
            case 'ul':
                return `<ul><li class="empty_tag" data-placeholder="${this.props.placeholder}"><br/></li></ul>`;
            case 'ol':
                return `<ol><li class="empty_tag" data-placeholder="${this.props.placeholder}"><br/></li></ol>`;
            default:
                return '';
        }
    }
    extractContent() {
        let content = this.refs.editableElement.innerHTML;
        let contentText = this.refs.editableElement.innerText;
        if (!this.props.allowLineBreak) {
            while (this.refs.editableElement.childNodes.length > 1) {
                this.refs.editableElement.removeChild(this.refs.editableElement.lastChild);
            }
            content = this.refs.editableElement.innerHTML;
            contentText = this.refs.editableElement.innerText;
        }
        return {
            content: content,
            contentText: contentText
        }
    }
    handleInput (e?: Event) {
        console.log('HEY, INPUT')
        clearTimeout(this.handleChangeDelayProcess);
        this.setState(this.extractContent(), () => {
            if (!this.state.contentText.trim()) {
                this.refs.editableElement.innerHTML = this.getElementEmptyContentByType();
            }
            if (this.props.onChange) {
                this.handleChangeDelayProcess = window.setTimeout(() => {
                    this.props.onChange(this.state.content, this.state.contentText);
                }, this.props.onChangeDelay);
            }
        });
    }
    handleFocus() {
        this.props.onFocus && this.props.onFocus();
    }
    handleBlur() {
        this.props.onBlur && this.props.onBlur();
    }
    handlePaste(e: any) {
        let content;
        e.preventDefault();
        if(e.clipboardData || e.originalEvent.clipboardData ){
            content = (e.originalEvent || e).clipboardData.getData('text/plain');
            document.execCommand('insertText', false, content);
        }
    }
    componentDidMount() {
        this.setState(this.extractContent());
        if (this.props.focusOnMount) {
            setTimeout(() => {
                this.refs.editableElement.focus();
            }, 0)
        }
    }
    render() {
        let className = 'content_editable';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        if (this.props.disabled) {
            className += ' disabled'
        }
        if (!this.state.contentText.trim().length) {
            className += ' empty'
        }
        className += (this.props.alignContent == 'left' ? '' : (' ' + this.props.alignContent));
        return (
            <div ref="editableElement"
                 className={className}
                 data-placeholder={this.props.placeholder}
                 contentEditable={this.props.editable}
                 onInput={this.handleInput.bind(this)}
                 onPaste={this.handlePaste.bind(this)}
                 onFocus={this.handleFocus.bind(this)}
                 onBlur={this.handleBlur.bind(this)}
                 dangerouslySetInnerHTML={{__html: this.props.content || this.getElementEmptyContentByType()}}>
            </div>
        )
    }
}