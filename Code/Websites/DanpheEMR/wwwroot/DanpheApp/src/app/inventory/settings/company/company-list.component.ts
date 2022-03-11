import { Component, ChangeDetectorRef } from '@angular/core'
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
        if ($event != null) {
            //find the index of currently added/updated company in the list of all companys (grid)
            let index = this.companyList.findIndex(a => a.CompanyId == $event.newCompany.CompanyId);
            //index will be -1 when this company is currently added. 
            if (index < 0) {
                this.companyList.splice(0, 0, $event.newCompany);//this will add this company to 0th index.
            }
            else {
                this.companyList.splice(index, 1, $event.newCompany);//this will replace one company at particular index. 
            }
        }
        this.companyList = this.companyList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.company = null;
        this.selIndex = null;

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
                this.FocusElementById('CompanyName');
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
        this.FocusElementById('CompanyName');
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }
    FocusElementById(id: string) {
        window.setTimeout(function () {
          let itmNameBox = document.getElementById(id);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
      }
}
