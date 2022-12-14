export enum ArticleStatuses {
    DRAFT = 1,
    PUBLISHED = 2,
    DELETED = 3,
    SHARED = 4
}

export namespace Captions {
    export const editor = {
        add_cover_ru: 'Загрузить обложку',
        loading_cover_ru: 'Отменить загрузку обложки',
        remove_cover_ru: 'Удалить обложку',
        enter_title_ru: 'Заголовок',
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
        enter_caption: 'Добавьте описание',
        enter_embed_url: 'Вставьте ссылку или код',
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
        publishUpdate: 'Обновить публикацию',
        publishingParams: 'Настройки публикации',
        publishAds: 'Реклама',
        publishLink: 'Доступ по ссылке',
        publishPaywall: 'Paywall',
        error_embed_url: 'Некорректная ссылка',
        help_embed_video: 'Youtube, Vimeo, VK, Facebook',
        help_embed_audio: 'SoundCloud, Yandex Music, PromoDJ',
        help_embed_post: 'FACEBOOK, INSTAGRAM, TWITTER, VK (ТОЛЬКО КОД)',
        help_embed_empty: 'Нажмите на блок и вставьте ссылку',
        loading: 'Загрузка...',
        loading_image: 'Загрузка изображения',
        loading_images: 'Загрузка изображений',
        dialog_participants: 'Участники диалога',
        choose: 'Выбрать',
        help_dialogue: 'Добавьте реплики, нажав на «плюс» в панели инструментов',
        help_url_modal: 'Введите ссылку',
        help_photo: 'Для создания галереи, добавьте изображения, нажав на «плюс»',
        loading_video: 'Загрузка видео',
        loading_audio: 'Загрузка аудио',
        loading_post: 'Загрузка поста',
        saving_error: 'Что-то пошло не так. Мы не можем сохранить эту публикацию.',
        publishing_error: 'Что-то пошло не так. Мы не можем опубликовать эту публикацию.',
        article_created: 'Статья сохранена в черновиках',
        deleted_text_block: 'Текстовый блок удален',
        deleted_header_block: 'Заголовок удален',
        deleted_lead_block: 'Лид удален',
        deleted_phrase_block: 'Фраза удалена',
        deleted_list_block: 'Список удален',
        deleted_quote_block: 'Цитата удалена',
        deleted_column_block: 'Колонка удалена',
        deleted_dialog_block: 'Диалог удален',
        deleted_video_block: 'Видео удалено',
        deleted_audio_block: 'Аудио удалено',
        deleted_post_block: 'Пост удален',
        deleted_photo_block: 'Галерея удалена',
        restore: 'Восстановить',
        clear: 'Очистить',
        onDangerousExit: 'Несохраненные данные могут быть потеряны! Вы уверены, что хотите выйти?',
        paywall_price: 'Стоимость',
        enter_paywall_price: 'Введите стоимость',
        paywall_price_tax_help: 'Стоимость доступа с учетом комиссии составит:',
        photo_upload_canceled: 'Загрузка фото отменена',
    };

    export const shared = {
        confirmLabel: 'OK',
        cancelLabel: 'Отмена',
        linkCopied: 'Ссылка скопирована в буфер обмена',
        currency: {
            RUR: '₽',
            USD: '$',
            EUR: '€'
        },
        articleRestrictedHeader: 'Доступ к статье ограничен',
        articleRestrictedPriceCaption: 'Стоимость доступа',
        toBuyAccessToArticle: 'Купить',
    };

    export const profile = {
        subscribe: 'Подписаться',
        subscribed: 'Вы подписаны',
        unSubscribe: 'Отписаться',
        menuSubscriptions: "Подписки",
        menuArticles: "Мои тексты",
        menuDrafts: "Черновики",
        subscribers: "Читают",
        subscribersOwnProfile: "Вас читают",
        newArticle: "Новый текст",

                
        followers: "Читатели",
        following: "Читаемые",

        articlePreviewEdit: "Редактировать",
        articlePreviewSettings: "Настройки",
        articlePreviewCopy: "Копировать",
        articlePreviewCopyToDrafts: "Копировать в черновики",
        articlePreviewDelete: "Удалить",

        subscribersYouAreSubscribed: "Вы читаете",
        subscribersNumber: "Читают",
        subscribersArticles: "Текстов",

        switchButtonDrafts: "Черновики",
        switchButtonCloseDrafts: "Закрыть черновики",
        switchButtonAuthors: "Авторы",
        switchButtonCloseAuthors: "Авторы",
    };

    export const mainMenu = {
        manageProfile: 'управление профилем',
        myProfile: 'мой профиль',
        createArticle: 'новый текст',
        drafts: 'черновики',
        feed: 'подписки',
        myTexts: 'мои тексты',
        notificationDefaultText: 'Новые уведомления',
        notificationZeroText: 'Нет непрочитанных  уведомлений',
        title: 'TEXTIUS',
        forgotPassword: 'забыли пароль?',
        register: 'регистрация',
        about: 'Что такое TEXTIUS?',
        help: 'Помощь',
        inputPhonePlaceholder: '+7 ',
        inputPasswordPlaceholder: 'Введите пароль',
        loginHint: 'Логин',
        passwordHint: 'Пароль',
        authorize: 'авторизация',
        login: "Войти",
    };

    export const management: any = {
        title: "Управление профилем",
        usernamePlaceholder: "Введите имя",
        sectionAccount: 'Аккаунт',
        sectionLinks: 'Связи',
        sectionLogin: 'Учетная запись',
        sectionNotifications: 'Уведомления',
        sectionSubscriptions: 'Подписки',
        sectionStatistics: 'Статистика',
        sectionPayments: 'Платежи',
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
        linkAddTextDesktop: "Вставьте ссылку на профиль в соцсети и нажмите Enter",
        linkAddError: 'Некорректная ссылка',

        drafts: "Черновики",
        draftDelete: "удалить",
        avatarSave: "Сохранить",

        balanceTitle: 'Текущий баланс',
        balanceWithdraw: 'Вывести средства',
        balanceWalletText: 'Текущий кошелек',
        balanceWalletNotSet: 'Не задан',
        balanceWithdrawPending: 'Запрошен вывод средств',

        paymentsProfitHistory: 'История начислений',
        paymentsWithdrawalHistory: 'История выплат',
        paymentsLoadLogMore: 'Загрузить еще',
        paymentsLogEmpty: 'Нет данных',

        audience: "Аудитория",

        views_today: "За сегодня",
        views_month: "За месяц",
        views_last_month: "За предыдущий месяц",
        views_total: "Всего",

        age_17: "Моложе 18 лет",
        age_18: "От 18 до 24 лет",
        age_25: "От 25 до 34 лет",
        age_35: "От 35 до 44 лет",
        age_45: "Старше 45 лет",

        males: "Мужчины",
        females: "Женщины",

        age: "Возраст",
        gender: "Пол",
        views: "Просмотры",
        views_alt: "Просмотров",


        today_chart: "Сегодня",
        last_day_chart: "Вчера",
        month_chart: "Месяц",
        last_month_chart: "Прошлый месяц",
        full_chart: "Все",

    };

    export const registration = {
        register: "зарегистрироваться",
        reset: "восстановить",
        save: "сохранить",
        usernamePrompt: "Имя и фамилия или псевдоним",
        passwordPrompt: "Придумайте пароль",
        passwordAgainPrompt: "Повторите пароль",
        passwordSave: "Изменить пароль",
        next: "далее",
        finish: "завершить",
        changeNumber: "Изменить номер",
        phoneDescription: "Введите ваш номер телефона, который станет постоянным логином:",
        phoneDescriptionAlt: "Введите ваш номер телефона:",
        codeDescription: "Код подтверждения из смс:",

        stepPhoneRegistration: "ШАГ 1 - номер телефона" ,
        stepCodeRegistration: "ШАГ 2 - код подтверждения",
        stepPasswordRegistration: "ШАГ 3 - пароль",
        stepCodeReset: "ШАГ 1 - код подтверждения",
        stepPasswordReset: "ШАГ 2 - пароль",
    };

    export const index = {
        oneClickRegister: "Регистрация в один клик",
        featureAbout: "Текстиус — это инструмент для авторов. Быстрый способ создать Текст, поделиться им с аудиторией и монетизировать уникальный контент.",
        editorBlockCaption: "Редактор",
        editorBlockText: "Самая важная часть инструмента — редактор. Редактор в Текстиус устроен по принципу модулей. Всего их двенадцать: от простого текстового блока до возможности оформить Текст в виде диалога. Все максимально просто и доступно с любых устройств.",
        textBlockCaption: "Текст",
        textBlockText: "Вы получите ссылку на свою публикацию, лишенную визуального мусора. Текст, которым приятно делиться с читателями.",
        otherBlockCaption: "Что еще",
        otherBlockText: "У Текстиуса есть система подписок на любимых авторов, но на этом социальная составляющая ограничивается.\n\nМы все устали от бесполезных лайков и комментариев. Обратная связь в Тексиус — это показатель дохода, хорошей статистики текстов и реально заработанных денег.",
        mainBlockCaption: "Самое главное",
        mainBlockText: "Текстиус дает три инструмента монетизации:\n\n* paywall\n* баннерный обвес\n* нативная реклама\n\nАвтор сам решает какой вид рекламы для него предпочтителен."
    };
}

export namespace Constants {
    export const maxImageSize = 5 * 1024 * 1024;
    export const notificationIntervalTime = 300000;
    export const desktopWidth = 1024;
    export const paywallDefaultPriceRUR = 100;
    export const maxUsernameLength: number = 30;
    export const maxDescriptionLength: number = 140;
}

export namespace APIData {
    export const ages: string[] = ['age_17', 'age_18', 'age_25', 'age_35', 'age_45'];
    export const views: string[] = ['views_today', 'views_month', 'views_last_month', 'views_total'];


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
        POST: [
            // Twitter
            /^https:\/\/twitter\.com\/\w+\/status\/\d+\/?([&?][\w\-]+=[^&]+)*$/,
            // Instagram
            /^https:\/\/www\.instagram\.com\/p\/[\w\-_]+\/?([&?][\w\-]+=[^&]+)*$/,
            // Facebook
            /^https:\/\/(www|ru-ru)\.facebook\.com\/[\w\-_.]+\/(posts|videos)\/\d+\/?([&?][\w\-]+=[^&]+)*$/,
        ],
        VIDEO: [
            // Facebook
            /^https:\/\/(www|ru-ru)\.facebook\.com\/[\w\-_.]+\/videos\/\d+\/?([&?][\w\-]+=[^&]+)*$/,
            // VK
            /^https:\/\/vk\.com\/video-?\d+_\d+\$/,
            // Youtube
            /^https:\/\/www\.youtube\.com\/watch\?v=[\w\-_]+(&[\w\-]+=[^&]+)*$/,
            /^https:\/\/youtu\.be\/[\w\-_]+([?&][\w\-]+=[^&]+)*$/,
            // Vimeo
            /^https:\/\/vimeo\.com\/\d+(#\w+=\w+)?$/,
            // Coub
            /^https?:\/\/coub\.com\/view\/\w+$/
        ],
        AUDIO: [
            // SoundCloud
            /^https:\/\/soundcloud\.com\/[\w\-]+\/[\w\-]+$/,
            // Propmodj
            /^http:\/\/promodj\.com\/[\w\-.]+\/tracks\/\d+\/\w+$/,
            // Yandex
            /^https:\/\/music\.yandex\.ru\/album\/\d+(\/track\/\d+)?$/
        ],
    };
    export const embedRegex = {
        POST: [
            // VK
            /^<div id="vk_post_-?\d+_\d+"><\/div>\s*<script type="text\/javascript">[^<]+<\/script>$/,
            /^<iframe src="\/\/vk\.com\/video_ext\.php\?oid=-?\d+&id=\d+&hash=\w+&hd=\d"( width="\d+")?( height="\d+")?( frameborder="(0|1)")?( allowfullscreen)?><\/iframe>$/,
            // Twitter
            /^<blockquote class="twitter-(tweet|video)" data-lang="\w+"><p lang="\w+" dir="ltr">.+<\/blockquote>\s*<script async src="\/\/platform\.twitter\.com\/widgets\.js" charset="utf-8"><\/script>$/,
            //Facebook
            /^<iframe src=\"https:\/\/[\w\-]+\.facebook\.com\/plugins\/(post|video)\.php\?href=https(%3A|:)(%2F%2F|\/\/)www\.facebook\.com(%2F|\/)[\w\-.]+(%2F|\/)(posts|videos)(%2F|\/)\d+(%2F|\/)?(&show_text=(0|1))?&width=\d+\"( width=\"\d+\")?( height=\"\d+\")?( style=\".+\")?( scrolling=\"(yes|no)\")?( frameborder=\"(0|1)\")?( allowTransparency=\"(true|false)\")?(allowFullScreen=\"(true|false)\")?><\/iframe>$/
        ],
        VIDEO: [
            // Youtube
            /^<iframe( width="\d+")?( height="\d+")? src="https:\/\/www\.youtube(-nocookie)?\.com\/embed\/[\w\-]+((\?|&|&amp;)\w+=\w+)*"( frameborder="(0|1)")?( allowfullscreen)?><\/iframe>$/,
            // Vimeo
            /^<iframe src="https:\/\/player\.vimeo\.com\/video\/\d+([\?&]\w+=[01])*" width="\d+" height="\d+"( frameborder="0")?( (webkit|moz)?allowfullscreen)*><\/iframe>(\s*<p>(\s*.)+<\/p>)?$/,
            // Coub
            /^<iframe src="\/\/coub\.com\/embed\/\w+((\?|&)\w+=(true|false))*"( allowfullscreen="(true|false)")?( frameborder="(0|1)")?( width="\d+")?( height="\d+")?><\/iframe>(<script async src="\/\/c-cdn\.coub\.com\/embed-runner\.js"><\/script>)?$/,
            // VK Video
            /^<iframe src="\/\/vk\.com\/video_ext\.php\?oid=-?\d+&id=\d+&hash=\w+&hd=\d"( width="\d+")?( height="\d+")?( frameborder="(0|1)")?( allowfullscreen)?><\/iframe>$/,
        ],
        AUDIO: [
            // SoundCloud
            /^<iframe( width="\d+%?")?( height="\d+")?( scrolling="(yes|no)")?( frameborder="(yes|no)")? src="https:\/\/w\.soundcloud\.com\/player\/\?url=https(%3A|:)\/\/api\.soundcloud\.com\/tracks\/\d+((&amp;|&)\w+=(\w+|true|false))*"><\/iframe>$/,
            // PromoDJ
            /^<iframe src="\/\/promodj\.com\/embed\/\d+\/(cover|big)"( width="\d+%?")?( height="\d+")?( style="[^"]+")?( frameborder="(0|1)")?( allowfullscreen)?><\/iframe>$/,
            // Yandex
            /^<iframe( frameborder="(0|1)")?( style="[^"]+")?( width="\d+")?( height="\d+")? src="https:\/\/music\.yandex\.ru\/iframe\/(#album\/\d+\/|#track\/\d+\/\d+)(\/\w+)*\/?">(\s*.)+<\/iframe>$/,
        ]
    };
}

export namespace Validation {
    // isRequired means not null or empty value
    export const ROOT = {
        title: {isRequired: true, maxLength: 150, message: `Заголовок обязателен и не может превышать 150 знаков`},
    };

    export const TEXT = {
        value: {isRequired: false}
        // value: {maxLength: 3000, message: `Рекомендуемая длина текста 3000 символов`}
    };

    export const HEADER = {
        value: {isRequired: false}
        // value: {maxLength: 100, message: `Текст подзаголовка не может превышать 150 знаков`}
    };

    export const LEAD = {
        value: {isRequired: false}
        // value: {maxLength: 400, message: `Рекомендуемая длина лида 400 символов`}
    };

    export const PHRASE = {
        value: {isRequired: false}
        // value: {maxLength: 250, message: `Фраза не может превышать 250 знаков`}
    };

    export const QUOTE = {
        value: {isRequired: false}
        // value: {maxLength: 1000, message: `Цитата не может превышать 1000 знаков`}
    };

    export const COLUMN = {
        image: {isRequired: false},
        value: {isRequired: false}
        // value: {maxLength: 1000, message: `Текст в Колонках не может превышать 1000 знаков`}
    };

    export const LIST = {
        value: {isRequired: false}
        // value: {maxLength: 3000, message: `Рекомендуемая длина текста списка 3000 символов`}
    };

    export const DIALOGUE = {
        participants: {isRequired: true},
    };
}

export const BannerID = {
    BANNER_TOP: 'banner__top',
    BANNER_BOTTOM: 'banner__bottom',
    BANNER_CONTENT: 'banner__content',
    BANNER_RIGHT_SIDE: 'banner__right_side',
    BANNER_CONTENT_INLINE: 'banner__content_inline'
};

export namespace Amp {
    export const blockTypes: number[] = [BlockContentTypes.POST, BlockContentTypes.AUDIO, BlockContentTypes.VIDEO];
    export const embedTypes: string[] = ['soundcloud', 'instagram', 'twitter', 'facebook', 'youtube', 'vimeo'];
}