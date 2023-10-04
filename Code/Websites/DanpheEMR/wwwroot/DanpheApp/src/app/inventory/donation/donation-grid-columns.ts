
import { DanpheDateTime } from '../../shared/pipes/danphe-datetime.pipe';

export default class DonationGridColumnSettings {
  static DonationList = [
    { headerName: "S.N", field: "SerialNumber", width: 80 },
    { headerName: "Donation No", field: "DonationNo", width: 100 },
    { headerName: "Donated to", field: "VendorName", width: 100 },
    { headerName: "Donation Date", field: "DonatedDate", width: 100 },
    { headerName: "Donation Ref No", field: "DonationReferenceNo", width: 120 },
    { headerName: "Donation Ref Date", field: "DonationReferenceDate", width: 120 },
    { headerName: "Total Value ", field: "TotalAmount", width: 100 },
    { headerName: "Username ", field: "Username", width: 120 },
    { headerName: "Remarks ", field: "Remarks", width: 120 },
    {
      headerName: "Action",
      field: "",
      width: 120,
      cellRenderer: DonationGridColumnSettings.DonationActionList
    },
  ];
  static DonationActionList() {
    let template = ` 
                <a danphe-grid-action="view" class="grid-action">
                  View
                </a>`;
    return template;
  }
  static datTime: DanpheDateTime = new DanpheDateTime();



}
