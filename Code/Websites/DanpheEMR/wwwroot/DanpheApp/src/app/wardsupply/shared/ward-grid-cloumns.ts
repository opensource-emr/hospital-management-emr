import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
export default class WARDGridColumns {

  static WARDStockDetailsList = [
    { headerName: "Generic Name", field: "GenericName", width: 150 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Batch No", field: "BatchNo", width: 90 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: WARDGridColumns.ExpiryDate },
    { headerName: "Available Quantity", field: "AvailableQuantity", width: 100 },
    { headerName: "MRP", field: "MRP", width: 80 },
    {
      headerName: "Action",
      field: "",
      width: 150,
      template: `<a danphe-grid-action="breakage-stock" class="grid-action"> Breakage </a>`
    }

  ]

  static InternalConsumptionList = [

    { headerName: "Ward Name", field: "WardName", width: 100 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Batch No", field: "BatchNo", width: 90 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: WARDGridColumns.DateOfExpiry },
    { headerName: "Available Quantity", field: "AvailableQuantity", width: 100 },
    { headerName: "MRP", field: "MRP", width: 80 },



  ]

  static ShowInternalConsumptionList = [
    { headerName: "Consumed Date", field: "ConsumedDate", width: 150, cellRenderer: WARDGridColumns.ConsumptionDate },
    { headerName: "Department Name", field: "DepartmentName", width: 150 },
    { headerName: "Consumed By", field: "ConsumedBy", width: 150 },
    { headerName: "Remark", field: "Remark", width: 150 },
    { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' }
  ]

  static WARDInventoryStockDetailsList = [
    { headerName: "Item Code", field: "Code", width: 150 },
    { headerName: '', field: '', width: 16, cellRenderer: WARDGridColumns.ColdStorageIconRenderer },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Unit", field: "UOMName", width: 150 },
    { headerName: "Available Quantity", field: "AvailableQuantity", width: 100, cellRenderer: WARDGridColumns.QuantityColorWarningRenderer },
    { headerName: "Item Type", field: "ItemType", width: 100 },
  ]
  static ColdStorageIconRenderer(params) {
    var template = (params.data.IsColdStorageApplicable == true) ? `<b title="Cold Storage Item" style="background: #0773bc;border: 1px solid blue;border-radius: 60%;padding: 2px 4px;color: #f8f8f8;">C</b>` : '';
    return template;
  }
  static ConsumptionDetailsList = [

    { headerName: "Patient Name", field: "Name", width: 150 },
    { headerName: "Address", field: "Address", width: 150 },
    { headerName: "Gender", field: "Gender", width: 100 },
    { headerName: "PhoneNumber", field: "PhoneNumber", width: 150 },
    { headerName: "Ward Name", field: "WardName", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 80 },
    { headerName: "Action", field: "", width: 100, template: `<a danphe-grid-action="view" class="grid-action">View</a> <a danphe-grid-action="showDetails" class="grid-action">Show Details</a>` }

  ]


  // all pending or completed ward request list.  
  static WARDRequestList = [
    { headerName: "Requested By", field: "CreatedBy", width: 150 },
    { headerName: "Date", field: "Date", width: 100, cellRenderer: WARDGridColumns.DateOnlyRenderer },
    { headerName: "Status", field: "Status", width: 100 },
    { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' },
  ]
  // Ward-Inventory Consumption List
  static InventoryConsumptionList = [
    { headerName: "Consumed Date", field: "ConsumptionDate", width: 100, cellRenderer: WARDGridColumns.DateTimeRenderer },
    { headerName: "Consumed Item", field: "ItemName", width: 100 },
    { headerName: "Consumed Qty", field: "Quantity", width: 100 },
    { headerName: "Entered By", field: "UsedBy", width: 150 },
    { headerName: "Remarks", field: "Remark", width: 150 }
    //{ headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' }

  ]
  static QuantityColorWarningRenderer(params) {

    //let invthresholdmargin = params.data.MinQuantity;
    let quantity = params.data.AvailableQuantity;
    let minimumQuantity = params.data.MinimumQuantity;
    if (quantity == 0) {
      return (
        "<div style='width:50%;background-color:red;'>" +
        quantity +
        "</div>"
      );
    } else if (quantity <= minimumQuantity) {
      return (
        "<div style='width:50%;background-color:yellow;'>" +
        quantity +
        "</div>"
      );
    } else {
      return "<div style='width:50%'>" + quantity + "</div>";
    }

  }
  static ExpiryDate(params) {
    return moment(params).format('LL');
  }
  static DateOfExpiry(params) {
    let expiryDate: Date = params.data.ExpiryDate;
    let expiryDate1 = new Date(params.data.ExpiryDate)
    let date = new Date();
    let datenow = date.setMonth(date.getMonth() + 0);
    let datethreemonth = date.setMonth(date.getMonth() + 3);
    let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

    if (expDate <= datenow) {
      return "<span style='background-color:red;color:white'>" + expiryDate + "(" + "Exp" + ")" + "</span>";
    }
    if (expDate < datethreemonth && expDate > datenow) {

      return "<span style='background-color:yellow;color:black'>" + expiryDate + "(" + "N. Exp" + ")" + "</span>";
    }
    if (expDate > datethreemonth) {

      return "<span style='background-color:white;color:black'>" + expiryDate + "</span>";
    }
  }

  //WARD: getting date
  static DateOnlyRenderer(params) {
    let Date: string = params.data.Date;
    return moment(Date).format('DD-MMM-YYYY');
  }

  //displays date and time in hour:minute
  static DateTimeRenderer(params) {
    return moment(params.data.CreatedOn).format("YYYY-MM-DD HH:mm");
  }
  //displays date and time in hour:minute
  static ConsumptionDateRenderer(params) {
    return moment(params.data.ConsumptionDate).format("YYYY-MM-DD");
  }
  static ConsumptionDate(params) {

    return moment(params.data.ConsumedDate).format("lll");
  }
  // Ward Supply Report
  //Ward Stock Report
  static WardStockReport = [
    { headerName: "Generic Name", field: "GenericName", width: 150 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "BatchNo", field: "BatchNo", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 50 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 110, cellRenderer: WARDGridColumns.DateOfExpiry },
    { headerName: "MRP", field: "MRP", width: 90 },
  ]

  //Ward Requisition Report
  static WardRequsitionReport = [
    { headerName: "Req.Id", field: "RequisitionId", width: 30 },
    { headerName: "Dis.Id", field: "DispatchId", width: 30 },
    { headerName: "Requested Date", field: "RequestedDate", width: 90 },
    { headerName: "Dispatch Date", field: "DispatchDate", width: 90, },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Request Qty", field: "RequestedQty", width: 70 },
    { headerName: "Dispatch Qty", field: "DispatchQty", width: 70 },
    { headerName: "MRP", field: "MRP", width: 60 },
    { headerName: "TotalAmt", field: "TotalAmt", width: 70 },
    { headerName: "Req.User", field: "RequestedByUser", width: 90 },
    { headerName: "Dis.User", field: "DispatchedByUser", width: 90 },
    { headerName: "ReceivedBy", field: "ReceivedBy", width: 90 },
  ]

  //Ward Consumption Report
  static WardConsumptionReport = [
    { headerName: "Date", field: "Date", width: 90 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Generic Name", field: "GenericName", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 90 },
  ]
  ///Ward Internal Consumption
  static WardInternalConsumptionReport = [
    { headerName: "Consumed Date", field: "ConsumedDate", width: 90 },
    { headerName: "Department Name", field: "DepartmentName", width: 150 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Consumed By", field: "ConsumedBy", width: 90 },
    { headerName: "Quantity", field: "Quantity", width: 90 },

  ]

  //Ward Dispatch Report
  static WardDispatchReport = [
    { headerName: "Date", field: "Date", width: 90 },
    { headerName: "Ward Name", field: "WardName", width: 100 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Request Qty", field: "RequestedQty", width: 90 },
    { headerName: "Dispatch Qty", field: "DispatchQty", width: 90 },
  ]

  //Ward Breakage Report
  static WardBreakageReport = [
    { headerName: "Date", field: "Date", width: 90 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Quantity", field: "Quantity", width: 90 },
    { headerName: "MRP", field: "MRP", width: 90 },
    { headerName: "Total Amount", field: "TotalAmt", width: 90 },
    { headerName: "Remarks", field: "Remarks", width: 90 },
  ]

  //Ward Transfer Report
  static WardTransferReport = [
    { headerName: "Date", field: "Date", width: 90 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "TransferQty", field: "TransferQty", width: 90 },
    { headerName: "Remarks", field: "Remarks", width: 90 },
    { headerName: "TransferedBy", field: "TransferedBy", width: 90 },
    { headerName: "ReceivedBy", field: "ReceivedBy", width: 90 },
  ]


  //// Ward Inventory Report
  //RequisitionDispatchReport Report
  static RequisitionDispatchReport = [
    { headerName: "RequisitionDate", field: "RequisitionDate", width: 90, cellRenderer: WARDGridColumns.RequisitionDateRenderer },
    { headerName: "DispatchDate", field: "DispatchDate", width: 90, cellRenderer: WARDGridColumns.DispatchDateRenderer },
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "RequestQty", field: "RequestQty", width: 90 },
    { headerName: "ReceivedQty", field: "ReceivedQuantity", width: 90 },
    { headerName: "PendingQty", field: "PendingQuantity", width: 90 },
    { headerName: "DispatchedQty", field: "DispatchedQuantity", width: 90 },
    { headerName: "Remarks", field: "Remark", width: 90 },
  ]
  static RequisitionDateRenderer(params) {
    return moment(params.data.RequisitionDate).format("YYYY-MM-DD");
  }
  static DispatchDateRenderer(params) {
    if (params.data.DispatchDate)
      return moment(params.data.DispatchDate).format("YYYY-MM-DD");
  }

  //TransferReport Report
  static TransferReport = [
    { headerName: "Date", field: "Date", width: 90, cellRenderer: WARDGridColumns.DateOnlyRenderer },
    { headerName: "DepartmentName", field: "DepartmentName", width: 150 },
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "TransferQty", field: "Quantity", width: 90 },
    { headerName: "Remarks", field: "Remarks", width: 90 },
    { headerName: "TransferBy", field: "CreatedBy", width: 90 },
  ]

  //ConsumptionReport Report
  static ConsumptionReport = [
    { headerName: "Date", field: "Date", width: 90, cellRenderer: WARDGridColumns.DateOnlyRenderer },
    { headerName: "DepartmentName", field: "DepartmentName", width: 150 },
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "Quantity", field: "Quantity", width: 90 },
    { headerName: "User", field: "User", width: 90 },
    { headerName: "Remark", field: "Remark", width: 90 },
  ]
  static InstallationOfDate(params) {
    let date: string = params.data.InstallationOfDate;
    return moment(date).format("YYYY-MM-DD");

  };
  //FixedAssets Stock list
  static WARDAssetsStockGridColumns = [
    { headerName: "Item Code", field: "ItemCode" },
    { headerName: "Bar Code", field: "BarCodeNumber" },
    { headerName: "Item Name", field: "ItemName" },
    { headerName: "Vendor Name", field: "VendorName" },
    { headerName: "Installation Date", field: "InstallationOfDate", cellRenderer: WARDGridColumns.InstallationOfDate, },
    { headerName: "Serial No", field: "SerialNo" },
    { headerName: "Asset Location", field: "AssetsLocation", cellRenderer: WARDGridColumns.LocationHistory },
    { headerName: "Batch No", field: "BatchNo" },
    {
      headerName: "Action", field: "", width: 100,
      cellRenderer: WARDGridColumns.AssetStockActionRenderer
    }
  ]
  static LocationHistory(params) {
    if (params.data.AssetsLocation == null) {
      return "No Location"
    }
    else {
      return params.data.AssetsLocation;
    }
  }
  static AssetStockActionRenderer(params) {
    let template = `<a danphe-grid-action="print-barcode" class="grid-action-icon fixed-asset-action fa fa-barcode" title="Print Barcode"></a>`;
    if (params.data.CssdStatus == 'pending'   )
      template += `<span class="grid-action-icon fixed-asset-action fa fa-exchange dark" title="Already Sent To CSSD"></span>`;
    else if(params.data.IsCssdApplicable != null)
      template += `<a danphe-grid-action="send-to-cssd" class="grid-action-icon fixed-asset-action fa fa-exchange" title="Send To CSSD"></a>`;
    return template;
  }
 
   //FixedAssets Requisition from Substore
   static SubstoreAssetRequisitionList = [
    { headerName: "Req.No", field: "RequisitionNo", width: 45 },
    { headerName: "StoreName", field: "StoreName", width: 80 },
    {
      headerName: "Date",
      field: "RequisitionDate",
      width: 80,
      cellRenderer: GridColumnSettings.RequisitionDateOnlyRenderer,
    },
    {headerName: "Created By", field:"EmpFullName", width:100},
    { headerName: "Status", field: "RequisitionStatus", width: 80 },    
    {
      headerName: "Action",
      field: "",
      width: 200,
      template:
      `<a danphe-grid-action="view" class="grid-action">
        View
      </a>
      <a danphe-grid-action="dispatchList" class="grid-action"> Dispatch List</a> 
      <a danphe-grid-action="receiveItems" class="grid-action"> Receive Items</a> `
      
    }
  ]
   //FixedAssets Return from Substore
   static SubstoreAssetReturnList = [

    { headerName: "StoreName", field: "StoreName", width: 80 },
    {
      headerName: "Date",
      field: "ReturnDate",
      width: 80,
      cellRenderer: WARDGridColumns.ReturnDateOnlyRenderer,
    },
    { headerName: "Returned By", field: "EmpFullName", width: 100 },
    { headerName: "Remark", field: "Remarks", width: 80 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      template:
        `<a danphe-grid-action="view" class="grid-action">
      View
    </a>`
    }
  ]
  static ReturnDateOnlyRenderer(params) {
    let date: string = params.data.ReturnDate;
    return moment(date).format("YYYY-MM-DD");
  }

  static InventoryPatientConsumptionList = [
    { headerName: "Hospital No.", field: "HospitalNo", width: 100 },
    { headerName: "Patient Name", field: "PatientName", width: 100 },
    { headerName: "Consumption Date", field: "ConsumptionDate", width: 100 },
    { headerName: "Entered By", field: "EnteredBy", width: 150 },
    { headerName: "Remarks", field: "Remark", width: 150 },
    { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View Receipt</a>' }

  ]
  static ReqDispatchList = [
    { headerName: "Dispatch Id", field: "DispatchId", width: 50 },
    { headerName: "Requisition No", field: "RequisitionId", width: 150 },
    { headerName: "Store Name", field: "StoreName", width: 150 },
    { headerName: "SubStore Name", field: "SubStoreName", width: 150 },
    {
      headerName: "Dispatch Date",
      field: "Dispatchdate",
      width: 150,
      cellRenderer: WARDGridColumns.DispatchDateRender,
    },
    { headerName: "Received By", field: "ReceivedBy", width: 100 },
    { headerName: "Dispatched By", field: "DispatcheBy", width: 150 },
   
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: `<a danphe-grid-action="view" class="grid-action">
               View
             </a>`,
    },
  ];
  static DispatchDateRender(params) {
    let date: string = params.data.Dispatchdate;
    return moment(date).format('yyyy-mm-hh');
  }
}
