import * as React from 'react';
import Action from '../Action';
import {api} from '../../api';

export const LOAD = 'load';

export const BannerAction = new Action({
    promise: null,
    banners: null
});

BannerAction.registerAsync(LOAD, (store, data: any) => {

    if (!store.promise) {
        store.promise = new Promise((resolve, reject) => {
            api.get(`${process.env.USE_CACHE_API ? '/_' : ''}/advertisements/banners2`).then((response: any) => {
                store.banners = response.data;
                resolve(store.banners);
            }).catch((err: any) => {
                reject(err);
            });
        });    
    }

    return store.promise;
});