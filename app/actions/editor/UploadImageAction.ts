import * as React from 'react';
import Action from '../Action';
import {api} from '../../api';
import {BlockContentTypes} from "../../constants";


export const UPLOAD_IMAGE = 'upload_image';

export const UploadImageAction = new Action({
    images: {}
});

UploadImageAction.registerAsync(UPLOAD_IMAGE, (store, data: {articleId: number, image: File}) => {
    console.log(data);
    return new Promise((resolve, reject) => {
        let formData = new FormData();
        formData.append('article', data.articleId);
        formData.append('image', data.image);
        api.post('articles/editor/images/', formData).then((response: any) => {
            console.log(response);
            store.image = response.data;
            resolve(response.data);
        });
    })
});
