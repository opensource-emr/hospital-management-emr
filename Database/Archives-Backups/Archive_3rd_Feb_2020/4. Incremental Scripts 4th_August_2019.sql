--Anish: Start: 2 Aug, 2019 Increamental for KDRC---
Insert into CORE_CFG_Parameters
values('Billing','AllowNewPatRegistrationFromBilling','true','boolean','Enabling add new patient from Billing-Search Patient Page','custom');
Go
--Anish: ENd

--START-- Yubraj 6th August 2019 --Setting route for Insurance Report and its sub-route--
--Setting Route for INS Reports -----
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Billing' and ApplicationCode='BIL');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('billing-insurancemain-reports-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-insurancemain-reports-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Billing/InsuranceMain');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
VALUES ('Reports','Billing/InsuranceMain/Reports','Reports',@permissionID,@parentRouteId,1,1,25)
GO

--Yubraj ----Setting Route for INS Total Bill Items Reports -----
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Billing' and ApplicationCode='BIL');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('billing-insurancemain-items-bill-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-insurancemain-items-bill-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Billing/InsuranceMain/Reports');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Total Bill Items','Billing/InsuranceMain/Reports/TotalItemsBill','TotalItemsBill',@permissionID,@parentRouteId,'fa fa-money fa-stack-1x text-white',1,1,25)
GO

--Yubraj ----Setting Route for INS Income Segregation Reports -----
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Billing' and ApplicationCode='BIL');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('billing-insurancemain-income-segregation-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-insurancemain-income-segregation-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Billing/InsuranceMain/Reports');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Income Segregation','Billing/InsuranceMain/Reports/IncomeSegregation','IncomeSegregation',@permissionID,@parentRouteId,'fa fa-book fa-stack-1x text-white',1,1,25)
GO
--END-- Yubraj 6th August 2019 --Setting route for Insurance Report and its sub-route--

--Start-- Salakha 7th August 2019 --Created tables for ip Discharge summary form--

---- Added Column in ADT_DischargeSummary
ALTER TABLE ADT_DischargeSummary
ADD LabTests varchar(1000) null,
  DischargeConditionId int null,
  DeliveryTypeId int null,
  BabyBirthConditionId int null,
  DeathTypeId int null,
  DeathPeriod varchar(50) null
  GO

  --------------------------------------------------
update ADT_DischargeType set IsActive = 0
GO
insert into ADT_DischargeType (DischargeTypeName,CreatedBy,CreatedOn,IsActive)
values
	('Recovered',1,GETDATE(),1),
	('Not Improved',1,GETDATE(),1),
	('LAMA',1,GETDATE(),1),
	('Absconded',1,GETDATE(),1),
	('Death',1,GETDATE(),1),
	('Referred',1,GETDATE(),1)
GO
--------

--table created for medicine dosage frequency---------

/****** Object:  Table [dbo].[CLN_MST_Frequency]    Script Date: 31-07-2019 16:07:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_MST_Frequency](
	[FrequencyId] [int] IDENTITY(1,1) NOT NULL,
	[Type] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_CLN_MST_Frequency] PRIMARY KEY CLUSTERED 
(
	[FrequencyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[CLN_MST_Frequency]
           ([Type])
     VALUES
           ('0-0-1'),('0-1-0'),('1-0-0'),('0-1-1'),('1-0-1'),('1-1-0'),('1-1-1')
GO

--- table for discharge summary medications------------
/****** Object:  Table [dbo].[ADT_DischargeSummaryMedication]    Script Date: 02-08-2019 13:44:28 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ADT_DischargeSummaryMedication](
	[DischargeSummaryMedicationId] [int] IDENTITY(1,1) NOT NULL,
	[DischargeSummaryId] [int] NOT NULL,
	[OldNewMedicineType] [int] NULL,
	[Medicine] [nvarchar](100) NULL,
	[FrequencyId] [int] NULL,
	[Notes] [nvarchar](100) NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_ADT_DischargeSummaryMedication] PRIMARY KEY CLUSTERED 
(
	[DischargeSummaryMedicationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ADT_DischargeSummaryMedication]  WITH CHECK ADD  CONSTRAINT [FK_ADT_DischargeSummaryMedication_ADT_DischargeSummaryMedication] FOREIGN KEY([DischargeSummaryMedicationId])
REFERENCES [dbo].[ADT_DischargeSummaryMedication] ([DischargeSummaryMedicationId])
GO

ALTER TABLE [dbo].[ADT_DischargeSummaryMedication] CHECK CONSTRAINT [FK_ADT_DischargeSummaryMedication_ADT_DischargeSummaryMedication]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'OldNewMedicineType represents 1.New Medicines, 2. Old medicines to be continued, 3.Old medicines to be stopped' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'ADT_DischargeSummaryMedication', @level2type=N'COLUMN',@level2name=N'OldNewMedicineType'
GO


------ Discharge Condition type table-------------
/****** Object:  Table [dbo].[ADT_MST_DischargeConditionType]    Script Date: 02-08-2019 12:41:17 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ADT_MST_DischargeConditionType](
	[DischargeConditionId] [int] IDENTITY(1,1) NOT NULL,
	[DischargeTypeId] [int] NOT NULL,
	[Condition] [nvarchar](50) NULL,
 CONSTRAINT [PK_ADT_MST_DischargeConditionType] PRIMARY KEY CLUSTERED 
(
	[DischargeConditionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[ADT_MST_DischargeConditionType]
           ([DischargeTypeId]
           ,[Condition])
     VALUES
           ((select DischargeTypeId from ADT_DischargeType where DischargeTypeName='Recovered'),'Delivery'),
		   ((select DischargeTypeId from ADT_DischargeType where DischargeTypeName='Recovered'),'Normal'),
		   ((select DischargeTypeId from ADT_DischargeType where DischargeTypeName='LAMA'),'Critical'),
		   ((select DischargeTypeId from ADT_DischargeType where DischargeTypeName='LAMA'),'Others')

GO

------ Discharge Delivery Type table-------------
/****** Object:  Table [dbo].[ADT_MST_DeliveryType]    Script Date: 02-08-2019 12:45:14 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ADT_MST_DeliveryType](
	[DeliveryTypeId] [int] IDENTITY(1,1) NOT NULL,
	[DischargeConditionId] [int] NOT NULL,
	[DeliveryTypeName] [nvarchar](50) NULL,
 CONSTRAINT [PK_ADT_MST_DeliveryType] PRIMARY KEY CLUSTERED 
(
	[DeliveryTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[ADT_MST_DeliveryType]
           ([DischargeConditionId]
           ,[DeliveryTypeName])
     VALUES
           ((select DischargeConditionId from ADT_MST_DischargeConditionType where Condition ='Delivery' ),'Normal'),
		   ((select DischargeConditionId from ADT_MST_DischargeConditionType where Condition ='Delivery' ),'Forceps'),
		   ((select DischargeConditionId from ADT_MST_DischargeConditionType where Condition ='Delivery' ),'Vaccum'),
		   ((select DischargeConditionId from ADT_MST_DischargeConditionType where Condition ='Delivery' ),'Breech'),
		   ((select DischargeConditionId from ADT_MST_DischargeConditionType where Condition ='Delivery' ),'C/S')

GO


------ Discharge Baby Birth Condition table-------------
/****** Object:  Table [dbo].[ADT_MST_BabyBirthCondition]    Script Date: 02-08-2019 13:48:37 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ADT_MST_BabyBirthCondition](
	[BabyBirthConditionId] [int] IDENTITY(1,1) NOT NULL,
	[BirthConditionType] [nvarchar](50) NOT NULL,
	[DischargeConditionId] [int] NOT NULL,
 CONSTRAINT [PK_ADT_MST_BabyBirthCondition] PRIMARY KEY CLUSTERED 
(
	[BabyBirthConditionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


INSERT INTO [dbo].[ADT_MST_BabyBirthCondition]
           ([BirthConditionType]
           ,[DischargeConditionId])
     VALUES
           ('Live Birth' ,(select DischargeConditionId from ADT_MST_DischargeConditionType where Condition ='Delivery' )),
		   ('Still Birth' ,(select DischargeConditionId from ADT_MST_DischargeConditionType where Condition ='Delivery' )),
           ('Neonatal Death' ,(select DischargeConditionId from ADT_MST_DischargeConditionType where Condition ='Delivery' ))
GO

------  Baby Birth details table-------------
/****** Object:  Table [dbo].[ADT_BabyBirthDetails]    Script Date: 02-08-2019 13:59:55 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ADT_BabyBirthDetails](
	[BabyBirthDetailsId] [int] IDENTITY(1,1) NOT NULL,
	[CertificateNumber] [int] NOT NULL,
	[Sex] [nvarchar](50) NULL,
	[NumberOfBabies] [int] NULL,
	[FathersName] [nvarchar](50) NULL,
	[WeightOfBaby] [decimal](18, 0) NULL,
	[BirthDate] [datetime] NULL,
	[BirthTime] [time](7) NULL,
	[DischargeSummaryId] [int] NOT NULL,
 CONSTRAINT [PK_ADT_BabyBirthDetails] PRIMARY KEY CLUSTERED 
(
	[BabyBirthDetailsId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


------  death type table-------------
/****** Object:  Table [dbo].[ADT_MST_DeathType]    Script Date: 02-08-2019 17:13:38 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ADT_MST_DeathType](
	[DeathTypeId] [int] IDENTITY(1,1) NOT NULL,
	[DeathType] [nvarchar](50) NULL,
 CONSTRAINT [PK_ADT_MST_DeathType] PRIMARY KEY CLUSTERED 
(
	[DeathTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[ADT_MST_DeathType]
           ([DeathType])
     VALUES
           ('Post Operative Death'),('Maternal Death'),('Early Neonatal Death'),('Late Neonatal Death'),('Other Death')
GO

INSERT INTO [dbo].[CORE_CFG_Parameters]
           ([ParameterGroupName]
           ,[ParameterName]
           ,[ParameterValue]
           ,[ValueDataType]
           ,[Description]
           ,[ParameterType])
     VALUES
           ('ADT','DeathDischargeType', '[{"DischargeTypeId":6,"DischargeTypeName":"Death < 48 Hours"},{"DischargeTypeId":7,"DischargeTypeName":"Death >= 48 Hours"}]'  ,'JSON' ,'To check death type for Discharged patient','custom')
GO


update ADT_DischargeType
set IsActive = 1
where DischargeTypeName ='Death < 48 Hours' or DischargeTypeName ='Death >= 48 Hours'
GO

update ADT_DischargeType
set IsActive = 0
where DischargeTypeName ='Death'
GO
--End-- Salakha 7th August 2019 --Created tables for ip Discharge summary form--


--Start Ajay 07 Aug 2019 
-- added LandingPageRouteId in Rbac_user for Landing Page for User 
alter table Rbac_User add LandingPageRouteId int null
GO
--End Ajay 7 aug 2019

















---Start: sud:8Aug'19--Billing Reports - Exclude Insurance Items from Normal report and so on --

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemInfo]    Script Date: 8/8/2019 11:47:03 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemInfo]()
RETURNS TABLE
AS

/*
 FileName: FN_BIL_GetTxnItemInfo
 Description: This function returns distinct information of transactionitems along with its CreatedOn, CancelledOn, ReturnedOn, etc..
 Remarks: This Function doesn't contain information of Counter, CreatedBy so cannot be used for Counter/User-Collections.
 Created: 5Aug'17 <Sudarshan/Dinesh>
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      5Aug'17- sud/dinesh     created         To be used as common function for almost all billing reports.
 2.      6Aug'19-sud             modified        Added Insurance Column in return values.
 -------------------------------------------------------------------------
*/
RETURN
(
  -- get distinct CreatedDate and other informations about all transactionsItems--
  -- when an item is Unpaid, it's transactionid will always be null--
	Select Convert(date, CreatedOn) 'BillingDate',NULL AS BillingTransactionId,'unpaid' AS BillStatus, BillingTransactionItemId, ServiceDepartmentId, PatientId, ItemId, ProviderId,
	Price, Quantity, SubTotal,DiscountAmount,Tax,TotalAmount,Remarks, IsInsurance
	FROM BIL_TXN_BillingTransactionItems
	WHERE PaidDate is null or Convert(Date,PaidDate) != Convert(Date,CreatedOn)
	UNION
	 -- get distinct CreatedDate and other informations about only paid transactionsItems--
	Select Convert(date, PaidDate) 'BillingDate',BillingTransactionId,'paid' as BillStatus, BillingTransactionItemId, ServiceDepartmentId, PatientId, ItemId, ProviderId,
	price, Quantity, SubTotal,DiscountAmount,Tax,TotalAmount,Remarks , IsInsurance
	FROM BIL_TXN_BillingTransactionItems
	where BillStatus='Paid'
		UNION
   Select Convert(date,br.CreatedOn)'BillingDate',bi.BillingTransactionId,'return' as BillStatus, BillingTransactionItemId, ServiceDepartmentId, bi.PatientId, ItemId, ProviderId,
	     SUM(IsNULL(Price,0)) Price,SUM(IsNULL(Quantity,0)) Quantity ,SUM(IsNULL(bi.SubTotal,0)) SubTotal  ,SUM(IsNULL(bi.DiscountAmount,0)) DiscountAmount ,
		SUM(IsNULL(Tax,0)) Tax ,SUM(IsNULL(bi.TotalAmount,0)) TotalAmount, 
		MAX(br.Remarks) 'Remarks', IsInsurance  -- find a way to concatenate remarks if possible. this might be incorrect when 1 item is returned multiple times 
  from BIL_TXN_BillingTransactionItems bi join BIL_TXN_InvoiceReturn br on bi.BillingTransactionId=br.BillingTransactionId
	  where ReturnStatus=1
   Group By Convert(date, br.CreatedOn),bi.BillingTransactionId, BillingTransactionItemId, ServiceDepartmentId, bi.PatientId, ItemId, ProviderId, IsInsurance
		UNION
    -- get distinct CreatedDate and other informations of Cancelled transactionsItems--
	Select Convert(date, CancelledOn) 'CancelledDate',BillingTransactionId,'cancel' as BillStatus, BillingTransactionItemId, ServiceDepartmentId, PatientId, ItemId, ProviderId,
	price, Quantity, SubTotal,DiscountAmount,Tax,TotalAmount,CancelRemarks, IsInsurance
	from BIL_TXN_BillingTransactionItems
	where CancelledOn is not null
)

GO

/****** Object:  UserDefinedFunction [dbo].[FN_BILL_BillingTxnSegregation_ByBillingType_DailySales]    Script Date: 8/8/2019 11:47:24 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
File: FN_BILL_BillingTxnSegregation_ByBillingType_DailySales
Created: <sud:15Feb'19>
Usage Example: Select * from FN_BILL_BillingTxnSegregation_ByBillingType_DailySales('2019-07-01','2019-07-10')
Description: Get individual components of sales eg: CashSales, CreditSales, CashReturn, CreditReturn, CreditReceived from Invoice Table ( BIL_TXN_BIllingTransaction )

Logic Used:
  Cash Sales   => billstatus=paid & paid on same day, 
  Credit Sales => billStatus = unpaid or paid on different day. i.e: this will be credit sales for InvoiceCreatedDate.
  CashReturn  => billStatus=paid and get from ReturnTable.
  CreditReturn => txn.PaymentMode='credit' and txn.BillStatus = 'unpaid'
  CreditReceived => bill status = paid and if its paid on different day, it'll be CreditReceived for PaidDate.

Change History:
-------------------------------------------------------------------------------
S.No.  ChangedBy/Date                           Remarks
-------------------------------------------------------------------------------
1.    Sud/15Feb'19                            Initial Draft
2.    sud/7Aug'19                             Added Insurance Fields in Return table.
-------------------------------------------------------------------------------
*/


ALTER FUNCTION [dbo].[FN_BILL_BillingTxnSegregation_ByBillingType_DailySales]
(@FromDate Date, @ToDate Date)
RETURNS TABLE

AS
RETURN
(

		SELECT * FROM 
		(

				--Cash Sales (Same Day)--
				Select   Convert(Date,PaidDate) 'BillingDate', 
						 InvoiceCode+Convert(varchar(20),InvoiceNo) 'InvoiceNo', 
						 Patientid,
						 'CashSales' AS 'BillingType',
						 SubTotal,DiscountAmount,TaxTotal, TotalAmount, 
						 TotalAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS CreditReceived,  0 AS 'CreditAmount',
						 PaidCounterId 'CounterId',PaymentReceivedBy 'EmployeeId',Remarks, IsInsuranceBilling, 1 as DisplaySeq
				from BIL_TXN_BillingTransaction
				Where BillStatus='paid' and Convert(Date,PaidDate) = Convert(Date,CreatedOn)

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreatedOn) 'BillingDate', 
					   InvoiceCode+Convert(varchar(20),InvoiceNo) 'InvoiceNo', 
						Patientid,
					  'CreditSales' AS 'BillingType',
					   SubTotal,DiscountAmount,TaxTotal,TotalAmount, 
					   0 AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						0 AS 'CreditReceived',TotalAmount  AS 'CreditAmount',
					   CounterId 'CounterId', CreatedBy 'EmployeeId', Remarks,IsInsuranceBilling, 2 as DisplaySeq 
				FROM BIL_TXN_BillingTransaction
				WHERE BillStatus='unpaid' or (BillStatus='paid' and Convert(Date,PaidDate) != Convert(Date,CreatedOn))

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'BillingDate',  
						InvoiceCode+Convert(varchar(20),InvoiceNo) 'InvoiceNo', 
						 Patientid,
						'CreditReceived' AS 'BillingType',
						0 AS SubTotal, 0 AS DiscountAmount, 0 AS TaxTotal,  0 AS TotalAmount, 
					  TotalAmount AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						TotalAmount AS 'CreditReceived',  0  AS 'CreditAmount',
					  PaidCounterId AS 'CounterId', PaymentReceivedBy AS 'EmployeeId', Remarks,IsInsuranceBilling, 3 as DisplaySeq 
				from BIL_TXN_BillingTransaction
				Where PaymentMode='credit' and BillStatus='paid' and Convert(Date,PaidDate) != Convert(Date,CreatedOn)
				UNION ALL
				--Cash Return---
				SELECT   Convert(Date,ret.CreatedOn) 'BillingDate',  
						 ret.InvoiceCode+Convert(varchar(20),txn.InvoiceNo) 'InvoiceNo', 
						  ret.Patientid,
						 'CashReturn' AS 'BillingType',
						 (-ret.SubTotal) 'SubTotal', (-ret.DiscountAmount) 'DiscountAmount', (-ret.TaxTotal) 'TaxAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (-ret.TotalAmount) AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						  0 AS 'CreditReceived', 0 AS 'CreditAmount',
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remarks,txn.IsInsuranceBilling, 4 as DisplaySeq 
				FROM BIL_TXN_InvoiceReturn ret, BIL_TXN_BillingTransaction txn
				where ret.BillingTransactionId=txn.BillingTransactionId
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  and txn.BillStatus='paid'
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'BillingDate',  
						 ret.InvoiceCode+Convert(varchar(20),txn.InvoiceNo) 'InvoiceNo', 
						  ret.Patientid,
						 'CreditReturn' AS 'BillingType',
						 (-ret.SubTotal) 'SubTotal', (-ret.DiscountAmount) 'DiscountAmount', (-ret.TaxTotal) 'TaxAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS 'CreditReceived', (-ret.TotalAmount) 'CreditAmount',
				 
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remarks, txn.IsInsuranceBilling, 5 as DisplaySeq
				FROM BIL_TXN_InvoiceReturn ret, BIL_TXN_BillingTransaction txn
				where ret.BillingTransactionId=txn.BillingTransactionId
				   and txn.PaymentMode='credit' and txn.BillStatus = 'unpaid'
			) A
			WHERE A.BillingDate BETWEEN @FromDate and @ToDate
) -- end of return

GO
GO

/****** Object:  View [dbo].[VW_BIL_TxnItemsInfo]    Script Date: 8/8/2019 11:48:05 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


ALTER VIEW [dbo].[VW_BIL_TxnItemsInfo]
  AS
/*
 FileName: VW_BIL_TxnItemsInfo
 Description: This view returns all transcationitems and their Paid/Unpaid/Cancelled/Returned Information grouped by date.
 Remarks: This view doesn't contain information of Counter, CreatedBy so cannot be used for Counter/User-Collections.
 Created: 5Aug'17 <Sudarshan/Dinesh>
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      5Aug'17- sud/dinesh     created         To be used as common view for almost all billing reports.
 2.      6Aug'19- sud            modified        Added insurance property in item level.
 -------------------------------------------------------------------------
*/
  SELECT 
	txnItmInfo.BillingDate,
	txnItmInfo.BillingTransactionItemId,
	txnItmInfo.BillingTransactionId,
	txnItmInfo.BillStatus,
	txnitmInfo.ServiceDepartmentId,
	txnItmInfo.ItemId,
	txnItmInfo.PatientId,
	txnItmInfo.ProviderId,
	txnItmInfo.IsInsurance,
    
	paid.Price 'PaidPrice',
	paid.Quantity 'PaidQuantity',
	paid.SubTotal 'PaidSubTotal',
	paid.DiscountAmount 'PaidDiscountAmount',
	paid.Tax 'PaidTax',
	paid.TotalAmount 'PaidTotalAmount',

	unpaid.Price 'UnpaidPrice',
	unpaid.Quantity 'UnpaidQuantity',
	unpaid.SubTotal 'UnpaidSubTotal',
	unpaid.DiscountAmount 'UnpaidDiscountAmount',
	unpaid.Tax 'UnpaidTax',
	unpaid.TotalAmount 'UnpaidTotalAmount',

	cancel.Price 'CancelPrice',
	cancel.Quantity 'CancelQuantity',
	cancel.SubTotal 'CancelSubTotal',
	cancel.DiscountAmount 'CancelDiscountAmount',
	cancel.Tax 'CancelTax',
	cancel.TotalAmount 'CancelTotalAmount',
	cancel.CreatedOn 'CreatedOn',
	
	bilRet.Price 'ReturnPrrice',
	bilRet.Quantity 'ReturnQuantity',
	bilRet.SubTotal 'ReturnSubTotal',
	bilRet.DiscountAmount 'ReturnDiscountAmount',
	bilRet.Tax 'ReturnTax',
	bilRet.TotalAmount 'ReturnTotalAmount'

 from  FN_BIL_GetTxnItemInfo() txnItmInfo

LEFT JOIN
(
	SELECT Convert(date,txnItm.PaidDate) 'BillingDate', txnItm.BillingTransactionItemId, txnItm.BillingTransactionId, txnItm.PatientId, txnItm.ProviderId, 
		txnItm.ServiceDepartmentId, txnItm.ItemId,txnItm.Price, txnItm.Quantity, txnItm.SubTotal,  txnItm.DiscountAmount, txnItm.Tax,
		txnItm.TotalAmount, txnItm.BillStatus, txnItm.IsInsurance
	FROM BIL_TXN_BillingTransactionItems txnItm 
	 WHERE  BillStatus = 'paid'
) paid

ON txnItmInfo.BillingDate = paid.BillingDate
  and txnItmInfo.BillingTransactionItemId = paid.BillingTransactionItemId and txnItmInfo.BillStatus = paid.BillStatus

LEFT JOIN
(

	SELECT Convert(date,txnItm.CreatedOn) 'BillingDate', txnItm.BillingTransactionItemId, txnItm.BillingTransactionId, txnItm.PatientId, txnItm.ProviderId, 
		txnItm.ServiceDepartmentId, txnItm.ItemId,txnItm.Price, txnItm.Quantity, txnItm.SubTotal,  txnItm.DiscountAmount, txnItm.Tax,
		txnItm.TotalAmount, 'unpaid' AS BillStatus
	FROM BIL_TXN_BillingTransactionItems txnItm 
	 WHERE  BillStatus = 'unpaid' OR (BillStatus = 'paid' AND Convert(date,CreatedOn) != CONVERT(date, PaidDate))
	  OR (BillStatus = 'cancel' )
) unpaid
ON txnItmInfo.BillingDate = unpaid.BillingDate
  and txnItmInfo.BillingTransactionItemId = unpaid.BillingTransactionItemId and txnItmInfo.BillStatus = unpaid.BillStatus

LEFT JOIN
(

	SELECT Convert(date,txnItm.CancelledOn) 'BillingDate', txnItm.BillingTransactionItemId, txnItm.BillingTransactionId, txnItm.PatientId, txnItm.ProviderId, 
		txnItm.ServiceDepartmentId, txnItm.ItemId,txnItm.Price, txnItm.Quantity, txnItm.SubTotal,  txnItm.DiscountAmount, txnItm.Tax,
		txnItm.TotalAmount, txnItm.BillStatus,txnItm.CancelledOn,txnItm.CreatedOn
	FROM BIL_TXN_BillingTransactionItems txnItm 
	 WHERE  BillStatus = 'cancel'
) cancel
ON txnItmInfo.BillingDate = cancel.BillingDate
  and txnItmInfo.BillingTransactionItemId = cancel.BillingTransactionItemId and txnItmInfo.BillStatus = cancel.BillStatus

LEFT JOIN
(
SELECT CONVERT(date,br.CreatedOn) 'BillingDate',
    BillingTransactionItemId, bi.BillingTransactionId,bi.Price, bi.Quantity,
     (ISNULL(bi.SubTotal,0)) SubTotal, (ISNULL(bi.DiscountAmount,0)) DiscountAmount, (ISNULL(Tax,0)) Tax, (ISNULL(bi.TotalAmount,0)) TotalAmount,'return' as BillStatus
    from BIL_TXN_BillingTransactionItems bi join BIL_TXN_InvoiceReturn br on bi.BillingTransactionId=br.BillingTransactionId
    where ReturnStatus=1
 
) bilRet
ON txnItmInfo.BillingDate = bilRet.BillingDate
  and txnItmInfo.BillingTransactionItemId = bilRet.BillingTransactionItemId

GO


/****** Object:  View [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation]    Script Date: 8/8/2019 11:48:31 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER VIEW [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation]
  AS
/*
 FileName    : VW_BIL_TxnItemsInfoWithDateSeparation
 Description : This view returns all transcationitems and their Paid/Unpaid/Cancelled/Returned Information grouped by date.
 Remarks     : Add new fields as per requirements
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.     14Aug'18- sud			created		To be used as common view for those billing reports where item level segregation is required
 2.		23Aug'18 - ramavtar		alter		added receipt no/invoice number in select(view table)
 3.     Sud/30Aug'18                        Revised for Provisional and BillStatus
 4.		Ramavtar/06Dec			alter		change in ProvisionalDate case statements
 5.     sud:6Aug'19             alter       added column for IsInsurance
 -------------------------------------------------------------------------
*/
 SELECT
	txnItm.BillingTransactionItemId,
	txnItm.PatientId,
	txnItm.ItemId,
	txnItm.ItemName, 
	txnitm.ServiceDepartmentId,
	txnItm.ServiceDepartmentName,
	txnItm.ProviderId,
	txnItm.ProviderName,
	ISNULL(txnItm.BillingType,'Outpatient') AS 'BillingType',--default BillingType is Outpatient, so.. 
	txnItm.RequestingDeptId, -- sud:22Aug'18
	Convert(DATE, txnItm.CreatedOn) 'CreatedDate',
	Convert(DATE, txnItm.PaidDate) 'PaidDate',
	Convert(DATE, ret.CreatedOn)  'ReturnDate', 
	---cancelled---
	CASE WHEN txnItm.BillStatus = 'Cancel' THEN Convert(DATE,txnItm.CancelledOn) ELSE NULL END AS CancelledDate,

  ---provisional--
    ---below are conditions for Provisional--
	-----Invoice not Generated--
	--1. Billstatus = Provisional
	--2. BillStatus = Cancel  & CreatedOn != CancelledOn
	----Invoice Generated--
	--3. billstatus = unpaid  &  ItemCreatedOn != InvoiceCreatedOn
	--4. billstatus = paid  &   ItemCreatedOn != InvoiceCreatedOn   & PaymentMode != Credit   
  CASE 
	WHEN txnItm.BillStatus = 'provisional' 
		THEN Convert(DATE, txnItm.CreatedOn) 
	WHEN (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
		THEN Convert(DATE,txnItm.CreatedOn)
	WHEN (txnItm.BillingTransactionId IS NOT NULL
			AND ( 
					(txn.PaymentMode != 'credit' AND CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn))
				OR  (txnItm.BillStatus='unpaid' AND  CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
				OR  (txnItm.BillStatus='paid' and  CONVERT(Date,txnItm.CreatedOn) !=  CONVERT(Date,txnItm.PaidDate) AND txn.PaymentMode != 'credit')
				OR (txnItm.BillStatus = 'paid' AND CONVERT(date,txnItm.CreatedOn) != CONVERT(date,txn.CreatedOn) AND txn.PaymentMode = 'credit')	--ramavtar:06Dec'18	checking paymentMode!='credit'
				 )
		   ) THEN Convert(DATE, txnItm.CreatedOn) 
	ELSE NULL END AS ProvisionalDate,

--CREDIT---
  CASE WHEN (txn.PaymentMode='credit' AND txn.BillStatus='unpaid' )
	   OR ( txn.BillStatus='paid' AND Convert(Date,txn.CreatedOn)  != Convert(Date,txn.PaidDate) ) 
	   THEN CONVERT(DATE,txn.CreatedOn)
	   ELSE NULL END AS 'CreditDate',

	 txnItm.Price,
	 txnItm.Quantity,
	 txnItm.SubTotal,
	 txnItm.DiscountAmount,
	 txnitm.TotalAmount,
	 Case  WHEN ISNULL(txnItm.ReturnStatus,0)=1 THEN txnItm.TotalAmount ELSE 0 END AS  'ReturnAmount',
	-- ret.TotalAmount 'ReturnAmount',---this is incorrect.. use above: sud-30aug'18
	 ret.Remarks 'ReturnRemarks',
	 txnItm.CancelRemarks as 'CancelRemarks',
	 txn.PaymentMode as 'PaymentMode',
	 txnItm.VisitType AS 'VisitType',
	 ISNULL(txn.InvoiceCode + '-' + CONVERT(VARCHAR,txn.InvoiceNo),'') 'InvoiceNumber'	-- ramavtar 23Aug'18
	 ,txnItm.IsInsurance --sud:6Aug'19
FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO


/****** Object:  View [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]    Script Date: 8/8/2019 11:49:00 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO
ALTER VIEW [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]  ---select * from [VW_BIL_TxnItemsInfoWithDateSeparation]
  AS
/*
 FileName    : VW_BIL_TxnItemsInfoWithDateSeparation
 Description : This view returns all transcationitems and their Paid/Unpaid/Cancelled/Returned Information grouped by date.
 Remarks     : Add new fields as per requirements
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.     14Aug'18- sud			created		To be used as common view for those billing reports where item level segregation is required
 2.		23Aug'18 - ramavtar		alter		added receipt no/invoice number in select(view table)
 3.     Sud/30Aug'18                        Revised for Provisional and BillStatus
 4.		Ramavtar/06Dec			alter		change in ProvisionalDate case statements
 5.     Dinesh/05th Feb'19		alter		added Return Quantity on views 
 6.     Sud/18Feb'19            alter       added billstatus, InvoiceCreatedDate, InvoicePaidDate
 7.     Dinesh/ 27th May'19		alter		added RequestedBy
 8.     Sud/7Aug'19             alter       added IsInsurance
 -------------------------------------------------------------------------
*/
 SELECT
	txnItm.BillingTransactionItemId,
	txnItm.PatientId,
	txnItm.ItemId,
	txnItm.ItemName, 
	txnitm.ServiceDepartmentId,
	txnItm.ServiceDepartmentName,
	txnItm.ProviderId,
	txnItm.RequestedBy, --din:27thMay'19
	txnItm.ProviderName,
	ISNULL(txnItm.BillingType,'Outpatient') AS 'BillingType',--default BillingType is Outpatient, so.. 
	txnItm.RequestingDeptId, -- sud:22Aug'18
	Convert(DATE, txnItm.CreatedOn) 'CreatedDate',
	Convert(DATE, txnItm.PaidDate) 'PaidDate',
	Convert(DATE, ret.CreatedOn)  'ReturnDate', 

	Convert(DATE, txn.CreatedOn) 'InvoiceCreatedDate', -- sud:18Feb'19
	Convert(DATE, txn.PaidDate) 'InvoicePaidDate', -- sud:18Feb'19
	---cancelled---
	CASE WHEN txnItm.BillStatus = 'Cancel' THEN Convert(DATE,txnItm.CancelledOn) ELSE NULL END AS CancelledDate,

  ---provisional--
    ---below are conditions for Provisional--
	-----Invoice not Generated--
	--1. Billstatus = Provisional
	--2. BillStatus = Cancel  & CreatedOn != CancelledOn
	----Invoice Generated--
	--3. billstatus = unpaid  &  ItemCreatedOn != InvoiceCreatedOn
	--4. billstatus = paid  &   ItemCreatedOn != InvoiceCreatedOn   & PaymentMode != Credit   
  CASE 
	WHEN txnItm.BillStatus = 'provisional' 
		THEN Convert(DATE, txnItm.CreatedOn) 
	WHEN (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
		THEN Convert(DATE,txnItm.CreatedOn)
	WHEN (txnItm.BillingTransactionId IS NOT NULL
			AND ( 
					(txn.PaymentMode != 'credit' AND CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn))
				OR  (txnItm.BillStatus='unpaid' AND  CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
				OR  (txnItm.BillStatus='paid' and  CONVERT(Date,txnItm.CreatedOn) !=  CONVERT(Date,txnItm.PaidDate) AND txn.PaymentMode != 'credit')
				OR (txnItm.BillStatus = 'paid' AND CONVERT(date,txnItm.CreatedOn) != CONVERT(date,txn.CreatedOn) AND txn.PaymentMode = 'credit')	--ramavtar:06Dec'18	checking paymentMode!='credit'
				 )
		   ) THEN Convert(DATE, txnItm.CreatedOn) 
	ELSE NULL END AS ProvisionalDate,

--CREDIT---
  CASE WHEN (txn.PaymentMode='credit' AND txn.BillStatus='unpaid' )
	   OR ( txn.BillStatus='paid' AND Convert(Date,txn.CreatedOn)  != Convert(Date,txn.PaidDate) ) 
	   THEN CONVERT(DATE,txn.CreatedOn)
	   ELSE NULL END AS 'CreditDate',

	 txnItm.Price,
	 txnItm.Quantity,
	 txnItm.SubTotal,
	 txnItm.ReturnQuantity,
	 txnItm.DiscountAmount,
	 txnitm.TotalAmount,
	 Case  WHEN ISNULL(txnItm.ReturnStatus,0)=1 THEN txnItm.TotalAmount ELSE 0 END AS  'ReturnAmount',
	-- ret.TotalAmount 'ReturnAmount',---this is incorrect.. use above: sud-30aug'18
	 ret.Remarks 'ReturnRemarks',
	 txnItm.CancelRemarks as 'CancelRemarks',
	 txn.PaymentMode as 'PaymentMode',
	 txnItm.VisitType AS 'VisitType',
	 ISNULL(txn.InvoiceCode + '-' + CONVERT(VARCHAR,txn.InvoiceNo),'') 'InvoiceNumber'	-- ramavtar 23Aug'18
	 ,txnItm.BillStatus 
	 ,txnItm.IsInsurance --sud:7Aug'19
FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO


/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DailySales]    Script Date: 8/8/2019 11:49:32 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-11-29','2018-11-29',null,null,1
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null,
		@IsInsurance bit=0
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: To Get Sales + Cash Collection details from Invoice and Deposits table between given range. 
Remarks: Deposits are returned as it is for IsInsurance=1 as well since it's independent of sales, <Needs Revision>
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
4.      Sud/15Feb'19                           Format Revised, getting sales summary from a function and then union with Deposit transactions.
5.      Sud/7Aug'19                            Added Filter for IsInsurance
-----------------------------------------------------------------------------------------
*/
BEGIN

 IF (@FromDate IS NOT NULL)
  OR (@ToDate IS NOT NULL)
BEGIN
	
	--Table:1 - For Usercollection Details---
	 --Return Columns: BillingDate, ReceiptNo, HospitalNo, patientName, BillingType, SubTotal, DiscountAmount, 
	 --TaxTotal, TotalAmount, CashCollection, DepositReceived, DepositRefund, CreditReceived,CreditAmount, CounterId, EmployeeId, Remarks, User (CreatedBy)

   SELECT
			bills.BillingDate,
			bills.InvoiceNo 'ReceiptNo',
			pat.PatientCode 'HospitalNo',
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			bills.BillingType 'BillingType',
			bills.SubTotal,
			bills.DiscountAmount,
			bills.TaxTotal,
			bills.TotalAmount, 
			bills.CashCollection, 
			bills.DepositReceived,
			bills.DepositRefund,
			bills.CreditReceived,
			bills.CreditAmount,
			bills.CounterId, 
			bills.[EmployeeId],
			bills.Remarks,
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy

		FROM (
					Select * from FN_BILL_BillingTxnSegregation_ByBillingType_DailySales(@FromDate,@ToDate)
					WHERE ISNULL(IsInsuranceBilling,0) = @IsInsurance
	    
					UNION ALL

					--All Deposits Transactions---
					Select   Convert(Date,CreatedOn) 'BillingDate', 
							 'DR'+Convert(varchar(20),ISNULL(ReceiptNo,'')) 'InvoiceNo', 
							 Patientid,
							 CASE WHEN DepositType='Deposit' THEN 'AdvanceReceived' 
								WHEN DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN 'AdvanceSettled' END AS 'BillingType',
			
							 0 As SubTotal,0 AS DiscountAmount,0 AS TaxTotal, 0 AS TotalAmount, 
							 CASE WHEN DepositType='Deposit' THEN Amount WHEN DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN (-Amount) END AS 'CashCollection',
							  CASE WHEN DepositType='Deposit' THEN Amount ELSE 0 END AS 'DepositReceived',
							CASE WHEN  DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN Amount ELSE 0 END AS 'DepositRefund'
						   
							 , 0 AS CreditReceived,  0 AS 'CreditAmount',
							 CounterId 'CounterId', CreatedBy 'EmployeeId', Remarks, 0 AS IsInsuranceBilling, 6 as DisplaySeq 
					from BIL_TXN_Deposit
					WHERE COnvert(Date,CreatedOn) BETWEEN @FromDate and @ToDate	


			) bills,


		EMP_Employee emp,
		PAT_Patient pat,
		BIL_CFG_Counter cntr
		WHERE bills.PatientId = pat.PatientId
				AND emp.EmployeeId = bills.EmployeeId
				AND bills.CounterId = cntr.CounterId

				AND (bills.CounterId LIKE '%' + ISNULL(@CounterId, bills.CounterId) + '%')
		        AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
		
       Order by bills.DisplaySeq


   --Table2: For Settlement Details, needed Discount and DueAmount for UserCollection-Cash Collection fields.
   --We Only need collective amount for Settlement Amounts.
	 Select 
	        sett.CreatedBy 'EmployeeId',
			Sett.CounterId,
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			 --Case When sett.PayableAmount > 0 then PayableAmount - ( DepositDeducted + ISNULL(DiscountAmount,0) + ISNULL(DueAmount,0)) ELSE 0 END AS PaidAmount, 
			SUM(Case When sett.PayableAmount > 0 then sett.PaidAmount ELSE 0 END) AS 'SettlPaidAmount', 
			SUM( Case WHEN sett.RefundableAmount > 0 THEN sett.ReturnedAmount ELSE 0 END ) AS 'SettlReturnAmount',
			SUM( Case WHEN sett.DueAmount > 0 THEN sett.DueAmount ELSE 0 END ) AS 'SettlDueAmount',
			SUM( Case WHEN  sett.DiscountAmount > 0 THEN sett.DiscountAmount ELSE 0 END  ) 'SettlDiscountAmount'
	from BIL_TXN_Settlements sett, 
	    EMP_Employee emp,
		BIL_CFG_Counter cntr 


	WHERE sett.CreatedBy=emp.EmployeeId
	      AND sett.CounterId=cntr.CounterId
		  AND (sett.CounterId LIKE '%' + ISNULL(@CounterId, sett.CounterId) + '%')
		  AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
	      AND Convert(Date,sett.CreatedOn) BETWEEN Convert(Date, @FromDate) AND Convert(Date, @ToDate) 

    Group By sett.CreatedBy, sett.CounterId,emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName 

 END -- end of IF

END -- end of SP

GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_TotalItemsBill]    Script Date: 8/8/2019 11:49:58 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BILL_TotalItemsBill] 	-- [SP_Report_BILL_TotalItemsBill] '2019-07-01', '2019-07-01', null,null,null,1
		@FromDate DATETIME = NULL,
		@ToDate DATETIME = NULL,
		@BillStatus VARCHAR(MAX) = NULL,
		@ServiceDepartmentName VARCHAR(MAX) = NULL,
		@ItemName VARCHAR(MAX) = NULL,
		@IsInsurance bit=0
AS
/*
FileName: [sp_Report_TotalItemsBill]
CreatedBy/date: nagesh/2017-05-25
Description: to get the price, Tax, total,along with recipt number between given date input
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       nagesh/2017-05-25	                created the script
2       umed / 2017-06-06                   Modify the script i.e format and alias of query
3       Umed / 2017-06-14                   alter i.e remove time from Date and added ISNULL with Fromdate,Todate,and other parameters
4.		dinesh/ 2017-07-27					modified the script and  added the Hospital Number  
5       Umed/ 2018-04-12                    Alter SP (Add Bill Date to First Because BugFixes workaround of Sequnce Number)
6.		Ramavtar/2018-08-18					Changed SP: taking data from view table --> VW_BIL_TxnItemsInfoWithDateSeparation
7.      Sud/22Feb'19                        Renamed Billstatus to BillStatus_New in innner query since BillStatus is added also in the view used there
                                             and was causing error: The column 'BillStatus' was specified multiple times for 'txnItms'
8.      sud: 8Aug2019                     Added Insurance Clause for total items bill. 
--------------------------------------------------------
*/
BEGIN
	SELECT
		txnItms.BillingDate,
		pat.PatientCode 'HospitalNumber',
		CONCAT(pat.FirstName,' '+ pat.LastName) 'PatientName',
		txnItms.InvoiceNumber,
		txnItms.ServiceDepartmentName,
		txnItms.ItemName,
		txnItms.Price,
		txnItms.Quantity,
		txnItms.SubTotal,
		txnItms.DiscountAmount,
		txnItms.TotalAmount,
		txnItms.ProviderName,
		txnItms.BillStatus_New 'BillStatus'
	FROM 
		(
			SELECT ProvisionalDate 'BillingDate', 'provisional' AS BillStatus_New, * 
			FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE ProvisionalDate IS NOT NULL
			UNION ALL
			SELECT CancelledDate 'BillingDate', 'cancel' AS BillStatus_New, * 
			FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE CancelledDate IS NOT NULL
			UNION ALL
			SELECT PaidDate 'BillingDate', 'paid' AS BillStatus_New, * 
			FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE PaidDate IS NOT NULL
			UNION ALL
			SELECT CreditDate 'BillingDate', 'unpaid' AS BillStatus_New, * 
			FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE CreditDate IS NOT NULL
			UNION ALL
			SELECT ReturnDate 'BillingDate', 'return' AS BillStatus_New, * 
			FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE ReturnDate IS NOT NULL
		) txnItms
	LEFT JOIN PAT_Patient pat ON txnItms.PatientId = pat.PatientId
	WHERE (txnItms.BillingDate BETWEEN @FromDate AND @ToDate)
		AND (txnItms.BillStatus_New LIKE ISNULL(@BillStatus, txnItms.BillStatus_New) + '%')
		AND (txnItms.ServiceDepartmentName LIKE '%' + ISNULL(@ServiceDepartmentName, txnItms.ServiceDepartmentName) + '%')
		AND (txnItms.ItemName LIKE '%' + ISNULL(@ItemName, txnItms.ItemName) + '%')
		 AND ISNULL(txnItms.IsInsurance,0) = @IsInsurance
	ORDER BY txnItms.BillingDate, txnItms.BillingTransactionItemId DESC
END
GO
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_IncomeSegregation]    Script Date: 8/8/2019 11:50:56 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_IncomeSegregation]
	--SP_Report_BIL_IncomeSegregation '2018-12-09','2018-12-09' 
	@FromDate Date=null ,
	@ToDate Date=null,
	@IsInsurance bit=0	
AS
/*
FileName: [SP_Report_BIL_IncomeSegregation]
CreatedBy/date: Dinesh/2018-0-03
Description: to get the income head of different department and sales related data
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date				Remarks
---------------------------------------------------------------------------------
1.		Ramavtar/23Sep'18			initial draft
2		Dinesh / 24th Sep'18		Manakamana hospital requirement changes
3.		Ramavar/24Sep'18			corrected report 
4.		Dinesh/29Nov'18				customizing for Hams Hospital
5.		Nagesh/09Dec'18				changes for remove 0 values record and Credit Amount mismatch
6.		Nagesh/12Dec'18				totally changed code of sp, here i'm removed all old logic and code
								    because it was 400 line query and not showing correct result for provisional -> Credit Bill
									here we are using View and Function ([VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation],FN_BIL_GetSrvDeptReportingName)
7.		Nagesh/17Dec'18				altered for handle bug - last days credit bill showing cash bill on settlement day
8.      Sud/8Aug'19                 For Insurance Information 
-------------------------------------------------------------------------------
*/
BEGIN
 ;
  WITH IncomeSegCTE As (
--Cash Sale  which has paidDate, here paid date as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation](ServiceDepartmentName,ItemName) as ServDeptName
,PaidDate as BillingDate,Quantity as Unit, SubTotal as CashSales,DiscountAmount as CashDiscount,0 as CreditSales,0 as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from [VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation] 
where PaidDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and PaidDate is not null and CreditDate is null
),
 IncomeSegCreditCTE
  AS(
--Credit Sale, which has CreditDate, here CreditDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation](ServiceDepartmentName,ItemName) as ServDeptName
,CreditDate as BillingDate,Quantity as Unit, 0 as CashSales,0 as CashDiscount,SubTotal as CreditSales,DiscountAmount as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from [VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation] 
where CreditDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and CreditDate is not null
),
 IncomeSegCreditReturnedCTE
  AS(
--Return Sale, which has Return Date, here ReturnDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation](ServiceDepartmentName,ItemName) as ServDeptName
,ReturnDate as BillingDate,0 as Unit, 0 as CashSales,0 as CashDiscount,0 as CreditSales,0 as CreditDiscount, Quantity as ReturnQuantity, SubTotal as ReturnAmount, DiscountAmount as ReturnDiscount
from [VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation] 
where ReturnDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and ReturnDate is not null
AND IsNull(IsInsurance,0) = @IsInsurance

)SELECT   
    ServDeptName,
	SUM(Unit)-SUM(ReturnQuantity) 'Unit',
    SUM(CashSales) 'CashSales',   
    SUM(CashDiscount) 'CashDiscount',
    SUM(CreditSales) 'CreditSales',    
	SUM(CreditDiscount) 'CreditDiscount',
	SUM(ReturnQuantity) 'ReturnQuantity',
    SUM(ReturnAmount) 'ReturnAmount',   
    SUM(ReturnDiscount) 'ReturnDiscount',  
	SUM(CashSales)+SUM(CreditSales)-SUM(ReturnAmount) 'GrossSales'--,
	,(SUM(CashDiscount)+ SUM(CreditDiscount))- SUM(ReturnDiscount) 'Discount'
   , ((sum(CashSales)+sum(CreditSales)-sum(ReturnAmount))) - ((SUM(CashDiscount)+ SUM(CreditDiscount))- SUM(ReturnDiscount))  'NetSales'	    
  FROM (select *from IncomeSegCTE union all select *from IncomeSegCreditCTE union all select *from IncomeSegCreditReturnedCTE)
  x1 group by ServDeptName
  order by NetSales desc
  End

GO
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_SalesDaybook]    Script Date: 8/8/2019 11:52:08 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BILL_SalesDaybook]
	  @FromDate DateTime=null,
	  @ToDate DateTime=null,
	  @IsInsurance bit=0
AS
/*
--[SP_Report_BILL_SalesDaybook] '2018-08-18','2018-08-18'
FileName: [SP_Report_BILL_SalesDaybook]
CreatedBy/date: nagesh/2017-05-25
Description: to get the total of Billed, Unbilled, and Returned along with the total cash collection
Remarks:    We're querying same table multiple times here, check if we can do it in a better way.
       : Need to check again for CashDiscount and Trade Discount
	   : Apply date filter in each sub-query as well--
	   : totalAmount equals be TotalAmount-ReturnAmount in all cases---
Change History
-------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                                            Remarks
-------------------------------------------------------------------------------------
1       nagesh/umed/dinesh from May2017 to Nov2017	      created the script
2.      sud: 27May'18                                     modified as per new table designs      
3.      sud: 19Aug'18                                     Re-calculation for TotalAmount in Return Case. 
4.      sud: 6Aug'19                                      Added parameter for Insurance
--------------------------------------------------------------------------------------
*/
BEGIN
 
     SELECT  d.BillingDate, 
		 ---total bills: Paid+Credit---
        ISNULL(paid.Subtotal,0)+ISNULL(crSales.SubTotal,0) 'SubTotal',
        ISNULL(paid.DiscountAmount,0)+ISNULL(crSales.DiscountAmount,0) 'DiscountAmount',
		ISNULL(paid.TaxableAmount,0)+ISNULL(crSales.TaxableAmount,0) 'TaxableAmount',
		ISNULL(paid.TaxAmount,0)+ISNULL(crSales.TaxAmount,0) 'TaxAmount',
		ISNULL(paid.TotalAmount,0)+ISNULL(crSales.TotalAmount,0) - (ISNULL(cashRet.TotalAmount,0)+ISNULL(crRet.TotalAmount,0)) 'TotalAmount',
	    ISNULL(cashRet.TotalAmount,0)+ISNULL(crRet.TotalAmount,0) 'ReturnAmount',--sud: 18Aug'18
		---check for CashCollection logic again---
		ISNULL(paid.TotalAmount,0)  + ISNULL(depOnly.DepositReceived,0)   + ISNULL(crReceived.TotalAmount,0)
		   - ISNULL(cashRet.TotalAmount,0) - ISNULL(SettlDiscountAmount,0) - ISNULL(DepositReturn,0) - ISNULL(SettlDueAmount,0)     'CashCollection',
         -- paid bills only---
		ISNULL(paid.Subtotal,0) 'Paid_SubTotal',
		ISNULL(paid.DiscountAmount,0) 'Paid_DiscountAmount',
		ISNULL(paid.TaxableAmount,0) 'Paid_TaxableAmount',
		ISNULL(paid.TaxAmount,0) 'Paid_TaxAmount',

		ISNULL(paid.TotalAmount,0) - ISNULL(cashRet.TotalAmount,0)  'Paid_TotalAmount',  -- sud: 18Aug'18
		---ISNULL(paid.TotalAmount,0) 'Paid_TotalAmount',


		----credit sales today----
		ISNULL(crSales.Subtotal,0) 'CrSales_SubTotal',
		ISNULL(crSales.DiscountAmount,0) 'CrSales_DiscountAmount',
		ISNULL(crSales.TaxableAmount,0) 'CrSales_TaxableAmount',
		ISNULL(crSales.TaxAmount,0) 'CrSales_TaxAmount',
		
		ISNULL(crSales.TotalAmount,0) - ISNULL(crRet.TotalAmount,0)  'CrSales_TotalAmount',  -- sud: 18Aug'18
		--ISNULL(crSales.TotalAmount,0) 'CrSales_TotalAmount',
		---credit received from previous day----
		ISNULL(crReceived.Subtotal,0) 'CrReceived_SubTotal',
		ISNULL(crReceived.DiscountAmount,0) 'CrReceived_DiscountAmount',
		ISNULL(crReceived.TaxableAmount,0) 'CrReceived_TaxableAmount',
		ISNULL(crReceived.TaxAmount,0) 'CrReceived_TaxAmount',
		ISNULL(crReceived.TotalAmount,0) 'CrReceived_TotalAmount',
		---deposit and deposit settlement info----
		ISNULL(depOnly.DepositReceived,0) DepositReceived,
		ISNULL(depOnly.DepositReturn,0) DepositReturn,
		---settlemenet info---
		ISNULL(settl.SettlPaidAmount,0) SettlPaidAmount,
		ISNULL(settl.SettlReturnAmount,0) SettlReturnAmount,
		ISNULL(settl.SettlDiscountAmount,0) SettlDiscountAmount,
		ISNULL(settl.SettlDueAmount,0) SettlDueAmount,
		----return info of cash receipts---
		ISNULL(cashRet.Subtotal,0) 'CashRet_SubTotal',
		ISNULL(cashRet.DiscountAmount,0) 'CashRet_DiscountAmount',
		ISNULL(cashRet.TaxableAmount,0) 'CashRet_TaxableAmount',
		ISNULL(cashRet.TaxAmount,0) 'CashRet_TaxAmount',
		ISNULL(cashRet.TotalAmount,0) 'CashRet_TotalAmount',
		----return of credit receipts---
		ISNULL(crRet.Subtotal,0) 'CrRet_SubTotal',
		ISNULL(crRet.DiscountAmount,0) 'CrRet_DiscountAmount',
		ISNULL(crRet.TaxableAmount,0) 'CrRet_TaxableAmount',
		ISNULL(crRet.TaxAmount,0) 'CrRet_TaxAmount',
		ISNULL(crRet.TotalAmount,0) 'CrRet_TotalAmount'
FROM 
(
  SELECT Dates 'BillingDate' 
  FROM [FN_COMMON_GetAllDatesBetweenRange] (ISNULL(@FromDate,GETDATE()),ISNULL(@ToDate,GETDATE()))
) d left join
(
  ---paid on same day-- 
  Select Convert(date,txn.PaidDate) 'BillingDate',
	  SUM(txn.SubTotal) 'Subtotal' ,
	  SUM(txn.DiscountAmount) DiscountAmount, 
	  SUM(txn.TaxableAmount) TaxableAmount, 
	  SUM(txn.TaxTotal) 'TaxAmount', 
	  SUM(txn.TotalAmount) TotalAmount
  FROM BIL_TXN_BillingTransaction txn 
  WHERE txn.BillStatus='paid' AND Convert(date,PaidDate) = Convert(date,CreatedOn)
  and ISNULL(IsInsuranceBilling,0)= @IsInsurance
  GROUP BY Convert(date,txn.PaidDate)
) paid
ON d.BillingDate = paid.BillingDate
LEFT JOIN 
(
  Select Convert(date,txn.CreatedOn) 'BillingDate', 
		SUM(txn.SubTotal) SubTotal, 
		SUM(txn.DiscountAmount) DiscountAmount,
		SUM(txn.TaxableAmount) TaxableAmount, 
		SUM(txn.TaxTotal) TaxAmount, 
		SUM(txn.TotalAmount) TotalAmount
  FROM BIL_TXN_BillingTransaction txn  
  WHERE ( txn.BillStatus='unpaid' OR (txn.BillStatus ='paid' AND Convert(date,PaidDate) != Convert(date,CreatedOn)) )
  and ISNULL(IsInsuranceBilling,0) = @IsInsurance
  Group BY Convert(date,txn.CreatedOn)
) crSales
ON d.BillingDate = crSales.BillingDate

LEFT JOIN 
(
  -- cr on day1(createdOn), settled on day2(paidDate)---
  Select Convert(date,txn.PaidDate) 'BillingDate',
   		SUM(txn.SubTotal) SubTotal, 
		SUM(txn.DiscountAmount) DiscountAmount,
		SUM(txn.TaxableAmount) TaxableAmount, 
		SUM(txn.TaxTotal) TaxAmount, 
		SUM(txn.TotalAmount) TotalAmount
   FROM BIL_TXN_BillingTransaction txn 
  WHERE txn.BillStatus='paid' AND Convert(date,PaidDate) != Convert(date,CreatedOn)
  and ISNULL(IsInsuranceBilling,0)= @IsInsurance
  Group BY Convert(date,txn.PaidDate)
) crReceived
ON d.BillingDate = crReceived.BillingDate

LEFT JOIN
(
 Select Convert(date,dep.CreatedOn) 'BillingDate',
      SUM( Case WHEN dep.DepositType='Deposit' then dep.Amount ELSE 0 END ) AS 'DepositReceived',
      SUM( Case WHEN dep.DepositType='depositdeduct' OR  dep.DepositType='ReturnDeposit' then dep.Amount ELSE 0  END) AS 'DepositReturn'
  from BIL_TXN_Deposit dep
  Group BY Convert(date,dep.CreatedOn)
) depOnly
ON d.BillingDate = DepOnly.BillingDate

LEFT JOIN
(
Select Convert(date,sett.SettlementDate) 'BillingDate',
         --Case When sett.PayableAmount > 0 then PayableAmount - ( DepositDeducted + ISNULL(DiscountAmount,0) + ISNULL(DueAmount,0)) ELSE 0 END AS PaidAmount, 
		SUM(Case When sett.PayableAmount > 0 then sett.PaidAmount ELSE 0 END) AS 'SettlPaidAmount', 
		SUM( Case WHEN sett.RefundableAmount > 0 THEN sett.ReturnedAmount ELSE 0 END ) AS 'SettlReturnAmount',
		SUM( Case WHEN sett.DueAmount > 0 THEN sett.DueAmount ELSE 0 END ) AS 'SettlDueAmount',
        SUM( Case WHEN  sett.DiscountAmount > 0 THEN sett.DiscountAmount ELSE 0 END  ) 'SettlDiscountAmount'
from BIL_TXN_Settlements sett 
GROUP BY Convert(date,sett.SettlementDate)
) settl
ON d.BillingDate = settl.BillingDate

LEFT JOIN
(
  Select 
    Convert(date,ret.CreatedOn) 'BillingDate',
     SUM(txn.SubTotal) AS 'SubTotal',
     SUM(ret.DiscountAmount) AS 'DiscountAmount',
	 SUM(ret.TaxableAmount) AS 'TaxableAmount',
     SUM(ret.TaxTotal) AS 'TaxAmount',
     SUM(ret.TotalAmount) AS 'TotalAmount'
 from BIL_TXN_InvoiceReturn ret, BIL_TXN_BillingTransaction txn
 where ret.BillingTransactionId = txn.BillingTransactionId
 and txn.BillStatus='paid' 
 and ISNULL(txn.IsInsuranceBilling,0)= @IsInsurance
 GROUP BY Convert(date,ret.CreatedOn)
) cashRet
ON d.BillingDate = cashRet.BillingDate

LEFT JOIN
(
  Select 
    Convert(date,ret.CreatedOn) 'BillingDate',
     SUM(txn.SubTotal) AS 'SubTotal',
     SUM(ret.DiscountAmount) AS 'DiscountAmount',
	 SUM(ret.TaxableAmount) AS 'TaxableAmount',
     SUM(ret.TaxTotal) AS 'TaxAmount',
     SUM(ret.TotalAmount) AS 'TotalAmount'
 from BIL_TXN_InvoiceReturn ret, BIL_TXN_BillingTransaction txn
 where ret.BillingTransactionId = txn.BillingTransactionId
 and txn.BillStatus='unpaid' and ISNULL(txn.IsInsuranceBilling,0)= @IsInsurance
 GROUP BY Convert(date,ret.CreatedOn)
) crRet
ON d.BillingDate = crRet.BillingDate

ORDER BY d.BillingDate

END
GO
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_DepartmentSalesDaybook]    Script Date: 8/8/2019 11:52:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BILL_DepartmentSalesDaybook]--[SP_Report_BILL_DepartmentSalesDaybook] '2018-08-08','2018-08-08' 
	@FromDate Date=null ,
	@ToDate Date=null	,
	@IsInsurance bit=0
AS
/*
FileName: [SP_Report_BILL_DepartmentSalesDaybook]
CreatedBy/date: Dinesh/2018-08-01
Description: to get the collection department wise 
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       Dinesh/2018-08-01					NA										
1       Sud/06Aug'29                 Added clause for Insurance

*/


BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN 
			;With DepartmentWiseSalesCTE as
  (
  
  select 
  --(Cast(ROW_NUMBER() OVER (ORDER BY  ServiceDepartmentName)   as int)) as SN,
  Convert(date,vwTxnItm.BillingDate) 'Date',
        sd.ServiceDepartmentName, itms.ItemName,
   CASE when (sd.ServiceDepartmentName='Biochemistry' ) 
       OR(sd.ServiceDepartmentName='HEMATOLOGY' )
       OR(sd.ServiceDepartmentName='ATOMIC ABSORTION') 
       OR(sd.ServiceDepartmentName='CLNICAL PATHOLOGY' )
       OR(sd.ServiceDepartmentName='CYTOLOGY'  )
       OR(sd.ServiceDepartmentName='KIDNEY BIOPSY'  )
       OR(sd.ServiceDepartmentName='SKIN BIOPSY'  )
       OR(sd.ServiceDepartmentName='CONJUNCTIVAL BIOPSY' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB-3' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 1' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 2'  )
	   OR(sd.ServiceDepartmentName='HISTOPATHOLOGY'  )
	   OR(sd.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY'  )
	   OR(sd.ServiceDepartmentName='MOLECULAR DIAGNOSTICS'  )
	   OR(sd.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS'  )
	   OR(sd.ServiceDepartmentName='SEROLOGY'  )
	   OR(sd.ServiceDepartmentName='LABORATORY'  )
	   OR(sd.ServiceDepartmentName='MICROBIOLOGY'  )



    then 'LABS'  
	when (sd.ServiceDepartmentName='DUCT')
OR(sd.ServiceDepartmentName='MAMMOLOGY')
OR(sd.ServiceDepartmentName='PERFORMANCE TEST') 
OR(sd.ServiceDepartmentName='MRI')
OR(sd.ServiceDepartmentName='C.T. SCAN')
OR(sd.ServiceDepartmentName='ULTRASOUND')
OR(sd.ServiceDepartmentName='ULTRASOUND COLOR DOPPLER')
OR(sd.ServiceDepartmentName='BMD-BONEDENSITOMETRY')
OR(sd.ServiceDepartmentName='OPG-ORTHOPANTOGRAM')
OR(sd.ServiceDepartmentName='MAMMOGRAPHY')
OR(sd.ServiceDepartmentName='X-RAY')
OR(sd.ServiceDepartmentName='DEXA')
OR(sd.ServiceDepartmentName='IMAGING')
then ('RADIOLOGY')
when(sd.ServiceDepartmentName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
OR(sd.ServiceDepartmentName='CARDIOVASCULAR SURGERY')
then 'CTVS'
     ELSE sd.ServiceDepartmentName END as 'ServDeptName',
	 ISNULL(vwTxnItm.PaidQuantity,0)+ISNULL(vwTxnItm.UnpaidQuantity,0) as Quantity ,
     ISNULL(vwTxnItm.PaidSubTotal,0)+ISNULL(vwTxnItm.UnpaidSubTotal,0)  as SubTotal,
     ISNULL(vwTxnItm.PaidTax,0)+ISNULL(vwTxnItm.UnpaidTax,0) as Tax,
     ISNULL(vwTxnItm.PaidDiscountAmount,0)+ISNULL(vwTxnItm.UnpaidDiscountAmount,0) as DiscountAmount,
     ISNULL(vwTxnItm.PaidTotalAmount,0)+ISNULL(vwTxnItm.UnpaidTotalAmount,0) as TotalAmount,
	-----------Testing Remove later on ---------------
	
	ISNULL(vwTxnItm.CancelSubTotal,0) as CancelSubTotal,
	 ISNULL(vwTxnItm.CancelDiscountAmount,0) as CancelDiscountAmount,
	  --ISNULL(cancelonsameday.CancelTotalAmountDay,0) as CancelTotalAmountDay,
	  --  ISNULL(cancelonsameday.CancelDiscountAmountDay,0) as CancelDiscountDay,
	 
	 -----------Testing Remove later on ---------------
   ISNULL(vwTxnItm.CancelTotalAmount,0) 'CancelAmount',
   ISNULL(vwTxnItm.CancelTax,0) 'CancelTax',
    ( case when BillStatus='return' then (ISNULL(vwTxnItm.ReturnTotalAmount,0)) 
	 ELSE 0 END) as ReturnAmount,
     ISNULL(vwTxnItm.ReturnTax,0) AS ReturnTax
    from BIL_MST_ServiceDepartment sd, BIL_CFG_BillItemPrice itms, VW_BIL_TxnItemsInfo vwTxnItm 

	  where   vwTxnItm.BillingDate between Convert(date, @FromDate) AND  Convert(date, @ToDate) 
       AND vwTxnItm.ServiceDepartmentId  = sd.ServiceDepartmentId
     AND vwTxnItm.ItemId=itms.ItemId
     AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
	 AND  ISNULL(vwTxnItm.IsInsurance,0)= @IsInsurance

      
) 
Select 
convert(date,@FromDate) 'FromDate',
     convert(date,@ToDate) 'ToDate',
     txnItms.ServDeptName 'ServDeptName',
	 sum(txnItms.Quantity) 'Quantity',
     sum(txnItms.SubTotal) 'Price',
     round(sum(txnItms.Tax),2) as 'Tax',
     sum(txnItms.DiscountAmount) 'DiscountAmount',
     sum(txnItms.TotalAmount) 'TotalAmount',
     sum(txnItms.ReturnAmount) 'ReturnAmount',
     sum(txnItms.ReturnTax) 'ReturnTax',
   Sum(txnItms.CancelAmount) 'CancelAmount',
   Sum(txnItms.CancelTax) 'CancelTax',
   Sum(txnItms.TotalAmount)-Sum(txnItms.Tax)-sum(txnItms.ReturnAmount) 'NetSales'
  -- Sum(txnItms.CancelTotalAmountDay) 'CancelTotalAmountDay',
  --Sum (txnItms.CancelDiscountDay) 'CancelDiscountDay'
from DepartmentWiseSalesCTE txnItms 
group by txnItms.ServDeptName

	END	
END
GO
GO

---end: sud:8Aug'19--Billing Reports - Exclude Insurance Items from Normal report and so on --


--start: sud:11Aug'19--Enable/Disable Date Filter in Edit Doctor Page of Billing--
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Billing','EnableDateFilterInEditDoctor','false','boolean','Enable or Disable Date Filter in Edit Doctor Page. True for MNK, false for others','custom');
Go
--end: sud:11Aug'19--Enable/Disable Date Filter in Edit Doctor Page of Billing--


--ANish:11Aug'19-Start: Adding parameter for Email Settings for Radiology Module--
Insert into CORE_CFG_Parameters
values('Radiology','EmailSettings','{ "EnableSendEmail":false,  "SenderEmail":"someting@gmail.com", "SenderTitle":"Danphe Hospital", "TextContent":true, "PdfContent":false  }','json','Radiology Email Sending Settings','custom');
Go
--Anish:11Aug'19- ENd-----	

--START: Yubraj: 12 Aug'19--Enable/Disable Ticket Price in OPD Sticker Slip/Page Visit/CheckIn--
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Appointment','EnableTicketPriceInVisit','false','boolean','Enable or Disable Ticket Price in OPD Sticker Slip/Page Visit/CheckIn, by default false is assign','custom');
Go
--END: Yubraj: 12 Aug'19--Enable/Disable Ticket Price in OPD Sticker Slip/Page Visit/CheckIn--

--START: Yubraj: 13 Aug'19--Update storedProcedure 'SP_APPT_GetPatientVisitStickerInfo' --

/****** Object:  StoredProcedure [dbo].[SP_APPT_GetPatientVisitStickerInfo]    Script Date: 8/13/2019 10:11:45 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_APPT_GetPatientVisitStickerInfo]  --- SP_APPT_GetPatientVisitStickerInfo 76
		
@PatientVisitId INT=null
AS
/*
FileName: SP_APPT_GetPatientVisitStickerInfo
CreatedBy/date: Yubraj / 2019-06-23
Description: Get patient's current visit details. 

Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      Yubraj/23rd June'19                     Created.
-----------------------------------------------------------------------------------------
*/
BEGIN
select 
	visit.AppointmentType 'AppointmentType',
	visit.VisitType 'VisitType',
	visit.VisitCode 'VisitCode',
	visit.ProviderName 'DoctorName',
	visit.VisitDate 'VisitDate',
	visit.VisitTime 'VisitTime',
	CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) 'PatientName',
	pat.PatientCode 'PatientCode',
	pat.DateOfBirth 'DateOfBrith',
	pat.Gender 'Gender',
	pat.Address 'Address',
	pat.PhoneNumber 'PhoneNumber',
	subCounty.CountrySubDivisionName 'District',
	dep.DepartmentName 'Department',
	doc.RoomNo 'RoomNo',
	usr.UserName 'User',
	bilTxnItms.ServiceDepartmentName,
	ISNULL(bilTxnItms.TotalAmount,0) 'OpdTicketCharge'
	 
	from PAT_PatientVisits visit join PAT_Patient pat on pat.PatientId=visit.PatientId
						join MST_CountrySubDivision subCounty on subCounty.CountrySubDivisionId=pat.CountrySubDivisionId
						join MST_Department dep on dep.DepartmentId= visit.DepartmentId
						join RBAC_User usr on usr.EmployeeId=visit.CreatedBy
						
						left join EMP_Employee doc on doc.EmployeeId=visit.ProviderId

						left join (Select * from BIL_TXN_BillingTransactionItems where PatientVisitId=@PatientVisitId
						               and ServiceDepartmentName IN ('OPD'
																	 , 'Department OPD'
																	 ,'Department Followup Charges'
																	 ,'Doctor Followup Charges'
																	 ,'Department OPD Old Patient'
																	 ,'Doctor OPD Old Patient')) bilTxnItms  
						   						   on  visit.PatientVisitId = bilTxnItms.PatientVisitId				

						where visit.PatientVisitId=@PatientVisitId 
						
END -- end of SP
GO
--END: Yubraj: 13 Aug'19--Update storedProcedure 'SP_APPT_GetPatientVisitStickerInfo' --
--START: NageshBB: 15 Aug'19 --Corrected stored procedure for get manually added ip Billing (bed ) item quantity

/****** Object:  StoredProcedure [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]    Script Date: 13-08-2019 14:22:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE  [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]  
  @PatientId INT,  
  @BillTxnId INT=NULL,
  @BillStatus Varchar(50) = NULL
AS
/*
FileName: [SP_BIL_GetItems_ForIPBillingReceipt]
CreatedBy/date: sud/14Sept'18
Description: 
Remarks:  Need to handle provisional etc carefully, else number of items could be more.. 
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       sud/14Sept'18            Initial draft
2       sud/13Mar'19             Adding Salutation in DoctorName
3		Nagesh/04 June 2019  	 Getting correct bed quantity for estimated bill of adt patient
4		Nagesh/15 Aug 2019		Get quantity if manually added any bed charges item
-------------------------------------------------------------------------------
*/

BEGIN
;with a as(
Select Convert(DATE, itm.CreatedOn) 'BillDate',dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, emp.EmployeeId 'DoctorId',IsNull(emp.Salutation+'. ','')+  emp.FirstName+ ISNULL(' '+emp.MiddleName, '')+' ' + emp.LastName 'DoctorName',itm.Price,
	    case when (@BillTxnId >0 or itm.ModifiedOn is not null ) 
		then itm.Quantity 
		else 
		case WHEN ((select ParameterValue from CORE_CFG_Parameters where ParameterGroupName='ADT' and ParameterName='Bed_Charges_SevDeptId')= itm.ServiceDepartmentId  and (select count(*) from ADT_TXN_PatientBedInfo pbi where pbi.PatientId=@PatientId and pbi.PatientVisitId=itm.PatientVisitId and pbi.BedFeatureId=itm.ItemId) >0 )
		then  (SELECT Sum(Quantity)FROM (select ([dbo].[FN_Ip_Billing_Bed_Quantity_Calculation](pbi.StartedOn,pbi.EndedOn,adt.AdmissionDate)) as Quantity	   FROM      ADT_TXN_PatientBedInfo pbi join ADT_PatientAdmission adt on pbi.PatientVisitId = adt.PatientVisitId 
		where pbi.PatientId=itm.PatientId and pbi.PatientVisitId=itm.PatientVisitId and  pbi.BedFeatureId=itm.ItemId) AS TOTALS)		   			
		else (itm.Quantity)  
		END		
	   end as Quantity	  
	    ,itm.SubTotal  
	    ,itm.DiscountAmount
	    ,itm.Tax 
		,itm.TotalAmount
	  ,itm.ServiceDepartmentId, itm.ItemId
	  ,case when (itm.ModifiedOn is not null) then 
	    1 else 0 end as IsEdited		   
	FROM BIL_TXN_BillingTransactionItems itm
	left join EMP_Employee emp on itm.ProviderId = emp.EmployeeId
	WHERE PatientId=@PatientId 
	  AND ISNULL(itm.BillingTransactionId,0) =  ISNULL(@BillTxnId, ISNULL(itm.BillingTransactionId,0))
	  AND itm.BillStatus= ISNULL(@BillStatus,itm.BillStatus) AND Quantity >0
	  ) select BillDate,ItemGroupName, ItemName,DoctorId,DoctorName,Price,Quantity, Price*Quantity as SubTotal, DiscountAmount,Tax,((Price * Quantity - DiscountAmount)+Tax)as TotalAmount,ServiceDepartmentId,ItemId ,IsEdited from a
END
Go
--END: NageshBB: 13 Aug'19 --Corrected stored procedure for get manually added ip Billing (bed ) item quantity

--START: YUBRAJ: 13 Aug'19 --Added Column PrintedOn, PrintedBy in table BIL_TXN_BillingTransaction, BIL_TXN_Deposit and BIL_TXN_Settlements tables each--
Alter table  BIL_TXN_BillingTransaction
ADD PrintedOn datetime, PrintedBy int;
Go

ALTER TABLE BIL_TXN_Deposit
ADD PrintedOn datetime, PrintedBy int;
Go

ALTER TABLE BIL_TXN_Settlements
ADD PrintedOn datetime, PrintedBy int;
Go
--END: YUBRAJ: 13 Aug'19 --Added Column PrintedOn, PrintedBy in table BIL_TXN_BillingTransaction, BIL_TXN_Deposit and BIL_TXN_Settlements tables each--

--ANish: start 13 August 2019, Printing Info of Lab Report Added--
Alter table LAB_TXN_LabReports
  Add PrintedOn datetime null, PrintedBy int null
  Go

  Alter table LAB_TXN_LabReports
  Add PrintCount int null  CONSTRAINT DEF_Printcount DEFAULT '0'
  WITH VALUES;
  Go
 
 Update LAB_TXN_LabReports
 set PrintedOn=ReportingDate, PrintCount = 1 where IsPrinted = 1
 Go
Insert into CORE_CFG_Parameters
values('LAB','DisplayingPrintInfo','false','boolean','Showing/Hiding the Print count, Printed By info on Lab Report','custom');
Go

Update LAB_TXN_LabReports
  set PrintedBy = CreatedBy, PrintedOn = CreatedOn, PrintCount = 1
  where IsPrinted = 1;
  Go
  Update LAB_TXN_LabReports
  set PrintCount = 0
  where IsPrinted Is Null;
  Go

--ANish: End 13 August 2019, Printing Info of Lab Report Added--

--Sanjit: Start: 14 August 2019, Create Item Sub Category Table , Add SubcategoryId in Item Master and recreate the Item Categroy table for consistency 
GO
CREATE TABLE [dbo].[INV_MST_ItemSubCategory](
 [SubCategoryId] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
 [Code] [varchar](6) NOT NULL UNIQUE,
 [SubCategoryName] [varchar](100) NOT NULL,
 [AccountHeadId] [int] NOT NULL,
 [CreatedOn] [datetime] NOT NULL,
 [CreatedBy] [int] NOT NULL,
 [IsActive] [bit] NOT NULL,
 [IsConsumable] [bit] NOT NULL,
 [Description] [varchar](100) NULL)
GO
Alter Table INV_MST_Item
Add SubCategoryId int
GO
ALTER TABLE [dbo].[INV_MST_ItemCategory] DROP CONSTRAINT [FK_INV_MST_ItemCategory_Emp_Employee]
GO

ALTER TABLE [dbo].[INV_MST_Item] DROP CONSTRAINT [FK_INV_MST_Item_INV_MST_ItemCategory]
GO
/****** Object:  Table [dbo].[INV_MST_ItemCategory]    Script Date: 8/13/2019 11:19:19 AM ******/
DROP TABLE [dbo].[INV_MST_ItemCategory]
GO

/****** Object:  Table [dbo].[INV_MST_ItemCategory]    Script Date: 8/13/2019 11:19:19 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[INV_MST_ItemCategory](
 [ItemCategoryId] [int] IDENTITY(1,1) NOT NULL,
 [ItemCategoryName] [varchar](100) NULL,
 [CreatedOn] [datetime] NOT NULL,
 [CreatedBy] [int] NOT NULL,
 [IsActive] [bit] NULL,
 [Description] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
 [ItemCategoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[INV_MST_ItemCategory]  WITH CHECK ADD  CONSTRAINT [FK_INV_MST_ItemCategory_Emp_Employee] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[EMP_Employee] ([EmployeeId])
GO

ALTER TABLE [dbo].[INV_MST_Item]  WITH CHECK ADD  CONSTRAINT [FK_INV_MST_Item_INV_MST_ItemCategory] FOREIGN KEY([ItemCategoryId])
REFERENCES [dbo].[INV_MST_ItemCategory] ([ItemCategoryId])
GO

ALTER TABLE [dbo].[INV_MST_ItemCategory] CHECK CONSTRAINT [FK_INV_MST_ItemCategory_Emp_Employee]
GO



INSERT INTO [dbo].[INV_MST_ItemCategory] ([ItemCategoryName],[CreatedOn],[CreatedBy],[IsActive],[Description])
VALUES ('Capital Goods',GETDATE(),1,1,''),('Consumables',GETDATE(),1,1,'')
GO
--Sanjit: End: 14 August 2019, Create Item Sub Category Table , Add SubcategoryId in Item Master and recreate the Item Categroy table for consistency
--Narayan 14th Aug 2019, table created for Sales Category List 
/****** Object:  Table [dbo].[PHRM_MST_SalesCategory]    Script Date: 08/08/2019 12:58:00 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].PHRM_MST_SalesCategory(
	[SalesCategoryId] [int] IDENTITY(1,1) NOT NULL,
	[Name] [varchar](200) NULL,
	[Description] [varchar](255) NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[IsBatchApplicable] [bit] NULL,
	[IsExpiryApplicable] [bit] NULL,
	[IsActive] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[SalesCategoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
--Added One columnnamed SalesCategoryId  in PHRM_MST_Item --

ALTER TABLE [dbo].[PHRM_MST_Item]
ADD SalesCategoryId  int ;

--Narayan 14th Aug 2019, table created for Sales Category List 


--Start Ajay 14 Aug 2019 --Accounting changes --Hospital and Rules Mapping scenario changes, added new rules for manmohan hospital
--Create table Hospital for accouting
CREATE TABLE [dbo].[ACC_MST_Hospital](
  [HospitalId] [int] IDENTITY(1,1) NOT NULL,
  [HospitalShortName] [varchar](100) NULL,
  [HospitalLongName] [varchar](500) NULL,
  [IsActive] [bit] NULL,
 CONSTRAINT [PK_HospitalId] PRIMARY KEY CLUSTERED 
(
  [HospitalId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

--create table for accounting hospital and transfer rule mapping
CREATE TABLE [dbo].[ACC_MST_Hospital_TransferRules_Mapping](
  [HospitalTransferRulesMapId] [int] IDENTITY(1,1) NOT NULL,
  [HospitalId] [int] NULL,
  [TransferRuleId] [int] NULL,
  [IsActive] [bit] NULL,
 CONSTRAINT [PK_HospitalTransferRulesMapId] PRIMARY KEY CLUSTERED 
(
  [HospitalTransferRulesMapId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

--insert HAMS hospital records into ACC_MST_Hospital table
INSERT INTO [ACC_MST_Hospital] (HospitalShortName,HospitalLongName,IsActive)
VALUES
('HAMS','Hospital For Advanced Medicine and Surgery',1)
GO

--set current rule for HAMS hospital
insert into ACC_MST_Hospital_TransferRules_Mapping
([HospitalId],[TransferRuleId],[IsActive])
(select 
  (select HospitalId from [ACC_MST_Hospital] where HospitalShortName = 'HAMS') as HospitalId,
  GroupMappingId as TransferRuleId,
  1 as IsActive
 from ACC_MST_GroupMapping)
GO

----------------------------------------------------------------------------------
--inserting manmohan hospital records
INSERT INTO [ACC_MST_Hospital] (HospitalShortName,HospitalLongName,IsActive)
VALUES
('MMTH','Manmohan Memorial Medical College & Teaching Hospital',0)
GO

---------------------------------------
--inserting new transfer rules for Manmohan hosp
insert into ACC_MST_GroupMapping
([Description],[Section],[VoucherId],[Remarks])
ValUes
--billing rules
('CreditBillFromDeposit',2,(select VoucherId from ACC_MST_Vouchers where VoucherName = 'Journal Voucher'),'Added Rule for MMTH'),
('BillFromDepositAndCredit',2,(select VoucherId from ACC_MST_Vouchers where VoucherName = 'Sales Voucher'),'Added Rule for MMTH'),
('CreditBillFromDepositAndDepositReturn',2,(select VoucherId from ACC_MST_Vouchers where VoucherName = 'Payment Voucher'),'Added Rule for MMTH'),
('CreditBillSettlement',2,(select VoucherId from ACC_MST_Vouchers where VoucherName = 'Payment Voucher'),'Added Rule for MMTH'),
--inv rules
('INVDeptConsumedGoods',1,(select VoucherId from ACC_MST_Vouchers where VoucherName = 'Journal Voucher'),'Added Rule for MMTH'),
('INVWriteOff',1,(select VoucherId from ACC_MST_Vouchers where VoucherName = 'Journal Voucher'),'Added Rule for MMTH')
GO

--Inserting mapping detalis for new transfer rules
insert into ACC_MST_MappingDetail
(GroupMappingId,LedgerGroupId,DrCr)
values
--CreditBillFromDeposit
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDeposit' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Patient Deposits (Liability)'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDeposit' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Sundry Debtors'),
	0
),
--BillFromDepositAndCredit
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Patient Deposits (Liability)'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Sundry Debtors'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Expenses' and COA = 'Indirect Expenses' and LedgerGroupName = 'Administration Expenses'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Revenue' and COA = 'Direct Income' and LedgerGroupName = 'Sales'),
	0
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'),
	0
),
--CreditBillFromDepositAndDepositReturn
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDepositAndDepositReturn' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Patient Deposits (Liability)'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDepositAndDepositReturn' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Sundry Debtors'),
	0
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDepositAndDepositReturn' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Cash In Hand'),
	0
),
--CreditBillSettlement
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillSettlement' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Patient Deposits (Liability)'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillSettlement' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Expenses' and COA = 'Indirect Expenses' and LedgerGroupName = 'Administration Expenses'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillSettlement' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Cash In Hand'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillSettlement' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Sundry Debtors'),
	0
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillSettlement' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'),
	0
),
--INVDeptConsumedGoods
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVDeptConsumedGoods' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Expenses' and COA = 'Direct Expense' and LedgerGroupName = 'Cost of Goods Sold'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVDeptConsumedGoods' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Inventory'),
	0
),
--INVWriteOff
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVWriteOff' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Expenses' and COA = 'Direct Expense' and LedgerGroupName = 'Cost of Goods Sold'),
	1
),
(
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVWriteOff' and Remarks like '%MMTH%'),
	(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Inventory'),
	0
)
GO

--updating description of mapping details
declare @Id int;
declare @cnt int;
select @cnt=MAX(AccountingMappingDetailId) from ACC_MST_MappingDetail
set @id=1;
while(@cnt>=@id)
begin
UPDATE ACC_MST_MappingDetail
		SET Description=(
			SELECT gm.Description+REPLACE(lg.LedgerGroupName,' ','') FROM ACC_MST_MappingDetail md
			JOIN ACC_MST_GroupMapping gm ON md.GroupMappingId=gm.GroupMappingId
			JOIN ACC_MST_LedgerGroup lg ON md.LedgerGroupId=lg.LedgerGroupId
			WHERE md.AccountingMappingDetailId=@Id AND md.Description IS NULL)
		WHERE AccountingMappingDetailId=@Id AND Description IS NULL;
		set @Id = @Id + 1;
end
GO

--inserting mapping records for Manmohan hospital
insert into ACC_MST_Hospital_TransferRules_Mapping
([HospitalId],[TransferRuleId],[IsActive])
values
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CashBill'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBill'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillPaid'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CashBillReturn'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillReturn'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='DepositAdd'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='DepositReturn'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillPaidFromDeposit'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCash'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDeposit' and Remarks like '%MMTH%'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit' and Remarks like '%MMTH%'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDepositAndDepositReturn' and Remarks like '%MMTH%'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillSettlement' and Remarks like '%MMTH%'),
	1
),
--Inventory
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCreditGoodReceipt'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCreditPaidGoodReceipt'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCashGoodReceipt1'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCashGoodReceipt2'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVReturnToVendorCashGR'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVReturnToVendorCreditGR'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCreditGoodReceiptFixedAsset'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCashGoodReceiptFixedAsset1'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCashGoodReceiptFixedAsset2'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVWriteOff' and Remarks like '%MMTH%'),
	1
),
(
	(select HospitalId from ACC_MST_Hospital where HospitalShortName='MMTH'),
	(select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVDeptConsumedGoods' and Remarks like '%MMTH%'),
	1
)
GO
--End Ajay 14 Aug 2019 --Accounting changes --Hospital and Rules Mapping scenario changes

--Start: Salakha 14th Aug 2019 --Created table for Patients Birth/Death Certificate
/****** Object:  Table [dbo].[ADT_PatientCertificate]    Script Date: 14-08-2019 18:07:17 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ADT_PatientCertificate](
	[CertificateId] [int] IDENTITY(1,1) NOT NULL,
	[FiscalYearName] [nvarchar](50) NULL,
	[CertificateNumber] [nvarchar](50) NOT NULL,
	[CertificateType] [nvarchar](50) NULL,
	[IssuedBySignatories] [nvarchar](max) NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[DischargeSummaryId] [int] NULL,
	[CertifiedBySignatories] [nvarchar](max) NOT NULL,
	[BirthType] [nvarchar](max) NULL,
	[DeathDate] [date] NULL,
	[DeathTime] [time](7) NULL,
	[DeathCause] [nvarchar](max) NULL,
	[FatherName] [nvarchar](50) NULL,
	[MotherName] [nvarchar](50) NULL,
	[Spouse] [nvarchar](50) NULL,
 CONSTRAINT [PK_ADT_PatientCertificate] PRIMARY KEY CLUSTERED 
(
	[CertificateId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

INSERT INTO [dbo].[CORE_CFG_Parameters]
           ([ParameterGroupName]
           ,[ParameterName]
           ,[ParameterValue]
           ,[ValueDataType]
           ,[Description]
           ,[ParameterType])
     VALUES
           ('ADT','BabyBirthType','["single birth","twin","multiple by","spontaneous vaginal delivery","instrumental delivery","cesarean section","other"]','array','to select birth type for birth certificate','custom')
GO

ALTER TABLE [ADT_BabyBirthDetails]
ALTER COLUMN CertificateNumber nvarchar(MAX) null;
Go
--End : Salakha 14 Aug 2019 ---Created table for Patients Birth/Death Certificate


--start: sud: 18Aug'19--For Radiology Image Upload etc--
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Radiology','ReportImagesFolderPath','C:\\DanpheHealthInc_PvtLtd_Files\\Data\\Radiology\\ReportImages\\','string','folder location to store Patient Images from Radiology Add Report page.','custom');
Go

Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
VALUES('Radiology','EnableDicomImages','false','boolean','enable or disable dicom processing for Radiology Reports','custom');
Go

Update CORE_CFG_Parameters
SET ParameterValue='false', ValueDataType='string', ParameterName='EnableImageUpload'
WHERE ParameterGroupName='Radiology' AND ParameterName='ImageUpload'
GO
--end: sud: 18Aug'19--For Radiology Image Upload etc--

--Pratik: start 19 Aug, 2019--- All valuetype array parameters changed to custom parameter type---
update CORE_CFG_Parameters
set ValueDataType ='array'
where ParameterGroupName = 'ADT' and ParameterName = 'DeathDischargeType';
Go

Update CORE_CFG_Parameters 
set ParameterType='custom'
where ValueDataType='array';
Go
--Pratik: End 19 Aug, 2019---

--Anish: start 19 Aug, 2019-----
Insert into CORE_CFG_Parameters
values('LAB','ShowReportDispatcherSignature','false','boolean','Show/Hide the Signature of Lab Technician who dispatches the Lab Report','custom');
Go
--Anish: End 19 Aug, 2019---


--start: sud:19Aug'19--for billing reports---

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_IncomeSegregation]    Script Date: 8/19/2019 10:38:24 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_IncomeSegregation]
	--SP_Report_BIL_IncomeSegregation '2018-12-09','2018-12-09' 
	@FromDate Date=null ,
	@ToDate Date=null,
	@IsInsurance bit=0	
AS
/*
FileName: [SP_Report_BIL_IncomeSegregation]
CreatedBy/date: Dinesh/2018-0-03
Description: to get the income head of different department and sales related data
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date				Remarks
---------------------------------------------------------------------------------
1.		Ramavtar/23Sep'18			initial draft
2		Dinesh / 24th Sep'18		Manakamana hospital requirement changes
3.		Ramavar/24Sep'18			corrected report 
4.		Dinesh/29Nov'18				customizing for Hams Hospital
5.		Nagesh/09Dec'18				changes for remove 0 values record and Credit Amount mismatch
6.		Nagesh/12Dec'18				totally changed code of sp, here i'm removed all old logic and code
								    because it was 400 line query and not showing correct result for provisional -> Credit Bill
									here we are using View and Function ([VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation],FN_BIL_GetSrvDeptReportingName)
7.		Nagesh/17Dec'18				altered for handle bug - last days credit bill showing cash bill on settlement day
8.      Sud/8Aug'19                 For Insurance Information 
9.      Sud/19Aug'19                some Insurance Informatin missing in earlier. 
-------------------------------------------------------------------------------
*/
BEGIN
 ;
  WITH IncomeSegCTE As (
--Cash Sale  which has paidDate, here paid date as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation](ServiceDepartmentName,ItemName) as ServDeptName
,PaidDate as BillingDate,Quantity as Unit, SubTotal as CashSales,DiscountAmount as CashDiscount,0 as CreditSales,0 as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from [VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation] 
where PaidDate between  CONVERT(date, @FromDate) 
AND CONVERT(date, @ToDate) and PaidDate is not null 
and CreditDate is null
AND IsNull(IsInsurance,0) = @IsInsurance
),
 IncomeSegCreditCTE
  AS(
--Credit Sale, which has CreditDate, here CreditDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation](ServiceDepartmentName,ItemName) as ServDeptName
,CreditDate as BillingDate,Quantity as Unit, 0 as CashSales,0 as CashDiscount,SubTotal as CreditSales,DiscountAmount as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from [VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation] 
where CreditDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
and CreditDate is not null
AND IsNull(IsInsurance,0) = @IsInsurance
),
 IncomeSegCreditReturnedCTE
  AS(
--Return Sale, which has Return Date, here ReturnDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation](ServiceDepartmentName,ItemName) as ServDeptName
,ReturnDate as BillingDate,0 as Unit, 0 as CashSales,0 as CashDiscount,0 as CreditSales,0 as CreditDiscount, Quantity as ReturnQuantity, SubTotal as ReturnAmount, DiscountAmount as ReturnDiscount
from [VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation] 
where ReturnDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and ReturnDate is not null
AND IsNull(IsInsurance,0) = @IsInsurance

)SELECT   
    ServDeptName,
	SUM(Unit)-SUM(ReturnQuantity) 'Unit',
    SUM(CashSales) 'CashSales',   
    SUM(CashDiscount) 'CashDiscount',
    SUM(CreditSales) 'CreditSales',    
	SUM(CreditDiscount) 'CreditDiscount',
	SUM(ReturnQuantity) 'ReturnQuantity',
    SUM(ReturnAmount) 'ReturnAmount',   
    SUM(ReturnDiscount) 'ReturnDiscount',  
	SUM(CashSales)+SUM(CreditSales)-SUM(ReturnAmount) 'GrossSales'--,
	,(SUM(CashDiscount)+ SUM(CreditDiscount))- SUM(ReturnDiscount) 'Discount'
   , ((sum(CashSales)+sum(CreditSales)-sum(ReturnAmount))) - ((SUM(CashDiscount)+ SUM(CreditDiscount))- SUM(ReturnDiscount))  'NetSales'	    
  FROM (select *from IncomeSegCTE union all select *from IncomeSegCreditCTE union all select *from IncomeSegCreditReturnedCTE)
  x1 group by ServDeptName
  order by NetSales desc
  End

  GO


 --insert new routes after insurance-billing-reports is separated as module-- 
Declare @PermId INT, @ParentRouteId INT;
SET @PermId=(Select Top 1 permissionid from RBAC_RouteConfig where UrlFullPath='Billing/InsuranceMain/Reports')
SET @ParentRouteId=(Select Top 1 RouteId from RBAC_RouteConfig where UrlFullPath='Reports')

Insert INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DisplaySeq, IsActive)
VALUES('INS-Billing','Reports/InsBillingReports', 'InsBillingReports',@PermId, @ParentRouteId,25,1 )
GO
--end: sud:19Aug'19--for billing reports---

--START: YUBRAJ 18th Aug 2019 ---Alter table Column 'Quantity' for allowing float value
alter table BIL_TXN_Denomination 
alter column Quantity float null
--START: YUBRAJ 18th Aug 2019 ---Alter table Column 'Quantity' for allowing float value


---start:sud:19Aug'19--for radiology--
--change column to nvarchar to support nepali font in different places--
alter table RAD_PatientImagingReport
alter column ReportText nvarchar(max)
GO
alter table EMP_Employee
alter column Signature nvarchar(1000)
GO
alter table EMP_Employee
alter column LongSignature nvarchar(1000)
GO
alter table RAD_PatientImagingReport
alter column Signatories nvarchar(4000)
GO
---end:sud:19Aug'19--for radiology--
--Start: Salakha: 20 August 2019 -- Correction in sp and function to calculate IP bed quantity
/****** Object:  StoredProcedure [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]    Script Date: 12-08-2019 04:27:17 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE  [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]  
  @PatientId INT,  
  @BillTxnId INT=NULL,
  @BillStatus Varchar(50) = NULL
AS
/*
FileName: [SP_BIL_GetItems_ForIPBillingReceipt]
CreatedBy/date: sud/14Sept'18
Description: 
Remarks:  Need to handle provisional etc carefully, else number of items could be more.. 
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       sud/14Sept'18            Initial draft
2       sud/13Mar'19             Adding Salutation in DoctorName
3		Nagesh/04 June 2019  	 Getting correct bed quantity for estimated bill of adt patient
4		Nagesh/15 Aug 2019		Get quantity if manually added any bed charges item
-------------------------------------------------------------------------------
*/

BEGIN
;with a as(
Select Convert(DATE, itm.CreatedOn) 'BillDate',dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, emp.EmployeeId 'DoctorId',IsNull(emp.Salutation+'. ','')+  emp.FirstName+ ISNULL(' '+emp.MiddleName, '')+' ' + emp.LastName 'DoctorName',itm.Price,
	    case when (@BillTxnId >0 or itm.ModifiedOn is not null ) 
		then itm.Quantity 
		else 
		case WHEN ((select ParameterValue from CORE_CFG_Parameters where ParameterGroupName='ADT' and ParameterName='Bed_Charges_SevDeptId')= itm.ServiceDepartmentId  and (select count(*) from ADT_TXN_PatientBedInfo pbi where pbi.PatientId=@PatientId and pbi.PatientVisitId=itm.PatientVisitId and pbi.BedFeatureId=itm.ItemId) >0 )
		then  (SELECT Sum(Quantity)FROM (select ([dbo].[FN_Ip_Billing_Bed_Quantity_Calculation](pbi.StartedOn,pbi.EndedOn,adt.AdmissionDate)) as Quantity	   FROM      ADT_TXN_PatientBedInfo pbi join ADT_PatientAdmission adt on pbi.PatientVisitId = adt.PatientVisitId 
		where pbi.PatientId=itm.PatientId and pbi.PatientVisitId=itm.PatientVisitId and  pbi.BedFeatureId=itm.ItemId) AS TOTALS)		   			
		else (itm.Quantity)  
		END		
	   end as Quantity	  
	    ,itm.SubTotal  
	    ,itm.DiscountAmount
	    ,itm.Tax 
		,itm.TotalAmount
	  ,itm.ServiceDepartmentId, itm.ItemId
	  ,case when (itm.ModifiedOn is not null) then 
	    1 else 0 end as IsEdited		   
	FROM BIL_TXN_BillingTransactionItems itm
	left join EMP_Employee emp on itm.ProviderId = emp.EmployeeId
	WHERE PatientId=@PatientId 
	  AND ISNULL(itm.BillingTransactionId,0) =  ISNULL(@BillTxnId, ISNULL(itm.BillingTransactionId,0))
	  AND itm.BillStatus= ISNULL(@BillStatus,itm.BillStatus) --AND Quantity >0
	  ) select BillDate,ItemGroupName, ItemName,DoctorId,DoctorName,Price,Quantity, Price*Quantity as SubTotal, DiscountAmount,Tax,((Price * Quantity - DiscountAmount)+Tax)as TotalAmount,ServiceDepartmentId,ItemId ,IsEdited from a
END
GO


/****** Object:  UserDefinedFunction [dbo].[FN_Ip_Billing_Bed_Quantity_Calculation]    Script Date: 09-08-2019 20:39:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_Ip_Billing_Bed_Quantity_Calculation]( @StartDate datetime, @EndDate datetime null, @AdmissionDate datetime)
RETURNS int
AS
BEGIN

  -- Declare the return variable here
  DECLARE @Quantity int;
  DECLARE @CheckOutTime Datetime;
  
  set  @CheckOutTime = CONVERT(DATETIME, CONVERT(CHAR(8), GETDATE(), 112)  + ' ' + CONVERT(CHAR(8), @AdmissionDate, 108));
  
  IF (@EndDate IS NULL)
  BEGIN
		IF(@CheckOutTime <= GETDATE())
		BEGIN 
			SET @Quantity = (select cast((select DATEDIFF(HOUR,@CheckOutTime,@StartDate)) as decimal)/24 + 1)
		END
		ELSE
		BEGIN
		SET @Quantity = (select cast((select DATEDIFF(HOUR,@StartDate,@CheckOutTime)) as decimal)/24 + 1)
		END
  END
  ELSE
   BEGIN 
    SET @Quantity = (select cast ( cast(DATEDIFF(HOUR,@StartDate,@EndDate)as decimal)/24 as int ) )
  END
  RETURN @Quantity;

END
GO
--End : Salakha: 20 August 2019 --Correction in sp and function to calculate IP bed quantity--

--Start: Anish: 22 August 2019---
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Lab' and ApplicationCode='LAB');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('lab-report-dispatch-view',@ApplicationID,1,GETDATE(),1);
Go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='lab-report-dispatch-view');

Declare @LabParentRouteID INT
SET @LabParentRouteID = (Select Top(1) RouteId from [dbo].[RBAC_RouteConfig] where RouterLink = 'Lab');

Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
Values('Report Dispatch','Lab/ReportDispatch','ReportDispatch',@permissionID,@LabParentRouteID,1,10,1);
Go


Alter table LAB_TestRequisition
Add ResultAddedBy int null, ResultAddedOn DateTime null;
Go

Alter table LAB_TestRequisition
add PrintedBy int null, PrintCount int null; 
Go
Update LAB_TestRequisition
set PrintCount = 0;
Go

Insert into CORE_CFG_Parameters
values('LAB','LabReportFormat','format1','string','Which Format to use in Lab Report','custom');
Go

--End: Anish 22 Aug, 2019---

--Start: Salakha 22 Aug, 2019--
ALTER FUNCTION [dbo].[FN_Ip_Billing_Bed_Quantity_Calculation]( @StartDate datetime, @EndDate datetime null, @AdmissionDate datetime)
RETURNS int
AS
BEGIN

  -- Declare the return variable here
  DECLARE @Quantity int;
  DECLARE @CheckOutTime Datetime;
  DECLARE @EndDateTime Datetime;
  
  set  @CheckOutTime = CONVERT(DATETIME, CONVERT(CHAR(8), GETDATE(), 112)  + ' ' + CONVERT(CHAR(8), @AdmissionDate, 108));
  
  IF (@EndDate IS NULL)
  BEGIN
		IF(@CheckOutTime <= GETDATE())
		BEGIN 
			SET @Quantity = (select cast((select DATEDIFF(HOUR,@StartDate,@CheckOutTime)) as decimal)/24 + 1)
		END
		ELSE
		BEGIN
		SET @Quantity = (select cast((select DATEDIFF(HOUR,@StartDate,@CheckOutTime)) as decimal)/24 + 1)
		END
  END
  ELSE
   BEGIN 
	SET  @EndDateTime = CONVERT(DATETIME, CONVERT(CHAR(8), @EndDate, 112)  + ' ' + CONVERT(CHAR(8), @AdmissionDate, 108))
	if(@EndDateTime >= @EndDate )
	BEGIN
	  SET @Quantity = (select cast ( cast(DATEDIFF(HOUR,@StartDate,@EndDate)as decimal)/24 as int ) + 1 )
	END
	ELSE
	BEGIN
    SET @Quantity =(select  cast(DATEDIFF(HOUR,@StartDate,@EndDate)as decimal)/24   ) 
	END
  END
  RETURN @Quantity;

END
GO
--End: Salakha 22 Augu, 2019--

--Anish: start 23 AUg, 2019--
Create table MSTEmailSendDetail(
 SendId INT IDENTITY(1, 1)  Constraint SendId Primary Key NOT NULL,
 SendBy int not null,
 SendToEmail varchar(100),
 EmailSubject varchar(500),
 SendOn DATETIME,
);
Go
--Anish: End---

--Start: Salakha: 24th August 2019--Alter the sp for not getting null values..
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetPharmacyTransactions]    Script Date: 24-08-2019 14:58:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:    Vikas
-- Create date: 1stjuly 2019 
-- =============================================
ALTER PROCEDURE [dbo].[SP_ACC_GetPharmacyTransactions]
    @FromDate Datetime=null ,
    @ToDate DateTime=null
AS

/************************************************************************
FileName: [SP_ACC_GetPharmacyTransactions]
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/07Jul'19						getting GrDiscountAmount,GrVATAmount,GrCOGSAmount
*************************************************************************/
BEGIN
  IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
  BEGIN
   --Table1: CashInvoice
	 SELECT * from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL AND CONVERT(date, inv.CreateOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
   --Table2: PHRM_TXN_InvoiceItems
	 SELECT * from PHRM_TXN_InvoiceItems inv WHERE  CONVERT(date, inv.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
   --Table3: CashInvoiceReturn
	 SELECT * from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)  
   --Table4: goodsReceipt
	-- select * from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0  AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
	 select CreatedOn, SupplierId, TransactionType, TotalAmount, SubTotal, VATAmount, ISNULL(DiscountAmount, 0) as DiscountAmount, GoodReceiptId from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0  AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
   --Table5: writeoff
    select * from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
 
   --Table6: dispatchToDept && dispatchToDeptRet
   select * from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL AND  CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
   --Table7: GrDiscountAmount,GrVATAmount,GrCOGSAmount
	SELECT
		invoice1.InvoiceId, 
		CASE 
			WHEN invoice1.DiscountAmount IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.DiscountAmount) 
		END AS GrDiscountAmount, 
		CASE 
			WHEN invoice1.VATAmount IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.VATAmount) 
		END AS GrVATAmount, 
		CASE 
			WHEN invoice1.GrCOGS IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.GrCOGS) 
		END AS GrCOGSAmount  
	FROM (
		SELECT
			invitem.invid AS InvoiceId, 
			SUM(invitem.GrItemDisAmt) AS DiscountAmount, 
			SUM(invitem.GrItemVATAmt) AS VATAmount,
			SUM(GrItemTotalAmount) - SUM(invitem.GrItemDisAmt) AS GrCOGS 
			FROM (
				SELECT
					invitm.InvoiceId AS invid, 
					gri.GrPerItemDisAmt * invitm.Quantity AS GrItemDisAmt, 
					gri.GrPerItemVATAmt * invitm.Quantity AS GrItemVATAmt,
					invitm.GrItemPrice * invitm.Quantity AS GrItemTotalAmount 
				FROM
					PHRM_TXN_InvoiceItems invitm
					JOIN PHRM_GoodsReceiptItems gri ON invitm.GrItemId = gri.GoodReceiptItemId) AS invitem 
			JOIN PHRM_TXN_Invoice inv ON invitem.invid = inv.InvoiceId
			WHERE
				inv.IsTransferredToACC IS NULL 
				AND CONVERT(date, inv.CreateOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
			GROUP BY invid) AS invoice1
			RIGHT JOIN (
				SELECT
					invIt.InvoiceId AS InvoiceId 
				FROM
					PHRM_TXN_InvoiceItems invIt 
					JOIN PHRM_TXN_Invoice inv ON invIt.InvoiceId = inv.InvoiceId 
				WHERE  inv.IsTransferredToACC IS NULL 
				AND CONVERT(date, inv.CreateOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
				GROUP  BY invIt.InvoiceId) AS invoice2 
			ON invoice1.InvoiceId = invoice2.InvoiceId 
			Where invoice1.InvoiceId is not null
 END
  ELSE
  BEGIN  
   --Table1: CashInvoice
	 SELECT * from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL 
   --Table2: CashInvoiceReturn
	 SELECT * from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL
   --Table3: goodsReceiptItems
	 select * from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0 
   --Table4: returnToSupplier
	 select * from PHRM_ReturnToSupplier grRet WHERE grRet.IsTransferredToACC IS NULL 
   --Table5: writeoff
    select * from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL 
   --Table6: dispatchToDept && dispatchToDeptRet
   select * from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL 
  --Table7: GrDiscountAmount,GrVATAmount
 	SELECT
		invoice1.InvoiceId, 
		CASE 
			WHEN invoice1.DiscountAmount IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.DiscountAmount) 
		END AS GrDiscountAmount, 
		CASE 
			WHEN invoice1.VATAmount IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.VATAmount) 
		END AS GrVATAmount, 
		CASE 
			WHEN invoice1.GrCOGS IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.GrCOGS) 
		END AS GrCOGSAmount  
	FROM (
		SELECT
			invitem.invid AS InvoiceId, 
			SUM(invitem.GrItemDisAmt) AS DiscountAmount, 
			SUM(invitem.GrItemVATAmt) AS VATAmount,
			SUM(GrItemTotalAmount) - SUM(invitem.GrItemDisAmt) AS GrCOGS 
			FROM (
				SELECT
					invitm.InvoiceId AS invid, 
					gri.GrPerItemDisAmt * invitm.Quantity AS GrItemDisAmt, 
					gri.GrPerItemVATAmt * invitm.Quantity AS GrItemVATAmt,
					invitm.GrItemPrice * invitm.Quantity AS GrItemTotalAmount 
				FROM
					PHRM_TXN_InvoiceItems invitm
					JOIN PHRM_GoodsReceiptItems gri ON invitm.GrItemId = gri.GoodReceiptItemId) AS invitem 
			JOIN PHRM_TXN_Invoice inv ON invitem.invid = inv.InvoiceId
			WHERE
				inv.IsTransferredToACC IS NULL 
			GROUP BY invid) AS invoice1
			RIGHT JOIN (
				SELECT
					invIt.InvoiceId AS InvoiceId 
				FROM
					PHRM_TXN_InvoiceItems invIt 
					JOIN PHRM_TXN_Invoice inv ON invIt.InvoiceId = inv.InvoiceId 
				WHERE  inv.IsTransferredToACC IS NULL 
				GROUP  BY invIt.InvoiceId) AS invoice2 
			ON invoice1.InvoiceId = invoice2.InvoiceId 
			Where invoice1.InvoiceId is not null
  END
END
GO
--End: Salakha: 24 August 2019--

--Anish: Start-25 Aug--
Insert into CORE_CFG_Parameters
values('Common','APIKeyOfEmailSendGrid','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','string','API key of Sendgrid','custom');
Go
--Anish: End--


--Rajesh: Start-25 Aug 2019

 ALTER TABLE PHRM_TXN_Invoice
 ADD SettlementId int null;
 GO
  
 ALTER TABLE PHRM_TXN_Invoice
 ADD PaidDate datetime null;
 GO
  
ALTER TABLE PHRM_TXN_Invoice
ADD CreditDate datetime null;
GO

--sud: added script to drop if exists-- since below script was altered after 2 days--
 IF(OBJECT_ID('PHRM_TXN_Settlement') IS NOT NULL)
 DROP TABLE [PHRM_TXN_Settlement]
GO
CREATE TABLE [dbo].[PHRM_TXN_Settlement](
	[SettlementId] [int] IDENTITY(1,1) NOT NULL,
	[FiscalYearId] [int] NULL,
	[SettlementReceiptNo] [int] NOT NULL,
	[SettlementDate] [datetime] NULL,
	[SettlementType] [varchar](50) NULL,
	[PatientId] [int] NOT NULL,
	[PayableAmount] [float] NULL,
	[RefundableAmount] [float] NULL,
	[PaidAmount] [float] NULL,
	[ReturnedAmount] [float] NULL,
	[DepositDeducted] [float] NULL,
	[DueAmount] [float] NULL,
	[DiscountAmount] [float] NULL,
	[PaymentMode] [varchar](50) NULL,
	[PaymentDetails] [varchar](1000) NULL,
	[CounterId] [int] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[Remarks] [varchar](200) NULL,	
	[PrintedOn] [datetime] NULL,
	[PrintedBy] [int] NULL,
	[PrintCount] [int] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_PHRM_TXN_Settlement] PRIMARY KEY CLUSTERED 
(
	[SettlementId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[PHRM_TXN_Settlement]  WITH CHECK ADD  CONSTRAINT [FK_PHRM_TXN_Settlement_PAT_Patient] FOREIGN KEY([PatientId])
REFERENCES [dbo].[PAT_Patient] ([PatientId])
GO

ALTER TABLE [dbo].[PHRM_TXN_Settlement] CHECK CONSTRAINT [FK_PHRM_TXN_Settlement_PAT_Patient]
GO

  
-- Rajesh: End--  


--Start: Sanjit: 26 August 2019 -- Creating tables for Eye Module

GO

/****** Object:  Table [dbo].[CLN_MST_EYE]    Script Date: 8/26/2019 5:53:22 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_MST_EYE](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[VisitId] [int] NULL,
	[ProviderId] [int] NULL,
	[PatientId] [int] NULL,
	[VisitDate] [datetime] NULL,
	[ModifiedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[VisitId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


GO

/****** Object:  Table [dbo].[CLN_EYE_Ablation_Profile]    Script Date: 8/26/2019 5:53:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_Ablation_Profile](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Profile] [varchar](200) NULL,
	[DZPFactor] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
	[Notes] [varchar](200) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


GO

/****** Object:  Table [dbo].[CLN_EYE_Laser_DataEntry]    Script Date: 8/26/2019 5:53:42 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_Laser_DataEntry](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Profile] [varchar](200) NULL,
	[Sph] [float] NULL,
	[Cyf] [float] NULL,
	[Axis] [int] NULL,
	[Zone] [varchar](50) NULL,
	[Transmission] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



GO

/****** Object:  Table [dbo].[CLN_EYE_LasikRST]    Script Date: 8/26/2019 5:54:00 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_LasikRST](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[PachymetryMicrons] [varchar](50) NULL,
	[PachymetryNotes] [varchar](50) NULL,
	[FlapDepthMicrons] [varchar](50) NULL,
	[FlapDepthNotes] [varchar](50) NULL,
	[AblationDepthMicrons] [varchar](50) NULL,
	[AblationDepthNotes] [varchar](50) NULL,
	[PredictedRSTMicrons] [varchar](50) NULL,
	[PredictedRSTNotes] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



GO

/****** Object:  Table [dbo].[CLN_EYE_OperationNotes]    Script Date: 8/26/2019 5:54:11 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_OperationNotes](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[LensAndAd] [varchar](50) NULL,
	[Conjunctiva] [varchar](50) NULL,
	[Cornea] [varchar](50) NULL,
	[AC] [varchar](50) NULL,
	[IRIS] [varchar](50) NULL,
	[Pupil] [varchar](50) NULL,
	[Lens] [varchar](50) NULL,
	[Retina] [varchar](50) NULL,
	[CD] [varchar](50) NULL,
	[AV] [varchar](50) NULL,
	[FR] [varchar](50) NULL,
	[Periphery] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



GO

/****** Object:  Table [dbo].[CLN_EYE_ORA]    Script Date: 8/26/2019 5:54:35 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_ORA](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Date] [datetime] NULL,
	[Timepoint] [varchar](50) NULL,
	[IOPcc] [varchar](50) NULL,
	[CRF] [varchar](50) NULL,
	[CH] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



GO

/****** Object:  Table [dbo].[CLN_EYE_Pachymetry]    Script Date: 8/26/2019 5:54:57 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_Pachymetry](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Date] [datetime] NULL,
	[TimepointPre] [varchar](50) NULL,
	[USMin] [varchar](50) NULL,
	[VisanteRST] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


GO

/****** Object:  Table [dbo].[CLN_EYE_PreOP_Pachymetry]    Script Date: 8/26/2019 5:55:17 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_PreOP_Pachymetry](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Profile] [varchar](200) NULL,
	[PentMin] [int] NULL,
	[PentCentral] [int] NULL,
	[USMin] [int] NULL,
	[VisanteMin] [int] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



GO

/****** Object:  Table [dbo].[CLN_EYE_Refraction]    Script Date: 8/26/2019 5:55:26 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_Refraction](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Date] [datetime] NULL,
	[TimePoint] [varchar](200) NULL,
	[UCVA] [int] NULL,
	[ULett] [varchar](50) NULL,
	[NUC] [varchar](50) NULL,
	[Sph] [float] NULL,
	[Cyf] [float] NULL,
	[Axis] [int] NULL,
	[BSCVA] [int] NULL,
	[BLett] [varchar](50) NULL,
	[DCNV] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



GO

/****** Object:  Table [dbo].[CLN_EYE_Smile_Incisions]    Script Date: 8/26/2019 5:55:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_Smile_Incisions](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Position] [int] NULL,
	[Width] [int] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



GO

/****** Object:  Table [dbo].[CLN_EYE_Smile_Setting]    Script Date: 8/26/2019 5:55:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_Smile_Setting](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[SpotDistanceLent] [varchar](50) NULL,
	[SpotDistanceLentSide] [varchar](50) NULL,
	[SpotDistanceCap] [varchar](50) NULL,
	[SpotDistanceCapSide] [varchar](50) NULL,
	[TrackDistanceLent] [varchar](50) NULL,
	[TrackDistanceLentSide] [varchar](50) NULL,
	[TrackDistanceCap] [varchar](50) NULL,
	[TrackDistanceCapSide] [varchar](50) NULL,
	[EnergyOffsetLent] [varchar](50) NULL,
	[EnergyOffsetLentSide] [varchar](50) NULL,
	[EnergyOffsetCap] [varchar](50) NULL,
	[EnergyOffsetCapSide] [varchar](50) NULL,
	[ScanDirectionLent] [varchar](50) NULL,
	[ScanDirectionLentSide] [varchar](50) NULL,
	[ScanDirectionCap] [varchar](50) NULL,
	[ScanDirectionCapSide] [varchar](50) NULL,
	[ScanModeLent] [varchar](50) NULL,
	[ScanModeLentSide] [varchar](50) NULL,
	[ScanModeCap] [varchar](50) NULL,
	[ScanModeCapSide] [varchar](50) NULL,
	[MinThicknessLent] [varchar](50) NULL,
	[MinThicknessLentSide] [varchar](50) NULL,
	[MinThicknessCap] [varchar](50) NULL,
	[MinThicknessCapSide] [varchar](50) NULL,
	[SidecutLent] [varchar](50) NULL,
	[SidecutLentSide] [varchar](50) NULL,
	[SidecutCap] [varchar](50) NULL,
	[SidecutCapSide] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



GO

/****** Object:  Table [dbo].[CLN_EYE_VisuMax]    Script Date: 8/26/2019 5:55:58 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_VisuMax](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Thickness] [int] NULL,
	[Diameter] [int] NULL,
	[Hinge] [varchar](50) NULL,
	[Glass] [varchar](50) NULL,
	[Sidecut] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO




GO

/****** Object:  Table [dbo].[CLN_EYE_Wavefront]    Script Date: 8/26/2019 5:56:06 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_Wavefront](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Date] [datetime] NULL,
	[Timepoint] [varchar](50) NULL,
	[Coma] [varchar](50) NULL,
	[SphAb] [varchar](50) NULL,
	[HoRMS] [varchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

--End: Sanjit: 26 August 2019 -- Creating tables for Eye Module

--Start: Salakha: 26-08-2019 : Created Function for pharmacyUserCollectionReport

/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_PharmacyTxn_ByTransactionType_UserCollection]    Script Date: 26-08-2019 17:37:23 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Salakha
-- Create date: 26/08/2019
-- Description:	calculates daily sales for pharmacy
-- =============================================
CREATE FUNCTION [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]
(@FromDate Date, @ToDate Date)
RETURNS TABLE

AS
RETURN
(
		SELECT * FROM 
		(
				--Cash Invoices (Same Day)--
				Select   Convert(Date,CreateOn) 'Date', 
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 'CashInvoice' AS 'TransactionType',
						 SubTotal,
						 DiscountAmount,
						 VATAmount,
						  TotalAmount, 
						 TotalAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS CreditReceived,  0 AS 'CreditAmount',
						 CounterId, CreatedBy 'EmployeeId',Remark 'Remarks',  1 as DisplaySeq
				from PHRM_TXN_Invoice
				Where BilStatus ='paid' and Convert(Date,CreateOn) = Convert(Date,CreateOn)

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreateOn) 'Date', 
					  	 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						Patientid,
					  'CreditInvoice' AS 'TransactionType',
					   SubTotal,DiscountAmount,TotalAmount,VATAmount, 
					   0 AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						0 AS 'CreditReceived',TotalAmount  AS 'CreditAmount',
					   CounterId, CreatedBy 'EmployeeId',Remark 'Remarks', 2 as DisplaySeq 
				FROM PHRM_TXN_Invoice
				WHERE BilStatus='unpaid' or (BilStatus='paid' and Convert(Date,PaidDate) != Convert(Date,CreateOn))

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						'CreditInvoiceReceived' AS 'TransactionType',
						0 AS SubTotal, 0 AS DiscountAmount, 0 AS VATAmount,  0 AS TotalAmount, 
					  TotalAmount AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						TotalAmount AS 'CreditReceived',  0  AS 'CreditAmount',
					  CounterId AS 'CounterId', CreatedBy AS 'EmployeeId', Remark 'Remarks', 3 as DisplaySeq 
				from PHRM_TXN_Invoice
				Where PaymentMode='credit' and BilStatus='paid' and Convert(Date,PaidDate) != Convert(Date,CreateOn)

				UNION ALL
				--Cash Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						  txn.PatientId,
						 'CashInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (-ret.TotalAmount) AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						  0 AS 'CreditReceived', 0 AS 'CreditAmount',
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 4 as DisplaySeq 
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  and txn.BilStatus='paid'
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date', 
					 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						   txn.PatientId,
						 'CreditInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS 'CreditReceived', (-ret.TotalAmount) 'CreditAmount',
				 
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				   and txn.PaymentMode='credit' and txn.BilStatus = 'unpaid'
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
) -- end of return

GO


/****** Object:  StoredProcedure [dbo].[SP_PHRM_UserwiseCollectionReport]    Script Date: 26-08-2019 17:38:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_UserwiseCollectionReport]  --- [SP_PHRM_UserwiseCollectionReport] '05/01/2018','08/08/2018'
@FromDate datetime=null,
 @ToDate datetime=null,
 	@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
 AS
 /*
FileName: [[SP_PHRM_UserwiseCollectionReport]]
CreatedBy/date: Nagesh/Vikas/2018-07-31
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Nagesh/Vikas/2018-07-31                       created the script
2      Abhishek/2018-08-06					 Return and NetAmount calculation
3	   Salakha/2019-08-26					Billing type wise Calculation 
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
	select 
	    	bills.Date,
			bills.InvoiceNo 'ReceiptNo',
			pat.PatientCode 'HospitalNo',
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			bills.TransactionType 'TransactionType',
			bills.SubTotal,
			bills.DiscountAmount,
			bills.VATAmount,
			bills.TotalAmount, 
			bills.CashCollection, 
			bills.DepositReceived,
			bills.DepositRefund,
			bills.CreditReceived,
			bills.CreditAmount,
			bills.CounterId, 
			bills.[EmployeeId],
			bills.Remarks,
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy
	from ( 

					Select * from FN_PHRM_PharmacyTxn_ByBillingType_UserCollection(@FromDate,@ToDate)
	    
					UNION ALL

					--All Deposits Transactions---
					Select   Convert(Date,CreatedOn) 'Date', 
							 'DR'+ Convert(varchar(20),ISNULL(ReceiptNo,'')) 'InvoiceNo', 
							 Patientid,
							 CASE WHEN DepositType='Deposit' THEN 'AdvanceReceived' 
								WHEN DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN 'AdvanceSettled' END AS 'TransactionType',
			
							 0 As SubTotal,0 AS DiscountAmount,0 AS VATAmount, 0 AS TotalAmount, 
							 CASE WHEN DepositType='Deposit' THEN DepositAmount WHEN DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN (-DepositAmount) END AS 'CashCollection',
							  CASE WHEN DepositType='Deposit' THEN DepositAmount ELSE 0 END AS 'DepositReceived',
							CASE WHEN  DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN DepositAmount ELSE 0 END AS 'DepositRefund'
						   
							 , 0 AS CreditReceived,  0 AS 'CreditAmount',
							 CounterId 'CounterId', CreatedBy 'EmployeeId',Remark 'Remarks', 6 as DisplaySeq 
					from PHRM_Deposit
					WHERE COnvert(Date,CreatedOn) BETWEEN @FromDate and @ToDate	


			) bills,

		EMP_Employee emp,
		PAT_Patient pat,
		BIL_CFG_Counter cntr
		WHERE bills.PatientId = pat.PatientId
				AND emp.EmployeeId = bills.EmployeeId
				AND bills.CounterId = cntr.CounterId
		        AND (bills.CounterId LIKE '%' + ISNULL(@CounterId, bills.CounterId) + '%')
		        AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
		
       Order by bills.DisplaySeq

	   	   
   --Table2: For Settlement Details, needed Discount and DueAmount for UserCollection-Cash Collection fields.
   --We Only need collective amount for Settlement Amounts.
	 Select 
	        sett.CreatedBy 'EmployeeId',
			Sett.CounterId,
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			 --Case When sett.PayableAmount > 0 then PayableAmount - ( DepositDeducted + ISNULL(DiscountAmount,0) + ISNULL(DueAmount,0)) ELSE 0 END AS PaidAmount, 
			SUM(Case When sett.PayableAmount > 0 then sett.PaidAmount ELSE 0 END) AS 'SettlPaidAmount', 
			SUM( Case WHEN sett.RefundableAmount > 0 THEN sett.ReturnedAmount ELSE 0 END ) AS 'SettlReturnAmount',
			SUM( Case WHEN sett.DueAmount > 0 THEN sett.DueAmount ELSE 0 END ) AS 'SettlDueAmount',
			SUM( Case WHEN  sett.DiscountAmount > 0 THEN sett.DiscountAmount ELSE 0 END  ) 'SettlDiscountAmount'
	from PHRM_TXN_Settlement sett, 
	    EMP_Employee emp,
		BIL_CFG_Counter cntr 


	WHERE sett.CreatedBy=emp.EmployeeId
	      AND sett.CounterId=cntr.CounterId
		  AND (sett.CounterId LIKE '%' + ISNULL(@CounterId, sett.CounterId) + '%')
		  AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
	      AND Convert(Date,sett.CreatedOn) BETWEEN Convert(Date, @FromDate) AND Convert(Date, @ToDate) 
    Group By sett.CreatedBy, sett.CounterId,emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName 
      End
End
GO
--End: Salakha: 26-08-2019 : Changed sp for pharmacy user collection report--

--Anish start: 26 Aug--
Insert into CORE_CFG_Parameters
values('Common','HospitalNameForHealthCard','HAMS','string','Which hospital for Health Card','custom');
Go
--Anish: End--

--Narayan: Start: 27th Aug : Added Column named DispatchId in INV_TXN_DispatchItems --
ALTER TABLE [dbo].[INV_TXN_DispatchItems]
ADD DispatchId int;
Go
--Narayan: End ---

---start:sud:27Aug'19--for radiology report header image--
---need to give proper path. Below is just an example--
UPDATE CORE_CFG_Parameters
SET ParameterValue='{"show":false,"headerType":"image","imagePath":"../../../../themes/theme-default/images/customer-headers/"}'
WHERE ParameterName='RadReportCustomerHeader' and ParameterGroupName='Radiology'
GO
---end:sud:27Aug'19--for radiology report header image--

---START: SANJIT :27Aug2019--flags for eye examination--
Alter table CLN_EYE_Ablation_Profile
Add isSXDone bit not null default(0),isPTKPerformed bit not null default(0);
GO
---END: SANJIT :27Aug2019--flags for eye examination--

--Anish:Start: 28 Aug 2019 Store the printed Information of LabTest throughTrigger when the test is Printed--
Create table TXN_PrintInformation(
PrintId INT Identity(1,1),
ModuleName varchar(100),
DocumentName varchar(100),
ReferenceId INT,  
PrintedOn DateTime,
PrintedBy INT NULL,
PrintCount INT NULL Default(0)
);
Go

CREATE TRIGGER [dbo].[PRINT_UpdateTrigger]
       ON [dbo].[LAB_TestRequisition]
AFTER UPDATE
AS
BEGIN
       SET NOCOUNT ON; 
       DECLARE @PrintedBy int,@PrintedOn datetime, @RequisitionId int, @ModuleName varchar(100), @DocumentName varchar(100),
		@PrintCountOld int, @PrintCountNew int
 	
       IF UPDATE(PrintCount)
       BEGIN             
			SELECT @PrintedBy=i.PrintedBy from INSERTED i;
			SELECT @RequisitionId=i.RequisitionId from INSERTED i;
			SELECT @PrintedOn=GETDATE();
			SELECT @ModuleName='lab';
			SELECT @DocumentName='report';
			SELECT @PrintCountOld = i.PrintCount from INSERTED i;
			SELECT @PrintCountNew = d.PrintCount from DELETED d;

			IF @PrintCountOld!=@PrintCountNew
			BEGIN
				INSERT INTO [TXN_PrintInformation]([ModuleName] ,[DocumentName] ,[ReferenceId] ,[PrintedOn]  ,[PrintedBy] ,[PrintCount])
				values (@ModuleName ,@DocumentName ,@RequisitionId ,@PrintedOn  ,@PrintedBy ,@PrintCountNew)
			END  --End If
       END  --End If             
END
Go
--End: ANish 28 Aug 2019--


---START: Pawan :28Aug2019--flags for eye examination--
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--END Ajay: 02Jan 2018: created trigger for add data in PHRM_Stock table on PHRM_StockTxnItems table


--START: Vikas/2019-01-02 Changes :return invoice report doesnt showing correctly so changes script---------------
ALTER PROCEDURE [dbo].[SP_PHRM_SaleReturnReport] 
@FromDate datetime=null,
@ToDate datetime=null
AS
 /*
FileName:[SP_PHRM_SaleReturnReport]
CreatedBy/date: Vikas/2018-08-06
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Vikas/2018-08-06                       created the script
2.     VIKAS/2019-01-02               report doesnt shown correctly so changes in script. 
3.     Rusha/2019-04-09             report doesnot show quantity so add return quantity
4.     Rusha/2019-07-03             report doesnot showing correct amount so updated script
5.     Abhishek/2019-07-03             report doesnot showing correct amount so updated script
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
          select convert(date,invr.CreatedOn) as[Date],convert(date, inv.CreateOn) as [InvDate], 
           inv.InvoicePrintId,usr.UserName,
            pat.FirstName+' '+ ISNULL( pat.MiddleName,'')+' '+pat.LastName  as PatientName,
          sum(invr.TotalAmount) as TotalAmount, sum(inv.DiscountAmount) as Discount, Sum(invr.Quantity) as Quantity
            from [PHRM_TXN_Invoice]inv
           join [PHRM_TXN_InvoiceReturnItems]invr
              on inv.InvoiceId=invr.InvoiceId
          join RBAC_User usr
              on usr.EmployeeId=invr.CreatedBy 
          join PAT_Patient pat
              on pat.PatientId=inv.PatientId
                where  convert(date, invr.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())
                
          group by convert(date,inv.CreateOn), convert(date, invr.CreatedOn),usr.UserName, 
          pat.FirstName,pat.MiddleName,pat.LastName, inv.InvoicePrintId
          order by convert(date,invr.CreatedOn) desc

  End
End
---End: Pawan :28Aug2019--flags for eye examination--


-- Start : Salakha: 28-08-2019 -- Correction in function 
/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]    Script Date: 29-08-2019 13:18:14 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Salakha
-- Create date: 26/08/2019
-- Description:	calculates daily sales for pharmacy
-- =============================================
ALTER FUNCTION [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]
(@FromDate Date, @ToDate Date)
RETURNS TABLE

AS
RETURN
(
		SELECT * FROM 
		(
				--Cash Invoices (Same Day)--
				Select   Convert(Date,CreateOn) 'Date', 
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 'CashInvoice' AS 'TransactionType',
						 SubTotal,
						 DiscountAmount,
						 VATAmount,
						  TotalAmount, 
						 TotalAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS CreditReceived,  0 AS 'CreditAmount',
						 CounterId, CreatedBy 'EmployeeId',Remark 'Remarks',  1 as DisplaySeq
				from PHRM_TXN_Invoice
				Where BilStatus ='paid' and PaymentMode ='cash'       --Convert(Date,PaidDate) = Convert(Date,CreateOn)

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreateOn) 'Date', 
					  	 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						Patientid,
					  'CreditInvoice' AS 'TransactionType',
					   SubTotal,DiscountAmount,TotalAmount,VATAmount, 
					   0 AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						0 AS 'CreditReceived',TotalAmount  AS 'CreditAmount',
					   CounterId, CreatedBy 'EmployeeId',Remark 'Remarks', 2 as DisplaySeq 
				FROM PHRM_TXN_Invoice
				WHERE BilStatus='unpaid'  and PaymentMode ='credit'    -- (BilStatus='paid' and Convert(Date,PaidDate) != Convert(Date,CreateOn))

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						'CreditInvoiceReceived' AS 'TransactionType',
						0 AS SubTotal, 0 AS DiscountAmount, 0 AS VATAmount,  0 AS TotalAmount, 
					  TotalAmount AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						TotalAmount AS 'CreditReceived',  0  AS 'CreditAmount',
					  CounterId AS 'CounterId', CreatedBy AS 'EmployeeId', Remark 'Remarks', 3 as DisplaySeq 
				from PHRM_TXN_Invoice
				Where PaymentMode='credit' and BilStatus='paid' and Convert(Date,PaidDate) != Convert(Date,CreateOn)

				UNION ALL
				--Cash Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						  txn.PatientId,
						 'CashInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (-ret.TotalAmount) AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						  0 AS 'CreditReceived', 0 AS 'CreditAmount',
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 4 as DisplaySeq 
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  and txn.BilStatus='paid'  
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date', 
					 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						   txn.PatientId,
						 'CreditInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS 'CreditReceived', (-ret.TotalAmount) 'CreditAmount',
				 
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				   and txn.PaymentMode='credit' and txn.BilStatus = 'unpaid'
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
) -- end of return
GO

--End: Salakha: 28-08-2019


--START: Rajesh: 29-08-2019
ALTER TABLE PHRM_TXN_InvoiceItems
 ADD VisitType varchar(50) null;
 GO
 --END: Rajesh

 --Start: Salakha:  29-08-2019: Corrected settlement Calculation for user collection
 
/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]    Script Date: 29-08-2019 16:39:57 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Salakha
-- Create date: 26/08/2019
-- Description:	calculates daily sales for pharmacy
-- =============================================
ALTER FUNCTION [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]
(@FromDate Date, @ToDate Date)
RETURNS TABLE

AS
RETURN
(
		SELECT * FROM 
		(
				--Cash Invoices (Same Day)--
				Select   Convert(Date,CreateOn) 'Date', 
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 'CashInvoice' AS 'TransactionType',
						 SubTotal,
						 DiscountAmount,
						 VATAmount,
						  TotalAmount, 
						 TotalAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS CreditReceived,  0 AS 'CreditAmount',
						 CounterId, CreatedBy 'EmployeeId',Remark 'Remarks',  1 as DisplaySeq
				from PHRM_TXN_Invoice
				Where BilStatus ='paid' and Convert(Date,PaidDate) = Convert(Date,CreateOn) --PaymentMode ='cash'       --

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreateOn) 'Date', 
					  	 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						Patientid,
					  'CreditInvoice' AS 'TransactionType',
					   SubTotal,DiscountAmount,VATAmount, TotalAmount,
					   0 AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						0 AS 'CreditReceived',TotalAmount  AS 'CreditAmount',
					   CounterId, CreatedBy 'EmployeeId',Remark 'Remarks', 2 as DisplaySeq 
				FROM PHRM_TXN_Invoice
				WHERE BilStatus='unpaid'  and PaymentMode ='credit'    -- (BilStatus='paid' and Convert(Date,PaidDate) != Convert(Date,CreateOn))

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						'CreditInvoiceReceived' AS 'TransactionType',
						0 AS SubTotal, 0 AS DiscountAmount, 0 AS VATAmount,  0 AS TotalAmount, 
					  TotalAmount AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						TotalAmount AS 'CreditReceived',  0  AS 'CreditAmount',
					  CounterId AS 'CounterId', CreatedBy AS 'EmployeeId', Remark 'Remarks', 3 as DisplaySeq 
				from PHRM_TXN_Invoice
				Where PaymentMode='credit' and BilStatus='paid' and Convert(Date,PaidDate) != Convert(Date,CreateOn)

				UNION ALL
				--Cash Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						  txn.PatientId,
						 'CashInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (-ret.TotalAmount) AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						  0 AS 'CreditReceived', 0 AS 'CreditAmount',
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 4 as DisplaySeq 
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  and txn.BilStatus='paid'  
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date', 
					 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						   txn.PatientId,
						 'CreditInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS 'CreditReceived', (-ret.TotalAmount) 'CreditAmount',
				 
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				   and txn.PaymentMode='credit' and txn.BilStatus = 'unpaid'
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
) -- end of return
GO
 --End: Salakha:  29-08-2019

 --Sanjit: Start: 30th Aug : Make DispatchId value 0 / Data correction --
UPDATE INV_TXN_DispatchItems
SET DispatchId = 0
WHERE DispatchId is null;
GO
--Sanjit: End: 30th Aug : Make DispatchId value 0 / Data correction  ---


--Anish: Start: 31 Aug- Lab Run Number format setting table--
DROP TABLE IF EXISTS Lab_MST_RunNumberSettings;
GO
Create Table Lab_MST_RunNumberSettings(
	RunNumberFormatId int IDENTITY(1, 1)  Constraint RunNumberFormatID Primary Key NOT NULL,
        RunNumberFormatName varchar(40),        
        RunNumberGroupingIndex int,
		StartingLetter varchar(10),
		FormatInitialPart varchar(10), 
		FormatSeparator varchar(5), 
		FormatLastPart varchar(10),
        VisitType varchar(20),
        RunNumberType varchar(20),		       
		UnderInsurance bit,
        ResetDaily bit,
        ResetMonthly bit,
        ResetYearly bit,  
        ModifiedBy INT null,
        ModifiedOn DATETIME null
);
Go
Insert Into Lab_MST_RunNumberSettings (RunNumberFormatName,RunNumberGroupingIndex,
VisitType,RunNumberType,ResetDaily,ResetMonthly,ResetYearly, FormatInitialPart, FormatSeparator, FormatLastPart, UnderInsurance)
Values ('Outpatient-Normal',1,'outpatient','normal',1,0,0,'num','/','dd',0);

Insert Into Lab_MST_RunNumberSettings (RunNumberFormatName,RunNumberGroupingIndex,
VisitType,RunNumberType,ResetDaily,ResetMonthly,ResetYearly, FormatInitialPart, FormatSeparator, FormatLastPart, UnderInsurance)
Values ('Inpatient-Normal',2,'inpatient','normal',0,0,1,'num','/','yyy',0);

Insert Into Lab_MST_RunNumberSettings (RunNumberFormatName,RunNumberGroupingIndex,
VisitType,RunNumberType,ResetDaily,ResetMonthly,ResetYearly, FormatInitialPart, FormatSeparator, FormatLastPart, UnderInsurance)
Values ('Emergency-Normal',2,'emergency','normal',0,0,1,'num','/','dd',0);

Insert Into Lab_MST_RunNumberSettings (RunNumberFormatName,RunNumberGroupingIndex,
VisitType,RunNumberType,ResetDaily,ResetMonthly,ResetYearly, FormatInitialPart, FormatSeparator, FormatLastPart, UnderInsurance)
Values ('Outpatient-Histo',3,'outpatient','histo',0,0,1,'num','/','yyy',0);

Insert Into Lab_MST_RunNumberSettings (RunNumberFormatName,RunNumberGroupingIndex,
VisitType,RunNumberType,ResetDaily,ResetMonthly,ResetYearly, FormatInitialPart, FormatSeparator, FormatLastPart, UnderInsurance)
Values ('Inpatient-Histo',3,'inpatient','histo',0,0,1,'num','/','yyy',0);

Insert Into Lab_MST_RunNumberSettings (RunNumberFormatName,RunNumberGroupingIndex,
VisitType,RunNumberType,ResetDaily,ResetMonthly,ResetYearly, FormatInitialPart, FormatSeparator, FormatLastPart, UnderInsurance)
Values ('Emergency-Histo',3,'emergency','histo',0,0,1,'num','/','yyy',0);

Insert Into Lab_MST_RunNumberSettings (RunNumberFormatName,RunNumberGroupingIndex,
VisitType,RunNumberType,ResetDaily,ResetMonthly,ResetYearly, FormatInitialPart, FormatSeparator, FormatLastPart, UnderInsurance)
Values ('Outpatient-Cyto',4,'outpatient','cyto',0,0,1,'num','/','yyy',0);

Insert Into Lab_MST_RunNumberSettings (RunNumberFormatName,RunNumberGroupingIndex,
VisitType,RunNumberType,ResetDaily,ResetMonthly,ResetYearly, FormatInitialPart, FormatSeparator, FormatLastPart, UnderInsurance)
Values ('Inpatient-Cyto',4,'inpatient','cyto',0,0,1,'num','/','yyy',0);

Insert Into Lab_MST_RunNumberSettings (RunNumberFormatName,RunNumberGroupingIndex,
VisitType,RunNumberType,ResetDaily,ResetMonthly,ResetYearly, FormatInitialPart, FormatSeparator, FormatLastPart, UnderInsurance)
Values ('Emergency-Cyto',4,'emergency','cyto',0,0,1,'num','/','yyy',0);
Go
--Anish: End---

----Start: Dinesh 2nd September 2019 : Created Cash Collection Summary Report-----------------

/****** Object:  StoredProcedure [dbo].[SP_PHRM_CashCollectionSummaryReport]    Script Date: 9/2/2019 10:34:09 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[SP_PHRM_CashCollectionSummaryReport]  --- [SP_PHRM_CashCollectionSummaryReport] 
@FromDate datetime=null,
 @ToDate datetime=null
 AS
 /*
FileName: [[SP_PHRM_CashCollectionSummaryReport]]
CreatedBy/date: Dinesh 2nd Sept 2019 
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh 2nd Sept 2019                   created the script
					
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
	select [Date], UserName, sum(TotalAmount) as TotalAmount, sum(ReturnAmount) as ReturnedAmount, sum(TotalAmount-ReturnAmount) as NetAmount, sum(DiscountAmount) as DiscountAmount
	from ( 
          SELECT convert(date,inv.CreateOn) as [Date] ,usr.UserName,sum(inv.PaidAmount)as TotalAmount, 0 as ReturnAmount,sum(inv.DiscountAmount) as DiscountAmount
            FROM [PHRM_TXN_Invoice] inv
              INNER JOIN RBAC_User usr
             on inv.CreatedBy=usr.EmployeeId          
              where  convert(datetime, inv.CreateOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 
              group by convert(date,inv.createon),UserName
			  
			  union all
			 
			  select convert(date,invRet.CreatedOn) as [Date], usr.UserName, 0 as TotalAmount,sum(invRet.TotalAmount ) as ReturnAmount,  sum(-(invRet.DiscountPercentage/100)*invRet.SubTotal ) as DiscountPercentage
			  From[PHRM_TXN_InvoiceReturnItems] invRet
			  INNER JOIN RBAC_User usr
			  on invRet.CreatedBy = usr.EmployeeId
			  where convert(datetime, invRet.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and invRet.InvoiceId is not null
			  group by convert(date,invRet.CreatedOn),UserName
			  )	  tabletotal
			  Group BY [Date], UserName
      End
End
--End: Dinesh Cash collection Summary Report Creation --
GO

----END: Dinesh 2nd September 2019 : Created Cash Collection Summary Report-----------------

---Start:2nd Sept 2019: Dinesh Router link of pharmacy report transferred to DB 
--1. Cash Collection Summary Report

insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-cashcollection-summary-report-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-cashcollection-summary-report-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Cash Collection Summary','Pharmacy/Report/CashCollectionSummaryReport','CashCollectionSummaryReport',@perid,
158,1,NULL,1)
Go

--2. Purchase order Report
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-purchaseorder-report-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-purchaseorder-report-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Purchase Order ','Pharmacy/Report/PurchaseOrderReport','PurchaseOrderReport',@perid,
158,1,NULL,1)
Go

--3. ItemWiseStockReport  Report
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-itemwisestockreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-itemwisestockreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Dispensary/Store Stock ','Pharmacy/Report/ItemWiseStockReport','ItemWiseStockReport',@perid,
158,1,NULL,1)
Go

--4. Supplier Info Report
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-supplierinforeport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-supplierinforeport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Supplier Information ','Pharmacy/Report/SupplierInfoReport','SupplierInfoReport',@perid,
158,1,NULL,1)
Go

--5. LedgerCreditInOutPatientReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-ledgercreditinoutpatientreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-ledgercreditinoutpatientreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Credit Details In/Out Patient ','Pharmacy/Report/LedgerCreditInOutPatientReport','LedgerCreditInOutPatientReport',@perid,
158,1,NULL,1)
Go
--6. StockItemsReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-stockitemsreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-stockitemsreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Stock Items ','Pharmacy/Report/StockItemsReport','StockItemsReport',@perid,
158,1,NULL,1)
Go

--7. ReturnToSupplierReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-returntosupplierreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-returntosupplierreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Return to Supplier ','Pharmacy/Report/ReturnToSupplierReport','ReturnToSupplierReport',@perid,
158,1,NULL,1)
Go
--8. DrugCategoryWiseReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-drugcategorywiseReport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-drugcategorywiseReport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Drug CategoryWise ','Pharmacy/Report/DrugCategoryWiseReport','DrugCategoryWiseReport',@perid,
158,1,NULL,1)
Go

--9. BatchStockReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-batchstockreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-batchstockreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Batch Stock ','Pharmacy/Report/BatchStockReport','BatchStockReport',@perid,
158,1,NULL,1)
Go

--10. SupplierStockReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-supplierstockreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-supplierstockreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Supplier Stock ','Pharmacy/Report/SupplierStockReport','SupplierStockReport',@perid,
158,1,NULL,1)
Go

--11.Billing/Invoice Report 

insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-billingreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-billingreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Invoice Billing ','Pharmacy/Report/BillingReport','BillingReport',@perid,
158,1,NULL,1)
Go

-- 12. DailyStockSummaryReport
 insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-dailystocksummaryreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-dailystocksummaryreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Opening and Ending Stock Summary ','Pharmacy/Report/DailyStockSummaryReport','DailyStockSummaryReport',@perid,
158,1,NULL,1)
Go

--13. ExpiryReport
 insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-expiryreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-expiryreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Expiry Report','Pharmacy/Report/ExpiryReport','ExpiryReport',@perid,
158,1,NULL,1)
Go

--14. PHRMMinStock
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-phrmminstock-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-phrmminstock-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Minimun Stock Report','Pharmacy/Report/PHRMMinStock','PHRMMinStock',@perid,
158,1,NULL,1)
Go

--15. ABCVEDStock
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-abcvedstock-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-abcvedstock-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('ABC/VED Stock Report','Pharmacy/Report/ABCVEDStock','ABCVEDStock',@perid,
158,1,NULL,1)
Go

--16. PHRMDailySalesSummary 
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-phrmdailysalessummary-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-phrmdailysalessummary-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Daily Sales Report ','Pharmacy/Report/PHRMDailySalesSummary','PHRMDailySalesSummary',@perid,
158,1,NULL,1)
Go

--17.UserwiseCollectionReport 
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-userwisecollectionreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-userwisecollectionreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('User Collection ','Pharmacy/Report/UserwiseCollectionReport','UserwiseCollectionReport',@perid,
158,1,NULL,1)
Go

--18.CounterwiseCollectionReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-counterwisecollectionreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-counterwisecollectionreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Counter Collection ','Pharmacy/Report/CounterwiseCollectionReport','CounterwiseCollectionReport',@perid,
158,1,NULL,1)
Go

--19. SaleReturnReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-salereturnreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-salereturnreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Invoice Sale Return Report ','Pharmacy/Report/SaleReturnReport','SaleReturnReport',@perid,
158,1,NULL,1)
Go

--20. BreakageItemReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-breakageitemreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-breakageitemreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Breakage Item Report ','Pharmacy/Report/BreakageItemReport','BreakageItemReport',@perid,
158,1,NULL,1)
Go

--21. GoodsReceiptProductReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-goodsreceiptproductreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-goodsreceiptproductreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Goods Receipt Product Report ','Pharmacy/Report/GoodsReceiptProductReport','GoodsReceiptProductReport',@perid,
158,1,NULL,1)
Go

--22. StockManageDetailReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-stockmanagedetailreport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-stockmanagedetailreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Stock Manage Detail Report ','Pharmacy/Report/StockManageDetailReport','StockManageDetailReport',@perid,
158,1,NULL,1)
Go

--23. DepositBalanceReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-depositbalancereport-view',17,1,'2019-09-02',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-depositbalancereport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Deposit Balance Report ','Pharmacy/Report/DepositBalanceReport','DepositBalanceReport',@perid,
158,1,NULL,1)
Go 

------End: 2nd Sept 2019: Dinesh Router link of pharmacy report transferred to DB ---------------

--Anish:Start 2 Sept 2019--
 Alter table LAB_TestRequisition
add SampleCodeFormatted varchar(20);
----Anish:End 2 Sept 2019--

------------Start: Abhishek/Dinesh: 2nd September: Pharmacy User Collection Report Correction ---------
----1. [FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]

/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_PharmacyTxn_ByTransactionType_UserCollection]    Script Date: 26-08-2019 17:37:23 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Salakha
-- Create date: 26/08/2019
-- Description:	calculates daily sales for pharmacy
-- =============================================

/* Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh/Abhishek 2nd Sept 2019          Credit logic, credit return logic optimized 
					
--------------------------------------------------------

*/
alter FUNCTION [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]
(@FromDate Date, @ToDate Date)
RETURNS TABLE

AS
RETURN
(
		SELECT * FROM 
		(
				--Cash Invoices (Same Day)--
				Select   Convert(Date,CreateOn) 'Date', 
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 'CashInvoice' AS 'TransactionType',
						 SubTotal,
						 DiscountAmount,
						 VATAmount,
						  TotalAmount, 
						 TotalAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS CreditReceived,  0 AS 'CreditAmount',
						 CounterId, CreatedBy 'EmployeeId',Remark 'Remarks',  1 as DisplaySeq
				from PHRM_TXN_Invoice
				Where PaymentMode ='cash' and Convert(Date,CreateOn) = Convert(Date,CreateOn)

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreateOn) 'Date', 
					  	 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						Patientid,
					  'CreditInvoice' AS 'TransactionType',
					   SubTotal,DiscountAmount,TotalAmount,VATAmount, 
					   0 AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						0 AS 'CreditReceived',TotalAmount  AS 'CreditAmount',
					   CounterId, CreatedBy 'EmployeeId',Remark 'Remarks', 2 as DisplaySeq 
				FROM PHRM_TXN_Invoice
				WHERE PaymentMode = 'credit' and Convert(Date,CreateOn) = Convert(Date,CreateOn)

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						'CreditInvoiceReceived' AS 'TransactionType',
						0 AS SubTotal, 0 AS DiscountAmount, 0 AS VATAmount,  0 AS TotalAmount, 
					  TotalAmount AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						TotalAmount AS 'CreditReceived',  0  AS 'CreditAmount',
					  CounterId AS 'CounterId', CreatedBy AS 'EmployeeId', Remark 'Remarks', 3 as DisplaySeq 
				from PHRM_TXN_Invoice
				Where PaymentMode='credit' and Convert(Date,PaidDate) != Convert(Date,CreditDate)

				UNION ALL
				--Cash Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						  txn.PatientId,
						 'CashInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (-ret.TotalAmount) AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						  0 AS 'CreditReceived', 0 AS 'CreditAmount',
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 4 as DisplaySeq 
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where (ret.InvoiceId=txn.InvoiceId and txn.PaymentMode='cash') or (ret.InvoiceId=txn.InvoiceId and 
				txn.PaymentMode='credit' and txn.settlementId is not null)
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date', 
					 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						   txn.PatientId,
						 'CreditInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS 'CreditReceived', (-ret.TotalAmount) 'CreditAmount',
				 
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				   and txn.PaymentMode='credit' and settlementId is null
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
) -- end of return

GO

------2. SP_PHRM_UserwiseCollectionReport

/****** Object:  StoredProcedure [dbo].[SP_PHRM_UserwiseCollectionReport]    Script Date: 9/1/2019 12:12:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_UserwiseCollectionReport]  
--- [SP_PHRM_UserwiseCollectionReport] '09/01/2019','09/01/2019'
@FromDate datetime=null,
 @ToDate datetime=null,
 	@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
 AS
 /*
FileName: [[SP_PHRM_UserwiseCollectionReport]]
CreatedBy/date: Nagesh/Vikas/2018-07-31
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Nagesh/Vikas/2018-07-31                       created the script
2      Abhishek/2018-08-06					 Return and NetAmount calculation
3	   Salakha/2019-08-26					Billing type wise Calculation 
4. 		Dinesh /Abhishek 2nd Sept 2019		Counter corrected for pharmacy 
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
	select 
	    	bills.Date,
			bills.InvoiceNo 'ReceiptNo',
			pat.PatientCode 'HospitalNo',
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			bills.TransactionType 'TransactionType',
			bills.SubTotal,
			bills.DiscountAmount,
			bills.VATAmount,
			bills.TotalAmount, 
			bills.CashCollection, 
			bills.DepositReceived,
			bills.DepositRefund,
			bills.CreditReceived,
			bills.CreditAmount,
			bills.CounterId, 
			bills.[EmployeeId],
			bills.Remarks,
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy
	from ( 

					Select * from FN_PHRM_PharmacyTxn_ByBillingType_UserCollection(@FromDate,@ToDate)
	    
					UNION ALL

					--All Deposits Transactions---
					Select   Convert(Date,CreatedOn) 'Date', 
							 'DR'+ Convert(varchar(20),ISNULL(ReceiptNo,'')) 'InvoiceNo', 
							 Patientid,
							 CASE WHEN DepositType='Deposit' THEN 'AdvanceReceived' 
								WHEN DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN 'AdvanceSettled' END AS 'TransactionType',
			
							 0 As SubTotal,0 AS DiscountAmount,0 AS VATAmount, 0 AS TotalAmount, 
							 CASE WHEN DepositType='Deposit' THEN DepositAmount WHEN DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN (-DepositAmount) END AS 'CashCollection',
							  CASE WHEN DepositType='Deposit' THEN DepositAmount ELSE 0 END AS 'DepositReceived',
							CASE WHEN  DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN DepositAmount ELSE 0 END AS 'DepositRefund'
						   
							 , 0 AS CreditReceived,  0 AS 'CreditAmount',
							 CounterId 'CounterId', CreatedBy 'EmployeeId',Remark 'Remarks', 6 as DisplaySeq 
					from PHRM_Deposit
					WHERE COnvert(Date,CreatedOn) BETWEEN @FromDate and @ToDate	


			) bills,

		EMP_Employee emp,
		PAT_Patient pat,
		PHRM_MST_Counter cntr
		WHERE bills.PatientId = pat.PatientId
				AND emp.EmployeeId = bills.EmployeeId
				AND bills.CounterId = cntr.CounterId
		        AND (bills.CounterId LIKE '%' + ISNULL(@CounterId, bills.CounterId) + '%')
		        AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
		
       Order by bills.DisplaySeq

	   	   
   --Table2: For Settlement Details, needed Discount and DueAmount for UserCollection-Cash Collection fields.
   --We Only need collective amount for Settlement Amounts.
	 Select 
	        sett.CreatedBy 'EmployeeId',
			Sett.CounterId,
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			 --Case When sett.PayableAmount > 0 then PayableAmount - ( DepositDeducted + ISNULL(DiscountAmount,0) + ISNULL(DueAmount,0)) ELSE 0 END AS PaidAmount, 
			SUM(Case When sett.PayableAmount > 0 then sett.PaidAmount ELSE 0 END) AS 'SettlPaidAmount', 
			SUM( Case WHEN sett.RefundableAmount > 0 THEN sett.ReturnedAmount ELSE 0 END ) AS 'SettlReturnAmount',
			SUM( Case WHEN sett.DueAmount > 0 THEN sett.DueAmount ELSE 0 END ) AS 'SettlDueAmount',
			SUM( Case WHEN  sett.DiscountAmount > 0 THEN sett.DiscountAmount ELSE 0 END  ) 'SettlDiscountAmount'
	from PHRM_TXN_Settlement sett, 
	    EMP_Employee emp,
		PHRM_MST_Counter cntr 


	WHERE sett.CreatedBy=emp.EmployeeId
	      AND sett.CounterId=cntr.CounterId
		  AND (sett.CounterId LIKE '%' + ISNULL(@CounterId, sett.CounterId) + '%')
		  AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
	      AND Convert(Date,sett.CreatedOn) BETWEEN Convert(Date, @FromDate) AND Convert(Date, @ToDate) 
    Group By sett.CreatedBy, sett.CounterId,emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName 
      End
End
GO
------------ENd: Abhishek/Dinesh: 2nd September: Pharmacy User Collection Report Correction ---------

--ANish:Start 3 Sept, 2019, Lab Category table--
Create Table LAB_TestCategory(
TestCategoryId int IDENTITY(1,1) Constraint LabTestCategoryId Primary Key NOT NULL,
TestCategoryName varchar(20),
CreatedBy INT null,
CreatedOn DATETIME null,
ModifiedBy INT null,
ModifiedOn DATETIME null
);
Go

Alter table LAB_LabTests
Add LabTestCategoryId int null;
Go

--Anish:End 3 Sept, 2019--

--START: Salakha : 6th Sept, 2019-- Corrected bed calculation function
alter table ADT_TXN_PatientBedInfo
add BedQuantity int null
Go

/****** Object:  UserDefinedFunction [dbo].[FN_Ip_Billing_Bed_Quantity_Calculation]    Script Date: 06-09-2019 05:27:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_Ip_Billing_Bed_Quantity_Calculation]( @StartDate datetime, @EndDate datetime null, @AdmissionDate datetime)
RETURNS int
AS
BEGIN

  -- Declare the return variable here
  DECLARE @Quantity int;
  DECLARE @CheckOutTime Datetime;
  DECLARE @EndDateTime Datetime;
  DECLARE @StartDateTime DateTime;
  
  set  @CheckOutTime = CONVERT(DATETIME, CONVERT(CHAR(8), GETDATE(), 112)  + ' ' + CONVERT(CHAR(8), @AdmissionDate, 108));
  
  IF (@EndDate IS NULL)
  BEGIN
		IF(@CheckOutTime <= GETDATE())
		BEGIN 
			SET @Quantity = (select cast((select DATEDIFF(HOUR,@StartDate,@CheckOutTime)) as decimal)/24 + 1)
		END
		ELSE
		BEGIN
		SET @Quantity = (select cast((select DATEDIFF(HOUR,@StartDate,@CheckOutTime)) as decimal)/24 + 1)
		END
  END
  ELSE
   BEGIN 
	SET  @EndDateTime = CONVERT(DATETIME, CONVERT(CHAR(8), @EndDate, 112)  + ' ' + CONVERT(CHAR(8), @AdmissionDate, 108))
	if(@EndDate > @EndDateTime)
	BEGIN
		SET @Quantity =(select  cast(DATEDIFF(HOUR,@StartDate,@EndDate)as decimal)/24   ) 
	END
	ELSE
	BEGIN
		SET @StartDateTime = CONVERT(DATETIME, CONVERT(CHAR(8), @StartDate, 112)  + ' ' + CONVERT(CHAR(8), @AdmissionDate, 108))
		SET @EndDateTime = DATEADD(DAY, -1, @EndDateTime)
		IF(@StartDateTime > @StartDate)
		BEGIN
			SET @StartDateTime=DATEADD(DAY, -1, @StartDateTime)
		END
		SET @Quantity = (select cast ( cast(DATEDIFF(HOUR,@StartDateTime,@EndDateTime)as decimal)/24 as int )  )	
	END
	--if(@EndDateTime >= @EndDate )
	--BEGIN
	--  SET @Quantity = (select cast ( cast(DATEDIFF(HOUR,@StartDate,@EndDate)as decimal)/24 as int ) + 1 )
	--END
	--ELSE
	--BEGIN
 --   SET @Quantity =(select  cast(DATEDIFF(HOUR,@StartDate,@EndDate)as decimal)/24   ) 
	--END
  END
  RETURN @Quantity;

END
GO
--End: Salakha : 6th sept, 2019 --
--Start: Salakha : 8th sept, 2019 --added Parameter for ADT transfer print receipt
INSERT INTO [dbo].[CORE_CFG_Parameters]
           ([ParameterGroupName]
           ,[ParameterName]
           ,[ParameterValue]
           ,[ValueDataType]
           ,[Description]
           ,[ParameterType])
     VALUES
           ('ADT','TransferPrintReceipt','true','boolean','Allow to print receipt of ADT patient transfer','custom')
GO
--End: Salakha : 8th sept, 2019 --

--start: sud:8Sept'19--group discount options in ip billing--
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Billing','IpBillingGroupDiscountOptions','{"EnableGroupDiscount":true, "EnableDiscountScheme":false}','json','Enable or Disable Group Discount options in IpBilling','custom');
Go
--end: sud:8Sept'19--group discount options in ip billing--

--Rajesh: Start 3 Sept19--
insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType) 
values('Emergency','DefaultErDoctorId','0','number','EmployeeId of Default Emergency Room Doctor. 0 is default, need to change it as per hospital','custom')

update RBAC_RouteConfig
 set DisplayName = 'Input/Output' 
 where RouterLink='InputOutput'

--Rajesh: END
--Start: Salakha:9th sept,2019--updated sp to exclude cancelled billig items for discharged patient report
/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DischargeBreakup]    Script Date: 09-09-2019 06:24:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DischargeBreakup] 
@PatientVisitId int=null 
,@PatientId INT
AS
/*
FileName: [SP_Report_BIL_DischargeBreakup]
CreatedBy/date: Nagesh/2018-07-21
Description: Get billing details for discharge bill breakup for patient by visit id or patientId
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       Nagesh/2018-07-21          Created need finalize for some improvements later
2		nagesh/2018/08/20			updated as per dinesh sir guidance and hams requirement
3		Salakha/2019/09/09			updated to exclude cancelled billig items
-------------------------------------------------------------------------------
*/

BEGIN
BEGIN 
If(@PatientId IS NOT NULL)
BEGIN
Declare @FromDate DateTime, @ToDate DateTime
SELECT  @FromDate=AdmissionDate, @ToDate=DischargeDate
FROM ADT_PatientAdmission
WHERE PatientVisitId=@PatientVisitId

;With BilDischargeCTE as
  (
 select bti.BillingTransactionItemId,dept.DepartmentName, 
bti.ServiceDepartmentName,
bti.PaidDate as billDate, 
bti.ItemName as [description],
bti.Quantity as qty,
bti.subtotal as amount,
bti.DiscountAmount as discount,
bti.TaxableAmount as subTotal,
bti.Tax as vat
,bti.TotalAmount as total
 from BIL_TXN_BillingTransactionItems bti
 join BIL_MST_ServiceDepartment sdept
 on sdept.ServiceDepartmentId=bti.ServiceDepartmentId
 join MST_Department dept
 on dept.DepartmentId=sdept.DepartmentId
--If user misses to Select RequestedByDr. in Billing Page, then PatiengVisitId Comes as Null,
--in that case we've to take from CreatedOn Field.---
 where PatientId=@PatientId and  ( bti.PatientVisitId=@PatientVisitId OR  bti.CreatedOn Between @FromDate and @ToDate ) and bti.BillStatus !='cancel' and bti.BillStatus !='adtCancel'     
) select 
Case 
WHEN [DepartmentName]='ADMINISTRATION' and ServiceDepartmentName !='CONSUMEABLES' THEN 'ADMINISTRATIVE'
when ServiceDepartmentName='CONSUMEABLES' then 'CONSUMEABLES'
WHEN [DepartmentName]='OT' and [DepartmentName]!='' THEN 'OT'
when [Description]='BED CHARGES' then 'BED'
when [Description]='INDOOR-DOCTOR''S VISIT FEE (PER DAY)' then 'DOCTOR AND NURSING CARE'
when [DepartmentName]='MEDICINE' then 'MEDICINE'
WHEN [DepartmentName]='SURGERY' then 'SURGERY'
ELSE DepartmentName
END
AS departmentName,
billDate,[description],qty,amount,discount,subTotal,vat,total 
from BilDischargeCTE 
END
END  
END
GO
--End: Salakha:9th sept,2019
--Start: Sanjit 10 Sept, 2019 Creating PO Requisition Table

/****** Object:  Table [dbo].[INV_TXN_RequisitionForPO]    Script Date: 9/10/2019 10:48:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[INV_TXN_RequisitionForPO](
	[RequisitionId] [int] IDENTITY(1,1) NOT NULL,
	[isActive] [bit] NOT NULL,
	[isApproved] [bit] NOT NULL,
	[ApprovedBy] [int] NULL,
	[isPOCreated] [bit] NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[INV_TXN_RequisitionItemsForPO]    Script Date: 9/10/2019 10:48:37 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[INV_TXN_RequisitionItemsForPO](
	[RequisitionItemId] [int] IDENTITY(1,1) NOT NULL,
	[RequisitionId] [int] NOT NULL,
	[ItemId] [int] NOT NULL,
	[Quantity] [float] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[INV_MST_Vendor]
ADD [DefaultItemJSON] [varchar](max) NULL

GO

UPDATE INV_MST_Vendor
SET DefaultItemJSON = '[]'
WHERE DefaultItemJSON is null
GO
--END: Sanjit 10 Sept, 2019 Creating PO Requisition Table

--Start: Salakha 11th sept, 2019- Added PrincipleProblem  
alter table CLN_ActiveMedicals
add PrincipleProblem bit null
GO
alter table CLN_PastMedicals
add PrincipleProblem bit null
GO
--End: Salakha 11th sept, 2019- Added PrincipleProblem  


--START: Rajesh 11Sept 2019 ---------------

---> Start :-- Sales page child routing -----

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('sale-pharmacy-new',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('sale-pharmacy-list',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('sale-pharmacy-return',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('sale-pharmacy-returnList',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('sale-pharmacy-creditBills',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('sale-pharmacy-settlement',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Sale','Pharmacy/Sale/New','New',(Select PermissionId from RBAC_Permission where PermissionName='sale-pharmacy-new'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Sale'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Sale List','Pharmacy/Sale/List','List',(Select PermissionId from RBAC_Permission where PermissionName='sale-pharmacy-list'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Sale'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Return From Customer','Pharmacy/Sale/Return','Return',(Select PermissionId from RBAC_Permission where PermissionName='sale-pharmacy-return'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Sale'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Return Sale List','Pharmacy/Sale/ReturnList','ReturnList',(Select PermissionId from RBAC_Permission where PermissionName='sale-pharmacy-returnList'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Sale'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Provisional Bills','Pharmacy/Sale/CreditBills','CreditBills',(Select PermissionId from RBAC_Permission where PermissionName='sale-pharmacy-creditBills'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Sale'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Settlement','Pharmacy/Sale/Settlement','Settlement',(Select PermissionId from RBAC_Permission where PermissionName='sale-pharmacy-settlement'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Sale'),1,1)
go

---> End :-- Sales page child routing -----


---> Start :-- Order page child routing ------

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('order-pharmacy-purchaseOrderItems',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('order-pharmacy-purchaseOrderList',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('order-pharmacy-goodsReceiptItems',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('order-pharmacy-goodsReceiptList',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive)
VALUES ('Order','Pharmacy/Order/PurchaseOrderItems','PurchaseOrderItems',(Select PermissionId from RBAC_Permission where PermissionName='order-pharmacy-purchaseOrderItems'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Order'),'fa fa-plus-square',1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Order List','Pharmacy/Order/PurchaseOrderList','PurchaseOrderList',(Select PermissionId from RBAC_Permission where PermissionName='order-pharmacy-purchaseOrderList'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Order'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive)
VALUES ('Goods Receipt','Pharmacy/Order/GoodsReceiptItems','GoodsReceiptItems',(Select PermissionId from RBAC_Permission where PermissionName='order-pharmacy-goodsReceiptItems'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Order'),'fa fa-plus-square',1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Goods Receipt List','Pharmacy/Order/GoodsReceiptList','GoodsReceiptList',(Select PermissionId from RBAC_Permission where PermissionName='order-pharmacy-goodsReceiptList'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Order'),1,1)
go

---> End :-- Order page child routing ------


---> Start :-- Stock page child routing ------


INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('stock-pharmacy-stockDetails',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('stock-pharmacy-writeOffItems',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('stock-pharmacy-writeOffItemsList',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Stock Details List','Pharmacy/Stock/StockDetails','StockDetails',(Select PermissionId from RBAC_Permission where PermissionName='stock-pharmacy-stockDetails'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Stock'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive)
VALUES ('Breakage Item','Pharmacy/Stock/WriteOffItems','WriteOffItems',(Select PermissionId from RBAC_Permission where PermissionName='stock-pharmacy-writeOffItems'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Stock'),'glyphicon glyphicon-trash',1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Breakage List','Pharmacy/Stock/WriteOffItemsList','WriteOffItemsList',(Select PermissionId from RBAC_Permission where PermissionName='stock-pharmacy-writeOffItemsList'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Stock'),1,1)
go


---> End :-- Stock page child routing ------


---> Start :-- Store page child routing ------

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('store-pharmacy-returnItemsToSupplier',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('store-pharmacy-returnItemsToSupplierList',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('store-pharmacy-storeDetails',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('store-pharmacy-salesCategoryList',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive)
VALUES ('New Return Order','Pharmacy/Store/ReturnItemsToSupplier','ReturnItemsToSupplier',(Select PermissionId from RBAC_Permission where PermissionName='store-pharmacy-returnItemsToSupplier'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Store'),'glyphicon glyphicon-plus',1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('ReturnToSupplier ItemList','Pharmacy/Store/ReturnItemsToSupplierList','ReturnItemsToSupplierList',(Select PermissionId from RBAC_Permission where PermissionName='store-pharmacy-returnItemsToSupplierList'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Store'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Store Details List','Pharmacy/Store/StoreDetails','StoreDetails',(Select PermissionId from RBAC_Permission where PermissionName='store-pharmacy-storeDetails'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Store'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Sales Category List','Pharmacy/Store/SalesCategoryList','SalesCategoryList',(Select PermissionId from RBAC_Permission where PermissionName='store-pharmacy-salesCategoryList'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Store'),1,1)
go


---> End :-- Store page child routing ------


---> Start :-- Setting page child routing ------



INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-companyManage',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-categoryManage',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-unitOfMeasurementManage',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-itemTypeManage',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-itemManage',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-tAXManage',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-genericManage',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-stockTxnItemManage',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-dispensary',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('setting-pharmacy-rackSetting',(Select ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM'),1,GETDATE(),1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Company Manage','Pharmacy/Setting/CompanyManage','CompanyManage',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-companyManage'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Category Manage','Pharmacy/Setting/CategoryManage','CategoryManage',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-categoryManage'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('UnitOfMeasurement Manage','Pharmacy/Setting/UnitOfMeasurementManage','UnitOfMeasurementManage',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-unitOfMeasurementManage'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('ItemType Manage','Pharmacy/Setting/ItemTypeManage','ItemTypeManage',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-itemTypeManage'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Item Manage','Pharmacy/Setting/ItemManage','ItemManage',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-itemManage'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('TAX Manage','Pharmacy/Setting/TAXManage','TAXManage',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-tAXManage'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Generic Manage','Pharmacy/Setting/GenericManage','GenericManage',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-genericManage'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Item MRP','Pharmacy/Setting/StockTxnItemManage','StockTxnItemManage',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-stockTxnItemManage'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Dispensary','Pharmacy/Setting/Dispensary','Dispensary',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-dispensary'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES ('Rack','Pharmacy/Setting/RackSetting','RackSetting',(Select PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-rackSetting'),
(Select RouteId from RBAC_RouteConfig where UrlFullPath = 'Pharmacy/Setting'),1,1)
go

---> End :-- Setting page child routing ------

---END: Rajesh---------------

--Anish- Start: 12 Sept, CORE CFG parameter to enable Partial Billing in Provisional Items--
Insert into CORE_CFG_Parameters
values('Billing','EnablePartialProvBilling','false','boolean','Enabling select option in Provisional Billing','custom');
Go
--Anish- End: 12 Sept--

--ANish: Start: 13 Sept, Lab sticker setting in CoreCFG Updated--
Update CORE_CFG_Parameters
set ParameterName='LabStickerSettings',  ValueDataType='array',  ParameterValue='[{"Name":"LabStickerDefaultLocation", "FolderPath":"C:\\DanpheHealthInc_PvtLtd_Files\\Print\\LabSticker\\SampleCollection\\"}]'
where ParameterGroupName='LAB' and ParameterName='LabStickerSettings';
--Ansih: End: 13 Sept--


--START----data correction for previous migration----abhishek 2019-09-15
update PHRM_DispensaryStock set price= MRP where price is null and MRP is not null
--END----data correction for previous migration----abhishek 2019-09-15

--START-----Shankar-16thSept-2019----ALter PO table to add IsCancel column and Alter SPs to handle inventory reports ------
Alter table INV_TXN_PurchaseOrder
Add IsCancel bit
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId]    Script Date: 08/29/2019 10:37:45 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId] 
		@ItemId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Rusha/04 June 2019			    updated the script by adding vendor and company column
2       Shankar/16 Sept 2019            updated the script for IsCancel 
----------------------------------------------------------
*/
BEGIN
		If(@ItemId > 0)
			BEGIN
				SELECT com.CompanyName,ven.VendorName,itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						SUM(gdrp.FreeQuantity) AS BudgetedQuantity,
						SUM(gdrp.ItemRate) AS ItemRate,
						gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				WHERE stk.ItemId = @ItemId
				GROUP BY com.CompanyName,ven.VendorName,itm.ItemName,stk.BatchNO,gdrp.CreatedOn
			END
        ELSE 
		    BEGIN
				SELECT com.CompanyName,ven.VendorName,itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						SUM(gdrp.FreeQuantity) AS BudgetedQuantity,
						SUM(gdrp.ItemRate) AS ItemRate,
						gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId and grd.IsCancel = 0
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				GROUP BY com.CompanyName,ven.VendorName,itm.ItemName,stk.BatchNO,gdrp.CreatedOn
			END 
END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_PurchaseOrderSummeryReport]    Script Date: 08/29/2019 4:00:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Inventory_PurchaseOrderSummeryReport] ---- '2017-01-01','2018-01-01','' 
@FromDate DateTime=null,
@ToDate DateTime=null,
@OrderNumber NVARCHAR(max)=null

AS
/*
FileName: [SP_Report_Inventory_PurchaseOrderSummeryReport]
CreatedBy/date: Umed/2017-06-23
Description: to get Details such as Item Name,Total Qty,Received qty,pending qty, with expected Due Date of delivery Between Given Date input
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/2017-06-23	                   created the script
2       Shankar/2019-09-16                 Edited script to add IsCancel
-------------------------------------------------------
*/
BEGIN

		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 OR (@OrderNumber IS NOT NULL) OR LEN(@OrderNumber) > 0)
				BEGIN
					SELECT  CONVERT(date,po.CreatedOn) as [Date] ,
							poitm.PurchaseOrderId  as OrderNumber, 
							msitm.ItemName , 
							poitm.Quantity as TotalQty, 
							poitm.ReceivedQuantity,
							poitm.PendingQuantity,
							poitm.StandardRate,
							--poitm.DeliveryDays as Due,
		 
							convert(date,(po.CreatedOn+poitm.DeliveryDays) )as DueDate
					FROM    INV_TXN_PurchaseOrder po
					INNER JOIN INV_TXN_PurchaseOrderItems poitm ON poitm.PurchaseOrderId =po.PurchaseOrderId
					INNER JOIN INV_MST_Item msitm ON msitm.ItemId = poitm.ItemId
				    WHERE CONVERT(date,po.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())+1
			     	AND poitm.PurchaseOrderId  like '%'+ISNULL(@OrderNumber,'')+'%' and po.IsCancel = 0
							

				END
END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_ComparePoAndGR]    Script Date: 08/29/2019 5:36:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_Inventory_ComparePoAndGR]

AS
BEGIN

			BEGIN
						select itm.ItemName, vendor.VendorName, pitms.CreatedOn,pitms.Quantity,(gitms.ReceivedQuantity + gitms.FreeQuantity) RecevivedQuantity, gitms.CreatedOn Receivedon
 from INV_TXN_GoodsReceipt gr
 join INV_TXN_GoodsReceiptItems gitms on gitms.GoodsReceiptId = gr.GoodsReceiptId
 join INV_TXN_PurchaseOrderItems pitms on pitms.PurchaseOrderId = gr.PurchaseOrderId 
 join INV_MST_Item itm on gitms.ItemId = itm.ItemId
 join INV_MST_Vendor vendor on vendor.VendorId = gr.VendorId
 where gitms.ItemId = pitms.ItemId and gr.IsCancel = 0
 order by gr.PurchaseOrderId desc

				END
END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_Purchase]    Script Date: 09/13/2019 6:18:37 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- Shankar/2019-09-16  Edited script for IsCancel
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_Inventory_Purchase]

AS
BEGIN

			BEGIN
						select itm.ItemName, vendor.VendorName,vendor.ContactNo, pitms.CreatedOn,(gitms.ReceivedQuantity + gitms.FreeQuantity) TotalQuantity,pitms.StandardRate, PO.TotalAmount,gr.Discount
 from INV_TXN_GoodsReceipt gr   
 join INV_TXN_GoodsReceiptItems gitms on gitms.GoodsReceiptId = gr.GoodsReceiptId
 join INV_TXN_PurchaseOrderItems pitms on pitms.PurchaseOrderId = gr.PurchaseOrderId 
 join INV_MST_Item itm on gitms.ItemId = itm.ItemId
 join INV_TXN_PurchaseOrder PO on PO.PurchaseOrderId = pitms.PurchaseOrderId
 join INV_MST_Vendor vendor on vendor.VendorId = gr.VendorId
 where gitms.ItemId = pitms.ItemId AND gr.IsCancel = 0
 order by gr.PurchaseOrderId desc

				END
END
GO
----END---Shankar-16thSept-2019--ALter PO table to add IsCancel column and Alter SPs to handle inventory reports ------


--Start  -- Narayan 17th Sept ----------
/****** Object:  StoredProcedure [dbo].[SP_Report_Deposit_Balance]    Script Date: 09/17/2019 09:56:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Deposit_Balance]   
    
AS
/*
FileName: [SP_Report_Deposit_Balance]
CreatedBy/date: dinesh/2017-07-19
Description: To get the deposit Balance of the Patient
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/2017-05-25                     created the script
2       Umed/2018-04-23                  Apply Round Off on Deposit Balance Because During Export it Dont Require
3.    Ramavtar/2018-06-05        change the whole SP.. bring deposit amount of patients
4.     Narayan/2019-09-16       added  DepositId column.
--------------------------------------------------------
*/
BEGIN

SELECT (Cast(ROW_NUMBER() OVER (ORDER BY  d.PatientCode)  as int)) as SN, 
  d.PatientId, d.DepositId, d.PatientCode, d.PatientName, (d.TotalDeposit - d.DepositDeduction) 'DepositBalance' 
  FROM 
  (SELECT
    dep.PatientId,
    pat.PatientCode,
	dep.DepositId,
    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
    SUM(CASE WHEN dep.DepositType = 'Deposit' THEN ISNULL(dep.Amount, 0) ELSE 0 END) AS 'TotalDeposit',
    SUM(CASE WHEN dep.DepositType = 'depositdeduct' THEN ISNULL(dep.Amount, 0) ELSE 0 END) AS 'DepositDeduction'
  FROM BIL_TXN_Deposit dep
  JOIN PAT_Patient pat ON dep.PatientId = pat.PatientId
  GROUP BY 
    dep.PatientId,
	dep.DepositId,
        pat.PatientCode,
        pat.FirstName,
        pat.LastName,
        pat.MiddleName) d
WHERE d.TotalDeposit - d.DepositDeduction > 0

END
GO
--End  -- Narayan 17th Sept ----------


--start: Sud:17Sept'19--Correction in lab sticker script---
IF EXISTS (Select 1 from CORE_CFG_Parameters WHERE ParameterName='LabStickerFolderPath' and ParameterGroupName='LAB')
BEGIN
  Update CORE_CFG_Parameters
  set ParameterName='LabStickerSettings',  ValueDataType='array',  
  ParameterValue='[{"Name":"LabSticker1", "FolderPath":"C:\\DanpheHealthInc_PvtLtd_Files\\Print\\LabSticker\\LabSticker1\\"},{"Name":"LabSticker2", "FolderPath":"C:\\DanpheHealthInc_PvtLtd_Files\\Print\\LabSticker\\LabSticker2\\"}]'
  where ParameterGroupName='LAB' and ParameterName='LabStickerFolderPath';
END
ELSE
BEGIN
  Update CORE_CFG_Parameters
  set  ValueDataType='array',  
  ParameterValue='[{"Name":"LabSticker1", "FolderPath":"C:\\DanpheHealthInc_PvtLtd_Files\\Print\\LabSticker\\LabSticker1\\"},{"Name":"LabSticker2", "FolderPath":"C:\\DanpheHealthInc_PvtLtd_Files\\Print\\LabSticker\\LabSticker2\\"}]'
  where ParameterGroupName='LAB' and ParameterName='LabStickerSettings';
END
GO
--end: Sud:17Sept'19--Correction in lab sticker script---



----Start: Pratik-19Sept-For External Referral-- 

Alter Table EMP_Employee
ADD FullName Varchar(200);
GO
Alter Table EMP_Employee
ADD IsExternal BIT NOT null  CONSTRAINT DEF_Emp_IsExternal DEFAULT 0 WITH VALUES;
GO
---Update FullName colum, logic copied from EmployeeModel 
Update EMP_EMPloyee
SET FullName=ISNULL(Salutation+'. ','')+FirstName+' '+ ISNULL(MiddleName+' ','')  + LastName
WHERE IsExternal=0
GO

----End: Pratik-19Sept-For External Referral--

----Start: Pratik-20Sept-For External Referral--
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Settings' and ApplicationCode='SETT');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('settings-externalref-view',@ApplicationID,1,GETDATE(),1);
Go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='settings-externalref-view');

Declare @RefParentRouteID INT
SET @RefParentRouteID = (Select Top(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Settings');

Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
Values('External Referrals','Settings/ExtReferral','ExtReferral',@permissionID,@RefParentRouteID,1,20,1);
Go
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Billing','ExternalReferralSettings','{"EnableExternal":true, "DefaultExternal":false}','json','Enable or Disable External Referrer selection in billing transaction page.','custom');
Go

Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Appointment','ExternalReferralSettings','{"EnableExternal":true, "DefaultExternal":true}','json','Enable or Disable External Referrer selection in new visit page.','custom');
Go

----end: Pratik-20Sept-For External Referral--

--Start:22 Sept- ANish: New permisssion added for Lab Verifier--
Declare @AppId int;
Set @AppId = (Select ApplicationId from RBAC_Application where ApplicationName='Lab' and ApplicationCode='LAB');
Insert into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values('lab-verifier',@AppId,1,GETDATE(),1);
Go
--End:22 Sept- ANish: New permisssion added for Lab Verifier--

--Anish: 23 Sept: Start Make Category Name unique and Insert data into LabCategory table- ---
alter table LAB_TestCategory add constraint uniqueCategory unique(TestCategoryName);
Go
Insert Into LAB_TestCategory(TestCategoryName,CreatedBy,CreatedOn) Values ('Hematology',1,GETDATE());
Go
Insert Into LAB_TestCategory(TestCategoryName,CreatedBy,CreatedOn) Values ('Serology',1,GETDATE());
Go
Insert Into LAB_TestCategory(TestCategoryName,CreatedBy,CreatedOn) Values ('BioChemistry',1,GETDATE());
Go
--Anish: 23 Sept: End--


------Start: 23rd Sept-Dinesh: Lab Itemwise count and Revenue Report Created -----------------
----Itemwise Report Routing ----------

declare @appid int
set @appid= (select ApplicationId from RBAC_Application where ApplicationName='Reports')

insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-lab-itemwiselabreport-view',@appid,1,'2019-09-22',1)
Go

declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-lab-itemwiselabreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Item Wise Lab ','Reports/LabMain/ItemWiseLabReport','ItemWiseLabReport',@perid,
100,1,NULL,1)
Go

------------Itemwise Report SP

/****** Object:  StoredProcedure [dbo].[SP_Report_ItemwiseFromLab]    Script Date: 9/23/2019 11:08:43 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[SP_Report_ItemwiseFromLab] 
	@FromDate Date=null ,
	@ToDate Date=null	
AS
/*
FileName: [SP_Report_ItemwiseFromLab] '2019-10-09','2019-10-09'
CreatedBy/date: Dinesh/2019-09-22
Description: to get the total count and amount of individual Tests along with service Department Name
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh 2019-09-22					To get the count of Tests from Lab daywise
--------------------------------------------------------
*/

BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN 
			select x.ServiceDepartmentName, x.ItemName,Sum(Quantity) 'Unit',Sum(TotalAmount) 'TotalAmount' from (
SELECT
case when bt.ItemName like '%ECHO%' then 'ECHO'
 ELSE ItemName END as ItemName ,
--ELSE ISNULL (' ',0) END 'SD',
sd.ServiceDepartmentName 'ServiceDepartmentName',
    SUM(ISNULL(bt.Quantity, 0))  'Quantity',
    SUM(ISNULL(bt.TotalAmount, 0)) 'TotalAmount'
  FROM BIL_MST_ServiceDepartment sd join 
      BIL_TXN_BillingTransactionItems bt on sd.ServiceDepartmentId= bt.ServiceDepartmentId
  WHERE  ReturnStatus is null and BillStatus!='Cancel' and
  convert(date,bt.CreatedOn) between @FromDate and @ToDate and sd.IntegrationName like 'LAB'
  group by bt.ItemName,sd.IntegrationName,sd.ServiceDepartmentName
  )as x
  --where x.ItemName !='Unknown'
  group by x.ItemName,x.ServiceDepartmentName
  order by Unit desc
	END	
END
GO

------End: 23rd Sept-Dinesh: Lab Itemwise count and Revenue Report Created -----------------

------Start: 23rd Sept-Rusha: Lab -> Total Revenue Report -----------------

/****** Object:  StoredProcedure [dbo].[SP_Report_TotalRevenueFromLab] '09/23/2019','09/23/2019'   Script Date: 09/23/2019 1:25:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_TotalRevenueFromLab]
	@FromDate DATE=NULL ,
	@ToDate DATE= NULL
AS
/*
FileName: [SP_Report_TotalRevenueFromLab] 
Description: to get the total revenue from lab 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Rusha 2019-09-23					To get daily total revenue
--------------------------------------------------------
*/
BEGIN
	    IF(@FromDate IS NOT NULL OR @ToDate IS NOT NULL OR LEN(@FromDate)>0 OR LEN(@ToDate)>0)
		BEGIN
			SELECT   CONVERT(DATE,PaidDate) AS [Date],SUM(TotalAmount) AS TotalRevenue,
					 SUM(DiscountAmount) AS TotalDiscount, SUM(isnull(TaxableAmount,0)) as TotalTax 
					 FROM BIL_TXN_BillingTransactionItems bt
					 join BIL_MST_ServiceDepartment sd on  sd.ServiceDepartmentId = bt.ServiceDepartmentId
					 WHERE sd.IntegrationName = 'LAB' and bt.ReturnStatus is null
					 AND CONVERT(DATE,PaidDate) BETWEEN @FromDate AND @ToDate 
			GROUP BY CONVERT(DATE,PaidDate) 
		END
END
GO

------End: 23rd Sept-Rusha: Lab -> Total Revenue Report -----------------

----Start: 23rd Sept-Dinesh : Scan Card Routing Defined into DB ----------------
declare @appid int
set @appid= (select ApplicationId from RBAC_Application where ApplicationName='Billing')

insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('danphe-qr-billing-view',@appid,1,'2019-09-23',1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='danphe-qr-billing-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive,Css)
values('Scan Health Card ','Billing/QrBilling','QrBilling',@perid,
37,1,NULL,1,'fa fa-qrcode')
Go
----END: 23rd Sept-Dinesh : Scan Card Routing Defined into DB ----------------

----Start: 24th Sept- Naveed: Get GR CreatedOn date as a Date of Store details List----

/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]    Script Date: 24-09-2019 10:40:31 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[SP_PHRMStoreStock]
	@Status varchar(200) = NULL
AS
/*
FileName: [SP_PHRMStore]
CreatedBy/date: Shankar/04-03-2019
Description: To get the Details of store Items
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/04-08-2019						Add From and to Date for date filter
2.		Sanjit/04-09-2019						StoreName has been added.
3.      Shankar/04-15-2019                      IsActive added.
4.		Rusha/05-23-2019						Remove From and to Date for date filter and handled quantity not equals to zero
5.		Rusha/06-11-2019						Updated script
6.		Naveed/24-11-2019						Get GR CreatedOn date as Date in Store details List
----------------------------------------------------------------------------
*/
BEGIN
	IF(@Status IS NOT NULL)
		BEGIN
				SELECT  x1.ItemName,x1.BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
			    (SELECT CreatedOn FROM PHRM_GoodsReceiptItems where GoodReceiptItemId= x1.GoodsReceiptItemId )AS 'Date',
				SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price
				FROM(SELECT stk.ItemName, stk.BatchNo, stk.ExpiryDate, stk.MRP,stk.StoreName,
				stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				join PHRM_GoodsReceiptItems as gritm on gritm.GoodReceiptItemId = stk.GoodsReceiptItemId
				GROUP BY stk.ItemName, stk.BatchNo , stk.ExpiryDate, stk.MRP,stk.StoreName,stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price)as x1
				WHERE (@Status=x1.ItemName or x1.ItemName like '%'+ISNULL(@Status,'')+'%')
				GROUP BY x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.MRP,x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price
				
		END		
END
GO
----End: 24th Sept- Naveed: Get GR CreatedOn date as a Date of Store details List----

--Anish: Start: 24 Sept: Parameter to Enable Digital Signature--
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
  values('LAB','EnableDigitalSignatureInLab','true','boolean','To enable showing the Digital signature in Lab Report','custom');
--Anish: End: 24 Sept: Parameter to Enable Digital Signature--

----Start: 24th Sept-Sanjit :Add IPD Route In Doctors Module ----------------
--Setting Route for In Patient Department -----
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Doctors' and ApplicationCode='DOC');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('doctors-ipd-view',@ApplicationID,1,GETDATE(),1)
Go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='doctors-ipd-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Doctors');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
VALUES ('In Patient Department','Doctors/InPatientDepartment','InPatientDepartment',@permissionID,@parentRouteId,1,1,2)
GO
UPDATE RBAC_RouteConfig
SET DefaultShow = 1 
WHERE DisplayName='My Appointments' and UrlFullPath='Doctors/OutPatientDoctor' and RouterLink= 'OutPatientDoctor'
GO
----END: 24th Sept-Sanjit :Add IPD Route In Doctors Module ----------------


----Start: Pratik-25Sept-For External Referral--
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Radiology','ExternalReferralSettings','{"EnableExternal":true, "DefaultExternal":false,"AllowFreeText":true}','json','Enable or Disable External Referrer selection in Radiology add report and view report page.','custom');
Go
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('LAB','ExternalReferralSettings','{"EnableExternal":true, "DefaultExternal":false, "AllowFreeText":false}','json','Enable or Disable External Referrer selection in lab view-report page.','custom');
Go
update CORE_CFG_Parameters
set ParameterValue='{"EnableExternal":true, "DefaultExternal":true, "AllowFreeText":false}'
where ParameterGroupName= 'Appointment' and ParameterName='ExternalReferralSettings'
Go
update CORE_CFG_Parameters
set ParameterValue='{"EnableExternal":true, "DefaultExternal":false, "AllowFreeText":false}'
where ParameterGroupName= 'Billing' and ParameterName='ExternalReferralSettings'
Go
----End: Pratik-25Sept-For External Referral--

----Start: Shankar-26Sept'19 Route and SPs for Cancelled PO-GR report------------
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Inventory' and ApplicationCode='INV');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('inventory-reports-cancelledpoandgr-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='inventory-reports-cancelledpoandgr-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Inventory/Reports')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, css, DefaultShow, IsActive)
values ('Cancelled PO and GR', 'Inventory/Reports/CancelledPOandGR','CancelledPOandGR',@PermissionId,@RefParentRouteId,'fa fa-times-circle fa-stack-1x text-white',1,1);
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_CancelGoodsReceiptReport] '2019-08-25', '2019-09-25'   Script Date: 09/26/2019 10:48:16 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_Inventory_CancelGoodsReceiptReport]
@FromDate DateTime=null,
@ToDate DateTime=null
AS
/*
FileName: [SP_Report_Inventory_CancelGoodsReceiptReport] 
CreatedBy/date: Shankar/2019-09-26
Description: report for cancelled GR in inventory
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1. 
-------------------------------------------------------
*/
BEGIN

		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0)
				BEGIN
					SELECT  CONVERT(date,gr.CreatedOn) as GoodsReceiptDate,
							po.PurchaseOrderId,
							gr.GoodsReceiptID,
							v.VendorName,
							v.ContactNo,
							gr.TotalAmount
					FROM    INV_TXN_GoodsReceipt gr
					LEFT OUTER JOIN INV_TXN_PurchaseOrder po ON po.PurchaseOrderId = gr.PurchaseOrderId
					INNER JOIN INV_MST_Vendor v ON v.VendorId = po.VendorId
				    WHERE CONVERT(date,gr.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())+1
			     	and gr.IsCancel = 1
					UNION all
					SELECT CONVERT(date,gr.CreatedOn) as GoodsReceiptDate,
							Null  as OrderNumber,
							gr.GoodsReceiptID,
							v.VendorName,
							v.ContactNo,
							gr.TotalAmount
							FROM    INV_TXN_GoodsReceipt gr
							INNER JOIN INV_MST_Vendor v on v.VendorId = gr.VendorId
							WHERE CONVERT(date,gr.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())+1 and gr.PurchaseOrderId is null
							

				END
	
END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_CancelPurchaseOrderReport] '2019-08-25', '2019-09-25'   Script Date: 09/26/2019 3:57:17 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_Inventory_CancelPurchaseOrderReport] 
@FromDate DateTime=null,
@ToDate DateTime=null

AS
/*
FileName: [SP_Report_Inventory_CancelPurchaseOrderReport] 
CreatedBy/date: Shankar/2019-09-26
Description: report for cancelled PO in inventory
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1. 
-------------------------------------------------------
*/
BEGIN

		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0)
				BEGIN
					SELECT  CONVERT(date,po.CreatedOn) as OrderDate,
							po.PurchaseOrderId,
							v.VendorName,
							v.ContactNo,
							po.TotalAmount
					FROM    INV_TXN_PurchaseOrder po
					INNER JOIN INV_MST_Vendor v on v.VendorId = po.VendorId
				    WHERE CONVERT(date,po.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())+1
			     	and po.IsCancel = 1
							

				END
END
GO
----END: Shankar-26Sept'19 Route and SPs for Cancelled PO-GR report------------

 --Start: Pratik- 26 sep, 2019--- Upadating Description in LabReportFormat---

 update CORE_CFG_Parameters
 set Description= 'Which Format to use in Lab Report  available formats are: format1, format2.  default is format1'
 where ParameterName='LabReportFormat' and ParameterGroupName='LAB' 
 GO
 --End: Pratik- 26 sep, 2019--- Upadating Description in LabReportFormat---


 --Start: Kushal- 30 sep, 2019-- Updated Script
 /****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId]    Script Date: 9/30/2019 3:08:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId] 
		@ItemId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Rusha/04 June 2019			    updated the script by adding vendor and company column
2       Shankar/16 Sept 2019            updated the script for IsCancel 
3		Kushal/30 Sept 2019				Updated Script for Item ID, total Value, Expiry Date, Sub Category 
----------------------------------------------------------
*/
BEGIN
		If(@ItemId > 0)
			BEGIN
				SELECT com.CompanyName,ven.VendorName,itm.Code,itm.ItemName,itmsub.SubCategoryName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						gdrp.ExpiryDate AS ExpiryDate,
						SUM(gdrp.FreeQuantity) AS BudgetedQuantity,
						SUM(gdrp.ItemRate) AS ItemRate,
						SUM( gdrp.ItemRate * stk.AvailableQuantity) AS TotalValue,
						
						gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId and grd.IsCancel = 0
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				JOIN INV_MST_ItemSubCategory as itmsub on itm.SubCategoryId = itmsub.SubCategoryId
				WHERE stk.ItemId = @ItemId
				GROUP BY com.CompanyName,ven.VendorName,itm.ItemName,itm.Code,stk.BatchNO,gdrp.CreatedOn,itmsub.SubCategoryName,gdrp.ExpiryDate
			END
        ELSE 
		    BEGIN
				SELECT com.CompanyName,ven.VendorName,itm.Code,itm.ItemName,itmsub.SubCategoryName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						gdrp.ExpiryDate AS ExpiryDate,
						SUM(gdrp.FreeQuantity) AS BudgetedQuantity,
						SUM(gdrp.ItemRate) AS ItemRate,
						SUM(gdrp.ItemRate * stk.AvailableQuantity ) AS TotalValue,
						gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId and grd.IsCancel = 0
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				JOIN INV_MST_ItemSubCategory as itmsub on itm.SubCategoryId = itmsub.SubCategoryId
				GROUP BY com.CompanyName,ven.VendorName,itm.ItemName,itm.Code,stk.BatchNO,gdrp.CreatedOn,itmsub.SubCategoryName,gdrp.ExpiryDate
			END 
END
GO
--End: Kushal- 30 sep, 2019-

--Start: Pratik- 30 sep, 2019---
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Radiology','ReportHeaderPatientNameSettings','{"LocalNameEnabled":false, "DefaultLocalLang":false}','json','Choose to show Patient Name of Report Header in Local Language or not.','custom');
Go
--end: Pratik- 30 sep, 2019---

--Start: Rajesh 30Sept,2019 for Partial Bill Return-- (reverse integration from feature branch)
ALTER TABLE BIL_TXN_BillingTransaction
ADD PartialReturnTxnId int null;
GO
insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType) 
values('BILL','EnablePartialBillReturn','false','boolean',' enable or disable partial return  (selected item return) from bill return page. default is false.','custom')

--End: Rajesh 30Sept,2019 for Partial Bill Return-- (reverse integration from feature branch)

---Start: Dinesh:1st_October '19:  - Diagnosis wise Patient Report -----------------------------------------------------------------------
GO
declare @appid int
set @appid= (select ApplicationId from RBAC_Application where ApplicationName='Reports')

insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-admissionmain-diagnosiswisepatientreport-view',@appid,1,'2019-09-29',1)
Go

declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-admissionmain-diagnosiswisepatientreport-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('DiagnosisWise Patient ','Reports/AdmissionMain/DiagnosisWisePatientReport','DiagnosisWisePatientReport',@perid,
78,1,NULL,1)
Go


------------------SP------------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_DiagnosisWiseReport]    Script Date: 9/29/2019 2:53:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[SP_Report_ADT_DiagnosisWiseReport] 
	@FromDate Date=null ,
	@ToDate Date=null,
	@Diagnosis varchar(max) = null
AS
/*
FileName: [SP_Report_ADT_DiagnosisWiseReport]   '2019-09-29','2019-09-29', 'typhoid'
CreatedBy/date: Dinesh/2019-09-29
Description: to get the no of patient's count diagnosis wise
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh 2019-09-29					to get the no of patient's count diagnosis wise
--------------------------------------------------------
*/
BEGIN
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 AND (@Diagnosis IS NOT NULL)
        OR (LEN(@Diagnosis) > 0 ))
	BEGIN 
			select convert(date,x.[Date]) as 'Date',x.PatientCode as 'PatientCode',x.PatientName as 'PatientName', x.PhoneNumber, x.Diagnosis
			
			 from (
select pt.FirstName +' '+ Isnull(pt.MiddleName,'') + ' '+pt.LastName as 'PatientName',discharge.Diagnosis as 'Diagnosis'
,pt.PatientCode,pt.PhoneNumber,discharge.CreatedOn as 'Date' from 
ADT_DischargeSummary discharge join PAT_PatientVisits visit on discharge.PatientVisitId=visit.PatientVisitId 
inner join PAT_Patient  pt on pt.PatientId=visit.PatientId
where discharge.Diagnosis LIKE '%' + ISNULL(@Diagnosis, '') + '%' and 
CONVERT(date, discharge.createdOn) BETWEEN @FromDate AND @ToDate
  )as x
  group by x.Diagnosis, x.PatientName,x. PatientCode,PhoneNumber,[Date]
  order by Diagnosis asc
	END	
END

GO

---END: Dinesh:1st_October '19:  - Diagnosis wise Patient Report ----------------------------------------------------
---Start: Shankar:2nd_Oct'19: Changed datatype of column quantity----
Alter table INV_TXN_RequisitionItems
ALter column Quantity int
GO
---End: Shankar:2nd_Oct'19: Changed datatype of column quantity----

--Anish: Start 3 Oct, Result AddedBy old data Update--
Update LAB_TestRequisition
set ResultAddedOn = SampleCreatedOn
where OrderStatus='result-added' and ResultAddedOn is null;
Go
Update LAB_TestRequisition
set ResultAddedOn = SampleCreatedOn
where OrderStatus='report-generated' and ResultAddedOn is null
Go
--Anish: End 3 Oct--
--Sanjit: Start 4 Oct, Modified By and Modified On added in GoodsReceipt and StoreStock Table in pharmacy--
GO
ALTER TABLE dbo.PHRM_GoodsReceipt ADD
  ModifiedBy int NULL,
  ModifiedOn datetime NULL
GO
GO
ALTER TABLE dbo.PHRM_StoreStock ADD
  ModifiedBy int NULL,
  ModifiedOn datetime NULL
GO
--Sanjit: END 4 Oct, Modified By and Modified On added in GoodsReceipt and StoreStock Table in pharmacy--
--Sanjit: Start 14 Oct, Delete the extra Manage tab in scheduling module--
GO
DELETE FROM RBAC_RouteConfig WHERE UrlFullPath = 'Scheduling/ManageSchedules' and DisplayName = 'Manage' and RouterLink='ManageSchedules'
GO
--Sanjit: END 14 Oct, Delete the extra Manage tab in scheduling module--

--Kushal: START 15 Oct, added PurchaseOrderId, GoodReceiptID and Serial Number on COMPARISON REPORT: PURCHASE-ORDER & GOODS-RECEIPT--
	GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_ComparePoAndGR]    Script Date: 10/15/2019 3:09:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                       	 Remarks
1.	Kushal Baidhya				Addition of S.No, PurchaseOrderID and GoodReceiptId
-------------------------------------------------------
*/

ALTER PROCEDURE [dbo].[SP_Report_Inventory_ComparePoAndGR]

AS
BEGIN

	BEGIN
		select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, itm.ItemName, vendor.VendorName, pitms.CreatedOn,pitms.Quantity,(gitms.ReceivedQuantity + gitms.FreeQuantity) RecevivedQuantity, gitms.CreatedOn Receivedon, gr.GoodsReceiptID, gr.PurchaseOrderId
 from INV_TXN_GoodsReceipt gr
 join INV_TXN_GoodsReceiptItems gitms on gitms.GoodsReceiptId = gr.GoodsReceiptId
 join INV_TXN_PurchaseOrderItems pitms on pitms.PurchaseOrderId = gr.PurchaseOrderId 
 join INV_MST_Item itm on gitms.ItemId = itm.ItemId
 join INV_MST_Vendor vendor on vendor.VendorId = gr.VendorId
 where gitms.ItemId = pitms.ItemId and gr.IsCancel = 0
 order by gr.PurchaseOrderId desc

	END
END
GO

--Kushal: END 15 Oct, added PurchaseOrderId, GoodReceiptID and Serial Number on COMPARISON REPORT: PURCHASE-ORDER & GOODS-RECEIPT--


----Start: Pratik-16oct-For Referral summary reports--

declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Reports' and ApplicationCode='RPT');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('reports-billingmain-referral-summary-report-view',@ApplicationID,1,GETDATE(),1);
Go
--reports-billingmain-refferrersummaryreport-view
declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='reports-billingmain-referral-summary-report-view');

Declare @RefParentRouteID INT
SET @RefParentRouteID = (Select Top(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Reports/BillingMain');

Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DisplaySeq,IsActive)
Values('Referral Summary','Reports/BillingMain/ReferralMain','ReferralMain',@permissionID,@RefParentRouteID,'fa fa-money fa-stack-1x text-white',null,1);
Go

/****** Object:  UserDefinedFunction [dbo].[FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional]    Script Date: 10/16/2019 4:22:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional]
(@StartDate Date, @EndDate Date)

/*
File: select * from FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional ('2019-01-01','2019-05-05')
Created: <sud:21Feb'19>
Description: Get individual components of sales eg: CashSales, CreditSales, CashReturn, CreditReturn, CreditReceived from Item Table ( BIL_TXN_BIllingTransactionItems )
NOTE: Provisional And Cancelled items are excluded from this.

Logic Used:
  Cash Sales   => billstatus=paid & paid on same day, 
  Credit Sales => billStatus = unpaid or paid on different day. i.e: this will be credit sales for InvoiceCreatedDate.
  CashReturn  => billStatus=paid and get from ReturnTable.
  CreditReturn => txn.PaymentMode='credit' and txn.BillStatus = 'unpaid'
  CreditReceived => bill status = paid and if its paid on different day, it'll be CreditReceived for PaidDate.

Change History:
-------------------------------------------------------------------------------
S.No.  ChangedBy/Date                           Remarks
-------------------------------------------------------------------------------
1.    Sud/21Feb'19                            Initial Draft
2.    Sud/13Mar'19                            ServiceDepartmentName is returned as it is, so that individual reports can decide how to show it..
                                               earlier we're getting it from ReportingName_DoctorSummary.
3.    Dinesh /27th May'19					  Added ReferredByDoctor 
4.    Sud/Pratik/13 Oct'19                    Added ReferrerId  for Referral Report.
                                              Replaced emp names with employee FullName column.
-------------------------------------------------------------------------------
*/
RETURNS TABLE
AS
RETURN
(

	
		WITH AllItems AS
			(

			Select  pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ','') + pat.LastName 'PatientName',
			CASE WHEN txnItemInfo.ProviderId IS NOT NULL
					 --sud:31Jan'19--Isnull check for Salutation (needed for ER Doctor: Duty Doctor)--
					 THEN emp.FullName  --pratik:13Oct'19-- now we can get emplyee full name directly
					--THEN ISNULL(emp.Salutation + '. ','') + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS DoctorName,
				CASE WHEN txnItemInfo.RequestedBy IS NOT NULL
					 --sud:31Jan'19--Isnull check for Salutation (needed for ER Doctor: Duty Doctor)--
					 THEN refemp.FullName
					--THEN ISNULL(refemp.Salutation + '. ','') + refemp.FirstName + ' ' + ISNULL(refemp.MiddleName + ' ','') + refemp.LastName
					ELSE NULL 
				END AS ReferredDoctorName,
				--refemp.IsExternal as 'IsExtReferrer',

			  txnItemInfo.* 
			  
			  from VW_BIL_TxnItemsInfoWithDateSeparation txnItemInfo 

			      Inner Join PAT_Patient pat on txnItemInfo.PatientId=pat.Patientid
				  Left Join EMP_Employee emp ON txnItemInfo.ProviderId = emp.EmployeeId
				  Left Join EMP_Employee refemp ON txnItemInfo.RequestedBy = refemp.EmployeeId

			  WHERE
				billstatus !='provisional' and billstatus !='cancel'
				AND
				(
				  txnItemInfo.InvoiceCreatedDate BETWEEN @StartDate and @EndDate
				OR  txnItemInfo.InvoicePaidDate BETWEEN @StartDate and @EndDate
				OR  txnItemInfo.ReturnDate BETWEEN @StartDate and @EndDate
				)


			)

			--Cash Sales (Same Day)--
			Select   Convert(Date,InvoicePaidDate) 'BillingDate', 
						Patientid, PatientName,
						'CashSales' AS 'BillingType',
						SubTotal,DiscountAmount, TotalAmount, 
						Price, Quantity, 0 As ReturnQuantity, 
						0 AS ReturnSubTotal, 0 AS ReturnDiscount, 0 AS ReturnTotalAmount,

						TotalAmount AS 'CashCollection', 
						0 AS CreditReceived,  0 AS 'CreditAmount',

					   BillingTransactionItemId,ItemId,ItemName, 
					   ServiceDepartmentId, 
					    --[dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName',
					   ServiceDepartmentName AS 'ServiceDepartmentName'
					   , ProviderId, DoctorName AS 'ProviderName',
					   RequestedBy AS 'ReferrerId',
					   ReferredDoctorName as 'ReferredDoctorName',
					   --IsExtReferrer,
					   InvoiceNumber ,

						 1 as DisplaySeq
			from AllItems
			Where Billstatus='paid' and Convert(Date,InvoiceCreatedDate) = Convert(Date,InvoicePaidDate)
			  AND InvoicePaidDate BETWEEN @StartDate and @EndDate

			UNION ALL

			--Credit Sales --
			Select   Convert(Date,InvoiceCreatedDate) 'BillingDate', 
						Patientid, PatientName,
						'CreditSales' AS 'BillingType',
						SubTotal,DiscountAmount, TotalAmount, 
						Price, Quantity, 0 As ReturnQuantity,
						0 AS ReturnSubTotal, 0 AS ReturnDiscount, 0 AS ReturnTotalAmount,
						0 AS 'CashCollection', 
						0 AS CreditReceived,  TotalAmount AS 'CreditAmount',
						  BillingTransactionItemId,ItemId,ItemName, 
						  ServiceDepartmentId, 
					    --[dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName',
					   ServiceDepartmentName AS 'ServiceDepartmentName'
						  , ProviderId,  DoctorName AS 'ProviderName',
						    RequestedBy AS 'ReferrerId',
							ReferredDoctorName as 'ReferredDoctorName', 
							--IsExtReferrer,
							InvoiceNumber ,
						 2 as DisplaySeq
			from AllItems
			Where (Billstatus='unpaid' OR (BillStatus='paid' and Convert(Date,InvoicePaidDate) != Convert(Date,InvoiceCreatedDate)) )
			AND InvoiceCreatedDate  BETWEEN @StartDate and @EndDate


			UNION ALL

			--CreditReceived--
			Select   Convert(Date,InvoicePaidDate) 'BillingDate', 
						Patientid, PatientName,
						'CreditReceived' AS 'BillingType',
						0 SubTotal,0 DiscountAmount, 0 TotalAmount, 
						Price, 0 As Quantity, 0 As ReturnQuantity,
						0 AS ReturnSubTotal, 0 AS ReturnDiscount, 0 AS ReturnTotalAmount,
						TotalAmount AS 'CashCollection', 
						TotalAmount AS CreditReceived,  0 AS 'CreditAmount',
						  BillingTransactionItemId,ItemId,ItemName, 
						 ServiceDepartmentId, 
						    --[dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName',
					   ServiceDepartmentName AS 'ServiceDepartmentName'
						  , ProviderId,  DoctorName AS 'ProviderName',
						    RequestedBy AS 'ReferrerId',
							ReferredDoctorName as 'ReferredDoctorName',
							 --IsExtReferrer,
							 InvoiceNumber ,
						 3 as DisplaySeq
			from AllItems
			Where PaymentMode='credit' and BillStatus='paid' and Convert(Date,InvoicePaidDate) != Convert(Date,InvoiceCreatedDate)
			AND InvoicePaidDate BETWEEN @StartDate AND @EndDate

			UNION ALL

			--CashReturn--
			SELECT   Convert(Date,ReturnDate) 'BillingDate', 
						Patientid, PatientName,
						'CashReturn' AS 'BillingType',
						0 AS SubTotal, 0 AS DiscountAmount, 0 AS TotalAmount, 
						Price, 0 As Quantity, Quantity As ReturnQuantity,
						SubTotal AS ReturnSubTotal, DiscountAmount AS ReturnDiscount, TotalAmount AS ReturnTotalAmount,
						-TotalAmount AS 'CashCollection', 
						0 AS CreditReceived,  0 AS 'CreditAmount',
						  BillingTransactionItemId,ItemId,ItemName, 
						   ServiceDepartmentId, 
						     --[dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName',
					   ServiceDepartmentName AS 'ServiceDepartmentName'
						  , ProviderId,  DoctorName AS 'ProviderName',
						    RequestedBy AS 'ReferrerId',
							ReferredDoctorName as 'ReferredDoctorName',
							 --IsExtReferrer,
							 InvoiceNumber ,
						 3 as DisplaySeq
			FROM AllItems
			WHERE  BillStatus='paid'  AND  ReturnDate  BETWEEN @StartDate and @EndDate

			UNION ALL

			--CreditReturn--
			SELECT   Convert(Date,ReturnDate) 'BillingDate', 
						Patientid, PatientName,
						'CreditReturn' AS 'BillingType',
						0 AS SubTotal, 0 AS DiscountAmount, 0 AS TotalAmount, 
						Price, 0 As Quantity, Quantity As ReturnQuantity,
						SubTotal AS ReturnSubTotal, DiscountAmount AS ReturnDiscount, TotalAmount AS ReturnTotalAmount,
						0 AS 'CashCollection', 
						0 AS CreditReceived,  -TotalAmount AS 'CreditAmount',
						  BillingTransactionItemId,ItemId,ItemName, 
						   ServiceDepartmentId, 
			    --[dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName',
					   ServiceDepartmentName AS 'ServiceDepartmentName'
						  , ProviderId,  DoctorName AS 'ProviderName',
						    RequestedBy AS 'ReferrerId',
							ReferredDoctorName as 'ReferredDoctorName',
							 --IsExtReferrer,
							 InvoiceNumber ,
						 3 as DisplaySeq
			FROM AllItems
			WHERE  BillStatus='unpaid'  AND  ReturnDate  BETWEEN @StartDate and @EndDate
			

)

Go

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary]    Script Date: 10/16/2019 4:22:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary]   ('2018-09-12','2018-09-12')
--- select * from VW_BIL_TxnItemsInfoWithDateSeparation
/*
 File: [FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary] 
 Created: 15Aug'18 <sud>
 Description: This takes item's info from a view and does separation of Different Dates and Amount based on input values.
 Remarks: Needs Revision, Add more fields as per requirments
 ------------Change History------------
 S.No.   ModifiedBy/Date         Remarks
 ----------------------------------------
 1.      Sud/15Aug'18           Initial Version
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 3.      Sud/30Aug'18           Revised for Provisional and BillStatus
 4.      Dinesh/10Sept'18		passing itemname along with srvDeptName to the function
 5.      Dinesh/14Sept'18		added Provisional amount for doctor summary report
 6.		 Ramavtar/12Nov'18		getting providerName from employee table
 7.      Pratik/13oct'19        getting ReferrerId and ReferredByDocName for Referral Reports.
 ------------------------------------------ */
AS
RETURN
( 

   -------------Start:Ot (Outer Table)-----------------------------------------
		SELECT 
		CASE WHEN A.PaidDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'PaidAmount',
		CASE WHEN A.ReturnDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'ReturnAmount',
		CASE WHEN A.CreditDate IS NOT NULL AND A.PaidDate IS NULL AND A.ReturnDate IS NULL THEN A.Total_Temp ELSE 0 END AS 'CreditAmount',
		CASE WHEN A.CancelledDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'CancelledAmount',
		CASE WHEN A.ProvisionalDate IS NOT NULL 
			  AND A.CancelledDate IS NULL
			  AND A.CreditDate IS NULL
			  AND A.PaidDate IS NULL 
			  AND A.ReturnDate IS NULL 
			  THEN A.Total_Temp ELSE 0 END AS 'ProvisionalAmount',
       CASE WHEN A.ReturnDate IS NOT NULL THEN 'return'
	        WHEN A.PaidDate IS NOT NULL THEN 'paid'
			WHEN A.CreditDate IS NOT NULL THEN 'credit'
			WHEN A.CancelledDate IS NOT NULL THEN 'cancelled'
			WHEN A.ProvisionalDate IS NOT NULL THEN 'provisional'
			ELSE 'none' END AS 'BillStatus',

      ---in case bill was only returned on given date selection, we should omit the value also from Price, Qty, Subtotal, Discount fields..
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Price_Temp ELSE 0 END AS Price,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Qty_Temp ELSE 0 END AS Quantity,
      CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Subtot_Temp ELSE 0 END AS SubTotal,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Discount_Temp ELSE 0 END AS DiscountAmount,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS TotalAmount,

		* FROM 
		 (
		    ----------------------------------------------------------------------
			  SELECT PatientId, BillingTransactionItemId, ItemId, ItemName, ServiceDepartmentId,
			  --below four fields shouldn't be there when only return has happened in given date range.
			  Price AS Price_Temp,
			  Quantity AS Qty_Temp,
			  SubTotal AS Subtot_Temp,
			  DiscountAmount AS Discount_Temp,
			  TotalAmount AS Total_Temp, 
				--we're using below scalar value function to get reporting name of item's SrvDeptName 
				[dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN emp.FullName
					ELSE NULL 
				END AS ProviderName,


					itmInfo.RequestedBy AS 'ReferrerId',
				CASE WHEN itmInfo.RequestedBy IS NOT NULL
					THEN refByEmp.FullName
					ELSE NULL 
				END AS ReferredDoctorName,



				BillingType, 
				RequestingDeptId,
				CASE 
					WHEN itmInfo.CreditDate IS NULL AND itmInfo.PaymentMode = 'credit' THEN 'CreditPaidSameDay'
					ELSE itmInfo.PaymentMode
				END AS 'PaymentMode',
				VisitType,
					CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
					CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
					CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
					CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
					LEFT JOIN [dbo].[EMP_Employee] emp ON itmInfo.ProviderId = emp.EmployeeId
					LEFT JOIN EMP_Employee refByEmp ON itmInfo.RequestedBy = refByEmp.EmployeeId  -- extra join to get referrername.
			-------------------------------------------------------------------
			) A  -- end of inner select
			---no need to return those items where none of below fields are there---
		WHERE
		 ( A.ProvisionalDate IS NOT NULL
			OR A.CancelledDate IS NOT NULL
			OR A.CreditDate IS NOT NULL
			OR A.PaidDate IS NOT NULL
			OR A.ReturnDate IS NOT NULL )
)---end of return

Go

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_ReferralItemsSummary]    Script Date: 10/16/2019 4:23:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author/Date:		Sud/Pratik/16Oct'19
-- Description:		to show referral Item summary, We're taking details of all items of given referrerId in a date range.
-- Remarks:        
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_BIL_ReferralItemsSummary] 
@FromDate datetime = NULL,
@ToDate datetime = NULL,
@ReferrerId int = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Sud/Pratik/13Oct'19    		initail draft
----------------------------------------------------------
*/
BEGIN
			SELECT
			    BillingDate 'Date',
			    ISNULL(fnItems.ReferredDoctorName, 'No Doctor') AS 'ReferrerName',
			    pat.PatientCode,
			    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			   [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (fnItems.ServiceDepartmentName, ItemName) AS 'ServiceDepartmentName',
			    fnItems.ItemName,
			    fnItems.Price,
			    ISNULL(fnItems.Quantity, 0) - ISNULL(fnItems.ReturnQuantity, 0) Quantity,
			    fnItems.SubTotal,
			    fnItems.DiscountAmount,
			    fnItems.TotalAmount,
			    fnItems.ReturnTotalAmount 'ReturnAmount',
			    fnItems.TotalAmount - fnItems.ReturnTotalAmount 'NetAmount'
			FROM 
	
			  FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate) fnItems

			JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
			WHERE 
			      ISNULL(fnItems.ReferrerId, 0) = @ReferrerId
				and fnItems.BillingType !='CreditReceived'
			ORDER BY 1 DESC


			---Table 2: returning provisional amount---
			SELECT 
				SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
				SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
				SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate,@ToDate)
			WHERE  ISNULL(ReferrerId,0) = @ReferrerId


END  --End of SP


GO


/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_ReferralSummary]    Script Date: 10/16/2019 4:23:26 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author/Date:		Sud/Pratik/13Oct'19
-- Description:		to show referral summary
-- Remarks:         External or internal can be filtered by IsExternal Flag
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_BIL_ReferralSummary]     ----EXEC [SP_Report_BIL_ReferralSummary]   '2019-08-01','2019-10-01'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL,
	@IsExternal bit=null
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1.		Sud/Pratik/13Oct'19			     Initial Draft
----------------------------------------------------------
*/
BEGIN
  

SELECT
        ISNULL(ReferrerId, 0) 'ReferrerId',
        CASE WHEN ISNULL(ReferrerId, 0) != 0 THEN ReferredDoctorName ELSE 'No Doctor' END AS 'ReferrerName',
		--IsExtReferrer,
		ISNULL(emp.IsExternal,0) AS 'IsExtReferrer',
        SUM(ISNULL(SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
        SUM(ISNULL(ReturnTotalAmount, 0)) AS 'Refund',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnTotalAmount, 0)) AS 'NetTotal',

		 SUM(ISNULL(CreditAmount, 0)) AS 'CreditAmount',
		 SUM(ISNULL(CreditReceived, 0)) AS 'CreditReceivedAmount'

    FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate) itm
	LEFT JOIN EMP_Employee emp
	on itm.ReferrerId = emp.EmployeeId

	WHERE ISNULL(emp.IsExternal,0) = ISNULL(@IsExternal, ISNULL(emp.IsExternal,0))  --Take all records if InputParameter is null.

	GROUP BY 
		ReferrerId,
		ReferredDoctorName,
		ISNULL(emp.IsExternal,0)	
	ORDER BY 2


	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		--sud:7Feb'18--Added CreditReceivedAmount with below condition--
		SUM(CASE WHEN BillStatus='paid' AND PaymentMode='credit' AND PaidDate is not null and CreditDate is null THEN PaidAmount ELSE 0 END) 'CreditReceivedAmount',
		--sud:7Feb'18: Added CreditReturnAmount <Needs Revision>
		SUM(CASE WHEN BillStatus='return' AND PaymentMode='credit' AND PaidDate IS NULL THEN ReturnAmount ELSE 0 END) 'CreditReturnAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)
END
Go

----End: Pratik-16oct-For Referral summary reports--
----START: NageshBB: 17-Oct-2019: Accounting reverse txn table creation, core parameter value saved, and sp updated
Insert into CORE_CFG_Parameters
values('Accounting','ReverseTxnEnable','false','boolean','Enabling reverse transaction','custom');
Go


/****** Object:  Table [dbo].[ACC_ReverseTransaction]    Script Date: 12-09-2019 12:30:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ACC_ReverseTransaction](
	[ReverseTransactionId] [int] IDENTITY(1,1) NOT NULL,
	[TransactionDate] [datetime] NULL,
	[Section] [int] NULL,
	[TUId] [int] NULL,
	[Reason] [nvarchar](max) NULL,
	[JsonData] [nvarchar](max) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[FiscalYearId] [int] NULL,
 CONSTRAINT [PK_ACC_UndoTransaction] PRIMARY KEY CLUSTERED 
(
	[ReverseTransactionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  StoredProcedure [dbo].[SP_UpdateIsTransferToACC]    Script Date: 17-10-2019 11:07:14 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--[SP_UpdateIsTransferToACC] '1066,1067' , 'PHRMInvoice'
-- =============================================
-- Author:    Salakha Gawas/Nagesh Bulbule
-- Create date: 25 Feb 2019
-- Description:  Created Script to Update column IsTransferToACC
                --This work in two scenario 1-when transferred records into accounting, 2-Undo transaction (datewise) from accounting				
-- =============================================
ALTER PROCEDURE [dbo].[SP_UpdateIsTransferToACC] 
@ReferenceIds varchar(max),
@TransactionType nvarchar(50),
@IsReverseTransaction bit=0,
@TransactionDate varchar(30)=null
AS
BEGIN
  IF (@IsReverseTransaction = 0) -- when transferred record to accounting
  BEGIN

    ------------------update pharmacy transaction transferred records--------------------------------------

    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashGoodReceipt')
    BEGIN
      EXECUTE ('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditGoodReceipt')
    BEGIN
      EXECUTE ('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashInvoice1')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashInvoice2')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditInvoice1')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditInvoice2')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashInvoiceReturn1')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashInvoiceReturn2')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditInvoiceReturn1')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditInvoiceReturn2')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashReturnToSupplier')
    BEGIN
      EXECUTE ('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = 1 WHERE ReturnToSupplierId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditReturnToSupplier')
    BEGIN
      EXECUTE ('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = 1 WHERE ReturnToSupplierId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMWriteOff')
    BEGIN
      EXECUTE ('UPDATE PHRM_WriteOff SET IsTransferredToACC = 1 WHERE WriteOffId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMDispatchToDept')
    BEGIN
      EXECUTE ('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = 1 WHERE StockTxnItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMDispatchToDeptReturn')
    BEGIN
      EXECUTE ('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = 1 WHERE StockTxnItemId IN (' + @ReferenceIds + ')')
    END

    ------------------------updates inventory txn transaferred records--------------------------------

    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCashGoodReceipt1')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCashGoodReceipt2')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCreditGoodReceipt')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCreditPaidGoodReceipt')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCreditGoodReceiptFixedAsset')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCashGoodReceiptFixedAsset1')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCashGoodReceiptFixedAsset2')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVWriteOff')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_WriteOffItems SET IsTransferredToACC = 1 WHERE WriteOffId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVReturnToVendorCashGR')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVReturnToVendorCreditGR')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVDispatchToDept')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = 1 WHERE StockTxnId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVDispatchToDeptReturn')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = 1 WHERE StockTxnId IN (' + @ReferenceIds + ')')
    END


    --------------------------updates billing txn transferred records---------------

    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'BillingRecords')
    BEGIN
      EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = 1 WHERE BillingAccountingSyncId IN (' + @ReferenceIds + ')')
    END
  END
  ELSE  -- IF ReverseTransaction is true, update IsTransferredToACC is null, undo transaction done by super admin
  BEGIN

    ------------------update pharmacy transaction transferred records--------------------------------------

    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashGoodReceipt')
    BEGIN
      EXECUTE ('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = NULL	 WHERE GoodReceiptId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditGoodReceipt')
    BEGIN
      EXECUTE ('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = NULL WHERE GoodReceiptId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashInvoice1')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = NULL WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashInvoice2')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = NULL WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditInvoice1')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = NULL WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditInvoice2')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = NULL WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashInvoiceReturn1')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = NULL WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashInvoiceReturn2')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = NULL WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditInvoiceReturn1')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = NULL WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditInvoiceReturn2')
    BEGIN
      EXECUTE ('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = NULL WHERE InvoiceId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCashReturnToSupplier')
    BEGIN
      EXECUTE ('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = NULL WHERE ReturnToSupplierId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMCreditReturnToSupplier')
    BEGIN
      EXECUTE ('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = NULL WHERE ReturnToSupplierId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMWriteOff')
    BEGIN
      EXECUTE ('UPDATE PHRM_WriteOff SET IsTransferredToACC = NULL WHERE WriteOffId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMDispatchToDept')
    BEGIN
      EXECUTE ('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = NULL WHERE StockTxnItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'PHRMDispatchToDeptReturn')
    BEGIN
      EXECUTE ('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = NULL WHERE StockTxnItemId IN (' + @ReferenceIds + ')')
    END

    ------------------------updates inventory txn transaferred records--------------------------------
    
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCashGoodReceipt1')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = NULL WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCashGoodReceipt2')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = NULL WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCreditGoodReceipt')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = NULL WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCreditPaidGoodReceipt')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = NULL WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCreditGoodReceiptFixedAsset')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = NULL WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCashGoodReceiptFixedAsset1')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = NULL WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVCashGoodReceiptFixedAsset2')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = NULL WHERE GoodsReceiptItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVWriteOff')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_WriteOffItems SET IsTransferredToACC = NULL WHERE WriteOffId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVReturnToVendorCashGR')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = NULL WHERE ReturnToVendorItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVReturnToVendorCreditGR')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = NULL WHERE ReturnToVendorItemId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVDispatchToDept')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = NULL WHERE StockTxnId IN (' + @ReferenceIds + ')')
    END
    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'INVDispatchToDeptReturn')
    BEGIN
      EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = NULL WHERE StockTxnId IN (' + @ReferenceIds + ')')
    END


    --------------------------updates billing txn transferred records---------------

    IF (@ReferenceIds IS NOT NULL
      AND @TransactionType = 'BillingRecords' AND @TransactionDate is not null)
    BEGIN
      EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = NULL WHERE ReferenceId IN (' + @ReferenceIds + ') and  convert(date,TransactionDate) = convert(date,'+''''+ @TransactionDate +''''+')') 
    END
  END
END
Go
----END: NageshBB: 17-Oct-2019: Accounting reverse txn table creation, core parameter value saved, and sp updated

---Start: Pratik-17oct2019-
update CORE_CFG_Parameters 
 set ValueDataType='boolean'
where ParameterGroupName= 'Radiology' and ParameterName = 'EnableImageUpload'
Go

ALTER TABLE EMP_Employee
ALTER COLUMN ContactAddress varchar(200)
Go

---End: Pratik-17oct2019-

--Anish: Start-18 Oct 2018, Lab Report Verification Parameter Updated--
Update CORE_CFG_Parameters
set ParameterValue = '{"EnableVerificationStep": false,"VerificationLevel":2}'
where ParameterGroupName='LAB' and ParameterName='LabReportVerificationNeededB4Print';
--Anish: End-18 Oct 2018, Lab Report Verification Parameter Updated--


----KUSHAL: Start- 21 Oct 2018, Creation on DIspatch detail View----
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Dispatch_Details]    Script Date: 10/21/2019 10:24:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_Dispatch_Details] 
		@DispatchId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Kushal/18 Oct 2019				Created Script 
----------------------------------------------------------
*/
BEGIN
		If(@DispatchId > 0)
			BEGIN
			SELECT A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemName,ROUND((SUM(A.Amt)/SUM(A.Qty)),2) StandardRate,A.ITemId,A.Code,A.DepartmentName,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy FROM 
			(
				SELECT  emp.Salutation+'. '+emp.FirstName+' '+ emp.LastName as CreatedByName,
				dis.CreatedOn,
				req.CreatedOn RequisitionDate,
				itm.ItemName,
				itm.Code,
				dis.ItemId,
				dep.DepartmentName,
				dis.DispatchedQuantity,
				req.RequisitionId,
				dis.DispatchId,
				stk.AvailableQuantity Qty,
				gri.ItemRate*stk.AvailableQuantity Amt,
				dis.ReceivedBy
				from INV_TXN_DispatchItems dis 
				join INV_MST_Item itm on itm.ItemId = dis.ItemId
				join INV_TXN_RequisitionItems req on req.RequisitionItemId = dis.RequisitionItemId
				join MST_Department dep on dep.DepartmentId = dis.DepartmentId
				join EMP_Employee emp on emp.EmployeeId = dis.CreatedBy
				join INV_TXN_Stock stk on stk.ItemId = itm.ItemId
				join INV_TXN_GoodsReceiptItems gri on gri.GoodsReceiptItemId = stk.GoodsReceiptItemId
			where dis.DispatchId = @DispatchId 
			) A
			group by A.ItemName,A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemId,A.Code,A.DepartmentName,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy
			END
			END
			GO
----KUSHAL: END- 21 Oct 2018, Creation on DIspatch detail View----

---Start: Pratik-21oct2019-
ALTER TABLE  BIL_CFG_BillItemPrice
ADD AllowMultipleQty bit DEFAULT 1 not null;
GO
---End: Pratik-21oct2019-

--Anish: Start-18 Oct 2018, Lab Report Verification Parameter Updated--
 Update CORE_CFG_Parameters set ParameterValue='{"EnableVerificationStep": false,"VerificationLevel":1,
 "PreliminaryReportSignature": "Preliminary Report","ShowVerifierSignature": true,
 "PreliminaryReportText":"This is preliminary text"}'
  where ParameterName='LabReportVerificationNeededB4Print';
  Go
--Anish: End-18 Oct 2018, Lab Report Verification Parameter Updated--
--Start: Shankar-22oct2019--added a column named radiologyno in patientimagingreport---
Alter Table RAD_PatientImagingReport
Add RadiologyNo varchar(20)
GO
--End: Shankar-22oct2019--added a column named radiologyno in patientimagingreport---
--Start: Sanjit-23-Oct2019--added tables for Store and Dispensary Requisition---
CREATE TABLE [PHRM_StoreRequisition](
	[RequisitionId] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[RequisitionDate] [datetime] NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[RequisitionStatus] [varchar](20) NULL
)
GO

CREATE TABLE [dbo].[PHRM_StoreRequisitionItems](
	[RequisitionItemId] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[ItemId] [int] NULL,
	[Quantity] [int] NULL,
	[RequisitionId] [int] NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[AuthorizedOn] [datetime] NULL,
	[AuthorizedBy] [int] NULL,
	[ReceivedQuantity] [float] NULL,
	[PendingQuantity] [float] NULL,
	[AuthorizedRemark] [nvarchar](500) NULL,
	[RequisitionItemStatus] [varchar](20) NULL,
	[Remark] [text] NULL
)
GO
CREATE TABLE [dbo].[PHRM_StoreDispatchItems](
	[DispatchItemsId] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[RequisitionItemId] [int] NOT NULL,
	[DispatchedQuantity] [float] NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ReceivedBy] [varchar](100) NULL,
	[ItemId] [int] NULL,
	[DispatchId] [int] NULL
)
GO
--END: Sanjit-23-Oct2019--added tables for Store and Dispensary Requisition---

--START: Rusha/ 24 Oct,2019: Get permission for Phone Book Appointment Report and Created Script
GO
DECLARE @ApplicationID INT
SET @ApplicationID = (SELECT TOP(1) ApplicationId FROM [RBAC_Application] WHERE ApplicationName='Reports' and ApplicationCode='RPT');

INSERT INTO [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('reports-appointmentmain-phonebookappointmentreport-view',@ApplicationID,1,GETDATE(),1);
GO 

DECLARE @ApplicationID INT
SET @ApplicationID = (SELECT TOP(1) ApplicationId FROM [RBAC_Application] WHERE ApplicationName='Reports' and ApplicationCode='RPT');


DECLARE @permissionID INT
SET @permissionID=(SELECT TOP(1) PermissionId FROM [dbo].[RBAC_Permission] WHERE PermissionName='reports-appointmentmain-phonebookappointmentreport-view' and ApplicationId=@ApplicationID);

DECLARE @ParentRouteId INT
SET @ParentRouteId=(SELECT TOP(1) RouteId FROM [dbo].[RBAC_RouteConfig] WHERE UrlFullPath = 'Reports/AppointmentMain');
INSERT INTO [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
VALUES('PhoneBook Appointment Report','Reports/AppointmentMain/PhoneBookAppointmentReport','PhoneBookAppointmentReport',@permissionID,@ParentRouteId,1,1);
GO

--Script for Phone Book Appointment Report

GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_PhoneBookAppointmentReport] Script Date: 10/24/2019 11:26:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_Appointment_PhoneBookAppointmentReport] 
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@Doctor_Name varchar(max) = null,
	@AppointmentStatus varchar(max) = null
AS
/*
FileName: [SP_Report_Appointment_PhoneBookAppointmentReport]
CreatedBy/date: Rusha/10-24-2019
Description: To get details from phone book such as Patient Name , Appointment type, Appointment Status, 
				along with doctor name between the Given Dates
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------

--------------------------------------------------------
*/
BEGIN
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 AND (@Doctor_Name IS NOT NULL)
        OR (LEN(@Doctor_Name) > 0 AND (@AppointmentStatus IS NOT NULL)
        OR (LEN(@AppointmentStatus) > 0)))
		BEGIN
			SELECT CONVERT(datetime, CONVERT(date, apt.AppointmentDate)) + CONVERT(datetime, apt.AppointmentTime) as 'Date', 
				ISNULL(pat.PatientId,pvit.patientId) AS PatientId,pat.PatientCode,
				CONCAT_WS(' ',apt.FirstName,apt.MiddleName,apt.LastName) AS PatientName,
				pat.Age, pat.Address, apt.Gender, apt.ContactNumber, apt.ProviderName, apt.AppointmentStatus
			FROM PAT_Appointment AS apt
			LEFT JOIN PAT_PatientVisits AS pvit ON pvit.AppointmentId = apt.AppointmentId
			LEFT JOIN PAT_Patient AS pat ON pat.PatientId = pvit.PatientId

			WHERE CONVERT(date, apt.AppointmentDate) BETWEEN @FromDate AND @ToDate and 
				apt.ProviderName LIKE '%' + ISNULL(@Doctor_Name, '') + '%' and
				apt.AppointmentStatus LIKE '%' + ISNULL(@AppointmentStatus, '') + '%'
			ORDER BY CONVERT(datetime, CONVERT(date, apt.AppointmentDate)) + CONVERT(datetime, apt.AppointmentTime) DESC

		END
END
GO
--END: Rusha/ 24 Oct,2019: Get permission for Phone Book Appointment Report and Created Script 

--Pratik: Start 25 oct, 2019---
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
values('Common','DocOpdServiceDeptNames','{"OPD":"OPD", "FollowUp":"Doctor Followup Charges", "OldPatOpd":"Doctor OPD Old Patient"}','json','Give Service Depectment Names accordingly','system');
Go

update CORE_CFG_Parameters
set ValueDataType='boolean'
where 
 ( ParameterGroupName='Appointment' and ParameterName='OldPatientOpdPriceEnabled' )
OR (ParameterGroupName='Appointment' and ParameterName='EnablePaidFollowup')
OR ( ParameterGroupName='LAB' and ParameterName='LabSticker_PrintServerSide' and ValueDataType='string'
          and (ParameterValue='true' OR ParameterValue='false')
    )
Go

--Pratik: End 25 oct, 2019---


--Narayan: Start 31 oct, 2019---


/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Acceptance]    Script Date: 10/31/2019 12:43:27 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_Acceptance](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[SphOD] [varchar](10) NULL,
	[SphOS] [varchar](10) NULL,
	[CylOD] [varchar](10) NULL,
	[CylOS] [varchar](10) NULL,
	[AxisOD] [varchar](10) NULL,
	[AxisOS] [varchar](10) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK__CLN_Pres__CA1EE04C84E7679A] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Dilate]    Script Date: 10/31/2019 12:44:52 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_Dilate](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Tplus] [varchar](10) NULL,
	[OS] [varchar](10) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK__CLN_Pres__CA1EE04C506C63BF] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[CLN_PrescriptionSlip_History]    Script Date: 10/31/2019 12:45:17 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_History](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[History] [varchar](1000) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK__CLN_Pres__CA1EE04C6990A2C9] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[CLN_PrescriptionSlip_IOP]    Script Date: 10/31/2019 12:45:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_IOP](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[OD] [varchar](10) NULL,
	[OS] [varchar](10) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK__CLN_Pres__CA1EE04CE03B7A64] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO




/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Plup]    Script Date: 10/31/2019 12:45:57 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_Plup](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[SphOD] [varchar](10) NULL,
	[SphOS] [varchar](10) NULL,
	[CylOD] [varchar](10) NULL,
	[CylOS] [varchar](10) NULL,
	[AxisOD] [varchar](10) NULL,
	[AxisOS] [varchar](10) NULL,
	[VaOD] [varchar](10) NULL,
	[VaOS] [varchar](10) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK__CLN_Pres__CA1EE04CE8120FF0] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Retinoscopy]    Script Date: 10/31/2019 12:46:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_Retinoscopy](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[SphOS] [varchar](10) NULL,
	[SphOD] [varchar](10) NULL,
	[CylOD] [varchar](10) NULL,
	[CylOS] [varchar](10) NULL,
	[AxisOD] [varchar](10) NULL,
	[AxisOS] [varchar](10) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK__CLN_Pres__CA1EE04CD71EAD83] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO




/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Schrime]    Script Date: 10/31/2019 12:46:26 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_Schrime](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[OD] [varchar](10) NULL,
	[OS] [varchar](10) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK__CLN_Pres__CA1EE04CA79EB37E] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[CLN_PrescriptionSlip_TBUT]    Script Date: 10/31/2019 12:46:46 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_TBUT](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[OD] [varchar](10) NULL,
	[OS] [varchar](10) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK__CLN_Pres__CA1EE04C91FCE0A2] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[CLN_PrescriptionSlip_VaUnaided]    Script Date: 10/31/2019 12:47:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_VaUnaided](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[OD] [varchar](10) NULL,
	[OS] [varchar](10) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK__CLN_Pres__CA1EE04C998B6ADA] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[CLN_MST_PrescriptionSlip]    Script Date: 10/31/2019 12:47:48 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_MST_PrescriptionSlip](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[VisitId] [int] NULL,
	[PatientId] [int] NULL,
	[VisitDate] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[ModifiedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[ProviderId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


--Narayan: End 31 oct, 2019---

--Start: sud-3Nov'19---
ALTER TABLE bil_txn_billingtransaction
ALTER COLUMN ExchangeRate Float
GO
--End: sud-3Nov'19---

--Start: Anish 4 Nov, SpecimenList table--
Create Table LAB_MST_TestSpecimen(
	SpecimenId INT IDENTITY(1, 1)  Constraint PK_SpecimenId Primary Key NOT NULL,
	SpecimenName varchar(20) CONSTRAINT UniqueSpecimenName UNIQUE (SpecimenName)
)
Go
Insert Into LAB_MST_TestSpecimen(SpecimenName) Values ('Blood'),('Urine'),('Stool'),('Pus'),
('Sputum'),('Body Fluid'),('Semen'),('Tissue'),('Throat Swab'),('Vaginal Swab'),
('Biopsy'),('N/A');
Go
--End: Anish 4 Nov, SpecimenList table--


---start: sud:12Nov'19--For provisional billing---
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Billing','EnableNewItemAddInOpProvisional','false','boolean','Enable or Disable new item addition in provisional billing','custom');
Go
---end: sud:12Nov'19--For provisional billing---


---start:Pratik 14Nov'19-- for InsForeigner Price Category---
ALTER TABLE BIL_CFG_BillItemPrice
ADD InsForeignerPrice  float, IsInsForeignerPriceApplicable bit DEFAULT 0;
GO

CREATE TABLE BIL_CFG_PriceCategory(
	PriceCategoryId [int] IDENTITY(1,1) constraint PK_BIL_CFG_PriceCategory primary key NOT NULL,
	PriceCategoryName Varchar(100),
	DisplayName  Varchar(100),
	BillingColumnName Varchar(100),
	IsDefault BIT,
	CreatedOn DateTime,
	CreatedBy int,
	IsActive  BIT);
GO

INSERT INTO BIL_CFG_PriceCategory(PriceCategoryName,DisplayName,BillingColumnName,IsDefault,CreatedOn,CreatedBy,IsActive)
VALUES
 ('Normal', 'Normal', 'NormalPrice', 1,Getdate(), 1, 1),
 ('EHS', 'EHS (PayClinic)', 'EHSPrice', 0,Getdate(), 1, 0),
 ('SAARCCitizen', 'SAARCCitizen', 'SAARCCitizenPrice', 0,Getdate(), 1, 0),
 ('Foreigner', 'Foreigner', 'ForeignerPrice', 0,Getdate(), 1, 0),
 ('InsForeigner', 'Foreigner(Insurance)', 'InsForeignerPrice', 0,Getdate(), 1, 0),
 ('GovtInsurance', 'GovtInsurance', 'GovtInsurancePrice', 0,Getdate(), 1, 0);

 GO
---end:Pratik 14Nov'19-- for InsForeigner Price Category---
---start:Sanjit 14Nov'19--Add requisition in inv_txn_purchaseorder---
Alter table INV_TXN_PurchaseOrder
Add RequisitionId int;

 GO
---end:Sanjit 14Nov'19--Add requisition in inv_txn_purchaseorder---


---start: Sundeep 17Nov'19--for Community in membership scheme---


ALTER TABLE PAT_CFG_MembershipType
ADD CommunityName varchar(200) null;
GO
update PAT_CFG_MembershipType
set CommunityName='Hospital'
where CommunityName is null
GO

--if any error occurs below then check the Name of Unique constraint in  PAT_CFG_MembershipType then replace with the keyname in your Environment... 
IF( OBJECT_ID('UQ__PAT_CFG___840F6701F71E48C4') IS NOT NULL)
BEGIN
  ALTER TABLE PAT_CFG_MembershipType 
  DROP CONSTRAINT UQ__PAT_CFG___840F6701F71E48C4;    ---this constraint name could be different in different environment.. 
END
GO 
ALTER TABLE PAT_CFG_MembershipType
ADD CONSTRAINT UK_Membership_Community UNIQUE(MembershipTypeName, CommunityName);
GO  
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Billing','MembershipSchemeSettings','{"ShowCommunity":false,"IsMandatory":true}','json','settings for discount/membership scheme. default: community=false, mandatory=true','custom');
Go
---end: Sundeep 17Nov'19--for Community in membership scheme---

---start: Pratik:18Nov'19--Billing - for Automatic calculation of Prices based on Ratio--
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Billing','PriceCategoryRatioSettings','{"AutomaticRatioEnabled":false, "EHS":0, "SAARC":1.5, "Foreigner":2.5, "InsForeigner":4}','json','Automatic Price calculation based on Ratio for different Price Categories','custom');
Go

---end: Pratik:18Nov'19--Billing - for Automatic calculation of Prices based on Ratio--

--- Start: Narayan:19th Nov 2019 - ItemType is added on the grid ---
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId]    Script Date: 11/19/2019 15:09:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId] 
		@ItemId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Rusha/04 June 2019			    updated the script by adding vendor and company column
2       Shankar/16 Sept 2019            updated the script for IsCancel 
3		Kushal/30 Sept 2019				Updated Script for Item ID, total Value, Expiry Date, Sub Category 
4       Narayan/19 Nov 2019             Updated Script for ItemType.
---------------------------------------------------------------------
*/
BEGIN
		If(@ItemId > 0)
			BEGIN
				SELECT com.CompanyName,ven.VendorName,itm.Code,itm.ItemName,itmsub.SubCategoryName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						gdrp.ExpiryDate AS ExpiryDate,
						SUM(gdrp.FreeQuantity) AS BudgetedQuantity,
						SUM(gdrp.ItemRate) AS ItemRate,
						SUM( gdrp.ItemRate * stk.AvailableQuantity) AS TotalValue, itm.ItemType,
						
						gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId and grd.IsCancel = 0
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				JOIN INV_MST_ItemSubCategory as itmsub on itm.SubCategoryId = itmsub.SubCategoryId
				WHERE stk.ItemId = @ItemId
				GROUP BY com.CompanyName,ven.VendorName,itm.ItemName,itm.Code,stk.BatchNO,gdrp.CreatedOn,itmsub.SubCategoryName,gdrp.ExpiryDate,itm.ItemType
			END
        ELSE 
		    BEGIN
				SELECT com.CompanyName,ven.VendorName,itm.Code,itm.ItemName,itmsub.SubCategoryName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						gdrp.ExpiryDate AS ExpiryDate,
						SUM(gdrp.FreeQuantity) AS BudgetedQuantity,
						SUM(gdrp.ItemRate) AS ItemRate,
						SUM(gdrp.ItemRate * stk.AvailableQuantity ) AS TotalValue,itm.ItemType,
						gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId and grd.IsCancel = 0
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				JOIN INV_MST_ItemSubCategory as itmsub on itm.SubCategoryId = itmsub.SubCategoryId
				GROUP BY com.CompanyName,ven.VendorName,itm.ItemName,itm.Code,stk.BatchNO,gdrp.CreatedOn,itmsub.SubCategoryName,gdrp.ExpiryDate,itm.ItemType
			END 
END
GO
--- End : Narayan:19th Nov 2019 - ItemType is added on the grid ---

--start: sud-20Nov'19-- for invoice label in billing---
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType,Description,  ParameterType)
values('Billing','BillingInvoiceDisplayLabel','INVOICE','string','custom label/header to show in op-billrequest page and in invoice print page','system');
Go
--end: sud-20Nov'19-- for invoice label in billing---

--Start : Narayan:22nd Nov 2019 -  Bill Print parameter is added in CORE CFG 
INSERT INTO CORE_CFG_Parameters (ParameterGroupName, ParameterName, ParameterValue, ValueDataType, [Description], ParameterType)
VALUES ('Bill Print','Bill Print Parameter','{"pharmacy":"1","inventory":" 1","billing":"1"}','JSON','No of Receipt Print  can be altered from here','custom');
GO
--End : Narayan:22nd Nov 2019 -  Bill Print parameter is added in CORE CFG
--Start : Sanjit:24nd Nov 2019 -  Store Procedure Added for settlement in Pharmacy and Update Order by in Settlement in Billing.
GO
/****** Object:  StoredProcedure [dbo].[SP_TXNS_PHRM_SettlementSummary]    Script Date: 11/24/2019 1:28:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[SP_TXNS_PHRM_SettlementSummary] 
AS
/*
FileName: [SP_TXNS_PHRM_SettlementSummary]
CreatedBy/date: sanjit:24Nov2019
Description: to get CreditTotal, DepositBalance of patients
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
	   pat.Gender,pat.PhoneNumber,
     ISNULL( credit.CreditTotal,0) 'CreditTotal',
	 cast(
	      round( 
	           (ISNULL(dep.TotalDeposit,0)- ISNULL(dep.DepositDeduction,0) - ISNULL(dep.DepositReturn,0))
	         ,2) as numeric(16,2)) 'DepositBalance',
			 credit.CreatedOn 'CreditDate' ,dep.CreatedOn 'DepositDate'
from PAT_Patient pat
LEFT JOIN
(
  Select txn.PatientId, max(txn.CreateOn) CreatedOn,
  SUM(txn.TotalAmount) 'CreditTotal'  from PHRM_TXN_Invoice txn
  where txn.BilStatus ='unpaid' AND txn.PaymentMode = 'credit' AND ISNULL(txn.IsReturn,0) != 1
  Group by txn.PatientId
) credit on pat.PatientId = credit.PatientId
LEFT JOIN
( 
  Select dep.PatientId,max(dep.CreatedOn) CreatedOn,
    SUM(Case WHEN dep.DepositType='deposit' THEN ISNULL(dep.DepositAmount,0) ELSE 0  END ) AS 'TotalDeposit',
    SUM(Case WHEN dep.DepositType='depositdeduct' THEN ISNULL(dep.DepositAmount,0) ELSE 0  END ) AS 'DepositDeduction',
	SUM(Case WHEN dep.DepositType='depositreturn' THEN ISNULL(dep.DepositAmount,0) ELSE 0  END ) AS 'DepositReturn'
   FROM PHRM_Deposit dep
   Group by dep.PatientId
) dep
ON dep.PatientId = pat.PatientId

---show only those patients which has either amount > 0
where ISNULL(credit.CreditTotal,0) > 1 
	  OR ( dep.TotalDeposit-dep.DepositDeduction - dep.DepositReturn) > 1
--to get the latest first
	  order by
  CASE
      WHEN ISNULL(dep.CreatedOn,0) >= ISNULL(credit.CreatedOn,0)
          THEN  dep.CreatedOn
      ELSE  credit.CreatedOn 
  END
 DESC
END
GO
/****** Object:  StoredProcedure [dbo].[SP_TXNS_BILL_SettlementSummary]    Script Date: 11/24/2019 1:28:54 PM ******/
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
1.		Sanjit/11Nov19			--order by is added to get the latest settlement record first
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
	         ,2) as numeric(16,2)) 'DepositBalance',
			 ISNULL(ISNULL(credit.CreatedOn,dep.CreatedOn),prov.CreatedOn) 'LastTxnDate'
from PAT_Patient pat
LEFT JOIN
(
  Select txn.PatientId, max(txn.CreatedOn) 'CreatedOn',
  SUM(txn.TotalAmount) 'CreditTotal'  from BIL_TXN_BillingTransaction txn
  where txn.BillStatus ='unpaid' AND ISNULL(txn.ReturnStatus,0) != 1 AND ISNULL(txn.IsInsuranceBilling,0) != 1
  Group by txn.PatientId
) credit on pat.PatientId = credit.PatientId
LEFT JOIN
(
   Select txnItm.PatientId,max(txnItm.CreatedOn) 'CreatedOn', SUM(txnItm.TotalAmount) 'ProvisionalTotal'
	   from BIL_TXN_BillingTransactionItems txnItm
       where txnItm.BillStatus='provisional' AND ISNULL(txnItm.ReturnStatus,0) != 1
     Group By txnItm.PatientId
) prov
ON pat.PatientId = prov.PatientId
LEFT JOIN
( 
  Select dep.PatientId,max(dep.CreatedOn) 'CreatedOn',
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
	  order by
  CASE
      WHEN credit.CreatedOn >= prov.CreatedOn AND credit.CreatedOn >= dep.CreatedOn 
          THEN  credit.CreatedOn
      WHEN prov.CreatedOn >= dep.CreatedOn 
          THEN  prov.CreatedOn
      ELSE  dep.CreatedOn 
  END
 DESC
END

--End : Sanjit:24nd Nov 2019 -  

--Start : Sanjit:25th Nov 2019 -  Store Procedure Updated for Order by in Settlement in Billing.
GO
/****** Object:  StoredProcedure [dbo].[SP_TXNS_BILL_SettlementSummary]    Script Date: 11/25/2019 10:31:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_TXNS_BILL_SettlementSummary] 
AS

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
           ,2) as numeric(16,2)) 'DepositBalance', 
     --- comparing between DepositCreatedDate, provisionalCreatedDate and CreditInvoiceCreatedDate--
     --- 2010-01-01 is taken instead as default instead of null -- since our application doesn't have data before that.---
    Case WHEN ISNULL(Dep_CreatedOn,'2010-01-01') > ISNULL(Prov_CreatedOn,'2010-01-01') AND  ISNULL(Dep_CreatedOn,'2010-01-01') > ISNULL(Inv_CreatedOn,'2010-01-01') THEN Dep_CreatedOn
         WHEN ISNULL(Prov_CreatedOn,'2010-01-01') > ISNULL(Dep_CreatedOn,'2010-01-01')  AND ISNULL(Prov_CreatedOn,'2010-01-01')   >ISNULL(Inv_CreatedOn,'2010-01-01')  THEN Prov_CreatedOn
       ELSE Inv_CreatedOn END  
        AS   LastTxnDate
       --credit.CreatedOnDate
from PAT_Patient pat
LEFT JOIN
(
  Select txn.PatientId,

  (select top 1 CreatedOn from BIL_TXN_BillingTransaction 
     where BillStatus ='unpaid' 
     AND ISNULL(ReturnStatus,0) != 1 
   AND ISNULL(IsInsuranceBilling,0) != 1 
   AND (PatientId = txn.PatientId) order by CreatedOn desc) 
  
  as 'CreatedOnDate' ,
  SUM(txn.TotalAmount) 'CreditTotal',
  
    max(txn.CreatedOn) 'Inv_CreatedOn'  -- sud
  
  from BIL_TXN_BillingTransaction txn
  where txn.BillStatus ='unpaid' 
    AND ISNULL(txn.ReturnStatus,0) != 1 AND ISNULL(txn.IsInsuranceBilling,0) != 1
  Group by txn.PatientId
) credit on pat.PatientId = credit.PatientId 
LEFT JOIN
(
   Select txnItm.PatientId, SUM(txnItm.TotalAmount) 'ProvisionalTotal', 
     MAX(CreatedOn) 'Prov_CreatedOn'   -- sud
     from BIL_TXN_BillingTransactionItems txnItm
       where txnItm.BillStatus='provisional' AND ISNULL(txnItm.ReturnStatus,0) != 1 AND ISNULL(txnItm.IsInsurance,0) != 1 

     Group By txnItm.PatientId
) prov
ON pat.PatientId = prov.PatientId
LEFT JOIN
( 
  Select dep.PatientId,
    SUM(Case WHEN dep.DepositType='Deposit' THEN ISNULL(dep.Amount,0) ELSE 0  END ) AS 'TotalDeposit',
    SUM(Case WHEN dep.DepositType='depositdeduct' THEN ISNULL(dep.Amount,0) ELSE 0  END ) AS 'DepositDeduction',
    SUM(Case WHEN dep.DepositType='ReturnDeposit' THEN ISNULL(dep.Amount,0) ELSE 0  END ) AS 'DepositReturn',
  MAX(dep.CreatedOn) 'Dep_CreatedOn'   -- sud
   FROM BIL_TXN_Deposit dep
   Group by dep.PatientId
) dep
ON dep.PatientId = pat.PatientId

---show only those patients which has either amount > 0
where ISNULL(credit.CreditTotal,0) > 1 
      OR ISNULL(prov.ProvisionalTotal,0) > 1  
    OR ( dep.TotalDeposit-dep.DepositDeduction - dep.DepositReturn) > 1

Order by LastTxnDate DESC
END
GO
--END : Sanjit:25th Nov 2019 -  Store Procedure Updated for Order by in Settlement in Billing.

--START: Narayan: 29th Nov 2019 - Added Column in PAT_Patient table ---
ALTER TABLE [dbo].[PAT_Patient]
ADD  LandLineNumber varchar(20) ,PassportNumber varchar(20)
GO
--END: Narayan: 29th Nov 2019 - Added Column in PAT_Patient table ---

--Start : Sanjit:2nd Dec 2019  
--to add permission for the package sales list report

declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Reports' and ApplicationCode='RPT');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('reports-billingmain-packagesales-view',@ApplicationID,1,GETDATE(),1);
Go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='reports-billingmain-packagesales-view');

Declare @RefParentRouteID INT
SET @RefParentRouteID = (Select Top(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Reports/BillingMain');

Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive,Css)
Values('Package Sales','Reports/BillingMain/PackageSales','PackageSales',@permissionID,@RefParentRouteID,1,26,1,'fa fa-money fa-stack-1x text-white');
Go

--to add the SP for generating the sticker for package sales
/****** Object:  StoredProcedure [dbo].[SP_Package_GetPatientVisitStickerInfo]    Script Date: 12/2/2019 4:08:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Package_GetPatientVisitStickerInfo]  --- SP_Package_GetPatientVisitStickerInfo 120668
		
@BillingTransactionId INT=null
AS
/*
FileName: SP_Package_GetPatientVisitStickerInfo
CreatedBy/date: Sanjit / 2019-12-2
Description: to generate the sticker for package sales 

Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------
*/
BEGIN
select distinct
	visit.AppointmentType 'AppointmentType',
	visit.VisitType 'VisitType',
	visit.VisitCode 'VisitCode',
	visit.ProviderName 'ProviderName',
	CONVERT(VARCHAR(9), bilTxn.CreatedOn, 101) 'VisitDate',
	CONVERT(VARCHAR(9), bilTxn.CreatedOn, 108) 'VisitTime',
	CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) 'PatientName',
	pat.PatientCode 'PatientCode',
	pat.DateOfBirth 'DateOfBirth',
	pat.Gender 'Gender',
	pat.Address 'Address',
	pat.PhoneNumber 'PhoneNumber',
	subCounty.CountrySubDivisionName 'District',
	doc.FullName 'DoctorName',
	dep.DepartmentName 'Department',
	doc.RoomNo 'RoomNo',
	usr.UserName 'User',
	bilTxn.PackageName 'PackageName',
	bilTxn.CreatedOn 'BillingDate'
	 
	from BIL_TXN_BillingTransaction bilTxn join PAT_Patient pat on pat.PatientId=bilTxn.PatientId
						join MST_CountrySubDivision subCounty on subCounty.CountrySubDivisionId=pat.CountrySubDivisionId	
						join BIL_TXN_BillingTransactionItems bilTxnItms on  bilTxn.BillingTransactionId = bilTxnItms.BillingTransactionId
						left join PAT_PatientVisits visit on bilTxn.PatientVisitId = visit.PatientVisitId
						left join MST_Department dep on dep.DepartmentId= visit.DepartmentId
						left join RBAC_User usr on usr.EmployeeId=visit.CreatedBy
						left join EMP_Employee doc on doc.EmployeeId=bilTxnItms.RequestedBy		
						where bilTxn.BillingTransactionId=@BillingTransactionId 
	order by bilTxn.CreatedOn desc
END -- end of SP
GO
--to get the list of package sales
/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_PAT_PackageSalesDetail]    Script Date: 12/2/2019 4:11:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_BIL_PAT_PackageSalesDetail] 
	@FromDate datetime=null,
	@ToDate datetime=null		
AS
/*
FileName: [SP_Report_BIL_PAT_PackageSalesDetail] '2017-10-09','2019-11-29'	
CreatedBy/date: Sanjit 12-2-2019
Description: To get the Details of Package Sale from Billing
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT Distinct btx.BillingTransactionId AS BillingTransactionId, CONCAT(btx.InvoiceCode,btx.InvoiceNo) AS InvoiceNo, CONVERT(date,btx.CreatedOn) AS IssuedDate,btx.PatientId,btx.PatientVisitId, pat.PatientCode AS HospitalNo, 
			CONCAT_WS(' ',pat.FirstName, pat.MiddleName,pat.LastName) AS PatientName,
			pat.age+ '/' + substring(pat.Gender, 1, 1) as 'AgeSex',btx.PackageName,btx.TotalAmount As Price
			,ISNULL(emp.FullName,'SELF') AS RequestedBy
			FROM BIL_TXN_BillingTransaction AS btx
			Join BIL_TXN_BillingTransactionItems AS btxItm ON btx.BillingTransactionId = btxItm.BillingTransactionId
			JOIN PAT_Patient AS pat ON pat.PatientId = btx.PatientId
			Left JOIN EMP_Employee AS emp ON emp.EmployeeId = btxItm.RequestedBy
			WHERE btx.PackageId>0 and CONVERT(date, btx.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			ORDER By BillingTransactionId desc
		END	
END
GO

--END : Sanjit:2nd Dec 2019  
--Start: Shankar:2nd Dec 2019 Credit Note parameterised.---
INSERT INTO CORE_CFG_Parameters (ParameterGroupName, ParameterName, ParameterValue, ValueDataType, [Description], ParameterType)
VALUES ('Billing','EnableCreditNote',0,'boolean','To enable credit note instead of returned watermark in invoice','custom');
GO
--End: Shankar:2nd Dec 2019 Credit Note parameterised.---

--Start : Narayan: 3rd Dec 2019 : Date Filter was added, added age in table [PAT_Appointment] ---
GO
ALTER TABLE PAT_Appointment
ADD Age varchar(5), ModifiedBy int, ModifiedOn datetime
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_TotalAdmittedPatient]    Script Date: 12/02/2019 13:18:05 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_ADT_TotalAdmittedPatient]  ---[SP_Report_ADT_TotalAdmittedPatient] '10/02/2019','12/02/2019'
  @FromDate Date=null ,
  @ToDate Date=null  
AS

/*
FileName: [SP_Report_ADT_TotalAdmittedPatient]
CreatedBy/date: Sagar/2017-05-27
Description: to get the count of total discharged patient between Given Date
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       Sagar/2017-05-27                     created the script
2       Umed / 2017-06-08                      Modify the script i.e format and alias of table
                                               and Remove The time from AdmissionDate
                         and Group the Query by AdmissionDate
3.     Dinesh/2017-06-28                       all the information is requred to see the Admitted report and count at the last 
4      Umed/2018-04-23                        Apply Order by Desc Date and Added SR No also with Order By Date 
5.     Sud/24Sept'18                          Correction in Patientname, DoctorName, VisitId
6      Din /14th Jan'19             Ward and Bed details shown on list
7.     Vikas/24th Jan'19           Removed Date filter parameters and get some new data column of admitted patients.
8.     Sud:10Feb'19                          Revised where clause to include those patients which are not discharged but their bedInfo.EndedOn 
                                                is set to some value from Billing (edit bed charge). 
                         New logic is to get latest bed of that admitted patient using Row_Number() function.
9.     Naryan:2Dec'19                         Date Filter was added .
-------------------------------------------------------------------------------
*/
BEGIN

  BEGIN 
  Select * FROM
    (
      select 
       (Cast(ROW_NUMBER() OVER (ORDER BY  AdmissionDate desc)  AS int)) AS SN,
        -- this groups beds of one patients and adds rownumber to it, need to get latest bed (rowNum=1)-- (based on: latest bedInfo.StartedOn)
        ROW_NUMBER() OVER(PARTITION BY bedInfo.PatientId ORDER BY bedInfo.StartedOn DESC) AS RowNum,
         ---(Cast(ROW_NUMBER() OVER (ORDER BY  AdmissionDate desc)  AS int)) AS SN,
        AD.AdmissionDate,
        P.PatientCode,
        V.VisitCode,
        P.FirstName + ' ' + ISNULL(P.MiddleName + ' ', '') + P.LastName AS 'PatientName',
        P.Age as [Age/Sex],
        ISNULL(E.Salutation + '. ', '') + E.FirstName + ' ' + ISNULL(E.MiddleName + ' ', '') + E.LastName 'AdmittingDoctorName',
        bed.BedCode as 'BedCode',
        bedf.BedFeatureName as BedFeature
        from ADT_PatientAdmission AD
        join PAT_PatientVisits V on AD.PatientVisitId=V.PatientVisitId
        JOIN PAT_Patient P ON P.PatientId=V.PatientId 
        JOIN EMP_EMPLOYEE E ON AD.AdmittingDoctorId= E.EmployeeId 
        JOIN ADT_TXN_PatientBedInfo bedInfo ON AD.PatientId=bedInfo.PatientId 
            ---and EndedOn is null -- no need of this.
        JOIN ADT_Bed bed on bed.BedID=bedInfo.BedId
        JOIN ADT_MAP_BedFeaturesMap bedm on bed.BedID=bedm.BedId
        JOIN ADT_MST_BedFeature bedf on bedm.BedFeatureId=bedf.BedFeatureId
          
        where ad.AdmissionStatus='admitted'  and CONVERT(date,ad.AdmissionDate) between @FromDate and @ToDate
    ) A
    where A.RowNum=1 ---take only latest bed..
    ORDER by SN 
  END  
END
GO
--End : Narayan: 3rd Dec 2019 :Date Filter was added, added age in table [PAT_Appointment]--
--END: Shankar:2nd Dec 2019 Credit Note parameterised.---

--START : Sanjit:3rd Dec 2019  correction in package sales report
/****** Object:  StoredProcedure [dbo].[SP_Package_GetPatientVisitStickerInfo]    Script Date: 12/3/2019 2:55:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Package_GetPatientVisitStickerInfo]  --- SP_Package_GetPatientVisitStickerInfo 120668
		
@BillingTransactionId INT=null
AS
/*
FileName: SP_Package_GetPatientVisitStickerInfo
CreatedBy/date: Sanjit / 2019-12-2
Description: Get patient's package billing details. 

Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------
*/
BEGIN
select distinct
	visit.AppointmentType 'AppointmentType',
	visit.VisitType 'VisitType',
	visit.VisitCode 'VisitCode',
	visit.ProviderName 'ProviderName',
	CONVERT(VARCHAR(10), bilTxn.CreatedOn, 101) 'SaleDate',
	CONVERT(VARCHAR(9), bilTxn.CreatedOn, 108) 'SaleTime',
	CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) 'PatientName',
	pat.PatientCode 'PatientCode',
	pat.DateOfBirth 'DateOfBirth',
	pat.Gender 'Gender',
	pat.Address 'Address',
	pat.PhoneNumber 'PhoneNumber',
	subCounty.CountrySubDivisionName 'District',
	doc.FullName 'DoctorName',
	dep.DepartmentName 'Department',
	doc.RoomNo 'RoomNo',
	usr.UserName 'User',
	bilTxn.PackageName 'PackageName',
	bilTxn.CreatedOn 'BillingDate'
	 
	from BIL_TXN_BillingTransaction bilTxn join PAT_Patient pat on pat.PatientId=bilTxn.PatientId
						join MST_CountrySubDivision subCounty on subCounty.CountrySubDivisionId=pat.CountrySubDivisionId	
						join BIL_TXN_BillingTransactionItems bilTxnItms on  bilTxn.BillingTransactionId = bilTxnItms.BillingTransactionId
						join RBAC_User usr on usr.EmployeeId=bilTxn.CreatedBy
						left join PAT_PatientVisits visit on bilTxn.PatientVisitId = visit.PatientVisitId
						left join MST_Department dep on dep.DepartmentId= visit.DepartmentId
						left join EMP_Employee doc on doc.EmployeeId=bilTxnItms.RequestedBy		
						where bilTxn.BillingTransactionId=@BillingTransactionId 
	order by bilTxn.CreatedOn desc
END -- end of SP

--END : Sanjit:3rd Dec 2019  correction in package sales report



----Start--sud: 4Dec'19: Reverse Integration from Features/IncentiveModule to R2V1/Dev Branch---

-- Start: Ramavtar 10Nov, Initial create table queries --

/****** Object:  Table [dbo].[INCTV_BillItems_Profile_Map] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[INCTV_BillItems_Profile_Map](
	[BillItemProfileMapId] [int] IDENTITY(1,1) NOT NULL,
	[BillItemPriceId] [int] NULL,
	[ProfileId] [int] NULL,
	[AssignedToPercent] [float] NULL,
	[ReferredByPercent] [float] NULL,
	[PriceCategoryId] [int] NULL,
 CONSTRAINT [PK_INCTV_BillItems_Profile_Map] PRIMARY KEY CLUSTERED 
(
	[BillItemProfileMapId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[INCTV_EMP_Profile_Map] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[INCTV_EMP_Profile_Map](
	[EMPProfileMapId] [int] IDENTITY(1,1) NOT NULL,
	[EmployeeId] [int] NULL,
	[ProfileId] [int] NULL,
	[PriceCategoryId] [int] NULL,
 CONSTRAINT [PK_INCTV_EMP_Profile_Map] PRIMARY KEY CLUSTERED 
(
	[EMPProfileMapId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[INCTV_MST_Profile] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[INCTV_MST_Profile](
	[ProfileId] [int] IDENTITY(1,1) NOT NULL,
	[ProfileName] [varchar](150) NULL,
	[PriceCategoryId] [int] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_INCTV_MST_Profile] PRIMARY KEY CLUSTERED 
(
	[ProfileId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


ALTER TABLE [dbo].[INCTV_BillItems_Profile_Map]  WITH CHECK ADD  CONSTRAINT [FK_INCTV_BillItems_Profile_Map_BIL_CFG_BillItemPrice] FOREIGN KEY([BillItemPriceId])
REFERENCES [dbo].[BIL_CFG_BillItemPrice] ([BillItemPriceId])
GO
ALTER TABLE [dbo].[INCTV_BillItems_Profile_Map] CHECK CONSTRAINT [FK_INCTV_BillItems_Profile_Map_BIL_CFG_BillItemPrice]
GO
ALTER TABLE [dbo].[INCTV_BillItems_Profile_Map]  WITH CHECK ADD  CONSTRAINT [FK_INCTV_BillItems_Profile_Map_INCTV_MST_Profile] FOREIGN KEY([ProfileId])
REFERENCES [dbo].[INCTV_MST_Profile] ([ProfileId])
GO
ALTER TABLE [dbo].[INCTV_BillItems_Profile_Map] CHECK CONSTRAINT [FK_INCTV_BillItems_Profile_Map_INCTV_MST_Profile]
GO
ALTER TABLE [dbo].[INCTV_EMP_Profile_Map]  WITH CHECK ADD  CONSTRAINT [FK_INCTV_EMP_Profile_Map_EMP_Employee] FOREIGN KEY([EmployeeId])
REFERENCES [dbo].[EMP_Employee] ([EmployeeId])
GO
ALTER TABLE [dbo].[INCTV_EMP_Profile_Map] CHECK CONSTRAINT [FK_INCTV_EMP_Profile_Map_EMP_Employee]
GO
ALTER TABLE [dbo].[INCTV_EMP_Profile_Map]  WITH CHECK ADD  CONSTRAINT [FK_INCTV_EMP_Profile_Map_INCTV_MST_Profile] FOREIGN KEY([ProfileId])
REFERENCES [dbo].[INCTV_MST_Profile] ([ProfileId])
GO
ALTER TABLE [dbo].[INCTV_EMP_Profile_Map] CHECK CONSTRAINT [FK_INCTV_EMP_Profile_Map_INCTV_MST_Profile]
GO
--sud--remove profilecategory fk reference.
ALTER TABLE [dbo].[INCTV_MST_Profile]  WITH CHECK ADD  CONSTRAINT [FK_INCTV_MST_Profile_INCTV_MST_PriceCategory] FOREIGN KEY([PriceCategoryId])
REFERENCES [dbo].[BIL_CFG_PriceCategory] ([PriceCategoryId])
GO
ALTER TABLE [dbo].[INCTV_MST_Profile] CHECK CONSTRAINT [FK_INCTV_MST_Profile_INCTV_MST_PriceCategory]
GO

-- End: Ramavtar 10Nov, Initial create table queries --

----start: SUD-18Nov-- to remove earlier insert--- (Pls don't change the sequence)
DELETE from RBAC_RouteConfig
WHERE UrlFullPath like 'Incentive%'
GO
DELETE from RBAC_Permission
where PermissionName like 'incentive-%'
GO
DELETE from RBAC_Application
where ApplicationName='Incentive'
GO
----end: SUD-18Nov-- to remove earlier insert--- (Pls don't change the sequence)

-- Start: Ramavtar 18Nov, Incentive Modules Routes added --
DECLARE @AppId int, @permId int, @pRouteId int, @displaySeq int

INSERT INTO RBAC_Application(ApplicationCode,ApplicationName,IsActive,CreatedBy,CreatedOn)--
VALUES
('INCTV', 'Incentive', 1, 1, GETDATE())

SELECT @AppId = ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'INCTV'

INSERT INTO RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
VALUES 
('incentive-view', @AppId, 1, GETDATE(), 1),
('incentive-setting-view', @AppId, 1, GETDATE(), 1),
('incentive-setting-profilemaster-view', @AppId, 1, GETDATE(), 1),
('incentive-setting-employeeprofilemap-view', @AppId, 1, GETDATE(), 1)

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-view'
SELECT @displaySeq = MAX(DisplaySeq) + 1 from RBAC_RouteConfig

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Incentive', 'Incentive', 'Incentive', @permId, NULL, 1, @displaySeq, 1)

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-setting-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Setting', 'Incentive/Setting', 'Setting', @permId, @pRouteId, 1, NULL, 1)

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-setting-profilemaster-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Setting'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Profile Manage', 'Incentive/Setting/ProfileManage', 'ProfileManage', @permId, @pRouteId, 1, NULL, 1)

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-setting-employeeprofilemap-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Setting'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Employee Profile Map', 'Incentive/Setting/EmployeeProfileMap', 'EmployeeProfileMap', @permId, @pRouteId, 1, NULL, 1)
GO
-- End: Ramavtar 18Nov, Incentive Modules Routes added --


----Start: Sud: 21Nov'19--For Incentive and Fraction SP Correction --

ALTER PROCEDURE [dbo].[SP_FRC_GetFractionApplicableList]
AS
/*
 Altered by Sud on 20Nov'19 for Transaction Date
*/
BEGIN
select 
  per.PercentSettingId,txnItm.BillingTransactionItemId as BillTransactionItemId,
  txnItm.CreatedOn 'TransactionDate',
  itmPrice.ItemName, 
  itmPrice.BillItemPriceId, txnItm.TotalAmount, txnItm.BillingType, (pat.FirstName + ' ' + pat.LastName) as FullName,
  txnItm.ServiceDepartmentName,  c.BillTxnItemId 
  from BIL_TXN_BillingTransactionItems txnItm
  join BIL_CFG_BillItemPrice itmPrice on txnItm.ItemId = itmPrice.ItemId 
    join PAT_Patient pat on txnItm.PatientId = pat.PatientId
  left join FRC_FractionCalculation c on txnItm.BillingTransactionItemId = c.BillTxnItemId
  left join FRC_PercentSetting per on per.BillItemPriceId = itmPrice.BillItemPriceId
where txnItm.ServiceDepartmentId = itmPrice.ServiceDepartmentId 
    and itmPrice.isFractionApplicable = 1 
	and per.PercentSettingId IS NOT NULL

group by txnItm.BillingTransactionItemId,txnItm.CreatedOn, itmPrice.ItemId, 
  c.BillTxnItemId, itmPrice.ItemId ,  itmPrice.BillItemPriceId, per.PercentSettingId,
  c.BillTxnItemId, itmPrice.ItemName ,
  txnItm.ServiceDepartmentName, txnItm.TotalAmount ,
  txnItm.BillingType, FirstName, LastName
order by txnItm.BillingTransactionItemId DESC
END
GO
 
---for incentive images---
update RBAC_RouteConfig
set css='incentive.png'  -- this is already added in themes/images/nav of wwwroot.
WHERE UrlFullPath='Incentive' 
GO
----End: Sud: 21Nov'19--For Incentive and Fraction SP Correction --

---start: sud: 22Nov'19--incentive fraction items--

/****** Object:  Table [dbo].[INCTV_TXN_IncentiveFractionItem]    Script Date: 11/22/2019 9:07:52 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[INCTV_TXN_IncentiveFractionItem](
	[InctvTxnItemId] [int] IDENTITY(1,1) NOT NULL,
	[InvoiceNoFormatted] [varchar](30) NOT NULL,
	[TransactionDate] [datetime] NULL,
	[PriceCategory] [varchar](20) NULL,
	[BillingTransactionId] [int] NULL,
	[BillingTransactionItemId] [int] NULL,
	[PatientId] [int] NULL,
	[BillItemPriceId] [int] NULL,
	[ItemName] [varchar](400) NULL,
	[TotalBillAmount] [float] NULL,
	[IncentiveType] [varchar](20) NULL,
	[IncentiveReceiverId] [int] NULL,
	[IncentiveReceiverName] [varchar](200) NULL,
	[IncentivePercent] [float] NULL,
	[IncentiveAmount] [float] NULL,
	[IsPaymentProcessed] [bit] NULL,
	[PaymentInfoId] [int] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_INCTV_TXN_IncentiveFractionItems] PRIMARY KEY CLUSTERED 
(
	[InctvTxnItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


---needed indexing in various tables for faster searching --
create NonClustered index IX_BIL_BillingTransaction_CreatedOn 
on BIL_TXN_BillingTransaction (CreatedOn ASC)
GO
create NonClustered index IX_INCTV_TXN_IncentiveFractionItem_BillingTransactionItemId 
on INCTV_TXN_IncentiveFractionItem (BillingTransactionItemId ASC)
GO
create NonClustered index IX_INCTV_TXN_IncentiveFractionItem_IncentiveReceiverId
on INCTV_TXN_IncentiveFractionItem (IncentiveReceiverId ASC)
GO


/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_DoctorSummary]    Script Date: 11/22/2019 9:11:32 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Pratik/20Nov'19
-- Description:	To get Incentive reports at doctor level 
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_INCTV_DoctorSummary] --EXEC SP_Report_INCTV_DoctorSummary '2019-07-20','2019-11-22'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
BEGIN
Select 
ReferrerId, ReferrerName, Sum(TotalBillAmount) 'HospitalAmount',
SUM(ReferralAmount) 'ReferralAmount', SUM(AssignedToAmount) 'AssignedAmount',SUM(AssignedToAmount+ReferralAmount) 'DocTotalamount'
from
(
			SELECT 
			CASE WHEN incItm.IncentiveType='referral' THEN 'Referral' 
			      WHEN incItm.IncentiveType='assigned' THEN 'AssignedTo'
			      ELSE 'Hospital' END as IncomeType,
			incItm.IncentiveReceiverId 'ReferrerId', 
			incItm.IncentiveReceiverName 'ReferrerName',
			incItm.IncentiveReceiverId  RequestedBy,
			incItm.TotalBillAmount,
			CASE WHEN incItm.IncentiveType='assigned' THEN incItm.IncentiveAmount
			      ELSE 0 END as AssignedToAmount,
			CASE WHEN incItm.IncentiveType='referral' THEN incItm.IncentiveAmount
			      ELSE 0 END as ReferralAmount,
			incItm.BillingTransactionItemId,
			incItm.TransactionDate 'CreatedOn'
			FROM 
			   INCTV_TXN_IncentiveFractionItem incItm

			WHERE 
			    Convert(Date,incItm.TransactionDate) Between @FromDate AND @ToDate
				and IncentiveType !='hospital'

) A


group by ReferrerId, ReferrerName
END
GO


SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Pratik/20Nov'19
-- Description:	To get Incentive reports at items level for input doctor. 
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_INCTV_ReferralItemsSummary]  --EXEC SP_Report_INCTV_ReferralItemsSummary '2019-07-01','2019-10-01',2
	@FromDate date = NULL,
    @ToDate date = NULL,
    @EmployeeId int = NULL
AS
BEGIN
	Select incItm.IncentiveReceiverName, incItm.TransactionDate, incItm.InvoiceNoFormatted, incItm.IncentiveType 'IncomeType', 
	       incItm.PatientId, pat.FirstName+' '+pat.LastName 'PatientName', pat.PatientCode 'HospitalNum', 
		   incItm.ItemName, incItm.TotalBillAmount 'TotalAmount', incItm.IncentivePercent, incItm.IncentiveAmount
		   
	from INCTV_TXN_IncentiveFractionItem incItm
	     INNER JOIN PAT_Patient pat
		 ON incItm.PatientId=pat.PatientId
	WHERE 
	    IncentiveReceiverId = @EmployeeId
	    AND Convert(Date,incItm.TransactionDate) Between @FromDate AND @ToDate
END
GO

---end: sud: 22Nov'19--incentive fraction items--


---Start: Pratik: 28Nov'19--
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Incentive','TDSConfiguration','{"TDSEnabled":true,"TDSPercent":15}','JSON','TDS Percentage to calculated on the Overall Income of individual doctor','custom');
Go
---end: Pratik: 28Nov'19--


--- Start: Ramavtar: 30Nov'19 Added 'IsMainDoctor' column to 'INCTV_TXN_IncentiveFractionItem' table ---
IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'INCTV_TXN_IncentiveFractionItem' AND COLUMN_NAME = 'IsMainDoctor')
BEGIN
    ALTER TABLE INCTV_TXN_IncentiveFractionItem 
	ADD IsMainDoctor bit
END
GO
--- End: Ramavtar: 30Nov'19 Added 'IsMainDoctor' column to 'INCTV_TXN_IncentiveFractionItem' table ---


---start: 4Dec'19--Pratik for incentive--

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_INCTV_ViewTransactionItems] --SP_INCTV_ViewTransactionItems '2019-11-20','2019-12-02',0
( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL,
  @EmployeeId INT=NULL)
AS
/*
 File: SP_INCTV_ViewTransactionItems
 Description: To get AssignedTo and Referral for each Transaction Item level to show and edit in frontend.
 Conditions/Checks: 
         * If EmployeeId is passed, then we'll show Both Assigned and Referred Items of that Employee.
         * If EmployeeId is Null then we'll return data of all employee in that range
		 * External Referral are also handled since we're taking from Employee Table.

 Remarks: Needs Revision.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By       Remarks
 --------------------------------------------------
 1.      21Nov'19/Sud          Initial Draft (Needs Revision)
 2.      04Dec'19/Pratik       Added FiscalYear Formatted to show in FrontEnd
 ---------------------------------------------------
*/
BEGIN

; WITH ItemsTxnInfo AS (
    Select cfgItm.BillItemPriceId, bilTxn.BillingTransactionId, txnItm.BillingTransactionItemId, bilTxn.CreatedOn, 
	--bilTxn.InvoiceNo, 
	fyear.FiscalYearFormatted +'-'+ bilTxn.InvoiceCode + cast(bilTxn.InvoiceNo as varchar(20)) AS 'InvoiceNo',
	biltxn.FiscalYearId,
	   txnItm.ItemId, txnItm.ItemName,txnItm.ServiceDepartmentId,txnItm.TotalAmount, txnItm.PriceCategory,
	   txnItm.RequestedBy,txnItm.ProviderId,txnItm.PatientId, pat.FirstName+' '+pat.LastName 'PatientName', pat.PatientCode
		from 
		   (Select * from BIL_TXN_BillingTransaction 
		   where Convert(Date,CreatedOn) Between @FromDate AND @ToDate
		     and ISNULL(ReturnStatus,0) = 0   -- to exclude returned
		   )  bilTxn
		 INNER JOIN 
		 (
		   Select * from  BIL_TXN_BillingTransactionItems 
		   --Don't show the transaction items whose incentive is already calculated and stored in fractionitems table--
		   WHERE BillingTransactionItemId NOT IN (Select BillingTransactionItemId from INCTV_TXN_IncentiveFractionItem)
		 )txnItm
		    ON bilTxn.BillingTransactionId = txnItm.BillingTransactionId

		 INNER JOIN BIL_CFG_FiscalYears fyear
		   ON  bilTxn.FiscalYearId = fyear.FiscalYearId

		  INNER JOIN BIL_CFG_BillItemPrice cfgItm
			 ON txnItm.ServiceDepartmentId=cfgItm.ServiceDepartmentId
				AND txnItm.ItemId=cfgItm.ItemId
		  INNER JOIN PAT_Patient pat
			ON pat.PatientId = txnItm.PatientId
		WHERE cfgItm.isFractionApplicable=1
		  -- and ISNULL(bilTxn.ReturnStatus,0) = 0   -- to exclude returned
		 --AND Convert(Date,txnItm.CreatedOn) Between @FromDate AND @ToDate   
 )
 

 SELECT txn.CreatedOn 'TransactionDate',txn.FiscalYearId, txn.InvoiceNo, txn.PriceCategory,   txn.BillingTransactionItemId, 
 txn.BillingTransactionId, txn.BillItemPriceId,
   txn.PatientId, txn.PatientName, txn.PatientCode,
   txn.ItemName, txn.TotalAmount, 
   refItems.EmployeeId 'ReferredByEmpId', refItems.FullName 'ReferredByEmpName', 
   refItems.ReferredByPercent, ISNULL(txn.TotalAmount,0)*refItems.ReferredByPercent/100 'ReferralAmount',

    assignedToItms.EmployeeId 'AssignedToEmpId', assignedToItms.FullName 'AssignedToEmpName' ,
	assignedToItms.AssignedToPercent, ISNULL(txn.TotalAmount,0)*assignedToItms.AssignedToPercent/100 'AssignedToAmount'


 FROM 
    ItemsTxnInfo txn
	LEFT JOIN
	  ( 
		Select 
		 profItm.BillItemPriceId, price.ServiceDepartmentId, price.ItemId, price.ItemName,
		  priceCat.PriceCategoryId, priceCat.PriceCategoryName,
		 prof.ProfileName, prof.ProfileId,
		 emp.EmployeeId,
		 emp.FullName,
		 profItm.AssignedToPercent,
		 profItm.ReferredByPercent

		 from INCTV_MST_Profile  prof
		   INNER JOIN BIL_CFG_PriceCategory priceCat
			 ON prof.PriceCategoryId=priceCat.PriceCategoryId 
		   INNER JOIN INCTV_BillItems_Profile_Map profItm
			  ON prof.ProfileId= profItm.ProfileId
		   INNER JOIN INCTV_EMP_Profile_Map empProf
			  ON prof.ProfileId=empProf.ProfileId
		   INNER JOIN EMP_Employee emp
			 ON empProf.EmployeeId=emp.EmployeeId  
		   INNER JOIN BIL_CFG_BillItemPrice  price
			  ON profItm.BillItemPriceId = price.BillItemPriceId
         
		  --WHERE ISNULL(@EmployeeId,ISNULL(emp.EmployeeId,0)) =  ISNULL(emp.EmployeeId,0)

		 ) refItems
   ON txn.BillItemPriceId=refItems.BillItemPriceId
      AND txn.RequestedBy= refItems.EmployeeId
	  AND txn.PriceCategory = refItems.PriceCategoryName
		
   	LEFT JOIN
	  	( 
         
		Select 
		 profItm.BillItemPriceId, price.ServiceDepartmentId, price.ItemId, price.ItemName,
		  priceCat.PriceCategoryId, priceCat.PriceCategoryName,
		 prof.ProfileName, prof.ProfileId,
		 emp.EmployeeId,
		 emp.FullName,
		 profItm.AssignedToPercent,
		 profItm.ReferredByPercent

		 from INCTV_MST_Profile  prof
		   INNER JOIN BIL_CFG_PriceCategory priceCat
			 ON prof.PriceCategoryId=priceCat.PriceCategoryId 
		   INNER JOIN INCTV_BillItems_Profile_Map profItm
			  ON prof.ProfileId= profItm.ProfileId
		   INNER JOIN INCTV_EMP_Profile_Map empProf
			  ON prof.ProfileId=empProf.ProfileId
		   INNER JOIN EMP_Employee emp
			 ON empProf.EmployeeId=emp.EmployeeId  
		   INNER JOIN BIL_CFG_BillItemPrice  price
			  ON profItm.BillItemPriceId = price.BillItemPriceId

           --WHERE ISNULL(@EmployeeId,ISNULL(emp.EmployeeId,0)) =  ISNULL(emp.EmployeeId,0)
         
		 ) assignedToItms
   ON txn.BillItemPriceId=assignedToItms.BillItemPriceId
      AND txn.ProviderId = assignedToItms.EmployeeId	
	  AND txn.PriceCategory = assignedToItms.PriceCategoryName
  --WHERE txn.ItemName like '%usg%'
  --WHERE ISNULL(@EmployeeId,0) =  ISNULL(refItems.EmployeeId,0)

   WHERE (ISNULL(refItems.EmployeeId,0) = ISNULL(@EmployeeId, ISNULL(refItems.EmployeeId,0))  OR  ISNULL(assignedToItms.EmployeeId,0) = ISNULL(@EmployeeId, ISNULL(assignedToItms.EmployeeId,0)))

   ORDER BY txn.BillingTransactionItemId

END
GO



DECLARE @AppId int,@permId int, @pRouteId int

SELECT @AppId = ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'INCTV'

INSERT INTO RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
VALUES 
('incentive-transactions-view', @AppId, 1, GETDATE(), 1),
('incentive-reports-view', @AppId, 1, GETDATE(), 1)

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-transactions-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Transactions', 'Incentive/Transactions', 'Transactions', @permId, @pRouteId, 1, NULL, 1)

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-reports-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Reports', 'Incentive/Reports', 'Reports', @permId, @pRouteId, 1, NULL, 1)
GO

Update RBAC_RouteConfig
SET DisplaySeq=1
WHERE UrlFullPath='Incentive/Transactions'
GO
Update RBAC_RouteConfig
SET DisplaySeq=2 WHERE UrlFullPath='Incentive/Reports'
GO
Update RBAC_RouteConfig
SET DisplaySeq=3 WHERE UrlFullPath='Incentive/Setting'
GO


---end: 4Dec'19--Pratik for incentive --

----End--sud: 4Dec'19: Reverse Integration from Features/IncentiveModule to R2V1/Dev Branch---

----Start--Anish: 4Dec'19: Reverse Integration from Features/MedicalRecord Branch to R2V1/Dev Branch---

---Anish: Increamentals for Medical Records Module Starts, Nov: 10 2019--
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert into RBAC_Application(ApplicationCode,ApplicationName,IsActive,CreatedBy,CreatedOn) Values ('MR','MedicalRecords','1',@empId,GETDATE());
 GO

declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) Values ('medical-records-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='medical-records-view');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,Css,DefaultShow,DisplaySeq,IsActive) 
Values ('Medical Records','Medical-records','Medical-records',@permissionId,'medical-records.png','1','12','1');
Go


declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('medical-records-inpatientlist-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='medical-records-inpatientlist-view');

declare @parentRouteId int =(select top(1) RouteId from RBAC_RouteConfig where RouterLink='Medical-records');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,ParentRouteId,PermissionId,DefaultShow,DisplaySeq,IsActive) 
Values ('MR Inpatient List','Medical-records/InpatientList','InpatientList',@parentRouteId,@permissionId,'1','2','1');
Go
---Anish: Increamentals for Medical Records Module Ends- Nov: 10 2019--

--ANish: Start: 18 Nov--
Insert Into CORE_CFG_Parameters values('Common','PatientProfileImageLocationPath','D:\Images','string','contains location path for saving patient images files','custom');
Go
Alter table PAT_PatientFiles
add ImageFullPath varchar(500);
GO
--Anish: End 18 Nov 2019--

--ANish: Start: 19 Nov--
declare @count int;
set @count = (select COUNT (*) from ADT_DischargeType where DischargeTypeName='Absconded');

IF(@count > 1)
BEGIN
 declare @id int;
 set @id = (select TOP(1) DischargeTypeId from ADT_DischargeType where DischargeTypeName='Absconded');
 delete from ADT_DischargeType where DischargeTypeId=@id;
END
Go

Update ADT_DischargeType
set IsActive=0
Go

Update ADT_DischargeType
set IsActive=1 where DischargeTypeName='Recovered' or DischargeTypeName='Not Improved' 
or DischargeTypeName='LAMA' or DischargeTypeName='Absconded' or DischargeTypeName='Death' or DischargeTypeName='Referred';
Go

Declare @deathId int;
set @deathId = (select DischargeTypeId from ADT_DischargeType where DischargeTypeName='Death');

Insert Into ADT_MST_DischargeConditionType Values (@deathId,'Post Operative Death'),(@deathId,'Maternal Death'),
(@deathId,'Early Neonatal Death'),(@deathId,'Late Neonatal Death'),(@deathId,'Other Death');
Go

delete from ADT_MST_DeathType;
Go

Alter table ADT_MST_DeathType
add DischargeTypeId int;
Go

Declare @deathId int;
set @deathId = (select DischargeTypeId from ADT_DischargeType where DischargeTypeName='Death');

Insert Into ADT_MST_DeathType
values('<48',@deathId), ('>48',@deathId);
Go

ALTER TABLE [dbo].[ADT_MST_DischargeConditionType]  
WITH CHECK ADD  CONSTRAINT [FK_ADT_DischargeConditionType_DischargeType] FOREIGN KEY([DischargeTypeId])
REFERENCES [dbo].[ADT_DischargeType] ([DischargeTypeId])
GO

ALTER TABLE ADT_MST_DeathType
WITH CHECK ADD CONSTRAINT [FK_ADT_DeathType_DischargeType] FOREIGN KEY ([DischargeTypeId])
REFERENCES ADT_DischargeType ([DischargeTypeId]);
Go

ALTER TABLE ADT_MST_DeliveryType
WITH CHECK ADD CONSTRAINT [FK_DeliveryType_DischargeConditionType] FOREIGN KEY (DischargeConditionId)
REFERENCES ADT_MST_DischargeConditionType (DischargeConditionId);
Go

Create Table MR_MST_OperationType(
	OperationId INT IDENTITY(1, 1)  Constraint PK_OperationId Primary Key NOT NULL,
	OperationName varchar(50) CONSTRAINT UniqueOperationName UNIQUE (OperationName)
)
Go

Alter table ADT_BabyBirthDetails
Add PatientVisitId int,PatientId int,MedicalRecordsId int null;
Go
Alter table ADT_BabyBirthDetails
Alter Column CertificateNumber nvarchar(50) not null;
Go
Alter table ADT_BabyBirthDetails
Add CONSTRAINT UC_UniqueCertificateNumber UNIQUE (CertificateNumber);
Go

Create Table ADT_MST_Gravita(
GravitaId INT IDENTITY(1,1) Constraint PK_GravitaId Primary Key NOT NULL,
GravitaName varchar(30)
);
Go

Insert Into ADT_MST_Gravita Values ('Primi'),('Multi'),('GrandMulti');
Go

Create Table MR_RecordSummary(
	MedicalRecordId INT Identity(1,1) Constraint PK_MR_RecordSummaryID PRIMARY KEY NOT NULL,
	PatientVisitId INT NOT NULL,
	PatientId INT NOT NULL,
	FileNumber varchar(20) NOT NULL,
	DischargeTypeId INT NOT NULL,
	DischargeConditionId INT NULL,
	DeliveryTypeId INT NULL,
	BabyBirthConditionId INT NULL,
	DeathPeriodTypeId INT NULL,
	OperationTypeId INT NULL,
	OperatedByDoctor INT NULL,
	GravitaId INT NULL,
	GestationalWeek INT NULL,
	OperationDiagnosis nvarchar(max),
	Remarks nvarchar(300),
	LabTests nvarchar(max),
	ICDCode nvarchar(max),
	OperationDate DATETIME NULL,
	IsOperationConducted bit NULL,
	CreatedBy INT NULL,
	ModifiedBy INT NULL,
	CreatedOn DATETIME NULL,
	ModifiedOn DATETIME NULL,
);
Go

Alter table MR_RecordSummary
Add CONSTRAINT UC_UniqueFileNumber UNIQUE (FileNumber);
Go

Create Table ADT_DeathDeatils(
DeathId INT IDENTITY(1,1) Constraint PK_DeathId PRIMARY KEY NOT NULL,
DeathDate DateTime NOT NULL,
DeathTime Time NOT NULL,
CertificateNumber varchar(30),
PatientId INT NOT NULL,
PatientVisitId INT NOT NULL,
MedicalRecordId INT NULL,
CreatedBy INT NULL,
ModifiedBy INT NULL,
CreatedOn DATETIME NULL,
ModifiedOn DATETIME NULL
);
Go

Alter table ADT_DeathDeatils
add IsActive bit;
Go

Alter table [dbo].[ADT_BabyBirthDetails]
alter column DischargeSummaryId int null;
Go

Alter table ADT_BabyBirthDetails
Add BirthType varchar(70), BirthNumberType varchar(30),IssuedBy int null,CertifiedBy int null, FiscalYear varchar(20) not null, 
PrintedBy int null, PrintCount int, PrintedOn DateTime null,CreatedBy INT NULL,
ModifiedBy INT NULL,
CreatedOn DATETIME NULL,
ModifiedOn DATETIME NULL,IsActive bit;
Go
--ANish: End: 19 Nov--

----End--Anish: 4Dec'19: Reverse Integration from Features/MedicalRecord Branch to R2V1/Dev Branch---

--Start: Naveed:  13 dec, 2019 Pharmacy report Bug fixes---
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_ExpiryReport]    Script Date: 12-12-2019 05:04:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-------------------------------------------------------------------------------------

ALTER PROCEDURE [dbo].[SP_PHRMReport_ExpiryReport]  
		  @ItemName varchar(200) = null
AS
/*
FileName: [SP_PHRMReport_ExpiryReport]
CreatedBy/date: Abhishek/2018-05-06
Description: To get the Expired Products Details Such As ItemName, ItemCode, AvailableQty,ExpiryDate,BatchNo of Each Item Selected By User Datewise
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/04-03-2019						Updated INOUT Quantity
2.		Vikas/07-06-2019						update table name, get data from PHRM_DispensaryStock table	
3.		Naveed/13-12-2019						Convert Expiry Date to varchar for showing well format date while Export
----------------------------------------------------------------------------
*/
Begin 
IF (@ItemName IS NOT NULL)
	BEGIN
	Select (Cast(ROW_NUMBER() OVER (ORDER BY  x.ItemName)  as int)) as SN, 
	x.ItemId, x.BatchNo, x.ItemName,convert(varchar, x.ExpiryDate,23) as ExpiryDate, x.MRP, x.GenericName,
	x.AvailableQuantity as 'Qty'
	--Sum(FQty+ InQty-OutQty-FQtyOut) 'Qty'
	From 
			--(select t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName,
			--    sum(Case when InOut ='in' then FreeQuantity else 0 end ) as 'FQty',
			--	sum(Case when InOut ='out' then FreeQuantity else 0 end ) as 'FQtyOut',
			--	SUM(Case when InOut ='in' then Quantity else 0 end ) as 'InQty',
			--	SUM(Case When InOut = 'out' then Quantity ELSE 0 END) AS 'OutQty'
			--	from [dbo].[PHRM_StockTxnItems] t1
			--		inner join [dbo].[PHRM_MST_Item] item on item.ItemId = t1.ItemId
			--		inner join [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
			--		where  t1.ExpiryDate <= DATEADD(MONTH, 3, GETDATE()) AND t1.Quantity>0
			--		group by t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName
			--		) x 
			--		where x.ItemName  like '%'+ISNULL(@ItemName,'')+'%'  
			--		Group By x.ItemId, x.BatchNo, x.ItemName,x.ExpiryDate,x.MRP, x.GenericName
						
			(select 
				t1.ItemId,t1.BatchNo, t1.ExpiryDate,t1.MRP,item.ItemName,generic.GenericName,t1.AvailableQuantity
				from PHRM_DispensaryStock t1
				inner join [dbo].[PHRM_MST_Item] item on item.ItemId= t1.ItemId
				inner join [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
				where  t1.ExpiryDate <= DATEADD(MONTH, 3, GETDATE()) AND t1.AvailableQuantity>0
				 group by t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName,t1.AvailableQuantity
			)x 
	END
	END
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_DispensaryStoreStockReport]    Script Date: 12-12-2019 12:48:32 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMReport_DispensaryStoreStockReport]  
	@Status varchar(200) = NUll
AS
/*
FileName: [SP_PHRMReport_DispensaryStoreStockReport]
CreatedBy/date: Rusha/2019-04-10
Description: To get the Stock Value of both dispensary and store wise
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1.       Rusha/06-11-2019						updated script for dispensary and store stock item
2.		 Naveed/13-12-2019						updated script for exclude zero quantity Items from Report
--------------------------------------------------------
*/

	BEGIN
		DECLARE @dis_name VARCHAR(MAX);
		SET @dis_name='Dispensary';
		IF (@Status = 'dispensary')	 
				SELECT itm.ItemName,dis.BatchNo AS BatchNo, dis.ExpiryDate, dis.MRP,
				dis.AvailableQuantity AS StockQty
				FROM PHRM_DispensaryStock AS dis 
				JOIN PHRM_MST_Item AS itm ON dis.ItemId = itm.ItemId
				where dis.AvailableQuantity>0

		ELSE IF (@Status = 'store')
				SELECT  x1.ItemName,x1.BatchNo AS BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
				SUM(InQty- OutQty+FInQty-FOutQty) AS 'StockQty'
				FROM(SELECT stk.ItemName, stk.BatchNo, stk.ExpiryDate, stk.MRP,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				where stk.Quantity>0 and stk.FreeQuantity>0
				GROUP BY stk.ItemName, stk.BatchNo , stk.ExpiryDate, stk.MRP)as x1
				GROUP BY x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.MRP

			ELSE IF(@Status = 'all')

				SELECT * FROM (	
				SELECT itm.ItemName,dis.BatchNo AS BatchNo, dis.ExpiryDate, dis.MRP,
				dis.AvailableQuantity AS StockQty, @dis_name as [Name]
				FROM PHRM_DispensaryStock AS dis 
				JOIN PHRM_MST_Item AS itm ON dis.ItemId = itm.ItemId
				where dis.AvailableQuantity>0
				UNION ALL

				SELECT  x1.ItemName,x1.BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
				SUM(InQty- OutQty+FInQty-FOutQty) AS StockQty, x1.StoreName as [Name]
				FROM(SELECT stk.ItemName, stk.BatchNo as BatchNo, stk.ExpiryDate, stk.MRP,stk.StoreName,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				where stk.Quantity>0 and stk.FreeQuantity>0
				GROUP BY stk.ItemName, stk.BatchNo , stk.ExpiryDate, stk.MRP,stk.StoreName)as x1
				GROUP BY x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.MRP, x1.StoreName
				) a
	 END
GO


/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_PurchaseOrderSummaryReport]    Script Date: 12-12-2019 03:06:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[SP_PHRMReport_PurchaseOrderSummaryReport] 
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@Status nvarchar(50)=null

AS
/*
FileName: [SP_PHRMReport_PurcaseOrderSummary]
CreatedBy/date: Umed/2017-11-23
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/2017-05-25	                     created the script
2		Rusha/2019-04-26					 Recreated of Script
3.		Naveed/2019-12-13					 updated script for exclude zero quantity Items from Report
--------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) and (@Status IS NOT null)
	BEGIN
		IF (@Status='all')
			SELECT convert(date,PO.PODate) as [Date],itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,sum(poitm.Quantity) as Quantity,poitm.StandaredPrice,sum(poitm.ReceivedQuantity) as ReceivedQuantity from PHRM_PurchaseOrder as po
			join PHRM_PurchaseOrderItems as poitm on poitm.PurchaseOrderId=po.PurchaseOrderId
			join PHRM_MST_Item as itm on itm.ItemId=poitm.ItemId
			WHERE convert(datetime, PO.PODate) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 AND poitm.Quantity>0
			GROUP BY convert(date,PO.PODate),itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,poitm.Quantity,poitm.StandaredPrice,poitm.ReceivedQuantity
		
		ELSE IF (@Status='active')
			SELECT convert(date,PO.PODate) as [Date], itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,sum(poitm.Quantity) as Quantity,poitm.StandaredPrice,sum(poitm.ReceivedQuantity) as ReceivedQuantity from PHRM_PurchaseOrder as po
			join PHRM_PurchaseOrderItems as poitm on poitm.PurchaseOrderId=po.PurchaseOrderId
			join PHRM_MST_Item as itm on itm.ItemId=poitm.ItemId
			WHERE po.POStatus='active' and convert(datetime, PO.PODate) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 AND poitm.Quantity>0
			GROUP BY convert(date,PO.PODate),itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,poitm.Quantity,poitm.StandaredPrice,poitm.ReceivedQuantity

		ELSE IF (@Status='complete')
			SELECT convert(date,PO.PODate) as [Date],itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,sum(poitm.Quantity) as Quantity,poitm.StandaredPrice,sum(poitm.ReceivedQuantity) as ReceivedQuantity from PHRM_PurchaseOrder as po
			join PHRM_PurchaseOrderItems as poitm on poitm.PurchaseOrderId=po.PurchaseOrderId
			join PHRM_MST_Item as itm on itm.ItemId=poitm.ItemId
			WHERE po.POStatus='complete' and convert(datetime, PO.PODate) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 AND poitm.Quantity>0
			GROUP BY convert(date,PO.PODate),itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,poitm.Quantity,poitm.StandaredPrice,poitm.ReceivedQuantity
	END
END

GO


/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_BatchStockReport]    Script Date: 12-12-2019 04:38:48 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
----- END: 6 June 2019 Vikas: Create new PHRM_Dispensary Table -----


----- START: 7th June 2019: Alter store procedure

ALTER PROCEDURE [dbo].[SP_PHRMReport_BatchStockReport]  
	     @ItemName varchar(200) = null		
AS
/*
FileName: [SP_PHRMReport_BatchStockReport]
CreatedBy/date: Umed/2018-02-22
Description: To get the Details Such As ItemTypeName, ItemCode, AvailableQty,ExpiryDate,BatchNo, PurchaseRate, PurchaseValue, SalesRate, SalesVale of Each Item Selected By User BatchWise
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1       Umed/2018-02-22	                 created the script
										(To get the Details Such As ItemTypeName, ItemCode, AvailableQty,ExpiryDate,BatchNo, PurchaseRate, PurchaseValue, SalesRate, SalesVale of Each Item Selected By User BatchWise)
2       Umed/2018-02-23					Modified Sp i.e correction in SaleRate and SaleValue Field 
										(previously i am getting Salevale= SaleQty*Price but Write is SaleValue= AvailQty*Price and Added IsNull on some Attribute)
3		Rusha/2019-04-10				Modify Batch report showing stocks according to batchwise 
4		Vikas/2019-06-07				modify table name PHRM_StockTxnItem to PHRM_DispensarStock, get data from PHRM_DispensaryStock table
5.		Naveed/2019-12-13				updated script for exclude zero quantity Items from Report
----------------------------------------------------------------------------
*/
BEGIN

 IF (@ItemName IS NOT NULL)
	 BEGIN
		SELECT (CAST(ROW_NUMBER() OVER (ORDER BY  itm.ItemName)  AS INT)) AS SN,stk.ItemId, stk.BatchNo, itm.ItemName,gen.GenericName,
		stk.ExpiryDate,stk.AvailableQuantity AS TotalQty,stk.MRP
		FROM PHRM_DispensaryStock AS stk
		JOIN PHRM_MST_Item AS itm ON stk.ItemId=itm.ItemId
		JOIN PHRM_MST_Generic gen ON itm.GenericId= gen.GenericId
		WHERE BatchNo  like '%'+ISNULL(@ItemName,'')+'%' and stk.AvailableQuantity>0
		GROUP BY stk.ItemId,stk.BatchNo,itm.ItemName, stk.MRP, gen.GenericName,stk.ExpiryDate,stk.AvailableQuantity  
	 END
END
GO


/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_DrugCategoryWiseReport]    Script Date: 12-12-2019 04:16:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[SP_PHRMReport_DrugCategoryWiseReport] 
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@Category nvarchar(100)=null

AS
/*
FileName: [SP_PHRMReport_DrugCategoryWiseReport]
CreatedBy/date: Rusha/2019-05-12
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1        Rusha/2019-05-12                     created of the script for displaying report according to drug category
2.		 Naveed/2019-12-13				      updated script for exclude zero quantity Items from Report
--------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and (@Category IS NOT NULL))
	BEGIN
		SELECT CONVERT(DATE,invitm.CreatedOn) AS [Date],cat.CategoryName,invitm.ItemName, CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) AS PatientName,
		--CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS ProviderName,		
		invitm.BatchNo,invitm.Quantity,invitm.Price,invitm.TotalAmount 
		FROM PHRM_TXN_InvoiceItems AS invitm
		join PHRM_TXN_Invoice AS inv ON inv.PatientId = invitm.PatientId
		--join EMP_Employee AS emp ON inv.ProviderId = emp.EmployeeId
		join PHRM_MST_Item AS itm ON invitm.ItemId = itm.ItemId
		join PHRM_MST_Generic AS gen ON itm.GenericId = gen.GenericId
		join PHRM_MST_Category AS cat ON gen.CategoryId = cat.CategoryId
		join PAT_Patient AS pat ON invitm.PatientId = pat.PatientId
		WHERE CONVERT(DATE,invitm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and cat.CategoryName = @Category AND invitm.Quantity>0
	END
END
GO


/****** Object:  StoredProcedure [dbo].[SP_PHRM_ReturnToSupplierReport]    Script Date: 12-12-2019 04:00:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRM_ReturnToSupplierReport] 
	@FromDate datetime=null,
	@ToDate datetime=null
AS
 /*
FileName: [dbo].[SP_PHRM_ReturnToSupplierReport] 
CreatedBy/date:Rusha/04-08-2019
Description: To get report of stock detials return to supplier from Pharmacy store 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1.		 Naveed/2019-12-13				      updated script for exclude zero quantity Items from Report
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
			select CONVERT(date,rtnitm.CreatedOn) as [Date], (Cast(ROW_NUMBER() OVER (ORDER BY  grp.SupplierName)  as int)) as SN,grp.SupplierName, 
				grp.ItemName,rtn.ReturnDate, rtnitm.Quantity + rtnitm.FreeQuantity as Qty,rtnitm.SubTotal,rtn.DiscountAmount,
				rtn.VATAmount, rtnitm.TotalAmount,rtn.CreditNoteId as SupplierCreditNoteNum,rtn.CreditNotePrintId as CreditNoteNum,rtn.Remarks
			from PHRM_ReturnToSupplierItems as rtnitm
			join PHRM_ReturnToSupplier as rtn on rtnitm.ReturnToSupplierId=rtn.ReturnToSupplierId
			join PHRM_GoodsReceiptItems as grp on rtnitm.GoodReceiptItemId=grp.GoodReceiptItemId
			where CONVERT(date, rtnitm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 AND rtnitm.Quantity>0 
			group by CONVERT(date,rtnitm.CreatedOn),grp.SupplierName, grp.ItemName,rtn.ReturnDate, rtnitm.Quantity,rtnitm.FreeQuantity,rtnitm.SubTotal,
				rtn.DiscountAmount,rtn.VATAmount, rtnitm.TotalAmount,rtn.CreditNoteId,rtn.CreditNotePrintId,rtn.Remarks
	   END
END

GO

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_MinStockReport]    Script Date: 13-12-2019 11:47:05 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMReport_MinStockReport]  
@ItemName varchar(200) = null
AS
/*
FileName: [SP_PHRMReport_MinStockReport]
CreatedBy/date: vikas/2018-08-21
Description: 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
	1.	Vikas/28Aug'18						created the script
	2.	Rusha/04-01-2019					sum up quantity
	3.	Rusha/07-08-2019					updated script
	4.	Naveed/13-12-2019				    updated script for exclude zero quantity Items
----------------------------------------------------------------------------
*/
Begin 
IF (@ItemName IS NOT NULL)
	BEGIN

	SELECT * FROM
	(
		SELECT a.ItemId ,a.ItemName, SUM(InQty-OutQty+FInQty-FOutQty) as Quantity,convert(date,a.ExpiryDate) AS ExpiryDate,
		a.BatchNo,a.MinStockQuantity 
		FROM 
			(SELECT itm.ItemId ,itm.ItemName,itm.MinStockQuantity,convert(date,stk.ExpiryDate)as ExpiryDate,stk.BatchNo,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
			FROM  PHRM_StockTxnItems stk
			JOIN  PHRM_MST_Item itm
			ON stk.ItemId=itm.ItemId
			WHERE itm.MinStockQuantity != 0 
			GROUP BY itm.ItemId ,itm.ItemName,convert(date,stk.ExpiryDate),stk.BatchNo,itm.MinStockQuantity) a
		WHERE (((@ItemName=a.ItemName OR @ItemName='') or a.ItemName like '%'+ISNULL(@ItemName,'')+'%' )) 
		GROUP BY a.ItemId,a.ItemName,a.BatchNo,a.ExpiryDate,a.MinStockQuantity
	) s		
	WHERE s.Quantity < s.MinStockQuantity and s.Quantity>0
	GROUP BY s.ItemId, s.ItemName,s.Quantity,s.ExpiryDate,s.BatchNo,s.MinStockQuantity

	END
END
GO


/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_ABC/VEDStockReport]    Script Date: 13-12-2019 11:58:01 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMReport_ABC/VEDStockReport]  
@Status varchar(200) = null
AS
/*
FileName: [SP_PHRMReport_ABC/VEDStockReport]
CreatedBy/date: Rusha/04-01-2019
Description: 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1		Rusha/04-01-2019						get item details according to ABC and VED
2		Naveed/13-12-2019				    	updated script for exclude zero quantity Items
----------------------------------------------------------------------------
*/
Begin 
IF (@Status IS NOT NULL)
	BEGIN
		select itm.ItemName,gen.GenericName,itm.ABCCategory as ABC,itm.VED,itm.MinStockQuantity as Quantity
		from [dbo].[PHRM_MST_Item] as itm
		join PHRM_MST_Generic as gen on itm.GenericId = gen.GenericId
		where ((@Status=itm.ABCCategory OR @Status=itm.VED OR @Status='') or itm.ABCCategory like '%'+ISNULL(@Status,'')+'%' 
		or itm.VED like '%'+ISNULL(@Status,'')+'%' ) and itm.MinStockQuantity>0
		group by itm.ItemName,itm.ABCCategory, itm.VED,itm.MinStockQuantity,gen.GenericName
	END
	ELSE IF (@Status IS NULL)
	BEGIN
		select itm.ItemName,gen.GenericName,itm.ABCCategory as ABC,itm.VED,itm.MinStockQuantity as Quantity
		from [dbo].[PHRM_MST_Item] as itm
		join PHRM_MST_Generic as gen on itm.GenericId = gen.GenericId
		--where ((@Status=itm.ABCCategory OR @Status=itm.VED OR @Status='') or itm.ABCCategory like '%'+ISNULL(@Status,'')+'%' 
		--or itm.VED like '%'+ISNULL(@Status,'')+'%' )
		group by itm.ItemName,itm.ABCCategory, itm.VED,itm.MinStockQuantity,gen.GenericName
	END
END
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRM_GoodsReceiptProductReport]    Script Date: 13-12-2019 12:19:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_GoodsReceiptProductReport] 
@FromDate datetime=null,
@ToDate datetime=null,
@ItemId int=null
 AS
 /*
FileName: [SP_PHRM_GoodsReceiptProductReport]
CreatedBy/date:Vikas/2018-08-10
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Vikas/2018-08-10                created the script
2      Nagesh/2018-08-11                updated
3	   Abhishek/ 2018-09-7				updated
4	   Naveed/2019-12-13				updated script for exclude zero quantity Items
--------------------------------------------------------
*/
 BEGIN
  
    BEGIN
    select gr.GoodReceiptPrintId, grp.ItemId, grp.ItemName, grp.BatchNo,grp.ReceivedQuantity,grp.FreeQuantity,
    grp.GRItemPrice as [ItemPrice],grp.MRP,spl.SupplierName,spl.ContactNo,
    convert(date,grp.CreatedOn) as [Date] from PHRM_GoodsReceiptItems grp
      join PHRM_GoodsReceipt gr
      on grp.GoodReceiptId=gr.GoodReceiptId
        join PHRM_MST_Supplier spl
        on gr.SupplierId=spl.SupplierId
        where grp.ReceivedQuantity>0 and (( CONVERT(date, grp.CreatedOn) Between @FromDate AND @ToDate) and (@ItemId IS NULL or @ItemId=0 ))
        or  ((CONVERT(date, grp.CreatedOn) Between @FromDate AND @ToDate)  and grp.ItemId=@ItemId  )
  End
End
GO


/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_StockManageDetailReport]    Script Date: 13-12-2019 12:30:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--End: Vikas/2019-01-02 Changes :return invoice report doesnt showing correctly so changes script---------------

--START: Vikas/2019-01-02 Changes :modify sp for Stock management remark---------------
ALTER PROCEDURE [dbo].[SP_PHRMReport_StockManageDetailReport] 
	@FromDate DateTime=null,
	@ToDate DateTime=null

AS
/*
FileName: SP_PHRMReport_StockManageDetailReport
CreatedBy/date:Salakha/18/09/2018
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Salakha/18/09/2018	                     created the script
2.      Vikas/2019-01-02						 modify sp for Stock management remark.
3.		Rusha/2019-03-05						 add MRP,Price and Total amt of stock
4.		Naveed/2019-12-13						 updated script for exclude zero quantity Items
--------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT convert(date,stkMng.CreatedOn) as [Date] ,itm.ItemName, stkMng.BatchNo, stkMng.ExpiryDate ,stkMng.Quantity,stkMng.Remark,
			case when stkMng.InOut='in'then 'stock added' else 'stock deducted'
			end as InOut, stkMng.MRP, stkMng.Price, Round(stkMng.MRP*stkMng.Quantity,2,0) as TotalAmount 
					FROM PHRM_StockManage stkMng
            INNER JOIN PHRM_MST_Item itm on itm.ItemId = stkMng.ItemId
            WHERE  convert(datetime, stkMng.CreatedOn) 
           BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and stkMng.Quantity>0
		END		
End
GO
--End: Naveed:  13 dec, 2019 Pharmacy report Bug fixes---

--Narayan: Start: 12th Dec 2019 : Added two tables Of Eye Module named FinalClass and AdviceDiagnosis
/****** Object:  Table [dbo].[CLN_PrescriptionSlip_AdviceDiagnosis]    Script Date: 12/11/2019 11:53:50 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO




CREATE TABLE [dbo].[CLN_PrescriptionSlip_AdviceDiagnosis](
  [Id] [int] IDENTITY(1,1) NOT NULL,
  [MasterId] [int] NULL,
  [AdviceDiagnosis] [varchar](1000) NULL,
  [CreatedBy] [int] NULL,
  [CreatedOn] [datetime] NULL, PRIMARY KEY CLUSTERED 
(
  [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CLN_PrescriptionSlip_FinalClass]    Script Date: 12/11/2019 11:57:53 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_FinalClass](
  [Id] [int] IDENTITY(1,1) NOT NULL,
  [MasterId] [int] NULL,
  [SphOS] [varchar](10) NULL,
  [SphOD] [varchar](10) NULL,
  [CylOD] [varchar](10) NULL,
  [CylOS] [varchar](10) NULL,
  [AxisOD] [varchar](10) NULL,
  [AxisOS] [varchar](10) NULL,
  [CreatedBy] [int] NULL,
  [CreatedOn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
  [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
--Narayan: End: 12th Dec 2019 : Added two tables Of Eye Module named FinalClass and AdviceDiagnosis
--Dinesh: 17th Dec'19: Start ----Setting Route for Core CFG Parameters -----
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Settings' and ApplicationCode='SETT');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('core-cfg-sett-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='core-cfg-sett-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Settings');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Core CFG Parameters','Settings/EditCoreCFG','EditCoreCFG',@permissionID,@parentRouteId,'fa fa-money fa-stack-1x text-white',1,1,25)
GO

--Dinesh: 17th Dec'19: End ----Setting Route for Core CFG Parameters -----

--Start: Anish: 25 dec, MR module routing--
declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('mr-birthlist-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='mr-birthlist-view');

declare @parentRouteId int =(select top(1) RouteId from RBAC_RouteConfig where RouterLink='Medical-records');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,ParentRouteId,PermissionId,DefaultShow,DisplaySeq,IsActive) 
Values ('Birth List','Medical-records/BirthList','BirthList',@parentRouteId,@permissionId,'1','2','1');
Go

declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('mr-deathlist-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='mr-deathlist-view');

declare @parentRouteId int =(select top(1) RouteId from RBAC_RouteConfig where RouterLink='Medical-records');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,ParentRouteId,PermissionId,DefaultShow,DisplaySeq,IsActive) 
Values ('Death List','Medical-records/DeathList','DeathList',@parentRouteId,@permissionId,'1','2','1');
Go



declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('medical-records-reportlist-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='medical-records-reportlist-view');

declare @parentRouteId int =(select top(1) RouteId from RBAC_RouteConfig where RouterLink='Medical-records');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,ParentRouteId,PermissionId,DefaultShow,DisplaySeq,IsActive) 
Values ('Reports','Medical-records/ReportList','ReportList',@parentRouteId,@permissionId,'1','2','1');
Go 

declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('mr-diseasewise-report-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='mr-diseasewise-report-view');

declare @parentRouteId int =(select top(1) RouteId from RBAC_RouteConfig where RouterLink='ReportList');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,Css,ParentRouteId,PermissionId,DefaultShow,DisplaySeq,IsActive) 
Values ('Disease Wise Report','Medical-records/ReportList/DiseaseWiseReport','DiseaseWiseReport','fa fa-credit-card fa-stack-1x text-white',@parentRouteId,@permissionId,'1','2','1');
Go 

declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('mr-inpatient-services-report-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='mr-inpatient-services-report-view');

declare @parentRouteId int =(select top(1) RouteId from RBAC_RouteConfig where RouterLink='ReportList');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,Css,ParentRouteId,PermissionId,DefaultShow,DisplaySeq,IsActive) 
Values ('Inpatient Service Report','Medical-records/ReportList/InpatientServicesReport','InpatientServicesReport','fa fa-credit-card fa-stack-1x text-white',@parentRouteId,@permissionId,'1','4','1');
Go 

declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('mr-outpatient-services-report-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='mr-outpatient-services-report-view');

declare @parentRouteId int =(select top(1) RouteId from RBAC_RouteConfig where RouterLink='ReportList');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,Css,ParentRouteId,PermissionId,DefaultShow,DisplaySeq,IsActive) 
Values ('Outpatient Service Report','Medical-records/ReportList/OutpatientServicesReport','OutpatientServicesReport','fa fa-credit-card fa-stack-1x text-white',@parentRouteId,@permissionId,'1','6','1');
Go 

declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('mr-lab-services-report-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='mr-lab-services-report-view');

declare @parentRouteId int =(select top(1) RouteId from RBAC_RouteConfig where RouterLink='ReportList');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,Css,ParentRouteId,PermissionId,DefaultShow,DisplaySeq,IsActive) 
Values ('Lab Services Report','Medical-records/ReportList/LabServicesReport','LabServicesReport','fa fa-credit-card fa-stack-1x text-white',@parentRouteId,@permissionId,'1','8','1');
Go 

declare @AppId int;
set @AppId = (select Top(1) ApplicationId from RBAC_Application where ApplicationCode='MR' and ApplicationName='MedicalRecords');
declare @empId int;
set @empId = (select top(1) EmployeeId from RBAC_User where UserName='admin');
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('mr-morbidity-report-view',@AppId,@empId,GETDATE(),'1');
Go

declare @permissionId int;
set @permissionId = (select top(1) PermissionId from RBAC_Permission where PermissionName='mr-morbidity-report-view');

declare @parentRouteId int =(select top(1) RouteId from RBAC_RouteConfig where RouterLink='ReportList');
Insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,Css,ParentRouteId,PermissionId,DefaultShow,DisplaySeq,IsActive) 
Values ('Morbidity Report','Medical-records/ReportList/MorbidityReport','MorbidityReport','fa fa-credit-card fa-stack-1x text-white',@parentRouteId,@permissionId,'1','10','1');
Go 

--End: Anish: 25 dec, MR module routing--

----- Start: Ramavtar 26Dec'19 --- Common added in calender types -----
UPDATE CORE_CFG_Parameters
SET ParameterValue = '{"LaboratoryServices":"np,en","PatientRegistration":"np","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np","DoctorOutPatientReport":"en,np","DoctorwiseIncomeSummary":"en,np","CustomReport":"en,np","DailyMISReport":"en,np","DoctorSummary":"en,np","DepartmentSummary":"en,np","Common":"en,np"}'
WHERE ParameterGroupName = 'Common' AND ParameterName = 'CalendarTypes'
GO
----- End: Ramavtar 26Dec'19 --- Common added in calender types -----



--Anish: Start: 30 Dec 19--
EXEC sp_rename 'ADT_BabyBirthDetails.MedicalRecordsId','MedicalRecordId','COLUMN';
Go
EXEC sp_rename 'MR_RecordSummary.LabTests','AllTests'
Go
Insert Into MR_MST_OperationType Values('Dummy Operation'),('Futial Operation'),('Noral Operation'),('Syroui Operation');
Go
Alter table ADT_DeathDeatils
Add FatherName varchar(80), MotherName varchar(80), SpouseOf varchar(80), VisitCode varchar(20),
CauseOfDeath varchar(200),Age varchar(20),CertifiedBy int null,FiscalYear varchar(20),PrintedBy int null, PrintCount int, PrintedOn DateTime null;
Go
--Anish: Start: 30 Dec 19--

--start : Dinesh 31st Dec'19 Category wise lab test report ------------------------------
/****** Object:  StoredProcedure [dbo].[SP_Report_Lab_CategoryWiseLabReport]    Script Date: 12/31/2019 10:22:33 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Lab_CategoryWiseLabReport] 
@FromDate datetime = NULL,
@ToDate datetime = NULL
AS


/*
FileName: [SP_Report_Lab_CategoryWiseLabReport]  '2019-12-02','2019-12-02'
CreatedBy/date: Dinesh 31st Dec 2019
Description: to get the total count of test conducted 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh											Hams Requirement(For Categorywise Test Count)
--------------------------------------------------------
*/
BEGIN
  IF (@FromDate IS NOT NULL OR @ToDate IS NOT NULL OR LEN(@FromDate) > 0 OR LEN(@ToDate) > 0)
  BEGIN

select (Cast(ROW_NUMBER() OVER (ORDER BY  TestCategoryName desc)  AS int)) AS SN,cat.TestCategoryName as Category,count(lt.LabTestCategoryId) 'Count' from LAB_TestRequisition req
join LAB_LabTests lt on req.LabTestId=lt.LabTestId
join LAB_TestCategory  cat on cat.TestCategoryId= lt.LabTestCategoryId

where convert(date,req.CreatedOn) between @FromDate and @ToDate
group by cat.TestCategoryName order by [Count] desc
  END
END
GO
--end : Dinesh 31st Dec'19 Category wise lab test report ------------------------------

----start : Dinesh 1st Jan 2020 Doctor Wise Patient Count Lab Report ------------------------------------------------

--Dinesh ----Setting Route for DoctorWisePatientCountLabReport -----
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Reports' and ApplicationCode='RPT');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('doctor-wise-patient-count-lab-report-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='doctor-wise-patient-count-lab-report-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Reports/LabMain');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Doctor Wise Patient Count Lab','Reports/LabMain/DoctorWisePatientCountLabReport','DoctorWisePatientCountLabReport',@permissionID,@parentRouteId,'fa fa-money fa-stack-1x text-white',1,1,25)
GO



/****** Object:  StoredProcedure [dbo].[SP_Report_Lab_DoctorWisePatientCountLabReport]    Script Date: 1/1/2020 2:17:14 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_Lab_DoctorWisePatientCountLabReport] 
@FromDate datetime = NULL,
@ToDate datetime = NULL
AS


/*
FileName: [SP_Report_Lab_DoctorWisePatientCountLabReport]  '2019-12-02','2019-12-02'
CreatedBy/date: Dinesh 1st Jan 2020
Description: to get the total count of test conducted 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh											Hams Requirement(to identify the no of patient entered from op/ip/er)
--------------------------------------------------------
*/
BEGIN
  IF (@FromDate IS NOT NULL OR @ToDate IS NOT NULL OR LEN(@FromDate) > 0 OR LEN(@ToDate) > 0)
  BEGIN
  
---Dinesh Changes : Doctor patient Ipcount OPcount


select (Cast(ROW_NUMBER() OVER (ORDER BY  FullName asc)  AS int)) AS SN,FullName 'Doctor',Sum(OP) OP ,Sum(IP) IP,SUm(Emergency) Emergency from (
select

COALESCE(case 
when (visit.VisitType in ('outpatient')) then count(distinct(bt.PatientId))
END ,0) as OP,
COALESCE(case 
when (visit.VisitType in ('inpatient')) then count(distinct(bt.PatientId))
END ,0) as IP,
COALESCE(case 
when (visit.VisitType in ('emergency')) then count(distinct(bt.PatientId))
END ,0) as 'Emergency'

,bt.RequestedBy,em.FullName from BIL_TXN_BillingTransactionItems bt
join BIL_MST_ServiceDepartment sd 
on bt.ServiceDepartmentId=sd.ServiceDepartmentId
join PAT_PatientVisits visit on visit.PatientVisitId=bt.PatientVisitId
join EMP_Employee em on em.EmployeeId=bt.RequestedBy
where convert(date,bt.CreatedOn) = @fromdate and bt.RequestedBy is not null and sd.IntegrationName='LAB'
group by bt.RequestedBy,em.FullName,visit.VisitType
) vt group by vt.RequestedBy,vt.FullName

  END
END
GO


----end : Dinesh 1st Jan 2020 Doctor Wise Patient Count Lab Report ----------------------------------------------------------------


----Start: Narayan: 3rd Jan : Tables of Eye Module
/****** Object:  Table [dbo].[CLN_EyeScanImages]    Script Date: 01/03/2020 09:19:03 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EyeScanImages](
  [PatientFileId] [bigint] IDENTITY(1,1) NOT NULL,
  [PatientId] [int] NOT NULL,
  [ROWGUID] [uniqueidentifier] ROWGUIDCOL  NOT NULL,
  [FileType] [varchar](50) NULL,
  [Description] [varchar](200) NULL,
  [FileBinaryData] [varbinary](max) FILESTREAM  NULL,
  [FileName] [varchar](200) NULL,
  [FileNo] [int] NULL,
  [Title] [varchar](200) NULL,
  [FileExtention] [varchar](50) NULL,
  [UploadedOn] [datetime] NULL,
  [UploadedBy] [int] NULL,
  [IsActive] [bit] NULL,
  [ImageFullPath] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
  [PatientFileId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY] FILESTREAM_ON [Danphe_FileStream],
UNIQUE NONCLUSTERED 
(
  [ROWGUID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] FILESTREAM_ON [Danphe_FileStream]
GO

ALTER TABLE [dbo].[CLN_PrescriptionSlip_FinalClass]
 ADD [VaOD] [varchar](10) NULL,
  [VaOS] [varchar](10) NULL
GO

/****** Object:  Table [dbo].[CLN_EYE_OperationNotes]    Script Date: 01/03/2020 14:05:27 ******/
DROP TABLE [dbo].[CLN_EYE_OperationNotes]
GO

/****** Object:  Table [dbo].[CLN_EYE_OperationNotes]    Script Date: 01/03/2020 14:05:27 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_EYE_OperationNotes](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[MasterId] [int] NULL,
	[Notes] [varchar](1500) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[IsOD] [bit] NULL,
	PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Retinoscopy]    Script Date: 01/03/2020 09:32:29 ******/
DROP TABLE [dbo].[CLN_PrescriptionSlip_Retinoscopy]
GO

/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Retinoscopy]    Script Date: 01/03/2020 09:32:29 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_Retinoscopy](
  [Id] [int] IDENTITY(1,1) NOT NULL,
  [MasterId] [int] NULL,
  [SphOS] [varchar](10) NULL,
  [SphOD] [varchar](10) NULL,
  [CylOD] [varchar](10) NULL,
  [CylOS] [varchar](10) NULL,
  [VaOS] [varchar](10) NULL,
  [VaOD] [varchar](10) NULL,
  [AxisOD] [varchar](10) NULL,
  [AxisOS] [varchar](10) NULL,
  [CreatedBy] [int] NULL,
  [CreatedOn] [datetime] NULL,
 PRIMARY KEY CLUSTERED 
(
  [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Acceptance]    Script Date: 01/03/2020 09:33:51 ******/
DROP TABLE [dbo].[CLN_PrescriptionSlip_Acceptance]
GO

/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Acceptance]    Script Date: 01/03/2020 09:33:51 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_Acceptance](
  [Id] [int] IDENTITY(1,1) NOT NULL,
  [MasterId] [int] NULL,
  [SphOD] [varchar](10) NULL,
  [SphOS] [varchar](10) NULL,
  [CylOD] [varchar](10) NULL,
  [CylOS] [varchar](10) NULL,
  [VaOS] [varchar](10) NULL,
  [VaOD] [varchar](10) NULL,
  [AxisOD] [varchar](10) NULL,
  [AxisOS] [varchar](10) NULL,
  [CreatedBy] [int] NULL,
  [CreatedOn] [datetime] NULL, PRIMARY KEY CLUSTERED 
(
  [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

----End: Narayan: 3rd Jan : Tables of Eye Module
---- Start: Ramavtar 04Jan'2020 -- Filtered out quantity > 0 -----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRMStoreStock]
	@Status varchar(200) = NULL
AS
/*
FileName: [SP_PHRMStore]
CreatedBy/date: Shankar/04-03-2019
Description: To get the Details of store Items
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/04-08-2019						Add From and to Date for date filter
2.		Sanjit/04-09-2019						StoreName has been added.
3.      Shankar/04-15-2019                      IsActive added.
4.		Rusha/05-23-2019						Remove From and to Date for date filter and handled quantity not equals to zero
5.		Rusha/06-11-2019						Updated script
6.		Naveed/24-11-2019						Get GR CreatedOn date as Date in Store details List
7.		Ramavtar/04-Jan-2020					Filtered out Quantity > 0
----------------------------------------------------------------------------
*/
BEGIN
	IF(@Status IS NOT NULL)
		BEGIN
				SELECT  x1.ItemName,x1.BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
			    (SELECT CreatedOn FROM PHRM_GoodsReceiptItems where GoodReceiptItemId= x1.GoodsReceiptItemId )AS 'Date',
				SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price
				FROM(SELECT stk.ItemName, stk.BatchNo, stk.ExpiryDate, stk.MRP,stk.StoreName,
				stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				join PHRM_GoodsReceiptItems as gritm on gritm.GoodReceiptItemId = stk.GoodsReceiptItemId
				GROUP BY stk.ItemName, stk.BatchNo , stk.ExpiryDate, stk.MRP,stk.StoreName,stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price)as x1
				WHERE (@Status=x1.ItemName or x1.ItemName like '%'+ISNULL(@Status,'')+'%')
				GROUP BY x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.MRP,x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price
				HAVING SUM(FInQty + InQty - FOutQty - OutQty) > 0	-- filtering out quantity > 0
		END		
END
GO
---- End: Ramavtar 04Jan'2020 -- Filtered out quantity > 0 -----

----Start: Narayan: 6th Jan : Tables of Eye Module
/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Dilate]    Script Date: 01/06/2020 10:43:18 ******/
DROP TABLE [dbo].[CLN_PrescriptionSlip_Dilate]
GO

/****** Object:  Table [dbo].[CLN_PrescriptionSlip_Dilate]    Script Date: 01/06/2020 10:43:18 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_PrescriptionSlip_Dilate](
  [Id] [int] IDENTITY(1,1) NOT NULL,
  [MasterId] [int] NULL,
  [Atropine] [bit] NULL,
  [CP] [bit] NULL,
  [CTC] [bit] NULL,
  [Tplus] [bit] NULL,
  [CreatedBy] [int] NULL,
  [CreatedOn] [datetime] NULL,
 PRIMARY KEY CLUSTERED 
(
  [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
----End: Narayan: 6th Jan : Tables of Eye Module

--- START: NageshBB: 07 Jan 2020 :renamed module display property 'Ward Supply' to 'Sub Store'----
update RBAC_RouteConfig 
set DisplayName='Sub Store' where UrlFullPath='WardSupply' and RouterLink='WardSupply'
Go
--- END: NageshBB: 07 Jan 2020 :renamed module display property 'Ward Supply' to 'Sub Store'----

----Start--Sanjit:(Missed script) 13Dec'19: Permission,RouteConfig and SP for Goodreceipt evaluation report in inventory---
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Inventory' and ApplicationCode='INV');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('inventory-reports-GoodReceiptEvaluation-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='inventory-reports-GoodReceiptEvaluation-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Inventory/Reports');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq,Css)
VALUES ('Good Receipt Evaluation','Inventory/Reports/GoodReceiptEvaluation','GoodReceiptEvaluation',@permissionID,@parentRouteId,1,1,26,'fa fa-money fa-stack-1x text-white')
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_GoodReceiptEvaluation]    Script Date: 12/13/2019 12:16:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[SP_Report_Inventory_GoodReceiptEvaluation]
  @GoodReceiptId int = null,
  @FromDate DateTime=null,
  @ToDate DateTime=null,
  @TransactionType varchar(70)=null
  AS
/*
 FileName: SP_Report_Inventory_GoodReceiptEvaluation 
 Created: 12Dec'19 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      12Dec'19/sanjit         created          
 2.
 -------------------------------------------------------------------------
*/
BEGIN
  If(@GoodReceiptId IS NOT NULL)
  BEGIN
    select gr.GoodsReceiptID,itm.ItemName,itm.Code,itm.ItemType,gritm.BatchNO,gritm.ItemRate,stktxn.TransactionType,stktxn.Quantity,stktxn.InOut,stktxn.CreatedOn as 'TransactionDate',stktxn.ReferenceNo,emp.FirstName as 'TransactionBy' from INV_TXN_StockTransaction as stktxn
    join INV_TXN_Stock as stk on stktxn.StockId = stk.StockId
    join INV_TXN_GoodsReceiptItems as gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
    join INV_TXN_GoodsReceipt as gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
    join INV_MST_Item as itm on stk.ItemId = itm.ItemId
    join EMP_Employee as emp on stktxn.CreatedBy = emp.EmployeeId
    where gr.GoodsReceiptID = @GoodReceiptId and stkTxn.TransactionType like ISNULL(@TransactionType,'%') and CONVERT(date,stktxn.CreatedOn) between ISNULL(@FromDate,'2010-01-01') and ISNULL(@ToDate,GETDATE())
    order by stktxn.CreatedOn desc
  END
  ELSE
  BEGIN
    select gr.GoodsReceiptID,itm.ItemName,itm.Code,itm.ItemType,gritm.BatchNO,gritm.ItemRate,stktxn.TransactionType,stktxn.Quantity,stktxn.InOut,stktxn.CreatedOn as 'TransactionDate',stktxn.ReferenceNo,emp.FirstName as 'TransactionBy' from INV_TXN_StockTransaction as stktxn
    join INV_TXN_Stock as stk on stktxn.StockId = stk.StockId
    join INV_TXN_GoodsReceiptItems as gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
    join INV_TXN_GoodsReceipt as gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
    join INV_MST_Item as itm on stk.ItemId = itm.ItemId
    join EMP_Employee as emp on stktxn.CreatedBy = emp.EmployeeId
    where stkTxn.TransactionType like ISNULL(@TransactionType,'%') and CONVERT(date,stktxn.CreatedOn) between ISNULL(@FromDate,'2010-01-01') and ISNULL(@ToDate,GETDATE())
    order by stktxn.CreatedOn desc
  END
END

GO

----END--Sanjit: 13Dec'19: Permission,RouteConfig and SP for Goodreceipt evaluation report in inventory---

--Sanjit: 7th Jan'20: Start ----Added Requested By and Dispatched By in Requisition/Dispatch Report of WardSupply-----
/****** Object:  StoredProcedure [dbo].[SP_WardReport_RequisitionReport]    Script Date: 1/7/2020 4:20:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_RequisitionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null
AS
/*
FileName: [SP_WardReport_RequisitionReport] '1/7/2020','1/7/2020'
CreatedBy/date: Rusha/03-26-2019
Description: To get the Requsition and Dispatch Details of Stock such as WardName, ItemName, BatchNo, RequestedQty, MRP of Each Item Selected By User 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-26-2019					   get stock details of requisition and dispatch of item from different ward
2.		Sanjit/01-07-2020					   added requested by user and dispatched by user.
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			select convert(date,req.CreatedOn) as RequestedDate,convert(date,dispitm.CreatedOn) as DispatchDate,adt.WardName, itm.ItemName,sum(reqitm.Quantity) as RequestedQty,sum(dispitm.Quantity) as DispatchQty,dispitm.MRP, ROUND(sum(dispitm.Quantity)*dispitm.MRP, 2, 0) as TotalAmt,
			(select FullName from EMP_Employee as emp1 where emp1.EmployeeId = req.CreatedBy) as 'RequestedByUser',
			(select FullName from EMP_Employee as emp2 where emp2.EmployeeId = dispitm.CreatedBy) as 'DispatchedByUser'
			from WARD_Requisition as req
			join ADT_MST_Ward as adt on req.WardId=adt.WardID
			join WARD_RequisitionItems as reqitm on req.RequisitionId= reqitm.RequisitionId
			join PHRM_MST_Item as itm on reqitm.ItemId= itm.ItemId
			left join WARD_DispatchItems as dispitm on reqitm.RequisitionItemId=dispitm.RequisitionItemId
			where CONVERT(date, req.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by convert(date,req.CreatedOn),convert(date,dispitm.CreatedOn), adt.WardName,reqitm.Quantity,itm.ItemName, dispitm.MRP, dispitm.Quantity,req.CreatedBy,dispitm.CreatedBy
		END		
End
GO
--Sanjit: 7th Jan'20: END ----Added Requested By and Dispatched By in Requisition/Dispatch Report of WardSupply-----

--Sanjit: 9th Jan'20: Start ----Added Received By user in Requisition/Dispatch Report and Transfer Report of WardSupply-----

Alter Table WARD_Dispatch
Add ReceivedBy varchar(55)
GO

Alter Table WARD_Transaction
Add ReceivedBy varchar(55)
GO


/****** Object:  StoredProcedure [dbo].[SP_WardReport_RequisitionReport]    Script Date: 1/9/2020 4:26:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_RequisitionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null
AS
/*
FileName: [SP_WardReport_RequisitionReport] '1/7/2020','1/7/2020'
CreatedBy/date: Rusha/03-26-2019
Description: To get the Requsition and Dispatch Details of Stock such as WardName, ItemName, BatchNo, RequestedQty, MRP of Each Item Selected By User 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-26-2019					   get stock details of requisition and dispatch of item from different ward
2.		Sanjit/01-09-2020					   added requested by user and dispatched by user and receivedby user.
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			select req.RequisitionId,disp.DispatchId,convert(date,req.CreatedOn) as RequestedDate,convert(date,dispitm.CreatedOn) as DispatchDate,adt.WardName, itm.ItemName,sum(reqitm.Quantity) as RequestedQty,sum(dispitm.Quantity) as DispatchQty,dispitm.MRP, ROUND(sum(dispitm.Quantity)*dispitm.MRP, 2, 0) as TotalAmt,
			(select FullName from EMP_Employee as emp1 where emp1.EmployeeId = req.CreatedBy) as 'RequestedByUser',
			(select FullName from EMP_Employee as emp2 where emp2.EmployeeId = dispitm.CreatedBy) as 'DispatchedByUser',
			disp.ReceivedBy as 'ReceivedBy'
			from WARD_Requisition as req
			join ADT_MST_Ward as adt on req.WardId=adt.WardID
			join WARD_RequisitionItems as reqitm on req.RequisitionId= reqitm.RequisitionId
			join PHRM_MST_Item as itm on reqitm.ItemId= itm.ItemId
			left join WARD_Dispatch as disp on req.RequisitionId = disp.RequisitionId
			left join WARD_DispatchItems as dispitm on reqitm.RequisitionItemId=dispitm.RequisitionItemId and disp.DispatchId = dispitm.DispatchId
			where CONVERT(date, req.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by convert(date,req.CreatedOn),convert(date,dispitm.CreatedOn), adt.WardName,reqitm.Quantity,itm.ItemName, dispitm.MRP, dispitm.Quantity,req.CreatedBy,dispitm.CreatedBy,req.RequisitionId,disp.DispatchId,disp.ReceivedBy
		END		
End
GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_TransferReport]    Script Date: 1/9/2020 4:29:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_TransferReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null,
	@Status int = null					--Ward to Ward report is shown in case of 1 and Ward to Pharmacy report in case of 0	
AS
/*
FileName: [SP_WardReport_TransferReport] '1/7/2020','1/8/2020',null
CreatedBy/date: Rusha/03-26-2019
Description: To get the Details of report of Ward to Ward Tranfer and Ward to Pharmacy Trannsfer of stock 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-29-2019						shows report of Ward to ward transfer and ward to pharmacy transfer
2.		Sanjit/01-09-2020						added Received by field in both transfer cases.
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
		if (@Status = 1)
			select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,adt.WardName as FromWard,adt2.WardName as ToWard, Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			join ADT_MST_Ward as adt2 on transc.newWardId=adt2.WardID
			where TransactionType = 'WardtoWard' and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName,adt2.WardName, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
		
		else if (@Status =0)
			(select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,adt.WardName as FromWard,transc.Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			where TransactionType = 'WardToPharmacy' and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
			)

		else
			select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,adt.WardName as FromWard,adt2.WardName as ToWard, Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			left join ADT_MST_Ward as adt2 on transc.newWardId=adt2.WardID
			where TransactionType in ('WardToPharmacy','WardtoWard') and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName,adt2.WardName, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
		END	
End
GO

--Sanjit: 9th Jan'20: END ----Added Received By user in Requisition/Dispatch Report and Transfer Report of WardSupply-----

--START :Ashish : 10th Jan 2020 : Create table, stored procedure, and modify function.

--Create new Mapping TBL  
CREATE TABLE [dbo].[ACC_Bill_LedgerMapping](
	[BillLedgerMappingId] [int] IDENTITY(1,1) NOT NULL,
	[LedgerId] [int] NOT NULL,
	[ServiceDepartmentId] [int] NOT NULL,
	[ItemId] [int] NULL,
 CONSTRAINT [PK_ACC_Bill_LedgerMapping] PRIMARY KEY CLUSTERED 
(
	[BillLedgerMappingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

-- SP 
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO

-- =============================================
-- Author: <Ashish>
-- Create date: <10th Jan 2020>
-- Description: <get income ledgers>
--This function gets servicedeptid and itemid and return ledgerid from BillingIncome Ledger Mapping table
--this is used in trigger for save billing data into sync table 
--logic is like 
    --if(find Ledger id from mapping talbe  for servDeptId && ItemId) 
        --Yes got it=> return LedgerId
    --else if (find Ledger id from mapping talbe  for servDeptId && ItemId is null )  
        --Yes got it=> return LedgerId
    --else (means don't have entry into mapping table or there is no ledger created)
        --If(check Ledger is exist or not for ServiceDepartment into ACC_Ledger table)    
          --Yes got it ==>Means Ledger is there but mapping table don'at have entry
                --=> so, do entry into mapping table like ServiceDeptId && ItemId as NULL, LedgerId
                --=> return LedgerId
          --NO not there=> Means Ledger not created for Service Dep and also there is no entry into mapping table
            --=>Then First insert Ledger with matching ledgergroup for billing income ledger
            --=>do entry into mapping table like ServiceDeptId && ItemId as NULL, LedgerId
            --=>return LedgerId
-- =============================================
	CREATE PROCEDURE [dbo].[SP_ACC_GetIncomeLedgerName_Updated]
	  @ServiceDepartmentId int  , @ItemId int	-- Add the parameters for the stored procedure here
	AS
	BEGIN

	DECLARE @LedgerId int, @LedgerName varchar(100), @NewLedgerName varchar(500),@LedgerGroupId int
		if Exists (SELECT   LedgerId FROM ACC_Bill_LedgerMapping where ServiceDepartmentId=@ServiceDepartmentId and ItemId=@ItemId)
			Begin
				set @LedgerId= (Select  LedgerId from ACC_Bill_LedgerMapping where ServiceDepartmentId=@ServiceDepartmentId and ItemId=@ItemId)

		End
		Else if Exists (SELECT 1 LedgerId FROM ACC_Bill_LedgerMapping where ServiceDepartmentId=@ServiceDepartmentId and ItemId is null)

		Begin
				set @LedgerId= (Select  LedgerId from ACC_Bill_LedgerMapping where ServiceDepartmentId=@ServiceDepartmentId and ItemId is null)
		End
		Else 
			Begin
	 
				 set @LedgerGroupId=(select top 1 Ledgergroupid  from ACC_MST_LedgerGroup where  [Name] ='RDI_SALES')
				 Set  @NewLedgerName=(select top 1 ServiceDepartmentName from BIL_MST_ServiceDepartment where ServiceDepartmentId=@ServiceDepartmentId)
				if Exists (select top 1 LedgerName from ACC_Ledger where LedgerGroupId=@LedgerGroupId and LedgerName=(select top 1 ServiceDepartmentName from BIL_MST_ServiceDepartment where ServiceDepartmentId=@ServiceDepartmentId))
				 --if Exists (select  LedgerId from ACC_Ledger where  LedgerName=(select top 1 ServiceDepartmentName from BIL_MST_ServiceDepartment where ServiceDepartmentId=@ServiceDepartmentId))
	
				 Begin
					 set @LedgerId = (select  LedgerId from ACC_Ledger where  LedgerName=@NewLedgerName)
	 				insert into acc_bill_ledgermapping(ServiceDepartmentId, ItemId, LedgerId) values(@ServiceDepartmentId,@ItemId,@LedgerId)
				End

				else
					Begin
					  --create new ledger for billing income sales ledger group
			
					insert into acc_ledger(LedgerGroupId, LedgerName, CreatedOn, CreatedBy, IsActive) 
					values(@LedgerGroupId, @NewLedgerName, GETDATE(), 1, 1)
					
					 set @LedgerId = (select  LedgerId from ACC_Ledger where LedgerName= @NewLedgerName)
					--add mapping table entry for newly created ledger

					insert into acc_bill_ledgermapping(ServiceDepartmentId, ItemId, LedgerId) values(@ServiceDepartmentId,@ItemId,@LedgerId)
				
				End			
		END
	return @LedgerId
	End
	GO

--Trigger on Bil_TXN_BilingTransactionItems  : add Some variables and chane ServDepName & IteamName to ID
/****** Object:  Trigger [dbo].[TRG_BillToAcc_BillingTxnItem]    Script Date: 10-01-2020 10:13:55 AM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TRIGGER [dbo].[TRG_BillToAcc_BillingTxnItem_Updated]
	   ON [dbo].[BIL_TXN_BillingTransactionItems]
	   AFTER INSERT,UPDATE
	AS
	/* 
	Change History
	=======================================================
	S.No.	UpdatedBy/Date              Remarks
	=======================================================
	1		Ramavtar/2018-10-29			created the script
	2       Salakha/2018-11-23          Changed function for accounting
	3		Ajay/2019-01-17				getting transaction date as per transaction type
	4		Ashish 10th Jan				updated trigger for map accounting ledger with billing service dept, and items.
										using this trigger we are removing hardcoded mapping 
	=======================================================
	*/
	BEGIN
		-- This updated trigger and sp use in new hospital or migrated data from old hospital for mapping ledger with billing service department and item.
	  IF(0=1)  
	  BEGIN
		--ignoring provisional records
		IF (SELECT BillingTransactionId FROM inserted) IS NOT NULL
		BEGIN
			--Declare Variables
			DECLARE @PaymentMode varchar(20), @ReportingDeptName varchar(100),@LedgerId int ,@ServiceDepartmentId int ,@ItemId int 

			--Initializing
			SET @PaymentMode = (SELECT PaymentMode FROM BIL_TXN_BillingTransaction WHERE BillingTransactionId = (SELECT BillingTransactionId FROM inserted))		
			
			set @ServiceDepartmentId= (SELECT ServiceDepartmentId  FROM inserted)
			set @ItemId =(SELECT ItemId FROM inserted)
			EXEC @LedgerId = SP_ACC_GetIncomeLedgerName_Updated @ServiceDepartmentId,@ItemId
			SET @ReportingDeptName = (SELECT LedgerName from ACC_Ledger where LedgerId=@LedgerId)
			--Inserting Values
			INSERT INTO BIL_SYNC_BillingAccounting 
				(ReferenceId, ReferenceModelName, ServiceDepartmentId, ItemId, PatientId,
				 TransactionType, PaymentMode, SubTotal, TaxAmount, DiscountAmount, TotalAmount,IncomeLedgerName,TransactionDate,CreatedOn,CreatedBy)
			VALUES 
			(
				(SELECT BillingTransactionItemId FROM inserted),		--ReferenceId
				'BillingTransactionItem',								--ReferenceModelName
				(SELECT ServiceDepartmentId FROM inserted),				--ServiceDepartmentId
				(SELECT ItemId FROM inserted),							--ItemId
				(SELECT PatientId FROM inserted),						--PatientId
				(SELECT 
					CASE
						WHEN ReturnStatus IS NULL AND BillStatus = 'paid' AND @PaymentMode = 'credit' THEN 'CreditBillPaid'
						WHEN ReturnStatus IS NULL AND BillStatus = 'paid' AND @PaymentMode != 'credit' THEN 'CashBill'
						WHEN ReturnStatus IS NULL AND BillStatus = 'unpaid' THEN 'CreditBill'
						WHEN ReturnStatus IS NOT NULL AND  BillStatus = 'paid' THEN 'CashBillReturn'
						WHEN ReturnStatus IS NOT NULL AND  BillStatus = 'unpaid' THEN 'CreditBillReturn'
					END FROM inserted),									--TransactionType
				@PaymentMode,											--PaymentMode
				(SELECT SubTotal FROM inserted),						--SubTotal
				(SELECT Tax FROM inserted),								--TaxAmount
				(SELECT DiscountAmount FROM inserted),					--DiscountAmount
				(SELECT TotalAmount FROM inserted),						--TotalAmount
				@ReportingDeptName ,
				(SELECT
					CASE
						WHEN ReturnStatus IS NULL AND BillStatus = 'paid' AND @PaymentMode = 'credit' THEN PaidDate		--CreditBillPaid
						WHEN ReturnStatus IS NULL AND BillStatus = 'paid' AND @PaymentMode != 'credit' THEN PaidDate	--CashBill
						WHEN ReturnStatus IS NULL AND BillStatus = 'unpaid' THEN CreatedOn								--CreditBill
						--for CashBillReturn, CreditBillReturn cases getting current date 
						--this is only for return case
						WHEN ReturnStatus IS NOT NULL AND  BillStatus = 'paid' THEN GETDATE()							--CashBillReturn
						WHEN ReturnStatus IS NOT NULL AND  BillStatus = 'unpaid' THEN GETDATE()							--CreditBillReturn
					END FROM inserted),									--TransactionDate					---Ajay: 17Jan'19 getting date as per transaction type
				GETDATE(),
				(SELECT CreatedBy FROM inserted)
			)
	
		END
	 END
	
	END
	GO
	--End TRG--
--END :Ashish : 10th Jan 2020 : Script for Create table, stored procedure, and modify function.


--START: Vikas : 10th Jan 2020: Modify Function for user collection report
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Salakha
-- Create date: 26/08/2019
-- Description:	calculates daily sales for pharmacy
-- =============================================

/* Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh/Abhishek 2nd Sept 2019          Credit logic, credit return logic optimized 
2		Vikas	10th Jan 2020				   Credit sales, and credit received query modified.
					
--------------------------------------------------------

*/
ALTER FUNCTION [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]
(@FromDate Date, @ToDate Date)
RETURNS TABLE

AS
RETURN
(

		SELECT * FROM 
		(
				--Cash Invoices (Same Day)--
				Select   Convert(Date,CreateOn) 'Date', 
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 'CashInvoice' AS 'TransactionType',
						 SubTotal,
						 DiscountAmount,
						 VATAmount,
						  TotalAmount, 
						 TotalAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS CreditReceived,  0 AS 'CreditAmount',
						 CounterId, CreatedBy 'EmployeeId',Remark 'Remarks',  1 as DisplaySeq
				from PHRM_TXN_Invoice
				Where PaymentMode ='cash' and Convert(Date,CreateOn) = Convert(Date,CreateOn)

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreateOn) 'Date', 
					  	 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						Patientid,
					  'CreditInvoice' AS 'TransactionType',
					   SubTotal,DiscountAmount,TotalAmount,VATAmount, 
					   0 AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						0 AS 'CreditReceived',TotalAmount  AS 'CreditAmount',
					   CounterId, CreatedBy 'EmployeeId',Remark 'Remarks', 2 as DisplaySeq 
				FROM PHRM_TXN_Invoice
				WHERE (PaymentMode = 'credit' and BilStatus='unpaid') 
				--and(Convert(Date,CreateOn) = Convert(Date,CreateOn))  --VIKAS:10th Jan 2020

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						'CreditInvoiceReceived' AS 'TransactionType',
						0 AS SubTotal, 0 AS DiscountAmount, 0 AS VATAmount,  0 AS TotalAmount, 
					  TotalAmount AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						TotalAmount AS 'CreditReceived',  0  AS 'CreditAmount',
					  CounterId AS 'CounterId', CreatedBy AS 'EmployeeId', Remark 'Remarks', 3 as DisplaySeq 
				from PHRM_TXN_Invoice
				Where (PaymentMode='credit'and BilStatus='paid')  
				--and Convert(Date,PaidDate) != Convert(Date,CreditDate) --VIKAS:10th Jan 2020

				UNION ALL
				--Cash Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						  txn.PatientId,
						 'CashInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (-ret.TotalAmount) AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund',
						  0 AS 'CreditReceived', 0 AS 'CreditAmount',
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 4 as DisplaySeq 
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where (ret.InvoiceId=txn.InvoiceId and txn.PaymentMode='cash') or (ret.InvoiceId=txn.InvoiceId and 
				txn.PaymentMode='credit' and txn.settlementId is not null)
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date', 
					 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						   txn.PatientId,
						 'CreditInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', (-txn.DiscountAmount) 'DiscountAmount', (-txn.VATAmount) 'VATAmount', (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  0 AS 'DepositReceived', 0 AS 'DepositRefund',
						 0 AS 'CreditReceived', (-ret.TotalAmount) 'CreditAmount',
				 
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				   and txn.PaymentMode='credit' and settlementId is null
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
) -- end of return

GO

--END: Vikas : 10th Jan 2020: Modify Function for user collection report

-- START : Bikash 12th Jan 2020: Genric Name Surgical removed from pharmacy expiry report

GO
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_ExpiryReport]    Script Date: 1/14/2020 4:56:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-------------------------------------------------------------------------------------

ALTER PROCEDURE [dbo].[SP_PHRMReport_ExpiryReport]  
		  @ItemName varchar(200) = null
AS
/*
FileName: [SP_PHRMReport_ExpiryReport]
CreatedBy/date: Abhishek/2018-05-06
Description: To get the Expired Products Details Such As ItemName, ItemCode, AvailableQty,ExpiryDate,BatchNo of Each Item Selected By User Datewise
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/04-03-2019						Updated INOUT Quantity
2.		Vikas/07-06-2019						update table name, get data from PHRM_DispensaryStock table
3.      Naveed/13-12-2019                       Convert Expiry Date to varchar for showing well format date while Export
4.		Bikash/12-01-2020						items with generic name as surgical removed.
----------------------------------------------------------------------------
*/
Begin 
	IF (@ItemName !='0')
	BEGIN
		Select (Cast(ROW_NUMBER() OVER (ORDER BY  x.ItemName)  as int)) as SN, 
		x.ItemId, x.BatchNo, x.ItemName, convert(varchar, x.ExpiryDate,23) as ExpiryDate, x.MRP, x.GenericName,
		x.AvailableQuantity as 'Qty'
		--Sum(FQty+ InQty-OutQty-FQtyOut) 'Qty'
		From 
				
				(select 
					t1.ItemId,t1.BatchNo,t1.ExpiryDate,t1.MRP,item.ItemName,generic.GenericName,t1.AvailableQuantity
					from PHRM_DispensaryStock t1
					inner join [dbo].[PHRM_MST_Item] item on item.ItemId= t1.ItemId
					inner join [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
					where t1.ItemId=cast(@ItemName as int) and t1.ExpiryDate <= DATEADD(MONTH, 3, GETDATE()) AND t1.AvailableQuantity>0 and generic.GenericName not like '%SURGICAL%'
					 group by t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName,t1.AvailableQuantity
				)x 
		END
		
	Else
		BEGIN
		Select (Cast(ROW_NUMBER() OVER (ORDER BY  x.ItemName)  as int)) as SN, 
		x.ItemId, x.BatchNo, x.ItemName, convert(varchar, x.ExpiryDate,23) as ExpiryDate, x.MRP, x.GenericName,
		x.AvailableQuantity as 'Qty'
		--Sum(FQty+ InQty-OutQty-FQtyOut) 'Qty'
		From 
				--(select t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName,
				--    sum(Case when InOut ='in' then FreeQuantity else 0 end ) as 'FQty',
				--	sum(Case when InOut ='out' then FreeQuantity else 0 end ) as 'FQtyOut',
				--	SUM(Case when InOut ='in' then Quantity else 0 end ) as 'InQty',
				--	SUM(Case When InOut = 'out' then Quantity ELSE 0 END) AS 'OutQty'
				--	from [dbo].[PHRM_StockTxnItems] t1
				--		inner join [dbo].[PHRM_MST_Item] item on item.ItemId = t1.ItemId
				--		inner join [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
				--		where  t1.ExpiryDate <= DATEADD(MONTH, 3, GETDATE()) AND t1.Quantity>0
				--		group by t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName
				--		) x 
				--		where x.ItemName  like '%'+ISNULL(@ItemName,'')+'%'  
				--		Group By x.ItemId, x.BatchNo, x.ItemName,x.ExpiryDate,x.MRP, x.GenericName
						
				(select 
					t1.ItemId,t1.BatchNo,t1.ExpiryDate,t1.MRP,item.ItemName,generic.GenericName,t1.AvailableQuantity
					from PHRM_DispensaryStock t1
					inner join [dbo].[PHRM_MST_Item] item on item.ItemId= t1.ItemId
					inner join [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
					where  t1.ExpiryDate <= DATEADD(MONTH, 3, GETDATE()) AND t1.AvailableQuantity>0 and generic.GenericName not like '%SURGICAL%'
					 group by t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName,t1.AvailableQuantity
				)x 
		END
END

Go
-- END : Bikash 12th Jan 2020: Genric Name Surgical removed from pharmacy expiry report

--START: Ashish: 14 Jan 2020: changes for pharmacy cash collection report get settlement cash and avoide credit sale amount 
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_CashCollectionSummaryReport]  --- [SP_PHRM_CashCollectionSummaryReport] 
@FromDate datetime=null,
 @ToDate datetime=null
 AS
 /*
FileName: [[SP_PHRM_CashCollectionSummaryReport]]
CreatedBy/date: Dinesh 2nd Sept 2019 
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh 2nd Sept 2019                   created the script
2		Ashish 14th Jan 2019				fixx bug Provisional credit invoice amount showing  --if transaction is Provisional and paymenttype is credit then entry into settlement tbl  		
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
	select [Date], UserName, sum(TotalAmount) as TotalAmount, sum(ReturnAmount) as ReturnedAmount, sum(TotalAmount-ReturnAmount) as NetAmount, sum(DiscountAmount) as DiscountAmount
	from ( 
          SELECT convert(date,inv.CreateOn) as [Date] ,usr.UserName,sum(inv.PaidAmount)as TotalAmount, 0 as ReturnAmount,sum(inv.DiscountAmount) as DiscountAmount
            FROM [PHRM_TXN_Invoice] inv
              INNER JOIN RBAC_User usr
             on inv.CreatedBy=usr.EmployeeId          
              where  (convert(datetime, inv.CreateOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 ) and PaymentMode !='credit' and SettlementId is null
              group by convert(date,inv.createon),UserName
			  
			 
			  union all 
			    SELECT convert(date,stl.CreatedOn) as [Date] ,usr.UserName,sum(stl.PayableAmount)as TotalAmount, 0 as ReturnAmount,sum(stl.DiscountAmount) as DiscountAmount
            FROM [PHRM_TXN_Settlement] stl
              INNER JOIN RBAC_User usr
             on stl.CreatedBy=usr.EmployeeId          
              where  (convert(datetime, stl.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 ) 
              group by convert(date,stl.CreatedOn),UserName
			  
			  union all
			  select convert(date,invRet.CreatedOn) as [Date], usr.UserName, 0 as TotalAmount,sum(invRet.TotalAmount ) as ReturnAmount,  sum(-(invRet.DiscountPercentage/100)*invRet.SubTotal ) as DiscountPercentage
			  From[PHRM_TXN_InvoiceReturnItems] invRet
			  INNER JOIN RBAC_User usr
			  on invRet.CreatedBy = usr.EmployeeId
			  where convert(datetime, invRet.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and invRet.InvoiceId is not null
			  group by convert(date,invRet.CreatedOn),UserName
			  )	  tabletotal
			  Group BY [Date], UserName
      End
End
GO
--END: Ashish: 14 Jan 2020: changes for pharmacy cash collection report get settlement cash and avoide credit sale amount--

-- Start: -pratik: jan15 2020--for doctor list filter on item change

alter table BIL_CFG_BILLitemprice
    Add  DefaultDoctorList varchar(2000)
GO
--End: -Pratik: jan15 2020--for doctor list filter on item change

--- START:Vikas : 15th jan 2020: script for server side search enable disable property
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Common','ServerSideSearchComponent',
 '{ "PatientSearchPatient":true,"LaboratoryFinalReports":true, "BillingSearchPatient":true,
	"NursingInPatient":true, "NursingOutPatient":false,"VisitList":true,"BillingDuplicatePrint":true,
	"BillingEditDoctor":true,"BillingProvisional":true }'
,'JSON','Enable or Disable server side searching in component','custom');
Go
--- END:Vikas : 15th jan 2020: script for server side search enable disable property




--Anish: Start: 14 Jan, 2020, Query String to fetch all the Lab Items in WardBilling Made Dynamic--
Insert Into CORE_CFG_Parameters 
(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
Values ('LAB','LabDepartmentNameInQuery','pathology','string','Query String Parameter Used In DepartmentName of Lab to fetch all the Lab Items','custom');
Go
Alter table ER_Patient
Add CareOfPersonContactNumber varchar(20);
Go
Insert Into CORE_CFG_Parameters 
(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
Values ('Emergency','ERDepartmentAndDutyDoctor','{"DepartmentName":"EMERGENCY/CASUALTY","ERDutyDoctorFirstName":"Duty"}','string','Department Name of ER for diff. hospital and their duty doctor','custom');
Go
----Anish: End: 14 Jan, 2020,  Query String to fetch all the Lab Items in WardBilling Made Dynamic--

--Anish:Start 15 Jan, 2020, ModeOfArrival Table for ER Registration--
Create table ER_ModeOfArrival(
	ModeOfArrivalId int Identity(1,1) constraint PK_ModeOfArrival Primary Key not null,
	ModeOfArrivalName varchar(100),
	IsActive bit null,
	CreatedBy int null,
	CreatedOn datetime null,
	ModifiedBy int null,
	ModifiedOn datetime null
);
Go

Alter table ER_Patient
Alter Column ModeOfArrival Int null;
Go

ALTER TABLE ER_Patient  WITH CHECK ADD  CONSTRAINT [FK_ER_Pat_ModeOfArrival] FOREIGN KEY (ModeOfArrival)
REFERENCES ER_ModeOfArrival (ModeOfArrivalId)
GO
--Anish:End 15 Jan, 2020, ModeOfArrival Table for ER Registration--

-- Start: -pratik: jan15 2020--
Insert into CORE_CFG_Parameters
values('ADT','IsCareOfPersonContactNoMandatory','false','boolean','true/false. Whether or not contact number of Care-Of Person is compulsory during new Admission. Default is false','custom');
Go

-- End: -pratik: jan15 2020--

---Start: pratik: 16th jan 2020:--- user collection report--

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DailySales]    Script Date: 1/16/2020 6:11:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-11-29','2018-11-29',null,null,1
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null,
		@IsInsurance bit=0
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: To Get Sales + Cash Collection details from Invoice and Deposits table between given range. 
Remarks: Deposits are returned as it is for IsInsurance=1 as well since it's independent of sales, <Needs Revision>
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
4.      Sud/15Feb'19                           Format Revised, getting sales summary from a function and then union with Deposit transactions.
5.      Sud/7Aug'19                            Added Filter for IsInsurance
6.      Sud/16Jan'20                           Changed for UserName filter not working because of Salutation
-----------------------------------------------------------------------------------------
*/
BEGIN

 IF (@FromDate IS NOT NULL)
  OR (@ToDate IS NOT NULL)
BEGIN
	
	--Table:1 - For Usercollection Details---
	 --Return Columns: BillingDate, ReceiptNo, HospitalNo, patientName, BillingType, SubTotal, DiscountAmount, 
	 --TaxTotal, TotalAmount, CashCollection, DepositReceived, DepositRefund, CreditReceived,CreditAmount, CounterId, EmployeeId, Remarks, User (CreatedBy)

   SELECT
			bills.BillingDate,
			bills.InvoiceNo 'ReceiptNo',
			pat.PatientCode 'HospitalNo',
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			bills.BillingType 'BillingType',
			bills.SubTotal,
			bills.DiscountAmount,
			bills.TaxTotal,
			bills.TotalAmount, 
			bills.CashCollection, 
			bills.DepositReceived,
			bills.DepositRefund,
			bills.CreditReceived,
			bills.CreditAmount,
			bills.CounterId, 
			bills.[EmployeeId],
			bills.Remarks,
			emp.FullName AS CreatedBy
			--emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy

		FROM (
					Select * from FN_BILL_BillingTxnSegregation_ByBillingType_DailySales(@FromDate,@ToDate)
					WHERE ISNULL(IsInsuranceBilling,0) = @IsInsurance
	    
					UNION ALL

					--All Deposits Transactions---
					Select   Convert(Date,CreatedOn) 'BillingDate', 
							 'DR'+Convert(varchar(20),ISNULL(ReceiptNo,'')) 'InvoiceNo', 
							 Patientid,
							 CASE WHEN DepositType='Deposit' THEN 'AdvanceReceived' 
								WHEN DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN 'AdvanceSettled' END AS 'BillingType',
			
							 0 As SubTotal,0 AS DiscountAmount,0 AS TaxTotal, 0 AS TotalAmount, 
							 CASE WHEN DepositType='Deposit' THEN Amount WHEN DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN (-Amount) END AS 'CashCollection',
							  CASE WHEN DepositType='Deposit' THEN Amount ELSE 0 END AS 'DepositReceived',
							CASE WHEN  DepositType='depositdeduct' OR DepositType='ReturnDeposit' THEN Amount ELSE 0 END AS 'DepositRefund'
						   
							 , 0 AS CreditReceived,  0 AS 'CreditAmount',
							 CounterId 'CounterId', CreatedBy 'EmployeeId', Remarks, 0 AS IsInsuranceBilling, 6 as DisplaySeq 
					from BIL_TXN_Deposit
					WHERE COnvert(Date,CreatedOn) BETWEEN @FromDate and @ToDate	


			) bills,


		EMP_Employee emp,
		PAT_Patient pat,
		BIL_CFG_Counter cntr
		WHERE bills.PatientId = pat.PatientId
				AND emp.EmployeeId = bills.EmployeeId
				AND bills.CounterId = cntr.CounterId

				AND (bills.CounterId LIKE '%' + ISNULL(@CounterId, bills.CounterId) + '%')
				AND emp.FullName like '%'+ISNULL(@CreatedBy,emp.FullName)+'%'  -- updated sud: 16Jan'20
		        --AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
		
       Order by bills.DisplaySeq


   --Table2: For Settlement Details, needed Discount and DueAmount for UserCollection-Cash Collection fields.
   --We Only need collective amount for Settlement Amounts.
	 Select 
	        sett.CreatedBy 'EmployeeId',
			Sett.CounterId,
			emp.FullName,
			--emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			 --Case When sett.PayableAmount > 0 then PayableAmount - ( DepositDeducted + ISNULL(DiscountAmount,0) + ISNULL(DueAmount,0)) ELSE 0 END AS PaidAmount, 
			SUM(Case When sett.PayableAmount > 0 then sett.PaidAmount ELSE 0 END) AS 'SettlPaidAmount', 
			SUM( Case WHEN sett.RefundableAmount > 0 THEN sett.ReturnedAmount ELSE 0 END ) AS 'SettlReturnAmount',
			SUM( Case WHEN sett.DueAmount > 0 THEN sett.DueAmount ELSE 0 END ) AS 'SettlDueAmount',
			SUM( Case WHEN  sett.DiscountAmount > 0 THEN sett.DiscountAmount ELSE 0 END  ) 'SettlDiscountAmount'
	from BIL_TXN_Settlements sett, 
	    EMP_Employee emp,
		BIL_CFG_Counter cntr 


	WHERE sett.CreatedBy=emp.EmployeeId
	      AND sett.CounterId=cntr.CounterId
		  AND (sett.CounterId LIKE '%' + ISNULL(@CounterId, sett.CounterId) + '%')
		  AND emp.FullName like '%'+ISNULL(@CreatedBy,emp.FullName)+'%' -- updated sud: 16Jan'20
		  --AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
	      
		  AND Convert(Date,sett.CreatedOn) BETWEEN Convert(Date, @FromDate) AND Convert(Date, @ToDate) 

  Group By sett.CreatedBy, sett.CounterId, emp.FullName -- updated sud: 16Jan'20
   -- Group By sett.CreatedBy, sett.CounterId, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName 

 END -- end of IF

END -- end of SP
GO

---End: pratik: 16th jan 2020:--- user collection report--

---Start: pratik :17 jan2020 --- for item search in billing transaction by itemcode

Insert into CORE_CFG_Parameters
values('Billing','UseItemCodeInItemSearch','false','boolean','True/False. whether or not to enable itemsearch by itemcode, Itemcode is not given by many hospital, so default value will be false, whenever its false we are showing BillItemPriceId.','custom');
Go

---End: pratik :17 jan2020 --- for item search in billing transaction by itemcode

-- START: 17th Jan 2020: VIKAS: Update trigger --
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ajay 06 dec 2018           created the script

=======================================================
*/
ALTER TRIGGER [dbo].[TRG_Update_Ledger]
   ON  [dbo].[ACC_Ledger]
   AFTER INSERT
AS 
BEGIN
	IF((SELECT Name FROM inserted) IS NULL)
	BEGIN
		UPDATE ACC_Ledger
		SET Name=
			(select (select (UPPER(dbo.[FN_ACC_FIRST_LETTER_FROM_WORD] ([PrimaryGroup]))
						+UPPER(dbo.[FN_ACC_FIRST_LETTER_FROM_WORD] ([COA]))
						+'_'
						+UPPER(REPLACE([LedgerGroupName],' ','_')))
				 from ACC_MST_LedgerGroup where LedgerGroupId=(SELECT LedgerGroupId from inserted))
			+'_'
			+UPPER(REPLACE(LedgerName,' ','_'))
			from inserted 
			where LedgerId=(SELECT LedgerId from inserted))
		 where LedgerId=(SELECT LedgerId from inserted)
	
	END
END
GO
-------------

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ajay 05 dec 2018           created the script

=======================================================
*/
ALTER TRIGGER [dbo].[TRG_Update_LedgerGroup]
   ON  [dbo].[ACC_MST_LedgerGroup]
   AFTER INSERT
AS 
BEGIN
	IF((SELECT Name FROM inserted) IS NULL)
		BEGIN
			UPDATE dbo.ACC_MST_LedgerGroup
			SET Name = 
				(select (UPPER(dbo.[FN_ACC_FIRST_LETTER_FROM_WORD] ([PrimaryGroup]))
						+UPPER(dbo.[FN_ACC_FIRST_LETTER_FROM_WORD] ([COA]))
						+'_'
						+UPPER(REPLACE([LedgerGroupName],' ','_')))
				 from inserted where LedgerGroupId=(SELECT LedgerGroupId from inserted))
			where LedgerGroupId=(SELECT LedgerGroupId from inserted)
	    END
END
GO
----------

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_ACC_UpdateMappingDetail]
   ON  [dbo].[ACC_MST_MappingDetail]
   AFTER INSERT
AS 
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ajay 04 FEB 2019          created the script

=======================================================
*/
BEGIN
	IF EXISTS(SELECT * FROM inserted)
	BEGIN
		DECLARE @Id INT=0;
		SELECT @Id=AccountingMappingDetailId FROM inserted
			IF((SELECT Description FROM inserted) IS NULL)
			BEGIN
				UPDATE ACC_MST_MappingDetail
				SET Description=(
					SELECT gm.Description+REPLACE(lg.LedgerGroupName,' ','') FROM ACC_MST_MappingDetail md
					JOIN ACC_MST_GroupMapping gm ON md.GroupMappingId=gm.GroupMappingId
					JOIN ACC_MST_LedgerGroup lg ON md.LedgerGroupId=lg.LedgerGroupId
					WHERE md.AccountingMappingDetailId=@Id AND md.Description IS NULL)
				WHERE AccountingMappingDetailId=@Id AND Description IS NULL
			END
	END
END
GO
-------------

-- END: 17th Jan 2020: VIKAS: Update trigger 
----START: Ashish: 17 Jan 2020: changes for  CustomVoucher-(for HAMS) and normal Voucher for other Hospital 
------add new clm Code 
ALTER TABLE [ACC_Ledger] ADD Code VARCHAR(200);
GO

-----drop tbl 
DROP TABLE [dbo].[ACC_MST_AccountingReports]
GO

-------add CustomVoucherId column in [ACC_MST_GroupMapping]
ALTER TABLE [ACC_MST_GroupMapping] ADD CustomVoucherId INT;
GO

------insert one record in parameter table for Accounting->CustomeSaleVoucher   true/false  
INSERT INTO [CORE_CFG_Parameters] (
	ParameterGroupName
	,ParameterName
	,ParameterValue
	,ValueDataType
	,Description
	,ParameterType
	)
VALUES (
	'Accounting'
	,'CustomSaleVoucher'
	,'true'
	,'boolean'
	,'if this value is true then take customvoucherId for transfer,map billing pharmacy 
and Inventory in accounting custom voucher is requirements from HAMS. Where we payment and recitevoucher saving as seles voucher when deposit add and deposit return'
	,'custom'
	);
GO

------add Code column in ACC_MST_LedgerGroup
ALTER TABLE [ACC_MST_LedgerGroup] ADD Code VARCHAR(200);
GO

-------ADD ISCUSTOMVOUCHER DEFALTE FALSE  into [ACC_Transactions]
ALTER TABLE [ACC_Transactions] ADD IsCustomVoucher BIT DEFAULT 0 NOT NULL;
GO

-------copy data from VoucherId to CumtomVoucherid 
UPDATE a
SET a.CustomVoucherId = b.VoucherId
FROM [ACC_MST_GroupMapping] a
INNER JOIN [ACC_MST_GroupMapping] b ON a.GroupMappingId = b.GroupMappingId
GO

----------set VoucherId as per ACC_MST_VouchersVoucher tbl
UPDATE ACC_MST_GroupMapping
SET VoucherId = (
		SELECT VoucherId
		FROM ACC_MST_Vouchers
		WHERE VoucherName = 'Receipt Voucher'
			AND VoucherCode = 'RV'
		)
WHERE Description = 'DepositAdd'
GO

UPDATE ACC_MST_GroupMapping
SET VoucherId = (
		SELECT VoucherId
		FROM ACC_MST_Vouchers
		WHERE VoucherName = 'Payment Voucher'
			AND VoucherCode = 'PMTV'
		)
WHERE Description = 'DepositReturn'
GO

-------END:Ashish: 17 Jan 2020: changes for  CustomVoucher-(for HAMS) and normal Voucher for other Hospital 

--START:Sanjit: 22 Jan 2020 - Date format correction in Purchase Report Inventory
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_Purchase]    Script Date: 1/22/2020 12:00:32 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:    <Author,,Name>
-- Create date: <Create Date,,>
-- Description:  <Description,,>
-- Shankar/2019-09-16  Edited script for IsCancel
-- Sanjit/2020-01-22   Date Format change
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_Inventory_Purchase]

AS
BEGIN

      BEGIN
            select itm.ItemName, vendor.VendorName,vendor.ContactNo,  FORMAT (pitms.CreatedOn, 'dd MMM yyyy, hh:mm tt ') as CreatedOn,(gitms.ReceivedQuantity + gitms.FreeQuantity) TotalQuantity,pitms.StandardRate, PO.TotalAmount,gr.Discount
 from INV_TXN_GoodsReceipt gr   
 join INV_TXN_GoodsReceiptItems gitms on gitms.GoodsReceiptId = gr.GoodsReceiptId
 join INV_TXN_PurchaseOrderItems pitms on pitms.PurchaseOrderId = gr.PurchaseOrderId 
 join INV_MST_Item itm on gitms.ItemId = itm.ItemId
 join INV_TXN_PurchaseOrder PO on PO.PurchaseOrderId = pitms.PurchaseOrderId
 join INV_MST_Vendor vendor on vendor.VendorId = gr.VendorId
 where gitms.ItemId = pitms.ItemId AND gr.IsCancel = 0
 order by gr.PurchaseOrderId desc

        END
END
GO
--END:Sanjit: 22 Jan 2020 - Date format correction in Purchase Report Inventory


--Start: Narayan 22nd Jan : Added age and CountryName field
/****** Object:  StoredProcedure [dbo].[SP_APPT_GetPatientVisitStickerInfo]    Script Date: 01/21/2020 17:15:22 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_APPT_GetPatientVisitStickerInfo]  --- SP_APPT_GetPatientVisitStickerInfo 76
    
@PatientVisitId INT=null
AS
/*
FileName: SP_APPT_GetPatientVisitStickerInfo
CreatedBy/date: Yubraj / 2019-06-23
Description: Get patient's current visit details. 

Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      Yubraj/23rd June'19                     Created.
2.       Narayan/21st Jan'20                     added CountrName and Age
-----------------------------------------------------------------------------------------
*/
BEGIN
select 
  visit.AppointmentType 'AppointmentType',
  visit.VisitType 'VisitType',
  visit.VisitCode 'VisitCode',
  visit.ProviderName 'DoctorName',
  visit.VisitDate 'VisitDate',
  visit.VisitTime 'VisitTime',
  CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) 'PatientName',
  pat.PatientCode 'PatientCode',
  pat.DateOfBirth 'DateOfBrith',
  pat.Gender 'Gender',
  pat.Address 'Address',
  pat.Age 'Age',
  pat.PhoneNumber 'PhoneNumber',
  subCounty.CountrySubDivisionName 'District',
  dep.DepartmentName 'Department',
  doc.RoomNo 'RoomNo',
  usr.UserName 'User',
  cnty.CountryName 'CountryName',
  bilTxnItms.ServiceDepartmentName,
  ISNULL(bilTxnItms.TotalAmount,0) 'OpdTicketCharge'
   
  from PAT_PatientVisits visit join PAT_Patient pat on pat.PatientId=visit.PatientId
            join MST_CountrySubDivision subCounty on subCounty.CountrySubDivisionId=pat.CountrySubDivisionId
            join MST_Department dep on dep.DepartmentId= visit.DepartmentId
            join RBAC_User usr on usr.EmployeeId=visit.CreatedBy
            join MST_Country cnty on cnty.CountryId = pat.CountryId
            left join EMP_Employee doc on doc.EmployeeId=visit.ProviderId

            left join (Select * from BIL_TXN_BillingTransactionItems where PatientVisitId=@PatientVisitId
                           and ServiceDepartmentName IN ('OPD'
                                   , 'Department OPD'
                                   ,'Department Followup Charges'
                                   ,'Doctor Followup Charges'
                                   ,'Department OPD Old Patient'
                                   ,'Doctor OPD Old Patient')) bilTxnItms  
                              on  visit.PatientVisitId = bilTxnItms.PatientVisitId        

            where visit.PatientVisitId=@PatientVisitId 
            
END 
GO
--End : Narayan 22nd Jan :Added age and CountryName field

-----Start: Sanjit: 22 Jan 2020: Added Core CFG Parameters for showing Provider Name in Billing Receipt
INSERT INTO [dbo].[CORE_CFG_Parameters]
           ([ParameterGroupName]
           ,[ParameterName]
           ,[ParameterValue]
           ,[ValueDataType]
           ,[Description]
           ,[ParameterType])
     VALUES
           ('Bill Print'
           ,'ShowAssignedDoctorInReceipt'
           ,'true'
           ,'boolean'
           ,'To show the assigned to doctore in billing receipt'
           ,'custom')
GO
-----END: Sanjit: 22 Jan 2020: Added Core CFG Parameters for showing Provider Name in Billing Receipt
 

--START: NageshBB: 22 Jan 2020: Updated section list of accounting for Manual Voucher entry
update CORE_CFG_Parameters set ParameterValue='{"SectionList":[{ "SectionId": 1, "SectionName": "Inventory" }, { "SectionId": 2, "SectionName": "Billing" },{ "SectionId": 3, "SectionName": "Pharmacy" },{ "SectionId": 4, "SectionName": "Manual_Voucher" }]}'
where ParameterGroupName='accounting' and ParameterName='SectionList'
Go
--END: NageshBB: 22 Jan 2020: Updated section list of accounting for Manual Voucher entry


<<<<<<<<< Temporary merge branch 1
--START: Ashish: 27 Jan 2020:changes for  Add CC Charge charge in  setting of pharmacy 
--Add CC Charge clm in PHRM_MST_Item tbl 
ALTER TABLE [PHRM_MST_Item]
ADD CCCharge float NULL;
Go
--set  default CC Charge value as '7.5'
Insert into CORE_CFG_Parameters
values('Pharmacy','PharmacyCCCharge','7.5','string','default CC Charges for pharmacy items','custom');
Go
--END: Ashish: 27 Jan 2020 changes for  Add CC Charge in setting of pharmacy 

--Anish: Starts: 28 Jan, SQL for Bed Reservation from ER--
Alter table ADT_Bed
Add IsReserved bit null;
Go
Insert into CORE_CFG_Parameters
values('ADT','TimeBufferForReservation','{"minutes":30,"days":10}','json','Days and months upto which ADT bed reservation is possible','custom');
Go
Create table ADT_BedReservation(
  ReservedBedInfoId int Identity(1,1) Constraint ReservedBedInfoId Primary Key  Not Null,
  PatientId int,
  PatientVisitId int,
  RequestingDepartmentId int,
  AdmittingDoctorId int,
  WardId int,
  BedFeatureId int,
  BedId int,
  AdmissionStartsOn datetime,
  AdmissionNotes varchar(1000),
  ReservedOn datetime,
  ReservedBy int,
  CreatedBy int,
  CreatedOn datetime,
  ModifiedBy int  null,
  ModifiedOn datetime  null,
  CancelledBy int null,
  CancelledOn datetime null,
  IsActive bit
);
Go
--Anish: End: 28 Jan, SQL for Bed Reservation from ER--

--Anish: Start: 30Jan, SQL query making fields of Reservation not null--
Alter table [dbo].[ADT_BedReservation]
Alter column PatientId int not null;
Go
Alter table [dbo].[ADT_BedReservation]
Alter column BedId int not null;
Go
Alter table [dbo].[ADT_BedReservation]
Alter column IsActive bit not null;
Go
Alter table [dbo].[ADT_BedReservation]
Alter column WardId int not null;
Go
Alter table [dbo].[ADT_BedReservation]
Alter column BedFeatureId int not null;
Go
Alter table [dbo].[ADT_BedReservation]
Alter column AdmissionStartsOn datetime not null;
Go
--Anish: End: 30Jan, SQL query making fields of Reservation not null--

--Anish: Start: 30Jan, Parameter for auto cancellation of bed Reservation--
Alter table ADT_BedReservation
Add IsAutoCancelled bit null;
Go
Insert into CORE_CFG_Parameters
values('ADT','MinutesBeforeAutoCancelOfReservedBed','60','number','Minutes before which patient should be admitted, before reserved bed gets auto cancelled','custom');
Go
Alter table ADT_BedReservation
Add AutoCancelledOn DateTime null;
Go
--Anish: End: 30Jan, Parameter for auto cancellation of bed Reservation--


--END: Ashish: 27 Jan 2020 changes for  Add CC Charge in setting of pharmacy -------

--- Start: 28th Jan, 2020: For Button Level Authorization in ADT Module
SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'transfer-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'sticker-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'change-doctor-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'change-bed-feature-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'bill-history-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'cancel-admission-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'print-wristband-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'admit-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'generic-sticker-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission OFF
GO
--- End: 28th Jan, 2020: For Button Level Authorization in ADT Module

-- START: Vikas :28th Jan 2020: Created sp for vendor transaction more than 100000 and their details --

/*
FileName: [SP_Report_Inventory_VendorTransactionReport]
CreatedBy/date: 
Description: 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      	Vikas:28th Jan 2020					Create script for vendor transaction more than 100000

--------------------------------------------------------
*/
CREATE PROCEDURE [dbo].[SP_Report_Inventory_VendorTransactionReport]
@fiscalYearId int = null,
@VendorId int = null
AS
BEGIN
	Select 
		FiscalYearId,
		VendorId,
		SUM(A.SubTotal) as 'SubTotal',
		SUM(A.VATTotal) as 'VATTotal',
		SUM(A.DiscountAmount) as 'DiscountAmount',
		SUM(A.TotalAmount) as 'TotalAmount'
	 from (
				select
						fs.FiscalYearName,
						fs.FiscalYearId,
						ved.VendorId,
						(gd.SubTotal) as 'SubTotal',
						(gd.VATTotal) as 'VATTotal',
						(gd.DiscountAmount) as 'DiscountAmount',
						(gd.TotalAmount) as 'TotalAmount',
						'gr_sale' as 'TxnType'
					from INV_TXN_GoodsReceipt gd 
						left join BIL_CFG_FiscalYears fs on fs.FiscalYearId = @fiscalYearId
						left join INV_MST_Vendor ved on gd.VendorId = ved.VendorId 
					where  
						gd.CreatedOn>Convert(date,fs.StartYear) and gd.CreatedOn<Convert(date,fs.EndYear)
						and gd.IsCancel = 0 
				  UNION ALL

						select 
								fs.FiscalYearName,
								fs.FiscalYearId,
								ret.VendorId,
								-(ret.TotalAmount + (gritm.DiscountAmount/gritm.ReceivedQuantity * ret.Quantity )) as 'SubTotal',								 
								-(gritm.VATAmount/gritm.ReceivedQuantity * ret.Quantity) as 'VatAmount',
								-(gritm.DiscountAmount/gritm.ReceivedQuantity * ret.Quantity ) as 'DiscountAmount',								 
								-ret.TotalAmount as 'TotalAmount',
								'gr_return' as 'TxnType'
						from INV_TXN_ReturnToVendorItems ret
						join INV_TXN_GoodsReceiptItems gritm on  ret.GoodsReceiptItemId = gritm.GoodsReceiptItemId 
						left join BIL_CFG_FiscalYears fs on fs.FiscalYearId =@fiscalYearId
					where
						ret.CreatedOn>Convert(date,fs.StartYear) and ret.CreatedOn<Convert(date,fs.EndYear)	
				

	) A
	where  (A.TotalAmount>= 100000) and (VendorId = @VendorId OR ISNULL(@VendorId, '') = '')	
	group by FiscalYearId,VendorId 
END
GO

/*
FileName: [SP_Report_Inventory_VendorTransactionDetails]
CreatedBy/date: 
Description: 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      	Vikas:28th Jan 2020					Details transaction script for vendor transaction more than 100000	

--------------------------------------------------------
*/
Create PROCEDURE [dbo].[SP_Report_Inventory_VendorTransactionDetails]
@fiscalYearId int = null,
@VendorId int = null
AS
BEGIN

	Select 
		VendorId,		
		ItemId,
		ItemName,
		SUM(A.SubTotal) as 'Sales_SubTotal',
		SUM(A.VATTotal) as 'Sales_VatAmount',
		SUM(A.DiscountAmount) as 'Sales_DiscountAmount',
		SUM(A.TotalAmount) as 'Sales_TotalAmount',

		SUM(A.Ret_SubTotal) as 'Ret_SubTotal',
		SUM(A.Ret_VATTotal) as 'Ret_VATTotal',
		SUM(A.Ret_DiscountAmount) as 'Ret_DiscountAmount',
		SUM(A.Ret_TotalAmount) as 'Ret_TotalAmount',
		(SUM(A.TotalAmount)-SUM(A.Ret_TotalAmount)) as 'Total'

	 from (
				select
						ved.VendorId,
						item.ItemName,
						item.ItemId,
						(gd.SubTotal) as 'SubTotal',
						(gd.VATTotal) as 'VATTotal',
						(gd.DiscountAmount) as 'DiscountAmount',
						(gd.TotalAmount) as 'TotalAmount',

						0 as 'Ret_SubTotal',
						0 as 'Ret_VATTotal',
						0 as 'Ret_DiscountAmount',
						0 as 'Ret_TotalAmount'

					from INV_TXN_GoodsReceipt gd 
						left join BIL_CFG_FiscalYears fs on fs.FiscalYearId = @fiscalYearId
						left join INV_MST_Vendor ved on gd.VendorId = ved.VendorId 
						left join INV_TXN_GoodsReceiptItems gritem on gd.GoodsReceiptID= gritem.GoodsReceiptId
						left join INV_MST_Item item on gritem.ItemId = item.ItemId	
					where  
						gd.CreatedOn>Convert(date,fs.StartYear) and gd.CreatedOn<Convert(date,fs.EndYear)
						and gd.IsCancel = 0 
						and (gritem.GoodsReceiptItemId not in (select GoodsReceiptItemId from INV_TXN_ReturnToVendorItems))

				  UNION ALL
						select 
								ret.VendorId,
								item.ItemName,
								item.ItemId,
								0 as 'SubTotal',
								0 as 'VATTotal',
								0 as 'DiscountAmount',
								0 as 'TotalAmount',
								((ret.TotalAmount + (gritm.DiscountAmount/gritm.ReceivedQuantity * ret.Quantity ))) as 'Ret_SubTotal',								 
								((gritm.VATAmount/gritm.ReceivedQuantity * ret.Quantity)) as 'Ret_VATTotal',
								((gritm.DiscountAmount/gritm.ReceivedQuantity * ret.Quantity )) as 'Ret_DiscountAmount',								 
								(ret.TotalAmount) as 'Ret_TotalAmount'
						from INV_TXN_ReturnToVendorItems ret
						join INV_TXN_GoodsReceiptItems gritm on  ret.GoodsReceiptItemId = gritm.GoodsReceiptItemId 
						left join BIL_CFG_FiscalYears fs on fs.FiscalYearId = @fiscalYearId
						left join INV_MST_Item item on gritm.ItemId = item.ItemId
					where
						ret.CreatedOn>Convert(date,fs.StartYear) and ret.CreatedOn<Convert(date,fs.EndYear)	
	) A
	where VendorId = @VendorId OR ISNULL(@VendorId, '') = ''
	group by VendorId , ItemName,ItemId
END
GO


-- END: Vikas :28th Jan 2020: Created sp for vendor transaction more than 100000 and their details --

-- START: Vikas :29th Jan 2020: script for routing, permission for vendor-transaction-report pages in inventory report--

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Inventory' and ApplicationCode='INV');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('inventory-reports-vendor-transaction-report',@ApplicationId,1,GETDATE(),1);
GO
----
declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='inventory-reports-vendor-transaction-report')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Inventory/Reports')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, css, DefaultShow, IsActive)
values ('Vendor Transaction', 'Inventory/Reports/VendorTransaction','VendorTransaction',@PermissionId,@RefParentRouteId,'fa fa-money fa-stack-1x text-white',1,1);
GO

-- END: Vikas :29th Jan 2020: script for routing, permission for vendor-transaction-report pages in inventory report--

=========
----Start: Pratik-23Jan 2020  ---For External Referral--
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Pharmacy','ExternalReferralSettings','{"EnableExternal":true, "DefaultExternal":true}','json','Enable or Disable External Referrer selection in Pharmacy sale .','custom');
Go
----end: Pratik-23Jan 2020  ---For External Referral--

--Start: Deepak 24th Jan 2020
Alter table CLN_PatientVitals 
add Advice varchar(max),
FreeNotes varchar(max),
DiagnosisType varchar(50),
Diagnosis varchar(max)
GO
--End: Deepak 24th Jan 2020
----Start : Narayan: 27th Jan 2020 : Added table for Referral Source in Clinical Module
/****** Object:  Table [dbo].[CLN_ReferralSource]    Script Date: 01/27/2020 10:49:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_ReferralSource](
  [ReferralSourceId] [int] IDENTITY(1,1) NOT NULL,
  [PatientId] [int] NOT NULL,
  [Newspaper][bit] NULL,
  [Unknown][bit] NULL,
  [Doctor][bit] NULL,
  [Radio][bit] NULL,
  [WebPage][bit] NULL,
  [FriendAndFamily][bit] NULL,
  [Magazine][bit] NULL,
  [Staff][bit] NULL,
  [Others][varchar] (500) NULL,
  [TV][bit] NULL,
  [Note] [varchar](200) NULL,
  [CreatedBy] [int] NULL,
  [CreatedOn] [datetime] NULL,
  [ModifiedBy] [int] NULL,
  [ModifiedOn] [datetime] NULL, PRIMARY KEY CLUSTERED 
(
  [ReferralSourceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
----End : Narayan: 27th Jan 2020 : Added table for Referral Source in Clinical Module


--- Start: 28th Jan, 2020: For Button Level Authorization in ADT Module
SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'transfer-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'sticker-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'change-doctor-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'change-bed-feature-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'bill-history-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'cancel-admission-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'print-wristband-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'admit-button', null, 9, 1, GETDATE(), null, null, 1)

SET IDENTITY_INSERT RBAC_Permission ON
insert into RBAC_Permission(PermissionId, PermissionName, Description, ApplicationId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive)
values((SELECT ISNULL(MAX(PermissionId)+1,0) FROM dbo.RBAC_Permission WITH(SERIALIZABLE, UPDLOCK)), 'generic-sticker-button', null, 9, 1, GETDATE(), null, null, 1)
--- End: 28th Jan, 2020: For Button Level Authorization in ADT Module
>>>>>>>>> Temporary merge branch 2
