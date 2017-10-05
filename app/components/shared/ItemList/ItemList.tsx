import * as React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

export class ItemList extends React.Component<any, any> {

    render() {
        return <div>

        </div>;
    }
}


const mapStateToProps = (state: any, ownProps: any) => {
    return {

    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {

    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(ItemList));