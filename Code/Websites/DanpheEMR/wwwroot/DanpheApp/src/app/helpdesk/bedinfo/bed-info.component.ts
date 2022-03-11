import { Component } from '@angular/core';
import * as moment from 'moment/moment';

import { HelpDeskBLService } from '../shared/helpdesk.bl.service';
import { HlpDskBedInfo } from '../shared/bed-info.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../shared/common.functions';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./bed-info.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class HlpDskBedInfoComponent {
  public stats: any = ""; // = new Object();

  allBedsWithPatInfo: Array<any> = new Array<any>();
  wardOccupancyList: Array<any> = new Array<any>();

  occupiedBeds: Array<any> = new Array<any>();
  vacantBeds: Array<any> = new Array<any>();
  reservedBeds: Array<any> = new Array<any>();

  public tot_wardOccupancy: any;

  showBed: boolean = false;
  showBedDetails: boolean = false;

  public patientBedInfoColumns: any;
  public showDetail: boolean = false;
  public patientBedInfoDetail: Array<any> = [];
  public NepaliDateInGridSettings: NepaliDateInGridParams =
    new NepaliDateInGridParams();

  constructor(
    public helpDeskBLService: HelpDeskBLService,
    public msgBoxServ: MessageboxService) {

    this.LoadBedInfo();
    this.LoadWardBedOccupancy();
    this.LoadBedsAndTheirPatients();

    // this.NepaliDateInGridSettings.NepaliDateColumnList.push(
    //   new NepaliDateInGridColumnDetail("StartedOn", false)
    // );
    // this.patientBedInfoColumns = [
    //   {
    //     headerName: "Admitted On",
    //     field: "StartedOn",
    //     width: 90
    //   },
    //   {
    //     headerName: "Hospital Number",
    //     field: "PatientCode",
    //     width: 90
    //   },
    //   {
    //     headerName: "IP Number",
    //     field: "VisitCode",
    //     width: 90
    //   },
    //   {
    //     headerName: "Patient Name",
    //     field: "PatientName",
    //     width: 100,
    //   },
    //   {
    //     headerName: "Age",
    //     field: "Age",
    //     width: 60,
    //   },
    //   {
    //     headerName: "Phone Number",
    //     field: "PhoneNumber",
    //     width: 100,
    //   },
    //   {
    //     headerName: "Address",
    //     field: "Address",
    //     width: 100,
    //   },
    //   {
    //     headerName: "Ward Name",
    //     width: 100,
    //     field: "WardName"
    //   },
    //   {
    //     headerName: "Bed Number",
    //     width: 100,
    //     field: "BedNumber",
    //   },
    //   { headerName: "Bed Code", field: "BedCode", width: 80 }

    // ];
  }

  LoadBedInfo(): void {
    this.helpDeskBLService.LoadBedInfo()
      .subscribe(res => {
        if (res.Status == "OK") {
          let data = JSON.parse(res.Results.JsonData);
          this.stats = data.LabelData[0];
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }

  //sud:16Sept'21--Renamed the function and variables since it was not clear what is doing what..
  LoadWardBedOccupancy(): void {
    this.helpDeskBLService.GetBedOccupancyOfWards().subscribe(res => {
      if (res.Status === 'OK') {
        this.wardOccupancyList = res.Results;
        this.tot_wardOccupancy = CommonFunctions.getGrandTotalData(this.wardOccupancyList);
      } else {
        this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
      }
    });
  }

  LoadBedsAndTheirPatients(): void {
    this.helpDeskBLService.GetAllBedsWithPatInfo().subscribe(res => {
      if (res.Status === 'OK') {
        this.allBedsWithPatInfo = res.Results;
      } else {
        this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
      }
    });
  }

  // Print table data.
  Print() {
    let popupWinindow;
    let printContents = '<b>Ward wise Bed Occupancy: </b>';
    printContents += document.getElementById('dvPrint_WardWiseList').innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = '<html><head>';
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  // bed feature summary report export to execel
  ExportToExcel(tableId) {
    if (tableId) {
      const workSheetName = 'BedOccupancy';
      const Heading = 'Ward wise Bed Occupancy';
      const filename = 'BedOccupancy';
      const date = moment().format('YYYY-MM-DD');
      CommonFunctions.ConvertHTMLTableToExcel(tableId, '', date, workSheetName, Heading, filename);
    }
  }


  public selectedWard: any = null;

  ShowWardBedsPreview(wardId: number): void {

    this.selectedWard = null;
    this.selectedWard = this.wardOccupancyList.find(w => w.WardId == wardId);

    //this.showDetail = true;
    //this.patientBedInfoDetail = this.bedPatientFeature.filter(a=>a.WardName==wardName);
    this.occupiedBeds = [];
    this.vacantBeds = [];
    this.reservedBeds = [];

    this.occupiedBeds = this.allBedsWithPatInfo.filter(b => b.WardId == wardId && b.IsOccupied == true);
    this.occupiedBeds=this.occupiedBeds.filter((v,i,a)=>a.findIndex(t=>(t.BedID === v.BedID))===i);
    this.vacantBeds = this.allBedsWithPatInfo.filter(b => b.WardId == wardId && b.IsOccupied == false && !b.IsReserved);
    this.vacantBeds=this.vacantBeds.filter((v,i,a)=>a.findIndex(t=>(t.BedID === v.BedID))===i);
    this.reservedBeds = this.allBedsWithPatInfo.filter(b => b.WardId == wardId && b.IsOccupied == false && b.IsReserved);
    this.reservedBeds=this.reservedBeds.filter((v,i,a)=>a.findIndex(t=>(t.BedID === v.BedID))===i);

    this.showDetail = true;
    //this.showBed = true;
    this.showBedDetails = false;
  }



  public ClosePopUp() {
    this.patientBedInfoDetail = [];
    this.showDetail = false;
  }

  //sud:17Sep'21
  hotkeys(event) {
    ///27 is for 'ESC'
    if (event.keyCode == 27) {
      this.ClosePopUp();
    }
  }
}
