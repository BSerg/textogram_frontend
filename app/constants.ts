export namespace Captions {
    export const editor = {
        add_cover_ru: 'Добавить обложку',
        remove_cover_ru: 'Удалить обложку',
        enter_title_ru: 'Введите заголовок',
        add_content_help: 'Выберите тип контента, нажав на "плюс"',
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
    ADD = 1,
    SWAP_BLOCKS = 2,
    TEXT = 3,
    HEADER = 4,
    LEAD = 5,
    VIDEO = 6,
    PHOTO = 7,
    AUDIO = 8,
    QUOTE = 9,
    COLUMNS = 10,
    PHRASE = 11,
    LIST = 12,
    DIALOG = 13,
    POST = 14,
}