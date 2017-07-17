import * as React from 'react';
import {BannerID, BlockContentTypes} from "../../constants";
import * as marked from 'marked';

class AmpPhoto extends React.Component<any, any> {
 
    render() {
        let {item, slug} = this.props;
        if (!item || !item.photos || !item.photos.length) {
            return;
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

export default class ArticleAmp extends React.Component<any, any> {
    render() {
        let {article} = this.props;
        if (!article || !article.content || !article.content.blocks || !article.content.blocks.length) {
            return null;
        }
        return (
            <div>
                {
                    article.content.blocks.map((block: any, index: number) => {
                        switch (block.type) {
                            case BlockContentTypes.TEXT:
                                let regx = /<p>(.+)<\/p>/g;
                                let t: any[] = [];
                                let match;
                                let innerIndex: number = 0;
                                while (true) {
                                    match = regx.exec(marked(block.value))
                                    if (match == null) break;
                                    t.push(<p key='`${index}_${innerIndex}`' className="text" dangerouslySetInnerHTML={{__html: match[1]}}/>);
                                    innerIndex++;
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
                                return <AmpPhoto key={index} item={block} slug={article.slug}/>;
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
                        }

                        return (<p key={index}>block</p>)
                    })
                }
            </div>)
    }
}