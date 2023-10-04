import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { UploadedFile } from '../../../shared/DTOs/uploaded-files-DTO';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_MessageBox_Status, ENUM_ValidFileFormats } from '../../../shared/shared-enums';
import { InsurancePendingClaim } from '../DTOs/ClaimManagement_PendingClaims_DTO';

@Component({
    selector: 'document-upload',
    templateUrl: './document-upload.component.html'
})
export class DocumentUploadComponent {

    @Input("PatientContext")
    public patientInfo: InsurancePendingClaim = new InsurancePendingClaim();

    @Output("documentUpload-close")
    PopUpCloseEmitter: EventEmitter<Object> = new EventEmitter<Object>();

    @Output("document-upload")
    UploadDocumentEmitter: EventEmitter<Object> = new EventEmitter<Object>();

    public files = Array<File>();
    public NewFiles = Array<File>();

    public UploadedFiles: Array<UploadedFile> = new Array<UploadedFile>();
    constructor(
        private messageBoxService: MessageboxService
    ) { }

    ngOnInit() {
    }

    public ClosDocumentUploadPopUp(): void {
        this.PopUpCloseEmitter.emit();
    }
    public SelectFiles(event: any): void {
        if (event) {
            this.NewFiles = Array.from(event.target.files);
            if (this.CheckForValidFileFormat(this.NewFiles)) {
                this.files = [...this.files, ...this.NewFiles];
                this.UploadedFiles = [];
                this.files.forEach(file => {
                    let document = new UploadedFile();
                    document.FileDisplayName = file.name;
                    document.FileExtension = file.type
                    document.Size = file.size;
                    document.UploadedOn = moment().format('YYYY-MM-DD');
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        const tempFile = reader.result.toString();
                        const indx = tempFile.indexOf(',');
                        const binaryString = tempFile.substring(indx + 1);
                        document.BinaryData = binaryString;
                    }
                    this.UploadedFiles.push(document);
                });
            }
        }
    }

    public RemoveSelectedDocument(index: number): void {
        this.files.splice(index, 1);
        this.UploadedFiles.splice(index, 1);
    }

    public UploadDocuments(): void {
        this.UploadDocumentEmitter.emit(this.UploadedFiles);
    }

    ngOnDestroy() {
        this.files = [];
        this.UploadedFiles = [];
    }

    public CheckForValidFileFormat(filesFromUser: Array<File>): Boolean {
        let isValidFile = false;
        const files = Array.from(filesFromUser);
        const validFileFormats = Object.values(ENUM_ValidFileFormats).toString();
        for (let item of files) {
            if (validFileFormats.includes(item.type) && item.type !== "") {
                isValidFile = true;
            } else {
                isValidFile = false;
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Some File format is not valid (Allowed file formats are:  PDF, JPEG, JPG)."]);
                break;
            }
        }
        return isValidFile;
    }
}
