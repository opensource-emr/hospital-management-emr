import { Component, ChangeDetectorRef } from '@angular/core'
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
@Component({
    templateUrl:"../../app/view/ward-supply-view/ConsumptionList.html"   //"/WardSupplyView/ConsumptionList"
})
export class ConsumptionListComponent {

    public consumptionListDetailsGridColumns: Array<WARDGridColumns> = []
    public consumptionListDetailsLocal = new Array<{ WardId: number, ConsumptionListByWard: Array<WardConsumptionModel> }>();    
    public consumptionListDetails: Array<WardConsumptionModel> = []
    public consumptionLists: Array<WardConsumptionModel> []
    public  loading: boolean = false;
    public showWardList: boolean = false;
    public showConsumpList: boolean = false;
    public WardId: any;
    public rowIndex: number = null;
    public showComsumptionList: boolean = true;
    public selectedItem: WardConsumptionModel = new WardConsumptionModel();
    public currentPatient: Patient = new Patient();
    dlService: DLService = null;
    http: HttpClient = null;
    public wardList: Array<WardModel> = []
    changeDetectorRef: any;
    constructor(
        _http: HttpClient,
        _dlService: DLService,
        public wardSupplyBLService: WardSupplyBLService,
        public changeDetector: ChangeDetectorRef, public router: Router,
        public msgBoxServ: MessageboxService) {
        this.http = _http;
        this.dlService = _dlService;
        this.consumptionListDetailsGridColumns = WARDGridColumns.ConsumptionDetailsList;
        this.GetwardList();
        //this.getAllComsumptionListDetails();
    }

    GetwardList() {
        try {
            this.wardSupplyBLService.GetWardList()
                .subscribe(res => {
                    if (res.Status == "OK") {
                        if (res.Results.length) {
                            this.wardList = res.Results;
                            this.WardId = this.wardList[0].WardId;
                            this.getAllComsumptionListDetails();
                        }
                        else {
                          this.msgBoxServ.showMessage("Empty", ["Ward List is not available."]);
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
                this.wardSupplyBLService.GetAllComsumptionListDetails(this.WardId)
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
                    this.showConsumpList = true;
                    this.ShowConsumptionListDetailsById(data);
                    this.SetSelectedPatientData(data);
                }
                break;
            default:
                break;
        }
    }

    ShowConsumptionListDetailsById(data) {
        let patientId = data.PatientId;
        let wardId = data.WardId;
        this.wardSupplyBLService.GetConsumptionItemList(patientId,wardId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                     
                        this.consumptionLists = res.Results;
           

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





}
