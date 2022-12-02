import React, {useState} from 'react';
import {Modal} from 'antd'
import './PopPanel.scss'

type PropType = {
  title: string;
  children: any;
  close?: any;
  open?: boolean;
  className?: string;
  returnTo?: boolean;
  handleReturn?:any,
  warning?:string;
  success?:string
}

const PopPanel:React.FC<PropType> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
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
    >
      <p className={'pannel-head'}>
        {
          props.returnTo &&
          <span
            className={'returnTo'}
            onClick={props.handleReturn}
          >
            previous
          </span>
        }
        <span className={'panel-title'}>{props.title}</span>
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