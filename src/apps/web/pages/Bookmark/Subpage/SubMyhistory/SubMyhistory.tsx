import React from 'react';

const SubMyHistory = () => {
  return (
    <div className={'content'}>
      {
        Array(7).fill('').map((val, index)=>{
          return (
            <div key={index} className="img-wrapper">
              <div className="img">
              </div>
              <p>
                <span>收藏·72</span>
                <span>设为私密</span>
              </p>
            </div>
          )
        })
      }
    </div>
  );
};

export default SubMyHistory;