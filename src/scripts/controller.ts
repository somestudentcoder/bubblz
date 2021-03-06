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

    setPropertyValues(node: Bubble)
    {
        if(node.children.length != 0)
        {
            let sum = [0, 0, 0];
            node.children.forEach(child => {
                if(child.children.length != 0)
                {
                    this.setPropertyValues(child);
                }
                else
                {
                    model.setMinMax(1, child.data[0]);
                    model.setMinMax(2, child.data[1]);
                    model.setMinMax(3, child.data[2]);
                }
                sum = math.add(sum, child.data) as number[];
            });
            node.data = math.divide(sum, node.children.length) as number[];
        }
        else
        {
            model.setMinMax(1, node.data[0]);
            model.setMinMax(2, node.data[1]);
            model.setMinMax(3, node.data[2]);
        }
    }

    setColorScheme(index: number){

        this.setPropertyValues(model.root_bubble);

        view.color_selector = index;

        view.showLegend(index);
    }

    setAttractionScheme(index: number){
        model.world.gravity = [0, 0];
        for(let spring of model.world.springs){
            model.world.removeSpring(spring);
        }
        model.attraction_clusters = index;
        if(index > 0){
            model.setSprings(model.current_root);
            for(let bubble of model.current_root.children){
                model.setSprings(bubble);
            }
        }
    }

    setGravityScheme(index: number){
        this.setPropertyValues(model.root_bubble);
        for(let spring of model.world.springs){
            model.world.removeSpring(spring);
        }
        model.data_index = index - 1;
        if(index == 0){
            model.world.gravity = [0, 0];
            return;
        }
        else{
            model.world.gravity = [0, 100];
        }
        model.setGravity(model.current_root);
    }


}