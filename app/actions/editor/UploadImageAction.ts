import * as React from "react";
import Action from "../Action";


export const UPLOAD_IMAGE = 'upload_image';
export const UPDATE_PROGRESS = 'update_progress';

export const UploadImageAction = new Action({
    images: {},
    progress: {}
});

UploadImageAction.register(UPDATE_PROGRESS, (store, data: {name: string, progress: number, total: number}) => {
    store.progress[data.name] = {progress: data.progress, total: data.total}
});

UploadImageAction.registerAsync(UPLOAD_IMAGE, (store, data: {articleId: number, image: File}) => {
    console.log(data);
    return new Promise((resolve, reject) => {
        let formData = new FormData();
        formData.append('article', data.articleId);
        formData.append('image', data.image);

        let xhr = new XMLHttpRequest();

        xhr.upload.onprogress = function(e: ProgressEvent) {
            window.setTimeout(() => {
                UploadImageAction.do(UPDATE_PROGRESS, {name: data.image.name, progress: e.loaded, total: e.total});
            })
        };

        xhr.onload = () => {
            if (xhr.status == 201) {
                let data = JSON.parse(xhr.responseText);
                store.image = data;
                store.images[data.image.name] = data;
                resolve(data)
            } else {
                reject('ERROR ' + xhr.status);
            }
        };

        xhr.onerror = () => {
            reject('Unexpected error ' + xhr.status);
        };

        xhr.open("POST", process.env.API_URL + '/articles/editor/images/', true);
        xhr.setRequestHeader('Authorization', 'Token ' + localStorage.getItem('authToken'));
        xhr.send(formData);

    })
});
