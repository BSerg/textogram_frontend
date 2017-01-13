import * as React from 'react';
import {Captions} from '../../constants';
import '../../styles/editor/editor_publish_modal.scss';
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import {api} from "../../api";

const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');

interface IProps {
    articleId: number
    updateMode?: boolean
}

interface IState {

}

export default class EditorPublishParamsModal extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
    }

    static defaultProps = {
        updateMode: false
    };

    back() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    publish() {
        api.post(`/articles/editor/${this.props.articleId}/publish/`).then((response: any) => {
            console.log(response);
            alert('Поздравляем, статья опубликована');
        });
    }

    render() {
        return (
            <div className="editor_modal">
                <div className="editor_modal__header">
                    <BackButton className="editor_modal__back" onClick={this.back.bind(this)}/>
                    {Captions.editor.publishingParams}
                </div>
                <div className="editor_modal__content">__PARAMS__</div>
                <div className="editor_modal__publish" onClick={this.publish.bind(this)}>{Captions.editor.publish}</div>
            </div>
        )
    }
}