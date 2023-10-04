import { Component, ChangeDetectorRef, EventEmitter, Output, Input } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { GridEmitModel } from "../shared/danphe-grid/grid-emit.model";
import { WardStockModel } from './shared/ward-stock.model'
import WARDGridColumns from './shared/ward-grid-cloumns';
import { WardSupplyBLService } from "./shared/wardsupply.bl.service";
import { MessageboxService } from "../shared/messagebox/messagebox.service";
import { CommonFunctions } from "../shared/common.functions";
import * as moment from 'moment/moment'
import { DLService } from "../shared/dl.service";
import { WardModel } from "./shared/ward.model";
import { WardConsumptionModel } from './shared/ward-consumption.model';
import { Patient } from '../patients/shared/patient.model'
import { SecurityService } from '../security/shared/security.service';
import { CoreService } from '../core/shared/core.service';
import { PatientService } from '../patients/shared/patient.service';
import { RouteFromService } from '../shared/routefrom.service';
@Component({
    selector: 'new-consumption-receipt',
    templateUrl: "../../app/view/ward-supply-view/ConsumptionList.html"   //"/WardSupplyView/ConsumptionList"
})
export class ConsumptionListComponent {

    public consumptionListDetailsGridColumns: Array<WARDGridColumns> = []
    public consumptionListDetailsLocal = new Array<{ WardId: number, ConsumptionListByWard: Array<WardConsumptionModel> }>();
    public consumptionListDetails: Array<WardConsumptionModel> = []
    public consumptionLists: Array<WardConsumptionModel> = []
    public loading: boolean = false;
    public showWardList: boolean = false;
    public showConsumpList: boolean = false;
    public WardId: any;
    public rowIndex: number = null;
    public showComsumptionList: boolean = true;
    public selectedItem: WardConsumptionModel = new WardConsumptionModel();
    public currentPatient: Patient = new Patient();
    public currentStoreId: number = 0;
    public isSaleApplicable: boolean = true;
    public TotalConsumption: number = 0;
    public Dates: string = "";
    public Users: string = "";

    dlService: DLService = null;
    http: HttpClient = null;
    public wardList: Array<WardModel> = []
    public header: any = null;
    changeDetectorRef: any;


    @Input("showReceipt")
    public showReceipt: boolean = false;

    //@Input("currentPatient")
    //public currentPatient: boolean = false;


    @Output("callback-view")
    public callback: EventEmitter<object> = new EventEmitter<Object>();



    constructor(
        _http: HttpClient,
        _dlService: DLService,
        public wardSupplyBLService: WardSupplyBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public router: Router,
        public coreService: CoreService,
        public coreservice: CoreService,
        public routerFromService: RouteFromService,
        public msgBoxServ: MessageboxService,
        public patientService: PatientService) {
        this.http = _http;
        this.dlService = _dlService;
        this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);
        this.GetInventoryBillingHeaderParameter();
        this.consumptionListDetailsGridColumns = WARDGridColumns.ConsumptionDetailsList;
        try {
            this.currentStoreId = this.securityService.getActiveStore().StoreId;
            if (!this.currentStoreId) {
                this.LoadSubStoreSelectionPage()
            }
            else {
                this.GetwardList();
            }
        }
        catch (ex) {
            this.msgBoxServ.showMessage("Error", [ex.ErrorMessage]);
        }
        //this.getAllComsumptionListDetails();
    }
    LoadSubStoreSelectionPage() {
        this.router.navigate(['/WardSupply/Pharmacy']);
    }
    GetwardList() {
        try {
            this.wardSupplyBLService.GetWardList(this.currentStoreId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        if (res.Results.length) {
                            this.wardList = res.Results;
                            this.WardId = 0;
                            this.isSaleApplicable = true;
                            this.getAllComsumptionListDetails();
                        }
                        else {
                            this.msgBoxServ.showMessage("Empty", ["Ward List is not available."]);
                            this.isSaleApplicable = false;
                            console.log(res.Errors);
                        }
                    }
                });

        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }


    public getAllComsumptionListDetails() {
        try {
            let consumpList = this.consumptionListDetailsLocal.find(a => a.WardId == this.WardId);
            if (consumpList && this.WardId) {
                this.consumptionListDetails = [];
                this.consumptionListDetails = consumpList.ConsumptionListByWard;
            } else {
                this.wardSupplyBLService.GetAllComsumptionListDetails(this.WardId, this.currentStoreId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            if (res.Results.length) {
                                this.consumptionListDetails = [];
                                this.consumptionListDetails = res.Results;

                                //this.consumptionListDetailsLocal.push({
                                //    "WardId": this.WardId, "ConsumptionListByWard": res.Results
                                //});

                            }
                            else {
                                this.msgBoxServ.showMessage("Notice", ["no records found"]);
                                console.log(res.Errors);
                                this.consumptionListDetails = [];
                            }
                        } else {
                            this.msgBoxServ.showMessage("error", ["Failed to get data, please try again !"]);
                            console.log(res.Errors);
                        }
                    });
            }


        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    onChange() {
        this.showWardList = true;
        this.getAllComsumptionListDetails();




    }
    ConsumptionListGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "view":
                {
                    var data = $event.Data;
                    this.SetSelectedPatientData(data);
                    this.showConsumpList = true;
                }
                break;
            case "showDetails":
                {
                    var data = $event.Data;
                    this.SetSelectedPatientData(data);
                    var globalData = this.selectedItem.selectedPatient;

                    this.patientService.setGlobal(globalData);
                    this.routerFromService.RouteFrom = '/WardSupply/Pharmacy/Consumption';
                    this.router.navigate(['./Pharmacy/Sale/CreditBills']);
                    console.log(data.PatientId);
                }
                break;
            default:
                break;
        }
    }

    ShowConsumptionListDetailsById(data) {
        let patientId = data.PatientId;
        let wardId = data.WardId;
        this.wardSupplyBLService.GetConsumptionItemList(patientId, wardId, this.currentStoreId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.consumptionLists = res.Results;
                    this.Dates = this.consumptionLists[0].CreatedOn;
                    this.Users = this.consumptionLists[0].User;
                    console.log(this.Users);
                    this.TotalConsumption = this.consumptionLists.map(c => c.TotalAmount).reduce((sum, current) => sum + current);


                } else {
                    this.msgBoxServ.showMessage("failed", ['Failed to get List.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get List.' + err.ErrorMessage]);
                }
            )
    }

    public SetSelectedPatientData(data) {
        try {
            if (data.PatientId) {
                this.selectedItem.selectedPatient.PatientId = data.PatientId;
                this.selectedItem.selectedPatient.ShortName = data.Name;
                this.selectedItem.selectedPatient.Gender = data.Gender;
                this.selectedItem.selectedPatient.PhoneNumber = data.PhoneNumber;
                this.selectedItem.selectedPatient.Address = data.Address;
                this.selectedItem.selectedPatient.Age = data.Age;
                this.selectedItem.selectedPatient.WardId = data.WardId;
                this.currentPatient = this.selectedItem.selectedPatient;
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    Close() {

        this.showConsumpList = false;
    }

    Cancel() {
        this.loading = true;
        try {
            this.selectedItem = new WardConsumptionModel();
            this.showComsumptionList = true;
            this.loading = false;
            this.rowIndex = null;
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    AddNewConsumption() {
        this.router.navigate(["/WardSupply/Pharmacy/ConsumptionItem"]);

    }


    ShowInternalConsumption() {
        this.router.navigate(["/WardSupply/Pharmacy/InternalConsumptionList"]);
    }

    ////This function only for show catch messages in console 
    ShowCatchErrMessage(exception) {
        if (exception) {
            this.msgBoxServ.showMessage("error", ['error please check console lo for details'])
            this.showComsumptionList = true;
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
            this.loading = false;
        }
    }


    public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

    GetInventoryBillingHeaderParameter() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
        if (paramValue)
            this.headerDetail = JSON.parse(paramValue);
        else
            this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }


    print() {
        let popupWinindow;
        var printContents = document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><style>.img-responsive{ position: relative;left: -65px;top: 10px;}.qr-code{position:relative;left: 87px;}</style><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWinindow.document.close();
    }


    close() {
        this.showReceipt = false;
        this.callback.emit({ "showreceipt": "false" });
    }


    ShowConsumptionPage() {
        this.router.navigate(['/WardSupply/Pharmacy/Consumption']);
    }
}
