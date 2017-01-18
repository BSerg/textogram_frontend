export enum ArticleStatuses {
    DRAFT = 1,
    PUBLISHED = 2,
    DELETED = 3
}

export namespace Captions {
    export const editor = {
        add_cover_ru: 'Добавить обложку',
        remove_cover_ru: 'Удалить обложку',
        enter_title_ru: 'Введите заголовок',
        add_content_help: 'Выберите тип контента, нажав на "плюс"',
        add_photo_help: 'Добавьте фото, нажав на "+" в панели инструментов',
        enter_text: 'Введите текст',
        enter_header: 'Введите заголовок',
        enter_lead: 'Введите лид',
        enter_phrase: 'Введите фразу',
        enter_list: 'Введите текст элемента списка',
        enter_quote: 'Цитата',
        enter_quote_replace: 'Заменить',
        enter_quote_delete: 'Удалить',
        enter_caption: 'Описание',
        enter_embed_url: 'Вставьте ссылку',
        content_text: 'Текст',
        content_header: 'Заголовок',
        content_lead: 'Лид',
        content_video: 'Видео',
        content_photo: 'Фото',
        content_audio: 'Аудио',
        content_quote: 'Цитата',
        content_columns: 'Колонки',
        content_phrase: 'Фраза',
        content_list: 'Список',
        content_dialog: 'Диалог',
        content_post: 'Пост',
        publish: 'Опубликовать',
        publishingParams: 'Настройки публикации',
        publishAds: 'Реклама',
        publishLink: 'Доступ по ссылке',
        error_embed_url: 'Некорректная ссылка',
        help_embed_video: 'Youtube, Vimeo, VK, Facebook',
        help_embed_audio: 'SoundCloud',
        help_embed_post: 'Twitter, Facebook, Instagram',
        help_embed_empty: 'Нажмите на блок и вставьте ссылку',
        loading: 'Загрузка...'
    }
}

export namespace Constants {
    export const maxImageSize = 5 * 1024 * 1024;
}

export enum BlockContentTypes {
    ADD = 101,
    SWAP_BLOCKS = 102,
    TEXT = 1,
    HEADER = 2,
    LEAD = 3,
    VIDEO = 4,
    PHOTO = 5,
    AUDIO = 6,
    QUOTE = 7,
    COLUMNS = 8,
    PHRASE = 9,
    LIST = 10,
    DIALOG = 11,
    POST = 12,
}

export enum ListBlockContentTypes {
    UNORDERED = 1,
    ORDERED = 2
}

export enum PhotoBlockContentTypes {
    TYPE1 = 1
}

export namespace Embed {
    export const urlRegex = {
        POST: {
            twitter: /^https:\/\/twitter\.com\/\w+\/status\/\d+$/,
            instagram: /^https:\/\/www\.instagram\.com\/p\/[\w\-_]+\/?$/,
            fb: /^https:\/\/(www|ru-ru)\.facebook\.com\/\w+\/posts\/\d+$/
        },
        VIDEO: {
            twitter: /^https:\/\/twitter\.com\/\w+\/status\/\d+$/,
            vk: /^https:\/\/vk\.com\/video-?\d+_\d+$/,
            youtube: /^https:\/\/www\.youtube\.com\/watch\?v=[\w\-_]+$/,
            youtubeShort: /^https:\/\/youtu\.be\/[\w\-_]+$/,
            fb: /^https:\/\/(www|ru-ru)\.facebook\.com\/\w+\/videos\/\d+\/?$/,
            vimeo: /^https:\/\/vimeo\.com\/\d+$/,
            coub: /^https?:\/\/coub\.com\/view\/\w+$/
        },
        AUDIO: {
            soundcloud: /^https:\/\/soundcloud\.com\/[\w\-]+\/[\w\-]+$/,
        }
    }
}