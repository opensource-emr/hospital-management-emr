import { Component, Input, Output, EventEmitter, Renderer2 } from '@angular/core'
import { BillingTransactionItem } from '../shared/billing-transaction-item.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { CommonFunctions } from '../../shared/common.functions';
import { ENUM_PriceCategory } from '../../shared/shared-enums';
import { CoreService } from '../../../../src/app/core/shared/core.service';


@Component({
    selector: 'edit-bill-item-doc-price',
    templateUrl: "./update-item-doc-pricecategory.html"
})
export class EditBillItemDocPriceComponent {
    public abc: number = 0;

    @Input("itemToEdit")
    itemToEdit_Input: BillingTransactionItem = null;

    public itemToEdit: BillingTransactionItem = null;

    public itemMasterList: Array<any> = [];


    @Input("DoctorsList")
    doctorList: Array<any> = null;

    @Output("on-closed")
    public onClose = new EventEmitter<object>();

    @Output("on-item-updated")
    public onItemUpdated = new EventEmitter<object>();

    //sud: 11sept: This is kept for testing purpose, 
    globalListenFunc: Function;

    public docDDLSource: Array<any> = null;

    //for doctor's list binding.
    public requestingDoctor: any;
    public referrer:any;
    public referrerList: any;

    constructor(public renderer: Renderer2,
        public billingBlService: BillingBLService,
        public msgBoxService: MessageboxService,
        private coreService:CoreService) {

            this.referrerList = this.coreService.AllReferrerList;
    }

    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
    //EHSPrice: 920
    //ForeignerPrice: 2400
    //GovtInsurancePrice: 0
    //IsDoctorMandatory: false
    //ItemId: 15
    //ItemName: "LDH"
    //NormalPrice: 800
    //Price: 1200
    //ProcedureCode: null
    //SAARCCitizenPrice: 1200


    public currItemFromMaster;

    public currItemsPricesByCategory = { IsLoaded: false, NormalPrice: 0, EHSPrice: 0, ForeignerPrice: 0, GovtInsurancePrice: 0, SAARCCitizenPrice: 0 };

    ngOnInit() {
        if (this.itemToEdit_Input) {
            console.log(this.itemToEdit_Input);//remove this soon.. (sud)

            this.itemMasterList = this.itemToEdit_Input.ItemList;
            this.currItemFromMaster = this.itemMasterList.find(a => a.ServiceDepartmentId == this.itemToEdit_Input.ServiceDepartmentId && a.ItemId == this.itemToEdit_Input.ItemId);

            this.itemToEdit = Object.assign({}, this.itemToEdit_Input);
            if (this.doctorList) {
                this.docDDLSource = this.doctorList;
                this.requestingDoctor = null;
                this.requestingDoctor = { EmployeeId: null, FullName: null };
                this.referrer = {EmployeeId:null, FullName: null};
                this.requestingDoctor["EmployeeId"] = this.itemToEdit.PrescriberId;
                let doctor = this.doctorList.find(a => a.EmployeeId == this.itemToEdit.PrescriberId);
                if(doctor){
                    this.requestingDoctor["FullName"] = doctor.FullName;
                }else{
                    this.requestingDoctor["FullName"] = null;
                }

                this.referrer["EmployeeId"] = this.itemToEdit.ReferredById;
                let referrer = this.referrerList.find(a => a.EmployeeId == this.itemToEdit.ReferredById);
                if(referrer){
                    this.referrer["FullName"] = referrer.FullName;
                }else{
                    this.referrer["FullName"] = null;
                }
               
            }
        }

        this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
                this.onClose.emit({ CloseWindow: true, EventName: "close" });
            }
        });
        //console.log("from edit item component.");
        //console.log(this.docDDLSource);
    }

    ngOnDestroy() {
        // remove listener
        this.globalListenFunc();
    }

    CloseItemEdit($event) {
        this.onClose.emit({ CloseWindow: true, EventName: "close" });
    }


    SaveItem() {
        this.onItemUpdated.emit(this.itemToEdit);

    }


    AssignedToDocListFormatter(data: any): string {
        return data["FullName"];
    }

    ReferrerListFormatter(data: any): string {
        return data["FullName"];
    }

    AssignSelectedDoctor() {
        if (this.requestingDoctor != null && typeof (this.requestingDoctor) == 'object') {
            this.itemToEdit.PrescriberId = this.requestingDoctor.EmployeeId;
            this.itemToEdit.PrescriberName = this.requestingDoctor.FullName;
        }
        else {
            this.itemToEdit.PrescriberId = null;
            this.itemToEdit.PrescriberName = "SELF";
        }
        //console.log(this.requestingDoctor);
    }
    AssignReferrer(){
        if (this.referrer != null && typeof (this.referrer) == 'object') {
            this.itemToEdit.ReferredById = this.referrer.EmployeeId;
        }
        else {
            this.itemToEdit.ReferredById = null;
        }
    }

    OnPriceCategoryChange() {

      if (this.itemToEdit.PriceCategory == ENUM_PriceCategory.EHS) {// "EHS"
            this.itemToEdit.Price = this.currItemFromMaster.EHSPrice;
        }
      else if (this.itemToEdit.PriceCategory == ENUM_PriceCategory.Foreigner ) {//"Foreigner"
            this.itemToEdit.Price = this.currItemFromMaster.ForeignerPrice;
        }
      else if (this.itemToEdit.PriceCategory == ENUM_PriceCategory.SAARCCitizen ) {//"SAARCCitizen"
            this.itemToEdit.Price = this.currItemFromMaster.SAARCCitizenPrice;
        }
      else if (this.itemToEdit.PriceCategory == ENUM_PriceCategory.Normal ) {//"Normal"
            this.itemToEdit.Price = this.currItemFromMaster.NormalPrice;
        }

    }

    // getAllReferrerList(){
    //     this.settingsBlService.GetAllReferrerList()
    //     .subscribe((res: DanpheHTTPResponse) => {
    //       //console.log(res);

    //       if (res.Status == 'OK') {
    //         // console.log(res.Results);
    //         if (res.Results.length) {
    //           //set the value to coreservice as well so that it doesn't go to server next time.
    //           this.coreService.AllReferrerList = res.Results;
    //           this.SetReferrerListAndInitialAssign(res.Results);
    //         }
    //       }
    //     },
    //       err => {
    //         this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
    //         console.log(err.ErrorMessage);
    //       });
    // }
}

