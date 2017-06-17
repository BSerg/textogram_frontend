import * as React from 'react';
import PieChartSvg from '../shared/charts/PieChartSvg';
import './ProfileArticles';
import ProfileArticles from "./ProfileArticles";
import {api} from '../../api';
import axios from 'axios';
import {Captions, APIData} from '../../constants';
import '../../styles/profile/profile_management_statistics.scss'
import {displayNumber} from './utils'

import Loading from '../shared/Loading';

export default class ProfileManagementStatistics extends React.Component<any, {items?: any[], statData?: any, isLoading?: boolean}|any> {

    cancelSource: any;

    constructor() {
        super();
        this.state = {items: [], isLoading: true, statData: {}};
    }

    processData(data: any): any {

        let ageChartData: any = [];
        APIData.ages.forEach((k: string) => {
            if (data[k] && Captions.management[k]) {
                ageChartData.push({label: Captions.management[k], value: data[k]});
            }
        });

        if (ageChartData.length) {
            data.age = ageChartData;
        }

        if (data.male_percent || data.male_percent == 0) {
            data.gender = [{label: Captions.management.males, value: data.male_percent},
                {label: Captions.management.females, value: (1 - data.male_percent)}];
        }
        APIData.views.forEach((k: string) => {
            data[k] = displayNumber(data[k]);
        });

        return data;
    }

    getStatistics() {
        this.cancelSource && this.cancelSource.cancel();
        this.cancelSource = axios.CancelToken.source();

        api.get('/statistics/common/', {cancelToken: this.cancelSource.token}).then((response: any) => {
            this.setState({statData: this.processData(response.data), isLoading: false});
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
        this.cancelSource && this.cancelSource.cancel();
    }

    render() {

        return (
            <div className="profile_management_statistics">
                {
                    this.state.isLoading ? <Loading /> : null
                }

                {
                    this.state.statData.views_today || this.state.statData.views_today == 0 ? (
                        <div>
                            <h2 key="header">{Captions.management.views}</h2>

                            <div className="profile_management_statistics_block">
                                {
                                    APIData.views.map((k: string) => {
                                        return <div key={k} className="profile_management_statistics_view"><span>{Captions.management[k]}</span><span>{this.state.statData[k]}</span></div>
                                    })
                                }
                            </div>
                        </div>
                    ) : null
                }

                {
                    this.state.statData.ages || this.state.statData.gender ? [
                        <h2 key="header">{Captions.management.audience}</h2>,
                        <div key="data" className="profile_management_statistics_block">
                            {
                                this.state.statData.age ? <PieChartSvg values={this.state.statData.age}
                                                                     showLegend={false}
                                                                     title={Captions.management.age}
                                                                     displayPercent={true}/> : null
                            }
                            {
                                this.state.statData.gender ? <PieChartSvg values={this.state.statData.gender}
                                                                           showLegend={false}
                                                                           title={Captions.management.gender}
                                                                           displayPercent={true}/> : null
                            }

                        </div>

                    ] : null
                }


                <ProfileArticles section={'statistics'} />

            </div>)
    }
}