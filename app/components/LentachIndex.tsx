import * as React from 'react';
import SocialIcon from "./shared/SocialIcon";

export default class LentachIndex extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="lentach_index" style={{textAlign: "center"}}>
                <div className="index__wrapper">
                    <div className="index__logo"></div>
                    <div className="index__content">
                        <div className="index__title"></div>
                        <div className="index__socials">
                            <a href="https://vk.com/true_lentach"><SocialIcon social="vk"/></a>
                            <a href="https://www.facebook.com/oldLentach"><SocialIcon social="fb"/></a>
                            <a href="https://twitter.com/oldLentach"><SocialIcon social="twitter"/></a>
                            <a href="https://www.instagram.com/true_lentach/"><SocialIcon social="instagram"/></a>
                            <a href="https://telegram.me/lentachold"><SocialIcon social="telegram"/></a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}