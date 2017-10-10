import * as React from 'react';
import MenuButton from './shared/MenuButton';
import Menu from './menu/Menu';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {Helmet} from 'react-helmet';
import {setScreenSize} from '../store/screen';



export class Base extends React.Component<any, any> {
    private intervalId: number;

    constructor(props: any) {
        super(props);
    }

    setScreenSize() {
        this.props.setScreenSize(window.innerWidth, window.innerHeight);
    }

    componentWillMount() {
        if (process.env.IS_BROWSER) {

            let appServer = document.getElementById('app_server');
            if (appServer) {
                appServer.parentNode.removeChild(appServer);
            }
            this.setScreenSize();
            window.addEventListener('resize', this.setScreenSize.bind(this));
        }
        
    }

    render() {

        let {user, menuOpen, isDesktop} = this.props;
        return (
            <div className="container">
                <Helmet>
                    <title>{process.env.SITE_NAME}</title>
                    <meta charSet="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                    <meta property="title" content={process.env.SITE_NAME} />
                    <meta property="og:title" content={process.env.SITE_NAME} />
                    <meta property="og:url" content={process.env.SITE_URL} />
                </Helmet>
                <Menu />
                <div className={"content" + (menuOpen ? " content_menu_open" : "")}>
                    {this.props.children}
                </div>
                
                { !process.env.IS_LENTACH && <MenuButton/> }
            </div>
        )
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    // console.log(state);
    return {
        isDesktop: state.screen.isDesktop,
    }
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        setScreenSize: (width: number, height: number) => {dispatch(setScreenSize(width, height))}
    }
}

// export default process.env.IS_BROWSER ? withRouter(connect(mapStateToProps, mapDispatchToProps)(Base)) : Base;
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Base));