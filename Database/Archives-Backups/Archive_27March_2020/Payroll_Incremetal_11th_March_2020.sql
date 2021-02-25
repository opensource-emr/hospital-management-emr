
--------Start:27th May 2019-- Salakha :- Added Payroll route for Payroll------------
INSERT INTO [dbo].[RBAC_Application] ([ApplicationCode]    ,[ApplicationName]    ,[IsActive]  ,[CreatedBy] ,[CreatedOn])
     VALUES ('PAY' ,'Payroll',1 ,1 ,GETDATE())
GO
INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-main-view',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO
INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-main-attendance-view',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO
INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-main-leave-view',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO

INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-main-payroll-view',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO

INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-main-setting-view',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO
  INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-attendance-edit-btn',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO
 INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-attendance-biometric-sync-btn',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO
 INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-attendance-show-all-employee-btn',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO

INSERT INTO [dbo].[RBAC_RouteConfig]
           ([DisplayName],[UrlFullPath] ,[RouterLink],[PermissionId] ,[Css],[DefaultShow],[DisplaySeq],[IsActive])
     VALUES('PayrollMain','PayrollMain','PayrollMain',(select PermissionId from RBAC_Permission where PermissionName='payroll-main-view'),'payroll-managment.png',1,20,1)
GO

 INSERT INTO RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive) 
  VALUES('Attendance','PayrollMain/Attendance','Attendance',(select PermissionId from RBAC_Permission where PermissionName='payroll-main-attendance-view'),
  (select RouteId from [RBAC_RouteConfig] where UrlFullPath = 'PayrollMain' and RouterLink ='PayrollMain'),1,1)
  GO

  INSERT INTO RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive) 
  VALUES('Leave','PayrollMain/Leave','Leave',(select PermissionId from RBAC_Permission where PermissionName='payroll-main-leave-view'),
  (select RouteId from [RBAC_RouteConfig] where UrlFullPath = 'PayrollMain' and RouterLink ='PayrollMain'),1,1)
  GO
  
   INSERT INTO RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive) 
  VALUES('Payroll','PayrollMain/Payroll','Payroll',(select PermissionId from RBAC_Permission where PermissionName='payroll-main-payroll-view'),
  (select RouteId from [RBAC_RouteConfig] where UrlFullPath = 'PayrollMain' and RouterLink ='PayrollMain'),1,1)
  GO
  
      INSERT INTO RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive) 
  VALUES('Setting','PayrollMain/Setting','Setting',(select PermissionId from RBAC_Permission where PermissionName='payroll-main-setting-view'),
  (select RouteId from [RBAC_RouteConfig] where UrlFullPath = 'PayrollMain' and RouterLink ='PayrollMain'),1,1)
  GO

/****** Object:  Table [dbo].[PROLL_DailyMuster]    Script Date: 13-06-2019 17:19:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PROLL_DailyMuster](
	[DailyMusterId] [bigint] IDENTITY(1,1) NOT NULL,
	[EmployeeId] [bigint] NOT NULL,
	[Present] [bit] NOT NULL,
	[AttStatus] [nvarchar](50) NULL,
	[ColorCode] [nvarchar](50) NULL,
	[TimeIn] [time](7) NULL,
	[TimeOut] [time](7) NULL,
	[Day] [int] NULL,
	[Month] [int] NULL,
	[Year] [bigint] NULL,
	[HoursInDay] [decimal](18, 0) NULL,
 CONSTRAINT [PK_PAY_DailyMuster] PRIMARY KEY CLUSTERED 
(
	[DailyMusterId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


--------End:27th May 2019-- Salakha :- Created PAY_DailyMuster table for Attendance-----------

--------start:29th May 2019-- Salakha :- Created tables for payroll-----------
/****** Object:  Table [dbo].[PROLL_MST_Holidays]    Script Date: 04-06-2019 14:52:45 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PROLL_MST_Holidays](
	[HolidayId] [int] IDENTITY(1,1) NOT NULL,
	[FiscalYearId] [int] NOT NULL,
	[Title] [nvarchar](50) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[ApprovedBy] [int] NOT NULL,
	[Date] [datetime] NOT NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
 CONSTRAINT [PK_PROLL_MST_Holidays] PRIMARY KEY CLUSTERED 
(
	[HolidayId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO


/****** Object:  Table [dbo].[PROLL_MST_LeaveCategory]    Script Date: 29-05-2019 16:56:35 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PROLL_MST_LeaveCategory](
	[LeaveCategoryId] [int] IDENTITY(1,1) NOT NULL,
	[LeaveCategoryName] [nvarchar](50) NOT NULL,
	[Description] [nvarchar](50) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[IsActive] [bit] NULL,
	[CategoryCode] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_PROLL_MST_LeaveCategory] PRIMARY KEY CLUSTERED 
(
	[LeaveCategoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[PROLL_MST_Leave]    Script Date: 04-06-2019 15:00:53 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PROLL_MST_LeaveRules](
	[LeaveId] [int] IDENTITY(1,1) NOT NULL,
	[LeaveCategoryId] [int] NOT NULL,
	[Year] [int] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[IsApproved] [bit] NULL,
  [ApprovedBy] [int] NOT NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
	[PayPercent] [float] NULL,
	[Days] [int] NOT NULL,
 CONSTRAINT [PK_PROLL_MST_Leave] PRIMARY KEY CLUSTERED 
(
	[LeaveId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[PROLL_EmpLeave]    Script Date: 21-06-2019 15:49:55 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PROLL_EmpLeave](
	[EmpLeaveId] [int] IDENTITY(1,1) NOT NULL,
	[LeaveRuleId] [int] NOT NULL,
	[Date] [datetime] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[RequestedTo] [int] NOT NULL,
	[ApprovedBy] [int] NULL,
	[ApprovedOn] [datetime] NULL,
	[LeaveStatus] [nvarchar](50) NOT NULL,
	[EmployeeId] [int] NOT NULL,
	[CancelledBy] [int] NULL,
	[CancelledOn] [datetime] NULL,
 CONSTRAINT [PK_PROLL_EmpLeave] PRIMARY KEY CLUSTERED 
(
	[EmpLeaveId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Shows leave status of the employee like pending, cancel, approved, approvedCancel' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PROLL_EmpLeave', @level2type=N'COLUMN',@level2name=N'LeaveStatus'
GO

/****** Object:  Table [dbo].[PROLL_MST_WeekendHolidays]    Script Date: 13-06-2019 17:20:04 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PROLL_MST_WeekendHolidays](
	[WeekendHolidayId] [int] IDENTITY(1,1) NOT NULL,
	[Year] [int] NOT NULL,
	[DayName] [nvarchar](50) NULL,
	[Value] [nvarchar](50) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ApprovedBy] [int] NULL,
	[IsApproved] [bit] NULL,
	[IsActive] [bit] NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
	[Description] [nvarchar](max) NULL,
 CONSTRAINT [PK_PROLL_MST_WeekendHolidays] PRIMARY KEY CLUSTERED 
(
	[WeekendHolidayId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[PROLL_AttendanceDailyTimeRecord]    Script Date: 03-06-2019 10:57:41 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PROLL_AttendanceDailyTimeRecord](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[EmployeeId] [int] NULL,
	[EmployeeName] [nvarchar](350) NULL,
	[RecordDateTime] [nvarchar](350) NULL,
 CONSTRAINT [PK_PROLL_AttendanceDailyTimeRecord] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


--------End:29th May 2019-- Salakha :- Created tables for payroll-----------

--------Start:4rd June 2019-- Salakha :-Added permission for-Holiday Weekend policy-----------
--Holiday Weekend policy
INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-main-setting-weekend-holiday-view',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO

    INSERT INTO RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive) 
  VALUES('Weekend Holiday Policy','PayrollMain/Setting/WeekendHoliday','WeekendHoliday',
  (select PermissionId from RBAC_Permission where PermissionName='payroll-main-setting-weekend-holiday-view'),
 (select RouteId from [RBAC_RouteConfig] where UrlFullPath = 'PayrollMain/Setting' and RouterLink ='Setting'),1,1)
  GO
  
  --Leave Category
  INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive])  VALUES
           ('payroll-main-setting-Leave-Category-view',(select ApplicationId from RBAC_Application where ApplicationCode='PAY') ,
           1 ,GETDATE(),1)
GO

      INSERT INTO RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive) 
  VALUES('Leave Category','PayrollMain/Setting/LeaveCategory','LeaveCategory',
  (select PermissionId from RBAC_Permission where PermissionName='payroll-main-setting-Leave-Category-view'),
  (select RouteId from [RBAC_RouteConfig] where UrlFullPath = 'PayrollMain/Setting' and RouterLink ='Setting'),1,1)
  GO


 insert into dbo.CORE_CFG_Parameters
values ( 'Payroll','PayrollLoadNoOfYears',10,'int','We will load last years from current year as per this number.','custom')
GO
 insert into dbo.CORE_CFG_Parameters
values ( 'Payroll','DefaultOfficeTime','{"TimeIn":"10:00:00","TimeOut":"6:00:00"}','JSON','This will load Default office time','custom')
  --------End:4rd June 2019-- Salakha :-Added permission for-Leave Category-----------
 GO
 --Start: Vikas: alter column name from LeaveRules table.
  sp_RENAME  'PROLL_MST_LeaveRules.LeaveId', 'LeaveRuleId' , 'COLUMN'
GO
 --End: Vikas: alter column name from LeaveRules table.




 
