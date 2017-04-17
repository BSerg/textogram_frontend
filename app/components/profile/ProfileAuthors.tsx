import * as React from 'react';
import {api} from '../../api';

import AuthorList from './../shared/AuthorList';
import {ModalAction, CLOSE_MODAL} from '../../actions/shared/ModalAction';
import {MediaQuerySerice} from '../../services/MediaQueryService';

import {Captions} from '../../constants';
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');



interface IAuthorsPropsInterface {
    userId: number | string;
    closeSubscribers?: () => {};
    isDesktop?: boolean;
    subscribedBy?: boolean;
}

interface IAuthorsStateInterface {
    items?: any[];
    itemsFiltered?: any[],
    filterString?: string;
}

export default class ProfileAuthors extends React.Component<IAuthorsPropsInterface, IAuthorsStateInterface> {

    constructor() {
        super();
        this.state = {items: [], itemsFiltered: [], filterString: ""};
    }


    load() {
        let params: any = this.props.subscribedBy ? {subscribed_by: this.props.userId} : {subscribed_to: this.props.userId};

        api.get('/users/', {params: params}).then((response: any) => {
            let items = this.updateItems(response.data);
            let objectsFiltered = this.updateItems(response.data);
            this.setState({items: items, itemsFiltered: objectsFiltered});
        }).catch((error: any) => { });
    }

    updateItems(items: any[]): any[] {

        return items.map((item: any) => {
            item.userName = (item.first_name + ' ' + item.last_name).toLowerCase();
            return item;
        });
    }

    filterItems(e: any) {
        let filterString = e.target.value.toLowerCase();
        if (filterString == "") {
            this.setState({itemsFiltered: this.updateItems(this.state.items)});
        }
        else {
            let objectsFiltered: any[] = [];

            this.state.items.forEach((item: any, index) => {
                if (item.userName.indexOf(filterString) != -1) objectsFiltered.push(item);
            });

            this.setState({itemsFiltered: objectsFiltered, filterString: filterString});
        }
    }

    close() {
        if (this.props.closeSubscribers) this.props.closeSubscribers();
        ModalAction.do(CLOSE_MODAL, null);
    }

    componentDidMount() {
        this.load();

        MediaQuerySerice.listen((isDesktop: boolean) => {
            if (isDesktop) {
                ModalAction.do(CLOSE_MODAL, null);
            }
        });
    }

    render() {
        return (
            <div className="profile__subscribers">
                {
                    this.props.closeSubscribers ? (<div onClick={this.close.bind(this)} className="close"><CloseIcon /></div>) : null
                }

                <div className="filter_input">
                    <input onChange={this.filterItems.bind(this)} type="text" placeholder={Captions.management.fastSearch} />
                </div>

                <AuthorList items={this.state.itemsFiltered} showInfo={true} />


            </div>)
    }
}