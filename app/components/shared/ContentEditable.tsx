import * as React from "react";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../../actions/shared/PopupPanelAction";
import "../../styles/shared/content_editable.scss";
import TextFormatPopup from "../editor/TextFormatPopup";
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import URLModal from "../editor/URLModal";
import {MediaQuerySerice} from "../../services/MediaQueryService";
import {ContentEditableAction, RESET_FORMAT_TOOL} from "../../actions/shared/ContentEditableAction";

type ElementType = 'inline' | 'p' | 'div' | 'ul' | 'ol';
type AlignContent = 'left' | 'center' | 'right';

interface ContentEditableProps {
    id?: number|string;
    content?: string;
    className?: string;
    editable?: boolean;
    disabled?: boolean;
    onChange?: (content: string, contentText: string) => any;
    onChangeDelay?: number;
    placeholder?: string;
    allowLineBreak?: boolean;
    elementType?: ElementType;
    alignContent?: AlignContent;
    focusOnMount?: boolean;
    onFocus?: () => any;
    onBlur?: () => any;
    onKeyDown?: (e: KeyboardEvent) => any;
    enableTextFormat?: boolean;
    disableTextFormatBold?: boolean;
    disableTextFormatItalic?: boolean;
    disableTextFormatURL?: boolean;
    forceUpdateContent?: boolean;
    maxTextLength?: number;
    onOverMaxTextLength?: () => any;
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
    isDesktop?: boolean
}

export default class ContentEditable extends React.Component<ContentEditableProps, ContentEditableState> {
    private handleChangeDelayProcess: number;
    private formatPopupId: string;
    private selectionModifyingProcess: boolean;
    private selection: Selection;
    private range: Range;
    private stopInput: boolean;

    refs: {
        [key: string]: (Element);
        editableElement: (HTMLElement);
    };
    constructor(props: any) {
        super(props);
        this.formatPopupId = null;
        this.selectionModifyingProcess = false;
        this.stopInput = false;
        this.state = {
            content: '',
            contentText: '',
            textFormatMode: false,
            textFormatPopupId: null,
            isDesktop: MediaQuerySerice.getIsDesktop()
        };
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
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
        enableTextFormat: false,
        disableTextFormatBold: false,
        disableTextFormatItalic: false,
        disableTextFormatURL: false,
        maxTextLength: 0
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
                // return `<div class="empty_tag" data-placeholder="${this.props.placeholder}"><br/></div>`;
                return '<br/>';
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
    setCursor(toStart: boolean = false) {
        window.setTimeout(() => {
            if (typeof window.getSelection != "undefined"
                    && typeof document.createRange != "undefined") {
                var range = document.createRange();
                range.selectNodeContents(this.refs.editableElement);
                range.collapse(toStart);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        });
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
            this.refs.editableElement.innerHTML = this.getElementEmptyContentByType();
            // let el = this.refs.editableElement.childNodes[this.refs.editableElement.childNodes.length - 1];
            // if (el instanceof Node) {
            //     this.setCursorTo(el);
            // }
        } else {
            this.refs.editableElement.classList.remove('empty');
            this.cleanElement();
        }
    }

    _limitHTML(originNode: HTMLElement, limit: number) {
        let node = originNode.cloneNode(true) as HTMLElement;
        console.log(node, node.tagName, limit);
        let result = [];
        let limitIncr = 0;
        if (node.childNodes.length) {
            for (let i = 0; i < node.childNodes.length; i++) {
                if (limit - limitIncr >= 0) {
                    let r = this._limitHTML(node.childNodes[i] as HTMLElement, limit - limitIncr);
                    for (let k = 0; k < node.childNodes.length; k++) {
                        node.removeChild(node.childNodes[k]);
                    }
                    for (let j = 0; j < r.result.length; j ++) {
                        node.appendChild(r.result[j])
                    }
                    limitIncr += r.limitIncr;
                }
            }
        } else {
            let _length = node.innerText ? node.innerText.length : node.toString().length;
            if (_length > limit) {
                node.innerHTML = (node.innerText ? node.innerText : node.toString()).slice(0, limit);
            }
            limitIncr += _length;
            console.log(_length)
        }
        result.push(node);
        return {
            result: result,
            limitIncr: limitIncr,
            limitRest: limit - limitIncr
        };
    }

    handleInput (e?: KeyboardEvent) {
        clearTimeout(this.handleChangeDelayProcess);
        // let r = this._limitHTML(this.refs.editableElement, this.props.maxTextLength);
        // console.log(r);
        if (this.props.elementType == 'inline' && this.props.maxTextLength
                && this.refs.editableElement.innerText.length > this.props.maxTextLength) {
            this.stopInput = true;
            this.refs.editableElement.innerHTML = this.refs.editableElement.innerText.slice(0, this.props.maxTextLength);
            this.setCursor(false);
            this.props.onOverMaxTextLength && this.props.onOverMaxTextLength();
        } else {
            this.stopInput = false;
        }
        this.setState(this.extractContent(), () => {
            this.updateEmptyState();
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
        this.props.onBlur && this.props.onBlur();
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
    handleKeyPress(e: KeyboardEvent) {
        if (this.stopInput) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
    private restoreSelection() {
        if (this.state.selectionState) {
            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.state.selectionState.range);
        }
    }
    private detectURL() {
        let parent = this.range.commonAncestorContainer.parentElement;
        return parent.tagName == 'A' || parent.parentElement.tagName == 'A';
    }
    private getDetectedURL() {
        let parent = this.range.commonAncestorContainer.parentElement;
        if (parent.tagName == 'A') return parent;
        else if (parent.parentElement.tagName == 'A') return parent.parentElement;
    }
    handleSelect(e: Event) {
        if (!this.props.enableTextFormat) return;
        this.selection = window.getSelection();
        this.range = this.selection.getRangeAt(0);
        if (!this.selection.isCollapsed) {
            let content = <TextFormatPopup
                key={'selectContent' + Math.random().toString().substr(2, 7)}
                isBold={document.queryCommandState("bold")}
                isItalic={document.queryCommandState("italic")}
                isURL={this.detectURL()}
                onBold={() => {document.execCommand('bold')}}
                onItalic={() => {document.execCommand('italic')}}
                onURL={() => {
                    if (this.detectURL()) {
                        document.execCommand("unlink", false, false);
                    } else {
                        ModalAction.do(
                            OPEN_MODAL,
                            {content: <URLModal key={Math.random().toString().substr(2, 7)} onURL={(url) => {
                                ModalAction.do(CLOSE_MODAL, null);
                                window.setTimeout(() => {
                                    let _selection = window.getSelection();
                                    _selection.removeAllRanges();
                                    _selection.addRange(this.range);
                                    document.execCommand('createLink', false, url);
                                }, 0);
                            }}/>}
                        );
                    }
                }}
                onClose={() => {
                    PopupPanelAction.do(CLOSE_POPUP, {id: 'text_formatting'});
                }}/>;
            PopupPanelAction.do(OPEN_POPUP, {content: content, id: 'text_formatting'});
        } else {
            PopupPanelAction.do(CLOSE_POPUP, {id: 'text_formatting'});
        }
    }

    handleSelectDesktop() {
        if (!this.props.enableTextFormat) return;
        this.selection = window.getSelection();
        this.range = this.selection.getRangeAt(0);
        if (!this.selection.isCollapsed) {
            ContentEditableAction.do(RESET_FORMAT_TOOL, {
                isBold: document.queryCommandState("bold"),
                isItalic: document.queryCommandState("italic"),
                isURL: this.detectURL(),
                onBold: () => {
                    document.execCommand('bold');
                    this.handleSelectDesktop();
                },
                onItalic: () => {
                    document.execCommand('italic');
                    this.handleSelectDesktop();
                },
                onURL: (url: string) => {
                    let _selection = window.getSelection();
                    _selection.removeAllRanges();
                    _selection.addRange(this.range);
                    document.execCommand('createLink', false, url);
                    this.handleSelectDesktop();
                },
                onRemoveURL: () => {
                    if (this.detectURL()) {
                        document.execCommand("unlink", false, false);
                    }
                    this.handleSelectDesktop();
                },
                disableBold: this.props.disableTextFormatBold,
                disableItalic: this.props.disableTextFormatItalic,
                disableURL: this.props.disableTextFormatURL,
            });
        } else {
            ContentEditableAction.do(RESET_FORMAT_TOOL, null);
        }
    }

    handleMediaQuery(isDestop: boolean) {
        this.setState({isDesktop: isDestop});
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.handleMediaQuery);
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
        MediaQuerySerice.unbind(this.handleMediaQuery);
        PopupPanelAction.do(CLOSE_POPUP, {id: 'text_formatting'});
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        return nextProps.forceUpdateContent;
    }

    render() {
        let className = 'content_editable';
        if (this.props.elementType == 'inline') {
            className += ' inline';
        }
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
                 onKeyPress={this.handleKeyPress.bind(this)}
                 onSelect={this.state.isDesktop ? this.handleSelectDesktop.bind(this) : this.handleSelect.bind(this)}
                 dangerouslySetInnerHTML={{__html: this.props.content || this.getElementEmptyContentByType()}}>
            </div>
        )
    }
}