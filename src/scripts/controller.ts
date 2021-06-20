import { Bubble } from "./bubble";
import * as PIXI from 'pixi.js';
import * as math from "mathjs";
export class Controller{

    constructor(){
        view.startBubblz();
    }

    userClick(x: number, y: number){
        console.log("x:", x,"y:", y)
        for(let bubble of model.current_root.children){
            if (bubble.contains(x, y)) {
                if(bubble.children.length == 0){
                    return;
                }

                let size_ratio = this.calculateZoomFactor(bubble)
                view.viewport.snapZoom({removeOnComplete: true, height: view.viewport.worldScreenHeight * size_ratio, center: new PIXI.Point(bubble.body.position[0], bubble.body.position[1]), time: 1200, removeOnInterrupt: true});
                view.zoom_factor *= size_ratio;
                model.setNewRoot(bubble);
                view.drawBubbles();
                return;
            }
        }
        if(model.current_root == model.root_bubble)
        {
            view.zoom_factor = 1;
            return;
        }
        else
        {
            let parent = model.current_root.parent;
            let size_ratio = this.calculateZoomFactor(parent);
            view.viewport.snapZoom({removeOnComplete: true, height: view.viewport.worldScreenHeight * size_ratio, center: new PIXI.Point(parent.body.position[0], parent.body.position[1]), time: 1200, removeOnInterrupt: true});
            view.zoom_factor *= size_ratio;
            model.setNewRoot(parent);
            return;
        }
    }

    calculateZoomFactor(bubble: Bubble){
        if(bubble == model.root_bubble){
            return 1 / view.zoom_factor;
        }
        let xmin = bubble.body.position[0] - bubble.radius;
        let xmax = bubble.body.position[0] + bubble.radius;
        let ymin = bubble.body.position[1] - bubble.radius;
        let ymax = bubble.body.position[1] + bubble.radius;

        let x_ratio = (xmax - xmin) / view.viewport.worldScreenWidth;
        let y_ratio = (ymax - ymin) / view.viewport.worldScreenHeight;
        let larger_ratio = x_ratio >= y_ratio ? x_ratio : y_ratio;

        return larger_ratio;
    }

    getSumLeaf(node: Bubble) : number[]{
        let total = [0, 0, 0];
        if(node.children.length != 0) {
            node.children.forEach(function (child: any) {
                let prev = controller.getSumLeaf(child);
                total = math.add(total, prev) as number[];
            })
            total = math.divide(total, node.children.length) as number[];
        }
        else{
            total = node.data;
        }
        return total;
    }

    calcSimilarity(node1: Bubble, node2: Bubble, properties: number){
        let prop_1 = this.getSumLeaf(node1)
        let prop_2 = this.getSumLeaf(node2) //node2.properties
        // if(properties == 3)
        // {
        //     prop_1.splice(3, 1)
        //     prop_2.splice(3, 1)
        // }
        // else if(properties == 4)
        // {
        //     prop_1.splice(2, 1)
        //     prop_2.splice(2, 1)
        // }
        // else
        // {
        //     prop_1.splice(1, 1)
        //     prop_2.splice(1, 1)
        // }
        let cosing_sim = math.dot(prop_1, prop_2) / ((math.norm(prop_1) as number) * (math.norm(prop_2) as number))
        console.log(cosing_sim)
        return cosing_sim
    }

    setColorScheme(index: number){
        switch(index){
            //standard
            case 0:
                view.color_selector = 0;
                break;
            //prop1 / prop2
            case 1:
                view.color_selector = 1;
                break;
            //prop1 / prop3 
            case 2:
                view.color_selector = 2;
                break;
            //prop2 / prop3
            case 3:
                view.color_selector = 3;
                break;
        }
    }

    setAttractionScheme(index: number){
        for(let spring of model.world.springs){
            model.world.removeSpring(spring);
        }
        model.attraction_clusters = index;
        if(index > 0){
            model.setSprings(model.current_root);
        }
    }

    setGravityScheme(index: number){
        switch(index){
            //standard
            case 0:
                break;
            //prop1 / prop2
            case 1:
                break;
            //prop1 / prop3 
            case 2:
                break;
            //prop2 / prop3
            case 3:
                break;
        }
        model.world.gravity = [0, 30];
    }
}