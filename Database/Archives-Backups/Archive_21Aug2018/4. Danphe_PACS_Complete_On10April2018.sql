Use Master
GO
if db_id('Danphe_PACS') is not null
BEGIN
  ALTER DATABASE [Danphe_PACS] SET SINGLE_USER WITH ROLLBACK IMMEDIATE
  Drop Database [Danphe_PACS]
END
GO
Create Database Danphe_PACS
Go

EXEC sp_configure filestream_access_level, 2  
RECONFIGURE  
ALTER DATABASE Danphe_PACS
ADD FILEGROUP Dicom_FileStream CONTAINS FILESTREAM  
GO  
ALTER DATABASE Danphe_PACS
ADD FILE  
(  
    NAME= 'Dicom_FileStream',  
    FILENAME = 'C:\DanpheHealthInc_PvtLtd_Files\Dicom_FileStreams'
)  
TO FILEGROUP Dicom_FileStream  
GO

USE [Danphe_PACS]
GO
/****** Object:  Table [dbo].[DCM_DicomFiles]    Script Date: 2/15/2018 5:56:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DCM_DicomFiles](
	[DicomFileId] [bigint] IDENTITY(1,1) NOT NULL,
	[SOPInstanceUID] [nvarchar](200) NOT NULL,
	[ROWGUID] [uniqueidentifier] ROWGUIDCOL  NOT NULL,
	[SeriesId] [int] NULL,
	[FileName] [varchar](128) NULL,
	[FilePath] [varchar](2000) NULL,
	[FileBinaryData] [varbinary](max) FILESTREAM  NULL,
 CONSTRAINT [PK_DCM_DicomFiles] PRIMARY KEY CLUSTERED 
(
	[DicomFileId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY] FILESTREAM_ON [Dicom_FileStream],
UNIQUE NONCLUSTERED 
(
	[ROWGUID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] FILESTREAM_ON [Dicom_FileStream]
GO
/****** Object:  Table [dbo].[DCM_PatientStudy]    Script Date: 2/15/2018 5:56:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DCM_PatientStudy](
	[PatientStudyId] [int] IDENTITY(1,1) NOT NULL,
	[TenantId] [int] NULL,
	[TenantName] [varchar](200) NULL,
	[PatientId] [varchar](200) NULL,
	[PatientName] [varchar](200) NULL,
	[StudyInstanceUID] [varchar](200) NULL,
	[SOPClassUID] [varchar](200) NULL,
	[Modality] [varchar](100) NULL,
	[StudyDescription] [varchar](100) NULL,
	[StudyDate] [datetime] NULL,
 CONSTRAINT [PK_DCM_PatientStudy] PRIMARY KEY CLUSTERED 
(
	[PatientStudyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DCM_Series]    Script Date: 2/15/2018 5:56:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DCM_Series](
	[SeriesId] [int] IDENTITY(1,1) NOT NULL,
	[PatientStudyId] [int] NULL,
	[SeriesInstanceUID] [varchar](200) NULL,
	[SeriesDescription] [varchar](200) NULL,
 CONSTRAINT [PK_DCM_Series] PRIMARY KEY CLUSTERED 
(
	[SeriesId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[DCM_DicomFiles]  WITH CHECK ADD  CONSTRAINT [FK_DCM_DicomFiles_DCM_Series] FOREIGN KEY([SeriesId])
REFERENCES [dbo].[DCM_Series] ([SeriesId])
GO
ALTER TABLE [dbo].[DCM_DicomFiles] CHECK CONSTRAINT [FK_DCM_DicomFiles_DCM_Series]
GO
ALTER TABLE [dbo].[DCM_Series]  WITH CHECK ADD  CONSTRAINT [FK_DCM_Series_DCM_PatientStudy] FOREIGN KEY([PatientStudyId])
REFERENCES [dbo].[DCM_PatientStudy] ([PatientStudyId])
GO
ALTER TABLE [dbo].[DCM_Series] CHECK CONSTRAINT [FK_DCM_Series_DCM_PatientStudy]
GO
-----START: 13 April 2018 : NageshBB----------------------
Alter table DCM_DicomFiles
Add CreatedOn DateTime null
Go

Alter table DCM_PatientStudy
Add CreatedOn DateTime null
Go

Alter table DCM_Series
Add CreatedOn DateTime null
Go

Alter table DCM_PatientStudy
drop column TenantId
Go

Alter table DCM_PatientStudy
drop column TenantName
Go
-----END: 13 April 2018 : NageshBB----------------------