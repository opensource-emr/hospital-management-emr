import * as moment from 'moment/moment';
import { CommonFunctions } from '../common.functions';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
export class SettingsGridColumnSettings {

  static securityServ: any;

  constructor(public taxLabel, public securityService: SecurityService) {
    SettingsGridColumnSettings.securityServ = this.securityService;
  }

  //start:billing
  public BillingItemList = [
    { headerName: "Service Department", field: "ServiceDepartmentName", width: 100 },
    { headerName: "ItemCode", field: "ItemCode", width: 70 },
    { headerName: "ItemName", field: "ItemName", width: 120, cellRenderer: this.BillingItemNameRenderer },
    { headerName: "Price", field: "Price", width: 70 },
    { headerName: "" + this.taxLabel + " Applicable", field: "TaxApplicable", width: 70 },
    { headerName: "Discount Applicable", field: "DiscountApplicable", width: 70 },
    {
      headerName: "IsActive", width: 70,
      field: "IsActive",
      cellRenderer: this.BillingItemIsActiveRenderer
    },

    { headerName: "IsFractionApplicable", field: "IsFractionApplicable", width: 70 },
    { headerName: "IsDoctorMandatory", field: "IsDoctorMandatory", width: 70 },
    { headerName: "IsZeroPriceAllowed", field: "IsZeroPriceAllowed", width: 70 },

    { headerName: "Description", field: "Description", width: 100 },
    {
      headerName: "Action",
      field: "",

      width: 200,
      cellRenderer: this.BillingItemListActionTemplateWithPermission
    }
  ]

  public ReportingItemsList = [
    { headerName: "Reporting Item Name", field: "ReportingItemName", width: 120 },
    { headerName: "Report Name", field: "ReportName", width: 150 },
    { headerName: "Reporting Unit", field: "RptCountUnit", width: 150 },
    {
      headerName: "IsActive", width: 70,
      field: "IsActive",
      cellRenderer: this.BillingItemIsActiveRenderer
    },
    {
      headerName: "Action",
      field: "",

      width: 200,
      cellRenderer: this.ReportingItemListActionTemplateWithPermission
    }
  ]

  public BillingItemIsActiveRenderer(params) {
    let template: string = '';
    if (params.data.IsActive == true) {
      template = '<span>Yes</span>';
    } else {
      template = '<span style="color:red;font-weight:bold;">No</span>';
    }

    return template;
  }

  public BillingPackageList = [
    { headerName: "Package Name", field: "BillingPackageName", width: 120 },
    { headerName: "Package Code", field: "PackageCode", width: 120 },
    { headerName: "Description", field: "Description", width: 120 },
    { headerName: "Total Price", field: "TotalPrice", width: 100 },
    { headerName: "Discount Percent", field: "DiscountPercent", width: 100 },
    { headerName: "Active Status", field: "IsActive", width: 90 },
    {
      headerName: "Action",
      field: "",

      width: 80,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  //This is cell renderer function return Action List as per value for BillingItemList grid
  //public BillingItemListActionTemplate(params) {
  //  if (params.data.IsActive == true) {
  //    let template =
  //      `<a danphe-grid-action="edit" class="grid-action">
  //              Edit
  //           </a>

  //             <a danphe-grid-action="showHistory" class="grid-action">
  //              Price History
  //           </a>
  //              <a danphe-grid-action="activateDeactivateBillItem" class="grid-action"  style="background-color: orange;color: black;">
  //            Deactivate
  //          </a>`
  //    return template
  //  }
  //  else {
  //    let template =
  //      `<a danphe-grid-action="edit" class="grid-action">
  //              Edit
  //           </a>

  //             <a danphe-grid-action="showHistory" class="grid-action">
  //              Price History
  //           </a>
  //              <a danphe-grid-action="activateDeactivateBillItem" class="grid-action"  style="background-color: #afb8af;color: black;">
  //              Activate
  //             </a>`
  //    return template;
  //  }

  //}
  public BillingItemListActionTemplateWithPermission(params) {
    if (params.data.IsActive == false) {
      let template = "";
      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-bill-item-edit")) {
        template += `<a danphe-grid-action="edit" class="grid-action">
               Edit
            </a>`
      }

      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-bill-item-pricehistory")) {
        template += `<a danphe-grid-action="showHistory" class="grid-action">
               Price History
            </a>`
      }

      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-bill-item-activate")) {
        template += `<a danphe-grid-action="activateDeactivateBillItem" class="grid-action"  style="background-color: #afb8af;color: black;">
              Activate
             </a>`
      }
      return template;
    }
    else {
      let template = "";
      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-bill-item-edit")) {
        template += `<a danphe-grid-action="edit" class="grid-action">
               Edit
            </a>`
      }

      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-bill-item-pricehistory")) {
        template += `<a danphe-grid-action="showHistory" class="grid-action">
               Price History
            </a>`
      }

      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-bill-item-activate")) {
        template += `<a danphe-grid-action="activateDeactivateBillItem" class="grid-action"  style="background-color: orange;color: black;">
             Deactivate
           </a>`
      }
      return template;
    }

  }

  public ReportingItemListActionTemplateWithPermission(params) {
    if (params.data.IsActive == false) {
      let template = "";
      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-reporting-items-activate")) {
        template += `<a danphe-grid-action="activateDeactivate" class="grid-action"  style="background-color: #afb8af;color: black;">
              Activate
             </a>`
      }
      return template;
    }
    else {
      let template = "";
      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-reporting-items-edit")) {
        template += `<a danphe-grid-action="edit" class="grid-action">
               Edit
            </a>`
      }

      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-reporting-items-manageItem")) {
        template += `<a danphe-grid-action="manageReportingItem" class="grid-action">
               Manage Services
            </a>`
      }

      if (SettingsGridColumnSettings.securityServ.HasPermission("btn-settings-reporting-items-activate")) {
        template += `<a danphe-grid-action="activateDeactivate" class="grid-action"  style="background-color: orange;color: black;">
             Deactivate
           </a>`
      }
      return template;
    }

  }
  //end:billing

  public ServDeptList = [
    { headerName: "Department", field: "DepartmentName", width: 150 },
    { headerName: "Service Department", field: "ServiceDepartmentName", width: 150 },
    { headerName: "Short Name", field: "ServiceDepartmentShortName", width: 150 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  public DeptList = [
    { headerName: "Code", field: "DepartmentCode", width: 100 },
    { headerName: "Name", field: "DepartmentName", width: 150 },
    { headerName: "Parent Department", field: "ParentDepartmentName", width: 120 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    { headerName: "Is Appointment Applicable", field: "IsAppointmentApplicable", width: 120 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  public StoreList = [
    // { headerName: "Id", field: "StoreId", width: 50 },//show S.No. taking from client side if possible.
    { headerName: "Name", field: "Name", width: 160 },
    { headerName: "Code", field: "Code", width: 80 },
    { headerName: "Parent SubStore", field: "ParentName", width: 120 },
    { headerName: "Email", field: "Email", width: 100 },
    { headerName: "Phone", field: "ContactNo", width: 130 },
    { headerName: "Address", field: "Address", width: 120 },
    { headerName: "Label", field: "StoreLabel", width: 120 },
    //{ headerName: "Description", field: "StoreDescription", width: 150 },
    { headerName: "Verification Level", field: "MaxVerificationLevel", width: 80 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: this.StoreSettingAction
    }
  ]

  public ParameterList = [
    { headerName: "Parameter GroupName", field: "ParameterGroupName", width: 70 },
    { headerName: "Parameter Name", field: "ParameterName", width: 130 },
    { headerName: "Parameter Value", field: "ParameterValue", width: 170 },
    { headerName: "ValueDataType", field: "ValueDataType", width: 70 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Parameter Type", field: "ParameterType", width: 80 },
    {
      headerName: "Action",
      field: "",

      width: 60,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                            Edit
                         </a>`
    }
  ]

  public CountryList = [
    { headerName: "Country Symbol", field: "CountryShortName", width: 100 },
    { headerName: "Name", field: "CountryName", width: 150 },
    { headerName: "ISD Code", field: "ISDCode", width: 120 },
    { headerName: "Is Active", field: "IsActive", width: 150 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  public ReactionList = [
    { headerName: "Reaction Code", field: "ReactionCode", width: 100 },
    { headerName: "Reaction Name", field: "ReactionName", width: 150 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  public SubDivisionList = [
    //{ headerName: "Map Area Code", field: "MapAreaCode", width:100},
    { headerName: "Sub DIvision Name", field: "CountrySubDivisionName", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 150 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }

  ]

  public MunicipalityList = [
    { headerName: "Municipality", field: "MunicipalityName", width: 100 },
    { headerName: "Country", field: "CountryName", width: 150 },
    { headerName: "Sub Division", field: "CountrySubDivisionName", width: 150 },
    { headerName: "Type", field: "Type", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 150 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      cellRenderer: this.MunicipalityActionButtonRenderer
    }

  ]

  public ImgTypeList = [
    { headerName: "Type Name", field: "ImagingTypeName", width: 150 },
    { headerName: "IsActive", field: "IsActive", width: 80 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  public ImgItemList = [
    { headerName: "Type", field: "ImagingTypeName", width: 150 },
    { headerName: "Item Name", field: "ImagingItemName", width: 150 },
    { headerName: "Procedure Code", field: "ProcedureCode", width: 150 },
    { headerName: "Price", field: "ImagingItemPrice", width: 120 },
    { headerName: "IsActive", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  //start:adt-settings
  public BedList = [
    { headerName: "Ward", field: "WardName", width: 150 },
    { headerName: "Bed Features", field: "BedFeatures", width: 150 },
    { headerName: "BedNumber", field: "BedNumber", width: 80 },
    { headerName: "BedCode", field: "BedCode", width: 80 },
    { headerName: "IsActive", field: "IsActive", width: 80 },
    { headerName: "Status", field: "IsOccupied", cellRenderer: this.BedStatusRenderer, width: 80 },
    {
      headerName: "Action",
      field: "",

      width: 80,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  public BedFeatureList = [
    { headerName: "Bed Feature", field: "BedFeatureName", width: 120 },
    { headerName: "Full Name", field: "BedFeatureFullName", width: 120 },
    { headerName: "Price", field: "BedPrice", width: 120 },
    { headerName: "IsActive", field: "IsActive", width: 100 },
    { headerName: "IsTaxApplicable", field: "TaxApplicable", width: 100 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  public WardList = [
    { headerName: "Ward", field: "WardName", width: 150, },
    { headerName: "Ward Code", field: "WardCode", width: 120, },
    { headerName: "Ward Location", field: "WardLocation", width: 120, },
    { headerName: "IsActive", field: "IsActive", width: 100, },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  public BedStatusRenderer(params) {
    if (params.data.IsActive) {
      if (params.data.IsOccupied)
        return 'Occupied';
      else
        return 'Available';
    } else {
      return 'N/A';
    }
  }

  //end:adt-settings

  //start:employee-settings
  public EmployeeList = [
    //Updated: sud-16Aug, removed cell-renderer since we're not getting that value from 'FullName' property.
    { headerName: "Name", field: "FullName", width: 270 },
    { headerName: "Gender", field: "Gender", width: 100 },
    { headerName: "Department", field: "DepartmentName", width: 170 },
    { headerName: "Role", field: "EmployeeRoleName", width: 90 },
    { headerName: "Contact No.", field: "ContactNumber", width: 120 },
    {
      headerName: "Action",
      field: "",

      width: 100,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    },
    { headerName: "IsActive", field: "IsActive", width: 90 },
    { headerName: "Type", field: "EmployeeTypeName", width: 80 },
    { headerName: "DOB", field: "", cellRenderer: this.DOBRenderer, width: 110 },
    { headerName: "JoinedOn", field: "", cellRenderer: this.EmpJoinedDateRenderer, width: 90 },
    { headerName: "ContactAddress", field: "ContactAddress", width: 120 },
    { headerName: "Email", field: "Email", width: 80, cellStyle: this.UserGridCellStyle },
    { headerName: "RoomNo", field: "RoomNo", width: 80 },
    { headerName: "Extension", field: "Extension", width: 90 },
    { headerName: "SpeedDial", field: "SpeedDial", width: 90 },
    { headerName: "OfficeHour", field: "OfficeHour", width: 90 },

  ]
  public EmployeeRoleList = [
    { headerName: "Role", field: "EmployeeRoleName", width: 100 },
    { headerName: "Description", field: "Description", width: 120 },
    {
      headerName: "Action",
      field: "",

      width: 80,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  public creditOrganizationList = [
    { headerName: "Organization Name", field: "OrganizationName", width: 100 },
    { headerName: "IsActive Status", field: "IsActive", width: 120 },
    {
      headerName: "Action",
      field: "",

      width: 80,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  public membershipList = [
    { headerName: "Community", field: "CommunityName", width: 120 },
    { headerName: "Membership Name", field: "MembershipTypeName", width: 120 },
    { headerName: "Discount %", field: "DiscountPercent", width: 100 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Isactive Status", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 80,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
         Edit
         </a>`
    }
  ]
  public EmployeeTypeList = [
    { headerName: "Type", field: "EmployeeTypeName", width: 100 },
    { headerName: "Description", field: "Description", width: 150 },
    {
      headerName: "Action",
      field: "",

      width: 80,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  public EmpJoinedDateRenderer(params) {
    let dob: string = params.data.DateOfJoining;
    if (dob)
      return moment(dob).format('YYYY-MM-DD');
    else
      return null;
  }
  public DOBRenderer(params) {
    let dob: string = params.data.DateOfBirth;
    if (dob)
      return moment(dob).format('YYYY-MM-DD');
    else
      return null;
  }
  //end:employee-settings
  //start: user
  public RoleList = [
    { headerName: "RoleName", field: "RoleName", width: 150 },
    { headerName: "RolePriority", field: "RolePriority", width: 100 },
    { headerName: "RoleDescription", field: "RoleDescription", width: 100 },
    { headerName: "ApplicationName", field: "ApplicationName", width: 100 },
    { headerName: "DefaultRouteName", field: "DefaultRouteName", width: 100 },
    {
      headerName: "Action",
      field: "",

      width: 180,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>
            <a danphe-grid-action="managePermission" class="grid-action">
               ManagePermission
             </a>`
    }
  ]
  public UserList = [
    { headerName: "Employee Name", field: "EmployeeName", width: 150 },
    { headerName: "User Name", field: "UserName", width: 120, cellStyle: this.UserGridCellStyle },
    { headerName: "Department Name", field: "DepartmentName", width: 120 },
    { headerName: "Email", field: "Email", width: 120, cellStyle: this.UserGridCellStyle },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: this.ManageUsesActionTemplate
      //width: 160,
      //template:
      //`<a danphe-grid-action="edit" class="grid-action">
      //    Edit
      // </a>
      //<a danphe-grid-action="resetPassword" class="grid-action">
      //    ResetPassword
      // </a>
      //<a danphe-grid-action="manageRole" class="grid-action">
      //   MangeRole
      // </a>`
    }
  ]

  public MunicipalityActionButtonRenderer(params) {
    let template = `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`;
    if (params.data.IsActive) {
      template += `<a danphe-grid-action="disable" class="grid-action bg-red red">
                Disable
             </a>`;
    }
    else {
      template += `<a danphe-grid-action="enable" class="grid-action">
                Enable
             </a>`;
    }
    return template;
  }

  //This is cell renderer function return Action List as per value for BillingItemList grid
  public ManageUsesActionTemplate(params) {

    if (params.data.IsActive == true) {
      let template =
        `
            <a danphe-grid-action="resetPassword" class="grid-action">
                ResetPassword
             </a>
            <a danphe-grid-action="manageRole" class="grid-action">
               MangeRole
             </a>
             <a danphe-grid-action="activateDeactivateUser" class="grid-action">
              Deactivate
            </a>`
      return template
    }
    else {
      let template =
        `<a danphe-grid-action="activateDeactivateUser" class="grid-action">
                Activate
               </a>`
      return template;
    }

  }  //This is cell renderer function return Action List as per value for BillingItemList grid
  public StoreSettingAction(params) {

    if (params.data.ParentStoreId == 0) {
      let template = '';
      return template
    }
    else if (params.data.IsActive == true) {
      let template =
        `<a danphe-grid-action="edit" class="grid-action" >
        Edit
        </a>
        <a danphe-grid-action="activateDeactivateStore" class="grid-action">
                Deactivate
        </a>`
      return template;
    }
    else {
      let template =
        `<a danphe-grid-action="activateDeactivateStore" class="grid-action">
                Activate
        </a>`
      return template;
    }

  }

  //end:user
  //remove text-transform for username and email since those might be case sensitive.
  public UserGridCellStyle(params) {
    return { 'text-transform': 'none' };
  }


  //Radiology Report Template columns setting
  public RADRemportTemplateList = [
    { headerName: "Module Name", field: "ModuleName", width: 150 },
    { headerName: "Template Code", field: "TemplateCode", width: 100 },
    { headerName: "Template Name", field: "TemplateName", width: 100 },
    //{ headerName: "Content", field: "TemplateHTML", width: 100 },//No need to load all template html code it's affect performance
    //{ headerName: "Created By", field: "CreatedBy", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 100,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>
           `
    }
  ]


  public ExtRefGridCols = [
    { headerName: "Name", field: "ReferrerName", width: 100 },
    { headerName: "Address", field: "ContactAddress", width: 150 },
    { headerName: "Contact No.", field: "ContactNumber", width: 120 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  public BanksGridCols = [
    { headerName: "Bank Short Name", field: "BankShortName", width: 100 },
    { headerName: "Bank Name", field: "BankName", width: 150 },
    { headerName: "Description", field: "Description", width: 120 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  public PrinterSettingGridColumns = [
    { headerName: "Printing Type", field: "PrintingType", width: 100 },
    { headerName: "Group Name", field: "GroupName", width: 100 },
    { headerName: "Printer Display Name", field: "PrinterDisplayName", width: 120 },
    { headerName: "Printer Name", field: "PrinterName", width: 120 },
    { headerName: "Model Name", field: "ModelName", width: 120 },
    { headerName: "Width_Lines", field: "Width_Lines", width: 120 },
    { headerName: "Height_Lines", field: "Height_Lines", width: 120 },
    { headerName: "HeaderGap_Lines", field: "HeaderGap_Lines", width: 120 },
    { headerName: "FooterGap_Lines", field: "FooterGap_Lines", width: 120 },
    { headerName: "mh", field: "mh", width: 120 },
    { headerName: "ml", field: "ml", width: 120 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      cellRenderer: this.PrinterSettingActionTemplate
      // template:
      //   `<a danphe-grid-action="edit" class="grid-action">
      //           Edit
      //        </a>`
    }
  ]

  public BillingItemNameRenderer(params) {
    let template = '';

    if (params.data.Doctor && params.data.Doctor.DoctorId > 0) {
      template = `<span>` + params.data.ItemName + `<b> (` + params.data.Doctor.DoctorName + `)</b></span>`
    }
    else {
      template = `<span>` + params.data.ItemName + `</span>`
    }
    return template;
  }

  public PrinterSettingActionTemplate(params) {
    if (params.data.IsActive == true) {
      let template =
        `<a danphe-grid-action="edit" class="grid-action" >
        Edit
        </a>
        <a danphe-grid-action="deactivatePrinterSetting" class="grid-action blinking-btn-warning" style="background-color: orange;color: black;">
                Deactivate
        </a>`
      return template;
    }
    else {
      let template =
        `<a danphe-grid-action="activatePrinterSetting" class="grid-action blinking-btn-secondary"  style="background-color: #afb8af;color: black;">
                Activate
        </a>`
      return template;
    }

  }

  public ICD10GroupList = [
    { headerName: "Reporting Group SN", field: "ReportingGroup_SN", width: 100 },
    { headerName: "Reporting Group Name", field: "ReportingGroupName", width: 150 },
    { headerName: "Disease Group SN", field: "DiseaseGroup_SN", width: 100 },
    { headerName: "Disease Group ICD10 Code", field: "DiseaseGroup_ICD", width: 150 },
    { headerName: "Disease Group Name", field: "DiseaseGroupName", width: 150 },
    { headerName: "ICD10 Code", field: "ICD10_Code", width: 150 },
    { headerName: "ICD10 Name", field: " ICD10_Name,", width: 150 },
    // { headerName: "Action", field: "", width: 120,
    //   template:  `<a danphe-grid-action="edit" class="grid-action"> Edit </a>`
    // }
  ]

  public PrintExportConfigurationColumns = [
    { headerName: "Setting Name", field: "SettingName", width: 140 },
    { headerName: "Page HeaderText", field: "PageHeaderText", width: 140 },
    { headerName: "Module Name", field: "ModuleName", width: 100 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      cellRenderer: this.PrinterExportConfigurationActionTemplate
    }
  ]

   public PrinterExportConfigurationActionTemplate(params) {
      let template =
        `<a danphe-grid-action="edit" class="grid-action" >
        Edit
        </a>`
      return template;
  }
}
