import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { RouterOutlet, RouterModule } from '@angular/router'
import { PhrmRackService } from "../shared/rack/phrm-rack.service"
import PHRMGridColumns from "../shared/phrm-grid-columns"
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { PhrmRackModel } from '../shared/rack/phrm-rack.model';

@Component({
    templateUrl: "./phrm-rack.html",
})
export class PhrmRackComponent {

    public rackList: any;
    public rackGridColumns: Array<any>;
    public showAddPage: boolean = false;
    public showDrugListPage: boolean = false;
    public drugList: any = [];
    public rackName: string = null;


    public rack: PhrmRackModel;
    public selIndex: number = null;
    constructor(public phrmRackService: PhrmRackService, public routeFromService: RouteFromService,
        public messageboxService: MessageboxService, public changeDetector: ChangeDetectorRef) {

        this.rackGridColumns = PHRMGridColumns.PHRMRackList;

    }

    ngOnInit() {
      this.getRack();
    }

    pushToList($event) {
        if (this.selIndex != null) {
            this.rackList[this.selIndex] = $event.newRack;

        }
        else {
            this.rackList.push($event.newRack);
            this.showAddPage = false;
        }
        this.rackList = this.rackList.slice();


    }

    getRack() {
        try {
            this.phrmRackService.GetRackList()
                .subscribe(res => {
                    //if (res.Status == "OK") {
                  this.rackList = res;
                    //}
                    //else {
                    //    alert("Failed ! " + res.ErrorMessage);
                    //    console.log(res.ErrorMessage)
                    //}
                });
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
      }
    }

    RackGridActions($event: GridEmitModel) {

        var action = $event.Action;

        switch (action) {
            case 'view': {
                this.showDrugListPage = false;
                this.changeDetector.detectChanges();
                this.showDrugListPage = true;
                this.rackName = $event.Data.Name;
                this.getDrugList($event.Data.RackId);
                break;
            }
            case 'edit': {
                this.rack = null;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selIndex = $event.RowIndex;
                this.rack = $event.Data;
                this.showAddPage = true;
                break;
            }
        }
        //this.rack = $event.Data;
        //console.log(this.rack);
    }

    // return all the drug list stored in given rackId
    getDrugList(rackId) {
        try {
            this.phrmRackService.GetDrugList(rackId)
                .subscribe(res => {
                    //if (res.Status == "OK") {
                    this.drugList = res;
                    //}
                    //else {
                    //    alert("Failed ! " + res.ErrorMessage);
                    //    console.log(res.ErrorMessage)
                    //}
                });
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.routeFromService.RouteFrom = null;
            this.messageboxService.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
            //this.messageboxService.showMessage("error", [ex.message + "     " + ex.stack]);
        }
    }

    AddRack() {
        this.selIndex = null;
        this.showAddPage = false;
        this.rack = null;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

}
