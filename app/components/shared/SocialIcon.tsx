import * as React from 'react';

const VKIcon = require('-!babel-loader!svg-react-loader!../../assets/images/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('-!babel-loader!svg-react-loader!../../assets/images/profile_social_icon_fb.svg?name=FBIcon');
const TwitterIcon = require('-!babel-loader!svg-react-loader!../../assets/images/profile_social_icon_twitter.svg?name=TwitterIcon');
const GoogleIcon = require('-!babel-loader!svg-react-loader!../../assets/images/profile_social_icon_google.svg?name=GoogleIcon');
const UrlIcon = require('-!babel-loader!svg-react-loader!../../assets/images/profile_web_link_icon.svg?name=UrlIcon');
const SiteIcon = require('-!babel-loader!svg-react-loader!../../assets/images/site.svg?name=SiteIcon');
const TelegramIcon = require('-!babel-loader!svg-react-loader!../../assets/images/telegram.svg?name=TelegramIcon');
const InstagramIcon = require('-!babel-loader!svg-react-loader!../../assets/images/profile_social_icon_instagram.svg?name=InstagramIcon');
const WhatsappIcon = require('-!babel-loader!svg-react-loader!../../assets/images/whatsapp.svg?name=WhatsappIcon');
const ViberIcon = require('-!babel-loader!svg-react-loader!../../assets/images/viber.svg?name=ViberIcon');
const LinkIcon = require('-!babel-loader!svg-react-loader!../../assets/images/share_link.svg?name=LinkIcon');

interface ISocialIconProps {
    social?: string
}

export default class SocialIcon extends React.Component<ISocialIconProps, any> {

    ICONS: any = {
        'vk': VKIcon,
        'fb': FBIcon,
        'facebook': FBIcon,
        'twitter': TwitterIcon,
        'google': GoogleIcon,
        'telegram': TelegramIcon,
        'instagram': InstagramIcon,
        'whatsapp': WhatsappIcon,
        'viber': ViberIcon,
        'link': LinkIcon
    };

    constructor(props: any) {
        super(props)
    }

    getIcon(): any {
        let Icon = this.ICONS[this.props.social];
        return Icon ? Icon : SiteIcon;
    }

    render() {
        let Icon = this.getIcon();
        return (<Icon />)
    }
}