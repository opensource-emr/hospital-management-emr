import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
export default class PayrollGridColumns {
  static HolidayList = [
    // { headerName: "Sr.No", field: "SN", width: 50 },
    { headerName: "Holiday", field: "Title", width: 120 },
    { headerName: "Date", field: "Date", width: 120,cellRenderer: PayrollGridColumns.DateOnlyRenderer },
    { headerName: "Description", field: "Description", width: 120 },
    { headerName: "Create Date", field: "CreatedOn", width: 120 ,cellRenderer: PayrollGridColumns.CreatedOnDateOnlyRenderer},
    { headerName: "Approved By", field: "ApprovedBy", width: 120 },
    {
      headerName: "Actions",

      field: "",
      width: 150,
      template:
        `<a danphe-grid-action="edit" class="grid-action"><i class="icon-pencil"></i> Edit </a> 
         <a danphe-grid-action="delete" class="grid-action"><i class="glyphicon glyphicon-trash"></i>Delete</a >`      
    }
  ]

  static CreatedOnDateOnlyRenderer(params) {
    let date: string = params.data.CreatedOn;
    return moment(date).format('YYYY-MM-DD');
  }
  static DateOnlyRenderer(params) {
    let date: string = params.data.Date;
    return moment(date).format('YYYY-MM-DD');
  }
}
