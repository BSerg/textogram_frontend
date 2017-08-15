import * as React from 'react';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
import {api} from '../../api';

import * as moment from 'moment';
import * as marked from 'marked';
import {MediaQuerySerice} from '../../services/MediaQueryService';

import {UserAction, UPDATE_USER_DRAFTS} from '../../actions/user/UserAction';

import {Captions} from '../../constants';

import '../../styles/shared/article_preview.scss';
import '../../styles/shared/article_preview_control.scss';

const ViewsIcon = require('-!babel-loader!svg-react-loader!../../assets/images/views_icon.svg?name=ViewsIcon');
const LockIcon = require('-!babel-loader!svg-react-loader!../../assets/images/lock.svg?name=LockIcon');
const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/close.svg?name=CloseIcon');
const EditIcon = require('-!babel-loader!svg-react-loader!../../assets/images/edit.svg?name=EditIcon');
const MoreIcon = require('-!babel-loader!svg-react-loader!../../assets/images/more_vertical.svg?name=MoreIcon');

interface IControlProps {
    item: any,
    deleteCallback: () => void,
}

class ControlMenu extends React.Component<IControlProps, any> {

    render() {
        return (
            <div className="article_preview_control">
                <div className="control_button"><div></div><div></div><div></div></div>

                <div className="control_controls">
                    <div><Link to={ '/articles/' + this.props.item.id + '/edit/'} >Редактировать</Link></div>
                    <div onClick={this.props.deleteCallback}>Удалить</div>
                </div>
            </div>)
    }
}

const Avatar = (props: {item: any}) => <div className="article_preview__avatar">
        <Link to={"/" + props.item.owner.nickname} >
            <img src={props.item.owner.avatar}/>
        </Link>
    </div>;


const Cover = (props: {item: any}) => {
    let style: any = props.item.cover ? { backgroundImage: `url('${props.item.cover}')`}
            :  {height: '0'};
    return <Link to={props.item.is_draft ? ("/articles/" + props.item.id + "/edit/") :
        ("/articles/" + props.item.slug + "/")}>
        <div className="article_preview__cover"  style={style}></div>
    </Link>
}

const Lead = (props: {item: any}) => {
    let dv: HTMLDivElement = document.createElement('div');
    dv.innerHTML = marked(props.item.lead || '');
    let lead = dv.innerText.trim();
    
    return lead ? <div className="article_preview__lead">
                <Link to={props.item.is_draft ? ("/articles/" + props.item.id + "/edit/") :
                    ("/articles/" + props.item.slug + "/")}>{ lead }
                </Link>
            </div> : null;
}

const Title = (props: {item: any, date: string}) => 
    <div className="article_preview__title">
        <Link to={props.item.is_draft ? ("/articles/" + props.item.id + "/edit/") :
            ("/articles/" + props.item.slug + "/")}>{ props.item.title || props.date }
        </Link>
    </div>;


const ADate = (props: {item: any, date: string}) =>
    <div className="article_preview__text article_preview__text_date">
        <Link to={props.item.is_draft ? ("/articles/" + props.item.id + "/edit/") :
            ("/articles/" + props.item.slug + "/")}> {props.date}
        </Link>
    </div>;


const AText  = (props: {item: any}) => <div className="article_preview__text">
        <Link to={"/" + props.item.owner.nickname + '/'} >
            {
                props.item.owner.first_name + ' ' + props.item.owner.last_name
            }
        </Link>

    </div>;

interface IArticlePreviewPropsInterface {
    item: any;
    index?: number;
    onClickDelete?: (id: number, index?: number) => {};
    onClick?: (id: number|null) => {};
    isFeed?: boolean;
    isOwner?: boolean;
}

interface IArticlePreviewStateInterface {
    menuOpen?: boolean;
    deleted?: boolean;
    isDesktop?: boolean;
    isNew?: boolean;
    timeout?: number;
    removed?: boolean;
}



class ArticlePreviewClass extends React.Component<IArticlePreviewPropsInterface|any, IArticlePreviewStateInterface|any> {

    constructor() {
        super();
        this.state = {menuOpen: true, isDesktop: MediaQuerySerice.getIsDesktop(), isNew: false, removed: false};
        this.checkDesktop = this.checkDesktop.bind(this);
        this.setNotNew = this.setNotNew.bind(this);
    }

    deleteArticle() {
        api.delete('/articles/editor/' + this.props.item.id + '/').then((response) => {

            if (this.props.item.is_draft) {
                UserAction.do(UPDATE_USER_DRAFTS, -1);
            }

            this.setState({deleted: true});
        }).catch((error) => {});
    }

    restore() {

        if (!this.state.deleted) {
            return;
        }

        api.post('/articles/editor/' + this.props.item.id + ( this.props.item.is_draft ? '/restore_draft/' : '/restore_published/')).then(
            (response) => {
                if (this.props.item.is_draft) {
                    UserAction.do(UPDATE_USER_DRAFTS, 1);
                }
                this.setState({deleted: false});

            }).catch((error) => {  });
    }

    remove() {
        if (this.state.deleted) {
            this.setState({removed: true});
        }
    }

    checkDesktop(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    getDateString(dt: string): string {
        if (!dt) return '';
        let dateString = moment(dt).format('DD.MM.YYYY  HH:mm');
        return dateString;
    }

    getViewsString(views: number): string {
        if (views < 1000) return views.toString();
        else if (views >= 1000 && views < 100000) {
            return (Math.floor(views * 10 / 1000) / 10).toString() + 'K';
        }
        else if (views >= 100000 && views < 1000000) {
            return (Math.floor(views/1000)).toString() + 'K';
        }
        else if (views >= 1000000 && views < 100000000) {
            return (Math.floor(views * 10/1000000)/10).toString() + 'M';
        }
        else if (views >= 100000000) {
            return (Math.floor(views/1000000)).toString() + 'M';
        }
        return '';
    }

    setNotNew() {
        this.setState({isNew: false})
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.checkDesktop);
        this.setState({isNew: Boolean(this.props.item.isNew)});
        this.state.timeout = window.setTimeout(this.setNotNew, 0);
    }

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.checkDesktop);
        window.clearTimeout(this.state.timeout);
    }

    render() {
        if (this.state.removed) {
            return null;
        }

        let dv: HTMLDivElement = document.createElement('div');
        dv.innerHTML = marked(this.props.item.lead || '');
        let lead = dv.innerText.trim();

        let date = this.getDateString(this.props.item.is_draft ? this.props.item.last_modified : this.props.item.published_at);
        let coverStyle: any = this.props.item.cover ? { backgroundImage: `url('${this.props.item.cover}')`}
            :  {height: '0'};

        if (this.state.deleted) {
            return (<div className="article_preview_deleted">
                Текст удален. <span onClick={this.restore.bind(this)}>Восстановить</span>
                <div className="close" onClick={this.remove.bind(this)}><CloseIcon /></div></div>);
        }
        
        let dataArr: any[] = this.state.isDesktop ? [
            !this.props.isOwner ? <Avatar item={this.props.item} key="avatar" /> : null,

            <div className={"article_preview__data" + (this.props.isOwner || this.props.item.is_draft ? " owned": "")} key="info">
                <Title item={this.props.item} date={date} />
                <Lead item={this.props.item}/>
                <div className="article_preview__info">
                    {
                        [
                            (!this.props.isOwner && !this.props.item.is_draft) ?<AText item={this.props.item} key="name"/> : null,
                            <ADate item={this.props.item} date={date} key="date"/>
                        ]
                    }
                </div>
            </div>,
            <Cover item={this.props.item} key="cover"/>,
            this.props.isOwner ? <ControlMenu item={this.props.item } deleteCallback={this.deleteArticle.bind(this)} key="control" /> : null
        ] : [
                <div className="article_preview__info" key="info">
                    {
                        [
                            !this.props.isOwner ? <Avatar item={this.props.item} key="avatar"/> : null,
                            !this.props.item.is_draft ? <AText item={this.props.item} key="name"/> : null,
                            <ADate item={this.props.item} date={date} key="date"/>,
                            <div className="filler" key="filler"></div>,
                            this.props.isOwner ? <ControlMenu item={this.props.item} deleteCallback={this.deleteArticle.bind(this)} key="control" /> : null,
                        ]
                    }
                </div>,
                <Title item={this.props.item} date={date} key="title" />,
                <Lead item={this.props.item} key="lead"/>,
                <Cover item={this.props.item} key="cover" />
        ];

        return (<div className={"article_preview" + (this.state.isNew ? " new" : "")}>
            {dataArr}
        </div>);
    }
}

let ArticlePreview = withRouter(ArticlePreviewClass);

export default ArticlePreview;