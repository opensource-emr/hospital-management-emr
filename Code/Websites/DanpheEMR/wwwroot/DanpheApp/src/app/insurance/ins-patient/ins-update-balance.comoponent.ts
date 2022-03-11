import { Component, Input, Output, EventEmitter,Renderer2 } from "@angular/core";
import {InsuranceBlService} from '../../insurance/shared/insurance.bl.service'
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { InsuranceVM } from '../../billing/shared/patient-billing-context-vm';
import { InsuranceService } from "../shared/ins-service";

import { NumericDictionary } from "lodash";
import { CoreService } from "../../core/shared/core.service";

@Component({
  selector: 'gov-insurance-update-balance',
  templateUrl: './ins-update-balance.component.html'
})

export class GovInsUpdateBalanceComponent {

  //public currencyUnit: string;
  public updatedBalance: number = 0;
  public loading:boolean=false;
  public maxInsuranceBalanceLimit:number=0;

  @Input("gov-insurance-detail")
  public insuraceDetail: InsuranceVM = new InsuranceVM();

  @Output("callback-update-balance")
  callBackUpdateBalance: EventEmitter<Object> = new EventEmitter<Object>();
  @Input("popup-action")
  popupAction: string = "add";//add or edit.. logic will change accordingly.

  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
  constructor(
    public msgBoxServ: MessageboxService,
    public insuranceBlService: InsuranceBlService,
    public insuranceService: InsuranceService,
    public renderer: Renderer2, public coreService:CoreService) {
    //this.currencyUnit = this.insuranceService.currencyUnit;
    let param= this.coreService.Parameters.find(p=> p.ParameterGroupName=="Insurance" && p.ParameterName=="MaxInsuranceAmtLimit");
    if(param){
      this.maxInsuranceBalanceLimit=param.ParameterValue;
    }
    this.setFocusById('insuranceBalance');
  }
  ngOnInit() {
    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        //this.onClose.emit({ CloseWindow: true, EventName: "close" });
        this.ClosePopup() 
      }
    });
  this.setFocusById('insuranceBalance');
  
  }
  globalListenFunc: Function;
  ngOnDestroy() {
    // remove listener
    this.globalListenFunc();
  }
setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }
  SubmitUpdateInsuranceBalance() {   
    this.loading=true; 
    let flag= this.checkValidation();   
    if (flag) {
      //calling BLServices with three parameters 
      this.insuranceBlService.UpdateInsBalance(this.insuraceDetail.PatientId, this.insuraceDetail.InsuranceProviderId, this.updatedBalance,this.insuraceDetail.Remark)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.callBackUpdateBalance.emit({ action: "balance-updated", UpdatedBalance: this.updatedBalance, PatientId: this.insuraceDetail.PatientId});
            this.msgBoxServ.showMessage("success", ["Insurance Balance of " + this.coreService.currencyUnit + this.updatedBalance + " Updated successfully."]);
           // this.showInsBalanceUpdate = false;
           this.loading=false;
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Cannot complete the transaction."]);
            this.loading=false;
          }
        });
    }else
    {
      this.loading=false;
    }    
  }

  checkValidation(){
     let isValid=true;
     if(!this.insuraceDetail.Remark) {
      this.msgBoxServ.showMessage("error",['remarks required']);
      isValid=false;
    }
    if(!this.updatedBalance || this.updatedBalance < 0){
      this.msgBoxServ.showMessage("error",['Balance Amount required']);
      isValid=false;
    }
    else if(this.updatedBalance && this.updatedBalance > this.maxInsuranceBalanceLimit ){
      this.msgBoxServ.showMessage("error",['maximum allowed insurance amount is '+ this.maxInsuranceBalanceLimit]);
      isValid=false;
    } 
    return isValid;

  }

  ClosePopup() {

    this.callBackUpdateBalance.emit({action:"close", insuranceBalance: this.updatedBalance });

  }


}
