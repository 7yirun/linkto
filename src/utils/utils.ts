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