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

export function base64ImageToBlob(str:string) {
  // extract content type and base64 payload from original string
  var pos = str.indexOf(';base64,');
  var type = str.substring(5, pos);
  var b64 = str.substr(pos + 8);

  // decode base64
  var imageContent = atob(b64);

  // create an ArrayBuffer and a view (as unsigned 8-bit)
  var buffer = new ArrayBuffer(imageContent.length);
  var view = new Uint8Array(buffer);

  // fill the view, using the decoded base64
  for(var n = 0; n < imageContent.length; n++) {
    view[n] = imageContent.charCodeAt(n);
  }

  // convert ArrayBuffer to Blob
  var blob = new Blob([buffer], { type: type });

  return blob;
}
export function blobToFile(theBlob:any, fileName:string){
  // theBlob.lastModifiedDate = new Date();
  // theBlob.name = fileName;
  return new File([theBlob], fileName, theBlob.type);
}
