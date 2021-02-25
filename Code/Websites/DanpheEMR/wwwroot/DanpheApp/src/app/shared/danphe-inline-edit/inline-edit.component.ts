import {
  Component,
  Input, Output, EventEmitter,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  Renderer,
  forwardRef,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const INLINE_EDIT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InlineEditComponent),
  multi: true
};

@Component({
  selector: 'app-inline-edit',
  templateUrl: './inline-edit.html',
  providers: [INLINE_EDIT_CONTROL_VALUE_ACCESSOR],
  styleUrls: ['./inline-edit.component.css']
})

export class InlineEditComponent implements ControlValueAccessor, OnInit {

  @ViewChild('inlineEditControl') inlineEditControl: ElementRef; // input DOM element

  @Input() type: string = 'text'; // The type of input element
  public ipvalue: string = ''; // variable for input value
  public preValue: string = ''; // The value before clicking to edit
  public editing: boolean = false; // Is Component in edit mode?
  public onChange: any = Function.prototype; // Trascend the onChange event
  public onTouched: any = Function.prototype; // Trascend the onTouch event

  @Output("getBack") getBack: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("tooltip-text")
  tooltipText: string = "click to edit";//sud:12Mar'20-needed to show different tooltip in different place.

  @Input("isTextArea")
  isTextArea: boolean = false;

  constructor(element: ElementRef, private _renderer: Renderer, public changeDetector: ChangeDetectorRef) {
  }

  // Control Value Accessors for ngModel
  get value(): any {
    return this.ipvalue;
  }

  set value(v: any) {
    if (v !== this.ipvalue) {
      this.ipvalue = v;
      this.onChange(v);
    }
  }


  // Required for ControlValueAccessor interface
  writeValue(value: any) {
    this.ipvalue = value;
  }

  // Required forControlValueAccessor interface
  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  // Required forControlValueAccessor interface
  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  // Do stuff when the input element loses focus
  onBlur($event: Event) {
    this.editing = false;
    //sud:12Mar'20-Null case was 
    if (this.ipvalue != null && this.ipvalue.trim() != this.preValue.trim()) {
      //if (this.ipvalue.trim() == '') { this.ipvalue = 'Add Range' }
      this.getBack.emit({ value: this.ipvalue });
    }
  }

  // Do stuff when the input element loses focus
  onTextAreaBlur($event: Event) {
    this.editing = false;
    //sud:12Mar'20-Null case was 
    if (this.ipvalue != null && this.ipvalue.trim() != this.preValue.trim()) {
      //if (this.ipvalue.trim() == '') { this.ipvalue = 'Add Range' }
      this.getBack.emit({ value: this.ipvalue });
    }
  }


  // Start the editting process for the input element
  edit(value) {
    this.preValue = value ? value : "";//set to empty else it'll crash during trim because of null.
    this.editing = true;
    // Focus on the input element just as the editing begins
    this.changeDetector.detectChanges();
    this.inlineEditControl.nativeElement.focus();
  }

  ngOnInit() {
  }
}
