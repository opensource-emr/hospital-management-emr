import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
export default class WARDGridColumns {

  static WARDStockDetailsList = [

    { headerName: "Ward Name", field: "WardName", width: 100 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Batch No", field: "BatchNo", width: 90 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: WARDGridColumns.DateOfExpiry },
    { headerName: "Available Quantity", field: "AvailableQuantity", width: 100 },
    { headerName: "MRP", field: "MRP", width: 80 },
    {
      headerName: "Action",
      field: "",
      width: 150,
      template: `<a danphe-grid-action="transfer-stock" class="grid-action"> Transfer </a>
                       <a danphe-grid-action="breakage-stock" class="grid-action"> Breakage </a>`
    }

  ]
  static WARDInventoryStockDetailsList = [

    { headerName: "Department Name", field: "DepartmentName", width: 100 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Available Quantity", field: "Quantity", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 150,
      template: `<a danphe-grid-action="transfer-inventory-stock" class="grid-action"> Transfer </a>`
    }

  ]
  static ConsumptionDetailsList = [

    { headerName: "Patient Name", field: "Name", width: 150 },
    { headerName: "Address", field: "Address", width: 150 },
    { headerName: "Gender", field: "Gender", width: 100 },
    { headerName: "PhoneNumber", field: "PhoneNumber", width: 150 },
    { headerName: "Ward Name", field: "WardName", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 80 },
    { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' }

  ]
  // all pending or completed ward request list.  
  static WARDRequestList = [
    { headerName: "Ward Name", field: "WardName", width: 150 },
    { headerName: "Requested By", field: "CreatedBy", width: 150 },
    { headerName: "Date", field: "Date", width: 100, cellRenderer: WARDGridColumns.DateOnlyRenderer },
    { headerName: "Status", field: "Status", width: 100 },
    { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' },
  ]
  // Ward-Inventory Consumption List
  static InventoryConsumptionList = [

    { headerName: "Department Name", field: "DepartmentName", width: 150 },
    { headerName: "Used By", field: "UsedBy", width: 150 },
    { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' }

  ]
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



  // Ward Supply Report
  //Ward Stock Report
  static WardStockReport = [
    { headerName: "Ward Name", field: "WardName", width: 100 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "BatchNo", field: "BatchNo", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 50 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 110, cellRenderer: WARDGridColumns.DateOfExpiry },
    { headerName: "MRP", field: "MRP", width: 90 },
  ]

  //Ward Requisition Report
  static WardRequsitionReport = [
    { headerName: "Requested Date", field: "RequestedDate", width: 90 },
    { headerName: "Dispatch Date", field: "DispatchDate", width: 90, },
    { headerName: "Ward Name", field: "WardName", width: 70 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Request Qty", field: "RequestedQty", width: 90 },
    { headerName: "Dispatch Qty", field: "DispatchQty", width: 100 },
    { headerName: "MRP", field: "MRP", width: 90 },
    { headerName: "TotalAmt", field: "TotalAmt", width: 90 },
  ]

  //Ward Consumption Report
  static WardConsumptionReport = [
    { headerName: "Date", field: "Date", width: 90 },
    { headerName: "Ward Name", field: "WardName", width: 70 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Generic Name", field: "GenericName", width: 100 },
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
    { headerName: "Ward Name", field: "WardName", width: 100 },
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
    { headerName: "FromWard", field: "FromWard", width: 90 },
    { headerName: "ToWard", field: "ToWard", width: 90 },
    { headerName: "Remarks", field: "Remarks", width: 90 },
  ]


  //// Ward Inventory Report
  //RequisitionDispatchReport Report
  static RequisitionDispatchReport = [
    { headerName: "RequisitionDate", field: "RequisitionDate", width: 90 },
    { headerName: "DispatchDate", field: "DispatchDate", width: 90 },
    { headerName: "DepartmentName", field: "DepartmentName", width: 150 },
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "RequestQty", field: "RequestQty", width: 90 },
    { headerName: "ReceivedQty", field: "ReceivedQuantity", width: 90 },
    { headerName: "PendingQty", field: "PendingQuantity", width: 90 },
    { headerName: "DispatchedQty", field: "DispatchedQuantity", width: 90 },
    { headerName: "Remarks", field: "Remark", width: 90 },
  ]

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
}
