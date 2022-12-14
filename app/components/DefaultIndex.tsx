import * as React from 'react';
import LoginBlock from './shared/LoginBlock';
import '../styles/default_index.scss';
import {Captions} from '../constants';
import {MediaQuerySerice} from '../services/MediaQueryService';
import * as marked from 'marked';
import {Link} from 'react-router-dom';

class RegistrationBlock extends React.Component<{className?: string}|any, any> {
    render() {
        return (
            <div className={"index_registration" + (this.props.className ? " " + this.props.className : "")}>
                <span>{Captions.index.oneClickRegister}</span>
                <LoginBlock />
            </div>)
    }
}


export default class DefaultIndex extends React.Component<any, {screenWidth?: number, screenHeight?: number, scrollInterval?: number}|any> {


    BLOCKS: {key: string, caption: string, content: any}[] = [
        {key: "editor", caption: Captions.index.editorBlockCaption, content: marked(Captions.index.editorBlockText)},
        {key: "text", caption: Captions.index.textBlockCaption, content: marked(Captions.index.textBlockText)},
        {key: "other", caption: Captions.index.otherBlockCaption, content: marked(Captions.index.otherBlockText)},
        {key: "main", caption: Captions.index.mainBlockCaption, content: marked(Captions.index.mainBlockText)},
    ];


    constructor() {
        super();
        this.state = {screenHeight: MediaQuerySerice.getScreenHeight(), screenWidth: MediaQuerySerice.getScreenWidth()};
        this.setWidthHeight = this.setWidthHeight.bind(this);
    }

    scrollTop() {

        let scrollTop = document.body.scrollTop;
        this.state.scrollInterval =  window.setInterval(() => {
            window.scrollTo(0, scrollTop);
            scrollTop -= (scrollTop < (document.body.scrollHeight / 4) ? 100 : 400 );
            if (scrollTop <= 0) {
                window.scrollTo(0, 0);
                window.clearInterval(this.state.scrollInterval);
            }
        }, 50);
    }

    setWidthHeight() {
        this.setState({screenHeight: window.innerHeight, screenWidth: window.innerWidth});
    }

    componentDidMount() {
        window.addEventListener('resize', this.setWidthHeight);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setWidthHeight);
        this.state.scrollInterval && window.clearInterval(this.state.scrollInterval);
    }

    render() {
        return (
            <div id="index">
                <RegistrationBlock className={"index_registration_bottom"} />
                <div className="index_footer">
                    <span>?? Textius, beta 2017</span>
                </div>
            </div>
        )
    }
}