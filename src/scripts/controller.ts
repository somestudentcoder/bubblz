import { Bubble } from "./bubble";
import * as PIXI from 'pixi.js';

export class Controller{

    constructor(){
        model.createWalls();
        view.startBubblz();
    }

    userClick(x: number, y: number){
        console.log("x:", x,"y:", y)
        for(let bubble of view.current_root.children)
        {
            if (bubble.contains(x, y)) {
                if(bubble.children.length == 0)
                {
                    return;
                }
                console.log(bubble.id)
                //bubble.color = 0x000000;
                // if (bubble.polygon_parent == model.root_polygon) {
                //     view.active_parent_index = model.current_root_polygon.polygon_children.indexOf(polygon);
                // }
                let size_ratio = this.calculateZoomFactor(bubble)
                view.viewport.snapZoom({removeOnComplete: true, height: view.viewport.worldScreenHeight * size_ratio, center: new PIXI.Point(bubble.body.position[0], bubble.body.position[1]), time: 1200, removeOnInterrupt: true});
                view.zoom_factor *= size_ratio;
                view.current_root = bubble;
                view.drawBubblz();
                return;
            }
        }
        // let parent = view.current_root.polygon_parent;
        // let size_ratio = this.calculateZoomFactor(parent)
        // view.viewport.snapZoom({removeOnComplete: true, height: view.viewport.worldScreenHeight * size_ratio, center: new PIXI.Point(parent.center.x, parent.center.y), time: 1200, removeOnInterrupt: true});
        // view.zoom_factor *= size_ratio;
        // view.current_root = parent;
        // view.showTreemap(view.current_root);
        // return;
    }

    calculateZoomFactor(bubble: Bubble){
        let xmin = bubble.body.position[0] - bubble.radius;
        let xmax = bubble.body.position[0] + bubble.radius;
        let ymin = bubble.body.position[1] - bubble.radius;
        let ymax = bubble.body.position[1] + bubble.radius;
        // for(let p of bubble.points){
        //   if (p.x < xmin){
        //     xmin = p.x;
        //   }
        //   else if(p.x > xmax){
        //     xmax = p.x;
        //   }
    
        //   if (p.y < ymin){
        //     ymin = p.y;
        //   }
        //   else if(p.y > ymax){
        //     ymax = p.y;
        //   }
        // }
        let x_ratio = (xmax - xmin) / view.viewport.worldScreenWidth;
        let y_ratio = (ymax - ymin) / view.viewport.worldScreenHeight;
        let larger_ratio = x_ratio >= y_ratio ? x_ratio : y_ratio;
        return larger_ratio;
    }
}