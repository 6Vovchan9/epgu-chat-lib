export class FileClass {
    static saveAs(params: {fileName: string, blob?: any, url?: string}) {
  
      if (params.blob && !params.url) {
        params.url = window.URL.createObjectURL(params.blob);
      } else if (!params.blob && !params.url) {
        return;
      }
  
      let el = document.createElement('a');
      el.style.display = 'none';
      el.href = params.url;
      el.download = params.fileName;
  
      document.body.appendChild(el);
      el.click();
  
      document.body.removeChild(el);
    }
  }
  