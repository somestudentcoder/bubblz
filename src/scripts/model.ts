import {csvParse} from "d3-dsv";
import {csv, json} from "d3-fetch";
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import { Bubble } from "./bubble";
import * as p2 from 'p2';



export class Model{
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
            this.current_root = this.root_bubble;
            console.log(root);
            console.log(this.root_bubble);
        })
    }


    getNewID(){
        let id = this.currentID;
        this.currentID++;
        return id;
    }


    setNewRoot(bubble: Bubble){
      for(let child of this.current_root.children){
        this.world.removeBody(child.body);
      }
      for(let child of bubble.children){
        this.world.addBody(child.body);
      }
      console.log("old root");
      console.log(this.current_root);
      console.log("new root");
      console.log(bubble)
      this.current_root = bubble;
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
        wall.addShape(new p2.Plane);
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
}