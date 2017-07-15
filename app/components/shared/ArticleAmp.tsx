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
        // let length = item.photos.length;
        item.photos.forEach((photo: any, index: number) => {
            let src = ((item.photos.length <= 2 || index == 0) ? photo.regular || photo.image : photo.preview || photo.small) || '';
            if (src) {
                photoArr.push(`<amp-img src="${src}" width="${600}" height="${200}" layout="responsive"></amp-img>`) ;
            }
        });
        console.log(item);
        let galleryHref = caption ? `${process.env.SITE_URL}/articles/${slug}/gallery/${item.id}` : '';
        return (<div>
            <div dangerouslySetInnerHTML={{__html: photoArr[0]}}></div>
            {caption ? (item.photos.length > 1 ? <a className="caption" href={galleryHref} >{caption}</a> : 
            <div className="caption">{caption}</div>) : null}
        </div>)
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
                                return <AmpPhoto key={index} item={block} slug={article.slug}/>
                            /*case BlockContentTypes.VIDEO:
                                return (
                                    block.__meta && block.__meta.embed ?
                                        <div className="embed video" dangerouslySetInnerHTML={{__html: block.__meta.embed}}/> : null
                                );
                            
                            case BlockContentTypes.AUDIO:
                                return (
                                    block.__meta && block.__meta.embed ?
                                        <div className="embed audio" dangerouslySetInnerHTML={{__html: block.__meta.embed}}/> : null
                                );*/
                            
                            case BlockContentTypes.POST:
                                return <p key={index}>EMBED</p>;
                                /*return (
                                    block.__meta && block.__meta.embed ?
                                        <div className="embed post" key={index} dangerouslySetInnerHTML={{__html: block.__meta.embed}}/> : null
                                );*/
                        }

                        return (<p key={index}>block</p>)
                    })
                }

            </div>)
    }
}