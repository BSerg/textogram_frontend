import * as React from 'react';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
import {api} from '../../api';
import {connect} from 'react-redux';

import * as moment from 'moment';
import * as marked from 'marked';

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


class ArticlePreview extends React.Component<any, any> {

    timeout: any;

    constructor() {
        super();
        this.state = {isNew: false, removed: false};
        this.setNotNew = this.setNotNew.bind(this);
    }

    deleteArticle() {
        api.delete('/articles/editor/' + this.props.item.id + '/').then((response) => {

            if (this.props.item.is_draft) {
                
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
            
                }
                this.setState({deleted: false});

            }).catch((error) => {  });
    }

    remove() {
        if (this.state.deleted) {
            this.setState({removed: true});
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
        this.setState({isNew: Boolean(this.props.item.isNew)});
        this.timeout = window.setTimeout(this.setNotNew, 0);
    }

    componentWillUnmount() {
        window.clearTimeout(this.timeout);
    }

    render() {
        if (this.state.removed) {
            return null;
        }

        let {item, isOwner, isDesktop} = this.props;
        if (!item) {
            return null;
        }

        let dv: HTMLDivElement = document.createElement('div');
        dv.innerHTML = marked(item.lead || '');
        let lead = dv.innerText.trim();

        let date = this.getDateString(item.is_draft ? item.last_modified : item.published_at);
        let coverStyle: any = item.cover ? { backgroundImage: `url('${item.cover}')`}
            :  {height: '0'};

        if (this.state.deleted) {
            return (<div className="article_preview_deleted">
                Текст удален. <span onClick={this.restore.bind(this)}>Восстановить</span>
                <div className="close" onClick={this.remove.bind(this)}><CloseIcon /></div></div>);
        }
        
        let dataArr: any[] = isDesktop ? [
            !isOwner ? <Avatar item={item} key="avatar" /> : null,

            <div className={"article_preview__data" + (isOwner || item.is_draft ? " owned": "")} key="info">
                <Title item={item} date={date} />
                <Lead item={item}/>
                <div className="article_preview__info">
                    {
                        [
                            (!isOwner && !item.is_draft) ?<AText item={item} key="name"/> : null,
                            <ADate item={item} date={date} key="date"/>
                        ]
                    }
                </div>
            </div>,
            <Cover item={item} key="cover"/>,
            isOwner ? <ControlMenu item={item } deleteCallback={this.deleteArticle.bind(this)} key="control" /> : null
        ] : [
                <div className="article_preview__info" key="info">
                    {
                        [
                            !isOwner ? <Avatar item={item} key="avatar"/> : null,
                            !item.is_draft ? <AText item={item} key="name"/> : null,
                            <ADate item={item} date={date} key="date"/>,
                            <div className="filler" key="filler"></div>,
                            isOwner ? <ControlMenu item={item} deleteCallback={this.deleteArticle.bind(this)} key="control" /> : null,
                        ]
                    }
                </div>,
                <Title item={item} date={date} key="title" />,
                <Lead item={item} key="lead"/>,
                <Cover item={item} key="cover" />
        ];

        return (<div className={"article_preview" + (this.state.isNew ? " new" : "")}>
            {dataArr}
        </div>);
    }
}



const mapStateToProps = (state: any, ownProps: any) => {
    let isOwner: boolean; 
    try {
        isOwner = ownProps.item.owner.id === state.userData.user.id;
    }   catch(err) {
        isOwner = false;
    }

    return {
        isDesktop: state.screen.isDesktop,
        isOwner: isOwner,
        
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        
    }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ArticlePreview));
