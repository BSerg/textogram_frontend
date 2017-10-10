import * as React from 'react';
import Balance from './Balance';
import PaymentLog from './PaymentLog';
import {Captions} from '../../../constants';

export function Payments() {
    return <div>
        <Balance />

        <PaymentLog title={Captions.management.paymentsProfitHistory} type={'profits'}/>
        <PaymentLog title={Captions.management.paymentsWithdrawalHistory} type={'withdrawals'}/>
    </div>;
}

export default Payments;