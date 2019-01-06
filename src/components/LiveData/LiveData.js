import React from 'react'
import './LiveData.css';

const LiveData = ({diagnosticData}) => {
  return (
    <div className={'LiveData'}>
        <ul>
            {Object.keys(diagnosticData).map(key => (
                <li>{key} = {diagnosticData[key]}</li>
            ))}
        </ul>
    </div>
  )
}

export default LiveData

