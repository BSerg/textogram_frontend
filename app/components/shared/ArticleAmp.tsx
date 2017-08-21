import * as React from 'react';
import {BannerID, BlockContentTypes} from "../../constants";
import * as marked from 'marked';
import * as moment from 'moment';
const VKIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/profile_social_icon_fb.svg?name=FBIcon');
const TwitterIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/profile_social_icon_twitter.svg?name=TwitterIcon');
const GoogleIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/profile_social_icon_google.svg?name=GoogleIcon');
const UrlIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/profile_web_link_icon.svg?name=UrlIcon');
const SiteIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/site.svg?name=SiteIcon');
const TelegramIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/telegram.svg?name=TelegramIcon');
const InstagramIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/profile_social_icon_instagram.svg?name=InstagramIcon');
const WhatsappIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/whatsapp.svg?name=WhatsappIcon');
const ViberIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/viber.svg?name=ViberIcon');
const LinkIcon = require('-!babel-loader!svg-react-loader!../../assets/images/amp_icons/share_link.svg?name=LinkIcon');

// import SocialIcon from './SocialIcon';
class AmpGallery extends React.Component<any, any> {

    isValid(): boolean {
        let {item, slug} = this.props;
        if (!item || !item.photos || !item.photos.length) {
            return false;
        }
        return true;
    }

    getLighBox(photo: any, index: number): string {
        return `<amp-lightbox id="lightbox-${this.props.item.id}-${index}" layout="nodisplay">
                <div>
                <div>${index + 1}/${this.props.item.photos.length}</div>
            
                <amp-img on="tap:lightbox-${this.props.item.id}-${index}.close,lightbox-${this.props.item.id}-${index+1}" role="button" tabindex="${index}" layout="fill" src="${photo.regular || photo.image}"></amp-img>
                </div>
        </amp-lightbox>`
    }
    
    getSizes(photo: any): {width: number, height: number} {
        let width = photo.original_width;
        let height = photo.original_height;
        let {images} = this.props;
        if (!width || !height) {
            try {
                let image: any = images.find((el: any, index: number, arr: any[]) => {
                    if (el.id == photo.id) {
                        return photo;
                    }
                });
                width = width || image.original_width;
                height = height || image.original_height;
            }
            catch (err) {}
        }
        return {width: width || 100, height: height || 100};
        // return {width: width || 100, height: 200};
    }

    getCarousel(id: string): string {
        let images: string[] = [];
        let lightboxes: string[] = [];
        let startingSizes: any;
        this.props.item.photos.forEach((photo: any, index: number) => {
            let src = photo.regular || photo.image;
            let nextIndex = (index + 1) >= this.props.item.photos.length ? 0 : index + 1;
            let previousIndex = (index - 1) < 0 ? this.props.item.photos.length -1 : index - 1;
            let sizes = this.getSizes(photo);
            if (index == 0) {
                startingSizes = Object.assign({}, sizes);
            }
            images.push(`<amp-img tabindex="0" role="button" height="${sizes.height}" width="${sizes.width}" layout="responsive" src="${src}"></amp-img>`)
            lightboxes.push(`
                <amp-image-lightbox id="lightbox-${this.props.item.id}-${index}" layout="nodisplay"></amp-image-lightbox>
            `)
        });
        return `
           <amp-carousel layout="responsive" 
                height="${startingSizes.height}" width="${startingSizes.width}" type="slides" controls="0">
                ${images.join('')}
            </amp-carousel>
            ${lightboxes.join('')}
        `;
    }

    render() {
        if (!this.isValid()) {
            return null;
        }
        let {item} = this.props;
        let carousel: string = this.getCarousel(item.id);
        return (
            <div className="gallery">
                <div className="carousel" dangerouslySetInnerHTML={{__html: carousel}} />                
                <div className="caption">
                    {item.photos.length == 1 ? item.photos[0].caption || '' : `Галерея из ${item.photos.length} фото` }
                </div>
            </div>)
    }
}

class AmpPhoto extends React.Component<any, any> {
 
    render() {
        let {item, slug} = this.props;
        if (!item || !item.photos || !item.photos.length) {
            return null;
        }
        let caption: string = item.photos.length > 1 ? 'Галерея' : (item.photos[0].caption || '');
        let photoArr: string[] = [];
        item.photos.forEach((photo: any, index: number) => {
            let src = ((item.photos.length <= 2 || index == 0) ? photo.regular || photo.image : photo.preview || photo.small) || '';
            if (src) {
                photoArr.push(`<amp-img src="${src}" width="${600}" height="${200}" layout="responsive"></amp-img>`) ;
            }
        });
        let galleryHref = caption ? `${process.env.SITE_URL}/articles/${slug}/gallery/${item.id}` : '';
        return (<div>
            <div dangerouslySetInnerHTML={{__html: photoArr[0]}}></div>
            {caption ? (item.photos.length > 1 ? <a className="caption" href={galleryHref} >{caption}</a> : 
            <div className="caption">{caption}</div>) : null}
        </div>)
    }
}

class AmpQuote extends React.Component<any, any> {
    
    render() {
        let {item} = this.props;
        let className = item.image && item.image.image ? 'personal': '';
        let ampImg = item.image && item.image.image ? `<amp-img width="60" height="60" src=${item.image.image} layout="fixed"/>` : null
        return (
             <blockquote className={className}>
                {item.image && item.image.image ? 
                    <div className="image" dangerouslySetInnerHTML={{__html: ampImg}} /> : null
                }
                <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	                viewBox="0 0 44 44" xmlSpace="preserve">
                    <rect className="st1" width="44" height="44"/>
                    <g><g>
                        <path className="st2" d="M19.3,18.2c0,3.3-0.3,6.1-1,8.4c-0.7,2.3-1.8,4.6-3.3,6.7H7.8C11.3,29,13,24.8,13,20.9H8V10.6h11.3V18.2z M36.2,18.2c0,3.2-0.3,6-1,8.4c-0.7,2.4-1.8,4.7-3.3,6.8h-7.2c3.5-4.4,5.2-8.6,5.2-12.5h-5V10.6h11.3 C36.2,10.6,36.2,18.2,36.2,18.2z"/>
                    </g></g>
                </svg>

                <div dangerouslySetInnerHTML={{__html: marked(item.value)}}/>
            </blockquote>);
    }
}

class AmpDialog extends React.Component<any, any> {
    render() {
        let {item} = this.props;
        if (!item || !item.remarks || !item.participants) {
            return null;
        }
        let participants: any = {};
        item.participants.forEach((participant: any) => {
            participants[participant.id] = participant;
        });
        return (
            <div className="dialogue">
                {item.remarks.map((remark: any, index: number): any => {
                    if (!remark.value.length) return null;
                    let participant = participants[remark.participant_id];
                    if (!participant) return null;
                    let className = 'remark';
                    if (participant.is_interviewer) className += ' question';
                    let ampImgHtml: string = participant.avatar && participant.avatar.image ? 
                        `<amp-img src=${participant.avatar.image} width="32" height="32" layout="fixed" />` : null;
                    return <div className={className} key={index}>
                        {ampImgHtml ?
                            <div dangerouslySetInnerHTML={{__html: ampImgHtml}}/> : 
                            <span >{participant.name[0]}</span>
                        }   
                        {remark.value}
                    </div>
                })}

            </div>)
    }
}

class AmpColumns extends React.Component<any, any> {
    
    render() {
        let {item} = this.props;

        return (
            <div className="columns">
                {item.image ? 
                    <div className="image" dangerouslySetInnerHTML={{__html: `<amp-img src=${item.image.image} width="70" height="70" layout="fixed" />`}} /> : 
                    <div className="image">
                        {item.value.match(/\w/) ? item.value.match(/\w/)[0] : ''}
                    </div>
                                                            }
                <div className="column" dangerouslySetInnerHTML={{__html: marked(item.value)}}/>
            </div>);
    }
}

class AmpEmbed extends React.Component<any, any> {
    render() {
        let {item} = this.props;
        if (!item || !item.__meta || !item.__meta.type) {
            return null;
        }
        let __html: string = '';
        switch(item.__meta.type) {
            case 'soundcloud':
                __html = `<amp-soundcloud height="337" layout="fixed-height" data-trackid="${item.__meta.id}" data-visual="true"></amp-soundcloud>`;
                break;
            case 'twitter':
                __html = `<amp-twitter height=500 layout="fixed-height" data-tweetid="${item.__meta.id}"></amp-twitter>`;
                break;
            case 'instagram':
                __html = `<amp-instagram data-shortcode="${item.__meta.id}" data-captioned width="500" height="700" layout="responsive"></amp-instagram>`;
                break;
            case 'facebook':
                __html = `<amp-facebook height="500" layout="fixed-height" data-href="${item.__meta.url}"></amp-facebook>`;
                break;
            case 'youtube':
                __html = `<amp-youtube data-videoid="${item.__meta.id}" layout="fixed-height" height="330"></amp-youtube>`;
                break;
            case 'vimeo':
                __html = `<amp-vimeo data-videoid="${item.__meta.id}" layout="fixed-height" height="350"></amp-vimeo>`;
                break;
            
            default:
                __html = '';
        }
        return(<div className="embed" dangerouslySetInnerHTML={{__html}} />);
    }
}

class AmpBanner extends React.Component<any, any> {
    render() {
        let {item} = this.props;
        let attrs = Object.keys(item.amp_props || {}).map((k) => {
            return `${k}="${(item.amp_props || {})[k] || ''}"`;
        }).join(' ');
        let ampEl: string = `<amp-ad width="${item.width}" height="${item.height}" ${attrs} ></amp-ad>`;
        return (
            <div className="banner" dangerouslySetInnerHTML={{__html: ampEl}}></div>)
    }
}

class AmpArticleMeta extends React.Component<any, any> {
    render() {
        let {article} = this.props;
        let date = moment(article.published_at).format('DD.MM.YYYY');
        return (
            <div className="article_meta">
                <span>
                    <a href={process.env.IS_LENTACH ? '/' : `/${article.owner.nickname}`}>
                        {`${article.owner.first_name} ${article.owner.last_name}`}
                    </a>
                </span>
                <span>{date}</span>
            </div>)
    }
}

class AmpCover extends React.Component<{item: any}, any> {

    getDate(): string {
        let calendarParams = {
            sameDay: 'Сегодня, LT',
            lastDay: 'Вчера, LT',
            sameElse: 'DD MMMM YYYY, LT',
            lastWeek: 'DD MMMM YYYY, LT'
        };
        return moment(this.props.item.published_at).locale('ru').calendar(null, calendarParams);
    }


    render() {
        let {item} = this.props;
        let date = this.getDate();
        let headerLenghtClass = item.title.length <= 15 ? 'short' : '';
        return (
            <div id="cover" className={`${item.cover ? "covered" : ""} ${item.cover || item.inverted_theme ? "inverted" : ""}`}>
                <div className="title">
                    <h1 className={headerLenghtClass}>{item.title}</h1>
                    <div className="stats">
                        <div className="stats_author"><a href={process.env.IS_LENTACH ? '/' : `/${item.owner.nickname}`}>{item.owner.first_name} {item.owner.last_name}</a></div>
                        <div>{date}</div>
                    </div>
            </div>
        
        </div>
        )
    }
}

class AmpIcon extends React.Component<{social: string}, any> {
    ICONS: any = {
        'vk': VKIcon,
        'fb': FBIcon,
        'facebook': FBIcon,
        'twitter': TwitterIcon,
        'google': GoogleIcon,
        'telegram': TelegramIcon,
        'instagram': InstagramIcon,
        'whatsapp': WhatsappIcon,
        'viber': ViberIcon,
        'link': LinkIcon
    };
    getIcon(): any {
        let Icon = this.ICONS[this.props.social];
        return Icon ? Icon : null;
    }
    render() {
        let Icon = this.getIcon();
        return (<Icon />);
    }
}

class AmpShare extends React.Component<{item: any}, any> {

    render() {
        let url = this.props.item.url;
        return (
            <div className="share">
                <div className="share__row">
                    <a href={"http://vk.com/share.php?url=" + url} className="share_vk"><AmpIcon social="vk"/></a>
                    <a href={"https://www.facebook.com/sharer/sharer.php?u=" + url} className="share_fb"><AmpIcon social="facebook"/></a>
                    <a href={"https://twitter.com/home?status=" + url} className="share_twitter"><AmpIcon social="twitter"/></a>
                </div>
                <div className="share__row">
                    <a href={"https://telegram.me/share/url?url=" + url} className="share_telegram"><AmpIcon social="telegram"/></a>
                    <a href={"whatsapp://send?text=" + url} className="share_whatsapp"><AmpIcon social="whatsapp"/></a>
                    <a href={"viber://forward?text=" + url} className="share_viber"><AmpIcon social="viber"/></a>
                </div>
            </div>
        )
    }
}

export default class ArticleAmp extends React.Component<any, any> {

    processBlocks(): any[] {

        let blocks: any[] = this.props.article.content.blocks;
        try {
            let bannerData = JSON.parse(this.props.bannerData).mobile || {};
            let bannersInserted = false;
            if (blocks.length >= 5 && bannerData.banner__content) {

                let indexToInsert:number;
                let canInsert: boolean = false;
                for (let i: number = 1; i < blocks.length - 1; i++) {
                    let canInsert = [BlockContentTypes.PHOTO].indexOf(blocks[i-1].type) == -1 && [BlockContentTypes.PHOTO].indexOf(blocks[i].type) == -1;
                    if (canInsert) {
                        indexToInsert = i;
                        break;
                    }
                }
                if (indexToInsert) {
                    blocks.splice(indexToInsert, 0, {type: 'ad', data: bannerData.banner__content[0]});
                    bannersInserted = true;
                }
                
            }
            if (((blocks.length < 2 || blocks.length >= 5) || !bannersInserted) && bannerData.banner__bottom) {
                blocks.push({type: 'ad', data: bannerData.banner__bottom[0]});
                bannersInserted = true;
            }
            blocks.splice(0, 0, {type: 'meta'});
            if (blocks[blocks.length - 1].type == 'ad') {
                blocks.splice(blocks.length - 1, 0, {type: 'meta'});
            }
            else {
                blocks.splice(blocks.length, 0, {type: 'meta'});
            }            
        } catch (err) {}

        return blocks;
    }

    render() {
        let {article} = this.props;
        if (!article || !article.content || !article.content.blocks || !article.content.blocks.length) {
            return null;
        }
        let blocks: any = this.processBlocks();
        return (<div>
            <AmpCover item={article}/>
            
            <div className="main">
                {
                    blocks.map((block: any, index: number) => {
                        if (block.value) {
                            block.value = block.value.replace(/<[^>]*>/g, '');
                        } 
                        switch (block.type) {
                            case BlockContentTypes.TEXT:
                                let regx = /<p>(.+)<\/p>/g;
                                let t: any[] = [];
                                let match;
                                let innerIndex: number = 0;
                                let count = 0;
                                while (true) {
                                    match = regx.exec(marked(block.value))
                                    if (match == null) break;
                                    
                                    t.push(<p key={`${index}_${count++}`} className="text" dangerouslySetInnerHTML={{__html: match[1]}}/>);
                                    
                                }
                                return t;
                            case BlockContentTypes.HEADER:
                                return <h2 key={index} dangerouslySetInnerHTML={{__html: block.value}} />;
                            case BlockContentTypes.LEAD:
                                return <div className='lead' key={index}
                                            dangerouslySetInnerHTML={{__html: marked(block.value)}}/>;
                            case BlockContentTypes.PHRASE:
                                return <div className='phrase' key={index}
                                            dangerouslySetInnerHTML={{__html: marked(block.value)}}/>;
                            case BlockContentTypes.PHOTO:
                                return <AmpGallery key={index} item={block} images={article.images} slug={article.slug}/>;
                            case BlockContentTypes.QUOTE:
                                return (<AmpQuote key={index} item={block} />);
                            case BlockContentTypes.LIST:
                                return <div key={index} dangerouslySetInnerHTML={{__html: marked(block.value)}}/>;
                            case BlockContentTypes.DIALOG:
                                return <AmpDialog item={block} key={index} />;
                            case BlockContentTypes.COLUMNS:
                                return <AmpColumns item={block} key={index} />;
                            case BlockContentTypes.POST:
                                return <AmpEmbed item={block} key={index} />;
                            case BlockContentTypes.AUDIO:
                                return <AmpEmbed item={block} key={index} />;
                            case BlockContentTypes.VIDEO:
                                return <AmpEmbed item={block} key={index} />;
                            case 'ad':
                                return <AmpBanner item={block.data} key={index}/>;
                            /*case 'meta':
                                return <AmpArticleMeta key={index} article={article}/>;*/
                            default:
                                return null;
                        }
                    })
                }
            </div>
            <AmpShare item={article}/>
        </div>)
    }
}