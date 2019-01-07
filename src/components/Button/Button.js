import React from "react";
import "./Button.css";

const Button = ({ text, onClick, backgroundColor, top, left, right }) => {
  return (
    <div
      className={"button"}
      onClick={onClick}
      style={{ backgroundColor, top, left, right }}
    >
      {text}
    </div>
  );
};

export default Button;
