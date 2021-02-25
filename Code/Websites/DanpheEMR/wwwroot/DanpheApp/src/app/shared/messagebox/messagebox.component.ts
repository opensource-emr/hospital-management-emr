import { Component, Directive } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
import { MessageboxService } from './messagebox.service';

@Component({
  selector: "danphe-msgbox",
  templateUrl: "./messagebox.html"
})
export class MessageBoxComponent {
  @Input("showmsgbox")
  public showmsgbox: boolean = false;
  @Input("status")
  public status: string = "";
  @Input("message")
  public message: string = "";


  constructor(public msgBoxService: MessageboxService) {

  }
  ngOnChanges(changes) {

  }
  Close(ind: number) {
    this.msgBoxService.hide(ind);
  }

}
