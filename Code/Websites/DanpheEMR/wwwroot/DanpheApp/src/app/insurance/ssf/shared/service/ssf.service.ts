import { Injectable } from "@angular/core";
import * as moment from "moment";
import { Subject } from "rxjs-compat";
import { VisitBLService } from "../../../../appointments/shared/visit.bl.service";
import { PatientScheme } from "../../../../billing/shared/patient-map-scheme";
import { DanpheHTTPResponse } from "../../../../shared/common-models";
import { ENUM_DanpheHTTPResponses, ENUM_DateFormats } from "../../../../shared/shared-enums";
import { SSFEligibility, SsfEmployerCompany } from "../SSF-Models";
import { SSFPatientDetailFromSsfServer_DTO } from "../ssf-patient-detail.dto";

@Injectable()
export class SsfService {

  public ssfSubject: Subject<SsfDataStatus_DTO> = new Subject<SsfDataStatus_DTO>();
  public PatientSchemeMap = new PatientScheme();
  public isClaimSuccessful: boolean = false;
  public SsfDataLocally = new SsfDataStatus_DTO();
  constructor(public visitBlService: VisitBLService) {

  }


  GetSsfPatientDetailAndEligibilityFromSsfServer(policyNo: string, loadFromSSFServer: boolean) {
    if (policyNo !== null) {
      const currentDate = moment().format(ENUM_DateFormats.Year_Month_Day); //* "YYYY-MM-DD", Do not change this unless needed. Krishna, 15thMarch'23
      let ssfData = new SsfDataStatus_DTO();
      this.visitBlService.getSSFPatientDetailAndCheckSSFEligibilityFromSsfServer(policyNo, currentDate).subscribe((res: Array<DanpheHTTPResponse>) => {
        if (res) {
          console.log(res);
          //* res will have an Array of DanpheHttpResponse where 0 index is for SSF Patient Detail and 1 index is for Eligibility
          const ssfPatientDetail = res[0].Results;
          ssfData.ssfPatientDetail = this.GetSsfPatientDtoMappedFromSsfServerPatientDto(ssfPatientDetail);

          ssfData.employerList = ssfPatientDetail.ssfEmployerList[0];//! Try to get unique Employer Possible(SSF gives duplicate values as well)
          ssfData.isPatientInformationLoaded = true;
          ssfData.isPatientEligibilityLoaded = true;
          ssfData.isEmployerListLoaded = true;

          if (this.isClaimSuccessful || loadFromSSFServer) {
            const eligibility = res[1].Results;
            const eligiblePolicies = eligibility.filter(e => e.Inforce === true);
            if (eligiblePolicies && eligiblePolicies.length) {
              ssfData.patientEligibility = eligiblePolicies;
            }
            this.ssfSubject.next(ssfData);
          } else {
            this.SsfDataLocally.ssfPatientDetail.img = ssfData.ssfPatientDetail.img;
            this.ssfSubject.next(this.SsfDataLocally);
          }
        }
      });
    }
  }

  GetSsfPatientDetailAndEligibilityLocally(patientId: number, schemeId: number) {
    this.visitBlService.getSSFPatientDetailLocally(patientId, schemeId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        let patientScheme = new PatientScheme();
        patientScheme = res.Results;
        this.PatientSchemeMap = patientScheme;
        this.SsfDataLocally = new SsfDataStatus_DTO();
        const ssfEligibilityLocally = new SSFEligibility();
        ssfEligibilityLocally.OpdBalance = patientScheme.OpCreditLimit;
        ssfEligibilityLocally.IPBalance = patientScheme.IpCreditLimit;
        ssfEligibilityLocally.AccidentBalance = patientScheme.GeneralCreditLimit;
        ssfEligibilityLocally.SsfEligibilityType = patientScheme.RegistrationCase;
        this.SsfDataLocally.patientEligibility.push(ssfEligibilityLocally);
        this.LoadSSFEmployer(patientScheme.PolicyHolderUID);
      } else {
        this.ssfSubject.next(this.SsfDataLocally);
      }
    });
  }

  LoadSSFEmployer(policyHolderUid: string) {
    this.visitBlService.GetSSFEmployerDetail(policyHolderUid).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        this.SsfDataLocally.employerList = res.Results[0];
        this.SsfDataLocally.isPatientInformationLoaded = true;
        this.SsfDataLocally.isPatientEligibilityLoaded = true;
        this.SsfDataLocally.isEmployerListLoaded = true;
        this.isClaimed(this.PatientSchemeMap.LatestClaimCode, this.PatientSchemeMap.PatientId);
      }
    },
      err => {
        console.log(err);
      })
  }

  isClaimed(LatestClaimCode: number, PatientId: number): void {
    this.visitBlService.IsClaimed(LatestClaimCode, PatientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          // if(res.Results === true){
          this.isClaimSuccessful = res.Results;
          this.SsfDataLocally.IsClaimSuccessful = this.isClaimSuccessful;
          this.ssfSubject.next(this.SsfDataLocally);
          // if (this.isClaimSuccessful) {
          //   this.SsfDataLocally.MemberNo = this.PatientSchemeMap.PolicyNo;
          //   this.SsfDataLocally.LatestClaimCode = this.PatientSchemeMap.LatestClaimCode;
          //   const loadFromServer = false;
          //   this.GetSsfPatientDetailAndEligibilityFromSsfServer(this.PatientSchemeMap.PolicyNo, loadFromServer);
          // } else {
          //   this.ssfSubject.next(this.SsfDataLocally);
          // }
        }
      },
        (err: DanpheHTTPResponse) => {
          console.log(err);
        }
      );
  }



  ReturnSsfData() {
    return this.ssfSubject.asObservable();
  }

  GetSsfPatientDtoMappedFromSsfServerPatientDto(serverDto: SSFPatientDetailFromSsfServer_DTO): SsfPatient_DTO {
    let retObj: SsfPatient_DTO = new SsfPatient_DTO();
    retObj.FirstName = serverDto.name;
    retObj.MiddleName = "";
    retObj.LastName = serverDto.family;
    retObj.DateOfBirth = serverDto.birthdate;
    retObj.Gender = serverDto.gender.charAt(0).toUpperCase() + serverDto.gender.slice(1); //* this logic is to capitalize the first letter;
    retObj.PolicyHolderUID = serverDto.UUID;
    retObj.Address = serverDto.Address;
    retObj.img = serverDto.img;
    return retObj;
  }

}

export class SsfPatient_DTO {
  public FirstName: string = null;
  public MiddleName: string = null;
  public LastName: string = null;
  public DateOfBirth: string = null;
  public Gender: string = null;
  public Address: string = null;
  public img: string = null;
  public PolicyHolderUID: string = null;

}

export class SsfDataStatus_DTO {
  public isPatientInformationLoaded: boolean = false;
  public isPatientEligibilityLoaded: boolean = false;
  public isEmployerListLoaded: boolean = false;

  public ssfPatientDetail: SsfPatient_DTO = new SsfPatient_DTO();
  public patientEligibility: Array<SSFEligibility> = new Array<SSFEligibility>();
  public employerList: Array<SsfEmployerCompany> = new Array<SsfEmployerCompany>();
  public IsClaimSuccessful: boolean = false;
  public MemberNo: string = "";
  public LatestClaimCode: number = null;
  public RegistrationCase: string = "";

}

export class SSFBackupClass {
  // getSSFPatientDetailLocally() {
  //     this.SSFEligibility = [];
  //     this.visitBLService.getSSFPatientDetailLocally(this.patient.PatientId).subscribe((res: DanpheHTTPResponse) => {
  //       if (res.Status === ENUM_DanpheHTTPResponses.OK) {
  //         let patientMapPriceCategory = new PatientMapPriceCategory();
  //         patientMapPriceCategory = res.Results;
  //         this.patient.PAT_Map_PriceCategory.RegistrationCase = patientMapPriceCategory.RegistrationCase;
  //         this.patient.PAT_Map_PriceCategory.LatestClaimCode = patientMapPriceCategory.LatestClaimCode;
  //         this.patient.PAT_Map_PriceCategory.OpCreditLimit = patientMapPriceCategory.OpCreditLimit;
  //         this.patient.PAT_Map_PriceCategory.IpCreditLimit = patientMapPriceCategory.IpCreditLimit;
  //         this.patient.PAT_Map_PriceCategory.PatientCode = patientMapPriceCategory.PatientCode;
  //         this.patient.PAT_Map_PriceCategory.PatientId = patientMapPriceCategory.PatientId;
  //         this.patient.PAT_Map_PriceCategory.PolicyNo = patientMapPriceCategory.PolicyNo;
  //         this.patient.PAT_Map_PriceCategory.PriceCategoryId = patientMapPriceCategory.PriceCategoryId;
  //         this.patient.PAT_Map_PriceCategory.PolicyHolderEmployerID = patientMapPriceCategory.PolicyHolderEmployerID;
  //         this.patient.PAT_Map_PriceCategory.PolicyHolderEmployerName = patientMapPriceCategory.PolicyHolderEmployerName;
  //         this.patient.PAT_Map_PriceCategory.OtherInfo = patientMapPriceCategory.OtherInfo;
  //         this.patient.PAT_Map_PriceCategory.PolicyHolderUID = patientMapPriceCategory.PolicyHolderUID;
  //         this.patient.PAT_Map_PriceCategory.RegistrationSubCase = patientMapPriceCategory.RegistrationSubCase;
  //         this.patient.PAT_Map_PriceCategory.LatestPatientVisitId = patientMapPriceCategory.LatestPatientVisitId;
  //         const ssfEligibilityLocally = new SSFEligibility();
  //         ssfEligibilityLocally.SsfEligibilityType = patientMapPriceCategory.RegistrationCase;
  //         this.SSFEligibility.push(ssfEligibilityLocally);
  //         //this.LoadSSFEmployer();
  //         this.isClaimed(patientMapPriceCategory.LatestClaimCode, this.patient.PatientId);
  //       }
  //     }, (err: DanpheHTTPResponse) => {
  //       this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Unable to get SSF Patient Detail Locally"]);
  //     });
  //   }

  // isClaimed(LatestClaimCode: number, PatientId: number): void {
  //     this.visitBLService.IsClaimed(LatestClaimCode, PatientId)
  //       .subscribe((res: DanpheHTTPResponse) => {
  //         if (res.Status === ENUM_DanpheHTTPResponses.OK) {
  //           if (res.Results === true) {
  //             this.isClaimSuccessful = true;
  //             this.getSSFPatientDetail();
  //           }
  //         }
  //       },
  //         (err: DanpheHTTPResponse) => {
  //           this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Unable to check for pending claims"]);
  //         }
  //       );
  //   }

}
