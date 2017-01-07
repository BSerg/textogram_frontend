export namespace Captions {
    export const editor = {
        add_cover_ru: 'Добавить обложку',
        remove_cover_ru: 'Удалить обложку',
        enter_title_ru: 'Введите заголовок',
        add_content_help: 'Выберите тип контента, нажав на "плюс"',
        enter_text: 'Введите текст',
        enter_header: 'Введите заголовок',
        enter_lead: 'Введите лид',
        enter_phrase: 'Введите фразу',
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