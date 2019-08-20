import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FractionPercentModel } from '../../shared/fraction-percent.model';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { BillingBLService } from '../../../billing/shared/billing.bl.service';
import { FractionPercentService } from '../../shared/Fraction-Percent.service';


@Component({
    templateUrl: "./fraction-percent-list.html",
})
export class FractionPercentListComponent {

    public FractionApplicableItemList: any;
    public FractionPercentGridColumns: Array<any>;
    public showAddPage: boolean = false;

    public FractionPercentName: string = null;
    public FractionPercent: FractionPercentModel;

    public selIndex: number = null;

    constructor(public FractionPercentService: FractionPercentService, public routeFromService: RouteFromService, 
        public messageboxService: MessageboxService, public changeDetector: ChangeDetectorRef, public router: Router) {
            this.FractionPercentGridColumns = GridColumnSettings.FractionApplicableItemList;
    }

    ngOnInit() {
        this.getFractionApplicableItemList();
    }

    pushToList($event) {
        if (this.selIndex != null) {
            this.FractionApplicableItemList[this.selIndex] = $event.newFractionPercent;

        }
        else {
            this.FractionApplicableItemList.push($event.newFractionPercent);
            this.showAddPage = false;
        }
        this.FractionApplicableItemList = this.FractionApplicableItemList.slice();


    }
    closePopUp($event){
        this.showAddPage= false;
        this.FractionPercent= null;
    }
    getFractionApplicableItemList() {
        try {
            this.FractionPercentService.GetFractionApplicableItemList()
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.FractionApplicableItemList = res.Results;
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

    FractionPercentGridActions($event: GridEmitModel) {

        var action = $event.Action;

        switch (action) {
            case 'edit': {
             
                this.selIndex = $event.RowIndex;
                this.FractionPercent = $event.Data;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.showAddPage = true;
                break;
            }
        }
        //this.FractionPercent = $event.Data;
        //console.log(this.FractionPercent);
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

    AddFractionPercent() {
        this.selIndex = null;
        this.FractionPercent = null;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

}
