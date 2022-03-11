import { Component, ChangeDetectorRef, Input, EventEmitter, Output } from '@angular/core'  
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import { WardSupplyBLService } from './shared/wardsupply.bl.service';
import { WardInternalConsumption } from './shared/ward-internal-consumption.model';
import { MessageboxService } from '../shared/messagebox/messagebox.service';
import { CoreService } from '../core/shared/core.service';
import { SecurityService } from '../security/shared/security.service';
import { WardConsumptionModel } from './shared/ward-consumption.model';

@Component({
    selector: 'consumption-receipt',
    templateUrl: "./internal-consumption-details.html"
})
export class InternalConsumptionDetailsComponent {
    public consumptionLists: Array<any> = [];
    public consumptionListCopy: Array<any> = [];
    public DepartmentName: string = "";
    public Remark: string = "";
    public Dates: string = "";
    public Users: string = "";
    public headerDetail: any;
    public showheaderdetails = true;
    public openEditBox = false;
    public TotalConsumption: number = 0;
    public CurrentStoreId: number = 0;
    public SelecetdItemList: Array<WardConsumptionModel> = [];
    public WardConsumption: WardConsumptionModel = new WardConsumptionModel();
    public loading: boolean = false;
    public SelectedPatient: any;
    @Input("showEditBtn")
    public showEditBtn: boolean = true;

    @Input("showReceipt")
    public showReceipt: boolean = false;

    @Input("consumptionId")
    public consumptionId: number = 0;

    @Input("currentPatient")
    public currentPatient: any;


    @Input("isInternal")
    public isInternal: boolean = true;

    @Output("callback-view")
    public callback: EventEmitter<object> = new EventEmitter<Object>();

    public showEditForInternal: boolean = false;
    public showEditForConsumption: boolean = false;


    constructor(public wardSupplyBLService: WardSupplyBLService,
        public router: Router,
        public coreService: CoreService,
        public coreservice: CoreService,
        public msgBoxService: MessageboxService,
        public securityService: SecurityService) {
        try {
            this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
            if (!this.CurrentStoreId) {
                this.LoadSubStoreSelectionPage();
            }
            else {
                this.GetInventoryBillingHeaderParameter();
            }
        } catch (exception) {
            this.msgBoxService.showMessage("Error", [exception]);
        }
    }

    LoadSubStoreSelectionPage() {
        this.router.navigate(['/WardSupply']);
    }
    ngOnInit() {
        if (this.isInternal) {
            this.GetInternalConsumptionItemDetails();
            this.showEditForConsumption = false;
            this.showEditForInternal = true;
            /// this.showEditBtn = false;
        }
        else {
            this.GetConsumptionDetail(this.currentPatient);
            this.showEditForConsumption = true;
            this.showEditForInternal = false;
        }

    }

    print() {
        let popupWinindow;
        var printContents = document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><style>.img-responsive{ position: relative;left: -65px;top: 10px;}.qr-code{position:relative;left: 87px;}</style><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWinindow.document.close();
    }

    GetInternalConsumptionItemDetails() {
        this.wardSupplyBLService.GetInternalConsumptionDetails(this.consumptionId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.consumptionLists = res.Results;
                    this.consumptionListCopy = JSON.parse(JSON.stringify(this.consumptionLists));
                    this.DepartmentName = this.consumptionLists[0].Department;
                    this.Remark = this.consumptionLists[0].Remark;
                    this.Dates = this.consumptionLists[0].Date;
                    this.Users = this.consumptionLists[0].User;
                    this.TotalConsumption = this.consumptionLists.map(c => c.TotalAmount).reduce((sum, current) => sum + current);

                }
                else {
                    this.msgBoxService.showMessage("Failed", ["Something went wrong..."]);
                }
            })
    }

    public editPatientDataConsumption() {
        var isEditForbidden = this.consumptionLists.some(a => a.InvoiceId != 0)
        if (isEditForbidden) {
            this.msgBoxService.showMessage("Failed", ["Invoice already Generated. Further editing is forbidden."]);
        }
        else {
            this.showReceipt = false;
            this.openEditBox = true;
        }
    }

    editDataConsumption() {
        var isEditForbidden = this.consumptionLists;
        if (isEditForbidden) {
            this.showReceipt = false;
            this.openEditBox = true;

        }
        else {
            this.msgBoxService.showMessage("Failed", ["Invoice is already Generated. Further editing is forbidden."]);
        }
    }

    GetConsumptionDetail(data) {
        let patientId = data.PatientId;
        let wardId = data.WardId != undefined ? data.WardId : parseInt(data.WardName);
        this.wardSupplyBLService.GetConsumptionItemList(patientId, wardId, this.CurrentStoreId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.consumptionLists = res.Results;
                    this.consumptionListCopy = JSON.parse(JSON.stringify(this.consumptionLists));
                    this.Dates = this.consumptionLists[0].CreatedOn;
                    this.Users = this.consumptionLists[0].User;
                    this.Remark = this.consumptionLists[0].Remark;
                    this.TotalConsumption = this.consumptionLists.map(c => c.TotalAmount).reduce((sum, current) => sum + current);


                } else {
                    this.msgBoxService.showMessage("failed", ['Failed to get List.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxService.showMessage("error", ['Failed to get List.' + err.ErrorMessage]);
                }
            )
    }

    Close() {
        this.showReceipt = false;
        this.consumptionId = 0;
        this.consumptionLists = [];
        this.callback.emit({ "showReceipt": "false" });
    }



    GetInventoryBillingHeaderParameter() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == 'Inventory' && a.ParameterName == 'Inventory Receipt Header');
        if (paramValue && paramValue.ParameterValue)
            this.headerDetail = JSON.parse(paramValue.ParameterValue);
        else
            this.msgBoxService.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }

    CalculateInternalTotalAmount() {
        this.TotalConsumption = 0;
        this.consumptionLists.forEach(a => { a.TotalAmount = a.Quantity * a.MRP; this.TotalConsumption += a.TotalAmount; })
    }


    CalculateTotalAmount() {
        this.TotalConsumption = 0;
        this.consumptionLists.forEach(a => { a.TotalAmount = a.Quantity * a.MRP; this.TotalConsumption += a.TotalAmount; })
    }

    SaveInternal() {
        this.loading = true;
        let check = true;
        for (var j = 0; j < this.consumptionLists.length; j++) {
            if (this.consumptionLists[j].Quantity == undefined) {
                check = false;
                break;
            }
        }
        if (JSON.stringify(this.consumptionLists) === JSON.stringify(this.consumptionListCopy)) {
            check = false;
        }
        if (check) {
            this.wardSupplyBLService.PutInternalConsumptionData(this.consumptionLists)
                .finally(()=>{
                    this.showReceipt = true;
                    this.openEditBox = false;
                    this.loading = false;
                })
                .subscribe(res => {
                    if (res.Status == "OK" && res.Results != null) {
                        this.msgBoxService.showMessage("Success", [' Intrenal Consumption completed']);
                        this.consumptionListCopy = JSON.parse(JSON.stringify(this.consumptionLists));
                    }
                    else if (res.Status == "Failed") {
                        this.msgBoxService.showMessage("Error", ['There is problem, please try again']);
                        this.consumptionLists = JSON.parse(JSON.stringify(this.consumptionListCopy));
                    }
                },
                err => {
                    this.msgBoxService.showMessage("Error", [err.error.ErrorMessage]);
                    this.consumptionLists = JSON.parse(JSON.stringify(this.consumptionListCopy));
                });
        }
        else {
            this.loading = false;
            this.msgBoxService.showMessage("Failed", ["No changes found"]);
            this.openEditBox = false;
            this.showReceipt = true;
        }
    }

    Save() {
        this.loading = true;
        let check = true;
        for (var j = 0; j < this.consumptionLists.length; j++) {
            if (this.consumptionLists[j].Quantity == undefined) {
                check = false;
                break;
            }
        }
        if (JSON.stringify(this.consumptionLists) === JSON.stringify(this.consumptionListCopy)) {
            check = false;
        }
        if (check) {
            this.wardSupplyBLService.PutConsumptionData(this.consumptionLists)
                .finally(()=>{
                    this.showReceipt = true;
                    this.openEditBox = false;
                    this.loading = false;
                })
                .subscribe(res => {
                    if (res.Status == "OK" && res.Results != null) {
                        this.msgBoxService.showMessage("Success", ['Consumption completed']);
                        this.consumptionListCopy = JSON.parse(JSON.stringify(this.consumptionLists));
                    }
                    else if (res.Status == "Failed") {
                        this.consumptionLists = JSON.parse(JSON.stringify(this.consumptionListCopy));
                        this.msgBoxService.showMessage("Error", ['There is problem, please try again']);
                    }
                },
                err => {
                    this.msgBoxService.showMessage("Error", [err.error.ErrorMessage]);
                    this.consumptionLists = JSON.parse(JSON.stringify(this.consumptionListCopy));
                });
        }
        else {
            this.loading = false;
            this.msgBoxService.showMessage("Failed", ["No changes found"]);
            this.openEditBox = false;
            this.showReceipt = true;
        }

    }
}
