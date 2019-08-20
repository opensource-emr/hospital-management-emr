export class DicomDataModel {
  public PatientStudyId: string = "";
  public PatientId: number = 0;
  public PatientName: string = "";
  public StudyInstanceUID: string = "";
  public SOPClassUID: string = "";
  public Modality: string = "";
  public StudyDescription: string = "";
  public StudyDate: string = "";
  public CreatedOn: string = "";
  public IsMapped: boolean = true;
  public userName: string = "";
  public passWord: string = "";
  public patStudyId: string = "";
  public FileBinaryData: string = "";
  public DicomFileId: string = "";
  public FileToolData: string = "";


}

export class DicomFileModel {

  public DicomFileId: string = "";
  public SOPInstanceUID: string = "";
  public ROWGUID: string = "";
  public SeriesId: number = 0;
  public FileName: string = "";
  public FilePath: string = "";
  public FileBinaryData: string = "";
  public CreatedOn: number = 0;
  public ModifiedBy: number = 0;
  public FileToolData: string = "";
}
