import * as React from 'react';
import LoginBlock from './shared/LoginBlock';
import '../styles/default_index.scss';
import {Captions} from '../constants';
import {MediaQuerySerice} from '../services/MediaQueryService';
import * as marked from 'marked';
import {Link} from 'react-router'

class RegistrationBlock extends React.Component<{className?: string}, any> {
    render() {
        return (
            <div className={"index_registration" + (this.props.className ? " " + this.props.className : "")}>
                <span>{Captions.index.oneClickRegister}</span>
                <LoginBlock />
            </div>)
    }
}


export default class DefaultIndex extends React.Component<any, {screenWidth?: number, screenHeight?: number, scrollInterval?: number}> {


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
        // window.scrollTo(0, 0);
        this.state.scrollInterval =  window.setInterval(() => {
            document.body.scrollTop -= 300;
            if (document.body.scrollTop <= 0) {
                document.body.scrollTop = 0;
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
                <div className="index_block">
                    <div className="index_info_sub_block index_info_sub_block_main">
                        <div className="index_logo"></div>
                        <div className="index_feature_about">{Captions.index.featureAbout}</div>
                        {
                            this.state.screenWidth >= 768 ? (<RegistrationBlock />) : null
                        }
                    </div>
                    <div className="index_image_sub_block image_sub_block_main"></div>
                </div>

                {
                    this.state.screenWidth < 768 ? (<RegistrationBlock />) : null
                }

                {
                    this.BLOCKS.map((block: {key: string, caption: string, content: any}, index: number) => {
                        return <div key={block.key} className={"index_block" + (block.key == "main" ? " index_block_main" : "") }>
                            <div className="index_image_sub_block"></div>
                            <div className={"index_info_sub_block" + (index % 2 == 0 ? " even" : " odd")}>
                                <h3>{block.caption}</h3>
                                <div dangerouslySetInnerHTML={{__html: block.content}}></div>
                            </div>
                        </div>
                    })
                }

                <RegistrationBlock className={"index_registration_bottom"} />

                <div className="index_footer">
                    <span><Link to="mailto:we@textius.com">we@textius.com</Link></span>
                    <span><Link to="/terms">Rules and Terms</Link></span>
                    <span>© Textius, beta 2017</span>

                    <div className="index_scroll" onClick={this.scrollTop.bind(this)}></div>
                </div>

            </div>)
    }
}