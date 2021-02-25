import { Component, ChangeDetectorRef } from '@angular/core';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { LabTest } from "../../shared/lab-test.model";
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { LabReportTemplateModel } from '../../shared/lab-report-template.model';

@Component({
    templateUrl: './labtest.html'
})

export class LabTestComponent {
    public labTestList: Array<LabTest> = new Array<LabTest>();
    public filteredLabTestList: Array<LabTest> = new Array<LabTest>();
    public labTestGridCol: Array<any> = null;
    public selectedLabTest: LabTest = new LabTest();
    public showAddLabTest: boolean = false;
    public index: number = 0;
    public update: boolean = false;

    public itmIsActiveValue: string = "Active";//default type is Active.-- sud: 19Sept'18

    public rptTemplatesList: Array<any> = new Array<any>();
    public selRptTemplateId = 0;// 0 is for --All--

    constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
        this.labTestGridCol = LabGridColumnSettings.LabTestList;
        this.GetLabTestList();
        this.LoadReportTemplateList();
    }


    GetLabTestList() {
        this.labSettingBlServ.GetAllLabTests().
            subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.labTestList = res.Results;
                    this.OnTestFiltersChanged();//call this to show default values.
                    //this.filteredLabTestList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to get ReportTemplate List"]);
                });


    }

    CallBackNewAdded($event) {       
        // if (this.update) {
        //     let itmIndex = this.labTestList.findIndex(tst => tst.LabTestId == $event.labtest.LabTestId);
        //     let itmRptTmplateId = $event.labtest.ReportTemplateId;
        //     let rptTmplateName = this.rptTemplatesList.find(rpt => rpt.ReportTemplateId == itmRptTmplateId).ReportTemplateName;
        //     $event.labtest.ReportTemplateName = rptTmplateName;
        //     this.labTestList.splice(itmIndex, 1, $event.labtest);//replace currentItem by updated item.
        // }
        // else {
        //     this.labTestList.push($event.labtest);
        // }
        //this.labTestList = this.labTestList.slice();
        this.GetLabTestList();
        this.changeDetector.detectChanges();
        //reset page level variables once Edit/Add action is completed. 
        this.showAddLabTest = false;
        this.selectedLabTest = null;
        this.index = null;
        this.OnTestFiltersChanged();//call this to filter active/inactive records after add/edit
    }

    AddNewLabTest() {
        this.showAddLabTest = false;
        this.selectedLabTest = new LabTest();
        this.changeDetector.detectChanges();
        this.showAddLabTest = true;
        this.update = false;
    }

    EditAction(event: GridEmitModel) {
        switch (event.Action) {
            case "edit": {
                this.selectedLabTest = new LabTest();
                this.index = event.RowIndex;//assign index
                this.showAddLabTest = false;
                this.changeDetector.detectChanges();
                this.selectedLabTest = Object.assign(this.selectedLabTest, event.Data);
                this.update = true;
                this.showAddLabTest = true;
            }
            default:
                break;
        }
    }


    //sud: 19Sept'18 For filtering of data in Lab-test list..
    OnTestFiltersChanged() {
        //this list contains filtered items from isactive filter. we'll further get filters from this array.
        let isActiveFilteredList = [];

        if (this.labTestList && this.labTestList.length > 0) {
            //filter for IsActive field
            if (this.itmIsActiveValue == "All") {
                isActiveFilteredList = this.labTestList;
            }
            else if (this.itmIsActiveValue == "Active") {
                isActiveFilteredList = this.labTestList.filter(p => p.IsActive == true);
            }
            else if (this.itmIsActiveValue == "InActive") {
                isActiveFilteredList = this.labTestList.filter(p => p.IsActive == false);
            }

            //Filter for ReportTemplateId
            if (this.selRptTemplateId == 0) {
                this.filteredLabTestList = isActiveFilteredList;
            }
            else {
                this.filteredLabTestList = isActiveFilteredList.filter(itm => itm.ReportTemplateId == this.selRptTemplateId);
            }



            this.filteredLabTestList.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });
        }
    }
    //load report template list so that we can filter using them... 
    LoadReportTemplateList(): void {
        this.labSettingBlServ.GetAllReportTemplates().
            subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == 'OK') {
                    if (res.Results && res.Results.length > 0) {
                        this.rptTemplatesList = res.Results.map(tmp => {
                            return { ReportTemplateId: tmp.ReportTemplateID, ReportTemplateName: tmp.ReportTemplateName };
                        });
                        this.rptTemplatesList.unshift({ ReportTemplateId: 0, ReportTemplateName: "--All--" });
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to Load ReportTemplate List"]);
                });
    }


}
