import * as PIXI from 'pixi.js';
import { ClickEventData, Viewport } from 'pixi-viewport';
import p2 = require('p2');
import { Bubble } from "./bubble";
import {RootElement} from "./rootElement";
import {HierarchyNode} from "d3-hierarchy";
import * as chroma from 'chroma-js';

const MAXRADIUS: number = 800;


export class View{
    public app: PIXI.Application;
    //public stage: PIXI.Container;
    public width: number;
    public height: number;
    public viewport: Viewport;

    public bubbles: PIXI.Graphics;
    public boxes: PIXI.Graphics;
    public parentBubble: PIXI.Graphics;
    public labels: PIXI.Graphics;

    public label_list: Array<PIXI.Text> = [] as Array<PIXI.Text>;

    public zoom_factor: number = 1;

    public color_selector: number = 0;


    constructor(){
        //init pixi
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.app = new PIXI.Application({
            width: this.width, 
            height: this.height, 
            resolution: window.devicePixelRatio,
            autoDensity: true, view: <HTMLCanvasElement>document.getElementById("main_canvas"), 
            backgroundColor: 0xdbdbdb});
        document.body.appendChild(this.app.view)

        //init stage & text containers
        //this.stage = new PIXI.Container();
        this.bubbles = new PIXI.Graphics();
        this.boxes = new PIXI.Graphics();
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
        .clampZoom({maxWidth: this.width, maxHeight:this.height});

        this.viewport.on('clicked', (e: ClickEventData) => controller.userClick(e.world.x, e.world.y));

        // document.getElementById("load-file-button")!.onclick = (e) => {
        //     this.loadFileButton();
        // }

        document.getElementById("open-pop-up")!.onclick = (e) => {
            this.openPopup()
        }

        document.getElementById("submit-button")!.onclick = (e) => {
            this.submitTreeForm()
        }

        document.getElementById("colordropbtn")!.onclick = (e) => {
            document.getElementById("colordropdown")!.classList.toggle("show");
        }

        document.getElementById("attractiondropbtn")!.onclick = (e) => {
            document.getElementById("attractiondropdown")!.classList.toggle("show");
        }

        document.getElementById("gravitydropbtn")!.onclick = (e) => {
            document.getElementById("gravitydropdown")!.classList.toggle("show");
        }

        window.addEventListener("click", function(e:MouseEvent) {
            if (!(e.target! as Element).matches('.dropbtn')) {
              var dropdowns = document.getElementsByClassName("dropdown-content");
              var i;
              for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                  openDropdown.classList.remove('show');
                }
              }
            }
          })
    }

    animate(){
        model.world.step(model.timeStep);

        view.drawBubbles();
        view.drawLabels();
        //view.drawBoxes();
    }

    startBubblz(){
        this.viewport.addChild(this.bubbles);
        this.viewport.addChild(this.parentBubble);
        //this.viewport.addChild(this.boxes);
        setInterval(this.animate, 1000 * model.timeStep);
    }

    drawBubbles() {
        this.bubbles.clear();
        this.parentBubble.clear();
        if(model.current_root != model.root_bubble){
            this.setColor(model.current_root);

            this.parentBubble.alpha = 0.8;
            this.parentBubble.beginFill(model.current_root.color);
            this.parentBubble.lineStyle({width: 2});
            this.parentBubble.drawCircle(model.current_root.body.position[0], model.current_root.body.position[1], model.current_root.radius);
            this.parentBubble.endFill();
        }
        if(model.current_root.children != undefined){
            for (let bubble of model.current_root.children) {
                this.setColor(bubble);

                this.bubbles.beginFill(bubble.color);
                this.bubbles.lineStyle({width: 2});
                this.bubbles.drawCircle(bubble.body.position[0], bubble.body.position[1], bubble.radius);
                this.bubbles.endFill();

                if(bubble.children != undefined){
                    for (let child of bubble.children) {
                        this.setColor(child);

                        this.bubbles.beginFill(child.color);
                        this.bubbles.lineStyle({width: 2});
                        this.bubbles.drawCircle(child.body.position[0], child.body.position[1], child.radius);
                        this.bubbles.endFill();
                    }
                }
            }
        }
    }

    setColor(node: Bubble)
    {
        let color: chroma.Color;
        switch(this.color_selector)
        {
            case 0:
                let x_scale = Bubble.x_scale;
                let y_scale = chroma.scale(['#000000', '#ffffff']);
                let c1 = x_scale(node.body.position[0] / (view.width - 2 * node.radius));
                let c2 = y_scale(node.body.position[1] / view.height);
                node.color = chroma.mix(c1, c2).num();
                break;
            case 1:
                console.log("value: ", (node.data[0] - model.minProp1) / model.maxProp1);
                console.log(node.data[0])
                color = Bubble.x_scale((node.data[0] - model.minProp1) / model.maxProp1);
                node.color = color.num();
                break;
            case 2:
                color = Bubble.x_scale((node.data[1] - model.minProp2) / model.maxProp2);
                node.color = color.num();
                break;
            case 3:
                color = Bubble.x_scale((node.data[2] - model.minProp3) / model.maxProp3);
                node.color = color.num();
                break;
        }

        
    }

    // only here for debug purposes
    drawBoxes(){
        this.boxes.clear();
        this.boxes.alpha = 0.8;
        if(model.current_root.children != undefined){
            for (let bubble of model.current_root.children) {
                for(let shape of bubble.body.shapes){
                    if(shape instanceof p2.Box){
                        let box = shape as p2.Box;
                        this.boxes.beginFill(bubble.color);
                        this.boxes.lineStyle({width: 2});
                        this.boxes.angle = box.angle;
                        this.boxes.drawRect(bubble.body.position[0] + box.position[0] - box.width / 2, bubble.body.position[1] + box.position[1] - box.height / 2, box.width, box.height);
                        /*console.log(bubble.body.position[0] + box.position[0]);
                        console.log(bubble.body.position[1] + box.position[1]);
                        console.log(box.width);
                        console.log(box.height);
                        console.log("---------");*/
                        this.boxes.endFill();
                    }
                }
                

                if(bubble.children != undefined){
                    for (let child of bubble.children) {
                        this.boxes.beginFill(bubble.color);
                        this.boxes.lineStyle({width: 2});
                        //this.boxes.drawRect(child.body.position[0], child.body.position[1], child.radius);
                        this.boxes.endFill();
                    }
                }
            }
        }
    }

    drawLabels(){
        let list: Array<PIXI.Text> = [] as Array<PIXI.Text>;
        if(model.current_root.children != undefined){
            model.current_root.children.forEach(child => {
                let text;
                text = this.label_list.pop();
                let font_size = child.radius / 3;
                if(text != undefined){
                    this.viewport.removeChild(text);
                    text.text = child.name;
                    text.style = {fill: 0x000000,  stroke: 0x000000, strokeThickness: 0.3, fontSize: font_size};
                }
                else{
                    text = new PIXI.Text(child.name, {fill: 0x000000,  stroke: 0x000000, strokeThickness: 0.5, fontSize: font_size});                    
                }
                text.anchor.set(0.5);
                text.resolution = 2 * (1/this.zoom_factor);
                text.position.set(child.body.position[0], child.body.position[1]);
                let box = text.getLocalBounds(new PIXI.Rectangle);
                if(child.body.position[0] - (box.width / 2) < 0){
                    let new_x = child.body.position[0] + ((child.body.position[0] - (box.width / 2)) * -1);
                    text.position.set(new_x, child.body.position[1])
                }
                else if(child.body.position[0] + (box.width / 2) > this.width){
                    let new_x = child.body.position[0] - ((child.body.position[0] + (box.width / 2) - this.width));
                    text.position.set(new_x, child.body.position[1]);
                }
                list.push(text);
                this.viewport.addChild(text);
            });
        }
        for(let text of this.label_list){
            this.viewport.removeChild(text);
        }
        this.label_list = list;
    }

    loadFileButton(){
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _ => {
            //controller.calcSimilarity(model.root_bubble.children[1], model.root_bubble.children[3])
            let files = Array.from(input.files!);
            let file = files[0];
            console.log(file.type)
            if(file.type == "application/vnd.ms-excel") {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    model.newRoot(<HierarchyNode<any>>model.parseCsv(evt.target!.result));
                }
                reader.onerror = function (evt) {
                    console.log("Error reading the file");
                }
            }
        };
        input.click();
        //console.log(model.createTreeCsv(3,3, [new RootElement("cost", 1, 100)]))
    }

    submitTreeForm()
    {
        let depth_min = (<HTMLInputElement> document.getElementById("depth_min")!).value;
        let depth_max = (<HTMLInputElement> document.getElementById("depth_max")!).value;
        let children_min = (<HTMLInputElement> document.getElementById("children_min")!).value;
        let children_max = (<HTMLInputElement> document.getElementById("children_max")!).value;

        let property_list = [];
        for (let i = 1; i <= 2; i++) {
            let property_name = (<HTMLInputElement>document.getElementById("property" + i.toString() +"-name")!).value;
            let property_min = (<HTMLInputElement>document.getElementById("property" + i.toString() +"-min")!).value;
            let property_max = (<HTMLInputElement>document.getElementById("property" + i.toString() +"-max")!).value;
            if(!(property_name.length == 0 || property_min.length == 0  || property_max.length == 0))
            {
                property_list.push(new RootElement(property_name, +property_min, +property_max));
            }
        }
        model.newRoot(model.createTreeCsv(+depth_min, +depth_max, +children_min, +children_max, property_list));
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