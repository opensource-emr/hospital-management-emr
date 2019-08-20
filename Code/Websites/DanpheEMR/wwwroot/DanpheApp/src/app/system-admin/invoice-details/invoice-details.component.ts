import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SystemAdminBLService } from '../shared/system-admin.bl.service';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InvoiceDetailsModel } from '../shared/invoice-details.model'
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../core/shared/core.service";
@Component({
    templateUrl: "../../view/system-admin-view/InvoiceDetails.html" // "/SystemAdminView/InvoiceDetails"
})

export class InvoiceDetailsComponent {

    public curtInvoiceDetail: Array<InvoiceDetailsModel> = new Array<InvoiceDetailsModel>();
    public fromDate: string = "";
    public toDate: string = "";
    public bilInvoiceDetailGridColumns: Array<any> = null;
    public systemAdminBLService: SystemAdminBLService = null;
    public hdr: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
    public exportHeaders: string = null;

    constructor(_systemAdminBLService: SystemAdminBLService,
        public msgBoxServ: MessageboxService,
        public npCalService: NepaliCalendarService,
        public changeDetectorRef: ChangeDetectorRef,
        public coreService: CoreService) {
        this.systemAdminBLService = _systemAdminBLService;
        this.bilInvoiceDetailGridColumns = GridColumnSettings.BillingInvoiceDetails;
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
        this.GetInvoiceDetails();
        //this.GetBillingHeaderParameter();
    }
    GetInvoiceDetails(): void {
        this.systemAdminBLService.GetInvoiceDetails(this.fromDate, this.toDate).
            subscribe(res => {
                if (res.Status == 'OK') {
                    let invDetails: Array<any> = res.Results;
                    invDetails.forEach(itm => {
                        //itm.Is_Active = true;
                        //itm.Is_RealTime = true;
                        itm.BillDate_BS = this.npCalService.ConvertEngToNepDateString(itm.BillDate);
                        if (itm.Is_Printed == "No") {
                            itm.Printed_Time = "";
                            itm.Printed_by = "";
                        }
                    });

                    this.callBackBillingInvoiceDetails(invDetails);
                }
                else if (res.Status == 'Failed') {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to take database backup Log.']);
                });
    }

    public callBackBillingInvoiceDetails(invDetailsItems) {
        this.systemAdminBLService.GetPhrmInvoiceDetails(this.fromDate, this.toDate).
            subscribe(res => {
                if (res.Status == 'OK') {
                    let salesDetails: Array<any> = res.Results;
                    salesDetails.forEach(itm => {
                        itm.BillDate_BS = this.npCalService.ConvertEngToNepDateString(itm.BillDate);
                        itm.Bill_No = "PH" + itm.Bill_No;
                        if (itm.Is_Printed == "No") {
                            itm.Printed_Time = "";
                            itm.Printed_by = "";
                        }                      
                    });
                    this.changeDetectorRef.detectChanges();
                    salesDetails.forEach(itm => {
                        invDetailsItems.push(itm);
                    });
                    invDetailsItems.sort(function (a, b) {
                        return +new Date(b.BillDate) - +new Date(a.BillDate);
                    });
                    this.curtInvoiceDetail = invDetailsItems;
                    this.changeDetectorRef.detectChanges();
                }
                else if (res.Status == 'Failed') {
                    console.log(res.ErrorMessage);
                    this.msgBoxServ.showMessage("error", ['error please check console log for details']);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to take database backup Log.']);
                });
    }
    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'BillingInvoiceLogDetails_' + moment().format('YYYY-MM-DD') + '.xls',
        customHeader: this.GetHeaderText()
    };

    GetGridExportOptions() {
        let gridExportOptions = {
            fileName: 'BillingInvoiceLogDetails_' + moment().format('YYYY-MM-DD') + '.xls',
            customHeader: this.GetHeaderText()
        };
        return gridExportOptions;
    }

    //Get customer Header Parameter from Core Service (Database) assign to local variable
    GetHeaderText(): string {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'BillingHeader').ParameterValue;
        var hdrTxt = "";
        if (paramValue) {
            this.hdr = JSON.parse(paramValue);
            hdrTxt = this.hdr.CustomerName + " \n ";
            hdrTxt += this.hdr.Address.toString().replace(",", " ") + " \n ";
            hdrTxt += this.hdr.CustomerRegLabel + "\n"; // + this.hdr.CustomerRegNo + " \n ";
            hdrTxt += "Invoice details From:" + this.fromDate + "  To:" + this.toDate;
        }
        return hdrTxt;
    }

}