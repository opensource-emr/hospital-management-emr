import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs-compat';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';
import { BillItemPriceVM } from '../../billing/shared/billing-view-models';
import { OpdServiceItemPrice_DTO } from '../../billing/shared/dto/opd-serviceitem-price.dto';
import { RegistrationScheme_DTO } from '../../billing/shared/dto/registration-scheme.dto';
import { Visit } from "../shared/visit.model";
import { Rank_ApfHospital } from '../visit/visit-patient-info.component';
import { FreeVisitSettings_DTO } from './dto/free-visit-settings.dto';

@Injectable()
export class VisitService {
  globalVisit: Visit = new Visit();
  public appointmentType: string = "New";
  public PriceCategory: string = "Normal";//sud:26June'19-- this is needed across NewVisit, FollowupVisit and Referral Visits etc..
  public ClaimCode: number;//sud:1-oct'21: Changed datatype from String to Number in all places
  public RankList: Rank_ApfHospital[];
  public CreateNewGlobal(): Visit {
    this.globalVisit = new Visit();
    return this.globalVisit;
  }
  public getGlobal(): Visit {
    return this.globalVisit;
  }


  // Observable string sources
  public billChangedEvent = new Subject<any>();
  public ObserveBillChanged = this.billChangedEvent.asObservable();
  public TriggerBillChangedEvent(newBill) {
    this.billChangedEvent.next(newBill);
  }

  // Observable string sources
  public schemeChangedEvent = new Subject<RegistrationScheme_DTO>();
  public freeVisitSettingsEvent = new Subject<FreeVisitSettings_DTO>();
  public ObserveSchemeChangedEvent(): Observable<RegistrationScheme_DTO> {
    return this.schemeChangedEvent.asObservable();
  }
  public TriggerSchemeChangeEvent(regSchemeDto: RegistrationScheme_DTO) {
    this.schemeChangedEvent.next(regSchemeDto);
  }


  public patientAgeChangeEvent = new Subject<number>();
  public ObservePatientAgeChangeEvent(): Observable<number> {
    return this.patientAgeChangeEvent.asObservable();
  }
  public TriggerPatientAgeChangeEvent(age: string) {
    this.patientAgeChangeEvent.next(+age);
  }

  public ObserveFreeVisitCheckboxChangedEvent(): Observable<FreeVisitSettings_DTO> {
    return this.freeVisitSettingsEvent.asObservable();
  }
  public TriggerFreeVisitCheckboxChangeEvent(freeVisitSettings: FreeVisitSettings_DTO) {
    this.freeVisitSettingsEvent.next(freeVisitSettings);
  }

  //sud: 25June'19-- below contains all common data neeeded in visits.
  // These values are loaded from appointment-main component and are used across the appointment module.
  public DocOpdPrices: Array<OpdServiceItemPrice_DTO> = [];
  public DocFollowupPrices: Array<OpdServiceItemPrice_DTO> = [];
  public DocOpdPrice_OldPatient: Array<OpdServiceItemPrice_DTO> = [];
  public DocOpdPrice_Referral: Array<OpdServiceItemPrice_DTO> = [];

  public DeptOpdPrices = [];
  public DeptFollowupPrices = [];
  public DeptOpdPrice_OldPatient = [];


  public ApptApplicableDepartmentList = [];
  public ApptApplicableDoctorsList = [];
  public allBillItemsPriceList = [];

  //this stores information of previous visit in case of visit-continuation.
  //applicable for followup, transfer, refer etc. now used only for followup.
  public ParentVisitInfo: any = null;
  //in case of Transfer previous bill needs to be returned.. so we're pulling that invoice and assigning to below property.
  public ParentVisitInvoiceDetail: BillingTransaction = new BillingTransaction();


  public PatientTodaysVisitList: Array<Visit> = [];//sud:13July'19--to check if patient already has visit with same provider or department today.


  //sud:13July'19-- for testing purpose, if this works then use it to clear the variables from Visit Service.
  public ClearPublicVariables() {
    this.ParentVisitInfo = null;
    this.ParentVisitInvoiceDetail = null;
    this.PatientTodaysVisitList = null;
  }


  //sud:13July'19-- To check the duplicate visit in client side itself.
  public HasDuplicateVisitToday(patientId: number, departmentId: number, doctorId: number, todaysVisitList: Array<Visit>): boolean {
    let hasDuplicate = false;

    if (todaysVisitList && todaysVisitList.length > 0) {

      //let sameDeptCount = todaysVisitList.filter(v => v.PatientId == patientId &&  v.DepartmentId == departmentId);

      //for now check only for Same doctor, If same department also needs validation, then we can simply check sameDeptCount.
      if (doctorId && this.globalVisit.BillingStatus != "returned") {
        let sameDoctCount = todaysVisitList.filter(v => v.PatientId == patientId && v.PerformerId == doctorId);
        if (sameDoctCount.length > 0) {
          hasDuplicate = true;
        }
      }
    }

    return hasDuplicate;


  }

  public LoadAllBillItemsPriceList(billItms: Array<BillItemPriceVM>) {
    this.allBillItemsPriceList = billItms;
  }

  public SetAllRank(items: Array<Rank_ApfHospital>) {
    this.RankList = items;
  }
}
