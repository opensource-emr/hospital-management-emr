-------Start: Ashim: 3rdMay2018  Deleted Routes and Permissions------------------
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-voucher-transaction-list')
delete from [dbo].[RBAC_MAP_RolePermission]
where PermissionId =@perId
go
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-voucher-transaction-list')
delete from [dbo].[RBAC_RouteConfig]
where PermissionId =@perId
go
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-voucher-transaction-list')
delete from [dbo].[RBAC_Permission]
where PermissionId=@perId
go

declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-ledger-transaction-list')
delete from [dbo].[RBAC_MAP_RolePermission]
where PermissionId =@perId
go
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-ledger-transaction-list')
delete from [dbo].[RBAC_RouteConfig]
where PermissionId =@perId
go
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-ledger-transaction-list')
delete from [dbo].[RBAC_Permission]
where PermissionId=@perId
go

  update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Transaction/VoucherEntry',DisplayName='Voucher Entry',RouterLink='VoucherEntry'
  where RouterLink='TransactionCreate'
  go
  update [dbo].[RBAC_Permission]
  set PermissionName='accounting-transaction-voucherentry-view'
  where PermissionName='accounting-transaction-vouchercreate-view'
  go
  

  update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-view'
  where PermissionName='accounting-master-view'
  go
  update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-ledgerlist-view'
  where PermissionName='accounting-master-ledgerlist-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-ledgergroup-list-view'
  where PermissionName='accounting-master-ledgergroup-list-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-ledgergroupcategory-list-view'
  where PermissionName='accounting-settings-ledgergroupcategory-list-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-itemlist-view'
  where PermissionName='accounting-master-itemlist-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-voucherlist-view'
  where PermissionName='accounting-master-voucherlist-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-costcenter-item-list-view'
  where PermissionName='accounting-master-costcentric-item-list-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-fiscalyear-list-view'
  where PermissionName='accounting-master-fiscalyear-list-view'
  go

  
  update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings',DisplayName='Settings',RouterLink='Settings'
  where RouterLink='Master'
  go
  
  update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/LedgerList',DisplayName='Ledgers',DisplaySeq=1
  where RouterLink='LedgerList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/LedgerGroupList', DisplayName ='Ledger Groups',DisplaySeq=2
  where RouterLink='LedgerGroupList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/LedgerGroupCategoryList', DisplayName='Ledger Group Categories',DisplaySeq=3
  where RouterLink='LedgerGroupCategoryList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/ItemList', DisplayName='Items',DisplaySeq=4
  where RouterLink='ItemList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/VoucherList', DisplayName='Vouchers',DisplaySeq=5
  where RouterLink='VoucherList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/CostCenterItemList',DisplayName='Cost Center Items', RouterLink='CostCenterItemList',DisplaySeq=6
  where RouterLink='CostCentricItemsList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/FiscalYearList',DisplaySeq=7
  where RouterLink='FiscalYearList'
  go

-------End: Ashim: 3rdMay2018  Deleted Routes and Permissions------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_ACC_TrailBalance]    Script Date: 21-08-2018 19:17:09 ******/
DROP PROCEDURE IF EXISTS [dbo].[SP_Report_ACC_TrailBalance]
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_ACC_ProfitLossStatement]    Script Date: 21-08-2018 19:17:09 ******/
DROP PROCEDURE IF EXISTS [dbo].[SP_Report_ACC_ProfitLossStatement]
GO
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetINVGoodsReceiptData]    Script Date: 21-08-2018 19:17:09 ******/
DROP PROCEDURE IF EXISTS [dbo].[SP_ACC_GetINVGoodsReceiptData]
GO
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetBilTxnItemsServDeptWise]    Script Date: 21-08-2018 19:17:09 ******/
DROP PROCEDURE IF EXISTS [dbo].[SP_ACC_GetBilTxnItemsServDeptWise]
GO

ALTER TABLE [dbo].[ACC_Transactions]  DROP CONSTRAINT IF EXISTS [FK_ACC_Transactions_ACC_MST_Vouchers]
GO
ALTER TABLE [dbo].[ACC_TransactionItems] DROP CONSTRAINT IF EXISTS [FK_ACC_TransactionItems_ACC_Transactions]
GO
ALTER TABLE [dbo].[ACC_TransactionItems] DROP CONSTRAINT IF EXISTS [FK_ACC_TransactionItems_ACC_Ledger]
GO

ALTER TABLE [dbo].[ACC_TransactionItems] DROP CONSTRAINT IF EXISTS [IsActiveTransactionItems]
GO
ALTER TABLE [dbo].[ACC_MST_Vouchers] DROP CONSTRAINT IF EXISTS [IsActiveVouchers]
GO

/****** Object:  Table [dbo].[BIL_SYNC_BillingAccounting]    Script Date: 21-08-2018 19:17:09 ******/

DROP TABLE  IF EXISTS [dbo].[BIL_SYNC_BillingAccounting]
GO
/****** Object:  Table [dbo].[ACC_TXN_Link]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_TXN_Link]
GO
/****** Object:  Table [dbo].[ACC_Transactions]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_Transactions]
GO
/****** Object:  Table [dbo].[ACC_TransactionItems]    Script Date: 21-08-2018 19:17:09 ******/
DROP Table If exists [dbo].[ACC_TransactionCostCentricItems]
Go
DROP TABLE  IF EXISTS [dbo].[ACC_TransactionItems]
GO

/****** Object:  Table [dbo].[ACC_MST_MappingDetail]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_MappingDetail]
GO
/****** Object:  Table [dbo].[ACC_MST_GroupMapping]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_GroupMapping]
GO
/****** Object:  Table [dbo].[ACC_MST_FiscalYears]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_FiscalYears]
GO
/****** Object:  Table [dbo].[ACC_MST_CostCenterItems]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_CostCenterItems]
GO
/****** Object:  Table [dbo].[ACC_Ledger]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_Ledger]
GO
drop table if exists [dbo].[ACC_MAP_VoucherLedgerGroupMaps]
go
/****** Object:  Table [dbo].[ACC_MST_Vouchers]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_Vouchers]
GO
/****** Object:  Table [dbo].[ACC_Ledger]    Script Date: 21-08-2018 19:17:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_Ledger](
	[LedgerId] [int] IDENTITY(1,1) NOT NULL,
	[COA] [varchar](100) NULL,
	[Type] [varchar](100) NULL,
	[LedgerName] [varchar](100) NOT NULL,
	[NodeLevel] [int] NULL,
	[Description] [varchar](200) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_Ledger] PRIMARY KEY CLUSTERED 
(
	[LedgerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_CostCenterItems]    Script Date: 21-08-2018 19:17:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_CostCenterItems](
	[CostCenterItemId] [int] IDENTITY(1,1) NOT NULL,
	[CostCenterItemName] [varchar](50) NOT NULL,
	[Description] [varchar](200) NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_ACC_MST_CostCenterItems] PRIMARY KEY CLUSTERED 
(
	[CostCenterItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_FiscalYears]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_FiscalYears](
	[FiscalYearId] [int] IDENTITY(1,1) NOT NULL,
	[FiscalYearName] [varchar](50) NOT NULL,
	[StartDate] [datetime] NOT NULL,
	[EndDate] [datetime] NOT NULL,
	[Description] [varchar](200) NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_ACC_MST_FiscalYears] PRIMARY KEY CLUSTERED 
(
	[FiscalYearId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_GroupMapping]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_GroupMapping](
	[GroupMappingId] [int] IDENTITY(1,1) NOT NULL,
	[Description] [varchar](200) NULL,
	[Section] [int] NULL,
 CONSTRAINT [PK_AccountingGroupMapping] PRIMARY KEY CLUSTERED 
(
	[GroupMappingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_MappingDetail]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_MappingDetail](
	[AccountingMappingDetailId] [int] IDENTITY(1,1) NOT NULL,
	[GroupMappingId] [int] NULL,
	[LedgerId] [int] NULL,
	[DrCr] [bit] NULL,
 CONSTRAINT [PK_ACC_MST_MappingDetail] PRIMARY KEY CLUSTERED 
(
	[AccountingMappingDetailId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_Vouchers]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_Vouchers](
	[VoucherId] [int] IDENTITY(1,1) NOT NULL,
	[VoucherName] [varchar](200) NULL,
	[Description] [varchar](200) NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_ACC_MST_Vouchers] PRIMARY KEY CLUSTERED 
(
	[VoucherId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_TransactionItems]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_TransactionItems](
	[TransactionItemId] [int] IDENTITY(1,1) NOT NULL,
	[TransactionId] [int] NULL,
	[LedgerId] [int] NULL,
	[DrCr] [bit] NULL,
	[Amount] [float] NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_ACC_TransactionItems] PRIMARY KEY CLUSTERED 
(
	[TransactionItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_Transactions]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_Transactions](
	[TransactionId] [int] IDENTITY(1,1) NOT NULL,
	[VoucherId] [int] NULL,
	[TransactionDate] [datetime] NULL,
	[FiscalYearId] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NULL,
	[IsActive] [bit] NULL,
	[Remarks] [nvarchar](200) NULL,
	[SectionId] [int] NULL,
	[VoucherNumber] [nvarchar](50) NULL,
 CONSTRAINT [PK_ACC_Transactions] PRIMARY KEY CLUSTERED 
(
	[TransactionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_TXN_Link]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_TXN_Link](
	[AccountingTxnLinkId] [int] IDENTITY(1,1) NOT NULL,
	[TransactionId] [int] NULL,
	[ReferenceId] [int] NULL,
 CONSTRAINT [PK_ACC_TXN_Link] PRIMARY KEY CLUSTERED 
(
	[AccountingTxnLinkId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BIL_SYNC_BillingAccounting]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BIL_SYNC_BillingAccounting](
	[BillingAccountingSyncId] [int] IDENTITY(1,1) NOT NULL,
	[BillingTransactionId] [int] NULL,
	[StatusDate] [datetime] NULL,
	[Status] [nvarchar](100) NULL,
	[IsTransferedToAcc] [bit] NULL,
 CONSTRAINT [PK_BIL_SYNC_BillingAccounting] PRIMARY KEY CLUSTERED 
(
	[BillingAccountingSyncId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

--- creating trigger function

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TRIGGER [dbo].[TRG_BillingTransaction_BillToAccSync]
ON [dbo].[BIL_TXN_BillingTransaction]
AFTER INSERT, UPDATE
AS
BEGIN
  IF EXISTS (SELECT 1 FROM inserted)
  BEGIN
    DECLARE @id int, @status nvarchar(100)
	--GETTING VALUES FOR INSERTING IN SYNC TABLE
    SELECT @id = BillingTransactionId FROM inserted
    SELECT @status =
			   --CASE FOR SELECTING STATUS AS PER DIFFERENT SCENARIOS
               CASE
			   --MAKING FIRST LETTER IN UPPER-CASE LIKE 'PaidReturn', 'CreditUnpaid'
                 WHEN ReturnStatus = 1 THEN CONCAT(UPPER(LEFT(BillStatus, 1)) + SUBSTRING(BillStatus, 2, LEN(BillStatus)), 'Return')
                 ELSE CASE
                     WHEN PaymentMode = 'credit' THEN CONCAT(
                       UPPER(LEFT(PaymentMode, 1)) + SUBSTRING(PaymentMode, 2, LEN(PaymentMode)),
                       UPPER(LEFT(BillStatus, 1)) + SUBSTRING(BillStatus, 2, LEN(BillStatus)))
                     ELSE UPPER(LEFT(BillStatus, 1)) + SUBSTRING(BillStatus, 2, LEN(BillStatus))
                   END
               END
    FROM INSERTED
	--INSERTING VALUES TO SYNC TABLE
    INSERT INTO [dbo].[BIL_SYNC_BillingAccounting] (BillingTransactionId, StatusDate, Status)
      VALUES (@id, GETDATE(), @status)
  END
END
GO

ALTER TABLE [dbo].[BIL_TXN_BillingTransaction] ENABLE TRIGGER [TRG_BillingTransaction_BillToAccSync]
GO
---insert acc_ledger data
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Current Assets', N'Inventory', 1, N'under Assets ->Current Assets', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Current Assets', N'Cash', 1, N'Under Assets-> Current Assents', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Liabilities', N'Current Liabilities', N'Duties and Taxes', 1, N'Under Liabilities -> Current Liabilities', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Current Assets', N'Bank', 1, N'Under Assets-> Current Assets', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Revenue', N'Inventory', N'Inventory', 0, N'Under Revenue->Inventory', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Revenue', N'Direct Income', N'Sales', 1, N'Under Revenue -> Revenue -> Sales Ledger', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Investments', N'Short Term Investments', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Current Assets', N'Marketable Securities', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Current Assets', N'Current Assets', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Current Assets', N'Sundry Debtors', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Current Assets', N'Prepaids', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Current Assets', N'Advance Short Term', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Non Current Assets', N'Non Current Assets', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Non Current Assets', N'Advance Long Term', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Investments', N'Long Term Investments', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Other Assets', N'Other Assets', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Sundry Creditors', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Accured Liabilities', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Bank OD', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Provisions', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Current Liabilities', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Unearned Revenue', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Long Term Liabilities', N'Long Term Liabilities', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Capital and Equity', N'Reserves and Surplus', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Capital and Equity', N'Retained Earnings', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Capital and Equity', N'Stockholder''s Equity', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Capital and Equity', N'Profit and Loss Account', 1, NULL, 1, GETDATE(), 0)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Expenses', N'Cost of Goods Sold', N'Purchase Accounts', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Expenses', N'Direct Expense', N'Direct Expenses', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Revenue', N'Revenue from Operation', N'Sales', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Revenue', N'Indirect Incomes', N'Indirect Income', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Revenue', N'Indirect Incomes', N'Sales Return', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Expenses', N'Indirect Expenses', N'Administration Expenses', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Expenses', N'Cost of Goods Sold', N'Purchase Return', 1, NULL, 1, GETDATE(), 1)
GO


INSERT [dbo].[ACC_MST_FiscalYears] ( [FiscalYearName], [StartDate], [EndDate], [Description], [CreatedOn], [CreatedBy], [IsActive]) VALUES ( N'2018-2019', CAST(N'2018-04-01T00:00:00.000' AS DateTime), CAST(N'2019-03-31T00:00:00.000' AS DateTime), N'indian fiscal year for 2018-19', GETDATE(), 1, 1)
GO


INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCTransferRule', 2)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'INVToACCTransferRule', 1)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCCreditTransfer', 2)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCCreditReturn', 2)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCBilPaidReturn', 2)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCBilUnpaidReturn', 2)
GO


INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCTransferRule'), 7, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCTransferRule'), 2, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCTransferRule'), 4, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVToACCTransferRule'), 1, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVToACCTransferRule'), 2, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVToACCTransferRule'), 4, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditTransfer'), 11, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditTransfer'), 7, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditTransfer'), 4, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditReturn'), 11, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditReturn'), 2, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilPaidReturn'), 33, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES (  (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilPaidReturn'), 4, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES (  (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilPaidReturn'), 2, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES (  (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilUnpaidReturn'), 7, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilUnpaidReturn'), 4, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilUnpaidReturn'), 11, 0)
GO

SET IDENTITY_INSERT [dbo].[ACC_MST_Vouchers] ON 
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (1, N'Purchase Voucher', N'', GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (2, N'Sales Voucher', N'', GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (3, N'Journal Voucher', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (4, N'Payment Voucher', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (5, N'Receipt Voucher', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (6, N'Contra Voucher', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (7, N'Credit Note', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (8, N'Debit Note', NULL, GETDATE(), 1, 1)
GO
SET IDENTITY_INSERT [dbo].[ACC_MST_Vouchers] OFF
GO
ALTER TABLE [dbo].[ACC_MST_CostCenterItems] ADD  CONSTRAINT [IsActiveCostCenter]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ACC_MST_Vouchers] ADD  CONSTRAINT [IsActiveVouchers]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ACC_TransactionItems] ADD  CONSTRAINT [IsActiveTransactionItems]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_Ledger1] FOREIGN KEY([LedgerId])
REFERENCES [dbo].[ACC_Ledger] ([LedgerId])
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_Ledger1]
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping] FOREIGN KEY([GroupMappingId])
REFERENCES [dbo].[ACC_MST_GroupMapping] ([GroupMappingId])
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping]
GO
ALTER TABLE [dbo].[ACC_TransactionItems]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger] FOREIGN KEY([LedgerId])
REFERENCES [dbo].[ACC_Ledger] ([LedgerId])
GO
ALTER TABLE [dbo].[ACC_TransactionItems] CHECK CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger]
GO
ALTER TABLE [dbo].[ACC_TransactionItems]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TransactionItems_ACC_Transactions] FOREIGN KEY([TransactionId])
REFERENCES [dbo].[ACC_Transactions] ([TransactionId])
GO
ALTER TABLE [dbo].[ACC_TransactionItems] CHECK CONSTRAINT [FK_ACC_TransactionItems_ACC_Transactions]
GO
ALTER TABLE [dbo].[ACC_Transactions]  WITH CHECK ADD  CONSTRAINT [FK_ACC_Transactions_ACC_MST_Vouchers] FOREIGN KEY([VoucherId])
REFERENCES [dbo].[ACC_MST_Vouchers] ([VoucherId])
GO
ALTER TABLE [dbo].[ACC_Transactions] CHECK CONSTRAINT [FK_ACC_Transactions_ACC_MST_Vouchers]
GO
ALTER TABLE [dbo].[ACC_TXN_Link]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TXN_Link_ACC_Transactions] FOREIGN KEY([TransactionId])
REFERENCES [dbo].[ACC_Transactions] ([TransactionId])
GO
ALTER TABLE [dbo].[ACC_TXN_Link] CHECK CONSTRAINT [FK_ACC_TXN_Link_ACC_Transactions]
GO
ALTER TABLE [dbo].[BIL_SYNC_BillingAccounting]  WITH CHECK ADD  CONSTRAINT [FK_BIL_SYNC_BillingAccounting_BIL_TXN_BillingTransaction] FOREIGN KEY([BillingTransactionId])
REFERENCES [dbo].[BIL_TXN_BillingTransaction] ([BillingTransactionId])
GO
ALTER TABLE [dbo].[BIL_SYNC_BillingAccounting] CHECK CONSTRAINT [FK_BIL_SYNC_BillingAccounting_BIL_TXN_BillingTransaction]
GO
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetBilTxnItemsServDeptWise]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Proc  [dbo].[SP_ACC_GetBilTxnItemsServDeptWise]
As
/*
FileName: [SP_ACC_GetBilTxnItemsServDeptWise]
CreatedBy/date: NageshBB/2018 June 27
Description: Get all Billing Transaction Items group by CreatedOn and ServiceDept wise
			 We transfer this all records to accounting
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    CreatedBy/UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1       NageshBB/2018 June 27							created the script
2		NageshBB/2018 July 02							Changed for get data Status wise (billStatus with PaymentMode)
------------------------------------------------------------------------------------------
*/
Begin


select 
bb.ServiceDepartmentName,
s.Status 
,CASE  WHEN s.Status='PaidReturn' or s.Status='UnpaidReturn'  THEN 'cash'
          WHEN b.PaymentMode='cheque' then 'card' 
		  else b.PaymentMode 
		  END 
		  as 
		  PaymentMode
     
,convert(date,bb.CreatedOn) as CreatedOn,
ROUND(sum(bb.TotalAmount-bb.Tax),2)as TotalAmount,
sum(bb.Tax) as Tax,

STUFF((Select ','+convert(varchar(100),BillingTransactionItemId)from dbo.Bil_txn_billingTransactionItems as T1
join bil_sync_billingaccounting ts on ts.BillingTransactionId=t1.BillingTransactionId
join BIL_TXN_BillingTransaction tb
on tb.BillingTransactionId=t1.BillingTransactionId
where ((s.Status=ts.Status and convert(date, t1.CreatedOn)=convert(date,bb.CreatedOn))) 
and (((
CASE  WHEN s.Status='PaidReturn' or s.Status='UnpaidReturn'  THEN 'cash'
          WHEN b.PaymentMode='cheque' then 'card' 
		  else b.PaymentMode 
		  END )=(CASE  WHEN ts.Status='PaidReturn' or ts.Status='UnpaidReturn'  THEN 'cash'
          WHEN tb.PaymentMode='cheque' then 'card' 
		  else tb.PaymentMode 
		  END 
))
and bb.ServiceDepartmentName=t1.ServiceDepartmentName)
FOR XML PATH('')),1,1, '') as ReferenceId,

STUFF((Select ','+convert(varchar(100),BillingAccountingSyncId)  from dbo.bil_sync_billingaccounting as ts
join BIL_TXN_BillingTransactionItems t1 on t1.BillingTransactionId=ts.BillingTransactionId
join BIL_TXN_BillingTransaction tb
on tb.BillingTransactionId=t1.BillingTransactionId
where ((s.Status=ts.Status and convert(date, t1.CreatedOn)=convert(date,bb.CreatedOn))) 
and (((
CASE  WHEN s.Status='PaidReturn' or s.Status='UnpaidReturn'  THEN 'cash'
          WHEN b.PaymentMode='cheque' then 'card' 
		  else b.PaymentMode 
		  END )=(CASE  WHEN ts.Status='PaidReturn' or ts.Status='UnpaidReturn'  THEN 'cash'
          WHEN tb.PaymentMode='cheque' then 'card' 
		  else tb.PaymentMode 
		  END 
))
and bb.ServiceDepartmentName=t1.ServiceDepartmentName)
FOR XML PATH('')),1,1, '') as BillingAccountingSyncIds,
convert(varchar(100),convert(date,bb.CreatedOn))+' BillingTransaction entries to accounting of '+bb.ServiceDepartmentName+' service department' as Remarks

from BIL_TXN_BillingTransactionItems bb
join bil_sync_billingaccounting s
on bb.BillingTransactionId=s.billingTransactionId
join BIL_TXN_BillingTransaction b
on b.BillingTransactionId=bb.BillingTransactionId
where s.isTransferedToAcc!=1 or s.IsTransferedToAcc is null
group by Status,convert(date,bb.createdOn)
, bb.ServiceDepartmentName
,CASE  WHEN s.Status='PaidReturn' or s.Status='UnpaidReturn'  THEN 'cash'
          WHEN b.PaymentMode='cheque' then 'card' 
		  else b.PaymentMode 
		  END 
order by CreatedOn ,ServiceDepartmentName
End
GO
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetINVGoodsReceiptData]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create Proc  [dbo].[SP_ACC_GetINVGoodsReceiptData]
As
/*
FileName: [[SP_ACC_GetINVGoodsReceiptData]]
CreatedBy/date: NageshBB/2018 July 03
Description:GEt all inventory goods receipt records group by date for transfer to accounting
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    CreatedBy/UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1       NageshBB/2018 July 03							created the script
------------------------------------------------------------------------------------------
*/
Begin

select Round(sum(gri.TotalAmount-gri.VATAmount),2) as TotalAmount
,sum(gri.VATAmount)as VAT
,convert(date,gri.CreatedOn) as CreatedOn,
'Inventory Goods Receipt entries to accounting on '+convert(varchar(100),convert(date,gri.CreatedOn)) as Remarks
,STUFF((SELECT ',' + convert(varchar(100),GoodsReceiptId)        
       FROM   dbo.INV_TXN_GoodsReceipt AS g
       WHERE (convert(date, gri.CreatedOn)= convert(date,g.CreatedOn))           
       FOR XML PATH('')), 1, 1, '') as ReferenceIds
 from INV_TXN_GoodsReceipt gr
join INV_TXN_GoodsReceiptItems gri
on gr.GoodsReceiptID=gri.GoodsReceiptId
where gr.istransferredToACC !=1 or gr.istransferredToACC is null
group by convert(date,gri.CreatedOn)
End
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_ACC_ProfitLossStatement]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Ramavtar
-- Create date: 2018-06-20
-- Description:	profit loss report for accounting
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_ACC_ProfitLossStatement]
AS
BEGIN
	SELECT LedgerName,
	SUM(TI.Amount) 'AMOUNT'
	FROM ACC_TransactionItems TI
	INNER JOIN ACC_Transactions T ON TI.TransactionId = T.TransactionId
	INNER JOIN ACC_MST_FiscalYears FY ON T.FiscalYearId = FY.FiscalYearId
	INNER JOIN ACC_Ledger L ON TI.LedgerId = L.LedgerId
	WHERE FY.IsActive = 1 AND L.COA='Revenue'
	GROUP BY LedgerName

	SELECT LedgerName,
	SUM(TI.Amount) 'AMOUNT'
	FROM ACC_TransactionItems TI
	INNER JOIN ACC_Transactions T ON TI.TransactionId = T.TransactionId
	INNER JOIN ACC_MST_FiscalYears FY ON T.FiscalYearId = FY.FiscalYearId
	INNER JOIN ACC_Ledger L ON TI.LedgerId = L.LedgerId
	WHERE FY.IsActive = 1 AND L.COA='Expense'
	GROUP BY LedgerName
END
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_ACC_TrailBalance]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_ACC_TrailBalance]
		@FromDate Datetime ,
		@ToDate DateTime
AS
/*
FileName: [SP_Report_ACC_TrailBalance]
CreatedBy/date: Ramavtar/2018-06-20
Description: trail balance report for accounting 
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Nagesh/2018-July-11                changes for get data by fromdate and todate                                          
------------------------------------------------------------------------------------------------------------------------
*/

BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	 BEGIN
	 SET NOCOUNT ON
	SELECT L.LedgerName,
	SUM(CASE WHEN TI.DrCr=1 THEN TI.Amount END) 'DEBIT',
	SUM(CASE WHEN TI.DrCr=0 THEN TI.Amount END) 'CREDIT' 
	FROM ACC_TransactionItems TI
	INNER JOIN ACC_Transactions T ON TI.TransactionId = T.TransactionId
	INNER JOIN ACC_Ledger L ON TI.LedgerId = L.LedgerId
WHERE (  
        (CONVERT(DATE,t.createdOn) >= CONVERT(DATE,@FromDate)) AND (CONVERT(date,t.createdon)<= CONVERT(DATE,@ToDate) )		
     )					
	GROUP BY L.LedgerName
	End
END
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Now 
section are hardcoded
1 -> Inventory
2->Billing
3->Pharmacy
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'ACC_MST_GroupMapping', @level2type=N'COLUMN',@level2name=N'Section'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'It like hospital code with transaction id i.e. HAMS_TransactionId , 
It will be null when comes from inventory' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'ACC_Transactions', @level2type=N'COLUMN',@level2name=N'VoucherNumber'
GO
