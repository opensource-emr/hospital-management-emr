import { Component } from '@angular/core';
import { Input, Output, EventEmitter, OnChanges } from "@angular/core"
import { DynamicTemplateService } from "../shared/dynamic-template-service";


@Component({
    selector: "danphe-json-table",
    templateUrl: "./json-table.html"
})
export class JsonTableComponent {

    public tableHeaders = ["Header-1", "Header-2"];
    public repeatCount: number = 1;//default:1
    public repeatRows: boolean = false;
    public showNums: boolean = false;
    public renderMode: string = "";
    public tableJson = [];

    @Input()
    public data = null;


    @Input()
    ngModel() {
        return this.tableJson;
    }


    @Output()
    ngModelChange = new EventEmitter<any>();

    constructor(public dynTemplateServ: DynamicTemplateService) {
        this.ngModelChange = new EventEmitter();
        this.renderMode = this.dynTemplateServ.templateRenderMode;
    }


    ngOnInit() {

        if (this.data) {
            let dynData = JSON.parse(this.data);
            this.repeatRows = dynData.Repeat && dynData.Repeat == "true" ? true : false;
            this.showNums = dynData.ShowSerNo && dynData.ShowSerNo == "true" ? true : false;
            this.tableHeaders = dynData.Keys ? dynData.Keys : ["Header-1", "Header-2"];
        }
        if (this.ngModel) {
            if (typeof (this.ngModel) == "string") {
                this.tableJson = JSON.parse(this.ngModel.toString());
            }
            else if (typeof (this.ngModel) == "object") {
                this.tableJson = JSON.parse(JSON.stringify(this.ngModel));
            }
            this.repeatCount = this.tableJson.length;
        }
        else {
            this.ResetTableJson();
        }

        this.ngModelChange.emit(this.tableJson);
    }




    RepeatCountOnChange() {
        this.ResetTableJson();
        this.ngModelChange.emit(this.tableJson);
        //this.ngModelChange.emit(this.tableJson);
    }

    ResetTableJson() {
        this.tableJson = [];
        //set from 

        for (var i = 0; i < this.repeatCount; i++) {
            let newObj = {};
            for (var j = 0; j < this.tableHeaders.length; j++) {
                let propName = this.tableHeaders[j];
                newObj[propName] = "";
            }
            this.tableJson.push(newObj);
        }

    }

    TableValuesChanged() {
        this.ngModelChange.emit(this.tableJson);
    }

    deleteRow(index) {
        this.tableJson.splice(index, 1);
        this.repeatCount = this.tableJson.length;
    }

    showObject() {

        let a = this.tableJson;
    }

}
