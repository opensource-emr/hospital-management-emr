import { Component, ViewChild, Output, EventEmitter, Input } from "@angular/core"
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { WebcamImage } from 'ngx-webcam';
@Component({
  selector: "danphe-photo-cropper",
  templateUrl: "./photo-cropper.html"
})
export class PhotoCropperComponent {

  @Input("action-type")
  actionType: string = "add-new";//default action type.

  //this is passed only for image edit.
  @Input("ipImage")
  ipImage: any = null;

  @Input("useWebCam")
  useCamera: boolean = true;

  @Input("maintainAspectRation")
  maintainAspectRatio: boolean = true;

  @Output("onCropSuccess")
  onCropSuccess: EventEmitter<object> = new EventEmitter<object>();

  @Output("onCropperClose")
  onCropperClosed: EventEmitter<object> = new EventEmitter<object>();

  //initiallly making showUploadBox unvisible
  public showUploadBox: boolean = false;

  public showWebcam: boolean = false;

  public showFileInput: boolean = false;

  public showDone: boolean = false;

  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  public trigger: Subject<void> = new Subject<void>();

  public brightness: number = 100;
  public grayscaleLevel: number = 50;
  public pathToImage: string = null;

  //Start: For File Selection
  @ViewChild("fileInput") fileInput;
  //cropping part
  imageChangedEvent: any = '';
  croppedImage: any = '';

  imageName: string = '';
  showCropPanel: boolean = true;

  imgToPass: any = ''; //this is empty initially

  constructor() {
    this.showUploadBox = true;
    this.showCropPanel = false;
    console.log("Photo cropper constructor called");
    let a = 0;
  }

  //this is inbuilt function, gets called after constructor
  ngOnInit() {
    if (this.actionType == "edit") {
      this.imgToPass = this.ipImage;
      this.showCropPanel = true;
      this.showDone = true;
    }
    else {
      if (this.useCamera) {
        this.OpenCamera();
      } else {
        this.showWebcam = false;
        this.showFileInput = true;
      }
    }
  }


  public triggerSnapshot(): void {
    this.trigger.next();
    this.showDone = true;
  }

  OpenUploadBox() {
    //making visible
    this.showUploadBox = true;
  }

  PostCroppedImg() {
    this.onCropSuccess.emit(this.croppedImage);
  }

  CloseBox() {
    //making invisible
    //this.showUploadBox = false;
    this.onCropperClosed.emit(null);//send whatever we need from here.
  }

  OpenCamera() {
    this.showWebcam = true;
    this.showDone = false;
    this.showFileInput = false;
    this.showCropPanel = false;
  }

  ChooseFromFile() {
    this.showFileInput = true;
    this.showDone = false;
    this.showWebcam = false;
    this.showCropPanel = false;
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
    this.imgToPass = webcamImage.imageAsDataUrl;
    this.showCropPanel = true;
    this.showWebcam = false;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public fileChangeEvent($event: any): void {
    this.readThis($event.target);
    this.showDone = true;
  }

  readThis(inputValue: any): void {
    var file: File = inputValue.files[0];
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imgToPass = myReader.result;
    }
    myReader.readAsDataURL(file);
    this.showCropPanel = true;
  }

  imageCropped(image: string) {
    this.croppedImage = image; //cropped image is passed to "image" variable
  }

  imageLoaded() {
    // show cropper
  }

  loadImageFailed() {
    // show message
  }

  CropSelImage() {
    this.showFileInput = false;
    this.showWebcam = false;
    //this.showCropPanel = false;
    this.imgToPass = this.croppedImage.base64; //image is stored in cropped image
  }

  //public Temp_GetInitialImage(): string {
  //    return `data:image/png;base64,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…`;
  //}
}
