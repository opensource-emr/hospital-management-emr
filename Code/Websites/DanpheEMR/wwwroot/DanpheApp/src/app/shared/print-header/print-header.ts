import { Component, Input } from "@angular/core"
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from "../messagebox/messagebox.service";

@Component({
    selector: "print-header",
    templateUrl: "./print-header.html",

})


export class PrintHeaderComponent {
  public headerDetail: any;

  @Input("unit-name") unitname: string = "PHARMACY UNIT";
  @Input("show-pan-number") showPANNo : boolean = true;
  @Input("show-phone-number") showPhoneNo : boolean = true;

  @Input("report-for")
  public reportFor:string = '';
  public isLabReport:boolean = false; 
  public isBillingReport:boolean = false;
  public isSystemAdminReport : boolean = false;
  public isMRReport : boolean = false;
  public isADTReport : boolean = false;


  constructor(public coreService: CoreService,
    public msgBoxServ: MessageboxService) {
    // this.GetHeaderParameter();
  }
  ngOnInit(){
    this.GetHeaderParameter();
  }
  //Get customer Header Parameter from Core Service (Database) assign to local variable
  GetHeaderParameter() {
    if(this.reportFor == "billing"){
      this.isBillingReport = true;
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
    else if(this.reportFor == "lab"){
      this.isLabReport = true;
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
    else if(this.reportFor == "adt"){
      this.isADTReport = true;
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
    //This is For MR Report.
    else if(this.reportFor == "MRReport"){
      this.isMRReport = true;
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for MR-Report Header"]);
    }

    else if(this.reportFor == "systemadmin"){
      this.isSystemAdminReport = true;
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
    else if(this.reportFor == "admission"){
      this.isLabReport = true;
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
    else if(this.reportFor == "appointent"){
      this.isLabReport = true;
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }

    else{
    var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Pharmacy" && a.ParameterName == "Pharmacy Receipt Header").ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for Pharmacy Receipt Header"]);
    }
  }


}
