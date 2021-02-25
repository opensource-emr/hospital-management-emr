
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



--drop and create costcenteric tables

ALTER TABLE [dbo].[ACC_TransactionCostCentricItems] DROP CONSTRAINT [FK_ACC_TransactionCostCentricItems_ACC_TransactionItems]
GO

ALTER TABLE [dbo].[ACC_TransactionCostCentricItems] DROP CONSTRAINT [FK_ACC_TransactionCostCentricItems_ACC_MST_CostCentricItems]
GO

ALTER TABLE [dbo].[ACC_TransactionCostCentricItems] DROP CONSTRAINT [IsActiveTxnCostCentricItem]
GO

ALTER TABLE [dbo].[ACC_MST_CostCentricItems] DROP CONSTRAINT [IsActiveCostCentric]
GO

/****** Object:  Table [dbo].[ACC_TransactionCostCentricItems]    Script Date: 5/3/2018 6:50:12 PM ******/
DROP TABLE [dbo].[ACC_TransactionCostCentricItems]
GO

/****** Object:  Table [dbo].[ACC_MST_CostCentricItems]    Script Date: 5/3/2018 6:50:12 PM ******/
DROP TABLE [dbo].[ACC_MST_CostCentricItems]
GO


/****** Object:  Table [dbo].[ACC_MST_CostCenterItems]    Script Date: 5/3/2018 6:50:12 PM ******/
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

/****** Object:  Table [dbo].[ACC_TransactionCostCenterItems]    Script Date: 5/3/2018 6:50:12 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ACC_TransactionCostCenterItems](
	[TransactionCostCenterItemId] [int] IDENTITY(1,1) NOT NULL,
	[TransactionItemId] [int] NOT NULL,
	[CostCenterItemId] [int] NOT NULL,
	[Amount] [float] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_ACC_TransactionCostCenterItems] PRIMARY KEY CLUSTERED 
(
	[TransactionCostCenterItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ACC_MST_CostCenterItems] ADD  CONSTRAINT [IsActiveCostCenter]  DEFAULT ((1)) FOR [IsActive]
GO

ALTER TABLE [dbo].[ACC_TransactionCostCenterItems] ADD  CONSTRAINT [IsActiveTxnCostCenterItem]  DEFAULT ((1)) FOR [IsActive]
GO

ALTER TABLE [dbo].[ACC_TransactionCostCenterItems]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TransactionCostCenterItems_ACC_MST_CostCenterItems] FOREIGN KEY([CostCenterItemId])
REFERENCES [dbo].[ACC_MST_CostCenterItems] ([CostCenterItemId])
GO

ALTER TABLE [dbo].[ACC_TransactionCostCenterItems] CHECK CONSTRAINT [FK_ACC_TransactionCostCenterItems_ACC_MST_CostCenterItems]
GO

ALTER TABLE [dbo].[ACC_TransactionCostCenterItems]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TransactionCostCenterItems_ACC_TransactionItems] FOREIGN KEY([TransactionItemId])
REFERENCES [dbo].[ACC_TransactionItems] ([TransactionItemId])
GO

ALTER TABLE [dbo].[ACC_TransactionCostCenterItems] CHECK CONSTRAINT [FK_ACC_TransactionCostCenterItems_ACC_TransactionItems]
GO


ALTER TABLE [dbo].[ACC_TransactionItems] DROP CONSTRAINT [HasCostCentricItems]
GO


exec sp_rename '[dbo].[ACC_TransactionItems].[HasCostCentricItems]', 'HasCostCenterItems', 'COLUMN';
go
ALTER TABLE [dbo].[ACC_TransactionItems] ADD  CONSTRAINT [HasCostCenterItems]  DEFAULT ((0)) FOR [HasCostCenterItems]
GO


--ALTER TABLE [dbo].[ACC_MST_Ledgers] DROP CONSTRAINT [IsCostCentricApplicable]
--GO

--exec sp_rename '[dbo].[ACC_MST_Ledgers].[IsCostCentricApplicable]', 'IsCostCenterApplicable', 'COLUMN';
--go
--ALTER TABLE [dbo].[ACC_MST_Ledgers] ADD  CONSTRAINT IsCostCenterApplicable  DEFAULT ((0)) FOR IsCostCenterApplicable
--GO

--drop and create costcentric tables
-------START: NageshBB: 13June2018 Drop and create script for ACC tables (restructured)------------------

--remove foreign key constraints
--ALTER TABLE [dbo].[ACC_MST_MappingDetail] DROP CONSTRAINT IF Exists [FK_ACC_MST_MappingDetail_ACC_Ledger1]
--GO
--ALTER TABLE [dbo].[ACC_MST_MappingDetail] DROP CONSTRAINT IF Exists [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping]
--GO
ALTER TABLE [dbo].[ACC_TransactionItems]  DROP CONSTRAINT IF Exists [FK_ACC_TransactionItems_ACC_Transactions]
GO
ALTER TABLE [dbo].[ACC_Transactions]  DROP CONSTRAINT IF Exists [FK_ACC_Transactions_ACC_MST_Vouchers]
GO
ALTER TABLE [dbo].[INV_MST_Item]  DROP CONSTRAINT IF Exists [FK_INV_MST_Item_Emp_Employee]
GO
ALTER TABLE [dbo].[INV_MST_Item]  DROP CONSTRAINT IF Exists [FK_INV_MST_Item_INV_MST_ItemCategory]
GO
ALTER TABLE [dbo].[ACC_TransactionCostCenterItems] DROP CONSTRAINT if Exists [FK_ACC_TransactionCostCenterItems_ACC_TransactionItems]
GO

ALTER TABLE [dbo].[ACC_MAP_VoucherLedgerGroupMaps]  DROP CONSTRAINT IF Exists [FK_ACC_MST_VoucherLedgerGroupMap_ACC_MST_Vouchers]
GO
--ALTER TABLE [dbo].[ACC_TXN_Link] DROP CONSTRAINT IF Exists [FK_ACC_TXN_Link_ACC_Transactions]
--GO

ALTER TABLE [dbo].[ACC_TransactionItems] DROP CONSTRAINT IF Exists [FK_ACC_TransactionItems_ACC_Ledger]
GO

--drop and create table
DROP TABLE IF EXISTS dbo.ACC_Ledger
Go
DROP TABLE IF EXISTS dbo.[ACC_MST_FiscalYears]
Go
DROP TABLE IF EXISTS dbo.[ACC_MST_MappingDetail]
Go
DROP TABLE IF EXISTS dbo.[ACC_MST_Vouchers]
Go
DROP TABLE IF EXISTS dbo.[ACC_TransactionItems]
Go
DROP TABLE IF EXISTS dbo.[ACC_Transactions]
Go
DROP TABLE IF EXISTS dbo.[ACC_TXN_Link]
Go
DROP TABLE IF EXISTS dbo.[ACC_MST_GroupMapping]
Go
--DROP TABLE IF EXISTS dbo.[INV_MST_Item]
--Go
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_Ledger](
	[LedgerId] [int] IDENTITY(1,1) NOT NULL,
	[COA] [varchar](100) null,
	[Type] [varchar](100) NULL,
	[LedgerName] [varchar](100) NOT NULL,
	[NodeLevel] [int] NULL,
	[Description] [varchar](200) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[DrCr] [bit] NOT NULL,
 CONSTRAINT [PK_Ledger] PRIMARY KEY CLUSTERED 
(
	[LedgerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_FiscalYears]    Script Date: 13-06-2018 17:31:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_FiscalYears](
	[FiscalYearId] [int] IDENTITY(1,1) NOT NULL,
	[FiscalYearName] [varchar](50) NOT NULL,
	[StartYear] [datetime] NOT NULL,
	[EndYear] [datetime] NOT NULL,
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
/****** Object:  Table [dbo].[ACC_MST_GroupMapping]    Script Date: 13-06-2018 17:31:41 ******/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_GroupMapping](
	[GroupMappingId] [int] IDENTITY(1,1) NOT NULL,
	[Description] [varchar](200) NULL,
	[Section] [int] NULL,
	[ItemId] [int] NULL,
 CONSTRAINT [PK_AccountingGroupMapping] PRIMARY KEY CLUSTERED 
(
	[GroupMappingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_MappingDetail]    Script Date: 13-06-2018 17:31:41 ******/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_MappingDetail](
	[AccountingMappingDetailId] [int] IDENTITY(1,1) NOT NULL,
	[GroupMappingId_fk] [int] NULL,
	[FieldName] [varchar](200) NULL,
	[LedgerId_fk] [int] NULL,
	[DrCr] [bit] NULL,
 CONSTRAINT [PK_ACC_MST_MappingDetail] PRIMARY KEY CLUSTERED 
(
	[AccountingMappingDetailId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_Vouchers]    Script Date: 13-06-2018 17:31:42 ******/

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
/****** Object:  Table [dbo].[ACC_TransactionItems]    Script Date: 13-06-2018 17:31:42 ******/

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
/****** Object:  Table [dbo].[ACC_Transactions]    Script Date: 13-06-2018 17:31:42 ******/

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
	[Remarks] [varchar](100) NULL,
	[ReferenceTransactionId] [int] NULL,
	[SectionId] [int] NULL,
	[VoucherNumber] [int] NOT NULL,
 CONSTRAINT [PK_ACC_Transactions] PRIMARY KEY CLUSTERED 
(
	[TransactionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_TXN_Link]    Script Date: 13-06-2018 17:31:42 ******/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_TXN_Link](
	[AccountingTxnLinkId] [int] IDENTITY(1,1) NOT NULL,
	[TransactionId] [int] NULL,
	[ItemId] [int] NULL,
 CONSTRAINT [PK_ACC_TXN_Link] PRIMARY KEY CLUSTERED 
(
	[AccountingTxnLinkId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ACC_MST_Vouchers] ADD  CONSTRAINT [IsActiveVouchers]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ACC_TransactionItems] ADD  CONSTRAINT [IsActiveTransactionItems]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_Ledger1] FOREIGN KEY([LedgerId_fk])
REFERENCES [dbo].[ACC_Ledger] ([LedgerId])
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_Ledger1]
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping] FOREIGN KEY([GroupMappingId_fk])
REFERENCES [dbo].[ACC_MST_GroupMapping] ([GroupMappingId])
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping]
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
ALTER TABLE [dbo].[INV_MST_Item]  WITH CHECK ADD  CONSTRAINT [FK_INV_MST_Item_Emp_Employee] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[EMP_Employee] ([EmployeeId])
GO
ALTER TABLE [dbo].[INV_MST_Item] CHECK CONSTRAINT [FK_INV_MST_Item_Emp_Employee]
GO
ALTER TABLE [dbo].[INV_MST_Item]  WITH CHECK ADD  CONSTRAINT [FK_INV_MST_Item_INV_MST_ItemCategory] FOREIGN KEY([ItemCategoryId])
REFERENCES [dbo].[INV_MST_ItemCategory] ([ItemCategoryId])
GO
ALTER TABLE [dbo].[INV_MST_Item] CHECK CONSTRAINT [FK_INV_MST_Item_INV_MST_ItemCategory]
GO

ALTER TABLE [dbo].[ACC_TXN_Link]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TXN_Link_ACC_Transactions] FOREIGN KEY([TransactionId])
REFERENCES [dbo].[ACC_Transactions] ([TransactionId])
GO
ALTER TABLE [dbo].[ACC_TXN_Link] CHECK CONSTRAINT [FK_ACC_TXN_Link_ACC_Transactions]
GO

ALTER TABLE [dbo].[ACC_TransactionItems]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger] FOREIGN KEY([LedgerId])
REFERENCES [dbo].[ACC_Ledger] ([LedgerId])
GO
ALTER TABLE [dbo].[ACC_TransactionItems] CHECK CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger]
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

-------END: NageshBB: 13June2018 Drop and create script for ACC tables (restructured)------------------

-------START: NageshBB: 15June2018 accounting master data insertion script------------------
--Master data insertion script for accounting
SET IDENTITY_INSERT [dbo].[ACC_Ledger] ON 
GO
INSERT [dbo].[ACC_Ledger] ([LedgerId], [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive], [DrCr]) VALUES (1, N'Assets', N'Current Assets', N'Inventory', 1, N'under Assets ->Current Assets', 1, CAST(N'2018-06-14T00:00:00.000' AS DateTime), 1, 1)
GO
INSERT [dbo].[ACC_Ledger] ([LedgerId], [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive], [DrCr]) VALUES (2, N'Assets', N'Current Assets', N'Cash', 1, N'Under Assets-> Current Assents', 1, CAST(N'2018-06-14T00:00:00.000' AS DateTime), 1, 1)
GO
INSERT [dbo].[ACC_Ledger] ([LedgerId], [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive], [DrCr]) VALUES (4, N'Liabilities', N'Current Liabilities
', N'Duties and Taxes', 1, N'Under Liabilities -> Current Liabilities', 1, CAST(N'2018-01-01T00:00:00.000' AS DateTime), 1, 0)
GO
INSERT [dbo].[ACC_Ledger] ([LedgerId], [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive], [DrCr]) VALUES (5, N'Assets', N'Current Assets', N'Bank', 1, N'Under Assets-> Current Assets', 1, CAST(N'2018-01-01T00:00:00.000' AS DateTime), 1, 1)
GO
INSERT [dbo].[ACC_Ledger] ([LedgerId], [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive], [DrCr]) VALUES (6, N'Revenue', N'Inventory', N'Inventory', 0, N'Under Revenue->Inventory', 1, CAST(N'2018-01-01T00:00:00.000' AS DateTime), 1, 0)
GO
SET IDENTITY_INSERT [dbo].[ACC_Ledger] OFF
GO
SET IDENTITY_INSERT [dbo].[ACC_MST_FiscalYears] ON 
GO
INSERT [dbo].[ACC_MST_FiscalYears] ([FiscalYearId], [FiscalYearName], [StartYear], [EndYear], [Description], [CreatedOn], [CreatedBy], [IsActive]) VALUES (1, N'2018-2019', CAST(N'2018-04-01T00:00:00.000' AS DateTime), CAST(N'2019-03-31T00:00:00.000' AS DateTime), N'indian fiscal year for 2018-19', CAST(N'2018-06-15T00:00:00.000' AS DateTime), 1, 1)
GO
SET IDENTITY_INSERT [dbo].[ACC_MST_FiscalYears] OFF
GO
SET IDENTITY_INSERT [dbo].[ACC_MST_Vouchers] ON 
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) VALUES (1, N'Purchase Voucher', N'', CAST(N'2018-01-01T00:00:00.000' AS DateTime), 1, 1)
GO
SET IDENTITY_INSERT [dbo].[ACC_MST_Vouchers] OFF
GO

ALTER TABLE [dbo].[INV_TXN_GoodsReceiptItems]
ADD [IsTransferredToACC] bit null
GO

Alter table [dbo].[ACC_Transactions]
Alter column [VoucherNumber]int null
Go
-------END: NageshBB: 15June2018 accounting master data insertion script------------------

-------START: NageshBB: 17June2018 accounting master data insertion script and alter column for bil_txn_item table ------------------
SET IDENTITY_INSERT [dbo].[ACC_MST_Vouchers] ON 
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) VALUES (2, N'Sales Voucher', N'', CAST(N'2018-01-01T00:00:00.000' AS DateTime), 1, 1)
GO
SET IDENTITY_INSERT [dbo].[ACC_MST_Vouchers] OFF
GO
ALTER TABLE [dbo].[BIL_TXN_BillingTransactionItems]
ADD [IsTransferredToACC] bit null
GO

SET IDENTITY_INSERT [dbo].[ACC_Ledger] ON 
GO
INSERT [dbo].[ACC_Ledger] ([LedgerId], [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive], [DrCr]) VALUES (7, N'Revenue', N'Revenue', N'Sales', 1, N'Under Revenue -> Revenue -> Sales Ledger', 1, CAST(N'2018-01-01 00:00:00.000' AS DateTime), 1, 0)
GO
SET IDENTITY_INSERT [dbo].[ACC_Ledger] OFF
GO

-------END: NageshBB: 17June2018 accounting master data insertion script and alter column for bil_txn_item table ------------------

-------START: NageshBB: 18June2018 Accounting transfer rule core parameter data------------------
exec sp_rename '[dbo].[ACC_TXN_Link].[ItemId]', 'ReferenceId', 'COLUMN';
go
INSERT [dbo].[CORE_CFG_Parameters] ([ParameterGroupName], [ParameterName], [ParameterValue], [ValueDataType], [Description]) 
VALUES (N'ACCOUNTING', N'BillingToACCTransferRule', N'[{"LedgerId":7,"LedgerName":"Sales","DrCr":false},{"LedgerId":2,"LedgerName":"Cash","DrCr":true},{"LedgerId":4,"LedgerName":"Duties and Taxes","DrCr":false}]', N'JSON', N'Billing to accounting transfer record rule')
GO
INSERT [dbo].[CORE_CFG_Parameters] ([ParameterGroupName], [ParameterName], [ParameterValue], [ValueDataType], [Description]) 
VALUES (N'ACCOUNTING', N'INVToACCTransferRule', N'[{"LedgerId": 1,"LedgerName":"Inventory","DrCr":true },{"LedgerId":2,"LedgerName":"Cash","DrCr":false},{ "LedgerId":4,"LedgerName":"Duties and Taxes","DrCr":true}]', N'JSON', N'Inventory To Accounting Transfer rule')
GO
-------END: NageshBB: 18June2018 Accounting transfer rule core parameter data------------------
