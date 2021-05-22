
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import * as p2 from 'p2';

export class Bubble{
    public radius: number = 1;
    public color: number = 0xFFFFFF;
    public id: number = -1;
    public name: string = "";
    public body: p2.Body = {} as p2.Body;
    public children: Array<Bubble> = new Array<Bubble>();
    public parent: Bubble = {} as Bubble;
    public weight: number = 0


    constructor(){
        
    }

    static from(node: HierarchyNode<any>, parent_param?: Bubble){
        let bubble = new Bubble();
        bubble.id = model.getNewID();
        if(parent_param){
            bubble.parent = parent_param;
        }
        bubble.weight = node.data.weight;
        bubble.radius = Math.sqrt(node.data.weight / Math.PI) * 50;
        //bubble.radius = 15;
        bubble.body = new p2.Body({
            mass:5,
            position:[view.width / 2 + bubble.id, view.height / 2]
        });
        
        bubble.body.addShape(new p2.Circle({ radius: bubble.radius }));
        bubble.name = node.data.name;

        if(node.children != undefined){
            for(let child of node.children){
                bubble.children.push(Bubble.from(child, bubble));
            }
        }
        
        model.world.addBody(bubble.body);
        return bubble;
    }

    contains(x: number, y: number)
    {
        let dist = (x - this.body.position[0]) * (x - this.body.position[0]) + (y - this.body.position[1]) * (y - this.body.position[1])

        if(dist < this.radius * this.radius)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}