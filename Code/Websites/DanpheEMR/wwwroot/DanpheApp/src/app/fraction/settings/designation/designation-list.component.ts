import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DesignationModel } from '../../shared/Designation.model';
import { DesignationService } from '../../shared/Designation.service';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';


@Component({
    templateUrl: "./designation-list.html",
})
export class DesignationListComponent {

    public DesignationList: any;
    public DesignationGridColumns: Array<any>;
    public showAddPage: boolean = false;

    public DesignationName: string = null;
    public Designation: DesignationModel;

    public selIndex: number = null;

    constructor(public DesignationService: DesignationService, public routeFromService: RouteFromService,
        public messageboxService: MessageboxService, public changeDetector: ChangeDetectorRef, public router: Router) {
            this.DesignationGridColumns = GridColumnSettings.DesignationList;
    }

    ngOnInit() {
        this.getDesignation();
    }

    pushToList($event) {
        if (this.selIndex != null) {
            this.DesignationList[this.selIndex] = $event.newDesignation;

        }
        else {
            this.DesignationList.push($event.newDesignation);
            this.showAddPage = false;
        }
        this.DesignationList = this.DesignationList.slice();


    }
    closePopUp($event){
        this.showAddPage= false;
        this.Designation=null;
    }
    getDesignation() {
        try {
            this.DesignationService.GetDesignationList()
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.DesignationList = res.Results;
                    }
                    else {
                        alert("Failed ! " + res.ErrorMessage);
                        console.log(res.ErrorMessage)
                    }
                });
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    DesignationGridActions($event: GridEmitModel) {

        var action = $event.Action;

        switch (action) {
            case 'edit': {
             
                this.selIndex = $event.RowIndex;
                this.Designation = $event.Data;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.showAddPage = true;
                break;
            }
        }
        //this.Designation = $event.Data;
        //console.log(this.Designation);
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

    AddDesignation() {
        this.selIndex = null;
        this.Designation = null;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

}
