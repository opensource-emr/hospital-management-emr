
--START:Avanti:3 March 2022: Chnages for OPD Examination page---
--Add Columns in vitals for Ayurved
ALTER TABLE  CLN_PatientVitals
ADD Nadi    int,
    Mala    varchar(20),
    Mutra   varchar(20),
    Jivha   varchar(20),
    Shabda  varchar(20),
    Sparsha varchar(20),
    Drik    varchar(20),
    Akriti  varchar(20),
    LungField varchar(20),
    HeartSounds nvarchar(20),
    PA_Tenderness varchar(20),
    Organomegaly varchar(20),
    CNS_Consiousness varchar(20),
    Power varchar(20),
    Reflexes varchar(20),
    Tone varchar(20),
    Others varchar(50)
Go


--insert routing for opd examination
Insert Into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,IsActive)
Values ('OPD Examination','Doctors/PatientOverviewMain/NotesSummary/OPDExamination','OPDExamination',(Select PermissionId from RBAC_Permission where PermissionName = 'Clinical-notes-outpatExamination-view'),3,1)
GO

Insert Into CLN_Template (TemplateName,CreatedBy,CreatedOn,IsActive,IsForNursing)
Values ('OPD Examination',1,GETDATE(),1,1)
GO

Insert Into CLN_MST_NoteType(NoteType,CreatedBy,CreatedOn,IsActive,IsForNursing)
Values('OPD Examination',1,GETDATE(),1,1)
GO

--create Core parameter for get noteType
IF Not EXISTS (SELECT  * FROM  CORE_CFG_Parameters WHERE ParameterGroupName='Clinical'  and ParameterName='DefaultNotesType_OPDExamination')
Begin
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Clinical','DefaultNotesType_OPDExamination','OPD Examination','string','This notes name we are using for get notesId (from CLN_MST_NoteType,) and save in CLN_Notes table for OPD Examination','custom')
End
Else
Begin
     update [dbo].[CORE_CFG_Parameters] 
	 set [ParameterValue]='OPD Examination'
	 where [ParameterGroupName]='Clinical' and [ParameterName]='DefaultNotesType_OPDExamination'     
End
GO
--END:Avanti:3 March 2022: Chnages for OPD Examination page---


--START:NageshBB: 03 March 2022: new changes for build
Update CFG_PrinterSettings
set PrinterDisplayName=GroupName+'-Browser-Printer'
where PrintingType='browser'
Go
Update CFG_PrinterSettings
set IsActive=0 where PrintingType='dotmatrix'
go
--END:NageshBB: 03 March 2022: new changes for build

--START: Menka/Nagesh: 03-03-2022: Create table for OPPatients which used for OPDataLoad project
DROP TABLE IF EXISTS [dbo].[OPPatients];
Go
Create table [dbo].[OPPatients](
	[OPPatientId] [int] IDENTITY(1,1) NOT NULL CONSTRAINT PK_OPPatients PRIMARY KEY,
	[FirstName] [varchar](50) NULL,
	[MiddleName] [varchar](50) NULL,
	[LastName] [varchar](50) NULL,
	[DateOfBirth] [datetime] NULL,
	[Age] [varchar](50) NULL,
	[Gender] [varchar](50) NULL,
	[VillageCity] [varchar](50) NULL,
	[Taluka] [varchar](50) NULL,
	[District] [varchar](50) NULL,
	[State] [varchar](50) NULL,
	[Country] [varchar](50) NULL,
	[IsActive] [bit] default 1,
	[IsEMRPatient] [bit] default 0
	);
GO
--END: Menka/Nagesh: 03-03-2022: Create table for OPPatients which used for OPDataLoad project

--START: NageshBB : 08-March-2022: Insert core parameter for admission and appointment report header configuration (export and print)
If not exists (select * from CORE_CFG_Parameters where ParameterGroupName='AppointmentReport' 
and ParameterName='AppointmentReportGridExportToExcelSetting')
Begin
--Insert parameter here
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName, ParameterValue, ValueDataType,Description,ParameterType)
values
('AppointmentReport','AppointmentReportGridExportToExcelSetting',	
'{"PhoneBookAppointmentReport":{"HeaderTitle":"PhoneBook Appointment Report","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DailyAppointmentReport":{"HeaderTitle":"Detailed","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DistrictWiseAppointmentReport":{"HeaderTitle":"District Wise","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DepartmentWiseAppointmentReport":{"HeaderTitle":"Department Wise","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DoctorwiseOutPatient":{"HeaderTitle":"Doctorwise OutPatient","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false}}',	
'jsonobj',	'Dynamic configuration of header,footer,printby,date range in Appointment reports',	'custom')
End
Go

If not exists (select * from CORE_CFG_Parameters where ParameterGroupName='AppointmentReport' 
and ParameterName='AppointmentReportGridPrintSetting')
Begin
--Insert parameter here
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName, ParameterValue, ValueDataType,Description,ParameterType)
values
(
'AppointmentReport',	'AppointmentReportGridPrintSetting',	
'{"PhoneBookAppointmentReport":{"HeaderTitle":"PhoneBook Appointment Report","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DailyAppointmentReport":{"HeaderTitle":"Detailed","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DistrictWiseAppointmentReport":{"HeaderTitle":"District Wise","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DepartmentWiseAppointmentReport":{"HeaderTitle":"Department Wise","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DoctorwiseOutPatient":{"HeaderTitle":"Doctorwise OutPatient","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false}}',		
'jsonobj',	'Dynamic configuration of header,footer,printby,date range in Appointment reports',	'custom'
)
End
Go

If not exists (select * from CORE_CFG_Parameters where ParameterGroupName='AdmissionReport' 
and ParameterName='AdmissionReportGridExportToExcelSetting')
Begin
--Insert parameter here
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName, ParameterValue, ValueDataType,Description,ParameterType)
values
('AdmissionReport','AdmissionReportGridExportToExcelSetting',	
'{"TotalAdmittedPatient":{"HeaderTitle":"Admitted Patient","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DischargedPatient":{"HeaderTitle":"Discharged Patient","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"TransferredPatient":{"HeaderTitle":"Transferred Patient","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DiagnosisWisePatientReport":{"HeaderTitle":"DiagnosisWise Patient ","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"InpatientCensusReport":{"HeaderTitle":"Inpatient Census Report","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"AdmissionAndDischargeList":{"HeaderTitle":"Admission And Discharge List","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false}}',	
'jsonobj',	'Dynamic configuration of header,footer,printby,date range in Admission reports',	'custom')

End
Go

If not exists (select * from CORE_CFG_Parameters where ParameterGroupName='AdmissionReport' 
and ParameterName='AdmissionReportGridPrintSetting')
Begin
--Insert parameter here
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName, ParameterValue, ValueDataType,Description,ParameterType)
values
(
'AdmissionReport',	'AdmissionReportGridPrintSetting',	
'{"TotalAdmittedPatient":{"HeaderTitle":"Admitted Patient","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DischargedPatient":{"HeaderTitle":"Discharged Patient","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"TransferredPatient":{"HeaderTitle":"Transferred Patient","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"DiagnosisWisePatientReport":{"HeaderTitle":"DiagnosisWise Patient ","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"InpatientCensusReport":{"HeaderTitle":"Inpatient Census Report","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false},"AdmissionAndDischargeList":{"HeaderTitle":"Admission And Discharge List","ShowHeader":false,"ShowFooter":false,"ShowPrintBy":false,"ShowDateRange":false}}',	
'jsonobj',	'Dynamic configuration of header,footer,printby,date range in Admission reports',	'custom'
)
End
Go


--stored procedure for admission -> admission and discharge list report column added 

/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_AdmissionAndDischargeReport]    Script Date: 07-03-2022 15:17:34 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/*
-- =============================================
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      Dev Narayan/2021-09-25          Initial Draft
2.      Dev Narayan/2021-09-29          Added Discharge date filter
3.		Nagsh Bulbule/2022-03-08        Added diagnosis, bedcode, address, age_gender columns for show in report
*/
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_ADT_AdmissionAndDischargeReport]
   @FromDate Date=null,
   @ToDate Date=null,
   @WardId int = null,
   @DepartmentId int = null,
   @BedFeatureId int = null,
   @AdmissionStatus varchar(40)= null,
   @SearchText varchar(40) = null
AS
BEGIN
SET 
  @WardId = ISNULL(@WardId, 0);
SET 
  @DepartmentId = ISNULL(@DepartmentId, 0);
SET 
  @BedFeatureId = ISNULL(@BedFeatureId, 0);
IF(@AdmissionStatus LIKE '%All%')
BEGIN
SET @AdmissionStatus = null;
END

Select 
  (
    Cast(
      ROW_NUMBER() OVER (
        ORDER BY 
          newData.RowNum desc
      ) AS int
    )
  ) AS SN, 
  newData.PatientName, 
  newData.PatientCode, 
  newData.VisitCode, 
  newData.AdmissionDate, 
  newData.DepartmentName, 
  newData.AdmittingDoctorName, 
  newData.WardName, 
  newData.BedFeature, 
  newData.AdmissionStatus, 
  newData.DischargeDate, 
  newData.Number_of_Days,
  newData.Address,
  newData.Age_Gender,
  newData.Diagnosis,
  newData.BedCode,
  newData.Age_Gender,
  newData.Address,
  newData.Diagnosis
  
FROM 
  (
    select 
      ROW_NUMBER() OVER(
        PARTITION BY adm.PatientAdmissionId 
        ORDER BY 
          adtPat.StartedOn DESC
      ) AS RowNum, 
      adm.PatientAdmissionId, 
      adm.AdmissionDate, 
      pat.PatientCode, 
      visit.VisitCode, 
      pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName AS 'PatientName', 
      ISNULL(emp.Salutation + '. ', '') + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ', '') + emp.LastName 'AdmittingDoctorName', 
      bed.BedCode as 'BedCode', 
      bedf.BedFeatureName as BedFeature, 
      bedf.BedFeatureId, 
      adtPat.StartedOn, 
      dept.DepartmentName, 
      dept.DepartmentId, 
      ward.WardName, 
      ward.WardID, 
      adm.AdmissionStatus, 
      adm.DischargeDate, 
      case when adm.AdmissionStatus = 'admitted' then DATEDIFF(
        DAY, 
        adm.AdmissionDate, 
        GETDATE()
      ) else DATEDIFF(
        DAY, adm.AdmissionDate, adm.DischargeDate
      ) end AS 'Number_of_Days',
	  pat.Age+'/'+pat.Gender as 'Age_Gender',
	  pat.Address as 'Address',
	  '' as 'Diagnosis'
    from 
      ADT_PatientAdmission adm 
      join ADT_TXN_PatientBedInfo adtPat on adm.PatientId = adtPat.PatientId 
      join PAT_PatientVisits visit on adm.PatientVisitId = visit.PatientVisitId 
      JOIN PAT_Patient pat ON pat.PatientId = visit.PatientId 
      join ADT_MST_Ward ward on ward.WardID = adtPat.WardId 
      JOIN ADT_Bed bed on bed.BedID = adtPat.BedId 
      JOIN ADT_MAP_BedFeaturesMap bedm on bed.BedID = bedm.BedId 
      JOIN ADT_MST_BedFeature bedf on bedm.BedFeatureId = bedf.BedFeatureId 
      left join EMP_EMPLOYEE emp ON adm.AdmittingDoctorId = emp.EmployeeId 
      left join MST_Department dept on dept.DepartmentId = adtPat.RequestingDeptId
	  
  ) newData 
where 
  newData.RowNum = 1 
  and (CONVERT(date, newData.AdmissionDate) between @FromDate 
  and @ToDate 
  or CONVERT(date, newData.DischargeDate) between @FromDate 
  and @ToDate )
  and (
    newData.WardID = Convert(
      VARCHAR(40), 
      @WardId
    ) 
    or Convert(
      VARCHAR(40), 
      @WardId
    )= 0
  ) 
  and (
    newData.DepartmentId = Convert(
      VARCHAR(40), 
      @DepartmentId
    ) 
    or Convert(
      VARCHAR(40), 
      @DepartmentId
    )= 0
  ) 
  and (
    newData.BedFeatureId = Convert(
      VARCHAR(40), 
      @BedFeatureId
    ) 
    or Convert(
      VARCHAR(40), 
      @BedFeatureId
    )= 0
  ) 
  and (
    newData.AdmissionStatus NOT LIKE '%cancel%'
  )
  and (
    newData.AdmissionStatus LIKE '%' + @AdmissionStatus + '%' 
    OR @AdmissionStatus is Null 
  ) 
  and
   (newData.PatientName like '%' + ISNULL(@SearchText,'') +'%' 
    or newData.VisitCode like '%' + ISNULL(@SearchText,'') + '%'
	or newData.PatientCode like '%' + ISNULL(@SearchText,'') + '%')

order by 
  newData.AdmissionDate desc

END

Go
--END: NageshBB : 08-March-2022: Insert core parameter for admission and appointment report header configuration (export and print)

--	start: Menka : 09-March-2022: Altered stored procedure for DailyAppointment report and created stored procedure for departmentwiseDailyAppointment report


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_Appointment_DailyAppointmentByDepartmentReport] 
	@FromDate Date=null,
	@ToDate Date=null,
	@DepartmentId int = null
AS
/*
FileName: [SP_Report_Appointment_DailyAppointmentByDepartmentReport]
CreatedBy/date: Menka/2022-03-09
Description: to get Details such as Patient Name , Appointment type, Appointment Status, along with doctor name between the Given Dates
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1		Menka/2022-03-09					Stored procedure created
				
--------------------------------------------------------
*/
BEGIN
    SELECT
	CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, VisitTime) as 'Date',
		pat.PatientCode,
		pat.ShortName AS Patient_Name,
        pat.PhoneNumber,pat.Age,pat.Gender,
		dist.CountrySubDivisionName 'DistrictName',
		ISNULL(dept.DepartmentName,'Not Assigned') AS DepartmentName,
		vis.AppointmentType,vis.VisitType,
		emp.FullName AS Doctor_Name,vis.ProviderId,
		vis.VisitStatus,
		pat.Address,
		'' AS Diagnosis,
		dept.DepartmentId
FROM PAT_PatientVisits AS vis
	INNER JOIN PAT_Patient pat ON vis.PatientId = pat.PatientId
	INNER JOIN MST_CountrySubDivision dist on pat.CountrySubDivisionId=dist.CountrySubDivisionId
	left join MST_Department dept on vis.DepartmentId=dept.DepartmentId
	left join EMP_Employee emp on emp.EmployeeId=vis.ProviderId
	--left join CLN_Diagnosis dign on dign.PatientVisitId = vis.PatientVisitId
	WHERE CONVERT(date, vis.VisitDate) BETWEEN @FromDate  AND  @ToDate 
	and vis.VisitType !='inpatient' --excluding inpatient visits (those can be seen from admission reports)
	and vis.DepartmentId = @DepartmentId
    AND vis.BillingStatus NOT  IN('cancel','returned')--exclude cancelled and returned visits. 
	ORDER BY CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, vis.VisitTime) DESC

END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_DailyAppointmentReport]    Script Date: 08/03/2022 11:21:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Appointment_DailyAppointmentReport] 
	@FromDate Date=null,
	@ToDate Date=null,
	@Doctor_Name varchar(100) = null,
	@AppointmentType varchar(100) = null
AS
/*
FileName: [SP_Report_Appointment_DailyAppointmentReport]
CreatedBy/date: Umed/2017-06-08
Description: to get Details such as Patient Name , Appointment type, Appointment Status, along with doctor name between the Given Dates
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
5		Rusha/2019-18-06					Updated of script according to provider name and appointment type
6       Shankar/2020-19-02                  Added middle name to the patients name
7.      Sud/14Jun'20                        PatientName taking from ShortName field of Pat_Patient Table
8.      Sud:21Sep'21                        Adding DepartmentName, DistrictName in Select Result.
                                            Refactoring of where clause 
9.      Menka:9March'22						Added column like Address and diagnosis					
--------------------------------------------------------
*/
BEGIN
    SELECT
	CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, VisitTime) as 'Date',
		pat.PatientCode,
		pat.ShortName AS Patient_Name,
        pat.PhoneNumber,pat.Age,pat.Gender,
		dist.CountrySubDivisionName 'DistrictName',
		ISNULL(dept.DepartmentName,'Not Assigned') AS DepartmentName,
		vis.AppointmentType,vis.VisitType,
		emp.FullName AS Doctor_Name,vis.ProviderId,
		vis.VisitStatus,
		pat.Address,
		'' AS Diagnosis,
		dept.DepartmentId
FROM PAT_PatientVisits AS vis
	INNER JOIN PAT_Patient pat ON vis.PatientId = pat.PatientId
	INNER JOIN MST_CountrySubDivision dist on pat.CountrySubDivisionId=dist.CountrySubDivisionId
	left join MST_Department dept on vis.DepartmentId=dept.DepartmentId
	left join EMP_Employee emp on emp.EmployeeId=vis.ProviderId
	--left join CLN_Diagnosis dign on dign.PatientVisitId = vis.PatientVisitId
	WHERE CONVERT(date, vis.VisitDate) BETWEEN @FromDate  AND  @ToDate 
	and vis.VisitType !='inpatient' --excluding inpatient visits (those can be seen from admission reports)
	and ISNULL(emp.FullName,'') LIKE '%' + ISNULL(@Doctor_Name, '') + '%' and
	  vis.AppointmentType LIKE '%' + ISNULL(@AppointmentType, '') + '%'
    AND vis.BillingStatus NOT  IN('cancel','returned')--exclude cancelled and returned visits. 
	ORDER BY CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, vis.VisitTime) DESC

END
GO
--	end: Menka : 09-March-2022: Altered stored procedure for DailyAppointment report and created stored procedure for departmentwiseDailyAppointment report

-- Start : DeepakS :11-March-2022 : core_parameters  insert script for show/hide billing information on patient-HistoryPage 

Insert Into core_cfg_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values ( 'Patient','ShowBillDetailsOnHistoryPage','true','boolean', 'It will show and hide bill detail in History pages','Custom')
go

-- end : DeepakS :11-March-2022 : core_parameters  insert script for show/hide billing information on patient-HistoryPage 



--START: NageshBB: 13March2022: Inserted opd examinaiton permission and updated permissionid in routeconfig table
if not exists(Select * from RBAC_Permission where  PermissionName = 'Clinical-notes-outpatExamination-view')
Begin
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values('Clinical-notes-outpatExamination-view',(select top 1 ApplicationId from RBAC_Application where ApplicationCode='CLN'),1,GETDATE(),1)
End
Go

Update RBAC_RouteConfig
set PermissionId=(Select top 1 PermissionId from RBAC_Permission where  PermissionName = 'Clinical-notes-outpatExamination-view')
where UrlFullPath='Doctors/PatientOverviewMain/NotesSummary/OPDExamination'
Go
--END: NageshBB: 13March2022: Inserted opd examinaiton permission and updated permissionid in routeconfig table

--START: NageshBB: 14 march 2022: Hide 5 doctor module menu which don't have any feature and we are showing
Update RBAC_RouteConfig 
set IsActive=0
where UrlFullPath in (
'Doctors/PatientOverviewMain/PatientVisitHistory'
,'Doctors/PatientOverviewMain/VisitSummary'
,'Doctors/PatientOverviewMain/CurrentMedications'
,'Doctors/PatientOverviewMain/RadiologyReports'
,'Doctors/PatientOverviewMain/NotesSummary/OPDExamination'
,'Doctors/PatientOverviewMain/ProblemsMain/PastMedical'
,'Doctors/PatientOverviewMain/Clinical/Notes'
,'Doctors/PatientOverviewMain/Clinical/DoctorsNotes')
Go


--END: NageshBB: 14 march 2022: Hide 5 doctor module menu which don't have any feature and we are showing

--START: NageshBB: 14March2022: created table for patient visit notes save
DROP TABLE if exists  [dbo].[CLN_PatientVisit_Notes]
Go
Create table [dbo].[CLN_PatientVisit_Notes]
(
         PatientVisitNoteId int identity(1,1)  constraint PK_CLN_PatientVisit_Notes primary key,
         PatientId int not null ,
         PatientVisitId int not null ,
         ProviderId int not null,

       
        ChiefComplaint varchar(1000),
        HistoryOfPresentingIllness varchar(1000),
        ReviewOfSystems varchar(1000),
        Diagnosis varchar(2000),

        HEENT varchar(1000),
        Chest varchar(1000),
        CVS varchar(1000),
        Abdomen varchar(1000),
        Extremity varchar(1000),
        Skin varchar(1000),
        Neurological varchar(1000),

        LinesProse varchar(500),
        ProsDate Datetime ,
        [Site] varchar(1000),
        ProsRemarks varchar(1000),
        [FreeText] varchar(2000),

        FollowUp int ,
        FollowUpUnit varchar(20),
        Remarks varchar(400),

        CreatedBy int,
        CreatedOn Datetime ,
        ModifiedBy int ,
        ModifiedOn datetime,
        IsActive bit,

)
Go

--insert permission and route details for clinical patient visit note page 
Insert into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values('clinical-patient-visit-note-view',(select top 1 applicationid from RBAC_Application where ApplicationCode='CLN'),1,GETDATE(),1)
Go

Insert into RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Visit Note','Doctors/PatientOverviewMain/Clinical/PatientVisitNote','PatientVisitNote',(select top 1 PermissionId from RBAC_Permission where PermissionName='clinical-patient-visit-note-view'),
(select top 1 RouteId from RBAC_RouteConfig where UrlFullPath='Doctors/PatientOverviewMain/Clinical'),1,1,1)
Go

Alter table CLN_HomeMedications
Add  PatientVisitId int
Go
--END: NageshBB: 14March2022: created table for patient visit notes save


-- start: Menka : 14-March-2022: Created discharge-admission-button permission for discharge button in ADT module

Insert into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('discharge-admission-button',(select top 1 ApplicationId from RBAC_Application where ApplicationName='ADT'),1,'2022-03-14',1)
GO

-- end: Menka : 14-March-2022: Created discharge-admission-button permission for discharge button in ADT module

-- start: Menka : 22-March-2022: Altered stored procedure of Admission,DailyAppointment and DailyAppointmentByDepartment to get diagnosis data

/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_AdmissionAndDischargeReport]    Script Date: 21/03/2022 12:50:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/*
-- =============================================
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      Dev Narayan/2021-09-25          Initial Draft
2.      Dev Narayan/2021-09-29          Added Discharge date filter
3.		Nagsh Bulbule/2022-03-08        Added diagnosis, bedcode, address, age_gender columns for show in report
4.      Menka Chaugule/2022-03-22       Changed to get diagnosis data from CLN_PatientVisit_Notes table
*/
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_ADT_AdmissionAndDischargeReport]
   @FromDate Date=null,
   @ToDate Date=null,
   @WardId int = null,
   @DepartmentId int = null,
   @BedFeatureId int = null,
   @AdmissionStatus varchar(40)= null,
   @SearchText varchar(40) = null
AS
BEGIN
SET 
  @WardId = ISNULL(@WardId, 0);
SET 
  @DepartmentId = ISNULL(@DepartmentId, 0);
SET 
  @BedFeatureId = ISNULL(@BedFeatureId, 0);
IF(@AdmissionStatus LIKE '%All%')
BEGIN
SET @AdmissionStatus = null;
END

Select 
  (
    Cast(
      ROW_NUMBER() OVER (
        ORDER BY 
          newData.RowNum desc
      ) AS int
    )
  ) AS SN, 
  newData.PatientName, 
  newData.PatientCode, 
  newData.VisitCode, 
  newData.AdmissionDate, 
  newData.DepartmentName, 
  newData.AdmittingDoctorName, 
  newData.WardName, 
  newData.BedFeature, 
  newData.AdmissionStatus, 
  newData.DischargeDate, 
  newData.Number_of_Days,
  newData.Address,
  newData.Age_Gender,
  newData.Diagnosis,
  newData.BedCode,
  newData.Age_Gender,
  newData.Address,
  newData.Diagnosis
  
FROM 
  (
    select 
      ROW_NUMBER() OVER(
        PARTITION BY adm.PatientAdmissionId 
        ORDER BY 
          adtPat.StartedOn DESC
      ) AS RowNum, 
      adm.PatientAdmissionId, 
      adm.AdmissionDate, 
      pat.PatientCode, 
      visit.VisitCode, 
      pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName AS 'PatientName', 
      ISNULL(emp.Salutation + '. ', '') + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ', '') + emp.LastName 'AdmittingDoctorName', 
      bed.BedCode as 'BedCode', 
      bedf.BedFeatureName as BedFeature, 
      bedf.BedFeatureId, 
      adtPat.StartedOn, 
      dept.DepartmentName, 
      dept.DepartmentId, 
      ward.WardName, 
      ward.WardID, 
      adm.AdmissionStatus, 
      adm.DischargeDate, 
      case when adm.AdmissionStatus = 'admitted' then DATEDIFF(
        DAY, 
        adm.AdmissionDate, 
        GETDATE()
      ) else DATEDIFF(
        DAY, adm.AdmissionDate, adm.DischargeDate
      ) end AS 'Number_of_Days',
	  pat.Age+'/'+pat.Gender as 'Age_Gender',
	  pat.Address as 'Address',
	  visitNote.Diagnosis as 'Diagnosis'
    from 
      ADT_PatientAdmission adm 
      join ADT_TXN_PatientBedInfo adtPat on adm.PatientId = adtPat.PatientId 
      join PAT_PatientVisits visit on adm.PatientVisitId = visit.PatientVisitId 
      JOIN PAT_Patient pat ON pat.PatientId = visit.PatientId 
      join ADT_MST_Ward ward on ward.WardID = adtPat.WardId 
      JOIN ADT_Bed bed on bed.BedID = adtPat.BedId 
      JOIN ADT_MAP_BedFeaturesMap bedm on bed.BedID = bedm.BedId 
      JOIN ADT_MST_BedFeature bedf on bedm.BedFeatureId = bedf.BedFeatureId 
      left join EMP_EMPLOYEE emp ON adm.AdmittingDoctorId = emp.EmployeeId 
      left join MST_Department dept on dept.DepartmentId = adtPat.RequestingDeptId
	  left join CLN_PatientVisit_Notes visitNote on adm.PatientVisitId = visitNote.PatientVisitId
  ) newData 
where 
  newData.RowNum = 1 
  and (CONVERT(date, newData.AdmissionDate) between @FromDate 
  and @ToDate 
  or CONVERT(date, newData.DischargeDate) between @FromDate 
  and @ToDate )
  and (
    newData.WardID = Convert(
      VARCHAR(40), 
      @WardId
    ) 
    or Convert(
      VARCHAR(40), 
      @WardId
    )= 0
  ) 
  and (
    newData.DepartmentId = Convert(
      VARCHAR(40), 
      @DepartmentId
    ) 
    or Convert(
      VARCHAR(40), 
      @DepartmentId
    )= 0
  ) 
  and (
    newData.BedFeatureId = Convert(
      VARCHAR(40), 
      @BedFeatureId
    ) 
    or Convert(
      VARCHAR(40), 
      @BedFeatureId
    )= 0
  ) 
  and (
    newData.AdmissionStatus NOT LIKE '%cancel%'
  )
  and (
    newData.AdmissionStatus LIKE '%' + @AdmissionStatus + '%' 
    OR @AdmissionStatus is Null 
  ) 
  and
   (newData.PatientName like '%' + ISNULL(@SearchText,'') +'%' 
    or newData.VisitCode like '%' + ISNULL(@SearchText,'') + '%'
	or newData.PatientCode like '%' + ISNULL(@SearchText,'') + '%')

order by 
  newData.AdmissionDate desc

END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_DailyAppointmentReport]    Script Date: 22/03/2022 03:55:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Appointment_DailyAppointmentReport] 
	@FromDate Date=null,
	@ToDate Date=null,
	@Doctor_Name varchar(100) = null,
	@AppointmentType varchar(100) = null
AS
/*
FileName: [SP_Report_Appointment_DailyAppointmentReport]
CreatedBy/date: Umed/2017-06-08
Description: to get Details such as Patient Name , Appointment type, Appointment Status, along with doctor name between the Given Dates
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
5		Rusha/2019-18-06					Updated of script according to provider name and appointment type
6       Shankar/2020-19-02                  Added middle name to the patients name
7.      Sud/14Jun'20                        PatientName taking from ShortName field of Pat_Patient Table
8.      Sud:21Sep'21                        Adding DepartmentName, DistrictName in Select Result.
                                            Refactoring of where clause 
9.      Menka:9March'22						Added column like Address and diagnosis	
10.     Menka:22March'22                    Changed to get diagnosis data from CLN_PatientVisit_Notes table
--------------------------------------------------------
*/
BEGIN
    SELECT
	CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, VisitTime) as 'Date',
		pat.PatientCode,
		pat.ShortName AS Patient_Name,
        pat.PhoneNumber,pat.Age,pat.Gender,
		dist.CountrySubDivisionName 'DistrictName',
		ISNULL(dept.DepartmentName,'Not Assigned') AS DepartmentName,
		vis.AppointmentType,vis.VisitType,
		emp.FullName AS Doctor_Name,vis.ProviderId,
		vis.VisitStatus,
		pat.Address,
		visitNote.Diagnosis AS Diagnosis,
		dept.DepartmentId
FROM PAT_PatientVisits AS vis
	INNER JOIN PAT_Patient pat ON vis.PatientId = pat.PatientId
	INNER JOIN MST_CountrySubDivision dist on pat.CountrySubDivisionId=dist.CountrySubDivisionId
	left join MST_Department dept on vis.DepartmentId=dept.DepartmentId
	left join EMP_Employee emp on emp.EmployeeId=vis.ProviderId
	left join CLN_PatientVisit_Notes visitNote on vis.PatientVisitId = visitNote.PatientVisitId
	WHERE CONVERT(date, vis.VisitDate) BETWEEN @FromDate  AND  @ToDate 
	and vis.VisitType !='inpatient' --excluding inpatient visits (those can be seen from admission reports)
	and ISNULL(emp.FullName,'') LIKE '%' + ISNULL(@Doctor_Name, '') + '%' and
	  vis.AppointmentType LIKE '%' + ISNULL(@AppointmentType, '') + '%'
    AND vis.BillingStatus NOT  IN('cancel','returned')--exclude cancelled and returned visits. 
	ORDER BY CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, vis.VisitTime) DESC

END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_DailyAppointmentByDepartmentReport]    Script Date: 22/03/2022 04:04:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Appointment_DailyAppointmentByDepartmentReport] 
	@FromDate Date=null,
	@ToDate Date=null,
	@DepartmentId int = null
AS
/*
FileName: [SP_Report_Appointment_DailyAppointmentByDepartmentReport]
CreatedBy/date: Menka/2022-03-09
Description: to get Details such as Patient Name , Appointment type, Appointment Status, along with doctor name between the Given Dates
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1		Menka/2022-03-09					Stored procedure created
2		Menka/2022-03-22				    Changed to get diagnosis data from CLN_PatientVisit_Notes table
--------------------------------------------------------
*/
BEGIN
    SELECT
	CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, VisitTime) as 'Date',
		pat.PatientCode,
		pat.ShortName AS Patient_Name,
        pat.PhoneNumber,pat.Age,pat.Gender,
		dist.CountrySubDivisionName 'DistrictName',
		ISNULL(dept.DepartmentName,'Not Assigned') AS DepartmentName,
		vis.AppointmentType,vis.VisitType,
		emp.FullName AS Doctor_Name,vis.ProviderId,
		vis.VisitStatus,
		pat.Address,
		visitNote.Diagnosis AS Diagnosis,
		dept.DepartmentId
FROM PAT_PatientVisits AS vis
	INNER JOIN PAT_Patient pat ON vis.PatientId = pat.PatientId
	INNER JOIN MST_CountrySubDivision dist on pat.CountrySubDivisionId=dist.CountrySubDivisionId
	left join MST_Department dept on vis.DepartmentId=dept.DepartmentId
	left join EMP_Employee emp on emp.EmployeeId=vis.ProviderId
	left join CLN_PatientVisit_Notes visitNote on vis.PatientVisitId = visitNote.PatientVisitId
	WHERE CONVERT(date, vis.VisitDate) BETWEEN @FromDate  AND  @ToDate 
	and vis.VisitType !='inpatient' --excluding inpatient visits (those can be seen from admission reports)
	and vis.DepartmentId = @DepartmentId
    AND vis.BillingStatus NOT  IN('cancel','returned')--exclude cancelled and returned visits. 
	ORDER BY CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, vis.VisitTime) DESC

END
GO
-- end: Menka : 22-March-2022: Altered stored procedure of Admission,DailyAppointment and DailyAppointmentByDepartment to get diagnosis data

-- start: Menka : 24-March-2022: Created core parameter in CORE_CFG_Parameters table to show/hide Ayurved vitals and altered nadi column's data type in CLN_PatientVitals table
Insert Into CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values ( 'Clinical','ShowAyurvedVitals','true','boolean', 'This will show or hide ayurved vitals on Vitals page','custom')
Go

alter table CLN_PatientVitals
alter column Nadi varchar(20) null
Go
-- end: Menka : 24-March-2022: Created core parameter in CORE_CFG_Parameters table to show/hide Ayurved vitals and altered nadi column's data type in CLN_PatientVitals table

-- start: Menka : 25-March-2022: Changes for home medication
Insert Into CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values ( 'Clinical','EnableMedicationValidation','true','boolean', 'This will enable or disable validation of medication fields on add medication page','custom')
Go

Alter table CLN_HomeMedications
add FrequencyId int null, Days int null
Go

Insert Into CLN_MST_Frequency (Type)
Values ('1-1-1-1')
Go

--insert everything into a temp table
SELECT * 
INTO #tmpMedicationTable
FROM [dbo].[CLN_HomeMedications]
Go
--clear your table
DELETE FROM [dbo].[CLN_HomeMedications]
Go
--reseed identity column value
DBCC CHECKIDENT ('[dbo].[CLN_HomeMedications]', RESEED, 0);
Go

--insert back all the values with the updated ID column
INSERT INTO [dbo].[CLN_HomeMedications] ( PatientId,LastTaken,Route,Dose,Comments,MedicationId,OtherMedication,CreatedBy,CreatedOn,ModifiedBy,Frequency,MedicationType,PatientVisitId,Days,FrequencyId)
SELECT PatientId,LastTaken,Route,Dose,Comments,MedicationId,OtherMedication,CreatedBy,CreatedOn,ModifiedBy,Frequency,MedicationType,PatientVisitId,Days,FrequencyId FROM #tmpMedicationTable

--drop the temp table
DROP TABLE #tmpMedicationTable
Go

-- end: Menka : 25-March-2022: Changes for home medication
--START: NageshBB: 25March2022: created table for patient visit procedure save

DROP TABLE if exists  [dbo].[CLN_PatientVisitProcedure]
Go
Create table [dbo].[CLN_PatientVisitProcedure]
(
         PatientVisitProcedureId int identity(1,1)  constraint PK_CLN_PatientVisitProcedure primary key,
         PatientId int not null ,
         PatientVisitId int not null ,
         ProviderId int not null,
		 BillItemPriceId int,
		 ItemName varchar(250),
		 [Status] varchar(50),
         Remarks varchar(400),

        CreatedBy int,
        CreatedOn Datetime ,
        ModifiedBy int ,
        ModifiedOn datetime,
        IsActive bit
)
Go

--END: NageshBB: 25March2022: created table for patient visit procedure save

--START: DeepakS: 22April2022: Created core parameter to enable/disable diagnosis in appointment page

insert into core_cfg_parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values  ('Common','ShowDiagnosisInputOnAppointmentPage', 'true' ,'boolean' , 'it will show and hide the Diagnosis' ,'custom' );
Go

--END: DeepakS: 22April2022: Created core parameter to enable/disable diagnosis in appointment page

--START: Menka: 22April2022: Altered store procedures of SP_GetVisitListOfValidDays for adding CountrySubDivisionId and SP_Report_DailyAppointment for applying diagnosis filter

/****** Object:  StoredProcedure [dbo].[SP_APPT_GetVisitListOfValidDays]    Script Date: 18/04/2022 06:18:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
	ALTER PROCEDURE [dbo].[SP_APPT_GetVisitListOfValidDays]
	@SearchTxt VARCHAR(200) = '', 
	@RowCounts INT = 200,
	@DaysLimit INT = 7

	AS 
	/*
	 FileName: [SP_APPT_GetVisitListOfValidDays] 
	 Created: 21-Dec'21/Krishna
	 Description: To Get the Patients visit list
				-- Returns upto 200 patients
				--Match fields: ShortName, PatientCode (HospitalNo), PhoneNumber
	 Remarks:   
	 -------------------------------------------------------------------------
	 Change History
	 -------------------------------------------------------------------------
	 S.No.    Date/User              Change          Remarks
	 -------------------------------------------------------------------------
	 1.       21-Dec'21/Krishna                          inital draft 
	 2.		  22-Apr'22/Menka							Added CountrySubDivisionId
	 -------------------------------------------------------------------------
	*/
	DECLARE @Now DATE
		SET @Now = GETDATE()
	DECLARE @ValidDate DATE
		SET @ValidDate = DATEADD(DAY, -@DaysLimit, @Now) --takes date @Dayslimit(eg: 7 days) days less than the current date.
		
	BEGIN 
		IF(@SearchTxt = 'null') 
	BEGIN 
		SET @SearchTxt = null 
	END 
		SET @RowCounts = ISNULL(@RowCounts, 200) --default rowscount=200

 
	SELECT TOP (@RowCounts) 
	  visit.PatientVisitId, 
	  visit.ParentVisitId, 
	  dept.DepartmentId,
	  dept.DepartmentName,
	  visit.ProviderId, 
	  visit.ProviderName, 
	  visit.VisitDate, 
	  visit.VisitTime, 
	  visit.VisitType, 
	  visit.AppointmentType, 
	  pat.PatientId, 
	  pat.PatientCode, 
	  pat.FirstName, 
	  pat.MiddleName, 
	  pat.LastName, 
	  pat.ShortName, 
	  pat.PhoneNumber, 
	  pat.DateOfBirth, 
	  pat.Gender, 
	  pat.CountryId,
	  pat.PANNumber, 
	  pat.MembershipTypeId, 
	  pat.[Address], 
	  pat.Email, 
	  pat.LandLineNumber, 
	  visit.QueueNo, 
	  visit.BillingStatus AS BillStatus,
	  pat.CountrySubDivisionId

	FROM PAT_PatientVisits AS visit
		INNER JOIN MST_Department AS dept ON visit.DepartmentId = dept.DepartmentId
		INNER JOIN PAT_Patient AS pat ON visit.PatientId = pat.PatientId
	WHERE 
	  pat.IsActive = 1
	  AND visit.IsActive=1
	  AND CONVERT(DATE,visit.VisitDate) BETWEEN CONVERT(DATE,@ValidDate) AND CONVERT(DATE,@Now)
	  AND LOWER(visit.VisitType) != 'inpatient'
	  AND LOWER(visit.BillingStatus) != 'returned'
	  AND (
		pat.PatientCode LIKE '%' + ISNULL(@SearchTxt, '') + '%' 
		OR pat.ShortName LIKE '%' + ISNULL(@SearchTxt, '') + '%' 
		OR ISNULL(pat.PhoneNumber, '') LIKE '%' + ISNULL(@SearchTxt, '') + '%'
	  ) 
	  AND visit.Ins_HasInsurance IS NULL
	ORDER BY 
	  visit.PatientVisitId DESC --Show recent visit at top.. 
	  END
	  GO

	  /****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_DailyAppointmentReport]    Script Date: 19/04/2022 03:50:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Appointment_DailyAppointmentReport] 
	@FromDate Date=null,
	@ToDate Date=null,
	@Doctor_Name varchar(100) = null,
	@AppointmentType varchar(100) = null,
	@ICD10Description varchar(100) = null
AS
/*
FileName: [SP_Report_Appointment_DailyAppointmentReport]
CreatedBy/date: Umed/2017-06-08
Description: to get Details such as Patient Name , Appointment type, Appointment Status, along with doctor name between the Given Dates
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
5		Rusha/2019-18-06					Updated of script according to provider name and appointment type
6       Shankar/2020-19-02                  Added middle name to the patients name
7.      Sud/14Jun'20                        PatientName taking from ShortName field of Pat_Patient Table
8.      Sud:21Sep'21                        Adding DepartmentName, DistrictName in Select Result.
                                            Refactoring of where clause 
9.      Menka:9March'22						Added column like Address and diagnosis	
10.     Menka:22March'22                    Changed to get diagnosis data from CLN_PatientVisit_Notes table
11.     Menka:22April'22                    Changed to get diagnosis filtered list
--------------------------------------------------------
*/
BEGIN
    SELECT
	CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, VisitTime) as 'Date',
		pat.PatientCode,
		pat.ShortName AS Patient_Name,
        pat.PhoneNumber,pat.Age,pat.Gender,
		dist.CountrySubDivisionName 'DistrictName',
		ISNULL(dept.DepartmentName,'Not Assigned') AS DepartmentName,
		vis.AppointmentType,vis.VisitType,
		emp.FullName AS Doctor_Name,vis.ProviderId,
		vis.VisitStatus,
		pat.Address,
		visitNote.Diagnosis AS Diagnosis,
		dept.DepartmentId
FROM PAT_PatientVisits AS vis
	INNER JOIN PAT_Patient pat ON vis.PatientId = pat.PatientId
	INNER JOIN MST_CountrySubDivision dist on pat.CountrySubDivisionId=dist.CountrySubDivisionId
	left join MST_Department dept on vis.DepartmentId=dept.DepartmentId
	left join EMP_Employee emp on emp.EmployeeId=vis.ProviderId
	left join CLN_PatientVisit_Notes visitNote on vis.PatientVisitId = visitNote.PatientVisitId
	WHERE CONVERT(date, vis.VisitDate) BETWEEN @FromDate  AND  @ToDate 
	and vis.VisitType !='inpatient' --excluding inpatient visits (those can be seen from admission reports)
	and ISNULL(emp.FullName,'') LIKE '%' + ISNULL(@Doctor_Name, '') + '%' and
	  vis.AppointmentType LIKE '%' + ISNULL(@AppointmentType, '') + '%' and
	  ISNULL(visitNote.Diagnosis,'') LIKE '%' + ISNULL(@ICD10Description, '') + '%'
    AND vis.BillingStatus NOT  IN('cancel','returned')--exclude cancelled and returned visits. 
	ORDER BY CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, vis.VisitTime) DESC

END
GO

--END: Menka: 22April2022: Altered store procedures of SP_GetVisitListOfValidDays for adding CountrySubDivisionId and SP_Report_DailyAppointment for applying diagnosis filter