import React from 'react'
import './LiveData.css';

export default class LiveData extends React.Component {
    render() {
        return (
            <div className={'LiveData'}>
                <h1>Live Data</h1>
                <ul className={'atom-data-container'} >
                    {Object.keys(this.props.diagnosticData).map(key => (
                        <li>{key} = {this.props.diagnosticData[key].toFixed(2)}</li>
                    ))}
                </ul>
                <div className={'graph-container'} id='cc-plot'></div>
                <div className={'graph-container'} id='density-plot'></div>
            </div>
        );
    }
  
}
