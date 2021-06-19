import {csvParse} from "d3-dsv";
import {csv, json} from "d3-fetch";
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import { Bubble } from "./bubble";
import * as p2 from 'p2';
import {RootElement} from "./rootElement";
import {Controller} from "./controller";
import {View} from "./view";
import * as PIXI from "pixi.js";
import * as math from "mathjs";



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
    public attraction_clusters: number = 0;

    constructor(node?: HierarchyNode<any>){
        this.world = new p2.World({
            gravity:[0, 0]
        });
        this.world.defaultContactMaterial.friction = 0.1;
        this.world.defaultContactMaterial.restitution = 0.7;

        if (!node) {
            csv('data/cars.csv')
                .then((csvData) => {
                    let root = stratify()
                        .id(function (d: any = {}) {
                            return d.name;
                        })
                        .parentId(function (d: any = {}) {
                            return d.parent;
                        })
                        (csvData);

                    this.calculateWeight(root);
                    this.root_bubble = this.createRootBubble(root);
                    this.setNewRoot(this.root_bubble);
                    console.log(root);
                    console.log(this.root_bubble);
                })
        }
        else
        {
            this.calculateWeight(node);
            this.root_bubble = this.createRootBubble(node);
            this.setNewRoot(this.root_bubble);
            console.log(node);
            console.log(this.root_bubble);
        }
    }


    newRoot(root: HierarchyNode<any>){
        /*this.world = new p2.World({
            gravity:[0, -9.82]
        });
        this.world.defaultContactMaterial.friction = 0.1;
        this.world.defaultContactMaterial.restitution = 0.7;

        this.currentID = 0;
        this.calculateWeight(root);
        this.root_bubble = this.createRootBubble(root);
        this.current_root = this.root_bubble;
        this.setNewRoot(this.root_bubble);
         */
        model = new Model(root);
        model.setNewRoot(model.root_bubble);
        view.drawBubbles();
        //model.setNewRoot(this.root_bubble);
    }

    getNewID(){
        let id = this.currentID;
        this.currentID++;
        return id;
    }

    placeToplevelBubbles(){
        let x = 0;
        let y = 0;
        let max_y = 0;
        for(let bubble of this.root_bubble.children){
            if(x + 2 * bubble.radius >= view.width){
                x = 0;
                y += max_y;
            }
            bubble.body.position[0] = x + bubble.radius;
            bubble.body.position[1] = y + bubble.radius;
            max_y = 2 * bubble.radius > max_y ? 2 * bubble.radius : max_y;
            x += 2 * bubble.radius;
        }
    }

    setSprings(new_root: Bubble){
        let min_children = new_root.children[0].children.length;
        let max_children = new_root.children[0].children.length;
        for(let bubble of new_root.children){
            min_children = Math.min(min_children, bubble.children.length);
            max_children = Math.max(max_children, bubble.children.length);
        }
        let group_size = (max_children - min_children) / this.attraction_clusters;

        for(let a = 0; a < new_root.children.length; ++a){
            let bubble_a = new_root.children[a];
            let group_id_a = Math.floor((bubble_a.children.length - min_children) / (group_size + 0.00001));

            for(let b = a + 1; b < new_root.children.length; ++b){
                let bubble_b = new_root.children[b];
                let group_id_b = Math.floor((bubble_b.children.length - min_children) / (group_size + 0.00001));

                if(bubble_a != bubble_b){
                    if(group_id_a == group_id_b){
                        console.log(bubble_a.name + " | " + bubble_b.name);
                        console.log("group_ids: " + group_id_a + " | " + group_id_b);
                        let spring = new p2.LinearSpring(bubble_a.body, bubble_b.body, {
                            stiffness: (bubble_a.radius + bubble_b.radius) / 50,
                            restLength: (bubble_a.radius + bubble_b.radius),
                            damping: 1,
                        });
                        this.world.addSpring(spring);
                    }
                    else{
                        console.log(bubble_a.name + " | " + bubble_b.name);
                        console.log("repulsion: " + group_id_a + " | " + group_id_b);
                        let spring = new p2.LinearSpring(bubble_a.body, bubble_b.body, {
                            stiffness: 2,
                            restLength: (bubble_a.radius + bubble_b.radius) * 4,
                            damping: 1,
                        });
                        this.world.addSpring(spring);
                    }
                    
                }
            }
        }
    }


    setNewRoot(new_root: Bubble){
        // remove all bodies from world
        for(let body of model.world.bodies){
            model.world.removeBody(body);
        }
        for(let spring of model.world.springs){
            model.world.removeSpring(spring);
        }
        // add walls back in
        model.createWalls();

        // add bodies to world
        // add current root
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
        if(Object.keys(this.current_root).length == 0){
            this.placeToplevelBubbles();
        }
        
        for(let bubble of new_root.children){
            //only happens on start up
            
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
            }
            this.world.addBody(bubble.body);

            // set physics of second layer
            let i = 1;
            for(let child of bubble.children){
                
                let theta = 2 * Math.PI / bubble.children.length;
                let radius = bubble.radius / 2;
                let x = bubble.body.position[0] + radius * Math.sin(i  * theta);
                let y = bubble.body.position[1] + -radius * Math.cos(i * theta);
                i += 1;

                child.body.position[0] = x;
                child.body.position[1] = y;

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
            //this.setSprings(bubble);
        }
        if(this.attraction_clusters > 0){
            this.setSprings(new_root);
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

    createTreeCsv(depth_min: number, depth_max: number, width_min: number, width_max:number, root_elements: RootElement[])
    {
        let root: any = {}
        root.name = "Node_0"
        root.children = []
        let current_array = [root];
        let current_array_next = [];
        let node_counter = 0;
        let random_depth = math.randomInt(depth_min, depth_max);
        for (let i = 0; i < random_depth; i++)
        {
            for (let current_node of current_array) {
                let random_width = math.randomInt(width_min, width_max)
                for (let j = 0; j < random_width; j++) {
                    let new_node: any = {};
                    node_counter++;
                    new_node.name = "Node_" + node_counter;
                    if(i == random_depth - 1)
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