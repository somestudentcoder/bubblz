import { Bubble } from "./bubble";

export class Controller{

    constructor(){
        model.createWalls();
        view.startBubblz();
    }

    calculateWeight(node: Bubble)
    {
        let weight = this.getWeight(root.data);
        if(weight == undefined || weight == ""){
          if(node.children == undefined){
            console.error("node has no weight and no children");
            return;
          }
          weight = 0;
          for(let child of node.children){
            weight += this.calculateWeight(child);
          }
        }
        return weight;
    }

    getWeight(node: Bubble)
    {
        
    }
}