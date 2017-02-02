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
        add_photo_help: 'Добавьте фото, нажав на «плюс» в панели инструментов',
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
        help_embed_audio: 'SoundCloud, Yandex Music, PromoDJ',
        help_embed_post: 'Twitter, Facebook, Instagram',
        help_embed_empty: 'Нажмите на блок и вставьте ссылку',
        loading: 'Загрузка...',
        loading_image: 'Загрузка изображения',
        dialog_participants: 'Участники диалога',
        choose: 'Выбрать',
        help_dialogue: 'Добавьте реплики, нажав на «плюс» в панели инструментов',
        help_url_modal: 'Введите ссылку',
        help_photo: 'Для создания галереи, добавьте изображения, нажав на «плюс»',
    };

    export const profile = {
        subscribe: 'Подписаться',
        subscribed: 'Вы подписаны',
        menuSubscriptions: "Подписки",
        menuArticles: "Публикации",
    };

    export const main_menu = {
        manage_profile: 'управление профилем',
        create_article: 'создать публикацию',
        drafts: 'черновики',
        notification_default_text: 'Новые уведомления',
        title: 'TEXTIUS',
        forgotPassword: 'забли пароль?',
        register: 'зарегистрироваться',
        about: 'Что такое TEXTIUS?',
        inputPhonePlaceholder: '+7 ',
        inputPasswordPlaceholder: 'Введите пароль',
        loginHint: 'логин',
        passwordHint: 'пароль',
    };

    export const management = {
        title: "Управление профилем",
        usernamePlaceholder: "Введите имя",
        sectionLinks: 'Связи',
        sectionLogin: 'Учетная запись',
        sectionNotifications: 'Уведомления',
        sectionSubscriptions: 'Подписки',

        authAccount: "Аккаунт авторизации",
        additionalLinks: "Дополнительные связи",
        addLinks: "Чтобы добавить ссылки на свои аккаунты в соцсетях, нажмите «плюс»",
        setPhone: "Чтобы добавить подключить телефон, нажмите «плюс»",
        captionPhone: "ЛОГИН (НОМЕР ТЕЛЕФОНА)",
        captionPassword: "ПАРОЛЬ",
        change: "изменить",

        fastSearch: 'Быстрый поиск',

        linkAddPlaceholder: 'Вставьте ссылку',
        linkAddText: 'Ссылка на профиль соцсети или сайт',
        linkAddError: 'Некорректная ссылка',

        drafts: "Черновики",
        draftDelete: "удалить",

        avatarSave: "Сохранить"

    };

    export const registration = {
        register: "зарегистрироваться",
        reset: "восстановить",
        save: "сохранить",
        usernamePrompt: "Имя и фамилия или псевдоним",
        passwordPrompt: "Придумайте пароль",
        passwordAgainPrompt: "Повторите пароль",
        next: "далее",
        finish: "завершить",
        changeNumber: "Изменить номер",
        phoneDescription: "Введите ваш номер телефона, который станет постоянным логином:",
        phoneDescriptionAlt: "Введите ваш номер телефона:",
        codeDescription: "Код подтверждения из смс:",

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
            propmodj: /^http:\/\/promodj\.com\/[\w\-.]+\/tracks\/\d+\/\w+$/,
            yandex: /^https:\/\/music\.yandex\.ru\/album\/\d+(\/track\/\d+)?$/
        }
    }
}

export namespace Validation {
    // isRequired means not null or empty value
    export const ROOT = {
        title: {isRequired: true, maxLength: 150, message: `Заголовок обязателен и ограничен 150 символами`},
    };

    export const TEXT = {
        value: {maxLength: 3000, message: `Текст ограничен 3000 символами`}
    };

    export const HEADER = {
        value: {maxLength: 100, message: `Заголовок ограничен 150 символами`}
    };

    export const LEAD = {
        value: {maxLength: 400, message: `Лид ограничен 400 символами`}
    };

    export const PHRASE = {
        value: {maxLength: 200, message: `Фраза ограничена 200 символами`}
    };

    export const QUOTE = {
        value: {maxLength: 500, message: `Текст цитаты ограничен 500 символами`}
    };

    export const COLUMN = {
        image: {isRequired: true, message: `Добавьте изображение`},
        value: {maxLength: 300, message: `Текст колонки ограничен 300 символами`}
    };

    export const LIST = {
        value: {maxLength: 3000, message: `Текст списков ограничен 3000 символами`}
    };

    export const DIALOGUE = {
        participants: {isRequired: true},
    };
}