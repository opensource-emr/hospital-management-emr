import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from "@angular/core";
// import { SubjectiveNotesModel } from '../shared/subjective-note.model';
// import { PatientClinicalDetail } from "../../clinical/shared/patient-clinical-details.vmodel";
// import { NotesModel } from '../shared/notes.model';

import { VisitService } from "../../appointments/shared/visit.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ICD10 } from "../../clinical/shared/icd10.model";
import { OrderItemsVM } from "../../orders/shared/orders-vms";
import { DanpheCache } from "../../shared/danphe-cache-service-utility/cache-services";
import { MasterType } from "../../shared/danphe-cache-service-utility/cache-services";

import { CommonFunctions } from "../../shared/common.functions";
import { PatientVisitNoteModel } from "../shared/clinical-patient-visit-note.model";
import { Visit } from "../../appointments/shared/visit.model";
import { IOAllergyVitalsBLService } from "../shared/io-allergy-vitals.bl.service";
import { Router } from "@angular/router";
import { PatientVisitProcedureModel } from "../shared/clinical-patient-visit-procedure.model";
// import { ClinicalPrescriptionNotesModel } from '../shared/clinical-prescription-note.model';
// import { OrderService } from '../../orders/shared/order.service';
// import { Router } from '@angular/router';

@Component({
  templateUrl: "./patient-visit-notes.component.html",
})
export class PatientVisitNoteComponent {
  public ProcedureList: Array<PatientVisitProcedureModel> = [];
  public loading: any;
  public patientVisitNote: PatientVisitNoteModel = new PatientVisitNoteModel();
  public patVisit: Visit = new Visit();
  public ICD10List = [];
  public icd10Selected: ICD10 = new ICD10();
  public ProcedureSourceList= [];
  public procedureSelected:PatientVisitProcedureModel= new PatientVisitProcedureModel();
  public update: boolean = false;
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };
  

  public showPage:boolean=false;
  public showVisitNoteViewPage:boolean=false;
  constructor(
    public changeDetector: ChangeDetectorRef,
    public visitService: VisitService,
    public IOAllergeBLService: IOAllergyVitalsBLService,
    public msgBoxServ: MessageboxService,
    public http: HttpClient,
  public router: Router)
  {
    this.patientVisitNote= new PatientVisitNoteModel();
    this.patVisit = this.visitService.getGlobal();
    this.GetICDList();
    this.GetProcedureList();
    if (this.patVisit.PatientVisitId) {
      this.GetPatientVisitProceduresByVisitId();
      this.GetPatientVisitNoteByVisitId();
    }
    console.log("in constructor method");
  }
 

  public GetICDList() {
    this.ICD10List = DanpheCache.GetData(MasterType.ICD, null);

  }
  public GetProcedureList(){
    this.ProcedureSourceList=DanpheCache.GetData(MasterType.ProcedureBillItemPrices,null);
  }
  //Get patient visit note from database
  GetPatientVisitNoteByVisitId(): void {
      this.IOAllergeBLService.GetPatientVisitNote(this.patVisit.PatientVisitId, this.patVisit.PatientId )
      .subscribe((res) => {
        if (res.Status == "OK") {
          this.update=true;
          this.patientVisitNote =Object.assign(this.patientVisitNote,res.Results);
          this.UpdateICDDetails();
        } else if (res.Status == "Failed") {
            this.update=false;
            this.patientVisitNote= new PatientVisitNoteModel();
            this.UpdateICDDetails();
        } else {
            this.update=false;
            this.msgBoxServ.showMessage( "failed",  ["Dont have visit note"],  res.ErrorMessage  );
        }
        
      },
                
      err => { this.msgBoxServ.showMessage("error", [err]); });
     
   
    }
    //Get patient visit Procedures from database
  GetPatientVisitProceduresByVisitId(): void {
    this.IOAllergeBLService.GetPatientVisitProcedures(this.patVisit.PatientVisitId, this.patVisit.PatientId )
    .subscribe((res) => {
      if (res.Status == "OK") {
        this.update=true;
        this.ProcedureList=Object.assign(this.ProcedureList,res.Results); 
      } else if (res.Status == "Failed") {
          this.patientVisitNote= new PatientVisitNoteModel();
      } else {
          
          this.msgBoxServ.showMessage( "failed",  ["Dont have procedures note"],  res.ErrorMessage  );
      }
    },
              
    err => { this.msgBoxServ.showMessage("error", [err]); });
   
 
  }
    
   public UpdateICDDetails() {
        if (this.patientVisitNote.PatientVisitNoteId >0) {
          this.update = true;
          if (this.patientVisitNote && this.patientVisitNote.Diagnosis && this.patientVisitNote.Diagnosis.trim().length) {
            this.patientVisitNote.ICDList = JSON.parse(this.patientVisitNote.Diagnosis);
          } 
          this.showPage=true;
          this.changeDetector.detectChanges();
        } else {
          this.update = false
          this.showPage=true;
          this.changeDetector.detectChanges();
        }   
      }
    
      
    public DeleteRow(ind: number) {
        this.patientVisitNote.ICDList.splice(ind, 1);
      }
   public ICDListFormatter(data: any): string {
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
    public AssignSelectedICD() {
         if(this.icd10Selected.ICD10Code != null){
        if (typeof (this.icd10Selected) == 'object' && this.icd10Selected.ICD10Description.length > 0) {
          this.changeDetector.detectChanges();
          this.patientVisitNote.ICDList.push(this.icd10Selected);
           
        }
      }
    }
    public DeleteRowProcedure(ind: number) {
      if(this.ProcedureList[ind].PatientVisitProcedureId >0)
      {
        this.ProcedureList[ind].IsActive=false;
      }else{
        this.ProcedureList.splice(ind, 1);
      }
    }
   public ProcedureListFormatter(data: any): string {
      let htmlProc;
        htmlProc = "<b>" + data["ItemName"] +  "</b>";
      return htmlProc;
    }
    public AssignSelectedProcedure() {
      if(this.procedureSelected.ItemName != null){
     if (typeof (this.procedureSelected) == 'object' && this.procedureSelected.ItemName.length > 0) {
       this.changeDetector.detectChanges();
       let isExist=this.ProcedureList.find(itm=> itm.BillItemPriceId ==this.procedureSelected.BillItemPriceId);
       if(isExist){
        let indx=this.ProcedureList.findIndex(i=> i.BillItemPriceId==this.procedureSelected.BillItemPriceId);
        this.ProcedureList[indx].IsActive=true;
      }else{
        let patProce= new PatientVisitProcedureModel();
        patProce.IsActive=true;
        patProce.ItemName=this.procedureSelected.ItemName;
        patProce.BillItemPriceId=this.procedureSelected.BillItemPriceId;
        patProce.PatientId=this.patVisit.PatientId;
        patProce.PatientVisitId=this.patVisit.PatientVisitId;
        patProce.ProviderId=this.patVisit.ProviderId;
        patProce.Status="pending";
        this.ProcedureList.push(patProce);
      }
     }
   }
    }
    UpdatePatientVisitNote(){
        this.UpdateNoteDetails();
        this.AddUpdatePatientVisitProcedures();
        this.IOAllergeBLService.PutPatientVisitNote(this.patientVisitNote)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("Success", ["Visit note saved successfully."]);
          }
          else {
            this.msgBoxServ.showMessage("Failed", ["Error in Posting Visit Note"]);
            console.log(res.ErrorMessage);
          }
        });
    }
    AddUpdatePatientVisitProcedures(){
      this.IOAllergeBLService.PostPatientVisitProcedures(this.ProcedureList)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Procedure saved successfully."]);
          this.changeDetector.detectChanges();
          this.ProcedureList= new Array<PatientVisitProcedureModel>();
          this.ProcedureList=Object.assign(this.ProcedureList,res.Results);
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Procedure save Note"]);
          console.log(res.ErrorMessage);
        }
      });
  }
    AddPatientVisitNote(){
        this.UpdateNoteDetails()
        this.AddUpdatePatientVisitProcedures();
        this.IOAllergeBLService.PostPatientVisitNote(this.patientVisitNote)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("Success", ["Visit note saved successfully."]);
            this.PrintVisitNote();//navigate to view part
          }
          else {
            this.msgBoxServ.showMessage("Failed", ["Error in Posting Visit Note"]);
            console.log(res.ErrorMessage);
          }
        });
    }
    UpdateNoteDetails(){
        this.patientVisitNote.Diagnosis='';
        this.patientVisitNote.Diagnosis=(this.patientVisitNote.ICDList.length >0)?
         JSON.stringify(this.patientVisitNote.ICDList):'';
         
            this.patientVisitNote.ProviderId=this.patVisit.ProviderId;
            this.patientVisitNote.PatientId=this.patVisit.PatientId;
            this.patientVisitNote.PatientVisitId=this.patVisit.PatientVisitId;
            this.patientVisitNote.IsActive=true;
         
         

    }
    PrintVisitNote(){
        this.router.navigate(['/Doctors/PatientOverviewMain/Clinical/PatientVisitNoteView']);
    }
    ngDoCheck() {
      this.changeDetector.detectChanges();
    }
   
  
    
  
  

}
