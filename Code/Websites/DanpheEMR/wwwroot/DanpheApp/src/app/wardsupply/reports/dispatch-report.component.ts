import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { WardSupplyBLService } from "../shared/wardsupply.bl.service";
import WARDGridColumns from "../shared/ward-grid-cloumns";


@Component({
  selector: 'my-app',

  templateUrl: "./dispatch-report.html" 

})
export class WardDispatchReportComponent {

}
