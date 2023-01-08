import React, {useState} from 'react';
import {Modal} from 'antd'
import Icons from "lib/icons"
import './PopPanel.scss'

type PropType = {
  title: string;
  children: any;
  close?: any;
  open?: boolean;
  className?: string;
  returnTo?: boolean;
  handleReturn?: any,
  warning?: string;
  success?: string
  mask?:boolean
  getContainer?:any
}

const PopPanel: React.FC<PropType> = ({mask=true, getContainer=document.body||false, ...props}) => {
  return (
      <Modal
        open={props.open}
        className={props.className ? `${props.className} pannel` : 'pannel'}
        footer={null}
        width={''}
        closeIcon={null}
        transitionName=""
        maskTransitionName=""
        destroyOnClose
        getContainer={getContainer}
        mask={mask}
      >
        <p className={'pannel-head'}>
          {
            props.returnTo &&
            <span className={'iconfont icon-Back returnTo'} onClick={props.handleReturn}></span>
          }
          <span className={!props.returnTo ? `panel-title` : ''}>{props.title}</span>
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
      </Modal>

  );
};

export default PopPanel;