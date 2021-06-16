
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import { pid } from "node:process";
import * as p2 from 'p2';

export class Bubble{

    public static AREA_FILL_PERCENT: number = 0.45;

    public radius: number = 1;
    public color: number = 0xFFFFFF;
    public id: number = -1;
    public name: string = "";
    public body: p2.Body = {} as p2.Body;
    public children: Array<Bubble> = new Array<Bubble>();
    public parent: Bubble = {} as Bubble;
    public weight: number = 0;
    public depth: number = 0;
    public height: number = 0;


    constructor(){
        
    }

    static from(node: HierarchyNode<any>, parent_param?: Bubble){
        let bubble = new Bubble();
        bubble.id = model.getNewID();

        bubble.weight = node.data.weight;

        if(parent_param){
            bubble.parent = parent_param;
            
            let area_ratio = (this.AREA_FILL_PERCENT * bubble.weight) / bubble.parent.weight;
            if(Object.keys(parent_param.parent).length == 0){
                area_ratio *= view.width * view.height;
            }
            else{
                area_ratio *= bubble.parent.radius * bubble.parent.radius * Math.PI;
            }
            
            bubble.radius = Math.sqrt(area_ratio / Math.PI);
        }
        else{
            bubble.radius = view.width > view.height ? view.width / 2 : view.height / 2
        }

        bubble.body = new p2.Body({
            mass: bubble.weight,
            position:[view.width / 2 + bubble.id, view.height / 2]
        });
        
        // create shapes
        bubble.body.addShape(new p2.Circle({ radius: bubble.radius }));
        bubble.buildHollowCircle(bubble.radius);

        bubble.name = node.data.name;
        bubble.depth = node.depth;
        bubble.height = node.height;
        if(node.children != undefined){
            for(let child of node.children){
                bubble.children.push(Bubble.from(child, bubble));
            }
        }
        return bubble;
    }

    contains(x: number, y: number){
        let dist = Math.sqrt((x - this.body.position[0]) * (x - this.body.position[0]) + (y - this.body.position[1]) * (y - this.body.position[1]));

        if(dist < this.radius){
            return true;
        }
        else{
            return false;
        }
    }


    buildHollowCircle(radius: number, sides?: number, width?: number, extraLength?: number) {
        if(!sides){
            sides = 30;
        }
        if(!width){
            width = 10;
        }
        if(!extraLength){
            extraLength = 5;
        }
      
        const theta = 2 * Math.PI / sides;
        const sideLength = 2 * radius * theta/2 * extraLength;
      
        for (let i = 0; i < sides; i++) {
            // We'll build thin sides and then translate + rotate them appropriately.
            const shape = new p2.Box({
                width: sideLength, 
                height: width
            });
            this.body.addShape(shape, [radius * Math.sin(i * theta), -radius * Math.cos(i * theta)], i * theta)
        }
    }
}