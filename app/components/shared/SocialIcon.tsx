import * as React from 'react';

const VKIcon = require('babel!svg-react!../../assets/images/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('babel!svg-react!../../assets/images/profile_social_icon_fb.svg?name=FBIcon');
const TwitterIcon = require('babel!svg-react!../../assets/images/profile_social_icon_twitter.svg?name=TwitterIcon');
const GoogleIcon = require('babel!svg-react!../../assets/images/profile_social_icon_google.svg?name=GoogleIcon');
const UrlIcon = require('babel!svg-react!../../assets/images/profile_web_link_icon.svg?name=UrlIcon');

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
    };

    constructor(props: any) {
        super(props)
    }

    getIcon(): any {
        let Icon = this.ICONS[this.props.social];
        return Icon ? Icon : UrlIcon;
    }

    render() {
        let Icon = this.getIcon();
        return (<Icon />)
    }
}