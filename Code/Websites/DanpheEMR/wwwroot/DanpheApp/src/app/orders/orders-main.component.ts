import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OrderService } from './shared/order.service';

import { LabTest } from '../labs/shared/lab-test.model';
import { ImagingItem } from '../radiology/shared/imaging-item.model';
import { MedicationPrescription } from "../clinical/shared/medication-prescription.model";

//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service";
import { MessageboxService } from '../shared/messagebox/messagebox.service';
import { RouteFromService } from "../shared/routefrom.service";
import { PHRMPrescriptionItem } from "../pharmacy/shared/phrm-prescription-item.model";
import { DoctorsBLService } from '../doctors/shared/doctors.bl.service';
import { PatientService } from '../patients/shared/patient.service';
import { VisitService } from '../appointments/shared/visit.service';
import { Patient } from '../patients/shared/patient.model';
import { DanpheHTTPResponse } from '../shared/common-models';
import { CommonFunctions } from '../shared/common.functions';
import { OrderItemsVM } from './shared/orders-vms';
import { BillItemRequisition } from '../billing/shared/bill-item-requisition.model';

@Component({
  selector: 'my-app',
  templateUrl: "../../app/view/order-view/OrderMain.html" // "/OrderView/OrderMain"
})

// App Component class
export class OrderMainComponent {

  public Orders = { CurrentTab: "labs" };//labs is default selection.
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  validRoutes: any;
  constructor(public ordServ: OrderService, public router: Router,
    public securityService: SecurityService, public http: HttpClient,
    public msgBoxServ: MessageboxService,
    public routeFromService: RouteFromService,
    public doctorsBlService: DoctorsBLService,
    public patService: PatientService,
    public visitService: VisitService) {
    this.initialLoad();
  }
  public initialLoad() {
    //get the chld routes of ADTMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Doctors/PatientOverviewMain/Orders");
    //below three calls gives orderitems in formatted manner. 
    this.GetActiveOrders();
    this.LoadAllOrderItems();
    this.LoadAllPreferences();

    //in the mean time, load all required module's items so that we can map them later on. 
    this.ordServ.LoadAllImagingItems();
    this.ordServ.LoadAllLabTests();
    this.ordServ.LoadAllMedications();
    this.ordServ.LoadAllGenericItems();
    this.ordServ.LoadAllOtherItems();
  }



  //Start: Feature: Order and Display all Types (lab, imaging, medication) from same window


  public empAllPreferences: Array<OrderItemsVM> = null;
  public empPreferenceGroups: Array<any> = [];
  public allOrdItems: Array<OrderItemsVM> = [];
  public ordItemsFiltered: Array<OrderItemsVM> = [];
  public selOrdItem: any = null;
  public selOrdItems: Array<OrderItemsVM> = [];
  public showGenericSelection: boolean = false;
  public itemsInCurrentGeneric: Array<any> = null;
  public itemsType: Array<any> = [];
  public selItemType: string = "All";

  public currPat: Patient = new Patient();
  public otherActiveRequests: Array<BillItemRequisition> = [];
  //used to view lab report of selected test
  public labRequisitionIdList: Array<number>;
  public showLabReport: boolean = false;

  GetActiveOrders() {

    let patientId = this.patService.getGlobal().PatientId;
    let patientVisitId = this.visitService.getGlobal().PatientVisitId;
    this.doctorsBlService.GetPatientPreview(patientId, patientVisitId)
      .subscribe(res => {
        this.CallBackGetActiveOrders(res)
        this.routeFromService.RouteFrom = null;
      });

    this.doctorsBlService.GetPatientOtherRequests(patientId, patientVisitId)
      .subscribe(res => {
        this.otherActiveRequests = res.Results;
        this.routeFromService.RouteFrom = null;
      });

  }



  CallBackGetActiveOrders(res) {

    if (res.Status == "OK") {

      let retPatient: Patient = res.Results;

      var pat = this.patService.getGlobal();
      pat.PatientId = retPatient.PatientId;
      pat.FirstName = retPatient.FirstName;
      pat.LastName = retPatient.LastName;
      pat.MiddleName = retPatient.MiddleName;
      pat.ShortName = retPatient.ShortName;
      pat.Address = retPatient.Address;
      pat.PatientCode = retPatient.PatientCode;
      pat.DateOfBirth = retPatient.DateOfBirth;
      pat.CountrySubDivisionId = retPatient.CountrySubDivisionId;
      pat.Gender = retPatient.Gender;
      pat.Salutation = retPatient.Salutation;
      pat.Allergies = retPatient.Allergies;
      pat.CountrySubDivisionName = retPatient.CountrySubDivisionName;
      pat.PhoneNumber = retPatient.PhoneNumber;


      pat.Vitals = retPatient.Vitals;
      pat.Problems = retPatient.Problems;
      pat.MedicationPrescriptions = retPatient.MedicationPrescriptions;
      pat.LabRequisitions = retPatient.LabRequisitions;
      //pat.ImagingReports = retPatient.ImagingReports;
      pat.ImagingItemRequisitions = retPatient.ImagingItemRequisitions;
      this.currPat = this.patService.getGlobal();
      this.currPat["MedAllergy"] = retPatient.Allergies.filter(a => a.AllergyType == "Allergy");
      this.currPat["AdvReaction"] = retPatient.Allergies.filter(a => a.AllergyType == "AdvRec");
      this.currPat["OtherAllergy"] = retPatient.Allergies.filter(a => a.AllergyType == "Others");

    }
    else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }
  }

  LoadAllOrderItems() {
    this.http.get<any>('/api/Orders?reqType=allOrderItems', this.options).map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allOrdItems = res.Results;
          this.allOrdItems.forEach(itm => {
            itm.IsSelected = false;
            itm.FormattedName = itm.Type + "-" + itm.ItemName;
          });

          this.GenerateItemTypes();
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);
        }
      });
  }


  GenerateItemTypes() {
    let allItmsType = this.allOrdItems.map(itm => {
      return itm.PreferenceType;
    });
    this.itemsType = CommonFunctions.GetUniqueItemsFromArray(allItmsType);
    this.itemsType.unshift("All");//add default itemstype to the beginning of array.

    this.ordItemsFiltered = Object.assign([], this.allOrdItems);
  }

  ItemsTypeOnChange() {

    if (this.selItemType != "All") {
      this.ordItemsFiltered = this.allOrdItems.filter(itm => itm.PreferenceType == this.selItemType);
    }
    else {
      this.ordItemsFiltered = Object.assign([], this.allOrdItems);
    }
  }

  LoadAllPreferences() {

    this.http.get<any>('/api/Orders?reqType=empPreferences', this.options).map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.empAllPreferences = res.Results;
          this.empAllPreferences.forEach(itm => {
            itm.IsSelected = false;

          });

          this.CreatePreferenceGroups();
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);
        }
      });
  }

  orderItemsListFormatter(data: any): string {
    let isGeneric = data["IsGeneric"];
    let retHtml = "";


    if (!isGeneric) {
      let dosage = data["Dosage"];
      let freq = data["FreqInWords"];


      retHtml = data["ItemName"] + "|" + data["GenericName"] + "|" + (dosage != null && dosage != "" ? dosage : "Dose:NA") + "|" + (freq != null && freq != "" ? freq : "Frequency:NA" + " | Available Quantity: " + data["AvailableQuantity"]);
      // retHtml = "(" + data["Type"] + ")" + "<b>" + data["ItemName"] + "</b>";
    }
    else {
      retHtml = "(" + data["Type"] + ")" + data["ItemName"] + " | Available Quantity: " + data["AvailableQuantity"];
    }

    return retHtml;
  }

  OrderItemValueChanged() {
    if (this.selOrdItem && this.selOrdItem.ItemId) {
      this.showGenericSelection = false;

      //if (this.selOrdItem.IsGeneric) {
      //    let genericId = this.selOrdItem.ItemId;//if current item is generic, then genericId is its ItemId.
      //    this.itemsInCurrentGeneric = this.allOrdItems.filter(itm => itm.Type == "Medication" && itm.GenericId == genericId);

      //    this.showGenericSelection = true;
      //    this.selOrdItem = null;
      //}

      //else {

      //check if this item is present in preferences, else send dropdown selected item as parameter.
      let selItm = this.empAllPreferences ? this.empAllPreferences
        .find(itm => this.selOrdItem.ItemId == itm.ItemId && itm.Type == this.selOrdItem.Type
          && itm.IsGeneric == this.selOrdItem.IsGeneric) : null;
      //if this itm is in favourites, we need to change there as well. 
      if (!selItm) {
        selItm = this.selOrdItem;
      }

      this.AddNewItemToOrders(selItm);
      this.selOrdItem = null;
      // }
    }
  }

  PreferenceChkOnChange(item) {
    if (item.IsSelected) {
      this.AddNewItemToOrders(item);
    } else {
      this.RemoveOrderItem(item);
    }
  }

  GenericsItemOnChecked(item) {
    //check if this item is present in preferences, else send dropdown selected item as parameter.
    let prefItem = this.empAllPreferences ? this.empAllPreferences
      .find(itm => item.ItemId == itm.ItemId && itm.Type == item.Type) : null;
    //if this itm is in favourites, we need to change there as well. 
    if (!prefItem) {
      prefItem = item;
    }

    this.AddNewItemToOrders(prefItem);
    this.showGenericSelection = false;
  }

  AddNewItemToOrders(item) {

    item.IsSelected = true;
    let alreadyExists = this.selOrdItems.filter(itm => itm.Type == item.Type && itm.ItemId == item.ItemId && itm.IsGeneric == item.IsGeneric).length;
    if (!alreadyExists) {
      this.selOrdItems.unshift(item);
    }
  }

  RemoveOrderItem(item) {
    item.IsSelected = false;
    let itmIndex = this.selOrdItems.findIndex(itm => itm.Type == item.Type && itm.ItemId == item.ItemId);
    this.selOrdItems.splice(itmIndex, 1);
  }


  RemoveFromPreference_New(item) {
    this.http.delete<any>("/api/Orders?reqType=DeleteFromPreference&itemId=" + item.ItemId + "&preferenceType=" + item.PreferenceType, this.options)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          let itmIndex = this.empAllPreferences.findIndex(itm => itm.Type == item.Type && itm.ItemId == item.ItemId);
          item.IsPreference = false;
          this.empAllPreferences.splice(itmIndex, 1);
          this.CreatePreferenceGroups();

        }
        else {
          console.log("couldn't remove from favourite. Error_Message: " + res.ErrorMessage);
        }
      });
  }

  AddToPreference_New(item) {
    //chek if we can pass only data and not itemid.
    let data = JSON.stringify(item.ItemId);
    this.http.post<any>("/api/Orders?reqType=AddToPreference&itemId=" + item.ItemId + "&preferenceType=" + item.PreferenceType, data, this.options)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          //let itmIndex = this.empAllPreferences.findIndex(itm => itm.Type == item.Type && itm.ItemId == item.ItemId);
          //this.empAllPreferences.splice(itmIndex, 1);
          item.IsPreference = true;
          this.empAllPreferences.push(item);

          this.CreatePreferenceGroups();

        }
        else {
          console.log("couldn't add to favourite. Error_Message: " + res.ErrorMessage);
        }
      });

  }



  CreatePreferenceGroups() {

    if (this.empAllPreferences && this.empAllPreferences.length > 0) {
      this.empPreferenceGroups = [];
      let allTypes = this.empAllPreferences.map(itm => {
        return itm.PreferenceType;
      });
      let distTypes = CommonFunctions.GetUniqueItemsFromArray(allTypes);

      if (distTypes && distTypes.length > 0) {
        distTypes.forEach(grp => {
          this.empPreferenceGroups.push({ GroupName: grp, Items: this.empAllPreferences.filter(itm => itm.PreferenceType == grp) });
        });

      }
    }
  }


  CancelAll() {
    this.selOrdItems.forEach(itm => {
      itm.IsSelected = false;
    });

    if (this.empAllPreferences) {
      this.empAllPreferences.forEach(itm => {
        itm.IsSelected = false;
      });
      this.CreatePreferenceGroups();
    }

    this.selOrdItems = [];

  }

  ProceedAll() {
    this.ordServ.allNewOrderItems = this.selOrdItems;
    this.router.navigate(['/Doctors/PatientOverviewMain/Orders/OrderRequisition']);
  }


  printMedications() {
    this.router.navigate(['/Doctors/PatientOverviewMain/Orders/PrintMedication']);
  }
  public ViewLabReport(labRequisitionId: number) {
    this.labRequisitionIdList = [labRequisitionId];
    this.showLabReport = true;

  }
  public CloseLabReport() {
    this.labRequisitionIdList = null;
    this.showLabReport = false;

  }
  //End: Feature: Order and Display all Types (lab, imaging, medication) from same window


}

