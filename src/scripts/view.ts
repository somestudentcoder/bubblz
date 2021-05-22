import * as PIXI from 'pixi.js';
import { ClickEventData, Viewport } from 'pixi-viewport';
import p2 = require('p2');
import { Bubble } from "./bubble";

const MAXRADIUS: number = 800;


export class View{
    public app: PIXI.Application;
    //public stage: PIXI.Container;
    public width: number;
    public height: number;
    public viewport: Viewport;

    public bubbles: PIXI.Graphics;
    public parentBubble: PIXI.Graphics;
    public labels: PIXI.Graphics;

    public label_list: Array<PIXI.Text> = [] as Array<PIXI.Text>;

    public current_root: Bubble = {} as Bubble;

    public zoom_factor: number = 1;


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
        //this.stage = new PIXI.Container();
        this.bubbles = new PIXI.Graphics();
        this.parentBubble = new PIXI.Graphics();
        this.labels = new PIXI.Graphics();

        this.viewport = new Viewport({
            screenWidth: this.width,
            screenHeight: this.height,
            worldWidth: this.width,
            worldHeight: this.height,
            interaction: this.app.renderer.plugins.interaction
        });
        
        this.app.stage.addChild(this.viewport);

        this.viewport
        .bounce()
        .drag()
        .wheel()
        .pinch()
        .decelerate()
        .clamp({ direction: 'all' })
        .clampZoom({maxWidth: this.width, maxHeight:this.height})

        this.viewport.on('clicked', (e: ClickEventData) => controller.userClick(e.world.x, e.world.y));

        document.getElementById("load-file-button")!.onclick = (e) => {
            this.loadFileButton()
        }
    }

    animate()
    {
        model.world.step(model.timeStep);

        //view.app.stage.removeChildren()
        view.drawBubblz()
        view.drawLabels()
    }

    startBubblz()
    {
        this.app.stage.addChild(this.bubbles)
        this.app.stage.addChild(this.parentBubble)
        setInterval(this.animate, 30 * model.timeStep);
        
    }

    drawBubblz() {
        //this.app.stage.addChild(this.bubbles)
        this.bubbles.clear();
        this.parentBubble.clear();
        if(this.current_root != model.root_bubble)
        {
            this.parentBubble.alpha = 0.8
            this.parentBubble.beginFill(this.current_root.color);
            this.parentBubble.lineStyle({width: 2})
            this.parentBubble.drawCircle(this.current_root.body.position[0], this.current_root.body.position[1], this.current_root.radius)
            this.parentBubble.endFill()
        }
        if(this.current_root.children != undefined)
        {
            for (let bubble of this.current_root.children) {
                this.bubbles.beginFill(bubble.color);
                this.bubbles.lineStyle({width: 2})
                this.bubbles.drawCircle(bubble.body.position[0], bubble.body.position[1], bubble.radius)
                this.bubbles.endFill()
            }
        }
    }

    drawLabels()
    {
        //cleanup
        for(let text of this.label_list)
        {
            this.app.stage.removeChild(text);
            text.destroy;
        }
        this.label_list = [];

        if(this.current_root.children != undefined)
        {
            this.current_root.children.forEach(child => {
                let text = new PIXI.Text(child.name, {fill: 0x000000,  stroke: 0x000000, strokeThickness: (0.5), fontSize: 40});
                text.anchor.set(0.5);
                //text.resolution = 2 * (1/this.zoom_factor);
                text.position.set(child.body.position[0], child.body.position[1]);
                let box = text.getLocalBounds(new PIXI.Rectangle);
                if(child.body.position[0] - (box.width / 2) < 0)
                {
                    let new_x = child.body.position[0] + ((child.body.position[0] - (box.width / 2)) * -1);
                    text.position.set(new_x, child.body.position[1])
                }
                else if(child.body.position[0] + (box.width / 2) > this.width)
                {
                    let new_x = child.body.position[0] - ((child.body.position[0] + (box.width / 2) - this.width));
                    text.position.set(new_x, child.body.position[1])
                }
                this.label_list.push(text);
                this.app.stage.addChild(text);
            });
        }
    }

    loadFileButton()
    {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _ => {
            // you can use this method to get file and perform respective operations
            let files = Array.from(input.files!);
            let file = files[0];
            if(file.type == "text/csv") {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    console.log(model.parseCsv(evt.target!.result))
                }
                reader.onerror = function (evt) {
                    console.log("Error reading the file")
                }
            }
        };
        input.click();
    }
}