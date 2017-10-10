import * as React from 'react';
import {connect} from 'react-redux';
import {Captions} from '../../../constants';
import Loading from '../../shared/Loading';
import * as moment from 'moment';
import {loadItems, loadMoreItems} from './actions';


export function formatDate(dateString: string = ''): string {
    let s = moment(dateString).format('D.MM.YYYY');
    return s || '';
}
 

export function PaymentItem(props: {item: any}): any {
    let {item} = props;
    let dateStr = formatDate(item.date || '');
    return <div className="payment_item">
        <div className="payment_item__date">{dateStr}</div>
        <div>{item.text}</div>
        
    </div>
}


export class PaymentLog extends React.Component<any, any> {

    componentDidMount() {
        this.props.loadItems();
    }

    render() {
        let {title, items, loading, hasMore, loadMoreItems} = this.props;
        return <div className="management_block">
            <h3>{title}</h3>

            { items.map((item: any): any => {
                return <PaymentItem key={item.id} item={item} />
            }) }
            { !items.length && !loading && <div className="management_block__items_empty">{Captions.management.paymentsLogEmpty}</div> }

            {loading && <Loading />}
            {!loading && hasMore && <div className="management_block__load_more" onClick={loadMoreItems}>{Captions.management.paymentsLoadLogMore}</div>}
        </div>
    }
}

const mapStateToProps = (state: any, ownProps: any): any => {
    let log = state.paymentLogs[ownProps.type];
    if (!log) {
        return { items: [], hasMore: false }
    }
    return {
        items: log.items || [],
        loading: !!log.loading,
        hasMore: !!log.nextUrl,
    }
}

const mapDispatchToProps = (dispatch: any, ownProps: any) => {

    return {
        loadItems: () => { dispatch(loadItems(ownProps.type)) },
        loadMoreItems: () => { dispatch(loadMoreItems(ownProps.type)) },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentLog);