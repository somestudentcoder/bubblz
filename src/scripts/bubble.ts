
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import * as p2 from 'p2';

export class Bubble{
    public radius: number = 1;
    public color: number = -1;
    public id: number = -1;
    public name: string = "";
    public body: p2.Body = new p2.Body();
    public children: Array<Bubble> = new Array<Bubble>();


    constructor(){
        
    }

    static from(node: HierarchyNode<any>, parent?: Bubble){
        let bubble = new Bubble();
        bubble.id = model.getNewID();
        bubble.body = new p2.Body({
            mass:5,
            position:[100 + bubble.id,1000]
        });
        bubble.body.addShape(new p2.Circle({ radius: 1 }));
        bubble.radius = Math.sqrt(node.data.weight / Math.PI);
        bubble.name = node.data.name;
        
        if(node.children != undefined){
            for(let child of node.children){
                bubble.children.push(Bubble.from(child));
            }
        }
        
        model.world.addBody(bubble.body);
        return bubble;
    }
}