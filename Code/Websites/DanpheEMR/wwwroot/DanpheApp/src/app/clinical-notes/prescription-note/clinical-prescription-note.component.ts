import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { HistoryBLService } from '../../clinical/shared/history.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ClinicalSubjectivePrescriptionNotes } from "../shared/subjective-note.model";
import { ClinicalPrescriptionNotesModel } from '../shared/clinical-prescription-note.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OrderItemsVM } from '../../orders/shared/orders-vms';
import { CommonFunctions } from '../../shared/common.functions';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { ICD10 } from '../../clinical/shared/icd10.model';

@Component({
  selector: 'clinical-prescription-note',
  templateUrl: "./clinical-prescription-note.html"
})
export class ClinicalPrescriptionNoteComponent {
  public select = [
    { id: 1, name: "Provisional" },
    { id: 2, name: "Final" }
  ];
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public loading = false;
  @Input("patientVisitId")
  public patientVisitId: number;
  @Input("notesId")
  public notesId: number;

  @Input("prescriptionNote")
  public prescriptionNotes: ClinicalPrescriptionNotesModel = new ClinicalPrescriptionNotesModel();

  public medicationPrescriptions: any;

  public allOrdItems: Array<OrderItemsVM> = [];
  public ordItemsFiltered: Array<OrderItemsVM> = [];
  public itemsType: Array<any> = [];
  public selItemType: string = "All";
  public selOrdItem: any = null;
  public ICD10List = [];
  public icd10Selected: ICD10 = null;

  public update: boolean = false;


  constructor(public changeDetector: ChangeDetectorRef, public historyBLService: HistoryBLService, public msgBoxServ: MessageboxService, public http: HttpClient) {
    this.LoadAllOrderItems();
    this.GetICDList();
  }

  ngOnInit() {
    if (this.notesId) {
      this.update = true;

      if (this.prescriptionNotes && this.prescriptionNotes.ICDSelected && this.prescriptionNotes.ICDSelected.trim().length) {
        this.prescriptionNotes.ICDList = JSON.parse(this.prescriptionNotes.ICDSelected);
      } else {
        this.AddNewICDRow();
      }

      if (this.prescriptionNotes && this.prescriptionNotes.OrdersSelected && this.prescriptionNotes.OrdersSelected.trim().length) {
        this.prescriptionNotes.SelectedOrderItems = JSON.parse(this.prescriptionNotes.OrdersSelected);
      }

    } else {
      this.AddNewICDRow();
      this.update = false
    }   
  }

  public GetICDList() {
    this.ICD10List = DanpheCache.GetData(MasterType.ICD, null);
  }

  LoadAllOrderItems() {
    this.http.get<any>('/api/Orders?reqType=allOrderItems', this.options).map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allOrdItems = res.Results.filter(d => d.PreferenceType.toLowerCase() != 'medication');

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
    if (this.selItemType && (this.selItemType != "All")) {
      this.ordItemsFiltered = this.allOrdItems.filter(itm => itm.PreferenceType.toLowerCase() == this.selItemType.toLowerCase());
    }
    else {
      this.ordItemsFiltered = Object.assign([], this.allOrdItems);
    }
  }

  OrderItemValueChanged() {
    if (this.selOrdItem && this.selOrdItem.ItemId) {
      let oditem = Object.assign({}, this.selOrdItem);
      this.AddNewItemToOrders(oditem);
    }
    this.changeDetector.detectChanges();
    this.selOrdItem = '';
  }

  AddNewItemToOrders(item) {
    item.IsSelected = true;
    let alreadyExists = this.prescriptionNotes.SelectedOrderItems.filter(itm => itm.Type == item.Type && itm.ItemId == item.ItemId).length;
    if (!alreadyExists) {
      this.prescriptionNotes.SelectedOrderItems.unshift(item);
    }
  }

  RemoveOrderItem(item) {
    item.IsSelected = false;
    let itmIndex = this.prescriptionNotes.SelectedOrderItems.findIndex(itm => itm.Type == item.Type && itm.ItemId == item.ItemId);
    this.prescriptionNotes.SelectedOrderItems.splice(itmIndex, 1);
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


 ICDListFormatter(data: any): string {
    let html;
    //if the ICD is not valid for coding then it will be displayed as bold.
    //needs to disable the field that are not valid for coding as well.
    if (!data.ValidForCoding) {
      html = "<b>" + data["ICD10Code"] + "  " + data["ICD10Description"] + "</b>";
    }
    else {
      html = data["ICD10Code"] + "  " + data["ICD10Description"];
    }
    return html;
  }


  public DeleteRow(ind: number) {
    this.prescriptionNotes.ICDList.splice(ind, 1);
  }

  public AddNewICDRow() {
    let newicd: ICD10 = Object.assign({},new ICD10());
    newicd.ICD10Description = '';
    this.prescriptionNotes.ICDList.push(newicd);

    let new_index = this.prescriptionNotes.ICDList.length - 1;
    if (new_index > 0) {
      window.setTimeout(function () {
        let itmNameBox = document.getElementById('icd10-box' + new_index);
        if (itmNameBox) {
          itmNameBox.focus();
        }
      }, 500);
    }
  }



}
