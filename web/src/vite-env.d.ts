/// <reference types="vite/client" />

declare module '*.png' {
    const src: string;
    export default src;
}

declare module 'three';
declare module 'three/examples/jsm/controls/OrbitControls.js';
declare module 'three/examples/jsm/renderers/CSS2DRenderer.js';


