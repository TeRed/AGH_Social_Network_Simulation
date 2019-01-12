import React from 'react'
import './LiveData.css';

export default class LiveData extends React.Component {
    render() {
        return (
            <div className={'LiveData'}>
                <h1>Live Data</h1>
                <ul className={'atom-data-container'} >
                    {Object.keys(this.props.diagnosticData).map(key => {
                            const atom = this.props.diagnosticData[key];
                            let fixedLength = 2;
                            let atomValue = atom;

                            if(atom.constructor === Object) {
                                fixedLength = atom.fixed;
                                atomValue = atom.value;
                            }
                            
                            return (
                                <li>{key} = {atomValue.toFixed(fixedLength)}</li>
                            );
                        })
                    }
                </ul>
                <div className={'graph-container'} id='cc-plot'></div>
                <div className={'graph-container'} id='density-plot'></div>
            </div>
        );
    }
  
}
