import React, {useState} from 'react';
import './PopPanel.scss'

type PropType = {
  title: string;
  children: any;
  close: any;
  className?: string;
  returnTo?: string;
  handleReturn?:any,
  warning?:string;
  success?:string
}

const PopPanel = (props: PropType) => {
  return (
    <div className="mask">
      <div className={props.className ? `${props.className} pannel` : 'pannel'}>
        <p className={'pannel-head'}>
          <span
            className={'returnTo'}
            onClick={props.handleReturn}
          >
            {props.returnTo ? props.returnTo : ''}
          </span>
          <span className={'panel-title'}>{props.title}</span>
          <span className="close" onClick={props.close}></span>
          {
            props.success && <span className={"pannel-success"}>{props.success}</span>
          }
          {
            !props.success && props.warning && <span className={"pannel-warning"}>{props.warning}</span>
          }
        </p>
        <div className="pannel-content">
          {
            props.children
          }
        </div>
      </div>
    </div>
  );
};

export default PopPanel;