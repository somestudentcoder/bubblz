import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import p2 = require('p2');


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
            backgroundColor: 0x00FFFF});
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

        setInterval(this.animate, 1000 * model.timeStep);
    }

    animate(){
        model.world.step(model.timeStep);
        if(model.root_bubble.body != undefined){
            console.log(model.root_bubble.body.position);
            console.log(model.root_bubble.children[0].body.position);
        }
    }

}