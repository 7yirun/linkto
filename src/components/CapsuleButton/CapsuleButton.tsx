import React from 'react';
import "./CapsuleButton.scss"

const CapsuleButton = ({...props}) => {
  //better-scroll里渲染成button标签会让外层整个页面一起滚动 只能渲染成div
  if(!props.nobutton){
    return (
      <button
        {...props}
        className={props.className ? `${props.className} capsule-button` : 'capsule-button'}
      >
      </button>
    )
  } else {
    return (
      <div
        {...props}
        className={props.className ? `${props.className} capsule-button` : 'capsule-button'}
      >
      </div>
    )
  }
};

export default CapsuleButton;