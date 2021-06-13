import { Bubble } from "./bubble";
import * as PIXI from 'pixi.js';

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
        if(model.current_root.isRoot)
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
        if(bubble.isRoot)
        {
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
}