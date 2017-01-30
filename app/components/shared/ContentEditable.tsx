import * as React from 'react';
import {
    PopupPanelAction, OPEN_POPUP, BACK_POPUP, REPLACE_POPUP,
    CLOSE_POPUP
} from "../../actions/shared/PopupPanelAction";


import '../../styles/shared/content_editable.scss';
import TextFormatPopup from "../editor/TextFormatPopup";
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import URLModal from "../editor/URLModal";

type ElementType = 'inline' | 'p' | 'div' | 'ul' | 'ol';
type AlignContent = 'left' | 'center' | 'right';

interface ContentEditableProps {
    id?: number|string
    content?: string
    className?: string
    editable?: boolean
    disabled?: boolean
    onChange?: (content: string, contentText: string) => any
    onChangeDelay?: number
    placeholder?: string
    allowLineBreak?: boolean
    elementType?: ElementType
    alignContent?: AlignContent
    focusOnMount?: boolean
    onFocus?: () => any
    onBlur?: () => any
    onKeyDown?: (e: KeyboardEvent) => any
    enableTextFormat?: boolean
}

interface ISelection {
    selection?: Selection
    range?: Range
}

interface ContentEditableState {
    content?: string
    contentText?: string
    textFormatMode?: boolean
    selectionState?: ISelection | null
    textFormatPopupId?: string
}

export default class ContentEditable extends React.Component<ContentEditableProps, ContentEditableState> {
    private handleChangeDelayProcess: number;

    refs: {
        [key: string]: (Element);
        editableElement: (HTMLElement);
    };
    constructor(props: any) {
        super(props);
        this.state = {
            content: '',
            contentText: '',
            textFormatMode: false,
            textFormatPopupId: null
        };
    }
    static defaultProps = {
        id: 'contentEditable' + Math.random().toString().substr(2, 7),
        editable: true,
        disabled: false,
        onChangeDelay: 100,
        placeholder: 'Enter value...',
        allowLineBreak: true,
        elementType: 'p',
        alignContent: 'left',
        focusOnMount: false,
        forceUpdateContent: false,
        enableTextFormat: false
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
    setCursorTo(element: Node|HTMLElement, offset: number = 0) {
        let range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    cleanElement() {
        if (this.props.elementType != 'inline') {
            let elementsForExcluding = this.refs.editableElement.parentElement.querySelectorAll(
                `.content_editable > :not(${this.props.elementType})`
            );
            if (elementsForExcluding.length) {
                for (let i = 0; i < elementsForExcluding.length; i++) {
                    this.refs.editableElement.removeChild(elementsForExcluding[i]);
                }
                this.setCursorTo(this.refs.editableElement.lastChild);
            }
        }
    }
    updateEmptyState() {
        if (!this.state.contentText.trim()) {
            this.refs.editableElement.classList.add('empty');
        } else {
            this.refs.editableElement.classList.remove('empty');
        }
    }
    handleInput (e?: Event) {
        clearTimeout(this.handleChangeDelayProcess);
        this.setState(this.extractContent(), () => {
            this.updateEmptyState();
            if (!this.state.contentText.trim()) {
                this.refs.editableElement.innerHTML = this.getElementEmptyContentByType();
                let el = this.refs.editableElement.childNodes[0];
                if (el instanceof Node) {
                    this.setCursorTo(el);
                }
            } else {
                this.cleanElement();
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
        if (this.state.textFormatPopupId) {
            PopupPanelAction.do(CLOSE_POPUP, {id: this.state.textFormatPopupId});
            this.state.textFormatPopupId = null;
        }
    }
    handlePaste(e: any) {
        let content;
        e.preventDefault();
        if(e.clipboardData || e.originalEvent.clipboardData ){
            content = (e.originalEvent || e).clipboardData.getData('text');
            document.execCommand('insertText', false, content);
        }
    }
    handleKeyDown(e: KeyboardEvent) {
        if (!this.props.allowLineBreak && e.keyCode == 13) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.props.onKeyDown && this.props.onKeyDown(e);
    }
    private restoreSelection() {
        if (this.state.selectionState) {
            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.state.selectionState.range);
        }
    }
    handleSelect(e: Event) {
        if (!this.props.enableTextFormat) return;
        let selection = window.getSelection();
        if (!selection.isCollapsed) {
            let range = selection.getRangeAt(0);
            let content = <TextFormatPopup
                isBold={document.queryCommandState("bold")}
                isItalic={document.queryCommandState("italic")}
                isURL={document.queryCommandState("CreateLink")}
                onBold={() => {document.execCommand('bold')}}
                onItalic={() => {document.execCommand('italic')}}
                onURL={() => {
                    ModalAction.do(
                        OPEN_MODAL,
                        {content: <URLModal onURL={(url) => {
                            ModalAction.do(CLOSE_MODAL, null);
                            window.setTimeout(() => {
                                let _selection = window.getSelection();
                                _selection.removeAllRanges();
                                _selection.addRange(range);
                                document.execCommand('createLink', false, url);
                            }, 50);
                        }}/>}
                    );
                }}
                onClose={() => {
                    PopupPanelAction.do(CLOSE_POPUP, {id: 'text_formatting'});
                }}/>;
            PopupPanelAction.do(OPEN_POPUP, {content: content, id: 'text_formatting'});
        } else {
            PopupPanelAction.do(CLOSE_POPUP, {id: 'text_formatting'});
        }
    }
    componentDidMount() {
        this.setState(this.extractContent(), () => {
            this.updateEmptyState();
        });
        if (this.props.focusOnMount) {
            setTimeout(() => {
                this.refs.editableElement.focus();
            }, 0)
        }
    }
    componentWillUnmount() {
        PopupPanelAction.do(CLOSE_POPUP, {id: 'text_formatting'});
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        return false;
    }
    render() {
        let className = 'content_editable';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        if (this.props.disabled) {
            className += ' disabled'
        }
        className += (this.props.alignContent == 'left' ? '' : (' ' + this.props.alignContent));
        return (
            <div ref="editableElement"
                 id={this.props.id.toString()}
                 className={className}
                 data-placeholder={this.props.placeholder}
                 contentEditable={this.props.editable}
                 onInput={this.handleInput.bind(this)}
                 onPaste={this.handlePaste.bind(this)}
                 onFocus={this.handleFocus.bind(this)}
                 onBlur={this.handleBlur.bind(this)}
                 onKeyDown={this.handleKeyDown.bind(this)}
                 onSelect={this.handleSelect.bind(this)}
                 dangerouslySetInnerHTML={{__html: this.props.content || this.getElementEmptyContentByType()}}>
            </div>
        )
    }
}