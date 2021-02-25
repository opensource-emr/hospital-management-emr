import { Component } from '@angular/core';
import * as moment from 'moment/moment';

import { HelpDeskBLService } from '../shared/helpdesk.bl.service';
import { HlpDskBedInfo } from '../shared/bed-info.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../shared/common.functions';

@Component({
  templateUrl: "./bed-info.html"
})

export class HlpDskBedInfoComponent {
  public stats: any = ""; // = new Object();
  bedinfo: Array<HlpDskBedInfo> = new Array<HlpDskBedInfo>();
  bedinfoGridColumns: Array<any> = null;
  bedFeature: Array<any> = new Array<any>();
  bedPatientFeature: Array<any> = new Array<any>();
  occupiedBed: Array<any> = new Array<any>();
  vacantBed: Array<any> = new Array<any>();
  totaloccupid: any;
  showBed: boolean = false;
  showBedDetails: boolean = false;

  constructor(
    public helpDeskBLService: HelpDeskBLService,
    public msgBoxServ: MessageboxService) {
    this.LoadBedInfo();
    this.LoadBedFeature();
    this.LoadBedPatientFeature();
    // this.bedinfoGridColumns = GridColumnSettings.BedInfoSearch;
  }

  LoadBedInfo(): void {
    this.helpDeskBLService.LoadBedInfo()
      .subscribe(res => {
        if (res.Status == "OK") {
          let data = JSON.parse(res.Results.JsonData);
          this.stats = data.LabelData[0];
          this.bedinfo = data.BedList;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }

  // get bed feature summary
  LoadBedFeature(): void {
    this.helpDeskBLService.LoadBedFeature().subscribe(res => {
      if (res.Status === 'OK') {
        this.bedFeature = res.Results;
        this.totaloccupid = CommonFunctions.getGrandTotalData(this.bedFeature);
      } else {
        this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
      }
    });
  }

  LoadBedPatientFeature(): void {
    this.helpDeskBLService.LoadBedPatientInfo().subscribe(res => {
      if (res.Status === 'OK') {
        this.bedPatientFeature = res.Results;
      } else {
        this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
      }
    });
  }

  // Print table data.
  Print() {
    let popupWinindow;
    let printContents = '<b>Bed Feature Summary Report: </b>';
    printContents += document.getElementById('printpage').innerHTML;
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
      const workSheetName = 'Bed Feature Summary';
      const Heading = 'Bed Feature Summary';
      const filename = 'Bed Feature Summary';
      const date = moment().format('YYYY-MM-DD');
      CommonFunctions.ConvertHTMLTableToExcel(tableId, '', date, workSheetName, Heading, filename);
    }
  }

  ShowBed(wardName: string): void {
    this.occupiedBed = [];
    this.vacantBed = [];
    for (let i = 0; i < this.bedPatientFeature.length; i++) {
      if (this.bedPatientFeature[i].WardName === wardName) {
        if (this.bedPatientFeature[i].IsOccupied === true) {
          this.occupiedBed.push(this.bedPatientFeature[i]);
        }
        if (this.bedPatientFeature[i].IsOccupied === false) {
          this.vacantBed.push(this.bedPatientFeature[i]);
        }
      }
    }
    this.showBed = true;
    this.showBedDetails = false;
  }
}
