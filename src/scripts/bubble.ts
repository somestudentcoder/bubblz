
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import { pid } from "node:process";
import * as p2 from 'p2';
import * as chroma from 'chroma-js';

export class Bubble{

    public static AREA_FILL_PERCENT: number = 0.40;


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
    public data: number[] = [0, 0, 0];
    static x_scale:chroma.Scale = chroma.scale(['#ff0000', '#ff2100', '#ff3200', '#ff4000', '#ff4b00', 
    '#ff5600', '#ff6000', '#ff6900', '#ff7300', '#ff7c00', '#ff8500', '#ff8e00', '#ff9700', 
    '#ffa100', '#ffaa00', '#ffb300', '#ffbd00', '#ffc700', '#ffd000', '#ffda00', '#ffe500', 
    '#ffef00', '#fffa00', '#f8ff01', '#ecff09', '#e0fd15', '#d5fb21', '#cbf72c', '#c2f337', 
    '#baee42', '#b2e84c', '#ace157', '#a6d961', '#a2d06b', '#9ec676', '#9abc80', '#96b18b', 
    '#92a596', '#8e98a2', '#898aae', '#837bba', '#7b6bc7', '#6f5ad4', '#6046e2', '#472ef0', 
    '#0000ff']);;


    constructor(){

    }

    static from(node: HierarchyNode<any>, parent_param?: Bubble){
        let bubble = new Bubble();

        +node.data.displacement ?
        bubble.data = [+node.data.displacement, +node.data.horsepower, +node.data.kerb_weight] :
        bubble.data = [+node.data.prop1, +node.data.prop2, +node.data.prop3];

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

        bubble.id = model.getNewID();

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