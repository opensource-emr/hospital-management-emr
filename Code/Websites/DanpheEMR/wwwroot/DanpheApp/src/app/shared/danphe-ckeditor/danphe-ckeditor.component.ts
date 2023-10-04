import { Component, Directive } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
declare var CKEDITOR: any;
@Component({
  selector: "danphe-ckeditor",
  templateUrl: "./danphe-ckeditor.html"
})
export class DanpheCkEditorComponent {
  public editorConfig: any;
  //set readonly or not property from client page
  @Input("readonly")
  public isReadOnly = true;

  @Input("panel-height")
  public panelHeight:string = "480px";//default is 480px, can be assigned from required pages.

  //input parameter input template data from other component
  @Input("set-html-content")
  public ckeditorContent: any = null;

  //output set to return editor html content 
  @Output("get-html-content")
  public getEditorContent: EventEmitter<any[]> = new EventEmitter<any[]>();

  //output set to return editor html content 
  @Output("get-shortcut")
  public getShortCutEvents: EventEmitter<any> = new EventEmitter<any>();


  constructor() {
    //this.editorConfig = { uiColor: "#99000" };
    this.editorConfig = {};
    //configure toolgroup or buttons from this editorConfig toolbarGroups property
    this.editorConfig.toolbarGroups = [
      { name: 'document', groups: ['mode'] },
      // { name: 'clipboard',   groups: [ 'undo' ] },
      { name: 'editing', groups: ['spellchecker'] },
      // { name: 'forms' },

      { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
      { name: 'paragraph', groups: ['list', 'indent', 'align'] },
      // { name: 'links' },
      { name: 'insert' },

      { name: 'styles', groups: ['styles'] },
      // { name: 'colors' },
      { name: 'tools' },
      // { name: 'others' },
      // { name: 'about' }
    ];
    //let btnsToRemove = 'Print,Preview,NewPage,Subscript,Superscript,Styles,Font';
    let btnsToRemove = 'Print,Preview,NewPage,Styles,Font';
    btnsToRemove += ',Redo,Cut,Copy,Paste,PasteText,PasteFromWord';
    btnsToRemove += ',ShowBlocks,Flash,Image,HorizontalRule,Smiley,PageBreak,Iframe';
    //remove selected buttons fromt the editor.
    this.editorConfig.removeButtons = btnsToRemove;
    this.editorConfig.removePlugins = 'elementspath,scayt';//to remove footer text.
    //this.editorConfig.height = '380px';
    this.editorConfig.height = this.panelHeight;//sud:28May'20
    this.editorConfig.disableNativeSpellChecker = false;//sud: 1June'19--it allows browser's default spellcheck to work
    this.editorConfig.tabSpaces = 4;//this will add 4 spaces when user clicks on Tab key, by default it goes outside of ckeditor (html property)
    // this.editorConfig.enterMode = "<br>";
    //this.editorConfig.autoParagraph = false;
  }

  ngOnInit() {
    this.editorConfig.height = this.panelHeight;//sud:28May'20
    this.getEditorContent.emit(this.ckeditorContent);
  }

  //ck editor data pass to client using event emitter
  //this event set output data
  onEditorChange(editoHtmlContent: any) {
    //console.log("From CK-Editor:" + editoHtmlContent);
    this.getEditorContent.emit(editoHtmlContent);
  }

  //this function is used to add/bind events to contentdom of ckEditor.
  onContentDom($event) {
    //need below console logs for testing, pls don't remove.
    //console.log("from CK-Editor- onContentDom");
    //console.log($event);

    //we can't access 'this' inside below function, so taken it in local scope. -- this-that issue of javascript.
    let shortCutEvent = this.getShortCutEvents;

    var body = $event.editor.document.getBody();

    // This listener will be deactivated once editor dies.
    $event.editor.editable().attachListener(body, 'keydown', function (e) {
      var keyEvent = e.data.$;
      if (keyEvent) {
        var keyCharCode = keyEvent.which || keyEvent.keyCode;
        if (keyEvent.ctrlKey && String.fromCharCode(keyCharCode).toUpperCase() == "S") {
          keyEvent.preventDefault();
          console.log("CTRL-S key down from ck-editor dom");
          shortCutEvent.emit({ name: "CTRL+S" });

          
        }
        else if (keyEvent.ctrlKey && String.fromCharCode(keyCharCode).toUpperCase() == "P") {
          keyEvent.preventDefault();
          
          console.log("CTRL-P  key down from ck-editor dom");
          shortCutEvent.emit({ name: "CTRL+P" });
        }
      }

    });


    
    //$event.editor.document.on('keydown', function (e) {
    //  var keyEvent = e.data.$;

    //  if (keyEvent) {
    //    var keyCharCode = keyEvent.which || keyEvent.keyCode;
    //    if (keyEvent.ctrlKey && String.fromCharCode(keyCharCode).toUpperCase() == "S") {
    //      keyEvent.preventDefault();
    //      shortCutEvent.emit({ name: "CTRL+S" });

    //      console.log("CTRL-S- key down from custom code");
    //    }
    //    else if (keyEvent.ctrlKey && String.fromCharCode(keyCharCode).toUpperCase() == "P") {
    //      keyEvent.preventDefault();
    //      shortCutEvent.emit({ name: "CTRL+P" });
    //      console.log("CTRL-P- key down from custom code");
    //    }
    //  }

    //});

  }



}
