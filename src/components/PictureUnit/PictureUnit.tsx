import React from 'react';


const PictureUnit = (props:any) => {
  return(
    <div className='img'>
      <img src={props.url} alt=""/>
    </div>
  )
};

// export default PictureUnit;
export default React.memo(PictureUnit);