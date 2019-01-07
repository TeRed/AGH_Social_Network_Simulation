import React from 'react'
import './LiveData.css';

export default class LiveData extends React.Component {
    render() {
        return (
            <div className={'LiveData'}>
                <ul>
                    {Object.keys(this.props.diagnosticData).map(key => (
                        <li>{key} = {this.props.diagnosticData[key]}</li>
                    ))}
                </ul>
        
                <div id='plot'></div>
            </div>
        );
    }
  
}
