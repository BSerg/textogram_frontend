import * as React from 'react';
import {connect} from 'react-redux';
import {Captions} from '../../../constants';
import * as moment from 'moment';

export class Balance extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.requestWithdraw = this.requestWithdraw.bind(this);
    }

    requestWithdraw() {
        console.log('request withdraw');
    }

    render() {
        let {balance, wallet, withdrawPending} = this.props;
        return <div className="management_block">
            <h2>{Captions.management.balanceTitle}: <span>{balance}</span> TC</h2>

            <p>
                <span className="management_label">{Captions.management.balanceWalletText}:</span>
                <span className="management_value">{ wallet || Captions.management.balanceWalletNotSet }</span>
            </p>
            { withdrawPending ? <p>
                <span className="management_label">{Captions.management.balanceWithdrawPending}:</span>
                <span className="management_value">{withdrawPending}</span>
            </p> :  
            <button onClick={this.requestWithdraw} disabled={balance === 0}>{Captions.management.balanceWithdraw}</button> }
            
        </div>;
    }
}

const mapStateToProps = (state: any) => {
    return {
        balance: state.userData.user.balance || 0,
        coinAccount: state.userData.user.wallet,
        withdrawPending: state.userData.user.withdrawPending,
    }
}


export default connect(mapStateToProps, null)(Balance);