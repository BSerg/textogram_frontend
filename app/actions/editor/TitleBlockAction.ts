import Action from '../Action';
import {Constants} from '../../constants'

import {api} from '../../api';

export const UPDATE_TITLE_ACTION = 'update_title_action';
export const UPDATE_COVER_ACTION = 'update_cover_action';

export const TitleBlockAction = new Action();

TitleBlockAction.registerAsync(UPDATE_TITLE_ACTION, (store, data: {articleSlug: number, title: string, delay?: number}) => {
    let _delay = data.delay || 1000;
    clearTimeout(this.actionTimeout);
    return new Promise((resolve, reject) => {
        this.actionTimeout = setTimeout(() => {
            api.patch(`/articles/editor/${data.articleSlug}/`, {title: data.title}).then((response: any) => {
                console.log('UPDATE_USER ARTICLE TITLE', response);
                store.title = response.data.title;
                resolve('OK')
            }).catch((err: any) => {
                reject(err);
            });
        }, _delay);
    })
});

TitleBlockAction.registerAsync(UPDATE_COVER_ACTION, (store, data: {articleSlug: string, cover: File}) => {
    return new Promise((resolve, reject) => {
        if (data.cover != null && data.cover.size > Constants.maxImageSize) {
            alert('Размер изображения должен быть меньше ' + Constants.maxImageSize / (1024 * 1024) + ' Мб!');
        } else {
            let _data;
            if (data.cover == null) {
                _data = {cover: null};
            } else {
                _data = new FormData();
                _data.append('cover', data.cover);
            }
            api.patch(`/articles/editor/${data.articleSlug}/`, _data).then((response: any) => {
                console.log('UPDATE_USER ARTICLE COVER', response);
                store.cover = response.data.cover;
                resolve('OK')
            }).catch((err: any) => {
                reject(err);
            });
        }
    });
});



