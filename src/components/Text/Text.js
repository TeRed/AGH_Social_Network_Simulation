import React from 'react'

export const Text = (props) => (
    <span className="Text" style={{fontSize: props.size + 'em'}}>{props.children}</span>
);