import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { CommonFunctions } from '../../shared/common.functions';
import { SecurityService } from '../../security/shared/security.service';
import { Permission } from '../../security/shared/permission.model';


/*
 * Separate grid-column settings for incentive module with option to use parameter value from Core-Services.
 Created:9Nov'2020-Prtik
 Remarks: Most of the Properties/Methods are moved from grid-column-settings.constant.ts file (app/shared/danphe-grid)
 */

export class INCTVGridColumnSettings {

  constructor(public coreService: CoreService,
    public securityService: SecurityService) {

  }

  // ***** START: INCENTIVE MODULE *****
  static ProfileMasterList = [
    { headerName: "Profile Name", field: "ProfileName", width: 100 },
    //{
    //  headerName: "Price Category Name",
    //  field: "PriceCategoryName",
    //  width: 100,
    //},
    //{ headerName: "TDS Percentage", field: "TDSPercentage", width: 100 },
    { headerName: "Description", field: "Description", width: 100 },
    { headerName: "IsActive", field: "IsActive", width: 100 },
    //{
    //  headerName: "Actions",
    //  field: "",
    //  width: 150,
    //  template: `
    //    <a danphe-grid-action="edit" class="grid-action">Edit</a>
    //    <a danphe-grid-action="editItemsPercent" class="grid-action">Edit Items Percentage</a>
    //    `,
    //},
    {
      headerName: 'Actions', field: '', width: 150,
      cellRenderer: INCTVGridColumnSettings.ProfileListActionTemplate
    }
  ];

  static EmployeeProfileMapList = [
    { headerName: "Employee Name", field: "EmployeeName", width: 100 },
    { headerName: "Profile Name(s)", field: "ProfileNames", width: 100 },
    {
      headerName: "Actions",
      field: "",
      width: 150,
      template: `
        <a danphe-grid-action="edit" class="grid-action">Edit</a>
        <a danphe-grid-action="viewDetails" class="grid-action">View All Items</a>
        `,
    },
  ];

  static PaymentReportGridColumns = [
    { headerName: "Payment Date", field: "PaymentDate", width: 80 },
    { headerName: "Receiver name", field: "ReceiverName", width: 100 },
    { headerName: "Total Income", field: "TotalAmount", width: 90 },
    { headerName: "TDS Amt.", field: "TDSAmount", width: 90 },
    { headerName: "Net Income", field: "NetPayAmount", width: 90 },
    { headerName: "Adjusted Amount", field: "AdjustedAmount", width: 90 },
    { headerName: "Voucher Number", field: "VoucherNumber", width: 80 },
    { headerName: "Narration", field: "Remarks", width: 90 },
    {
      headerName: "Action",
      field: "",
      width: 90,
      template:
        `<a danphe-grid-action="viewDetail" class="grid-action">
          View Payment Voucher
       </a>`,
    },
  ];

  static EmployeeItemSetupList = [
    { headerName: 'Employee Name', field: 'FullName', width: 100 },
    { headerName: 'TDS Percent', field: 'TDSPercent', width: 100 },
    { headerName: 'IsActive', field: 'IsActive', width: 100 },
    {
      headerName: 'Actions', field: '', width: 150,
      cellRenderer: INCTVGridColumnSettings.IncentiveEmployeeListActionTemplate
    }

  ];

  static EmployeeItemList = [
    { headerName: 'Department', field: 'DepartmentName', width: 100 },
    { headerName: 'ItemName', field: 'ItemName', width: 110 },
    { headerName: 'AssignedTo %', field: 'AssignedToPercent', width: 90 },
    { headerName: 'ReferredBy %', field: 'ReferredByPercent', width: 90 },
    {
      headerName: 'Group?', field: 'HasGroupDistribution', width: 70,
      cellRenderer: INCTVGridColumnSettings.GroupDistributionActionTemplate
    },
    {
      headerName: 'Edit', field: '', width: 120,
      template:
        `<a danphe-grid-action="edititem" class="grid-action fa fa-pencil"  style="background-color: orange;color: black;">
            Edit
          </a>
          <a danphe-grid-action="removeitem" class="grid-action blinking-btn-warning fa fa fa-times"  style="background-color: orange;color: black;">
            Remove
          </a>`
    },
  ];

  static EmployeeItemListWithOpdIpdSettingEnabled = [
    { headerName: 'Department', field: 'DepartmentName', width: 100 },
    { headerName: 'ItemName', field: 'ItemName', width: 120 },
    { headerName: 'AssignedTo %', field: 'AssignedToPercent', width: 90 },
    { headerName: 'ReferredBy %', field: 'ReferredByPercent', width: 90 },
    {
      headerName: 'Group?', field: 'HasGroupDistribution', width: 70,
      cellRenderer: INCTVGridColumnSettings.GroupDistributionActionTemplate
    },
    {
      headerName: 'Edit', field: '', width: 120,
      template:
        `<a danphe-grid-action="edititem" class="grid-action fa fa-pencil"  style="background-color: orange;color: black;">
            Edit
          </a>
          <a danphe-grid-action="removeitem" class="grid-action blinking-btn-warning fa fa fa-times"  style="background-color: orange;color: black;">
            Remove
          </a>`
    },
    {
      headerName: 'Billing Types Applicable', field: 'BillingTypesApplicable', width: 120,
      cellRenderer: INCTVGridColumnSettings.BilingTypesAplicable
    }
  ];

  static ProfilePreviewList = [
    { headerName: 'Department', field: 'DepartmentName', width: 100 },
    { headerName: 'ItemName', field: 'ItemName', width: 100 },
    { headerName: 'AssignedTo %', field: 'AssignedToPercent', width: 100 },
    { headerName: 'ReferredBy %', field: 'ReferredByPercent', width: 100 },
    { headerName: 'Billing Types Applicable', field: 'BillingTypesApplicable', cellRenderer: INCTVGridColumnSettings.BilingTypesAplicable, width: 150 }
  ];

  static ProfileBillItemGridColumns = [
    { headerName: 'Department', field: 'DepartmentName', width: 100 },
    { headerName: 'ItemName', field: 'ItemName', width: 100 },
    { headerName: 'AssignedTo %', field: 'AssignedToPercent', width: 100 },
    { headerName: 'ReferredBy %', field: 'ReferredByPercent', width: 100 },
    {
      headerName: 'Edit', field: '', width: 120,
      template:
        `<a danphe-grid-action="edititem" class="grid-action fa fa-pencil"  style="background-color: orange;color: black;">
            Edit
          </a>
          <a danphe-grid-action="removeitem" class="grid-action blinking-btn-warning fa fa fa-times"  style="background-color: orange;color: black;">
            Remove
          </a>`
    },
  ];
  static ProfileBillItemGridColumnsWithOpdIpdSettingEnabled = [
    { headerName: 'Department', field: 'DepartmentName', width: 100 },
    { headerName: 'ItemName', field: 'ItemName', width: 100 },
    { headerName: 'AssignedTo %', field: 'AssignedToPercent', width: 100 },
    { headerName: 'ReferredBy %', field: 'ReferredByPercent', width: 100 },
    {
      headerName: 'Edit', field: '', width: 120,
      template:
        `<a danphe-grid-action="edititem" class="grid-action fa fa-pencil"  style="background-color: orange;color: black;">
            Edit
          </a>
          <a danphe-grid-action="removeitem" class="grid-action blinking-btn-warning fa fa fa-times"  style="background-color: orange;color: black;">
            Remove
          </a>`
    },
    {
      headerName: 'Billing Types Applicable', field: 'BillingTypesApplicable', width: 150,
      cellRenderer: INCTVGridColumnSettings.BilingTypesAplicable
    }
  ];

  static Incentive_BillTxnItemList_GridCols = [
    {
      headerName: "Service Department",
      field: "ServiceDepartmentName",
      width: 120,
    },
    { headerName: "Item Name", field: "ItemName", width: 120 },
    { headerName: "Referred By", field: "ReferredByEmpName", width: 120 },
    { headerName: "Assigned To Dr.", field: "AssignedToEmpName", width: 120 },
    {
      headerName: "Fraction ?",
      width: 80,
      cellRenderer: INCTVGridColumnSettings.InctvTxnItm_ActionRenderer,
    },
    { headerName: "Amount", field: "TotalAmount", width: 80 },
    { headerName: "Invoice No", field: "InvoiceNo", width: 85 },
    { headerName: "Date", field: "TransactionDate", width: 100, cellRenderer: INCTVGridColumnSettings.InctvTxnItmDateRenderer },
    { headerName: "Patient Name", field: "PatientName", width: 120 },
  ];


  // ***** END: INCENTIVE MODULE *****


  static ProfileListActionTemplate(params) {
    if (params.data.IsActive == true) {
      let template =
        `<a danphe-grid-action="edit" class="grid-action">Rename</a>
         <a danphe-grid-action="editItemsPercent" class="grid-action">Edit Items Percentage</a>
         <a danphe-grid-action="deactivateProfile" class="grid-action blinking-btn-warning"  style="background-color: orange;color: black;">
              Deactivate
            </a>
            `
      return template
    }
    else {
      let template =
        ` <a danphe-grid-action="activateProfile" class="grid-action blinking-btn-secondary"  style="background-color: #afb8af;color: black;">
                Activate
               </a>
               `
      return template;
    }
  }

  static IncentiveEmployeeListActionTemplate(params) {
    if (params.data.IsActive == true) {
      let template =
        `<a danphe-grid-action="editItemsPercent" class="grid-action">
                Edit Items
             </a>
         <a danphe-grid-action="deactivateEmployeeIncentiveSetup" class="grid-action blinking-btn-warning"  style="background-color: orange;color: black;">
              Deactivate
            </a>
            <a danphe-grid-action="edit-tds" class="grid-action">
                Edit TDS%
             </a>
            `
      return template
    }
    else {
      let template =
        ` <a danphe-grid-action="activateEmployeeIncentiveSetup" class="grid-action blinking-btn-secondary"  style="background-color: #afb8af;color: black;">
                Activate
               </a>
               `
      return template;
    }
  }

  static GroupDistributionActionTemplate(params) {
    if (params.data.HasGroupDistribution == false) {
      let template =
        `<a danphe-grid-action="groupdistribution" class="grid-action fa fa-pencil">
            No
           </a>`
      return template
    }
    else {
      let template =
        `<a danphe-grid-action="groupdistribution" class="grid-action blinking-btn-secondary fa fa-pencil">
             Yes(`+ params.data.GroupDistributionCount + `)
           </a>`
      return template;
    }

  }

  static InctvTxnItmDateRenderer(params) {
    let date: string = params.data.TransactionDate;
    return moment(date).format("YYYY-MM-DD");
  }

  static InctvTxnItm_ActionRenderer(params) {
    if (!params.data.FractionCount) {
      let template = `<a class="fa fa-pencil" danphe-grid-action="edit" style='background-color:orange;font-weight:bold;padding: 5px 9px 5px 8px;width: 100%; color: black;'>
              NO (0)
           </a>
          `;
      return template;
    } else {
      let template =
        `<a class="fa fa-pencil" danphe-grid-action="edit" style='background-color:lightgreen;font-weight:bold;padding: 5px 9px 5px 8px;width: 100%; color: black;'>
          YES(` +
        params.data.FractionCount +
        `)
         </a>
        `;
      return template;
    }
  }

  static BilingTypesAplicable(params) {
    if (params.data.BillingTypesApplicable == null || params.data.BillingTypesApplicable == 'both') {
      return "InPatient/OutPatient";
    } else {
      return params.data.BillingTypesApplicable;
    }
  }
}
