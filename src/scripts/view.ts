import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import p2 = require('p2');
import { Bubble } from "./bubble";
import {RootElement} from "./rootElement";
import {HierarchyNode} from "d3-hierarchy";

const MAXRADIUS: number = 800;


export class View{
    public app: PIXI.Application;
    //public stage: PIXI.Container;
    public width: number;
    public height: number;
    public viewport: Viewport;

    public bubbles: PIXI.Graphics;
    public labels: PIXI.Graphics;

    public label_list: Array<PIXI.Text> = [] as Array<PIXI.Text>;

    public current_root: Bubble = {} as Bubble;


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
        this.labels = new PIXI.Graphics();

        this.viewport = new Viewport({
            screenWidth: this.width,
            screenHeight: this.height,
            worldWidth: this.width,
            worldHeight: this.height,
            interaction: this.app.renderer.plugins.interaction
        });
        
        //this.viewport.on('clicked', (e) => controller.onClick(e.data.global.x, e.data.global.y));

        document.getElementById("load-file-button")!.onclick = (e) => {
            this.loadFileButton()
        }

        document.getElementById("open-pop-up")!.onclick = (e) => {
            this.openPopup()
        }

        document.getElementById("submit-button")!.onclick = (e) => {
            this.submitTreeForm()
        }
    }

    animate()
    {
        model.world.step(model.timeStep);

        //view.app.stage.removeChildren()
        view.drawCircles()
        view.drawLabels()
    }

    startBubblz()
    {
        this.app.stage.addChild(this.bubbles)
        setInterval(this.animate, 30 * model.timeStep);
        
    }

    drawCircles() {
        //this.app.stage.addChild(this.bubbles)
        this.bubbles.clear();
        if(this.current_root.children != undefined){
            for (let bubble of this.current_root.children) {
                this.bubbles.beginFill(0xFFFFFF);
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
            let files = Array.from(input.files!);
            let file = files[0];
            console.log(file.type)
            if(file.type == "application/vnd.ms-excel") {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    model.newRoot(<HierarchyNode<any>>model.parseCsv(evt.target!.result))
                }
                reader.onerror = function (evt) {
                    console.log("Error reading the file")
                }
            }
        };
        input.click();
        //console.log(model.createTreeCsv(3,3, [new RootElement("cost", 1, 100)]))
    }

    submitTreeForm()
    {
        let depth = (<HTMLInputElement> document.getElementById("depth")!).value;
        let children = (<HTMLInputElement> document.getElementById("children")!).value;
        let property_list = [];
        for (let i = 1; i <= 2; i++) {
            let property_name = (<HTMLInputElement>document.getElementById("property" + i.toString() +"-name")!).value;
            let property_min = (<HTMLInputElement>document.getElementById("property" + i.toString() +"-min")!).value;
            let property_max = (<HTMLInputElement>document.getElementById("property" + i.toString() +"-max")!).value;
            if(!(property_name.length == 0 || property_min.length == 0  || property_max.length == 0))
            {
                property_list.push(new RootElement(property_name, +property_min, +property_max))
            }
        }
        model.newRoot(model.createTreeCsv(+depth, +children, property_list));
        document.getElementById("pop-up")!.style.display = "none";
    }

    openPopup()
    {
        document.getElementById('pop-up')!.style.display = "block";
        /*document.getElementById('pop-up')!.onclick = (e) => {
            document.getElementById('pop-up')!.style.display = "none";
        };*/
        document.getElementById('popup-close-button')!.onclick = () => {
            document.getElementById('pop-up')!.style.display = "none";
        };
    }

}