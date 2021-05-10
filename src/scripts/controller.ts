import { Bubble } from "./bubble";

export class Controller{

    constructor(){
        model.createWalls();
        view.startBubblz();
    }

    onClick(x: number, y: number){
        console.log("hi");
        console.log(x);
        console.log(y);
    }
}