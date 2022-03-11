import * as moment from "moment/moment";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";

export default class VerificationGridColumns {
  static RequisitionList = [
    { headerName: "Req.No", field: "RequisitionNo", width: 35 },
    { headerName: "StoreName", field: "StoreName", width: 80 },
    {
      headerName: "Requested On",
      field: "RequisitionDate",
      width: 80,
      cellRenderer: VerificationGridColumns.RequisitionDateOnlyRenderer
    },
    { headerName: "Req. Status", field: "RequisitionStatus", width: 40 },
    {
      headerName: "Verification Status",
      width: 100,
      cellRenderer: VerificationGridColumns.VerificationStatusRenderer
    },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: `<a danphe-grid-action="view" class="grid-action">
            View
         </a>`
    }
  ];
  static PurchaseRequestList = [
    { headerName: "PR No.", field: "PRNumber", width: 40 },
    { headerName: "Requested On", field: "RequestDate", width: 80 },
    { headerName: "Request From", field: "RequestFromStoreName", width: 100 },
    { headerName: "RequestedBy", field: "RequestedByName", width: 100 },
    { headerName: "Vendor", field: "VendorName", width: 100 },
    { headerName: "Status", field: "RequestStatus", width: 40 },
    { headerName: "Verification Status", width: 100, cellRenderer: VerificationGridColumns.VerificationStatusRenderer },
    { headerName: "PO Created", field: "IsPOCreated", width: 60, cellRenderer: VerificationGridColumns.YesNoViewerforPurchaseRequest },
    { headerName: "Action", field: "", width: 120, template: `<a danphe-grid-action="view" class="grid-action">View</a>` }
  ]
  static PurchaseOrderList = [
    { headerName: "PO No", field: "PONumber", width: 110 },
    { headerName: "Req No", field: "RequisitionId", width: 110 },
    { headerName: "PO From", field: "OrderFromStoreName", width: 110 },
    { headerName: "Vendor", field: "VendorName", width: 110 },
    {
      headerName: "PO Date",
      field: "PoDate",
      width: 100,
      cellRenderer: VerificationGridColumns.PurchaseOrderDateOnlyRenderer,
    },
    { headerName: "PO Status", field: "POStatus", width: 110 },
    {
      headerName: "Verification Status",
      width: 100,
      cellRenderer: VerificationGridColumns.VerificationStatusRenderer
    },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: `<a danphe-grid-action="verify" class="grid-action">
            Verify
         </a>`
    }
  ]
  static GRList = [
    { headerName: "GR No", field: "GoodsReceiptNo", width: 110 },
    {
      headerName: "GR Date",
      field: "GoodsReceiptDate",
      width: 100,
      cellRenderer: VerificationGridColumns.GRDateOnlyRenderer,
    },
    { headerName: "PO.No", field: "PurchaseOrderId", width: 110 },
    { headerName: "Vendor", field: "VendorName", width: 110 },
    { headerName: "Bill No.", field: "BillNo", width: 50 },
    { headerName: "Pay. Mode", field: "PaymentMode", width: 60 },
    {
      headerName: "Verification Status",
      width: 100,
      cellRenderer: VerificationGridColumns.VerificationStatusRenderer
    },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: `<a danphe-grid-action="verify" class="grid-action">
            Verify
         </a>`
    }
  ]

  static VerificationStatusRenderer(params) {
    if (params.data.MaxVerificationLevel > 0) {
      return (
        "<span>" +
        params.data.CurrentVerificationLevelCount +
        " verified out of " +
        params.data.MaxVerificationLevel +
        "</span"
      );
    }
    else {
      return "N/A";
    }
  }
  static RequisitionDateOnlyRenderer(params) {
    let date: string = params.data.RequisitionDate;
    return moment(date).format("YYYY-MM-DD");
  }
  static PurchaseOrderDateOnlyRenderer(params) {
    let date: string = params.data.PoDate;
    return moment(date).format("YYYY-MM-DD");
  }
  static GRDateOnlyRenderer(params) {
    let date: string = params.data.GoodsReceiptDate;
    if (date)
      return moment(date).format('YYYY-MM-DD');
    else
      return null;
  }
  static YesNoViewerforPurchaseRequest(params) {
    if (params.data.IsPOCreated == true) {
      let template =
        `
                    <span style="background-color:#4CAF50">&nbsp;&nbsp;&nbsp; Yes &nbsp;&nbsp;&nbsp;</span>
                `
      return template
    }
    else {
      let template =
        `
                    <span style="background-color:#F44336">&nbsp;&nbsp;&nbsp; No&nbsp;&nbsp;&nbsp;</span>
                `
      return template;
    }
  }
}
