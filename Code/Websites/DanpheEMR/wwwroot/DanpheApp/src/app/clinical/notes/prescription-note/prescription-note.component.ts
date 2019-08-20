import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'prescription-note',
  templateUrl: "./prescription-note.html"
})
export class PrescriptionNoteComponent {

  public showAddPart: boolean = true;

  constructor(public changeDetector: ChangeDetectorRef) {

  }

  SaveNote() {
    this.showAddPart = false;
  }

  PrintNote() {
    this.showAddPart = false;


    let popupWinindow;
    var printContents = document.getElementById("note_to_print").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();
  }

}
