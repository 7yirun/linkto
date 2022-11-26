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
