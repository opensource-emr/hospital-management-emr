import { Component,  ChangeDetectorRef } from '@angular/core'
import { CompanyModel } from '../../settings/shared/company/company.model';
import { CompanyService } from '../../settings/shared/company/company.service';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';


@Component({
    templateUrl: "./company-list.html",
})
export class CompanyListComponent {

    public companyList: any;
    public companyGridColumns: Array<any>;
    public showAddPage: boolean = false;

    public companyName: string = null;
    public company: CompanyModel;

    public selIndex: number = null;

    constructor(public companyService: CompanyService, public routeFromService: RouteFromService,
        public messageboxService: MessageboxService, public changeDetector: ChangeDetectorRef) {
            this.companyGridColumns = GridColumnSettings.CompanyList;
    }

    ngOnInit() {
        this.getCompany();
    }

    pushToList($event) {
        if (this.selIndex != null) {
            this.companyList[this.selIndex] = $event.newCompany;

        }
        else {
            this.companyList.push($event.newCompany);
            this.showAddPage = false;
        }
        this.companyList = this.companyList.slice();


    }

    getCompany() {
        try {
            this.companyService.GetCompanyList()
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.companyList = res.Results;
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

    CompanyGridActions($event: GridEmitModel) {

        var action = $event.Action;

        switch (action) {
            case 'edit': {
             
                this.selIndex = $event.RowIndex;
                this.company = $event.Data;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.showAddPage = true;
                break;
            }
        }
        //this.Company = $event.Data;
        //console.log(this.Company);
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

    AddCompany() {
        this.selIndex = null;
        this.company = null;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

}
