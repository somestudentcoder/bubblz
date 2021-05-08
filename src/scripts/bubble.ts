
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import * as p2 from 'p2';

export class Bubble{
    public radius: number = 1;
    public color: number = -1;
    public id: number = -1;
    public name: string = "";
    public body: p2.Body = {} as p2.Body;
    public children: Array<Bubble> = new Array<Bubble>();
    

    constructor(){
        
    }

    static from(node: HierarchyNode<any>, parent?: Bubble){
        let bubble = new Bubble();
        bubble.body.mass = node.data.weight;
        bubble.radius = Math.sqrt(node.data.weight / Math.PI);
        bubble.body.position = [50, 50];
        bubble.name = node.data.name;
        bubble.id = model.getNewID();
        if(node.children != undefined){
            for(let child of node.children){
                bubble.children.push(Bubble.from(child));
            }
        }
        return bubble;
    }
}