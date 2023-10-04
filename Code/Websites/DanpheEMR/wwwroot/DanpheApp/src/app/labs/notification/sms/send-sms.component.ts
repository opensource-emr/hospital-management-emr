import { ChangeDetectorRef, Component, ElementRef, ViewChild } from "@angular/core";
import html2canvas from "html2canvas";
import * as jsPDF from "jspdf";
import * as moment from "moment";
import { PatientService } from "../../../../app/patients/shared/patient.service";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LabTestRequisition } from "../../shared/lab-requisition.model";
import { LabTest } from "../../shared/lab-test.model";
import { LabSendSmsModel } from "../../shared/lab-view.models";
import { LabsBLService } from "../../shared/labs.bl.service";

@Component({
    selector: 'send-sms',
    templateUrl: 'send-sms.html'
})

export class LabSendSmsComponent {
    public smsApplicableData: Array<LabTestRequisition> = new Array<LabTestRequisition>();
    public SelectAll: boolean = false;
    public showSendToAll: boolean = false;
    public fromDate: string;
    public toDate: string;
    public filteredLabReqList: Array<any> = new Array<any>();
    public reqIdList = [];
    public selectedIds: string = "";
    public itmIsActiveValue: string = "NotSent";
    public isInitialLoad: boolean = true;
    public showMessageToSend: boolean = false;
    public loadedForExport: boolean = false;
    public loading: boolean = false;
    public smsDataToSend: any;
    @ViewChild('lab-report-main') htmlData: ElementRef;
    public sendPsfAndSmsOnSingleClick: boolean = true;
    public searchString: string = null;
    public page: number = 1;
    public itmResultValue: string = "";

    constructor(public labBlService: LabsBLService,
        public msgBoxServ: MessageboxService, public coreService: CoreService,
        public changeDetector: ChangeDetectorRef,
        public patientService: PatientService) {
        this.sendPsfAndSmsOnSingleClick = true;
    }

    GetAllSMSApplicableTest() {
        this.smsApplicableData = [];
        this.coreService.loading = true;
        this.labBlService.GetSMSApplicableTest(this.fromDate, this.toDate).subscribe(res => {
            if (res.Status == "OK") {
                this.smsApplicableData = res.Results;
                this.isInitialLoad = false;
                this.changeDetector.detectChanges();
                this.OnTestFiltersChanged();
                this.coreService.loading = false;
            } else {
                this.coreService.loading = false;
                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        });

    }

    OnFromToDateChange($event) {
            this.fromDate = $event ? $event.fromDate : this.fromDate;
            this.toDate = $event ? $event.toDate : this.toDate;
            if (this.isInitialLoad && $event.fromDate && $event.toDate) {
                this.GetAllSMSApplicableTest();
            }    
    }

    SelectAllData() {
        this.reqIdList = [];
        if (this.SelectAll) {
            this.filteredLabReqList.forEach(data => {
                data.IsSelected = true;
                this.reqIdList.push(data.RequisitionId);
            });
            this.selectedIds = this.reqIdList.toString();
            this.showSendToAll = true;
        } else {
            this.filteredLabReqList.forEach(data => {
                this.reqIdList = [];
                data.IsSelected = false;
            });
            this.showSendToAll = false;
        }
    }



    SendSMS() {
        this.coreService.loading = true;
        this.showMessageToSend = false;
        this.smsDataToSend = null;
        if (this.selectedIds != null) {
            this.labBlService.PostSMS(this.selectedIds).subscribe(res => {
                if (res.Status == "OK") {
                    this.reqIdList = [];
                    this.selectedIds = null;
                    this.coreService.loading = true;
                    this.GetAllSMSApplicableTest();
                    this.msgBoxServ.showMessage("success", ["SMS sent successfully."]);
                } else {
                    this.reqIdList = [];
                    this.msgBoxServ.showMessage("error", ["Cannot send SMS please try again later."]);
                    this.coreService.loading = false;
                    this.selectedIds = null;
                }
            }, err => {
                console.log(err);
                this.msgBoxServ.showMessage("error", ["Cannot send SMS please try again later."]);
                this.coreService.loading = false;
                this.selectedIds = null;
            })
        } else {
            this.reqIdList = [];
            this.msgBoxServ.showMessage("error", ["Please select a test first."]);
            this.coreService.loading = false;
            this.selectedIds = null;
        }
    }

    sendSingleSMS(tst) {
        // let reqIdArr = [];
        // reqIdArr.push(tst.RequisitionId);
        this.selectedIds = null;
        this.selectedIds = tst.RequisitionId.toString();
        if ((this.selectedIds != null) && this.selectedIds && tst.RequisitionId) {
            this.GetMessageToSend(this.selectedIds);
            //this.SendSMS();
        }
    }

    GetMessageToSend(idStr: string) {
        this.coreService.loading = true;
        if (this.selectedIds != null) {
            this.labBlService.GetSMSToBeSendMsg(this.selectedIds).subscribe(res => {
                if (res.Status == "OK") {
                    this.smsDataToSend = res.Results;
                    this.showMessageToSend = false;
                    this.changeDetector.detectChanges();
                    this.showMessageToSend = true;
                    this.coreService.loading = false;

                    this.coreService.FocusInputById('btnSendSms', 500);
                } else {
                    this.msgBoxServ.showMessage("error", ["Cannot send SMS please try again later."]);
                    this.coreService.loading = false;
                }
            }, err => {
                console.log(err);
                this.msgBoxServ.showMessage("error", ["Cannot send SMS please try again later."]);
                this.coreService.loading = false;
            })
        } else {
            this.msgBoxServ.showMessage("error", ["Please select a test first."]);
            this.coreService.loading = false;
        }
    }

    CancelMessageSend() {
        this.selectedIds = "";
        this.showMessageToSend = false;
        this.smsDataToSend = null;
    }

    SendToAll() {
        if (this.selectedIds != null) {
            this.SendSMS();
        } else {
            this.msgBoxServ.showMessage("error", ["Please select a test first."]);
        }
    }

    OnTestFiltersChanged() {
        let isActiveFilteredList = [];
        if (this.smsApplicableData && this.smsApplicableData.length > 0) {
            if (this.itmIsActiveValue == "NotSent") {
                isActiveFilteredList = this.smsApplicableData.filter(p => !p.IsSmsSend);
            }
            else if (this.itmIsActiveValue == "Sent") {
                isActiveFilteredList = this.smsApplicableData.filter(p => p.IsSmsSend);
            } else {
                isActiveFilteredList = Object.assign([], this.smsApplicableData);
            }
            this.filteredLabReqList = this.OnResultValueFilterChanged(isActiveFilteredList);
        }
    }

    OnResultValueFilterChanged(data: any[]) {
        if (this.itmResultValue && (this.itmResultValue.trim() != '') && (this.itmResultValue.toLowerCase() != 'all')) {
            return data.filter(d => d.Result.toLowerCase() == this.itmResultValue);
        } else {
            return data;
        }
    }

    public count = 0;
    TestSelected(data) {
        if (data.IsSelected == true) {
            this.count++;
            this.reqIdList.push(data.RequisitionId);
            this.selectedIds = this.reqIdList.toString();
        } else {
            this.count--;
            this.reqIdList.pop();
        }
        if (this.count > 0) {
            this.showSendToAll = true;
        } else {
            this.showSendToAll = false;
        }
    }

    public showReport = false;
    public requisitionIdList = [];
    public showSignatoriesEdit: boolean = false;

    sendPdf(data) {
        this.requisitionIdList = [];
        this.patientService.getGlobal().ShortName = data.PatientName;
        this.patientService.getGlobal().PatientCode = data.PatientCode;
        this.patientService.getGlobal().DateOfBirth = data.DateOfBirth;
        this.patientService.getGlobal().Gender = data.Gender;

        this.requisitionIdList.push(data.RequisitionId);


        this.selectedIds = data.RequisitionId.toString();

        this.showReport = true;
        window.setTimeout(() => {
            this.loadedForExport = true;
        }, 1500);
    }

    public Close() {
        if (this.loading) {
            this.msgBoxServ.showMessage("error", ["Please wait while Exoprt is completed"]);
            return;
        }
        this.showReport = false;
    }

    CallBackBackToGrid(event) {

    }

    public exportToPdf() {
        this.loading = true;
        const marginTop = 100;
        var dom = document.getElementById("lab-report-main");
        dom.style.border = "none";
        dom.style.paddingTop = marginTop + "px";
        dom.style.display = "flex";
        dom.style.width = "1000px";

        const reportWidth = dom.clientWidth;
        const reportHeight = dom.clientHeight + marginTop;
        const elementWidth = 800;

        html2canvas(dom, {
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 10,
            width: reportWidth + 150,
            height: reportHeight + 50,
            windowWidth: reportWidth - 20,
            windowHeight: reportHeight - 20
        }).then((canvas) => {
            const FILEURI = canvas.toDataURL('image/png');
            let PDF = new jsPDF('p', 'pt', 'a2');

            let height = canvas.height * elementWidth / canvas.width;

            // PDF.addImage(FILEURI, 'PNG', 0, 0, elementWidth, height);

            PDF.addImage(FILEURI, 'PNG', 0, 0);

            window.setTimeout(() => {
                var binary = PDF.output();
                var data = binary ? btoa(binary) : "";

                this.labBlService.SendPdf(data, this.requisitionIdList[0]).subscribe(res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["File exported successfully."]);

                        let dt = this.filteredLabReqList.find(p => p.RequisitionId == this.requisitionIdList[0]);
                        if (dt) { dt.IsFileUploaded = true; }

                        this.showReport = false;
                        this.loading = false;


                        if (this.sendPsfAndSmsOnSingleClick) {
                            if ((this.selectedIds != null) && this.selectedIds) {
                                this.GetMessageToSend(this.selectedIds);
                            }
                        }
                    } else {
                        this.msgBoxServ.showMessage("failed", ["Unable to export file."]);
                        this.showReport = false;
                        this.loading = false;
                        this.selectedIds = null;
                    }
                }, (err) => { this.loading = false; this.selectedIds = null; console.log(err.ErrorMessage); this.msgBoxServ.showMessage("failed", ["Unable to export file. Please try later."]); });

            }, 500)

            //doc.save(docName);
            // document.getElementById("lab-report-main").style.border = "1px solid";
            // document.getElementById("lab-report-main").style.minHeight = 175 + "mm";
        });
    }
}
