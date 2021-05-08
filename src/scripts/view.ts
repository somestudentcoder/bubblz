import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

export class View{
    public app: PIXI.Application;
    public stage: PIXI.Container;
    public width: number;
    public height: number;

    public viewport: Viewport;

    constructor(){
        //init pixi
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.app = new PIXI.Application({
            width: this.width, 
            height: this.height, 
            resolution: window.devicePixelRatio,
            autoDensity: true, view: <HTMLCanvasElement>document.getElementById("main_canvas"), 
            backgroundColor: 0xFFFFFF});
        document.body.appendChild(this.app.view)

        //init stage & text containers
        this.stage = new PIXI.Container();

        this.viewport = new Viewport({
            screenWidth: this.width,
            screenHeight: this.height,
            worldWidth: this.width,
            worldHeight: this.height,
            interaction: this.app.renderer.plugins.interaction
        });
    }

}