import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CommonFunctions } from "../../shared/common.functions";
import { VaccinationPatient } from './vaccination-patient.model';

@Injectable()
export class VaccinationDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient) {
  }
  public GetAllVaccinationPatient() {
    return this.http.get<any>("/api/Vaccination/GetAllVaccinationPatient", this.options);
  }

  public GetVaccinationPatientById(id: number) {
    return this.http.get<any>("/api/Vaccination/GetVaccinationPatientDetailById?id=" + id, this.options);
  }

  public GetLatestVaccRegistrationNumber(fiscId: number = 0) {
    return this.http.get<any>("/api/Vaccination/GetLatestVaccRegNumber?fiscalYearId=" + fiscId, this.options);
  }

  public GetAllVaccinesOfPatientByPatientId(id: number) {
    return this.http.get<any>("/api/Vaccination/GetAllVaccinesOfPatientByPatientId?id=" + id, this.options);
  }

  public GetAllVaccinesListWithDosesMapped(doseNeeded: boolean) {
    return this.http.get<any>("/api/Vaccination/GetAllVaccineWiseDoseMapped?doseNeeded=" + doseNeeded, this.options);
  }

  public GetIntegratedVaccineReport(from, to, gender, vaccList) {
    return this.http.get<any>("/api/Vaccination/GetVaccinationIntegratedreport?from=" + from + "&to=" + to + "&gender=" + gender + "&vaccStr=" + vaccList, this.options);
  }

  public GetAppointmentDetailsReport(from, to, appointmentType) {
    return this.http.get<any>("/api/Vaccination/GetDailyAppointmentReport?fromDate=" + from + "&toDate=" + to + "&appointmentType=" + appointmentType, this.options);
  }

  public GetExistingVaccRegNumData(fiscId, regNum,) {
    return this.http.get<any>("/api/Vaccination/GetExistingVaccRegistrationData?fiscalYearId=" + fiscId + "&regNumber=" + regNum, this.options);
  }

  // getting all the baby patient
  public GetBabyPatientList(searchTxt) {
    return this.http.get<any>("/api/Vaccination/GetAllBabyPatient?search=" + searchTxt, this.options);
  }

  public AddUpdateVaccinationPatient(data) {
    return this.http.post<any>("/api/Vaccination/AddVaccinationPatient", data, this.options);
  }

  public AddUpdatePatientVaccineDetail(data) {
    return this.http.post<any>("/api/Vaccination/AddPatientVaccineationDetail", data, this.options);
  }

  public UpdateVaccineRegNumberOfPatient(patId: number, regNum: number, fiscalYearId: number) {
    return this.http.put<any>("/api/Vaccination/UpdateVaccRegnumberOfPatient?patId=" + patId + "&regNum=" + regNum + "&fiscalYearId=" + fiscalYearId, this.options);
  }
  public GetCastEthnicGroupList() {
    return this.http.get<any>("/api/Vaccination/GetCastEthnicGroupList", this.options);
  }

  public GetMunicipality(id: number) {
    return this.http.get<any>("/api/Master?type=get-municipalities&countrySubDivisionId=" + id, this.options);
  }

  public GetPatientAndVisitInfo(visitId: number) {
    return this.http.get<any>("/api/Vaccination/GetPatientAndVisitInfo?patientVisitId=" + visitId, this.options);
  }


  public PostFollowupVisit(visitData) {
    let visJson = JSON.stringify(visitData);
    //Re-using Visit's API.
    return this.http.post<any>("/api/Vaccination/PostFollowupVisit", visJson, this.options);
  }


}
