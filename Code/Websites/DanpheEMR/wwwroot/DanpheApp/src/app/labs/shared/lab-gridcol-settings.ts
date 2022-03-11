//This grid is to show list of Lab Report Templates
import * as moment from 'moment/moment';
import { SecurityService } from '../../security/shared/security.service';
import { CommonFunctions } from '../../shared/common.functions';

export default class LabGridColumnSettings {
  static securityServ: any;
  constructor(public securityService: SecurityService) {
    LabGridColumnSettings.securityServ = this.securityService;
  }

  public ListRequisitionColumnFilter(columnObj: Array<any>): Array<any> {
    var filteredColumns = [];
    if (columnObj) {
      for (var prop in columnObj) {
        if (columnObj[prop] == true || columnObj[prop] == 1) {
          var headername: string = prop;
          var ind = this.LabRequsistionPatientSearch.find(
            (val) =>
              val.headerName.toLowerCase().replace(/ +/g, "") ==
              headername.toLowerCase().replace(/ +/g, "")
          );
          if (ind) {
            filteredColumns.push(ind);
          }
        }
      }
      if (filteredColumns.length) {
        return filteredColumns;
      } else {
        return this.LabRequsistionPatientSearch;
      }
    } else {
      return this.LabRequsistionPatientSearch;
    }
  }

  public AddResultColumnFilter(columnObj: any): Array<any> {
    var filteredColumns = [];
    if (columnObj) {
      for (var prop in columnObj) {
        var headername: string = prop;
        if (columnObj[prop] == true || columnObj[prop] == 1) {
          var ind = this.PendingLabResults.find(
            (val) =>
              val.headerName.toLowerCase().replace(/ +/g, "") ==
              headername.toLowerCase().replace(/ +/g, "")
          );
          if (ind) {
            filteredColumns.push(ind);
          }
        }
      }
      if (filteredColumns.length) {
        return filteredColumns;
      } else {
        return this.PendingLabResults;
      }
    } else {
      return this.PendingLabResults;
    }
  }

  public static PendingReportListColumnFilter(
    columnArr: Array<any>
  ): Array<any> {
    var filteredColumns = [];
    if (columnArr && columnArr.length) {
      for (var i = 0; i < columnArr.length; i++) {
        var headername: string = columnArr[i];
        var ind = this.LabTestPendingReportList.find(
          (val) =>
            val.headerName.toLowerCase().replace(/ +/g, "") ==
            headername.toLowerCase().replace(/ +/g, "")
        );
        if (ind) {
          filteredColumns.push(ind);
        }
      }
      if (filteredColumns.length) {
        return filteredColumns;
      } else {
        return this.LabTestPendingReportList;
      }
    } else {
      return this.LabTestPendingReportList;
    }
  }

  public FinalReportListColumnFilter(columnObj: Array<any>): Array<any> {
    var filteredColumns = [];
    if (columnObj) {
      for (var prop in columnObj) {
        if (columnObj[prop] == true || columnObj[prop] == 1) {
          var headername: string = prop;
          var ind = this.LabTestFinalReportList.find(
            (val) =>
              val.headerName.toLowerCase().replace(/ +/g, "") ==
              headername.toLowerCase().replace(/ +/g, "")
          );
          if (ind) {
            filteredColumns.push(ind);
          }
        }
      }
      if (filteredColumns.length) {
        return filteredColumns;
      } else {
        return this.LabTestFinalReportList;
      }
    } else {
      return this.LabTestFinalReportList;
    }
  }

  public LabRequsistionPatientSearch = [
    {
      headerName: "Requisition Date",
      field: "LastestRequisitionDate",
      width: 150,
      valueGetter: LabGridColumnSettings.RequisitionDateTimeRenderer,
    },
    { headerName: "Hospital Number", field: "PatientCode", width: 125 },
    { headerName: "Patient Name", field: "PatientName", width: 150 },
    {
      headerName: "Age/Sex",
      field: "DateOfBirth",
      width: 75,
      valueGetter: LabGridColumnSettings.AgeSexRendererPatient,
    },
    { headerName: "Phone Number", field: "PhoneNumber", width: 100 },
    { headerName: "Requesting Dept.", field: "WardName", width: 120 },
    {
      headerName: "Visit Type",
      field: "VisitType",
      width: 75,
      valueGetter: LabGridColumnSettings.PatientTypeRenderer,
    },
    { headerName: "Run Number Type", field: "RunNumberType", width: 100 },

    {
      headerName: "Action",
      field: "",
      width: 120,
      cellRenderer: LabGridColumnSettings.BtnByBillStatusRenderer,
    },
  ];

  public PendingLabResults = [
    { headerName: "Hospital No.", field: "PatientCode", width: 100 },
    { headerName: "Patient Name", field: "PatientName", width: 160 },
    {
      headerName: "Age/Sex",
      field: "",
      width: 70,
      cellRenderer: LabGridColumnSettings.AgeSexRendererPatient,
    },
    { headerName: "Phone Number", field: "PhoneNumber", width: 100 },
    { headerName: "Test Name", field: "LabTestCSV", width: 200 },
    { headerName: "Category", field: "TemplateName", width: 180 },
    { headerName: "Requesting Dept.", field: "WardName", width: 90 },
    { headerName: "Run No.", width: 80, field: "SampleCodeFormatted" },
    { headerName: "Bar Code", width: 90, field: "BarCodeNumber" },
    {
      headerName: "Actions",
      field: "",
      width: 250,
      cellRenderer: LabGridColumnSettings.PendingLabActionButtons,
    },
  ];

  static LabTestPendingReportList = [
    { headerName: "Hospital No.", field: "PatientCode", width: 80 },
    { headerName: "Patient Name", field: "PatientName", width: 130 },
    {
      headerName: "Age/Sex",
      field: "",
      width: 90,
      cellRenderer: LabGridColumnSettings.AgeSexRendererPatient,
    },
    { headerName: "Phone Number", field: "PhoneNumber", width: 100 },
    { headerName: "Test Name", field: "LabTestCSV", width: 170 },
    //ashim: 01Sep2018: We're now grouping by sample code only.
    //{ headerName: "Template", field: "TemplateName", width: 160 },
    { headerName: "Requesting Dept.", field: "WardName", width: 70 },
    { headerName: "Run Num", field: "SampleCodeFormatted", width: 60 },
    { headerName: "BarCode Num", field: "BarCodeNumber", width: 70 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: LabGridColumnSettings.VerifyRenderer,
      //   template: `<a danphe-grid-action="ViewDetails" class="grid-action">
      //   View Details
      //   </a>
      //  <a danphe-grid-action="labsticker" class="grid-action"><i class="glyphicon glyphicon-print"></i> Sticker</a>
      //  <a danphe-grid-action="Verify" class="grid-action">
      //   Verify
      //   </a>
      //  `
    },
  ];

  public LabTestFinalReportList = [
    { headerName: "Hospital No.", field: "PatientCode", width: 80 },
    { headerName: "Patient Name", field: "PatientName", width: 140 },
    {
      headerName: "Age/Sex",
      field: "",
      width: 60,
      cellRenderer: LabGridColumnSettings.AgeSexRendererPatient,
    },
    { headerName: "Phone Number", field: "PhoneNumber", width: 100 },
    { headerName: "Test Name", field: "LabTestCSV", width: 200 },
    //ashim: 01Sep2018: We're now grouping by sample code only.
    {
      headerName: "Report Generated By",
      field: "ReportGeneratedBy",
      width: 120,
    },
    { headerName: "Requesting Dept.", field: "WardName", width: 80 },
    { headerName: "Run Num", field: "SampleCodeFormatted", width: 70 },
    {
      headerName: "Is Printed",
      field: "",
      width: 50,
      cellRenderer: LabGridColumnSettings.LabReptIsPrintedRenderer,
    },
    { headerName: "Is Uploaded",field : "IsFileUploadedToTeleMedicine", width :70,
      cellRenderer : LabGridColumnSettings.LabReptIsUploadedRenderer,
    },
    {
      headerName: "Action",
      field: "",

      width: 150,
      cellRenderer: LabGridColumnSettings.BillPaidRenderer,
    },
  ];

  public LabReportTemplateList = [
    {
      headerName: "Report Template ShortName",
      field: "ReportTemplateShortName",
      width: 140,
    },
    { headerName: "Template Name", field: "ReportTemplateName", width: 140 },
    { headerName: "Template Type", field: "TemplateType", width: 80 },
    { headerName: "Display Sequence", field: "DisplaySequence", width: 80 },
    {
      headerName: "Actions",
      field: "",
      width: 100,
      cellRenderer:
        LabGridColumnSettings.LabReportTemplateActionsTemplateWithPermission,
      // template:
      //   `
      //        <a danphe-grid-action="edit" class="grid-action">
      //           Edit
      //        </a>`
    },
  ];

  public LabTestList = [
    { headerName: "Lab Test Name", field: "LabTestName", width: 160 },
    { headerName: "Reporting Name", field: "ReportingName", width: 160 },
    { headerName: "Category", field: "LabTestCategory", width: 100 },
    {
      headerName: "Is Active",
      width: 60,
      cellRenderer: LabGridColumnSettings.IsActiveRenderer,
    },
    { headerName: "Display Sequence", field: "DisplaySequence", width: 80 },
    {
      headerName: "Actions",
      field: "",
      width: 60,
      cellRenderer: LabGridColumnSettings.LabTestActionTemplateWithPermission,
    },
  ];

  static LabComponentList = [
    { headerName: "ComponentName", field: "ComponentName", width: 110 },
    { headerName: "Display Name", field: "DisplayName", width: 110 },
    { headerName: "Unit", field: "Unit", width: 40 },
    { headerName: "Range", field: "Range", width: 60 },
    { headerName: "Range Description", field: "RangeDescription", width: 70 },
    { headerName: "Method", field: "Method", width: 60 },
    { headerName: "ControlType", field: "ControlType", width: 60 },
    { headerName: "ValueType", field: "ValueType", width: 60 },
    { headerName: "Value LookUp", field: "ValueLookup", width: 60 },
    {
      headerName: "Actions",
      field: "",
      width: 60,
      template: `
             <a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`,
    },
  ];
  static LabLookUpsList = [
    { headerName: "ID", field: "LookUpId", width: 20 },
    { headerName: "Module Name", field: "ModuleName", width: 50 },
    { headerName: "Look-up Name", field: "LookUpName", width: 110 },
    { headerName: "Look-up Data", field: "LookupDataJson", width: 260 },
    { headerName: "Description", field: "Description", width: 170 },
    {
      headerName: "Actions",
      field: "",
      width: 50,
      template: `
             <a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`,
    },
  ];

  public LabVendorsListColumns = [
    { headerName: "Vendor Name", field: "VendorName", width: 160 },
    { headerName: "Vendor Code", field: "VendorCode", width: 100 },
    { headerName: "Address", field: "ContactAddress", width: 100 },
    { headerName: "Is External ?", width: 60, field: "IsExternal" },
    { headerName: "Is Active ?", field: "IsActive", width: 60 },
    { headerName: "Is Default ?", field: "IsDefault", width: 60 },
    {
      headerName: "Actions",
      field: "",
      width: 60,
      cellRenderer:
        LabGridColumnSettings.LabVendorActionsTemplateWithPermission,
      // template:
      //   `
      //        <a danphe-grid-action="edit" class="grid-action">
      //           Edit
      //        </a>`
    },
  ];

  public LabCategoryList = [
    { headerName: "Category Name", field: "TestCategoryName", width: 160 },
    {
      headerName: "Actions",
      field: "",
      width: 60,
      cellRenderer:
        LabGridColumnSettings.LabCategoryActionsTemplateWithPermissions,
      // template:
      //   `
      //        <a danphe-grid-action="edit" class="grid-action">
      //           Edit
      //        </a>`
    },
  ];

  static MappedCompList = [
    {
      headerName: "S.N.",
      field: "SerialNumber",
      width: 40,
    },
    { headerName: "Gov. Test Name", field: "ReportItemName", width: 100 },
    { headerName: "Group Name", field: "GroupName", width: 100 },
    { headerName: "Mapped Lab Test Name", field: "LabItemName", width: 100 },
    { headerName: "Is Component Based", field: "IsComponentBased", width: 100 },
    { headerName: "Component Name", field: "ComponentName", width: 100 },
    {
      headerName: "Positive Indicator",
      field: "PositiveIndicator",
      width: 100,
    },
    {
      headerName: "Actions",
      field: "",
      width: 60,
      cellRenderer: LabGridColumnSettings.GovernmentMapItemsActionRenderer,
    },
  ];

  public SampleCollectedList = [
    { headerName: "Hospital No.", field: "PatientCode", width: 120 },
    { headerName: "Patient Name", field: "PatientName", width: 130 },
    { headerName: "Test Name", field: "LabTestName", width: 200 },
    { headerName: "Specimen", field: "LabTestSpecimen", width: 150 },
    { headerName: "DepartmentAssigned", field: "TestCategoryName", width: 200 },
    { headerName: "Run No.", width: 90, field: "SampleCodeFormatted" },
    { headerName: "Bar Code", width: 100, field: "BarCodeNumber" },
    {
      headerName: "SampleCollected Date/Time",
      field: "SampleCreatedOn",
      width: 220,
    },
  ];

  static GovernmentMapItemsActionRenderer(params) {
    let reportMapId = params.data.ReportMapId;
    let template = "";
    if (reportMapId > 0) {
      return (template = `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`);
    } else {
      return (template = `<a danphe-grid-action="add" class="grid-action">
                Add
             </a>`);
    }
  }

  static IsActiveRenderer(params) {
    let isActive = params.data.IsActive;
    if (isActive) {
      return `<b>True</b>`;
    } else {
      return `<b>False</b>`;
    }
  }

  static IndexRenderer(params) {
    return params.rowIndex + 1;
  }

  //displays date and time in hour:minute
  static RequisitionDateTimeRenderer(params) {
    return moment(params.data.LastestRequisitionDate).format(
      "YYYY-MM-DD HH:mm"
    );
  }

  static AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }
  static VerifyRenderer(params) {
    let verification = params.data.verificationEnabled;
    if (verification) {
      return `<a danphe-grid-action="ViewDetails" class="grid-action">
                 View Details
            </a>
                <a danphe-grid-action="labsticker" class="grid-action"><i class="glyphicon glyphicon-print"></i> Sticker</a>
                <a danphe-grid-action="verify" class="grid-action">Verify</a>
                `;
    } else {
      return `<a danphe-grid-action="ViewDetails" class="grid-action">
                 View Details
            </a>
                <a danphe-grid-action="labsticker" class="grid-action"><i class="glyphicon glyphicon-print"></i> Sticker</a>
                `;
    }
  }
  static PatientTypeRenderer(params) {
    let type = params.data.VisitType;

    if (type) {
      if (type.toLowerCase() == "outpatient") {
        return "OP";
      } else if (type.toLowerCase() == "inpatient") {
        return "IP";
      } else {
        return "ER";
      }
    } else {
      return "OP"; //default is Outpatient
    }
  }

  static BtnByBillStatusRenderer(params) {
    let billingStatus = params.data.BillingStatus;

    if (billingStatus == "cancel") {
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-lab-requisition-cancel"
        )
      ) {
        return `<button class="grid-action" style="background-color: #ed6b75 !important;border: 2px solid #ed6b75; width:91px;text-align: center;">Cancelled</button>`;
      }
    } else {
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-lab-requisition-view"
        )
      ) {
        return `<a danphe-grid-action="ViewDetails" class="grid-action">
                View Details
             </a>`;
      }
    }
  }

  static BillPaidRenderer(params) {
    let allowOutpatWithProv = params.data.AllowOutpatientWithProvisional;
    let visitType = params.data.VisitType;
    let isBillPaid: boolean = false;

    if (visitType && visitType.toLowerCase() == "inpatient") {
      isBillPaid = true;
    } else {
      if (allowOutpatWithProv) {
        if (
          params.data.BillingStatus &&
          (params.data.BillingStatus.toLowerCase() == "paid" ||
            params.data.BillingStatus.toLowerCase() == "unpaid" ||
            params.data.BillingStatus.toLowerCase() == "provisional")
        ) {
          isBillPaid = true;
        } else {
          isBillPaid = false;
        }
      } else {
        if (
          params.data.BillingStatus &&
          (params.data.BillingStatus.toLowerCase() == "paid" ||
            params.data.BillingStatus.toLowerCase() == "unpaid" ||
            visitType.toLowerCase() == "emergency")
        ) {
          isBillPaid = true;
        } else {
          isBillPaid = false;
        }
      }
    }

    if (isBillPaid) {
      let template = "";
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-final-reports-view"
        )
      ) {
        template += `<a danphe-grid-action="ViewDetails" class="grid-action">
                        View Details
                    </a>`;
      }

      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-final-reports-print"
        )
      ) {
        template += `<a danphe-grid-action="Print" class="grid-action">
                        Print
                    </a>`;
      }
      return template;
    } else {
      return `<b style="color: red;">Bill Not Paid</b>`;
    }
  }

  static LabReptIsPrintedRenderer(params) {
    let isPrinted = params.data.IsPrinted;

    if (isPrinted) {
      return `<b style="color: green;">YES</b>`;
    } else {
      return `<b style="color: red;">NO</b>`;
    }
  }
  
  static LabReptIsUploadedRenderer(params) {
    // let isUploaded = params.data.IsFileUploadedToTeleMedicine;
    if(params.data.IsFileUploadedToTeleMedicine == "YES"){
      return `<b style="color: green;">YES</b>`;
    }
    else {
      return `<b style="color: red;">NO</b>`;
    }

  }

  static LabTestActionTemplateWithPermission(params) {
    if (params.data.IsActive == true) {
      let template = "";

      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-test-edit"
        )
      ) {
        template += `<a danphe-grid-action="edit" class="grid-action">
            Edit
         </a>`;
      }
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-test-activate"
        )
      ) {
        template += `<a danphe-grid-action="activateDeactivateLabTest" class="grid-action">
          Deactivate
        </a>`;
      }

      return template;
    } else {
      let template = "";
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-test-activate"
        )
      ) {
        return (template += `<a danphe-grid-action="activateDeactivateLabTest" class="grid-action">
          Activate
        </a>`);
      }
    }
  }

  static LabCategoryActionsTemplateWithPermissions(params) {
    if (params.data.IsActive == true) {
      let template = "";

      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-category-edit"
        )
      ) {
        template += `<a danphe-grid-action="edit" class="grid-action">
            Edit
         </a>`;
      }
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-category-activate"
        )
      ) {
        template += `<a danphe-grid-action="activateDeactivateLabTest" class="grid-action">
          Deactivate
        </a>`;
      }

      return template;
    } else {
      let template = "";
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-category-activate"
        )
      ) {
        return (template += `<a danphe-grid-action="activateDeactivateLabTest" class="grid-action">
          Activate
        </a>`);
      }
    }
  }

  static LabReportTemplateActionsTemplateWithPermission(params) {
    if (params.data.IsActive == true) {
      let template = "";

      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-report-template-edit"
        )
      ) {
        template += `<a danphe-grid-action="edit" class="grid-action">
            Edit
         </a>`;
      }
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-report-template-activate"
        )
      ) {
        template += `<a danphe-grid-action="activateDeactivateLabTest" class="grid-action">
          Deactivate
        </a>`;
      }

      return template;
    } else {
      let template = "";
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-report-template-activate"
        )
      ) {
        return (template += `<a danphe-grid-action="activateDeactivateLabTest" class="grid-action">
          Activate
        </a>`);
      }
    }
  }

  static LabVendorActionsTemplateWithPermission(params) {
    if (params.data.IsActive == true) {
      let template = "";

      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-vendors-edit"
        )
      ) {
        template += `<a danphe-grid-action="edit" class="grid-action">
            Edit
         </a>`;
      }
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-vendors-activate"
        )
      ) {
        template += `<a danphe-grid-action="activateDeactivateLabTest" class="grid-action">
          Deactivate
        </a>`;
      }

      return template;
    } else {
      let template = "";
      if (
        LabGridColumnSettings.securityServ.HasPermission(
          "btn-labsettings-vendors-activate"
        )
      ) {
        return (template += `<a danphe-grid-action="activateDeactivateLabTest" class="grid-action">
          Activate
        </a>`);
      }
    }
  }

  static PendingLabActionButtons() {
    let template = "";

    if (
      LabGridColumnSettings.securityServ.HasPermission(
        "btn-add-results-addresult"
      )
    ) {
      template += `<a danphe-grid-action="addresult" class="grid-action">
                      Add Result
                  </a> `;
    }

    if (
      LabGridColumnSettings.securityServ.HasPermission(
        "btn-add-results-sticker"
      )
    ) {
      template += `<a danphe-grid-action="labsticker" class="grid-action"><i class="glyphicon glyphicon-print"></i> Sticker</a>`;
    }

    template += `<div class="dropdown" style="display:inline-block;">
                    <button class="dropdown-toggle grid-btnCstm" type="button" data-toggle="dropdown">...
                      <span class="caret"></span></button>
                      <ul class="dropdown-menu grid-ddlCstm">`;

    if (
      LabGridColumnSettings.securityServ.HasPermission("btn-add-results-undo")
    ) {
      template += `<li><a danphe-grid-action="undo">Undo</a></li>`;
    }

    if (
      LabGridColumnSettings.securityServ.HasPermission("btn-add-results-print")
    ) {
      template += `<li><a danphe-grid-action="print-empty-sheet">Print Sheet</a></li>`;
    }

    template += `</ul></div>`;

    return template;
  }
}
