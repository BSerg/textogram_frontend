import * as React from 'react';
import LineChart from '../shared/charts/LineChart';
import PieChart from '../shared/charts/PieChart';
import './ProfileArticles';
import ProfileArticles from "./ProfileArticles";

export default class ProfileManagementStatistics extends React.Component<any, {items?: any[]}> {

    constructor() {
        super();
        this.state = {items: []};
    }

    render() {

        let valsPie: any[] = [
            { label: 'женщины', value: 200 },
            { label: 'мужчины', value: 405 },
            { label: 'дети', value: 30 },
            { label: 'коты', value: 70 },
            // { label: 'nsnsn', value: 266 },
            // { label: 'dsdas', value: 405 },
            // { label: 'дети', value: 30 },
            // { label: 'коты', value: 45 },
        ];

        let vals: any[] = [
            { label: '25', value: 20 },
            { label: '26', value: 40 },
            // { label: '27', value: 10 },
        ];

        let values: any[] = [
            { label: '25', value: 20 },
            { label: 'вывфыывы влыв фы выф', value: 40 },
            { label: '27', value: 10 },
            { label: '28', value: 20 },
            { label: '29', value: 30 },
            { label: '30', value: 95 },
            { label: '01', value: 90 },
            { label: '02', value: 60 },
            { label: '03', value: 80 } ,
            { label: '04', value: 80 },
            { label: '20.04.2017', value: 190 },
            { label: '05', value: 60 },
            { label: '05', value: 30 },
            { label: '05', value: 50 },
            { label: '05', value: 80 },
            { label: '05', value: 85 },
            { label: '05', value: 86 },
            { label: '25', value: 20 },
            { label: '26', value: 40 },
            { label: '27', value: 10 },
            { label: '28', value: 20 },
            { label: '29', value: 30 },
            { label: '29.03.2017', value: 95 },
        ];

        return (
            <div>
                <div style={{paddingTop: '20px'}} >
                    <PieChart values={valsPie} title="Аудитория" />
                </div>

                <div style={{padding: '20px 0'}}>
                    <LineChart values={values} valuePrefix="Посетителей: " title="Посещаемость"/>
                </div>

                <ProfileArticles section={'statistics'} />



            </div>)
    }
}