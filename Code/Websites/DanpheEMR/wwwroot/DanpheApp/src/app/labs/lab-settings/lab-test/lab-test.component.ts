import { ChangeDetectorRef, Component } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { LabTest } from "../../shared/lab-test.model";
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';

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
    public labGridCols: LabGridColumnSettings = null;

    public itmIsActiveValue: string = "Active";//default type is Active.-- sud: 19Sept'18

    public rptCategoryList: Array<any> = new Array<any>();
    public selCategoryId = 0;// 0 is for --All--

    constructor(
        public labSettingBlService: LabSettingsBLService,
        public messageBoxService: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService
    ) {
        this.labGridCols = new LabGridColumnSettings(this.securityService);
        this.labTestGridCol = this.labGridCols.LabTestList;
        this.GetLabTestList();
        this.LoadReportTemplateList();
    }


    public GetLabTestList(): void {
        this.labSettingBlService.GetAllLabTests().
            subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.labTestList = res.Results;
                    this.OnTestFiltersChanged();//call this to show default values.
                    //this.filteredLabTestList = res.Results;
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Failed to get ReportTemplate List"]);
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

    AddNewLabTest(): void {
        this.showAddLabTest = false;
        this.selectedLabTest = new LabTest();
        this.changeDetector.detectChanges();
        this.showAddLabTest = true;
        this.update = false;
    }

    public selectedActivateDeactivate: LabTest = null;
    public selectedItem: LabTest = null;
    EditAction(event: GridEmitModel): void {
        switch (event.Action) {
            case "edit": {
                this.selectedLabTest = new LabTest();
                this.index = event.RowIndex;//assign index
                this.showAddLabTest = false;
                this.changeDetector.detectChanges();
                this.selectedLabTest = Object.assign(this.selectedLabTest, event.Data);
                this.update = true;
                this.showAddLabTest = true;
                break;
            }
            case "activateDeactivateLabTest": {
                if (event.Data != null) {
                    this.selectedActivateDeactivate = null;
                    this.selectedActivateDeactivate = event.Data;
                    this.ActivateDeactivateLabTestStatus(this.selectedActivateDeactivate);
                    this.selectedItem = null;
                }
                break;

            }
            default:
                break;
        }
    }



    //sud: 19Sept'18 For filtering of data in Lab-test list..
    OnTestFiltersChanged(): void {
        //this list contains filtered items from isactive filter. we'll further get filters from this array.
        let isActiveFilteredList = [];

        if (this.labTestList && this.labTestList.length > 0) {
            //filter for IsActive field
            if (this.itmIsActiveValue === "All") {
                isActiveFilteredList = this.labTestList;
            }
            else if (this.itmIsActiveValue === "Active") {
                isActiveFilteredList = this.labTestList.filter(p => p.IsActive);
            }
            else if (this.itmIsActiveValue === "InActive") {
                isActiveFilteredList = this.labTestList.filter(p => !p.IsActive);
            }

            //Filter for ReportTemplateId
            if (this.selCategoryId === 0) {
                this.filteredLabTestList = isActiveFilteredList;
            }
            else {
                this.filteredLabTestList = isActiveFilteredList.filter(itm => itm.LabTestCategoryId === this.selCategoryId);
            }



            this.filteredLabTestList.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });
        }
    }
    //load report template list so that we can filter using them... 
    LoadReportTemplateList(): void {
        this.labSettingBlService.GetAllLabCategory().
            subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.rptCategoryList = res.Results.map(tmp => {
                            return { TestCategoryId: tmp.TestCategoryId, TestCategoryName: tmp.TestCategoryName };
                        });
                        this.rptCategoryList.unshift({ TestCategoryId: 0, TestCategoryName: "--All--" });
                    }
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Failed to Load ReportTemplate List"]);
                });
    }


    //Anjana: 15 Feb:2021; Update IsActive status of LabTest- Activate or Deactivate
    ActivateDeactivateLabTestStatus(currTest: LabTest) {
        if (currTest !== null) {
            let status = currTest.IsActive === true ? false : true;

            if (status === true) {
                currTest.IsActive = status;
                this.ChangeActiveStatus(currTest);
            } else {
                if (confirm("Are you Sure want to Deactivate " + currTest.LabTestName + ' ?')) {

                    currTest.IsActive = status;
                    //we want to update the ISActive property in table there for this call is necessry
                    this.ChangeActiveStatus(currTest);
                }
            }
        }

    }

    ChangeActiveStatus(currTest) {
        this.labSettingBlService.DeactivateLab(currTest)
            .subscribe(
                res => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        let responseMessage = res.Results.IsActive ? "LabTest is now activated." : "LabTest is now deactivated.";
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [responseMessage]);
                        //This for send to callbackadd function to update data in list
                        this.GetLabTestList();
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Something went wrong' + res.ErrorMessage]);
                    }
                },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [err]);
                });

    }


}
