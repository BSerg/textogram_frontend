import * as React from 'react';
import {connect} from 'react-redux';
import {saveNickname} from './actions';
const ConfirmIcon = require('-!babel-loader!svg-react-loader!../../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');
import Loading from '../../shared/Loading';
import {api} from '../../../api';
import axios from 'axios';


export class Nickname extends React.Component<any, any> {
    cancelSource: any;
    nicknameCheckTimeout: any;
        
    
    constructor(props: any) {
        super(props);
        this.state = { nickname: props.nickname, checking: false, correct: true};
    }

    save() {
        this.props.save(this.state.nickname);
    }

    changeHandler(e: any) {
        let val: string = e.target.value;
        if ((val == '' || val.match(/^[A-Za-z][A-Za-z\d_]*$/)) && val.length <= 20 ) {
            this.setState({nickname: val}, this.checkNickname);
        }
    }

    checkNickname() {
        
        if (this.state.nickname === this.props.nickname) {
            this.setState({checking: false, correct: true});
        }
        else if (this.state.nickname.length < 4) {
            this.setState({checking: false, correct: false});
        }
        else {
            this.cancelSource && this.cancelSource.cancel();
            this.cancelSource =  axios.CancelToken.source();
            this.setState({checking: true, correct: true}, () => {
                this.nicknameCheckTimeout && clearTimeout(this.nicknameCheckTimeout);
                this.nicknameCheckTimeout = setTimeout(() => {
                    api.get('/users/check_nickname/',
                            {params: {nickname: this.state.nickname},
                            cancelToken: this.cancelSource.token}).then((response: any) => {
                                this.setState({checking: false, correct: true});
                    }).catch((error) => {
                        this.setState({checking: false, correct: false});
                    });
                }, 1000);
            });
        }
    }

    componentWillUnmount() {
        this.cancelSource && this.cancelSource.cancel();
        this.nicknameCheckTimeout && clearTimeout(this.nicknameCheckTimeout);
    }
    
    render() {
        let {nickname, saving} = this.props;
        let {checking, correct} = this.state;
        let nicknameChanged = this.state.nickname !== nickname;
        let hint: any = this.state.nickname ? ((nicknameChanged && !checking) ? (correct ? 'Никнейм доступен' : 'Никнейм не доступен') : null): 'Никнейм не должен быть пустым';

        return <div className="profile_management_links">
            <div className="title nickname">Никнейм</div>
            <div className="main nickname">
                <div className="nickname_input">
                    <input className={correct ? "" : "nickname_error" } 
                            disabled={saving} type="text" 
                            value={this.state.nickname} 
                            onChange={this.changeHandler.bind(this)} />
                    {
                        (checking || saving ) ? <div className="nickname_confirm"><Loading /></div> :
                            ((correct && nicknameChanged) ?
                                <div className="nickname_confirm active" onClick={this.save.bind(this)}>
                                    Сохранить
                                </div> : <div className="nickname_confirm"></div>)
                    }
                </div>

                <div className={"hint" + (correct ? "" : " nickname_error") }>{hint}</div>
            </div>
        </div>
    }
}
    
const mapStateToProps = (state: any) => {
    return {
        nickname: state.userData.user.nickname,
        correct: state.userData.nicknameData.correct,
        checking: state.userData.nicknameData.checking,
        saving: state.userData.nicknameData.saving,
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        save: (n: string) => { dispatch(saveNickname(n)) }
    }
}
    
export default connect(mapStateToProps, mapDispatchToProps)(Nickname);