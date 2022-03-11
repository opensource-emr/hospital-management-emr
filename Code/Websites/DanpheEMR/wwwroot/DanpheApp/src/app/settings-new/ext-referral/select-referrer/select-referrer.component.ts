import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Employee } from "../../../employee/shared/employee.model";
import { CoreService } from "../../../core/shared/core.service";


@Component({
  selector: "select-referrer",
  templateUrl: "./select-referrer.html"
})

export class SelectReferrerComponent {
  @Input("selected-ref-id") selectedRefId: number = null;
  @Input("selected-ref-name") selectedRefName: string = null;
  @Input("allow-external") allowExternalRef: boolean = true;
  @Input("default-external") defaultExternal: boolean = false;
  @Input("allow-free-text") allowFreeText: boolean = false;
  
  //below property allows us to return ReferrerName from fields other than FullName of employee, eg: LongSignature in Lab.
  //default display property name is fullname.
  @Input("display-property-name") displayPropertyName: string = "FullName";
  @Input("default-referrer-info") public defaultRefInfo = { AddDefaultReferrer: false, DefaultReferrerId: null, ReferrerName: "SELF" };
  @Output("on-referrer-change") onReferrerChange: EventEmitter<object> = new EventEmitter<object>();
  @Output("on-enter-key-pressed-in-referrer") onPressedEnterKeyInRefferer: EventEmitter<object> = new EventEmitter<object>();
  public allReferrerList: Array<Employee> = [];//load all data from: get-all-referrer-list
  public filteredReferrerList: Array<Employee> = [];//at first it'll get only internal. later if checkbox is clicked then include 
  public includeExtReferrer: boolean = false;
  public isValidReferrerSelection: boolean = true;
  //public extOrIntRef: string = "(internal) ";
  constructor(public settingsBlService: SettingsBLService,
    public msgBoxServ: MessageboxService, public coreService: CoreService) {
    // this.GetAllReferrerList();

  }


  //since referrer list can come from both Server and CoreService, we needed this separate function for internal task of ExternalReferral component.
  SetReferrerListAndInitialAssign(refList: Array<Employee>) {
    if (refList && refList.length > 0) {
      this.allReferrerList = refList.filter(a => a.FullName);//takes only those where FullName is not null or empty.
      //if default referrer is required then add it according to the parameter passed from Parent Component.
      if (this.defaultRefInfo && this.defaultRefInfo.AddDefaultReferrer) {
        //add one new Employee if DefaultReferrer is set to true.
        let defEmp = new Employee();
        defEmp.EmployeeId = this.defaultRefInfo.DefaultReferrerId;
        defEmp.FullName = this.defaultRefInfo.ReferrerName;
        defEmp.IsExternal = true;
        this.allReferrerList.unshift(defEmp);
      }

      //below sequence should be 1. CheckboxOnchange and 2. InitialAssign     (Pls don't change it.)
      this.ReferrerChkBoxOnChange();
      this.Referrer_InitialAssign();
    }
  }

  //to get referrer list either from core service or from server side (using API.)
  //if hardReload=true then it'll call server, else try to load from core service.
  //default value of HardReload should be false.
  public GetAllReferrerList(hardReload: boolean) {

    if (!hardReload && this.coreService.AllReferrerList && this.coreService.AllReferrerList.length > 0) {
      this.SetReferrerListAndInitialAssign(this.coreService.AllReferrerList);
    }
    else {
      this.settingsBlService.GetAllReferrerList()
        .subscribe((res: DanpheHTTPResponse) => {
          //console.log(res);

          if (res.Status == 'OK') {
            // console.log(res.Results);
            if (res.Results.length) {
              //set the value to coreservice as well so that it doesn't go to server next time.
              this.coreService.AllReferrerList = res.Results;
              this.SetReferrerListAndInitialAssign(res.Results);
            }
          }
        },
          err => {
            this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
            console.log(err.ErrorMessage);
          });
    }

  }





  ReferrerChkBoxOnChange() {

    this.currentRequestedByDoctor = null;
    this.isValidReferrerSelection = true;

    //this.extOrIntRef = this.includeExtReferrer ? "(external) " : "(internal) ";
    if (this.allReferrerList && this.allReferrerList.length > 0) {
      if (this.includeExtReferrer) {
        this.filteredReferrerList = this.allReferrerList.filter(emp => emp.IsExternal == true);
      }
      else {
        this.filteredReferrerList = this.allReferrerList.filter(emp => emp.IsExternal == false);
      }
    }
    //we have to emit empty object when change from internal to external
    this.onReferrerChange.emit({ ReferrerId: null, ReferrerName: null });
  }


  public showExtRefPopup: boolean = false;

  ExtRefPopupOnClose($event) {

    let dataFromPopup = $event.data;
    if ($event.action == "add") {
      this.selectedRefId = dataFromPopup.ExternalReferrerId;
      this.GetAllReferrerList(true); //hardReload=true, to reload the list from server.

    }
    this.showExtRefPopup = false;
  }

  currentRequestedByDoctor: any = null;

  AssignedToDocListFormatter(data: any): string {
    return data["FullName"];
  }



  //for common requestedByDoctor in whole receipt level.
  public RequestedByDrOnChange() {
    let doctor: any = null;

    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.currentRequestedByDoctor) {
      //get the type of reqDoctor and assign the object from the list.
      if (typeof (this.currentRequestedByDoctor) == 'string' && this.filteredReferrerList.length) {
        doctor = this.filteredReferrerList.find(a => a.FullName && a.FullName.toLowerCase() == this.currentRequestedByDoctor.toLowerCase());
      }
      else if (typeof (this.currentRequestedByDoctor) == 'object') {
        doctor = this.currentRequestedByDoctor;
      }

      if (doctor) {
        this.isValidReferrerSelection = true;
        //return the value of displayPropertyname from selected employee, default is FullName.
        let retName = doctor[this.displayPropertyName] ? doctor[this.displayPropertyName] : doctor.FullName;

        this.onReferrerChange.emit({ ReferrerId: doctor.EmployeeId, ReferrerName: retName });
      }
      else {
        if (this.allowFreeText) {
          this.isValidReferrerSelection = true;
          //if freetext is allowed, then trim the result before emmitting to parent component.
          this.onReferrerChange.emit({ ReferrerId: null, ReferrerName: this.currentRequestedByDoctor.toString().trim() });
        }
        else {
          this.isValidReferrerSelection = false;
          this.onReferrerChange.emit({ ReferrerId: null, ReferrerName: null });
        }

      }
    }
    else {
      //by default, at beginning, (when currReqByDoc is empty or null or undefined),  referral selection is valid.
      this.isValidReferrerSelection = true;
      this.onReferrerChange.emit({ ReferrerId: null, ReferrerName: null });

    }


  }


  Referrer_InitialAssign() {
    if (this.allReferrerList && this.allReferrerList.length > 0) {

      //if either of SelectedRefId or RefName is given, then search for the employee(referrer) in all referrer list.
      if (this.selectedRefId || this.selectedRefName) {
        this.selectedRefName = this.selectedRefName ? this.selectedRefName : "";//making selectedrefname as empty when it's null. it crashes on tolowercase conversion when refid is there but refname is null.
        //search condition could be both Id or Name  (priority to Id since it's more accurate)
        let selRefDoc = this.allReferrerList.find(a => a.EmployeeId == this.selectedRefId || a.FullName.toLowerCase() == this.selectedRefName.toLowerCase());

        //if doc is found, then check if it's external or internal, we need to change the view accordingly.
        if (selRefDoc) {
          //if doc is external, change the source(filteredlist) to that of external.
          if (selRefDoc.IsExternal) {
            this.includeExtReferrer = true;
            this.filteredReferrerList = this.allReferrerList.filter(emp => emp.IsExternal == true);
          }
          else {
            //if doc is internal, change the source(filteredlist) to that of external.
            this.includeExtReferrer = false;
            this.filteredReferrerList = this.allReferrerList.filter(emp => emp.IsExternal == false);
          }

          this.currentRequestedByDoctor = selRefDoc.FullName;
          //once doctor is asigned, emit the selected emplyee id to parent component again. 
          this.onReferrerChange.emit({ ReferrerId: selRefDoc.EmployeeId, ReferrerName: selRefDoc.FullName });

        }
        else {
          //in case doc is not found, it could come only from allowFreeText.
          //in that case return the incoming SelectedRefName as it is. id will be null here.
          this.currentRequestedByDoctor = this.selectedRefName;
          this.onReferrerChange.emit({ ReferrerId: null, ReferrerName: this.selectedRefName });
        }
      }
      else {
        //if both refId and refName inputs are null/empty  then return a null value object.
        this.onReferrerChange.emit({ ReferrerId: null, ReferrerName: null });
      }

    }
  }



  ngOnInit() {
    //to assign default refferrer list from used modules
    this.includeExtReferrer = this.defaultExternal && this.allowExternalRef;
    this.GetAllReferrerList(false);//don't need to hard-reload since it'll get the list from coreservice if available.
  }

  //sud:27Jan'20--for default assignment testing.
  SelectDefault() {
    if (this.defaultRefInfo && this.defaultRefInfo.DefaultReferrerId) {

      let selRefDoc = this.filteredReferrerList.find(a => a.EmployeeId == this.defaultRefInfo.DefaultReferrerId);
      if (selRefDoc) {
        this.currentRequestedByDoctor = selRefDoc.FullName;
        //once doctor is asigned, emit the selected emplyee id to parent component again. 
        this.onReferrerChange.emit({ ReferrerId: selRefDoc.EmployeeId, ReferrerName: selRefDoc.FullName });
      }

    }
  }
  OnPressedEnterKeyInReferrerField(){
    this.onPressedEnterKeyInRefferer.emit();
  }
  setFocusOnReferrerForNarcoticDrug() {
    this.currentRequestedByDoctor = null;
    var Timer = setTimeout(() => {
      if (document.getElementById("currentRequestedByDoctor")) {
        let nextEl = <HTMLInputElement>document.getElementById("currentRequestedByDoctor");
        nextEl.focus();
        nextEl.select();
        clearTimeout(Timer);
      }
    }, 100)
  }

}
