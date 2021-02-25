---Incremental Script for Govt Insurance Billing-----

------start: yubaraj 17 July'2018----------


/****** Object:  Table [dbo].[INS_CFG_InsuranceProviders]    Script Date: 7/17/2018 6:31:05 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[INS_CFG_InsuranceProviders](
	[InsuranceProviderId] [int] IDENTITY(1,1) NOT NULL,
	[InsuranceProviderName] [varchar](100) NULL,
	[Description] [varchar](200) NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_INS_CFG_InsuranceProviders] PRIMARY KEY CLUSTERED 
(
	[InsuranceProviderId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[INS_TXN_PatientInsurancePackages]    Script Date: 7/17/2018 6:31:06 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[INS_TXN_PatientInsurancePackages](
	[PatientInsurancePackageId]  [int] IDENTITY(1,1) NOT NULL,
	[PackageId] [int] NULL,
	[PatientId] [int] NULL,
	[StartDate] [datetime] NULL,
	[EndDate] [datetime] NULL,
	[IsCompleted] [bit] NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_INS_TXN_PatientInsurancePackages] PRIMARY KEY CLUSTERED 
(
	[PatientInsurancePackageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


--END : Creating new tables-----

---===================================================---------------------

--START: Update Table: [dbo].[PAT_PatientInsuranceInfo]--

ALTER TABLE [dbo].[PAT_PatientInsuranceInfo] ADD InitialBalance FLOAT NOT NULL;
GO

ALTER TABLE [dbo].[PAT_PatientInsuranceInfo] ADD CurrentBalance FLOAT NOT NULL;
GO

ALTER TABLE [dbo].[PAT_PatientInsuranceInfo] ADD InsuranceProviderId INT NOT NULL;
GO

alter table [dbo].[PAT_PatientInsuranceInfo] add CreatedOn datetime null
go

alter table [dbo].[PAT_PatientInsuranceInfo]add CreatedBy int null
go

alter table [dbo].[PAT_PatientInsuranceInfo] add ModifiedOn datetime null
go

alter table [dbo].[PAT_PatientInsuranceInfo] add ModifiedBy int null
go
--renaming column--
sp_rename '[dbo].[PAT_PatientInsuranceInfo].[GroupNumber]', 'CardNumber', 'COLUMN';
go

-----------------------------------------------------------------------------------

ALTER TABLE [dbo].[PAT_PatientInsuranceInfo]
ADD FOREIGN KEY ([InsuranceProviderId]) REFERENCES [dbo].INS_CFG_InsuranceProviders([InsuranceProviderId]);
GO
---------------------------------------------------------------------------------------------------
--END: Update Table: [dbo].[PAT_PatientInsuranceInfo]--


SET IDENTITY_INSERT [dbo].[INS_CFG_InsuranceProviders] ON 
GO
INSERT [dbo].[INS_CFG_InsuranceProviders] ([InsuranceProviderId], [InsuranceProviderName], [Description], [CreatedOn], [CreatedBy], [ModifiedOn], [ModifiedBy], [IsActive]) VALUES (1, N'Government Insurance', NULL, CAST(N'2018-07-17T00:00:00.000' AS DateTime), 1, NULL, NULL, 1)
GO
SET IDENTITY_INSERT [dbo].[INS_CFG_InsuranceProviders] OFF
GO
------end: yubaraj 17 July'2018----------




----START: 18July'18 Ashim ------------------------
----start: Changes in BillItemPrice and BillingTransaction
alter table [dbo].[BIL_CFG_BillItemPrice]
add InsuranceApplicable bit null
go
update [dbo].[BIL_CFG_BillItemPrice]
set InsuranceApplicable=0
go
alter table [dbo].[BIL_CFG_BillItemPrice]
alter column InsuranceApplicable bit not null
go

---sud:19Mar'19below Column is already added for PriceCategory in billing--
--alter table [dbo].[BIL_CFG_BillItemPrice]
--add GovtInsurancePrice float null
--go

alter table [dbo].[BIL_TXN_BillingTransaction]
add IsInsuranceBilling bit null
go

alter table [dbo].[BIL_TXN_BillingTransaction]
add IsInsuranceClaimed bit null
go

alter table [dbo].[BIL_TXN_BillingTransaction]
add InsuranceClaimedDate datetime null
go

alter table [dbo].[BIL_TXN_BillingTransaction]
add InsuranceProviderId int null
go
----end: Changes in BillItemPrice and BillingTransaction

--- start :modify stored procedure for GET BillSettlement Items----

/****** Object:  StoredProcedure [dbo].[SP_TXNS_BILL_SettlementSummary]    Script Date: 7/17/2018 4:24:57 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_TXNS_BILL_SettlementSummary] 
AS
/*
FileName: [SP_BILL_SettlementBillSummary]
CreatedBy/date: sud:1Jun2018
Description: to get CreditTotal, ProvisionalTotal, DepositBalance of patients
Remarks:   We're selecting only those patients, who has balance amount in any of above types.
       : I've kept amount > 1 in filter list, otherwise it'll show a lot of un-necessary data.. 
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
*/
BEGIN
 
Select pat.PatientId, pat.PatientCode, 
       pat.FirstName+' '+ISNULL(pat.MiddleName+' ','')+ pat.LastName 'PatientName', 
	   pat.DateOfBirth,
	   pat.Gender,
     ISNULL( credit.CreditTotal,0) 'CreditTotal', 
	  cast(round(ISNULL(prov.ProvisionalTotal,0),2) as numeric(16,2))  'ProvisionalTotal', 

	 cast(
	      round( 
	           (ISNULL(dep.TotalDeposit,0)- ISNULL(dep.DepositDeduction,0) - ISNULL(dep.DepositReturn,0))
	         ,2) as numeric(16,2)) 'DepositBalance'
from PAT_Patient pat
LEFT JOIN
(
  Select txn.PatientId, 
  SUM(txn.TotalAmount) 'CreditTotal'  from BIL_TXN_BillingTransaction txn
  where txn.BillStatus ='unpaid' AND ISNULL(txn.ReturnStatus,0) != 1 AND ISNULL(txn.IsInsuranceBilling,0) != 1
  Group by txn.PatientId
) credit on pat.PatientId = credit.PatientId
LEFT JOIN
(
   Select txnItm.PatientId, SUM(txnItm.TotalAmount) 'ProvisionalTotal'
	   from BIL_TXN_BillingTransactionItems txnItm
       where txnItm.BillStatus='provisional' AND ISNULL(txnItm.ReturnStatus,0) != 1
     Group By txnItm.PatientId
) prov
ON pat.PatientId = prov.PatientId
LEFT JOIN
( 
  Select dep.PatientId,
    SUM(Case WHEN dep.DepositType='Deposit' THEN ISNULL(dep.Amount,0) ELSE 0  END ) AS 'TotalDeposit',
    SUM(Case WHEN dep.DepositType='depositdeduct' THEN ISNULL(dep.Amount,0) ELSE 0  END ) AS 'DepositDeduction',
	SUM(Case WHEN dep.DepositType='ReturnDeposit' THEN ISNULL(dep.Amount,0) ELSE 0  END ) AS 'DepositReturn'
   FROM BIL_TXN_Deposit dep
   Group by dep.PatientId
) dep
ON dep.PatientId = pat.PatientId

---show only those patients which has either amount > 0
where ISNULL(credit.CreditTotal,0) > 1 
      OR ISNULL(prov.ProvisionalTotal,0) > 1  
	  OR ( dep.TotalDeposit-dep.DepositDeduction - dep.DepositReturn) > 1
END
go
--- end :modify stored procedure for GET BillSettlement Items----


---remove after getting proper insurance billing items: creates dummy insurance billing items for billing--------

--update [dbo].[BIL_CFG_BillItemPrice]
--set InsuranceApplicable=0 , GovtInsurancePrice=0
--where ServiceDepartmentId=1
--go
---remove after getting proper insurance billing items: creates dummy insurance billing items for billing--------


----END: 18July'18 Ashim ------------------------



-----START: 18 July '18 Ashim -------------------------


alter table [dbo].[BIL_TXN_BillingTransactionItems]
add PatientInsurancePackageId int null
go

ALTER TABLE [dbo].[INS_TXN_PatientInsurancePackages] ADD  CONSTRAINT [IsCompletedPackageTransaction]  DEFAULT ((0)) FOR [IsCompleted]
GO
ALTER TABLE [dbo].[INS_TXN_PatientInsurancePackages] ADD  CONSTRAINT [IsActivePackageTransaction]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[INS_CFG_InsuranceProviders] ADD  CONSTRAINT [IsActiveInsuranceProvider]  DEFAULT ((1)) FOR [IsActive]
GO
----start: changes for Billing Package
alter table [dbo].[BIL_CFG_Packages]
add InsuranceApplicable bit null
go
update [dbo].[BIL_CFG_Packages]
set InsuranceApplicable = 0
go
alter table [dbo].[BIL_CFG_Packages]
alter column InsuranceApplicable bit not null
go
ALTER TABLE [dbo].[BIL_CFG_Packages] ADD  CONSTRAINT [PackageInsuranceApplicable]  DEFAULT ((0)) FOR [InsuranceApplicable]
GO


alter table [dbo].[BIL_CFG_BillItemPrice]
add IsPackage bit null
go
update  [dbo].[BIL_CFG_BillItemPrice]
set IsPackage =0
go
alter table [dbo].[BIL_CFG_BillItemPrice]
alter column IsPackage bit not null
go
----end: changes for Billing Package

----start: insert scripts for Billing Packages (Medical Services)-------
-- INSERT INTO [dbo].[MST_Department]
--           ([DepartmentName],[Description],[IsActive],[IsAppointmentApplicable],[CreatedBy],[CreatedOn])
--     VALUES('MedicalServices','Insurance Packages',1,0,1,'2018-07-20')
--GO
--  declare @deptId int
--  set @deptId = (select DepartmentId from [dbo].[MST_Department] where DepartmentName='MedicalServices')
  
--INSERT INTO [dbo].[BIL_MST_ServiceDepartment]
--           ([ServiceDepartmentName],[DepartmentId],[CreatedBy],[CreatedOn],[IsActive])
--     VALUES
--           ('MedicalServices',@deptId,1,'2018-07-20',1)
--GO
--declare @srvDeptId int
--set @srvDeptId = (select ServiceDepartmentId from [dbo].[BIL_MST_ServiceDepartment] where ServiceDepartmentName='MedicalServices')

--INSERT INTO [dbo].[BIL_CFG_BillItemPrice]
--(ServiceDepartmentId,ItemName,Description,Price,ItemId,TaxApplicable,DiscountApplicable,CreatedBy,CreatedOn,IsActive,IsPackage,InsuranceApplicable,GovtInsurancePrice)
--VALUES (@srvDeptId,'Nebulization per episode','Day care',100,1,0,0,1,'2018-07-20',1,1,1,100)
--go

--INSERT INTO [dbo].[BIL_CFG_Packages]
--(BillingPackageName,Description,TotalPrice,BillingItemsXML,CreatedBy,CreatedOn,IsActive,InsuranceApplicable)
--VALUES (N'Nebulization per episode','DayCare',100,N'<root><Items><ServiceDeptId>43</ServiceDeptId><ItemId>1</ItemId><Quantity>1</Quantity></Items></root>',1,'2018-07-20',1,1)
--GO

GO
sp_rename '.[BIL_CFG_BillItemPrice].IsPackage', 'IsInsurancePackage', 'COLUMN';

update  [dbo].[BIL_CFG_Packages]
set DiscountPercent=0 where DiscountPercent is NULL
go
alter table [dbo].[BIL_CFG_Packages]
alter column DiscountPercent float not null
go
update  [dbo].[BIL_CFG_Packages]
set TotalPrice=0 where TotalPrice is NULL
go
alter table [dbo].[BIL_CFG_Packages]
alter column TotalPrice float not null
go


----end: insert scripts for Billing Packages (Medical Services)-------

-----END: 18 July '18 Ashim -------------------------


----------------START: 27TH July 2018 Yubaraj  | Permission and Route updates for insurance settlements-----------------

--1. Update Permission of main settlement
  update [RBAC_Permission] 
  set PermissionName='billing-settlements-view' where PermissionName='billing-billsettlements-view';
Go
--2. Update route of main settlement
	update [dbo].[RBAC_RouteConfig]
    set UrlFullPath='Billing/Settlements',RouterLink='Settlements' where UrlFullPath='Billing/BillSettlements';
GO
--3. Insert permission for bill settlement
	INSERT INTO [dbo].[RBAC_Permission]
           ([PermissionName]
           ,[ApplicationId]
           ,[CreatedBy]
           ,[CreatedOn]
           ,[IsActive])
     VALUES
          ('billing-settlements-bill-settlement-view',6,1,'2018-07-27',1)
	GO
  	
-- 4. Insert permission for insurance settlement
INSERT INTO [dbo].[RBAC_Permission]
           ([PermissionName]
           ,[ApplicationId]
           ,[CreatedBy]
           ,[CreatedOn]
           ,[IsActive])
     VALUES
          ('billing-settlements-insurance-settlement-view',6,1,'2018-07-27',1)
	GO
--5 Insert route for bill settlement
	declare @perId int
	set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-settlements-bill-settlement-view')
	
	declare @parentRouteId int
	set @parentRouteId = (select RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath='Billing/Settlements')

	INSERT INTO [dbo].[RBAC_RouteConfig]
           ([DisplayName]
           ,[UrlFullPath]
           ,[RouterLink]
           ,[PermissionId]
		   ,[ParentRouteId]
           ,[IsActive])
     VALUES
          ('Bill Settlement','Billing/Settlements/BillSettlements','BillSettlements',@perId,@parentRouteId,1);
		  
	GO

--6. Insert route for insurance settlement
	declare @perId int
	set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-settlements-insurance-settlement-view')
	
	declare @parentRouteId int
	set @parentRouteId = (select RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath='Billing/Settlements')

	INSERT INTO [dbo].[RBAC_RouteConfig]
           ([DisplayName]
           ,[UrlFullPath]
           ,[RouterLink]
           ,[PermissionId]
		   ,[ParentRouteId]
           ,[IsActive])
     VALUES
          ('Insurance Settlement','Billing/Settlements/InsuranceSettlements','InsuranceSettlements',@perId,@parentRouteId,1);
		  
	GO


	--Permission

  declare @perId int
  set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-settlements-bill-settlement-view')

  declare @roleId int
  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='SuperAdmin')

  Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,'2018-07-27',1)
  
  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='BillingAdmin')
   Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,'2018-07-27',1)

   
  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='BillingUser')
   Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,'2018-07-27',1)

   set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Admin')
   Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,'2018-07-27',1)
   go

   
  declare @perId int
  set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-settlements-insurance-settlement-view')

  declare @roleId int
  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='SuperAdmin')

  Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,'2018-07-27',1)
  
  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='BillingAdmin')
   Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,'2018-07-27',1)

   
  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='BillingUser')
   Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,'2018-07-27',1)

   set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Admin')
   Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,'2018-07-27',1)
   go

----------------END: 27TH July 2018 Yubaraj  | Permission and Route updates for insurance settlements-----------------

---Ashim: INS_Incremental Script ---18Aug2018 Onwards---------

--start: ashim: 18Aug2018 --- update tax applicable and invoice code
update [dbo].[BIL_CFG_BillItemPrice]
set TaxApplicable=0 where TaxApplicable=1
go

update [dbo].[BIL_TXN_BillingTransaction]
set InvoiceCode='INS' where IsInsuranceBilling=1
go


--end: ashim: 18Aug2018 --- update tax applicable and invoice code



/****** Object:  Table [dbo].[GovtInsuranceItems]    Script Date: 8/10/2018 9:42:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GovtInsuranceItems](
	[Sno] [int] NULL,
	[DepartmentId] [int] NULL,
	[DepartmentName] [nvarchar](255) NULL,
	[ServiceDepartmentId] [int] NULL,
	[ServiceDepartmentName] [nvarchar](255) NULL,
	[ItemId] [int] NULL,
	[ItemName] [nvarchar](255) NULL,
	[ImagingTypeId] [int] NULL,
	[Description] [nvarchar](255) NULL,
	[Price] [float] NULL,
	[IsPackage] [bit] NULL,
	[IntegrationName] [nvarchar](255) NULL
) ON [PRIMARY]
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) 
VALUES (1, NULL, N'Lab', NULL, N'Hematology', NULL, N'TC', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2, NULL, N'Lab', NULL, N'Hematology', NULL, N'DC', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (3, NULL, N'Lab', NULL, N'Hematology', NULL, N'Hb', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (4, NULL, N'Lab', NULL, N'Hematology', NULL, N'TC/DC/Hb', NULL, NULL, 105, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (5, NULL, N'Lab', NULL, N'Hematology', NULL, N'Absolute count(Eosinophil/ Neutrophil/ Lymphocyte/ Monocyte/ Basophil)', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (6, NULL, N'Lab', NULL, N'Hematology', NULL, N'APTT(Activated partial Thromboplastin Time)', NULL, NULL, 290, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (7, NULL, N'Lab', NULL, N'Hematology', NULL, N'CT', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (8, NULL, N'Lab', NULL, N'Hematology', NULL, N'BT', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (9, NULL, N'Lab', NULL, N'Hematology', NULL, N'PT/INR', NULL, NULL, 180, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (10, NULL, N'Lab', NULL, N'Hematology', NULL, N'Mean Corpuscular Hemoglobin (MCH)', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (11, NULL, N'Lab', NULL, N'Hematology', NULL, N'Mean Corpuscular Hemoglobin Concentration (MCHC)', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (12, NULL, N'Lab', NULL, N'Hematology', NULL, N'Mean Corpuscular Volume(MCV)', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (13, NULL, N'Lab', NULL, N'Hematology', NULL, N'Packed Cell Volume (PCV)', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (14, NULL, N'Lab', NULL, N'Hematology', NULL, N'Peripheral smear/ RBC morphology comment', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (15, NULL, N'Lab', NULL, N'Hematology', NULL, N'Platelet count', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (16, NULL, N'Lab', NULL, N'Hematology', NULL, N'RBC count', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (17, NULL, N'Lab', NULL, N'Hematology', NULL, N'Reticulocyte count', NULL, NULL, 125, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (18, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'24 hour urine protein', NULL, NULL, 160, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (19, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'A/G ratio', NULL, NULL, 317, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (20, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'ABG gas (6 parameters)', NULL, NULL, 680, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (21, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Adenosine deaminase(ADA) Test', NULL, NULL, 575, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (22, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Aldehyde test', NULL, NULL, 95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (23, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Alkaline phosphatase (ALP)', NULL, NULL, 123, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (24, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Beta HCG', NULL, NULL, 800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (25, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'CK-MB', NULL, NULL, 330, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (26, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Creatine Phosphokinase (CPK)', NULL, NULL, 215, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (27, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Creatinine clearance', NULL, NULL, 390, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (28, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'D-dimer', NULL, NULL, 400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (29, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Erythrocyte Sedimentation Rate (ESR)', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (30, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Fecal Occult Blood Test (FOBT)', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (31, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Ferritin', NULL, NULL, 775, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (32, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Fluid/CSF RE/BioChemistry(sugar,protein)', NULL, NULL, 171, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (33, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Folic acid level', NULL, NULL, 950, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (34, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Glucose tolerance test (GTT)', NULL, NULL, 240, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (35, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'HbA1C level', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (36, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Hemoglobin electrophoresis', NULL, NULL, 550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (37, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Lactate Dehydrogenase (LDH)', NULL, NULL, 310, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (38, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Lipid Profile', NULL, NULL, 600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (39, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'HDL', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (40, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'LDL', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (41, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Total Cholesterol', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (42, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Triglyceride', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (43, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Phenytoin level', NULL, NULL, 600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (44, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Prostate Specific Antigen (PSA)', NULL, NULL, 800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (45, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Protein Electrophoresis (serum/urine)', NULL, NULL, 195, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (46, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Total Protein', NULL, NULL, 130, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (47, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Albumin', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (48, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Amylase', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (49, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Bilirubin T/D', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (50, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Blood Sugar', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (51, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Calcium', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (52, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Cholesterol', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (53, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Creatinine', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (54, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum electrolyte (Sodium+Potassium)', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (55, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Gamma GT', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (56, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Globulin', NULL, NULL, 105, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (57, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Iron Profile', NULL, NULL, 1100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (58, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Lipase', NULL, NULL, 340, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (59, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Lithium', NULL, NULL, 559, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (60, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Magnesium', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (61, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Phosphorus', NULL, NULL, 185, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (62, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Potassium', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (63, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Sodium', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (64, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Urea', NULL, NULL, 90, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (65, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Serum Uric Acid', NULL, NULL, 95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (66, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'SGOT/AST', NULL, NULL, 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (67, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'SGPT/ALT', NULL, NULL, 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (68, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'TORCH', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (69, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Total Protein', NULL, NULL, 105, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (70, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Troponin I (Quantitative)', NULL, NULL, 1200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (71, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Troponin I (Qualitative)', NULL, NULL, 715, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (72, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Urine Acetone', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (73, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Urine Microalbumin', NULL, NULL, 460, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (74, NULL, N'Lab', NULL, N'Biochemistry', NULL, N'Urobillinogen/Prophobillinogen', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (75, NULL, N'Lab', NULL, N'Immunology', NULL, N'HIV RDT', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (76, NULL, N'Lab', NULL, N'Immunology', NULL, N'ABO Blood grouping/ Rh D', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (77, NULL, N'Lab', NULL, N'Immunology', NULL, N'Anti CCP (Anti Citrulinated protein) antibody', NULL, NULL, 1050, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (78, NULL, N'Lab', NULL, N'Immunology', NULL, N'Anti TPO (Thyroid peroxidase) antibody', NULL, NULL, 1650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (79, NULL, N'Lab', NULL, N'Immunology', NULL, N'Anti-DNA', NULL, NULL, 550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (80, NULL, N'Lab', NULL, N'Immunology', NULL, N'Antinuclear Antibody (ANA)', NULL, NULL, 525, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (81, NULL, N'Lab', NULL, N'Immunology', NULL, N'Antistreptolysin O (ASO)', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (82, NULL, N'Lab', NULL, N'Immunology', NULL, N'Brucellosis (agglutination test)', NULL, NULL, 325, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (83, NULL, N'Lab', NULL, N'Immunology', NULL, N'Coombs Test', NULL, NULL, 110, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (84, NULL, N'Lab', NULL, N'Immunology', NULL, N'C-Reactive Protein (CRP)', NULL, NULL, 160, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (85, NULL, N'Lab', NULL, N'Immunology', NULL, N'Cross match', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (86, NULL, N'Lab', NULL, N'Immunology', NULL, N'Cysticercosis', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (87, NULL, N'Lab', NULL, N'Immunology', NULL, N'Dengue RDT', NULL, NULL, 800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (88, NULL, N'Lab', NULL, N'Immunology', NULL, N'HBsAg RDT', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (89, NULL, N'Lab', NULL, N'Immunology', NULL, N'HCV RDT', NULL, NULL, 265, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (90, NULL, N'Lab', NULL, N'Immunology', NULL, N'HCV/HIV/HBsAg ELISA', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (91, NULL, N'Lab', NULL, N'Immunology', NULL, N'Helicobacter Pylori RDT', NULL, NULL, 650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (92, NULL, N'Lab', NULL, N'Immunology', NULL, N'Hepatitis E RDT', NULL, NULL, 630, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (93, NULL, N'Lab', NULL, N'Immunology', NULL, N'HIV CD4 count', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (94, NULL, N'Lab', NULL, N'Immunology', NULL, N'HIV Viral load', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (95, NULL, N'Lab', NULL, N'Immunology', NULL, N'Immunohistochemistry (per marker)', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (96, NULL, N'Lab', NULL, N'Immunology', NULL, N'Influenza RDT/PCR', NULL, NULL, 1320, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (97, NULL, N'Lab', NULL, N'Immunology', NULL, N'Kalaza rk39 RDT', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (98, NULL, N'Lab', NULL, N'Immunology', NULL, N'Leptospira RDT', NULL, NULL, 400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (99, NULL, N'Lab', NULL, N'Immunology', NULL, N'Malaria RDT', NULL, NULL, 250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (100, NULL, N'Lab', NULL, N'Immunology', NULL, N'Mountoux test', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (101, NULL, N'Lab', NULL, N'Immunology', NULL, N'Rheumatoid factor', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (102, NULL, N'Lab', NULL, N'Immunology', NULL, N'RPR/VDRL', NULL, NULL, 95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (103, NULL, N'Lab', NULL, N'Immunology', NULL, N'Thyroglobulin Antibody', NULL, NULL, 2640, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (104, NULL, N'Lab', NULL, N'Immunology', NULL, N'TPHA', NULL, NULL, 230, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (105, NULL, N'Lab', NULL, N'Immunology', NULL, N'Urine Pregnancy test RDT', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (106, NULL, N'Lab', NULL, N'Immunology', NULL, N'Widal (Salmonella agglutination)', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (107, NULL, N'Lab', NULL, N'Immunology', NULL, N'Sickling test RDT', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (108, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Acid Fast Bacilli (AFB) Stain', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (109, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Blood CS (Bactec)', NULL, NULL, 700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (110, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Blood CS (Conventional)', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (111, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Body fluid/CSF CS', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (112, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Gram''s Stain', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (113, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'KOH/India ink fungal microscopy', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (114, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Microfilaria', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (115, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Pus CS', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (116, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Sputum/throat swab/respiratory specimen CS', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (117, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Stool CS', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (118, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Stool RE/ME', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (119, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Urethral/ vaginal swab CS', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (120, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Urine CS', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (121, NULL, N'Lab', NULL, N'Bacteriology/Parasitology', NULL, N'Urine RE/ME', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (122, NULL, N'Lab', NULL, N'Histopathology', NULL, N'Bone Marrow Biopsy', NULL, NULL, 1700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (123, NULL, N'Lab', NULL, N'Histopathology', NULL, N'Bone Marrow Report', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (124, NULL, N'Lab', NULL, N'Histopathology', NULL, N'Bone Marrow Test (Aspiration)', NULL, NULL, 950, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (125, NULL, N'Lab', NULL, N'Histopathology', NULL, N'FNAC procedure and reporting', NULL, NULL, 510, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (126, NULL, N'Lab', NULL, N'Histopathology', NULL, N'Histopathology Intermediate', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (127, NULL, N'Lab', NULL, N'Histopathology', NULL, N'Histopathalogy Major', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (128, NULL, N'Lab', NULL, N'Histopathology', NULL, N'Histopathalogy Minor', NULL, NULL, 600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (129, NULL, N'Lab', NULL, N'Histopathology', NULL, N'LE Cell', NULL, NULL, 90, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (130, NULL, N'Lab', NULL, N'Histopathology', NULL, N'PAP stain of cervical smear/reporting', NULL, NULL, 315, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (131, NULL, N'Lab', NULL, N'Histopathology', NULL, N'Routine cytological stain/report', NULL, NULL, 425, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (132, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'C-peptide', NULL, NULL, 2200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (133, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Estradiol', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (134, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Follicle Stimulating Hormone (FSH)', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (135, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Growth Hormone', NULL, NULL, 700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (136, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Leutenizing hormone(LH)', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (137, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Parathyroid Hormone', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (138, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Progesterone', NULL, NULL, 650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (139, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Prolactin Hormone', NULL, NULL, 550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (140, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Serum cortisol', NULL, NULL, 990, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (141, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Serum Inhibin', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (142, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Serum insulin', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (143, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Testosterone', NULL, NULL, 650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (144, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Vitamin B 12', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (145, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Vitamin D', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (146, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'Thyroid Function Tests', NULL, NULL, 900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (147, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'T3', NULL, NULL, 310, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (148, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'T4', NULL, NULL, 310, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (149, NULL, N'Lab', NULL, N'Endocrinology', NULL, N'TSH', NULL, NULL, 310, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (150, NULL, N'Radiology', NULL, N'USG', NULL, N'USG A Scan (Eye) and Soft tissue - Neck, Breast etc. Scan', NULL, NULL, 360, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (151, NULL, N'Radiology', NULL, N'USG', NULL, N'USG (abdomen/pelvis) Scan', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (152, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'Plain X Ray (10*12/ 14*17)', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (153, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'CR X Ray Small (8*10/ 10*12)', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (154, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'X Ray Medium(11*14)', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (155, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'X Ray Large(14*17)', NULL, NULL, 400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (156, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'X Ray digital (double exposure)', NULL, NULL, 400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (157, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'X Ray digital (three exposure)', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (158, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'X Ray digital (four exposure)', NULL, NULL, 600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (159, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'Dental X ray', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (160, NULL, N'Radiology', NULL, N'CT Scan', NULL, N'CT(abdomen/pelvis) plain', NULL, NULL, 5000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (161, NULL, N'Radiology', NULL, N'CT Scan', NULL, N'CT(abdomen/pelvis) contrast', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (162, NULL, N'Radiology', NULL, N'CT Scan', NULL, N'CT (head) plain', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (163, NULL, N'Radiology', NULL, N'CT Scan', NULL, N'CT(head) contrast', NULL, NULL, 4000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (164, NULL, N'Radiology', NULL, N'CT Scan', NULL, N'CT(Other: cervical spine/KUB/joint/neck etc.)', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (165, NULL, N'Radiology', NULL, N'USG', NULL, N'USG guided FNAC', NULL, NULL, 850, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (166, NULL, N'Radiology', NULL, N'CT Scan', NULL, N'CT guided FNAC', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (167, NULL, N'Radiology', NULL, N'CT Scan', NULL, N'Coronary angiography', NULL, NULL, 12000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (168, NULL, N'Radiology', NULL, N'CT Scan', NULL, N'Peripheral angiography', NULL, NULL, 8000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (169, NULL, N'Radiology', NULL, N'CT Scan', NULL, N'Renal angiography', NULL, NULL, 8000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (170, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'Barium meal/swallow', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (171, NULL, N'Radiology', NULL, N'Mamography', NULL, N'Mammogram', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (172, NULL, N'Radiology', NULL, N'USG', NULL, N'Colour Doppler', NULL, NULL, 950, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (173, NULL, N'Radiology', NULL, N'X-Ray', NULL, N'Urethrogram/cystogram', NULL, NULL, 360, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (174, NULL, N'Radiology', NULL, N'Mamography', NULL, N'Mammogram(unilateral)', NULL, NULL, 875, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (175, NULL, N'Radiology', NULL, N'MRI', NULL, N'MRI Group A (Brain, Spine, body organs) Segment', NULL, NULL, 4500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (176, NULL, N'Radiology', NULL, N'MRI', NULL, N'MRI Group B (Brain, Spine, body organs) Full', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (177, NULL, N'Radiology', NULL, N'MRI', NULL, N'MRI Group C (extremities, joints etc.)', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (178, NULL, N'Radiology', NULL, N'MRI', NULL, N'MRI Group D (Screening for tumour)', NULL, NULL, 13000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (179, NULL, N'Radiology', NULL, N'USG', NULL, N'USG B Scan', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (180, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dressing minor', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (181, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dental extraction simple per unit', NULL, NULL, 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (182, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Catheterization (Procedure only)', NULL, NULL, 225, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (183, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stitch Removal/Dressing major', NULL, NULL, 250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (184, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Suture Removal Under LA', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (185, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dental extraction (difficult) per unit', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (186, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dental filling (composite) per unit', NULL, NULL, 350, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (187, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Incision and drainage abscess (small)', NULL, NULL, 450, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (188, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Intravesical BCG/Mitomycin instillation', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (189, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Electric Cautery', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (190, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Suprapubic/Pleural/other body fluid aspiration', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (191, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laceration repair Minor/Suturing Minor', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (192, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Others procedures', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (193, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'USG guided drainage procedure', NULL, NULL, 650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (194, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Surgical extraction (dental) per unit', NULL, NULL, 670, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (195, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foreign body removal (eye/ear/throat) simple', NULL, NULL, 700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (196, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Intra-Articular Steroid injection (including steroid medicine)', NULL, NULL, 850, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (197, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ganglion aspiration and steroid injection (Including steroid medicine)', NULL, NULL, 850, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (198, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Intralesional injection for Pyronies disease', NULL, NULL, 850, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (199, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Incision and drainage abscess (Large)', NULL, NULL, 900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (200, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fallopian tube- Hydrotubation', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (201, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fallopian tube- Insufflation LA', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (202, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Vault Thread Removal', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (203, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye lid; Stye/Lid Abscess Drainage', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (204, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Impacted tooth/molar (LA) package', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (205, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cryotherapy/service', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (206, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laceration repair Major/Suturing Major', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (207, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Other', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (208, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fracture reduction POP cast minor/slab', NULL, NULL, 1200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (209, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ear Lobe repair', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (210, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Examination under IV sedation', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (211, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Endometrial Biopsy LA', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (212, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cyclocryo Therapy/Electro Epilation', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (213, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Corneal Scrapping', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (214, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye: Macular Grid Laser (One eye)', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (215, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'I & D LA', NULL, NULL, 1750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (216, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Secondary suturing LA', NULL, NULL, 1750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (217, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Burr Hole for Subdural/Ventricular Puncture', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (218, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Secondary suturing LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (219, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Antegradepyelogram', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (220, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Prostate-Prostatic biopsy (Finger guided)', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (221, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Cervical Biopsy LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (222, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Cervical Polypectomy LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (223, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Perineum-1st and 2nd degree Tear Old LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (224, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Dilatation and Curettage LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (225, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina- Hymenectomy LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (226, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Bartholin Abscess I&D LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (227, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Biopsy Vulva/Vagina LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (228, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Excision of bartholin cyst LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (229, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Vaginal Wall Cyst Removal LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (230, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Simple Caste in O.T.(cast extra)/Fracture reduction intermediate (below knee, below elbow) including cast', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (231, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Aspiration and irrigation for priapism', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (232, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Conjunctiva Plasty/Suturing', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (233, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye: Prophylactic Laser (One Eye)', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (234, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Corrective cast', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (235, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Epidural Block', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (236, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Fracture Fixation LA', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (237, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'K-wire Removal', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (238, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Colonoscopy', NULL, NULL, 2500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (239, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hemorrhoid banding', NULL, NULL, 2500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (240, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Cryosurgery', NULL, NULL, 2500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (241, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cystoscopy (with DJ removal /biopsy)', NULL, NULL, 2500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (242, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Retrograde Urethrogram (RGU) +Micturating  Cystourethrogram (MCUG)', NULL, NULL, 2500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (243, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Retina Yag Laser', NULL, NULL, 2500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (244, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Perioral sinus excision LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (245, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Papilloma excision simple LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (246, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Muscle biopsy LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (247, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Mucous retention cyst LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (248, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ingrowing toenail excision unilateral LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (249, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Granuloma excision LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (250, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ganglion excision LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (251, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Frenuloplasty LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (252, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foreign body exploration LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (253, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fibroma excision LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (254, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dermoid cyst excision LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (255, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hip Spica', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (256, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fracture reduction POP cast major (long leg, above elbow, above knee)', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (257, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Steinmann pin For Fracture fixation', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (258, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Excision of urethral caruncle', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (259, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Urethral dilation LA', NULL, NULL, 2550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (260, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anal- Seton change IVA', NULL, NULL, 2625, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (261, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Adrenal - Adrenalectomy Open', NULL, NULL, 2700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (262, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Meatotomy', NULL, NULL, 2720, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (263, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - SPC insertion LA', NULL, NULL, 2750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (264, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Chalazion Surgery', NULL, NULL, 2800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (265, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Prostate-Prostatic biopsy (RURS guided)', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (266, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethral Dilation LA', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (267, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Electric Cauterization of Cervix LA', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (268, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-McDonald suture LA', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (269, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Suctino Evacuation for Molar Pregnancy IVA', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (270, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - SPC insertion under USG guidance', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (271, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Probing Under LA', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (272, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'F.B. In Corneal Stroma Deep', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (273, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cystoscopy  LA', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (274, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vas-Vasectomy', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (275, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cisternal Puncture  (OPD procedure)', NULL, NULL, 3400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (276, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Sebaceous cyst excision single LA', NULL, NULL, 3400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (277, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lymphnode excision biopsy LA', NULL, NULL, 3400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (278, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lipoma excision single LA', NULL, NULL, 3400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (279, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Corn sole excision LA', NULL, NULL, 3400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (280, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vas-Vasoepididymostomy (Microsurgery)LA', NULL, NULL, 3400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (281, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-LEEP LA', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (282, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Hysterosalpingograph (HSG)', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (283, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Marsupilization of Bartholin cyst', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (284, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'DJ removal LA', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (285, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lid Laceration Repair  Small', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (286, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Suture Removal Under GA', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (287, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dacryocystectomy (DCT)', NULL, NULL, 3600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (288, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'I & D SA', NULL, NULL, 3600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (289, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Sigmoidoscopy with biopsy/polypectomy', NULL, NULL, 4000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (290, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Conization Ketamine and others', NULL, NULL, 4000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (291, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fallopian tube- Hydrotubation Ketamine and others', NULL, NULL, 4000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (292, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Diagnostic Hysteroscopy LA', NULL, NULL, 4000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (293, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Post Abortion Care (PAC) with MVA', NULL, NULL, 4000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (294, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye : Canthoplasty', NULL, NULL, 4000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (295, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Sebaceous cyst excision multiple LA', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (296, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Papilloma excision multiple LA', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (297, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lipoma excision multiple LA', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (298, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ingrowing toenail excision bilateral LA', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (299, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hemorrhoid banding', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (300, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Gynaecomastia excision unilateral LA', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (301, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Comprehensive Abortion Care (CAC) LA', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (302, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot- MTP/IP Joints Dislocations', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (303, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hand- MCP/IP Joints Dislocations', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (304, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Shoulder/Elbow Dislocation (traction/arm sling)', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (305, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Dorsal Slit for paraphimosis', NULL, NULL, 4250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (306, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cleft Lip (Revision) LA', NULL, NULL, 4500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (307, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testis-Testicular biopsy percutaneous', NULL, NULL, 4500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (308, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - SPC insertion SA', NULL, NULL, 4500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (309, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Cyst Removal(Big/Small)', NULL, NULL, 4500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (310, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'I & D GA', NULL, NULL, 4500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (311, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Colonoscopy with biopsy/polypectomy', NULL, NULL, 5000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (312, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Shirodhker Suture LA', NULL, NULL, 5000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (313, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lid Tumor Excision With Reconstruction  Small', NULL, NULL, 5000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (314, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Probing Under GA', NULL, NULL, 5000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (315, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testicular biopsy LA', NULL, NULL, 5100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (316, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Root Block', NULL, NULL, 5100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (317, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Contracture Release with Z Plasty LA', NULL, NULL, 5100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (318, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dermabrasion /Chemical Peel LA', NULL, NULL, 5100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (319, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tongue Tie Release LA', NULL, NULL, 5100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (320, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Trigger Finger Release LA', NULL, NULL, 5100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (321, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Meatoplasty', NULL, NULL, 5100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (322, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Debridement & Closure(LA) package', NULL, NULL, 5200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (323, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Secondary suturing GA', NULL, NULL, 5400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (324, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina- Le Forte LA', NULL, NULL, 5400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (325, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Fracture Fixation SA', NULL, NULL, 5400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (326, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Urethral dilation SA', NULL, NULL, 5400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (327, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Perineum-3rd Degree Tear Acute', NULL, NULL, 5500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (328, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Hysteroscopy with Biopsy', NULL, NULL, 5500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (329, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Endoscopic Variceal banding', NULL, NULL, 5500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (330, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Evisceration', NULL, NULL, 5500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (331, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye lid: Entropion Surgery', NULL, NULL, 5500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (332, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Vitrectomy', NULL, NULL, 5750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (333, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Examinaiton under Anesthesia (EUA)', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (334, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Frenuloplasty', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (335, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Epidural Anesthesia in labor', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (336, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'EUA + Cervical Biopsy or Endometrial biopsy', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (337, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'EUA + Cystoscopy', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (338, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye lid: Ectropion Surgery', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (339, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lid Laceration Repair  Large', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (340, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'ICG Angiogram', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (341, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Corneal Repair  Simple', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (342, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Conjunctiva: Pterigium Surgery', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (343, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Glaucoma: Peripheral Iridotomy (PI)', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (344, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Burr Hole(s) for EVD placement', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (345, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Amputation digital SA', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (346, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Implant Removal Plate  Removal GA/SA', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (347, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Toes & Finger Arthrodesis SA/Regional block', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (348, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cleft Lip Bilateral LA', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (349, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cystoscopy (Rigid) Caudal block', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (350, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cystoscopy SA', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (351, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'DJ removal SA', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (352, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Assisted Delivery (Vacuum/Forceps);', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (353, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-LEEP Ketamine', NULL, NULL, 6500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (354, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dilation and Curettage (D & C)', NULL, NULL, 6549, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (355, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Squint Surgery  1 muscle', NULL, NULL, 6700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (356, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'DJ stenting LA', NULL, NULL, 6750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (357, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hernia repair unilateral LA', NULL, NULL, 8750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (358, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'CSF Shunt Removal (OPD procedure)', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (359, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Umbilical hernia repair LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (360, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Gynaecomastia excision bilateral LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (361, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Evisceration (EVS) for hydrocele LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (362, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'CRPP (Small Joints)', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (363, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Implant removal Simple', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (364, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Surgical Release (Trigger/DQ release)', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (365, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Repair Intermediate', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (366, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Repair Minor', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (367, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Excision of Cutaneous Lesion and SSG or FTSG LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (368, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Facial Laceration Suturing (Simple) LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (369, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Minor Lip procedure LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (370, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Orocutaneous Fistula Closure with Flaps LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (371, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Polydactyli Correction Single LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (372, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Skin Grafting Raw Area LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (373, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Repair (Single) LA', NULL, NULL, 6800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (374, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Conjunctival Laceration Repair', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (375, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Debridement GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (376, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Debridement SA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (377, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Re-Exploration Laparotomy', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (378, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Neurorrhaphy with Nerve Graft', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (379, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Cervical Biopsy GA/Ketamine', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (380, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Electric Cauterization of Cervix GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (381, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Dilatation and Curettage GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (382, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Endometrial Biopsy GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (383, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Excision of Bartholin cyst GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (384, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Transposition of Ulnar Nerve GA/Regional Block', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (385, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Elbow - ( Epicondyle/Condyle Fracture) Epiphyseal Excision Regional Block', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (386, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Finger/Toes Fracture ORIF Regional block', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (387, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Dislocation MUA & Traction Ketamine', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (388, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Contracture Release with Multiple Z plasty GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (389, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Electrical Burns Fasciotomy GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (390, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Excision of Granulation Tissue Escharectomy Or Debridement GA Small', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (391, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pedicled Flap Detachment Major or Minor GA/LA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (392, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tongue Tie Release GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (393, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Trigger Finger Release GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (394, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cystoscopy (Rigid) GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (395, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Percutaneous Nephrostomy (PCN) placement LA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (396, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Circumcision GA', NULL, NULL, 7200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (397, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Circumcision /phimosis LA', NULL, NULL, 7225, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (398, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dacrocystorhinostomy (DCR) surgery', NULL, NULL, 7500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (399, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Evisceration With Implant', NULL, NULL, 7500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (400, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Epigastric hernia repair LA', NULL, NULL, 7650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (401, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Toes Debridement Repair Regional Block', NULL, NULL, 7650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (402, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hand Carpal Tunnel Release LA/Regional block', NULL, NULL, 7650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (403, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Grafting LA', NULL, NULL, 7650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (404, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pharyngeal Abscess package(including Drainage)', NULL, NULL, 8000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (405, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Breast lump excision single LA', NULL, NULL, 8075, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (406, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Breast- Ganaecomastia GA', NULL, NULL, 8100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (407, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biopsy Orthopaedic GA/SA', NULL, NULL, 8100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (408, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Decompression Septic Arthritis/Osteomyelitis', NULL, NULL, 8100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (409, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Toes Debridement Repair SA', NULL, NULL, 8100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (410, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Implant Removal IM Nail Removal GA/SA', NULL, NULL, 8100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (411, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Toes & Finger Arthrodesis GA', NULL, NULL, 8100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (412, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Contracture Release with Skin Grafting GA', NULL, NULL, 8100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (413, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foreign body removal under GA(airway, esophageal)', NULL, NULL, 8153, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (414, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Neuroplasty and/or Transposition of Median Nerve at Carpal Tunnel(OPD procedure)', NULL, NULL, 8500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (415, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Neuroplasty, Major Peripheral Nerve(OPD procedure)', NULL, NULL, 8500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (416, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Femoral hernia mesh repair', NULL, NULL, 8500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (417, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Perineum-3rd Degree Tear Interval', NULL, NULL, 8500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (418, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Polydactyli Correction Multiple LA', NULL, NULL, 8500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (419, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pneumatic Retinopexy', NULL, NULL, 8500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (420, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Intraocular Foreign Body', NULL, NULL, 8500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (421, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Corneal Repair  Complicated', NULL, NULL, 8500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (422, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vulva-Evacuation of Vulvar hematoma GA', NULL, NULL, 8550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (423, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Excision of Neuroma', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (424, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Esophageal Dilatation GA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (425, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'CAC GA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (426, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Cervical Polypectomy GA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (427, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ankle Ligament Tear Repair Sa', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (428, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Elbow - ( Epicondyle/Condyle Fracture) Epiphyseal Fixation GA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (429, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'External Fixators', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (430, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Curettage & Debridement Removal of Plate SA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (431, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Curettage & Debridement SA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (432, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Hallux Valgus Correction SA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (433, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Toes Debridement Repair GA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (434, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hand Dislocation Fixation SA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (435, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Dislocation MUA & Traction SA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (436, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Radial Head Excision Regional Block', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (437, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Wrist/Hand Fracture Dislocation ORIF Regional Block', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (438, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Skin Grafting Raw Area GA Small', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (439, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'DJ removal GA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (440, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Harmonic scalpel', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (441, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Percutaneous peritonial Dialysis catheter insertion', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (442, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Vesicovaginal Fistula repair (RAZ procedure)', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (443, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder-Hydrodistension of bladder GA', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (444, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder-Restaging TURBT(Scar resection)', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (445, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Minor I (Sternal Wire Removal)', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (446, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye: Enucleation', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (447, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cataract: Small incision', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (448, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Rectum- Thierch suturing', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (449, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anal- Lateral Sphinterotomy IVA', NULL, NULL, 9625, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (450, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Breast Lump excision multiple LA', NULL, NULL, 9775, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (451, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anal- Evacuation/ Excision of Thrombosed External Hemorrhoid GA', NULL, NULL, 9900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (452, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Breast- Breast Lump Excision GA', NULL, NULL, 9900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (453, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Diagnostic Hysteroscopy GA', NULL, NULL, 9900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (454, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Repair of vaginal/Cervical laceration Small', NULL, NULL, 9900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (455, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Femure Shaft Fracture Plating SA', NULL, NULL, 9900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (456, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Shaft Fracture Plating SA', NULL, NULL, 9900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (457, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Squint Surgery  2 Muscle', NULL, NULL, 10000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (458, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lid Tumor Excision With Reconstruction  Medium', NULL, NULL, 10000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (459, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Neuroplasty and/or Transposition of Ulnar Nerve at Elbow(OPD procedure)', NULL, NULL, 10200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (460, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Inguinal hernia mesh repair LA', NULL, NULL, 10200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (461, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Children Injuries: CRPP distal radius/Epiphyseal Fracture separation', NULL, NULL, 10200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (462, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'CRPP (Large Joints)e.g. Ankle', NULL, NULL, 10200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (463, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Creation of AV Fistula for Hemodyalysis LA', NULL, NULL, 10200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (464, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cross Finger Flap LA', NULL, NULL, 10200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (465, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Facial Laceration Suturing (Complex) LA', NULL, NULL, 10200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (466, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'AV fistula', NULL, NULL, 10200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (467, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Varicose vein surgical management with excision and ligation', NULL, NULL, 10600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (468, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hernia repair unilateral GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (469, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Bartholin Abscess I&D GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (470, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Excision of Vaginal septum SA/GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (471, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Vaginal Wall Cyst Removal GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (472, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Amputation digital GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (473, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Elbow/Wrist Arthrodesis Regional Block', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (474, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Femur Shaft Fracture Plating GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (475, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Club Foot Soft Tissue Release GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (476, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Hallux Valgus Correction GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (477, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Forearm- Fracture Distal Radius - ORIF Regional Block', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (478, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hand Dislocation Fixation GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (479, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Dislocation MUA & Traction GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (480, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Radius Malunion Excision ORIF Styloid DARRCH', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (481, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Malleolar Fracture INT. Fixation SA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (482, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Wrist/Hand Fracture Dislocation ORIF GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (483, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ear Reconstruction 2nd stage with FTSG GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (484, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Excision of Granulation Tissue Escharectomy Or Debridement GA Medium', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (485, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fracture Mandible Plating and IMF LA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (486, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fracture Maxilla Fixation LA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (487, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lobule Transposition GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (488, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Minor Lip procedure GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (489, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Nipple and Areola Reconstruction GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (490, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pedicled Flaps Inset - Minor GA/LA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (491, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Polydactyli Correction Single GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (492, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Soft Tissue and Nerve Repair GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (493, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Repair (Single) GA', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (494, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Transposition Flaps - Minor', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (495, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Epididymis-Epididymectomy', NULL, NULL, 10800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (496, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Evisceration With Implant', NULL, NULL, 11000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (497, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Orbitotomy Small', NULL, NULL, 11000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (498, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Circumcision for phimosis (IVA/GA)', NULL, NULL, 11050, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (499, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Percutaneous Nephrostomy (PCN) placement GA Blind/USG guided', NULL, NULL, 11250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (500, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Retinal Detachment (R D)Surgery', NULL, NULL, 11500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (501, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Burr Hole(s) for Biospy of Brain', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (502, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Burr Hole(s) for Evacuation of CSDH single', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (503, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-McDonald suture GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (504, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pelvic Floor repair', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (505, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Perineum-1st and 2nd degree Tear Old GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (506, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Mannual Removal of Placenta (MRP) with EPI', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (507, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina- Hymenectom GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (508, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Biopsy Vulva/Vagina GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (509, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Repair of vaginal/Cervical laceration Large', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (510, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ankle Ligament Tear Repair GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (511, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Ankle Arthrodesis SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (512, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Fracture INT. Fixation SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (513, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Forearm- Fracture Distal Radius - ORIF GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (514, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Femur Neck Displacement Osteotomy SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (515, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Knee Arthrodesis SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (516, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Knee collateral Ligament Injury Repair SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (517, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Patella Fracture Excision/Fixation SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (518, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Patella Recurrent Dislocation Lateral Release SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (519, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Patella Recurrent Dislocation Quadricepsplasty SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (520, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Patella Recurrent Dislocation Tendon Transfer SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (521, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Soft Tissue Nerve Repair GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (522, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Malleolar Fracture INT. Fixation GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (523, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Malleolar Osteotomy SA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (524, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cleft Lip Unilateral GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (525, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testis-Testicular biopsy open', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (526, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testis-U/L Orchidectomy SA/GA', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (527, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Optical Internal Urethrotomy (OIU) Caudal block', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (528, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Urethrovaginal Repair', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (529, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - VVF Repair (O Conner procedure)', NULL, NULL, 11700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (530, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tonsillectomy Surgery', NULL, NULL, 12000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (531, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cataract: Phacoemulsion with Fred Hollow Intraocular Lens (One eye)', NULL, NULL, 12050, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (532, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dacryocystorhinostomy With Tubation', NULL, NULL, 12500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (533, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Knee Tibial Spiral Fracture INT. Fixation SA', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (534, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tarsal Bone Fracture Or Calcanium INT. Fixation SA', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (535, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tarsal Joint Arthrodesis SA', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (536, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Condylar Fracture Screwing Percutaneous SA', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (537, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Shaft Fracture Plating GA', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (538, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testis-B/L Orchidectomy SA/GA', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (539, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testis-EVS of Hydrocele GA/SA (Unilateral)', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (540, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Optical Internal Urethrotomy (OIU) OIU SA', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (541, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Cystolitholapaxy caudal block', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (542, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Minor(AV Fistula / IABP Insertion/ Perma Cath Insertion)', NULL, NULL, 12600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (543, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Scrotum-Debridement of Fournier''s Gangrene', NULL, NULL, 12750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (544, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pyogenic liver abscess (Including Aspiration/ drainage)', NULL, NULL, 12845, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (545, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Squint Surgery  3 Muscle', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (546, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye: Cryo Buckling', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (547, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Suction Evacuation for Molar Pregnancy GA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (548, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Skin Grafting Raw Area GA Medium', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (549, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'DJ stenting SA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (550, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Burr Hole(s) for Drainage of Brain Abscess/Cyst', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (551, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Conization GA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (552, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Anterior Colporrhaphy GA/SA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (553, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Knee OA Knee Deformity Osteotomy SA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (554, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Patella Recurrent Dislocation Tendon Transfer GA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (555, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Burn Early Excision and Grafting', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (556, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fracture Maxilla Fixation GA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (557, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fracture Zygoma Fixation LA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (558, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Liposuction for Gynaecomastia GA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (559, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lymphoedema Surgery GA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (560, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Grafting GA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (561, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'DJ stenting GA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (562, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Partial Penectomy', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (563, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Scrotum-Scrotoplasty SA/GA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (564, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Cystolitholapaxy SA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (565, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Cystolithotomy SA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (566, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'CRPP Supracondylar/Neck Fracture Humerus', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (567, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Humerus- Lateral Condyle Fracture Children/Adult ORIF', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (568, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Rush Nailing- Paediatric and Adult Fracture', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (569, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Repair (Multiple) LA', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (570, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hernia repair bilateral LA', NULL, NULL, 14000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (571, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SICS + Trabeculectomy', NULL, NULL, 14000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (572, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Diversion', NULL, NULL, 14256, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (573, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Burr Hole(s) for Aspiration of Hematoma/Cyst', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (574, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Burr Hole(s) for Multiple', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (575, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Neurorrhaphy Anastomosis FacialHypoglossal', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (576, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Breast- Simple Mastectomy GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (577, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hernia repair unilateral SA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (578, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Psoas Abscess drainage', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (579, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Tension free Vaginal Tape (TVT) SA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (580, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Transobturator Tape (TOT) SA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (581, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Amputation above knee/below knee/below Forearm SA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (582, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ankle Infection Arthritis Degenerative Arthrodesis GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (583, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Arthrotomy small joints', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (584, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Drainage of Psoas Abscess', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (585, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Elbow communitedIntercondylar Fracture Anterior Transposition of Ulnar nerve Regional Block', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (586, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Femur condylar Fracture Plating SA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (587, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Femure Shaft Fracture IM-Nailing SA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (588, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Ankle Arthrodesis GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (589, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Club Foot ETA GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (590, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Club Foot Soft Tissue + Bone Repair GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (591, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Fracture Fixation GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (592, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Foot Fracture INT. Fixation GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (593, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Forearm- Fracture Both Bones Forearm GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (594, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Forearm- Fracture Both Bones Forearm Regional Block', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (595, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Femur Neck Displacement Osteotomy GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (596, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Humerus Fracture ORIF GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (597, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Knee Arthrodesis GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (598, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Knee collateral Lig. Injury Repair GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (599, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Knee Tibial Spiral Fracture INT. Fixation GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (600, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Patella Recurrent Dislocation Lateral Release GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (601, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Patella Recurrent Dislocation Quadricepsplasty GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (602, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Radius Malunion Excision ORIF Styloid DARRCH GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (603, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Soft Tissue Nerve & Tendon Repair SA/Regional Block', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (604, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tarsal Joint Arthrodesis GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (605, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Condylar Fracture Screwing Percutaneous GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (606, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Malleolar Osteotomy GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (607, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cleft Lip (Revision) GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (608, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cleft Lip Bilateral Revision GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (609, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cross Finger Flap GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (610, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Excision of Granulation Tissue Escharectomy Or Debridement GA Large', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (611, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Polydactyli Correction Multiple GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (612, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Syndactyli Release and Grafting GA', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (613, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-1st stage Byars flap', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (614, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-2nd stage Byars flap', NULL, NULL, 14400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (615, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fistula/Sinus excision', NULL, NULL, 14850, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (616, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Orbitotomy Lateral', NULL, NULL, 15000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (617, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lid Tumor Excision With Reconstruction  Big', NULL, NULL, 15000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (618, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Ptosis: Sling Surgery Only', NULL, NULL, 15000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (619, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Glaucoma Valve Implant Procedure(Valve Extra)', NULL, NULL, 15000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (620, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Elbow communitedIntercondylar Fracture Anterior Transposition of Ulnar nerve GA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (621, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Femur Neck Pins SA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (622, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Femur Neck Screw SA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (623, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Knee OA Knee Deformity Osteotomy GA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (624, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tarsal Bone Fracture Or Calcanium INT. Fixation GA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (625, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tarsal Bone Fracture Talus INT. Fixatoin GA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (626, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hernioplasty SA/GA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (627, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Drainage of perinephric abscess SA/GA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (628, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Shunt surgery for Priapism', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (629, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'RPG + Instillation of Sclerosant LA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (630, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testis-Radical Orchidectomy', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (631, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Urethral Diverticulectomy', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (632, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Cystolithotomy GA', NULL, NULL, 15300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (633, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Chronic suppurative otitis media Surgical management package', NULL, NULL, 15456, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (634, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Squint Surgery  4 Muscle', NULL, NULL, 15500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (635, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Orbitotomy Medium', NULL, NULL, 16000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (636, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Eye Ptosis: Levator Resection', NULL, NULL, 16000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (637, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Blepheroplasty', NULL, NULL, 16000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (638, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Thyroglossal Cyst - Excision package', NULL, NULL, 16000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (639, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Appendix- Open Appendectomy SA', NULL, NULL, 16200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (640, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Excision of Rib GA/Open Lung Biospy GA', NULL, NULL, 16200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (641, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cervix-Shirodhker Suture GA', NULL, NULL, 16200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (642, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cleft Palate Repair GA', NULL, NULL, 16200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (643, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-1st stage Johansen procedure', NULL, NULL, 16200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (644, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-2nd stage Johansen procedure', NULL, NULL, 16200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (645, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Cystolitholapaxy GA', NULL, NULL, 16200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (646, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anal- Hemorrhoidectomy (Open)', NULL, NULL, 16650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (647, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ilioingunal block dissection of lymphnode', NULL, NULL, 16650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (648, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Closed Reduction & K-Wire Fixation/TENS', NULL, NULL, 17000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (649, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Repair Major', NULL, NULL, 17000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (650, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Posterior Vitrectomy Package 1', NULL, NULL, 17000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (651, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Shaft Fracture Nailing SA', NULL, NULL, 17100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (652, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparotomy with Biopsy', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (653, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach-Palliative Gastrojejunostomy', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (654, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach- Rammstedt Operatio for Pyloric Stenosis', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (655, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Appendix- Open Appendectomy GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (656, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'CSF Shunt Placement', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (657, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hemilaminectomy and Decompression of Cord/Excision of Disc (Posterior Approach)', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (658, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laminectomy  and Decompression of Cord/Excision  of Disc (Posterior Approach)', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (659, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Diagnostic Laparoscopy/Laparoscopic biopsy', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (660, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra- Burch Colposuspension GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (661, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra- Burch Colposuspension LA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (662, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Fothergills operation (Manchester)', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (663, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Tension free Vaginal Tape (TVT) GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (664, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Transobturator Tape (TOT) GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (665, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Arthrotomy Large joints', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (666, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Femur condylar Fracture Plating GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (667, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hand - Carpal, Metacarpal & phalanges Fracture - ORIF', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (668, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips CDH Acetabuloplasty GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (669, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Femur Neck Hemiarthroplasty SA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (670, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Femur Neck Pins GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (671, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Femur Neck Screw GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (672, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Humerus Supracondylar, Lateral condylar Fracture - ORIF Ga', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (673, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Shoulder Joint Arthrodesis GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (674, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Soft Tissue Nerve & Tendon Repair GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (675, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Soft Tissue, Nerve & Vessels Repair SA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (676, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spine Infection Pott''s Drainage Procedure GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (677, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Condylar Fracture Elevation Bone Graft SA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (678, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Transpendicular Biopsy', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (679, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hand- Carpal/Metacarpal/Phalanges Fracture : ORIF', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (680, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Elbow- Olecranon Fracture ORIF', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (681, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Alveolar Bone Grafting GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (682, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Augmentation Rhinoplasty', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (683, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Blow Out Fracture Reconstruction GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (684, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cancer Excision and Flap Construction GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (685, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Contracture Band Multiple Z plasty GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (686, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Contracture Release with Rotation Flap GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (687, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Dermabrasion /Chemical Peel GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (688, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Excision of Cutaneous Lesion and SSG or FTSG GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (689, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Facial Laceration Suturing (Complex) GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (690, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Facial Paralysis Cross Facial Nerve Grafting GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (691, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Facial Paralysis Cross Temporalis Transfer GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (692, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Flaps For Bed Sore GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (693, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fracture Mandible Plating and IMF GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (694, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Framework Elevation and FTSG GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (695, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hemimandibulectomy and Reconstruction', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (696, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Le Forte Advancement GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (697, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lip Reconstruction GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (698, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Malar Augmentation with Bone Graft GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (699, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Mandibular Osteotomies Ga', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (700, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Nose Reconstruction with Flaps GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (701, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Orocutaneous Fistula Closure with Flaps GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (702, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Palatal Fistula Closure GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (703, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pedicled Flaps Inset - Major GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (704, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pharyngoplasty GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (705, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pollicization GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (706, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Scalp Transposition and Grafting GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (707, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Skin Grafting Raw Area GA Large', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (708, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Soft Tissue, Tendon and Nerve  Repair GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (709, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Repair (Multiple) GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (710, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'TMJ ankylosis Release GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (711, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Transposition Flaps - Major', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (712, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vaginal Reconstruction', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (713, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Drainage of renal abscess SA/GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (714, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Radical penectomy', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (715, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'RPG + Instillation of Sclerosant SA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (716, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Scrotum-Scrotal exploration for trauma', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (717, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Single stage SNODGRASS(TIP)', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (718, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testis-Exploration of testicular torsion', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (719, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureterocystoneostomy (UCN) B/L GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (720, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureterocystoneostomy (UCN) U/L SA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (721, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureteroscopic Lithotripsy(URSL) + DJ stenting SA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (722, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureteroscopy (URS) SA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (723, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Blandys perianal urethroplasty', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (724, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Matheu Flip Flap', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (725, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Repair of Traumatic bladder rupture', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (726, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vas-Microscopic varicocele ligation', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (727, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Amputation above knee/below knee/Below Forearm GA', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (728, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cesarian Section Delivery', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (729, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biliary-Open cholecystectomy', NULL, NULL, 19350, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (730, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hand Carpal Tunnel Release GA', NULL, NULL, 19350, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (731, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anal- Hemorrhoidectomy (Stapled)', NULL, NULL, 19800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (732, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Exploratory laparotomy', NULL, NULL, 19800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (733, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Intestine- Iliostomy/Colostomy', NULL, NULL, 19800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (734, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Drainage of Intracranial   Abscess Supratentorial', NULL, NULL, 19800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (735, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Thyroid- Hemithyroidectomy GA', NULL, NULL, 19800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (736, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Trochanteric Fracture DHS Fixation SA', NULL, NULL, 19800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (737, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cleft Lip Bilateral GA', NULL, NULL, 19800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (738, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureterolithotomy open SA', NULL, NULL, 19800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (739, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder-TURBT 1st stage', NULL, NULL, 19800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (740, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Posterior Vitrectomy Package 2', NULL, NULL, 20000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (741, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Orbitotomy Big', NULL, NULL, 20000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (742, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Keratoplasty PK', NULL, NULL, 20000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (743, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopy for Oophorectomy or Salpingo-Oophorectomy or Ectopic pregnancy or Pelvic Abscess', NULL, NULL, 20250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (744, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparotomy with Wedge resection of ovary', NULL, NULL, 20250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (745, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureteroscopy (URS) GA', NULL, NULL, 20250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (746, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ankle Fracture Dislocation Open reduction Repair/Fixation GA', NULL, NULL, 20700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (747, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Patella Fracture Excision/Fixation GA', NULL, NULL, 20700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (748, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Phaco+Iol+ Trabeculectomy', NULL, NULL, 21000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (749, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biliary-CBD exploration', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (750, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Bone Flap Removal', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (751, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Bone Flap Replacement', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (752, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/ raniectomyInfratentorial', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (753, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Orbital Biopsy', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (754, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Breast- Mastectomy GA/Wide Local Excision of Ca Breast', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (755, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'ERCP (ES stone extraction/Stenting', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (756, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Diagnostic Lap with Blue test (dye included)', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (757, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Tubal Ligation', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (758, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Adnexal Operations - including Ovarian Cystectomy', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (759, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Femur Neck Hemiarthroplasty GA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (760, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Old Unreduced Dislocation/CDH Open Reduction GA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (761, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Shoulder Fracture Dislocation INT. Fixation GA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (762, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Shoulder/Wrist/Elbow Arthrodesis GA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (763, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Soft Tissue, Nerve & Vessels Repair GA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (764, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hernia repair bilateral SA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (765, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spine Pott''s Spine CostoTransversectomy', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (766, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Condylar Fracture Elevation Bone Graft GA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (767, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Plating Forearm/Arm/Leg/Thigh bones Children', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (768, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ear Reconstruction Cartilage Framework GA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (769, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penile Reconstruction GA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (770, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Soft Tissue, Tendon, Nerve and Vessel Repair GA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (771, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Prostate-TURP SA', NULL, NULL, 21600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (772, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Acute osteomyelitis (Surgical management including I&D, dressing)', NULL, NULL, 21715, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (773, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anal- Pilonidal Sinus surgery', NULL, NULL, 22200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (774, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vulva-Vulvectomy simple', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (775, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureterolithotomy open GA', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (776, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Graft nephrectomy', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (777, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Nephrectomy for XGP', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (778, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Open pyelolithotomy', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (779, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Nestbitt operation for Pyronies disease', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (780, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Repair of Penile fracture', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (781, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Total Penectomy', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (782, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Prostate-Retropubic Prostatectomy SA', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (783, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'RPG + Instillation of Sclerosant GA', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (784, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testis-Orchidopexy 1st stage', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (785, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Testis-Orchidopexy 2nd stage', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (786, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter- Transureteroureterostomy', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (787, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureterocystoneostomy (UCN) B/L SA', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (788, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureterocystoneostomy (UCN) U/L GA', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (789, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureteroscopic Lithotripsy(URSL) + DJ stenting GA', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (790, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Tension Free Vaginal Tape (TVT) repair', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (791, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder- Percutaneous Cystolithotripsy (PCCL) SA', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (792, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Myomectomy GA', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (793, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Intestine- Iliostomy/Colostomy closure', NULL, NULL, 22950, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (794, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Repair of Vault prolapse', NULL, NULL, 23400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (795, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biliary-Cholecysto-Jejunostomy', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (796, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Exploratory laparotomy with - band release, Adhesiolysis, Derotation for intestinal obstruction', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (797, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Exploratory laparotomy with- Repair of DU or   Gastric perforation peritonitis', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (798, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Exploratory laparotomy with- repair of Small bowel   perforation or Short segment resection anastomosis   or stoma creation for perforatoin peritonitis', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (799, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Rectum- Delormes Procedure for Rectal Prolapse', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (800, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach- Vagotomy & Pyloroplasty', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (801, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Appendectomy', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (802, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Femure Shaft Fracture IM-Nailing GA', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (803, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tibia Shaft Fracture Nailing GA', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (804, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Simple nephrectomy Open', NULL, NULL, 24300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (805, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-LASER Optical Internal Urethrotomy (OIU)', NULL, NULL, 24750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (806, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Breast- Modified Radical Mastectomy GA', NULL, NULL, 25200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (807, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Thoracotomy with Decortication GA', NULL, NULL, 25200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (808, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Thoracotomy with Symphesectomy GA', NULL, NULL, 25200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (809, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Hysterectomy with Burch Colposuspension GA/SA', NULL, NULL, 25200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (810, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Shoulder Joint Old Dislocation ORIF GA', NULL, NULL, 25200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (811, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Shoulder Joint Recurrent Dislocation Open Reduction GA', NULL, NULL, 25200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (812, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Routine Arthroscopic Procedures (GA/SA)', NULL, NULL, 25500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (813, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hernia repair bilateral GA', NULL, NULL, 25650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (814, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spleen- Splenectomy', NULL, NULL, 25650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (815, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach- Truncal Vagotomy + Gastrojejunostomy', NULL, NULL, 25650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (816, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fallopian Tube- Tuboplasty GA', NULL, NULL, 25650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (817, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-VVF repair Small', NULL, NULL, 25650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (818, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Keratoplasty Dalk/Dsaek/Dmek', NULL, NULL, 26000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (819, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Acute pancreatitis (surgical management including inj infliximab)', NULL, NULL, 26026, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (820, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Hysterectomy Abdominal', NULL, NULL, 26100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (821, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Chronic osteomyelitis (surgical management including I&D, dressing)', NULL, NULL, 26300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (822, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Prostate-TURP GA small', NULL, NULL, 26550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (823, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Cervical Discectomy (ACD) Single Level', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (824, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biopsy/Excision of Intraspinal Neoplasm', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (825, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biliary- Partial Pericystectomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (826, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cranioplasty For Skull Defect', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (827, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cranioplasty For Skull Defect Small <5cm', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (828, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cranioplasty Simple', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (829, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cranioplasty with Autograft Small <5cm', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (830, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Decompression of Orbit', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (831, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/CraniectomyExcison of Foreign Body from Brain', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (832, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/CraniectomyExcison of Tumor or Other Lesion of Bone', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (833, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/CraniectomyExcison, Intra and Extracranial, Benign Tumor of Cranial Bone', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (834, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Removal of Foreign Body', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (835, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Removal of Lesion', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (836, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy /Craniectomy Suboccipital Craniectomy   and Laminectomy for Arnold Chiari', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (837, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy for Excision of Pituitary Tumor', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (838, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Excision by Laminectomy Occlusion of AVM', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (839, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fusion of Posterior, Cervical, Interspinous', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (840, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fusion of Posterior, Cervical, Sublaminar', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (841, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Instrumentation Lateral Mass Screw', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (842, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Instrumentation Anterior Odontoid Screw Fixation', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (843, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Instrumentation Lumbar', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (844, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Instrumentation Occiput - C3/4 Fusion using Luque Rectangle, Sublaminar Wiring', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (845, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laminectomy for Spinal Cord Tumor Excision Simple (  Posterior Approach)', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (846, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'LUQUE Rod/Rectangle Fixation, Thoracic', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (847, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Heller''s Operation (Cardiomyotomy) GA', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (848, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic cholecystectomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (849, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic rectopexy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (850, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic partial pericystectomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (851, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Other Laparoscopic OB/GYN Surgery', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (852, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic  (Ovarian) Cystectomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (853, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter- Ureteric Transplantation', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (854, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Cesarean Hysterectomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (855, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Hysterectomy Vaginal GA/SA', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (856, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Reconstruction of Artifical Vagina', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (857, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vulva- Radical Vulvectomy GA', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (858, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'HumerusIntercondylar Fracture - ORIF GA', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (859, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pelvis/Acetabular Fracture', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (860, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Radial Head Excision Difficult', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (861, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Plating Both Bones Forearm/Humerus', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (862, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Tendon Graft/Transfer', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (863, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ileal interposition', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (864, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney - AH pyloplasty Open', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (865, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Total Penile Disassembly for Epispadias', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (866, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Prostate-Retropubic Prostatectomy GA', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (867, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Retroperitoneal Lymph Node Dissection (RPLND)', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (868, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'RNU  with Bladder cuff excision open', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (869, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-BOARI flap', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (870, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureterocalicostomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (871, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Bladder Divertilulectomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (872, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Extrophy repair', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (873, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Partial Cystectomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (874, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder- Percutaneous Cystolithotripsy (PCCL) GA', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (875, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder-Modified CantewellRansley Operation', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (876, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Diversion (MAINZ POUCH) only', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (877, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Diversion (Ureterosigmoidostomy) only', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (878, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vas-Vasectomy reversal SA/GA', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (879, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vas-Vasovasostomy (Microsurgery)', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (880, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Intestine- Ileal resection', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (881, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pancreas-Triple Bypass', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (882, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach- Cystograstrostomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (883, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach-Partial Gastrectomy', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (884, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biliary- Lap Cholecystectomy Converted to Open Cholecystectomy', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (885, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Exploratory Laparotomy with - Resection Anastomosis of Small bowel with or without stoma', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (886, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Craniosynostosis: Single Cranial Suture', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (887, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Evacuation of Hematoma :   Supratentorial/Extradural/Subdural', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (888, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/CraniectomyExvision of Brain Tumor   Supratentorial, Except meningioma', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (889, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/CraniectomyExcison of Meningioma Supratentorial', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (890, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/CraniectomyInfratentorial; Extradural/Subdural', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (891, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Penetrating wound of Brain', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (892, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'  Craniotomy/Craniectomy Trans Sphenoidal Approach for Excision of Pituitary Tumor', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (893, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Thoracotomy with Enucleation of Cyst GA', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (894, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Thyroid- Total or Subtotal Thyroidectomy GA', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (895, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Hernia repair U/L', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (896, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hips Fracture Trochanteric Fracture DHS Fixation GA', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (897, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-LASER PUV Ablation', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (898, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra- Posterior Urethral Valve Ablation', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (899, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Bipolar TURBT', NULL, NULL, 28800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (900, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spine Sacrum/Coccyx Excision SA', NULL, NULL, 29700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (901, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Posterior Vitrectomy Package 3', NULL, NULL, 30000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (902, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Cervical Discectomy (ACD) Multiple Levels', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (903, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Exploratory Laparotomy with - Resection Anastomosis of Large bowel with or without stoma', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (904, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/CraniectomyExvision of Brain Tumor   Infratentorial, Except meningioma', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (905, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Breast- Modified Radical Mastectomy GA/WLE + Axillary Clearance', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (906, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic/Lap Assisted Closure of DU/Enteric Perforation', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (907, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vulva-Vulvectomy Radical', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (908, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'ORIF with Bone Grafting', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (909, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Rectum- Altermier''s Operation /STARR procedure for Rectal prolapse', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (910, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ilizarov Fixation', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (911, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Minimally Invasive Percutaneous Osteosynthesis (MIPPO)', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (912, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney- Pyelolithotomy', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (913, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureteroscopic Lithotripsy(URSL) bilateral', NULL, NULL, 30600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (914, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spine PIVD Laminectomy GA', NULL, NULL, 31500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (915, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kindey - AnatrophicNephrolithotomy', NULL, NULL, 31500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (916, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra - Anastomotic Urethroplasty', NULL, NULL, 31500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (917, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - LASER Cystolithotrite', NULL, NULL, 31500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (918, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biliary-Choledocho-duodenostomy', NULL, NULL, 31500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (919, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach-Subtotal Gastrectomy', NULL, NULL, 31500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (920, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Cervical Discectomy and Fusion (ACDF) Single Level', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (921, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Vertebral Corpectomy Cervical Single Level', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (922, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biliary- Hilar cholangiocarcinoma excision', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (923, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Colon- Hemicolectomy', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (924, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Colon- Perineal Proctosigmoidectomy', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (925, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pancreas- Distal pancreatectomy', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (926, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pancreas- Frey''s Operation', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (927, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pancreas- Peustow''s operation', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (928, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Rectum- abdominal rectopexy', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (929, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Shunt surgery', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (930, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spleen- Splenectomy and Devascularization', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (931, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach- Fundoplication', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (932, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach-Heller''s Myotomy', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (933, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Costovertebral Approach(Posterolateral)', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (934, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cranioplasty Complex', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (935, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cranioplasty For Skull Defect Large >5cm', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (936, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Cranioplasty with Autograft Large >5cm', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (937, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Cerebellopontine Angle Tumor', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (938, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/CraniectomyExcison of Meningioma Intratentorial', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (939, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Multiple Cranial Sutures', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (940, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Trans Oral Approach to Skull Base', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (941, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Excision by Laminectomy Intraspinal Lesion Other Than Neoplasm', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (942, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fusion of Posterior, Lumbar', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (943, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Fusion Posterolateral, Lumbar', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (944, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lumbar- Transforaminal Lumbar Interbody Fusion (TLIF)', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (945, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Instrumentation Lumbar, Single Segment', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (946, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Instrumentation Posterior', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (947, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Instrumentation Transarticular Screw Fixation: Anterior', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (948, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laminectomy  for Spinal Cord Tumor Excision Complex (Posterior Approach)', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (949, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Microvascular Decompression (MVD)', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (950, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spine Sacrum/Coccyx Excision GA', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (951, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spine Spondylolisthesis Fusion GA', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (952, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Breast Reconstruction with Muscle Flaps GA', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (953, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Mandibular Reconstruction GA', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (954, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Revascularization GA', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (955, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Toe Transfer GA', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (956, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Extracorporeal Shock Wave Lithotripsy (ESWL)', NULL, NULL, 32400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (957, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Hypospadias repair with flaps', NULL, NULL, 33750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (958, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureteroureterostomy unilateral', NULL, NULL, 33750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (959, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Cervical Discectomy and Fusion (ACDF) Multiple levels', NULL, NULL, 34200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (960, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Vertebral Corpectomy Cervical Multiple Level', NULL, NULL, 34200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (961, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Vertebral Corpectomy Thoracic Single Level', NULL, NULL, 34200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (962, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anastomosis: EC/IC bypass', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (963, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Vertebral Corpectomy Thoracic Multiple Level', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (964, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Carotid Endarterectomy (CEA)', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (965, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Craniotomy/Craniectomy Midline Tumor at Skull Base', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (966, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Anterior Lumbar Interbody Fusion (ALIF)', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (967, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Posterior lumbar interbody fusion (PLIF)', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (968, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Lumbar- Lateral lumbar interbody fusion (XLIF)', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (969, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Instrumentation Multiple Segment', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (970, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Thoracotomy with Lobectomy/Pneumonectomy GA', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (971, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'ThoracotomySternotomy with Mediastinal Tumor Excision GA', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (972, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic CBD exploration', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (973, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Gastrectomy', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (974, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Hernia repair B/L', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (975, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Combine- TAH with Cholecystectomy', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (976, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-Vaginal Radical Hysterectomy GA', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (977, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Vagina-VVF repair Complicated', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (978, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Shoulder Joint Replacement GA', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (979, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spine Cervical Spine Fracture Fusion GA', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (980, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spine Pott''s Spine Fusion Decompression GA', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (981, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Hemi Replacement Arthroplasty (HRA)', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (982, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Arthroscopic Meniscectomy', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (983, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Abdominoplasty GA', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (984, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Microvascular Free Flap Transfer GA', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (985, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Radical Nephrectomy open', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (986, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Diversion (Ileal conduit) only', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (987, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Intermediate      Embolectomy)', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (988, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Minor II (Pericardiotomy)', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (989, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Colon- Subtotal colectomy', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (990, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Liver- Non major Liver resection segmental, bisegmental', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (991, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Thoracotomy with Neck Dissection GA', NULL, NULL, 37800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (992, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Partial Nephrectomy Open', NULL, NULL, 38250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (993, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Buccal Mucosal (BMG) Urethroplasty (BULBAR)', NULL, NULL, 38250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (994, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Buccal Mucosal (BMG) Urethroplasty (PENILE)', NULL, NULL, 38250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (995, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spinal Osteotomy', NULL, NULL, 39600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (996, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Colon- Total Proctocolectomy', NULL, NULL, 39600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (997, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spinal Tumor Excision', NULL, NULL, 39600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (998, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spine Scoliosis Fusion/Epiphysodesis GA', NULL, NULL, 39600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (999, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Thoracolumbar Fracture Fixation', NULL, NULL, 39600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1000, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'ORIF + Bone Graft Completed', NULL, NULL, 39600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1001, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Hysterectomy Radical -Wertheim''s operation', NULL, NULL, 40500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1002, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Penis-Hypospadias repair with BMG graft', NULL, NULL, 40500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1003, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-LASER Deroofing of ureterocele', NULL, NULL, 40500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1004, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-LASER Endopolypectomy/Endoureterotomy', NULL, NULL, 40500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1005, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureteroscopy (URS) LASER Lithotripsy', NULL, NULL, 40500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1006, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Laparoscopic Myomectomy', NULL, NULL, 41400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1007, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Prostate-Bipolar TURP', NULL, NULL, 41400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1008, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Hysterectomy', NULL, NULL, 42300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1009, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Percutaneous Nephrolithotomy (PCNL)', NULL, NULL, 42300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1010, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Biliary-Extended cholecystectomy', NULL, NULL, 43200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1011, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic splenectomy', NULL, NULL, 43200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1012, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Adhesolysis/Adenectomy', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1013, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic colectomy', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1014, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Deroofing of renal cyst', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1015, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Pyeloplasty', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1016, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Radical nephrectomy', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1017, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Uterus-Hysterectomy Lap converted to Open', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1018, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Patellar Reconstruction', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1019, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Major Flap Surgery', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1020, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Shoulder- Reconstruction', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1021, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Replantation GA', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1022, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder-Radical cystectomy with Ileal conduit', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1023, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Liver- Open CBD exploration with Hepaticojejunostomy', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1024, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Retum- abdominal perineal resection', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1025, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Retum- Anterior resection/Low anterior resection', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1026, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Stomach-Total Gastrectomy', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1027, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Esophagectomy GA', NULL, NULL, 46800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1028, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Knee - Anterior/Posterior Cruciate Ligament Reconstruction', NULL, NULL, 46800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1029, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Percutaneous Nephrolithotomy (PCNL) multiple stone', NULL, NULL, 47300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1030, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Total Laparoscopic Hysterectomy', NULL, NULL, 47700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1031, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spinal Fixation', NULL, NULL, 48600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1032, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Adrenalectomy I', NULL, NULL, 49500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1033, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Buccal Mucosal (BMG) Urethroplasty (PANURETHRAL)', NULL, NULL, 49500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1034, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urethra-Progressive perinealurethroplasty', NULL, NULL, 49500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1035, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Liver- Hepaticojejunostomy', NULL, NULL, 52200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1036, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Abdominoperineal resection', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1037, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Incisional Hernia repair', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1038, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Rectopexy for rectal prolapse', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1039, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Nephrectomy I', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1040, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Spinal Fixation with Decompression and Grafting', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1041, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Elbow - Total Elbow Replacement', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1042, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Prostate-Radical Prostatectomy', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1043, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureteroscopic Lithotripsy(URSL)L unilateral', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1044, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Ureter-Ureteroureterostomy bilateral', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1045, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Augmentation cystoplasty', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1046, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder- Indiana Pouch', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1047, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Esophagus- Esophagectomy', NULL, NULL, 58500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1048, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Liver- Major hepatic resection', NULL, NULL, 58500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1049, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Pancreas- Whipple''s Operation', NULL, NULL, 58500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1050, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Radical cystectomy with neobladder', NULL, NULL, 58500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1051, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney- Retrograde Intrarenal Surgery (RIRS)', NULL, NULL, 63000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1052, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Total Hip and Knee Replacement Surgery U/L(implant extra)', NULL, NULL, 63000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1053, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Coronary Angioplasty', NULL, NULL, 70000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1054, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Low anterior/anterior resection', NULL, NULL, 72000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1055, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Adrenalectomy II', NULL, NULL, 72000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1056, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Laparoscopic Nephrectomy II', NULL, NULL, 72000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1057, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney- Donor nephrectomy Open', NULL, NULL, 72000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1058, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Kidney-Renal transplantation', NULL, NULL, 72000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1059, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Prostate- Holmium Laser Enucleation of the prostate (HoLEP)', NULL, NULL, 72000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1060, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder - Radical cystectomy', NULL, NULL, 72000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1061, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Major I (BT Shunt/ PA Banding/Epicardial Pacemaker)', NULL, NULL, 75600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1062, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'(Fem-POP bypass, Iliac Surgery)', NULL, NULL, 81000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1063, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Urinary Bladder- TURBT 2nd stage', NULL, NULL, 90000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1064, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Major II (CMC /COA/PDA Ligation/Pericardiectomy', NULL, NULL, 90000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1065, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Major I (ASD/PAPVC/Pulmonary Valvotomy/ VSD/oth)', NULL, NULL, 99000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1066, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Major(AAA Repair/ CEA (Graft Extra)', NULL, NULL, 99000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1067, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Total Hip and Knee Replacement Surgery B/L', NULL, NULL, 108000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1068, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Major II (OMV/Valve Repair/MVR/AVR (Valve Extra)', NULL, NULL, 117000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1069, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'Major III (DORV/DVR/TOF/TAPVC /Other Complex Congenital)', NULL, NULL, 126000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1070, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'CABG (Coronary Arterial Bypass Graft)', NULL, NULL, 144000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1071, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Nebulization per episode', NULL, NULL, 100, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1072, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Speech therapy per session', NULL, NULL, 150, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1073, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Physiotherapy per sitting', NULL, NULL, 150, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1074, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Phototherapy per sitting', NULL, NULL, 200, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1075, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Oxygen gas charge/24hr', NULL, NULL, 250, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1076, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'PAC(Post abortion Medical care)', NULL, NULL, 500, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1077, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Blood/Blood component per unit', NULL, NULL, 800, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1078, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Physiotherapy package 1 week (level1)', NULL, NULL, 875, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1079, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Posterior Nasal Packing', NULL, NULL, 1200, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1080, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Physiotherapy package  1 week (level2)', NULL, NULL, 1750, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1081, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Poisioning Emergency Management pacakage', NULL, NULL, 2000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1082, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Snakebite Medical Management', NULL, NULL, 3000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1083, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Acute appendicitis (Medical management)', NULL, NULL, 3000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1084, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Renal calculi medical management', NULL, NULL, 3000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1085, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Cellulitis ( Medical  Management with minor dressing)', NULL, NULL, 3000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1086, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Ante-natal Care package (Medical Management)', NULL, NULL, 3000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1087, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Sickle cell/Aplastic Anemia (Medical Management/ blood transfusion)', NULL, NULL, 3000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1088, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Acute Nephritis(Medical Management)', NULL, NULL, 3000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1089, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Acute Gastroenteritis (Medical Management)', NULL, NULL, 4000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1090, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'BPH (Benign prostrate hyperplasia) medical package', NULL, NULL, 4000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1091, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Conversion disorder (Medical Management)', NULL, NULL, 4000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1092, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Rheumatoid Arthritis(Medical Management)', NULL, NULL, 4000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1093, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Thalassemia (Medical Management including Blood transfusion)', NULL, NULL, 4000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1094, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Nephrotic Syndrome(Medical Management', NULL, NULL, 4000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1095, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Malnutrition (Medical Management)', NULL, NULL, 5000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1096, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Diarrhoea (Medical Management)', NULL, NULL, 5000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1097, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Neonatal care (basic care package)', NULL, NULL, 5000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1098, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Diabetic Cellulitis (Medical Management including minor dressing)', NULL, NULL, 5000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1099, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Anaemia (Medical Management including blood transfusion)', NULL, NULL, 5000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1100, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Avastin Injection  3rd', NULL, NULL, 5000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1101, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Normal delivery', NULL, NULL, 5000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1102, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Abdominal pain', NULL, NULL, 5542, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1103, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Cholera (Medical Management)', NULL, NULL, 6000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1104, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Dysentery (Medical Management)', NULL, NULL, 6000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1105, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Wound/ Abscess requiring inpatient care (including I &D, dressing)', NULL, NULL, 6000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1106, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Puerperal sepsis Management package', NULL, NULL, 6000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1107, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Server depression (Medical Management)', NULL, NULL, 7000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1108, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Hypovolumeic shock management package', NULL, NULL, 7000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1109, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Acute Hepatitis (Medical Management', NULL, NULL, 7000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1110, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Avastin Injection 1st & 2nd dose', NULL, NULL, 7000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1111, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Trauma & Injuries management', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1112, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Severe Pneumonia Medical Management Adult package', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1113, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Typhoid and Paratyphoid Fevers (Medical Management.)', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1114, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Hospitalization package for medical management of Zoonotic/ Vector Borne infections (e.g. Leptospirosis etc.', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1115, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Acute Respiratory Distress Syndrome (ARDS) (Medical management without ICU/CCU care)', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1116, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Viral hemorrhagic fever Medical Management', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1117, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Complicated Urinary Tract Infection (Medical Management)', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1118, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Acute Cholecystitis (Medical  Management )', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1119, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Dengue/Dengue Hemorrhagic Fever (Medical Management/Blood Transfusion)', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1120, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Neonatal care (special care package)', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1121, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Fever of Unknown Origin (FUO) (Medical Management)', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1122, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Meningitis  (Medical Management)', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1123, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Hydrocephalus medical management package', NULL, NULL, 9000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1124, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Asthma (Medical Management)', NULL, NULL, 9000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1125, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Diabetes mellitus (Hospitalization for blood sugar control) Package', NULL, NULL, 10000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1126, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Severe Pneumonia Medical Management Pediatric package', NULL, NULL, 10000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1127, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Chronic Obstructive Pulmonary Disease (COPD) (Medical Management including oxygen)', NULL, NULL, 10000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1128, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Burn <30% Body surface area  (Medical Management including dressing', NULL, NULL, 10000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1129, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Pneumothorax medical management package', NULL, NULL, 12000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1130, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Myocardial Infarction (Medical management where CCU care not available)(MI) : Level', NULL, NULL, 12000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1131, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Pyogenic Liver abscess(Including Aspiration/Drainage)', NULL, NULL, 14000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1132, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Hypertensive Emergency  Urgency (Medical Management)', NULL, NULL, 14000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1133, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Bipolar disorder (Medical Management)', NULL, NULL, 14000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1134, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Diabetes mellitus related complications maagement package', NULL, NULL, 16000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1135, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Paralytic syndromes/stroke Medical management  package', NULL, NULL, 16000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1136, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Atherosclerotic  Vascular Disease CCU care (AVD)', NULL, NULL, 18000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1137, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Epilepsy adult (Medical Management)', NULL, NULL, 18000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1138, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Epilepsy pediatric (Medical Management)', NULL, NULL, 18000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1139, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Congestive Cardiac Failure (CCF) (CCU care included)', NULL, NULL, 22500, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1140, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Burn >30% Body surface area', NULL, NULL, 25000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1141, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Schizophrenia (Medical management)', NULL, NULL, 25000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1142, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Upper Gastrointestinal bleeding (Medical management including blood transfusion/ injection octreotide)', NULL, NULL, 30000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1143, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Servere Septicemia (Medical Management/including ICU care)', NULL, NULL, 40000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1144, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Myocardial Infarction(package with CCU care included) : Level 11', NULL, NULL, 45000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1145, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Per Day Package 1', NULL, NULL, 3000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1146, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Per Day Package 2', NULL, NULL, 2000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1147, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'OPD Package', NULL, NULL, 200, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1148, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Emergency Package', NULL, NULL, 400, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1149, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Eye Hospital OPD package', NULL, NULL, 200, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1150, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'Eye Hospital Emergency package', NULL, NULL, 400, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1151, NULL, N'GovtInsurance', NULL, N'Health Programs', NULL, N'K-39 Test', NULL, NULL, 0, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1152, NULL, N'GovtInsurance', NULL, N'Health Programs', NULL, N'Peripheral smear/RDT for MP', NULL, NULL, 0, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1153, NULL, N'GovtInsurance', NULL, N'Health Programs', NULL, N'CD4 Count', NULL, NULL, 0, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1154, NULL, N'GovtInsurance', NULL, N'Health Programs', NULL, N'Viral Load', NULL, NULL, 0, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1155, NULL, N'GovtInsurance', NULL, N'Health Programs', NULL, N'AFB Stain', NULL, NULL, 0, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1156, NULL, N'GovtInsurance', NULL, N'Health Programs', NULL, N'Gene Expert', NULL, NULL, 0, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1157, NULL, N'GovtInsurance', NULL, N'Health Programs', NULL, N'Influenza PCR', NULL, NULL, 0, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1158, NULL, N'GovtInsurance', NULL, N'Health Programs', NULL, N'Smear for Lepra', NULL, NULL, 0, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1159, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Aortic Valve Balloon Dilation (AVBD) (Balloon Extra)', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1160, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Atrial Septal Defect (ASD) Device Closure', NULL, NULL, 55000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1161, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Balloon Septosotomy (Balloon Extra) (with contrast)', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1162, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Patent Ductus Arteriosus (PDA) Device Closure', NULL, NULL, 20000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1163, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Pericardiocentesis (Except Aspiration Catheter)', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1164, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Pulmonary Artery Thrombectomy / Embolectomy (with catheter)', NULL, NULL, 34000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1165, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Ventricular Septal Defect (VSD) Device Closure (with contrast)', NULL, NULL, 55000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1166, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Permanent Pacemaker Implantation (Pacemaker Generator Extra)', NULL, NULL, 20000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1167, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Epicardial Pacemaker Insertion', NULL, NULL, 7000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1168, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Single Pacemaker insertion', NULL, NULL, 10000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1169, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Dual Pacemaker insertion', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1170, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Programming Single Pacemaker', NULL, NULL, 400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1171, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Programming Dual Pacemaker', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1172, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'External C Pap Care', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1173, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'EP Study', NULL, NULL, 10000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1174, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'EP/Ablation Type A (with contrast)', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1175, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'EP/Ablation Type B (with contrast)', NULL, NULL, 60000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1176, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'ABP Monitoring', NULL, NULL, 1400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1177, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Ambulatory BP Monitoring (ABPM)', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1178, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Ankle Brachial Index (ABI)', NULL, NULL, 800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1179, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Bilateral Limb Arterial Doppler', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1180, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Bilateral Limb Venous Doppler', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1181, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Carotid Dopple', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1182, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'External C pap Care For 24 Hours', NULL, NULL, 130, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1183, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Holter Monitoring', NULL, NULL, 1300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1184, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Insertion Of Arterial Line', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1185, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Insertion Of Swan gauge Catheterization', NULL, NULL, 925, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1186, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Left Heart Catheterization Including Contrast', NULL, NULL, 12000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1187, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Renal Doppler', NULL, NULL, 3500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1188, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Right Heart Catheterization (Oxymetry Extra) with contrast', NULL, NULL, 12000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1189, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Single Limb Arterial Doppler', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1190, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Single Limb Venous Doppler', NULL, NULL, 1800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1191, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Stress ECHO', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1192, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'TEE (Transesophageal Echocardiography)', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1193, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Tilting Table Test', NULL, NULL, 1200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1194, NULL, N'Cardiology', NULL, N'Cardiac', NULL, N'Umbilical Artery Doppler', NULL, NULL, 1800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1195, NULL, N'Oncology', NULL, N'Cancer', NULL, N'Radiotherapy per fraction unit', NULL, NULL, 800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1196, NULL, N'Oncology', NULL, N'Cancer', NULL, N'Radio Therapy Full Course (X30 Fraction)', NULL, NULL, 24000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1197, NULL, N'Oncology', NULL, N'Cancer', NULL, N'Chemotherapy Per Day (Day Care + Bed charges+ surgical supplies, Medicine Extra)', NULL, NULL, 700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1198, NULL, N'Oncology', NULL, N'Cancer', NULL, N'Brachytherapy per episode', NULL, NULL, 8500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1199, NULL, N'Oncology', NULL, N'Cancer', NULL, N'Hospice (Palliative) Care per day (Inclusive of Bed charge, Nursing care, Surgical supplies)', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1200, NULL, N'Lab', NULL, N'Markers', NULL, N'Ca-125', NULL, NULL, 1055, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1201, NULL, N'Lab', NULL, N'Markers', NULL, N'Ca-153', NULL, NULL, 1025, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1202, NULL, N'Lab', NULL, N'Markers', NULL, N'Alpha Fetoprotein (AFP)', NULL, NULL, 900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1203, NULL, N'Lab', NULL, N'Markers', NULL, N'Carcinoembryonic antigen (CEA)', NULL, NULL, 730, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1204, NULL, N'Lab', NULL, N'Markers', NULL, N'Beta 2 Microalbumin (tumour marker)', NULL, NULL, 3150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1205, NULL, N'Lab', NULL, N'Markers', NULL, N'Other Tumour markers (CA 19.9, Vimentin,Desmin, S100 etc.)- permarker', NULL, NULL, 1067, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1206, NULL, N'Lab', NULL, N'Markers', NULL, N'Flow Cytometry (Per marker)', NULL, NULL, 1200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1207, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Other-850', NULL, NULL, 850, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1208, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-2000', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1209, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Minor 2', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1210, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Minor 3', NULL, NULL, 4500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1211, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Minor 4', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1212, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Minor 5', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1213, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others- Intermediate 1', NULL, NULL, 13500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1214, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Intermeditate 2', NULL, NULL, 18000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1215, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Intermediate 3', NULL, NULL, 22500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1216, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Major 1', NULL, NULL, 27000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1217, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Major 2', NULL, NULL, 31500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1218, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Major 3', NULL, NULL, 36000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1219, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 1', NULL, NULL, 45000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1220, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 2', NULL, NULL, 54000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1221, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 3', NULL, NULL, 63000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1222, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 4', NULL, NULL, 72000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1223, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 5', NULL, NULL, 81000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1224, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 6', NULL, NULL, 90000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1225, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 7', NULL, NULL, 99000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1226, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 8', NULL, NULL, 108000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1227, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 9', NULL, NULL, 117000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1228, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 10', NULL, NULL, 126000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1229, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 11', NULL, NULL, 135000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1230, NULL, N'Surgery', NULL, N'Surgical Services', NULL, N'SurgicalServices-Others-Supermajor 12', NULL, NULL, 144000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1231, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-DayCare', NULL, NULL, 1000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1232, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 1', NULL, NULL, 2000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1233, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 2', NULL, NULL, 3000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1234, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 3', NULL, NULL, 4000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1235, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 4', NULL, NULL, 5000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1236, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 5', NULL, NULL, 6000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1237, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 6', NULL, NULL, 7000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1238, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 7', NULL, NULL, 8000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1239, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 8', NULL, NULL, 9000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1240, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 9', NULL, NULL, 10000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1241, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 10', NULL, NULL, 12000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1242, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 11', NULL, NULL, 14000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1243, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 12', NULL, NULL, 16000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1244, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 13', NULL, NULL, 18000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1245, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 14', NULL, NULL, 20000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1246, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 15', NULL, NULL, 22500, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1247, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 16', NULL, NULL, 25000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1248, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 17', NULL, NULL, 30000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1249, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 18', NULL, NULL, 35000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1250, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 19', NULL, NULL, 40000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1251, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 20', NULL, NULL, 45000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1252, NULL, N'GovtInsurance', NULL, N'Medical Services', NULL, N'MedicalServices-Others-Package 21', NULL, NULL, 50000, 1, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1253, NULL, N'Other', NULL, N'Other', NULL, N'ECG', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1254, NULL, N'Other', NULL, N'Other', NULL, N'Echocardiogram', NULL, NULL, 1050, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1255, NULL, N'Other', NULL, N'Other', NULL, N'UGI Endoscopy', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1256, NULL, N'Other', NULL, N'Other', NULL, N'Colonoscopy', NULL, NULL, 2500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1257, NULL, N'Other', NULL, N'Other', NULL, N'EEG', NULL, NULL, 1080, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1258, NULL, N'Other', NULL, N'Other', NULL, N'Sigmoidoscopy (General)', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1259, NULL, N'Other', NULL, N'Other', NULL, N'Bronchoscopy(General)', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1260, NULL, N'Other', NULL, N'Other', NULL, N'ENT endoscopy', NULL, NULL, 600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1261, NULL, N'Other', NULL, N'Other', NULL, N'Cystoscopy', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1262, NULL, N'Other', NULL, N'Other', NULL, N'Thyroscan/ Parathyroid scan', NULL, NULL, 4500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1263, NULL, N'Other', NULL, N'Other', NULL, N'Intravenousurogram(IVU)', NULL, NULL, 1900, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1264, NULL, N'Other', NULL, N'Other', NULL, N'MRCP Urethrograph', NULL, NULL, 5000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1265, NULL, N'Other', NULL, N'Other', NULL, N'Myelogram (cervical)', NULL, NULL, 1400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1266, NULL, N'Other', NULL, N'Other', NULL, N'Myelogram (whole length)', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1267, NULL, N'Other', NULL, N'Other', NULL, N'Fistulogram', NULL, NULL, 1170, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1268, NULL, N'Other', NULL, N'Other', NULL, N'T-tube Cholangiogram', NULL, NULL, 1250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1269, NULL, N'Other', NULL, N'Other', NULL, N'MRCP (Magnetic Resonance Cholangiopancreatography)', NULL, NULL, 5000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1270, NULL, N'Other', NULL, N'Other', NULL, N'ERCP (Endoscopic Retrograde Cholangiopancreatography', NULL, NULL, 4000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1271, NULL, N'Other', NULL, N'Other', NULL, N'ERCP with procedures', NULL, NULL, 9000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1272, NULL, N'Other', NULL, N'Other', NULL, N'Colposcopy', NULL, NULL, 1225, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1273, NULL, N'Other', NULL, N'Other', NULL, N'Hysteroscopy', NULL, NULL, 750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1274, NULL, N'Other', NULL, N'Other', NULL, N'Fluoroscopy', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1275, NULL, N'Other', NULL, N'Other', NULL, N'Retrograde pyelography/Urethrography', NULL, NULL, 950, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1276, NULL, N'Other', NULL, N'Other', NULL, N'Percutaneous Nephrogram', NULL, NULL, 950, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1277, NULL, N'Other', NULL, N'Other', NULL, N'HIDA scan', NULL, NULL, 6500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1278, NULL, N'Other', NULL, N'Other', NULL, N'MUGA scan', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1279, NULL, N'Other', NULL, N'Other', NULL, N'Sialography', NULL, NULL, 650, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1280, NULL, N'Other', NULL, N'Other', NULL, N'NPL (laryngoscopy)', NULL, NULL, 700, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1281, NULL, N'Other', NULL, N'Other', NULL, N'Lymphocytography', NULL, NULL, 5000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1282, NULL, N'Other', NULL, N'Other', NULL, N'Bronchoscopy', NULL, NULL, 1950, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1283, NULL, N'Other', NULL, N'Other', NULL, N'DTPA/DMSA Scan', NULL, NULL, 6500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1284, NULL, N'Other', NULL, N'Other', NULL, N'Transvaginalsonography', NULL, NULL, 600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1285, NULL, N'Other', NULL, N'Other', NULL, N'Saline Sonohysterogram', NULL, NULL, 1200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1286, NULL, N'Other', NULL, N'Other', NULL, N'Fluorosceine Angiography', NULL, NULL, 3000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1287, NULL, N'Other', NULL, N'Other', NULL, N'Eye (Visual Field Series)', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1288, NULL, N'Other', NULL, N'Other', NULL, N'Color Vision', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1289, NULL, N'Other', NULL, N'Other', NULL, N'Orthoptic Screening (PBCT, WFDT)', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1290, NULL, N'Other', NULL, N'Other', NULL, N'Optical biometry', NULL, NULL, 396, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1291, NULL, N'Other', NULL, N'Other', NULL, N'Probing', NULL, NULL, 2500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1292, NULL, N'Other', NULL, N'Other', NULL, N'Cardiotocogram (CTG)', NULL, NULL, 275, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1293, NULL, N'Other', NULL, N'Other', NULL, N'Uroflowmetry', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1294, NULL, N'Other', NULL, N'Other', NULL, N'Urodynamic evaluation', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1295, NULL, N'Other', NULL, N'Other', NULL, N'Audiometry', NULL, NULL, 325, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1296, NULL, N'Other', NULL, N'Other', NULL, N'Spirometry', NULL, NULL, 550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1297, NULL, N'Other', NULL, N'Other', NULL, N'Tread Mill Test(TMT)', NULL, NULL, 1500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1298, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'10% Dextrose 500/540ml glass bottle', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1299, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'10% Dextrose 500/540ml plastic (nipple head)', NULL, NULL, 55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1300, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'10% Dextrose 500/540ml plastic euro head', NULL, NULL, 63, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1301, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'10% Dextrose saline 1000ml plastic (nipple head)', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1302, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'10% Dextrose saline 1000ml plastic euro head', NULL, NULL, 78, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1303, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'5 Flurouracil 250mg/5ml injection/ml', NULL, NULL, 3.68, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1304, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'5% Dextrose 1000ml plastic euro head', NULL, NULL, 73, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1305, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'5% Dextrose 1000ml plastic nipple head', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1306, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'5% Dextrose 500/540ml glass bottle', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1307, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'5% Dextrose 500/540ml plastic euro head', NULL, NULL, 53, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1308, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'5-Flurouracil 500mg injection', NULL, NULL, 30.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1309, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acarbose 25mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1310, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acarbose 50mg tablet', NULL, NULL, 14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1311, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aceclofenac100mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1312, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acetazolamide 250mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1313, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acetylcysteine 1g/5ml, amp. injection', NULL, NULL, 174.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1314, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acetylcysteine 600mg tablet', NULL, NULL, 19.85, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1315, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Actinomycin d 0.5mg injection', NULL, NULL, 935.44, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1316, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acyclovir 200mg tablet', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1317, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acyclovir 250mg ,10ml injection', NULL, NULL, 681, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1318, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acyclovir 3%,5gm cream', NULL, NULL, 49, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1319, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acyclovir 400mg tablet', NULL, NULL, 22.15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1320, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acyclovir 5gm ointment', NULL, NULL, 93, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1321, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acyclovir 800mg tablet', NULL, NULL, 37.04, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1322, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Acyclovir DT 800mgtablet', NULL, NULL, 28.16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1323, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Adapalene + Clindamycin gel 10gm,tube gel', NULL, NULL, 112.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1324, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Adenosine 6mg/2ml , vial injection', NULL, NULL, 405.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1325, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Adrenaline 1:1000 injection', NULL, NULL, 18.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1326, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Alamine (amino acid) 500mlinjection', NULL, NULL, 632, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1327, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Albendazole 400mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1328, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Albendazole 400mg/10ml,10ml bottle suspension', NULL, NULL, 18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1329, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aldactone 25mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1330, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aldactone 50mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1331, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Alendronate70mg tablet', NULL, NULL, 48, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1332, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Alfuzosin 10mg tablet', NULL, NULL, 15.51, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1333, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Allupurinol 300mg tablet', NULL, NULL, 14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1334, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Allupurionol 100mg tablet', NULL, NULL, 2.88, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1335, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Alpha interferon 3 miu injection', NULL, NULL, 1342.08, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1336, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Alprazolam 0.25mg tablet', NULL, NULL, 1.78, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1337, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Alprazolam 0.5mg tablet/capsule', NULL, NULL, 3.62, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1338, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aluminium hydroxide magnesium hydroxide 175ml syr. ', NULL, NULL, 98.72, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1339, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aluminium hydroxide + Magnesium hydroxide (250mg+250mg) tablet ', NULL, NULL, 1.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1340, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amikacin 100mg vial, injection ', NULL, NULL, 41.12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1341, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amikacin 500mg vial, injection ', NULL, NULL, 120.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1342, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aminophyllin 100mg tablet ', NULL, NULL, 1.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1343, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aminophyllin 250mg/10ml ,amp injection', NULL, NULL, 32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1344, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amiodarone (50mg/ml) 3ml injection, amp.', NULL, NULL, 139, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1345, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amiodarone hydrochloride 100mg tablet', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1346, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amiodarone hydrochloride 200mg tablet ', NULL, NULL, 24, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1347, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amisulpride 100mg tablet', NULL, NULL, 13, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1348, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amisulpride 500mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1349, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amitriptyline 75mg tablet', NULL, NULL, 5.96, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1350, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amitriptyline 10mg tablet', NULL, NULL, 2.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1351, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amitriptyline 25mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1352, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine 10mg tablet/capsule', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1353, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine 2.5mg tablet/capsule', NULL, NULL, 2.3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1354, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine 5 mg+ Atenelol 50mg', NULL, NULL, 4.35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1355, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine 5mg tablet', NULL, NULL, 5.44, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1356, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine besilate 2.5mg + Atenolol 25mg tablet', NULL, NULL, 3.21, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1357, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine besilate 2.5mg + Atenolol 50mg tablet ', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1358, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine besilate 5mg + Atenolol 25mg tablet', NULL, NULL, 4.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1359, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine besilate 5mg + Atenolol 50mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1360, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine besylate 2.5mg + Losartan potassium 25mg tablet ', NULL, NULL, 9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1361, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amlodipine besylate 5mg + Losartan potassium 25mg tablet ', NULL, NULL, 12.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1362, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin & clavulanate 1.2gm injection ', NULL, NULL, 192.57, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1363, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin & clavulanate 375mg tablet ', NULL, NULL, 19.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1364, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin & clavulanate 625mg tablet ', NULL, NULL, 24.16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1365, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin 125 mg/5ml,60ml suspension', NULL, NULL, 41, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1366, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin 125mg DT tablet ', NULL, NULL, 3.53, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1367, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin 250 mg capsule ', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1368, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin 250mg DT tablet ', NULL, NULL, 6.1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1369, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin 500mg capsule', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1370, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin syrup 125mg/5ml ,90ml ', NULL, NULL, 110, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1371, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amoxycillin200mg + Clavulanic acid 28.5mg,30ml,syrup', NULL, NULL, 84.66, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1372, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Amphotericin b 50mg solution', NULL, NULL, 450, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1373, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ampicillin 250 mg +Cloxacillin 250 mg ,capsule', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1374, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ampicillin 250mg ,injection, vial', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1375, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ampicillin 500mg injection', NULL, NULL, 33, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1376, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Anastrazole 1mg tablet', NULL, NULL, 80.66, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1377, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Anti haemorrhoidal ointment 30g,tube ointment', NULL, NULL, 98, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1378, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Anti venom 10ml injection', NULL, NULL, 1280, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1379, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aripiprazole 10mg tablet', NULL, NULL, 12.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1380, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aripiprazole 15mg tablet', NULL, NULL, 16.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1381, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aspirin 150mg tablet', NULL, NULL, 0.99, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1382, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aspirin 300mg tablet', NULL, NULL, 1.13, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1383, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Aspirin 75 mg tablet', NULL, NULL, 0.45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1384, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atenolol 25mg tablet', NULL, NULL, 2.46, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1385, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atenolol 50 mg tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1386, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atenolol50mg + Chlorthalidone 12.5 mg tablet ', NULL, NULL, 3.69, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1387, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atenolol50mg + Chlorthalidone 25 mg tablet ', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1388, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atorvastatin 10mg tablet ', NULL, NULL, 10.77, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1389, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atorvastatin 20mg tablet', NULL, NULL, 20.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1390, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atorvastatin 5mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1391, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atracurium 50mg injection', NULL, NULL, 208, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1392, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atropine 0.6 mg/ml, 1 ml injection', NULL, NULL, 9.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1393, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Atropine 1%,5ml eye drop', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1394, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Avipattikar churna100gm', NULL, NULL, 185, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1395, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Azathioprine 50mg tablet/capsule', NULL, NULL, 15.45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1396, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Azithromycin 100mg/5ml,15ml suspension', NULL, NULL, 46.48, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1397, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Azithromycin 200mg/5ml ,15ml suspension', NULL, NULL, 71.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1398, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Azithromycin 250mg tablet', NULL, NULL, 17.82, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1399, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Azithromycin 500mg ,injection', NULL, NULL, 315, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1400, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Azithromycin 500mg tablet', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1401, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Baclofen 10mg tablet', NULL, NULL, 16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1402, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Baclofen25mg/ tablet', NULL, NULL, 35.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1403, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Beclomethasone inhaler [200 mcg./dose]', NULL, NULL, 445, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1404, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Beclomethasone nasal spray', NULL, NULL, 235.43, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1405, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Beclomethasone rotacap 200mcg(30cap)', NULL, NULL, 82.82, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1406, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Beclomethasone rotacap [100 mcg./dose],30''s rotacap', NULL, NULL, 62.06, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1407, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Beclomethasone rotacap 400mcg(30cap)', NULL, NULL, 144, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1408, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bendamustine 100mg injection', NULL, NULL, 11519, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1409, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Benzhexol 2mg + Trifluoperazine 5mg tablet', NULL, NULL, 5.04, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1410, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Benzhexol HCL ,2mg tablet', NULL, NULL, 2.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1411, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Benzoic acid 6%+ salicylic acid 3% oint., 30 gm ointment', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1412, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Benzoyl peroxide gel 5% 20gm,tube gel', NULL, NULL, 110.82, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1413, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Benzydamine HCL 0.15%w/v / topical', NULL, NULL, 35.3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1414, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Benzydamine  mouth gargle', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1415, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Beta histine 8mg tablet', NULL, NULL, 7.68, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1416, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Betahistine hydrochloride DT 8mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1417, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Betamethasone 0.1%+Neomyicn eye drops', NULL, NULL, 40.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1418, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Betamethasone 0.1%w/w+ neomycin 0.5%w/ w+ Chlorocresol 0.1% w/w, tube cream', NULL, NULL, 36.56, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1419, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Betamethasone cream 0.1 % ,10 gm', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1420, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bilwadi churna 100gm', NULL, NULL, 250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1421, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bisacodyl suppository 10mg', NULL, NULL, 22, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1422, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bisacodyl suppository 5mg', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1423, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bisacodyl5mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1424, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bismuth iodoform 15mg paste', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1425, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bisoprolol 10mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1426, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bisoprolol 2.5mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1427, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bisoprolol 5mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1428, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bleomycin 15mg injection/ml', NULL, NULL, 958.93, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1429, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bortezomib 2mg injection', NULL, NULL, 16056, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1430, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Brimonidine + timolol 0.5% eye drops', NULL, NULL, 435, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1431, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bromohexine +Terbutaline+Guiafenesin syrup', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1432, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Budecort 200mcg inhaler', NULL, NULL, 525.74, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1433, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Budesonide 100mcg inhaler', NULL, NULL, 456, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1434, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Budesonide 100mcg rotacap', NULL, NULL, 115, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1435, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Budesonide 200mcg rotacap', NULL, NULL, 151.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1436, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Budesonide 400mcg rotacap', NULL, NULL, 197.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1437, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bupivacain 5mg/ml + dextrose 80mg/ml, amp injection', NULL, NULL, 42.13, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1438, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bupivacain 5mg/ml + sodium chloride 8mg/ml injection ', NULL, NULL, 122.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1439, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Bupropion SR 150mg tablet', NULL, NULL, 13.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1440, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Busulphan 2mg tablet', NULL, NULL, 6.03, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1441, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Butenafine 1% cream', NULL, NULL, 110, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1442, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Butenafine 1% ointment', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1443, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Butenafine HCL 1%w/w/ 1 gm /topical ', NULL, NULL, 95.01, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1444, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Calamine lotion 15%, 30 ml lotion ', NULL, NULL, 45050, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1445, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Calcirol sachet 1gm (60kd cap)', NULL, NULL, 50.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1446, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Calcitriol capsule 0.250mcg', NULL, NULL, 19, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1447, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Calcium acetate 667mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1448, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Calcium carbonate 500mg + d3 250mg tablet ', NULL, NULL, 5.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1449, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Calcium gluconate 10% 10 ml amp ,injection', NULL, NULL, 26.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1450, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Calcium suspension', NULL, NULL, 90, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1451, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Capacitabin 500mg tablet', NULL, NULL, 225, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1452, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carbamazepine 200mg tablet', NULL, NULL, 1.18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1453, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carbamazepine 400mg tablet', NULL, NULL, 3.84, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1454, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carbamazepine CR 200mg tablet', NULL, NULL, 2.41, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1455, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carbamazepine CR 300mg tablet', NULL, NULL, 4.51, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1456, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carbamazepine CR 400mg tablet', NULL, NULL, 4.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1457, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carbimazole 5mg (100 tablets) tablet', NULL, NULL, 334.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1458, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carboplatin 150mg injection', NULL, NULL, 1142.22, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1459, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carboplatin 450mg injection', NULL, NULL, 2548.91, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1460, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carboprost tromethine 250mcg injection', NULL, NULL, 233.85, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1461, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carvedilol 3.125mg tablet', NULL, NULL, 2.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1462, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carvedilol 6.25mg tablet', NULL, NULL, 5.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1463, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefaclor anhydrous 25 mg/ml/liquid', NULL, NULL, 107.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1464, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefadroxil 500mgcapsule', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1465, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefadroxil anhydrous 25 mg/ml/liquid', NULL, NULL, 14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1466, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefadroxil monohydrate 250 mg/oral tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1467, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefadroxil monohydrate 500 mg/oral tablet', NULL, NULL, 6.27, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1468, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefadroxil-125mg dry/syru', NULL, NULL, 29, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1469, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefazolin 1 gm injection', NULL, NULL, 86.73, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1470, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefipime1gm injection', NULL, NULL, 268.87, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1471, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefixime 100mg tablet', NULL, NULL, 9.66, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1472, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefixime 200mg tablet', NULL, NULL, 17.04, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1473, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefixime 50mg/5ml ,60ml suspension', NULL, NULL, 135, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1474, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefixime ds,30ml dry syrup', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1475, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefotaxime & sulbactam for Injection ,125mg injection', NULL, NULL, 21.46, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1476, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefotaxime 1 gm injection', NULL, NULL, 53.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1477, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefotaxime 250mg injection', NULL, NULL, 25.63, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1478, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefotaxime 500mg injection', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1479, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefpodoxime 200mg tablet/capsule', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1480, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefpodoxime 200mg+clavulanic acid125mg,tablet', NULL, NULL, 41.44, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1481, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefpodoxime 50mg syrup', NULL, NULL, 170, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1482, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefpodoxime dry /syrup 100mg', NULL, NULL, 206, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1483, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefpodoxime dry /syrup 50mg', NULL, NULL, 112, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1484, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefpodoxime proxetil DT 200mg tablet', NULL, NULL, 20.16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1485, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefpodoxime100mg syrup', NULL, NULL, 250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1486, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ceftazidime 1gm injection', NULL, NULL, 310.36, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1487, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ceftriaxone 1 gm injection', NULL, NULL, 90, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1488, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ceftriaxone 250 mg injection', NULL, NULL, 44.24, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1489, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ceftriaxone 500 mg injection', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1490, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefuroxime axetil 250mg tablet', NULL, NULL, 39.15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1491, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cefuroxime axetil 500mg tablet', NULL, NULL, 57.23, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1492, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cephalexine500mg capsule', NULL, NULL, 27.36, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1493, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cephazoline 500 mg injection', NULL, NULL, 55.52, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1494, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cetrizine 10 mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1495, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cetrizine 10mg/5ml suspension', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1496, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Charcoal activated 10gm/sachet powder', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1497, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Charcoal activated 250mg capsule', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1498, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorabucil 2mg tablet', NULL, NULL, 79.89, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1499, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloramphenicol 0.5% +dexamethasone 0.1 % eye drops ', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1500, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloramphenicol 1% eye ointment 5g', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1501, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloramphenicol 10mg polymyxin B 5000iu ointment', NULL, NULL, 42, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1502, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloramphenicol 1g injection, vial', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1503, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloramphenicol 250 mg capsule', NULL, NULL, 5.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1504, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloramphenicol 5%w/v+ Lidocaine 2%w/v eye drop', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1505, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloramphenicol 500mg capsule', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1506, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloramphenicol 5mg+Polymyxin-b 5000i.u.+ Dexamethasone 1mg eye drop ', NULL, NULL, 56, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1507, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N' Chloramphenicol 5ml / 5% e/e drop', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1508, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloramphenicol1% applicap', NULL, NULL, 1.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1509, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlordiazepoxide 20mg,tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1510, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlordiazepoxide 5mg,tablet', NULL, NULL, 2.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1511, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorhexidine gluconate topical ,lignocaine topical and metronidazole, ointment', NULL, NULL, 76.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1512, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorhexidine mouth wash 80ml solution ', NULL, NULL, 77.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1513, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorodiapoxide 10mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1514, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorodiapoxide 25mg tablet', NULL, NULL, 6.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1515, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chloroquine phosphate 250mg tablet', NULL, NULL, 2.33, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1516, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorpheniramine 4 mg tablet', NULL, NULL, 0.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1517, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorpheniramine maleate 10mg injection', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1518, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorpheniramine maleate 1mg tablet', NULL, NULL, 0.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1519, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorpromazine 100 mg tablet', NULL, NULL, 1.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1520, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorpromazine 25 mg tablet', NULL, NULL, 0.45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1521, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorpromazine 50mg/2ml injection', NULL, NULL, 11.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1522, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chlorzoxazone 250mg+paracetamol 500mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1523, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cholecalciferol 200ml suspension', NULL, NULL, 64, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1524, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cholecalciferol 250mg tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1525, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cholecalciferolsachet 1gm/60kd powder', NULL, NULL, 48.24, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1526, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Chymotrypsin forte tablet', NULL, NULL, 21.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1527, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cinnarazine 25mg tablet', NULL, NULL, 5.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1528, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ciprofloxacin 0.3% +dexamethasone 0.1 % eye drops ', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1529, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ciprofloxacin 0.3% eye ointment 5gm', NULL, NULL, 24, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1530, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ciprofloxacin 250mg tablet ', NULL, NULL, 625, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1531, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ciprofloxacin 500 mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1532, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ciprofloxacin e/e drops 0.3 %,5ml drops', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1533, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ciprofloxacin infusion 200 mg / 100 ml infusion', NULL, NULL, 56.81, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1534, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cisplatin 10mg injection', NULL, NULL, 134.23, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1535, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cisplatin 50mg injection', NULL, NULL, 410.17, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1536, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clarithromycin 250mg tablet', NULL, NULL, 33.1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1537, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clarithromycin 500mg tablet', NULL, NULL, 45.72, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1538, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clindamycin 150mg capsule', NULL, NULL, 21.65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1539, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clindamycin 300mg capsule', NULL, NULL, 35.31, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1540, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clindamycin 300mg injection', NULL, NULL, 226, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1541, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clindamycin 600mg injection', NULL, NULL, 355, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1542, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clindamycin injection 150mg/ml 2ml amp.', NULL, NULL, 185, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1543, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clindamycin phosphate15gm ,tube gel', NULL, NULL, 115, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1544, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clobazam 10mg tablet', NULL, NULL, 14.01, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1545, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clobazam 5mg tablet', NULL, NULL, 8.36, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1546, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clobetasol propionate cream 30gm cream', NULL, NULL, 125, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1547, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clobetasole+ Gentamycin ointment', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1548, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clobetasole+ Gentamycin+ Miconazole ointment', NULL, NULL, 55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1549, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clobetasole+ Salisylic acid ointment', NULL, NULL, 142.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1550, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clomipramine 25mg tablet', NULL, NULL, 7.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1551, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clomipramine 50mg tablet', NULL, NULL, 10.56, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1552, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clomipramine hydrochloride 10mg tablet', NULL, NULL, 4.24, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1553, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clonazepam 0.25mg tablet', NULL, NULL, 1.19, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1554, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clonazepam 0.5mg tablet', NULL, NULL, 4.43, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1555, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clonazepam 25mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1556, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clonidine 100mcg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1557, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clopidogrel 75mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1558, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clopropamide 100mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1559, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clopropamide 250mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1560, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clotrimazole 1%w/v+ lidocaine 2%w/v ,10ml ear dro', NULL, NULL, 55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1561, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clotrimazole 1%w/w +gentamicin sulphate 0.1%w/w+ beclomethasone dip.0.025%w/w cream', NULL, NULL, 143, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1562, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clotrimazole 100mg pessary tablet(6 tablet)', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1563, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clotrimazole 10ml ear /eye drop', NULL, NULL, 101, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1564, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clotrimazole 25mg 1% w/w skin cream', NULL, NULL, 118.45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1565, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clotrimazole lotion (topical solution) 15ml', NULL, NULL, 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1566, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clotrimazole mouth paint 20ml', NULL, NULL, 190.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1567, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clotrimazole vaginal (pessary) 6 tablet', NULL, NULL, 17.78, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1568, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clotrimazole mouth paint ,20ml paint', NULL, NULL, 145, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1569, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clove oil,5ml', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1570, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cloxacillin 125mg capsule', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1571, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cloxacillin 125mg/5ml , 100ml,syrup', NULL, NULL, 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1572, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cloxacillin 250mg capsule', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1573, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cloxacillin 500mg capsule', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1574, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cloxacillin 500mg injection', NULL, NULL, 51.64, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1575, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clozapine 100mg tablet', NULL, NULL, 21.3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1576, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Clozapine 25mg tablet', NULL, NULL, 3.91, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1577, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Codeine phosphate 15mg tablet', NULL, NULL, 6.33, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1578, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Colchicine 0.5mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1579, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Colistimethate sodium injection 1million iu', NULL, NULL, 1325, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1580, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Colistimethate sodium injection 2million iu', NULL, NULL, 2475, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1581, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Compound solution of sodium lactate solution 500 ml(ringer lactate) infusion', NULL, NULL, 55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1582, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Conjugated estrogen 0.625mg tablet', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1583, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Conjugated estrogen vaginal cream', NULL, NULL, 625, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1584, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cotrimoxazole paediatric suspension 50ml', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1585, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cream silver sulphadiazine 25g, 1% w/w cream', NULL, NULL, 62.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1586, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cromolyn sodium ophthalmic 5ml,eye drop', NULL, NULL, 73.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1587, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cyclopentolate eye drop', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1588, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cyclophosphamide 500mg injection', NULL, NULL, 105.23, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1589, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cyclophosphamide 50mg tablet', NULL, NULL, 6.62, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1590, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cyclosporine 100mg tablet/capsule', NULL, NULL, 187.78, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1591, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cyclosporine 100mg/ml injection/ml', NULL, NULL, 209.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1592, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cyclosporine 25mg tablet/capsule', NULL, NULL, 43.71, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1593, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cyclosporine 50mg tablet/capsule', NULL, NULL, 85.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1594, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cyproheptadine 200ml syp', NULL, NULL, 115, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1595, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cytosine arabisonide 1000mg/vial injection', NULL, NULL, 2068, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1596, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cytosine arabisonide 100mg/vial injection', NULL, NULL, 421.23, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1597, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cytosine arabisonide 500mg/vial injection', NULL, NULL, 910.74, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1598, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dacarbazine 500mg injection', NULL, NULL, 1817.18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1599, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Danazol 100mg capsule', NULL, NULL, 35.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1600, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Danazol 50mg capsule', NULL, NULL, 16.54, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1601, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Darbepoetin alfa injection 25mcg', NULL, NULL, 2558, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1602, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Darbepoetin alfa injection 40mcg', NULL, NULL, 3062, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1603, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Daunorubicin 20mg injection', NULL, NULL, 592, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1604, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Decitabine 50mg injection', NULL, NULL, 12787, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1605, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dexamethasone 0.5mg tablet', NULL, NULL, 0.35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1606, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dexamethasone 2 ml, 4 mg/ml injection', NULL, NULL, 21, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1607, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextromethorphan+ chlorpheniramine 100ml syrup', NULL, NULL, 112, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1608, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose 25% 25ml injection, amp.', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1609, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose 25% in glycerine 25ml', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1610, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose 5% in 0.45% saline 500ml', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1611, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose 50% 25ml injection, amp.', NULL, NULL, 44.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1612, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose saline 1000mlplastic euro head', NULL, NULL, 73, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1613, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose saline 1000mlplasticnipple head', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1614, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose saline 500/540ml glass bottle', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1615, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose saline 500/540ml plastic (nipple head)', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1616, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose saline 500/540ml plastic euro head', NULL, NULL, 53, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1617, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dextrose solution5 % w/v 500 ml infusion', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1618, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diacerin 50mg capsule', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1619, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diazepam 10mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1620, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diazepam 10mg/2ml injection, amp.', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1621, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diazepam 5mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1622, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diazepam 5mg/2ml injection', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1623, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diclofenac ,5ml eye drop', NULL, NULL, 56, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1624, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diclofenac 100mg SR tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1625, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diclofenac 25 mg / ml, 3 ml injection', NULL, NULL, 14.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1626, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diclofenac 50mg tablet', NULL, NULL, 2.13, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1627, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diclofenac gel,30gm gel', NULL, NULL, 96, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1628, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dicyclomin hcl 30ml suspension', NULL, NULL, 63.3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1629, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dicyclomin hcl,20mg tablet', NULL, NULL, 1.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1630, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dicyclomin hcl+simethicone,10ml drops', NULL, NULL, 19, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1631, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diethylcarbamazine 100mg tablet', NULL, NULL, 2.03, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1632, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diethylcarbamazine citrate 150mg tablet', NULL, NULL, 2.35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1633, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Digestive enzymes syrup,100ml', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1634, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Digoxin 0.25 mg tablet', NULL, NULL, 2.51, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1635, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Digoxin 0.5mg ,amp. Injection', NULL, NULL, 13.62, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1636, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diltiazem 30mg plain tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1637, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diltiazem hydrochloride 120mg tablet', NULL, NULL, 24.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1638, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diltiazem hydrochloride 90mg tablet', NULL, NULL, 14.54, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1639, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Diptheria, tetanus 0.5ml, amp injection', NULL, NULL, 17.28, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1640, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Disodium hydrogren citrate,100ml', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1641, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Divalporate sodium 250mg tablet', NULL, NULL, 8.96, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1642, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Divalporate sodium 500mg tablet', NULL, NULL, 15.84, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1643, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dobutamine 250mginjection', NULL, NULL, 488.41, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1644, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Docetaxel injection 120mg', NULL, NULL, 25806, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1645, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Docetaxel injection 20mg', NULL, NULL, 4694, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1646, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Docetaxel injection 80mg', NULL, NULL, 18096, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1647, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Domperidone ,30ml. Suspension', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1648, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Domperidone10mg tablet', NULL, NULL, 3.76, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1649, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Donepezil 10mg tablet', NULL, NULL, 18.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1650, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Donepezil 5mg tablet', NULL, NULL, 12.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1651, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dopamine 200mg/5ml , amp. Injection', NULL, NULL, 51.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1652, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Dorzolamide 2% eye drops', NULL, NULL, 446, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1653, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Doxofylline 400mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1654, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Doxorubicin 10mg injection', NULL, NULL, 328, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1655, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Doxorubicin 50mg injection', NULL, NULL, 1416.28, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1656, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Doxorubicin hydrochloride liposome injection 20mg', NULL, NULL, 13000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1657, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Doxycycline 100 mg capsule', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1658, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Drotaverine 40mg tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1659, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Drotaverine 80mg tablet', NULL, NULL, 9.71, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1660, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Duloxetine hcl 20mg tablet', NULL, NULL, 11.84, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1661, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Duloxetine hcl 30mg tablet', NULL, NULL, 16.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1662, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ebastine 10mg', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1663, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ebastine 20mg', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1664, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Efavirenz 200 mg', NULL, NULL, 1252.91, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1665, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Efavirenz 600 mg', NULL, NULL, 3200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1666, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Enalapril 10mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1667, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Enalapril 2.5mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1668, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Enalapril 5mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1669, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Enoxapirin 40mg injection', NULL, NULL, 671.33, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1670, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Enoxapirin60mg injection', NULL, NULL, 924, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1671, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Entecavir 0.5mg', NULL, NULL, 1216.32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1672, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ephedrine 30mg /ml ,1mlinjection', NULL, NULL, 37.44, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1673, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Epirubicin hydrochloride injection 10mg', NULL, NULL, 1049, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1674, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Epirubicin hydrochloride injection 50mg', NULL, NULL, 4960, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1675, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ergometrine 0.5mginjection', NULL, NULL, 24.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1676, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Erlotinib 100mg tablet', NULL, NULL, 730, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1677, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Erlotinib 150mg tablet', NULL, NULL, 986, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1678, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N' Erythopoietin alfa 4000 iu injection', NULL, NULL, 1405, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1679, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Erythopoietin alfa2000 iu injection', NULL, NULL, 744.21, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1680, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Erythromycin 125mg/5ml,60ml suspension', NULL, NULL, 51, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1681, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N' Erythromycin 250mg capsule', NULL, NULL, 4.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1682, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Erythromycin 500mg tablet', NULL, NULL, 10.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1683, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Erythropoetin alfa 6000 iu injection', NULL, NULL, 2000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1684, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Escitalopram 10mg tablet', NULL, NULL, 12.48, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1685, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Escitalopram 20mg tablet', NULL, NULL, 18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1686, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Escitalopram 5mg tablet', NULL, NULL, 7.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1687, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Esmolol hcl 10mg/ml ,10ml injection', NULL, NULL, 368, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1688, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Esmoprazole 20mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1689, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Esmoprazole 40mg tablet', NULL, NULL, 9.64, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1690, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ethamsylate 500mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1691, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Etoposide 100mg capsule', NULL, NULL, 92.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1692, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Etoposide 100mg/5ml injection', NULL, NULL, 320.27, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1693, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Etoricoxib 90mg tablet', NULL, NULL, 19, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1694, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Exemestane 25mg tablet', NULL, NULL, 531, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1695, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Febuxostat 40mg tablet', NULL, NULL, 8.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1696, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Febuxostat 80mg tablet', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1697, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fenofibrate 160mg tablet', NULL, NULL, 14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1698, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fenofibrate200mg capsule', NULL, NULL, 24.33, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1699, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fentanyl citrate 10ml,ampoule injection', NULL, NULL, 232.01, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1700, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fentanyl citrate 2ml ,ampoule injection', NULL, NULL, 68.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1701, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ferric ammonium citrate mixture', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1702, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ferrous ascorbate + folic acid tablet', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1703, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ferrous fumarate + folic acid tablet', NULL, NULL, 1.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1704, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ferrous sulphate 60mg elemental iron tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1705, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fexofenadine hcl 120mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1706, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fexofenadine hcl 180mg tablet', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1707, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fexofenadine hcl,60ml syrup', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1708, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Filgrastim injection 300mcg', NULL, NULL, 2120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1709, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Finasteride 1mg tablet', NULL, NULL, 3.85, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1710, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Finasteride 5mg tablet', NULL, NULL, 21.44, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1711, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Flavoxate hcl 200mg tablet', NULL, NULL, 15.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1712, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Flucloxacillin 125mg dry /syrup', NULL, NULL, 185, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1713, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Flucloxacillin 500 mg capsule', NULL, NULL, 16.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1714, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluconazole 0.3% eye drops', NULL, NULL, 76, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1715, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluconazole 150 mg tablet', NULL, NULL, 22, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1716, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluconazole 15gm ointment', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1717, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluconazole 50mg tablet', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1718, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluconazole lotion 30ml', NULL, NULL, 14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1719, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluconazole suspension 50mg/5ml 35ml', NULL, NULL, 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1720, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fludrocortisone acetate 100mcg tablet', NULL, NULL, 18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1721, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Flunarizine hcl 10mg tablet', NULL, NULL, 5.54, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1722, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Flunarizine hcl 5mg tablet', NULL, NULL, 3.35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1723, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluorometholone & neomycin E/E drop', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1724, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluorometholone 0.1% eye drop', NULL, NULL, 101, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1725, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluoxetine 10mg capsule', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1726, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluoxetine 20mg capsule', NULL, NULL, 5.61, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1727, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluphenazine decanoate(prolinate) 25mg/ml,1ml injection', NULL, NULL, 77, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1728, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Flurbiprofen sodium eye drop', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1729, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Flurometholone 0.1% eye drop', NULL, NULL, 83, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1730, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Flutamide 250mg tablet', NULL, NULL, 15.22, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1731, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluticasone prop.250mcg, 30 rotacaps', NULL, NULL, 404.81, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1732, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluticasone propionate ,nasalspray', NULL, NULL, 435.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1733, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fluticasone respules', NULL, NULL, 64.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1734, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Folic acid 5 mg tablet', NULL, NULL, 2.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1735, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Folic acid suspension 0.1mcg/ml 30ml', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1736, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fondaparinux 2.5mginjection', NULL, NULL, 958.37, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1737, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Formeterol 6mcg + budesonide 100mcg inhaler', NULL, NULL, 365.04, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1738, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Formeterol 6mcg + budesonide 100mcg rotacaps', NULL, NULL, 195.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1739, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Formeterol 6mcg + budesonide 200mcg rotacaps', NULL, NULL, 304, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1740, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Formeterol 6mcg + budesonide 400mcg rotacaps', NULL, NULL, 382.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1741, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Formeterol and budesonide rota cap 200', NULL, NULL, 304, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1742, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Formeterol and budesonide rota cap 400', NULL, NULL, 382, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1743, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Framycetin 5mg/ml ,5ml eye drop', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1744, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Framycetin sulphate 5mg+ gramicidin 0.05mg+
dexamethasone sodiummetasulfobenzoate 0.5mgeye drop', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1745, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Frusemide 10mg/ml,2ml injection', NULL, NULL, 5.62, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1746, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Frusemide 20mg/2ml injection', NULL, NULL, 6.01, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1747, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Frusemide 20mg+spironolactone 50mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1748, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Frusemide 40 mg tablet', NULL, NULL, 1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1749, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fusidic acid +betamethasone cream 10gm', NULL, NULL, 91.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1750, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Fusidic acid cream 10gm', NULL, NULL, 110.14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1751, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gabapentin 100mg tablet/capsule', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1752, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gabapentin 300mgcapsule', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1753, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gamma benzene hexachloride lotion,100ml lotion', NULL, NULL, 41.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1754, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gatifloxacin 0.3% eye drop', NULL, NULL, 66, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1755, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gefetinib 250mg tablet', NULL, NULL, 315, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1756, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gemcitabin 1000mg injection', NULL, NULL, 5047.69, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1757, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gemcitabin 200mg injection', NULL, NULL, 875.77, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1758, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gentain violet 2%,10ml solution', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1759, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gentamicin 80mg/ml injection', NULL, NULL, 18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1760, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gentamycin +betamethasone+ iodochlorohydroxy quinoline +clotrimazole,5gm cream', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1761, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gentamycin 0.2%w/w, 15gmcream', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1762, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gentamycin 40mg/ml injection', NULL, NULL, 9.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1763, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gentamycin 5ml e/e drop', NULL, NULL, 16.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1764, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glibenclamide 5mgtablet', NULL, NULL, 1.73, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1765, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gliclazide 40mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1766, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Gliclazide 80mg tablet', NULL, NULL, 6.56, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1767, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glimpiride 1mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1768, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glimpiride 2mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1769, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glimpiride 3mg tablet', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1770, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glimpiride 4mg tablet', NULL, NULL, 12.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1771, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glipizide 5mg tablet', NULL, NULL, 0.7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1772, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glucosamine500mg capsule', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1773, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glucose 100gm,pkt powder', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1774, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glycerin ear drops 10ml', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1775, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glycerin enema, 30ml', NULL, NULL, 69.44, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1776, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glycerin supp, adult suppository', NULL, NULL, 15.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1777, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glycerin supp,paed. Suppository', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1778, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glyceryl trinitrate 0.2% ,25 g ointment', NULL, NULL, 500, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1779, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Glycopyrrolate injection 0.2mg/ml ,1ml', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1780, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Granisetron 1mg tablet', NULL, NULL, 9.87, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1781, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Granisetron injection 1mg/1ml', NULL, NULL, 41.92, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1782, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Griseofulvin 125mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1783, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Griseofulvin 250mgtablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1784, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Griseofulvin 500mgtablet', NULL, NULL, 9.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1785, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Halobatosole gentamycin ointment', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1786, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Haloperidol 0.25mg tablet', NULL, NULL, 1.3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1787, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Haloperidol 1.5 mg + trihexyphenidyl 2mg,tablet', NULL, NULL, 2.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1788, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Haloperidol 1.5mg tablet', NULL, NULL, 1.61, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1789, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Haloperidol 5 mg + trihexyphenidyl 2mg,tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1790, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Haloperidol 5mg tablet', NULL, NULL, 2.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1791, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Haloperidol 5mg/ml injection', NULL, NULL, 10.12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1792, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Heparin 25,000 iu/5ml injection, vial', NULL, NULL, 350, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1793, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Heparin ointment 15 gm', NULL, NULL, 160, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1794, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hepatitis a (adult) vaccine', NULL, NULL, 3350, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1795, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hepatitis b vaccine 20mcg/ml ,injection', NULL, NULL, 151.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1796, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hib vaccine ( haemophilus influenzae type b vaccine', NULL, NULL, 600, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1797, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hydralazine 20mg injection.amp', NULL, NULL, 750, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1798, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hydrochlorthiazide 25mg tablet', NULL, NULL, 2.95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1799, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hydrochlrothiazide 12.5mg tablet', NULL, NULL, 1.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1800, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hydrocortisone 0.5% cream/10gm', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1801, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hydrocortisone 1% cream/ointment 10gm', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1802, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hydrocortisone succinate 100mg/vial with WFI powder for injection', NULL, NULL, 114.67, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1803, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hydroquinone cream', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1804, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hydroxychloroquine sulfate 200mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1805, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hydroxypropyl methylcellulose eye drop', NULL, NULL, 48, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1806, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hyoscine butylbromide 10mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1807, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hyoscine butylbromide 20mg tablet', NULL, NULL, 15.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1808, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Hyoscine butylbromide 20mg/mlinjection', NULL, NULL, 19.84, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1809, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ibuprofen 100mg +paracetamol 125mg/5ml,60ml suspension', NULL, NULL, 32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1810, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ibuprofen 200mg tablet', NULL, NULL, 0.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1811, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ibuprofen 400mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1812, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ichthamol in glycerine ear drops,10ml drops', NULL, NULL, 63, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1813, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ifsomide 1gm/2ml injection', NULL, NULL, 609.26, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1814, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Imatinib 100 tablet', NULL, NULL, 154.74, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1815, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Imatinib 400 tablet', NULL, NULL, 474.03, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1816, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Imipenem & clastatin 0.5g injection', NULL, NULL, 1055, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1817, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Imipramine 25mg tablet/capsule', NULL, NULL, 1.32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1818, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Imipramine 50mg tablet/capsule', NULL, NULL, 3.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1819, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Imipramine 75mg tablet/capsule', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1820, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Indomethacin 75mg sr tablet', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1821, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Indomethacin25mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1822, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Indomethacin50mg tablet', NULL, NULL, 3.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1823, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Influenza vaccine 0.5ml', NULL, NULL, 1200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1824, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Insulin ,regular (nph) ,40iu/ml,10ml injection', NULL, NULL, 252.07, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1825, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Insulin glargine100 iu/1ml,3ml 1 cartridge', NULL, NULL, 763.19, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1826, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Insulin glulisine 30/70 1 cartridge', NULL, NULL, 237.39, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1827, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Insulin mixed preparation30/70 injection', NULL, NULL, 230.78, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1828, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Insulin mixed preparation50/50 injection', NULL, NULL, 237.29, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1829, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Insulin,regular,pen device,100iu/ml,3ml 1 cartridge', NULL, NULL, 400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1830, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ipratropium broimide 40mcg', NULL, NULL, 103.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1831, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ipratropium broimide 500mcg', NULL, NULL, 7.89, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1832, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ipratropium inhaler [20 mcg/dose]', NULL, NULL, 220, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1833, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ipratropium respiratory solution 10ml', NULL, NULL, 59, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1834, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ipratropium rotacap 40mcg (30cap)', NULL, NULL, 86, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1835, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ipravent neb solution, 250 mcg/ml', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1836, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Irinotecan injection 100mg', NULL, NULL, 6765, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1837, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Irinotecan injection 40mg', NULL, NULL, 3158, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1838, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Iron 15ml drop', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1839, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Iron 200ml syrup', NULL, NULL, 109.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1840, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Iron polymaltose tablet', NULL, NULL, 9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1841, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Iron sucrose 100mg inj', NULL, NULL, 418, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1842, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Isoprenalin 2mg/2ml injection amp', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1843, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Isoprenaline 1 mg/ml', NULL, NULL, 57.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1844, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Isosorbide dinitrate 10mg tablet', NULL, NULL, 1.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1845, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Isosorbide dinitrate/5mg/tablet', NULL, NULL, 0.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1846, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Isosorbide mononitrate 10mg tablet', NULL, NULL, 4.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1847, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Isosorbide mononitrate 20mg tablet', NULL, NULL, 9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1848, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Isosorbide mononitrate 5mg tablet', NULL, NULL, 2.1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1849, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Isotretinoin 10mg cap', NULL, NULL, 18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1850, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Isotretinoin 20mg cap', NULL, NULL, 27, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1851, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Itopride 50mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1852, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Itraconazole 100mg tablet', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1853, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ivermectin 6mg dt tablet', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1854, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Japanese encephalitis vaccine (green) injection', NULL, NULL, 1127.52, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1855, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ketamine 100mg/2mlinjection', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1856, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ketamine 500mg/10ml injection', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1857, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ketoconazole shampoo 50ml shampoo', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1858, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ketoconazole15gm ointment', NULL, NULL, 62.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1859, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ketoralac tromethamine 10mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1860, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ketorolac 0.04%,5ml eye drop', NULL, NULL, 48.22, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1861, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ketorolac,1ml injection', NULL, NULL, 32.56, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1862, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ketotifen fumarate 0.5mg,5ml eye drop', NULL, NULL, 118, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1863, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ketotifen fumarate 1mg tablet', NULL, NULL, 2.96, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1864, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Labetalol injection 20mg.4ml', NULL, NULL, 472, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1865, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lactic acid wash 100ml', NULL, NULL, 260, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1866, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lactulose 100ml solution', NULL, NULL, 193.41, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1867, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lactulose 200ml solution', NULL, NULL, 357.63, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1868, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lamivudine 100mg', NULL, NULL, 160.06, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1869, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lamivudine 150mg', NULL, NULL, 173.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1870, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lamotrizine 25mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1871, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lansoprazole 30mg/capsule', NULL, NULL, 6.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1872, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'L-arginine granules 3gm (amino acid)', NULL, NULL, 55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1873, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'L-arginine granules 7.5gm(combination), sachet granules ', NULL, NULL, 87.47, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1874, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'L-asparaginase 500ku injection', NULL, NULL, 1921.38, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1875, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Latanoprost 0.05% eye drops', NULL, NULL, 629, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1876, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'L-dopa 100mg + carbidopa 10mg tablet', NULL, NULL, 2.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1877, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'L-dopa 250mg + carbidopa 25mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1878, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Letrozol 2.5mg tablet', NULL, NULL, 19, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1879, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Leucovorin calcium injection 50mg', NULL, NULL, 528, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1880, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Levitirecetam 1000mg tablet', NULL, NULL, 32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1881, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Levitirecetam 500 mg tablet', NULL, NULL, 16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1882, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Levocetirizine 5mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1883, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Levodopa 200 mg + carbidopa 50 mg tablet', NULL, NULL, 3.53, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1884, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Levodropropizine 100ml syrup', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1885, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Levofloxacin 500mg tablet', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1886, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Levofloxacin 5mg/ml 100ml infusion', NULL, NULL, 210, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1887, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Levofloxacin 750mg tablet', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1888, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Levonorgesterol 150mcg or2 tablets of 
levonorgesterol 75mg tablet/capsule', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1889, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lidocaine 15% topical (spray)aerosol 100gm', NULL, NULL, 350, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1890, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lidocaine 2% , 50ml injection,vial', NULL, NULL, 85, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1891, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lidocaine 2% jelly 30g', NULL, NULL, 55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1892, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lidocaine 5% heavy 2ml injection, amp', NULL, NULL, 49, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1893, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lignocaine & neomycin ear drops', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1894, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lignocaine 30 ml,1%with or without adrenaline , 2%w/v injectio', NULL, NULL, 39, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1895, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Linagliptin 2.5mg tablet', NULL, NULL, 9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1896, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Linagliptin 5mg tablet', NULL, NULL, 16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1897, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lithium carbonate 300 mg tablet', NULL, NULL, 2.48, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1898, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lithium carbonate 450 mg tablet', NULL, NULL, 3.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1899, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Liver tonic 450ml', NULL, NULL, 246, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1900, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Loratadine 10mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1901, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lorazepam 1mg tablet/capsule', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1902, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lorazepam 2mg tablet/capsule', NULL, NULL, 2.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1903, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Lorazepam injection 2mg/ml 2ml', NULL, NULL, 29, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1904, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'L-ornithine l- aspartate injection,10ml', NULL, NULL, 454.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1905, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'L-ornithine l- aspartate tablet', NULL, NULL, 19.52, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1906, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Losartan 25mg tablet/capsule', NULL, NULL, 4.41, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1907, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Losartan 50mg tablet/capsule', NULL, NULL, 7.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1908, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Losartan potassium & amlodipine 27.5mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1909, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Losartan potassium & amlodipine 50mg tablet', NULL, NULL, 9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1910, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Losartan potassium & amlodipine 55mg tablet', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1911, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Losartan potassium 25mg+ hychlorothiazide 12.5mg tablet', NULL, NULL, 9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1912, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Losartan potassium 50 mg+hydrochlorthiazide25mg tablet ', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1913, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Losartan potassium 50mg+ hychlorothiazide 12.5mg tablet ', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1914, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Magaldrate +simethicone 170ml suspension ', NULL, NULL, 95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1915, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Magnesium hydroxide +aluminium hydroxide 170ml suspension ', NULL, NULL, 80.01, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1916, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N' Magnesium sulphateinjection,50%,2ml ', NULL, NULL, 16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1917, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Magnesium trisilicate mixture 500 ml ', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1918, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mannitol 20% 100ml ,injection ', NULL, NULL, 85, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1919, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Measles, mumps, rubella vaccine(mmr),1 amp injection ', NULL, NULL, 152.17, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1920, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mebendazole 100mg tablet ', NULL, NULL, 27.42, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1921, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mebendazole syp ', NULL, NULL, 36.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1922, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mebeverine hydrochloride 135mg tablet', NULL, NULL, 8.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1923, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mecobalamin 1500mg tablet ', NULL, NULL, 18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1924, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mecobalamin 500mg tablet ', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1925, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Medroxy progesterone acetate,10mg tablet ', NULL, NULL, 9.69, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1926, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mefenamic acid,250mg tablet ', NULL, NULL, 2.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1927, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mefenamic acid,500mg tablet ', NULL, NULL, 3.32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1928, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Megestrol acetate 40mg tablet', NULL, NULL, 33.44, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1929, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Melphalan 2mg tablet/capsule ', NULL, NULL, 191.73, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1930, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Melphalan 5mg tablet/capsule ', NULL, NULL, 321.63, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1931, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Memantine 5mg', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1932, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Meningitis A+C injection ', NULL, NULL, 1475.32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1933, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mensa 200mg injection/ml', NULL, NULL, 43.41, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1934, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Menthol and methyl salicylate cream', NULL, NULL, 205, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1935, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mephentermine sulphate 300mg, 10ml ,injection', NULL, NULL, 322.62, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1936, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mephentiramine 30mg/1ml 10ml,injection', NULL, NULL, 320, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1937, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mercaptopurine 50mg tablet', NULL, NULL, 15.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1938, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Meropenem 1g injection', NULL, NULL, 1150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1939, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Meropenem 500mg injection', NULL, NULL, 805, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1940, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mesalamine 400mg tablet', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1941, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mesalamine extended release 1.2g tablet', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1942, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metformin 1000mg tablet/capsule', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1943, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metformin 500 mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1944, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metformin 850 mg tablet', NULL, NULL, 3.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1945, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metformin HCL SR 1000mg+Glimpiride 1mg tablet', NULL, NULL, 10.56, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1946, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metformin HCL SR 1000mg+Glimpiride 2mg tablet', NULL, NULL, 13.36, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1947, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metformin500mg+Glimepiride 2mg, tablet', NULL, NULL, 12.52, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1948, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metformine 500mg + Glimepiride 1mg, tablet', NULL, NULL, 7.1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1949, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methotrexate 2.5mg tablet', NULL, NULL, 8.34, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1950, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methotrexate 500mg injection', NULL, NULL, 917, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1951, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methotrexate 50mg/ml injection', NULL, NULL, 58.62, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1952, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methotrexate 5mg tablet', NULL, NULL, 11.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1953, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methotrexate 5mg tablet', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1954, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methyl pred.acetate 40mg/1ml injection', NULL, NULL, 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1955, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methyl pred.acetate 80mg/2ml injection', NULL, NULL, 145, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1956, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methyl pred.sod.succinate 500mg injection vial', NULL, NULL, 855, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1957, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methyl pred.sod.succinate.1g injection vial', NULL, NULL, 1405, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1958, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methylcobalamin 1500mcg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1959, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methylcobalamin 500mcg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1960, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methyldopa 250mg tablet', NULL, NULL, 2.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1961, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methyldopa 500mg tablet', NULL, NULL, 4.1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1962, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Methylprednisolone 4mg tablet', NULL, NULL, 5.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1963, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metoclopramide 10mg tablet', NULL, NULL, 1.84, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1964, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metoclopramide 10mg/2ml injection amp', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1965, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metoprolol 12.5mg tablet/capsule', NULL, NULL, 2.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1966, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metoprolol 25mg tablet/capsule', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1967, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metoprolol 50mg tablet/capsule', NULL, NULL, 5.3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1968, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metoprolol 5mg injection', NULL, NULL, 28, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1969, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N' Metoprolol succinate xl 12.5mg tablet', NULL, NULL, 5.04, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1970, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metoprolol succinate xl 25mg tablet', NULL, NULL, 7.21, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1971, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metoprolol succinate xl50mg tablet', NULL, NULL, 12.3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1972, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metoprolol xl 100mg tablet', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1973, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metronidazole +clotrimazole (8 tablet/pack)', NULL, NULL, 105, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1974, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metronidazole 100mg + Diloxanide furoate 125mg syrup,5ml', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1975, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metronidazole 200 mg/5ml,60ml suspension', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1976, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metronidazole 200mg tablet', NULL, NULL, 1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1977, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metronidazole 400mg + Diloxanide furoate 500mg ,tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1978, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metronidazole 400mg tablet', NULL, NULL, 2.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1979, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metronidazole 500 mg/100ml infusion', NULL, NULL, 34.85, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1980, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metronidazole diloxanide furoate suspension ,100mg/5ml', NULL, NULL, 55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1981, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Metronidazole+Clotrimazole+Lacticacid bacillus pessary', NULL, NULL, 85, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1982, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Miconazole cream 15 gm', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1983, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Midazolam 5mg/5ml injection', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1984, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Milk of magnesia 170 ml', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1985, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mirtazapine 30mg tablet', NULL, NULL, 24, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1986, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mirtazepine 15mg tablet', NULL, NULL, 12.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1987, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mirtazepine 7.5mg tablet', NULL, NULL, 6.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1988, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mitomycin C 10mg injection', NULL, NULL, 702.35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1989, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mometasone furoate 0.1% ointment 15gm', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1990, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mometasone nasal spray', NULL, NULL, 493.1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1991, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Montelukast sodium 10mg tablet', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1992, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Montelukast sodium 5mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1993, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Morphine 10 mg SR tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1994, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Morphine 10mg amp injection', NULL, NULL, 95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1995, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Morphine 10mg tablet', NULL, NULL, 4.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1996, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Morphine 15mginjection', NULL, NULL, 150.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1997, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Moxifloxacin 0.5%w/v,10ml eye drop', NULL, NULL, 100.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1998, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Moxifloxacin 400mg tablet', NULL, NULL, 9.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (1999, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Moxifloxacin 400mg/100ml ,injection', NULL, NULL, 352, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2000, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mupirocin ointment 5gm', NULL, NULL, 105, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2001, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mycophenolate Mofetil 250mg tablet', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2002, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Mycophenolate Mofetil 500mg tablet', NULL, NULL, 170, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2003, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'N-acetyl cysteine 600mg', NULL, NULL, 32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2004, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Naloxone adult 400mcg/1ml injection amp', NULL, NULL, 135, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2005, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Naltrexone 50mg tablet', NULL, NULL, 95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2006, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Naproxen ,60ml suspension', NULL, NULL, 27.52, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2007, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Naproxen 250mg tablet', NULL, NULL, 3.35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2008, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Naproxen 500mg tablet', NULL, NULL, 5.55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2009, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Naproxen SR 750mg tablet', NULL, NULL, 6.95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2010, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nasal saline drops', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2011, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Natamycin 5% eye /ear drop', NULL, NULL, 168, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2012, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nebivolol 2.5mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2013, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nebivolol 5mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2014, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Neomycin 0.5%w/w+ Benzalkolium chloride 0.02%
w/v+ Betametasone 0.1%w/v+ Thermosal 
0.005%w/w,5ml e/e drop', NULL, NULL, 15.3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2015, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Neomycin skin ointment15 gm', NULL, NULL, 31, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2016, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Neomycin+Polymyxin b+ Bacitracin powder 10gm', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2017, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Neomycin+Polymyxin b+Bacitracin skin ointment 5gm ', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2018, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Neostigmin 2.5mg/5 ml amp injection ', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2019, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Niclosamide 500mg tablet', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2020, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nifedipine 10mg capsule ', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2021, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nifedipine 5mg capsule ', NULL, NULL, 1.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2022, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nimesulide 100mg tablet/capsule', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2023, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nitrofurantion 100mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2024, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nitrofurantoin 50 mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2025, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nitroglycerin 2.6mg(25 tablets/bottle)', NULL, NULL, 214.72, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2026, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nitroglycerin 25mg/5ml injection', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2027, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nitroglycerin ointment', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2028, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nitroprusside sodium 50gm injection', NULL, NULL, 235, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2029, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Noradrenaline 2mg/2ml injection', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2030, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Norethisterone 5 mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2031, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Norfloxacin 0.3%w/v +Benzalkolium chloride 0.01%w/v e/e drop', NULL, NULL, 22.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2032, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Norfloxacin 400mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2033, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Norfloxacin 5ml e/e drop', NULL, NULL, 28, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2034, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Normal saline (sod. Cl 0.9%) 100ml plastic', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2035, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Normal saline 1000ml plastic (nipple head)', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2036, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Normal saline 1000ml plastic euro head', NULL, NULL, 73, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2037, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Normal saline 500/540ml glass bottle', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2038, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Normal saline 500/540ml plastic euro head', NULL, NULL, 53, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2039, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nystatin suspension,30ml', NULL, NULL, 90, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2040, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Octreotide 100 mcg injection', NULL, NULL, 850, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2041, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ofloxacin 0.3%+Dexamethasone 0.1%,10ml e/e drop', NULL, NULL, 55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2042, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ofloxacin 100 mg DT', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2043, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ofloxacin 200mg tablet', NULL, NULL, 8.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2044, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ofloxacin 200mg/100ml injection', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2045, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ofloxacin 400mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2046, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ofloxacin 50mg/5ml ,30ml suspension', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2047, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ofloxacin 5ml e/e drop', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2048, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Olanzapine 10mg tablet', NULL, NULL, 9.61, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2049, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Olanzapine 2.5mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2050, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Olanzapine 5mg tablet', NULL, NULL, 5.22, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2051, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Olanzapine 7.5mg tablet', NULL, NULL, 6.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2052, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Olmesartan 20mg', NULL, NULL, 14.96, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2053, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Olmesartan 40mg', NULL, NULL, 24.96, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2054, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Omeprazole 20mg capsule', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2055, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Omeprazoleinjection 40mg,vial', NULL, NULL, 48, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2056, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ondansetron 2mg/5ml ,30ml syrup', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2057, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ondansetron 4mg injection', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2058, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ondansetron 4mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2059, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ondansetron 8 mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2060, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ondansetron 8mg injection', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2061, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ornidazole 500mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2062, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ornidazole 500mg/100ml iv', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2063, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Oxaliplatin 50mg/vial injection', NULL, NULL, 4035.86, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2064, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Oxcarbazepine 150mg tablet', NULL, NULL, 8.16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2065, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Oxybutinin 2.5mg tablet', NULL, NULL, 9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2066, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Oxybutinin 5mg tablet', NULL, NULL, 17, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2067, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Oxymetazoline 0.1 %, 5 ml nasal drop', NULL, NULL, 53.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2068, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Oxymetazoline HCL,peadiatric nasal drops 0.025% 10ml', NULL, NULL, 79, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2069, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Oxytocin 5 iu injection', NULL, NULL, 31, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2070, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paclitaxel 30mg/5ml injection', NULL, NULL, 516.18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2071, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paclitaxel injection 100mg', NULL, NULL, 5910, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2072, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paclitaxel injection 260mg', NULL, NULL, 16894, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2073, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paclitaxel nanoparticle injection 100mg', NULL, NULL, 13920, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2074, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paclitaxel nanoparticle injection 300mg', NULL, NULL, 31320, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2075, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paclitaxel nanoparticle injection 30mg', NULL, NULL, 5800, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2076, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pantoprazole 40mg injection', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2077, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pantoprazole 40mg tablet/capsule', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2078, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol +Phenylephedrine+ Chlorpheniramine maleate ,paed.syrup', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2079, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol 125 mg / 5 ml,60 ml suspension', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2080, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol 150 mg / ml,2 ml injection', NULL, NULL, 18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2081, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol 300mg/2ml injection', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2082, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol 500 mg tablet', NULL, NULL, 1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2083, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol 500mg dispersible tablet', NULL, NULL, 1.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2084, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol 500mg+codeine 10mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2085, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol injection 1gm/100ml', NULL, NULL, 250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2086, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol suppository.125 mg', NULL, NULL, 14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2087, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol+caffeine tablet', NULL, NULL, 3.79, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2088, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol+Phenylephrine+Chlorpheniramine 100ml ,Adult syrup', NULL, NULL, 91, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2089, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol+Phenylephrine+Chlorpheniramine tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2090, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol100mg/ml drops', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2091, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pegfilgrastim injection 6mg', NULL, NULL, 14655, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2092, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pemetrexate 100mg injection', NULL, NULL, 6760, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2093, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pemetrexate 500mg injection', NULL, NULL, 27310, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2094, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Penicillim g 10 lac iu tablet', NULL, NULL, 12.65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2095, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Penicillin g 400,000 tablet', NULL, NULL, 0.38, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2096, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Penicillin g 500,000 injection', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2097, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Penicillin g 800,000 tablet', NULL, NULL, 0.48, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2098, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N' Penicillin v 250mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2099, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pentoxifylline 400mg tablet', NULL, NULL, 3.63, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2100, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Permethin 30gm/5%w/v solution', NULL, NULL, 176, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2101, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pethidine 100mg ,amp injection', NULL, NULL, 145.35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2102, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pethidine 50 mg/1ml,amp injection', NULL, NULL, 105, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2103, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pheniramine 1mg tablet', NULL, NULL, 0.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2104, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pheniramine 22.75 mg / ml, 2 ml injection', NULL, NULL, 6.14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2105, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pheniramine 25mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2106, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Phenobarbitone 30 mg tablet', NULL, NULL, 2.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2107, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Phenobarbitone 60 mg tablet', NULL, NULL, 3.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2108, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Phenoxymethyl penicillin 250mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2109, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Phenylepinephrine hydrochloride ip 0.12 w/v % 
+Naphazoline HCL usp 0.05%+Menthol 0.005 % w/v
 +Camphor 0.01 w/v %,10ml eye drop', NULL, NULL, 106, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2110, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Phenytoin 100mg tablet', NULL, NULL, 1.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2111, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Phenytoin 300mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2112, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Phenytoin 50mg tablet', NULL, NULL, 1.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2113, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Phenytoin 50mg/ml 2ml amp injection', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2114, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Phosphate solution 1 mmol/ml, 100 ml', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2115, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pilocarpine 2%,5ml eye drop', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2116, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pioglitazone 15mg tablet/capsule', NULL, NULL, 6.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2117, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pioglitazone 30mg tablet/capsule', NULL, NULL, 10.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2118, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Piperacillin 4.5gm injection', NULL, NULL, 310, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2119, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Piperacillin+Tazobactam 2.25 g, injection', NULL, NULL, 234.26, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2120, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Piperazine citrate 30ml syrup', NULL, NULL, 23, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2121, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pneumococcal vaccine 13s injection', NULL, NULL, 6000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2122, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Podophyllin tincture benzoin,10ml solution', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2123, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Polymicin b sulphate usp 5000units+Becitracin
zinc susp 400units+Neomycin sulphate ip 3400units,
5gm ointment
 ', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2124, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Polymxin B 5gm ointment', NULL, NULL, 31, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2125, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Polyvinyl alcohol 1.4%+Povidone 0.6% eye drop', NULL, NULL, 102, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2126, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Polyvinyl alcohol, Povidone and Chlorbutol 10ml eye drop', NULL, NULL, 101.76, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2127, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Potassium chloride 20meq 10ml, amp injection', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2128, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Potassium chloride mixture 150 ml', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2129, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Potassium citrate mixture 150 ml', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2130, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Potassium permanganate 30 gm', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2131, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Povidone iodine 5 % solution, 50 ml solution', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2132, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Povidone iodine gargle 1% (100ml)', NULL, NULL, 104, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2133, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Povidone iodine ointment 15gm', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2134, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Povidone iodine vaginal pessary', NULL, NULL, 165, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2135, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Povidone polyvinyl eye drops 10ml', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2136, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pralidoxim sodium 500mg injection', NULL, NULL, 255, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2137, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Praziquantel 150mg (per tablet) tablet', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2138, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Praziquantel 600mg (per tablet) tablet', NULL, NULL, 160, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2139, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin b1 b6 b12 injection 2ml', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2140, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin B-complex ,syrup', NULL, NULL, 115, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2141, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin B-complex capsule', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2142, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin E ,400mg capsule', NULL, NULL, 2.38, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2143, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin K[menadione]10mg/1ml injection', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2144, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prazosin 1mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2145, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prazosin 2.5mg tablet', NULL, NULL, 10.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2146, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prazosin extended release tablet 5mg', NULL, NULL, 16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2147, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pre and probiotic capsule', NULL, NULL, 15.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2148, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pre and probiotic dry/syrup', NULL, NULL, 151, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2149, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prednisolone 10 mg tablet', NULL, NULL, 3.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2150, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prednisolone 20mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2151, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prednisolone 5mg tablet', NULL, NULL, 2.14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2152, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prednisolone acetate 0.1% eye drops', NULL, NULL, 127, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2153, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pregabalin 150mg capsule', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2154, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pregabalin 75mg capsule', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2155, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Probenecid 500mg tablet', NULL, NULL, 6.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2156, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Procarbazine 50mg tablet/capsule', NULL, NULL, 55.89, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2157, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prochlorperazine 12.5mg injection amp', NULL, NULL, 24, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2158, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prochlorperazine 5mg tablet', NULL, NULL, 2.1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2159, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Progesterone 200mg cap', NULL, NULL, 48.7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2160, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Promethazine HCL 25 mg tablet', NULL, NULL, 2.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2161, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Promethazine injection 2 ml amp', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2162, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Promethazine syrup 100ml.', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2163, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Propanolol hydrochloride 10mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2164, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Propanolol hydrochloride 20mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2165, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Propanolol hydrochloride 40mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2166, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Propofol 1% 20ml injection', NULL, NULL, 210, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2167, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Propranolol 1mg/1ml injection', NULL, NULL, 210, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2168, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Protamine sulphate 50mg injection', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2169, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Psyllium husk (ispaghula)100g powder', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2170, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pushyanug churna 100gm', NULL, NULL, 128, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2171, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pyridoxine 100mg(vitamin b6) tablet', NULL, NULL, 4.3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2172, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pyridoxine 10mg(vitamin b6) tablet', NULL, NULL, 1.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2173, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pyridoxine 40mg(vitamin b6) tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2174, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Pyridoxine 60mg(vitamin b6) tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2175, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Quetiapine 100mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2176, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Quetiapine 25mg tablet', NULL, NULL, 2.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2177, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Quetiapine 50mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2178, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Quinine 300mg/5ml ml injection amp', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2179, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rabeprazole 20mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2180, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rabies vaccine ,amp injection', NULL, NULL, 540, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2181, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ramipril 2.5mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2182, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ramipril 2.5mg+hydrochlorthiazide 12.5mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2183, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ramipril 5mg tablet', NULL, NULL, 9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2184, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ramipril 5mg+hydrochlorthiazide 12.5mg tablet', NULL, NULL, 13, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2185, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ranitidine 150 mg tablet', NULL, NULL, 1.19, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2186, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ranitidine 25 mg / ml injection', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2187, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ranitidine 50 mg/2 ml injection amp', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2188, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rocuronium bromide 50mg/5ml', NULL, NULL, 440, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2189, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rehydration solutions(ors)/ltr sachet(powder)', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2190, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ringer''s lactate 1000 ml plastic euro head', NULL, NULL, 83, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2191, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ringer''s lactate 1000 ml plastic nipple head', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2192, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ringer''s lactate 500/540/ml glass bottle', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2193, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ringer''s lactate 500/540/ml plastic euro head', NULL, NULL, 63, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2194, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Risperidone 1mg tablet', NULL, NULL, 2.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2195, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Risperidone 2mg tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2196, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Risperidone 3mg tablet', NULL, NULL, 4.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2197, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Risperidone 4mg tablet', NULL, NULL, 7.36, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2198, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rituximab 100mg injection', NULL, NULL, 10192, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2199, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rituximab 500mg injection', NULL, NULL, 51966, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2200, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rivastigmine 1.5mg capsule', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2201, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rosuvastatin 10mg tablet', NULL, NULL, 19, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2202, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rosuvastatin 20mg tablet', NULL, NULL, 40.32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2203, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rosuvastatin 5mg tablet', NULL, NULL, 12.48, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2204, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Rotahaler', NULL, NULL, 145, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2205, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Roxithromicin 150mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2206, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol +Bromohexine ,100ml,expectorant', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2207, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol 2mg tablet', NULL, NULL, 0.51, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2208, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol 4 mg tablet', NULL, NULL, 1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2209, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol inhaler [100 mcg/dose]', NULL, NULL, 170, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2210, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol neb solution, 5 mg/5 ml', NULL, NULL, 24, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2211, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol respiratory solution', NULL, NULL, 17.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2212, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol respiratory solution in respule', NULL, NULL, 6.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2213, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol SA 8mg tablet (i.e.albuterol extended release)', NULL, NULL, 1.35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2214, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol sulphate 200mcg r/c (30 cap)', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2215, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol sustained release tablet 8mg/tablet', NULL, NULL, 1.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2216, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salbutamol,100ml syrup', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2217, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salicylic acid ointment 10% 25gm', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2218, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salicylic acid ointment 5% 25gm', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2219, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salisalic acid ointment 20% 25gm', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2220, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salisalic acid ointment 40% 25gm', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2221, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salmetorol inhalar 25mcg/puff,200 puff', NULL, NULL, 220, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2222, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salmetorol rotacap 50mcg 30 caps', NULL, NULL, 110, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2223, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salmetrol + fluticasone 250mcg inhaler/mdi', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2224, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Salmetrol 50mcg + fluticasone 250mcg r/c', NULL, NULL, 340, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2225, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'S-amlodipine besilate 2.5mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2226, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Secnidazole 1gm tablet', NULL, NULL, 36, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2227, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Serratiopeptidase 10mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2228, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Serratiopeptidase 5mg tablet', NULL, NULL, 305, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2229, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sertaconazole nitrate 2% ,15gm cream', NULL, NULL, 180, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2230, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sertraline hydrochloride 100mg tablet', NULL, NULL, 13.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2231, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sertraline hydrochloride 25mg tablet', NULL, NULL, 5.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2232, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sertraline hydrochloride 50mg tabet', NULL, NULL, 9.7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2233, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sildenafil citrate 25mg tablet', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2234, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Silver nitrate 1% solution 1ml', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2235, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sisomicin cream 15g', NULL, NULL, 40, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2236, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sitagliptin 100mg tablet', NULL, NULL, 31.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2237, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sitagliptin 25mg tablet', NULL, NULL, 9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2238, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sitagliptin 50mg+Metformin 1000 tablet', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2239, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sitagliptin 50mg+Metformin 850mg', NULL, NULL, 24, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2240, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sitagliptin 50mg tablet', NULL, NULL, 24.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2241, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium bicarbonate,300mg(100 tablets/bottle)', NULL, NULL, 300, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2242, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium bicarbonate,injection 7.5%(10ml)', NULL, NULL, 32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2243, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium carboxy methyl cellulose 0.5% eye drops', NULL, NULL, 252, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2244, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium chloride 500ml(normal saline) infusion', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2245, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium cromoglycate 2% eye drops', NULL, NULL, 77, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2246, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium fluoride 0.2% m/w 150 ml', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2247, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium fusidate ointment (10gm)', NULL, NULL, 120.8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2248, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium nitroprusside 50mg inj', NULL, NULL, 237.82, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2249, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium valporate 200mg tablet', NULL, NULL, 4.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2250, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium valporate 300mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2251, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium valporate 500mg tablet', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2252, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium valporate CR 200mg tablet', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2253, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium valporate CR500mg tablet', NULL, NULL, 13, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2254, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium valporate injection 100mg/5ml5ml', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2255, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium valproate 200mg /5ml 100ml syru', NULL, NULL, 95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2256, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sodium valproate CR 300mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2257, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sorafenib 200mg tablet', NULL, NULL, 400, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2258, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Spectinomycin 200gm powder', NULL, NULL, 112, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2259, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Spironolactone 100mg tablet', NULL, NULL, 15.4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2260, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Spironolactone 12.5mg tablet', NULL, NULL, 1.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2261, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Spironolactone 25mg tablet', NULL, NULL, 2.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2262, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Streptokinase 1,500,000 iu inj.vial', NULL, NULL, 3755, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2263, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Succinylcholine chloride 500mg/10 ml vial', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2264, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sucralfate suspension 500mg(200ml)', NULL, NULL, 107.18, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2265, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sucralfate tablet/ 1gm', NULL, NULL, 3.65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2266, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sulbactam+Cefoperazone 1.5mg injection', NULL, NULL, 310, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2267, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sulbactam+Cefoperazone 3 mg injection', NULL, NULL, 480, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2268, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sulphacetamide 10% eye drops,10ml drop', NULL, NULL, 13, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2269, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sulphamethoxazole+ Trimethoprim 120mg dt tablet', NULL, NULL, 1.13, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2270, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sulphamethoxazole+ Trimethoprim 480mgdt tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2271, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sulphamethoxazole+ Trimethoprim dt960mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2272, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sulphasalazine 500mg tablet', NULL, NULL, 7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2273, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sumatriptan 50mg tablet', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2274, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sumitriptan 25mg tablet', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2275, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Sunitinib 50mg tablet', NULL, NULL, 4166, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2276, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Suphacetamide 20% eye drops', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2277, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Suphacetamide 30% eye drops', NULL, NULL, 16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2278, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Calcium dobisilate 500mg tablet', NULL, NULL, 14.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2279, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Carvedilol 12.5mg tablet', NULL, NULL, 6.77, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2280, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Cinnarizine 25mg tablet', NULL, NULL, 5.27, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2281, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Frusemide 20mg tablet', NULL, NULL, 0.52, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2282, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Frusemide 40mg + Amiloride 5mg tablet', NULL, NULL, 2.22, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2283, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Nifedipine SR 20mg tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2284, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Paracetamol 500mg + Ibuprofen 400mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2285, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Prazosin xl 5mg tablet', NULL, NULL, 15.48, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2286, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Repaglimide 1mg tablet', NULL, NULL, 6.76, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2287, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Repaglimide 2mg tablet', NULL, NULL, 9.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2288, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tacrolimus 0.5mg tablet', NULL, NULL, 32, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2289, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tacrolimus 1mg tablet', NULL, NULL, 55, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2290, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tacromus ointment 0.03% 10gm', NULL, NULL, 225, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2291, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tamoxifen 10mg tablet/capsule', NULL, NULL, 4.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2292, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tamoxifen 20mg tablet/capsule', NULL, NULL, 7.68, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2293, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tamsulosin hydrochloride 200mcg capsule', NULL, NULL, 7.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2294, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N' Tamsulosin hydrochloride 400mcg capsule', NULL, NULL, 13.755, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2295, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Telmisartan 20mg tablet', NULL, NULL, 5.79, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2296, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N' Telmisartan 40mg +hydrochlorothiazide 12.5mg tablet', NULL, NULL, 15.76, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2297, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Telmisartan 40mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2298, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Telmisartan 80mg tablet', NULL, NULL, 19.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2299, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Temozolamide 100mg tablet', NULL, NULL, 2960, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2300, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Temozolamide 250mg tablet', NULL, NULL, 6350, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2301, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Terazosin hydrochloride 2mg tablet', NULL, NULL, 12, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2302, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Terbinafine HCL 250mg tablet', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2303, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Terbinafine HCL cream 1% 10gm', NULL, NULL, 125, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2304, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Terbutaline+Bromhexine 100ml syrup', NULL, NULL, 130, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2305, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tetanus toxoid 0.5 ml amp', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2306, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tetracycline 250 mg capsule', NULL, NULL, 2.76, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2307, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tetracycline 500mg capsule', NULL, NULL, 4.74, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2308, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tetracycline eye ointment 1% ointment', NULL, NULL, 27, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2309, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Theophylline 400mg tablet', NULL, NULL, 14.25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2310, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Theophylline150mg tablet', NULL, NULL, 1.1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2311, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Thephylline +Etophylline (2ml )injection', NULL, NULL, 7.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2312, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Thiamine (vitamin b1) tablet', NULL, NULL, 1, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2313, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Thiopentone 1gm injection', NULL, NULL, 125, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2314, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Thyroxin sodium 0.025mg tablet(100 tablets)', NULL, NULL, 175, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2315, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Thyroxin sodium 0.05mg tablet(100 tablets)', NULL, NULL, 180, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2316, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Thyroxin sodium 0.1mg tablet(100 tablets)', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2317, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Thyroxin sodium 0.75mg tablet(100 tablets)', NULL, NULL, 190, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2318, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Timolol maleate 2.5mg/5ml eye drop', NULL, NULL, 35.88, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2319, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Timolol maleate 5mg/5ml eye drop', NULL, NULL, 61.39, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2320, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tinidazole 300mg tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2321, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tinidazole 500 mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2322, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tinidazole infusion 400ml', NULL, NULL, 65, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2323, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tiotropium 18mcg rotacaps 15caps', NULL, NULL, 350, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2324, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tizanidine 2mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2325, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tizanidine 4mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2326, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tobramycin sulphate 0.3%w/v +Dexamethasone 
sodium phosphate 0.1%w/v eye drop', NULL, NULL, 42, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2327, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tobramycine 1% eye drops', NULL, NULL, 82, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2328, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Topiramate 100mg tablet', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2329, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Topiramate 25mg tablet', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2330, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Torsemide 100mg tablet', NULL, NULL, 36, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2331, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Torsemide 10mg tablet', NULL, NULL, 4, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2332, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Torsemide 20mg injection', NULL, NULL, 30.04, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2333, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Torsemide 20mg tablet', NULL, NULL, 8, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2334, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tramadol 37.5+Paracetamol 325mg tablet', NULL, NULL, 14, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2335, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tramadol 50mg,amp injection', NULL, NULL, 28.56, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2336, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tramadol 50mg capsule', NULL, NULL, 6.78, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2337, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tramadol HCL 100mg/2ml ,injection', NULL, NULL, 35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2338, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tranexamic acid 250mg tablet', NULL, NULL, 6.7, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2339, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N' Tranexamic acid 500mg injection', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2340, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tranexamic acid 500mg tablet', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2341, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tretinoin cream 0.025% 20gm', NULL, NULL, 115, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2342, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tretinoin cream 0.05% 20gm', NULL, NULL, 135, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2343, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Triamcinolone 15g ointment', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2344, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Triamcinolone acetonide 10mg/ml injection', NULL, NULL, 57.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2345, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Triamcinolone acetonide 40mg/ml injection', NULL, NULL, 156.9, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2346, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Triamsilone 40 mg injection', NULL, NULL, 144, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2347, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Trifluoperazine 5mg+trihexyphenidyl 2mg,tablet', NULL, NULL, 2.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2348, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Trihexiphenidyl 1.5mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2349, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Trihexiphenidyl 2mg tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2350, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Trihexiphenidyl 5mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2351, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Trimetazidin 20mg tablet', NULL, NULL, 13, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2352, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tropicamide + phenylephrine eye drop', NULL, NULL, 94, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2353, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Tropicamide 1%,5ml eye drop', NULL, NULL, 91.26, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2354, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Typhoid vaccine injection', NULL, NULL, 480, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2355, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Urinary alkalizer (including ayurvedic) syrup 200ml', NULL, NULL, 320, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2356, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Urinary alkalizer (including ayurvedic) tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2357, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ursodeosycholic acid 150mg tablet', NULL, NULL, 18.33, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2358, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Ursodeosycholic acid 300mg tablet', NULL, NULL, 31.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2359, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Valethamate 8mg injection amp', NULL, NULL, 28, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2360, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Valproic acid 125mg tablet', NULL, NULL, 3.96, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2361, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Valproic acid 250mg tablet', NULL, NULL, 8.16, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2362, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Valproic acid 500mg tablet', NULL, NULL, 14.56, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2363, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vancomycin 500 mg injection', NULL, NULL, 612, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2364, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vaseline 25g,jar cream', NULL, NULL, 23.2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2365, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vasopressin 20units,injection(1ml)', NULL, NULL, 293.38, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2366, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vecuronium brom. 4mg/1ml amp injection', NULL, NULL, 160, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2367, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Verapamil 5mg/2ml amp injection', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2368, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Verapamil hydrochloride 120 mg SR', NULL, NULL, 4.66, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2369, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vinblastin 10mg/pack injection', NULL, NULL, 503.31, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2370, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vincristin 1mg/ml injection', NULL, NULL, 89.39, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2371, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin b complex tablet', NULL, NULL, 1.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2372, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin b1 [thiamine] 75 mg tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2373, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin b1+b6+b12 tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2374, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin b-complex injection', NULL, NULL, 6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2375, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin c(ascorbic acid) 15ml drop', NULL, NULL, 21, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2376, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin c(ascorbic acid) 500mg tablet', NULL, NULL, 2.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2377, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Vitamin k 1 (phytomenadione)10mg/1ml injection', NULL, NULL, 210, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2378, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Voglibose 0.3 mg tablet', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2379, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Voglibose 0.2mg tablet', NULL, NULL, 11, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2380, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Warfarin 1mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2381, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Warfarin 2mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2382, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Warfarin 3mg tablet', NULL, NULL, 3.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2383, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Warfarin 5mg tablet', NULL, NULL, 4.35, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2384, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Wart paint (salicylic acid) 10 ml', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2385, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Wax removing drops 10ml (Benzocaine+ Chlorbutol+ Paradichlorobenzene + Turpentine oil', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2386, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Yellow fever vaccine, amp injection', NULL, NULL, 2960, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2387, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Zinc acetate solution 1ml', NULL, NULL, 0.5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2388, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Zinc oxide ointment 30gm', NULL, NULL, 50, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2389, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Zinc sulphate 10mg tablet', NULL, NULL, 2, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2390, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Zinc sulphate 20mg tablet', NULL, NULL, 3, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2391, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Zinc sulphate solution 40 ml', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2392, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Zolondronic acid injection 4mg', NULL, NULL, 3448, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2393, NULL, N'Pharmacy', NULL, N'Allopathic Medicine', NULL, N'Zolpidem 10mg tablet', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2394, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'AvipattikarChurna', NULL, N'100gm', 185, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2395, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'AshwagandhaChurna', NULL, N'100gm', 255, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2396, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'Ashokarista', NULL, N'450ml', 160, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2397, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'Abhyarista', NULL, N'4500ml', 175, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2398, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'Bilwadichurna', NULL, N'100gm', 250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2399, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'ChandraPravaVati', NULL, N'25gm', 175, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2400, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'ChitrakHaritaki', NULL, N'90gm', 195, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2401, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'ChandaNasichurna', NULL, N'100gm', 250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2402, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'Dashmularista', NULL, N'450ml', 185, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2403, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'HingWastakhurna', NULL, N'60gm', 170, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2404, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'Jatyadi Tail', NULL, N'100ml', 243, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2405, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'KaamDudharas', NULL, N'5gm', 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2406, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'Laxmi Vilas Ras', NULL, N'10gm', 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2407, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'Mahayog Raj Gugggul', NULL, N'10gm', 160, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2408, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'MahasankhaVati', NULL, N'20gm', 140, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2409, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'Mahanaran Tail', NULL, N'100ml', 2250, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2410, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'PushyanugChurna', NULL, N'100gm', 280, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2411, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'SirsuladhiBajraRas', NULL, N'10gm', 120, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2412, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'SarpandhandhaVati', NULL, N'25gm', 160, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2413, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'SitopaladiChurna', NULL, N'100gm', 180, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2414, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'SankhaBhasma', NULL, N'10gm', 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2415, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'SutsekharRas', NULL, N'10gm', 190, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2416, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'SuddhaSilajeet', NULL, N'50gm', 180, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2417, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'Sadbindu Tail', NULL, N'300ml', 160, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2418, NULL, N'Pharmacy', NULL, N'Ayurbedic Medicine', NULL, N'TrifalaChurna', NULL, N'100gm', 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2419, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'3 way connector (3-way cannula)', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2420, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Ankle binder - large/medium/small/XL', NULL, NULL, 310, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2421, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Anti-embolism above knee stocking large/medium', NULL, NULL, 1360, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2422, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Arm sling strap', NULL, NULL, 155, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2423, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Arm sling-large/medium/small', NULL, NULL, 245, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2424, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Cannula fixator  large', NULL, NULL, 25, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2425, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Cannula fixator  medium', NULL, NULL, 20, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2426, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Cannula fixator  small', NULL, NULL, 15, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2427, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Cervical collar soft- XL/L/M/S', NULL, NULL, 200, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2428, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Cervical hard collar', NULL, NULL, 950, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2429, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Cotton roll(small)', NULL, NULL, 30, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2430, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Crepe bandage - 4"', NULL, NULL, 100, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2431, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Crepe bandage - 6"', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2432, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Crutches', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2433, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Elbow splint', NULL, NULL, 110, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2434, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Extended forearm splint- XL/L/M/S', NULL, NULL, 210, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2435, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Finger splint all size', NULL, NULL, 75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2436, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Frog splint- L/M/S', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2437, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Hearing aid', NULL, NULL, NULL, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2438, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Insulin needle 26 guage', NULL, NULL, 2.6, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2439, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'IV cannula', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2440, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'IV Cannula + IV set', NULL, NULL, 95, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2441, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Knee brace long- XL/L/M/S', NULL, NULL, 620, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2442, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Knee cap Large', NULL, NULL, 210, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2443, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Knee cap Small', NULL, NULL, 125, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2444, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Lumber corset', NULL, NULL, 550, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2445, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Lumber support belt', NULL, NULL, 850, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2446, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Pessary per unit', NULL, NULL, 150, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2447, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Plaster of paris -4 "', NULL, NULL, 60, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2448, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Plaster of paris -6"', NULL, NULL, 80, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2449, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Shoulder immobilizer- XL/large/medium/small', NULL, NULL, 350, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2450, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Spectacles', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2451, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Supporting walking cane/ white stick', NULL, NULL, 1000, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2452, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Syringe (disposable) 2.5ml', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2453, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Syringe (disposable) 5 ml', NULL, NULL, 5, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2454, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Syringes- 10 cc disposable', NULL, NULL, 10, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2455, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Syringes- insulin(glass)', NULL, NULL, 70, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2456, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Water for inj. 1 liter', NULL, NULL, 73, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2457, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Water for inj. 5 ml amp', NULL, NULL, 2.75, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2458, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Water for inj. 500ml', NULL, NULL, 45, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2459, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Wrist and forearm splint', NULL, NULL, 480, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2460, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Wrist splint right/left – large', NULL, NULL, 220, 0, NULL)
GO
INSERT [dbo].[GovtInsuranceItems] ([Sno], [DepartmentId], [DepartmentName], [ServiceDepartmentId], [ServiceDepartmentName], [ItemId], [ItemName], [ImagingTypeId], [Description], [Price], [IsPackage], [IntegrationName]) VALUES (2461, NULL, N'Pharmacy', NULL, N'Surgical Items', NULL, N'Wrist splint right/left - medium', NULL, NULL, 205, 0, NULL)
GO


---1. start: insert department and service department  from GovtInsuranceItems to [MST_Department] and [BIL_MST_ServiceDepartment]  respectively
--start: update integration name

update [GovtInsuranceItems]
set integrationname='Radiology' where DepartmentName='Radiology'
go
update [GovtInsuranceItems]
set integrationname='LAB' where DepartmentName='Lab'
go
--end: update integration name

insert into [dbo].[MST_Department] 
(DepartmentName,IsActive,IsAppointmentApplicable,CreatedBy,CreatedOn)
select distinct DepartmentName,1,0,1,GetDate() from [dbo].[GovtInsuranceItems]
where DepartmentName not in (
select distinct govtItem.DepartmentName from [dbo].[GovtInsuranceItems] govtItem
inner join [dbo].[MST_Department] dept on govtItem.DepartmentName = dept.DepartmentName
)
go
update [dbo].[BIL_MST_ServiceDepartment]
set ServiceDepartmentName='Hematology' where ServiceDepartmentName='Heamatology'
go
insert into [dbo].[BIL_MST_ServiceDepartment] 
(ServiceDepartmentName,DepartmentId,CreatedBy,CreatedOn,IsActive,IntegrationName)
select distinct govt.ServiceDepartmentName,dept.DepartmentId,1 'CreatedBy',GetDate(),1 'IsActive',govt.IntegrationName from [dbo].[GovtInsuranceItems] govt
inner join [dbo].[MST_Department] dept on govt.DepartmentName = dept.DepartmentName
where govt.ServiceDepartmentName not in (
select distinct govtItem.ServiceDepartmentName from [dbo].[GovtInsuranceItems] govtItem
inner join [dbo].[BIL_MST_ServiceDepartment] srvDept on govtItem.ServiceDepartmentName = srvDept.ServiceDepartmentName
)
go
---end: insert department and service department  from GovtInsuranceItems to [MST_Department] and [BIL_MST_ServiceDepartment]  respectively

---2.start: Update DepartmentId ,ServiceDepartmentId and IntegrationName in GovtInsuranceItems---
Update gov
Set gov.DepartmentId=dept.DepartmentId
from [dbo].GovtInsuranceItems gov, 
[dbo].[MST_Department] dept
where gov.DepartmentName = dept.DepartmentName
go
Update gov
Set gov.ServiceDepartmentId=srv.ServiceDepartmentId
from [dbo].GovtInsuranceItems gov, 
[dbo].[BIL_MST_ServiceDepartment] srv
where gov.ServiceDepartmentName = srv.ServiceDepartmentName
go

---2.End: Update DepartmentId ,ServiceDepartmentId and IntegrationName in GovtInsuranceItems---

---3. Start:  Insert Lab Items to Lab Table-----------
insert into [dbo].[LAB_LabTests]
(LabTestName,LabTestSpecimen,LabTestSpecimenSource,CreatedOn,CreatedBy,IsActive,IsValidSampling, LabSequence)
select govt.ItemName,'["NA"]' as LabTestSpecimen,'NA' as LabTestSpecimenSource,GETDATE() as CreatedOn,1 as CreatedBy,1 as IsActive,1 as IsValidSampling, 0 as LabSequence  from [dbo].[GovtInsuranceItems] govt
where govt.DepartmentName='Lab' and govt.ItemName not in (
select govtItem.ItemName from [dbo].[GovtInsuranceItems] govtItem
inner join [dbo].[LAB_LabTests] lab on govtItem.ItemName = lab.LabTestName
where govtItem.DepartmentName ='Lab'
)
go
---3. End:  Insert Lab Items to Lab Table-----------

---4. Start: Update ItemId for LabItems in [GovtInsuranceItems] table---
update govt
set govt.ItemId = lab.LabTestId
from [dbo].[GovtInsuranceItems] govt
inner join [dbo].[LAB_LabTests] lab on govt.ItemName = lab.LabTestName
where govt.DepartmentName='Lab'
go

---4. End: Update ItemId for LabItems in [GovtInsuranceItems] table---


---5. Start: Insert Imaging Type----
insert into [dbo].[RAD_MST_ImagingType]
(ImagingTypeName,CreatedBy,CreatedOn,IsActive)
select distinct govt.ServiceDepartmentName, 1 as CreatedBy ,GETDATE() as CreatedOn,1 as IsActive from [dbo].[GovtInsuranceItems] govt
where govt.DepartmentName='Radiology' and govt.ServiceDepartmentName not in
(
select distinct govtItem.ServiceDepartmentName from [dbo].[GovtInsuranceItems] govtItem
inner join [dbo].[RAD_MST_ImagingType] imgType on govtItem.ServiceDepartmentName = imgType.ImagingTypeName
where govtItem.DepartmentName='Radiology'
)
go

---5. End: Insert Imaging Type----


--6. Start: Update ImagingTypeId in [GovtInsuranceItems] --
update govt
set govt.ImagingTypeId = imgType.ImagingTypeId
from [dbo].[GovtInsuranceItems] govt
inner join [dbo].[RAD_MST_ImagingType] imgType on govt.ServiceDepartmentName = imgType.ImagingTypeName
where govt.DepartmentName='Radiology'
go

--6. End: Update ImagingTypeId in [GovtInsuranceItems] --


--7. Start: Insert into [dbo].[RAD_MST_ImagingItem]----
alter table [dbo].[RAD_MST_ImagingItem]
alter column ImagingItemName varchar(200) null
go


insert into [dbo].[RAD_MST_ImagingItem]
(ImagingTypeId,ImagingItemName,CreatedBy,CreatedOn,IsActive)
select distinct govt.ImagingTypeId, govt.ItemName, 1,GETDATE(),1 from [dbo].[GovtInsuranceItems] govt
where govt.DepartmentName='Radiology' and govt.ItemName not in
(
select distinct govtItem.ItemName from [dbo].[GovtInsuranceItems] govtItem
inner join [dbo].[RAD_MST_ImagingItem] imgItem on govtItem.ItemName = imgItem.ImagingItemName
where govtItem.DepartmentName='Radiology'
)
go


--7. End: Insert into [dbo].[RAD_MST_ImagingItem]----


--8. Start: Update ItemId of RadiologyItems in [dbo].[GovtInsuranceItems]
update govt
set govt.Itemid = imgItem.ImagingItemId
from [dbo].[GovtInsuranceItems] govt
inner join [dbo].[RAD_MST_ImagingItem] imgItem on govt.ItemName = imgItem.ImagingItemName
where govt.DepartmentName='Radiology'
go

--8. End: Update ItemId of RadiologyItems in [dbo].[GovtInsuranceItems]

--9. Start: Update IncrementalItemId for Surgical Services, Medical Services, Cancer, Surgical Items, Cardiac, Health Programs---

create Sequence Sq as int
minvalue 1
cycle;
update [dbo].[GovtInsuranceItems] set ItemId=NEXT VALUE FOR Sq where ServiceDepartmentName='Health Programs'
go
ALTER SEQUENCE Sq 
RESTART WITH 1  
update [dbo].[GovtInsuranceItems] set ItemId=NEXT VALUE FOR Sq where ServiceDepartmentName='Cardiac'
go
ALTER SEQUENCE Sq 
RESTART WITH 1  
update [dbo].[GovtInsuranceItems] set ItemId=NEXT VALUE FOR Sq where ServiceDepartmentName='Surgical Items'
go
ALTER SEQUENCE Sq 
RESTART WITH 1  
update [dbo].[GovtInsuranceItems] set ItemId=NEXT VALUE FOR Sq where ServiceDepartmentName='Cancer'
go
ALTER SEQUENCE Sq 
RESTART WITH 1  
update [dbo].[GovtInsuranceItems] set ItemId=NEXT VALUE FOR Sq where ServiceDepartmentName='Surgical Services'
go
ALTER SEQUENCE Sq 
RESTART WITH 1  
update [dbo].[GovtInsuranceItems] set ItemId=NEXT VALUE FOR Sq where ServiceDepartmentName='Medical Services'
go
ALTER SEQUENCE Sq 
RESTART WITH 1  
update [dbo].[GovtInsuranceItems] set ItemId=NEXT VALUE FOR Sq where ServiceDepartmentName='Other'
go
ALTER SEQUENCE Sq 
RESTART WITH 1  
update [dbo].[GovtInsuranceItems] set ItemId=NEXT VALUE FOR Sq where ServiceDepartmentName='Allopathic Medicine'
go
ALTER SEQUENCE Sq 
RESTART WITH 1  
update [dbo].[GovtInsuranceItems] set ItemId=NEXT VALUE FOR Sq where ServiceDepartmentName='Ayurbedic Medicine'
drop Sequence Sq
go
--9. End: Update IncrementalItemId for Surgical Services, Medical Services, Cancer, Surgical Items, Cardiac, Health Programs---

--10. Start: Update GovtPrice of [dbo].[BIL_CFG_BillItemPrice]
Update billItem
set billItem.GovtInsurancePrice = govtItem.Price, billItem.InsuranceApplicable = 1
from [dbo].[BIL_CFG_BillItemPrice] billItem
inner join [dbo].[GovtInsuranceItems] govtItem on billItem.ItemName=govtItem.ItemName
go
--10. End: Update GovtPrice of [dbo].[BIL_CFG_BillItemPrice]

--11. Start: Insert into [dbo].[BIL_CFG_BillItemPrice] table
alter table [dbo].[BIL_CFG_BillItemPrice]
alter column ItemName varchar(200) null
go

Insert into [dbo].[BIL_CFG_BillItemPrice]
(ServiceDepartmentId,ItemName,Price,ItemId,TaxApplicable,InsuranceApplicable,GovtInsurancePrice,IsInsurancePackage,CreatedBy,CreatedOn,IsActive,DiscountApplicable)
select govt.ServiceDepartmentId, govt.ItemName,govt.Price,govt.ItemId,0 'TaxApplicable', 1 'InsuranceApplicable', govt.Price 'GovtPrice', govt.IsPackage,1 'CreatedBy',GETDATE() 'CreatedOn',1 'IsActive',1 'DiscountApplicable'
from [dbo].[GovtInsuranceItems] govt
where govt.ItemName not in
(
select govtItem.ItemName
from [dbo].[BIL_CFG_BillItemPrice] itm
inner join [dbo].[GovtInsuranceItems] govtItem on itm.ItemName=govtItem.ItemName
)
go

--11. End: Insert into [dbo].[BIL_CFG_BillItemPrice] table

--12. Start: Insert into  [dbo].[BIL_CFG_Packages]
alter table [dbo].[BIL_CFG_Packages]
alter column BillingPackageName varchar(200) null
go
alter table [dbo].[BIL_CFG_Packages]
alter column Description varchar(500) null
go
Insert Into [dbo].[BIL_CFG_Packages]
(BillingPackageName,Description,TotalPrice,DiscountPercent,CreatedBy,CreatedOn,IsActive,InsuranceApplicable)
select govt.ItemName,govt.Description,govt.Price,0 'Discount Percent',1,GETDATE(),1 'IsActive',1 'InsuranceApplicable'
from [dbo].[GovtInsuranceItems]  govt
where govt.IsPackage=1
go
--12. End: Insert into  [dbo].[BIL_CFG_Packages]



--13. Start: Update Packge XML---
update BIL_CFG_BillItemPrice
set IsInsurancePackage=1
where ItemName ='Normal Delivery'
go
Update pkg
SET  [BillingItemsXML]=(
   SELECT '<root><Items><ServiceDeptId>'+ CONVERT(varchar(5),itm.ServiceDepartmentId) +'</ServiceDeptId><ItemId>'
 + CONVERT(varchar(5),itm.ItemId)  + '</ItemId>' + '<Quantity>1</Quantity></Items></root>'
 from BIL_CFG_BillItemPrice itm
 where pkg.BillingPackageName = itm.ItemName and pkg.InsuranceApplicable=1 and itm.IsInsurancePackage=1 
)
FROM [dbo].[BIL_CFG_Packages] pkg where pkg.InsuranceApplicable=1
go

 --SELECT  ServiceDepartmentId AS 'ServiceDeptId',ItemId 'ItemId', 1 as 'Quantity' 
 -- FROM BIL_CFG_BillItemPrice itm
 -- where pkg.BillingPackageName = itm.ItemName and pkg.InsuranceApplicable=1 and itm.IsInsurancePackage=1 
 -- FOR XML Path 
--13. End: Update Packge XML---

---14. Start: Update Lab TestComponentsJSON
update labItem
set LabTestComponentsJSON = '[{"Component":"'+ labItem.LabTestName +'","Range":"","RangeDescription":"","ValueType":"string","Unit":"","Method":""}]'
from [dbo].[LAB_LabTests] labItem
where labItem.LabTestComponentsJSON is null
go
---14. End: Update Lab TestComponentsJSON

---15: START: Update IsInsuranceBilling--
Alter Table BIL_TXN_BillingTransaction DISABLE TRIGGER TRG_BillToAcc_BillingTxn
GO
update BIL_TXN_BillingTransaction set IsInsuranceBilling=0 where IsInsuranceBilling is null
GO
Alter Table BIL_TXN_BillingTransaction ENABLE TRIGGER TRG_BillToAcc_BillingTxn
GO
---15: END: Update IsInsuranceBilling--

--start: sud:21Mar'19--set default display sequence of lab tests for insurance items---
Update LAB_LabTests
set DisplaySequence=1000
where DisplaySequence is null
GO
--end: sud:21Mar'19--set default display sequence of lab tests for insurance items---