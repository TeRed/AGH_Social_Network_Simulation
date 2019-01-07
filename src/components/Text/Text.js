import React from 'react'

export const Text = (props) => (
    <span className="Text" style={{fontSize: props.size + 'em', color: props.color}}>{props.children}</span>
);