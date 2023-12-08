import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../../core/shared/core.service";
import { SecurityService } from "../../../../security/shared/security.service";
import { GeneralFieldLabels } from "../../../../shared/DTOs/general-field-label.dto";
import { DischargeSummaryViewModel } from "../discharge-summary-view-model";


@Component({
    selector: 'fishtail-discharge-summary-view-templete',
    templateUrl: './fishtail-discharge-summary-template.html'
})

export class FishTailDischargeSummaryViewTemplateComponent {
    @Input('viewData')
    dsVM: DischargeSummaryViewModel;

    @Input('ShowDoctorsSignatureImage')
    public ShowDoctorsSignatureImage: boolean = false;

    @Input('IsFinalSubmited')
    public IsFinalSubmited: boolean;
    public isEditMode: boolean = false;
    public hospitalStayDate: any;

    @Output('EditModeFromFishtailView') SendData: EventEmitter<any> = new EventEmitter<any>();
    hasEditDischargeSunnaryPermission: boolean = false;
    hideBtn: boolean = false;
    loggedInuserName: string;

    public ConsultantDoctor: string;
    public GeneralFieldLabel = new GeneralFieldLabels();

    constructor(public securityService: SecurityService, public coreservice: CoreService,) {
        this.hasEditDischargeSunnaryPermission = this.securityService.HasPermission('btn-edit-discharge-summary-after-final-submit');
        this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();

    }
    ngOnInit() {
        if (this.dsVM.Consultants && this.dsVM.Consultants.length) {
            this.ConsultantDoctor = this.dsVM.Consultants[0].consultantLongSignature;
        }
        this.CalculateHospitalStayDay();
    }

    print() {
        let popupWinindow;
        var printContents = document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();

        let documentContent = "<html><head>";
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/Danphe_ui_style.css"/>';
        documentContent += `<style>
        .img-responsive{ position: static;left: 2px;top: 10px;}
        .qr-code{position: absolute; left: 1001px;top: 9px;}
        .invoice-print-header .col-md-2 {
            width: 50%;
            float: left;
        }
        .invoice-print-header .col-md-8 {
            width: 60%;
            float: left;
        }
        .sub-main-cls, ul.adviceSubList li {
            width: 50% !important;
            display: inline-block !important;
            padding: 1%;
        }
        ul.adviceSubList li {
             flex: 0 0 47%;
        }
        .sub-main-cls-fullwidth, ul.adviceSubList li .sub-main-cls {
            width: 100% !important;
            display: block !important;
        }
        .dsv-div .left-panel .patient-hdr-label, .left-panel .patient-hdr-label {
            display: inline-block;
            width: 33.33%;
            style="font-size:24px;
        }
        .left-panel .patient-hdr-label.signature, .dr-signature-list .patient-hdr-label {
            max-width: 500px;
            width: 100%;
            display: block;
            style="font-size:24px;
        }
        .left-panel .patient-hdr-label b:before,
        .p-relative b:before {
            display: none !important;   
            style="font-size:24px; 
        }
        .left{
            marfin-left:50px !important;
        }
        .right-panel{
            font-size:16px;
        }
        .lft-align-pnl-heading {
            margin-top: 0 !important;
            margin-left: -14px !important;
            text-align: left !important;
          }
          .name-long-sig{
            margin-left:3px !important
          }
        </style>`;

        documentContent += '</head>';
        documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    }

    public EditRecord() {
        this.isEditMode = true;
        this.SendData.emit(this.isEditMode);

    }



    public CalculateHospitalStayDay() {
        let date1 = new Date(this.dsVM.selectedADT.DischargedDate);
        let date2 = new Date(this.dsVM.selectedADT.AdmittedDate);
        this.hospitalStayDate = Math.floor((Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()) - Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())) / (1000 * 60 * 60 * 24));

    }

}