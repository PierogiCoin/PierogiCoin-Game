declare module 'vanta/dist/vanta.globe.min.js' {
    interface VantaOptions {
      el: HTMLElement;
      [key: string]: unknown;
    }
  
    type VantaEffect = (options: VantaOptions) => unknown;
  
    const GLOBE: VantaEffect;
    export default GLOBE;
  }