import * as React from 'react';
import LineChart from '../shared/charts/LineChart';
import PieChart from '../shared/charts/PieChart';
import './ProfileArticles';
import ProfileArticles from "./ProfileArticles";
import {api} from '../../api';
import axios from 'axios';



import Loading from '../shared/Loading';

export default class ProfileManagementStatistics extends React.Component<any, {items?: any[], isLoading?: boolean, cancelSource?: any}> {

    constructor() {
        super();
        this.state = {items: [], isLoading: true};
    }

    getStatistics() {
        this.state.cancelSource && this.state.cancelSource.cancel();
        this.state.cancelSource = axios.CancelToken.source();

        api.get('/statistics/common/', {cancelToken: this.state.cancelSource.token}).then((response: any) => {
            console.log(response.data);
        }).catch((error) => {
            if (!axios.isCancel(error)) {
                    this.setState({isLoading: false});
                }
        })
    }

    componentDidMount() {
        this.getStatistics();
    }

    componentWillUnmount() {
        this.state.cancelSource && this.state.cancelSource.cancel();
    }

    render() {


        return (
            <div>
                {
                    this.state.isLoading ? <Loading /> : null
                }
                <div></div>

                <ProfileArticles section={'statistics'} />

            </div>)
    }
}