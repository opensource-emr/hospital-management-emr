import { Component, Input, Output, ChangeDetectorRef, EventEmitter } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IOAllergyVitalsBLService } from "../../clinical/shared/io-allergy-vitals.bl.service";
import { SecurityService } from "../../security/shared/security.service";
import { VisitService } from "../../appointments/shared/visit.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { PatientService } from "../../patients/shared/patient.service";
import { ProblemsBLService } from "../../clinical/shared/problems.bl.service";
import { OrderService } from "../shared/order.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { DoctorsBLService } from "../../doctors/shared/doctors.bl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { OrderItemsVM } from "../shared/orders-vms";
import { CommonFunctions } from "../../shared/common.functions";
import { PatientOrderListModel } from "../../clinical/shared/order-list.model";

@Component({
  selector: "order-select",
  templateUrl: "./order-select.html"
})

export class SelectOrderComponent {

  public Orders = { CurrentTab: "labs" };//labs is default selection.
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  validRoutes: any;
  public allOrdItems: Array<OrderItemsVM> = [];
  public ordItemsFiltered: Array<OrderItemsVM> = [];
  public itemsType: Array<any> = [];
  public selOrdItem: any = null;

  @Input() selectedOrders: Array<PatientOrderListModel> = [];

  public order: PatientOrderListModel = new PatientOrderListModel();

  public medicationOrder: Array<PatientOrderListModel> = [];
  public labOrder: Array<PatientOrderListModel> = [];
  public imagingOrder: Array<PatientOrderListModel> = [];

  public allOrderList: Array<PatientOrderListModel> = [];
  public allRemovedOrderList: Array<PatientOrderListModel> = [];

  //this is as per HAMS.
  public medRouteList: Array<any> = ["mouth", "intravenous", "intramuscular", "inhalation", "vaginally", "eyes", "intravitreal injection"];


  @Input() showSelectOrder: boolean = false;
  @Output("sendBackOrders") ordersEmitter: EventEmitter<object> = new EventEmitter<object>();
  //@Output("sendRemovedOrders") removedOrdersEmitter: EventEmitter<object> = new EventEmitter<object>();
  public editMode: boolean = false;

  constructor(public router: Router,
    public securityService: SecurityService, public http: HttpClient,
    public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef,
    public routeFromService: RouteFromService,
    public doctorsBlService: DoctorsBLService,
    public patService: PatientService,
    public visitService: VisitService, public ordServ: OrderService) {
    this.initialLoad();
  }

  ngOnInit() {
    this.InitializeAllData();
    if (this.selectedOrders && this.selectedOrders.length > 0) {      
      this.editMode = true;
      this.labOrder = this.selectedOrders.filter(val => {
        if (val.Order.PreferenceType == 'Lab') {
          return true;
        }
      });
      this.medicationOrder = this.selectedOrders.filter(val => {
        if (val.Order.PreferenceType == 'Medication') {
          return true;
        }
      });
      this.imagingOrder = this.selectedOrders.filter(val => {
        if (val.Order.PreferenceType == 'Imaging') {
          return true;
        }
      });
    }

  }

  initialLoad() {
    this.LoadAllOrderItems();

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

  OrderItemsListFormatter(data: any): string {
    let retHtml = "";
    retHtml = "(" + data["Type"] + ")" + data["ItemName"];
    return retHtml;
  }

  OrderItemValueChanged() {
    if (this.order.Order.PreferenceType !== 'Medication') {

      if (this.order.Order.PreferenceType == 'Lab') {
        if (!this.IsDuplicate(this.order, this.labOrder)) {
          this.labOrder.push(this.order);
        } else {
          this.msgBoxServ.showMessage("failed", ['Sorry!! This LabOrder Already Exists.']);
        }

      } else {
        if (!this.IsDuplicate(this.order, this.imagingOrder)) {
          this.imagingOrder.push(this.order);
        } else {
          this.msgBoxServ.showMessage("failed", ['Sorry!! This ImagingOrder Already Exists.']);
        }
      }
      this.order = new PatientOrderListModel();
    }
    //this.order = new PatientOrderListModel();
  }

  AddMedication() {
    this.order.FreqInWords = this.order.Frequency + 'times /day for ' + this.order.Duration;
    if (!this.IsDuplicate(this.order, this.medicationOrder)) {
      this.medicationOrder.push(this.order);
    } else {
      this.msgBoxServ.showMessage("failed", ['Sorry!! This Medication Order Already Exists.']);
    }
    this.order = new PatientOrderListModel();
  }
  public = new PatientOrderListModel();

  IsDuplicate(singleOrder: PatientOrderListModel, allOrder: Array<PatientOrderListModel>): boolean {
    var existingIndex = allOrder.find(val => val.Order.ItemId == singleOrder.Order.ItemId);
    if (existingIndex && (existingIndex.Order.ItemId)) {
      return true;
    } else {
      return false;
    }
  }

  Close() {
    this.InitializeAllData();
    this.showSelectOrder = true;
    this.changeDetector.detectChanges();
    this.showSelectOrder = false;
    this.ordersEmitter.emit({ allorders: null, displayProp: false, submit: false, allRemovedOrders: null });
    //this.removedOrdersEmitter.emit({ allRemovedOrders: this.allOrderList, displayProp: false, submit: true });

  }


  Remove(ind: number, type: string) {
    if (type == 'Lab') {

      if (this.editMode) {
        var removedVal: any = this.labOrder.slice(ind, ind + 1);
        this.allRemovedOrderList.push(removedVal[0]);
      }

      this.labOrder.splice(ind, 1);

    } else if (type == 'Imaging') {

      if (this.editMode) {
        var removedVal: any = this.imagingOrder.slice(ind, ind + 1);
        this.allRemovedOrderList.push(removedVal[0]);
      }

      this.imagingOrder.splice(ind, 1);

    } else {

      if (this.editMode) {
        var removedVal: any = this.medicationOrder.slice(ind, ind + 1);
        this.allRemovedOrderList.push(removedVal[0]);
      }

      this.medicationOrder.splice(ind, 1);

    }
  }

  SubmitOrders() {
    this.labOrder.forEach(val => {
      this.allOrderList.push(val);
    });
    this.imagingOrder.forEach(val => {
      this.allOrderList.push(val);
    });
    this.medicationOrder.forEach(val => {
      this.allOrderList.push(val);
    });
    this.showSelectOrder = true;

    this.ordersEmitter.emit({ allorders: this.allOrderList, displayProp: false, submit: true, allRemovedOrders: this.allRemovedOrderList });
    //this.removedOrdersEmitter.emit({ allRemovedOrders: this.allOrderList, displayProp: false, submit: true });

    this.changeDetector.detectChanges();
    this.showSelectOrder = false;
    this.InitializeAllData();
  }

  InitializeAllData() {
    this.allOrderList = [];
    this.labOrder = [];
    this.medicationOrder = [];
    this.imagingOrder = [];
  }

}

