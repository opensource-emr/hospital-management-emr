import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';
import { PatientService } from '../../../patients/shared/patient.service';
import { LabTestResultService } from '../../shared/lab.service';
import { LabsBLService } from '../../shared/labs.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PatientLabSample, LabTestSpecimen, LabResult_TestVM } from '../../shared/lab-view.models';
import { SecurityService } from '../../../security/shared/security.service';
import { LabTestRequisition } from '../../shared/lab-requisition.model';
import { LabTestComponent } from '../../shared/lab-component.model'
import { CommonFunctions } from "../../../shared/common.functions";
import * as _ from 'lodash';
import { LabSticker } from "../../shared/lab-sticker.model";
import { CoreService } from "../../../core/shared/core.service";
import { LabReportVM, ReportLookup } from "../../reports/lab-report-vm";
import { DanpheHTTPResponse } from "../../../shared/common-models";

@Component({
  selector: 'empty-add-report',
  templateUrl: "./lab-empty-report-template.html",
  styleUrls: ['./lab-empty-report-style.css']
})

export class LabTestsEmptyAddReportComponent {
  @Input("allReqIdListForPrint") allReqIdListForPrint = new Array<number>();
  @Output("closeEmptyReport") closeEmptyReport: EventEmitter<Object> = new EventEmitter<Object>();

  public templateReport: LabReportVM;
  public LookUpDetail: ReportLookup;
  public ckHtmlContent: string = null;
  public hasInsurance: boolean = false;
  public showBarCode: boolean = false;

  public hospitalCode: string = '';

  constructor(public labBLService: LabsBLService,
    public router: Router,
    _patientservice: PatientService,
    _labresultservice: LabTestResultService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {
    this.showBarCode = this.coreService.ShowBarCodeInLabReport();
    this.hospitalCode = this.coreService.GetHospitalCode();
    if (!this.hospitalCode) {
      this.hospitalCode = 'default-lab-report';
    }
  }


  ngOnInit() {
    this.LoadLabReports();    
  }


  public LoadLabReports() {
    //remove hardcoded id: 1 from below and pass correct one.
    //or pass list of requisitionIds as per necessity
    this.labBLService.GetReportFromReqIdList(this.allReqIdListForPrint)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK" && res.Results) {
          this.templateReport = res.Results;
          this.MapTestAndComponents();
        } 
      });
  }

  

  public MapTestAndComponents() {
    console.log(this.templateReport);
    if (this.templateReport.Templates.length) {
      this.templateReport.Templates.forEach(template => {
        let testList = new Array<LabResult_TestVM>();
        template.Tests.forEach(labTest => {
          if (labTest.HasInsurance) {
            this.hasInsurance = labTest.HasInsurance;
          }
          //To check if the new Custom Component is added and there is empty ComponentJSON
          if (labTest.ComponentJSON && labTest.ComponentJSON.length == 0 && labTest && labTest.Components.length > 0) {
            var comp: LabTestComponent = new LabTestComponent();
            for (var i = 0; i < labTest.Components.length; i++) {
              var compArray: Array<LabTestComponent> = [];

              comp.ComponentName = labTest.Components[i].ComponentName;
              compArray.push(comp);
            }
            labTest.ComponentJSON = compArray;
            labTest.ComponentJSON.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });
          }


          let newLabtestVm: LabResult_TestVM = new LabResult_TestVM();
          newLabtestVm = Object.assign(newLabtestVm, labTest);
          newLabtestVm.Components = new Array<LabTestComponent>();

          let length = labTest.Components.length;

          labTest.ComponentJSON.forEach(component => {

            var _testComponent: LabTestComponent = new LabTestComponent();
            if (component) {
              _testComponent = Object.assign(_testComponent, component);
              _testComponent.ComponentName = component.ComponentName;
              _testComponent.LabTestId = labTest.LabTestId;

              if (template.TemplateType == "html") {
                //_testComponent.Value = this.templateReport.TemplateHTML;
                this.ckHtmlContent = this.templateReport.TemplateHTML;
              }
              if (template.TemplateType == 'culture') {
                _testComponent.IsSelected = false;
                newLabtestVm.SelectAll = false;
              }

              if (newLabtestVm.VendorDetail && !newLabtestVm.VendorDetail.IsDefault) {
                newLabtestVm.SelectAll = false;
                _testComponent.IsSelected = false;
              }

              _testComponent.RequisitionId = labTest.RequisitionId;
              _testComponent.TemplateId = template.TemplateId;
            }
            newLabtestVm.Components.push(_testComponent);
          });

          testList.push(newLabtestVm);

        });
        template.Tests = testList;

      });
    }
    
  }


  public Close() {
    this.closeEmptyReport.emit({close: true});
  }

  public PrintSheet() {
    let popupWinindow;
    if (document.getElementById("emptyTestReportSheet")) {
      var printContents = document.getElementById("emptyTestReportSheet").innerHTML;
    }
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    var documentContent = '<html><head>';
    documentContent +=  `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" /></head>`;

    documentContent += '<body class="lab-rpt4moz" onload="window.print()">' + printContents + '</body></html>';
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();   
  }  
}
