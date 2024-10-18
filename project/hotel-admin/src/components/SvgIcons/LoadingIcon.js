import React from "react";

const MultiColorSpinner = () => (
  <svg
    width="20px"
    height="20px"
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      stroke="red"
      strokeWidth="4"
      fill="none"
      strokeDasharray="31.4 31.4"
      strokeDashoffset="0"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
    <circle
      cx="25"
      cy="25"
      r="15"
      stroke="blue"
      strokeWidth="4"
      fill="none"
      strokeDasharray="23.6 23.6"
      strokeDashoffset="0"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="-360 25 25"
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
    <circle
      cx="25"
      cy="25"
      r="10"
      stroke="green"
      strokeWidth="4"
      fill="none"
      strokeDasharray="15.7 15.7"
      strokeDashoffset="0"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export default MultiColorSpinner;
