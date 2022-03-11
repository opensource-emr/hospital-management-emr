import { Injectable, Directive } from '@angular/core';
import { PatientsDLService } from './patients.dl.service';
import { AppointmentDLService } from '../../appointments/shared/appointment.dl.service';
import { VisitDLService } from '../../appointments/shared/visit.dl.service';
import { ImagingDLService } from '../../radiology/shared/imaging.dl.service';
import { ClinicalDLService } from '../../clinical/shared/clinical.dl.service';
import { LabsDLService } from '../../labs/shared/labs.dl.service';
import { ADT_DLService } from '../../adt/shared/adt.dl.service';
import { Patient } from './patient.model';
import { PatientFilesModel } from './patient-files.model'
import * as moment from 'moment/moment';
import * as _ from 'lodash';

//Note: mapping is done here by blservice, component will only do the .subscribe().
@Injectable()
export class PatientsBLService {

  //we-re gradually moving business logic from component to BLServices


  constructor(public patientDLService: PatientsDLService,
    public appointmentDLService: AppointmentDLService,
    public visitDLService: VisitDLService,
    public labsDLService: LabsDLService,
    public imagingDLService: ImagingDLService,
    public clinicalDLService: ClinicalDLService,
    public admissionDLService: ADT_DLService) {

  }
  // for getting the Patient
  public GetPatients(searcgTxt) {
    return this.patientDLService.GetPatients(searcgTxt)
      .map(res => { return res })
  }
  //  get registered patients
  public GetPatientsList(searcgTxt) {
    return this.patientDLService.GetPatientsList(searcgTxt)
      .map(res => { return res })
  }

  public GetPatientById(patientId: number) {
    return this.patientDLService.GetPatientById(patientId)
      .map(res => { return res })
  }
  // getting the CountrySubDivision from dropdown
  public GetCountrySubDivision(countryId: number) {
    return this.patientDLService.GetCountrySubDivision(countryId)
      .map(res => { return res })

  }
  public GetCountries() {
    return this.patientDLService.GetCountries()
      .map(res => { return res })
  }
  public GetMembershipType() {
    return this.patientDLService.GetMembershipType()
      .map(res => { return res })
  }
  public GetPatientBillHistory(patientCode: string) {
    return this.patientDLService.GetPatientBillHistory(patientCode)
      .map(res => { return res })
  }
  public GetPatientLabReport(patientId: number) {
    return this.labsDLService.GetPatientReport(patientId)
      .map(res => res);
  }
  public GetPatientImagingReports(patientId: number) {
    return this.imagingDLService.GetPatientReports(patientId, 'final')
      .map(res => res);
  }
  public GetPatientVisitList(patientId: number) {
    return this.visitDLService.GetPatientVisitList(patientId)
      .map(res => res);
  }
  public GetPatientDrugList(patientId: number) {
    return this.clinicalDLService.GetMedicationList(patientId)
      .map(res => res);
  }

  public getPatientUplodedDocument(patientId: number) {
    return this.patientDLService.GetPatientUplodedDocument(patientId)
      .map(res => res);
  }
  public GetAdmissionHistory(patientId: number) {
    return this.admissionDLService.GetAdmissionHistory(patientId)
      .map(res => res);
  }
  public GetLightPatientById(patientId: number) {
    return this.patientDLService.GetLightPatientById(patientId)
      .map(res => res);
  }
  public GetInsuranceProviderList() {
    return this.patientDLService.GetInsuranceProviderList()
      .map(res => res);
  }
  public GetDialysisCode() {
    return this.patientDLService.GetDialysisCode()
      .map(res => res);
  }
  // for posting the patient
  public PostPatient(patientObj: Patient) {
    //ommitting all validators, before sending to server.
    //BUT, guarantorValidator is behaving differently so we've created this work-around to 
    // assign it back to the patientobject -- needs better approach later.. --sudarshan-27feb'17
    let guarValidator = patientObj.Guarantor.GuarantorValidator;

    var temp = _.omit(patientObj, ['PatientValidator',
      'Addresses[0].AddressValidator',
      'Addresses[1].AddressValidator',
      'Insurances[0].InsuranceValidator',
      'Insurances[1].InsuranceValidator',
      'KinEmergencyContacts[0].KinValidator',
      'KinEmergencyContacts[1].KinValidator',
      'Guarantor.GuarantorValidator',
      'ProfilePic.PatientFilesValidator',
      'CountrySubDivision',
    ]);


    let data = JSON.stringify(temp);

    patientObj.Guarantor.GuarantorValidator = guarValidator;

    return this.patientDLService.PostPatient(data)
      .map(res => { return res })

  }

  //this returns an observable, calling client can subscribe to it.. 
  // for updating the patient
  public PutPatient(patientObj: Patient) {
    //do your business logic here, like removing the validator etc...
    let guarValidator = patientObj.Guarantor.GuarantorValidator;
    var temp = _.omit(patientObj, ['PatientValidator',
      'Addresses[0].AddressValidator',
      'Addresses[1].AddressValidator',
      'Insurances[0].InsuranceValidator',
      'Insurances[1].InsuranceValidator',
      'KinEmergencyContacts[0].KinValidator',
      'KinEmergencyContacts[1].KinValidator',
      'Guarantor.GuarantorValidator',
      'ProfilePic.PatientFilesValidator',
      'CountrySubDivision',]);


    let data = JSON.stringify(temp);
    //ommitting and re-assigning the validator, which was behaving strangely
    patientObj.Guarantor.GuarantorValidator = guarValidator;
    //pass patientid and stringyfied object to the dlservice
    return this.patientDLService.PutPatient(patientObj.PatientId, data)
      .map(res => { return res })

  }
  //this is for apppointment modules
  public PutAppointmentPatientId(appointmentId: number, patientId: number) {
    return this.appointmentDLService.PutAppointmentPatientId(appointmentId, patientId)
      .map(res => { return res })
  }
  //Get Matching Patient Details by FirstName,LastName,PhoneNumber for showing registered matching patient on Registration Creation time
  public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, Age, Gender, IsInsurance = false, IMISCode = null) {
    return this.patientDLService.GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, Age, Gender, IsInsurance, IMISCode)
      .map(res => { return res });
  }


  public AddPatientFiles(filesToUpload, patReport: PatientFilesModel) {
    try {
      let formToPost = new FormData();
      //localFolder storage address for the file ex. Radiology\X-Ray
      //var localFolder: string = "PatientFiles\\" + patReport.FileType;
      var fileName: string;
      //patient object was included to display it's details on client side
      //it is not necessary during post
      var omited = _.omit(patReport, ['PatientFilesValidator']);

      //we've to encode uri since we might have special characters like , / ? : @ & = + $ #  etc in our report value. 
      var reportDetails = JSON.stringify(omited);//encodeURIComponent();


      let uploadedImgCount = 0;
      //ImageName can contain names of more than one image seperated by ;
      //if (patReport.ImageName)
      //    uploadedImgCount = patReport.ImageName.split(";").length;
      for (var i = 0; i < filesToUpload.length; i++) {
        //to get the imagetype
        let splitImagetype = filesToUpload[i].name.split(".");
        let imageExtension = splitImagetype[1];
        //fileName = PatientId_ImagingItemName_PatientVisitId_CurrentDateTime_Counter.imageExtension
        fileName = patReport.FileType + "_" + moment().format('DD-MM-YY') + "." + imageExtension;
        formToPost.append("uploads", filesToUpload[i], fileName);
      }
      //pending reports has ImagingReportId
      //new reports does not has ImagingReportId
      //if ImagingReportId is present then update item.
      formToPost.append("reportDetails", reportDetails);

      //let finalIPResult = input;
      return this.patientDLService.PostPatientFiles(formToPost)
        .map(res => res);

    } catch (exception) {
      throw exception;
    }
  }

  public GetMunicipality(id: number) {
    return this.patientDLService.GetMunicipality(id)
      .map(res => { return res })
  }
  public GetFileFromServer(id: number) {
    return this.patientDLService.GetFileFromServer(id).map((res) => {
      return res;
    });
  }
}
