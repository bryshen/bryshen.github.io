
/**
 * Simplest event system for any class to implement
 */
export class Events {
    constructor(host) {
      this.proxy = document.createDocumentFragment();
      this.proxy.host = host;
  
      ["addEventListener", "dispatchEvent", "removeEventListener"].forEach(
        this.delegate,
        this
      );
      
      host.on = (eventName, func) => {
        host.addEventListener(eventName, func);
        return host;
      };
      host.emit = (eventName, options) => {
        host.dispatchEvent(new CustomEvent(eventName, options));
      }
    }
  
    delegate(method) {
      this.proxy.host[method] = this.proxy[method].bind(this.proxy);
    }
  }