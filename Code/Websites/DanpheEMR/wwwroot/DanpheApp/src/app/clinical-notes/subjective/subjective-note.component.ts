import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { SubjectiveNotesModel } from '../shared/subjective-note.model';
import { PatientClinicalDetail } from "../../clinical/shared/patient-clinical-details.vmodel";
import { NotesModel } from '../shared/notes.model';
import { Visit } from '../../appointments/shared/visit.model';
import { VisitService } from '../../appointments/shared/visit.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ICD10 } from '../../clinical/shared/icd10.model';
import { OrderItemsVM } from '../../orders/shared/orders-vms';
import { DanpheCache } from '../../shared/danphe-cache-service-utility/cache-services';
import { MasterType } from '../../shared/danphe-cache-service-utility/cache-services';

import { CommonFunctions } from '../../shared/common.functions';
import { ClinicalPrescriptionNotesModel } from '../shared/clinical-prescription-note.model';
import { OrderService } from '../../orders/shared/order.service';
import { Router } from '@angular/router';

@Component({
    selector: 'subjective-note',
    templateUrl: "./subjective-note.html"
})
export class SubjectiveNoteComponent {
    public loading: any;
    public patVisit: Visit = new Visit();
    public notes: NotesModel = new NotesModel();
    
    public subjectiveNote: SubjectiveNotesModel = new SubjectiveNotesModel;
    public allOrdItems: Array<OrderItemsVM> = [];
    public ordItemsFiltered: Array<OrderItemsVM> = [];
    public itemsType: Array<any> = [];
    public selItemType: string = "All";
    public selOrdItem: any = null;
    public ICD10List = [];
    public icd10Selected: ICD10 = null;
  
    public update: boolean = false;
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
      };
    @Input("clinical-detail")
    public clinicalDetail: PatientClinicalDetail = new PatientClinicalDetail();

    @Output("callback-subjectivenote")
    public CallBackSubjectiveNotes: EventEmitter<Object> = new EventEmitter<Object>();

    @Input("subjective-note")
    public set SubNote(data) {
      this.subjectiveNote = data;
    }
    @Input("patientVisitId")
    public patientVisitId: number;
    @Input("notesId")
    public notesId: number;
  
    @Input("prescriptionNote")
    public prescriptionNotes: ClinicalPrescriptionNotesModel = new ClinicalPrescriptionNotesModel();
  
    public showAllergyAddBox: boolean = false; //@input-allergy
    public addPastProblemBox: boolean = false;  //@input Past
    public showSurgicalAddBox: boolean = false; //@input surgery
    public showSocialAddBox: boolean = false; //@input social
    public showFamilyHistoryBox: boolean = false; ///@input family
    public empAllPreferences: Array<OrderItemsVM> = null;
    public selOrdItems: Array<OrderItemsVM> = [];
    public empPreferenceGroups: Array<any> = [];
    public SelectedOrderItems: Array<OrderItemsVM> = [];
    constructor(public changeDetector: ChangeDetectorRef,
        public visitService: VisitService,
        public msgBoxServ: MessageboxService, public http: HttpClient,public ordServ: OrderService, 
        public router: Router,) {
        this.patVisit = this.visitService.getGlobal();
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
    //-------------------Add Allergy------------------
    AddAllergyPopUp() {
        this.showAllergyAddBox = false;
        this.changeDetector.detectChanges();
        this.showAllergyAddBox = true;
    }

    CallBackAddAllergy($event) { //@output
        if ($event && $event.allergy) {
            this.clinicalDetail.Allergies.push($event.allergy);
        }
        this.showAllergyAddBox = false;
        this.changeDetector.detectChanges();
    }


    //--------------Add past Medical---------------------

    AddPastMedicalPopUp() {
        this.addPastProblemBox = false;
        this.changeDetector.detectChanges();
        this.addPastProblemBox = true;
    }

    CallBackAddPastMedical($event) { //@output
        if ($event && $event.pastMedical) {
            this.clinicalDetail.PastMedicals.push($event.pastMedical);
        }
        this.addPastProblemBox = false;
        this.changeDetector.detectChanges();
    }

    //--------------Add Surgical History---------------------
    AddSurgeryHistoryPopUp() {
        this.showSurgicalAddBox = false;
        this.changeDetector.detectChanges();
        this.showSurgicalAddBox = true;
    }

    callBackAddSurgical($event) { //@output
        if ($event && $event.surgicalHistory) {
            this.clinicalDetail.SurgicalHistory.push($event.surgicalHistory);
        }
        this.showSurgicalAddBox = false;
        this.changeDetector.detectChanges();
    }

    //--------------Add Social History---------------------
    AddSocialHistoryPopUp() {
        this.showSocialAddBox = false;
        this.changeDetector.detectChanges();
        this.showSocialAddBox = true;
    }

    CallBackAddSocialHistory($event) { //@output
        if ($event && $event.socialHistory) {
            this.clinicalDetail.SocialHistory.push($event.socialHistory);
        }
        this.showSocialAddBox = false;
        this.changeDetector.detectChanges();
    }

    //--------------Add Family History---------------------
    AddFamilyHistoryPopUp() {
        this.showFamilyHistoryBox = false;
        this.changeDetector.detectChanges();
        this.showFamilyHistoryBox = true;
    }

    CallBackAddFamilyHistory($event) { //@output
        if ($event && $event.familyHistory) {
            this.clinicalDetail.FamilyHistory.push($event.familyHistory);
        }
        this.showFamilyHistoryBox = false;
        this.changeDetector.detectChanges();
    }

    Focusit() {
        this.subjectiveNote.PatientId = this.patVisit.PatientId;
        this.subjectiveNote.PatientVisitId = this.patVisit.PatientId;
        if (this.subjectiveNote) {
            this.CallBackSubjectiveNotes.emit({ subjectivenote: this.subjectiveNote });
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
      CancelAll() {
        this.SelectedOrderItems.forEach(itm => {
          itm.IsSelected = false;
        });
    
        if (this.empAllPreferences) {
          this.empAllPreferences.forEach(itm => {
            itm.IsSelected = false;
          });
          this.CreatePreferenceGroups();
        }
    
        this.SelectedOrderItems = [];
    
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
      
  ProceedAll() {
    this.ordServ.allNewOrderItems = this.SelectedOrderItems;
    this.router.navigate(['/Doctors/PatientOverviewMain/Orders/OrderRequisition']);
  }
}
