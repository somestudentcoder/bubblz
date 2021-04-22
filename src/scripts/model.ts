import {csvParse} from "d3-dsv";
import {csv, json} from "d3-fetch";
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import { readFileSync } from "fs";




export class Model{
    public currentPolygonID: number = 0;
  
  
    constructor(){
        csv('data/cars.csv')
        .then((csvData) => {
          let root = stratify()
            .id(function (d:any = {}) { return d.name; })
            .parentId(function (d:any = {}) { return d.parent; })
            (csvData);
            console.log(root);
        })

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