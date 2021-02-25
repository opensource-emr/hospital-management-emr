//This grid is to show list of Lab Report Templates
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';

export default class MRGridColumnSettings {
  static BirthList = [
    { headerName: "Certificate No.", field: "CertificateNumber", width: 150},
    { headerName: "Mother Name", field: "ShortName", width: 125 },
    { headerName: "Father Name", field: "FathersName", width: 150 },
    { headerName: "Sex", field: "Sex", width: 75},
    { headerName: "Birth Date", field: "BirthDate", width: 100 },
    { headerName: "Birth Time", field: "BirthTime", width: 120 },
    { headerName: "Weight(gm)", field: "WeightOfBaby", width: 75},
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: `<a danphe-grid-action="view-birth-certificate" class="grid-action">Certificate</a>`
    }
  ];
  static DeathList = [
    { headerName: "Certificate No.", field: "CertificateNumber", width: 150 },
    { headerName: "Patient Name", field: "ShortName", width: 125 },
    { headerName: "Death Date", field: "BirthDate", width: 100 },
    { headerName: "Death Time", field: "BirthTime", width: 120 }, 
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: `<a danphe-grid-action="view-death-certificate" class="grid-action">Certificate</a>`
    }
  ];
}
