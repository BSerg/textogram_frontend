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
        enter_caption: 'Описание',
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

    };

    export const main_menu = {
        manage_profile: 'управление профилем',
        create_article: 'создать публикацию',
        drafts: 'черновики',
        notification_default_text: 'Новые уведомления'
    };

    export const management = {
        title: "Управление профилем",
        usernamePlaceholder: "Введите имя",

    };
}

export namespace Constants {
    export const maxImageSize = 5 * 1024 * 1024;
    export const notificationIntervalTime = 20000;
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