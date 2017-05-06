import * as React from 'react';
import LineChartBuilder from '../shared/charts/LineChartBuilder';


export default class ProfileManagementStatistics extends React.Component<any, any> {

    render() {

        let vals: any[] = [
            { label: '25', value: 20 },
            { label: '26', value: 40 },
            // { label: '27', value: 10 },
        ];

        let values: any[] = [
            { label: '25', value: 20 },
            { label: 'вывфыывы влыв фы выф вфылв фы в фыв оыф выф в фылов лфы волф', value: 40 },
            { label: '27', value: 10 },
            { label: '28', value: 20 },
            { label: '29', value: 30 },
            { label: '30', value: 95 },
            { label: '01', value: 90 },
            { label: '02', value: 60 },
            { label: '03', value: 80 } ,
            { label: '04', value: 80 },
            { label: '05', value: 200 },
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
            <div style={{paddingTop: '20px'}}>

                <LineChartBuilder values={values} />
            </div>)
    }
}