import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import * as p2 from 'p2';

export class View{
    public app: PIXI.Application;
    public stage: PIXI.Container;
    public width: number;
    public height: number;

    public viewport: Viewport;


    //test
    public timeStep: number;
    public world: p2.World;
    public circleBody: p2.Body;
    public circle: PIXI.Graphics;

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
        

        document.getElementById("load-file-button")!.onclick = (e) => {
            this.loadFileButton()
        }


        //test
        console.log("test");

        this.circle  = new PIXI.Graphics();
        this.app.stage.addChild(this.circle)

        this.timeStep = 1/60;
        this.world = new p2.World({
            gravity:[0,-9.82]
        });
        this.circleBody = new p2.Body({
            mass:5,
            position:[100,1000]
        });
        var groundShape = new p2.Plane();
        var groundBody = new p2.Body({
            mass:0
        });
        groundBody.addShape(groundShape);
        var circleShape = new p2.Circle({ radius: 1 });
        this.circleBody.addShape(circleShape);
        this.world.addBody(this.circleBody);
        this.world.addBody(groundBody);

        setInterval(this.animate, this.timeStep, this);
    }

    animate(view: View){
        view.world.step(view.timeStep);
        view.circle.clear();
        view.circle.beginFill(0x000000);
        view.circle.drawCircle(view.circleBody.position[0], view.circleBody.position[1], 30);
        view.circle.endFill();
        
        /*console.log("Circle x position: " + view.circleBody.position[0]);
        console.log("Circle y position: " + view.circleBody.position[1]);
        console.log("Circle angle: " + view.circleBody.angle);*/
        
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