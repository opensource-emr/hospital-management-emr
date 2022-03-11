import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { SecurityService } from "../../../security/shared/security.service";
import { CoreService } from '../../../core/shared/core.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { MaternityBLService } from '../../shared/maternity.bl.service';
import * as moment from 'moment/moment';
import { MaternityANCModel } from '../../shared/maternity-anc.model';


@Component({
  selector: 'maternity-anc',
  templateUrl: "./maternity-anc.html"
})

// App Component class
export class MaternityANCComponent {
  @Input("maternalPatientId")
  public maternalPatientId: any;

  @Input("patientDetail")
  public patientDetail: any;

  @Output("callBackANCClose")
  public callBackANCClose: EventEmitter<Object> = new EventEmitter<Object>();

  public patientANCList: Array<MaternityANCModel> = new Array<MaternityANCModel>();
  public addUpdateANCData: MaternityANCModel = new MaternityANCModel();
  public visitList: any = [];


  constructor(public securityService: SecurityService, public coreService: CoreService, public maternityBLService: MaternityBLService,
    public msgBoxServ: MessageboxService, public cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.patientANCList = [];
    this.addUpdateANCData.MaternityPatientId = this.maternalPatientId;
    this.addUpdateANCData.VisitNumber = null;
    this.GetAllDosesNumber();
    this.GetMaternityANCOfPatient();
  }

  GetMaternityANCOfPatient() {
    this.coreService.loading = true;
    this.maternityBLService.GetAllANCByMaternityPatientId(this.maternalPatientId).subscribe((res) => {
      if (res.Status == 'OK') {
        this.patientANCList = res.Results;
        this.patientANCList.forEach(pat => {
          var visit = this.visitList.find(ele => { return ele.Id.toString() == pat.VisitNumber })
          pat.VisitNumber = visit.NumberInfo;
        });
        this.coreService.loading = false;
      }
    }, err => {
      this.coreService.loading = false;
      this.msgBoxServ.showMessage('failed', ['Failed to Load Maternity Patient List']);
    });
  }

  AddANC() {
    this.coreService.loading = true;

    for (var i in this.addUpdateANCData.ANCValidator.controls) {
      this.addUpdateANCData.ANCValidator.controls[i].markAsDirty();
      this.addUpdateANCData.ANCValidator.controls[i].updateValueAndValidity();
    }
    if (this.addUpdateANCData.IsValid(undefined, undefined)) {
      this.maternityBLService.AddUpdateMaternityANC(this.addUpdateANCData).subscribe((res) => {
        if (res.Status == 'OK') {
          var anc = res.Results;
          if (this.addUpdateANCData && this.addUpdateANCData.MaternityANCId) {
            let selectedAnc = this.patientANCList.map(p => (this.addUpdateANCData.MaternityANCId == p.MaternityANCId) ? this.addUpdateANCData : p);
            this.patientANCList = selectedAnc.slice();
          } else {
            if (this.visitList) {
              let visit = this.visitList.find(ele => { return ele.Id.toString() == anc.VisitNumber })
              anc.VisitNumber = visit && visit.NumberInfo;
            }
            this.patientANCList.push(anc);
          }
          this.addUpdateANCData = new MaternityANCModel();
          this.addUpdateANCData.MaternityPatientId = this.maternalPatientId;
          this.coreService.loading = false;
          let successMsg = (this.addUpdateANCData && this.addUpdateANCData.MaternityANCId) ? 'ANC successfully added' : 'ANC successfully Updated';
          this.msgBoxServ.showMessage('success', [successMsg]);
        }
      }, err => {
        this.coreService.loading = false;
        this.msgBoxServ.showMessage('failed', ['Failed to add ANC']);
      });
    } else {
      this.coreService.loading = false;
    }
  }

  GetAllDosesNumber() {
    this.maternityBLService.GetAllDosesNumber(true).subscribe(res => {
      if (res.Status == "OK") {
        this.visitList = res.Results;
        let numberOfAllowedVisits = this.coreService.GetMaternityAncNumberOfAllowedVisits().NumberOfAllowedVisits;
        this.visitList.splice(numberOfAllowedVisits);
        this.cdr.detectChanges();
      } else {
        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
      }
    });
  }

  Close() {
    this.callBackANCClose.emit({ close: true });
  }

  EditANC(selectedData: any) {
    this.addUpdateANCData = Object.assign(new MaternityANCModel(), selectedData);
    var visit = this.visitList.find(ele => { return ele.NumberInfo == this.addUpdateANCData.VisitNumber })
    this.addUpdateANCData.VisitNumber = visit.Id;
  }

  ResetAddANCForm() {
    this.addUpdateANCData = new MaternityANCModel();
    this.addUpdateANCData.VisitNumber = null;
    this.addUpdateANCData.MaternityPatientId = this.maternalPatientId;
  }

  RemoveANC(maternityANCId) {
    this.maternityBLService.DeleteMaternityPatientANC(maternityANCId).subscribe((res) => {
      if (res.Status == 'OK') {
        this.patientANCList = this.patientANCList.filter(p => (p.MaternityANCId != maternityANCId)).slice();
        this.msgBoxServ.showMessage('success', ['ANC successfully removed']);
      }
    }, err => {
      this.coreService.loading = false;
      this.msgBoxServ.showMessage('failed', ['Failed to Remove ANC']);
    });
  }

  PrintANC() {
    let popupWinindow;
    var printContents = "";
    if (document.getElementById("ancList")) {
      printContents = document.getElementById("ancList").innerHTML;
    } else {
      this.msgBoxServ.showMessage('failed', ['Failed to Print']);
      return;
    }

    popupWinindow = window.open(
      "",
      "_blank",
      "width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
    );
    popupWinindow.document.open();
    var documentContent = "<html><head>";
    documentContent +=
      `<link rel="stylesheet" type="text/css" href="../../../../../../assets-dph/external/global/plugins/bootstrap/css/bootstrap.min.css" />` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanpheStyle.css" />` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/Danphe_ui_style.css" /></head>` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" /></head>`;

    /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    ///Sud:22Aug'18--added no-print class in below documeentContent

    documentContent +=
      '<body>' +
      printContents +
      "</body></html>";
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();

    let tmr = setTimeout(function () {
      popupWinindow.print();
      popupWinindow.close();
    }, 300);

    if (tmr) {
      return true;
    }
  }

}

