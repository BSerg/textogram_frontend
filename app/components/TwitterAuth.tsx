import * as React from 'react';


export default class TwitterAuth extends React.Component<any, any> {

    componentDidMount() {
        console.log(this.props);

        if (this.props.location.query) {
            let token = this.props.location.query.oauth_token;
            let verifier = this.props.location.query.oauth_verifier;

            if (token && verifier) {
                localStorage.setItem('twitter_auth_data',
                    JSON.stringify({oauth_token: token, oauth_verifier: verifier}));
                console.log(localStorage.getItem('twitter_auth_data'));
            }
        }
        window.close();
    }

    render() {
        return (<div></div>);
    }
}