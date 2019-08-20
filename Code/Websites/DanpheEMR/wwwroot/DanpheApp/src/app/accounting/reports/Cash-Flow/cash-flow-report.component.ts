import { Component, Directive, ViewChild } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import { FiscalYearModel } from '../../settings/shared/fiscalyear.model';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../../shared/common.functions';
import { style } from "@angular/animations";
@Component({
    selector: 'my-app',
    templateUrl: "./cashflow-report.html"
})
export class CashFlowReportComponent {
    public fromDate: string = null;
    public toDate: string = null;
    public cashflowData: any;
    public fiscalYears: Array<FiscalYearModel> = new Array<FiscalYearModel>();
    public selFiscalYear: number = 0;
    public InflowData: any;
    public OutflowData: any;
    public showResult: boolean = false;
    public IsLedgerLevel: boolean = true;
    //public data = new ModelData();
    
    constructor(
        public messageBoxService: MessageboxService,
        public accReportBLService: AccountingReportsBLService) {
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
        this.loadFiscalYearList();
    }

    //Load cash flow data
    LoadData() {
        if (this.ValidDateCheck()) {
            try {                
                this.accReportBLService.GetCashFlowReportData(this.fromDate, this.toDate)               
                .subscribe( res=> {
                        //this.data=Object.assign(this.data,res);                                       
                        if (res.Status == 'OK') {
                            this.cashflowData = res.Results;
                            this.CalculateTotalAmounts();
                            this.formatDataforDisplay();
                            this.showResult = true;
                        }
                        else {
                            this.messageBoxService.showMessage("failed", [res.ErrorMessage])
                        }
                    }
                    );
            }
            catch (exception) {
                this.ShowCatchErrMessage(exception);
            }
        }
        else {
            this.messageBoxService.showMessage("notice", ["fromDate, toDate not proper"]);
        }

    }
    OutputMethod(res:any){
         let result=res.Results;
    }

    //this is temporary solution for check valid date
    //need to check proper
    ValidDateCheck(): boolean {
        if (this.fromDate.toString().length <= 0) {
            this.messageBoxService.showMessage("failed", ['From Date required']);
            return false;
        }
        if (this.toDate.toString().length <= 0) {
            this.messageBoxService.showMessage("failed", ['To Date required']);
            return false;
        }
        return true;
    }
    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'AccountingCashFlowReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    //This function only for show catch messages
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.messageBoxService.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }

    CalculateTotalAmounts() {
        let InTotal = 0;
        let OutTotal = 0;
        let OpeningBal = 0;
        let CloseBal = 0;
        let NetInflow = 0;
        for (var i = 0; i < this.cashflowData.length; i++) {
            for (var j = 0; j < this.cashflowData[i].COAList.length; j++) {
                var TypeInAmt = 0;
                var TypeOutAmt = 0;
                var OpBal = 0;
                //var ClBal = 0;
                for (var k = 0; k < this.cashflowData[i].COAList[j].LedgerGroupList.length; k++) {
                    for (var l = 0; l < this.cashflowData[i].COAList[j].LedgerGroupList[k].LedgersList.length; l++) {
                        TypeInAmt += this.cashflowData[i].COAList[j].LedgerGroupList[k].LedgersList[l].Amountdr;
                        TypeOutAmt += this.cashflowData[i].COAList[j].LedgerGroupList[k].LedgersList[l].Amountcr;
                        OpBal += this.cashflowData[i].COAList[j].LedgerGroupList[k].LedgersList[l].OpenBal;
                        // ClBal += this.cashflowData[i].COAList[j].LedgersList[k].CloseBal;
                    }
                    this.cashflowData[i].COAList[j]["TypeLedgerGroupDrTotal"] = CommonFunctions.parseAmount(TypeInAmt);
                    this.cashflowData[i].COAList[j]["TypeLedgerGroupCrTotal"] = CommonFunctions.parseAmount(TypeOutAmt);
                }
                this.cashflowData[i].COAList[j]["TypeDrTotal"] = CommonFunctions.parseAmount(TypeInAmt);
                this.cashflowData[i].COAList[j]["TypeCrTotal"] = CommonFunctions.parseAmount(TypeOutAmt);
                InTotal += TypeInAmt;
                OutTotal += TypeOutAmt;
                OpeningBal += OpBal;
               // CloseBal += ClBal;               
            }          
        } 
    
        NetInflow = InTotal - OutTotal;
        CloseBal = OpeningBal + NetInflow;
        this.cashflowData["Netinflow"] = CommonFunctions.parseAmount(NetInflow);
        this.cashflowData["OpeningBalance"] = CommonFunctions.parseAmount(OpeningBal);
        this.cashflowData["ClosingBalance"] = CommonFunctions.parseAmount(CloseBal);
        this.cashflowData["InTotalAmt"] = CommonFunctions.parseAmount(InTotal);
        this.cashflowData["OutTotalAmt"] = CommonFunctions.parseAmount(OutTotal);
        
    }

    loadFiscalYearList() {
        this.accReportBLService.GetFiscalYearsList().subscribe(res => {
            if (res.Status == "OK") {
                this.fiscalYears = res.Results;
            }
            else {
                this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
            }
        });
    }

    formatDataforDisplay() {
        this.OutflowData = [];
        this.InflowData = [];
        this.cashflowData.forEach(a => {
            a.COAList.forEach(b => {
                if (b.TypeCrTotal > 0) {
                    this.OutflowData = this.pushToList(this.OutflowData, b.COA, b.TypeCrTotal, "BoldCategory");
                    b.LedgerGroupList.forEach(b => {
                        this.OutflowData = this.pushToList(this.OutflowData, b.LedgerGroupName, b.TypeLedgerGroupCrTotal, "LedgerGroup");
                        b.LedgersList.forEach(c => {
                          //  if (c.LedgerGroupName != "Cash" && c.Amountcr > 0)
                                this.OutflowData = this.pushToList(this.OutflowData, c.LedgerName, CommonFunctions.parseAmount(c.Amountcr), "LedgerLevel");
                        });
                    });
                }
            });
            a.COAList.forEach(b => {
                if (b.TypeDrTotal > 0) {
                    this.InflowData = this.pushToList(this.InflowData, b.COA, b.TypeDrTotal, "BoldCategory");
                    b.LedgerGroupList.forEach(b => {
                        this.InflowData = this.pushToList(this.InflowData, b.LedgerGroupName, b.TypeLedgerGroupDrTotal, "LedgerGroup");
                          b.LedgersList.forEach(c => {
                           // if (c.LedgerGroupName != "Cash" && c.Amountdr > 0)
                              this.InflowData = this.pushToList(this.InflowData, c.LedgerName, CommonFunctions.parseAmount(c.Amountdr), "LedgerLevel");

                        });
                    });
                }
            });
        });
        this.cashflowData = this.pushToList(this.cashflowData, "Net Inflow", this.cashflowData.Netinflow, "BoldCategory");
        this.cashflowData = this.pushToList(this.cashflowData, "Opening Balance", this.cashflowData.OpeningBalance, "BoldCategory");
        this.cashflowData = this.pushToList(this.cashflowData, "Closing Balance", this.cashflowData.ClosingBalance, "BoldCategory");
        this.InflowData = this.pushToList(this.InflowData, "Total",  this.cashflowData.InTotalAmt, "BoldTotal");
        this.OutflowData = this.pushToList(this.OutflowData, "Total", this.cashflowData.OutTotalAmt, "BoldTotal");

    }
    Print() {
        let popupWinindow;
        var printContents = '<b>Report Date Range: ' + this.fromDate + ' To ' + this.toDate + '</b>';
        printContents += document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        let documentContent = "<html><head>";
        documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '</head>';
        documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    }

    ExportToExcel(tableId) {
        if (tableId) {
            let workSheetName = 'Cash Flow Report';
            let Heading = 'Cash Flow Report';
            let filename = 'CashFlowReport';
            //NBB-send all parameters for now 
            //need enhancement in this function 
            //here from date and todate for show date range for excel sheet data
            CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,
                Heading, filename);
        }
    }
    //common function for foramtting
    //it takes source list, name, amount and style string then return by attaching obj to it.
    pushToList(list, name,  amt,  style) {
        let Obj = new Object();
        Obj["Name"] = name;
        Obj["Amount"] = amt;
        Obj["Style"] = style;
        list.push(Obj);

        return list;
    }


}