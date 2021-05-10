import { Bubble } from "./bubble";

export class Controller{

    constructor(){
        model.createWalls();
        view.startBubblz();
    }

    getWeight(node: Bubble)
    {
        return 1
    }
}