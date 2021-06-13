import {csvParse} from "d3-dsv";
import {csv, json} from "d3-fetch";
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import { Bubble } from "./bubble";
import * as p2 from 'p2';
import {RootElement} from "./rootElement";



export class Model{
    PARENT_FILLED_GROUP: number = Math.pow(2, 1);
    PARENT_HOLLOW_GROUP: number = Math.pow(2, 2);
    CHILD_GROUP: number = Math.pow(2, 3);
    BOUNDARY_GROUP: number = Math.pow(2, 4);
    NO_COLLISION_GROUP: number = Math.pow(2, 5);

    public currentID: number = 0;
    public root_bubble: Bubble = {} as Bubble;
    public timeStep: number = 1 / 30;
    public world: p2.World = {} as p2.World;
    public current_root: Bubble = {} as Bubble;

    constructor(){
        this.world = new p2.World({
            gravity:[0, -9.82]
        });
        this.world.defaultContactMaterial.friction = 0.1;
        this.world.defaultContactMaterial.restitution = 0.7;


        csv('data/cars.csv')
        .then((csvData) => {
          let root = stratify()
            .id(function (d:any = {}) { return d.name; })
            .parentId(function (d:any = {}) { return d.parent; })
            (csvData);

            this.calculateWeight(root);
            this.root_bubble = this.createRootBubble(root);
            this.setNewRoot(this.root_bubble);
            console.log(root);
            console.log(this.root_bubble);
        })
    }


    newRoot(root: HierarchyNode<any>){
        this.calculateWeight(root);
        this.root_bubble = this.createRootBubble(root);
        this.setNewRoot(this.root_bubble);
    }

    getNewID(){
        let id = this.currentID;
        this.currentID++;
        return id;
    }


    setNewRoot(new_root: Bubble){
        // remove all bodies from world
        for(let body of model.world.bodies){
            model.world.removeBody(body);
        }
        // add walls back in
        model.createWalls();

        let x_parent = 0;
        let y_parent = 0;
        let x_child = 0;
        // add bodies to world
        // add current root
        if(Object.keys(this.current_root).length != 0 && new_root != this.current_root.parent){
            for(let shape of new_root.body.shapes){
                if(shape == new_root.body.shapes[0]){
                    this.setNoCollision(shape);
                }
                else{
                    this.setBoundaryCollision(shape);
                }
            }
            
            new_root.body.mass = 0;
            new_root.body.type = p2.Body.STATIC;
            new_root.body.velocity = [0, 0];
            new_root.body.updateMassProperties();
            this.world.addBody(new_root.body);
        }
        

        for(let bubble of new_root.children){
            if(Object.keys(this.current_root).length == 0){
                x_parent += bubble.radius;
                y_parent = bubble.radius;
                bubble.body.position[0] = x_parent;
                bubble.body.position[1] = y_parent;
                x_parent += bubble.radius;
            }
            bubble.body.mass = bubble.weight;
            bubble.body.type = p2.Body.DYNAMIC;
            bubble.body.updateMassProperties();
            
            for(let bubble_shape of bubble.body.shapes){

                // set phyiscs of first layer
                if(bubble_shape == bubble.body.shapes[0]){
                    this.setParentFilledCollision(bubble_shape);
                }
                else{
                    this.setParentHollowCollision(bubble_shape);
                }
                
                // set physics of second layer
                x_child = bubble.body.position[0] - bubble.radius;
                for(let child of bubble.children){
                    x_child += child.radius;
                    child.body.position[0] = x_child;
                    child.body.position[1] = bubble.body.position[1];
                    x_child += child.radius;

                    for(let child_shape of child.body.shapes){
                        if(child_shape == child.body.shapes[0]){
                            
                            this.setChildCollision(child_shape);
                        }
                        else{
                            this.setNoCollision(child_shape);
                        }
                    }
                    this.world.addBody(child.body);
                }
            }
            this.world.addBody(bubble.body);
        }
        console.log("old root");
        console.log(this.current_root);
        console.log("new root");
        console.log(new_root)
        this.current_root = new_root;
    }

    setNoCollision(shape:p2.Shape){
        shape.collisionGroup = model.NO_COLLISION_GROUP;
        shape.collisionMask = 0;
    }

    setBoundaryCollision(shape: p2.Shape){
        shape.collisionGroup = model.BOUNDARY_GROUP;
        shape.collisionMask = model.PARENT_FILLED_GROUP | model.BOUNDARY_GROUP;
    }

    setParentHollowCollision(shape: p2.Shape){
        shape.collisionGroup = model.PARENT_HOLLOW_GROUP;
        shape.collisionMask = model.CHILD_GROUP;
    }

    setParentFilledCollision(shape: p2.Shape){
        shape.collisionGroup = model.PARENT_FILLED_GROUP;
        shape.collisionMask = model.PARENT_FILLED_GROUP | model.BOUNDARY_GROUP;
    }

    setChildCollision(shape: p2.Shape){
        shape.collisionGroup = model.CHILD_GROUP;
        shape.collisionMask = model.PARENT_HOLLOW_GROUP | model.CHILD_GROUP;
    }

    createWalls(){
        this.createWall(0, [0, 0]);
        this.createWall(Math.PI / 2, [view.width, 0]);
        this.createWall((3 * Math.PI) / 2, [0, 0]);
        this.createWall(Math.PI, [0, view.height]);
    }


    createWall(angle_param: number, position_param: [number, number]){
        let wall = new p2.Body({
            angle: angle_param,
            position: position_param
        });
        let plane = new p2.Plane;
        this.setBoundaryCollision(plane);
        wall.addShape(plane);
        this.world.addBody(wall);
    }

    
    createRootBubble(rootNode: HierarchyNode<any>){
        let bubble = new Bubble();
        if(rootNode.children != undefined){
            bubble = Bubble.from(rootNode);
        }
        return bubble;
    }


    calculateWeight(node: HierarchyNode<any>){
        let weight = this.getWeight(node.data);
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
        node.data.weight = weight;
        return parseFloat(weight);
    }


    getWeight(obj: any = {}){
        if(obj.hasOwnProperty('bubble_weight')){
          return obj.bubble_weight;
        }
        else{
          return obj.weight;
        }
      }

    
    hasUniqueParents(columns: string[]) {
        let requiredColumns = ['name', 'parent'];
        return requiredColumns.every(function (column: any = {}) {
            return columns.includes(column);
        });
    }


    hasNonUniqueParents(columns: string[]) {
        let requiredColumns = ['id', 'name', 'parentId'];
        return requiredColumns.every(function (column: any = {}) {
            return columns.includes(column);
        });
    }
    

    parseCsv(fileContent: any) {
        let parsingRes = csvParse(fileContent);
        let columns = parsingRes.columns;
        if(this.hasUniqueParents(columns)) {
          return stratify()
            .id(function (d:any = {}) { return d.name; })
            .parentId(function (d:any = {}) { return d.parent; })
            (parsingRes);
        } else if(this.hasNonUniqueParents(columns)) {
          return stratify()
            .id(function (d:any = {}) { return d.id; })
            .parentId(function (d:any = {}) { return d.parentId; })
            (parsingRes);
        }
        window.alert("Cannot parse CSV file!");
    }

    parseJson(fileContent: any) {
        let parsingRes = JSON.parse(fileContent);
        return hierarchy(parsingRes);
    }

    createTreeCsv(depth: number, width: number, root_elements: RootElement[])
    {
        let root: any = {}
        root.name = "Node_0"
        root.children = []
        let current_array = [root];
        let current_array_next = [];
        let node_counter = 1;
        for (let i = 0; i < depth; i++)
        {
            for (let current_node of current_array) {
                for (let j = 0; j < width; j++) {
                    let new_node: any = {};
                    node_counter++;
                    new_node.name = "Node_" + node_counter;
                    if(i == depth - 1)
                    {
                        for (let element of root_elements)
                        {
                            new_node[element.name_] = element.getNumber();
                        }
                        new_node.weight = 1;
                        //console.log(current_node)
                    }
                    else
                    {
                        new_node.children = [];
                    }
                    current_array_next.push(new_node)
                    current_node.children.push(new_node)
                }
            }
            current_array = current_array_next;
            current_array_next = []
        }
        console.log(root)
        return hierarchy(root);
    }
}