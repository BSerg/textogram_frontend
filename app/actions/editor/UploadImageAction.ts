import * as React from "react";
import axios from 'axios';
import * as cookie from 'js-cookie';

import Action from "../Action";
import {Constants} from '../../constants';
import {NotificationAction, SHOW_NOTIFICATION} from "../shared/NotificationAction";
import {api} from "../../api";


export const UPLOAD_IMAGE = 'upload_image';
export const UPLOAD_IMAGE_BASE64 = 'upload_image_base64';
export const CANCEL_UPLOAD_IMAGE = 'cancel_upload_image';
export const UPDATE_PROGRESS = 'update_progress';

export const UploadImageAction = new Action({
    images: {},
    progress: {},
    cancelTokens: {}
});

UploadImageAction.register(UPDATE_PROGRESS, (store, data: {name: string, progress: number, total: number}) => {
    store.progress[data.name] = {progress: data.progress, total: data.total}
});

UploadImageAction.registerAsync(UPLOAD_IMAGE, (store, data: {articleId: number, image: File}) => {
    if (store.cancelTokens.__image) store.cancelTokens.__image.abort();
    return new Promise((resolve, reject) => {
        if (data.image.size > Constants.maxImageSize) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: `Изображение не может превышать ${Constants.maxImageSize/1024/1024}Mb`}
            );
            reject('Error. Image exceeds max size limit');
        }
        let formData = new FormData();
        formData.append('article', data.articleId.toString());
        formData.append('image', data.image);

        let xhr = new XMLHttpRequest();

        store.cancelTokens.__image = xhr;
        store.cancelTokens[data.image.name] = xhr;

        xhr.upload.onprogress = function(e: ProgressEvent) {
            window.setTimeout(() => {
                UploadImageAction.do(UPDATE_PROGRESS, {name: data.image.name, progress: e.loaded, total: e.total});
            })
        };

        xhr.onload = () => {
            if (xhr.status == 201) {
                let response = JSON.parse(xhr.response);
                if (data.image.type == 'image/gif') {
                    response = Object.assign({}, response, {is_animated: true});
                }
                store.image = response;
                store.images[data.image.name] = response;
                resolve(response)
            } else {
                reject('ERROR ' + xhr.status);
            }
        };

        xhr.onerror = () => {
            reject('Unexpected error ' + xhr.status);
        };

        xhr.open("POST", process.env.API_URL + '/articles/editor/images/', true);
        let jwt = cookie.get('jwt');
        if (jwt) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + jwt);
        }
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(formData);
    })
});

UploadImageAction.registerAsync(UPLOAD_IMAGE_BASE64, (store, data: {articleId: number, image: string}) => {
    if (store.cancelTokens.__base64) {
        store.cancelTokens.__base64.cancel();
    }

    let cancelSource = axios.CancelToken.source();
    store.cancelTokens.__base64 = cancelSource;

    return new Promise((resolve, reject) => {
        if (data.image.length > Constants.maxImageSize) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: `Изображение не может превышать ${Constants.maxImageSize/1024/1024}Mb`}
            );
            reject('Error. Image exceeds max size limit');
        }
        api.post('/articles/editor/images/base64/', {article: data.articleId, image: data.image},
            {cancelToken: cancelSource.token}).then((response: any) => {
            resolve(response.data);
        }).catch((err: any) => {
            if (!axios.isCancel(err)) {
                reject('Unexpected error')
            }
        });
    })
});

UploadImageAction.register(CANCEL_UPLOAD_IMAGE, (store, fileName: string | null) => {
    if (fileName && store.cancelTokens[fileName]) {
        store.cancelTokens[fileName].abort();
    } else {
        if (store.cancelTokens.__image) store.cancelTokens.__image.abort();
        if (store.cancelTokens.__base64) store.cancelTokens.__base64.cancel();
    }
});

