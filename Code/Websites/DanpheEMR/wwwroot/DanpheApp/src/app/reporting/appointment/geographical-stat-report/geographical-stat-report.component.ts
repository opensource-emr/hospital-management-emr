import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { CountrySubdivision, Municipality } from '../../../settings-new/shared/country-subdivision.model';
import { GeneralFieldLabels } from '../../../shared/DTOs/general-field-label.dto';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_GeographicalReportType, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { DynamicReport } from '../../shared/dynamic-report.model';
import { ReportingService } from '../../shared/reporting-service';

@Component({
  selector: 'app-geographical-stat-report',
  templateUrl: './geographical-stat-report.component.html',
  styleUrls: ['./geographical-stat-report.component.css']
})
export class RPT_ADT_GeographicalStatReportComponent implements OnInit {
  public fromDate: string = '';
  public toDate: string = '';
  public geographicalstatreport: DynamicReport = new DynamicReport();
  DistrictWiseReportColumn: Array<any> = null;
  MunicipalityWiseReportColumn: Array<any> = null;
  DistrictWiseReportData: Array<any> = new Array<DynamicReport>();
  MunicipalityWiseReportData: Array<any> = new Array<DynamicReport>();
  filteredMunicipalityWiseReportData: Array<any> = new Array<DynamicReport>();
  public summary = { tot_new: 0, tot_followup: 0, tot_all: 0 };
  public countrySubDivision: CountrySubdivision = new CountrySubdivision();
  public municipality: Municipality = new Municipality();
  public countrySubDivisions: Array<CountrySubdivision> = [];
  public MunicipalitiesList: Array<any> = [];
  public FilteredMunicipalitiesList: Array<any> = [];
  public countries: Array<any> = [];
  public CountryName: string = '';
  public CountryId: number = 0;
  public CountrySubDivisionName: string = '';
  public MunicipalityId: number = 0;
  public MunicipalityName: string = '';
  public GeoStatType: string = "District";
  showMunicipality: any;
  public selectedDistrictId: number = 0;
  public GeneralFieldLabel = new GeneralFieldLabels();


  constructor(public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public reportServ: ReportingService) {

    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();


    this.geographicalstatreport.fromDate = moment().format('YYYY-MM-DD');
    this.geographicalstatreport.toDate = moment().format('YYYY-MM-DD');
    this.DistrictWiseReportColumn = this.reportServ.reportGridCols.RPT_ADT_DistrictWiseReportColumn;
    this.MunicipalityWiseReportColumn = this.reportServ.reportGridCols.RPT_ADT_MunicipalityWiseReportColumn;
    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;

  }

  ngOnInit() {
    this.GetCountrySubDivision();
    this.GetMunicipality();
  }
  Load() {
    if (this.geographicalstatreport.fromDate != null && this.geographicalstatreport.toDate != null) {
      this.summary.tot_all = this.summary.tot_new = this.summary.tot_followup = 0;
      this.DistrictWiseReportData = [];

      const geoStatTypeToSend = this.GeoStatType === ENUM_GeographicalReportType.Municipality ? ENUM_GeographicalReportType.Municipality : ENUM_GeographicalReportType.District;

      this.dlService.Read("/Reporting/GeographicalStatReport?FromDate="
        + this.geographicalstatreport.fromDate + "&ToDate=" + this.geographicalstatreport.toDate +
        "&CountrySubDivisionName=" + this.CountrySubDivisionName + "&MunicipalityName=" + this.MunicipalityName
        + "&GeoStatType=" + geoStatTypeToSend
      )
        .map((res: DanpheHTTPResponse) => res)
        .subscribe((res: DanpheHTTPResponse) => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Dates Provided is not Proper']);
    }
  }


  Success(res) {
    if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
      if (this.GeoStatType === ENUM_GeographicalReportType.District) {

        this.DistrictWiseReportData = res.Results;
      } else {
        this.MunicipalityWiseReportData = res.Results;
        this.filteredMunicipalityWiseReportData = this.MunicipalityWiseReportData;
      }

    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Data Not Available']);
    }
  }

  Error(err) {
    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Data Not Available']);
  }
  gridExportOptions = {
    fileName: 'DailyVisitGeographicalReport' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']

  };
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.geographicalstatreport.fromDate = this.fromDate;
    this.geographicalstatreport.toDate = this.toDate;
  }

  districtListFormatter(data: any): string {
    let html = data["CountrySubDivisionName"];
    return html;
  }
  GetCountrySubDivision() {

    let country = this.countries.find(a => a.CountryId === Number(this.CountryId))
    this.CountryName = country ? country.CountryName : "";

    this.dlService.GetCountrySubDivision(this.CountryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results) {
          this.countrySubDivisions = [];
          this.countrySubDivisions = res.Results;

          this.countrySubDivision = new CountrySubdivision();
          this.countrySubDivision = null; //to show sub country box empty when the country selection is changed 
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get country sub divisions.']);
          console.log(res.ErrorMessage);
        }
      });
  }
  AssignSelectedDistrict(event) {
    if (event) {
      this.countrySubDivision = event;
      this.selectedDistrictId = this.countrySubDivision.CountrySubDivisionId;
      this.CountrySubDivisionName = this.countrySubDivision.CountrySubDivisionName;
      var FilteredByDisMunicipalitiesList = this.MunicipalitiesList.filter(x => x.CountrySubDivisionId == this.selectedDistrictId);
      this.FilteredMunicipalitiesList = FilteredByDisMunicipalitiesList[0].Municipalities;
    } else {
      this.CountrySubDivisionName = '';
    }
    // this.GetMunicipality();
  }
  public updateMunicipality(event) {
    if (event) {
      this.MunicipalityId = event.data ? event.data.MunicipalityId : null;
      this.MunicipalityName = event.data ? event.data.MunicipalityName : null;
    }
  }
  municipalityListFormatter(data: any): string {
    let html = data["MunicipalityName"];
    return html;
  }
  GetMunicipality() {
    // this.FilteredMunicipalitiesList = this.municipalities.find(a => a.municipalityId === Number(this.municipalityId))
    // this.MunicipalityName = municipality ? municipality.MunicipalityName : "";
    this.dlService.GetMunicipality(this.CountryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results) {
          this.MunicipalitiesList = [];
          this.MunicipalitiesList = res.Results;
          this.FilteredMunicipalitiesList = this.MunicipalitiesList.filter(m => m.CountrySubDivisionId === this.selectedDistrictId);

          this.municipality = new Municipality();
          this.municipality = null; //to show sub country box empty when the country selection is changed 
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get Municioality.']);
          console.log(res.ErrorMessage);
        }
      });
  }
  AssignSelectedMunicipality(event) {
    if (event) {
      this.MunicipalityName = event.MunicipalityName;
      this.filteredMunicipalityWiseReportData = this.MunicipalityWiseReportData.find(x => x.MunicipalityName == event.MunicipalityName);
    }
    else {
      this.MunicipalityName = '';
      this.filteredMunicipalityWiseReportData = [];
    }
  }


  updateGeoStatType() {
    if (this.municipality) {
      this.GeoStatType = 'Municipality';
    }
  }
}
