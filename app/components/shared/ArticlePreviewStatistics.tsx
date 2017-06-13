import * as React from 'react';
import {Link} from 'react-router-dom';
import '../../styles/shared/article_preview_statistics.scss';
import {Captions, APIData} from '../../constants';
import {api} from '../../api';
import axios from 'axios';
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from '../../actions/shared/ModalAction';
import Loading from '../shared/Loading';
import * as moment from 'moment';
import PieChartSvg from './charts/PieChartSvg';
import LineChartSvg from './charts/LineChartSvg';

const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');

// let AGES: string[] = ['age_17', 'age_18', 'age_25', 'age_35', 'age_45'];

class ArticleStatisticsModal extends React.Component<{item: any}, {isLoading?: boolean, itemData?: any, viewChart?: string}> {

    VIEW_CHARTS: string[] = ['today_chart', 'last_day_chart', 'month_chart', 'last_month_chart', 'full_chart'];

    cancelSource: any;

    constructor() {
        super();
        this.state = {isLoading: true, itemData: {}, viewChart: ''}
    }

    setCurrentChart(chart: string) {
        this.setState({viewChart: chart});
    }

    processData(data: any): any {

        let finalData: any = {};

        let ageChartData: any = [];
        APIData.ages.forEach((k: string) => {
            if (data[k] && Captions.management[k]) {
                ageChartData.push({label: Captions.management[k], value: data[k]});
            }
        });
        if (ageChartData.length) {
            finalData.age = ageChartData;
        }

        if (data.male_percent != undefined) {
            finalData.gender = [{label: Captions.management.males, value: data.male_percent},
                {label: Captions.management.females, value: (1 - data.male_percent)}]
        }

        let lineCharts: any = {};

        this.VIEW_CHARTS.forEach((k: string) => {
            lineCharts[k] = data[k] ? data[k].map((d: any) => {
                    return ({ label: moment(d[0]).format('DD.MM.YYYY HH:mm') || '', value: d[1] })
                }) : []
        });

        finalData.lineCharts = lineCharts;

        return finalData;
    }

    componentDidMount() {
        this.cancelSource && this.cancelSource.cancel();
        this.cancelSource = axios.CancelToken.source();

        api.get('/statistics/articles/' + this.props.item.id + '/', {cancelToken: this.cancelSource.token}).then((response) => {
            this.setState({itemData: this.processData(response.data), isLoading: false, viewChart: this.VIEW_CHARTS[0]});
        }).catch((error) => {
            if (!axios.isCancel(error)) {
                    this.setState({isLoading: false});
                }
        })
    }

    componentWillUnmount() {
        this.cancelSource && this.cancelSource.cancel();

    }

    render() {
        return (
            <div className="article_preview_statistics__modal">

                <div className="close" onClick={() => { ModalAction.do(CLOSE_MODAL, null) }}><CloseIcon /></div>

                <h2><Link to={"/articles/" + this.props.item.slug } target="_blank"> { this.props.item.title }</Link></h2>

                {
                    this.state.isLoading ? <div><Loading /></div> : null
                }
                <div className="article_preview_statistics__modal_pies">

                    {
                        (this.state.itemData.age || this.state.itemData.gender) ? <h3>{Captions.management.audience}</h3> : null
                    }

                    {
                        this.state.itemData.age ? (
                            <div>
                                <PieChartSvg values={this.state.itemData.age} title={Captions.management.age} displayPercent={true} showLegend={false}/>
                            </div>) : null
                    }
                    {
                        this.state.itemData.gender ? (
                            <div><PieChartSvg values={this.state.itemData.gender} title={Captions.management.gender} displayPercent={true} showLegend={false}/></div>
                        ) : null
                    }
                </div>

                {
                    this.state.itemData.lineCharts ? (
                        <div className="article_preview_statistics__modal_views">
                            <h3>{Captions.management.views}</h3>
                            <div className="article_preview_statistics__modal_views_menu">
                                {
                                    this.VIEW_CHARTS.map((k: string) => {
                                        return <span className={ k== this.state.viewChart ? 'active' : '' }
                                                     onClick={this.setCurrentChart.bind(this, k)}
                                                     key={k}>{Captions.management[k]}</span>
                                    })
                                }
                            </div>
                            {
                                this.state.itemData.lineCharts[this.state.viewChart] ?
                                    <LineChartSvg values={this.state.itemData.lineCharts[this.state.viewChart]} /> : null
                            }
                        </div>
                    ) : null
                }

            </div>)
    }
}


export default class ArticlePreviewStatistics extends React.Component<{item: any}, any> {

    showStats() {
        ModalAction.do(OPEN_MODAL, {content: <ArticleStatisticsModal item={this.props.item}/>})
    }

    render() {
        return (
            <div onClick={this.showStats.bind(this)} className="article_preview_statistics">
                <div className="article_preview_statistics__title">
                    <Link to={"/articles/" + this.props.item.slug} onClick={(e: any) => {e.stopPropagation()}}
                          target="_blank">{this.props.item.title}</Link>
                </div>

                <div className="article_preview_statistics__info">
                    {
                        ['views_today', 'views_month', 'views_last_month'].map((key: string) => {
                            return (this.props.item[key] || this.props.item[key] == 0)
                                ? <div key={key}>{(Captions.management[key].toString() || '') + ':'} <span>{this.props.item[key]}</span> </div> : null
                        })
                    }

                </div>

            </div>)
    }
}