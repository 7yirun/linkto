export const setStore = (name: string, content: string, isLocal?: boolean) => {
  if (isLocal) {
    localStorage.setItem(name, content)
  } else {
    sessionStorage.setItem(name, content);
  }
}


export const getStore = (name:string, isLocal ?: boolean) => {
  if (isLocal) {
    return localStorage.getItem(name);
  } else {
    return sessionStorage.getItem(name);
  }
}


const getLength = (input:number | string):number=>{
  if((<string>input).length){
    return (<string>input).length
  } else {
    return input.toString().length
  }
}

//同源地址才能下载, 否则是打开显示大图片的新tab页
export function downloadURI(uri:string, name:string) {
  const link:HTMLAnchorElement = document.createElement('a');
  //非同源会显示大图, 避免从当前页直接跳转
  link.target="_blank"
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 二进制容器
 * @param {String} dataurl
 */
const getUint8Arr = (dataurl:string) => {
  // 截取base64的数据内容
  let arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)![1],
    bstr = window.atob(arr[1]),
    // 获取解码后的二进制数据的长度，用于后面创建二进制数据容器
    n = bstr.length,
    // 创建一个Uint8Array类型的数组以存放二进制数据
    u8arr = new Uint8Array(n)
  // 将二进制数据存入Uint8Array类型的数组中
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return { u8arr, mime }
}

//将base64转换为文件
export const dataURLtoFile = (dataurl:string, filename:string) => {
  let uint8 = getUint8Arr(dataurl)
  return new File([uint8.u8arr], filename, { type: uint8.mime })
}
