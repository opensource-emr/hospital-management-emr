--END: Sanjesh:/2020-01-30 :
---------New Incremental start from Here:3rd_February_2020 -----------------------------------

--Missing Incrementals from 3-feb-2020 archive
----START :RAJIB :28TH JAN 2020:Added two tables in wardsupply for internalconsumption
GO
/****** Object:  Table [dbo].[WARD_InternalConsumption]    Script Date: 1/28/2020 4:55:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_InternalConsumption](
	[ConsumptionId] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[WardId] [int] NULL,
	[DepartmentId] [int] NULL,
	[SubStoreId] [int] NULL,
	[TotalAmount] [float] NULL,
	[Remark] [varchar](100) NULL,
	[ModifiedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[ConsumedBy] [varchar](100) NULL
)
GO
/****** Object:  Table [dbo].[WARD_InternalConsumptionItems]    Script Date: 1/28/2020 4:59:08 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_InternalConsumptionItems](
	[ConsumptionItemId] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[ConsumptionId] [int] NULL,
	[ItemId] [int] NULL,
	[WardId] [int] NULL,
	[DepartmentId] [int] NULL,
	[SubstoreId] [int] NULL,
	[BatchNo] [varchar](10) NULL,
	[ItemName] [varchar](200) NULL,
	[MRP] [float] NULL,
	[Quantity] [int] NULL,
	[Subtotal] [float] NULL,
	[Remark] [varchar](500) NULL,
	[ExpiryDate] [datetime] NULL,
	[ModifiedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL)

GO
----END :RAJIB :28TH JAN 2020:Added two tables in wardsupply for internalconsumption

-----START: Sanjit: 28 Jan 2020: 
GO
Alter Table ADT_MST_Ward
Add StoreId int
GO
Alter Table PHRM_MST_Store
Add ParentStoreId int
GO
Alter Table PHRM_MST_Store
Add ModifiedBy int
GO
Alter Table PHRM_MST_Store
Add ModifiedOn Datetime
GO
Alter Table PHRM_MST_Store
Add IsActive bit
GO
Alter Table WARD_Requisition
Add StoreId int
GO
Alter Table WARD_Stock
Add StoreId int
GO
Alter Table WARD_Transaction
Add StoreId int
GO

-----END: Sanjit: 28 Jan 2020: 

---Start: Sanjit: 31 Jan 2020 -- Created Store Id in Dispatch Table and changed Pharmacy Transfer to Store Transfer in RBAC_RouteConfig

Alter Table WARD_Dispatch
Add StoreId int
GO

UPDATE RBAC_RouteConfig
Set DisplayName = 'Store Transfer'
where DisplayName = 'Pharmacy Transfer' and UrlFullPath = 'WardSupply/Pharmacy/PharmacyTransfer' and RouterLink = 'PharmacyTransfer'
GO

UPDATE PHRM_MST_Store set ParentStoreId = 0 where ParentStoreId is null;
GO

UPDATE PHRM_MST_Store set IsActive = 1 where IsActive is null;
GO

UPDATE ADT_MST_Ward set StoreId = 1 where StoreId is null;
go
---END: Sanjit: 31 Jan 2020 -- Created Store Id in Dispatch Table and changed Pharmacy Transfer to Store Transfer in RBAC_RouteConfig

--Start:Sanjit: 3 Feb 2020 -- Added StoreId in Ward_Consumption table and changed Ward Requisition to Substore Requisition and changed in all the reports of Substore
Alter Table WARD_Consumption
Add StoreId int;
GO


UPDATE RBAC_RouteConfig
SET DisplayName = 'Substore Request'
WHERE DisplayName = 'Ward Requisition' and UrlFullPath = 'Pharmacy/WardRequisition' and RouterLink='WardRequisition';
GO
/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]    Script Date: 2/3/2020 6:32:40 PM ******/
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
8.		Sanjit/03-Jan-2020						Generic Name added.
----------------------------------------------------------------------------
*/
BEGIN
	IF(@Status IS NOT NULL)
		BEGIN
				SELECT  x1.ItemName,x1.GenericName,x1.BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
			    (SELECT CreatedOn FROM PHRM_GoodsReceiptItems where GoodReceiptItemId= x1.GoodsReceiptItemId )AS 'Date',
				SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price
				FROM(SELECT stk.ItemName,gen.GenericName, stk.BatchNo, stk.ExpiryDate, stk.MRP,stk.StoreName,
				stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				join PHRM_GoodsReceiptItems as gritm on gritm.GoodReceiptItemId = stk.GoodsReceiptItemId
				join PHRM_MST_Item as itm on stk.ItemId = itm.ItemId
				join PHRM_MST_Generic gen on itm.GenericId = gen.GenericId
				GROUP BY stk.ItemName,gen.GenericName, stk.BatchNo , stk.ExpiryDate, stk.MRP,stk.StoreName,stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price)as x1
				WHERE (@Status=x1.ItemName or x1.ItemName like '%'+ISNULL(@Status,'')+'%')
				GROUP BY x1.ItemName,x1.GenericName, x1.BatchNo, x1.ExpiryDate, x1.MRP,x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price
				HAVING SUM(FInQty + InQty - FOutQty - OutQty) > 0	-- filtering out quantity > 0
				ORDER BY x1.ItemName
		END		
END
GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_BreakageReport]    Script Date: 2/3/2020 6:33:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_BreakageReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardReport_BreakageReport]
CreatedBy/date: Rusha/03-26-2019
Description: To get the Details of Breakage Items From different Ward 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-29-2019					   get details of breakage items
2.		Sanjit/02-03-2020						substore integration
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and (@StoreId IS NOT NULL))
		BEGIN
			select convert(date,transc.CreatedOn) as [Date], adt.WardName, ItemName, transc.Quantity,stk.MRP,
			Round(stk.MRP*transc.Quantity,2,0) as TotalAmt,transc.Remarks 
			FROM WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			join WARD_Stock as stk on transc.StockId=stk.StockId and transc.ItemId = stk.ItemId 
			where transc.StoreId = @StoreId and TransactionType = 'BreakageItem' and CONVERT(date, transc.CreatedOn) 
			BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by convert(date,transc.CreatedOn), itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName,stk.MRP,transc.Quantity
		END	
End
GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_ConsumptionReport]    Script Date: 2/3/2020 6:33:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_ConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardReport_ConsumptionReport]
CreatedBy/date: Rusha/03-26-2019
Description: To get the Consumption Details of Items From different Ward 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-29-2019					   add stock details of consumed item from different ward
2.		Sanjit/02-03-2020						substore integration
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and (@StoreId IS NOT NULL))
		BEGIN
			select CONVERT(date,consum.CreatedOn) as [Date], adt.WardName,consum.ItemName, gene.GenericName, consum.Quantity as Quantity 
			from WARD_Consumption as consum 
			join ADT_MST_Ward as adt on consum.WardId=adt.WardID
			join PHRM_MST_Item as itm on consum.ItemId=itm.GenericId
			join PHRM_MST_Generic as gene on  itm.GenericId=gene.GenericId
			where consum.StoreId = @StoreId and CONVERT(date, consum.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by CONVERT(date,consum.CreatedOn),adt.WardName,consum.ItemName,consum.Quantity, gene.GenericName
		END		
End
GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_RequisitionReport]    Script Date: 2/3/2020 6:33:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_RequisitionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
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
3.		Sanjit/03-20-2020					   substore integration
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			select req.RequisitionId,disp.DispatchId,convert(date,req.CreatedOn) as RequestedDate,
			convert(date,dispitm.CreatedOn) as DispatchDate,adt.WardName, itm.ItemName,sum(reqitm.Quantity) as RequestedQty,
			sum(dispitm.Quantity) as DispatchQty,dispitm.MRP, ROUND(sum(dispitm.Quantity)*dispitm.MRP, 2, 0) as TotalAmt,
			(select FullName from EMP_Employee as emp1 where emp1.EmployeeId = req.CreatedBy) as 'RequestedByUser',
			(select FullName from EMP_Employee as emp2 where emp2.EmployeeId = dispitm.CreatedBy) as 'DispatchedByUser',
			disp.ReceivedBy as 'ReceivedBy'
			from WARD_Requisition as req
			join ADT_MST_Ward as adt on req.WardId=adt.WardID
			join WARD_RequisitionItems as reqitm on req.RequisitionId= reqitm.RequisitionId
			join PHRM_MST_Item as itm on reqitm.ItemId= itm.ItemId
			left join WARD_Dispatch as disp on req.RequisitionId = disp.RequisitionId and req.StoreId = disp.StoreId
			left join WARD_DispatchItems as dispitm on reqitm.RequisitionItemId=dispitm.RequisitionItemId and disp.DispatchId = dispitm.DispatchId
			where req.StoreId = @StoreId and CONVERT(date, req.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by convert(date,req.CreatedOn),convert(date,dispitm.CreatedOn), adt.WardName,reqitm.Quantity,itm.ItemName, dispitm.MRP, 
			dispitm.Quantity,req.CreatedBy,dispitm.CreatedBy,req.RequisitionId,disp.DispatchId,disp.ReceivedBy
		END		
End
GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_StockReport]    Script Date: 2/3/2020 6:34:26 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_StockReport]  
	    @ItemId int = null	, @StoreId int = null	
AS
/*
FileName: [SP_WardReport_StockReport]
CreatedBy/date: Rusha/03-24-2019
Description: To get the Stock Details Such As ItemName, BatchNo, AvailableQty of Each Item Selected By User 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-24-2019					   shows stock details by item wise
2.		Sanjit/02-03-2020					   substore integration
----------------------------------------------------------------------------
*/

BEGIN
  IF (@ItemId !=0)
		BEGIN
			select adt.WardName,gen.GenericName,itm.ItemName,ward.BatchNo,sum(AvailableQuantity) as Quantity,ward.ExpiryDate, MRP from WARD_Stock as ward 
			join PHRM_MST_Item as itm on ward.ItemId= itm.ItemId 
			join PHRM_MST_Generic as gen on itm.GenericId = gen.GenericId
			join ADT_MST_Ward as adt on ward.WardId= adt.WardID   
			where itm.ItemId =@ItemId and ward.StoreId = @StoreId
			group by ItemName, MRP ,GenericName, adt.WardName, ward.BatchNo, ward.ExpiryDate
		END	
		else if (@ItemId =0)	
		begin 
		select adt.WardName,gen.GenericName,itm.ItemName,ward.BatchNo,sum(AvailableQuantity) as Quantity,ward.ExpiryDate, MRP from WARD_Stock as ward 
			join PHRM_MST_Item as itm on ward.ItemId= itm.ItemId 
			join PHRM_MST_Generic as gen on itm.GenericId = gen.GenericId
			join ADT_MST_Ward as adt on ward.WardId= adt.WardID   
			where ward.StoreId = @StoreId
			--where itm.ItemId  like '%'+isnull (@ItemId,'')+'%'
			group by ItemName, MRP,GenericName , adt.WardName, ward.BatchNo, ward.ExpiryDate
		end
End
GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_TransferReport]    Script Date: 2/3/2020 6:34:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_TransferReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null,
	@Status int = null,			--Ward to Ward report is shown in case of 1 and Ward to Pharmacy report in case of 0	
	@StoreId int = null
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
3.		Sanjit/02-03-2020					    substore integration
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
		if (@Status = 1)
			select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,adt.WardName as FromWard,
			adt2.WardName as ToWard, Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' 
			from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			join ADT_MST_Ward as adt2 on transc.newWardId=adt2.WardID
			where transc.StoreId = @StoreId and TransactionType = 'WardtoWard' and CONVERT(date, transc.CreatedOn) 
			BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName,adt2.WardName, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
		
		else if (@Status =0)
			(select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,adt.WardName as FromWard,
			transc.Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' 
			from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			where transc.StoreId = @StoreId and TransactionType = 'WardToPharmacy' and CONVERT(date, transc.CreatedOn) 
			BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
			)

		else
			select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,adt.WardName as FromWard,
			adt2.WardName as ToWard, Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' 
			from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			left join ADT_MST_Ward as adt2 on transc.newWardId=adt2.WardID
			where transc.StoreId = @StoreId and TransactionType in ('WardToPharmacy','WardtoWard') and CONVERT(date, transc.CreatedOn) 
			BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName,adt2.WardName, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
		END	
End
GO
--END:Sanjit: 3 Feb 2020 -- Added StoreId in Ward_Consumption table and changed Ward Requisition to Substore Requisition

--START: Deepak : 4th Feb 2020 Added adjustmenttotalamount column for the decimal part
ALTER TABLE BIL_TXN_BillingTransaction
ADD AdjustmentTotalAmount decimal(18, 2) NULL
GO
--END: Deepak : 4th Feb 2020 Added adjustmenttotalamount column for the decimal part

--START: Deepak : 5th Feb 2020 --Add column for Secondary Doctor
ALTER TABLE ADT_TXN_PatientBedInfo
ADD SecondaryDoctorId int NULL
GO
--END: Deepak : 5th Feb 2020 --Add column for Secondary Doctor

----START: Ashish-04Feb 2020  ---Add CC Charge list--
Insert into CORE_CFG_Parameters
values('Pharmacy','PharmacyCCChargeList2',' [{"CCChargeID":"1","CCChargevalue":"5.5"},  {"CCChargeID":"2","CCChargevalue":"6.5"},
  {"CCChargeID":"3","CCChargevalue":"7.5"},
  {"CCChargeID":"4","CCChargevalue":"8.5"},
  {"CCChargeID":"5","CCChargevalue":"9.5"}]','JSON',' CC Charges list  for pharmacy items','custom');
GO
----END: Ashish-04Feb 2020  ---Add CC Charge list--

----Start: Ashish-05Feb 2020  ---update  CC Charge list--
UPDATE [CORE_CFG_Parameters] 
SET ParameterName = 'PharmacyCCChargeList'
WHERE ParameterName = 'PharmacyCCChargeList2' and ParameterGroupName = 'Pharmacy';
GO
----END: Ashish-05Feb 2020  ---update CC Charge list--

--START: Sanjesh: 06 FEb 2020--IsNarcotics column added for pharmacy item table 
Alter table PHRM_MST_Item 

add  IsNarcotic bit not null default 0
Go
--END: Sanjesh: 06 FEb 2020--IsNarcotics column added for pharmacy item table 

----Start: Ashish-06Feb 2020  ---enable or disable Packing  in PHRM-goods-receipt-items---
Insert into CORE_CFG_Parameters
values('Pharmacy','PharmacyGRpacking','false','boolean','  enable or disable Packing in PHRM_GR. default is false.','custom');
Go
----End: Ashish-06Feb 2020  ---enable or disable Packing  in PHRM-goods-receipt-items--
--START: Vikas: 11 Feb 2020--Duplicate print and provisional return print permission
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('pharmacy-duplicateprints',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='pharmacy-duplicateprints')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Duplicate Prints', 'Pharmacy/DuplicatePrints','DuplicatePrints',@PermissionId,@RefParentRouteId,1,13,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('return-invoice-duplicate-print',@ApplicationId,1,GETDATE(),1);
GO
declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='return-invoice-duplicate-print')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy/DuplicatePrints')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,IsActive)
values ('Invoice Return', 'Pharmacy/DuplicatePrints/InvoiceReturn','InvoiceReturn',@PermissionId,@RefParentRouteId,1,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('provisionla-return-duplicate-print',@ApplicationId,1,GETDATE(),1);
GO
declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='provisionla-return-duplicate-print')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy/DuplicatePrints')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,IsActive)
values ('Provisional Return', 'Pharmacy/DuplicatePrints/ProvisionalReturn','ProvisionalReturn',@PermissionId,@RefParentRouteId,1,1);
GO
--END: Vikas: 11 Feb 2020--Duplicate print and provisional return print permission

--START: Rajib: 11 Feb 2020--Create script for WardReport InternalConsumptionReport
/****** Object:  StoredProcedure [dbo].[SP_WardReport_InternalConsumptionReport]    Script Date: 2/10/2020 12:44:45 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_WardReport_InternalConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null
	--@ConsumptionId int = null
AS
/*
FileName: [SP_WardReport_InternalConsumptionReport] '2018-01-01', '2020-02-10'
CreatedBy/date: Rajib/02-10-2020
Description: To get the Internal Consumption Details of Items From different Ward 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		
2.		
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) )
		BEGIN
			select CONVERT(date,consum.CreatedOn) as [ConsumedDate], depitm.DepartmentName,consumitem.ItemName, consum.ConsumedBy, consumitem.Quantity as Quantity 
			from WARD_InternalConsumption as consum 
			join WARD_InternalConsumptionItems as consumitem on consum.ConsumptionId=consumitem.ConsumptionId
			join MST_Department as depitm on consum.DepartmentId=depitm.DepartmentId
			where  CONVERT(date, consum.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by CONVERT(date,consum.CreatedOn),depitm.DepartmentName,consumitem.ItemName,consum.ConsumedBy,consumitem.Quantity
		END		
END
GO
--END: Rajib: 11 Feb 2020--Create script for WardReport InternalConsumptionReport

----START: Shankar: 11thfeb2020 requisition number column added---
Alter table INV_TXN_Requisition
add RequisitionNo int
GO

Alter table INV_TXN_Requisitionitems
add RequisitionNo int
GO

----END: Shankar: 11thfeb2020 requisition number column added---

---START: 13 Feb 2020: Merge with DEV  :
---START: Vikas: 12th Feb 2020- Updated script in Daily Dispatch report
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_DailyItemsDispatchReport]    Script Date: 02/12/2020 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Inventory_DailyItemsDispatchReport]  
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@DepartmentName NVARCHAR(max)=null
AS
/*
FileName: [SP_Report_Inventory_DailyItemsDispatchReport]
CreatedBy/date: Umed/2017-06-21
Description: to get Details such as itemNames , total dispatch qty of particular item with total amount generated between given dates
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/2017-06-21	                    created the script
2		Rusha/2019-06-06					updated the script
3		Vikas: 12th Feb 2020				updated the script
-------------------------------------------------------
*/
BEGIN

		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 OR (@DepartmentName IS NOT NULL) OR LEN(@DepartmentName) > 0)
				BEGIN
						SELECT CONVERT(date,dis.CreatedOn) AS [Date],dept.DepartmentName,itm.ItemName,dis.DispatchedQuantity,dis.ReceivedBy,
						CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS DispatchedBy,
						dis.RequisitionItemId,
						(dis.DispatchedQuantity * itm.StandardRate) as 'Amount'
						FROM INV_TXN_DispatchItems AS dis
						JOIN MST_Department AS dept ON dept.DepartmentId = dis.DepartmentId
						JOIN INV_TXN_RequisitionItems AS reqitm ON reqitm.RequisitionItemId = dis.RequisitionItemId
						JOIN INV_MST_Item AS itm ON itm.ItemId= reqitm.ItemId
						JOIN EMP_Employee AS emp ON emp.EmployeeId = dis.CreatedBy
						WHERE CONVERT(date,dis.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())+1
								AND dept.DepartmentName like '%'+ISNULL(@DepartmentName,'')+'%'	

				END
END
GO
---START: 13 Feb 2020: Merge with DEV  :

---START: 13 Feb 2020: Merged from EMR-1600_INV_ItemCode_ItemUnit branch
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
						gdrp.CreatedOn,
						unit.UOMName
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId and grd.IsCancel = 0
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				JOIN INV_MST_ItemSubCategory as itmsub on itm.SubCategoryId = itmsub.SubCategoryId
				left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
				WHERE stk.ItemId = @ItemId
				GROUP BY com.CompanyName,unit.UOMName,ven.VendorName,itm.ItemName,itm.Code,stk.BatchNO,gdrp.CreatedOn,itmsub.SubCategoryName,gdrp.ExpiryDate,itm.ItemType
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
						gdrp.CreatedOn,
						unit.UOMName
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId and grd.IsCancel = 0
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				JOIN INV_MST_ItemSubCategory as itmsub on itm.SubCategoryId = itmsub.SubCategoryId
				left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
				GROUP BY com.CompanyName, unit.UOMName, ven.VendorName,itm.ItemName,itm.Code,stk.BatchNO,gdrp.CreatedOn,itmsub.SubCategoryName,gdrp.ExpiryDate,itm.ItemType
			END 
END
GO
---------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_DailyItemsDispatchReport]  
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@DepartmentName NVARCHAR(max)=null
AS
/*
FileName: [SP_Report_Inventory_DailyItemsDispatchReport]
CreatedBy/date: Umed/2017-06-21
Description: to get Details such as itemNames , total dispatch qty of particular item with total amount generated between given dates
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/2017-06-21	                   created the script
2		Rusha/2019-06-06					updated the script
-------------------------------------------------------
*/
BEGIN

		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 OR (@DepartmentName IS NOT NULL) OR LEN(@DepartmentName) > 0)
				BEGIN
						SELECT CONVERT(date,dis.CreatedOn) AS [Date],dept.DepartmentName,itm.ItemName,dis.DispatchedQuantity,dis.ReceivedBy,
						CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS DispatchedBy,
						dis.RequisitionItemId,
						(dis.DispatchedQuantity * itm.StandardRate) as 'Amount',
						itm.Code,
						unit.UOMName 
						FROM INV_TXN_DispatchItems AS dis
						JOIN MST_Department AS dept ON dept.DepartmentId = dis.DepartmentId
						JOIN INV_TXN_RequisitionItems AS reqitm ON reqitm.RequisitionItemId = dis.RequisitionItemId
						JOIN INV_MST_Item AS itm ON itm.ItemId= reqitm.ItemId
						JOIN EMP_Employee AS emp ON emp.EmployeeId = dis.CreatedBy						
						left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
						WHERE CONVERT(date,dis.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())+1
								AND dept.DepartmentName like '%'+ISNULL(@DepartmentName,'')+'%'	

				END
END
GO

-------------


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
							convert(date,(po.CreatedOn+poitm.DeliveryDays) )as DueDate,
							unit.UOMName,msitm.Code
					FROM    INV_TXN_PurchaseOrder po
					INNER JOIN INV_TXN_PurchaseOrderItems poitm ON poitm.PurchaseOrderId =po.PurchaseOrderId
					INNER JOIN INV_MST_Item msitm ON msitm.ItemId = poitm.ItemId
					left join INV_MST_UnitOfMeasurement unit on msitm.UnitOfMeasurementId = unit.UOMId
				    WHERE CONVERT(date,po.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())+1
			     	AND poitm.PurchaseOrderId  like '%'+ISNULL(@OrderNumber,'')+'%' and po.IsCancel = 0
							

				END
END
GO
-------------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_InventoryValuation]

AS
BEGIN
/* 
here we take item rate from INV_TXN_GoodsReceiptItems and its  available quantity from INV_TXN_Stock 
and then calculate amount for the item.
*/
SELECT A.ItemName,A.UOMName,A.Code, ROUND((SUM(A.Amt)/SUM(A.Qty)),2) Rate,SUM(A.Qty) Quantity,SUM(A.Amt) Amount FROM 
(
	SELECT Itm.ItemName,grItm.ItemRate,stk.AvailableQuantity Qty,
	grItm.ItemRate * stk.AvailableQuantity Amt, unit.UOMName,Itm.Code FROM INV_TXN_Stock stk
	JOIN INV_TXN_GoodsReceiptItems grItm ON stk.GoodsReceiptItemId = grItm.GoodsReceiptItemId
	JOIN INV_MST_Item Itm ON stk.ItemId = Itm.ItemId
	left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
	WHERE stk.AvailableQuantity > 0
) A
GROUP BY A.ItemName,A.UOMName,A.Code

END
GO
------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_ComparePoAndGR]

AS
BEGIN

	BEGIN
		select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, itm.ItemName, vendor.VendorName, pitms.CreatedOn,pitms.Quantity,(gitms.ReceivedQuantity + gitms.FreeQuantity) RecevivedQuantity, gitms.CreatedOn Receivedon, gr.GoodsReceiptID, gr.PurchaseOrderId
  	,unit.UOMName,Itm.Code
 from INV_TXN_GoodsReceipt gr
 join INV_TXN_GoodsReceiptItems gitms on gitms.GoodsReceiptId = gr.GoodsReceiptId
 join INV_TXN_PurchaseOrderItems pitms on pitms.PurchaseOrderId = gr.PurchaseOrderId 
 join INV_MST_Item itm on gitms.ItemId = itm.ItemId
 join INV_MST_Vendor vendor on vendor.VendorId = gr.VendorId
				left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
 where gitms.ItemId = pitms.ItemId and gr.IsCancel = 0
 order by gr.PurchaseOrderId desc

	END
END
GO
--------


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
  	,unit.UOMName,Itm.Code
 from INV_TXN_GoodsReceipt gr   
 join INV_TXN_GoodsReceiptItems gitms on gitms.GoodsReceiptId = gr.GoodsReceiptId
 join INV_TXN_PurchaseOrderItems pitms on pitms.PurchaseOrderId = gr.PurchaseOrderId 
 join INV_MST_Item itm on gitms.ItemId = itm.ItemId
 join INV_TXN_PurchaseOrder PO on PO.PurchaseOrderId = pitms.PurchaseOrderId
 join INV_MST_Vendor vendor on vendor.VendorId = gr.VendorId
left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
 where gitms.ItemId = pitms.ItemId AND gr.IsCancel = 0
 order by gr.PurchaseOrderId desc

        END
END
GO
----------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_WriteOffReport] 
		@ItemId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1.		Rusha/ 05-29-2019					Created Script for writeoff report
----------------------------------------------------------
*/
BEGIN
		If(@ItemId > 0)
			BEGIN
				SELECT witm.WriteOffDate,itm.ItemName, witm.BatchNO, witm.WriteOffQuantity,witm.ItemRate,witm.TotalAmount, 			
				unit.UOMName,Itm.Code,
				CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS RequestedBy,witm.Remark 
				FROM INV_TXN_WriteOffItems AS witm
				JOIN INV_MST_Item AS itm ON itm.ItemId = witm.ItemId
				JOIN EMP_Employee AS emp ON emp.EmployeeId = witm.CreatedBy
				left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
				WHERE witm.ItemId = @ItemId
			END
        ELSE 
		    BEGIN
				SELECT witm.WriteOffDate,itm.ItemName, witm.BatchNO, witm.WriteOffQuantity,witm.ItemRate,witm.TotalAmount, 
				unit.UOMName,Itm.Code,
				CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS RequestedBy,witm.Remark 
				FROM INV_TXN_WriteOffItems AS witm
				JOIN INV_MST_Item AS itm ON itm.ItemId = witm.ItemId
				JOIN EMP_Employee AS emp ON emp.EmployeeId = witm.CreatedBy
				left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
			END 
END
GO
---

ALTER PROCEDURE [dbo].[SP_Report_Inventory_FixedAssets]  		
	@FromDate datetime=null,
	@ToDate datetime=null		
AS
/*
FileName: [SP_Report_Inventory_FixedAssets]
CreatedBy/date: Rusha/07-05-2019
Description: To get the Details of Fixed assets goods of inventory
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------

----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) AND (@ToDate IS NOT NULL))
		BEGIN
			DECLARE @inv_name VARCHAR(MAX);
			SET @inv_name='Inventory Store';

			SELECT x.[Date],x.[Name],x.ItemName,x.Qty,x.MRP,SUM(x.Qty * x.MRP) AS TotalAmt ,X.UOMName,X.Code
			FROM (
					SELECT 
						CONVERT(date,gritm.CreatedOn) AS [Date],
						dep.DepartmentName AS [Name],
						itm.ItemName,
						dis.DispatchedQuantity AS Qty,
						gritm.ItemRate AS MRP,
						unit.UOMName,Itm.Code
					FROM INV_TXN_Stock AS stk
						JOIN INV_TXN_GoodsReceiptItems AS gritm ON gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
						JOIN INV_TXN_DispatchItems AS dis ON stk.ItemId = dis.ItemId
						JOIN INV_MST_Item AS itm ON itm.ItemId = stk.ItemId
						JOIN MST_Department AS dep ON dep.DepartmentId = dis.DepartmentId
						left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
					WHERE 
						itm.ItemType = 'Capital Goods' AND 
						CONVERT(date, gritm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND 
						ISNULL(@ToDate,GETDATE())+1
					GROUP BY CONVERT(date,gritm.CreatedOn),
						itm.ItemName,dep.DepartmentName,gritm.ItemRate,dis.DispatchedQuantity,unit.UOMName,Itm.Code

					UNION ALL

					SELECT  
						CONVERT(date,gritm.CreatedOn) AS [Date],
						@inv_name AS [Name],
						itm.ItemName,
						SUM(stk.AvailableQuantity) AS Qty,
						gritm.ItemRate AS MRP ,
						unit.UOMName,Itm.Code
					FROM INV_TXN_Stock AS stk
						JOIN INV_MST_Item AS itm on itm.ItemId = stk.ItemId
						JOIN INV_TXN_GoodsReceiptItems as gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId					
						left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
					WHERE itm.ItemType = 'Capital Goods' AND CONVERT(date, gritm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
					GROUP BY CONVERT(date,gritm.CreatedOn),itm.ItemName,gritm.ItemRate,unit.UOMName,Itm.Code) x
			GROUP BY x.[Date],x.[Name],x.ItemName,x.Qty,x.MRP,X.UOMName,X.Code

		END	
END
GO
------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_GoodReceiptEvaluation]
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
    select gr.GoodsReceiptID,itm.ItemName,itm.Code,itm.ItemType,gritm.BatchNO,gritm.ItemRate,stktxn.TransactionType,stktxn.Quantity,stktxn.InOut,stktxn.CreatedOn as 'TransactionDate',stktxn.ReferenceNo,emp.FirstName as 'TransactionBy',
	unit.UOMName
	from INV_TXN_StockTransaction as stktxn
    
    join INV_TXN_Stock as stk on stktxn.StockId = stk.StockId
    join INV_TXN_GoodsReceiptItems as gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
    join INV_TXN_GoodsReceipt as gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
    join INV_MST_Item as itm on stk.ItemId = itm.ItemId
    join EMP_Employee as emp on stktxn.CreatedBy = emp.EmployeeId
    left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
    where gr.GoodsReceiptID = @GoodReceiptId and stkTxn.TransactionType like ISNULL(@TransactionType,'%') and CONVERT(date,stktxn.CreatedOn) between ISNULL(@FromDate,'2010-01-01') and ISNULL(@ToDate,GETDATE())
    order by stktxn.CreatedOn desc
  END
  ELSE
  BEGIN
    select gr.GoodsReceiptID,itm.ItemName,itm.Code,itm.ItemType,gritm.BatchNO,gritm.ItemRate,stktxn.TransactionType,stktxn.Quantity,stktxn.InOut,stktxn.CreatedOn as 'TransactionDate',stktxn.ReferenceNo,emp.FirstName as 'TransactionBy',
	unit.UOMName
	from INV_TXN_StockTransaction as stktxn    
	join INV_TXN_Stock as stk on stktxn.StockId = stk.StockId
    join INV_TXN_GoodsReceiptItems as gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
    join INV_TXN_GoodsReceipt as gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
    join INV_MST_Item as itm on stk.ItemId = itm.ItemId
    join EMP_Employee as emp on stktxn.CreatedBy = emp.EmployeeId
    left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
    where stkTxn.TransactionType like ISNULL(@TransactionType,'%') and CONVERT(date,stktxn.CreatedOn) between ISNULL(@FromDate,'2010-01-01') and ISNULL(@ToDate,GETDATE())
    order by stktxn.CreatedOn desc
  END
END
GO
-----




ALTER PROCEDURE [dbo].[SP_Report_Inventory_InventorySummaryReport]  
@FromDate Date=null,
@ToDate Date=null, 
@ItemName NVARCHAR(max)=null
as


BEGIN

	SELECT  itmDate.Dates 
	        --,itmDate.ItemId
			,itmDate.ItemName
			,itmDate.UOMName
			,itmDate.ItemRates
			,itmDate.Code
			,ISNULL(stIn.PurchaseQty,0) as PurchaseQty
			,ISNULL(stIn.Pvalue,0) As PurchaseValue
			,ISNULL(stOut.dispatchQty,0) as DispatchQty
			,ISNULL(stOut.dvalue,0) as DispatchValue
			,ISNULL(stOut.writeoffQty,0) as WriteoffQty
			,ISNULL(stOut.writeoffvalue,0) as WriteoffValue
			,ISNULL(stOut.ReturnToVendorQty,0) as ReturnToVendorQty
			,ISNULL(stOut.ReturnToVendorvalue,0) as ReturnToVendorValue

 FROM 

 (
	   SELECT DISTINCT d.Dates,itm.ItemId,itm.ItemName,itm.UnitOfMeasurementId,uom.UOMName, gr.ItemRate as ItemRates,itm.Code
	   FROM  
			  FN_COMMON_GetAllDatesBetweenRange(@FromDate,@ToDate) d  
			  ----calling Table value Function Through SP
			, INV_MST_Item itm, INV_MST_UnitOfMeasurement uom , INV_TXN_GoodsReceiptItems gr
			WHERE itm.UnitOfMeasurementId = uom.UOMId
 ) itmDate

Left Join
(
		  ---this table is for to get Purchase quantity and Purchase value of Each items 
		   SELECT DISTINCT 
				   gr.ItemId
				   ,convert(date,s.CreatedOn) AS Dates
				   ,gr.ItemRate AS itemrate 
				   ,SUM(s.ReceivedQuantity) AS PurchaseQty 
				   ,(gr.ItemRate*SUM(s.ReceivedQuantity)) AS Pvalue
		   FROM INV_TXN_Stock  s 
						 INNER JOIN INV_TXN_GoodsReceiptItems gr 
						 ON s.goodsreceiptitemid=gr.goodsreceiptitemid
		  GROUP BY  convert(date,s.CreatedOn),gr.ItemId,itemrate
) stIn

ON  stIn.Dates = itmDate.Dates AND itmDate.ItemId=stIn.ItemId

left join
  
  (   
		 ---this table is for to get Dispatch quantity , Dispatch value , Writeoff quantity ,Writeoff value and  of Each items 
		SELECT DISTINCT 
				   gr.ItemId
				  ,gr.ItemRate 
				  ,convert(date,sttxn.CreatedOn) AS Dates
				  ,SUM(case WHEN TransactionType='dispatch' THEN sttxn.Quantity ELSE 0 END) AS dispatchQty
				  , (gr.ItemRate*(SUM(CASE WHEN TransactionType='dispatch' THEN sttxn.Quantity ELSE 0 END))) AS dvalue
				  ,SUM(CASE WHEN TransactionType='writeoff' THEN sttxn.Quantity ELSE 0 END) AS writeoffQty 
				  , (gr.ItemRate*(SUM(CASE WHEN TransactionType='writeoff' THEN sttxn.Quantity ELSE 0 END))) AS writeoffvalue
				  ,SUM(CASE WHEN TransactionType='returntovendor' THEN sttxn.Quantity ELSE 0 END) AS ReturnToVendorQty 
				  , (gr.ItemRate*(SUM(CASE WHEN TransactionType='returntovendor' THEN sttxn.Quantity ELSE 0 END))) AS ReturnToVendorvalue
		 FROM INV_TXN_Stock s 
					 INNER JOIN INV_TXN_GoodsReceiptItems gr 
					   ON s.goodsreceiptitemid=gr.goodsreceiptitemid
					 INNER JOIN INV_TXN_StockTransaction sttxn 
					   ON sttxn.StockId = s.StockId
		 GROUP BY convert(date,sttxn.CreatedOn) ,gr.ItemId, gr.ItemRate 
)  stOut   

ON itmDate.Dates=stOut.Dates AND itmDate.ItemId=stOut.ItemId	 

---we'll take the row if something is present in it.
WHERE ( stIn.PurchaseQty IS NOT NULL  OR 
         stOut.dispatchQty IS NOT NULL OR stOut.writeoffQty IS NOT NULL ) 
		 AND itmDate.ItemName like '%'+ISNULL(@ItemName,'')+'%' 
      AND (itmDate.ItemRates = stIn.itemrate OR itmDate.ItemRates = stOut.ItemRate)

END
GO
------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_ReturnToVendorReport] 
		@VendorId int = 0 
AS

/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1.		Rusha/ 05-29-2019					Created Script for Return to Vendor Report
----------------------------------------------------------
*/

BEGIN
		If(@VendorId > 0)
			BEGIN
				SELECT rtn.CreatedOn,ven.VendorName,rtn.CreditNoteNo,itm.ItemName, rtn.Quantity,rtn.ItemRate,rtn.TotalAmount,
				rtn.Remark,CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS ReturnedBy,
				unit.UOMName,itm.Code
				FROM INV_TXN_ReturnToVendorItems AS rtn
				JOIN INV_MST_Vendor AS ven ON ven.VendorId = rtn.VendorId
				JOIN EMP_Employee AS emp ON emp.EmployeeId = rtn.CreatedBy
				JOIN INV_MST_Item AS itm ON itm.ItemId = rtn.ItemId
				left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
				WHERE rtn.VendorId = @VendorId
			END
        ELSE 
		    BEGIN
				SELECT rtn.CreatedOn,ven.VendorName,rtn.CreditNoteNo,itm.ItemName, rtn.Quantity,rtn.ItemRate,rtn.TotalAmount,
				rtn.Remark,CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS ReturnedBy,
				unit.UOMName,itm.Code
				FROM INV_TXN_ReturnToVendorItems AS rtn
				JOIN INV_MST_Vendor AS ven ON ven.VendorId = rtn.VendorId
				JOIN EMP_Employee AS emp ON emp.EmployeeId = rtn.CreatedBy
				JOIN INV_MST_Item AS itm ON itm.ItemId = rtn.ItemId
				left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
			END 
END
GO
------
---START: 13 Feb 2020: Merged from EMR-1600_INV_ItemCode_ItemUnit branch
--START: 13 Feb 2020: NageshBB Merged EMR-1476_NarcoticReportfor_salesandstock to DEV
---------start: Ashish-12feb 2020 --add  new routes for Narcotics stock and sales report, new sp for Narcoticsstock report-------
declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Pharmacy' and ApplicationCode= 'PHRM');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('reports-pharmacy-dailyNarcoticssalesreport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='reports-pharmacy-dailyNarcoticssalesreport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Pharmacy/Report')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Narcotics Daily Sales  ','Pharmacy/Report/PHRMNarcoticsDailySalesReport','PHRMNarcoticsDailySalesReport',@permissionId,@parentRouteId,1,1)
go
------------for stock
declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Pharmacy' and ApplicationCode= 'PHRM');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('reports-pharmacy-Narcoticsstockreport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='reports-pharmacy-Narcoticsstockreport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Pharmacy/Report')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Narcotics Stock  ','Pharmacy/Report/PHRMNarcoticsStockReport','PHRMNarcoticsStockReport',@permissionId,@parentRouteId,1,1)
go


/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_NarcoticsDispensaryStoreStockReport]    Script Date: 12-02-2020 09:08:02 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRMReport_NarcoticsDispensaryStoreStockReport]
AS
/*
FileName: [SP_PHRMReport_NarcoticsDispensaryStoreStockReport]
CreatedBy/date: Ashish/12-02-2020
Description: To get the Stock Value of both dispensary and store wise for Narcotics Stock report
*/


BEGIN
	DECLARE @dis_name VARCHAR(MAX);
		SET @dis_name='Dispensary';
		SELECT * FROM (	
				SELECT itm.ItemName,dis.BatchNo AS BatchNo, dis.ExpiryDate, dis.MRP,
				dis.AvailableQuantity AS StockQty,@dis_name as [Name]
				FROM PHRM_DispensaryStock AS dis 
				JOIN PHRM_MST_Item AS itm ON dis.ItemId = itm.ItemId
				where dis.AvailableQuantity>0 and itm.IsNarcotic='true'
				UNION ALL

				
									SELECT  
										x1.ItemName,
										x1.BatchNo,
										x1.ExpiryDate,
										Round(x1.MRP,2,0) AS MRP,
										SUM(InQty- OutQty+FInQty-FOutQty) AS StockQty,
										x1.StoreName as [Name]
									FROM

									(
											select 
													stk.ItemName, 
													stk.BatchNo as BatchNo, 
													stk.ExpiryDate, 
													stk.MRP,
													stk.StoreName,
														SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
																SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
																SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
																SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
											from PHRM_StoreStock stk
											join PHRM_MST_Item itm on stk.ItemId = itm.ItemId
											where itm.IsNarcotic ='true' and stk.Quantity>0 and stk.FreeQuantity>0
											GROUP BY stk.ItemName, stk.BatchNo , stk.ExpiryDate, stk.MRP,stk.StoreName
									) as x1
									GROUP BY x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.MRP, x1.StoreName
				) a



END
Go
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_NarcoticsDispensaryStoreStockReport]    Script Date: 12-02-2020 09:08:02 AM ******/



---------END: Ashish-12feb 2020 --add  new routes for Narcotics stock and sales report, new sp for Narcoticsstock report-------
--END: 13 Feb 2020: NageshBB Merged EMR-1476_NarcoticReportfor_salesandstock to DEV

--START:13 Feb 2020 NageshBB Merged from DEV to EMR-1525-1526-INV_VendorChanges
--START: Sanjesh: 12 FEb 2020--CountryId column added for inventory vendor table 
Alter table inv_mst_vendor
	add CountryId int null  
	GO
--END: Sanjesh: 12 FEb 2020--CountryId column added for inventory vendor table 
--END:13 Feb 2020 NageshBB Merged from DEV to EMR-1525-1526-INV_VendorChanges


--START:Merged Branch: NageshBB: 16 Feb 2020: accounting branch merged with dev branch

-- START: Vikas:4th feb,2020: Create script for accounting ledger group

Insert into CORE_CFG_Parameters
values('Accounting','LedgerGroupMapping',
'[
{"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"pharmacysupplier"},
{"LedgergroupUniqueName":"LCL_CONSULTANT(CREDIT_A/C)", "LedgerType":"consultant"},
{"LedgergroupUniqueName":" ", "LedgerType":"inventoryvendor"}
]','JSON','Ledger Mapping Parameters','custom');
Go
-- END: Vikas:4th feb,2020: Create script for accounting ledger group

-- START: NageshBB: 07 Feb 2020: trigger updated for name creation issue fixing

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
2		NageshBB 07 Feb 2020		updated for  unique name issue 
=======================================================
*/
ALTER TRIGGER [dbo].[TRG_Update_Ledger]
   ON  [dbo].[ACC_Ledger]
   AFTER INSERT
AS 
BEGIN
 
	IF((SELECT IsNull (Name,'') FROM inserted) ='' )
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
Go

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
2		NageshBB 07 Feb 2020		updated for  unique name issue 
=======================================================
*/
ALTER TRIGGER [dbo].[TRG_Update_LedgerGroup]
   ON  [dbo].[ACC_MST_LedgerGroup]
   AFTER INSERT
AS 
BEGIN
	IF((SELECT IsNull (Name,'') FROM inserted) ='' )
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
Go

-- END: NageshBB: 07 Feb 2020: trigger updated for name creation issue fixing
--START: NageshBB:  14 Feb 2020: Accounting changes for charak and hams
--update section list with section code column and values 
update CORE_CFG_Parameters set ParameterValue='{"SectionList":[{ "SectionId": 1, "SectionName": "Inventory","SectionCode":"INV" }, { "SectionId": 2, "SectionName": "Billing","SectionCode":"BL"  },{ "SectionId": 3, "SectionName": "Pharmacy","SectionCode":"PH"  },{ "SectionId": 4, "SectionName": "Manual_Voucher","SectionCode":""  }]}'
where ParameterGroupName='accounting' and ParameterName='SectionList'
Go


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<salakha>
-- Create date: <23 Nov 2018>
-- Description:	<get income ledgers>
-- =============================================
--select  dbo.[FN_ACC_GetIncomeLedgerName] ('LABORATORY','')
ALTER FUNCTION [dbo].[FN_ACC_GetIncomeLedgerName] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(300)

AS
BEGIN	
  Declare @retStringName varchar(300)
  if exists(select top 1  * from ACC_MST_Hospital where HospitalShortName='CHARAK' and IsActive=1)
  Begin
       set @retStringName= (select LedgerName from ACC_Ledger where [Name]='RR_INCOME_SERVICESINCOME_SERVICES')
  End
  else 
  Begin   
  set @retStringName=  ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
			when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
			when (@ServiceDeptName='LABORATORY' and @ItemName='HISTO')  THEN ('HISTO') 
			when (@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY' and @ItemName like '%FNAC%')  THEN ('FNAC') 
			when (@ServiceDeptName='ATOMIC ABSORTION')
					OR(@ServiceDeptName='BIOCHEMISTRY')
					OR(@ServiceDeptName='CLNICAL PATHOLOGY')
					OR(@ServiceDeptName='CLINICAL PATHOLOGY')
					OR(@ServiceDeptName='CYTOLOGY')
					OR(@ServiceDeptName='KIDNEY BIOPSY')
					OR(@ServiceDeptName='SKIN BIOPSY')
					OR(@ServiceDeptName='CONJUNCTIVAL BIOPSY')
					OR(@ServiceDeptName='EXTERNAL LAB-3')
					OR(@ServiceDeptName='EXTERNAL LAB - 1')
					OR(@ServiceDeptName='EXTERNAL LAB - 2')
					OR(@ServiceDeptName='HISTOPATHOLOGY')
					OR(@ServiceDeptName='IMMUNOHISTROCHEMISTRY')
					OR(@ServiceDeptName='MOLECULAR DIAGNOSTICS')
					OR(@ServiceDeptName='SPECIALISED BIOPHYSICS ASSAYS')
					OR(@ServiceDeptName='SEROLOGY')
					OR(@ServiceDeptName='MICROBIOLOGY')
					OR(@ServiceDeptName='HEMATOLOGY') 
					OR(@ServiceDeptName='LABORATORY')
					OR(@ServiceDeptName='LAB CHARGES') THEN ('PATHOLOGY')
					
		   WHEN (@ServiceDeptName='DUCT')
					OR(@ServiceDeptName='MAMMOLOGY')
					OR(@ServiceDeptName='PERFORMANCE TEST') 
					OR(@ServiceDeptName='MRI')
					OR(@ServiceDeptName='C.T. SCAN')
					OR(@ServiceDeptName='ULTRASOUND')
					OR(@ServiceDeptName='ULTRASOUND COLOR DOPPLER')
					OR(@ServiceDeptName='BMD-BONEDENSITOMETRY')
					OR(@ServiceDeptName='OPG-ORTHOPANTOGRAM')
					OR(@ServiceDeptName='MAMMOGRAPHY')
					OR(@ServiceDeptName='X-RAY')
					OR(@ServiceDeptName='DEXA')
					OR(@ServiceDeptName='IMAGING')  		THEN ('RADIOLOGY')
		  when (@ServiceDeptName='MISCELLANEOUS')
					OR (@ServiceDeptName='MISCELLENOUS CHARGES')
															then ('MISCELLANEOUS')
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
				OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )
 
  end
  return @retStringname
END
Go

--START: NageshBB:  14 Feb 2020: Accounting changes for charak and hams

--END:Merged Branch: NageshBB: 16 Feb 2020: accounting branch merged with dev branch

---START: Sanjit : 18th feb 2020: Correction in Pharmacy Ward Requisition RouteConfig and Permission Mapping.
GO
declare @PermissionId INT
SET @PermissionId = (Select TOP(1) ApplicationId from RBAC_Permission where PermissionName='pharmacy-ward-requisition-view' );

update RBAC_RouteConfig
set PermissionId = @PermissionId
where DisplayName = 'Substore Request' and UrlFullPath='Pharmacy/WardRequisition' and RouterLink = 'WardRequisition'
GO
---END: Sanjit : 18th feb 2020: Correction in Pharmacy Ward Requisition RouteConfig and Permission Mapping.

----Start: Shankar 19th Feb 2020, Added middle name to the patients name---

/****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_DailyAppointmentReport]    Script Date: 02/19/2020 10:29:45 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Appointment_DailyAppointmentReport] 
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@Doctor_Name varchar(max) = null,
	@AppointmentType varchar(max) = null
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
1       Umed/2017-06-06						created the script
2       Umed/2017-06-14						modify i.e remove time from date and apply IsNULL with i/p parameter
3       Umed/2018-04-23						Modified Whole SP because initially we are taking Appointment from PAT_Appointment and Now We are Taking From Visits
4       Salakha/2018-10-05					Modify Datetime cancatenate from VisiteDate and VisitTime
5		Rusha/2019-18-06					Updated of script according to provider name and appointment type
6       Shankar/2020-19-02                  Added middle name to the patients name
--------------------------------------------------------
*/
BEGIN
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 AND (@Doctor_Name IS NOT NULL)
        OR (LEN(@Doctor_Name) > 0 AND (@AppointmentType IS NOT NULL)
        OR (LEN(@AppointmentType) > 0)))
		BEGIN
			SELECT
					CONVERT(datetime, CONVERT(date, patApp.VisitDate)) + CONVERT(datetime, VisitTime) as 'Date',patPait.PatientCode,
						patPait.FirstName +' '+patPait.MiddleName+' '+ patPait.LastName AS Patient_Name,patPait.PhoneNumber,patPait.Age,patPait.Gender,
						 patApp.AppointmentType,patApp.VisitType,
						 patApp.ProviderName AS Doctor_Name,patApp.ProviderId,
					patApp.VisitStatus
				FROM PAT_PatientVisits AS patApp
					INNER JOIN PAT_Patient AS patPait ON patApp.PatientId = patPait.PatientId
					WHERE CONVERT(date, patApp.VisitDate) BETWEEN @FromDate AND @ToDate and 
					patApp.ProviderName LIKE '%' + ISNULL(@Doctor_Name, '') + '%' and
					patApp.AppointmentType LIKE '%' + ISNULL(@AppointmentType, '') + '%'
					ORDER BY CONVERT(datetime, CONVERT(date, patApp.VisitDate)) + CONVERT(datetime, patApp.VisitTime) DESC

				END
END
GO
----End: Shankar 19th Feb 2020, Added middle name to the patients name---
--START: NageshBB: 20 FEb 2020: Merged: EMR-1555-INV_ItemManagementDetail into DEV
--START: Sanjesh: 17 FEb 2020-- created a item management detail report inventory 
Alter table inv_mst_item
	add ModifiedBy int null,
     ModifiedOn	datetime null 
GO	
	/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_ItemMgmtDetail]     ******/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Sanjesh>
-- Create date: <14/02/20>
-- Description:	<To get the item management detail report>
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_Inventory_ItemMgmtDetail] 
	
AS
BEGIN
    BEGIN
	
	select 	
	 itm.ItemName,
	 usr.UserName AS CreatedBy,
	 itm.CreatedOn,
	 usr1.UserName As ModifiedBy,
	 itm.ModifiedOn  
	 from INV_MST_Item itm
	left join  RBAC_User usr on itm.CreatedBy= usr.UserId
	left join  RBAC_User usr1 on itm.ModifiedBy = usr1.UserId
   END
END
GO
/*inventory-reports-itmmgmtdetail-view in Inventory/Reports---*/
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Inventory' and ApplicationCode='INV');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('inventory-reports-itmmgmtdetail-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='inventory-reports-itmmgmtdetail-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Inventory/Reports')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, css, DefaultShow, IsActive)
values ('Item Management Detail', 'Inventory/Reports/ItemMgmtDetail','ItemMgmtDetail',@PermissionId,@RefParentRouteId,'fa fa-calendar fa-stack-1x text-white',1,1);
GO
--END: Sanjesh: 17 FEb 2020-- created a item management detail report inventory  
--END: NageshBB: 20 FEb 2020: Merged: EMR-1555-INV_ItemManagementDetail into DEV

---START:Rusha: merged from IPBilling branch-20th feb 2020
-----Start Shankar: 13thFeb2020 Added Subtotal, discountamt and credit organization columns in PatientCreditSummary report.------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_PatientCreditSummary]    Script Date: 02/12/2020 5:45:26 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BIL_PatientCreditSummary] 
@FromDate Date=null ,
@ToDate Date=null	
AS
/*
FileName: [dbo].[SP_Report_BIL_PatientCreditSummary] '2018-01-01', '2019-03-05'
CreatedBy/date: Umed/20-07-2017
Description: to get Sum of Total Amount collected of each patient Between Given Dates 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/20-07-2017	                   created the script
2        Umed/25-07-2017                   added lasttxndate and done sum of totalamt and added SN
3.		Ramavtar/05June'18				changed whole script for Credit Summary -- still need review and changes in this report
4.		Dinesh/21st Feb'19					Date filter added includng date, Remarks and Invoice No
5.      Shankar/13th Feb'20                Added subtotal, discount amount and credit organization.
------------------------------------------------------------------------------------------------------
*/
BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN 
    
SELECT
  (CAST(ROW_NUMBER() OVER (ORDER BY pat.PatientCode) AS int)) AS SN,
  txn.CreatedOn,
  txn.PatientId,
  pat.PatientCode,
  pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
  txn.InvoiceNo,
  txn.Remarks,
  org.OrganizationName,
  txn.DiscountAmount,
  txn.SubTotal,
  SUM(txn.TotalAmount) 'TotalAmount'
FROM BIL_TXN_BillingTransaction txn
JOIN BIL_MST_Credit_Organization org
  ON txn.OrganizationId = org.OrganizationId
JOIN PAT_Patient pat
  ON txn.PatientId = pat.PatientId
WHERE txn.BillStatus = 'unpaid'
AND ISNULL(txn.ReturnStatus, 0) != 1 and CONVERT(date,txn.CreatedOn) between @FromDate and @ToDate
GROUP BY txn.PatientId,
         pat.PatientCode,
         pat.FirstName,
         pat.LastName,
         pat.MiddleName,
		 txn.InvoiceNo,
		 txn.Remarks,
		 txn.CreatedOn,
		 org.OrganizationName,
		 txn.DiscountAmount,
		 txn.SubTotal
		 
END
END

GO

-----End Shankar: 13thFeb2020 Added Subtotal, discountamt and credit organization columns in PatientCreditSummary report.------

---ENDRusha: merged from IPBilling branch -20th feb 2020

--START:Rusha: 20th feb 2020---merged: Wardsupply to Dev
---Start: Sanjit 10 Feb,2020 -- removed ward from all the reports for substore and made wardId nullable in Ward_Transaction
GO
Alter Table WARD_Transaction
Alter Column WardId int null
GO

/****** Object:  StoredProcedure [dbo].[SP_WardReport_BreakageReport]    Script Date: 2/10/2020 1:07:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_BreakageReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardReport_BreakageReport]
CreatedBy/date: Rusha/03-26-2019
Description: To get the Details of Breakage Items From different Ward 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-29-2019					   get details of breakage items
2.		Sanjit/02-03-2020						substore integration
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and (@StoreId IS NOT NULL))
		BEGIN
			select convert(date,transc.CreatedOn) as [Date], ItemName, transc.Quantity,stk.MRP,
			Round(stk.MRP*transc.Quantity,2,0) as TotalAmt,transc.Remarks 
			FROM WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join WARD_Stock as stk on transc.StockId=stk.StockId and transc.ItemId = stk.ItemId 
			where transc.StoreId = @StoreId and TransactionType = 'BreakageItem' and CONVERT(date, transc.CreatedOn) 
			BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by convert(date,transc.CreatedOn), itm.ItemName, transc.Quantity,transc.Remarks,stk.MRP,transc.Quantity
		END	
End

GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_ConsumptionReport]    Script Date: 2/10/2020 1:09:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_ConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardReport_ConsumptionReport]
CreatedBy/date: Rusha/03-26-2019
Description: To get the Consumption Details of Items From different Ward 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-29-2019					   add stock details of consumed item from different ward
2.		Sanjit/02-03-2020						substore integration
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and (@StoreId IS NOT NULL))
		BEGIN
			select CONVERT(date,consum.CreatedOn) as [Date], consum.ItemName, gene.GenericName, consum.Quantity as Quantity 
			FROM WARD_Consumption as consum 
			join PHRM_MST_Item as itm on consum.ItemId=itm.ItemId
			join PHRM_MST_Generic as gene on  itm.GenericId=gene.GenericId
			where consum.StoreId = @StoreId and CONVERT(date, consum.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by CONVERT(date,consum.CreatedOn),consum.ItemName,consum.Quantity, gene.GenericName
		END		
End

GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_RequisitionReport]    Script Date: 2/10/2020 1:10:14 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_WardReport_RequisitionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
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
3.		Sanjit/03-20-2020					   substore integration
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			select req.RequisitionId,disp.DispatchId,convert(date,req.CreatedOn) as RequestedDate,
			convert(date,dispitm.CreatedOn) as DispatchDate, itm.ItemName,sum(reqitm.Quantity) as RequestedQty,
			sum(dispitm.Quantity) as DispatchQty,dispitm.MRP, ROUND(sum(dispitm.Quantity)*dispitm.MRP, 2, 0) as TotalAmt,
			(select FullName from EMP_Employee as emp1 where emp1.EmployeeId = req.CreatedBy) as 'RequestedByUser',
			(select FullName from EMP_Employee as emp2 where emp2.EmployeeId = dispitm.CreatedBy) as 'DispatchedByUser',
			disp.ReceivedBy as 'ReceivedBy'
			from WARD_Requisition as req
			join WARD_RequisitionItems as reqitm on req.RequisitionId= reqitm.RequisitionId
			join PHRM_MST_Item as itm on reqitm.ItemId= itm.ItemId
			left join WARD_Dispatch as disp on req.RequisitionId = disp.RequisitionId and req.StoreId = disp.StoreId
			left join WARD_DispatchItems as dispitm on reqitm.RequisitionItemId=dispitm.RequisitionItemId and disp.DispatchId = dispitm.DispatchId
			where req.StoreId = @StoreId and CONVERT(date, req.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by convert(date,req.CreatedOn),convert(date,dispitm.CreatedOn),reqitm.Quantity,itm.ItemName, dispitm.MRP, 
			dispitm.Quantity,req.CreatedBy,dispitm.CreatedBy,req.RequisitionId,disp.DispatchId,disp.ReceivedBy,dispitm.DispatchItemId
		END		
End

GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_StockReport]    Script Date: 2/10/2020 1:11:02 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_StockReport]  
	    @ItemId int = null	, @StoreId int = null	
AS
/*
FileName: [SP_WardReport_StockReport]
CreatedBy/date: Rusha/03-24-2019
Description: To get the Stock Details Such As ItemName, BatchNo, AvailableQty of Each Item Selected By User 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-24-2019					   shows stock details by item wise
2.		Sanjit/02-03-2020					   substore integration
----------------------------------------------------------------------------
*/

BEGIN
  IF (@ItemId !=0)
		BEGIN
			select gen.GenericName,itm.ItemName,ward.BatchNo,sum(AvailableQuantity) as Quantity,ward.ExpiryDate, MRP from WARD_Stock as ward 
			join PHRM_MST_Item as itm on ward.ItemId= itm.ItemId 
			join PHRM_MST_Generic as gen on itm.GenericId = gen.GenericId  
			where itm.ItemId =@ItemId and ward.StoreId = @StoreId
			group by ItemName, MRP ,GenericName, ward.BatchNo, ward.ExpiryDate
		END	
		else if (@ItemId =0)	
		begin 
		select gen.GenericName,itm.ItemName,ward.BatchNo,sum(AvailableQuantity) as Quantity,ward.ExpiryDate, MRP from WARD_Stock as ward 
			join PHRM_MST_Item as itm on ward.ItemId= itm.ItemId 
			join PHRM_MST_Generic as gen on itm.GenericId = gen.GenericId
			where ward.StoreId = @StoreId
			--where itm.ItemId  like '%'+isnull (@ItemId,'')+'%'
			group by ItemName, MRP,GenericName, ward.BatchNo, ward.ExpiryDate
		end
End

GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_TransferReport]    Script Date: 2/10/2020 1:11:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_TransferReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
	--@Status int = null					--Ward to Ward report is shown in case of 1 and Ward to Pharmacy report in case of 0	
AS
/*
FileName: [SP_WardReport_TransferReport] '1/7/2020','1/8/2020',13
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
		--if (@Status = 1)
			--select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty, Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' from WARD_Transaction as transc
			--join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			--where TransactionType = 'WardtoWard' and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			--group by itm.ItemName, transc.Quantity,transc.Remarks, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
		
		--else if (@Status =0)
			(select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,transc.Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' 
			from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			where transc.StoreId = @StoreId and TransactionType = 'WardToPharmacy' and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
			)

		--else
			--select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty, Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' from WARD_Transaction as transc
			--join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			--where TransactionType in ('WardToPharmacy','WardtoWard') and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			--group by itm.ItemName, transc.Quantity,transc.Remarks, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
		END	
End
GO
---END: Sanjit 10 Feb,2020 -- removed ward from all the reports for substore and made wardId nullable in Ward_Transaction

--Start: Sanjit 12 Feb,2020 - added code in store and changed consumption in substore to issues.
Alter Table PHRM_MST_Store
Add Code varchar(15)
GO
UPDATE PHRM_MST_Store
Set Code = ''
Where Code is null;
GO
UPDATE RBAC_RouteConfig
SET DisplayName = 'Issues'
WHERE DisplayName = 'Consumption' and UrlFullPath='WardSupply/Pharmacy/Consumption' and RouterLink='Consumption'
GO
--End: Sanjit 12 Feb,2020 - added code in store and changed consumption in substore to issues.

--START :RAJIB :20TH Feb 2020:Added in wardsupply for SP_WardReport_InternalConsumptionReport
/****** Object:  StoredProcedure [dbo].[SP_WardReport_InternalConsumptionReport]    Script Date: 2/10/2020 12:44:45 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

alter PROCEDURE [dbo].[SP_WardReport_InternalConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardReport_InternalConsumptionReport] '2018-01-01', '2020-02-18',2
CreatedBy/date: Rajib/02-10-2020
Description: To get the Internal Consumption Details of Items From different Ward 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rajib/2/18/2020							Update StoreId
2.		
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)and (@StoreId IS NOT NULL) )
		BEGIN
			select CONVERT(date,consum.CreatedOn) as [ConsumedDate], depitm.DepartmentName,consumitem.ItemName, consum.ConsumedBy, consumitem.Quantity as Quantity 
			from WARD_InternalConsumption as consum 
			join WARD_InternalConsumptionItems as consumitem on consum.ConsumptionId=consumitem.ConsumptionId
			join MST_Department as depitm on consum.DepartmentId=depitm.DepartmentId
			where consum.SubStoreId = @StoreId and CONVERT(date, consum.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by CONVERT(date,consum.CreatedOn),depitm.DepartmentName,consumitem.ItemName,consum.ConsumedBy,consumitem.Quantity
		END		
End
GO
----END :RAJIB :20TH Feb 2020:Added in wardsupply for SP_WardReport_InternalConsumptionReport

-----START: Rajib: 20 Feb 2020: Ward Transction and Consumption Table Update
ALTER TABLE [dbo].[WARD_Transaction]
ADD  InOut varchar(100);
GO

ALTER TABLE [dbo].[WARD_Consumption]
ADD  ModifiedBy int, ModifiedOn datetime
GO

-----START: Rajib: 20 Feb 2020: Ward Transction and Consumption Table Update
--END:Rusha: 20th feb 2020---merged: Wardsupply to Dev

--START:MergedBy: NageshBB: 20 FEb 2020: Merged: EMR-1541_INV_Cancelremainingitem into DEV
----Start: Ashish-18Feb 2020  ---Cancel  remaining items in internal requisition--
ALTER TABLE INV_TXN_RequisitionItems
ADD CancelQuantity float null
GO

ALTER TABLE INV_TXN_RequisitionItems 
ADD CancelBy int  Null 
GO

ALTER TABLE INV_TXN_RequisitionItems
ADD CancelOn  DATETIME  NULL
GO

----End: Ashish-18Feb 2020  ---Cancel  remaining items in internal requisition--
--END:MergedBy: NageshBB: 20 FEb 2020: Merged: EMR-1541_INV_Cancelremainingitem into DEV

--START: MergedBy: NageshBB: 26-Feb-2020: EMR-1659_ACC_PrintIssue To DEV
----Start: Ashish-25Feb 2020  ---Export btn show hide for voucher useing parameter--
------for voucher ony
Insert into CORE_CFG_Parameters
values('Accounting','AllowSingleVoucherExport','false','boolean','  enable or disable Export Button in Accounting for Voucher . default is false.','custom');
Go
------other type export btn
Insert into CORE_CFG_Parameters
values('Accounting','AllowOtherExport','false','boolean','  enable or disable Export Button in Accounting for for Grid export and other type of export. default is false.','custom');
Go
----End: Ashish-25Feb 2020  ---Export btn show hide for voucher useing parameter--
--END: MergedBy: NageshBB: 26-Feb-2020: EMR-1659_ACC_PrintIssue To DEV




--START: MergedBy: NageshBB: 26-Feb-2020: EMR-1661_ACC_HardCodeValues To DEV
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ACC_MST_CodeDetails](
  [Id] [int] IDENTITY(1,1) NOT NULL,
  [Code] [varchar](50) NULL,
  [Name] [varchar](50) NULL,
  [Description] [varchar](100) NULL,
 CONSTRAINT [PK_ACC_MST_CodeDetails] PRIMARY KEY CLUSTERED 
(
  [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

------------------

INSERT INTO ACC_MST_CodeDetails([Code],[Name],[Description]) 
    VALUES
    ('001','Revenue','PrimaryGroup'),
    ('002','Expenses','PrimaryGroup'),
    ('003','Direct Expense','COA'),
    ('004','Direct Income','COA'),
    ('005','Indirect Expenses','COA'),
    ('006','Indirect Income','COA'),
    ('007','Purchase','COA'),
	--
	('008','Assets','PrimaryGroup'),
	('009','Liabilities','PrimaryGroup'),
	('010','Capital and Equity','COA'),
	('011','Current Assets','COA'),
	('012','Current Liabilities','COA'),
	('013','Long Term Liabilities','COA'),
	('014','Non Current Assets','COA')
	--
GO
------------------
--END: MergedBy: NageshBB: 26-Feb-2020: EMR-1661_ACC_HardCodeValues To DEV
--START: MergedBy: NageshBB: 26-Feb-2020: EMR-1666_ACC_CreditBillOrganisation To DEV
--START:Vikas 25th Feb 2020: update trigger for credit orgnaizationwise transfer data

ALTER TABLE BIL_SYNC_BillingAccounting
ADD CreditOrganizationId int null;
Go

/****** Object:  Trigger [dbo].[TRG_BillToAcc_BillingTxnItem]    Script Date: 2/25/2020 10:17:24 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_BillToAcc_BillingTxnItem]
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
=======================================================
*/
BEGIN
	--ignoring provisional records
	IF (SELECT BillingTransactionId FROM inserted) IS NOT NULL
	BEGIN
		--Declare Variables
		DECLARE @PaymentMode varchar(20), @ReportingDeptName varchar(100), @CreditOrganizationId varchar(50)

		--Initializing
		SET @PaymentMode = (SELECT PaymentMode FROM BIL_TXN_BillingTransaction WHERE BillingTransactionId = (SELECT BillingTransactionId FROM inserted))
		SET @ReportingDeptName = (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName) FROM inserted)
	    SET @CreditOrganizationId = (SELECT OrganizationId FROM BIL_TXN_BillingTransaction WHERE  BillingTransactionId=(SELECT BillingTransactionId from Inserted) ) 

		--Inserting Values
		INSERT INTO BIL_SYNC_BillingAccounting 
			(ReferenceId, ReferenceModelName, ServiceDepartmentId, ItemId, PatientId,
			 TransactionType, PaymentMode, SubTotal, TaxAmount, DiscountAmount, TotalAmount,IncomeLedgerName,TransactionDate,CreatedOn,CreatedBy,CreditOrganizationId)
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
			(SELECT CreatedBy FROM inserted), 
			@CreditOrganizationId			--CreditOrganizationId
		)
	END
END
Go

Insert into CORE_CFG_Parameters
values('Accounting','isCredtiOrganizationAccounting','false','boolean','parameter for credit organizationwise get, map, ans transfer accounting records','custom');
Go
--END:Vikas 25th Feb 2020: update trigger for credit orgnaizationwise transfer data
--END: MergedBy: NageshBB: 26-Feb-2020: EMR-1666_ACC_CreditBillOrganisation To DEV

--START: Rusha 26th feb 2020: Merged to dev branch 
--Start: Shankar 26th Feb 2020 change Invoice Details to Materialized Sales View---
Update RBAC_RouteConfig
set DisplayName = 'Materialized Sales View'
where RouterLink='InvoiceDetails' and UrlFullPath='SystemAdmin/InvoiceDetails'
GO
----End: Shankar 26th Feb 2020 change Invoice Details to Materialized Sales View---

----Start :RAJIB :26TH Feb 2020:Added in wardsupply for SP_WardReport_InternalConsumptionReport
/****** Object:  StoredProcedure [dbo].[SP_WardReport_InternalConsumptionReport]    Script Date: 2/26/2020 3:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_InternalConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardReport_InternalConsumptionReport] '2018-01-01', '2020-02-18',2
CreatedBy/date: Rajib/02-10-2020
Description: To get the Internal Consumption Details of Items From different Ward 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rajib/2/18/2020							Update StoreId
2.		Rajib/2/26/2020							Update ConsumptionItemId
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)and (@StoreId IS NOT NULL) )
		BEGIN
			select CONVERT(date,consum.CreatedOn) as [ConsumedDate], depitm.DepartmentName,consumitem.ItemName, consum.ConsumedBy, consumitem.Quantity as Quantity 
			from WARD_InternalConsumption as consum 
			join WARD_InternalConsumptionItems as consumitem on consum.ConsumptionId=consumitem.ConsumptionId
			join MST_Department as depitm on consum.DepartmentId=depitm.DepartmentId
			where consum.SubStoreId = @StoreId and CONVERT(date, consum.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by CONVERT(date,consum.CreatedOn),depitm.DepartmentName,consumitem.ItemName,consum.ConsumedBy,consumitem.Quantity,consumitem.ConsumptionItemId
		END		
End
GO
----END :RAJIB :26TH Feb 2020:Added in wardsupply for SP_WardReport_InternalConsumptionReport

-----START: Rajib: 26 Feb 2020: SP_WardReport_ConsumptionReport Table Update

GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_ConsumptionReport]    Script Date: 2/26/2020 3:10:52 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_ConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardReport_ConsumptionReport]
CreatedBy/date: Rusha/03-26-2019
Description: To get the Consumption Details of Items From different Ward 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-29-2019					   add stock details of consumed item from different ward
2.		Sanjit/02-03-2020						substore integration
3.      Rajib/02-26-2020						Update InvoiceItemId
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and (@StoreId IS NOT NULL))
		BEGIN
			select CONVERT(date,consum.CreatedOn) as [Date], consum.ItemName, gene.GenericName, consum.Quantity as Quantity 
			FROM WARD_Consumption as consum 
			join PHRM_MST_Item as itm on consum.ItemId=itm.ItemId
			join PHRM_MST_Generic as gene on  itm.GenericId=gene.GenericId
			where consum.StoreId = @StoreId and CONVERT(date, consum.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by CONVERT(date,consum.CreatedOn),consum.ItemName,consum.Quantity, gene.GenericName,consum.InvoiceItemId
		END		
END
GO
--END: Rusha 26th feb 2020: Merged to dev branch ---


---start: sud--28Feb'20--incremental script correction of adt-bed reservation--

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'IsReserved'
          AND Object_ID = Object_ID(N'dbo.ADT_Bed'))
BEGIN
 Alter table ADT_Bed
 Add IsReserved bit null;

END
GO

--sud--incremental correction since valuelookup list was needed earler--
IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'ValueLookUpList'
          AND Object_ID = Object_ID(N'dbo.CORE_CFG_Parameters'))
BEGIN
Alter table CORE_CFG_Parameters
add ValueLookUpList nvarchar(max);

END
GO




IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where parametergroupname='ADT' and parametername='TimeBufferForReservation')
BEGIN
 Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
 values('ADT','TimeBufferForReservation','{"minutes":30,"days":10}','json','Days and months upto which ADT bed reservation is possible','custom',null);
END
GO

if OBJECT_ID('ADT_BedReservation') is  null
BEGIN
 
Create table ADT_BedReservation(
  ReservedBedInfoId int Identity(1,1) Constraint ReservedBedInfoId Primary Key  Not Null,
  PatientId int NOT NULL,
  PatientVisitId int,
  RequestingDepartmentId int,
  AdmittingDoctorId int,
  WardId int NOT NULL,
  BedFeatureId int NOT NULL,
  BedId int not null,
  AdmissionStartsOn datetime NOT NULL,
  AdmissionNotes varchar(1000),
  ReservedOn datetime,
  ReservedBy int,
  CreatedBy int,
  CreatedOn datetime,
  ModifiedBy int  null,
  ModifiedOn datetime  null,
  CancelledBy int null,
  CancelledOn datetime null,
  IsActive bit NOT NULL,
  IsAutoCancelled bit null,
  AutoCancelledOn DateTime null
)

END

Go

IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where parametergroupname='ADT' and parametername='MinutesBeforeAutoCancelOfReservedBed')
BEGIN
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
values('ADT','MinutesBeforeAutoCancelOfReservedBed','60','number','Minutes before which patient should be admitted, before reserved bed gets auto cancelled','custom',null);
END
GO

IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where parametergroupname='SystemAdmin' and parametername='MaterializedViewGridColumns')
BEGIN
Insert Into CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
  Values('SystemAdmin','MaterializedViewGridColumns',
  '["Fiscal_Year","Bill_No","Customer Name","Customer_PAN","BillDate","BillDate(BS)","Amount","DiscountAmount","Taxable_Amount","Tax_Amount","Total_Amount","Synced With IRD","Is_Printed","Printed_Time","Entered_by","Printed_by","Print_Count","Is_RealTime","Is_bill_Active"]',
  'array','Which Columns to show in the Materialized View','custom'
  )
END
GO

IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where parametergroupname='ReportingHeader' and parametername='ReportHeaderText')
BEGIN
Insert Into CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
  Values('ReportingHeader','ReportHeaderText','{"CreditNoteReportHeader":"Credit Note"}',
  'json','Header of Reports Report','custom'
  );
END
GO

Update CORE_CFG_Parameters set ParameterValue='{"CreditNoteReportHeader":"Credit Note","MaterializedViewReportHeader":"Materialized View"}'
where ParameterGroupName='ReportingHeader' and ParameterName='ReportHeaderText';
Go

---end: sud--28Feb'20--incremental script correction of adt-bed reservation--


---START: 13 March 2020: Merged from EMR-1674_aCC_ManualVoucherfunlity to dev branch
----Start: Ashish-03-03 2020  ---Edit Manual Voucher functionality--

declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('accounting-transaction-editManualVoucher',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='accounting-transaction-editManualVoucher');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Transaction')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Edit Voucher  ','Accounting/Transaction/EditVoucher','EditManualVoucher',@permissionId,@parentRouteId,1,1)
go

----End: Ashish-03-03- 2020  ---Edit Manual Voucher functionality--
---END: 13 March 2020: Merged from EMR-1674_aCC_ManualVoucherfunlity to dev branch

---START:NageshBB: 13 March 2020: Merged from EMR-1341_PHRM_Settlement_DuplicatePrint to dev branch

-- START: Vikas:4th March 2020: Script for settlement duplicate prints in pharmacy

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_TXNS_PHRM_SettlementDuplicatePrint] 
AS
/*
FileName: [SP_TXNS_PHRM_SettlementDuplicatePrint]
CreatedBy/date: Vikas: 4th March 2020
Description: script for pharmacy duplicate settlement records
Remarks: 
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------			
*/
BEGIN
 
Select pat.PatientId, pat.PatientCode, 
       pat.FirstName+' '+ISNULL(pat.MiddleName+' ','')+ pat.LastName 'PatientName', 
	   pat.DateOfBirth,
	   pat.Gender,pat.PhoneNumber, credit.SettlementId,
     ISNULL( credit.CreditTotal,0) 'CreditTotal',
	 cast(
	      round( 
	           (ISNULL(dep.TotalDeposit,0)- ISNULL(dep.DepositDeduction,0) - ISNULL(dep.DepositReturn,0))
	         ,2) as numeric(16,2)) 'DepositBalance',
			 credit.CreatedOn 'CreditDate' ,dep.CreatedOn 'DepositDate'
from PAT_Patient pat
LEFT JOIN
(
   Select txn.PatientId, max(txn.CreateOn) CreatedOn, txn.SettlementId,
  SUM(txn.TotalAmount) 'CreditTotal'  from PHRM_TXN_Invoice txn
  where txn.BilStatus ='paid' AND txn.SettlementId is not null AND ISNULL(txn.IsReturn,0) != 1
  Group by txn.PatientId,txn.SettlementId 
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
	  order by credit.SettlementId DESC
END

GO
---------------------------------
	declare @ApplicationId INT
				SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

				Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
				values ('settlement-duplicate-print',@ApplicationId,1,GETDATE(),1);
				GO
	declare @PermissionId INT
	SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='settlement-duplicate-print')

	declare @RefParentRouteId INT
	SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy/DuplicatePrints')

	Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,IsActive)
	values ('Settlement', 'Pharmacy/DuplicatePrints/SettlementDuplicate','SettlementDuplicate',@PermissionId,@RefParentRouteId,1,1);
	GO
				
-- END: Vikas:4th March 2020: Script for settlement duplicate prints in pharmacy
---END:NageshBB: 13 March 2020: Merged from EMR-1341_PHRM_Settlement_DuplicatePrint to dev branch

---START: Rusha: 13 March 2020: Merged from EMR-1403-PHRM-Invoice-Settlement to dev branch
---Start: Shankar 2ndMarch2020: Added provisional amount to show in settlement page pharmacy.----

/****** Object:  StoredProcedure [dbo].[SP_TXNS_PHRM_SettlementSummary]    Script Date: 02/26/2020 5:03:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_TXNS_PHRM_SettlementSummary] 
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
1.		Shankar/28thFeb2020				Added provisional amount as well
-----------------------------------------------------------------------------------------			
*/
BEGIN
 
Select pat.PatientId, pat.PatientCode, 
       pat.FirstName+' '+ISNULL(pat.MiddleName+' ','')+ pat.LastName 'PatientName', 
	   pat.DateOfBirth,
	   pat.Gender,pat.PhoneNumber,
     ISNULL( credit.CreditTotal,0) 'CreditTotal',
	 CAST(ROUND(ISNULL(provisional.ProvisionalTotal,0),2) as numeric(16,2)) 'ProvisionalTotal',
	 CAST(
	      ROUND( 
	           (ISNULL(dep.TotalDeposit,0)- ISNULL(dep.DepositDeduction,0) - ISNULL(dep.DepositReturn,0))
	         ,2) as numeric(16,2)) 'DepositBalance',
			 credit.CreatedOn 'CreditDate' ,dep.CreatedOn 'DepositDate'
			
from PAT_Patient pat
LEFT JOIN
( 
  Select txn.PatientId, max(txn.CreateOn) CreatedOn,
  SUM(txn.PaidAmount) 'CreditTotal'  from PHRM_TXN_Invoice txn
  where txn.BilStatus ='unpaid' AND txn.PaymentMode = 'credit' AND ISNULL(txn.IsReturn,0) != 1
  Group by txn.PatientId
) credit on pat.PatientId = credit.PatientId
LEFT JOIN
(--select * from PHRM_TXN_Invoice where BilStatus = 'provisional'
  Select invitms.PatientId, max(invitms.CreatedOn) CreatedOn,
  SUM(invitms.TotalAmount) 'ProvisionalTotal' from PHRM_TXN_InvoiceItems invitms
  where invitms.BilItemStatus='provisional' or invitms.BilItemStatus='wardconsumption' 
  Group by invitms.PatientId
) provisional on pat.PatientId = provisional.PatientId
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
---End: Shankar 2ndMarch2020: Added provisional amount to show in settlement page pharmacy.----

--Start: Shankar 26th Feb 2020 change Invoice Details to Materialized Sales View---
Update RBAC_RouteConfig
set DisplayName = 'Materialized Sales View'
where RouterLink='InvoiceDetails' and UrlFullPath='SystemAdmin/InvoiceDetails'
GO
----End: Shankar 26th Feb 2020 change Invoice Details to Materialized Sales View---
---END: Rusha: 13 March 2020: Merged from EMR-1403-PHRM-Invoice-Settlement to dev branch



---start: sud-26Mar'20--merged from Charak-Hospital branch (Accounting, Incentive, Substore, Inventory)---

---start: from Charak_Accounting_Incremental_13March++.sql---

--START: Vikas: 11 March 2020: Default calendar Nepali selection for accounting module  
Update CORE_CFG_Parameters
SET ParameterValue= '{"LaboratoryServices":"np,en","PatientRegistration":"np,en","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np","DoctorOutPatientReport":"en,np","DoctorwiseIncomeSummary":"en,np","CustomReport":"en,np","DailyMISReport":"en,np","DoctorSummary":"en,np","DepartmentSummary":"en,np","Common":"en,np","AccountingModule":"np,en"}'

Where ParameterGroupName='Common' and ParameterName ='CalendarTypes'
Go
--END: Vikas: 11 March 2020: Default calendar Nepali selection for accounting module 


--START: Vikas: 12 March 2020: Credit organizaiton ledgergroup name update into parameter value
UPDATE CORE_CFG_Parameters
SET ParameterValue=
'[ {"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"pharmacysupplier"},{"LedgergroupUniqueName":"LCL_CONSULTANT(CREDIT_A/C)", "LedgerType":"consultant"}, {"LedgergroupUniqueName":" ", "LedgerType":"inventoryvendor"},{"LedgergroupUniqueName":"LCL_CREDIT_ORGANIZATIONS", "LedgerType":"creditorganization"}]'
WHERE ParameterName='LedgerGroupMapping'
Go
--END: Vikas: 12 March 2020: Credit organizaiton ledgergroup name update into parameter value

----- START: ashish 15 March 2020 -- fix and some modifications  for charak  -----
ALTER TABLE
ACC_Ledger
ALTER COLUMN
LedgerName
NVARCHAR(100) NOT NULL;
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
 WHERE Name = N'IsDefault'
 AND Object_ID = Object_ID(N'dbo.ACC_MST_VoucherHead'))
 BEGIN
ALTER TABLE ACC_MST_VoucherHead
ADD IsDefault bit 
DEFAULT 0 NOT NULL;
END
GO
-----  END: ashish 15 March 2020 -- fix and some modifications  for charak  ---


-- START:Vikas 16 March 2020:Incentive module integration , billing column changes, mapping rules, etc changes 
-- 
	IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'IsCashBillSync' AND Object_ID = Object_ID(N'dbo.BIL_TXN_BillingTransactionItems'))
	BEGIN
	  Alter Table BIL_TXN_BillingTransactionItems
	  ADD IsCashBillSync BIT NULL
	END
	GO

	IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'IsCreditBillSync' AND Object_ID = Object_ID(N'dbo.BIL_TXN_BillingTransactionItems'))
	BEGIN
	  Alter Table BIL_TXN_BillingTransactionItems
	  Add IsCreditBillSync   BIT NULL
	END
	GO

	IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'IsCashBillReturnSync' AND Object_ID = Object_ID(N'dbo.BIL_TXN_BillingTransactionItems'))
	BEGIN
	  Alter Table BIL_TXN_BillingTransactionItems
	  Add IsCashBillReturnSync BIT NULL
	END
	GO
	IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'IsCreditBillReturnSync' AND Object_ID = Object_ID(N'dbo.BIL_TXN_BillingTransactionItems'))
	BEGIN
	  Alter Table BIL_TXN_BillingTransactionItems
	  Add IsCreditBillReturnSync BIT NULL
	END
	GO

	IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'IsCreditBillPaidSync' AND Object_ID = Object_ID(N'dbo.BIL_TXN_BillingTransaction'))
	BEGIN
	  Alter Table BIL_TXN_BillingTransaction
	  ADD IsCreditBillPaidSync BIT NULL
	END
	GO

	IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'IsDepositSync' AND Object_ID = Object_ID(N'dbo.BIL_TXN_Deposit'))
	BEGIN
	  Alter Table BIL_TXN_Deposit
	  Add IsDepositSync BIT NULL
	END
	GO

	IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'IsCashDiscountSync' AND Object_ID = Object_ID(N'dbo.BIL_TXN_Settlements'))
	BEGIN
	  Alter Table BIL_TXN_Settlements
	  ADD IsCashDiscountSync BIT NULL
	END
	GO
-----------------------------------------------------------

-- update core parameter value for incetive in section list 
	UPDATE CORE_CFG_Parameters
	SET ParameterValue=
	'{"SectionList":[{ "SectionId": 1, "SectionName": "Inventory","SectionCode":"INV" }, { "SectionId": 2, "SectionName": "Billing","SectionCode":"BL"  },{ "SectionId": 3, "SectionName": "Pharmacy","SectionCode":"PH"  },{ "SectionId": 4, "SectionName": "Manual_Voucher","SectionCode":""  },{ "SectionId":5, "SectionName": "Incentive","SectionCode":"INCTV" }]}'
	Where ParameterGroupName ='Accounting' and ParameterName='SectionList'
	GO
-----------------------------------------------------------

-- insert group mapping details for 'ConsultantIncentive'
	INSERT INTO ACC_MST_GroupMapping ([Description],[Section],[VoucherId],[CustomVoucherId])
	VALUES('ConsultantIncentive',5,(select VoucherId from ACC_MST_Vouchers where [VoucherCode]='JV'),(select VoucherId from ACC_MST_Vouchers where [VoucherCode]='JV')) 
	GO
-----------------------------------------------------------

-- insert script for mapping details for 'ConsultantIncentive'
	DECLARE @GroupMappingId int
	SET @GroupMappingId  = (select GroupMappingId from ACC_MST_GroupMapping where [Description]='ConsultantIncentive')
	
	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_Ledger where [Name]='EE_MEDICAL_DIRECT_EXPENSESCOMMISSION_EXPENSES_(TECHNICAL_DISTRIBUTION)'),1)	

	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_Ledger where [Name]='LCL_CONSULTANT_TDSCONSULTANT_TDS_PAYABLE'),0)

	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_MST_LedgerGroup where [Name]='LCL_CONSULTANT_(CREDIT_A/C)'),0)
	GO
	----

-----------------------------------------------------------

-- insert script for hospital transfer rules for 'ConsultantIncentive'

	DECLARE @HospitalId int, @TransferRuleId int
	SET @HospitalId = (select HospitalId from ACC_MST_Hospital where HospitalShortName='CHARAK')
	SET @TransferRuleId = (select GroupMappingId from ACC_MST_GroupMapping where [Description]='ConsultantIncentive')
	INSERT INTO ACC_MST_Hospital_TransferRules_Mapping ([HospitalId],[TransferRuleId],[IsActive])
		VALUES (@HospitalId,@TransferRuleId,1)
	GO
-----------------------------------------------------------
		
-- Store Procedures --

	IF NOT EXISTS(SELECT 1 FROM sys.columns 
			  WHERE Name = N'TDSPercentage'
			  AND Object_ID = Object_ID(N'dbo.INCTV_TXN_IncentiveFractionItem'))
	BEGIN
		Alter Table INCTV_TXN_IncentiveFractionItem
		ADD TDSPercentage Float NULL
	END
	GO
	 IF NOT EXISTS(SELECT 1 FROM sys.columns 
			  WHERE Name = N'TDSAmount'
			  AND Object_ID = Object_ID(N'dbo.INCTV_TXN_IncentiveFractionItem'))
	BEGIN
		Alter Table INCTV_TXN_IncentiveFractionItem
		ADD TDSAmount Float NULL
	END
	GO





-- 1. To get the list Doctor's TotalAmount and TDSAmont for given date for Accounting Transfer.

	IF NOT EXISTS(SELECT 1 FROM sys.columns 
			  WHERE Name = N'IsTransferToAcc'
			  AND Object_ID = Object_ID(N'dbo.INCTV_TXN_IncentiveFractionItem'))
	BEGIN
		Alter Table INCTV_TXN_IncentiveFractionItem
		ADD IsTransferToAcc BIT NULL
	END
	GO

	IF(OBJECT_ID('SP_INCTV_ACC_GetTransactionInfoForAccTransfer') IS NOT NULL)
	BEGIN
	 DROP PROCEDURE SP_INCTV_ACC_GetTransactionInfoForAccTransfer
	END
	GO

	Create Procedure SP_INCTV_ACC_GetTransactionInfoForAccTransfer
	  @TransactionDate DATE
	AS
	/*
	 File: SP_INCTV_ACC_GetTransactionInfoForAccTransfer
	 Description: To get the list Doctor's TotalAmount and TDSAmont for given date for Accounting Transfer.
	 Remarks:
		* These data will be used in accounting to create a single voucher for that day, where Both Consultant and TDS will be in Credit part.
		* only those data which are not transferred to accounting will be returned (columnname:  IsTransferToAcc)
	 Change History:
	 ----------------------------------------------------------------------------------
	 S.No.   Author/Date               Remarks
	 ----------------------------------------------------------------------------------
	 1.      Sud/15Mar'20             Initial Draft
	 ----------------------------------------------------------------------------------

	*/
	BEGIN
 
	select 
	 Convert(Date, TransactionDate) 'TransactionDate',
	  IncentiveReceiverId 'EmployeeId',
	  emp.FullName 'EmployeeName',

	  'ConsultantIncentive' as TransactionType,
	SUM(ISNULL(IncentiveAmount,0)-ISNULL(TDSAmount,0)) 'TotalAmount',
	SUM(ISNULL(TDSAmount,0)) 'TotalTDS',

	Null AS Remarks,
	STUFF((SELECT ',' + CAST(InctvTxnItemId AS varchar) 
	 FROM INCTV_TXN_IncentiveFractionItem innerTbl 
	where innerTbl.IncentiveReceiverId= outerTbl.IncentiveReceiverId
		  and Convert(Date, innerTbl.TransactionDate) = Convert(Date, outerTbl.TransactionDate) 

	 FOR XML PATH('')), 1 ,1, '') 

	AS ReferenceIds

	from INCTV_TXN_IncentiveFractionItem outerTbl INNER JOIN EMP_Employee emp
	   ON outerTbl.IncentiveReceiverId=emp.EmployeeId

	Where Convert(Date,outerTbl.TransactionDate)=@TransactionDate
	  AND ISNULL(IsTransferToAcc,0) = 0
	  and ISNULL(outerTbl.IsActive,0) = 1

	Group By IncentiveReceiverId, Convert(Date, TransactionDate), emp.FullName
	Order by Convert(Date, outerTbl.TransactionDate)

	END
	GO

-- 2. update script for trasnfer is data from billing and incetive

		/****** Object:  StoredProcedure [dbo].[SP_UpdateIsTransferToACC]    Script Date: 3/16/2020 8:12:49 PM ******/
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

		--IF (@ReferenceIds IS NOT NULL
		--  AND @TransactionType = 'BillingRecords')
		--BEGIN
		--  EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = 1 WHERE BillingAccountingSyncId IN (' + @ReferenceIds + ')')
		--END

		-- 1
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END

		-- 2
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 3
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillPaid')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransaction SET IsCreditBillPaidSync = 1 WHERE BillingTransactionId IN (' + @ReferenceIds + ')')
		END	

		-- 4
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillReturnSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 5
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillReturnSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 6
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositAdd')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = 1 WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 7
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = 1 WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 8
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashDiscount')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Settlements SET IsCashDiscountSync = 1 WHERE SettlementId IN (' + @ReferenceIds + ')')
		END
	
		--------------------------updates incetive txn transferred records---------------
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'ConsultantIncentive')
		BEGIN
		EXECUTE ('UPDATE INCTV_TXN_IncentiveFractionItem SET IsTransferToAcc = 1 WHERE InctvTxnItemId IN (' + @ReferenceIds + ')')
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

		--IF (@ReferenceIds IS NOT NULL
		--  AND @TransactionType = 'BillingRecords' AND @TransactionDate is not null)
		--BEGIN
		--  EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = NULL WHERE ReferenceId IN (' + @ReferenceIds + ') and  convert(date,TransactionDate) = convert(date,'+''''+ @TransactionDate +''''+')') 
		--END
	
		-- 1
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END

		-- 2
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 3
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillPaid')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransaction SET IsCreditBillPaidSync = NULL WHERE BillingTransactionId IN (' + @ReferenceIds + ')')
		END	

		-- 4
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillReturnSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 5
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillReturnSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 6
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositAdd')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = NULL WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 7
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = NULL WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 8
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashDiscount')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Settlements SET IsCashDiscountSync = NULL WHERE SettlementId IN (' + @ReferenceIds + ')')
		END

		--------------------------updates incetive txn transferred records---------------
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'ConsultantIncentive')
		BEGIN
		EXECUTE ('UPDATE INCTV_TXN_IncentiveFractionItem SET IsTransferToAcc = NULL WHERE InctvTxnItemId IN (' + @ReferenceIds + ')')
		END

		END
		END
		GO

-----------------------------------------------------------

 
-- END:Vikas 16 March 2020:Incentive module integration , billing column changes, mapping rules, etc changes 


---START: NageshBB: 16 March 2020-- updated core parameter for accounting ledger group mapping and adding column for billing table
update CORE_CFG_Parameters
set ParameterValue='[ {"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"pharmacysupplier"},{"LedgergroupUniqueName":"LCL_CONSULTANT_(CREDIT_A/C)", "LedgerType":"consultant"}, {"LedgergroupUniqueName":" ", "LedgerType":"inventoryvendor"},{"LedgergroupUniqueName":"ACA_SUNDRY_DEBTORS", "LedgerType":"creditorganization"}]'
where ParameterGroupName='accounting' and ParameterName='LedgerGroupMapping'
Go


insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
values('Accounting','GetBillingFromSyncTable',0,'boolean','if it is 1 then get record from sync table and if it is 0 then get record from billing table directly using sp','custom')
go


/****** Object:  StoredProcedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]    Script Date: 16-03-2020 20:47:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]
  @TransactionDate DATE
AS

/**************************************************
Stored Procedure Name:SP_ACC_Bill_GetBillingDataForAccTransfer
Details:
-This stored procedure will get billing module data for transfer to accounting by date
-We are getting billing records, deposit records, etc
	
 Change History:
 ----------------------------------------------------------------------------------
 S.No.   Author					Date               Remarks
 ----------------------------------------------------------------------------------
 1.      NageshBB & Sud sir		16/03/2020        Stored procedure created
 ----------------------------------------------------------------------------------

**********************************************/
BEGIN

  IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
  BEGIN
  
  SELECT * from BIL_SYNC_BillingAccounting 
  WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @TransactionDate) AND CONVERT(date, @TransactionDate)
  END
  ELSE
  BEGIN    
 --Note:-BillingAccountingSyncId added for temporary pupose because code mapping model has this column , later we need to remove this 
------Cash Bill----------CashBill->BIL_TXN_BillingTransactionItems->BillingTransactionItemId  (TransactionType->TableName->ReferenceId Column Name)
			 Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBill' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 itm.PaidDate 'TransactionDate',
			 GetDate() 'CreatedOn',
			 itm.PaymentReceivedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.PaidDate) = @TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='cash'
			 AND ISNULL(itm.IsCashBillSync,0) = 0  -- Include only Not-Synced Data for CashBill Case--
			
			
			
			UNION ALL
			
---------Credit Bill----------------------------------------------CreditBill-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBill' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 txn.CreatedOn 'TransactionDate', -- this is credit date.. 
			 GetDate() 'CreatedOn',
			 itm.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.CreatedOn)=@TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillSync,0) = 0  -- Include only Not-Synced Data for CreditBill Case--
					

			UNION ALL
			
-----------------Credit Bill Paid-----CreditBillPaid-BillingTransactionId-BIL_TXN_BillingTransaction
		--for now we are commenting this function, later we will get creditbill paid records
			--Select 
			-- txn.BillingTransactionId as BillingAccountingSyncId,
			-- txn.BillingTransactionId AS 'ReferenceId',
			-- 'CreditBillPaid' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it, we might need CreditOrganization's LEdger here.. 
			--  sett.PatientId,
			-- 'CreditBillPaid' TransactionType,
			--  sett.PaymentMode As PaymentMode, 
			-- NULL SubTotal,
			-- 0 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- txn.TotalAmount AS TotalAmount,
			
			-- 0 AS IsTransferedToAcc,
			-- SettlementDate 'TransactionDate', -- this is credit date.. 
			-- GetDate() 'CreatedOn',
			-- sett.CreatedBy AS CreatedBy,
			-- NULL AS SettlementDiscountAmount,  -- Can't take this here, it'll go separately into Cash Discount LEdger.. 
			-- NULL AS Remark,
			-- txn.OrganizationId AS CreditOrganizationId   -- correct it after Settlement is separated for CreditOrginizations.
			--from BIL_TXN_Settlements sett, BIL_TXN_BillingTransaction txn
			
			--Where 
			--     sett.SettlementId = txn.SettlementId
			--   AND Convert(Date,SettlementDate)=@TransactionDate
			--   AND ISNULL(txn.IsCreditBillPaidSync,0) = 0  -- Include only Not-Synced Data for Credit Paid Case--
			
			--UNION ALL
			
-----------------------Cash Bill Return---CashBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,itm.PaidDate) = @TransactionDate
			 and ISNULL(itm.ReturnStatus,0) != 0  
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='cash'
			 AND ISNULL(itm.IsCashBillReturnSync,0) = 0  -- Include only Not-Synced Data for CashBill Return Case--
			
			UNION ALL
			
------------CreditBillReturn--- done with join from Transaction, TransactionItem and InvoiceReturn Table--CreditBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			   txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,itm.PaidDate) = @TransactionDate
			 and ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  -- Include only Not-Synced Data for Credit Return Case--
			
			 UNION ALL
			
------------------Deposit Add---DepositAdd-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositAdd' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType ='Deposit'
			AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			UNION ALL
			
-------Deposit Return/Deduct---DepositReturn-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositReturn' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType IN ('ReturnDeposit', 'depositdeduct')
			 AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			
			--UNION ALL
			
---------Cash discount -- from settlement-- New new Transfer rule for this---CashDiscount-SettlementId-BIL_TXN_Settlements
			--Select 
			--SettlementId as BillingAccountingSyncId,
			-- SettlementId 'ReferenceId',
			-- 'CashDiscount' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it
			--  PatientId,
			-- 'CashDiscount' TransactionType,
			-- PaymentMode As PaymentMode, 
			-- NULL AS SubTotal,
			-- NULL AS 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- DiscountAmount AS TotalAmount,    -- use this column if possible
			-- 0 AS IsTransferedToAcc,
			-- CreatedOn 'TransactionDate',
			-- GetDate() 'CreatedOn',
			-- CreatedBy AS CreatedBy,
			-- DiscountAmount AS SettlementDiscountAmount,  -- don't use this column if possible.
			-- NULL AS Remark,
			-- NULL AS CreditOrganizationId  
			--from BIL_TXN_Settlements
			
			--Where 
			--  Convert(Date,CreatedOn)=@TransactionDate
			--  AND ISNULL(DiscountAmount,0) != 0  -- exclude zero discount, since it's not needed.
			--  AND ISNULL(IsCashDiscountSync,0) = 0  -- Include only Not-Synced Data	
  END			  					
END
Go
---END: NageshBB: 16 March 2020-- updated core parameter for accounting ledger group mapping and adding column for billing table

--START : Vikas: 17 March 2020-- added column for reverse transaction changes for incentive payment voucher
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
	 WHERE Name = N'IsReverseTxnAllow'
	 AND Object_ID = Object_ID(N'dbo.ACC_Transactions'))
	 BEGIN
	ALTER TABLE ACC_Transactions
	ADD IsReverseTxnAllow bit 
	DEFAULT NULL NULL;
	END
	GO
--END : Vikas: 17 March 2020-- added column for reverse transaction changes for incentive payment voucher

--START: NageshBB: On 17 March 2020-- disabled billing table triggers which was used for send records into sync table

IF exists (SELECT * FROM sys.objects WHERE type = 'TR' AND name = 'TRG_BillToAcc_BillingTxnItem') 
Begin
	ALTER TABLE BIL_TXN_BillingTransactionItems DISABLE TRIGGER TRG_BillToAcc_BillingTxnItem 
END
Go


IF exists (SELECT * FROM sys.objects WHERE type = 'TR' AND name = 'TRG_BillToAcc_BillingTxn') 
Begin
	ALTER TABLE BIL_TXN_BillingTransaction DISABLE TRIGGER TRG_BillToAcc_BillingTxn
END
Go


IF exists (SELECT * FROM sys.objects WHERE type = 'TR' AND name = 'TRG_BillToAccSync_DepositTxn') 
Begin
	ALTER TABLE BIL_TXN_Deposit DISABLE TRIGGER  TRG_BillToAccSync_DepositTxn
END
Go

 
 DROP PROCEDURE IF EXISTS dbo.SP_ACC_Bill_GetBillingDataForAccTransfer
 Go

/****** Object:  StoredProcedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]    Script Date: 16-03-2020 20:47:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]
  @TransactionDate DATE
AS

/**************************************************
Stored Procedure Name:SP_ACC_Bill_GetBillingDataForAccTransfer
Details:
-This stored procedure will get billing module data for transfer to accounting by date
-We are getting billing records, deposit records, etc
	
 Change History:
 ----------------------------------------------------------------------------------
 S.No.   Author					Date               Remarks
 ----------------------------------------------------------------------------------
 1.      NageshBB & Sud sir		16/03/2020        Stored procedure created
 ----------------------------------------------------------------------------------

**********************************************/
BEGIN

  IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
  BEGIN
  
  SELECT * from BIL_SYNC_BillingAccounting 
  WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @TransactionDate) AND CONVERT(date, @TransactionDate)
  END
  ELSE
  BEGIN    
 --Note:-BillingAccountingSyncId added for temporary pupose because code mapping model has this column , later we need to remove this 
------Cash Bill----------CashBill->BIL_TXN_BillingTransactionItems->BillingTransactionItemId  (TransactionType->TableName->ReferenceId Column Name)
			 Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBill' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 itm.PaidDate 'TransactionDate',
			 GetDate() 'CreatedOn',
			 itm.PaymentReceivedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.PaidDate) = @TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='cash'
			 AND ISNULL(itm.IsCashBillSync,0) = 0  -- Include only Not-Synced Data for CashBill Case--
			
			
			
			UNION ALL
			
---------Credit Bill----------------------------------------------CreditBill-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBill' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 txn.CreatedOn 'TransactionDate', -- this is credit date.. 
			 GetDate() 'CreatedOn',
			 itm.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.CreatedOn)=@TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillSync,0) = 0  -- Include only Not-Synced Data for CreditBill Case--
					

			UNION ALL
			
-----------------Credit Bill Paid-----CreditBillPaid-BillingTransactionId-BIL_TXN_BillingTransaction
		--for now we are commenting this function, later we will get creditbill paid records
			--Select 
			-- txn.BillingTransactionId as BillingAccountingSyncId,
			-- txn.BillingTransactionId AS 'ReferenceId',
			-- 'CreditBillPaid' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it, we might need CreditOrganization's LEdger here.. 
			--  sett.PatientId,
			-- 'CreditBillPaid' TransactionType,
			--  sett.PaymentMode As PaymentMode, 
			-- NULL SubTotal,
			-- 0 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- txn.TotalAmount AS TotalAmount,
			
			-- 0 AS IsTransferedToAcc,
			-- SettlementDate 'TransactionDate', -- this is credit date.. 
			-- GetDate() 'CreatedOn',
			-- sett.CreatedBy AS CreatedBy,
			-- NULL AS SettlementDiscountAmount,  -- Can't take this here, it'll go separately into Cash Discount LEdger.. 
			-- NULL AS Remark,
			-- txn.OrganizationId AS CreditOrganizationId   -- correct it after Settlement is separated for CreditOrginizations.
			--from BIL_TXN_Settlements sett, BIL_TXN_BillingTransaction txn
			
			--Where 
			--     sett.SettlementId = txn.SettlementId
			--   AND Convert(Date,SettlementDate)=@TransactionDate
			--   AND ISNULL(txn.IsCreditBillPaidSync,0) = 0  -- Include only Not-Synced Data for Credit Paid Case--
			
			--UNION ALL
			
-----------------------Cash Bill Return---CashBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,itm.PaidDate) = @TransactionDate
			 and ISNULL(itm.ReturnStatus,0) != 0  
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='cash'
			 AND ISNULL(itm.IsCashBillReturnSync,0) = 0  -- Include only Not-Synced Data for CashBill Return Case--
			
			UNION ALL
			
------------CreditBillReturn--- done with join from Transaction, TransactionItem and InvoiceReturn Table--CreditBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			   txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate
			 and ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  -- Include only Not-Synced Data for Credit Return Case--
			
			 UNION ALL
			
------------------Deposit Add---DepositAdd-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositAdd' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType ='Deposit'
			AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			UNION ALL
			
-------Deposit Return/Deduct---DepositReturn-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositReturn' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType IN ('ReturnDeposit', 'depositdeduct')
			 AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			
			--UNION ALL
			
---------Cash discount -- from settlement-- New new Transfer rule for this---CashDiscount-SettlementId-BIL_TXN_Settlements
			--Select 
			--SettlementId as BillingAccountingSyncId,
			-- SettlementId 'ReferenceId',
			-- 'CashDiscount' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it
			--  PatientId,
			-- 'CashDiscount' TransactionType,
			-- PaymentMode As PaymentMode, 
			-- NULL AS SubTotal,
			-- NULL AS 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- DiscountAmount AS TotalAmount,    -- use this column if possible
			-- 0 AS IsTransferedToAcc,
			-- CreatedOn 'TransactionDate',
			-- GetDate() 'CreatedOn',
			-- CreatedBy AS CreatedBy,
			-- DiscountAmount AS SettlementDiscountAmount,  -- don't use this column if possible.
			-- NULL AS Remark,
			-- NULL AS CreditOrganizationId  
			--from BIL_TXN_Settlements
			
			--Where 
			--  Convert(Date,CreatedOn)=@TransactionDate
			--  AND ISNULL(DiscountAmount,0) != 0  -- exclude zero discount, since it's not needed.
			--  AND ISNULL(IsCashDiscountSync,0) = 0  -- Include only Not-Synced Data	
  END			  					
END
Go

--END: NageshBB: On 17 March 2020-- disabled billing table triggers which was used for send records into sync table

--START: NageshBB: on 18 March 2020-- Removing trigger from biling table which send records to sync table for accounting transfer

--deleting trigger which sync billing records to syncAccounting table for transfer to accounting
IF exists (SELECT * FROM sys.objects WHERE type = 'TR' AND name = 'TRG_BillToAcc_BillingTxnItem') 
Begin
	DROP TRIGGER  TRG_BillToAcc_BillingTxnItem 
END
Go

IF exists (SELECT * FROM sys.objects WHERE type = 'TR' AND name = 'TRG_BillToAcc_BillingTxn') 
Begin
	DROP TRIGGER  TRG_BillToAcc_BillingTxn
END
Go

IF exists (SELECT * FROM sys.objects WHERE type = 'TR' AND name = 'TRG_BillToAccSync_DepositTxn') 
Begin
	DROP TRIGGER  TRG_BillToAccSync_DepositTxn
END
Go
--END: NageshBB: on 18 March 2020-- Removing trigger from biling table which send records to sync table for accounting transfer

--START: Vikas: 18 March 2020: adding parameter value for is duplicate ledger allow or not for voucher entry
	IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where parametergroupname='Accounting' and parametername='IsAllowDuplicateVoucherEntry')
	BEGIN
	 Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
	 values('Accounting','IsAllowDuplicateVoucherEntry','true','boolean','set parameter for duplicate voucher entry allow or not','custom',null);
	END
	GO
--END: Vikas: 18 March 2020: adding parameter value for is duplicate ledger allow or not for voucher entry

--START: NageshBB: 19 March 2020: core parameter for received by in voucher report print with mapped section and voucher type 
If Exists (select *from CORE_CFG_Parameters where ParameterName='ReceivedByInVoucher' and Parametergroupname='accounting')
Begin
delete from CORE_CFG_Parameters where ParameterName='ReceivedByInVoucher' and Parametergroupname='accounting'
END
Go
Insert CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
values('Accounting','ReceivedByInVoucher','{"SectionId":5,"VoucherCode":"pmtv"}','JSON','Received By not needed for all type of vouchers and section. only needed few section with selected voucher type i.e. Incentive Payment voucher needed so, we will add here section id of invcentive module and payment voucher code,single section multiple voucher need same entry into json value',
'custom')
Go
--END: NageshBB: 19 March 2020: core parameter for received by in voucher report print with mapped section and voucher type 


--START : Vikas: 23 March 2020 : Created sp for billing daily transaction detilas.

/****** Object:  StoredProcedure [dbo].[SP_ACC_DailyTransactionReportDetails]    Script Date: 23-03-2020 08:13:55 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Procedure [dbo].[SP_ACC_DailyTransactionReportDetails] 
	@VoucherNumber varchar(50)	
AS

BEGIN
 Declare @TransactionType varchar(max),@ReferenceIds varchar(200)
 SET @TransactionType = (Select STRING_AGG(TransactionType, ',') as 'TrasactionType' 
						 From ACC_Transactions 
						 Where VoucherNumber = @VoucherNumber )
 
 SET @ReferenceIds =(Select STRING_AGG(ReferenceId, ',') as 'TrasactionType' 
					 From ACC_Transactions txn 
					 JOIN ACC_TXN_Link txnLink on txn.TransactionId= txnLink.TransactionId
					 WHERE txn.VoucherNumber =@VoucherNumber ) 



 IF(('DepositAdd') IN(select * from STRING_SPLIT(@TransactionType, ','))
   OR ('DepositReturn') IN(select * from STRING_SPLIT(@TransactionType, ',')) )
		SELECT 
			pat.FirstName + ' ' + ISNULL(pat.MiddleName,'') + ' ' + pat.LastName  as 'PatientName',
			dep.ReceiptNo as 'ReceiptNo',
			SUM(dep.Amount) as 'TotalAmount',
			dep.PaymentMode as 'PaymentMode'
		FROM BIL_TXN_Deposit dep 	
		join PAT_Patient pat on dep.PatientId = pat.PatientId
		WHERE dep.DepositId in (select * from STRING_SPLIT(@ReferenceIds, ',')) 

		GROUP BY
			pat.FirstName,pat.MiddleName,pat.LastName,
			dep.ReceiptNo ,
			dep.PaymentMode 

 IF( ('CashBill') IN(select * from STRING_SPLIT(@TransactionType, ','))
	OR ('CreditBill') IN(select * from STRING_SPLIT(@TransactionType, ','))
	OR ('CashBillReturn') IN(select * from STRING_SPLIT(@TransactionType, ','))
	OR ('CreditBillReturn') IN(select * from STRING_SPLIT(@TransactionType, ','))
   )
		SELECT 
				txn.InvoiceCode + cast(txn.InvoiceNo as varchar) as InvoiceNo,
				pat.FirstName + ' ' + ISNULL(pat.MiddleName,'') + ' ' + pat.LastName  as 'PatientName',
				itm.*
		FROM BIL_TXN_BillingTransactionItems itm 
				join BIL_TXN_BillingTransaction txn on itm.BillingTransactionId= txn.BillingTransactionId
				join PAT_Patient pat on itm.PatientId = pat.PatientId 
		WHERE itm.BillingTransactionItemId in (select * from STRING_SPLIT(@ReferenceIds, ','))

END
GO
--END : Vikas: 23 March 2020 : Created sp for billing daily transaction detilas.

--START : Vikas: 26 March 2020 :Scripts for invetory goods receipt mapping with accounting.

	-- insert script for mapping details for 'INVCreditGoodReceipt'
	DECLARE @GroupMappingId int
	SET @GroupMappingId  = (select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCreditGoodReceipt')
	
	-- DR : 1003-MERCHANDISE INVENTORY (1003)
	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_Ledger where [Name]='ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY' AND [Code]=1003 ),1)	

	-- CR : SUPPLIERS (A/C PAYABLES)
	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_MST_LedgerGroup where [Name]='LCL_SUNDRY_CREDITORS'),0)
	GO

	-- insert script for hospital transfer rules for 'INVCreditGoodReceipt'
	DECLARE @HospitalId int, @TransferRuleId int
	SET @HospitalId = (select HospitalId from ACC_MST_Hospital where HospitalShortName='CHARAK')
	SET @TransferRuleId = (select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCreditGoodReceipt')
	INSERT INTO ACC_MST_Hospital_TransferRules_Mapping ([HospitalId],[TransferRuleId],[IsActive])
		VALUES (@HospitalId,@TransferRuleId,1)
	GO

	-- add inventory integrations parameter script in core cfg table.
	IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where parametergroupname='Inventory' and parametername='InventoryACCIntegration')
	BEGIN
	 Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
	 values('Inventory','InventoryACCIntegration','{"IsAllowGroupByVoucher":true}','json','Invetory integreations parameter as per hospital requirements','custom',null);
	END
	GO


	-- START: update script 	
		--start ajay 05Jul'19 --getting records of inventory for accounting
		ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]
			@FromDate DATETIME=null ,
			@ToDate DATETIME=null
		AS
		--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @FromDate = '2019-07-05 12:07:31.170', @ToDate ='2020-07-05 12:07:31.170'

		/************************************************************************
		FileName: [SP_ACC_GetInventoryTransactions]
		CreatedBy/date: Ajay/05Jul'19
		Description: getting records of inventory transactions for accounting
		Change History
		-------------------------------------------------------------------------
		S.No.    UpdatedBy/Date                        Remarks
		-------------------------------------------------------------------------
		1       Ajay/05Jul'19						created the script
		*************************************************************************/
		BEGIN
			IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
			BEGIN

				SELECT 
					gr.CreatedOn,
					v.VendorName,
					gr.VendorId,
					 gr.PaymentMode,
					 itm.ItemCategoryId,
					 itm.ItemType,
					 itm.ItemName,
					 gr.TDSAmount,
					 gr.BillNo,		-- 26 March 2020:Vikas: added for invetory integration, 
									--						mapping with accounting as per charak requirements.
					 gritm.*
				FROM
					INV_TXN_GoodsReceipt gr 
					join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
					join INV_MST_Item itm on gritm.ItemId = itm.ItemId
				WHERE
					(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
					AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table1: GoodReceipt
				--SELECT 
				--	gr.* ,
				--	v.VendorName
				--FROM
				--	INV_TXN_GoodsReceipt gr 
				--	JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
				--WHERE
				--	(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
				--	AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
					AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
					AND (CONVERT(DATE, st.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			END
			ELSE
			BEGIN
				--Table1: GoodReceipt
				SELECT 
					gr.* ,
					v.VendorName
				FROM
					INV_TXN_GoodsReceipt gr 
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
				WHERE
					(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (TransactionType IN ('dispatch', 'Sent From WardSupply')) 
				END
			END
			GO
	-- END: update script

--END : Vikas: 26 March 2020 :Scripts for invetory goods receipt mapping with accounting.

--START: NageshBB: 26 March 2020: alter ACC_MST_Vouchers table for copy description column 
--add column into vocher table for copy description functionality allow or not
IF NOT EXISTS(SELECT 1 FROM sys.columns 
 WHERE Name = N'ISCopyDescription'
 AND Object_ID = Object_ID(N'dbo.ACC_MST_Vouchers'))
 BEGIN
ALTER TABLE ACC_MST_Vouchers
ADD ISCopyDescription bit 
DEFAULT 0 NOT NULL;
END
GO

Update ACC_MST_Vouchers
set ISCopyDescription=1 where VoucherCode='PMTV'
Go
--END: NageshBB: 26 March 2020: alter ACC_MST_Vouchers table for copy description column 
---end: from Charak_Accounting_Incremental_13March++.sql---




--start: from incr-emr-1691-inventory_substore-branch-2Mar++----
---Start: 28 Feb 2020 -- refactoring of existing table to support substore implementation
/****** Object:  Table [dbo].[WARD_Stock]    Script Date: 2/27/2020 5:22:00 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_INV_Stock](
	[StockId] [int] IDENTITY(1,1) NOT NULL,
	[StoreId] [int] NULL,
	[ItemId] [int] NULL,
	[AvailableQuantity] [int] NULL,
	[MRP] [float] NULL,
	[BatchNo] [varchar](max) NULL,
	[ExpiryDate] [datetime] NULL,
	[DepartmentId] [int] NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [DateTime] NOT NULL,
 CONSTRAINT [PK_WARD_INV_Stock] PRIMARY KEY CLUSTERED 
(
	[StockId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[WARD_Transaction]    Script Date: 2/27/2020 5:24:29 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_INV_Transaction](
	[TransactionId] [int] IDENTITY(1,1) NOT NULL,
	[StoreId] [int] NULL,
	[ItemId] [int] NOT NULL,
	[StockId] [int] NULL,
	[Quantity] [int] NOT NULL,
	[TransactionType] [varchar](255) NOT NULL,
	[Remarks] [varchar](255) NOT NULL,
	[ReceivedBy] [varchar](55) NULL,
	[CreatedBy] int NOT NULL,
	[CreatedOn] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TransactionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[WARD_INV_Transaction]  WITH CHECK ADD FOREIGN KEY([StockId])
REFERENCES [dbo].[WARD_INV_Stock] ([StockId])
GO

GO
ALTER TABLE INV_TXN_Requisition
	ADD StoreId INT NOT NULL Default(1);
GO

--to add StoreId in dispatch table in inventory
Alter Table INV_TXN_DispatchItems
Add StoreId int not null default(1)
Go
--to add store in consumption table in inventory
Alter Table WARD_INV_Consumption
Add StoreId int
Go
---reports for inventory substore
/****** Object:  StoredProcedure [dbo].[SP_WardInv_Report_ConsumptionReport]    Script Date: 2/28/2020 6:05:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardInv_Report_ConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardInv_Report_ConsumptionReport]
CreatedBy/date: Rusha/06-25-2019
Description: To get the Consumption Details of Inventory Items Consume by Ward
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/07-12-2019						only show consumable items 
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT CONVERT(date,con.CreatedOn) AS [Date], con.DepartmentName, con.ItemName,con.Quantity,con.UsedBy AS [User], con.Remark 
			FROM WARD_INV_Consumption as con
			JOIN INV_MST_Item as itm on itm.ItemId = con.ItemId
			WHERE con.StoreId = @StoreId and CONVERT(date, con.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			AND itm.ItemType = 'Consumables' 
		END		
END

GO
/****** Object:  StoredProcedure [dbo].[SP_WardInv_Report_RequisitionDispatchReport]    Script Date: 2/28/2020 6:07:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardInv_Report_RequisitionDispatchReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardInv_Report_RequisitionDispatchReport]
CreatedBy/date: Rusha/06-04-2019
Description: To get stock details of requisition and dispatch from ward to inventory
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------

----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			select convert(date,reqitm.CreatedOn) as RequisitionDate, convert(date,disitm.CreatedOn) as DispatchDate, dept.DepartmentName,
			itm.ItemName,reqitm.Quantity as RequestQty,
			reqitm.ReceivedQuantity, reqitm.PendingQuantity, disitm.DispatchedQuantity,reqitm.Remark
			from INV_TXN_RequisitionItems as reqitm
			join INV_TXN_Requisition as req on req.RequisitionId = reqitm.RequisitionId
			join INV_TXN_DispatchItems as disitm on disitm.DispatchItemsId = reqitm.RequisitionItemId
			join INV_MST_Item as itm on itm.ItemId = reqitm.ItemId
			join MST_Department as dept on dept.DepartmentId = disitm.DepartmentId
			where req.StoreId = @StoreId and CONVERT(date, reqitm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END		
End

GO
/****** Object:  StoredProcedure [dbo].[SP_WardInv_Report_TransferReport]    Script Date: 2/28/2020 6:09:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardInv_Report_TransferReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardInv_Report_TransferReport]
CreatedBy/date: Rusha/06-05-2019
Description: To get the details of stock transfer from ward to inventory 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------

----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT CONVERT(date,trans.CreatedOn) AS [Date],dep.DepartmentName,itm.ItemName,trans.Quantity,trans.Remarks, trans.CreatedBy 
			FROM WARD_INV_Transaction AS trans
			JOIN WARD_INV_Stock AS stk ON stk.StockId = trans.StockId
			JOIN MST_Department AS dep ON dep.DepartmentId = stk.DepartmentId
			JOIN INV_MST_Item AS itm ON itm.ItemId = stk.ItemId		
			WHERE stk.StoreId = @StoreId and CONVERT(date, trans.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END	
END
---END: 28 Feb 2020 -- refactoring of existing table to support substore implementation


---Start: 2 Mar 2020 -- refactoring of existing table to support substore implementation
GO
/****** Object:  StoredProcedure [dbo].[SP_WardInv_Report_RequisitionDispatchReport]    Script Date: 3/2/2020 5:31:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardInv_Report_RequisitionDispatchReport]  
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
AS
/*
FileName: [SP_WardInv_Report_RequisitionDispatchReport]
CreatedBy/date: Rusha/06-04-2019
Description: To get stock details of requisition and dispatch from ward to inventory
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------

----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			select convert(date,reqitm.CreatedOn) as RequisitionDate, convert(date,disitm.CreatedOn) as DispatchDate,
			itm.ItemName,reqitm.Quantity as RequestQty,
			reqitm.ReceivedQuantity, reqitm.PendingQuantity, disitm.DispatchedQuantity,reqitm.Remark
			from INV_TXN_RequisitionItems as reqitm
			join INV_TXN_Requisition as req on req.RequisitionId = reqitm.RequisitionId
			left join INV_TXN_DispatchItems as disitm on disitm.DispatchItemsId = reqitm.RequisitionItemId
			join INV_MST_Item as itm on itm.ItemId = reqitm.ItemId
			where req.StoreId = @StoreId and CONVERT(date, reqitm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END		
End
GO
--removing the foreign key reference in INV_TXN_DispatchItems table that references to MST_Department
ALTER TABLE dbo.INV_TXN_DispatchItems   
DROP CONSTRAINT FK_INV_TXN_DispatchItems_MST_Department;   
GO  
---END: 2 Mar 2020 -- refactoring of existing table to support substore implementation

---Start: Sanjit : 2 Mar 2020 -- refactoring of existing table to support substore implementation
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_GoodReceiptEvaluation]    Script Date: 3/3/2020 12:14:02 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

CREATE PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAll]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: SP_Report_Inventory_SubstoreGetAll
 Created: 12Dec'19 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.
 -------------------------------------------------------------------------
*/
BEGIN
  BEGIN
    select SUM(Z.TotalQuantity)'TotalQuantity',
	SUM(Z.TotalValue)'TotalValue',
	SUM(Z.ExpiryQuantity)'ExpiryQuantity',
	SUM(Z.ExpiryValue)'ExpiryValue' 
	from
		((select stk.ItemId, 
				sum(stk.AvailableQuantity) 'TotalQuantity',
				AVG(gritm.ItemRate)*sum(stk.AvailableQuantity) 'TotalValue',
				0 'ExpiryQuantity',
				0'ExpiryValue'
			from INV_TXN_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
			WHERE	CASE
						WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
						WHEN @StoreId>0 and @StoreId = 1 THEN 1
						WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by stk.ItemId)
		union all
			(select stk.ItemId, 
				0'TotalQuantity',
				0'TotalValue',
				sum(stk.AvailableQuantity) 'ExpiredQuantity',
				AVG(gritm.ItemRate)*sum(stk.AvailableQuantity) 'ExpiredValue'
			from INV_TXN_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
			where stk.ExpiryDate < GetDATE() AND	
			CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by stk.ItemId)
		union all
			(select ItemId,
				sum(AvailableQuantity) 'TotalQuantity',
				AVG(stk.MRP)*sum(AvailableQuantity) 'TotalValue',
				0 'ExpiryQuantity',
				0'ExpiryValue'  
			from WARD_INV_Stock stk
			WHERE	CASE
						WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
						WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
						WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by ItemId)
		union all
			(select ItemId,
				0'TotalQuantity',
				0'TotalValue',
				sum(AvailableQuantity) 'ExpiryQuantity',
				AVG(stk.MRP)*sum(AvailableQuantity) 'ExpiryValue'  
			from WARD_INV_Stock stk
			where stk.ExpiryDate<GetDate()
			AND CASE
						WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
						WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
						WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by ItemId)) 
	as Z

  END
END

GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_GoodReceiptEvaluation]    Script Date: 3/3/2020 12:14:02 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

CREATE PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: [SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]
 Created: 3Mar'20 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.
 -------------------------------------------------------------------------
*/
BEGIN
    SELECT str.StoreId, str.Name, 
		sum(stk.AvailableQuantity) 'TotalQuantity',
		AVG(gritm.ItemRate)*sum(stk.AvailableQuantity) 'TotalValue',
		(select SUM(DispatchedQuantity)  from INV_TXN_DispatchItems) 'TotalConsumed'
	from INV_TXN_Stock stk
	join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
	join PHRM_MST_Store str on str.StoreId = 1
	WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
	group by str.StoreId,str.Name
UNION ALL
SELECT str.StoreId, str.Name, 
		sum(stk.AvailableQuantity) 'TotalQuantity',
		AVG(stk.MRP)*sum(stk.AvailableQuantity) 'TotalValue',
		SUM(consump.Quantity) 'TotalConsumed'
	from WARD_INV_Stock stk
	join PHRM_MST_Store str on str.StoreId = stk.StoreId
	join WARD_INV_Consumption consump on consump.StoreId = str.StoreId
	WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
	group by str.StoreId,str.Name

  
END

GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_GoodReceiptEvaluation]    Script Date: 3/3/2020 12:14:02 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

CREATE PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnItemId]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: [SP_Report_Inventory_SubstoreGetAllBasedOnItemId]
 Created: 3Mar'20 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.
 -------------------------------------------------------------------------
*/
BEGIN
    Select Z.ItemId,itm.ItemName,Sum(Z.TotalQuantity)'TotalQuantity',Sum(Z.TotalValue)'TotalValue',SUM(Z.TotalConsumed)'TotalConsumed'	from
	(select stk.ItemId, 
			sum(stk.AvailableQuantity) 'TotalQuantity',
			AVG(gritm.ItemRate)*sum(stk.AvailableQuantity) 'TotalValue',
			0 'TotalConsumed'
		from INV_TXN_Stock stk
		join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
		WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
		group by stk.ItemId
	union all
	select stk.ItemId,
			sum(AvailableQuantity) 'TotalQuantity',
			AVG(stk.MRP)*sum(AvailableQuantity) 'TotalValue',
			SUM(consump.Quantity) 'TotalConsumed' 
		from WARD_INV_Stock stk
		join WARD_INV_Consumption consump on consump.ItemId = stk.ItemId
		WHERE	CASE
					WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
					WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
					WHEN @StoreId=0 and @ItemId = 0 Then 1
				END = 1
		group by stk.ItemId) AS Z
join INV_MST_Item itm on itm.ItemId = Z.ItemId
group by Z.ItemId,itm.ItemName
order by SUM(Z.TotalQuantity) desc

  
END
GO
--create permission for view
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Inventory' and ApplicationCode='INV');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('inventory-reports-substorestock-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='inventory-reports-substorestock-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Inventory/Reports')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId,Css, DefaultShow,DisplaySeq ,IsActive)
values ('Substore Stock', 'Inventory/Reports/SubstoreStock','SubstoreStock',@PermissionId,@RefParentRouteId,'fa fa-shopping-cart fa-stack-1x text-white',1,18,1);
GO
---END: Sanjit : 2 Mar 2020 -- refactoring of existing table to support substore implementation

---Start: Sanjit : 4 Mar 2020 -- altering sp for Substore stock report
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_SubstoreGetAll]    Script Date: 3/3/2020 12:14:02 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

Alter PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAll]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: SP_Report_Inventory_SubstoreGetAll
 Created: 12Dec'19 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.
 -------------------------------------------------------------------------
*/
BEGIN
  BEGIN
    select SUM(Z.TotalQuantity)'TotalQuantity',
	SUM(Z.TotalValue)'TotalValue',
	SUM(Z.ExpiryQuantity)'ExpiryQuantity',
	SUM(Z.ExpiryValue)'ExpiryValue' 
	from
		((select stk.ItemId, 
				sum(stk.AvailableQuantity) 'TotalQuantity',
				AVG(ISNULL(gritm.ItemRate,0))*sum(stk.AvailableQuantity) 'TotalValue',
				0 'ExpiryQuantity',
				0'ExpiryValue'
			from INV_TXN_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
			WHERE	CASE
						WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
						WHEN @StoreId>0 and @StoreId = 1 THEN 1
						WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by stk.ItemId)
		union all
			(select stk.ItemId, 
				0'TotalQuantity',
				0'TotalValue',
				sum(stk.AvailableQuantity) 'ExpiredQuantity',
				AVG(ISNULL(gritm.ItemRate,0))*sum(stk.AvailableQuantity) 'ExpiredValue'
			from INV_TXN_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
			where stk.ExpiryDate < GetDATE() AND	
			CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by stk.ItemId)
		union all
			(select ItemId,
				sum(AvailableQuantity) 'TotalQuantity',
				AVG(ISNULL(stk.MRP,0))*sum(AvailableQuantity) 'TotalValue',
				0 'ExpiryQuantity',
				0'ExpiryValue'  
			from WARD_INV_Stock stk
			WHERE	CASE
						WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
						WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
						WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by ItemId)
		union all
			(select ItemId,
				0'TotalQuantity',
				0'TotalValue',
				sum(AvailableQuantity) 'ExpiryQuantity',
				AVG(ISNULL(stk.MRP,0))*sum(AvailableQuantity) 'ExpiryValue'  
			from WARD_INV_Stock stk
			where stk.ExpiryDate<GetDate()
			AND CASE
						WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
						WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
						WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by ItemId)) 
	as Z

  END
END

GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]    Script Date: 3/3/2020 12:14:02 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

Alter PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: [SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]
 Created: 3Mar'20 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.
 -------------------------------------------------------------------------
*/
BEGIN
    SELECT str.StoreId, str.Name, 
		sum(stk.AvailableQuantity) 'TotalQuantity',
		AVG(ISNULL(gritm.ItemRate,0))*sum(stk.AvailableQuantity) 'TotalValue',
		ISNULL((select SUM(DispatchedQuantity)  from INV_TXN_DispatchItems),0) 'TotalConsumed'
	from INV_TXN_Stock stk
	join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
	join PHRM_MST_Store str on str.StoreId = 1
	WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
	group by str.StoreId,str.Name
UNION ALL
SELECT str.StoreId, str.Name, 
		sum(stk.AvailableQuantity) 'TotalQuantity',
		AVG(ISNULL(stk.MRP,0))*sum(stk.AvailableQuantity) 'TotalValue',
		SUM(ISNULL(consump.Quantity,0))'TotalConsumed'
	from WARD_INV_Stock stk
	join PHRM_MST_Store str on str.StoreId = stk.StoreId
	left join WARD_INV_Consumption consump on consump.StoreId = str.StoreId and consump.ItemId = stk.ItemId
	WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
	group by str.StoreId,str.Name

  
END

GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnItemId]    Script Date: 3/3/2020 12:14:02 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

Alter PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnItemId]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: [SP_Report_Inventory_SubstoreGetAllBasedOnItemId]
 Created: 3Mar'20 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.
 -------------------------------------------------------------------------
*/
BEGIN
    Select Z.ItemId,itm.ItemName,Sum(Z.TotalQuantity)'TotalQuantity',Sum(Z.TotalValue)'TotalValue',SUM(Z.TotalConsumed)'TotalConsumed'	from
	(select stk.ItemId, 
			sum(stk.AvailableQuantity) 'TotalQuantity',
			AVG(ISNULL(gritm.ItemRate,0))*sum(stk.AvailableQuantity) 'TotalValue',
			0 'TotalConsumed'
		from INV_TXN_Stock stk
		join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
		WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
		group by stk.ItemId
	union all
	select stk.ItemId,
			sum(AvailableQuantity) 'TotalQuantity',
			AVG(ISNULL(stk.MRP,0))*sum(AvailableQuantity) 'TotalValue',
			SUM(ISNULL(consump.Quantity,0)) 'TotalConsumed' 
		from WARD_INV_Stock stk
		left join WARD_INV_Consumption consump on consump.StoreId = stk.StoreId and consump.ItemId = stk.ItemId
		WHERE	CASE
					WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
					WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
					WHEN @StoreId=0 and @ItemId = 0 Then 1
				END = 1
		group by stk.ItemId) AS Z
join INV_MST_Item itm on itm.ItemId = Z.ItemId
group by Z.ItemId,itm.ItemName
order by SUM(Z.TotalQuantity) desc

  
END
GO

---END: Sanjit : 4 Mar 2020 -- altering sp for Substore stock report



---Start 5 Mar 2020 -- SP SP_Report_Dispatch_Details Change
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Dispatch_Details]    Script Date: 3/5/2020 4:32:52 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Dispatch_Details]
		@DispatchId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Kushal/18 Oct 2019				Created Script 
2		Sanjit/5 Mar 2020				divided by zero bug fix using case statement
----------------------------------------------------------
*/
BEGIN
		If(@DispatchId > 0)
			BEGIN
			SELECT A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemName,
			CASE 
			  WHEN SUM(A.Qty) != 0 THEN ROUND((SUM(A.Amt)/SUM(A.Qty)),2)
			  ELSE 0
			END StandardRate,
			A.ITemId,A.Code,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy FROM 
			(
				SELECT  emp.Salutation+'. '+emp.FirstName+' '+ emp.LastName as CreatedByName,
				dis.CreatedOn,
				req.CreatedOn RequisitionDate,
				itm.ItemName,
				itm.Code,
				dis.ItemId,
				dis.DispatchedQuantity,
				req.RequisitionId,
				dis.DispatchId,
				stk.AvailableQuantity Qty,
				gri.ItemRate*stk.AvailableQuantity Amt,
				dis.ReceivedBy
				from INV_TXN_DispatchItems dis 
				join INV_MST_Item itm on itm.ItemId = dis.ItemId
				join INV_TXN_RequisitionItems req on req.RequisitionItemId = dis.RequisitionItemId
				join EMP_Employee emp on emp.EmployeeId = dis.CreatedBy
				join INV_TXN_Stock stk on stk.ItemId = itm.ItemId
				join INV_TXN_GoodsReceiptItems gri on gri.GoodsReceiptItemId = stk.GoodsReceiptItemId
			where dis.DispatchId = @DispatchId
			) A
			group by A.ItemName,A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemId,A.Code,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy
			END
			END
GO
ALTER TABLE INV_TXN_DispatchItems
ADD RequisitionId int
GO
---END: 5 Mar 2020 -- SP Change
--Start: Sanjit 6Mar'2020 --updating requisitionId value in INV_TXN_Dispatch table
GO
  UPDATE INV_TXN_DispatchItems 
  SET RequisitionId = RI.RequisitionId 
  FROM
     INV_TXN_RequisitionItems RI 
  WHERE
     RI.RequisitionItemId = INV_TXN_DispatchItems.RequisitionItemId and INV_TXN_DispatchItems.RequisitionId is null
GO
--END: Sanjit 6Mar'2020

--Start: Sanjit 11Mar'2020 --creating verification table and adding reference to inv_txn_requisition
GO
/****** Object:  Table [dbo].[TXN_Verification]    Script Date: 3/17/2020 6:51:27 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[TXN_Verification](
	[VerificationId] [int] IDENTITY(1,1) NOT NULL,
	[VerifiedBy] [int] NOT NULL,
	[VerifiedOn] [datetime] NOT NULL,
	[CurrentVerificationLevel] [int] NOT NULL,
	[MaxVerificationLevel] [int] NOT NULL,
	[VerificationStatus] [nvarchar](50) NOT NULL,
	[ParentVerificationId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[VerificationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[TXN_Verification] ADD  DEFAULT ((0)) FOR [ParentVerificationId]
GO

ALTER TABLE [dbo].[INV_TXN_Requisition]
ADD [VerificationId] [int] NULL;
GO
/****** Object:  Table [dbo].[MST_MAP_StoreVerification]    Script Date: 3/17/2020 6:52:51 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MST_MAP_StoreVerification](
	[StoreVerificationMapId] [int] IDENTITY(1,1) NOT NULL,
	[StoreId] [int] NOT NULL,
	[MaxVerificationLevel] [int] NOT NULL,
	[VerificationLevel] [int] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
	[IsActive] [bit] NOT NULL,
	[PermissionId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[StoreVerificationMapId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [UK_MST_MAP_StoreVerification] UNIQUE NONCLUSTERED 
(
	[StoreVerificationMapId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[MST_MAP_StoreVerification]  WITH CHECK ADD  CONSTRAINT [FK_MST_MAP_StoreVerification_PHRM_MST_Store] FOREIGN KEY([StoreId])
REFERENCES [dbo].[PHRM_MST_Store] ([StoreId])
GO

ALTER TABLE [dbo].[MST_MAP_StoreVerification] CHECK CONSTRAINT [FK_MST_MAP_StoreVerification_PHRM_MST_Store]
GO

ALTER TABLE PHRM_MST_Store
ADD [MaxVerificationLevel] [int];
GO
ALTER TABLE PHRM_MST_Store
ADD [PermissionId] [int] DEFAULT(0);
GO
--update permissionid in phrm_mst_store
UPDATE PHRM_MST_Store
	SET PermissionId = (Select RP.PermissionId From RBAC_Permission RP
						Where RP.PermissionName = Name)
	WHERE PermissionId = 0
GO
--END: Sanjit 11Mar'2020 

--START: Sanjit 24th March'2020 missing incrementals
UPDATE PHRM_MST_Store
	SET PermissionId = 0
	WHERE PermissionId is null
GO

UPDATE PHRM_MST_Store
	SET MaxVerificationLevel = 0
	WHERE MaxVerificationLevel is null
GO
--END: Sanjit 24th March'2020
--Start: Sanjit 25th March'2020 Added field for cancelled remarks in Goods Receipt

ALTER TABLE INV_TXN_GoodsReceipt
	ADD CancelRemarks nvarchar(1000);
GO

UPDATE INV_TXN_GoodsReceipt
	SET CancelRemarks = ''
	WHERE CancelRemarks is null
GO

DECLARE @ApplicationId INT
	SET @ApplicationId = (Select TOP (1) ApplicationId from RBAC_Application 
	where ApplicationName = 'Inventory' and ApplicationCode= 'INV');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('inventory-goodsreceipt-edit-button',@ApplicationId,1,GETDATE(),1)
GO

DECLARE @ApplicationId INT
	SET @ApplicationId = (Select TOP (1) ApplicationId from RBAC_Application 
	where ApplicationName = 'Inventory' and ApplicationCode= 'INV');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('inventory-goodsreceipt-cancel-button',@ApplicationId,1,GETDATE(),1)
GO

--END: Sanjit 25th March'2020

--START: Sanjesh: 26 March 2020--isActive,ModifiedBy,ModifiedOn column added in INV_TXN_RequisitionItems and INV_TXN_Requisition table
	 Alter table INV_TXN_RequisitionItems
            add  ModifiedBy int null ,isActive bit default 1,
			ModifiedOn DateTime null 
			GO
--END: Sanjesh: 26 March 2020--isActive,ModifiedBy,ModifiedOn column added in INV_TXN_RequisitionItems and INV_TXN_Requisition table

--end: from incr-emr-1691-inventory_substore-branch-2Mar++----








--start: from  incr-charak-hospital-branch-12Feb++.sql--
---START-Sud:13Feb: Merged DEV TO Charak-- and these are Charak Changes--(Please note that some of it are already included in INCR-51 --

-- Start: Pratik 5Feb2020, -- Incentive Transaction Routes added --
DECLARE @AppId int

SELECT @AppId = ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'INCTV'

INSERT INTO RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
VALUES 
('incentive-transactions-invoice-view', @AppId, 1, GETDATE(), 1),
('incentive-transactions-invoiceitem-view', @AppId, 1, GETDATE(), 1)


GO
DECLARE  @permId int, @pRouteId int
SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-transactions-invoice-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Transactions'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Invoice', 'Incentive/Transactions/InvoiceLevel', 'InvoiceLevel', @permId, @pRouteId, 1, NULL, 1)

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-transactions-invoiceitem-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Transactions'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Item', 'Incentive/Transactions/InvoiceItemLevel', 'InvoiceItemLevel', @permId, @pRouteId, 1, NULL, 1)
GO
-- End:Pratik 10Feb2020, -- Incentive Transaction Routes added --



-- Start:Pratik 10Feb2020, -- Incentive Transaction Invoice level SP--


/****** Object:  StoredProcedure [dbo].[SP_INCTV_ViewTxn_InvoiceLevel]    Script Date: 2/10/2020 4:52:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_INCTV_ViewTxn_InvoiceLevel] --SP_INCTV_ViewTxn_InvoiceLevel '2020-02-06','2020-02-06',0
	( @FromDate DATETIME = NULL,
      @ToDate DATETIME = NULL,
      @EmployeeId INT=NULL)
AS
/*
 File: SP_INCTV_ViewTxn_InvoiceLevel
 Description: 
 Conditions/Checks: 
        

 Remarks: Needs Revision.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By       Remarks
 --------------------------------------------------
 1.      24Jan'20/Pratik          Initial Draft (Needs Revision)
 
 ---------------------------------------------------
*/
BEGIN

select
pat.PatientId, pat.FirstName+' '+pat.LastName 'PatientName', pat.PatientCode,

 fyear.FiscalYearFormatted +'-'+ bilTxn.InvoiceCode + cast(bilTxn.InvoiceNo as varchar(20)) AS 'InvoiceNo' 
, bilTxn.CreatedOn 'TransactionDate', bilTxn.TotalAmount, biltxn.BillingTransactionId

from BIL_TXN_BillingTransaction bilTxn, BIL_CFG_FiscalYears fyear, PAT_Patient pat
where 
	bilTxn.FiscalYearId=fyear.FiscalYearId 
	and bilTxn.PatientId=pat.PatientId
	AND Convert(Date,bilTxn.CreatedOn) Between @FromDate AND @ToDate
	and ISNULL(bilTxn.ReturnStatus,0) = 0


END
GO

-- End:Pratik 10Feb2020, -- Incentive Transaction Invoice level SP--


-- Start:Pratik 10Feb2020, -- Incentive Transaction Invoice Item level SP--

/****** Object:  StoredProcedure [dbo].[SP_INCTV_ViewTxn_InvoiceItemLevel]    Script Date: 2/10/2020 4:48:32 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_INCTV_ViewTxn_InvoiceItemLevel]    --SP_INCTV_ViewTxn_InvoiceItemLevel '2020-02-05','2020-02-10',313716,0
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL,
  @BillingTansactionId int = NULL,
  @EmployeeId INT=NULL
AS
/*
 File: SP_INCTV_ViewTxn_InvoiceItemLevel
 Description: 
 Conditions/Checks: 
        

 Remarks: Needs Revision.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By       Remarks
 --------------------------------------------------
 1.      24Jan'20/Pratik          Initial Draft (Needs Revision)
 
 ---------------------------------------------------
*/
BEGIN

IF(@EmployeeId=0)
BEGIN
 SET @EmployeeId=NULL
END

; WITH ItemsTxnInfo AS (
    Select cfgItm.BillItemPriceId,  txnItm.BillingTransactionItemId, 
	
	 txnItm.ItemId, txnItm.ItemName,txnItm.ServiceDepartmentId,txnItm.TotalAmount, txnItm.PriceCategory,
	txnItm.RequestedBy,txnItm.ProviderId,txnItm.PatientId,
	pat.FirstName+' '+pat.LastName 'PatientName',pat.PatientCode,
	txnItm.Quantity,txnItm.Price, txnItm.DiscountAmount, txnItm.SubTotal
		from 
		 (
		   Select * from  BIL_TXN_BillingTransactionItems 
		   --Don't show the transaction items whose incentive is already calculated and stored in fractionitems table--
		   WHERE BillingTransactionItemId NOT IN (Select BillingTransactionItemId from INCTV_TXN_IncentiveFractionItem)  
		       and BillingTransactionId =@BillingTansactionId
		 )txnItm
		   
		  INNER JOIN BIL_CFG_BillItemPrice cfgItm
			 ON txnItm.ServiceDepartmentId=cfgItm.ServiceDepartmentId
				AND txnItm.ItemId=cfgItm.ItemId
			
		  INNER JOIN PAT_Patient pat
		  on txnItm.PatientId = pat.PatientId

		WHERE cfgItm.isFractionApplicable=1
		 
 )
 

 Select BillingTransactionItemId, ItemName, Quantity ,Price, SubTotal,DiscountAmount ,TotalAmount, PriceCategory,
    ReferredByEmpName,ReferredByEmpId,ReferredByPercent,ReferralAmount,
    AssignedToEmpName,AssignedToEmpId,AssignedToPercent,AssignedToAmount
 
 from 

 (

 SELECT   txn.PriceCategory,   txn.BillingTransactionItemId, 
   txn.BillItemPriceId,
   txn.PatientId, 
   txn.ItemName, txn.TotalAmount, 
   refItems.EmployeeId 'ReferredByEmpId', refItems.FullName 'ReferredByEmpName', 
   refItems.ReferredByPercent, ISNULL(txn.TotalAmount,0)*refItems.ReferredByPercent/100 'ReferralAmount',
   assignedToItms.EmployeeId 'AssignedToEmpId', assignedToItms.FullName 'AssignedToEmpName' ,
   assignedToItms.AssignedToPercent, ISNULL(txn.TotalAmount,0)*assignedToItms.AssignedToPercent/100 'AssignedToAmount',
   txn.Quantity,txn.Price, txn.DiscountAmount, txn.SubTotal


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
         
		-- WHERE --ISNULL(@EmployeeId,ISNULL(emp.EmployeeId,0)) =  ISNULL(emp.EmployeeId,0)
		 --ISNULL(emp.EmployeeId,0) = ISNULL(@EmployeeId, ISNULL(emp.EmployeeId,0))
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

         
		 ) assignedToItms
   ON txn.BillItemPriceId=assignedToItms.BillItemPriceId
      AND txn.ProviderId = assignedToItms.EmployeeId	
	  AND txn.PriceCategory = assignedToItms.PriceCategoryName


   WHERE (ISNULL(refItems.EmployeeId,0) = ISNULL(@EmployeeId, ISNULL(refItems.EmployeeId,0))  OR  ISNULL(assignedToItms.EmployeeId,0) = ISNULL(@EmployeeId, ISNULL(assignedToItms.EmployeeId,0)))

   ) outerTbl


END
GO
-- End:Pratik 10Feb2020, -- Incentive Transaction Invoice Item level SP--

--Anish: Start: 13 Feb SP for Lab Collect Sample Performance Tuning--
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_LAB_AllRequisitionsBy_VisitAndRunType]
 @RunNumberType varchar(20),
 @VisitType varchar(20),
 @HasInsurance bit
AS
BEGIN
declare @threeMonthsBack date;
set @threeMonthsBack = Convert(date,DATEADD(month, -3, GETDATE())); 
	select * from LAB_TestRequisition 
	where SampleCode Is Not Null AND LOWER(VisitType)=@VisitType
	AND LOWER(RunNumberType)=@RunNumberType AND HasInsurance=@HasInsurance
	AND SampleCreatedOn Is Not Null AND Convert(date,SampleCreatedOn) > @threeMonthsBack;

	select COALESCE(MAX(BarCodeNumber),1000000) as BarCodeNumber from LAB_BarCode;
END
GO

/****** Object:  StoredProcedure [dbo].[SP_LAB_GetLatestBarCodeNumber]    Script Date: 2/13/2020 4:22:55 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_LAB_GetLatestBarCodeNumber]
AS
BEGIN
select COALESCE(MAX(BarCodeNumber)+1,1000000) as Value from LAB_BarCode
END
GO
--Anish: End: 13 Feb SP for Lab Collect Sample --

	
---END-Sud:13Feb: Merged DEV TO Charak-- and these are Charak Changes--(Please note that some of it are already included in INCR-51 --
---@developers working in charak branch: Please check and run all above incremental if not already run in your machine..sud: 28Feb-----



---start--Sud: 12Feb'20--- for incentive---
/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_ReferralItemsSummary]    Script Date: 2/12/2020 11:25:09 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*-- =============================================
-- Author:		Pratik/20Nov'19
-- Description:	To get Incentive reports at items level for input doctor. 
--Change History-----
S.No.   Date/Author    Remarks
---------------------------------------
1.     20Nov'19/Pratik   Initial Draft
2.     12Feb'20/Sud      TDS percent hardcoded for temporary purpose, need to revise it soon. 

-- =============================================*/
ALTER PROCEDURE [dbo].[SP_Report_INCTV_ReferralItemsSummary]  --EXEC SP_Report_INCTV_ReferralItemsSummary '2019-07-01','2019-10-01',2
	@FromDate date = NULL,
    @ToDate date = NULL,
    @EmployeeId int = NULL
AS
BEGIN
	Select incItm.IncentiveReceiverName, incItm.TransactionDate, incItm.InvoiceNoFormatted, incItm.IncentiveType 'IncomeType', 
	       incItm.PatientId, pat.FirstName+' '+pat.LastName 'PatientName', pat.PatientCode 'HospitalNum', 
		   incItm.ItemName, incItm.TotalBillAmount 'TotalAmount', incItm.IncentivePercent, incItm.IncentiveAmount,

		   --Here TDS Percent is hard-coded, we need to add them to Fractionitem table and calculate from there, not from here--sud: 12Feb'20
		   incItm.IncentiveAmount*15/100 'TDSAmount', incItm.IncentiveAmount - incItm.IncentiveAmount*15/100 'NetPayableAmt'
		   
	from INCTV_TXN_IncentiveFractionItem incItm
	     INNER JOIN PAT_Patient pat
		 ON incItm.PatientId=pat.PatientId
	WHERE 
	    IncentiveReceiverId = @EmployeeId
	    AND Convert(Date,incItm.TransactionDate) Between @FromDate AND @ToDate
END
GO
---End--Sud: 12Feb'20--- for incentive---

--sud:14Feb-for provisionalslip footer---
IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where ParameterGroupName='Billing' and ParameterName='ProvisionalSlipFooterNoteSettings')
BEGIN
  INSERT INTO [dbo].[CORE_CFG_Parameters]
           ([ParameterGroupName]
           ,[ParameterName]
           ,[ParameterValue]
           ,[ValueDataType]
           ,[Description]
           ,[ParameterType])
     VALUES
           ('Billing','ProvisionalSlipFooterNoteSettings', N'{"ShowFooter":false,"EnglishText":"!! This is not Final Invoice !!","NepaliText":"जानकारीको लागि मात्र","VerticalAlign":true}'  ,'JSON' ,'To avoid confusion and mis-use of Provisional slip with actual invoice, this information is needed to display in footer of provisional slip. default show is false, default vertical alignment is true.','custom')

END
GO
--sud:14Feb-for provisionalslip footer---

---start--Sud: 15Feb'20--- for Handover-Basic correction---
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Bill_BillDenominationAllList]    Script Date: 2/15/2020 3:51:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Bill_BillDenominationAllList]	--- SP_Report_Bill_BillDenominationAllList '2020-02-14','2020-02-15'
	@FromDate DateTime=null,
	@ToDate DateTime=null
AS
/*
Change History:
---------------------
S.No.  Date/User             Remarks
------------------------------
1.    Unknown/Unknown       Initial Draft
2.    15Feb'20/Sud          Made basic revision in joins so that it appears in report. Need Complete Re-Write soon. 
*/

BEGIN
    IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)

    BEGIN

	  SELECT
		emp.EmployeeId 'UserId',
		emp.FirstName 'FirstName',
		emp.MiddleName 'MiddleName',
		emp.LastName 'LastName',

		emp2.FirstName 'hFirstName',
		emp2.MiddleName 'hMiddleName',
		emp2.LastName 'hLastName',

		h.HandoverType 'HandoverType',
		h.HandoverUserId 'HandoverUserId',
		h.HandoverAmount 'HandoverAmount',
		h.CreatedOn 'CreatedOn',
		'' as DepartmentName
		--d.ServiceDepartmentName 'DepartmentName'

		from EMP_Employee emp
		    join BIL_MST_Handover h on emp.EmployeeId = h.UserId
		    left join EMP_Employee emp2 on emp2.EmployeeId= h.HandoverUserId
		WHERE CONVERT(date,h.CreatedOn) between @FromDate AND @ToDate
		ORDER BY h.CreatedOn DESC

    END
END
GO
---End--Sud: 15Feb'20--- for Handover-Basic correction---

---start--Sud: 17Feb'20---For Incentive Load and Incentive From Invoice Level---

/****** Object:  UserDefinedFunction [dbo].[FN_INCTV_GetIncentiveSettings]    Script Date: 2/17/2020 10:45:20 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[FN_INCTV_GetIncentiveSettings] ()
RETURNS TABLE
/*
To get current incentive profile settings
Created: sud-15Feb'20
Remarks: Needs revision.
*/
AS
    RETURN
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
       WHERE price.isFractionApplicable=1
    )
GO

/****** Object:  StoredProcedure [dbo].[SP_INCTV_ViewTxn_InvoiceItemLevel]    Script Date: 2/17/2020 10:53:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_INCTV_ViewTxn_InvoiceItemLevel]    --SP_INCTV_ViewTxn_InvoiceItemLevel '2020-02-05','2020-02-10',313716,0
  @BillingTansactionId int = NULL
AS
/*
 File: SP_INCTV_ViewTxn_InvoiceItemLevel
 Description: 
 Conditions/Checks: 

 Remarks: We're returning 2 tables from here
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By       Remarks
 --------------------------------------------------
 1.      24Jan'20/Pratik          Initial Draft (Needs Revision)
 2.      16Feb'20/Sud         Rewrite after change in logic.. 
 ---------------------------------------------------
*/
BEGIN
  --Table:1 -- Get BillingTransactionItem information---
select PatientId, BillingTransactionItemId, BillingTransactionId, ItemName, Quantity, Price, SubTotal, DiscountAmount, TotalAmount
from BIL_TXN_BillingTransactionItems
where BillingTransactionId=@BillingTansactionId

  --Table:2 -- Get Fraction Information---
Select * from INCTV_TXN_IncentiveFractionItem
WHERE BillingTransactionId=@BillingTansactionId

END
GO


/****** Object:  StoredProcedure [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange]    Script Date: 2/17/2020 10:54:52 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange '2020-02-14','2020-02-14'
 Description: 
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By         Remarks
 --------------------------------------------------
 1.      15Feb'20/Sud          Initial Draft (Needs Revision)
 ---------------------------------------------------
*/
BEGIN



IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN

---Start: For Referral Incentive-----------

INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor

  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN [FN_INCTV_GetIncentiveSettings] () sett
--LEFT JOIN [FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.ReferredByPercent,0) !=0

	and txn.BillingTransactionId NOT IN (SELECT DISTINCT BillingTransactionId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Referral Incentive-----------

UNION ALL

---Start: For Assigned Incentive-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor

  -----2. Secondary Columns:
  --, txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN [FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.AssignedToPercent,0) !=0
	and txn.BillingTransactionId NOT IN (SELECT DISTINCT BillingTransactionId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Assigned Incentive-----------
END

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END
GO
--this constraint is to make sure that duplicate data are not inserted in fractionitems--
Alter Table INCTV_TXN_IncentiveFractionItem
ADD Constraint UK_IncentiveFractionItems UNIQUE(BillingTransactionItemId,IncentiveReceiverId,IncentiveType)
GO

	
---End--Sud: 17Feb'20---For Incentive Load and Incentive From Invoice Level---	


---Start--Pratik: 17Feb'20---for Handover--

Create PRocedure [dbo].[SP_BIL_TXN_GetHandoverCalculationDateWise] --EXEC SP_BIL_TXN_GetHandoverCalculationDateWise '2020-02-16','2020-02-16'
(@FromDate DATE, @ToDate DATE)
AS
/*
 File: SP_BIL_TXN_GetHandoverCalculationDateWise
 Details: To get total handover given amount and received amount by user on particular date range.
 Change History:
 -----------------------------------------
 S.No.   Date/Author           Remarks
 ---------------------------------------
 1.      16Feb'20/Sud          Initial Draft (Needs Revision)
 ---------------------------------------
*/
BEGIN

Select EmployeeId, HandOverDate, SUM(GivenAmount) 'GivenAmount', SUM(ReceivedAmount) 'ReceivedAmount'
FROM

(
 Select EmployeeID, HandoverDate 
, Case WHEN HandOverType='HandoverGiven' THEN HandoverAmount
   ELSE 0 END AS GivenAmount
,  Case WHEN HandOverType='HandoverReceived' THEN HandoverAmount
   ELSE 0 END AS ReceivedAmount

From 
(
SELECT 'HandoverGiven' AS 'HandOverType', Convert(Date,CreatedOn) 'HandoverDate', UserId 'EmployeeID', SUM(HandoverAmount) 'HandoverAmount'
FROM BIL_MST_Handover
Group By Convert(Date,CreatedOn),UserId 
UNION ALL
SELECT 'HandoverReceived' AS 'HandOverType', Convert(Date,CreatedOn) 'HandoverDate', HandoverUserId 'EmployeeID', SUM(HandoverAmount) 'HandoverAmount'
FROM BIL_MST_Handover
Group By Convert(Date,CreatedOn),HandoverUserId 
) b
Where HandoverAmount !=0
 AND HandoverDate BETWEEN Convert(Date,@FromDate) and Convert(Date,@ToDate)

) overall

Group By EmployeeId, HandOverDate

Order by HandoverDate, EmployeeID

END
GO
---End--Pratik: 17Feb'20---for Handover--

--Anish: STart 17Feb 2020: Vital Print Format Parameterised--
IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'ValueLookUpList'
          AND Object_ID = Object_ID(N'dbo.CORE_CFG_Parameters'))
BEGIN
Alter table CORE_CFG_Parameters
add ValueLookUpList nvarchar(max);

END
GO


Insert Into CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],
ParameterType,ValueLookUpList) Values('Clinical','VitalFormat','format1','value-lookup',
'Select the format that displays the Vitals in the paper for hospital while printing','custom',
'["format1","format2","format3","format4"]');
Go
--Anish: End 17Feb 2020: Vital Print Format Parameterised--


--Pratik: Start 19Feb'20: 
Create Table INCTV_TXN_PaymentInfo
(
PaymentInfoId INT IDentity(1,1) Primary Key NOT NULL,
PaymentDate DateTime,
ReceiverId INT,
TotalAmount Float,
TDSAmount float,
NetPayAmount float,

IsPostedToAccounting BIT,--needed to make Actual paymentVoucher in Accounting.
AccountingPostedDate DateTime,--for future use in accounting integration.

CreatedBy INT,
CreatedOn DateTime,
IsActive BIT
)
GO



/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_ReferralItemsSummary]    Script Date: 2/18/2020 10:28:38 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*-- =============================================
-- Author:		Pratik/20Nov'19
-- Description:	To get Incentive reports at items level for input doctor. 
--Change History-----
S.No.   Date/Author    Remarks
---------------------------------------
1.     20Nov'19/Pratik   Initial Draft
2.     12Feb'20/Sud      TDS percent hardcoded for temporary purpose, need to revise it soon. 

-- =============================================*/
ALTER PROCEDURE [dbo].[SP_Report_INCTV_ReferralItemsSummary]  --EXEC SP_Report_INCTV_ReferralItemsSummary '2020-01-17','2020-02-17',94
	@FromDate date = NULL,
    @ToDate date = NULL,
    @EmployeeId int = NULL
AS
BEGIN
	Select incItm.IncentiveReceiverName, incItm.TransactionDate, incItm.InvoiceNoFormatted, incItm.IncentiveType 'IncomeType', 
	       incItm.PatientId, pat.FirstName+' '+pat.LastName 'PatientName', pat.PatientCode 'HospitalNum', 
		   incItm.ItemName, incItm.TotalBillAmount 'TotalAmount', incItm.IncentivePercent, incItm.IncentiveAmount,

		   --Here TDS Percent is hard-coded, we need to add them to Fractionitem table and calculate from there, not from here--sud: 12Feb'20
		   incItm.IncentiveAmount*15/100 'TDSAmount', incItm.IncentiveAmount - incItm.IncentiveAmount*15/100 'NetPayableAmt',
		   incItm.InctvTxnItemId,incItm.IsPaymentProcessed
		   
	from INCTV_TXN_IncentiveFractionItem incItm
	     INNER JOIN PAT_Patient pat
		 ON incItm.PatientId=pat.PatientId
	WHERE 
	    IncentiveReceiverId = @EmployeeId
	    AND Convert(Date,incItm.TransactionDate) Between @FromDate AND @ToDate
END
GO
--END: Pratik: Start 19Feb'20: 


-- Start: Pratik 25Feb2020

 -- Incentive Transaction Routes added --
DECLARE @AppId int

SELECT @AppId = ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'INCTV'

INSERT INTO RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
VALUES 
('incentive-transactions-billsync-view', @AppId, 1, GETDATE(), 1),
('incentive-transactions-makepayment-view', @AppId, 1, GETDATE(), 1)


GO
DECLARE  @permId int, @pRouteId int
SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-transactions-billsync-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Transactions'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Bill Sync', 'Incentive/Transactions/BillSync', 'BillSync', @permId, @pRouteId, 1, NULL, 1)

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-transactions-makepayment-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Transactions'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Payment', 'Incentive/Transactions/MakePayment', 'MakePayment', @permId, @pRouteId, 1, NULL, 1)
GO
 -- Incentive Transaction Routes added --


 -- TDS Percentage column --
 ALTER TABLE INCTV_MST_Profile
        ADD TDSPercentage int  
 CONSTRAINT DefaultTDSPercentage 
    DEFAULT (0)
	GO
-- TDS Percentage column --


---[SP_Report_INCTV_ReferralItemsSummary] SP updated  ---

/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_ReferralItemsSummary]    Script Date: 2/25/2020 5:51:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*-- =============================================
-- Author:		Pratik/20Nov'19
-- Description:	To get Incentive reports at items level for input doctor. 
--Change History-----
S.No.   Date/Author    Remarks
---------------------------------------
1.     20Nov'19/Pratik   Initial Draft
2.     12Feb'20/Sud      TDS percent hardcoded for temporary purpose, need to revise it soon. 
3.     25Feb'20/Pratik   TDS percentage is calculated from employee profile 

-- =============================================*/
ALTER PROCEDURE [dbo].[SP_Report_INCTV_ReferralItemsSummary]  --EXEC SP_Report_INCTV_ReferralItemsSummary '2020-01-17','2020-02-17',93
	@FromDate date = NULL,
    @ToDate date = NULL,
    @EmployeeId int = NULL
AS
BEGIN
	Select incItm.IncentiveReceiverName, incItm.TransactionDate, incItm.InvoiceNoFormatted, incItm.IncentiveType 'IncomeType', 
	       incItm.PatientId, pat.FirstName+' '+pat.LastName 'PatientName', pat.PatientCode 'HospitalNum', 
		   incItm.ItemName, incItm.TotalBillAmount 'TotalAmount', incItm.IncentivePercent, incItm.IncentiveAmount,isnull(profile.TDSPercentage,0) 'TDSPercentage',

		   --Here TDS Percent is hard-coded, we need to add them to Fractionitem table and calculate from there, not from here--sud: 12Feb'20
		   incItm.IncentiveAmount*isnull(profile.TDSPercentage,0)/100 'TDSAmount', incItm.IncentiveAmount - incItm.IncentiveAmount*isnull(profile.TDSPercentage,0)/100 'NetPayableAmt',
		   incItm.InctvTxnItemId,incItm.IsPaymentProcessed--,incItm.BillingTransactionId, incItm.BillingTransactionItemId
		   
	from INCTV_TXN_IncentiveFractionItem incItm		
	     INNER JOIN PAT_Patient pat
		 ON incItm.PatientId=pat.PatientId
		 left join INCTV_EMP_Profile_Map proMap
		 on proMap.EmployeeId=incItm.IncentiveReceiverId
		 left join INCTV_MST_Profile profile
		 on profile.ProfileId=proMap.ProfileId
	WHERE 
	    IncentiveReceiverId = @EmployeeId
	    AND Convert(Date,incItm.TransactionDate) Between @FromDate AND @ToDate
END
GO
---[SP_Report_INCTV_ReferralItemsSummary]  SP updated  ---
-- End:Pratik 25Feb2020,



--start: sud-26Feb'20-- for Inventory 
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Procedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView] 
  @RequisitionId INT
AS
/*
FileName: INV_TXN_VIEW_GetRequisitionItemsInfoForView -- EXEC INV_TXN_VIEW_GetRequisitionItemsInfoForView  8
Author: Sud/19Feb'20 
Description: to get details of Requisition items along with Employee Information.
Remarks: We're returning two tables, one for Requisition details and another for Dispatch Details.
ChangeHistory:
----------------------------------------------------
S.No    Author/Date                  Remarks
---------------------------------------------------
1.       Sud/19Feb'20                Initial Draft
-------------------------------------------------------
*/
BEGIN
 
  Select reqItm.ItemId, itm.ItemName, itm.Code, reqItm.Quantity, 
    reqItm.ReceivedQuantity, reqItm.PendingQuantity, reqItm.RequisitionItemStatus,
    reqItm.Remark,   reqItm.ReceivedQuantity AS 'DispatchedQuantity', 
    reqItm.RequisitionNo, reqItm.RequisitionId,
    reqItm.CreatedOn, reqItm.CreatedBy, reqEmp.FullName 'CreatedByName',
  NULL AS 'ReceivedBy' -- receive item feature is not yet implemented, correct this later : sud-19Feb'20

    from 

    INV_TXN_RequisitionItems reqItm  
    INNER JOIN INV_MST_Item itm 
	   ON reqItm.ItemId=itm.ItemId
    INNER JOIN EMP_Employee reqEmp
	   ON reqItm.CreatedBy = reqEmp.EmployeeId

  Where reqItm.RequisitionId=@RequisitionId


  Select dispItm.RequisitionItemId, dispItm.DispatchedQuantity, dispItm.CreatedOn 'DispatchedOn', 
  dispItm.CreatedBy 'DispatchedBy', emp.FullName 'DispatchedByName' 
   from INV_TXN_DispatchItems dispItm
  INNER JOIN EMP_Employee emp
     ON dispItm.CreatedBy = emp.EmployeeId 
  where RequisitionItemId IN (Select RequisitionItemId from INV_TXN_RequisitionItems  where RequisitionId=@RequisitionId)
  ORder by dispItm.CreatedOn
END
GO

Update INV_MST_UnitOfMeasurement
SET UOMName=LTRIM(RTRIM(UOMName))
GO

--End: sud-26Feb'20-- for Inventory 


---start: sud-26Feb'20--Db Correction for Incentive---
Alter Table INCTV_MST_Profile
DROP Constraint DefaultTDSPercentage
GO
Alter Table INCTV_MST_Profile
Alter Column TDSPercentage FLOAT NULL
GO
Update INCTV_MST_Profile
set TDSPercentage=15 
GO
Alter Table INCTV_MST_Profile
ADD  CONSTRAINT DefaultTDSPercentage  DEFAULT (0) FOR TDSPercentage
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_DoctorSummary]    Script Date: 2/26/2020 1:34:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/*-- Author: Pratik/20Nov'19
-- Description:	To get Incentive reports at doctor level 
--Change History:
----------------------------------------------------------------
S.No.  Author/Date                   Remarks
----------------------------------------------------------------
1.    Pratik/20Nov'19               Initial Draft
2.    Sud/26Feb'20                  TDSPercentage added in Summary.
----------------------------------------------------------------

*/
ALTER PROCEDURE [dbo].[SP_Report_INCTV_DoctorSummary] --EXEC SP_Report_INCTV_DoctorSummary '2019-07-20','2019-11-22'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
BEGIN
Select 
ReferrerId, ReferrerName, Sum(TotalBillAmount) 'HospitalAmount',
SUM(ReferralAmount) 'ReferralAmount', SUM(AssignedToAmount) 'AssignedAmount',SUM(AssignedToAmount+ReferralAmount) 'DocTotalAmount',
prof.TDSPercentage  'TDSPercent', SUM(AssignedToAmount+ReferralAmount)*ISNULL(prof.TDSPercentage,0)/100  'TDSAmount'
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
LEFT JOIN
INCTV_EMP_Profile_Map profMap
   ON A.ReferrerId=profMap.EmployeeId

LEFT JOIN INCTV_MST_Profile prof
  ON profMap.ProfileId=prof.ProfileId


group by ReferrerId, ReferrerName, prof.TDSPercentage 
END
GO
---End: sud-26Feb'20--Db Correction for Incentive---


--Anish:Start: 26 Feb 2020---
Alter Table [dbo].[LAB_TestRequisition]
Add SampleCollectedOnDateTime DateTime null
Go
--Anish:End: 26 Feb 2020---

-- Start:Pratik 27Feb2020---
INSERT INTO [dbo].[CORE_CFG_Parameters]
([ParameterGroupName]
,[ParameterName]
,[ParameterValue]
,[ValueDataType]
,[Description]
,[ParameterType])
VALUES
('Billing','CreditInvoiceDisplaySettings',
 N'{"ShowPatAmtForCrOrganization":false,"PatAmtValue":0.00,"ValidCrOrgNameList":["Nepal Govt Dialysis"]}' ,'JSON' ,
 'We needed to show extra field "PatientAmount" in credit invoice for specific credit organizations. default ShowPatAmtForCrOrganization is false,
  and default patient amount is zero (if thats not found then we may hide that amount)','custom')
  GO


  INSERT INTO [dbo].[CORE_CFG_Parameters]
([ParameterGroupName]
,[ParameterName]
,[ParameterValue]
,[ValueDataType]
,[Description]
,[ParameterType])
VALUES
('Billing','CreditOrganizationMandatory', 'false' ,'boolean' , 'true/false. Whether or not Credit Orgination in IP/OP billing is compulsory while Payment Mode is credit.','custom')

Go
--- End:Pratik 27Feb2020,-----

---ANish: Start 28 Feb, Updating the added Column in LabTestRequisition ---
Update LAB_TestRequisition 
set SampleCollectedOnDateTime = SampleCreatedOn
where SampleCreatedOn is not null;
Go
---ANish: End 28 Feb ---


--start: sud: 3Mar'20--for inventory- dispatch view---
/****** Object:  StoredProcedure [dbo].[SP_Report_Dispatch_Details 2]    Script Date: 3/3/2020 11:21:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Dispatch_Details] 
		@DispatchId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Kushal/18 Oct 2019				Created Script 
2.      Sud/3Mar'20          Changed Department to Store (needs revision)
----------------------------------------------------------
*/
BEGIN
		If(@DispatchId > 0)
			BEGIN
			SELECT A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemName,ROUND((SUM(A.Amt)/SUM(A.Qty)),2) StandardRate,A.ITemId,A.Code,A.StoreName,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy FROM 
			(
				SELECT  emp.Salutation+'. '+emp.FirstName+' '+ emp.LastName as CreatedByName,
				dis.CreatedOn,
				req.CreatedOn RequisitionDate,
				itm.ItemName,
				itm.Code,
				dis.ItemId,
				store.Name 'StoreName',
				dis.DispatchedQuantity,
				req.RequisitionId,
				dis.DispatchId,
				stk.AvailableQuantity Qty,
				gri.ItemRate*stk.AvailableQuantity Amt,
				dis.ReceivedBy
				from INV_TXN_DispatchItems dis 
				join INV_MST_Item itm on itm.ItemId = dis.ItemId
				join INV_TXN_RequisitionItems req on req.RequisitionItemId = dis.RequisitionItemId

                join PHRM_MST_Store store on store.StoreId= dis.StoreId
				---join MST_Department dep on dep.DepartmentId = dis.DepartmentId

				join EMP_Employee emp on emp.EmployeeId = dis.CreatedBy
				join INV_TXN_Stock stk on stk.ItemId = itm.ItemId
				join INV_TXN_GoodsReceiptItems gri on gri.GoodsReceiptItemId = stk.GoodsReceiptItemId
			where dis.DispatchId = @DispatchId 
			) A
			group by A.ItemName,A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemId,A.Code,A.StoreName,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy
			END
			END
GO
--end: sud: 3Mar'20--for inventory- dispatch view---

---start: sud-4Mar'20--- for inventory requisition item cancellation--
/****** Object:  StoredProcedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView]    Script Date: 3/4/2020 1:22:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER Procedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView] 
  @RequisitionId INT
AS
/*
FileName: INV_TXN_VIEW_GetRequisitionItemsInfoForView -- EXEC INV_TXN_VIEW_GetRequisitionItemsInfoForView  8
Author: Sud/19Feb'20 
Description: to get details of Requisition items along with Employee Information.
Remarks: We're returning two tables, one for Requisition details and another for Dispatch Details.
ChangeHistory:
----------------------------------------------------
S.No    Author/Date                  Remarks
---------------------------------------------------
1.       Sud/19Feb'20                Initial Draft
2.      Sud/4Mar'20               added RequisitionItemId in select query. Needed for Cancellation.
-------------------------------------------------------
*/
BEGIN
 
  Select reqItm.ItemId, itm.ItemName, itm.Code, reqItm.Quantity, 
    reqItm.ReceivedQuantity, reqItm.PendingQuantity, reqItm.RequisitionItemStatus,
    reqItm.Remark,   reqItm.ReceivedQuantity AS 'DispatchedQuantity', 
    reqItm.RequisitionNo, reqItm.RequisitionId,
    reqItm.CreatedOn, reqItm.CreatedBy, reqEmp.FullName 'CreatedByName',
	reqItm.RequisitionItemId,
  NULL AS 'ReceivedBy' -- receive item feature is not yet implemented, correct this later : sud-19Feb'20

    from 

    INV_TXN_RequisitionItems reqItm  
    INNER JOIN INV_MST_Item itm 
	   ON reqItm.ItemId=itm.ItemId
    INNER JOIN EMP_Employee reqEmp
	   ON reqItm.CreatedBy = reqEmp.EmployeeId

  Where reqItm.RequisitionId=@RequisitionId


  Select dispItm.RequisitionItemId, dispItm.DispatchedQuantity, dispItm.CreatedOn 'DispatchedOn', 
  dispItm.CreatedBy 'DispatchedBy', emp.FullName 'DispatchedByName' 
   from INV_TXN_DispatchItems dispItm
  INNER JOIN EMP_Employee emp
     ON dispItm.CreatedBy = emp.EmployeeId 
  where RequisitionItemId IN (Select RequisitionItemId from INV_TXN_RequisitionItems  where RequisitionId=@RequisitionId)
  ORder by dispItm.CreatedOn
END
GO
---end: sud-4Mar'20--- for inventory requisition item cancellation--


--Start: Pratik- 4March, 2020---

Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Billing','IpBillingDateSettings','{"EnableLocalDate":false, "DefaultLocalDate":false}','json','Enable or Disable change Date format AD/BS and weather or not set BS Default date BS in IP billing ','custom');
Go
--End: Pratik- 4March, 2020---

--Start: Anish 10 March, 2020---
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType) 
Values ('LAB','ShowEmptyReportSheet','false','boolean','Show Printing option for Printing Empty sheet with all the Tests and components','custom');
Go



/****** Object:  StoredProcedure [dbo].[SP_LAB_AllRequisitionsBy_VisitAndRunType]    Script Date: 3/10/2020 5:28:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
Create PROCEDURE [dbo].[SP_LAB_AllRequisitionsBy_SampleCode]
 @sampleCode int
AS
BEGIN
declare @someMonthsBack date;
set @someMonthsBack = Convert(date,DATEADD(month, -15, GETDATE())); 
	select * from LAB_TestRequisition 
	where SampleCode = @sampleCode
	AND SampleCreatedOn Is Not Null AND Convert(date,SampleCreatedOn) > @someMonthsBack;
END
GO
--End: Anish 10 March, 2020---



--Start: Pratik- 11March, 2020---

Alter Table PAT_PatientVisits
ADD QueueNo INT NULL;
GO

CREATE PROCEDURE SP_VISIT_SetNGetQueueNo
  @VisitId int
AS
/*
 File: SP_VISIT_SetNGetQueueNo -- EXEC SP_VISIT_SetNGetQueueNo 4
 Description: 
    * To set the QueueNumber for current visit based on Queuelevel parameter 
	* there are 3 available options: department, doctor, hospital (default)

Change History:
--------------------------------------------------------------------
S.No  Author/Date                Remarks
--------------------------------------------------------------------
1.    Sud/Pratik/5Mar'20         Initial Draft
--------------------------------------------------------------------
*/
BEGIN
 
--Read and set QueueLevel value from parameter
Declare @QueueLevel varchar(20)=(Select TOP 1 ParameterValue from CORE_CFG_Parameters where ParameterGroupName='Appointment' and ParameterName='QueueLevel')

Declare @DoctorId INT, @DepartmentID INT, @VisitDate DATE
Declare @LatestQuNum INT=0

--Assign Values of DoctorId, DepartemntId, VisitDate for current visit.
SELECT @DoctorId=ProviderId, @DepartmentID=DepartmentId , @VisitDate= COnvert(Date,VisitDate)
from PAT_PatientVisits WHERE PatientVisitId=@VisitId

--case1: if departmentlevel then take max that department for that day of visit
IF(@QueueLevel='department')
BEGIN
   SELECT @LatestQuNum = MAX(ISNULL(QueueNo,0))
   FROM PAT_PatientVisits
   WHERE VisitType='outpatient' AND DepartmentId=@DepartmentID 
     AND COnvert(Date,VisitDate)= @VisitDate 
END
--case2: if doctorlevel then take max that doctor for that day of visit
ELSE IF (@QueueLevel='doctor')
BEGIN
   SELECT @LatestQuNum = MAX(ISNULL(QueueNo,0))
   FROM PAT_PatientVisits
   WHERE VisitType='outpatient' AND ProviderId=@DoctorId 
     AND COnvert(Date,VisitDate)= @VisitDate 
END
ELSE--case3: by default it'll be hospital level, in this case take max of that day's visit
BEGIN
   SELECT @LatestQuNum = MAX(ISNULL(QueueNo,0))
   FROM PAT_PatientVisits
   WHERE VisitType='outpatient' AND COnvert(Date,VisitDate)= @VisitDate 
END

--Update the queue numebr of given visit and return the same to the caller---
SET @LatestQuNum=@LatestQuNum+1
UPDATE PAT_PatientVisits
SET QueueNo=@LatestQuNum
WHERE PatientVisitId=@VisitId
SELECT @LatestQuNum AS 'QueueNo'

END
GO
-----------------------------------
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType, ValueLookUpList)
Values('Appointment','QueueLevel','hospital','value-lookup',
'sets queue level for daily appointment sequence. Sequence is maintained in either of hospital, department or doctor level','custom','["hospital","department","doctor"]')
GO

------------------------------------
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('Appointment','QueueNoSetting','{"ShowInInvoice":false, "ShowInSticker":false}','json','Weather to show queue number in Invoice or in sticker ','custom');
Go
------------------------------------

/****** Object:  StoredProcedure [dbo].[SP_APPT_GetPatientVisitStickerInfo]    Script Date: 3/11/2020 11:18:23 AM ******/
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
3.       Pratik/11March 2020					added Visit QueueNo
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
  ISNULL(bilTxnItms.TotalAmount,0) 'OpdTicketCharge',
  visit.QueueNo
   
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
Go
--Start: Pratik- 11March, 2020---



-- start: pratik -17MArch 2020---



ALTER PROCEDURE [dbo].[SP_INCTV_ViewTxn_InvoiceLevel] --SP_INCTV_ViewTxn_InvoiceLevel '2020-02-06','2020-03-06',0
	( @FromDate DATETIME = NULL,
      @ToDate DATETIME = NULL,
      @EmployeeId INT=NULL)
AS
/*
 File: SP_INCTV_ViewTxn_InvoiceLevel
 Description: 
 Conditions/Checks: 
        

 Remarks: Needs Revision.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By       Remarks
 --------------------------------------------------
 1.      24Jan'20/Pratik          Initial Draft (Needs Revision)
 
 ---------------------------------------------------
*/
BEGIN

select
pat.PatientId, pat.FirstName+' '+ISNULL(pat.MiddleName+' ','')+pat.LastName 'PatientName', pat.PatientCode,

 fyear.FiscalYearFormatted +'-'+ bilTxn.InvoiceCode + cast(bilTxn.InvoiceNo as varchar(20)) AS 'InvoiceNo' 
, bilTxn.CreatedOn 'TransactionDate', bilTxn.TotalAmount, biltxn.BillingTransactionId

from BIL_TXN_BillingTransaction bilTxn, BIL_CFG_FiscalYears fyear, PAT_Patient pat
where 
	bilTxn.FiscalYearId=fyear.FiscalYearId 
	and bilTxn.PatientId=pat.PatientId
	AND Convert(Date,bilTxn.CreatedOn) Between @FromDate AND @ToDate
	and ISNULL(bilTxn.ReturnStatus,0) = 0


END
GO
-- end: pratik -17MArch 2020---

--Anish: Start: Adjusted amount added in the paymentInfo table 17 March 2019--
Alter table INCTV_TXN_PaymentInfo
Add AdjustedAmount float null
Go

/****** Object:  StoredProcedure [dbo].[SP_Accounting_GetAllEmployee_LedgerList]    Script Date: 3/17/2020 2:35:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:    <Author,,Name>
-- Create date: <Create Date,,>
-- Description:  <Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_Accounting_GetAllEmployee_LedgerList]  
AS
BEGIN
  Select led.LedgerId, consLedMap.ReferenceId 'EmployeeId',
  led.LedgerName, led.Code 'LedgerCode', ledGrp.LedgerGroupName
  from ACC_Ledger led, ACC_MST_LedgerGroup ledGrp, 
  (Select * from ACC_Ledger_Mapping where LedgerType='consultant') consLedMap
  Where led.LedgerGroupId=ledGrp.LedgerGroupId
  and led.LedgerId=consLedMap.LedgerId
END
GO
--Anish: End Adjusted amount added in the paymentInfo table---


--Start:Sud-17Mar'20-- For incentive-TDS Percentage---
/****** Object:  UserDefinedFunction [dbo].[FN_INCTV_GetIncentiveSettings]    Script Date: 3/15/2020 9:15:07 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_INCTV_GetIncentiveSettings] ()
RETURNS TABLE
/*
To get current incentive profile settings
Created: sud-15Feb'20
Remarks: Needs revision.
Change History:
------------------------------------------------------------------------------------------
S.No.    Author         Remarks
------------------------------------------------------------------------------------------
1.      15Feb'20/sud    Initial Draft
2.      15Mar'20/Sud    Added TDSPercenatge in the Select list, which will be used later in calculation.
------------------------------------------------------------------------------------------
*/
AS
    RETURN
    (
      Select 
			 profItm.BillItemPriceId, price.ServiceDepartmentId, price.ItemId, price.ItemName,
			 priceCat.PriceCategoryId, priceCat.PriceCategoryName,
			 prof.ProfileName, prof.ProfileId,
			 emp.EmployeeId,
			 emp.FullName,
			 profItm.AssignedToPercent,
			 profItm.ReferredByPercent,
			 prof.TDSPercentage 
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
    )
GO


IF NOT EXISTS(SELECT 1 FROM sys.columns 
			  WHERE Name = N'TDSPercentage'
			  AND Object_ID = Object_ID(N'dbo.INCTV_TXN_IncentiveFractionItem'))
	BEGIN
		Alter Table INCTV_TXN_IncentiveFractionItem
		ADD TDSPercentage Float NULL
	END
	GO
	 IF NOT EXISTS(SELECT 1 FROM sys.columns 
			  WHERE Name = N'TDSAmount'
			  AND Object_ID = Object_ID(N'dbo.INCTV_TXN_IncentiveFractionItem'))
	BEGIN
		Alter Table INCTV_TXN_IncentiveFractionItem
		ADD TDSAmount Float NULL
	END
	GO

/****** Object:  StoredProcedure [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange]    Script Date: 3/15/2020 9:19:33 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange '2020-02-14','2020-02-14'
 Description: 
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By         Remarks
 --------------------------------------------------
 1.      15Feb'20/Sud          Initial Draft (Needs Revision)
 2.      15Mar'20/Sud         Added TDSPercentage and TDSAmount calculation in the query
 ---------------------------------------------------
*/
BEGIN



IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN

---Start: For Referral Incentive-----------

INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercentage,0) AS TDSPercent,
	( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercentage,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN [FN_INCTV_GetIncentiveSettings] () sett
--LEFT JOIN [FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.ReferredByPercent,0) !=0

	and txn.BillingTransactionId NOT IN (SELECT DISTINCT BillingTransactionId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Referral Incentive-----------

UNION ALL

---Start: For Assigned Incentive-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercentage,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercentage,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  --, txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN [FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.AssignedToPercent,0) !=0
	and txn.BillingTransactionId NOT IN (SELECT DISTINCT BillingTransactionId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Assigned Incentive-----------
END

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END
GO


--End:Sud-17Mar'20-- For incentive-TDS Percentage---

--Anish: Start: 18 March, Bill PaymentInfo update done from SP----
CREATE PROCEDURE [dbo].[SP_INCTV_PaymentInfo_Update]  --EXEC SP_Report_INCTV_ReferralItemsSummary '2020-01-17','2020-02-17',93
	@FromDate date = NULL,
    @ToDate date = NULL,
    @EmployeeId int = NULL,
	@paymentInfoId int = NULL
AS
BEGIN
	Update INCTV_TXN_IncentiveFractionItem set IsPaymentProcessed=1, PaymentInfoId=@paymentInfoId
	WHERE IncentiveReceiverId = @EmployeeId AND Convert(Date,TransactionDate) Between @FromDate AND @ToDate;
	
	---needed to return something from this SP(needs revision)
	select 'success' as Result
END
GO
--Anish: END: 18 March, Bill PaymentInfo update done from SP----


--Start:Pratik -18Mar'20--

/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_ReferralItemsSummary]    Script Date: 3/18/2020 10:20:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*-- =============================================
-- Author:		Pratik/20Nov'19
-- Description:	To get Incentive reports at items level for input doctor. 
--Change History-----
S.No.   Date/Author    Remarks
---------------------------------------
1.     20Nov'19/Pratik   Initial Draft
2.     12Feb'20/Sud      TDS percent hardcoded for temporary purpose, need to revise it soon. 
3.     25Feb'20/Pratik   TDS percentage is calculated from employee profile 

-- =============================================*/
ALTER PROCEDURE [dbo].[SP_Report_INCTV_ReferralItemsSummary]  --EXEC SP_Report_INCTV_ReferralItemsSummary '2020-01-17','2020-02-17',93
	@FromDate date = NULL,
    @ToDate date = NULL,
    @EmployeeId int = NULL
AS
BEGIN
	Select  emp.FullName IncentiveReceiverName, incItm.TransactionDate, incItm.InvoiceNoFormatted, incItm.IncentiveType 'IncomeType', 
	       incItm.PatientId, pat.FirstName+' '+pat.LastName 'PatientName', pat.PatientCode 'HospitalNum', 
		   incItm.ItemName, incItm.TotalBillAmount 'TotalAmount', incItm.IncentivePercent, incItm.IncentiveAmount,incItm.TDSPercentage 'TDSPercentage',

		   --Here TDS Percent is hard-coded, we need to add them to Fractionitem table and calculate from there, not from here--sud: 12Feb'20
		   incItm.TDSAmount 'TDSAmount', incItm.IncentiveAmount - incItm.TDSAmount 'NetPayableAmt',
		   incItm.InctvTxnItemId,incItm.IsPaymentProcessed--,incItm.BillingTransactionId, incItm.BillingTransactionItemId
		   
	from INCTV_TXN_IncentiveFractionItem incItm		
	     INNER JOIN PAT_Patient pat
		 ON incItm.PatientId=pat.PatientId
		 INNER JOIN EMP_Employee emp
		   ON incItm.IncentiveReceiverId=emp.EmployeeId
		
	WHERE 
	    IncentiveReceiverId = @EmployeeId
		and Isnull(incItm.IsActive,0)=1
	    AND Convert(Date,incItm.TransactionDate) Between @FromDate AND @ToDate
END
GO

------------------------------------------------


/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_DoctorSummary]    Script Date: 3/18/2020 10:21:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/*-- Author: Pratik/20Nov'19
-- Description:	To get Incentive reports at doctor level for given date range
--Change History:
----------------------------------------------------------------
S.No.  Author/Date                   Remarks
----------------------------------------------------------------
1.    Pratik/20Nov'19               Initial Draft
2.    Sud/26Feb'20                  TDSPercentage added in Summary.
3.    Pratik/18Mar'20               No need of IncentiveType, TDSPercent, just show the summary at doctor level for given date range. 
----------------------------------------------------------------

*/
ALTER PROCEDURE [dbo].[SP_Report_INCTV_DoctorSummary] --EXEC SP_Report_INCTV_DoctorSummary '2019-07-20','2019-11-22'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
BEGIN
Select  emp.FullName AS ReferrerName, incItm.IncentiveReceiverId AS ReferrerId
   ,SUM(incItm.IncentiveAmount) 'DocTotalAmount',
   SUM(incItm.TDSAmount) 'TDSAmount'
   ,SUM(incItm.IncentiveAmount - incItm.TDSAmount) 'NetPayableAmount'
	from INCTV_TXN_IncentiveFractionItem incItm		
		 INNER JOIN EMP_Employee emp
		   ON incItm.IncentiveReceiverId=emp.EmployeeId

	WHERE 
	    Isnull(incItm.IsActive,0)=1
	    AND Convert(Date,incItm.TransactionDate) Between @FromDate AND @ToDate  

  Group By emp.FullName, incItm.IncentiveReceiverId
END
GO

----------------------------------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_Doc_ItemGroupSummary]    Script Date: 3/18/2020 10:22:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*-- =============================================
-- Author:		 18Mar'20/Pratik 
-- Description:	To get incentive report group by Items for Selected Doctor between selected range.
-- Change History-----
S.No.   Date/Author    Remarks
---------------------------------------
1.     18Mar'20/Pratik   Initial Draft

-- =============================================*/
CREATE PROCEDURE [dbo].[SP_Report_INCTV_Doc_ItemGroupSummary]  --EXEC SP_Report_INCTV_Doc_ItemGroupSummary '2020-03-01','2020-03-17',112
	@FromDate date = NULL,
    @ToDate date = NULL,
    @EmployeeId int = NULL
AS
BEGIN
	
SELECT ItemName, Count(*) 'TotalQty',SUM(TotalBillAmount) 'TotalBillAmt',
SUm(IncentiveAmount) 'TotalIncentiveAmount', SUM(TDSAmount) 'TotalTDSAmount'

FROM INCTV_TXN_IncentiveFractionItem incItm

WHERE  IncentiveReceiverId = @EmployeeId 
AND Convert(Date,incItm.TransactionDate) Between @FromDate AND @ToDate
and ISNULL(IsActive,0)=1

Group by ItemName
END
GO
--End:Pratik -18Mar'20--

---Anish: STart: 19 March- Show/Hide Sticker Printing Option Parameterize and Lab Report format changed to Value lookup in Settings---
Update CORE_CFG_Parameters 
Set ValueDataType='value-lookup', ValueLookUpList='["format1","format2"]'
where LOWER(ParameterGroupName)='lab' and ParameterName='LabReportFormat';
Go
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
values ('LAB','ShowLabStickerPrintOption','true','boolean','Show or hide Lab Sticker and its Printing options in Lab after sample collected',
'custom')
Go
---Anish: END: 19 March- Show/Hide Sticker Printing Option Parameterize and Lab Report format changed to Value lookup in Settings---



--Ashish:Start: 20 March 2020---RouterLink for Accounting 
declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('report-Accounting-DailyTransactionReport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='report-Accounting-DailyTransactionReport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Reports')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Daily Transaction','Accounting/Reports/DailyTransactionReport','DailyTransactionReport',@permissionId,@parentRouteId,1,1)
go


declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('report-Accounting-LedgerReport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='report-Accounting-LedgerReport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Reports')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Ledger Report','Accounting/Reports/LedgerReport','LedgerReport',@permissionId,@parentRouteId,1,1)
go

declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('report-Accounting-VoucherReport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='report-Accounting-VoucherReport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Reports')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Voucher Report','Accounting/Reports/VoucherReport','VoucherReport',@permissionId,@parentRouteId,1,1)
go

declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('report-Accounting-TrailBalanceReport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='report-Accounting-TrailBalanceReport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Reports')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Trial Balance','Accounting/Reports/TrailBalanceReport','TrailBalanceReport',@permissionId,@parentRouteId,1,1)
go

declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('report-Accounting-ProfitLossReport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='report-Accounting-ProfitLossReport-view');


declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Reports')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Profit Loss','Accounting/Reports/ProfitLossReport','ProfitLossReport',@permissionId,@parentRouteId,1,1)
go

declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('report-Accounting-BalanceSheetReport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='report-Accounting-BalanceSheetReport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Reports')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Balance Sheet','Accounting/Reports/BalanceSheetReport','BalanceSheetReport',@permissionId,@parentRouteId,1,1)
go

declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('report-Accounting-CashFlowReport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='report-Accounting-CashFlowReport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Reports')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Cash Flow','Accounting/Reports/CashFlowReport','CashFlowReport',@permissionId,@parentRouteId,1,1)
go

declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('report-Accounting-DaywiseVoucherReport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='report-Accounting-DaywiseVoucherReport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Reports')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Day Wise Voucher Report','Accounting/Reports/DaywiseVoucherReport','DaywiseVoucherReport',@permissionId,@parentRouteId,1,1)
go
--Ashish:End: 20 March 2020---RouterLink for Accounting



--pratik : Start --23 march'20 --
--this component is not used now, if needed make isactive true--
update RBAC_RouteConfig
set IsActive=0
where UrlFullPath='Incentive/Transactions/InvoiceItemLevel'
GO

--pratik : End --23 march'20 --

--end: from  incr-charak-hospital-branch-12Feb++.sql--


---End: sud-26Mar'20--merged from Charak-Hospital branch (Accounting, Incentive, Substore, Inventory)---

---START: Rusha- 26th Mar 2020 -- merged Pharmacy_bugs branch
GO

---Start: Shankar: 24th Mar 2020 --SP report of PharmacyTxn_ByBillingType_UserCollection

/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]    Script Date: 03/17/2020 3:55:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--select * from FN_PHRM_PharmacyTxn_ByBillingType_UserCollection('2020-03-16','2020-03-16')
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
3       Shankar  23rd March 2020               depositdeduct included 
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
						 0 AS 'DepositReceived', 0 AS 'DepositRefund', 0 AS 'DepositDeduct',
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
					   0 AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund', 0 AS 'DepositDeduct',
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
					  TotalAmount AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund', 0 AS 'DepositDeduct',
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
	  					 (-ret.TotalAmount) AS 'CashCollection', 0 AS 'DepositReceived', 0 AS 'DepositRefund', 0 AS 'DepositDeduct',
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
	  					 (0) AS 'CashCollection',  0 AS 'DepositReceived', 0 AS 'DepositRefund', 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived', (-ret.TotalAmount) 'CreditAmount',
				 
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remark 'Remarks', 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				   and txn.PaymentMode='credit' and settlementId is null
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
) -- end of return
GO

-------Updated Script of User Collection Report in Pharmacy

/****** Object:  StoredProcedure [dbo].[SP_PHRM_UserwiseCollectionReport]    Script Date: 03/17/2020 12:41:52 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_UserwiseCollectionReport]  
--- [SP_PHRM_UserwiseCollectionReport] '03/16/2020','03/16/2020'
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
5.      Shankar 23rd March 2020             Included deposit deduct and deposit refund
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
			bills.DepositDeduct,
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
								WHEN DepositType='depositdeduct' OR DepositType='depositreturn' THEN 'AdvanceSettled' END AS 'TransactionType',
			
							 0 As SubTotal,0 AS DiscountAmount,0 AS VATAmount, 0 AS TotalAmount, 
							 CASE WHEN DepositType='Deposit' THEN DepositAmount WHEN DepositType='depositdeduct' OR DepositType='depositreturn' THEN (-DepositAmount) END AS 'CashCollection',
							  CASE WHEN DepositType='Deposit' THEN DepositAmount ELSE 0 END AS 'DepositReceived',
							CASE WHEN  DepositType='depositreturn' THEN DepositAmount ELSE 0 END AS 'DepositRefund',
						   CASE WHEN  DepositType='depositdeduct' THEN DepositAmount ELSE 0 END AS 'DepositDeduct'
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

----Updated of script in cash collection report of Pharmacy


/****** Object:  StoredProcedure [dbo].[SP_PHRM_CashCollectionSummaryReport]    Script Date: 03/18/2020 2:19:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_CashCollectionSummaryReport]  --- [SP_PHRM_CashCollectionSummaryReport] '03/23/2020','03/23/2020'
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
2		Ashish 14th Jan 2020				fixx bug Provisional credit invoice amount showing  --if transaction is Provisional and paymenttype is credit then entry into settlement tbl  	
3       Shankar 17th March 2020	            deducted from deposit amount was showing in user collection which is fixed here on.
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
	select [Date], UserName, sum(TotalAmount) as TotalAmount, sum(ReturnAmount) as ReturnedAmount, sum((TotalAmount+DepositAmount)-(ReturnAmount+DepositReturn)) as NetAmount, sum(DiscountAmount) as DiscountAmount, sum(DepositAmount) as DepositAmount, sum(DepositReturn) as DepositReturn
	from ( 
          SELECT convert(date,inv.CreateOn) as [Date] ,usr.UserName,sum(inv.PaidAmount)as TotalAmount, 0 as ReturnAmount,sum(inv.DiscountAmount) as DiscountAmount,  0 as DepositAmount, 0 as DepositReturn
            FROM [PHRM_TXN_Invoice] inv
              INNER JOIN RBAC_User usr
             on inv.CreatedBy=usr.EmployeeId      
              where  (convert(datetime, inv.CreateOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 ) and inv.BilStatus='paid' and inv.SettlementId is null and inv.DepositDeductAmount=0
              group by convert(date,inv.createon),UserName
			  
			 
			  union all 
			    SELECT convert(date,stl.CreatedOn) as [Date] ,usr.UserName,sum(stl.PayableAmount)as TotalAmount, 0 as ReturnAmount,sum(stl.DiscountAmount) as DiscountAmount,  0 as DepositAmount, 0 as DepositReturn
            FROM [PHRM_TXN_Settlement] stl
              INNER JOIN RBAC_User usr
             on stl.CreatedBy=usr.EmployeeId
              where  (convert(datetime, stl.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 ) 
              group by convert(date,stl.CreatedOn),UserName
			  
			  union all
			  select convert(date,invRet.CreatedOn) as [Date], usr.UserName, 0 as TotalAmount,sum(invRet.TotalAmount ) as ReturnAmount,  sum(-(invRet.DiscountPercentage/100)*invRet.SubTotal ) as DiscountAmount, 0 as DepositAmount, 0 as DepositReturn
			  From[PHRM_TXN_InvoiceReturnItems] invRet
			  INNER JOIN RBAC_User usr
			  on invRet.CreatedBy = usr.EmployeeId
			  where convert(datetime, invRet.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and invRet.InvoiceId is not null
			  group by convert(date,invRet.CreatedOn),UserName

			  union all
			  select convert(date,depo.CreatedOn) as [Date], usr.UserName, 0 as TotalAmount, 0 as ReturnAmount, 0 as DiscountAmount, sum(depo.DepositAmount) as DepositAmount, 0 as DepositReturn
			  From PHRM_Deposit as depo
			  INNER JOIN RBAC_User as usr
			  on depo.CreatedBy = usr.EmployeeId
			  where convert(datetime, depo.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and depo.DepositType = 'deposit'
			  group by convert(date, depo.CreatedOn), UserName

			  union all
			  select convert(date,depo.CreatedOn) as [Date], usr.UserName, 0 as TotalAmount, 0 as ReturnAmount, 0 as DiscountAmount, 0 as DepositAmount, sum(depo.DepositAmount) as DepositReturn
			  From PHRM_Deposit as depo
			  INNER JOIN RBAC_User as usr
			  on depo.CreatedBy = usr.EmployeeId
			 
			  where convert(datetime, depo.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and depo.DepositType ='depositreturn'
			  group by convert(date, depo.CreatedOn), UserName


			  )	  tabletotal
			  Group BY [Date], UserName
      End
End
GO
---END: Shankar: 24th Mar 2020 --SP report of PharmacyTxn_ByBillingType_UserCollection

---START: Shankar: 26th Mar 2020 --SP report of Deposit balance

/****** Object:  StoredProcedure [dbo].[SP_Report_Deposit_Balance]    Script Date: 3/24/2020 2:18:40 PM ******/
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
3.     Ramavtar/2018-06-05              change the whole SP.. bring deposit amount of patients
4.     Narayan/2019-09-16               added  DepositId column.
5.     Arpan/Shankar/2020-03-24         deduct both depositdeduct and returndeposit from deposit
--------------------------------------------------------
*/
BEGIN
select ROW_NUMBER() over(order by DepositId desc)  as SN
        ,Deposit.PatientId
		,P.PatientCode
		,P.FirstName + ' ' + ISNULL(P.MiddleName + ' ', '') + P.LastName 'PatientName'
		,Deposit.DepositBalance
		,DepositId
from (
	  select PatientId,DepositId,(Deposit-(depositdeduct+ReturnDeposit)) as DepositBalance from
	  (
			select PatientId
			,sum(case when d.DepositType = 'Deposit' then ISNULL(d.Amount,0) else 0 end) as 'Deposit'
			,sum(case when d.DepositType = 'depositdeduct' then ISNULL(d.Amount,0) else 0 end) as 'depositdeduct'
			,sum(case when d.DepositType = 'ReturnDeposit' then ISNULL(d.Amount,0) else 0 end) as 'ReturnDeposit'
			,Max(d.DepositId) as 'DepositId'
			from BIL_TXN_Deposit as d
			group by d.PatientId
	  ) as a
	   where (Deposit-(depositdeduct+ReturnDeposit)) > 0) 
Deposit
join
PAT_Patient as P
on
Deposit.PatientId = P.PatientId
--order by DepositId desc
--SELECT (Cast(ROW_NUMBER() OVER (ORDER BY  d.PatientCode)  as int)) as SN, 
--  d.PatientId, d.DepositId, d.PatientCode, d.PatientName, (d.TotalDeposit - d.DepositDeduction) 'DepositBalance' 
--  FROM 
--  (SELECT
--    dep.PatientId,
--    pat.PatientCode,
--	dep.DepositId,
--    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
--    SUM(CASE WHEN dep.DepositType = 'Deposit' THEN ISNULL(dep.Amount, 0) ELSE 0 END) AS 'TotalDeposit',
--    SUM(CASE WHEN dep.DepositType = 'depositdeduct' THEN ISNULL(dep.Amount, 0) ELSE 0 END) AS 'DepositDeduction'
--  FROM BIL_TXN_Deposit dep
--  JOIN PAT_Patient pat ON dep.PatientId = pat.PatientId
--  GROUP BY 
--    dep.PatientId,
--	dep.DepositId,
--        pat.PatientCode,
--        pat.FirstName,
--        pat.LastName,
--        pat.MiddleName) d
--WHERE d.TotalDeposit - d.DepositDeduction > 0

END
GO
---END: Shankar: 26th Mar 2020 --SP report of Deposit balance

---END: Rusha- 26th Mar 2020 -- merged Pharmacy_bugs branch


---start: From bed-logic incremental---
-- Deepak Start: 12th March, 2020: For Bed Logic
GO
DECLARE @ParameterId int
insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('ADT', 'CheckoutTimeIncremental', '0.5', 'string', 'for the checkout time incremental i.e 0.5,1,1.5, etc', 'custom')

insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('ADT', 'OneDayFormat', '24:00', 'string', 'Format-1(old format) - ParameterValue: "00:00", Format-2- ParameterValue:"24:00" i.e 12:00 AM- this will enable with 1 day increment after every 12:A.M, Format-3-ParameterValue:"skip" i.e 12:00 AM- this will enable with 1 day increment after skipping first night  12:A.M', 'custom')
SET @ParameterId = SCOPE_IDENTITY()
GO
-- End Deepak Start: 12th March, 2020: For Bed Logic

-- Deepak Start: 12th March, 2020 IP-Billing --> Settlement
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
       where txnItm.BillStatus!='provisional' and txnItm.BillingTransactionId is not null AND ISNULL(txnItm.ReturnStatus,0) != 1 AND ISNULL(txnItm.IsInsurance,0) != 1 

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
-- End Deepak Start: 12th March, 2020   IP-Billing --> Settlement

---end: From bed-logic incremental---


 ----start: from payroll-incremental------

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


 insert into dbo.CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType)
values ( 'Payroll','PayrollLoadNoOfYears',10,'int','We will load last years from current year as per this number.','custom')
GO
 insert into dbo.CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType)
values ( 'Payroll','DefaultOfficeTime','{"TimeIn":"10:00:00","TimeOut":"6:00:00"}','JSON','This will load Default office time','custom')
  --------End:4rd June 2019-- Salakha :-Added permission for-Leave Category-----------
 GO
 --Start: Vikas: alter column name from LeaveRules table.
  sp_RENAME  'PROLL_MST_LeaveRules.LeaveId', 'LeaveRuleId' , 'COLUMN'
GO
 --End: Vikas: alter column name from LeaveRules table.

 ----end: from payroll-incremental------

 ----START: Rusha: 27th March 2020, merged script for Clinical  Module-------------

 ----Scripted by: Rajib and Narayan------------------
-----START: Parameter for Popup notification message in doctor module------------
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Doctor','Information/Message','Message to doctor','string','To notify information to the doctor by the department.','custom')
GO
-----END: Parameter for Popup notification message in doctor module------------

---START: Clinical: Create table for clinical module
----Notes Procedure Table--------------------
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_Notes_Procedure](
  [ProcedureNoteId] [int] IDENTITY(1,1) NOT NULL,
  [NotesId] [int] NULL,
  [PatientId ] [int] NULL,
  [PatientVisitId] [int] NULL,
  [FreeText] [varchar](max) NULL,
  [LinesProse] [varchar](max) NULL,
  [Remarks] [varchar](max) NULL,
  [Site] [varchar](max) NULL,
  [IsActive] [bit] NULL,
  [ModifiedOn] [datetime] NULL,
  [Date] [datetime] NULL,
  [ModifiedBy] [int] NULL,
  [CreatedBy] [int] NULL,
  [CreatedOn] [datetime] NULL,

) 
GO

------Notes Progress table-------------------
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_Notes_Progress](
  [ProgressNoteId] [int] IDENTITY(1,1) NOT NULL,
  [NotesId] [int] NULL,
  [PatientId ] [int] NULL,
  [PatientVisitId] [int] NULL,
  [SubjectiveNotes] [varchar](max) NULL,
  [ObjectiveNotes] [varchar](max) NULL,
  [AssessmentPlan] [varchar](max) NULL,
  [Instructions] [varchar](max) NULL,
  [IsActive] [bit] NULL,
  [ModifiedOn] [datetime] NULL,
  [Date] [datetime] NULL,
  [ModifiedBy] [int] NULL,
  [CreatedBy] [int] NULL,
  [CreatedOn] [datetime] NULL
) 
GO

---------Notes FreeText Table------------

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_Notes_FreeText](
  [FreeTextId] [int] IDENTITY(1,1) NOT NULL,
  [PatientId] [int] NOT NULL,
  [PatientVisitId] [int] NOT NULL,
  [FreeText] [varchar](6000) NULL,
  [CreatedBy] [int] NULL,
  [CreatedOn] [datetime] NULL,
  [NotesId] [int] NOT NULL,
  [ModifiedBy] [int] NULL,
  [ModifiedOn] [datetime] NULL,
  [IsActive] [bit] NULL
) 
GO


ALTER TABLE [dbo].[CLN_Notes]
ADD  IsPending bit
GO

ALTER TABLE [dbo].[CLN_Notes]
ADD  TemplateId int, TemplateName varchar(250), SecondaryDoctor varchar(250), PrimaryDoctor varchar(250), WrittenBy varchar(250)
GO

------------create table : Template for Clinical--------------
/****** Object:  Table [dbo].[CLN_Template]    Script Date: 3/13/2020 5:15:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CLN_Template](
	[TemplateId] [int] IDENTITY(1,1) NOT NULL,
	[TemplateName] [varchar](500) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[TemplateId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

SET IDENTITY_INSERT [dbo].[CLN_Template] ON 

INSERT [dbo].[CLN_Template] ([TemplateId], [TemplateName], [CreatedBy], [CreatedOn]) VALUES (1, N'Progressive Note', 1, CAST(N'1905-06-30T00:00:00.000' AS DateTime))
INSERT [dbo].[CLN_Template] ([TemplateId], [TemplateName], [CreatedBy], [CreatedOn]) VALUES (2, N'History & Physical', 1, CAST(N'1905-06-30T00:00:00.000' AS DateTime))
INSERT [dbo].[CLN_Template] ([TemplateId], [TemplateName], [CreatedBy], [CreatedOn]) VALUES (3, N'Consult Note', 1, CAST(N'1905-06-30T00:00:00.000' AS DateTime))
INSERT [dbo].[CLN_Template] ([TemplateId], [TemplateName], [CreatedBy], [CreatedOn]) VALUES (4, N'Free Text', 1, CAST(N'1905-06-30T00:00:00.000' AS DateTime))
INSERT [dbo].[CLN_Template] ([TemplateId], [TemplateName], [CreatedBy], [CreatedOn]) VALUES (5, N'Discharge Note', 1, CAST(N'1905-06-30T00:00:00.000' AS DateTime))
INSERT [dbo].[CLN_Template] ([TemplateId], [TemplateName], [CreatedBy], [CreatedOn]) VALUES (6, N'Emergency Note', 1, CAST(N'1905-06-30T00:00:00.000' AS DateTime))
INSERT [dbo].[CLN_Template] ([TemplateId], [TemplateName], [CreatedBy], [CreatedOn]) VALUES (7, N'Procedure Note', 1, CAST(N'1905-06-30T00:00:00.000' AS DateTime))
SET IDENTITY_INSERT [dbo].[CLN_Template] OFF

GO

-------END: Table for clinical module---------------------

 ----END: Rusha: 27th March 2020, merged script for Clinical  Module-------------
 

 --START: Sanjit: 26thMar'2020 --Missing Incremental From Sanjesh sir For Edit in Requisition
ALTER TABLE [dbo].[INV_TXN_Requisition]
	ADD [ModifiedBy] [int] NULL, 
	[ModifiedOn] [datetime] NULL;
GO
 --END: Sanjit: 26thMar'2020 --Missing Incremental For Edit in Requisition
 
 --START: Sanjesh: 26 March 2020--IsCancel column added in INV_TXN_Requisition table
	 alter table INV_TXN_Requisition
            add  IsCancel bit default 0,CancelRemarks text null
	Go
--END: Sanjesh: 26 March 2020--IsCancel column added in INV_TXN_Requisition table

-----Start : Bikash : 30th March 2020, medication table altered ---

ALTER TABLE CLN_HomeMedications 
ADD MedicationType varchar(255);
Go

--- Home Medication changed into only medication
update RBAC_RouteConfig
set DisplayName = 'Medication'
where DisplayName = 'Home Medication' and UrlFullPath='Doctors/PatientOverviewMain/Clinical/HomeMedication' and RouterLink = 'HomeMedication'
Go

-----End : Bikash : 30th March 2020, medication table altered ---

------- START : Vikas: 30 March 2020, Added scripts for Inventory Integration with acccounting for good receipt cash payment mode.
	
-- insert script for ledgers group mapping details for 'INVCashGoodReceipt1'
	DECLARE @GroupMappingId int
	SET @GroupMappingId  = (select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCashGoodReceipt1')
	
	-- DR : 1003-MERCHANDISE INVENTORY (1003)
	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_Ledger where [Name]='ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY' AND [Code]=1003 ),1)	

	-- CR : SUPPLIERS (A/C PAYABLES)
	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_MST_LedgerGroup where [Name]='LCL_SUNDRY_CREDITORS'),0)
	
	-- DR : SUPPLIERS (A/C PAYABLES)
	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_MST_LedgerGroup where [Name]='LCL_SUNDRY_CREDITORS'),1)
	
	-- CR : Petty Cash (1296)
	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_Ledger where [Name]='ACA_CASH_&_BANKPETTY_CASH' AND [Code]=1296 ),0)	
	GO
  
-- insert script for hospital transfer rules for 'INVCashGoodReceipt1'

	DECLARE @HospitalId int, @TransferRuleId int
	SET @HospitalId = (select HospitalId from ACC_MST_Hospital where HospitalShortName='CHARAK')
	SET @TransferRuleId = (select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVCashGoodReceipt1')
	INSERT INTO ACC_MST_Hospital_TransferRules_Mapping ([HospitalId],[TransferRuleId],[IsActive])
		VALUES (@HospitalId,@TransferRuleId,1)
	GO

-- update script for inventory integration parameters.

	UPDATE CORE_CFG_Parameters
	SET ParameterValue='{"IsAllowGroupByVoucher":true,"IsSingalVoucher":false}'
	WHERE ParameterGroupName='Inventory' AND ParameterName='InventoryACCIntegration'
	GO
------------------------------------

	-- START: update script 	
		--start ajay 05Jul'19 --getting records of inventory for accounting
		ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]
			@FromDate DATETIME=null ,
			@ToDate DATETIME=null
		AS
		--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @FromDate = '2019-07-05 12:07:31.170', @ToDate ='2020-07-05 12:07:31.170'

		/************************************************************************
		FileName: [SP_ACC_GetInventoryTransactions]
		CreatedBy/date: Ajay/05Jul'19
		Description: getting records of inventory transactions for accounting
		Change History
		-------------------------------------------------------------------------
		S.No.    UpdatedBy/Date                        Remarks
		-------------------------------------------------------------------------
		1       Ajay/05Jul'19						created the script
		*************************************************************************/
		BEGIN
			IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
			BEGIN

				SELECT 
					gr.CreatedOn,
					v.VendorName,
					gr.VendorId,
					 gr.PaymentMode,
					 itm.ItemCategoryId,
					 itm.ItemType,
					 itm.ItemName,
					 gr.TDSAmount,
					 gr.BillNo,									-- 26 March 2020:Vikas: added for invetory integration, mapping with accounting as per charak requirements.
					 gr.GoodsReceiptID,							-- 30 march 2020:Vikas: added GoodsReceiptID column
					 gritm.*
				FROM
					INV_TXN_GoodsReceipt gr 
					join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
					join INV_MST_Item itm on gritm.ItemId = itm.ItemId
				WHERE
					(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
					AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table1: GoodReceipt
				--SELECT 
				--	gr.* ,
				--	v.VendorName
				--FROM
				--	INV_TXN_GoodsReceipt gr 
				--	JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
				--WHERE
				--	(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
				--	AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
					AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
					AND (CONVERT(DATE, st.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			END
			ELSE
			BEGIN
				--Table1: GoodReceipt
				SELECT 
					gr.* ,
					v.VendorName
				FROM
					INV_TXN_GoodsReceipt gr 
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
				WHERE
					(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (TransactionType IN ('dispatch', 'Sent From WardSupply')) 
				END
			END
	GO

-- END : Vikas: 30 March 2020: Added scripts for Inventory Integration with acccounting for good receipt cash payment mode.

--START: Ashish: 30 March 2020: Inventory Vendor ledgergroup name update into parameter value
UPDATE CORE_CFG_Parameters
SET ParameterValue=
'[ {"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"pharmacysupplier"},
{"LedgergroupUniqueName":"LCL_CONSULTANT(CREDIT_A/C)", "LedgerType":"consultant"},
{"LedgergroupUniqueName":"LCL_SUPPLIERS_(A/C_PAYABLES)", "LedgerType":"inventoryvendor"},
{"LedgergroupUniqueName":"LCL_CREDIT_ORGANIZATIONS", "LedgerType":"creditorganization"}]'
WHERE ParameterName='LedgerGroupMapping' and ParameterGroupName ='Accounting'
Go
--END: Ashish: 30 March 2020: Inventory Vendor ledgergroup name update into parameter value

-----Start : Bikash : 30th March 2020, Discharge Summary table altered 

ALTER TABLE ADT_DischargeSummary
ADD ChiefComplaint varchar(1000),
	PendingReports varchar(1000),
	HospitalCourse varchar(1000),
	PresentingIllness varchar(1000),
	ProcedureNts varchar(1000),
	NotesId int null;
GO

ALTER table ADT_DischargeSummary
ADD FOREIGN KEY (NotesId) REFERENCES CLN_Notes(NotesId);
GO

-----End : Bikash : 30th March 2020, Discharge Summary table altered 

--START: Ashish:  1 April 2020: Inventory Vendor ledgergroup name update into parameter value -resolved error
update CORE_CFG_Parameters
set ParameterValue='[ {"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"pharmacysupplier"}
,{"LedgergroupUniqueName":"LCL_CONSULTANT_(CREDIT_A/C)", "LedgerType":"consultant"},
 {"LedgergroupUniqueName":"LCL_SUNDTY_CREDITORS", "LedgerType":"inventoryvendor"},
 {"LedgergroupUniqueName":"ACA_SUNDRY_DEBTORS", "LedgerType":"creditorganization"}]'
where ParameterGroupName='accounting' and ParameterName='LedgerGroupMapping'
Go
--END: Ashish: 1 April 2020: Inventory Vendor ledgergroup name update into parameter value 

--START: NageshBB: 01 April 2020: script for generate ledger code, parameter values for minimum ledger code value 

--inserting minimum ledger number into parameter 
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
values('Accounting','MinimumLedgerCode','1001','string','this number for start Ledger code number','custom')
Go

--update script for unique name of ledger group
UPDATE CORE_CFG_Parameters
SET ParameterValue=
'[ {"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"pharmacysupplier"},
{"LedgergroupUniqueName":"LCL_CONSULTANT_(CREDIT_A/C)", "LedgerType":"consultant"}, 
{"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"inventoryvendor"},
{"LedgergroupUniqueName":"ACA_SUNDRY_DEBTORS", "LedgerType":"creditorganization"}]'
WHERE ParameterName='LedgerGroupMapping' and ParameterGroupName ='Accounting'
Go


--find null code records of Ledger table and create Code 
--NageshBB: ON 03 Apr : not generating correct code , added updated script at below
--DECLARE @LedgerId int;
--DECLARE led_cursor CURSOR
--FOR SELECT LedgerId FROM ACC_Ledger;
 
--OPEN led_cursor;
 
--FETCH NEXT FROM led_cursor INTO 
--    @LedgerId;
 
--WHILE @@FETCH_STATUS = 0
--    BEGIN
--	  if Exists (select code from ACC_Ledger where LedgerId=@LedgerId and Code is null)
--	  Begin
--	    update ACC_Ledger
--		set Code=(convert(int, IsNULL( (select max(code) from acc_ledger),0)+1))
--		where LedgerId=@LedgerId;
--	   END
--      FETCH NEXT FROM led_cursor INTO  @LedgerId;
--    END;
 
--CLOSE led_cursor;
 
--DEALLOCATE led_cursor;
--Go

--START: NageshBB: 01 April 2020: script for generate ledger code, parameter values for minimum ledger code value 


-----START: Pratik: 02 April 2020:--


/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_DoctorPayment]    Script Date: 4/2/2020 9:26:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/*-- Author: Pratik/31March'20
-- Description:	To get Incentive payment reports at doctor level for given date range
--Change History:
----------------------------------------------------------------
S.No.  Author/Date                   Remarks
----------------------------------------------------------------
1.    Pratik/31March'20              Initial Draft

----------------------------------------------------------------

*/
CREATE PROCEDURE [dbo].[SP_Report_INCTV_DoctorPayment] --EXEC SP_Report_INCTV_DoctorPayment '2019-07-20','2020-3-31'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
BEGIN
  SELECT Convert(Date,PaymentDate) 'PaymentDate',
  emp.FullName 'ReceiverName',payinfo.ReceiverId,PaymentInfoId,
  ISNULL(payinfo.TotalAmount,0) 'TotalAmount',
  ISNULL(payinfo.TDSAmount,0) 'TDSAmount',
  ISNULL(payinfo.NetPayAmount,0) 'NetPayAmount',
  ISNULL(payinfo.AdjustedAmount,0) 'AdjustedAmount'
  from
  INCTV_TXN_PaymentInfo payinfo
  join EMP_Employee emp
  on emp.EmployeeId=payinfo.ReceiverId

	WHERE 
	    Isnull(payinfo.IsActive,0)=1
	    AND Convert(Date,payinfo.PaymentDate) Between @FromDate AND @ToDate  

END
GO

---Route for Payment report
DECLARE @AppId int

SELECT @AppId = ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'INCTV'

INSERT INTO RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
VALUES 
('incentive-report-payment-view', @AppId, 1, GETDATE(), 1),
('incentive-report-transaction-view', @AppId, 1, GETDATE(), 1)

GO

DECLARE  @permId int, @pRouteId int

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-report-transaction-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Reports'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Transaction Report', 'Incentive/Reports/TransactionReport', 'TransactionReport', @permId, @pRouteId, 1, NULL, 1)
GO

DECLARE  @permId int, @pRouteId int
SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-report-payment-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Reports'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Payment Report', 'Incentive/Reports/PaymentReport', 'PaymentReport', @permId, @pRouteId, 1, NULL, 1)
GO


-----End: Pratik: 02 April 2020:--
--START: Sanjit: 2 Apr'20 -- Adding Verification as a module in application.
GO
	INSERT INTO [dbo].[RBAC_Application]
		([ApplicationCode],[ApplicationName],[IsActive],[CreatedBy],[CreatedOn])
	VALUES
		('VERIF','Verification',1,1,GETDATE())
GO
	DECLARE @ApplicationId INT
		SET @ApplicationId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'VERIF' and ApplicationName = 'Verification')
	INSERT INTO [dbo].[RBAC_Permission] 
		([PermissionName], [ApplicationId], [CreatedBy], [CreatedOn], [IsActive])
		VALUES('verification-view', @ApplicationId, 1, GETDATE(), 1)
GO
	DECLARE @ApplicationId INT
		SET @ApplicationId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'VERIF' and ApplicationName = 'Verification')
	DECLARE @PermissionId INT
		SET @PermissionId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'verification-view' and ApplicationId = @ApplicationId)

	INSERT INTO [dbo].[RBAC_RouteConfig]
		([DisplayName], [UrlFullPath], [RouterLink], [PermissionId],[Css],[DefaultShow],[DisplaySeq],[IsActive])
		VALUES('Verification','Verification','Verification', @PermissionId, 'verification.png', 1,28,1)
GO
	DECLARE @ApplicationId INT
		SET @ApplicationId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'VERIF' and ApplicationName = 'Verification')
	INSERT INTO [dbo].[RBAC_Permission] 
		([PermissionName], [ApplicationId], [CreatedBy], [CreatedOn], [IsActive])
		VALUES('verification-inventory-view', @ApplicationId, 1, GETDATE(), 1)
GO
	DECLARE @ApplicationId INT
		SET @ApplicationId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'VERIF' and ApplicationName = 'Verification')
	DECLARE @PermissionId INT
		SET @PermissionId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'verification-inventory-view' and ApplicationId = @ApplicationId)
	Declare @ParentRouteId INT
		SET @ParentRouteId = (SELECT TOP(1) RouteId FROM RBAC_RouteConfig WHERE DisplayName = 'Verification' and UrlFullPath = 'Verification' and RouterLink = 'Verification')

	INSERT INTO [dbo].[RBAC_RouteConfig]
		([DisplayName], [UrlFullPath], [RouterLink], [PermissionId],[ParentRouteId],[DefaultShow],[DisplaySeq],[IsActive])
		VALUES('Inventory','Verification/Inventory','Inventory', @PermissionId, @ParentRouteId, 1,1,1)
GO
--END: Sanjit:2 Apr'20
--START: Sanjit: 2 Apr'20 -- create a requisition page under inventory tab under verification
	DECLARE @ApplicationId INT
		SET @ApplicationId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'VERIF' and ApplicationName = 'Verification')
	INSERT INTO [dbo].[RBAC_Permission] 
		([PermissionName], [ApplicationId], [CreatedBy], [CreatedOn], [IsActive])
		VALUES('verification-inventory-requisition-view', @ApplicationId, 1, GETDATE(), 1)
GO
	DECLARE @ApplicationId INT
		SET @ApplicationId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'VERIF' and ApplicationName = 'Verification')
	DECLARE @PermissionId INT
		SET @PermissionId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'verification-inventory-requisition-view' and ApplicationId = @ApplicationId)
	Declare @ParentRouteId INT
		SET @ParentRouteId = (SELECT TOP(1) RouteId FROM RBAC_RouteConfig WHERE DisplayName = 'Inventory' and UrlFullPath = 'Verification/Inventory' and RouterLink = 'Inventory')

	INSERT INTO [dbo].[RBAC_RouteConfig]
		([DisplayName], [UrlFullPath], [RouterLink], [PermissionId],[ParentRouteId],[DefaultShow],[DisplaySeq],[IsActive])
		VALUES('Requisition','Verification/Inventory/Requisition','Requisition', @PermissionId, @ParentRouteId, 1,1,1)
GO
--END: Sanjit: 2 Apr'20

--Start: Sanjit : 2 Apr'20 --Dispatch Details Report Correction. Missing Incremental merged.
/****** Object:  StoredProcedure [dbo].[SP_Report_Dispatch_Details]    Script Date: 4/2/2020 8:24:58 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Dispatch_Details]
		@DispatchId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Kushal/18 Oct 2019				Created Script 
2		Sanjit/5 Mar 2020				divided by zero bug fix using case statement
3.      Sud/3Mar'20						Changed Department to Store (needs revision)
----------------------------------------------------------
*/
BEGIN
	If(@DispatchId > 0)
	BEGIN
		SELECT A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemName,
			CASE 
			  WHEN SUM(A.Qty) != 0 THEN ROUND((SUM(A.Amt)/SUM(A.Qty)),2)
			  ELSE 0
			END StandardRate,
			A.ITemId,A.Code,A.StoreName,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy FROM 
			(
				SELECT  emp.Salutation+'. '+emp.FirstName+' '+ emp.LastName as CreatedByName,
						dis.CreatedOn,
						req.CreatedOn RequisitionDate,
						itm.ItemName,
						itm.Code,
						dis.ItemId,
						store.Name 'StoreName',
						dis.DispatchedQuantity,
						req.RequisitionId,
						dis.DispatchId,
						stk.AvailableQuantity Qty,
						gri.ItemRate*stk.AvailableQuantity Amt,
						dis.ReceivedBy
				from INV_TXN_DispatchItems dis 
					join INV_MST_Item itm on itm.ItemId = dis.ItemId
					join INV_TXN_RequisitionItems req on req.RequisitionItemId = dis.RequisitionItemId

					join PHRM_MST_Store store on store.StoreId= dis.StoreId
					---join MST_Department dep on dep.DepartmentId = dis.DepartmentId

					join EMP_Employee emp on emp.EmployeeId = dis.CreatedBy
					join INV_TXN_Stock stk on stk.ItemId = itm.ItemId
					join INV_TXN_GoodsReceiptItems gri on gri.GoodsReceiptItemId = stk.GoodsReceiptItemId
				where dis.DispatchId = @DispatchId
			) A
			group by A.ItemName,A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemId,A.Code,A.StoreName,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy
			END
		END
GO
--END: Sanjit: 2 Apr'20


--START:VIKAS: 2nd April 2020: Adding code details as per charak requirements
	-- added column 
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
	 WHERE Name = N'HospitalId'
	 AND Object_ID = Object_ID(N'dbo.ACC_MST_CodeDetails'))
	 BEGIN
	ALTER TABLE ACC_MST_CodeDetails
	ADD HospitalId int NULL;
	END
	GO

	--update HospitalId for HAMS
	UPDATE ACC_MST_CodeDetails
	SET HospitalId= (select HospitalId from ACC_MST_Hospital Where HospitalShortName='HAMS')
	GO
	------------------------------------------------------------------------------

	-- Insert code for charak
	DECLARE @HospitalId INT
	SET @HospitalId=(select HospitalId from ACC_MST_Hospital Where HospitalShortName='CHARAK')

	
	IF(@HospitalId IS NOT NULL)
	BEGIN
	INSERT INTO ACC_MST_CodeDetails([Code],[Name],[Description],[HospitalId]) 
		VALUES
		('001','REVENUE','PrimaryGroup',@HospitalId),
		('002','EXPENSES','PrimaryGroup',@HospitalId),
		--('003','Direct Expense','COA',@HospitalId),
		('004','REVENEUS','COA',@HospitalId),
		--('005','Indirect Expenses','COA',@HospitalId),
		--('006','REVENEUS','COA',@HospitalId),
		--('007','Purchase','COA',@HospitalId),
		('008','ASSETS','PrimaryGroup',@HospitalId),
		('009','LIABILITIES','PrimaryGroup',@HospitalId),
		('010','SHAREHOLDER''S EQUITY','COA',@HospitalId),
		('011','CURRENT ASSETS','COA',@HospitalId),
		('012','CURRENT LIABILITIES','COA',@HospitalId),
		('013','LONG TERM LIABILITIES','COA',@HospitalId),
		('014','FIXED ASSETS','COA',@HospitalId)
	END
	GO

	-- added column in acc txn table
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
	WHERE Name = N'IsEditable'
	AND Object_ID = Object_ID(N'dbo.ACC_Transactions'))
	BEGIN
	ALTER TABLE ACC_Transactions
	ADD IsEditable bit 
	DEFAULT 0 NULL;
	END
	GO
--END:VIKAS: 2nd April 2020: Adding code details as per charak requirements

--START: Sanjesh: 2nd April 2020--isActive issues in INV_TXN_RequisitionItems
UPDATE INV_TXN_RequisitionItems
SET IsActive=1 
WHERE IsActive is null;
GO
--END: Sanjesh: 2nd April 2020--isActive issues in INV_TXN_RequisitionItems

--START: NageshBB: 03 Apr 2020: script for ledger code generation
DECLARE @LedgerId int;
Declare @Code int;
Declare @StartCode int=1001; --defalt value is 1001

--get default MiniCode from parameter table
Set @StartCode=IsNULL( (select convert(int, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting' and ParameterName='MinimumLedgerCode'),0);
if(@StartCode=0)
Begin
	Set @StartCode=1001; --if parameter table don't have value then set 1001 as default
END
	
DECLARE led_cursor CURSOR
FOR SELECT LedgerId FROM ACC_Ledger;
 
OPEN led_cursor;
 
FETCH NEXT FROM led_cursor INTO 
    @LedgerId;
 
WHILE @@FETCH_STATUS = 0
    BEGIN
	  if ((select count(ledgerid) from ACC_Ledger where Code is not null)=0)
	  Begin
		
		 update ACC_Ledger set Code=convert(varchar,@StartCode) where LedgerId=@LedgerId;
	  End
	  else if Exists (select code from ACC_Ledger where LedgerId=@LedgerId and Code is null)
	  Begin
	    update ACC_Ledger
		set code =convert (varchar,(convert(int, IsNULL( (select max(code) from acc_ledger),0)+1)))
		where LedgerId=@LedgerId;
	   END
      FETCH NEXT FROM led_cursor INTO  @LedgerId;
    END;
 
CLOSE led_cursor;
 
DEALLOCATE led_cursor;
Go
--END: NageshBB: 03 Apr 2020: script for ledger code generation

    
--START:VIKAS: 3 April 2020 : Added some columns for ledgers.
	--1 PANNo
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
	WHERE Name = N'PANNo' AND Object_ID = Object_ID(N'dbo.ACC_Ledger'))
	BEGIN
		ALTER TABLE ACC_Ledger ADD PANNo Varchar(20)  NULL;
	END
	GO
	--2 Address
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
	WHERE Name = N'Address' AND Object_ID = Object_ID(N'dbo.ACC_Ledger'))
	BEGIN
		ALTER TABLE ACC_Ledger ADD Address Varchar(200)  NULL;
	END
	GO
	--3 MobileNo
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
	WHERE Name = N'MobileNo' AND Object_ID = Object_ID(N'dbo.ACC_Ledger'))
	BEGIN
		ALTER TABLE ACC_Ledger ADD MobileNo Varchar(20)  NULL;
	END
	GO
	--4 CreditPeriod
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
	WHERE Name = N'CreditPeriod' AND Object_ID = Object_ID(N'dbo.ACC_Ledger'))
	BEGIN
		ALTER TABLE ACC_Ledger ADD CreditPeriod int NULL;
	END
	GO
	--5 TDSPercent
		IF NOT EXISTS(SELECT 1 FROM sys.columns 
	WHERE Name = N'TDSPercent' AND Object_ID = Object_ID(N'dbo.ACC_Ledger'))
	BEGIN
		ALTER TABLE ACC_Ledger ADD TDSPercent decimal(18, 2) NULL;
	END
	GO
 
	--6 LandlineNo
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
	WHERE Name = N'LandlineNo' AND Object_ID = Object_ID(N'dbo.ACC_Ledger'))
	BEGIN
		ALTER TABLE ACC_Ledger ADD LandlineNo Varchar(20)  NULL;
	END
	GO
--END:VIKAS: 3 April 2020 : Added some columns for ledgers.

	 

--START: Ramesh:03 April 2020 : IsVATApplicable added in Inventory ItemMaster

Alter Table INV_MST_Item
	Add IsVATApplicable bit NULL
GO

UPDATE INV_MST_Item 
	SET IsVATApplicable = 1 
	WHERE IsVATApplicable IS NULL 
GO


Insert CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
values('Inventory','DefaultVATPercentage','13','number','To Set the default VATPercentage','custom')
Go

--END: Ramesh:03 April 2020 : IsVATApplicable added in Inventory ItemMaster


---start: sud: 4Apr'20-- update in Incentive- Bulk Insert (Bill Sync) logic---
/****** Object:  StoredProcedure [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange]    Script Date: 4/5/2020 12:14:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange '2020-02-14','2020-02-14'
 Description: 
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By         Remarks
 --------------------------------------------------
 1.      15Feb'20/Sud          Initial Draft (Needs Revision)
 2.      15Mar'20/Sud         Added TDSPercentage and TDSAmount calculation in the query
3.       4Apr'20/Sud          Excluding Already Added BillingTransactionItem during Bill Sync.
                              earlier it was at BillingTransactionId level, now it's BillingTransactionItemId
 ---------------------------------------------------
*/
BEGIN

IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN

---Start: For Referral Incentive-----------

INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercentage,0) AS TDSPercent,
	( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercentage,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN [FN_INCTV_GetIncentiveSettings] () sett
--LEFT JOIN [FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.ReferredByPercent,0) !=0
	---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Referral Incentive-----------

UNION ALL

---Start: For Assigned Incentive-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercentage,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercentage,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  --, txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN [FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.AssignedToPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Assigned Incentive-----------
END

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END
GO
---end: sud: 4Apr'20-- update in Incentive- Bulk Insert (Bill Sync) logic---


--START: Sanjit: 4th April '20 --Added Remarks in Verification Table
	ALTER TABLE [dbo].[TXN_Verification]
	ADD [VerificationRemarks] varchar(400);
GO
--END: Sanjit: 4th April '20


---start: sud:5Apr'20:  Change in Clinical -> Notes-----
Update RBAC_RouteConfig
SET IsActive=0
WHERE UrlFullPath='Doctors/PatientOverviewMain/Clinical/Notes'
GO
---sud:5Apr'20: We've moved Notes outside of Clinical Module, so using pre-existing routes with display name change--
Update RBAC_RouteConfig
SET DisplayName='Notes'
WHERE UrlFullPath='Doctors/PatientOverviewMain/NotesSummary'
GO
---End: sud:5Apr'20:  Change in Clinical -> Notes-----

--START: Sanjesh: 6 April 2020--VATAmount column added in Inv_txn_PurchaseOrderItems
Alter table INV_TXN_PurchaseOrderItems 
   Add  VATAmount decimal(16,4) 
   Go
Update INV_TXN_PurchaseOrderItems 
Set VATAmount = 0
where VATAmount is null
Go
--END: Sanjesh: 6 April 2020--VATAmount column added in Inv_txn_PurchaseOrderItems

--START: SanjitL 6Apr'20: ParentVerificationId made nullable in verification table and added a foreign key constraint in the same table for referenctial integrity.
	ALTER TABLE [TXN_Verification]
	ALTER COLUMN [ParentVerificationId] INT NULL;
GO
	UPDATE [TXN_Verification]
	SET [ParentVerificationId] = null
	WHERE ParentVerificationId = 0;
GO
	ALTER TABLE [TXN_Verification]
	ADD CONSTRAINT FK_ParentVerificationId
	FOREIGN KEY (ParentVerificationId) REFERENCES [dbo].[TXN_Verification]([VerificationId]);
GO
--END: SanjitL 6Apr'20: ParentVerificationId made nullable in verification table and added a foreign key constraint in the same table for referenctial integrity.



--START: Ashish: 7 April 2020--Create tbl for section list 
Declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('accounting-settings-sectionList',@ApplicationId,1,GETDATE(),1)
GO
Declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='accounting-settings-sectionList');

Declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Settings')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('SectionList','Accounting/Settings/SectionList','SectionList',@permissionId,@parentRouteId,1,1)
GO

CREATE TABLE ACC_MST_SectionList (
    Id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  SectionId int,
    SectionName varchar(50),
    SectionCode varchar(20)  
);
GO
INSERT INTO ACC_MST_SectionList (SectionId,SectionName,SectionCode)
values (1,'Inventory','INV'),
		(2,'Billing','BL'),
		(3,'Pharmacy','PH'),
		(4,'Manual_Voucher',''),
		(5,'Incentive','INCTV')
GO
--END: Ashish: 7 April 2020--Create tbl for section list

---Start: Pratik: 9April 2020-- Route for Patient Vs Service Report

DECLARE @AppId int

SELECT @AppId = ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'INCTV'

INSERT INTO RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
VALUES 
('incentive-report-patientVsService-view', @AppId, 1, GETDATE(), 1)

GO

DECLARE  @permId int, @pRouteId int
SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-report-patientVsService-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Reports'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Patient Vs Service Report', 'Incentive/Reports/PatientVsService', 'PatientVsService', @permId, @pRouteId, 1, NULL, 1)
GO

---End: Pratik: 9April 2020-- Route for Patient Vs Service Report

--START: Sanjit: 9April'20 -- Added foreign key reference in Requisition table for verification Id
--Also changed current RequisitionNo to IssueNo and created a new field RequisitionNo which increments using max+1 logic
--updated store procedure accoridingly.
	ALTER TABLE [dbo].[INV_TXN_Requisition]
	ADD CONSTRAINT FK_INV_TXN_Verification_TXN_Verification
	FOREIGN KEY (VerificationId) REFERENCES [dbo].[TXN_Verification]([VerificationId]);
GO
--8 April
	sp_rename 'INV_TXN_Requisition.RequisitionNo', 'IssueNo', 'COLUMN';
GO
	sp_rename 'INV_TXN_RequisitionItems.RequisitionNo', 'IssueNo', 'COLUMN';
GO
	ALTER TABLE [dbo].[INV_TXN_Requisition]
	ADD [RequisitionNo] int NOT NULL DEFAULT(0);
GO
	ALTER TABLE [dbo].[INV_TXN_RequisitionItems]
	ADD [RequisitionNo] int NOT NULL DEFAULT(0);
GO
	DECLARE @MaxId INT 

	SELECT @MaxId = MAX(RequisitionNo) from [INV_TXN_Requisition]

	UPDATE [INV_TXN_Requisition] 
	SET  @MaxId = RequisitionNo = @MaxId +1
	WHERE RequisitionNo = 0;
GO
	UPDATE INV_TXN_RequisitionItems
	SET RequisitionNo = (SELECT RequisitionNo 
						 FROM INV_TXN_Requisition AS R
						 WHERE R.RequisitionId = INV_TXN_RequisitionItems.RequisitionId)
	WHERE RequisitionNo = 0
GO
--9April
GO
	/****** Object:  StoredProcedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView]    Script Date: 4/9/2020 1:38:45 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	ALTER Procedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView] 
	  @RequisitionId INT
	AS
	/*
	FileName: INV_TXN_VIEW_GetRequisitionItemsInfoForView -- EXEC INV_TXN_VIEW_GetRequisitionItemsInfoForView  8
	Author: Sud/19Feb'20 
	Description: to get details of Requisition items along with Employee Information.
	Remarks: We're returning two tables, one for Requisition details and another for Dispatch Details.
	ChangeHistory:
	----------------------------------------------------
	S.No    Author/Date                  Remarks
	---------------------------------------------------
	1.       Sud/19Feb'20                Initial Draft
	2.      Sud/4Mar'20               added RequisitionItemId in select query. Needed for Cancellation.
	3.		sanjit/9Apr'20				added IssueNo and RequisitionNo in SP
	-------------------------------------------------------
	*/
	BEGIN
 
	  Select reqItm.ItemId, itm.ItemName, itm.Code, reqItm.Quantity, 
		reqItm.ReceivedQuantity, reqItm.PendingQuantity, reqItm.RequisitionItemStatus,
		reqItm.Remark,   reqItm.ReceivedQuantity AS 'DispatchedQuantity', 
		reqItm.RequisitionNo,reqItm.IssueNo, reqItm.RequisitionId,
		reqItm.CreatedOn, reqItm.CreatedBy, reqEmp.FullName 'CreatedByName',
		reqItm.RequisitionItemId,
	  NULL AS 'ReceivedBy' -- receive item feature is not yet implemented, correct this later : sud-19Feb'20

		from 

		INV_TXN_RequisitionItems reqItm  
		INNER JOIN INV_MST_Item itm 
		   ON reqItm.ItemId=itm.ItemId
		INNER JOIN EMP_Employee reqEmp
		   ON reqItm.CreatedBy = reqEmp.EmployeeId

	  Where reqItm.RequisitionId=@RequisitionId


	  Select dispItm.RequisitionItemId, dispItm.DispatchedQuantity, dispItm.CreatedOn 'DispatchedOn', 
	  dispItm.CreatedBy 'DispatchedBy', emp.FullName 'DispatchedByName' 
	   from INV_TXN_DispatchItems dispItm
	  INNER JOIN EMP_Employee emp
		 ON dispItm.CreatedBy = emp.EmployeeId 
	  where RequisitionItemId IN (Select RequisitionItemId from INV_TXN_RequisitionItems  where RequisitionId=@RequisitionId)
	  ORder by dispItm.CreatedOn
	END
GO
--END: Sanjit: 9April'20 

---Anish:Start: 9Apr'20-- for file/image storage-- used to replace filestream with file storage in physical location-- merged from remove_filestream branch---
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
Values(
'Patient','PatientProfilePicImageUploadLocation','D:\PatientFiles\','string','Contains Location where to store the Patient Images Uploaded','custom'
)
Go

Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
Values(
'Clinical','ClinicalDocumentUploadLocation','D:\PatientFiles\','string',
'Contains Location where to save the uploaded Clinical Document of the Patient','custom'
)
GO
---Anish:End: 9Apr'20-- for file/image storage-- used to replace filestream with file storage in physical location-- merged from remove_filestream branch---

--START: Ashish:  9 April 2020: add UniqueName for Inventory Subcategory LedgerMapping
UPDATE CORE_CFG_Parameters
SET ParameterValue=
'[ {"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"pharmacysupplier"},
{"LedgergroupUniqueName":"LCL_CONSULTANT_(CREDIT_A/C)", "LedgerType":"consultant"}, 
{"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"inventoryvendor"},
{"LedgergroupUniqueName":"ACA_SUNDRY_DEBTORS", "LedgerType":"creditorganization"},
{"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"inventorysubcategory"}]'
WHERE ParameterName='LedgerGroupMapping' and ParameterGroupName ='Accounting'
Go
--END: Ashish: 9 April 2020: add UniqueName for Inventory Subcategory LedgerMapping

--START: Sanjit: 10April'20
--10 April: Added CurrentVerificationLevelCount in Verification table.
	ALTER TABLE [TXN_Verification]
	ADD [CurrentVerificationLevelCount] int 
	CONSTRAINT DF_CurrentVerificationLevelCount DEFAULT 1 NOT NULL;
GO
--10 April: Added Remarks in Dispatch Table of Inventory.
	ALTER TABLE [INV_TXN_DispatchItems]
	ADD Remarks varchar(400);
GO
--Added Remarks in DispatchDetails SP
/****** Object:  StoredProcedure [dbo].[SP_Report_Dispatch_Details] 25    Script Date: 4/10/2020 5:17:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Dispatch_Details]
		@DispatchId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Kushal/18 Oct 2019				Created Script 
2		Sanjit/5 Mar 2020				divided by zero bug fix using case statement
3.      Sud/3Mar'20						Changed Department to Store (needs revision)
4.		Sanjit/10Apr'20					Added Remarks in SP	
----------------------------------------------------------
*/
BEGIN
	If(@DispatchId > 0)
	BEGIN
		SELECT A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemName,
			CASE 
			  WHEN SUM(A.Qty) != 0 THEN ROUND((SUM(A.Amt)/SUM(A.Qty)),2)
			  ELSE 0
			END StandardRate,
			A.ITemId,A.Code,A.StoreName,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy,A.Remarks FROM 
			(
				SELECT  emp.Salutation+'. '+emp.FirstName+' '+ emp.LastName as CreatedByName,
				dis.CreatedOn,
				req.CreatedOn RequisitionDate,
				itm.ItemName,
				itm.Code,
				dis.ItemId,
				store.Name 'StoreName',
				dis.DispatchedQuantity,
				req.RequisitionId,
				dis.DispatchId,
				stk.AvailableQuantity Qty,
				gri.ItemRate*stk.AvailableQuantity Amt,
				dis.ReceivedBy,
				dis.Remarks
				from INV_TXN_DispatchItems dis 
				join INV_MST_Item itm on itm.ItemId = dis.ItemId
				join INV_TXN_RequisitionItems req on req.RequisitionItemId = dis.RequisitionItemId
                join PHRM_MST_Store store on store.StoreId= dis.StoreId
				---join MST_Department dep on dep.DepartmentId = dis.DepartmentId
				join EMP_Employee emp on emp.EmployeeId = dis.CreatedBy
				join INV_TXN_Stock stk on stk.ItemId = itm.ItemId
				join INV_TXN_GoodsReceiptItems gri on gri.GoodsReceiptItemId = stk.GoodsReceiptItemId
			where dis.DispatchId = @DispatchId
			) A
			group by A.ItemName,A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.ItemId,A.Code,A.StoreName,A.DispatchedQuantity,A.RequisitionId,A.DispatchId,A.ReceivedBy,A.Remarks
			END
			END
GO
--END: Sanjit: 10April'20

----start: sud: 10Apr'20-- For Incentive at Invoice Item level---


/****** Object:  StoredProcedure [dbo].[SP_INCTV_GetBillingTxnItems_BetweenDate]    Script Date: 4/10/2020 6:48:50 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[SP_INCTV_GetBillingTxnItems_BetweenDate]   -- EXEC SP_INCTV_GetBillingTxnItems_BetweenDate '2020-04-01', '2020-04-10'
	( @FromDate DATETIME = NULL,
      @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_GetBillingTxnItems_BetweenDate
 Description:  To get billing transaction items for fraction,
 Conditions/Checks: 
   1. Returned Items are removed.
   2. Joining with EMployee Table twice for Assigned and ReferredBy Employee
   3. FractionCount (number) is the count of FractionItem  in Incentive_FractionItem table for BillingTransactionItemId
        
 Remarks: This can later be extended and used in Billing -> Edit Doctor as well since the fields are preety much similar.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By       Remarks
 --------------------------------------------------
 1.      10Apr'20/Sud          Initial Draft 
 
 ---------------------------------------------------
*/
BEGIN

select
     pat.PatientId, pat.FirstName+' '+ISNULL(pat.MiddleName+' ','')+pat.LastName 'PatientName', pat.PatientCode,

  fyear.FiscalYearFormatted +'-'+ bilTxn.InvoiceCode + cast(bilTxn.InvoiceNo as varchar(20)) AS 'InvoiceNo' 
  , bilTxn.CreatedOn 'TransactionDate',  biltxn.BillingTransactionId, txnItm.BillingTransactionItemId 'BillingTransactionItemId', 

txnItm.ServiceDepartmentName, txnItm.ItemName, txnItm.TotalAmount,
txnItm.ProviderName 'AssignedToEmpName', emp2.FullName 'ReferredByEmpName', 
inctvTxnItm.FrcCount 'FractionCount'

from  BIL_CFG_FiscalYears fyear, 
	PAT_Patient pat,

    BIL_TXN_BillingTransaction bilTxn 
	     JOIN BIL_TXN_BillingTransactionItems txnItm
	ON bilTxn.BillingTransactionId = txnItm.BillingTransactionId
	    --LEFT JOIN EMP_Employee emp1 
		   --ON txnItm.ProviderId = emp1.EmployeeId  -- for AssignedToDoctor
        LEFT JOIN EMP_Employee emp2
		   ON txnItm.RequestedBy= emp2.EmployeeId
    LEFT JOIN (Select BillingTransactionItemId, Count(*) 'FrcCount'  from INCTV_TXN_IncentiveFractionItem where IsActive=1 Group By BillingTransactionItemId ) inctvTxnItm
	    ON txnItm.BillingTransactionItemId = inctvTxnItm.BillingTransactionItemId

where 
	    bilTxn.FiscalYearId = fyear.FiscalYearId 
	AND bilTxn.PatientId=pat.PatientId
	AND Convert(Date,bilTxn.CreatedOn) Between @FromDate AND @ToDate
	AND ISNULL(bilTxn.ReturnStatus,0) = 0
 
END
GO

/****** Object:  StoredProcedure [dbo].[SP_INCTV_GetFractionItems_ByTxnItemId]    Script Date: 4/10/2020 6:49:41 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[SP_INCTV_GetFractionItems_ByTxnItemId]  -- EXEC SP_INCTV_GetFractionItems_ByTxnItemId 21058
  @BillingTansactionItemId int = NULL
AS
/*
 File: SP_INCTV_GetFractionItems_ByTxnItemId
 Description: to get the fractions for Current BillingTransactionItemId.
 Conditions/Checks: 
 Remarks: 
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By       Remarks
 --------------------------------------------------
 1.      10Apr'20/Sud          Initial Draft 
 ---------------------------------------------------
*/
BEGIN
 
--Table:1 -- Get Fraction Information---
Select * from INCTV_TXN_IncentiveFractionItem
WHERE BillingTransactionItemId=@BillingTansactionItemId

END
GO

----End: sud: 10Apr'20-- For Incentive at Invoice Item level---


--START: Sanjit: 12Apr'20 -- Added GoodsReceiptNo field with max+1 increment logic.
	ALTER TABLE INV_TXN_GoodsReceipt 
	ADD GoodsReceiptNo int NOT NULL
    CONSTRAINT DF_GoodsReceiptNo DEFAULT (0)
GO
DECLARE @MaxId INT 

	SELECT @MaxId = MAX(GoodsReceiptNo) from [INV_TXN_GoodsReceipt]

	UPDATE [INV_TXN_GoodsReceipt] 
	SET  @MaxId = GoodsReceiptNo = @MaxId +1
	WHERE GoodsReceiptNo = 0;
GO
--Added N/A by default in INV_MST_UnitOfMeasurement
	IF NOT EXISTS (SELECT * FROM INV_MST_UnitOfMeasurement WHERE UOMName='N/A' or UOMName='NA')
		INSERT INTO INV_MST_UnitOfMeasurement
		(UOMName,CreatedBy,CreatedOn,IsActive,Description)
		VALUES
		('N/A',1,GETDATE(),1,'Not found in data source')
GO
--Added CancelRemarks field in INV_TXN_RequisitionItems.
ALTER TABLE INV_TXN_RequisitionItems
ADD CancelRemarks varchar(400);
GO
--END: Sanjit 12Apr'20


--Start: Pratik 12April'20

update CORE_CFG_Parameters
set ParameterValue='{"LaboratoryServices":"np,en","PatientRegistration":"np,en","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np","DoctorOutPatientReport":"en,np","DoctorwiseIncomeSummary":"en,np","CustomReport":"en,np","DailyMISReport":"en,np","DoctorSummary":"en,np","DepartmentSummary":"en,np","Common":"en,np","AccountingModule":"np,en","IncentiveModule":"np,en"}'
where ParameterGroupName='Common' and ParameterName='CalendarTypes'
GO

--End: Pratik 12April'20


-- START: VIKAS : 13 Apr 2020: add and drop coloumn from inv substore table
	IF EXISTS(SELECT 1 FROM sys.columns 
		WHERE Name = N'AccountHeadId' AND Object_ID = Object_ID(N'dbo.INV_MST_ItemSubCategory'))
		BEGIN
			ALTER TABLE INV_MST_ItemSubCategory DROP COLUMN AccountHeadId;
		END
	GO
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
		WHERE Name = N'LedgerId' AND Object_ID = Object_ID(N'dbo.INV_MST_ItemSubCategory'))
		BEGIN
			ALTER TABLE INV_MST_ItemSubCategory ADD LedgerId INT NULL;
		END
	GO	
-- END: VIKAS : 13 Apr 2020: add and drop coloumn from inv substore table

-- START: VIKAS : 13 Apr 2020: add parameter for group by ledgers
	IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where parametergroupname='Accounting' and parametername='IsAllowGroupby')
	BEGIN
	 Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
	 values('Accounting','IsAllowGroupby','false','boolean','allow group by for transactions','custom',null);
	END
	GO
-- END: VIKAS : 13 Apr 2020: add parameter for group by ledgers


-------Start: Bikash: 13 April 2020: Altering CLN_Notes table

--Bikash:13 April 2020: Progressive Note converted into Progress Note
update CLN_Template
set TemplateName ='Progress Note', CreatedOn = (select GETDATE())
where TemplateId = 1 and TemplateName ='Progressive Note'
Go

--Bikash: 13 April 2020:  SecondaryDoctorId added along with foreign key reference
ALTER TABLE CLN_Notes
ADD	SecondaryDoctorId int null,
	FOREIGN KEY (SecondaryDoctorId) REFERENCES EMP_Employee(EmployeeId);
GO

--Bikash: 13 April 2020: WrittenBy ,PrimaryDoctor and SecondaryDoctor columns deleted
ALTER TABLE CLN_Notes
DROP COLUMN WrittenBy,PrimaryDoctor,SecondaryDoctor;
Go

-------END: Bikash: 13 April 2020: Altering CLN_Notes table



--START: Sanjit: 14 April'20: Added unique key constraint in PHRM_MST_Store
ALTER TABLE PHRM_MST_Store
ADD CONSTRAINT UC_PHRM_MST_STORE_StoreName UNIQUE (Name);
GO
--Removed Account Head Id from Item Master in Inventory

IF EXISTS(SELECT 1 FROM sys.columns 
		  WHERE Name = N'AccountHeadId' AND Object_ID = Object_ID(N'dbo.INV_MST_Item'))
	BEGIN
		IF OBJECT_ID('dbo.[FK_INV_MST_Item_INV_MST_ItemUsage]', 'F') IS NOT NULL 
			ALTER TABLE dbo.INV_MST_Item DROP CONSTRAINT FK_INV_MST_Item_INV_MST_ItemUsage;
		ALTER TABLE INV_MST_Item DROP COLUMN AccountHeadId;
	END
GO
--END: Sanjit: 14 April'20

--START: Ramesh :14April'20 
----Updated Stored Procedure accoridingly.

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_DailyItemsDispatchReport]    Script Date: 14-Apr-20 12:35:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
---------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_DailyItemsDispatchReport]  
  @FromDate DateTime=null,
  @ToDate DateTime=null,
  @StoreId int=null
AS
/*
FileName: [SP_Report_Inventory_DailyItemsDispatchReport] 
CreatedBy/date: Umed/2017-06-21
Description: to get Details such as itemNames , total dispatch qty of particular item with total amount generated between given dates along with StoreName.
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/2017-06-21                     created the script
2       Rusha/2019-06-06                    updated the script
3       Ramesh/2020-04-14                   updated the script
-------------------------------------------------------
*/
BEGIN
    If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0)
        BEGIN
            SELECT CONVERT(date,D.CreatedOn) AS [Date],I.ItemName,D.DispatchedQuantity,D.ReceivedBy,
            CONCAT_WS(' ',E.FirstName,E.MiddleName,E.LastName) AS DispatchedBy,
            D.RequisitionItemId,
            (D.DispatchedQuantity * I.StandardRate) as 'Amount',
            I.Code,
            U.UOMName ,S.Name StoreName
            FROM INV_TXN_DispatchItems AS D
            JOIN INV_TXN_RequisitionItems AS RI ON RI.RequisitionItemId = D.RequisitionItemId
            JOIN INV_TXN_Requisition AS R ON R.RequisitionId = RI.RequisitionId
            JOIN PHRM_MST_Store AS S ON R.StoreId = S.StoreId
            JOIN INV_MST_Item AS I ON I.ItemId= RI.ItemId
            JOIN EMP_Employee AS E ON E.EmployeeId = D.CreatedBy            
            LEFT JOIN INV_MST_UnitOfMeasurement U on I.UnitOfMeasurementId = U.UOMId
           WHERE CONVERT(date,D.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())+1 
              AND
               (CASE
                 WHEN @StoreId is not null and R.StoreId = @StoreId THEN 1
                 WHEN @StoreId is null THEN 1
                END) = 1

     END
END
GO
--END: Ramesh :14April'20 
----Updated Stored Procedure accoridingly.

-- START: VIKAS : 14 Apr 2020: add parameter for group by ledgers
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
		WHERE Name = N'IsGroupTxn' AND Object_ID = Object_ID(N'dbo.ACC_Transactions'))
		BEGIN
			ALTER TABLE ACC_Transactions ADD IsGroupTxn bit NULL;
		END
	GO
-- END: VIKAS : 14 Apr 2020: add parameter for group by ledgers


---Start:   Pratik:15April'20

Alter Table EMP_Employee
Add PANNumber Varchar(20)
GO
Alter Table EMP_Employee
Add TDSPercent float
GO
Alter Table EMP_Employee
Add IsIncentiveApplicable bit
GO
update EMP_Employee
set IsIncentiveApplicable=0
GO
update EMP_Employee
set IsIncentiveApplicable=1
where IsAppointmentApplicable =1
Go

---End:   Pratik:15April'20

-------Start: Bikash: 15 April 2020: creating and altering table for notetype field

--Bikash: 15 April '20 : table created for notestype
CREATE TABLE CLN_MST_NoteType(
	[NoteTypeId] [int] PRIMARY KEY Identity(1,1),
	[NoteType] [varchar](250) NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NULL,
	FOREIGN KEY (CreatedBy) REFERENCES EMP_Employee(EmployeeId)
);
GO

--Bikash: 15 April '20 : adding note types
INSERT INTO CLN_MST_NoteType (NoteType,CreatedBy,CreatedOn)
VALUES	('Progress Note',1,GETDATE()),
		('History & Physical',1,GETDATE()),
		('Consult Note',1,GETDATE()),
		('Free Text',1,GETDATE()),
		('Discharge Note',1,GETDATE()),
		('Emergency Note',1,GETDATE()),
		('Procedure Note',1,GETDATE());
GO

--Bikash: 15 April '20 : NoteTypeId field added in CLN_Notes table
ALTER TABLE CLN_Notes
Add  NoteTypeId int null,
	FOREIGN KEY (NoteTypeId) REFERENCES CLN_MST_NoteType(NoteTypeId);
GO

--Bikash: 15 April '20 : previous NoteType (varchar) field deleted
ALTER TABLE CLN_NOTES
DROP COLUMN NoteType
GO

-------End: Bikash: 15 April 2020: creating and altering table for notetype field

--START: Sanjit: 17 Apr 2020: updated sp for reqisition view
GO
/****** Object:  StoredProcedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView]    Script Date: 4/17/2020 10:56:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
	ALTER Procedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView] 
	  @RequisitionId INT
	AS
	/*
	FileName: INV_TXN_VIEW_GetRequisitionItemsInfoForView -- EXEC INV_TXN_VIEW_GetRequisitionItemsInfoForView  8
	Author: Sud/19Feb'20 
	Description: to get details of Requisition items along with Employee Information.
	Remarks: We're returning two tables, one for Requisition details and another for Dispatch Details.
	ChangeHistory:
	----------------------------------------------------
	S.No    Author/Date                  Remarks
	---------------------------------------------------
	1.      Sud/19Feb'20                Initial Draft
	2.      Sud/4Mar'20					added RequisitionItemId in select query. Needed for Cancellation.
	3.		sanjit/9Apr'20				added IssueNo and RequisitionNo in SP
	4.		sanjit/17Apr'20				added cancel details in the sp.
	-------------------------------------------------------
	*/
	BEGIN
 
	  Select reqItm.ItemId, itm.ItemName, itm.Code, reqItm.Quantity, 
		reqItm.ReceivedQuantity, reqItm.PendingQuantity, reqItm.RequisitionItemStatus,
		reqItm.Remark,   reqItm.ReceivedQuantity AS 'DispatchedQuantity', 
		reqItm.RequisitionNo,reqItm.IssueNo, reqItm.RequisitionId,
		reqItm.CreatedOn, reqItm.CreatedBy, reqEmp.FullName 'CreatedByName',
		reqItm.RequisitionItemId,reqItm.isActive,reqItm.CancelOn,reqItm.CancelRemarks,
		(select FullName from EMP_Employee where EmployeeId = reqItm.CancelBy) 'CancelBy',
		NULL AS 'ReceivedBy' -- receive item feature is not yet implemented, correct this later : sud-19Feb'20

		from 

		INV_TXN_RequisitionItems reqItm  
		INNER JOIN INV_MST_Item itm 
		   ON reqItm.ItemId=itm.ItemId
		INNER JOIN EMP_Employee reqEmp
		   ON reqItm.CreatedBy = reqEmp.EmployeeId

	  Where reqItm.RequisitionId=@RequisitionId


	  Select dispItm.RequisitionItemId, dispItm.DispatchedQuantity, dispItm.CreatedOn 'DispatchedOn', 
	  dispItm.CreatedBy 'DispatchedBy', emp.FullName 'DispatchedByName' 
	   from INV_TXN_DispatchItems dispItm
	  INNER JOIN EMP_Employee emp
		 ON dispItm.CreatedBy = emp.EmployeeId 
	  where RequisitionItemId IN (Select RequisitionItemId from INV_TXN_RequisitionItems  where RequisitionId=@RequisitionId)
	  ORder by dispItm.CreatedOn
	END
GO
--END: Sanjit: 17 Apr 2020: updated sp for reqisition view

----Start: Pratik: 17April'20 


Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
values('Billing','BillRequestDoubleEntryWarningTimeHrs','0','number','Double Entry Soft Restrictions/warning in Bill Request Page. if Same item is being entered twice in current invoice or within Given time.if value is (Zero or Null or Not Found) then Dont compare with Past Tests','custom',null);
Go

----===============================================================================================================
/****** Object:  StoredProcedure [dbo].[SP_BIL_GetPatientPastBills]    Script Date: 4/17/2020 6:06:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_BIL_GetPatientPastBills]  --- SP_BIL_GetPatientPastBills 77235, 15
		
		@PatientId INT=null,
		@maxPastDays INT=null
AS
/*
FileName: SP_BIL_GetPatientPastBills
CreatedBy/date: Sud/Anish/2019-06-19
Description: Get patient's Billing Items of Last N days, Exclude Cancelled Items. 
  Used in Billing Transaction page (for Checkbox)

Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      Sud/Anish/19June'19                     Created.
2.      pratik/Sud: 17 April'20                  Added ItemId and ServiceDepartmentId in select, 
                                               excluded returned items, correction in username(now taking from emp.FullName )
-----------------------------------------------------------------------------------------
*/
BEGIN

IF( @maxPastDays IS NULL)
   SET @maxPastDays=7 -- we're taking past 7 days entry for now..


  SELECT itm.CreatedOn, txn.InvoiceCode + COnvert(varchar(20), txn.InvoiceNo) 'InvoiceNumber', itm.ItemId,itm.ServiceDepartmentId,
    itm.ServiceDepartmentName, itm.ItemName, itm.TotalAmount, itm.BillStatus, emp.FirstName 'UserFirstName',  emp.FullName 'User'
 FROM BIL_TXN_BillingTransactionItems itm left join BIL_TXN_BillingTransaction txn
   ON itm.BillingTransactionId=txn.BillingTransactionId
 Join EMP_Employee emp 
 ON itm.CreatedBy=emp.EmployeeId
WHERE  itm.PatientId=@PatientId
   and itm.BillStatus !='cancel'
   and ISNULL(itm.ReturnStatus,0) !=1
   and  DATEDIFF(DAY,itm.CreatedOn,getdate())   <= @maxPastDays
Order by itm.CreatedOn DESC


END -- end of SP
GO

----End: Pratik: 17April'20 



--START: Sanjit: 20Apr'20: updated sp for dispatch receipt
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Dispatch_Details]    Script Date: 4/20/2020 12:15:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Dispatch_Details]
		@DispatchId int = 0 
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Kushal/18 Oct 2019				Created Script 
2		Sanjit/5 Mar 2020				divided by zero bug fix using case statement
3.      Sud/3Mar'20						Changed Department to Store (needs revision)
4.		Sanjit/10Apr'20					Added Remarks in SP	
5.		Sanjit/17Apr'20					Added few more properties to use it in Dispatch Receipt.
----------------------------------------------------------
*/
BEGIN
	If(@DispatchId > 0)
	BEGIN
		SELECT A.RequestedByName,A.CreatedByName,A.CreatedOn,A.RequisitionDate,A.PendingQuantity,
			A.Quantity,A.ReceivedQuantity,A.RequisitionItemStatus,A.ItemName,A.IssueNo,A.RequisitionItemId,
			A.ITemId,A.Code,A.StoreName,A.DispatchedQuantity,A.RequisitionId,A.RequisitionNo,
			A.DispatchId,A.ReceivedBy,A.Remarks,
			CASE 
			  WHEN SUM(A.Qty) != 0 THEN ROUND((SUM(A.Amt)/SUM(A.Qty)),2)
			  ELSE 0
			END StandardRate 
		FROM 
		(
			SELECT  E.Salutation+'. '+E.FirstName+' '+ E.LastName as CreatedByName,
				D.CreatedOn,RI.CreatedOn RequisitionDate,RI.RequisitionItemStatus,RI.RequisitionItemId,
				RI.PendingQuantity,RI.Quantity,RI.ReceivedQuantity,RI.RequisitionNo,RI.IssueNo,
				I.ItemName,I.Code,D.ItemId,S.Name 'StoreName',
				D.DispatchedQuantity,RI.RequisitionId,D.DispatchId,
				STK.AvailableQuantity Qty,GR.ItemRate*STK.AvailableQuantity Amt,
				D.ReceivedBy,D.Remarks,
				(SELECT E.FullName from EMP_Employee E WHERE E.EmployeeId = RI.CreatedBy ) 'RequestedByName'
			from	INV_TXN_DispatchItems D 
				join INV_MST_Item I on I.ItemId = D.ItemId
				join INV_TXN_RequisitionItems RI on RI.RequisitionItemId = D.RequisitionItemId
				join PHRM_MST_Store S on S.StoreId= D.StoreId
				join EMP_Employee E on E.EmployeeId = D.CreatedBy
				join INV_TXN_Stock STK on STK.ItemId = I.ItemId
				join INV_TXN_GoodsReceiptItems GR on GR.GoodsReceiptItemId = STK.GoodsReceiptItemId
			where D.DispatchId = @DispatchId
		) A
		group by A.ItemName,A.CreatedByName,A.CreatedOn,A.RequisitionDate,
				A.RequisitionNo,A.IssueNo,A.RequisitionDate,
				A.ReceivedQuantity,A.Quantity,A.PendingQuantity,
				A.RequisitionItemStatus,A.RequestedByName,A.RequisitionItemId,
				A.ItemId,A.Code,A.StoreName,A.DispatchedQuantity,
				A.RequisitionId,A.DispatchId,A.ReceivedBy,A.Remarks
	END
END
GO

--END: Sanjit: 20Apr'20: updated sp for dispatch receipt


---Start: Pratik: 21April'20: item summery report

declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Reports' and ApplicationCode='RPT');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('reports-billing-items-summary-report-view',@ApplicationID,1,GETDATE(),1);
Go
--reports-billingmain-refferrersummaryreport-view
declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='reports-billing-items-summary-report-view');

Declare @RefParentRouteID INT
SET @RefParentRouteID = (Select Top(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Reports/BillingMain');

Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DisplaySeq,IsActive)
Values('Items Summary','Reports/BillingMain/ItemSummaryReport','ItemSummaryReport',@permissionID,@RefParentRouteID,'fa fa-money fa-stack-1x text-white',null,1);
Go



/****** Object:  StoredProcedure [dbo].[SP_Report_ItemSummaryReport]    Script Date: 4/21/2020 6:31:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*-- =============================================
-- Author:		 20April'20/Pratik 
-- Description:	To get Items item summary report
-- Change History-----
S.No.   Date/Author    Remarks
---------------------------------------
1.     20April'20/Pratik   Initial Draft

-- =============================================*/
CREATE PROCEDURE [dbo].[SP_Report_ItemSummaryReport]  --EXEC SP_Report_ItemSummaryReport '2020-03-01','2020-03-17'
	@FromDate date = NULL,
    @ToDate date = NULL
AS
BEGIN
	
SELECT ServiceDepartmentName, ItemName, Count(*) 'TotalQty', SUM(Isnull(bilTxnItm.SubTotal,0)) 'SubTotal',
SUm(bilTxnItm.DiscountAmount) 'DiscountAmount', SUM(bilTxnItm.TotalAmount) 'TotalAmount'

FROM BIL_TXN_BillingTransactionItems bilTxnItm, BIL_TXN_BillingTransaction txn

WHERE  
bilTxnItm.BillingTransactionId = txn.BillingTransactionId
and ISNULL(bilTxnItm.ReturnStatus,0) = 1 
AND ( bilTxnItm.BillStatus='paid' or bilTxnItm.BillStatus='unpaid')
AND Convert(Date,txn.CreatedOn) Between @FromDate AND @ToDate

Group by ServiceDepartmentName, ItemName
order by ServiceDepartmentName, ItemName
END
GO


---Start: Pratik: 21April'20: item summery report
--Start: Ashish 21 April 2020 : Add clm for update Voucher(edit voucher feature)
ALTER TABLE [dbo].ACC_Transactions
  ADD [ModifiedBy] [int] NULL, 
  [ModifiedOn] [datetime] NULL;
GO
-------End: Ashish 21 April 2020 : Add clm for update Voucher(edit voucher feature)

--START: VIKAS : 22 April 2020: added parameter for default date preference at user level.
	IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where parametergroupname='Common' and parametername='CalendarDatePreference')
	BEGIN
	 Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
	 values('Common','CalendarDatePreference','{"np":true,"en":false}','json','Date preference','custom',null);
	END
	GO
--END: VIKAS : 22 April 2020: added parameter for default date preference at user level.



---start: sud: 25Apr'20-- merged from hotfix branch----

---Start: Sud: 23Apr'20-- item summery report
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
File: SP_Report_ItemSummaryReport
Author:     20April'20/Pratik 
Description:  To get Items item summary report

-------------------------------------------
Change History
------------------------------------------
S.No.   Date/Author           Remarks
---------------------------------------
1.     20April'20/Pratik   Initial Draft
2. Sud:23Apr'20            Correction in TotalQty and ReturnStatus
-----------------------------------------------------------------------
*/

Alter PROCEDURE [dbo].[SP_Report_ItemSummaryReport]  --EXEC SP_Report_ItemSummaryReport '2020-03-01','2020-03-17'
  @FromDate date = NULL,
  @ToDate date = NULL
AS
BEGIN
  
	SELECT ServiceDepartmentName, ItemName, Sum(ISNULL(bilTxnItm.Quantity,0)) 'TotalQty', SUM(Isnull(bilTxnItm.SubTotal,0)) 'SubTotal',
	SUm(bilTxnItm.DiscountAmount) 'DiscountAmount', SUM(bilTxnItm.TotalAmount) 'TotalAmount'

	FROM BIL_TXN_BillingTransactionItems bilTxnItm, BIL_TXN_BillingTransaction txn

	WHERE  
	    bilTxnItm.BillingTransactionId = txn.BillingTransactionId
	and ISNULL(bilTxnItm.ReturnStatus,0) = 0 
	AND ( bilTxnItm.BillStatus='paid' or bilTxnItm.BillStatus='unpaid')
	AND Convert(Date,txn.CreatedOn) Between @FromDate AND @ToDate

	Group by ServiceDepartmentName, ItemName
	order by ServiceDepartmentName, ItemName
END
GO


---End: Sud: 23Apr'20-- item summery report

--START: Sanjit: 24APR'20 -- created a parameter to allow/prevent dispatch without verification in inventory
INSERT INTO CORE_CFG_Parameters 
(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,ParameterType,Description)
VALUES
('Inventory','AllowSubstoreDispatchWithoutVerification','true','boolean','custom','Allow or Prevent the Dispatch of Internal Requisition before verification.')
GO
--END: Sanjit: 24APR'20 -- created a parameter to allow/prevent dispatch without verification in inventory



---Start: sud: 24Apr--BillSettlement Issue---

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_TXNS_BILL_SettlementSummary] 
AS
/*
FileName: SP_TXNS_BILL_SettlementSummary
CreatedBy/date: Deepak,Sud: 24March'20
Description: to get Deposit, Provisional, Credit Total for Settlement Details.
Remarks: 

Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------	
1.        Deepak,Sud/24Apr'20                Provisional issue, EMR-1989
		
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
       where 
	   txnItm.BillStatus ='provisional'  -- this takes only provisional
	   and txnItm.BillingType !='inpatient'
	   --and txnItm.BillingTransactionId is not null  -- this takes invoice created
	   AND ISNULL(txnItm.ReturnStatus,0) != 1 AND ISNULL(txnItm.IsInsurance,0) != 1 

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

---End: sud: 24Apr--BillSettlement Issue---

---End: sud: 25Apr'20-- merged from hotfix branch----

--START: VIKAS : 27 April 2020: button levle permission for voucher edit for user.
	Declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');

	Insert into RBAC_Permission ([PermissionName],[Description],[ApplicationId],[CreatedBy],[CreatedOn],[IsActive])
	values ('accounting-edit-voucher-button-permission','This permission is used to give access edit voucher or not for users',@ApplicationId,1,GETDATE(),1);
	GO
--END: VIKAS : 27 April 2020: button levle permission for voucher edit for user.


---Start: Bikash: 28 April 2020: table for clinical Emergency-note

CREATE TABLE [dbo].[CLN_Notes_Emergency](
	[EmergencyNoteId] [int] PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[NotesId] [int] NOT NULL,
	[PatientId] [int] NULL,
	[PatientVisitId] [int] NULL,
	[BroughtIn] [varchar](50) NULL,	
	[BroughtBy] [varchar](250) NULL,
	[Relationship] [varchar](250) NULL,
	[PhoneNumber] [int] NULL,
	[ModeOfArrival] [varchar](250) NULL,
	[ReferralDoctorOrHospital] [varchar](250) NULL,	
	[TriageTime] [Time] NULL,
	[TriagedBy] [varchar](50) NULL,
	[Trauma] [bit] NULL,
	[Disposition] [varchar](250) NULL,
	[DispositionDepartmentId] [int] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,	
	[IsActive] [bit] NULL,
	FOREIGN KEY (NotesId) REFERENCES CLN_Notes(NotesId),
	FOREIGN KEY (PatientId) REFERENCES PAT_Patient (PatientId),
	FOREIGN KEY (PatientVisitId) REFERENCES PAT_PatientVisits(PatientVisitId)
)
GO

---End: Bikash: 28 April 2020: table for clinical Emergency-note

---START:  Anish 30th April LabEnhancement
---------Create and add permission for report-labmain-categoryanditem-count'
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Reports' and ApplicationCode='RPT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('reports-labmain-categoryanditem-count',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT;
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='reports-labmain-categoryanditem-count');

declare @RefParentRouteId INT;
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Reports/LabMain');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Category And Test Count', 'Reports/LabMain/CatAndItemWiseCountLabReport','CatAndItemWiseCountLabReport',@PermissionId,@RefParentRouteId,1,20,1);
GO


Alter table LAB_TestCategory
Add IsDefault bit null;
Go

UPDATE LAB_TestCategory SET IsDefault=0;
Go

IF NOT EXISTS (SELECT * FROM LAB_TestCategory 
                   WHERE TestCategoryName='DEFAULT')
BEGIN
	Insert Into LAB_TestCategory(TestCategoryName, CreatedBy, CreatedOn, IsDefault)
	Values('DEFAULT',(Select EmployeeId from RBAC_User where UserName='admin'),GETDATE(), 1);
END
Go

declare @defCat int;
set @defCat = (SELECT TestCategoryId FROM LAB_TestCategory 
                   WHERE TestCategoryName='DEFAULT');

Update LAB_LabTests set LabTestCategoryId=@defCat where LabTestCategoryId is null;
Go

-------Create SP for LAB_CategoryWiseLabTestTotalCount 

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<ANish Bhattarai>
-- Create date: <27 Apr 2020>
-- Description:	<Get the count of test category wise>
-- =============================================
CREATE PROCEDURE SP_LAB_CategoryWiseLabTestTotalCount 
( @FromDate DATETIME = NULL,
      @ToDate DATETIME = NULL)
AS
BEGIN
	select cat.TestCategoryId,cat.TestCategoryName, Count(req.RequisitionId) as TotalCount from LAB_TestRequisition req 
join LAB_LabTests test on req.LabTestId = test.LabTestId
join LAB_TestCategory cat on test.LabTestCategoryId = cat.TestCategoryId
where req.BillingStatus <> 'cancel' and req.BillingStatus <> 'returned'
and Convert(date,req.OrderDateTime) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
group by cat.TestCategoryId, cat.TestCategoryName;
END
GO
----End of SP

-----Create SP for SP_LAB_TestWiseTotalCount
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<ANish Bhattarai>
-- Create date: <27 Apr 2020>
-- Description:	<Get the count of test category wise>
-- =============================================
CREATE PROCEDURE SP_LAB_TestWiseTotalCount 
( @FromDate DATETIME = NULL,
      @ToDate DATETIME = NULL,
	  @catId INT = NULL)
AS
BEGIN
Declare @qry nvarchar(max);
Set @qry = 'select cat.TestCategoryName,req.LabTestId,req.LabTestName, Count(req.RequisitionId) as TotalCount from LAB_TestRequisition req 
join LAB_LabTests test on req.LabTestId = test.LabTestId
join LAB_TestCategory cat on test.LabTestCategoryId = cat.TestCategoryId where';

IF(@catId IS NOT NULL  and @catId > 0)
BEGIN
SET @qry = @qry + ' cat.TestCategoryId = ' + cast(@catId as varchar(10)) + ' and';
END

Set @qry = @qry + ' req.BillingStatus <> ' +  '''cancel''' + ' and req.BillingStatus <> ' +  '''returned''' 
+ ' and Convert(date,req.OrderDateTime) BETWEEN CONVERT(date,''' + cast(@FromDate AS VARCHAR(50)) + ''',103)  AND ' 
+ 'CONVERT(date,''' + cast(@ToDate AS VARCHAR(50)) + ''',103) group by req.LabTestId, req.LabTestName, cat.TestCategoryName';

EXEC(@qry);

--select cat.TestCategoryName,req.LabTestId,req.LabTestName, Count(req.RequisitionId) as TotalCount from LAB_TestRequisition req 
--join LAB_LabTests test on req.LabTestId = test.LabTestId
--join LAB_TestCategory cat on test.LabTestCategoryId = cat.TestCategoryId
--where req.BillingStatus <> 'cancel' and req.BillingStatus <> 'returned' 
--and Convert(date,req.OrderDateTime) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
--group by req.LabTestId, req.LabTestName, cat.TestCategoryName;

END
GO
---End of SP
---END:  Anish 30th April LabEnhancement

--START: Anish 4th May ----Nursing Enhancement
---CREATE PERMISSION
declare @applicationId int;
set @applicationId=(select Applicationid from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR')

IF NOT EXISTS(select * from RBAC_Permission where PermissionName='nursing-ip-summary-view' 
or PermissionName='nursing-ip-wardbilling-view' or PermissionName='nursing-ip-clinical-view' or
PermissionName='nursing-ip-drugrequest-view' or PermissionName='nursing-ip-fileupload-view')

BEGIN

Insert Into RBAC_Permission(PermissionName, ApplicationId,CreatedBy,CreatedOn,IsActive)
Values('nursing-ip-summary-view',@applicationId,1,GETDATE(),1),
('nursing-ip-wardbilling-view',@applicationId,1,GETDATE(),1),
('nursing-ip-clinical-view',@applicationId,1,GETDATE(),1),
('nursing-ip-drugrequest-view',@applicationId,1,GETDATE(),1),
('nursing-ip-fileupload-view',@applicationId,1,GETDATE(),1);

END
GO
--END: Anish 4th May ----Nursing Enhancement

--START: Rusha merged from inv_procurement
--START: Sanjit: 22 APR'20 -- Created new table for Purchase Request and PurchaseRequestItems

CREATE TABLE [dbo].[INV_TXN_PurchaseRequest](
  [PurchaseRequestId] [int] IDENTITY(1,1) Constraint PK_INV_TXN_PurchaseRequest Primary Key NOT NULL,
  RequestDate DateTime,
  PRNumber INT,  -- max+1
  VendorId INT,
  RequestStatus varchar(20),   -- active, withdrawn, cancelled, pending, complete
  VerificationId INT,
  [IsPOCreated] [bit] NULL,
  Remarks Varchar(400),
  CancelledBy INT,
  CancelledOn DateTime,
  CancelRemarks varchar(400),
  [CreatedBy] [int] NOT NULL,
  [CreatedOn] [datetime] NOT NULL,
  [ModifiedBy] [int] NULL,
  [ModifiedOn] [datetime] NULL,
  IsActive [bit] NOT NULL,
) 
GO


CREATE TABLE [dbo].[INV_TXN_PurchaseRequestItems](
  [PurchaseRequestItemId] [int] IDENTITY(1,1) Constraint PK_INV_TXN_PurchaseRequestItems Primary Key NOT NULL,
  PurchaseRequestId INT Constraint FK_INV_TXN_PurchaseRequestItems_PurchaseRequest 
               Foreign Key References INV_TXN_PurchaseRequest(PurchaseRequestId)  NOT NULL,
  VendorId INT,
  [ItemId] [int] NOT NULL,
  [RequestedQuantity] [float] NOT NULL,
  RequestItemStatus varchar(20),
  Remarks varchar(400),
  CancelledBy INT,
  CancelledOn DateTime,
  CancelRemarks varchar(400),
  [CreatedBy] [int] NOT NULL,
  [CreatedOn] [datetime] NOT NULL,
  [ModifiedBy] [int],
  [ModifiedOn] [datetime],
  IsActive BIT
) ON [PRIMARY]
GO

--END: Sanjit: 22 APR'20 -- Created new table for Purchase Request and PurchaseRequestItems

--START: Sanjit: 22APR'20 -- Inserted new Parameter for Verification of Purchase Request 

 Insert into CORE_CFG_Parameters
 (ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
 values
 ('Inventory','PurchaseRequestVerificationSettings','{	"EnableVerification": false,"VerificationLevel":0,"PermissionIds":[],}',
 'json','Maximum three level of verification. Permission Id should be sequential i.e. [Level 1 Id, Level 2 Id , Level 3 Id]','system',null);
 GO
--END: Sanjit: 22APR'20 -- Inserted new Parameter for Verification of Purchase Request 

--START: Sanjit: 22APR'20 -- Added Permission for Verifiers in Purchase Request of Inventory
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Inventory' and ApplicationCode='INV');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values	('purchase-request-verifier1',@ApplicationId,1,GETDATE(),1),
		('purchase-request-verifier2',@ApplicationId,1,GETDATE(),1),
		('purchase-request-verifier3',@ApplicationId,1,GETDATE(),1);
GO
--END: Sanjit: 22APR'20 -- Added Permission for Verifiers in Purchase Request of Inventory


--START: Sanjit: 22 APR'20 -- Added Permission and RouteConfig for Purchase Request in Verification module.

	DECLARE @ApplicationId  int;
	SET @ApplicationId = (SELECT TOP(1) ApplicationId FROM RBAC_Application WHERE ApplicationCode='VERIF' and ApplicationName = 'Verification')

	INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
	VALUES ('verification-inventory-purchase-request-view',@ApplicationId,1,GETDATE(),1)
GO

	DECLARE @PermissionId int;
	SET @PermissionId = (Select TOP(1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'verification-inventory-purchase-request-view')
	
	DECLARE @ParentRouteId int;
	SET @ParentRouteId = (Select TOP(1) RouteId FROM RBAC_RouteConfig WHERE RouterLink = 'Inventory' and UrlFullPath = 'Verification/Inventory')

	INSERT INTO RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
	VALUES('Purchase Request','Verification/Inventory/PurchaseRequest','PurchaseRequest',@PermissionId,@ParentRouteId,1,2,1)
GO

--END: Sanjit: 22 APR'20 -- Added Permission and RouteConfig for Purchase Request in Verification module.

--START: Sanjit: 28 APR'20 -- Added core cfg parameter to bypass the verification process and allow creating PO before verification.
 Insert into CORE_CFG_Parameters
	(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
 values
	('Inventory','AllowPOFromPurchaseRequestWithoutVerification','false','boolean','Allow or Prevent the creating PO of Inventory before verification.','custom',null);
 GO
--END: Sanjit: 28 APR'20 -- Added core cfg parameter to bypass the verification process and allow creating PO before verification.

--START: Sanjit 30 APR'20 --Added permission for Direct Dispatch in Inventory
DECLARE @ApplicationId int
SET @ApplicationId = (SELECT TOP(1) ApplicationId from RBAC_Application WHERE ApplicationCode = 'INV' and ApplicationName = 'Inventory')
INSERT INTO RBAC_Permission 
(ApplicationId,PermissionName,Description,IsActive,CreatedBy,CreatedOn)
VALUES
(@ApplicationId,'inventory-direct-dispatch-btn','Permission to direct dispatch in Inventory/Internal/Requisition',1,1,GETDATE())
GO
--END: Sanjit 30 APR'20 --Added permission for Direct Dispatch in Inventory
--START: Sanjit 30 APR'20 -- Changing Route UrlFulPath for paths under requisition

UPDATE RBAC_RouteConfig
SET  DefaultShow = 1
WHERE UrlFullPath = 'Inventory/InternalMain/Requisition' and DisplayName = 'Requisition' and RouterLink='Requisition'
GO

UPDATE RBAC_RouteConfig
SET UrlFullPath = 'Inventory/InternalMain/Requisition/RequisitionList', DefaultShow = 0
WHERE UrlFullPath = 'Inventory/InternalMain/RequisitionList' and DisplayName = 'Requisition' and RouterLink='RequisitionList'
GO

UPDATE RBAC_RouteConfig
SET UrlFullPath = 'Inventory/InternalMain/Requisition/Dispatch'
WHERE UrlFullPath = 'Inventory/InternalMain/Dispatch' and DisplayName = 'Dispatch Items' and RouterLink='Dispatch'
GO

UPDATE RBAC_RouteConfig
SET UrlFullPath = 'Inventory/InternalMain/Requisition/RequisitionDetails'
WHERE UrlFullPath = 'Inventory/InternalMain/RequisitionDetails' and DisplayName = 'Requisition Details' and RouterLink='RequisitionDetails'
GO

UPDATE RBAC_RouteConfig
SET UrlFullPath = 'Inventory/InternalMain/Requisition/DispatchAll'
WHERE UrlFullPath = 'Inventory/InternalMain/DispatchAll' and DisplayName = 'Dispatch All' and RouterLink='DispatchAll'
GO
--END: Sanjit 30 APR'20 -- Changing Route UrlFulPath for paths under requisition
--END: Rusha merged from inv_procurement

--START: Rusha merged from RadiologyChanges
---START: Anish 6th May, 2020 ----Radiology----
ALTER TABLE RAD_MST_ImagingItem
ADD IsValidForReporting bit NOT NULL
CONSTRAINT defVal DEFAULT 1
WITH VALUES;
GO

ALTER TABLE  EMP_Employee
Add RadiologySignature nvarchar(500);
Go

ALTER TABLE  EMP_Employee
ALTER Column LabSignature nvarchar(500)
GO

DECLARE @radDptId int;
SET @radDptId = (SELECT DepartmentId FROM MST_Department WHERE Lower(DepartmentName)='radiology');
UPDATE EMP_Employee
SET RadiologySignature = LongSignature
WHERE DepartmentId=@radDptId;
GO

---END: Anish 6th May, 2020 ----Radiology----
--END: Rusha merged from RadiologyChanges

---START: Rusha ----merged from Pharmacy_Issues_Enhancement
----START: Shankar :6th May 2020, Transfer to store and transfer to dispensary report------------

--route config for transfer to dispensary report--
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('reports-pharmacy-transfertodispensary-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-transfertodispensary-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy/Report')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
values ('Transferred To Dispensary', 'Pharmacy/Report/TransferToDispensaryReport','TransferToDispensaryReport',@PermissionId,@RefParentRouteId,1,1);
GO
GO
/****** Object:  StoredProcedure [dbo].[SP_PHRM_TransferToDispensaryReport]    Script Date: 04/29/2020 5:01:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--store producre for transfer to dispensary report--
CREATE PROCEDURE [dbo].[SP_PHRM_TransferToDispensaryReport] 
	@FromDate datetime=null,
	@ToDate datetime=null
AS
 /*
FileName: [dbo].[SP_PHRM_TransferToDispensaryReport] '05/06/2020','05/06/2020'
CreatedBy/date:Shankar/05-01-2020
Description: To get report of stock details transfer to dispensary from store
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1.
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
			select CONVERT(date,stk.CreatedOn) as [Date],ItemName,BatchNo,Quantity,ExpiryDate,TotalAmount,StoreName,emp.FullName
			from PHRM_StoreStock as stk
			join EMP_Employee emp on stk.CreatedBy = emp.EmployeeId
			where CONVERT(date, stk.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 AND TransactionType='Transfer To Dispensary'
			
	   END
END
GO

--route config for transfer to store report--
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('reports-pharmacy-transfertostore-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-transfertostore-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy/Report')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
values ('Transferred To Store', 'Pharmacy/Report/TransferToStoreReport','TransferToStoreReport',@PermissionId,@RefParentRouteId,1,1);
GO
Go
--store procedure for transfer to store report--
/****** Object:  StoredProcedure [dbo].[SP_PHRM_TransferToStoreReport]    Script Date: 04/29/2020 5:01:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRM_TransferToStoreReport] 
	@FromDate datetime=null,
	@ToDate datetime=null
AS
 /*
FileName: [dbo].[SP_PHRM_TransferToStoreReport] '05/05/2020','05/05/2020'
CreatedBy/date:Shankar/05-01-2020
Description: To get report of stock details transfer to store from dispensary 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1.
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
			select CONVERT(date,stk.CreatedOn) as [Date],ItemName,BatchNo,Quantity,ExpiryDate,TotalAmount,StoreName,emp.FullName
			from PHRM_StoreStock as stk
			join EMP_Employee emp on stk.CreatedBy = emp.EmployeeId
			where CONVERT(date, stk.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 AND TransactionType='Sent From Dispensary'
			
	   END
END
GO
----END: Shankar: 6th May 2020, Transfer to store and transfer to dispensary report------------
---END: Rusha ----merged from Pharmacy_Issues_Enhancement


--START: Sanjit 6 May'20 -- added new field Remarks for Requisition in Inventory/Substore
	ALTER TABLE INV_TXN_Requisition
	Add Remarks varchar(400)
GO
--END: Sanjit 6 May'20 -- added new field Remarks for Requisition in Inventory/Substore
--START: Sanjit: 6May'20 -- added remarks in the sp to show in requisition detail page.
GO
/****** Object:  StoredProcedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView]    Script Date: 5/6/2020 3:25:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
	ALTER Procedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView] 
	  @RequisitionId INT
	AS
	/*
	FileName: INV_TXN_VIEW_GetRequisitionItemsInfoForView -- EXEC INV_TXN_VIEW_GetRequisitionItemsInfoForView  8
	Author: Sud/19Feb'20 
	Description: to get details of Requisition items along with Employee Information.
	Remarks: We're returning two tables, one for Requisition details and another for Dispatch Details.
	ChangeHistory:
	----------------------------------------------------
	S.No    Author/Date                  Remarks
	---------------------------------------------------
	1.      Sud/19Feb'20                Initial Draft
	2.      Sud/4Mar'20					added RequisitionItemId in select query. Needed for Cancellation.
	3.		sanjit/9Apr'20				added IssueNo and RequisitionNo in SP
	4.		sanjit/17Apr'20				added cancel details in the sp.
	5.		sanjit/6May'20				added RequisitionRemarks in the sp.(immediate solution,must refactor properly)
	-------------------------------------------------------
	*/
	BEGIN
 
	  Select reqItm.ItemId, itm.ItemName, itm.Code, reqItm.Quantity, 
		reqItm.ReceivedQuantity, reqItm.PendingQuantity, reqItm.RequisitionItemStatus,
		reqItm.Remark,   reqItm.ReceivedQuantity AS 'DispatchedQuantity', 
		reqItm.RequisitionNo,reqItm.IssueNo, reqItm.RequisitionId,
		reqItm.CreatedOn, reqItm.CreatedBy, reqEmp.FullName 'CreatedByName',
		reqItm.RequisitionItemId,reqItm.isActive,reqItm.CancelOn,reqItm.CancelRemarks,
		(select FullName from EMP_Employee where EmployeeId = reqItm.CancelBy) 'CancelBy',
		NULL AS 'ReceivedBy', -- receive item feature is not yet implemented, correct this later : sud-19Feb'20,
		(select Remarks from INV_TXN_Requisition where RequisitionId = @RequisitionId) 'Remarks'

		from 

		INV_TXN_RequisitionItems reqItm  
		INNER JOIN INV_MST_Item itm 
		   ON reqItm.ItemId=itm.ItemId
		INNER JOIN EMP_Employee reqEmp
		   ON reqItm.CreatedBy = reqEmp.EmployeeId

	  Where reqItm.RequisitionId=@RequisitionId


	  Select dispItm.RequisitionItemId, dispItm.DispatchedQuantity, dispItm.CreatedOn 'DispatchedOn', 
	  dispItm.CreatedBy 'DispatchedBy', emp.FullName 'DispatchedByName' 
	   from INV_TXN_DispatchItems dispItm
	  INNER JOIN EMP_Employee emp
		 ON dispItm.CreatedBy = emp.EmployeeId 
	  where RequisitionItemId IN (Select RequisitionItemId from INV_TXN_RequisitionItems  where RequisitionId=@RequisitionId)
	  ORder by dispItm.CreatedOn
	END
GO
--END: Sanjit: 6May'20 -- added remarks in the sp to show in requisition detail page.



---START: NageshBB: 08 May 2020: Merged ACc Script to DEV:   ----------------
-- START: Ashish: 29Apr 2020: add new two clm for get in payment report and update sp

ALTER TABLE INCTV_TXN_PaymentInfo ADD
VoucherNumber NVARCHAR(50) null;
Go
ALTER TABLE INCTV_TXN_PaymentInfo ADD
Remarks NVARCHAR(200) null;
Go

/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_DoctorPayment]    Script Date: 29-04-2020 04:33:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/*-- Author: Pratik/31March'20
-- Description:	To get Incentive payment reports at doctor level for given date range
--Change History:
----------------------------------------------------------------
S.No.  Author/Date                   Remarks
----------------------------------------------------------------
1.    Pratik/31March'20              Initial Draft
2.	  Ashish/29April'20				add two clm Voucher no. & remarks for get in report.
----------------------------------------------------------------

*/
ALTER PROCEDURE [dbo].[SP_Report_INCTV_DoctorPayment] --EXEC SP_Report_INCTV_DoctorPayment '2019-07-20','2020-3-31'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
BEGIN
  SELECT Convert(Date,PaymentDate) 'PaymentDate',
  emp.FullName 'ReceiverName',payinfo.ReceiverId,PaymentInfoId,
  ISNULL(payinfo.TotalAmount,0) 'TotalAmount',
  ISNULL(payinfo.TDSAmount,0) 'TDSAmount',
  ISNULL(payinfo.NetPayAmount,0) 'NetPayAmount',
  ISNULL(payinfo.AdjustedAmount,0) 'AdjustedAmount',
   ISNULL(payinfo.VoucherNumber,0) 'VoucherNumber',
    ISNULL(payinfo.Remarks,0) 'Remarks'
  from
  INCTV_TXN_PaymentInfo payinfo
  join EMP_Employee emp
  on emp.EmployeeId=payinfo.ReceiverId

	WHERE 
	    Isnull(payinfo.IsActive,0)=1
	    AND Convert(Date,payinfo.PaymentDate) Between @FromDate AND @ToDate  

END
GO

-- END: Ashish: 29Apr 2020: add new two clm for get in payment report and update sp

--START:VIKAS: 30th Apr 2020: Update script for LedgerGroupMapping
Update CORE_CFG_Parameters
SET ParameterValue= 
'[ {"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"pharmacysupplier","COA":""}, {"LedgergroupUniqueName":"LCL_CONSULTANT_(CREDIT_A/C)", "LedgerType":"consultant","COA":""},{"LedgergroupUniqueName":"LCL_SUNDRY_CREDITORS", "LedgerType":"inventoryvendor","COA":""},{"LedgergroupUniqueName":"ACA_SUNDRY_DEBTORS", "LedgerType":"creditorganization","COA":""}, {"LedgergroupUniqueName":"", "LedgerType":"inventorysubcategory", "COA":"EXPENSES"}]'
WHERE ParameterGroupName='Accounting' and ParameterName ='LedgerGroupMapping'
GO
--END:VIKAS: 30th Apr 2020: Update script for LedgerGroupMapping

--START:VIKAS: 6th May 2020: script for inventory consumption integration
-- insert script for mapping details for 'INVDeptConsumedGoods'
	DECLARE @GroupMappingId int
	SET @GroupMappingId  = (select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVDeptConsumedGoods')
	
	-- DR:1
	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr],[Description]) 
	VALUES (@GroupMappingId,null,1,'INVConsumptionParent')

	-- CR:0
	INSERT INTO ACC_MST_MappingDetail([GroupMappingId],[LedgerGroupId],[DrCr],[Description]) 
	VALUES (@GroupMappingId,(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Merchandise Inventory'),0,'INVConsumptionInventoryLG')	

-----------------------------------------------------------
-- insert script for hospital transfer rules for 'INVDeptConsumedGoods'

	DECLARE @HospitalId int, @TransferRuleId int
	SET @HospitalId = (select HospitalId from ACC_MST_Hospital where HospitalShortName='CHARAK')
	SET @TransferRuleId = (select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVDeptConsumedGoods')
	INSERT INTO ACC_MST_Hospital_TransferRules_Mapping ([HospitalId],[TransferRuleId],[IsActive])
		VALUES (@HospitalId,@TransferRuleId,1)
	GO
-----------------------------------------------------------
 --Vikas: added column into ward inventory consumption table
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
				WHERE Name = N'IsTransferToAcc'
				AND Object_ID = Object_ID(N'dbo.WARD_INV_Consumption'))
	BEGIN
		Alter Table WARD_INV_Consumption
		ADD IsTransferToAcc BIT NULL
	END
	GO
-----------------------------------------------------------
	--Vikas: update script for inventory consumption integration
	ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]
			@FromDate DATETIME=null ,
			@ToDate DATETIME=null
		AS
		--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @FromDate = '2019-07-05 12:07:31.170', @ToDate ='2020-07-05 12:07:31.170'

		/************************************************************************
		FileName: [SP_ACC_GetInventoryTransactions]
		CreatedBy/date: Ajay/05Jul'19
		Description: getting records of inventory transactions for accounting
		Change History
		-------------------------------------------------------------------------
		S.No.    UpdatedBy/Date                        Remarks
		-------------------------------------------------------------------------
		1       Ajay/05Jul'19						created the script
		*************************************************************************/
		BEGIN
			IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
			BEGIN

				SELECT 
					gr.CreatedOn,
					v.VendorName,
					gr.VendorId,
					 gr.PaymentMode,
					 itm.ItemCategoryId,
					 itm.ItemType,
					 itm.ItemName,
					 gr.TDSAmount,
					 gr.BillNo,									-- 26 March 2020:Vikas: added for invetory integration, mapping with accounting as per charak requirements.
					 gr.GoodsReceiptID,							-- 30 march 2020:Vikas: added GoodsReceiptID column
					 gritm.*
				FROM
					INV_TXN_GoodsReceipt gr 
					join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
					join INV_MST_Item itm on gritm.ItemId = itm.ItemId
				WHERE
					(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
					AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table1: GoodReceipt
				--SELECT 
				--	gr.* ,
				--	v.VendorName
				--FROM
				--	INV_TXN_GoodsReceipt gr 
				--	JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
				--WHERE
				--	(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
				--	AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
					AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
					AND (CONVERT(DATE, st.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			
			 -- Table 5 :INVDeptConsumedGoods
			
					SELECT 
						csm.ConsumptionId,
						sb.SubCategoryId,
						sb.SubCategoryName,   
						csm.CreatedOn,
						csm.Quantity,
						stk.MRP
					FROM WARD_INV_Consumption csm
						join INV_MST_Item itm on csm.ItemId= itm.ItemId
						join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId
						join WARD_INV_Stock stk on itm.ItemId= stk.ItemId
					WHERE (csm.IsTransferToAcc IS NULL OR csm.IsTransferToAcc=0)  
						AND CONVERT(DATE, csm.CreatedOn) BETWEEN   CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate)

  			END
			ELSE
			BEGIN
				--Table1: GoodReceipt
				SELECT 
					gr.* ,
					v.VendorName
				FROM
					INV_TXN_GoodsReceipt gr 
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
				WHERE
					(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (TransactionType IN ('dispatch', 'Sent From WardSupply')) 
				-- Table 5 :INVDeptConsumedGoods
				
				SELECT 
					csm.ConsumptionId,
					sb.SubCategoryId,
					sb.SubCategoryName,   
					csm.CreatedOn,
					csm.Quantity,
					stk.MRP
				FROM WARD_INV_Consumption csm
					join INV_MST_Item itm on csm.ItemId= itm.ItemId
					join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId
					join WARD_INV_Stock stk on itm.ItemId= stk.ItemId
				WHERE (csm.IsTransferToAcc IS NULL OR csm.IsTransferToAcc=0)  
				END
		END
    GO

-----------------------------------------------------------
-- Vikas: update script for inventory consumption integration
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

		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'INVDeptConsumedGoods')
		BEGIN
		EXECUTE ('UPDATE WARD_INV_Consumption SET IsTransferToAcc = 1 WHERE ConsumptionId IN (' + @ReferenceIds + ')')
		END
		--------------------------updates billing txn transferred records---------------

		--IF (@ReferenceIds IS NOT NULL
		--  AND @TransactionType = 'BillingRecords')
		--BEGIN
		--  EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = 1 WHERE BillingAccountingSyncId IN (' + @ReferenceIds + ')')
		--END

		-- 1
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END

		-- 2
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 3
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillPaid')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransaction SET IsCreditBillPaidSync = 1 WHERE BillingTransactionId IN (' + @ReferenceIds + ')')
		END	

		-- 4
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillReturnSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 5
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillReturnSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 6
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositAdd')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = 1 WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 7
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = 1 WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 8
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashDiscount')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Settlements SET IsCashDiscountSync = 1 WHERE SettlementId IN (' + @ReferenceIds + ')')
		END
	
		--------------------------updates incetive txn transferred records---------------
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'ConsultantIncentive')
		BEGIN
		EXECUTE ('UPDATE INCTV_TXN_IncentiveFractionItem SET IsTransferToAcc = 1 WHERE InctvTxnItemId IN (' + @ReferenceIds + ')')
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

		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'INVDeptConsumedGoods')
		BEGIN
		EXECUTE ('UPDATE WARD_INV_Consumption SET IsTransferToAcc = NULL WHERE ConsumptionId IN (' + @ReferenceIds + ')')
		END
		--------------------------updates billing txn transferred records---------------

		--IF (@ReferenceIds IS NOT NULL
		--  AND @TransactionType = 'BillingRecords' AND @TransactionDate is not null)
		--BEGIN
		--  EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = NULL WHERE ReferenceId IN (' + @ReferenceIds + ') and  convert(date,TransactionDate) = convert(date,'+''''+ @TransactionDate +''''+')') 
		--END
	
		-- 1
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END

		-- 2
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 3
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillPaid')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransaction SET IsCreditBillPaidSync = NULL WHERE BillingTransactionId IN (' + @ReferenceIds + ')')
		END	

		-- 4
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillReturnSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 5
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillReturnSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 6
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositAdd')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = NULL WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 7
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = NULL WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 8
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashDiscount')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Settlements SET IsCashDiscountSync = NULL WHERE SettlementId IN (' + @ReferenceIds + ')')
		END

		--------------------------updates incetive txn transferred records---------------
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'ConsultantIncentive')
		BEGIN
		EXECUTE ('UPDATE INCTV_TXN_IncentiveFractionItem SET IsTransferToAcc = NULL WHERE InctvTxnItemId IN (' + @ReferenceIds + ')')
		END

		END
		END
GO

--END:VIKAS: 6th May 2020: script for inventory consumption integration
--START:VIKAS: 7th May:2020: added cretedby coloumn for incentive payment receipt.
/****** Object:  StoredProcedure [dbo].[SP_Report_INCTV_DoctorPayment]    Script Date: 07-05-2020 16:06:27 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/*-- Author: Pratik/31March'20
-- Description:	To get Incentive payment reports at doctor level for given date range
--Change History:
----------------------------------------------------------------
S.No.  Author/Date                   Remarks
----------------------------------------------------------------
1.    Pratik/31March'20              Initial Draft
2.	  Ashish/29April'20				add two clm Voucher no. & remarks for get in report.
----------------------------------------------------------------

*/
ALTER PROCEDURE [dbo].[SP_Report_INCTV_DoctorPayment] --EXEC SP_Report_INCTV_DoctorPayment '2019-07-20','2020-3-31'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
BEGIN
  SELECT Convert(Date,PaymentDate) 'PaymentDate',
  emp.FullName 'ReceiverName',payinfo.ReceiverId,PaymentInfoId,
  ISNULL(payinfo.TotalAmount,0) 'TotalAmount',
  ISNULL(payinfo.TDSAmount,0) 'TDSAmount',
  ISNULL(payinfo.NetPayAmount,0) 'NetPayAmount',
  ISNULL(payinfo.AdjustedAmount,0) 'AdjustedAmount',
  ISNULL(payinfo.VoucherNumber,0) 'VoucherNumber',
  ISNULL(payinfo.Remarks,0) 'Remarks',
  (select FullName from EMP_Employee where EmployeeId=payinfo.CreatedBy) as 'CreatedBy'
  from
  INCTV_TXN_PaymentInfo payinfo
  join EMP_Employee emp
  on emp.EmployeeId=payinfo.ReceiverId

  WHERE Isnull(payinfo.IsActive,0)=1
	    AND Convert(Date,payinfo.PaymentDate) Between @FromDate AND @ToDate  

END
GO
--END:VIKAS: 7th May:2020: added cretedby coloumn for incentive payment receipt.

---END: NageshBB: 08 May 2020: Merged ACc Script to DEV:   ----------------

---START: Anish: 8th May, 2020 ----create permission
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Reports' and ApplicationCode='RPT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('reports-inpatient-census',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT;
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='reports-inpatient-census');

declare @RefParentRouteId INT;
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Reports/AdmissionMain');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Inpatient Census Report', 'Reports/AdmissionMain/InpatientCensusReport','InpatientCensusReport',@PermissionId,@RefParentRouteId,1,20,1);
GO

UPDATE CORE_CFG_LookUps 
SET LookupDataJson='["Escherichia coli","Staphylococcus aureus","Salmonella species","Shigella species","Klebsiella species","Proteus species"]' 
WHERE LookUpName='Isolated-Organism'
GO

---END: Anish: 8th May, 2020 ----create permission


---START: Nagesh/Sud : 08th May 2020, Billing to Accounting Card payament mode issue

------Start: SP for Billing data for account transfer---------

/****** Object:  StoredProcedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]    Script Date: 2020-05-08 6:39:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER Procedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]
  @TransactionDate DATE
AS

/**************************************************
Stored Procedure Name:SP_ACC_Bill_GetBillingDataForAccTransfer
Details:
-This stored procedure will get billing module data for transfer to accounting by date
-We are getting billing records, deposit records, etc
	
 Change History:
 ----------------------------------------------------------------------------------
 S.No.   Author					Date               Remarks
 ----------------------------------------------------------------------------------
 1.      NageshBB & Sud sir		16/03/2020        Stored procedure created
 2.     Nagesh/Sud               8May'20          Paymentmode=card handled in billingtransaction
 ----------------------------------------------------------------------------------

**********************************************/
BEGIN

  IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
  BEGIN
  
  SELECT * from BIL_SYNC_BillingAccounting 
  WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @TransactionDate) AND CONVERT(date, @TransactionDate)
  END
  ELSE
  BEGIN    
 --Note:-BillingAccountingSyncId added for temporary pupose because code mapping model has this column , later we need to remove this 
------Cash Bill----------CashBill->BIL_TXN_BillingTransactionItems->BillingTransactionItemId  (TransactionType->TableName->ReferenceId Column Name)
			 Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBill' TransactionType,
			  'cash' As PaymentMode, 
			 --txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 itm.PaidDate 'TransactionDate',
			 GetDate() 'CreatedOn',
			 itm.PaymentReceivedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.PaidDate) = @TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			  --- sud/nagesh:8may'20-- below case should be separated for card and cheque after requirement comes for this..
			 and ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')
			 AND ISNULL(itm.IsCashBillSync,0) = 0  -- Include only Not-Synced Data for CashBill Case--
			
			
			
			UNION ALL
			
---------Credit Bill----------------------------------------------CreditBill-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBill' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 txn.CreatedOn 'TransactionDate', -- this is credit date.. 
			 GetDate() 'CreatedOn',
			 itm.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.CreatedOn)=@TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillSync,0) = 0  -- Include only Not-Synced Data for CreditBill Case--
					

			UNION ALL
			
-----------------Credit Bill Paid-----CreditBillPaid-BillingTransactionId-BIL_TXN_BillingTransaction
		--for now we are commenting this function, later we will get creditbill paid records
			--Select 
			-- txn.BillingTransactionId as BillingAccountingSyncId,
			-- txn.BillingTransactionId AS 'ReferenceId',
			-- 'CreditBillPaid' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it, we might need CreditOrganization's LEdger here.. 
			--  sett.PatientId,
			-- 'CreditBillPaid' TransactionType,
			--  sett.PaymentMode As PaymentMode, 
			-- NULL SubTotal,
			-- 0 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- txn.TotalAmount AS TotalAmount,
			
			-- 0 AS IsTransferedToAcc,
			-- SettlementDate 'TransactionDate', -- this is credit date.. 
			-- GetDate() 'CreatedOn',
			-- sett.CreatedBy AS CreatedBy,
			-- NULL AS SettlementDiscountAmount,  -- Can't take this here, it'll go separately into Cash Discount LEdger.. 
			-- NULL AS Remark,
			-- txn.OrganizationId AS CreditOrganizationId   -- correct it after Settlement is separated for CreditOrginizations.
			--from BIL_TXN_Settlements sett, BIL_TXN_BillingTransaction txn
			
			--Where 
			--     sett.SettlementId = txn.SettlementId
			--   AND Convert(Date,SettlementDate)=@TransactionDate
			--   AND ISNULL(txn.IsCreditBillPaidSync,0) = 0  -- Include only Not-Synced Data for Credit Paid Case--
			
			--UNION ALL
			
-----------------------Cash Bill Return---CashBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate--sud-19March this should've been createdon of return table..
			 and ISNULL(itm.ReturnStatus,0) != 0  
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='cash'
			 AND ISNULL(itm.IsCashBillReturnSync,0) = 0  -- Include only Not-Synced Data for CashBill Return Case--
			
			UNION ALL
			
------------CreditBillReturn--- done with join from Transaction, TransactionItem and InvoiceReturn Table--CreditBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			   txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate
			 and ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  -- Include only Not-Synced Data for Credit Return Case--
			
			 UNION ALL
			
------------------Deposit Add---DepositAdd-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositAdd' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType ='Deposit'
			AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			UNION ALL
			
-------Deposit Return/Deduct---DepositReturn-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositReturn' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType IN ('ReturnDeposit', 'depositdeduct')
			 AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			
			--UNION ALL
			
---------Cash discount -- from settlement-- New new Transfer rule for this---CashDiscount-SettlementId-BIL_TXN_Settlements
			--Select 
			--SettlementId as BillingAccountingSyncId,
			-- SettlementId 'ReferenceId',
			-- 'CashDiscount' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it
			--  PatientId,
			-- 'CashDiscount' TransactionType,
			-- PaymentMode As PaymentMode, 
			-- NULL AS SubTotal,
			-- NULL AS 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- DiscountAmount AS TotalAmount,    -- use this column if possible
			-- 0 AS IsTransferedToAcc,
			-- CreatedOn 'TransactionDate',
			-- GetDate() 'CreatedOn',
			-- CreatedBy AS CreatedBy,
			-- DiscountAmount AS SettlementDiscountAmount,  -- don't use this column if possible.
			-- NULL AS Remark,
			-- NULL AS CreditOrganizationId  
			--from BIL_TXN_Settlements
			
			--Where 
			--  Convert(Date,CreatedOn)=@TransactionDate
			--  AND ISNULL(DiscountAmount,0) != 0  -- exclude zero discount, since it's not needed.
			--  AND ISNULL(IsCashDiscountSync,0) = 0  -- Include only Not-Synced Data	
  END			  					
END
GO

------End: SP for Billing data for account transfer---------
---END: Nagesh/Sud : 08th May 2020, Billing to Accounting Card payament mode issue

--START: Sanjit -- 11 May'20 : Adding Core CFG Parameter for Item Received Feature in Substore
	INSERT INTO CORE_CFG_Parameters
	(ParameterGroupName,ParameterName,ParameterType,ParameterValue,ValueDataType,Description,ValueLookUpList)
	VALUES
	('Inventory','EnableReceivedItemInSubstore','custom','false','boolean',
	'If this parameter is false, then substore stock will increase as soon as inventory stock is deducted (after dispatch). 
	If the parameter is true, item receive button will be enabled. User will have to manually receive the stock.',null);
GO

	ALTER TABLE INV_TXN_DispatchItems
	ADD ReceivedById int null, ReceivedOn datetime null, ReceivedRemarks varchar(400);
GO
--END: Sanjit -- 11 May'20 : Adding Core CFG Parameter for Item Received Feature in Substore

--START: Anish -- 13th May 2020: Culture result group --LabEnhancement

IF NOT EXISTS (
  SELECT
    *
  FROM
    INFORMATION_SCHEMA.COLUMNS
  WHERE
    TABLE_NAME = 'LAB_TXN_TestComponentResult' AND COLUMN_NAME = 'ResultGroup')
BEGIN
  Alter table LAB_TXN_TestComponentResult
	Add ResultGroup int null;
END
GO


UPDATE LAB_TXN_TestComponentResult
SET ResultGroup=1
GO

--END: Anish -- 13th May 2020: Culture result group --LabEnhancement

--Start: Pratik :4 May,2020 --partialClearence in ipbilling
GO
ALTER TABLE BIL_TXN_BillingTransaction
ADD InvoiceType varchar(50);

GO
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
values('Billing','EnablePartialClearanceInIpBilling','false','boolean','Show/Hide the partial Clearance button in inpatient billing','custom',null);
GO
--End: Pratik :4 May,2020 --partialClearence in ipbilling

--Start: Anjana:13 May,2020 Add the Patient ShortName field in the Patient table
Alter table PAT_Patient
Add ShortName varchar(100)
GO

UPDATE PAT_Patient 
SET ShortName = Concat(FirstName +' ',+ Coalesce(MiddleName+' ', ' '), + LastName) 
WHERE ShortName is null; 
GO
--End: Anjana:13 May,2020 Add the Patient ShortName field in the Patient table

--START: SANJIT: 14 May'20 --Data Correction to correctly implement Receive Item feature in Substore
UPDATE INV_TXN_DispatchItems
SET ReceivedById = (Select TOP(1) R.CreatedBy
					FROM INV_TXN_Requisition R
					WHERE R.RequisitionId = RequisitionId ),
	ReceivedOn = CreatedOn,
	ReceivedRemarks = 'Past Data correction by Imark'
WHERE ReceivedById is null;
GO
--END: SANJIT: 14 May'20 --Data Correction to correctly implement Receive Item feature in Substore

--START: SUD: 15May'20--- for Charak---
 
IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where ParameterGroupName='Billing' and ParameterName='UseItemCodeInItemSearch')
BEGIN
INSERT INTO [CORE_CFG_Parameters] (
	ParameterGroupName
	,ParameterName
	,ParameterValue
	,ValueDataType
	,Description
	,ParameterType
	)
values('Billing','UseItemCodeInItemSearch','false','boolean','True/False. whether or not to enable itemsearch by itemcode, Itemcode is not given by many hospital, so default value will be false, whenever its false we are showing BillItemPriceId.','custom');

END
GO


/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_TotalAdmittedPatient]    Script Date: 2020-05-09 8:33:11 AM ******/
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
10.    Sud:9May'20                            Admitted should show all the admitted in the date range.
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
          
        where 
		--ad.AdmissionStatus='admitted'  and 
		
		CONVERT(date,ad.AdmissionDate) between @FromDate and @ToDate
    ) A
    where A.RowNum=1 ---take only latest bed..
    ORDER by SN 
  END  
END
GO

---permissionname correction--
Update RBAC_Permission
SET PermissionName='reports-admission-inpatient-census'
where PermissionName='reports-inpatient-census'
GO

--END: SUD: 15May'20--- for Charak---

---START: Pratik: 19th May, 2020 ----Create table for Employee Bill Item and Item Group Distribution
CREATE TABLE [dbo].[INCTV_MAP_EmployeeBillItemsMap](
[EmployeeBillItemsMapId] [int] IDENTITY(1,1) CONSTRAINT PK_INCTV_MAP_EmployeeBillItemsMap PRIMARY KEY NOT NULL,
[EmployeeId] [int] NULL CONSTRAINT FK_INCTV_BillItems_Employee_Map_EMP_EMployee FOREIGN KEY REFERENCES EMP_Employee(EmployeeId),
[BillItemPriceId] [int] NULL 
CONSTRAINT FK_INCTV_BillItems_Employee_Map_BIL_CFG_BillItemPrice FOREIGN KEY REFERENCES BIL_CFG_BillItemPrice(BillItemPriceId),
[AssignedToPercent] [float] NULL,
[ReferredByPercent] [float] NULL,
[PriceCategoryId] [int] NULL,
HasGroupDistribution BIT NULL-- if true then there should be something in the group distribution row.CreatedBy INT,CreatedOn DateTime,IsActive BIT
)
GO

-----------
CREATE TABLE [dbo].[INCTV_CFG_ItemGroupDistribution](
 [ItemGroupDistributionId] [int] IDENTITY(1,1) NOT NULL,
 IncentiveType varchar(30), -- default=assigned; for now we need it only for assigned, later if referral is also needed then we have to do accordingly.
 [BillItemPriceId] [int] NULL,
 EmployeeBillItemsMapId INT NULL,
 FromEmployeeId INT NULL,-- this is assigned or referral doctor, this is needed here in order to reduce the db joins
 DistributeToEmployeeId INT NULL,
 DistributionPercent Float NULL,
 FixedDistributionAmount Float NULL,-- This field is kept for further extension in the Scenarios where amount should be fixed before dividing.
 IsFixedAmount BIT NULL,-- If fixed amount then we have to make changes accordingly.
 DisplaySeq [int] NULL,-- to show the secondary employees in sequence in the frontend.
 Remarks varchar NULL,
 CreatedBy INT NULL,
 CreatedOn INT NULL,
 IsActive [bit] NULL,
 CONSTRAINT [PK_INCTV_CFG_ItemGroupDistribution] PRIMARY KEY CLUSTERED([ItemGroupDistributionId] ASC)
 WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON 
 [PRIMARY]) ON [PRIMARY]

GO

---END: Pratik: 19th May, 2020 ----Create table for Employee Bill Item and Item Group Distribution

-- START: Vikas: 22th May 2020: update script for old db records in ACC_Transactions table.
update ACC_Transactions
set IsGroupTxn=0 where SectionId=4
Go
update ACC_Transactions
set IsEditable=1 where SectionId=4
Go
-- END: Vikas: 22th May 2020: update script for old db records in ACC_Transactions table.

--START: Sanjit 19May'20 changed text in terms from text type to varchar. as sql has warned for text type to be depricated.
BEGIN TRANSACTION TRAN1
	ALTER TABLE dbo.INV_MST_Terms
		DROP CONSTRAINT DF_INV_MST_Terms_IsActive
	GO
	CREATE TABLE dbo.Tmp_INV_MST_Terms
		(
		TermsId int NOT NULL IDENTITY (1, 1),
		Text varchar(500) NOT NULL,
		Type varchar(50) NOT NULL,
		OrderBy int NULL,
		IsActive bit NOT NULL,
		CreatedBy int NOT NULL,
		CreatedOn datetime NOT NULL,
		ShortName varchar(50) NOT NULL
		)  ON [PRIMARY]
	GO
	ALTER TABLE dbo.Tmp_INV_MST_Terms SET (LOCK_ESCALATION = TABLE)
	GO
	ALTER TABLE dbo.Tmp_INV_MST_Terms ADD CONSTRAINT
		DF_INV_MST_Terms_IsActive DEFAULT ((1)) FOR IsActive
	GO
	SET IDENTITY_INSERT dbo.Tmp_INV_MST_Terms ON
	GO
	IF EXISTS(SELECT * FROM dbo.INV_MST_Terms)
		 EXEC('INSERT INTO dbo.Tmp_INV_MST_Terms (TermsId, Text, Type, OrderBy, IsActive, CreatedBy, CreatedOn, ShortName)
			SELECT TermsId, CONVERT(varchar(500), Text), Type, OrderBy, IsActive, CreatedBy, CreatedOn, ShortName FROM dbo.INV_MST_Terms WITH (HOLDLOCK TABLOCKX)')
	GO
	SET IDENTITY_INSERT dbo.Tmp_INV_MST_Terms OFF
	GO
	DROP TABLE dbo.INV_MST_Terms
	GO
	EXECUTE sp_rename N'dbo.Tmp_INV_MST_Terms', N'INV_MST_Terms', 'OBJECT' 
	GO
	ALTER TABLE dbo.INV_MST_Terms ADD CONSTRAINT
		PK_INV_MST_Terms PRIMARY KEY CLUSTERED 
		(
		TermsId
		) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

	GO
	ALTER TABLE dbo.INV_MST_Terms ADD CONSTRAINT
		FK_INV_MST_Terms_EMP_Employee FOREIGN KEY
		(
		TermsId
		) REFERENCES dbo.EMP_Employee
		(
		EmployeeId
		) ON UPDATE  NO ACTION 
		 ON DELETE  NO ACTION 
	
	GO
COMMIT TRANSACTION TRAN1
GO
--END: Sanjit 19May'20 changed text in terms from text type to varchar. as sql has warned for text type to be depricated.\

--START: Sanjit 19May'20 TermsApplicationId added to segragate terms based on modules
ALTER TABLE INV_MST_Terms
	ADD TermsApplicationEnumId int;
GO

UPDATE INV_MST_TERMS
	SET TermsApplicationEnumId = 1;
GO
--END: Sanjit 19May'20 TermsApplicationId added to segragate terms based on modules

--START: Sanjit 19May'20 Added TermsId in Purchase Order in order to display.
ALTER TABLE PHRM_PurchaseOrder
	Add TermsId int;
GO
--END: Sanjit 19May'20 Added TermsId in Purchase Order in order to display.


--START: Sanjit 22May'20 Date corrected in ward transaction report
GO
/****** Object:  StoredProcedure [dbo].[SP_WardReport_TransferReport]    Script Date: 5/22/2020 12:03:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardReport_TransferReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null,
	@StoreId int = null
	--@Status int = null					--Ward to Ward report is shown in case of 1 and Ward to Pharmacy report in case of 0	
AS
/*
FileName: [SP_WardReport_TransferReport] '1/7/2020','1/8/2020',13
CreatedBy/date: Rusha/03-26-2019
Description: To get the Details of report of Ward to Ward Tranfer and Ward to Pharmacy Trannsfer of stock 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-29-2019						shows report of Ward to ward transfer and ward to pharmacy transfer
2.		Sanjit/01-09-2020						added Received by field in both transfer cases.
3.		Sanjit/05-22-2020						corrected Date format
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
		--if (@Status = 1)
			--select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty, Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' from WARD_Transaction as transc
			--join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			--where TransactionType = 'WardtoWard' and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			--group by itm.ItemName, transc.Quantity,transc.Remarks, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
		
		--else if (@Status =0)
			(select convert(varchar,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,transc.Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' 
			from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			where transc.StoreId = @StoreId and TransactionType = 'WardToPharmacy' and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks,transc.CreatedOn,transc.CreatedBy,transc.ReceivedBy
			)

		--else
			--select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty, Remarks,transc.CreatedBy as 'TransferedBy',transc.ReceivedBy as 'ReceivedBy' from WARD_Transaction as transc
			--join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			--where TransactionType in ('WardToPharmacy','WardtoWard') and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			--group by itm.ItemName, transc.Quantity,transc.Remarks, convert(date,transc.CreatedOn),transc.CreatedBy,transc.ReceivedBy
		END	
END
GO
--END: Sanjit 22May'20 Date corrected in ward transaction report


--START: Sanjit 15May'20: Creating permission for all the exisitin ward 
INSERT INTO RBAC_Application
(ApplicationCode,ApplicationName,CreatedBy,CreatedOn,IsActive)
VALUES
('ADTWARD','ADT Wards',1,GETDATE(),1);
GO
DECLARE @ApplicationId int;
SET @ApplicationId = (SELECT TOP(1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'ADTWARD' and ApplicationName = 'ADT Wards');

	INSERT INTO RBAC_Permission
	(ApplicationId,PermissionName,Description,CreatedBy,CreatedOn,IsActive)

	SELECT @ApplicationId,'ward-'+ WardName,'auto-generated permission for existing wards from IMARK',1,GETDATE(),1
	FROM ADT_MST_Ward
GO
--END: Sanjit: 15May'20 Creating permission for all the exisitin ward 

--START: Sanjit: 15May'20 Added unique constraint for both ward name and ward code in ward master table
	ALTER TABLE ADT_MST_Ward
	ADD CONSTRAINT UC_WardName UNIQUE (WardName), CONSTRAINT UC_WardCode UNIQUE(WardCode);
GO
--END: Sanjit: 15May'20 Added unique constraint for both ward name and ward code in ward master table--

---Anish: 15 May, 2020, doctor Increamental after merged to Nursing---
---Start: Bikash: 15 May 2020: tables altered for er-note and hp-note

-- data type of follow up field changed to int
ALTER TABLE [CLN_Notes]
ALTER COLUMN FollowUp int null;
GO

-- new field followUpUnit added in notes table
ALTER TABLE CLN_Notes
ADD FollowUpUnit varchar(50);
GO

-- new field IsActive added in diagnosis table
ALTER TABLE CLN_Diagnosis
ADD IsActive bit;
GO

-- new field add for er-course-description
ALTER TABLE [CLN_Notes_Emergency]
ADD	[ErCourseDescription] [varchar] (800) NULL;
GO

---End: Bikash: 15 May 2020: tables altered for er-note and hp-note---
--End:Anish: 15 May, 2020 doctor Increamental after merged to Nursing---

--Anish: 18 MAy, 2020 new routes Added----
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-patientoverview-main-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-patientoverview-main-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Patient Overview', 'Nursing/PatientOverviewMain','PatientOverviewMain',@PermissionId,@RefParentRouteId,0,5,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-patientoverview-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-patientoverview-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Patient Overview', 'Nursing/PatientOverviewMain/PatientOverview','PatientOverview',@PermissionId,@RefParentRouteId,1,10,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-labreports-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-labreports-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Lab Reports', 'Nursing/PatientOverviewMain/LabReports','LabReports',@PermissionId,@RefParentRouteId,1,25,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-radiologyreports-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-radiologyreports-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Radiology Reports', 'Nursing/PatientOverviewMain/RadiologyReports','RadiologyReports',@PermissionId,@RefParentRouteId,1,30,1);
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-clinical-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-clinical-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Clinical', 'Nursing/PatientOverviewMain/Clinical','Clinical',@PermissionId,@RefParentRouteId,1,35,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-ward-request-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-ward-request-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Ward Request', 'Nursing/PatientOverviewMain/WardBilling','WardBilling',@PermissionId,@RefParentRouteId,1,40,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-drug-request-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-drug-request-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Drugs Request', 'Nursing/PatientOverviewMain/DrugsRequest','DrugsRequest',@PermissionId,@RefParentRouteId,1,45,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-transfer-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-transfer-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Transfer', 'Nursing/PatientOverviewMain/Transfer','Transfer',@PermissionId,@RefParentRouteId,1,60,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-notes-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-notes-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Notes', 'Nursing/PatientOverviewMain/Notes','Notes',@PermissionId,@RefParentRouteId,1,55,1);
GO
--Anish: 18 May, 2020 new routes Added-----

---Anish: Start: 18 May, 2020 Updated the Existing Query with new routes for clinical child---
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-clinical-vitals-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain/Clinical');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-clinical-vitals-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Vitals', 'Nursing/PatientOverviewMain/Clinical/Vitals','Vitals',@PermissionId,@RefParentRouteId,1,30,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-clinical-allergy-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain/Clinical');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-clinical-allergy-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Allergy', 'Nursing/PatientOverviewMain/Clinical/Allergy','Allergy',@PermissionId,@RefParentRouteId,1,35,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-clinical-inputoutput-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain/Clinical');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-clinical-inputoutput-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Input/Output', 'Nursing/PatientOverviewMain/Clinical/InputOutput','InputOutput',@PermissionId,@RefParentRouteId,1,40,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-clinical-homemedication-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain/Clinical');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-clinical-homemedication-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Medication', 'Nursing/PatientOverviewMain/Clinical/HomeMedication','HomeMedication',@PermissionId,@RefParentRouteId,1,45,1);
GO


declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-ip-summary-view');
Update RBAC_RouteConfig set PermissionId=@PermissionId where UrlFullPath='Nursing/PatientOverviewMain'
GO
delete from RBAC_Permission where PermissionName='nursing-patientoverview-main-view'
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-ip-wardbilling-view');
Update RBAC_RouteConfig set PermissionId=@PermissionId where UrlFullPath='Nursing/PatientOverviewMain/WardBilling'
GO
delete from RBAC_Permission where PermissionName='nursing-ward-request-view'
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-ip-clinical-view');
Update RBAC_RouteConfig set PermissionId=@PermissionId where UrlFullPath='Nursing/PatientOverviewMain/Clinical'
GO
delete from RBAC_Permission where PermissionName='nursing-clinical-view'
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-ip-drugrequest-view');
Update RBAC_RouteConfig set PermissionId=@PermissionId where UrlFullPath='Nursing/PatientOverviewMain/DrugsRequest'
GO
delete from RBAC_Permission where PermissionName='nursing-drug-request-view'
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-receive-transferred-patient',@ApplicationId,1,GETDATE(),1);
GO
---Anish: End: 18 May, 2020, with new routes for clinical child---


--Start: pratik: 19May 2020, 

ALTER TABLE ADT_TXN_PatientBedInfo
ADD OutAction varchar(20),
    ReceivedBy int,
    ReceivedOn DateTime;
GO
--Start: pratik: 19May 2020, 

--Anish: Start: 19 May, New field for Reservation for workflow of Receive in Nursing--
Insert Into CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue, ValueDataType,Description,ParameterType) 
values('ADT','ReservePreviousBedDuringTransferFromNursing','false','boolean','Reserve the current bed when transferred to another from Nursing','custom'),
('Nursing','EnablePatientReceiveFeatureFromNursing','false','boolean',
'Refers to Adding the Patient Received Note while the transferred patient is received in from another ward','custom'),
('Nursing','AutoCancellationOfTransferReserveInHrs','6','string','Set the hours after which the Bed Reservation during the transfer is auto cancelled','custom')
Go
Alter table ADT_Bed
Add OnHold bit null;
Go
--Anish: End: 19 May, New field for Reservation for workflow of Receive in Nursing--



-----Start Anjana May-19-2020 Added new Route to Radiology Module---------
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'Radiology' and ApplicationCode='RAD');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) 
values ('radiology-editdoctor-view', @ApplicationId, 1, GETDATE(),1);
GO

declare @RefParentRouteId INT 
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Radiology');

declare @PermissionId INT 
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='radiology-editdoctor-view');

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive) 
values('Edit Doctors','Radiology/EditDoctors','EditDoctors',@PermissionId,@RefParentRouteId,1,NULL,1);
GO

-----End Anjana May-19-2020 Added new Route to Radiology Module---------

--Anish: Start: 20 May---
Alter table ADT_Bed
Add HoldedOn DateTime null;
Go
--Anish: End: 20 May---


--Start: Sanjit: 20th May,2020 Change the urlfullpath of inpatient list in nursing to support activate ward page
	UPDATE RBAC_RouteConfig
	SET UrlFullPath = 'Nursing/InPatient/ActivateWard'
	WHERE DisplayName = 'In Patient' and UrlFullPath = 'Nursing/InPatient' and RouterLink = 'InPatient';
	GO
--END: Sanjit: 20th May,2020 Change the urlfullpath of inpatient list in nursing to support activate ward page

--Bikash: 20 may 2020: note type and note template table altered
-- IsActive field added in NoteType table
ALTER TABLE CLN_MST_NoteType
ADD IsActive bit Null;
GO

-- IsActive field added in Note Template table
ALTER TABLE CLN_Template
ADD IsActive bit Null;
GO

-- value of IsActive update as active in Note Type table
UPDATE CLN_MST_NoteType
SET IsActive = 1;
Go

-- value of IsActive update as active in Note Template table
UPDATE CLN_Template
SET IsActive = 1;
Go

-- New Note type added
INSERT INTO CLN_MST_NoteType (NoteType,CreatedBy,CreatedOn,IsActive) 
VALUES('Receive Note',1,GETDATE(),0);
GO
--Bikash: 20 may 2020: note type and note template table altered


----Start: Anjana: May 21, 2020: Added BloodGroup field to EMP_Employee table
Alter table EMP_Employee
Add BloodGroup varchar(20)
Go
-----END: Anjana - May 21, 2020: Added BloodGroup field to EMP_Employee table


--Anish: Start: 21 May, ModifiedBy and ModifiedOn addted in PatientBedInfo Table----
Alter table ADT_TXN_PatientBedInfo
Add ModifiedBy int null, ModifiedOn DateTime null;
Go
--Anish: End: 21 May, ModifiedBy and ModifiedOn addted in PatientBedInfo Table----

--Anish: Start: 21 May, BedOnHoldEnabled added and parameter Updated in PatientBedInfo Table----
Alter table ADT_TXN_PatientBedInfo
Add BedOnHoldEnabled bit null
Go

delete from CORE_CFG_Parameters where ParameterName='EnablePatientReceiveFeatureFromNursing';
Update CORE_CFG_Parameters set ParameterGroupName='Nursing' where ParameterName='ReservePreviousBedDuringTransferFromNursing';
Update CORE_CFG_Parameters set ParameterName='AutoCancellationOfTransferReserveInMins',ValueDataType='number',ParameterValue='360' ,[Description]='Set the minutes after which the Bed Reservation during the transfer is auto cancelled' 
where ParameterName='AutoCancellationOfTransferReserveInHrs';
Go
--Anish: Start: 21 May, BedOnHoldEnabled added in PatientBedInfo Table----


---Anish: Start: 22 May, Nursing Inpatient Routing Changes---
UPDATE RBAC_RouteConfig
SET UrlFullPath = 'Nursing/InPatient'
WHERE DisplayName = 'In Patient' and UrlFullPath = 'Nursing/InPatient/ActivateWard' and RouterLink = 'InPatient';
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-ip-inpatientlist-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/InPatient');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-ip-inpatientlist-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('In Patient List', 'Nursing/InPatient/InPatientList','InPatientList',@PermissionId,@RefParentRouteId,0,45,1);
GO
---Anish: End: 22 May, Nursing Inpatient Routing Changes---
--ANish: Start 22 MAy, 2020, Permission for Undo of Transfer Patient Added--
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-ip-undo-pending-transfer-patient',@ApplicationId,1,GETDATE(),1);
GO
--ANish: End 22 MAy, 2020, Permission for Undo of Transfer Patient Added--


--Anish: Start 22 May---
Alter table ADT_TXN_PatientBedInfo
Add CancelledBy int null, CancelledOn DateTime null, CancelRemarks nvarchar(600)
Go
--Anish: End 22 May---


-- Start: Bikash, 25th May '20, router-links of RadiologyReports and LabReports set inactive
UPDATE RBAC_RouteConfig
SET IsActive=0
WHERE UrlFullPath = 'Doctors/PatientOverviewMain/RadiologyReports' AND RouterLink='RadiologyReports';
GO

UPDATE RBAC_RouteConfig
SET IsActive=0
WHERE UrlFullPath = 'Nursing/PatientOverviewMain/RadiologyReports' AND RouterLink = 'RadiologyReports';
GO

UPDATE RBAC_RouteConfig
SET IsActive=0
WHERE UrlFullPath = 'Doctors/PatientOverviewMain/LabReports' AND RouterLink = 'LabReports';
GO

UPDATE RBAC_RouteConfig
SET IsActive=0
WHERE UrlFullPath ='Nursing/PatientOverviewMain/LabReports' AND RouterLink = 'LabReports';
GO
-- End: Bikash, 25th May '20, router-links of RadiologyReports and LabReports set inactive

--START: NageshBB: 27 May 2020: Merged accounting to dev branch --
--insert core parameter for show txn item level/voucher level ledger report 
IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where parametergroupname='Accounting' and parametername='ShowLedgerReportTxnItemLevel')
BEGIN
 Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
 values('Accounting','ShowLedgerReportTxnItemLevel','true','boolean','We have 2 option for ledger report 
1- ShowLedgerReportTxnItemLevel value false means here we are showing single record for one voucher number. 
	- we will calculate dr/cr and show balance amount for report
2-ShowLedgerReportTxnItemLevel value true means you need to show each and every record for selected ledger 
ex-
one voucher with ABCBank-Dr-1000 and ABCBank-Cr-250  && ShowLedgerReportTxnItemLevel is false
then show only one record with Dr-Cr=>1000-250=750 Dr amount
if ShowLedgerReportTxnItemLevel is true
show only one record
1000 Dr
250 Cr','custom',null);

END
GO
--END: NageshBB: 27 May 2020 Merged accounting to dev branch --

----START--Anjana, May 26,2020 - Stored Procedure to get billing txn item details for selected integration name(Service Department)
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_BIL_GetBillTxnItemsBetnDateRange_ForDepartment]
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@SearchText varchar(100)=null,
		@SrvDptIntegrationName varchar(50)
AS
/*
FileName: [SP_BIL_GetBillTxnItemsBetnDateRange_ForDepartment]
CreatedBy/date: Anjana/sud/2020-05-26
Description: to get billing txn item details for selected integration name(Service Department)
Remarks:  
   -- Returned Items are Excluded.
   -- Cancelled+adtCancelled Items are Excluded.
   -- If Search Text is Empty then returning all.
   -- If Date is Empty the returning today's tranisaction.
   -- if integrationname is empty then returing all.


Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      Anjana/sud/2020-05-26              Initial Draft
-----------------------------------------------------------------------------------------
*/
BEGIN
 
 
Select 
	txnItem.CreatedOn as 'Date'
	, txnItem.ServiceDepartmentId,
	txnItem.ServiceDepartmentName,
	txnItem.ItemId,
	txnItem.ItemName,
	txnItem.ProviderId,
	txnItem.ProviderName,
	txnItem.BillingTransactionItemId,
	txnItem.BillStatus,
	txnItem.RequestedBy as 'ReferredById',
	txnItem.BillingTransactionId,
	txnItem.RequisitionId,
	bilTxn.InvoiceCode + convert(varchar(20),bilTxn.InvoiceNo) as 'ReceiptNo',
	pat.PatientId,
	pat.ShortName as 'PatientName',
	pat.DateOfBirth,
	pat.Gender,
	pat.PhoneNumber,
	pat.PatientCode,
	cfg.IsDoctorMandatory as 'DoctorMandatory',
	emp.FullName as 'ReferredByName'

from BIL_TXN_BillingTransactionItems txnItem INNER JOIN
     BIL_MST_ServiceDepartment srv  
	    ON srv.ServiceDepartmentId = txnItem.ServiceDepartmentId 
	INNER JOIN PAT_Patient pat
	  ON txnItem.PatientId = pat.PatientId
	INNER JOIN BIL_CFG_BillItemPrice cfg
	 
	     ON txnItem.ServiceDepartmentId = cfg.ServiceDepartmentId and txnItem.ItemId=cfg.ItemId
	LEFT JOIN BIL_TXN_BillingTransaction bilTxn ON txnItem.BillingTransactionId = bilTxn.BillingTransactionId
	LEFT JOIN EMP_Employee emp ON txnItem.RequestedBy = emp.EmployeeId

Where 
ISNULL(srv.IntegrationName, '') like '%' + ISNULL(@SrvDptIntegrationName,'') + '%'
AND txnItem.BillStatus != 'cancel'
AND txnItem.BillStatus != 'adtCancel'
AND ISNULL(txnItem.ReturnStatus,0) != 1   -- Null Handling..  NULL OR 0 => Take this, 1 =>   Don't Take this. 
--REturn Today's data if null.. 
and Convert(Date, txnItem.CreatedOn) between ISNULL(@FromDate,Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(Date, GETDATE()))  

and (pat.ShortName + pat.PatientCode + ISNUll(pat.PhoneNumber, '') + srv.ServiceDepartmentName + txnItem.ItemName) Like  '%'+ISNULL(@SearchText,'')+'%'


ORder by txnItem.Billingtransactionitemid DESC

END
GO

----END--Anjana, May 26,2020 - Stored Procedure to get billing txn item details for selected integration name(Service Department)---

----Start: Shankar 25thMay2020: Added credit organizations features in pharmacy-----
CREATE TABLE [dbo].[PHRM_MST_Credit_Organization](
	[OrganizationId] [int] IDENTITY(1,1) NOT NULL,
	[OrganizationName] [varchar](50) NULL,
	[IsActive] [bit] NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL)
GO

Alter table PHRM_TXN_Invoice
Add OrganizationId int
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('setting-pharmacy-creditOrganizations',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-creditOrganizations')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy/Setting')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId,DefaultShow, IsActive)
values ('Credit Organizations', 'Pharmacy/Setting/CreditOrganizations','CreditOrganizations',@PermissionId,@RefParentRouteId,1,1);
GO
GO

----End: Shankar 25thMay2020: Added credit organizations features in pharmacy------

--START: SANJIT 27th May'20: Added date filter in SP of Supplier Stock Report---
GO
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_SupplierStockReport]    Script Date: 5/27/2020 12:28:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMReport_SupplierStockReport]  
	     @fromDate datetime = null,
		@toDate datetime = null,
		@SupplierName varchar(200) = null
AS
/*
FileName: SP_PHRMReport_SupplierStockReport 5/26/2020,5/26/2020
CreatedBy/date: Rusha/04-07-2019
Description: To get the Details of goods receipt from Supplier such as received qty, rate per qty, and so on
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1        Rusha/04-07-2019	                 To get details of goods receipts from Supplier 
2		 Sanjit/27-05-2020					 added fromDate and toDate in the sp for date filter (EMR-1618)                                         
----------------------------------------------------------------------------
*/

	BEGIN

		IF ( @FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @SupplierName IS NOT NULL )
		BEGIN
			select FORMAT(g.GoodReceiptDate,'yyyy-MM-dd') as GoodReceiptDate, gr.CompanyName,gr.SupplierName, gr.ItemName, gr.ExpiryDate, gr.ReceivedQuantity+gr.FreeQuantity as Quantity, gr.GRItemPrice as PurchaseRate,gr.SubTotal, g.DiscountAmount,g.VATAmount, g.TotalAmount
			from PHRM_GoodsReceiptItems as gr
			join PHRM_GoodsReceipt as g on gr.GoodReceiptId=g.GoodReceiptId
			where CONVERT(datetime,g.GoodReceiptDate) BETWEEN ISNULL(@fromDate,GETDATE()) AND ISNULL(@toDate,GETDATE())+1 AND gr.SupplierName  like '%'+ISNULL(@SupplierName,'')+'%'
			group by gr.CompanyName,gr.SupplierName, gr.ItemName, gr.ExpiryDate, gr.ReceivedQuantity,gr.FreeQuantity, gr.GRItemPrice, gr.TotalAmount,gr.SubTotal,g.DiscountAmount,g.VATAmount, g.TotalAmount,g.GoodReceiptDate

		END
	END
GO
--END: SANJIT 27th May'20: Added date filter in SP of Supplier Stock Report---


---Start: Shankar 27th May 2020: Renamed display name of sub-navbar tabs in pharmacy setting---
update RBAC_RouteConfig
set DisplayName='Supplier'
where RouterLink='SupplierManage' and UrlFullPath='Pharmacy/Setting/SupplierManage'
GO
update RBAC_RouteConfig
set DisplayName='Company'
where RouterLink='CompanyManage' and UrlFullPath='Pharmacy/Setting/CompanyManage'
GO
update RBAC_RouteConfig
set DisplayName='Category'
where RouterLink='CategoryManage' and UrlFullPath='Pharmacy/Setting/CategoryManage'
GO
update RBAC_RouteConfig
set DisplayName='UnitOfMeasurement'
where RouterLink='UnitOfMeasurementManage' and UrlFullPath='Pharmacy/Setting/UnitOfMeasurementManage'
GO
update RBAC_RouteConfig
set DisplayName='ItemType'
where RouterLink='ItemTypeManage' and UrlFullPath='Pharmacy/Setting/ItemTypeManage'
GO
update RBAC_RouteConfig
set DisplayName='Item'
where RouterLink='ItemManage' and UrlFullPath='Pharmacy/Setting/ItemManage'
GO
update RBAC_RouteConfig
set DisplayName='TAX'
where RouterLink='TAXManage' and UrlFullPath='Pharmacy/Setting/TAXManage'
GO
update RBAC_RouteConfig
set DisplayName='Generic'
where RouterLink='GenericManage' and UrlFullPath='Pharmacy/Setting/GenericManage'
GO
update RBAC_RouteConfig
set DisplayName='MRP'
where RouterLink='StockTxnItemManage' and UrlFullPath='Pharmacy/Setting/StockTxnItemManage'
GO
---End: Shankar 27th May 2020: Renamed display name of sub-navbar tabs in pharmacy setting---

--START: SANJIT 28th May'20 Added Location Id in PHRM_MST_Rack table
ALTER TABLE PHRM_MST_Rack
	ADD LocationId int;
GO

	UPDATE PHRM_MST_Rack
	SET LocationId = 1
	WHERE LocationId is null
GO

ALTER TABLE PHRM_MST_Rack
	ALTER COLUMN LocationId int not null
GO
--END: SANJIT 28th May'20 Added Location Id in PHRM_MST_Rack table

--START: SANJIT: 28th May'20 Made ParentId Nullable in PHRM_MST_Rack
	ALTER TABLE PHRM_MST_Rack
	ALTER COLUMN ParentId int null;
GO
	UPDATE PHRM_MST_Rack
	SET ParentId = null
	WHERE ParentId = 0
GO
--END: SANJIT: 28th May'20 Made ParentId Nullable in PHRM_MST_Rack

--START: SANJIT: 29th May'20 Added StoreRackId in PHRM_MST_Item
	ALTER TABLE PHRM_MST_Item
	ADD StoreRackId int
GO
--END: SANJIT: 29th May'20 Added StoreRackId in PHRM_MST_Item

--START: SANJIT: 1st Jun'20 Added Permissions and SP for Rack Stock Distribution Report
	DECLARE @ApplicationId int
	SET @ApplicationId = (SELECT TOP(1) ApplicationId FROM RBAC_Application where ApplicationCode = 'PHRM' and ApplicationName = 'Pharmacy')
	
	INSERT INTO RBAC_Permission 
		(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
	VALUES
		('reports-pharmacy-rackstockdistribution-view',@ApplicationId,1,GETDATE(),1)
GO

	DECLARE @ApplicationId int
	SET @ApplicationId = (SELECT TOP(1) ApplicationId FROM RBAC_Application where ApplicationCode = 'PHRM' and ApplicationName = 'Pharmacy')
	
	DECLARE @PermissionId int
	SET @PermissionId = (SELECT TOP(1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'reports-pharmacy-rackstockdistribution-view' and ApplicationId = @ApplicationId)
	
	DECLARE @ParentRouteId int
	SET @ParentRouteId = (SELECT TOP(1) RouteId FROM RBAC_RouteConfig WHERE UrlFullPath = 'Pharmacy/Report' and DisplayName = 'Report' and RouterLink = 'Report')
	
	INSERT INTO RBAC_RouteConfig
	(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,DisplaySeq,IsActive)
	VALUES
	('Rack Stock Distribution','Pharmacy/Report/PHRMRackStockDistributionReport','PHRMRackStockDistributionReport',@PermissionId,@ParentRouteId,'',1,25,1)
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_RackStockDistribution]    Script Date: 6/1/2020 5:25:51 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_PHRMReport_RackStockDistribution] 
    @rackIds varchar(200) = null,
    @locationId int = null
AS
/*
FileName: [SP_PHRMReport_RackStockDistribution] "1;2",2
CreatedBy/date: Sanjit/2020-06-01
Description: 
Remarks:    
Change History
-----------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------
1        Sanjit/2020-06-01					created the script
-----------------------------------------------------------------
*/
	BEGIN
		IF((@rackIds IS NOT NULL) AND (@locationId IS NOT NULL))
		BEGIN
			DECLARE @rackIdTable TABLE (
				RackId int
			)
			INSERT INTO @rackIdTable
			SELECT value FROM STRING_SPLIT(@rackIds, ';')
			IF(@locationId = 1)
				BEGIN
					SELECT MR.Name RackName,I.ItemId,I.ItemName,DS.AvailableQuantity,DS.BatchNo, DS.ExpiryDate, DS.Price,(CONVERT( decimal(18,1),DS.AvailableQuantity)*(CONVERT(decimal(18,1),DS.Price))) StockValue, 'Dispensary' Location
					FROM PHRM_DispensaryStock AS DS 
					INNER JOIN PHRM_MST_Item AS I ON DS.ItemId = I.ItemId
					INNER JOIN @rackIdTable AS R ON R.RackId = I.Rack
					INNER JOIN PHRM_MST_Rack AS MR ON MR.RackId = R.RackId
					where DS.AvailableQuantity>0


					SELECT SUM(DS.AvailableQuantity) as 'TotalAvailableQuantity', SUM(CONVERT( decimal(18,1),DS.AvailableQuantity)*(CONVERT(decimal(18,1),DS.Price))) AS 'TotalStockValuation'
					FROM PHRM_DispensaryStock AS DS 
					INNER JOIN PHRM_MST_Item AS I ON DS.ItemId = I.ItemId
					INNER JOIN @rackIdTable AS R ON R.RackId = I.Rack
					where DS.AvailableQuantity>0
				END
			ELSE
				BEGIN
					SELECT  x1.RackName,x1.ItemId,x1.ItemName,SUM(InQty- OutQty+FInQty-FOutQty) AvailableQuantity,x1.BatchNo AS BatchNo, x1.ExpiryDate,Round(x1.Price,2,0) AS Price, (SUM(InQty - OutQty + FInQty - FOutQty) * Round(x1.Price,2,0)) StockValue, 'Store' Location
					FROM(SELECT MR.Name RackName,S.ItemId,S.ItemName, S.BatchNo, S.ExpiryDate, S.Price,
						SUM(CASE WHEN S.InOut = 'in' THEN S.Quantity ELSE 0 END) AS 'InQty',
						SUM(CASE WHEN S.InOut = 'out' THEN S.Quantity ELSE 0 END) AS 'OutQty',
						SUM(CASE WHEN S.InOut = 'in' THEN S.FreeQuantity ELSE 0 END) AS 'FInQty',
						SUM(CASE WHEN S.InOut = 'out' THEN S.FreeQuantity ELSE 0 END) AS 'FOutQty'
					FROM [dbo].[PHRM_StoreStock] AS S
					INNER JOIN PHRM_MST_Item AS I ON I.ItemId = S.ItemId
					INNER JOIN @rackIdTable AS R ON R.RackId = I.StoreRackId
					INNER JOIN PHRM_MST_Rack AS MR ON MR.RackId = R.RackId
					where S.Quantity>0 and S.FreeQuantity>0
					GROUP BY S.ItemName,S.ItemId, S.BatchNo , S.ExpiryDate,S.Price,MR.Name)as x1
					GROUP BY x1.ItemId,x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.Price,x1.RackName

					SELECT SUM(x2.AvailableQuantity) TotalAvailableQuantity,SUM(x2.StockValue)  TotalStockValuation
					FROM 
						(SELECT  SUM(InQty- OutQty+FInQty-FOutQty) AvailableQuantity, (SUM(InQty - OutQty + FInQty - FOutQty) * Round(x1.Price,2,0)) StockValue
						FROM (SELECT S.Price,
							SUM(CASE WHEN S.InOut = 'in' THEN S.Quantity ELSE 0 END) AS 'InQty',
							SUM(CASE WHEN S.InOut = 'out' THEN S.Quantity ELSE 0 END) AS 'OutQty',
							SUM(CASE WHEN S.InOut = 'in' THEN S.FreeQuantity ELSE 0 END) AS 'FInQty',
							SUM(CASE WHEN S.InOut = 'out' THEN S.FreeQuantity ELSE 0 END) AS 'FOutQty'
							FROM [dbo].[PHRM_StoreStock] AS S
							INNER JOIN PHRM_MST_Item AS I ON I.ItemId = S.ItemId
							INNER JOIN @rackIdTable AS R ON R.RackId = I.StoreRackId
							INNER JOIN PHRM_MST_Rack AS MR ON MR.RackId = R.RackId
							where S.Quantity>0 and S.FreeQuantity>0
							GROUP BY S.ItemName, S.BatchNo , S.ExpiryDate,S.Price,MR.Name)as x1
							GROUP BY x1.Price ) as x2
				END
		END
	END
RETURN
GO
--END: SANJIT: 1st Jun'20 Added Permissions and SP for Rack Stock Distribution Report

---Added Incremental from Beta Version V1.44X
---Anish: Start: 27 May, CoreCFG parameter to exclude the route-----
IF NOT EXISTS(Select Top(1) * from CORE_CFG_Parameters where ParameterName = 'ExcludeInOp' and ParameterGroupName='Nursing')
BEGIN
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType) 
Values ('Nursing','ExcludeInOp','{"PatientOverviewMain":["Transfer","DischargeSummary","WardBilling"], "Clinical":["InputOutput"]}',
'json','Contains the routes that are to be excluded for OutPatient for Different Pages','custom');
END
Go
---Anish: End: 27 May, CoreCFG parameter to exclude the route-----

--Anish: Start: 28 May, 2020---
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType) 
Values ('Nursing','ReceivedOnDateBufferTime','40',
'number','Contains the buffer time in minutes for past time, that User can enter in Received On field','custom');
Go
--Anish: End: 28 May, 2020---

--Anish: Start: 28 May, 2020, add the activate route to Database---
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-activate-ward-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/InPatient');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-activate-ward-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Activate Ward', 'Nursing/InPatient/ActivateWard','Activate Ward',@PermissionId,@RefParentRouteId,1,60,1);
GO
--Anish: End: 28 May, 2020, add the activate route to Database---


--Sud: Start: 29 May, 2020---
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType) 
Values ('Common','SoftwareStartYearInBS','2073','number','This is required by calendar settings in almost all modules. our working calendar will show year after this value.','custom');
Go
--Sud: End: 29 May, 2020---

-- Start: Ashish, 1 June '20, router-links of Daywise Voucher Report set inactive
UPDATE RBAC_RouteConfig
SET IsActive=0
WHERE UrlFullPath = 'Accounting/Reports/DaywiseVoucherReport' AND RouterLink='DaywiseVoucherReport';
GO

-- Start: Ashish, 1 June '20 router-links of Daywise Voucher Report set inactive

--START: VIKAS: 01 June 2020 : Exculded 'Capital Goods' Item type from table1
-----------------------------------------------------------
	--Vikas: update script for inventory consumption integration
	ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]
			@FromDate DATETIME=null ,
			@ToDate DATETIME=null
		AS
		--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @FromDate = '2019-07-05 12:07:31.170', @ToDate ='2020-07-05 12:07:31.170'

		/************************************************************************
		FileName: [SP_ACC_GetInventoryTransactions]
		CreatedBy/date: Ajay/05Jul'19
		Description: getting records of inventory transactions for accounting
		Change History
		-------------------------------------------------------------------------
		S.No.    UpdatedBy/Date                        Remarks
		-------------------------------------------------------------------------
		1       Ajay/05Jul'19						created the script
		2.		Vikas / 01-Jun-2020					update table 1 data -> exculde 'Capital Goods' Item type from table1
		*************************************************************************/
		BEGIN
			IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
			BEGIN
			--Table1: GoodReceipt
				SELECT 
					gr.CreatedOn,
					v.VendorName,
					gr.VendorId,
					 gr.PaymentMode,
					 itm.ItemCategoryId,
					 itm.ItemType,
					 itm.ItemName,
					 gr.TDSAmount,
					 gr.BillNo,									-- 26 March 2020:Vikas: added for invetory integration, mapping with accounting as per charak requirements.
					 gr.GoodsReceiptID,							-- 30 march 2020:Vikas: added GoodsReceiptID column
					 gritm.*
				FROM
					INV_TXN_GoodsReceipt gr 
					join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
					join INV_MST_Item itm on gritm.ItemId = itm.ItemId
				WHERE
					(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
					AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND itm.ItemType !='Capital Goods' -- Vikas / 01-Jun-2020	
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
					AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
					AND (CONVERT(DATE, st.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			
			 -- Table 5 :INVDeptConsumedGoods
			
					SELECT 
						csm.ConsumptionId,
						sb.SubCategoryId,
						sb.SubCategoryName,   
						csm.CreatedOn,
						csm.Quantity,
						stk.MRP
					FROM WARD_INV_Consumption csm
						join INV_MST_Item itm on csm.ItemId= itm.ItemId
						join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId
						join WARD_INV_Stock stk on itm.ItemId= stk.ItemId
					WHERE (csm.IsTransferToAcc IS NULL OR csm.IsTransferToAcc=0)  
						AND CONVERT(DATE, csm.CreatedOn) BETWEEN   CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate)

  			END
			ELSE
			BEGIN
				--Table1: GoodReceipt
				SELECT 
					gr.* ,
					v.VendorName
				FROM
					INV_TXN_GoodsReceipt gr 
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
				WHERE
					(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (TransactionType IN ('dispatch', 'Sent From WardSupply')) 
				-- Table 5 :INVDeptConsumedGoods
				
				SELECT 
					csm.ConsumptionId,
					sb.SubCategoryId,
					sb.SubCategoryName,   
					csm.CreatedOn,
					csm.Quantity,
					stk.MRP
				FROM WARD_INV_Consumption csm
					join INV_MST_Item itm on csm.ItemId= itm.ItemId
					join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId
					join WARD_INV_Stock stk on itm.ItemId= stk.ItemId
				WHERE (csm.IsTransferToAcc IS NULL OR csm.IsTransferToAcc=0)  
				END
		END
        GO
--END: VIKAS: 01 June 2020 : Exculded 'Capital Goods' Item type from table1
--START:ASHISH: 1 June 2020: Adding code details as per charak requirements
DECLARE @HospitalId INT
	SET @HospitalId=(select HospitalId from ACC_MST_Hospital Where HospitalShortName='CHARAK')

	
	IF(@HospitalId IS NOT NULL)
	BEGIN

		IF NOT EXISTS(Select 1 from ACC_MST_CodeDetails where CODE='015' and Name='RESERVE AND SURPLUSES')
			BEGIN
					INSERT INTO  ACC_MST_CodeDetails (code ,name,Description,HospitalId)values
					('015','RESERVE AND SURPLUSES' ,'LedgerGroupName',@HospitalId)
			END
	END
GO

--END:ASHISH: 1 June 2020: Adding code details as per charak requirements
---Ended of Incremental from Beta Version V1.44X


-----Added incremental from Nursing branch
--Start:  Pratik: 28May2020-- incentive GroupDistribution

IF OBJECT_ID('INCTV_CFG_ItemGroupDistribution') IS NOT NULL
BEGIN
  DROP TABLE INCTV_CFG_ItemGroupDistribution
END
GO

CREATE TABLE [dbo].[INCTV_CFG_ItemGroupDistribution]
([ItemGroupDistributionId] [int] IDENTITY(1,1) NOT NULL,
 IncentiveType varchar(30), -- default=assigned; for now we need it only for assigned, later if referral is also needed then we have to do accordingly.
 [BillItemPriceId] [int] NULL,
 EmployeeBillItemsMapId INT NULL,  -- FK to INCTV_MAP_EmployeeBillItemsMap table
 FromEmployeeId INT NULL,-- this is assigned or referral doctor, this is needed here in order to reduce the db joins
 DistributeToEmployeeId INT NULL,
 DistributionPercent Float NULL,
 FixedDistributionAmount Float NULL,-- This field is kept for further extension in the Scenarios where amount should be fixed before dividing.
 IsFixedAmount BIT NULL,-- If fixed amount then we have to make changes accordingly.
 DisplaySeq [int] NULL,-- to show the secondary employees in sequence in the frontend.
 Remarks varchar(400) NULL,
 CreatedBy INT NOT NULL,
 CreatedOn DateTime NOT NULL,
 IsActive [bit] NULL
 )
 GO
 Alter Table INCTV_CFG_ItemGroupDistribution Add Constraint PK_INCTV_CFG_ItemGroupDistribution Primary Key (ItemGroupDistributionId)
 GO

 ALTER TABLE INCTV_CFG_ItemGroupDistribution  ADD  CONSTRAINT FK_INCTV_CFG_ItemGroupDistribution_INCTV_MAP_EmployeeBillItemsMap FOREIGN KEY(EmployeeBillItemsMapId)
 REFERENCES INCTV_MAP_EmployeeBillItemsMap (EmployeeBillItemsMapId)
GO
 ALTER TABLE INCTV_CFG_ItemGroupDistribution  ADD  CONSTRAINT FK_INCTV_CFG_ItemGroupDistribution_EMP_EMployee FOREIGN KEY(CreatedBy)
 REFERENCES EMP_EMployee (EmployeeId)
GO

Alter Table INCTV_MAP_EmployeeBillItemsMap
 Add IsActive BIT Default (1)
 GO
 Update INCTV_MAP_EmployeeBillItemsMap
 Set IsActive = 1
 GO
 
 Create Table INCTV_EmployeeIncentiveInfo
(
 EmployeeIncentiveInfoId INT Identity(1,1) Constraint PK_INCTV_EmployeeIncentiveInfo Primary Key NOT NULL,
 EmployeeId INT,
 TDSPercent Float,
 CreatedBy INT,
 CreatedOn DateTime,
 IsActive BIT
)
GO

--End:  Pratik: 28May2020-- incentive GroupDistribution

--Start:  Pratik: 28May2020-- Employee Incentive Setup  route

Declare @AppId INT

SELECT @AppId = ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'INCTV'

INSERT INTO RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
VALUES 
('incentive-setting-employeeitemsetup-view', @AppId, 1, GETDATE(), 1)
GO

Declare @permId INT, @pRouteId INT

SELECT @permId = PermissionId FROM RBAC_Permission WHERE PermissionName = 'incentive-setting-employeeitemsetup-view'
SELECT @pRouteId = RouteId FROM RBAC_RouteConfig where UrlFullPath = 'Incentive/Setting'

INSERT INTO RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
VALUES
('Employee Items Setup', 'Incentive/Setting/EmployeeItemsSetup', 'EmployeeItemsSetup', @permId, @pRouteId, 1, NULL, 1)
GO

--End:  Pratik: 28May2020-- Employee Incentive Setup  route

-- Start: Bikash, 2nd June '20: route-links of Discharge summary in nursing and doctor-patient-overview
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('nursing-ip-dischargesummary-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-ip-dischargesummary-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Discharge Summary', 'Nursing/DischargeSummary','DischargeSummary',@PermissionId,@RefParentRouteId,1,31,1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Doctors' and ApplicationCode='DOC');


Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('doctor-ip-dischargesummary-view',@ApplicationId,1,GETDATE(),1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Doctors/PatientOverviewMain');

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='doctor-ip-dischargesummary-view');

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow,DisplaySeq ,IsActive)
values ('Discharge Summary', 'Doctors/PatientOverviewMain/DischargeSummary','DischargeSummary',@PermissionId,@RefParentRouteId,1,30,1);
GO
-- End: Bikash, 2nd June '20: route-links of Discharge summary in nursing and doctor-patient-overview
------Ended of incremental merge from Nursing module

---------Anish:Start 2 June, 2020, Lab Data render corrected and isolated organism count parameterised-----
GO
/****** Object:  StoredProcedure [dbo].[SP_DSB_Lab_DashboardStatistics]    Script Date: 6/2/2020 11:24:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[SP_DSB_Lab_DashboardStatistics]
AS
/*
=============================================================================================
FileName: [SP_DSB_Lab_DashboardStatistics]
Description: Table1:To get stats for LAB dashboard --> to fill Labels
					-->> for sample pending	-->> OrderStatus = active && (BillingStatus == unpaid || BillingStatus == paid) && IsActive=true
					-->> for results pending	-->> OrderStatus = pending && (BillingStatus == unpaid || BillingStatus == paid) && IsActive=true
					-->> for test completed	-->> OrderStatus = result-added or report-generated && (BillingStatus == unpaid || BillingStatus == paid) && IsActive=true
					-->> for tests cancelled	-->> BillingStatus = cancel && IsActive=true
					-->> for tests returned	-->> BillingStatus = return && IsActive=true
					-->> for total test		-->> Count all where IsActive=true
			Table2:To get stats for LAB dashboard --> For Trending LabTest (last 30 days)
					takes count of LabTest - grouping by them with LabTestName, ordering them in descending order and selecting top 10 only
			Table3:to get count of LabTest performed today ( Templete wise count is shown)


Edited by Anish: 2 June, 2020 new Updated Status Added 
=============================================================================================
*/
BEGIN

--Table1
	SELECT * FROM 
		(select count(*) 'TotalAvailableTest' from LAB_LabTests where IsActive=1) labtest,
		(select
			ISNULL(SUM(1),0) AS 'TestRequisitedToday',
			ISNULL(SUM( CASE WHEN OrderStatus = 'active' and IsActive=1 and (BillingStatus <> 'cancel' AND BillingStatus <> 'returned') THEN 1 ELSE 0 END ),0) AS 'SamplePendingToday',
			ISNULL(SUM( CASE WHEN OrderStatus = 'pending' and IsActive=1 and (BillingStatus <> 'cancel' AND BillingStatus <> 'returned') THEN 1 ELSE 0 END ),0) AS 'AddResultsPendingToday',
			ISNULL(SUM( CASE WHEN (OrderStatus = 'result-added' or OrderStatus = 'report-generated') and IsActive=1 and (BillingStatus <> 'cancel' AND BillingStatus <> 'returned') THEN 1 ELSE 0 END ),0) AS 'CompletedToday',
			ISNULL(SUM( CASE WHEN BillingStatus='cancel'and IsActive=1 THEN 1 ELSE 0 END ),0) AS 'CancelledTestsToday',
			ISNULL(SUM( CASE WHEN BillingStatus = 'returned'and IsActive=1 THEN 1 ELSE 0 END ),0) AS 'ReturnedTestsToday'
			from LAB_TestRequisition where convert(date,OrderDateTime) = convert(date,getdate())
		) Today,
		(select
			SUM(1) AS 'TestRequisitedTillDate',
			SUM( CASE WHEN OrderStatus = 'active' and IsActive=1 and (BillingStatus <> 'cancel' AND BillingStatus <> 'returned') THEN 1 ELSE 0 END ) AS 'SamplePendingTillDate',
			SUM( CASE WHEN OrderStatus = 'pending' and IsActive=1 and (BillingStatus <> 'cancel' AND BillingStatus <> 'returned') THEN 1 ELSE 0 END ) AS 'AddResultsPendingTillDate',
			SUM( CASE WHEN (OrderStatus = 'result-added' or OrderStatus = 'report-generated') and IsActive=1 and (BillingStatus <> 'cancel' AND BillingStatus <> 'returned') THEN 1 ELSE 0 END ) AS 'CompletedTillDate',
			SUM( CASE WHEN BillingStatus='cancel'and IsActive=1 THEN 1 ELSE 0 END ) AS 'CancelledTestsTillDate',
			SUM( CASE WHEN BillingStatus = 'returned' and IsActive=1 THEN 1 ELSE 0 END ) AS 'ReturnedTestsTillDate'
			from LAB_TestRequisition
		) TillDate
--Table2
	SELECT TOP(10) LabTestName,COUNT(LabTestName) AS Counts FROM LAB_TestRequisition 
		WHERE IsActive=1 and (DATEDIFF(DAY,OrderDateTime,GETDATE()) BETWEEN 0 AND 30)
		GROUP BY LabTestName
		ORDER BY Counts DESC
--Table3
	SELECT ReportTemplateName,COUNT(req.LabTestName) Counts FROM LAB_TestRequisition req 
		JOIN LAB_LabTests test ON req.LabTestId=test.LabTestId
		JOIN Lab_ReportTemplate reprt ON test.ReportTemplateID=reprt.ReportTemplateID
		WHERE  req.IsActive=1 and (CONVERT(DATE,OrderDateTime) = CONVERT(DATE,GETDATE()))
		GROUP BY ReportTemplateName
END
GO

INSERT INTO CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
VALUES ('LAB','MaxIsolatedOrganismCount','5','number','Max number of Isolated organism that can be added in culture report','system');
GO
-----Anish:End 2 June, 2020, Lab Data render corrected and isolated organism count parameterised-----

--START: Sanjit: 2ndJun'20	-- added GRCategory field in INV_TXN_GoodsReceipt
GO
	ALTER TABLE INV_TXN_GoodsReceipt
	ADD GRCategory varchar(20)
GO
	UPDATE INV_TXN_GoodsReceipt
	SET GRCategory = 'Consumables'
	WHERE GRCategory is null
GO
--END: Sanjit: 2ndJun'20	-- added GRCategory field in INV_TXN_GoodsReceipt


-----Anish:Start 3 June, 2020, Update transfer status in Patient Bed Info Table-----
DECLARE @cnt INT = 1;
DECLARE @patVisitId INT = 0;
DECLARE @countByVisitId INT = 0;

WHILE @cnt < (Select Count(*) from ADT_TXN_PatientBedInfo)
BEGIN     
   SET @patVisitId = (SELECT PatientVisitId FROM (
      SELECT ROW_NUMBER() OVER (ORDER BY PatientVisitId ASC) AS RowNumber,
      * FROM ADT_TXN_PatientBedInfo
	) AS bedInfo
	WHERE RowNumber = @cnt);

	SET @countByVisitId = (SELECT COUNT(*) from ADT_TXN_PatientBedInfo WHERE PatientVisitId=@patVisitId GROUP BY PatientVisitId);	
	
	--as it is ordered ASC by PatVisitId, so the adding skips that Patient VisitId and goes to next VisitId
	SET @cnt = @cnt + @countByVisitId;

	IF (@countByVisitId = 1) 
	BEGIN 
		--ReceiveBy would be NULL so we need to put BedOnHoldEnabled=0, so that is will not need to be received 
		Update ADT_TXN_PatientBedInfo SET OutAction='discharged' where PatientVisitId=@patVisitId AND EndedOn IS NOT NULL;
		Update ADT_TXN_PatientBedInfo SET BedOnHoldEnabled=0 where PatientVisitId=@patVisitId AND BedOnHoldEnabled IS NULL;
	END

	IF (@countByVisitId > 1) 
	BEGIN 
		Declare @patBdInfoId INT = 0;
		WHILE @countByVisitId > 0
		BEGIN  
			SET @patBdInfoId = (SELECT PatientBedInfoId FROM (
			  SELECT ROW_NUMBER() OVER (ORDER BY PatientBedInfoId DESC) AS RowNumber,
			  * FROM ADT_TXN_PatientBedInfo where PatientVisitId=@patVisitId
			) AS bedInfoDetail
			WHERE RowNumber = @countByVisitId);

			If(@countByVisitId = 1)
			BEGIN
				Update ADT_TXN_PatientBedInfo SET OutAction='discharged' where PatientBedInfoId=@patBdInfoId AND EndedOn IS NOT NULL;
				Update ADT_TXN_PatientBedInfo SET BedOnHoldEnabled=0 where PatientBedInfoId=@patBdInfoId AND BedOnHoldEnabled IS NULL;
			END
			ELSE
			BEGIN
				Update ADT_TXN_PatientBedInfo SET OutAction='transfer' where PatientBedInfoId=@patBdInfoId;
				Update ADT_TXN_PatientBedInfo SET BedOnHoldEnabled=0 where PatientBedInfoId=@patBdInfoId AND BedOnHoldEnabled IS NULL;
			END
			SET @countByVisitId = @countByVisitId - 1;			
		END
	END
END
GO
-----Anish:End 3 June, 2020, Update transfer status in Patient Bed Info Table-----

-----Anish:Start 3 June, 2020, SP for Admission, discharged, TransIn and TransOut Count-----
-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- Use the Specify Values for Template Parameters 
-- command (Ctrl-Shift-M) to fill in the parameter 
-- values below.
--
-- This block of comments will not be included in
-- the definition of the procedure.
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Anish Bhattarai
-- Create date: June 4, 2020
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_ADT_PatientInOutReport] 
	@FromDate Date=null ,
	@ToDate Date=null
AS
BEGIN
	If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN

	--Table1
	select distinct(ward.WardName) from ADT_TXN_PatientBedInfo bedInf Join ADT_MST_Ward ward on bedInf.WardId=ward.WardID

	--Table2
	select flatData.WardName, flatData.Action, Count(*) as TotalCount
	from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	where bedInfo.IsActive=1) as flatData Group By flatData.WardName, flatData.Action 

	--Table3
	select flatData.WardName, flatData.OutAction, Count(*) as TotalCount
	from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	where bedInfo.IsActive=1) as flatData Group By flatData.WardName, flatData.OutAction

	--Table4
	select flatData.WardName, Count(*) as TotalCount
	from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	where bedInfo.IsActive=1 and bedInfo.EndedOn Is Null and ((bedInfo.Action='admission') or (bedInfo.Action='transfer' and bedInfo.OutAction Is Null))) as flatData Group By flatData.WardName, flatData.OutAction

	END

END
GO
-----Anish:End 3 June, 2020, SP for Admission, discharged, TransIn and TransOut Count-----


--START: SANJIT: 3rd Jun'20 updated SP for Rack Stock Distribution Report
GO
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_RackStockDistribution]    Script Date: 6/3/2020 10:39:21 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRMReport_RackStockDistribution] 
    @rackIds varchar(200) = null,
    @locationId int = null
AS
/*
FileName: [SP_PHRMReport_RackStockDistribution] "1;2",2
CreatedBy/date: Sanjit/2020-06-01
Description: 
Remarks:    
Change History
-----------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------
1        Sanjit/2020-06-01          created the script
2        Sanjit/2020-06-03          updated the script for store
-----------------------------------------------------------------
*/
 BEGIN
    IF((@rackIds IS NOT NULL) AND (@locationId IS NOT NULL))
    BEGIN
      DECLARE @rackIdTable TABLE (
        RackId int
      )
      INSERT INTO @rackIdTable
      SELECT value FROM STRING_SPLIT(@rackIds, ';')
      IF(@locationId = 1)
        BEGIN
          SELECT MR.Name RackName,I.ItemId,I.ItemName,DS.AvailableQuantity,DS.BatchNo, DS.ExpiryDate, DS.Price,(CONVERT( decimal(18,1),DS.AvailableQuantity)*(CONVERT(decimal(18,1),DS.Price))) StockValue, 'Dispensary' Location
          FROM PHRM_DispensaryStock AS DS 
          INNER JOIN PHRM_MST_Item AS I ON DS.ItemId = I.ItemId
          INNER JOIN @rackIdTable AS R ON R.RackId = I.Rack
          INNER JOIN PHRM_MST_Rack AS MR ON MR.RackId = R.RackId
          where DS.AvailableQuantity>0


          SELECT SUM(DS.AvailableQuantity) as 'TotalAvailableQuantity', SUM(CONVERT( decimal(18,1),DS.AvailableQuantity)*(CONVERT(decimal(18,1),DS.Price))) AS 'TotalStockValuation'
          FROM PHRM_DispensaryStock AS DS 
          INNER JOIN PHRM_MST_Item AS I ON DS.ItemId = I.ItemId
          INNER JOIN @rackIdTable AS R ON R.RackId = I.Rack
          where DS.AvailableQuantity>0
        END
      ELSE
        BEGIN
          SELECT  x1.RackName,x1.ItemId,x1.ItemName,SUM(InQty- OutQty+FInQty-FOutQty) AvailableQuantity,x1.BatchNo AS BatchNo, x1.ExpiryDate,
		  Round(x1.Price,2,0) AS Price, (SUM(InQty - OutQty + FInQty - FOutQty) * Round(x1.Price,2,0)) StockValue, 'Store' Location
          FROM(SELECT MR.Name RackName,S.ItemId,S.ItemName, S.BatchNo, S.ExpiryDate, S.Price,
            SUM(CASE WHEN S.InOut = 'in' THEN S.Quantity ELSE 0 END) AS 'InQty',
            SUM(CASE WHEN S.InOut = 'out' THEN S.Quantity ELSE 0 END) AS 'OutQty',
            SUM(CASE WHEN S.InOut = 'in' THEN S.FreeQuantity ELSE 0 END) AS 'FInQty',
            SUM(CASE WHEN S.InOut = 'out' THEN S.FreeQuantity ELSE 0 END) AS 'FOutQty'
          FROM [dbo].[PHRM_StoreStock] AS S
          INNER JOIN PHRM_MST_Item AS I ON I.ItemId = S.ItemId
          INNER JOIN @rackIdTable AS R ON R.RackId = I.StoreRackId
          INNER JOIN PHRM_MST_Rack AS MR ON MR.RackId = R.RackId
          GROUP BY S.ItemName,S.ItemId, S.BatchNo , S.ExpiryDate,S.Price,MR.Name)as x1
          GROUP BY x1.ItemId,x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.Price,x1.RackName
          HAVING SUM(FInQty + InQty - FOutQty - OutQty) > 0  -- filtering out quantity > 0
          ORDER BY x1.ItemName
		  SELECT SUM(x2.AvailableQuantity) TotalAvailableQuantity,SUM(x2.StockValue)  TotalStockValuation
          FROM 
            (SELECT  x1.RackName,x1.ItemId,x1.ItemName,SUM(InQty- OutQty+FInQty-FOutQty) AvailableQuantity,x1.BatchNo AS BatchNo, x1.ExpiryDate,
			Round(x1.Price,2,0) AS Price, (SUM(InQty - OutQty + FInQty - FOutQty) * Round(x1.Price,2,0)) StockValue, 'Store' Location
          FROM(SELECT MR.Name RackName,S.ItemId,S.ItemName, S.BatchNo, S.ExpiryDate, S.Price,
            SUM(CASE WHEN S.InOut = 'in' THEN S.Quantity ELSE 0 END) AS 'InQty',
            SUM(CASE WHEN S.InOut = 'out' THEN S.Quantity ELSE 0 END) AS 'OutQty',
            SUM(CASE WHEN S.InOut = 'in' THEN S.FreeQuantity ELSE 0 END) AS 'FInQty',
            SUM(CASE WHEN S.InOut = 'out' THEN S.FreeQuantity ELSE 0 END) AS 'FOutQty'
          FROM [dbo].[PHRM_StoreStock] AS S
          INNER JOIN PHRM_MST_Item AS I ON I.ItemId = S.ItemId
          INNER JOIN @rackIdTable AS R ON R.RackId = I.StoreRackId
          INNER JOIN PHRM_MST_Rack AS MR ON MR.RackId = R.RackId
          GROUP BY S.ItemName,S.ItemId, S.BatchNo , S.ExpiryDate,S.Price,MR.Name)as x1
          GROUP BY x1.ItemId,x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.Price,x1.RackName
          HAVING SUM(FInQty + InQty - FOutQty - OutQty) > 0  -- filtering out quantity > 0
		  )as x2
        END
    END
  END
RETURN
GO
--END: SANJIT: 3rd Jun'20 updated SP for Rack Stock Distribution Report

-------Merged from Pharmacy_Issues_Enhancement branch----------------
----START: Shankar 2nd June 2020, Added organization name and remark in Credit  report of pharmacy-----
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_LedgerCredit_IndoorOutdoorPatient]    Script Date: 06/01/2020 4:52:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRMReport_LedgerCredit_IndoorOutdoorPatient] 
		@FromDate datetime=null,
		@ToDate datetime=null,
        @IsInOutPat bit
AS
/*
FileName: [SP_PHRMReport_LedgerCredit_IndoorOutdoorPatient]
CreatedBy/date: Umed/2018-02-21
Description: To get Patient Sale Credit Details Based on Patient Type
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1       Umed/2018-02-21	                 created the script
                                        i.e. To get Patient Sale Credit Details Based on Patient Type
2		Rusha/2019-05-03				Recreated the script to get Patient Sale Credit Details Based on Patient Type
3       Shankar/2020-06-01				Added organization name and remark
----------------------------------------------------------------------------
*/
BEGIN
	IF (@FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @IsInOutPat=1)
			BEGIN
				SELECT CONVERT(date,inv.CreateOn) AS [Date],inv.InvoicePrintId AS InvoiceNum,pat.PatientCode, ISNULL(cr.OrganizationName,'N/A') as 'OrganizationName', inv.Remark,
				CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) AS PatientName,pat.Address,inv.PaidAmount,inv.VisitType 
				FROM PHRM_TXN_Invoice AS inv
				LEFT JOIN PHRM_MST_Credit_Organization AS cr ON inv.OrganizationId = cr.OrganizationId
				JOIN PAT_Patient AS pat ON pat.PatientId = inv.PatientId
				WHERE inv.VisitType='outpatient' AND  inv.PaymentMode='credit' and CONVERT(date, inv.CreateOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
				GROUP BY CONVERT(date,inv.CreateOn),pat.FirstName,pat.MiddleName,pat.LastName,pat.PatientCode,inv.PaidAmount,inv.VisitType, inv.InvoicePrintId,pat.Address, OrganizationName, inv.Remark
			END
			ELSE IF (@IsInOutPat=0)
			BEGIN
				select CONVERT(date,inv.CreateOn) AS [Date],inv.InvoicePrintId AS InvoiceNum,pat.PatientCode, ISNULL(cr.OrganizationName,'N/A') as 'OrganizationName', inv.Remark,
				CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) as PatientName,pat.Address,inv.PaidAmount,inv.VisitType 
				from PHRM_TXN_Invoice AS inv
				LEFT JOIN PHRM_MST_Credit_Organization AS cr ON inv.OrganizationId = cr.OrganizationId
				join PAT_Patient AS pat ON pat.PatientId = inv.PatientId
				where inv.VisitType='inpatient' AND  inv.PaymentMode='credit'and CONVERT(date,inv.CreateOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
				group by CONVERT(date,inv.CreateOn),pat.FirstName,pat.MiddleName,pat.LastName,pat.PatientCode,inv.PaidAmount,inv.VisitType, inv.InvoicePrintId,pat.Address, OrganizationName, inv.Remark
			END
END
GO
----END: Shankar 2nd June 2020, Added organization name and remark in Credit  report of pharmacy-----
-------Merged from Pharmacy_Issues_Enhancement branch----------------

---------------merged from beta_v1.44 branch--------------
---Anish: Start: 3 June, Data for INPatient Census Report of ADT---

/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_PatientInOutReport]    Script Date: 6/3/2020 12:42:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Anish Bhattarai
-- Create date: June 4, 2020
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_ADT_PatientInOutReport] 
	@FromDate Date=null ,
	@ToDate Date=null
AS
BEGIN
	If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN

	
	--Table1 for all wardName
	select distinct(ward.WardName) from ADT_TXN_PatientBedInfo bedInf Join ADT_MST_Ward ward on bedInf.WardId=ward.WardID

	--Table2 for all Admisssion and TransIn
	select flatData.WardName, flatData.Action, Count(*) as TotalCount
	from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	where bedInfo.IsActive=1 and CONVERT(date,bedInfo.StartedOn) between @FromDate and @ToDate) as flatData Group By flatData.WardName, flatData.Action 

	--Table3 for all Discharged and TransOut
	select flatData.WardName, flatData.OutAction, Count(*) as TotalCount
	from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	where bedInfo.IsActive=1 and CONVERT(date,bedInfo.EndedOn) between @FromDate and @ToDate) as flatData Group By flatData.WardName, flatData.OutAction


	--Table4 for Total InBed Count
	select flatData.WardName, Count(*) as TotalCount
	from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	where bedInfo.IsActive=1 AND CONVERT(date,bedInfo.StartedOn) < @FromDate 
	AND   @FromDate <= CONVERT(date,ISNULL(bedInfo.EndedOn,Getdate())))
	as flatData Group By flatData.WardName

	--select flatData.WardName, Count(*) as TotalCount
	--from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	--Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	--where bedInfo.IsActive=1 and bedInfo.EndedOn Is Null 
	--and bedInfo.OutAction Is Null and CONVERT(date,bedInfo.StartedOn) < @FromDate
	--and ((bedInfo.Action='admission') or (bedInfo.Action='transfer'))) as flatData Group By flatData.WardName, flatData.OutAction

	END

END
GO
---Anish: End: 3 June, Data for INPatient Census Report of ADT---


---Anish:start 4 June 2020 --Updated SP to get total admitted patients----
/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_TotalAdmittedPatient]    Script Date: 6/4/2020 12:18:48 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_ADT_TotalAdmittedPatient]  ---[SP_Report_ADT_TotalAdmittedPatient] '2/23/2020','2/24/2020'
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
10.    Sud:9May'20                            Admitted should show all the admitted in the date range.
11.    Anish: 4 June 2020				Row Number Removed
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
        JOIN ADT_TXN_PatientBedInfo bedInfo ON AD.PatientVisitId=bedInfo.PatientVisitId 
            ---and EndedOn is null -- no need of this.
        JOIN ADT_Bed bed on bed.BedID=bedInfo.BedId
        JOIN ADT_MAP_BedFeaturesMap bedm on bed.BedID=bedm.BedId
        JOIN ADT_MST_BedFeature bedf on bedm.BedFeatureId=bedf.BedFeatureId
          
        where 
		bedInfo.Action='admission'  and 
		CONVERT(date,bedInfo.StartedOn) between @FromDate and @ToDate and
		CONVERT(date,ad.AdmissionDate) between @FromDate and @ToDate
    ) A
    --where A.RowNum=1 ---take only latest bed..
    ORDER by SN 
  END  
END		---[SP_Report_ADT_TotalAdmittedPatient] '2/23/2020','2/24/2020'
GO
---Anish:End 4 June 2020 --Updated SP to get total admitted patients----
---------------merged from beta_v1.44 branch--------------

--Anish: 8 June 2020, Start------------ Permission for nursing patient overview
GO
UPDATE RBAC_Permission
SET PermissionName='nursing-patientoverview-main-summary' where PermissionName='nursing-ip-summary-view';
GO
--Anish: 8 June 2020, End------------ Permission for nursing patient overview

--START: SANJIT: 9th Jun '20 : Inserted new Permissions to update mrp in both store and dispensary, added locationid in history table
DECLARE @ApplicationId int;
SET @ApplicationId = (SELECT TOP(1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'PHRM' and ApplicationName = 'Pharmacy')
INSERT INTO RBAC_Permission
(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values
('dispensary-update-mrp-button', @ApplicationId,1,GETDATE(),1),
('store-update-mrp-button', @ApplicationId,1,GETDATE(),1)
GO

DISABLE TRIGGER [TR_PHRM_StockTxnItems_MRPUpdateHistory]
ON [dbo].[PHRM_StockTxnItems];
GO

ALTER TABLE [dbo].[PHRM_StockTxnItems_MRPHistory]
ADD LocationId int;
GO
UPDATE [dbo].[PHRM_StockTxnItems_MRPHistory]
SET LocationId = 1
where LocationId is null
GO
--END: SANJIT: 9th Jun '20 : Inserted new Permissions to update mrp in both store and dispensary, added locationid in history table
---START: NageshBB: 11 June 2020 - stored procedure for get accounting trial balance data

/****** Object:  StoredProcedure [dbo].[SP_ACC_RPT_GetTrialBalanceData]    Script Date: 11-Jun-20 10:41:24 PM ******/
DROP PROCEDURE IF EXISTS dbo.SP_ACC_RPT_GetTrialBalanceData
Go
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_ACC_RPT_GetTrialBalanceData]
		@FromDate DATETIME,
		@ToDate DATETIME
	AS
	--EXEC [dbo].[SP_ACC_RPT_GetTrialBalanceData] @FromDate = '2020-06-11 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
	
	/************************************************************************
	FileName: [SP_ACC_RPT_GetTrialBalanceData]
	CreatedBy/date: Nagesh /11'June2020
	Description: get records for trail balance report of accounting
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /11'June2020						created script for get trial balance records
	*************************************************************************/
	BEGIN
	
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
		BEGIN
		--here we are getting plain records all grouping and data modification as per need we will do in controller 
		--using linq we will do all modification this will return plain records only
		--Now we are getting ledger opening balance from ledger table later we will update sp
		--and we will get data from ledger balance history table 
		 Declare @fiscalYearStartDate datetime
		 set @fiscalYearStartDate=(select top 1 Startdate from ACC_MST_FiscalYears where convert(date,StartDate) <=convert(date,@FromDate) and 
		 convert(date,EndDate) >=convert(date,@FromDate))
			
				select 				
				lg.PrimaryGroup, 
				lg.COA,
				lg.LedgerGroupName,
				l.LedgerName, 
				l.LedgerId
				,l.Code
				,max(case when l.DrCr=1 then l.OpeningBalance else 0 END) as OpeningBalDr
				,max(case when l.DrCr=0 then l.OpeningBalance else 0 END) as OpeningBalCr
				,sum(case when ti.DrCr=1 and convert(date,t.TransactionDate) < convert(date,@FromDate) then ISNULL(ti.Amount,0) else 0 END) as OpeningDr
				,sum(case when ti.DrCr=0 and convert(date,t.TransactionDate) < convert(date,@FromDate) then ISNULL(ti.Amount,0) else 0 END) as OpeningCr
				,sum(case when ti.DrCr=1 and convert(date,t.TransactionDate) >=convert(date,@FromDate)  then ISNULL(ti.Amount,0) else 0 END)  CurrentDr
				,sum(case when ti.DrCr=0 and convert(date,t.TransactionDate) >=convert(date,@FromDate)  then ISNULL(ti.Amount,0) else 0 END)  CurrentCr				
				from ACC_Ledger l
				left join ACC_MST_LedgerGroup lg on l.LedgerGroupId =lg.LedgerGroupId
				left join  ACC_TransactionItems ti on l.LedgerId= ti.LedgerId
				left join ACC_Transactions t on ti.TransactionId=t.TransactionId  and 
				convert(date, t.TransactionDate)>= convert(date,@fiscalYearStartDate) and convert(date, t.TransactionDate)<= convert(date,@ToDate) 
				group by lg.PrimaryGroup, 
				lg.COA,
				lg.LedgerGroupName,
				l.LedgerName, 
				l.LedgerId
				,l.Code
				order by l.LedgerName				
		END		
	END
GO

---END: NageshBB: 11 June 2020 - stored procedure for get accounting trial balance data


----START: NageshBB: 13 June 2020:accounting - Profit and Loss report get data stored procedure and Update Balance sheet report sp
DROP PROCEDURE IF EXISTS dbo.SP_ACC_RPT_GetProfitAndLossData
Go

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[SP_ACC_RPT_GetProfitAndLossData]
		@FromDate DATETIME,
		@ToDate DATETIME
	AS
	--EXEC [dbo].[SP_ACC_RPT_GetProfitAndLossData] @FromDate = '2020-06-12 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
	
	/************************************************************************
	FileName: [[SP_ACC_RPT_GetProfitAndLossData]]
	CreatedBy/date: Nagesh /12'June2020
	Description: get records for profit & Loss report of accounting
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /12'June2020						created script for get profit and loss report records
	*************************************************************************/
	BEGIN
	
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
		BEGIN				  
		   declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
		 declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
		
		Select l.LedgerId, 
		lg.PrimaryGroup, 
		l.LedgerName,
		lg.COA, 
		lg.LedgerGroupName, 
		l.Code, 
		SUM(txnItm.DrAmount) 'DRAmount', 
		SUM(txnItm.CrAmount) 'CRAmount'
        FROM ACC_Transactions  txn
        INNER JOIN 
          (Select  
         TransactionId, LedgerId,
         Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
         Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
         from  ACC_TransactionItems  ) txnItm 
         ON txn.TransactionId = txnItm.TransactionId
         INNER JOIN ACC_Ledger l
         ON txnItm.LedgerId = l.LedgerId
         INNER JOIN ACC_MST_LedgerGroup lg
         ON l.LedgerGroupId = lg.LedgerGroupId   and lg.PrimaryGroup IN (@Revenue, @Expenses)
		WHERE
		convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
		Group by l.LedgerId, lg.PrimaryGroup, l.LedgerName,lg.COA, lg.LedgerGroupName, l.Code
	
		END		
	END
	Go

	SET ANSI_NULLS ON
GO


DROP PROCEDURE IF EXISTS dbo.SP_ACC_RPT_GetBalanceSheetData
Go

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_ACC_RPT_GetBalanceSheetData]
    @FromDate DATETIME,
    @ToDate DATETIME
  AS
  --EXEC [dbo].[SP_ACC_RPT_GetBalanceSheetData] @FromDate = '2020-06-11 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
  
  /************************************************************************
  FileName: [SP_ACC_RPT_GetBalanceSheetData]
  CreatedBy/date: Nagesh /12'June2020
  Description: get records for balance sheet report of accounting
  Change History
  -------------------------------------------------------------------------
  S.No.    UpdatedBy/Date                        Remarks
  -------------------------------------------------------------------------
  1       Nagesh /12'June2020            created script for get balance sheet report records
  2       Sud sir/13'June 2020          updated for get table 2 with NetProfit details
  *************************************************************************/
  BEGIN  
    IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
    BEGIN  
        --adding 1minute to the startdate since our fiscal year table has earlier day's 23:59:59 as start date---
        -- we could add 5minutes, 50 minutes, no problem--
        Set @FromDate= ( Select StartDate+ '00:01:00' from ACC_MST_FiscalYears where IsActive=1)
    
        --Table:1 Get Balance Sheet Details---          
        Select 
				ledInfo.LedgerId,PrimaryGroup, LedgerName,COA,LedgerGroupName,Code
				, OpeningBalanceDr, OpeningBalanceCr, ISNULL(Led_TotDr,0) AS 'DRAmount', ISNULL(Led_TotCr,0) AS 'CRAmount' 
          from
          (
					Select l.LedgerId, l.LedgerName, l.Code,  l.ledgergroupid, lg.PrimaryGroup, lg.COA, lg.LedgerGroupName , 
					case when l.DrCr=1 then l.OpeningBalance else 0 END AS 'OpeningBalanceDr',
					case when l.DrCr=0 then l.OpeningBalance else 0 END AS 'OpeningBalanceCr' 
					from ACC_Ledger l INNER JOIN ACC_MST_LedgerGroup lg
					ON l.LedgerGroupId = lg.LedgerGroupId
          ) ledInfo
          LEFT JOIN
          ( 
            Select LedgerId,SUM(DrAmount) AS 'Led_TotDr', SUM(CrAmount) 'Led_TotCr' from
            (
					Select  txn.TransactionId, LedgerId,
                    Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
					Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
					from  ACC_TransactionItems txnItm INNER JOIN ACC_Transactions txn
					ON txnItm.TransactionId = txn.TransactionId
					WHERE 
					convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
              ) A
              Group By LedgerId
          ) ledTxnDetails 
			ON ledInfo.LedgerId= ledTxnDetails.LedgerId
			Order by ledInfo.LedgerName


  
  --Table2: Get NetProfit and Loss ---
        declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
        declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
		Select SUM(RevenueBalance) - SUM(ExpenseBalance)   'NetProfitNLoss'
          FROM
        ( 
          Select 
            Case When PrimaryGroup=@Revenue THEN TotalDrAmount - TotalCrAmount ELSE 0 END AS 'ExpenseBalance',
            Case When PrimaryGroup=@Expenses THEN TotalCrAmount - TotalDrAmount  ELSE 0 END AS 'RevenueBalance'
            from 
          (
              ---Query2.1: P&L on Opening Balance----
              --- ideally Opening balances of P&L accounts will be zero. It'll give correct  results even in that case---
               Select ledGrp.PrimaryGroup, SUM(led.DrAmount) 'TotalDrAmount', SUM(led.CrAmount) 'TotalCrAmount'
 
                from
                 (		Select   LedgerId,LedgergroupId,
						Case WHEN DrCr=1 THEN OpeningBalance ELSE 0 END AS DrAmount,
						Case WHEN DrCr=0 THEN OpeningBalance ELSE 0 END AS CrAmount
						from  ACC_Ledger  )   led 
						INNER  JOIN ACC_MST_LedgerGroup ledGrp
						ON led.LedgerGroupId = ledGrp.LedgerGroupId           
						Where ledGrp.PrimaryGroup IN (@Revenue,@Expenses)
						Group by ledGrp.PrimaryGroup
               UNION ALL  
              --Query:2.2-- Get Profit&Loss on Transaction Amounts
						Select lg.PrimaryGroup,  SUM(txnItm.DrAmount) 'TotalDrAmount',SUM(txnItm.CrAmount) 'TotalCrAmount'
                        FROM ACC_Transactions  txn
						INNER JOIN 
                        (		Select  
								TransactionId, LedgerId,
								Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
								Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
								from  ACC_TransactionItems  ) txnItm 
        
						ON txn.TransactionId = txnItm.TransactionId
						INNER JOIN ACC_Ledger l
						ON txnItm.LedgerId = l.LedgerId
						INNER JOIN ACC_MST_LedgerGroup lg
						ON l.LedgerGroupId = lg.LedgerGroupId   and lg.PrimaryGroup IN (@Revenue,@Expenses)        
                  WHERE
                    convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
                  Group by lg.PrimaryGroup
          ) A
        ) B
                
    END    
  END
GO
----END: NageshBB: 13 June 2020:accounting - Profit and Loss report get data stored procedure and Update Balance sheet report sp

----START: Merged from Beta branch
---ANish:START 12 June, 2020 Vitals needed to be entered within a timeframe for Receive to work parameter----
INSERT INTO CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
VALUES ('Nursing','TimeFrameInMinForVitalsOfPatToBeReceived',360,'number','Time frame within which at least one Vitals should be taken to make Patient Receive','custom');
GO

INSERT INTO CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
VALUES ('ADT','IsTransferRemarksMandatory','true','boolean','Transfer Remarks while transferring Patients to be made mandatory or not','custom');
GO
---ANish:END 12 June, 2020: Vitals needed to be entered within a timeframe for Receive to work parameter----


--START: sud: 14June'20-- Correction in Reports & Accounting---
/****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_DailyAppointmentReport]    Script Date: 2020-06-14 1:12:47 PM ******/
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
--------------------------------------------------------
*/
BEGIN
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 AND (@Doctor_Name IS NOT NULL)
        OR (LEN(@Doctor_Name) > 0 AND (@AppointmentType IS NOT NULL)
        OR (LEN(@AppointmentType) > 0)))
		BEGIN
			SELECT
					CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, VisitTime) as 'Date',
					  pat.PatientCode,
					   pat.ShortName AS Patient_Name,

						--patPait.FirstName +' '+patPait.MiddleName+' '+ patPait.LastName AS Patient_Name,
						
						 pat.PhoneNumber,pat.Age,pat.Gender,
						 vis.AppointmentType,vis.VisitType,
						 vis.ProviderName AS Doctor_Name,vis.ProviderId,
					vis.VisitStatus
				FROM PAT_PatientVisits AS vis
					INNER JOIN PAT_Patient pat ON vis.PatientId = pat.PatientId
					WHERE CONVERT(date, vis.VisitDate) BETWEEN Convert(Date,@FromDate)  AND COnvert(Date,  @ToDate )
					and vis.ProviderName LIKE '%' + ISNULL(@Doctor_Name, '') + '%' and
					    vis.AppointmentType LIKE '%' + ISNULL(@AppointmentType, '') + '%'
                    AND vis.BillingStatus NOT  IN('cancel','returned')
					ORDER BY CONVERT(datetime, CONVERT(date, vis.VisitDate)) + CONVERT(datetime, vis.VisitTime) DESC

				END
END
GO
---------------------------------Route configuration
Update RBAC_RouteConfig
set IsActive=0 
WHERE UrlFullPath IN ('Reports/BillingMain/DailyAppointmentReport'
,'Reports/BillingMain/TotalAdmittedPatient'
,'Reports/BillingMain/DischargedPatient'
,'Reports/BillingMain/DoctorReport')
GO
---------------------------Route configuration

/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_PatientInOutReport]    Script Date: 2020-06-14 2:12:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* =============================================
-- Author:		Anish Bhattarai
-- Create date: June 4, 2020
--------------------------------------------
S.No.   Date/Author           Remarks
---------------------------------------------
1.     14June'10/Sud         Excluded Action='cancel' from patientbedinfo. this is when admission is cancelled.
-- ============================================= */
ALTER PROCEDURE [dbo].[SP_Report_ADT_PatientInOutReport] 
	@FromDate Date=null ,
	@ToDate Date=null
AS
BEGIN
	If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN

	
	--Table1 for all wardName
	select distinct(ward.WardName) from ADT_TXN_PatientBedInfo bedInf Join ADT_MST_Ward ward on bedInf.WardId=ward.WardID

	--Table2 for all Admisssion and TransIn
	select flatData.WardName, flatData.Action, Count(*) as TotalCount
	from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	where bedInfo.IsActive=1 
	and bedInfo.Action !='cancel'
	and CONVERT(date,bedInfo.StartedOn) between @FromDate and @ToDate) as flatData Group By flatData.WardName, flatData.Action 

	--Table3 for all Discharged and TransOut
	select flatData.WardName, flatData.OutAction, Count(*) as TotalCount
	from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	where bedInfo.IsActive=1 
	and bedInfo.Action !='cancel'
	and CONVERT(date,bedInfo.EndedOn) between @FromDate and @ToDate) as flatData Group By flatData.WardName, flatData.OutAction


	--Table4 for Total InBed Count
	select flatData.WardName, Count(*) as TotalCount
	from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	where bedInfo.IsActive=1 
	and bedInfo.Action !='cancel'
	AND CONVERT(date,bedInfo.StartedOn) < @FromDate 
	AND   @FromDate <= CONVERT(date,ISNULL(bedInfo.EndedOn,Getdate())))
	as flatData Group By flatData.WardName

	--select flatData.WardName, Count(*) as TotalCount
	--from (select bedInfo.*,ward.WardName from ADT_TXN_PatientBedInfo bedInfo
	--Join ADT_MST_Ward ward on bedInfo.WardId=ward.WardID
	--where bedInfo.IsActive=1 and bedInfo.EndedOn Is Null 
	--and bedInfo.OutAction Is Null and CONVERT(date,bedInfo.StartedOn) < @FromDate
	--and ((bedInfo.Action='admission') or (bedInfo.Action='transfer'))) as flatData Group By flatData.WardName, flatData.OutAction

	END

END
GO

---changing the display sequence of admission reports so that Inpatient Census comes at first--
Update RBAC_RouteConfig
set DisplaySeq=20 where UrlFullPath  like 'Reports/AdmissionMain/%'
GO

Update RBAC_RouteConfig
set DisplaySeq=1 where UrlFullPath='Reports/AdmissionMain/InpatientCensusReport'
GO

Update ACC_MST_FiscalYears
set StartDate='2019-07-17 00:00:00.000' 
WHERE FiscalYearName='2076/2077'
GO

--END: sud: 14June'20-- Correction in Reports & Accounting---

--START: Sanjit: 12 Jun 2020 --added ConsumptionDate field in WARD_INV_Consumption table

ALTER TABLE WARD_INV_Consumption
ADD ConsumptionDate DATETIME NULL
GO

UPDATE WARD_INV_Consumption
SET ConsumptionDate = CreatedOn
WHERE ConsumptionDate is null
GO

--END: Sanjit: 12 Jun 2020 --added ConsumptionDate field in WARD_INV_Consumption table

--START: Sanjit: 12 Jun 2020 --removed withdrawn items from Inventory Requisition View
GO
/****** Object:  StoredProcedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView]    Script Date: 6/12/2020 4:06:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
	ALTER Procedure [dbo].[INV_TXN_VIEW_GetRequisitionItemsInfoForView] 
	  @RequisitionId INT
	AS
	/*
	FileName: INV_TXN_VIEW_GetRequisitionItemsInfoForView -- EXEC INV_TXN_VIEW_GetRequisitionItemsInfoForView  8
	Author: Sud/19Feb'20 
	Description: to get details of Requisition items along with Employee Information.
	Remarks: We're returning two tables, one for Requisition details and another for Dispatch Details.
	ChangeHistory:
	----------------------------------------------------
	S.No    Author/Date                  Remarks
	---------------------------------------------------
	1.      Sud/19Feb'20                Initial Draft
	2.      Sud/4Mar'20					added RequisitionItemId in select query. Needed for Cancellation.
	3.		sanjit/9Apr'20				added IssueNo and RequisitionNo in SP
	4.		sanjit/17Apr'20				added cancel details in the sp.
	5.		sanjit/6May'20				added RequisitionRemarks in the sp.(immediate solution,must refactor properly)
	6.		sanjit/12Jun'20				removed withdrawn items from the query
	-------------------------------------------------------
	*/
	BEGIN
 
	  Select reqItm.ItemId, itm.ItemName, itm.Code, reqItm.Quantity, 
		reqItm.ReceivedQuantity, reqItm.PendingQuantity, reqItm.RequisitionItemStatus,
		reqItm.Remark,   reqItm.ReceivedQuantity AS 'DispatchedQuantity', 
		reqItm.RequisitionNo,reqItm.IssueNo, reqItm.RequisitionId,
		reqItm.CreatedOn, reqItm.CreatedBy, reqEmp.FullName 'CreatedByName',
		reqItm.RequisitionItemId,reqItm.isActive,reqItm.CancelOn,reqItm.CancelRemarks,
		(select FullName from EMP_Employee where EmployeeId = reqItm.CancelBy) 'CancelBy',
		NULL AS 'ReceivedBy', -- receive item feature is not yet implemented, correct this later : sud-19Feb'20,
		(select Remarks from INV_TXN_Requisition where RequisitionId = @RequisitionId) 'Remarks'

		from 

		INV_TXN_RequisitionItems reqItm  
		INNER JOIN INV_MST_Item itm 
		   ON reqItm.ItemId=itm.ItemId
		INNER JOIN EMP_Employee reqEmp
		   ON reqItm.CreatedBy = reqEmp.EmployeeId

	  Where reqItm.RequisitionId=@RequisitionId  and reqItm.RequisitionItemStatus != 'withdrawn'


	  Select dispItm.RequisitionItemId, dispItm.DispatchedQuantity, dispItm.CreatedOn 'DispatchedOn', 
	  dispItm.CreatedBy 'DispatchedBy', emp.FullName 'DispatchedByName' 
	   from INV_TXN_DispatchItems dispItm
	  INNER JOIN EMP_Employee emp
		 ON dispItm.CreatedBy = emp.EmployeeId 
	  where RequisitionItemId IN (Select RequisitionItemId from INV_TXN_RequisitionItems  where RequisitionId=@RequisitionId)
	  ORder by dispItm.CreatedOn
	END
GO
--END: Sanjit: 12 Jun 2020 --removed withdrawn items from Inventory Requisition View

----END:  Merged from Beta branch

-----------------Merged from Incentive branch-----------------------------------

---Start: Pratik  11June 2020: GroupDistribution Impacts on Existing Functionalities

/****** Object:  UserDefinedFunction [dbo].[FN_INCTV_GetIncentiveSettings]    Script Date: 6/11/2020 12:56:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_INCTV_GetIncentiveSettings] ()
RETURNS TABLE
/*
To get current incentive profile settings
Created: sud-15Feb'20
Remarks: Needs revision.
Change History:
------------------------------------------------------------------------------------------
S.No.    Author         Remarks
------------------------------------------------------------------------------------------
1.      15Feb'20/sud    Initial Draft
2.      15Mar'20/Sud    Added TDSPercenatge in the Select list, which will be used later in calculation.
3.      11June2020/Pratik   GroupDistribution Impacts on Existing Functionalities                
------------------------------------------------------------------------------------------
*/
AS
    RETURN
    (
			SELECT 
				empBillItmMap.BillItemPriceId,empInctvInfo.EmployeeIncentiveInfoId,
				itmPrice.ServiceDepartmentId, itmPrice.ItemId, itmPrice.ItemName,
				priceCat.PriceCategoryId, priceCat.PriceCategoryName,
				emp.EmployeeId,
				emp.FullName,
				empBillItmMap.AssignedToPercent,
				empBillItmMap.ReferredByPercent,
				empInctvInfo.TDSPercent 
			from INCTV_EmployeeIncentiveInfo empInctvInfo
			INNER JOIN INCTV_MAP_EmployeeBillItemsMap empBillItmMap
			  on empInctvInfo.EmployeeId=empBillItmMap.EmployeeId
			INNER JOIN BIL_CFG_BillItemPrice  itmPrice
			  ON empBillItmMap.BillItemPriceId = itmPrice.BillItemPriceId
			INNER JOIN BIL_CFG_PriceCategory priceCat
			  ON empBillItmMap.PriceCategoryId=priceCat.PriceCategoryId 
			INNER JOIN EMP_Employee emp
			  ON empInctvInfo.EmployeeId=emp.EmployeeId  
			  where empInctvInfo.IsActive=1 
    )
GO
--================================================================================================================

/****** Object:  StoredProcedure [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange]    Script Date: 6/11/2020 1:00:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange '2020-02-14','2020-02-14'
 Description: 
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By         Remarks
 --------------------------------------------------
 1.      15Feb'20/Sud          Initial Draft (Needs Revision)
 2.      15Mar'20/Sud         Added TDSPercentage and TDSAmount calculation in the query
3.       4Apr'20/Sud          Excluding Already Added BillingTransactionItem during Bill Sync.
                              earlier it was at BillingTransactionId level, now it's BillingTransactionItemId
4.       11June               TDSpercentage from Employee Incentive Info
 ---------------------------------------------------
*/
BEGIN

IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN

---Start: For Referral Incentive-----------

INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercent,
	( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN [FN_INCTV_GetIncentiveSettings] () sett
--LEFT JOIN [FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.ReferredByPercent,0) !=0
	---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Referral Incentive-----------

UNION ALL

---Start: For Assigned Incentive-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  --, txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN [FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.AssignedToPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Assigned Incentive-----------
END

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END
GO
--===================================================================================================================================================================


/****** Object:  StoredProcedure [dbo].[SP_INCTV_ViewTxn_InvoiceItemLevel]    Script Date: 6/11/2020 12:55:16 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_INCTV_ViewTxn_InvoiceItemLevel]    --SP_INCTV_ViewTxn_InvoiceItemLevel '2020-02-05','2020-02-10',313716,0
  @BillingTansactionId int = NULL
AS
/*
 File: SP_INCTV_ViewTxn_InvoiceItemLevel
 Description: 
 Conditions/Checks: 

 Remarks: We're returning 2 tables from here
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By       Remarks
 --------------------------------------------------
 1.      24Jan'20/Pratik          Initial Draft (Needs Revision)
 2.      16Feb'20/Sud         Rewrite after change in logic.. 
 3.      11June2020/Pratik   GroupDistribution Impacts on Existing Functionalities  
 ---------------------------------------------------
*/
BEGIN
  --Table:1 -- Get BillingTransactionItem information---
select PatientId, BillingTransactionItemId, BillingTransactionId,ItemId, ItemName, Quantity, Price, SubTotal, DiscountAmount, TotalAmount
from BIL_TXN_BillingTransactionItems
where BillingTransactionId=@BillingTansactionId

  --Table:2 -- Get Fraction Information---
Select * from INCTV_TXN_IncentiveFractionItem
WHERE BillingTransactionId=@BillingTansactionId

END
GO

--===============================================================



ALTER PROCEDURE [dbo].[SP_INCTV_GetBillingTxnItems_BetweenDate]   -- EXEC SP_INCTV_GetBillingTxnItems_BetweenDate '2020-04-01', '2020-04-10'
	( @FromDate DATETIME = NULL,
      @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_GetBillingTxnItems_BetweenDate
 Description:  To get billing transaction items for fraction,
 Conditions/Checks: 
   1. Returned Items are removed.
   2. Joining with EMployee Table twice for Assigned and ReferredBy Employee
   3. FractionCount (number) is the count of FractionItem  in Incentive_FractionItem table for BillingTransactionItemId
        
 Remarks: This can later be extended and used in Billing -> Edit Doctor as well since the fields are preety much similar.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By       Remarks
 --------------------------------------------------
 1.      10Apr'20/Sud          Initial Draft 
 2.      11June2020/Pratik   GroupDistribution Impacts on Existing Functionalities 
 
 ---------------------------------------------------
*/
BEGIN

select
     pat.PatientId, pat.FirstName+' '+ISNULL(pat.MiddleName+' ','')+pat.LastName 'PatientName', pat.PatientCode,

  fyear.FiscalYearFormatted +'-'+ bilTxn.InvoiceCode + cast(bilTxn.InvoiceNo as varchar(20)) AS 'InvoiceNo' 
  , bilTxn.CreatedOn 'TransactionDate',  biltxn.BillingTransactionId, txnItm.BillingTransactionItemId 'BillingTransactionItemId', 

txnItm.ServiceDepartmentName, txnItm.ItemName,txnItm.ItemId, txnItm.TotalAmount,
txnItm.ProviderName 'AssignedToEmpName', emp2.FullName 'ReferredByEmpName', 
inctvTxnItm.FrcCount 'FractionCount'

from  BIL_CFG_FiscalYears fyear, 
	PAT_Patient pat,

    BIL_TXN_BillingTransaction bilTxn 
	     JOIN BIL_TXN_BillingTransactionItems txnItm
	ON bilTxn.BillingTransactionId = txnItm.BillingTransactionId
	    --LEFT JOIN EMP_Employee emp1 
		   --ON txnItm.ProviderId = emp1.EmployeeId  -- for AssignedToDoctor
        LEFT JOIN EMP_Employee emp2
		   ON txnItm.RequestedBy= emp2.EmployeeId
    LEFT JOIN (Select BillingTransactionItemId, Count(*) 'FrcCount'  from INCTV_TXN_IncentiveFractionItem where IsActive=1 Group By BillingTransactionItemId ) inctvTxnItm
	    ON txnItm.BillingTransactionItemId = inctvTxnItm.BillingTransactionItemId

where 
	    bilTxn.FiscalYearId = fyear.FiscalYearId 
	AND bilTxn.PatientId=pat.PatientId
	AND Convert(Date,bilTxn.CreatedOn) Between @FromDate AND @ToDate
	AND ISNULL(bilTxn.ReturnStatus,0) = 0
 
END
GO

---End: Pratik  11June 2020: GroupDistribution Impacts on Existing Functionalities
-----------------Merged from Incentive branch-----------------------------------

----START: Anjana: June-16, 2020 - Showing Requesting Department in Radiology list requests-----
ALTER TABLE RAD_PatientImagingRequisition
ADD WardName varchar (50) null;
GO

UPDATE RAD_PatientImagingRequisition 
SET WardName = 'outpatient'
FROM PAT_PatientVisits pat
WHERE RAD_PatientImagingRequisition.PatientVisitId Is null or RAD_PatientImagingRequisition.PatientVisitId = pat.PatientVisitId;
GO 

UPDATE RAD_PatientImagingRequisition 
SET WardName = ward.WardName
FROM ADT_TXN_PatientBedInfo bedInfo
INNER JOIN ADT_MST_Ward ward ON bedInfo.WardId = ward.WardID
WHERE RAD_PatientImagingRequisition.PatientVisitId = bedInfo.PatientVisitId;
GO

----END: Anjana: June-16, 2020 - Showing Requesting Department in Radiology list requests-----

---START: Pratik  22June 2020: GroupDistribution Impacts on Existing Functionalities
/****** Object:  UserDefinedFunction [dbo].[FN_INCTV_GetIncentiveSettings]    Script Date: 6/11/2020 12:56:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER FUNCTION [dbo].[FN_INCTV_GetIncentiveSettings] ()
RETURNS TABLE
/*
To get current incentive profile settings
Created: sud-15Feb'20
Remarks: Needs revision.
Change History:
------------------------------------------------------------------------------------------
S.No.    Author         Remarks
------------------------------------------------------------------------------------------
1.      15Feb'20/sud    Initial Draft
2.      15Mar'20/Sud    Added TDSPercenatge in the Select list, which will be used later in calculation.
3.		11June2020/Pratik   GroupDistribution Impacts on Existing Functionalities 
------------------------------------------------------------------------------------------
*/
AS
    RETURN
    (
   --   Select 
      -- profItm.BillItemPriceId, price.ServiceDepartmentId, price.ItemId, price.ItemName,
      -- priceCat.PriceCategoryId, priceCat.PriceCategoryName,
      -- prof.ProfileName, prof.ProfileId,
      -- emp.EmployeeId,
      -- emp.FullName,
      -- profItm.AssignedToPercent,
      -- profItm.ReferredByPercent,
      -- prof.TDSPercentage 
     --from INCTV_MST_Profile  prof
     --  INNER JOIN BIL_CFG_PriceCategory priceCat
      -- ON prof.PriceCategoryId=priceCat.PriceCategoryId 
     --  INNER JOIN INCTV_BillItems_Profile_Map profItm
      --  ON prof.ProfileId= profItm.ProfileId
     --  INNER JOIN INCTV_EMP_Profile_Map empProf
      --  ON prof.ProfileId=empProf.ProfileId
     --  INNER JOIN EMP_Employee emp
      -- ON empProf.EmployeeId=emp.EmployeeId  
     --  INNER JOIN BIL_CFG_BillItemPrice  price
      --  ON profItm.BillItemPriceId = price.BillItemPriceId


      SELECT 
        empBillItmMap.BillItemPriceId,empInctvInfo.EmployeeIncentiveInfoId,
        itmPrice.ServiceDepartmentId, itmPrice.ItemId, itmPrice.ItemName,
        priceCat.PriceCategoryId, priceCat.PriceCategoryName,
        emp.EmployeeId,
        emp.FullName,
        empBillItmMap.AssignedToPercent,
        empBillItmMap.ReferredByPercent,
        empInctvInfo.TDSPercent 
      from INCTV_EmployeeIncentiveInfo empInctvInfo
      INNER JOIN INCTV_MAP_EmployeeBillItemsMap empBillItmMap
        on empInctvInfo.EmployeeId=empBillItmMap.EmployeeId
      INNER JOIN BIL_CFG_BillItemPrice  itmPrice
        ON empBillItmMap.BillItemPriceId = itmPrice.BillItemPriceId
      INNER JOIN BIL_CFG_PriceCategory priceCat
        ON empBillItmMap.PriceCategoryId=priceCat.PriceCategoryId 
      INNER JOIN EMP_Employee emp
        ON empInctvInfo.EmployeeId=emp.EmployeeId  
        where empInctvInfo.IsActive=1 
    )
GO
---END: Pratik  22June 2020: GroupDistribution Impacts on Existing Functionalities

--------------START: 23 June 2020 Merged inv_procurement to DEV branch-----------------------------------
--Start: Sanjit: 17Jun'20 --added mrp and price in INV_TXN_Stock table
	ALTER TABLE INV_TXN_Stock
	ADD MRP decimal(10,2),Price decimal(16,4)
GO
	UPDATE INV_TXN_Stock
	SET MRP=GRI.MRP,Price=GRI.TotalAmount/(GRI.ReceivedQuantity + ISNULL(GRI.FreeQuantity,0))
	FROM INV_TXN_Stock S 
		JOIN INV_TXN_GoodsReceiptItems GRI 
		on S.GoodsReceiptItemId = GRI.GoodsReceiptItemId
	WHERE S.MRP IS NULL and S.Price IS NULL
GO
--END: Sanjit: 17Jun'20 --added mrp and price in INV_TXN_Stock table

--Start: Sanjit: 17Jun'20 --added itemId in INV_TXN_StockTransaction table
	ALTER TABLE INV_TXN_StockTransaction
	ADD ItemId int, MRP decimal(10,2), Price decimal(16,4)
GO
	UPDATE INV_TXN_StockTransaction
	SET ItemId=S.ItemId, Price = S.Price, MRP = S.MRP
	FROM INV_TXN_StockTransaction ST
		JOIN INV_TXN_Stock S 
		on S.StockId = ST.StockId
	WHERE ST.ItemId IS NULL AND ST.Price IS NULL AND ST.MRP IS NULL
GO
--END: Sanjit: 17Jun'20 --added mrp and price in INV_TXN_Stock table

--START: Sanjit: 17Jun'20 --updated old transaction type to new transaction types
	UPDATE INV_TXN_StockTransaction
	SET TransactionType = 'goodreceipt-items'
	WHERE TransactionType = 'goodreceipt'
GO
	UPDATE INV_TXN_StockTransaction
	SET TransactionType = 'stockmanaged-items'
	WHERE TransactionType = 'stockmanage'
GO
	UPDATE INV_TXN_StockTransaction
	SET TransactionType = 'writeoff-items'
	WHERE TransactionType = 'writeoff'
GO
	UPDATE INV_TXN_StockTransaction
	SET TransactionType = 'returntovendor-items'
	WHERE TransactionType = 'returntovendor'
GO
	UPDATE INV_TXN_StockTransaction
	SET TransactionType = 'cancel-gr-items'
	WHERE TransactionType = 'cancel-gr'
GO
	UPDATE INV_TXN_StockTransaction
	SET TransactionType = 'dispatched-items'
	WHERE TransactionType = 'dispatch'
GO
--END: Sanjit: 17Jun'20 --updated old transaction type to new transaction types

--START: Sanjit: 17Jun'20 --updated old reference no from Goods Receipt Id to GoodsReceiptItemId
	UPDATE INV_TXN_StockTransaction
	SET ReferenceNo = GRI.GoodsReceiptItemId
	FROM INV_TXN_StockTransaction ST
		JOIN INV_TXN_Stock S 
		ON S.StockId = ST.StockId
		JOIN INV_TXN_GoodsReceiptItems GRI
		ON S.GoodsReceiptItemId = GRI.GoodsReceiptItemId
	WHERE TransactionType = 'goodreceipt-items' or TransactionType = 'cancel-gr-items'
GO
--END: Sanjit: 17Jun'20 --updated old reference no from Goods Receipt Id to GoodsReceiptItemId

--START: Sanjit: 17 Jun'20 -- updated Inventory Summary Report for the new transaction types
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_InventorySummaryReport]    Script Date: 6/17/2020 11:54:43 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-----
ALTER PROCEDURE [dbo].[SP_Report_Inventory_InventorySummaryReport]  
@FromDate Date=null,
@ToDate Date=null, 
@ItemName NVARCHAR(max)=null
as

/*
 FileName: [SP_Report_Inventory_InventorySummaryReport] 
 Created: Unknown
 Description: To Get the summary of inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      17Jun'20/sanjit         updated for transaction types          
 2.
 -------------------------------------------------------------------------
*/
BEGIN

	SELECT  itmDate.Dates 
	        --,itmDate.ItemId
			,itmDate.ItemName
			,itmDate.UOMName
			,itmDate.ItemRates
			,itmDate.Code
			,ISNULL(stIn.PurchaseQty,0) as PurchaseQty
			,ISNULL(stIn.Pvalue,0) As PurchaseValue
			,ISNULL(stOut.dispatchQty,0) as DispatchQty
			,ISNULL(stOut.dvalue,0) as DispatchValue
			,ISNULL(stOut.writeoffQty,0) as WriteoffQty
			,ISNULL(stOut.writeoffvalue,0) as WriteoffValue
			,ISNULL(stOut.ReturnToVendorQty,0) as ReturnToVendorQty
			,ISNULL(stOut.ReturnToVendorvalue,0) as ReturnToVendorValue

 FROM 

 (
	   SELECT DISTINCT d.Dates,itm.ItemId,itm.ItemName,itm.UnitOfMeasurementId,uom.UOMName, gr.ItemRate as ItemRates,itm.Code
	   FROM  
			  FN_COMMON_GetAllDatesBetweenRange(@FromDate,@ToDate) d  
			  ----calling Table value Function Through SP
			, INV_MST_Item itm, INV_MST_UnitOfMeasurement uom , INV_TXN_GoodsReceiptItems gr
			WHERE itm.UnitOfMeasurementId = uom.UOMId
 ) itmDate

Left Join
(
		  ---this table is for to get Purchase quantity and Purchase value of Each items 
		   SELECT DISTINCT 
				   gr.ItemId
				   ,convert(date,s.CreatedOn) AS Dates
				   ,gr.ItemRate AS itemrate 
				   ,SUM(s.ReceivedQuantity) AS PurchaseQty 
				   ,(gr.ItemRate*SUM(s.ReceivedQuantity)) AS Pvalue
		   FROM INV_TXN_Stock  s 
						 INNER JOIN INV_TXN_GoodsReceiptItems gr 
						 ON s.goodsreceiptitemid=gr.goodsreceiptitemid
		  GROUP BY  convert(date,s.CreatedOn),gr.ItemId,itemrate
) stIn

ON  stIn.Dates = itmDate.Dates AND itmDate.ItemId=stIn.ItemId

left join
  
  (   
		 ---this table is for to get Dispatch quantity , Dispatch value , Writeoff quantity ,Writeoff value and  of Each items 
		SELECT DISTINCT 
				   gr.ItemId
				  ,gr.ItemRate 
				  ,convert(date,sttxn.CreatedOn) AS Dates
				  ,SUM(case WHEN TransactionType='dispatched-items' THEN sttxn.Quantity ELSE 0 END) AS dispatchQty
				  , (gr.ItemRate*(SUM(CASE WHEN TransactionType='dispatched-items' THEN sttxn.Quantity ELSE 0 END))) AS dvalue
				  ,SUM(CASE WHEN TransactionType='writeoff-items' THEN sttxn.Quantity ELSE 0 END) AS writeoffQty 
				  , (gr.ItemRate*(SUM(CASE WHEN TransactionType='writeoff-items' THEN sttxn.Quantity ELSE 0 END))) AS writeoffvalue
				  ,SUM(CASE WHEN TransactionType='returntovendor-items' THEN sttxn.Quantity ELSE 0 END) AS ReturnToVendorQty 
				  , (gr.ItemRate*(SUM(CASE WHEN TransactionType='returntovendor-items' THEN sttxn.Quantity ELSE 0 END))) AS ReturnToVendorvalue
		 FROM INV_TXN_Stock s 
					 INNER JOIN INV_TXN_GoodsReceiptItems gr 
					   ON s.goodsreceiptitemid=gr.goodsreceiptitemid
					 INNER JOIN INV_TXN_StockTransaction sttxn 
					   ON sttxn.StockId = s.StockId
		 GROUP BY convert(date,sttxn.CreatedOn) ,gr.ItemId, gr.ItemRate 
)  stOut   

ON itmDate.Dates=stOut.Dates AND itmDate.ItemId=stOut.ItemId	 

---we'll take the row if something is present in it.
WHERE ( stIn.PurchaseQty IS NOT NULL  OR 
         stOut.dispatchQty IS NOT NULL OR stOut.writeoffQty IS NOT NULL ) 
		 AND itmDate.ItemName like '%'+ISNULL(@ItemName,'')+'%' 
      AND (itmDate.ItemRates = stIn.itemrate OR itmDate.ItemRates = stOut.ItemRate)

END
GO
--END: Sanjit: 17 Jun'20 -- updated Inventory Summary Report for the new transaction types

--START: Sanjit: 17Jun'20 -- alter the mrp to decimal(16,4) in all the tables
	ALTER TABLE INV_TXN_GoodsReceiptItems
	ALTER COLUMN MRP decimal(16,4)
GO
	ALTER TABLE INV_TXN_Stock
	ALTER COLUMN MRP decimal(16,4)
GO
	ALTER TABLE INV_TXN_StockTransaction
	ALTER COLUMN MRP decimal(16,4)
GO
--END: Sanjit: 17Jun'20 -- alter the mrp to decimal(16,4) in all the tables

--START Sanjit: 17Jun'20 -- changed the goods receipt evaluation report to search from GR No. instead of GR id.
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_GoodReceiptEvaluation]    Script Date: 6/17/2020 1:07:26 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_GoodReceiptEvaluation]
  @GoodReceiptNo int = null,
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
 2.		 17Jun'20/sanjit		 changed goodsreceiptid to goodsreceiptno
 -------------------------------------------------------------------------
*/
BEGIN
  If(@GoodReceiptNo IS NOT NULL)
  BEGIN
    select gr.GoodsReceiptID,gr.GoodsReceiptNo,itm.ItemName,itm.Code,itm.ItemType,gritm.BatchNO,gritm.ItemRate,stktxn.TransactionType,stktxn.Quantity,stktxn.InOut,stktxn.CreatedOn as 'TransactionDate',stktxn.ReferenceNo,emp.FirstName as 'TransactionBy',
	unit.UOMName
	from INV_TXN_StockTransaction as stktxn
    
    join INV_TXN_Stock as stk on stktxn.StockId = stk.StockId
    join INV_TXN_GoodsReceiptItems as gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
    join INV_TXN_GoodsReceipt as gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
    join INV_MST_Item as itm on stk.ItemId = itm.ItemId
    join EMP_Employee as emp on stktxn.CreatedBy = emp.EmployeeId
    left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
    where gr.GoodsReceiptNo = @GoodReceiptNo and stkTxn.TransactionType like ISNULL(@TransactionType,'%') and CONVERT(date,stktxn.CreatedOn) between ISNULL(@FromDate,'2010-01-01') and ISNULL(@ToDate,GETDATE())
    order by stktxn.CreatedOn desc
  END
  ELSE
  BEGIN
    select gr.GoodsReceiptID,gr.GoodsReceiptNo,itm.ItemName,itm.Code,itm.ItemType,gritm.BatchNO,gritm.ItemRate,stktxn.TransactionType,stktxn.Quantity,stktxn.InOut,stktxn.CreatedOn as 'TransactionDate',stktxn.ReferenceNo,emp.FirstName as 'TransactionBy',
	unit.UOMName
	from INV_TXN_StockTransaction as stktxn    
	join INV_TXN_Stock as stk on stktxn.StockId = stk.StockId
    join INV_TXN_GoodsReceiptItems as gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
    join INV_TXN_GoodsReceipt as gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
    join INV_MST_Item as itm on stk.ItemId = itm.ItemId
    join EMP_Employee as emp on stktxn.CreatedBy = emp.EmployeeId
    left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
    where stkTxn.TransactionType like ISNULL(@TransactionType,'%') and CONVERT(date,stktxn.CreatedOn) between ISNULL(@FromDate,'2010-01-01') and ISNULL(@ToDate,GETDATE())
    order by stktxn.CreatedOn desc
  END
END
GO
--END Sanjit: 17Jun'20 -- changed the goods receipt evaluation report to search from GR No. instead of GR id.

--START: Sanjit: 17Jun'20 --added price, goodsreceiptitemid in ward_stock table
	ALTER TABLE WARD_INV_Stock
	ADD Price decimal(16,4),GoodsReceiptItemId int
GO
	ALTER TABLE WARD_INV_Stock
	ALTER COLUMN AvailableQuantity float;
GO
	ALTER TABLE WARD_INV_Stock
	ALTER COLUMN MRP decimal(16,4)
GO
--END: Sanjit: 17Jun'20 --added price,goodsreceiptitemid in ward_stock table

--START: Sanjit: 17Jun'20 --added ReferneceNo,InOut,Price and MRP in WARD_INV_Transaction table
	ALTER TABLE WARD_INV_Transaction
	ADD ReferenceNo int, InOut varchar(10), Price decimal(16,4), MRP decimal(16,4)
GO
--also changed createdon to datetime instead of date
	ALTER TABLE WARD_INV_Transaction
	ALTER COLUMN CreatedOn datetime;
GO
--also changed quantity to float from int
	ALTER TABLE WARD_INV_Transaction
	ALTER COLUMN Quantity float;
GO
--update query for transaction type and inOut
	UPDATE WARD_INV_Transaction
	SET TransactionType = 'dispatched-items', InOut = 'in'
	WHERE TransactionType = 'Dispatched'
GO
--END: Sanjit: 17Jun'20 --added ReferneceNo,InOut,Price and MRP in WARD_INV_Transaction table

--START: Sanjit: 17Jun'20 --changed Quantity to float instead of int in Consumption Table
	ALTER TABLE WARD_INV_Consumption
	ALTER COLUMN Quantity float;
GO 
--END: Sanjit: 17Jun'20 --changed Quantity to float instead of int in Consumption Table

--START: Sanjit: 22Jun'20 -- changed receipt date to datetime in goodsreceipt table of inventory
	ALTER TABLE INV_TXN_GoodsReceipt
	ALTER COLUMN ReceivedDate DATETIME
GO
--END: Sanjit: 22Jun'20 -- changed receipt date to datetime in goodsreceipt table of inventory

--START: Sanjit: 22Jun'20 --added GRItemDate in goodsreceipt items table
	ALTER TABLE INV_TXN_GoodsReceiptItems
	ADD GRItemDate DATETIME;
GO
--END: Sanjit: 22Jun'20 -- changed receipt date to datetime in goodsreceipt table of inventory

--START: Sanjit: 22Jun'20 -- update GRDate and GRItemDate for existing records.
	--to backup the goodsreceiptdate in case we need it again
	UPDATE INV_TXN_GoodsReceipt
	SET ReceivedDate = CAST(CAST(GoodsReceiptDate As Date) As DateTime) + CAST(CAST(CreatedOn As Time) As DateTime)
	WHERE GoodsReceiptDate IS NOT NULL
GO
	-- to save all the existing goods receipt date to created on
	UPDATE INV_TXN_GoodsReceipt
	SET GoodsReceiptDate = CreatedOn
	WHERE GoodsReceiptDate IS NOT NULL
GO
	UPDATE INV_TXN_GoodsReceiptItems
	SET GRItemDate = GR.GoodsReceiptDate
	FROM INV_TXN_GoodsReceiptItems GRI
	JOIN INV_TXN_GoodsReceipt GR on GR.GoodsReceiptID = GRI.GoodsReceiptId
	WHERE GRItemDate IS NULL
GO
--END: Sanjit: 22Jun'20 -- update GRDate and GRItemDate for existing records.
--------------END: 23 June 2020 Merged inv_procurement to DEV branch-----------------------------------

---------Merged from doctor  to DEV branch ==  23 June 2020------------
--START: Bikash 15th June '20 - altering emergency note table
ALTER TABLE CLN_Notes_Emergency
ALTER COLUMN PhoneNumber varchar(20);
GO
--END: Bikash 15th June '20 - altering emergency note table
---------Merged from doctor  to DEV branch ==  23 June 2020------------

---------Merged from NursingEnhancement  to DEV branch ==  23 June 2020------------
----Start: Anjana 6/19/2020: System admin databse export permission--------
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'SystemAdmin' and ApplicationCode = 'SYSADM');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('sysadmin-btn-dbexport', @ApplicationId,
1, GETDATE(), 1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig
where UrlFullPath='SystemAdmin');

declare @PermissionID INT
SET @PermissionID = (Select TOP(1) PermissionId from RBAC_Permission 
where PermissionName ='sysadmin-btn-dbexport');

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink,
PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values('Database Export To', 'SystemAdmin/DatabaseExport', 'DatabaseExport', @PermissionId, @RefParentRouteId,1,NULL,1);
GO

----End: Anjana 6/19/2020: System admin databse export permission--------


----Start: Anjana 6/23/2020: Stored Procedure for Getting opd visit list--------

/****** Object:  StoredProcedure [dbo].[SP_GetVisitListForOPD]  ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_GetVisitListForOPD]
		@FromDate Datetime=null ,
		@ToDate DateTime=null

AS
/*
FileName: [SP_GetVisitListForOPD]
CreatedBy/date: Anjana/2020-06-23
Description: to get list of outpatient 

Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      Anjana/2020-06-23					Initial Draft
-----------------------------------------------------------------------------------------
*/
BEGIN
 
 
SELECT
  pat.PatientId,
  pat.PatientCode,
  pat.ShortName,
  pat.DateOfBirth,
  pat.PhoneNumber,
  pat.Gender,
  pat.Address,
  pat.Age,
  vis.VisitDate,
  vis.VisitTime,
  vis.VisitType,
  vis.PatientVisitId,
  vis.ProviderName,
  vis.ProviderId,
	Case WHEN vit.PatientVisitId IS NOT NULL THEN 1 ELSE 0 END AS 'HasVitals'

	FROM 
		PAT_Patient pat 
			INNER JOIN
			PAT_PatientVisits vis ON pat.PatientId= vis.PatientId
			left join
					  (Select Distinct PatientVisitId 
					   from 
						CLN_PatientVitals )
					   vit
					  ON vis.PatientVisitId = vit.PatientVisitId	

			WHERE  
			vis.VisitType = 'outpatient' AND vis.BillingStatus != 'cancel'AND vis.BillingStatus != 'returned'
			AND Convert(Date, vis.CreatedOn) between ISNULL(@FromDate,Convert(Date, GETDATE())) 
			AND ISNULL(@ToDate, Convert(Date, GETDATE()))

END
GO

----End: Anjana 6/23/2020: Stored Procedure for Getting opd visit list--------

---------Merged from NursingEnhancement  to DEV branch ==  23 June 2020------------

-------------24th June 2020: Merged from Pharmacy_Issues_Enhancment to DEV branch--------------------
---START:Rajib Sigdel,24th June 2020, Pharmacy + Inventory: Reset identification number such as GoodReceiptNo., GoodReceiptPrintNo. in GoodsReipt, ReturnToVendor table with Fiscal Year.

ALTER TABLE PHRM_GoodsReceipt 
ADD FiscalYearId int;
GO

ALTER TABLE INV_TXN_GoodsReceipt
ADD FiscalYearId int;
GO

UPDATE PHRM_GoodsReceipt
SET FiscalYearId = 
CASE
	WHEN ((CreatedOn between '2017-07-16 00:00:00.000' and '2018-07-16 00:00:00.000')) THEN 1
	WHEN ((CreatedOn between '2018-07-16 23:59:59.000' and '2019-07-16 23:59:59.000')) THEN 2
	WHEN ((CreatedOn between '2019-07-16 23:59:59.000' and '2020-07-15 23:59:59.000')) THEN 3
	ELSE 0
END
GO

UPDATE INV_TXN_GoodsReceipt
SET FiscalYearId = 
CASE
	WHEN ((CreatedOn between '2017-07-16 00:00:00.000' and '2018-07-16 00:00:00.000')) THEN 1
	WHEN ((CreatedOn between '2018-07-16 23:59:59.000' and '2019-07-16 23:59:59.000')) THEN 2
	WHEN ((CreatedOn between '2019-07-16 23:59:59.000' and '2020-07-15 23:59:59.000')) THEN 3
	ELSE 0
END
GO
-- END:Rajib Sigdel,24th June 2020, Pharmacy + Inventory: Reset identification number such as GoodReceiptNo., GoodReceiptPrintNo. in GoodsReipt, ReturnToVendor table with Fiscal Year.
-------------24th June 2020: Merged from Pharmacy_Issues_Enhancment to DEV branch--------------------

--Start: Sanjesh: 30Jun'20 --added  price in WARD_InternalConsumptionItems and  WARD_Stock

ALTER TABLE WARD_InternalConsumptionItems
ADD  Price DECIMAL(18,4)
GO

ALTER TABLE WARD_Stock
ADD  Price DECIMAL(18,4)
GO

ALTER TABLE WARD_Transaction
ADD  Price DECIMAL(18,4)
GO

ALTER TABLE WARD_DispatchItems
ADD  Price DECIMAL(18,4)
GO

--END: Sanjesh: 30Jun'20 --added price in WARD_InternalConsumptionItems and  WARD_Stock

----START: Branch Merge : NageshBB: ---- Merged ACC to DEV ----------: 08 Jul 2020--------

---Anish:Start 6 June, 2020, Permission for different tenants of Accounting added-----
INSERT INTO RBAC_Application
(ApplicationCode,ApplicationName,CreatedBy,CreatedOn,IsActive)
VALUES
('ACC-TENANT','Accounts-Hospital',1,GETDATE(),1);
GO
DECLARE @ApplicationId int;
SET @ApplicationId = (SELECT TOP(1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'ACC-TENANT' and ApplicationName = 'Accounts-Hospital');

	INSERT INTO RBAC_Permission
	(ApplicationId,PermissionName,Description,CreatedBy,CreatedOn,IsActive)

	SELECT @ApplicationId,'acc-hospital-'+ HospitalShortName,'auto-generated permission for Hospitals in Accounting',1,GETDATE(),1
	FROM ACC_MST_Hospital where IsActive=1
GO

DECLARE @ApplicationId int;
SET @ApplicationId = (SELECT TOP(1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'ACC-TENANT' and ApplicationName = 'Accounts-Hospital');
INSERT INTO RBAC_Permission (ApplicationId,PermissionName,Description,CreatedBy,CreatedOn,IsActive)
Values(@ApplicationId,'accounting-hospital-activate','',1,GETDATE(),1);
GO

DECLARE @parentRouteId int;
SET @parentRouteId =(select RouteId from RBAC_RouteConfig where RouterLink='Transaction' and UrlFullPath='Accounting/Transaction');
DECLARE @permissionId int;
SET @permissionId =(select PermissionId from RBAC_Permission where PermissionName='accounting-hospital-activate');
INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive) 
VALUES ('Activate Tenant','Accounting/Transaction/ActivateHospital','ActivateTenant',@permissionId,@parentRouteId,0,1);
GO
---Anish:End 6 June, 2020, Permission for different tenants of Accounting added-----


-- START : VIKAS: 12 June 2020: Fiscal year update scripts. 

-- Added Coloumn into ACC_LedgerBalanceHistory, and ACC_MST_Fiscal.Years tables
	DECLARE @ApplicationId int
	SET @ApplicationId = (SELECT TOP(1) ApplicationId from RBAC_Application WHERE ApplicationCode = 'AC' and ApplicationName = 'Accounting')
	INSERT INTO RBAC_Permission 
	(ApplicationId,PermissionName,Description,IsActive,CreatedBy,CreatedOn)
	VALUES
	(@ApplicationId,'accounting-closure-btn','permission to close accounting fiscal year',1,1,GETDATE())
	GO

	-- 1. add columns in ledgerBalanceHistory table
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
				WHERE Name = N'ModifiedOn'
				AND Object_ID = Object_ID(N'dbo.ACC_LedgerBalanceHistory'))
	BEGIN
		Alter Table ACC_LedgerBalanceHistory
		ADD ModifiedOn datetime null
	END
	GO
	-- 2.
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
				WHERE Name = N'ModifiedBy'
				AND Object_ID = Object_ID(N'dbo.ACC_LedgerBalanceHistory'))
	BEGIN
		Alter Table ACC_LedgerBalanceHistory
		ADD ModifiedBy int null
	END
	GO

	-- 3. add columns in fiscal year table for closing details 
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
				WHERE Name = N'IsClosed'
				AND Object_ID = Object_ID(N'dbo.ACC_MST_FiscalYears'))
	BEGIN
		Alter Table ACC_MST_FiscalYears
		ADD  IsClosed bit 
	END
	GO
	-- 4.
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
				WHERE Name = N'ClosedOn'
				AND Object_ID = Object_ID(N'dbo.ACC_MST_FiscalYears'))
	BEGIN
		Alter Table ACC_MST_FiscalYears
		ADD ClosedOn datetime null
	END
	GO
	-- 5.
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
				WHERE Name = N'ClosedBy'
				AND Object_ID = Object_ID(N'dbo.ACC_MST_FiscalYears'))
	BEGIN
		Alter Table ACC_MST_FiscalYears
		ADD ClosedBy int null
	END
	GO
	
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
				WHERE Name = N'ReadyToClose'
				AND Object_ID = Object_ID(N'dbo.ACC_MST_FiscalYears'))
	BEGIN
		Alter Table ACC_MST_FiscalYears
		ADD  ReadyToClose bit 
	END
	GO
----Added Coloumn into ACC_LedgerBalanceHistory, and ACC_MST_Fiscal.Years tables

	--update fiscal year start date for 2076/77 => now start date is 2019-07-16 23:59:59.000, update with 2019-07-17 00:00:00.000
	UPDATE ACC_MST_FiscalYears
	SET StartDate='2019-07-17 00:00:00.000' where FiscalYearName='2076/2077' and NpFiscalYearName='2076/77'
	Go
	
	INSERT INTO ACC_MST_FiscalYears ([FiscalYearName],[StartDate],[EndDate],[CreatedOn],[CreatedBy],[IsActive],[NpFiscalYearName],[IsClosed])
	VALUES('2077/2078','2020-07-17 00:00:00.000','2021-07-15 23:59:59.000',GETDATE(),1,0,'2077/78',0)
	Go
	
	-- update closed status
	update ACC_MST_FiscalYears
	set IsClosed=0
	Go
	
	--update ACC_MST_FiscalYears
	--set IsClosed=1
	--where FiscalYearId='2075/2076'
	--Go

-- END : VIKAS: 12 June 2020: Fiscal year update scripts.
 
 --START: ASHISH : 19 June 2020: button levle permission for create ledger for user.
	Declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');
	
	Insert into RBAC_Permission ([PermissionName],[Description],[ApplicationId],[CreatedBy],[CreatedOn],[IsActive])
	values ('accounting-create-default-ledger-button-permission','This permission is used to give access create default ledger or not for users',@ApplicationId,1,GETDATE(),1);
	GO

	Declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');
	
	Insert into RBAC_Permission ([PermissionName],[Description],[ApplicationId],[CreatedBy],[CreatedOn],[IsActive])
	values ('accounting-create-phrm-supplier-ledger-button-permission','This permission is used to give access create pharmacy supplier ledger or not for users',@ApplicationId,1,GETDATE(),1);
	GO
	
	Declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');
	
	Insert into RBAC_Permission ([PermissionName],[Description],[ApplicationId],[CreatedBy],[CreatedOn],[IsActive])
	values ('accounting-create-consultant-credit-ledger-button-permission','This permission is used to give access create consultant credit ledger or not for users',@ApplicationId,1,GETDATE(),1);
	GO
	
	Declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');
	
	Insert into RBAC_Permission ([PermissionName],[Description],[ApplicationId],[CreatedBy],[CreatedOn],[IsActive])
	values ('accounting-create-credit-organization-ledger-button-permission','This permission is used to give access create credit organization ledger or not for users',@ApplicationId,1,GETDATE(),1);
	GO

	Declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');
	
	
	Insert into RBAC_Permission ([PermissionName],[Description],[ApplicationId],[CreatedBy],[CreatedOn],[IsActive])
	values ('accounting-create-inventory-vendor-ledger-button-permission','This permission is used to give access create inventory vendor ledger or not for users',@ApplicationId,1,GETDATE(),1);
	GO
	
	Declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');
	
	Insert into RBAC_Permission ([PermissionName],[Description],[ApplicationId],[CreatedBy],[CreatedOn],[IsActive])
	values ('accounting-create-inventory-subcategory-ledger-button-permission','This permission is used to give access create inventory subcategory ledger or not for users',@ApplicationId,1,GETDATE(),1);
	GO
--END: ASHISH : 19 June 2020: button levle permission for create ledger for user.

--START: VIKAS : 19th June 2020: button permission for reopen closed fiscal year
	Declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');

	Insert into RBAC_Permission ([PermissionName],[Description],[ApplicationId],[CreatedBy],[CreatedOn],[IsActive])
	values ('accounting-fiscal-year-reopen-button-permission','This permission is used to give access for reopen closed fiscal year',@ApplicationId,1,GETDATE(),1);
	GO
--END: VIKAS : 19th June 2020: button permission reopen closed fiscal year

--START: NageshBB: 20 June 2020: account closure sp

DROP PROCEDURE IF EXISTS dbo.SP_ACC_AccountClosure
Go

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[SP_ACC_AccountClosure]
		@CurrentFiscalYearId int,
			@NextFiscalYearId int
	AS
	--EXEC [dbo].[SP_ACC_AccountClosure] @CurrentFiscalYearId = 1, @NextFiscalYearId =2
	
	/************************************************************************
	FileName: [SP_ACC_AccountClosure]
	CreatedBy/date: Nagesh /19'June2020
	Description: sp will close current fiscal year. add closing balance and forward closing for next fiscal year as opening balance
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /19'June2020						created script for account closure task
	*************************************************************************/
	BEGIN
	
		IF(@CurrentFiscalYearId IS NOT NULL AND @NextFiscalYearId IS NOT NULL) 
		BEGIN				  
		--Step 1- delete all ledger list from Ledger_BalanceHistory table for NextFiscalYearId
		delete from ACC_LedgerBalanceHistory where FiscalYearId=@NextFiscalYearId
		
		--Step 2- Update closing balance of CurrentFiscalYear as 0
		Update ACC_LedgerBalanceHistory set ClosingBalance=0, ClosingDrCr=1 where FiscalYearId=@CurrentFiscalYearId

		--Step 3-calculate current fiscal year closing balance with ledgerid
		DECLARE @TBLCurrentFiscalYearCloseBalance TABLE (LedgerId INT Not null unique, Balance float, DrCr bit)
		Insert into @TBLCurrentFiscalYearCloseBalance(LedgerId, Balance, DrCr)
		select 		
		 LedgerId,
		 Case WHEN Dr>Cr THEN Dr-Cr  ELSE Cr-Dr END AS Balance,
		 Case WHEN Dr>Cr THEN 1  ELSE 0 END AS DrCr		
		 from 
		 (
			 select l.LedgerId,
			 Case WHEN DrCr=1 THEN isnull(OpeningBalance,0)+isnull(DrAmount,0)  ELSE isnull(DrAmount,0) END AS Dr,
			 Case WHEN DrCr=0 THEN  isnull(OpeningBalance,0)+IsNULL(CrAmount,0) ELSE IsNULL(CrAmount,0) END AS Cr
			 from ACC_Ledger l
			 left join
			 (
						 select LedgerId, sum(DrAmount) DrAmount, sum(CrAmount) CrAmount
						 from 
						 (
								 select LedgerId, Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount, Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
								 from ACC_TransactionItems ti join ACC_Transactions t on t.TransactionId=ti.TransactionId  
								 where t.FiscalYearId=@CurrentFiscalYearId
						 ) ledTxn group by LedgerId
			  )TxnDetails on TxnDetails.LedgerId=l.LedgerId
			) a
		--Step 4 --Update closing balance of current fiscal Year
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=bt.Balance, ClosingDrCr=bt.DrCr		
		from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId
		where FiscalYearId=@CurrentFiscalYearId		

		--Step 5- Insert all Ledgers with Next FiscalYearId into ACC_LedgerBalanceHistory, Here default opening balance is 0
		Insert into ACC_LedgerBalanceHistory (FiscalYearId, LedgerId, OpeningBalance, OpeningDrCr,CreatedBy, CreatedOn)		
		select @NextFiscalYearId, LedgerId,0,1,1 as CreatedBy, GETDATE() as CreatedOn from @TBLCurrentFiscalYearCloseBalance 

		--Step 6 - Update Next fiscal year assets and liability opening balance from current fiscal year closing balance
		 declare @Assets varchar(50)=(select name from ACC_MST_CodeDetails where code='008' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
		 declare @Liabilities varchar(50)=(select name from ACC_MST_CodeDetails where code='009' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
		 update ACC_LedgerBalanceHistory
		 set OpeningBalance=bt.Balance, ClosingDrCr=bt.DrCr
		 from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId
		 where FiscalYearId=@NextFiscalYearId and bt.LedgerId in
		 (
			   select LedgerId from ACC_Ledger l join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			   where PrimaryGroup in (@Assets, @Liabilities)
		 )
		 
		 --Step 7 -Forward Net Profit as Retain Earning for next fiscal year
		 declare @RetainEarnLedgerName varchar(50)=(select name from ACC_MST_CodeDetails where code='016' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))		
		 declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
		 declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
		 --revenue always Cr and Expenses alway Dr
		 Declare @TblNetProfit TABLE (NetProfit float, DrCr bit)
		 
		 insert into @TblNetProfit(NetProfit, DrCr)
		 select case when Expense > Revenue then Expense-Revenue else Revenue-Expense end NetProfit,
		 case when Expense > Revenue then 1 else 0 end DrCr
		 from 
		 ( 
			select sum(balance) as Expense				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=1 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where PrimaryGroup in (@Expenses)) ) as Rev,
			
			(select sum(balance) as Revenue				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=0 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where PrimaryGroup in (@Revenue)) 
		) b 

		update ACC_LedgerBalanceHistory 
		set OpeningBalance= (select top 1 NetProfit from @TblNetProfit), OpeningDrCr=(select top 1 DrCr from @TblNetProfit)
		where LedgerId=(select top 1 LedgerId from acc_Ledger where LedgerName=@RetainEarnLedgerName)
		and FiscalYearId=@NextFiscalYearId
		
		
		--Step 8- Update LedgerOpening Balance of Ledger table 
		update ACC_Ledger set OpeningBalance=bh.OpeningBalance, DrCr=bh.OpeningDrCr
		from ACC_LedgerBalanceHistory bh join ACC_Ledger l on l.LedgerId=bh.LedgerId
		where bh.FiscalYearId=@NextFiscalYearId
	
		END		
	END
	Go
--END: NageshBB: 20 June 2020: account closure sp


---start: sud/nagesh: 20Jun'20--- For Pharmacy Separation in A/C and Refactoring---

alter table acc_mst_hospital
add constraint UK_Acc_HospitalShortName Unique(HospitalShortName)
GO
     -- from vikas--
CREATE TABLE [dbo].[ACC_FiscalYear_Log](
  [LogId] [int] IDENTITY(1,1) NOT NULL,
  [FiscalYearId] [int] NULL,
  [LogType] [varchar](50) NULL,
  [LogDetails] [varchar](100) NULL,
  [CreatedOn] [datetime] NULL,
  [CreatedBy] [int] NULL,
 CONSTRAINT [PK_ACC_FiscalYear_Log] PRIMARY KEY CLUSTERED 
(
  [LogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


----New Column HospitalId added in required tables----
Alter Table ACC_MST_CostCenterItems
Add HospitalId INT Constraint FK_ACC_MST_CostCenterItems_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO

Alter Table [ACC_MST_FiscalYears]
Add HospitalId INT Constraint FK_ACC_MST_FiscalYears_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table [ACC_MST_LedgerGroup]
Add HospitalId INT Constraint FK_ACC_MST_LedgerGroup_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table ACC_MST_SectionList
Add HospitalId INT Constraint FK_ACC_MST_SectionList_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO

Alter Table ACC_MST_SectionList
Add HospitalId INT Constraint FK_ACC_MST_SectionList_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table [ACC_MST_VoucherHead]
Add HospitalId INT Constraint FK_ACC_MST_VoucherHead_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table [ACC_Ledger]
Add HospitalId INT Constraint FK_ACC_Ledger_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table [ACC_Ledger_Mapping]
Add HospitalId INT Constraint FK_ACC_Ledger_Mapping_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO

Alter Table [ACC_LedgerBalanceHistory]
Add HospitalId INT Constraint FK_ACC_LedgerBalanceHistory_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table [ACC_Map_TxnItemCostCenterItem]
Add HospitalId INT Constraint FK_ACC_Map_TxnItemCostCenterItem_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table [ACC_ReverseTransaction]
Add HospitalId INT Constraint FK_ACC_ReverseTransaction_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table [ACC_TransactionItems]
Add HospitalId INT Constraint FK_ACC_TransactionItems_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table [ACC_Transactions]
Add HospitalId INT Constraint FK_ACC_Transactions_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO
Alter Table ACC_FiscalYear_Log
Add HospitalId INT Constraint FK_ACC_FiscalYear_Log_Acc_MST_Hospital Foreign Key References Acc_MST_Hospital(HospitalId)
GO



---Function and StoredProc changes for Pharmacy Separation---

------Removed---
--SP_ACC_GetBillingTransactions 
--[SP_ACC_GetBilTxnItemsServDeptWise]
--[SP_Report_ACC_ProfitLossStatement]  
--[SP_Report_ACC_TrailBalance]  
--SP_Accounting_GetAllEmployee_LedgerList 

-----Altered---
--[dbo].[FN_ACC_GetIncomeLedgerName]
--[dbo].[SP_ACC_AccountClosure]
--[SP_ACC_Bill_GetBillingDataForAccTransfer]
--[dbo].[SP_ACC_DailyTransactionReportDetails] 
--[SP_ACC_RPT_GetBalanceSheetData] 
--[SP_ACC_RPT_GetProfitAndLossData] 
--[SP_ACC_RPT_GetTrialBalanceData]

----Created--
--[SP_ACC_GetAllEmployee_LedgerList] 

-----Not Changed---
--SP_ACC_GetIncomeLedgerName_Updated 
--SP_ACC_GetInventoryTransactions  
--[SP_ACC_GetINVGoodsReceiptData]  
--SP_ACC_GetPharmacyTransactions 



Drop Procedure If Exists dbo.SP_ACC_GetBillingTransactions
GO
Drop procedure if exists [dbo].[SP_ACC_GetBilTxnItemsServDeptWise]
GO
Drop Procedure If Exists [dbo].[SP_Report_ACC_ProfitLossStatement]
GO
Drop Procedure If Exists [dbo].[SP_Report_ACC_TrailBalance]
GO
Drop Procedure If Exists [SP_Accounting_GetAllEmployee_LedgerList]  
GO


/****** Object:  UserDefinedFunction [dbo].[FN_ACC_GetIncomeLedgerName]    Script Date: 2020-06-20 6:26:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/*
-- =============================================
-- Author:		<salakha>
-- Create date: <23 Nov 2018>
-- Description:	<get income ledgers>
--change history:

S.No    Author/Date                   Remarks
------------------------------------------------
1.    Sud/Nagesh: 20Jun'20          Updated for HospitalId
-- =============================================
--select  dbo.[FN_ACC_GetIncomeLedgerName] ('LABORATORY','')
*/
ALTER FUNCTION [dbo].[FN_ACC_GetIncomeLedgerName]
 (@ServiceDeptName Varchar(200),@ItemName Varchar(200), @HospitalId INT)
RETURNS Varchar(300)

AS
BEGIN	
  Declare @retStringName varchar(300)
  if exists(select top 1  * from ACC_MST_Hospital where HospitalId=@HospitalId and IsActive=1)
  Begin
       set @retStringName= (select LedgerName from ACC_Ledger
	    where HospitalId = @HospitalId AND [Name]='RR_INCOME_SERVICESINCOME_SERVICES')
  End
  else 
  Begin   
  set @retStringName=  ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
			when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
			when (@ServiceDeptName='LABORATORY' and @ItemName='HISTO')  THEN ('HISTO') 
			when (@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY' and @ItemName like '%FNAC%')  THEN ('FNAC') 
			when (@ServiceDeptName='ATOMIC ABSORTION')
					OR(@ServiceDeptName='BIOCHEMISTRY')
					OR(@ServiceDeptName='CLNICAL PATHOLOGY')
					OR(@ServiceDeptName='CLINICAL PATHOLOGY')
					OR(@ServiceDeptName='CYTOLOGY')
					OR(@ServiceDeptName='KIDNEY BIOPSY')
					OR(@ServiceDeptName='SKIN BIOPSY')
					OR(@ServiceDeptName='CONJUNCTIVAL BIOPSY')
					OR(@ServiceDeptName='EXTERNAL LAB-3')
					OR(@ServiceDeptName='EXTERNAL LAB - 1')
					OR(@ServiceDeptName='EXTERNAL LAB - 2')
					OR(@ServiceDeptName='HISTOPATHOLOGY')
					OR(@ServiceDeptName='IMMUNOHISTROCHEMISTRY')
					OR(@ServiceDeptName='MOLECULAR DIAGNOSTICS')
					OR(@ServiceDeptName='SPECIALISED BIOPHYSICS ASSAYS')
					OR(@ServiceDeptName='SEROLOGY')
					OR(@ServiceDeptName='MICROBIOLOGY')
					OR(@ServiceDeptName='HEMATOLOGY') 
					OR(@ServiceDeptName='LABORATORY')
					OR(@ServiceDeptName='LAB CHARGES') THEN ('PATHOLOGY')
					
		   WHEN (@ServiceDeptName='DUCT')
					OR(@ServiceDeptName='MAMMOLOGY')
					OR(@ServiceDeptName='PERFORMANCE TEST') 
					OR(@ServiceDeptName='MRI')
					OR(@ServiceDeptName='C.T. SCAN')
					OR(@ServiceDeptName='ULTRASOUND')
					OR(@ServiceDeptName='ULTRASOUND COLOR DOPPLER')
					OR(@ServiceDeptName='BMD-BONEDENSITOMETRY')
					OR(@ServiceDeptName='OPG-ORTHOPANTOGRAM')
					OR(@ServiceDeptName='MAMMOGRAPHY')
					OR(@ServiceDeptName='X-RAY')
					OR(@ServiceDeptName='DEXA')
					OR(@ServiceDeptName='IMAGING')  		THEN ('RADIOLOGY')
		  when (@ServiceDeptName='MISCELLANEOUS')
					OR (@ServiceDeptName='MISCELLENOUS CHARGES')
															then ('MISCELLANEOUS')
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
				OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )
 
  end
  return @retStringname
END
GO



/****** Object:  StoredProcedure [dbo].[SP_ACC_AccountClosure]    Script Date: 2020-06-20 6:11:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_AccountClosure]
		@CurrentFiscalYearId int,
			@NextFiscalYearId int,
			@HospitalId int
	AS
	--EXEC [dbo].[SP_ACC_AccountClosure] @CurrentFiscalYearId = 1, @NextFiscalYearId =2
	
	/************************************************************************
	FileName: [SP_ACC_AccountClosure]
	CreatedBy/date: Nagesh /19'June2020
	Description: sp will close current fiscal year. add closing balance and forward closing for next fiscal year as opening balance
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /19'June2020						created script for account closure task
	2.      Sud/Nagesh:20Jun'20                    HospitalId added for Phrm-Acc Separation
	*************************************************************************/
	BEGIN
	
		IF(@CurrentFiscalYearId IS NOT NULL AND @NextFiscalYearId IS NOT NULL) 
		BEGIN				  
		--Step 1- delete all ledger list from Ledger_BalanceHistory table for NextFiscalYearId
		delete from ACC_LedgerBalanceHistory 
		where FiscalYearId=@NextFiscalYearId and HospitalId=@HospitalId
		
		--Step 2- Update closing balance of CurrentFiscalYear as 0
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=0, ClosingDrCr=1 
		where FiscalYearId=@CurrentFiscalYearId  and HospitalId=@HospitalId

		--Step 3-calculate current fiscal year closing balance with ledgerid
		DECLARE @TBLCurrentFiscalYearCloseBalance TABLE (LedgerId INT Not null unique, Balance float, DrCr bit, hospitalId int)
		Insert into @TBLCurrentFiscalYearCloseBalance(LedgerId, Balance, DrCr, hospitalId)
		select 		
		 LedgerId,
		 Case WHEN Dr>Cr THEN Dr-Cr  ELSE Cr-Dr END AS Balance,
		 Case WHEN Dr>Cr THEN 1  ELSE 0 END AS DrCr	,
		 HospitalId	
		 from 
		 (
			 select l.LedgerId,
			 Case WHEN DrCr=1 THEN isnull(OpeningBalance,0)+isnull(DrAmount,0)  ELSE isnull(DrAmount,0) END AS Dr,
			 Case WHEN DrCr=0 THEN  isnull(OpeningBalance,0)+IsNULL(CrAmount,0) ELSE IsNULL(CrAmount,0) END AS Cr,
			 l.HospitalId
			 from ACC_Ledger l
			 left join
			 (
						 select LedgerId, sum(DrAmount) DrAmount, sum(CrAmount) CrAmount
						 from 
						 (
								 select LedgerId, Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount, Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
								 from ACC_TransactionItems ti join ACC_Transactions t on t.TransactionId=ti.TransactionId  
								 where t.FiscalYearId=@CurrentFiscalYearId and  t.HospitalId=@HospitalId
						 ) ledTxn group by LedgerId
			  )TxnDetails 
			  on TxnDetails.LedgerId=l.LedgerId and l.HospitalId=@HospitalId

			) a
		--Step 4 --Update closing balance of current fiscal Year
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=bt.Balance, ClosingDrCr=bt.DrCr		
		from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId and bt.hospitalId = bh.HospitalId	
		where FiscalYearId=@CurrentFiscalYearId	and  bh.HospitalId = @HospitalId	

		--Step 5- Insert all Ledgers with Next FiscalYearId into ACC_LedgerBalanceHistory, Here default opening balance is 0
		Insert into ACC_LedgerBalanceHistory (FiscalYearId, LedgerId, OpeningBalance, OpeningDrCr,CreatedBy, CreatedOn, HospitalId)		
		select @NextFiscalYearId, LedgerId,0,1,1 as CreatedBy, GETDATE() as CreatedOn, hospitalId
		from @TBLCurrentFiscalYearCloseBalance 

		--Step 6 - Update Next fiscal year assets and liability opening balance from current fiscal year closing balance
		 declare @Assets varchar(50)=(select name from ACC_MST_CodeDetails where code='008' and HospitalId=@HospitalId)
		 declare @Liabilities varchar(50)=(select name from ACC_MST_CodeDetails where code='009' and HospitalId=@HospitalId)
		 update ACC_LedgerBalanceHistory
		 set OpeningBalance=bt.Balance, ClosingDrCr=bt.DrCr
		 from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId
		 where FiscalYearId=@NextFiscalYearId  and bh.HospitalId=@HospitalId
		 and bt.LedgerId in
		 (
			   select LedgerId from ACC_Ledger l join ACC_MST_LedgerGroup lg 
			                       on l.LedgerGroupId=lg.LedgerGroupId
			   where l.HospitalId=@HospitalId AND PrimaryGroup in (@Assets, @Liabilities)
		 )
		 
		 --Step 7 -Forward Net Profit as Retain Earning for next fiscal year
		 declare @RetainEarnLedgerName varchar(50)=(select name from ACC_MST_CodeDetails where code='016' and HospitalId=@HospitalId)		
		 declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=@HospitalId)
		 declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=@HospitalId)
		 --revenue always Cr and Expenses alway Dr
		 Declare @TblNetProfit TABLE (NetProfit float, DrCr bit)
		 
		 insert into @TblNetProfit(NetProfit, DrCr)
		 select case when Expense > Revenue then Expense-Revenue else Revenue-Expense end NetProfit,
		 case when Expense > Revenue then 1 else 0 end DrCr
		 from 
		 ( 
			select sum(balance) as Expense				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=1 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in (@Expenses)) ) as Rev,
			
			(select sum(balance) as Revenue				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=0 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in (@Revenue)) 
		) b 

		update ACC_LedgerBalanceHistory 
		set OpeningBalance= (select top 1 NetProfit from @TblNetProfit), OpeningDrCr=(select top 1 DrCr from @TblNetProfit)
		where LedgerId=(select top 1 LedgerId from acc_Ledger where HospitalId=@HospitalId AND LedgerName=@RetainEarnLedgerName)
		and FiscalYearId=@NextFiscalYearId AND HospitalId=@HospitalId
		
		
		--Step 8- Update LedgerOpening Balance of Ledger table 
		update ACC_Ledger set OpeningBalance=bh.OpeningBalance, DrCr=bh.OpeningDrCr
		from ACC_LedgerBalanceHistory bh join ACC_Ledger l on l.LedgerId=bh.LedgerId
		where bh.FiscalYearId=@NextFiscalYearId and bh.HospitalId=@HospitalId
	
		END		
	END
	GO
	




/****** Object:  StoredProcedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]    Script Date: 2020-06-20 6:24:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER Procedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]
  @TransactionDate DATE, @HospitalId INT
AS

/**************************************************
Stored Procedure Name:SP_ACC_Bill_GetBillingDataForAccTransfer
Details:
-This stored procedure will get billing module data for transfer to accounting by date
-We are getting billing records, deposit records, etc
	
 Change History:
 ----------------------------------------------------------------------------------
 S.No.   Author					Date               Remarks
 ----------------------------------------------------------------------------------
 1.      NageshBB & Sud sir		16/03/2020        Stored procedure created
 2.     Nagesh/Sud               8May'20          Paymentmode=card handled in billingtransaction
 ----------------------------------------------------------------------------------

**********************************************/
BEGIN

  IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
  BEGIN
  
  SELECT * from BIL_SYNC_BillingAccounting 
  WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @TransactionDate) AND CONVERT(date, @TransactionDate)
  END
  ELSE
  BEGIN    
 --Note:-BillingAccountingSyncId added for temporary pupose because code mapping model has this column , later we need to remove this 
------Cash Bill----------CashBill->BIL_TXN_BillingTransactionItems->BillingTransactionItemId  (TransactionType->TableName->ReferenceId Column Name)
			 Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBill' TransactionType,
			  'cash' As PaymentMode, 
			 --txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 itm.PaidDate 'TransactionDate',
			 GetDate() 'CreatedOn',
			 itm.PaymentReceivedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.PaidDate) = @TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			  --- sud/nagesh:8may'20-- below case should be separated for card and cheque after requirement comes for this..
			 and ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')
			 AND ISNULL(itm.IsCashBillSync,0) = 0  -- Include only Not-Synced Data for CashBill Case--
			
			
			
			UNION ALL
			
---------Credit Bill----------------------------------------------CreditBill-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBill' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 txn.CreatedOn 'TransactionDate', -- this is credit date.. 
			 GetDate() 'CreatedOn',
			 itm.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.CreatedOn)=@TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillSync,0) = 0  -- Include only Not-Synced Data for CreditBill Case--
					

			UNION ALL
			
-----------------Credit Bill Paid-----CreditBillPaid-BillingTransactionId-BIL_TXN_BillingTransaction
		--for now we are commenting this function, later we will get creditbill paid records
			--Select 
			-- txn.BillingTransactionId as BillingAccountingSyncId,
			-- txn.BillingTransactionId AS 'ReferenceId',
			-- 'CreditBillPaid' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it, we might need CreditOrganization's LEdger here.. 
			--  sett.PatientId,
			-- 'CreditBillPaid' TransactionType,
			--  sett.PaymentMode As PaymentMode, 
			-- NULL SubTotal,
			-- 0 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- txn.TotalAmount AS TotalAmount,
			
			-- 0 AS IsTransferedToAcc,
			-- SettlementDate 'TransactionDate', -- this is credit date.. 
			-- GetDate() 'CreatedOn',
			-- sett.CreatedBy AS CreatedBy,
			-- NULL AS SettlementDiscountAmount,  -- Can't take this here, it'll go separately into Cash Discount LEdger.. 
			-- NULL AS Remark,
			-- txn.OrganizationId AS CreditOrganizationId   -- correct it after Settlement is separated for CreditOrginizations.
			--from BIL_TXN_Settlements sett, BIL_TXN_BillingTransaction txn
			
			--Where 
			--     sett.SettlementId = txn.SettlementId
			--   AND Convert(Date,SettlementDate)=@TransactionDate
			--   AND ISNULL(txn.IsCreditBillPaidSync,0) = 0  -- Include only Not-Synced Data for Credit Paid Case--
			
			--UNION ALL
			
-----------------------Cash Bill Return---CashBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate--sud-19March this should've been createdon of return table..
			 and ISNULL(itm.ReturnStatus,0) != 0  
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='cash'
			 AND ISNULL(itm.IsCashBillReturnSync,0) = 0  -- Include only Not-Synced Data for CashBill Return Case--
			
			UNION ALL
			
------------CreditBillReturn--- done with join from Transaction, TransactionItem and InvoiceReturn Table--CreditBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			   txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate
			 and ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  -- Include only Not-Synced Data for Credit Return Case--
			
			 UNION ALL
			
------------------Deposit Add---DepositAdd-DepositId-BIL_TXN_Deposit
			Select 
			 DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositAdd' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType ='Deposit'
			AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			UNION ALL
			
-------Deposit Return/Deduct---DepositReturn-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositReturn' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType IN ('ReturnDeposit', 'depositdeduct')
			 AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			
			---UNION ALL--
			
---------Cash discount -- from settlement-- New new Transfer rule for this---CashDiscount-SettlementId-BIL_TXN_Settlements
			--Select 
			--SettlementId as BillingAccountingSyncId,
			-- SettlementId 'ReferenceId',
			-- 'CashDiscount' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it
			--  PatientId,
			-- 'CashDiscount' TransactionType,
			-- PaymentMode As PaymentMode, 
			-- NULL AS SubTotal,
			-- NULL AS 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- DiscountAmount AS TotalAmount,    -- use this column if possible
			-- 0 AS IsTransferedToAcc,
			-- CreatedOn 'TransactionDate',
			-- GetDate() 'CreatedOn',
			-- CreatedBy AS CreatedBy,
			-- DiscountAmount AS SettlementDiscountAmount,  -- don't use this column if possible.
			-- NULL AS Remark,
			-- NULL AS CreditOrganizationId  
			--from BIL_TXN_Settlements
			
			--Where 
			--  Convert(Date,CreatedOn)=@TransactionDate
			--  AND ISNULL(DiscountAmount,0) != 0  -- exclude zero discount, since it's not needed.
			--  AND ISNULL(IsCashDiscountSync,0) = 0  -- Include only Not-Synced Data	
  END			  					
END
GO

/****** Object:  StoredProcedure [dbo].[SP_ACC_DailyTransactionReportDetails]    Script Date: 2020-06-20 6:34:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER Procedure [dbo].[SP_ACC_DailyTransactionReportDetails] 
	@VoucherNumber varchar(50), @HospitalId INT	
AS

BEGIN
 Declare @TransactionType varchar(max),@ReferenceIds varchar(200)
 SET @TransactionType = (Select STRING_AGG(TransactionType, ',') as 'TrasactionType' 
						 From ACC_Transactions 
						 Where HospitalId= @HospitalId AND	 VoucherNumber = @VoucherNumber )
 
 SET @ReferenceIds =(Select STRING_AGG(ReferenceId, ',') as 'TrasactionType' 
					 From ACC_Transactions txn 
					 JOIN ACC_TXN_Link txnLink on txn.TransactionId= txnLink.TransactionId
					 WHERE  txn.HospitalId= @HospitalId AND txn.VoucherNumber =@VoucherNumber ) 



 IF(('DepositAdd') IN(select * from STRING_SPLIT(@TransactionType, ','))
   OR ('DepositReturn') IN(select * from STRING_SPLIT(@TransactionType, ',')) )
		SELECT 
			pat.FirstName + ' ' + ISNULL(pat.MiddleName,'') + ' ' + pat.LastName  as 'PatientName',
			dep.ReceiptNo as 'ReceiptNo',
			SUM(dep.Amount) as 'TotalAmount',
			dep.PaymentMode as 'PaymentMode'
		FROM BIL_TXN_Deposit dep 	
		join PAT_Patient pat on dep.PatientId = pat.PatientId
		WHERE dep.DepositId in (select * from STRING_SPLIT(@ReferenceIds, ',')) 

		GROUP BY
			pat.FirstName,pat.MiddleName,pat.LastName,
			dep.ReceiptNo ,
			dep.PaymentMode 

 IF( ('CashBill') IN(select * from STRING_SPLIT(@TransactionType, ','))
	OR ('CreditBill') IN(select * from STRING_SPLIT(@TransactionType, ','))
	OR ('CashBillReturn') IN(select * from STRING_SPLIT(@TransactionType, ','))
	OR ('CreditBillReturn') IN(select * from STRING_SPLIT(@TransactionType, ','))
   )
		SELECT 
				txn.InvoiceCode + cast(txn.InvoiceNo as varchar) as InvoiceNo,
				pat.FirstName + ' ' + ISNULL(pat.MiddleName,'') + ' ' + pat.LastName  as 'PatientName',
				itm.*
		FROM BIL_TXN_BillingTransactionItems itm 
				join BIL_TXN_BillingTransaction txn on itm.BillingTransactionId= txn.BillingTransactionId
				join PAT_Patient pat on itm.PatientId = pat.PatientId 
		WHERE itm.BillingTransactionItemId in (select * from STRING_SPLIT(@ReferenceIds, ','))

END
GO

/****** Object:  StoredProcedure [dbo].[SP_ACC_RPT_GetBalanceSheetData]    Script Date: 2020-06-20 6:45:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_RPT_GetBalanceSheetData]
    @FromDate DATETIME,
    @ToDate DATETIME, 
	@HospitalId INT
  AS
  --EXEC [dbo].[SP_ACC_RPT_GetBalanceSheetData] @FromDate = '2020-06-11 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
  
  /************************************************************************
  FileName: [SP_ACC_RPT_GetBalanceSheetData]
  CreatedBy/date: Nagesh /12'June2020
  Description: get records for balance sheet report of accounting
  Change History
  -------------------------------------------------------------------------
  S.No.    UpdatedBy/Date                        Remarks
  -------------------------------------------------------------------------
  1       Nagesh /12'June2020            created script for get balance sheet report records
  2       Sud sir/13'June 2020          updated for get table 2 with NetProfit details
  3.     Sud/Nagesh: 20Jun'20           Updated for HospitalId separation for PHrm  
  *************************************************************************/
  BEGIN  
    IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
    BEGIN  
        --adding 1minute to the startdate since our fiscal year table has earlier day's 23:59:59 as start date---
        -- we could add 5minutes, 50 minutes, no problem--
        Set @FromDate= ( Select StartDate+ '00:01:00' from ACC_MST_FiscalYears where HospitalId=@HospitalId AND IsActive=1)
    
        --Table:1 Get Balance Sheet Details---          
        Select 
				ledInfo.LedgerId,PrimaryGroup, LedgerName,COA,LedgerGroupName,Code
				, OpeningBalanceDr, OpeningBalanceCr, ISNULL(Led_TotDr,0) AS 'DRAmount', ISNULL(Led_TotCr,0) AS 'CRAmount' 
          from
          (
					Select l.LedgerId, l.LedgerName, l.Code,  l.ledgergroupid, lg.PrimaryGroup, lg.COA, lg.LedgerGroupName , 
					case when l.DrCr=1 then l.OpeningBalance else 0 END AS 'OpeningBalanceDr',
					case when l.DrCr=0 then l.OpeningBalance else 0 END AS 'OpeningBalanceCr' 
					from ACC_Ledger l INNER JOIN ACC_MST_LedgerGroup lg
					ON l.LedgerGroupId = lg.LedgerGroupId
					WHERE  l.HospitalId=@HospitalId 
          ) ledInfo
          LEFT JOIN
          ( 
            Select LedgerId,SUM(DrAmount) AS 'Led_TotDr', SUM(CrAmount) 'Led_TotCr' from
            (
					Select  txn.TransactionId, LedgerId,
                    Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
					Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
					from  ACC_TransactionItems txnItm INNER JOIN ACC_Transactions txn
					ON txnItm.TransactionId = txn.TransactionId
					WHERE 
					txn.HospitalId= @HospitalId AND
					convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
              ) A
              Group By LedgerId
          ) ledTxnDetails 
			ON ledInfo.LedgerId= ledTxnDetails.LedgerId
			Order by ledInfo.LedgerName


  
  --Table2: Get NetProfit and Loss ---
        declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=@HospitalId)
        declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=@HospitalId)
		Select SUM(RevenueBalance) - SUM(ExpenseBalance)   'NetProfitNLoss'
          FROM
        ( 
          Select 
            Case When PrimaryGroup=@Revenue THEN TotalDrAmount - TotalCrAmount ELSE 0 END AS 'ExpenseBalance',
            Case When PrimaryGroup=@Expenses THEN TotalCrAmount - TotalDrAmount  ELSE 0 END AS 'RevenueBalance'
            from 
          (
              ---Query2.1: P&L on Opening Balance----
              --- ideally Opening balances of P&L accounts will be zero. It'll give correct  results even in that case---
               Select ledGrp.PrimaryGroup, SUM(led.DrAmount) 'TotalDrAmount', SUM(led.CrAmount) 'TotalCrAmount'
 
                from
                 (		Select   LedgerId,LedgergroupId,
						Case WHEN DrCr=1 THEN OpeningBalance ELSE 0 END AS DrAmount,
						Case WHEN DrCr=0 THEN OpeningBalance ELSE 0 END AS CrAmount,
						HospitalId 
						from  ACC_Ledger  where HospitalId=@HospitalId)   led 
						INNER  JOIN ACC_MST_LedgerGroup ledGrp
						ON led.LedgerGroupId = ledGrp.LedgerGroupId           
						Where led.HospitalId= @HospitalId 
						 AND ledGrp.hospitalid=@HospitalId 
						 AND ledGrp.PrimaryGroup IN (@Revenue,@Expenses)
						Group by ledGrp.PrimaryGroup
               UNION ALL  
              --Query:2.2-- Get Profit&Loss on Transaction Amounts
						Select lg.PrimaryGroup,  SUM(txnItm.DrAmount) 'TotalDrAmount',SUM(txnItm.CrAmount) 'TotalCrAmount'
                        FROM ACC_Transactions  txn
						INNER JOIN 
                        (		Select  
								TransactionId, LedgerId,
								Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
								Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
								from  ACC_TransactionItems  where HospitalId=@HospitalId ) txnItm 
        
						ON txn.TransactionId = txnItm.TransactionId
						INNER JOIN ACC_Ledger l
						ON txnItm.LedgerId = l.LedgerId
						INNER JOIN ACC_MST_LedgerGroup lg
						ON l.LedgerGroupId = lg.LedgerGroupId   and lg.PrimaryGroup IN (@Revenue,@Expenses)        
                  WHERE
				  txn.HospitalId= @HospitalId AND l.HospitalId = @HospitalId AND
                    convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
                  Group by lg.PrimaryGroup
          ) A
        ) B
                
    END    
  END
  GO


/****** Object:  StoredProcedure [dbo].[SP_ACC_RPT_GetProfitAndLossData]    Script Date: 2020-06-20 6:51:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_RPT_GetProfitAndLossData]
		@FromDate DATETIME,
		@ToDate DATETIME,
		@HospitalId INT
	AS
	--EXEC [dbo].[SP_ACC_RPT_GetProfitAndLossData] @FromDate = '2020-06-12 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
	
	/************************************************************************
	FileName: [[SP_ACC_RPT_GetProfitAndLossData]]
	CreatedBy/date: Nagesh /12'June2020
	Description: get records for profit & Loss report of accounting
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /12'June2020						created script for get profit and loss report records
	2.      Sud/Nagesh: 20Jun'20                   Added HospitalId for Phrm-Separation
	*************************************************************************/
	BEGIN
	
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
		BEGIN				  
		   declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
		 declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=(select HospitalId from ACC_MST_Hospital where HospitalShortName='charak'))
		
		Select l.LedgerId, 
		lg.PrimaryGroup, 
		l.LedgerName,
		lg.COA, 
		lg.LedgerGroupName, 
		l.Code, 
		SUM(txnItm.DrAmount) 'DRAmount', 
		SUM(txnItm.CrAmount) 'CRAmount'
        FROM ACC_Transactions  txn
        INNER JOIN 
          (Select  
         TransactionId, LedgerId,
         Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
         Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
         from  ACC_TransactionItems where HospitalId=@HospitalId ) txnItm 
         ON txn.TransactionId = txnItm.TransactionId
         INNER JOIN ACC_Ledger l
         ON txnItm.LedgerId = l.LedgerId
         INNER JOIN ACC_MST_LedgerGroup lg
         ON l.LedgerGroupId = lg.LedgerGroupId   and lg.PrimaryGroup IN (@Revenue, @Expenses)
		WHERE  l.HospitalId=@HospitalId  and lg. HospitalId=@HospitalId and
		convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
		Group by l.LedgerId, lg.PrimaryGroup, l.LedgerName,lg.COA, lg.LedgerGroupName, l.Code
	
		END		
	END
GO  


/****** Object:  StoredProcedure [dbo].[SP_ACC_RPT_GetTrialBalanceData]    Script Date: 2020-06-20 6:52:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_RPT_GetTrialBalanceData]
		@FromDate DATETIME,
		@ToDate DATETIME,
		@HospitalId INT
	AS
	--EXEC [dbo].[SP_ACC_RPT_GetTrialBalanceData] @FromDate = '2020-06-11 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
	
	/************************************************************************
	FileName: [SP_ACC_RPT_GetTrialBalanceData]
	CreatedBy/date: Nagesh /11'June2020
	Description: get records for trail balance report of accounting
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /11'June2020						created script for get trial balance records
	2.      Sud/Nagesh: 20Jun'20                   Added HospitalId for Phrm separation
	*************************************************************************/
	BEGIN
	
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
		BEGIN
		--here we are getting plain records all grouping and data modification as per need we will do in controller 
		--using linq we will do all modification this will return plain records only
		--Now we are getting ledger opening balance from ledger table later we will update sp
		--and we will get data from ledger balance history table 
		 Declare @fiscalYearStartDate datetime
		 set @fiscalYearStartDate=(select top 1 Startdate from ACC_MST_FiscalYears
									where HospitalId=@HospitalId AND
									convert(date,StartDate) <=convert(date,@FromDate) and 
									convert(date,EndDate) >=convert(date,@FromDate))
			
		 select 				
				lg.PrimaryGroup, 
				lg.COA,
				lg.LedgerGroupName,
				l.LedgerName, 
				l.LedgerId
				,l.Code
				,max(case when l.DrCr=1 then l.OpeningBalance else 0 END) as OpeningBalDr
				,max(case when l.DrCr=0 then l.OpeningBalance else 0 END) as OpeningBalCr
				,sum(case when ti.DrCr=1 and convert(date,t.TransactionDate) < convert(date,@FromDate) then ISNULL(ti.Amount,0) else 0 END) as OpeningDr
				,sum(case when ti.DrCr=0 and convert(date,t.TransactionDate) < convert(date,@FromDate) then ISNULL(ti.Amount,0) else 0 END) as OpeningCr
				,sum(case when ti.DrCr=1 and convert(date,t.TransactionDate) >=convert(date,@FromDate)  then ISNULL(ti.Amount,0) else 0 END)  CurrentDr
				,sum(case when ti.DrCr=0 and convert(date,t.TransactionDate) >=convert(date,@FromDate)  then ISNULL(ti.Amount,0) else 0 END)  CurrentCr				
		 from ACC_Ledger l
					left join ACC_MST_LedgerGroup lg on l.LedgerGroupId =lg.LedgerGroupId
					left join  ACC_TransactionItems ti on l.LedgerId= ti.LedgerId
					left join ACC_Transactions t on ti.TransactionId=t.TransactionId  and 
				    convert(date, t.TransactionDate)>= convert(date,@fiscalYearStartDate) and convert(date, t.TransactionDate)<= convert(date,@ToDate) 
          Where l.HospitalId = @HospitalId AND lg.HospitalId = @HospitalId AND t.HospitalId = @HospitalId
		  group by lg.PrimaryGroup, 
						lg.COA,
						lg.LedgerGroupName,
						l.LedgerName, 
						l.LedgerId
						,l.Code
				order by l.LedgerName				
		END		
	END
	GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* ***********************************************************************
FileName: [SP_ACC_GetAllEmployee_LedgerList]  
CreatedBy/date: Anish/Apr-2020
Description: To get ledger details for Consultant ledgers from acc-mapping table 
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1.      Sud/Nagesh:20Jun'20                    HospitalId added for Phrm-Acc Separation
************************************************************************ */

CREATE PROCEDURE [dbo].[SP_ACC_GetAllEmployee_LedgerList]  
  @HospitalId INT
AS
BEGIN
  Select led.LedgerId, consLedMap.ReferenceId 'EmployeeId',
  led.LedgerName, led.Code 'LedgerCode', ledGrp.LedgerGroupName
  from ACC_Ledger led, ACC_MST_LedgerGroup ledGrp, 
  (Select * from ACC_Ledger_Mapping where LedgerType='consultant' and HospitalId=@HospitalId) consLedMap
  Where led.LedgerGroupId=ledGrp.LedgerGroupId
    and led.LedgerId=consLedMap.LedgerId 
    and led.HospitalId = @HospitalId and ledGrp.HospitalId=@HospitalId
END
GO


Alter Table ACC_MST_SectionList
Add IsDefault BIT NOT NULL Constraint DEF_ACC_MST_SectionList_IsDefault  Default(0)
GO
Alter Table ACC_MST_SectionList
Add IsActive BIT NOT NULL Constraint DEF_ACC_MST_SectionList_IsActive  Default(1)
GO
Alter Table ACC_MST_FiscalYears
Add Constraint DEF_ACC_MST_FiscalYears_IsActive  Default(1) for IsActive
GO
---End: sud/nagesh: 20Jun'20--- For Pharmacy Separation in A/C and Refactoring---

---START: NageshBB: 22 June 2020: sp for reopen fiscal year and update HospitalId in all table ----


Drop procedure If exists dbo.SP_ACC_ReopenFiscalYear
Go

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[SP_ACC_ReopenFiscalYear]
		@FiscalYearId int,
		@EmployeeId int,
		@HospitalId INT,
		@Remark varchar(300)
	AS
	--EXEC [dbo].[SP_ACC_ReopenFiscalYear] @FiscalYearId = 2, @EmployeeId =1,@HospitalId=3
	
	/************************************************************************
	FileName: [SP_ACC_ReopenFiscalYear]
	CreatedBy/date: Nagesh /22'June2020
	Description: reopen fiscal year, add log into fiscalYearLog table and update ledger balance as per opened fiscalYear
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /22'June2020						created script for reopen fiscal year, add log and update ledger balance
	
	*************************************************************************/
	BEGIN	
		IF(@FiscalYearId IS NOT NULL AND @EmployeeId IS NOT NULL AND @HospitalId IS NOT NULL) 
		BEGIN				  
		   BEGIN TRANSACTION;
				SAVE TRANSACTION MySavePoint;  
				BEGIN TRY
					--code is here
					--update fiscal year closed to open 
					Update ACC_MST_FiscalYears set IsClosed=0
					where FiscalYearId=@FiscalYearId and HospitalId=@HospitalId
					
					--add log into ACC_FiscalYear_Log table
					Insert into ACC_FiscalYear_Log(FiscalYearId, LogType, LogDetails, CreatedOn, CreatedBy,HospitalId)
					values(@FiscalYearId,'reopened',@Remark,GETDATE(),@EmployeeId,@HospitalId)
					
					--update ACC_Ledger opening balance by opened fiscal year opening balance from LedgerBalanceHistory table					
					Update ACC_Ledger
					set OpeningBalance=lbh.OpeningBalance,
					DrCr=lbh.OpeningDrCr from ACC_LedgerBalanceHistory lbh
					join ACC_Ledger l on lbh.LedgerId=l.LedgerId and lbh.FiscalYearId=@FiscalYearId and lbh.HospitalId=@HospitalId
					
					select *from ACC_MST_FiscalYears where FiscalYearId=@FiscalYearId and HospitalId=@HospitalId
				COMMIT TRANSACTION 
				END TRY
				BEGIN CATCH
					IF @@TRANCOUNT > 0
					BEGIN
						ROLLBACK TRANSACTION MySavePoint; -- rollback to MySavePoint
					END
				END CATCH	
		END		
	END
	Go
---END: NageshBB: 22 June 2020: sp for reopen fiscal year and update HospitalId in all table ----


-- START:VIKAS: 24th June 2020: Added permission for system audit report in accounting and created sp fot this report.

declare @ApplicationId INT
SET @ApplicationId = (Select TOp (1) ApplicationId from RBAC_Application 
where ApplicationName = 'Accounting' and ApplicationCode= 'AC');

INSERT INTO RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('report-Accounting-SystemAuditReport-view',@ApplicationId,1,GETDATE(),1)
go
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
 where PermissionName='report-Accounting-SystemAuditReport-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
 where UrlFullPath = 'Accounting/Reports')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('System Audit Report','Accounting/Reports/SystemAuditReport','SystemAuditReport',@permissionId,@parentRouteId,1,1)
go
--------------------------

-- start sp--
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Acc_RPT_GetSystemAduitReport]
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@voucherReportType varchar(50)=null
AS
/*
FileName: [SP_ACC_RPT_GetSystemAduitReport]
CreatedBy/date:
Description: 
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date         Remarks
-------------------------------------------------------
1       Vikas/24 June 2020      Get report for system log records of edit voucher, reversal transaction, back date entry for accounting.
-------------------------------------------------------
*/
BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	BEGIN
	IF (@voucherReportType='EditVoucher')  
	BEGIN
	-- START: Edit Voucher Logs Details
	select
		fs.FiscalYearName,
		lg.SectionId,
		sc.SectionName,
		lg.TransactionDate,
		lg.VoucherNumber,
		lg.Reason,
		lg.CreatedOn,
		lg.CreatedBy,
		lg.LogId,
		usr.FullName
	from ACC_Log_EditVoucher lg
		left join ACC_MST_FiscalYears fs on lg.FiscalYearId = fs.FiscalYearId
		left join ACC_MST_SectionList sc on lg.SectionId = sc.SectionId
		left join EMP_Employee usr on lg.CreatedBy = usr.EmployeeId
    where CONVERT(date, lg.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
	-- END: Edit Voucher Logs Details
	END
	ELSE IF (@voucherReportType='VoucherReversal')  
	BEGIN
	-- START: Reversal voucher txn Logs Details
	select
		accR.ReverseTransactionId,
		fs.FiscalYearName,
		sc.SectionName,
		accR.TransactionDate,
		accR.Reason,
		accR.CreatedOn,
		accR.CreatedBy,
		usr.FullName
	from ACC_ReverseTransaction accR
		left join ACC_MST_FiscalYears fs on accR.FiscalYearId = fs.FiscalYearId
		left join ACC_MST_SectionList sc on accR.Section = sc.SectionId
		left join EMP_Employee usr on accR.CreatedBy = usr.EmployeeId
	where CONVERT(date, accR.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
 
	-- END: Reversal voucher txn Logs Details
	END
	ELSE IF (@voucherReportType='BackDateEntry')  
	BEGIN
	-- START: Back Date Entry txn Logs Details
	select 
		txn.TransactionId,
		txn.SectionId,
		sc.SectionName,
		txn.TransactionDate,
		txn.VoucherNumber,
		txn.CreatedOn,
		txn.CreatedBy,
		usr.FullName
	from ACC_Transactions txn
		left join ACC_MST_SectionList sc on txn.SectionId = sc.SectionId
		left join EMP_Employee usr on txn.CreatedBy = usr.EmployeeId
	where CONVERT(date, txn.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
 
	-- END: Back Date Entry txn Logs Details
	END

	END
	
END
GO

-- END:VIKAS: 24th June 2020: Added permission for system audit report in accounting and created sp fot this report.

--START: NageshBB: 02 Jul 2020: script for account closure sp changes 

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_AccountClosure]
		@CurrentFiscalYearId int,
			@NextFiscalYearId int,
			@HospitalId int
	AS
	--EXEC [dbo].[SP_ACC_AccountClosure] @CurrentFiscalYearId = 1, @NextFiscalYearId =2
	
	/************************************************************************
	FileName: [SP_ACC_AccountClosure]
	CreatedBy/date: Nagesh /19'June2020
	Description: sp will close current fiscal year. add closing balance and forward closing for next fiscal year as opening balance
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /19'June2020						created script for account closure task
	2.      Sud/Nagesh:20Jun'20                    HospitalId added for Phrm-Acc Separation
	3.		Nagesh/02Jul'20							sp changes for account closure task working
	*************************************************************************/
	BEGIN
	
		IF(@CurrentFiscalYearId IS NOT NULL AND @NextFiscalYearId IS NOT NULL) 
		BEGIN				  
	
		--Step 1- delete all ledger list from Ledger_BalanceHistory table for NextFiscalYearId		
		delete from ACC_LedgerBalanceHistory 
		where FiscalYearId=@NextFiscalYearId and HospitalId=@HospitalId
		
		--Step 2- Update closing balance of CurrentFiscalYear as 0
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=0, ClosingDrCr=1 
		where FiscalYearId=@CurrentFiscalYearId  and HospitalId=@HospitalId

		--Step 3-calculate current fiscal year closing balance with ledgerid
		DECLARE @TBLCurrentFiscalYearCloseBalance TABLE (LedgerId INT Not null unique, Balance float, DrCr bit, hospitalId int)
		Insert into @TBLCurrentFiscalYearCloseBalance(LedgerId, Balance, DrCr, hospitalId)
		select 		
		 LedgerId,
		 Case WHEN Dr>Cr THEN Dr-Cr  ELSE Cr-Dr END AS Balance,
		 Case WHEN Dr>Cr THEN 1  ELSE 0 END AS DrCr	,
		 HospitalId	
		 from 
		 (
			 select l.LedgerId,
			 Case WHEN DrCr=1 THEN isnull(OpeningBalance,0)+isnull(DrAmount,0)  ELSE isnull(DrAmount,0) END AS Dr,
			 Case WHEN DrCr=0 THEN  isnull(OpeningBalance,0)+IsNULL(CrAmount,0) ELSE IsNULL(CrAmount,0) END AS Cr,
			 l.HospitalId
			 from ACC_Ledger l 
			 left join
			 (
						 select LedgerId, sum(DrAmount) DrAmount, sum(CrAmount) CrAmount
						 from 
						 (
								 select LedgerId, Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount, Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
								 from ACC_TransactionItems ti join ACC_Transactions t on t.TransactionId=ti.TransactionId  
								 where t.FiscalYearId=@CurrentFiscalYearId and  t.HospitalId=@HospitalId
						 ) ledTxn group by LedgerId
			  )TxnDetails 
			  on TxnDetails.LedgerId=l.LedgerId and l.HospitalId=@HospitalId

			) a
			
		--Step 4 --Update closing balance of current fiscal Year
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=bt.Balance, ClosingDrCr=bt.DrCr		
		from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId and bt.hospitalId = bh.HospitalId	
		where FiscalYearId=@CurrentFiscalYearId	and  bh.HospitalId = @HospitalId 

		--Step 5- Insert all Ledgers with Next FiscalYearId into ACC_LedgerBalanceHistory, Here default opening balance is 0
		Insert into  ACC_LedgerBalanceHistory (FiscalYearId, LedgerId, OpeningBalance, OpeningDrCr,CreatedBy, CreatedOn, HospitalId)		
		select @NextFiscalYearId, LedgerId,0,1,1 as CreatedBy, GETDATE() as CreatedOn, hospitalId
		from @TBLCurrentFiscalYearCloseBalance where HospitalId=@HospitalId

		--Step 6 - Update Next fiscal year assets and liability opening balance from current fiscal year closing balance
		 declare @Assets varchar(50)=(select name from ACC_MST_CodeDetails where code='008' and HospitalId=@HospitalId)
		 declare @Liabilities varchar(50)=(select name from ACC_MST_CodeDetails where code='009' and HospitalId=@HospitalId)
		 update ACC_LedgerBalanceHistory
		 set OpeningBalance=bt.Balance, ClosingDrCr=bt.DrCr
		 from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId
		 where FiscalYearId=@NextFiscalYearId  and bh.HospitalId=@HospitalId
		 and bt.LedgerId in
		 (
			   select LedgerId from ACC_Ledger l join ACC_MST_LedgerGroup lg 
			                       on l.LedgerGroupId=lg.LedgerGroupId
			   where l.HospitalId=@HospitalId AND PrimaryGroup in (@Assets, @Liabilities)
		 )		
		 
		 --Step 7 -Forward Net Profit as Retain Earning for next fiscal year
		 declare @RetainEarnLedgerName varchar(50)=(select name from ACC_MST_CodeDetails where code='016' and HospitalId=@HospitalId)		
		 declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=@HospitalId)
		 declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=@HospitalId)
		 --revenue always Cr and Expenses alway Dr
		 Declare @TblNetProfit TABLE (NetProfit float, DrCr bit)
		 
		 insert into @TblNetProfit(NetProfit, DrCr)
		 select case when Expense > Revenue then Expense-Revenue else Revenue-Expense end NetProfit,
		 case when Expense > Revenue then 1 else 0 end DrCr
		 from 
		 ( 
			select sum(balance) as Expense				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=1 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in (@Expenses)) ) as Rev,
			
			(select sum(balance) as Revenue				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=0 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in (@Revenue)) 
		) b 

		update ACC_LedgerBalanceHistory 
		set OpeningBalance= (select top 1 NetProfit from @TblNetProfit), OpeningDrCr=(select top 1 DrCr from @TblNetProfit)
		where LedgerId=(select top 1 LedgerId from acc_Ledger where HospitalId=@HospitalId AND LedgerName=@RetainEarnLedgerName)
		and FiscalYearId=@NextFiscalYearId AND HospitalId=@HospitalId
		
		
		--Step 8- Update LedgerOpening Balance of Ledger table 
		update ACC_Ledger set OpeningBalance=bh.OpeningBalance, DrCr=bh.OpeningDrCr
		from ACC_LedgerBalanceHistory bh join ACC_Ledger l on l.LedgerId=bh.LedgerId
		where bh.FiscalYearId=@NextFiscalYearId and bh.HospitalId=@HospitalId

	 --Step 9- Update current fiscal year make IsClosed=true
       update ACC_MST_FiscalYears set IsClosed=1
       where FiscalYearId=@CurrentFiscalYearId

		END		
	END
	Go


--END: NageshBB: 02 Jul 2020: script for account closure sp changes 

--START: NageshBB: 03 Jul 2020: script for balance sheet alter 
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_RPT_GetBalanceSheetData]   
    @ToDate DATETIME, 
	@HospitalId INT,
    @FiscalYearId INT
  AS
  --EXEC [dbo].[SP_ACC_RPT_GetBalanceSheetData] @FromDate = '2020-06-11 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
  
  /************************************************************************
  FileName: [SP_ACC_RPT_GetBalanceSheetData]
  CreatedBy/date: Nagesh /12'June2020
  Description: get records for balance sheet report of accounting
  Change History
  -------------------------------------------------------------------------
  S.No.    UpdatedBy/Date                        Remarks
  -------------------------------------------------------------------------
  1       Nagesh /12'June2020            created script for get balance sheet report records
  2       Sud sir/13'June 2020          updated for get table 2 with NetProfit details
  3.     
  *************************************************************************/
  BEGIN  
    IF( @ToDate IS NOT NULL) 
    BEGIN  
        Declare @FromDate DATETIME
        
        Set @FromDate= ( Select StartDate from ACC_MST_FiscalYears where HospitalId=@HospitalId AND IsActive=1 AND FiscalYearId=@FiscalYearId)
    
        --Table:1 Get Balance Sheet Details---          
        Select 
				ledInfo.LedgerId,PrimaryGroup, LedgerName,COA,LedgerGroupName,Code
				, OpeningBalanceDr, OpeningBalanceCr, ISNULL(Led_TotDr,0) AS 'DRAmount', ISNULL(Led_TotCr,0) AS 'CRAmount' 
          from
          (
					Select l.LedgerId, l.LedgerName, l.Code,  l.ledgergroupid, lg.PrimaryGroup, lg.COA, lg.LedgerGroupName , 
					case when lbh.OpeningDrCr=1 then lbh.OpeningBalance else 0 END AS 'OpeningBalanceDr',
					case when lbh.OpeningDrCr=0 then lbh.OpeningBalance else 0 END AS 'OpeningBalanceCr' 
					--from ACC_Ledger  l INNER JOIN ACC_MST_LedgerGroup lg  --NageshBB-03Jul updated for opening balance as per fiscal year
                    from ACC_LedgerBalanceHistory lbh join ACC_Ledger l on lbh.LedgerId=l.LedgerId INNER JOIN ACC_MST_LedgerGroup lg
					ON l.LedgerGroupId = lg.LedgerGroupId
					WHERE  lbh.HospitalId=@HospitalId  and lbh.FiscalYearId=@FiscalYearId
          ) ledInfo
          LEFT JOIN
          ( 
            Select LedgerId,SUM(DrAmount) AS 'Led_TotDr', SUM(CrAmount) 'Led_TotCr' from
            (
					Select  txn.TransactionId, LedgerId,
                    Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
					Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
					from  ACC_TransactionItems txnItm INNER JOIN ACC_Transactions txn
					ON txnItm.TransactionId = txn.TransactionId
					WHERE 
					txn.HospitalId= @HospitalId AND
					convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
              ) A
              Group By LedgerId
          ) ledTxnDetails 
			ON ledInfo.LedgerId= ledTxnDetails.LedgerId
			Order by ledInfo.LedgerName


  
  --Table2: Get NetProfit and Loss ---
        declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=@HospitalId)
        declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=@HospitalId)
		Select SUM(RevenueBalance) - SUM(ExpenseBalance)   'NetProfitNLoss'
          FROM
        ( 
          Select 
            Case When PrimaryGroup=@Revenue THEN TotalDrAmount - TotalCrAmount ELSE 0 END AS 'ExpenseBalance',
            Case When PrimaryGroup=@Expenses THEN TotalCrAmount - TotalDrAmount  ELSE 0 END AS 'RevenueBalance'
            from 
          (
              ---Query2.1: P&L on Opening Balance----
              --- ideally Opening balances of P&L accounts will be zero. It'll give correct  results even in that case---
               Select ledGrp.PrimaryGroup, SUM(led.DrAmount) 'TotalDrAmount', SUM(led.CrAmount) 'TotalCrAmount'
 
                from
                --  (		Select   LedgerId,LedgergroupId,
				-- 		Case WHEN DrCr=1 THEN OpeningBalance ELSE 0 END AS DrAmount,
				-- 		Case WHEN DrCr=0 THEN OpeningBalance ELSE 0 END AS CrAmount,
				-- 		HospitalId 
				-- 		from  ACC_Ledger  where HospitalId=@HospitalId)   led 
                 (		Select   lbh.LedgerId,l.LedgergroupId,
						Case WHEN lbh.OpeningDrCr=1 THEN lbh.OpeningBalance ELSE 0 END AS DrAmount,
						Case WHEN lbh.OpeningDrCr=0 THEN lbh.OpeningBalance ELSE 0 END AS CrAmount,
						lbh.HospitalId 
						from  ACC_LedgerBalanceHistory lbh join  ACC_Ledger l on lbh.LedgerId=l.LedgerId
                        where lbh.HospitalId=@HospitalId and lbh.FiscalYearId=@FiscalYearId )   led 
						INNER  JOIN ACC_MST_LedgerGroup ledGrp
						ON led.LedgerGroupId = ledGrp.LedgerGroupId           
						Where led.HospitalId= @HospitalId 
						 AND ledGrp.hospitalid=@HospitalId 
						 AND ledGrp.PrimaryGroup IN (@Revenue,@Expenses)
						Group by ledGrp.PrimaryGroup
               UNION ALL  
              --Query:2.2-- Get Profit&Loss on Transaction Amounts
						Select lg.PrimaryGroup,  SUM(txnItm.DrAmount) 'TotalDrAmount',SUM(txnItm.CrAmount) 'TotalCrAmount'
                        FROM ACC_Transactions  txn
						INNER JOIN 
                        (		Select  
								TransactionId, LedgerId,
								Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
								Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
								from  ACC_TransactionItems  where HospitalId=@HospitalId ) txnItm 
        
						ON txn.TransactionId = txnItm.TransactionId
						INNER JOIN ACC_Ledger l
						ON txnItm.LedgerId = l.LedgerId
						INNER JOIN ACC_MST_LedgerGroup lg
						ON l.LedgerGroupId = lg.LedgerGroupId   and lg.PrimaryGroup IN (@Revenue,@Expenses)        
                  WHERE
				  txn.HospitalId= @HospitalId AND l.HospitalId = @HospitalId AND
                    convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
                  Group by lg.PrimaryGroup
          ) A
        ) B
                
    END    
  END
GO
--END: NageshBB: 03 Jul 2020: script for balance sheet alter 

---START: NageshBB/Vikas: 07Jul 2020: Changes for opening balance as per fiscalYearId-----------

/****** Object:  StoredProcedure [dbo].[SP_ACC_RPT_GetTrialBalanceData]    Script Date: 07-07-2020 10:31:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_RPT_GetTrialBalanceData]
		@FromDate DATETIME,
		@ToDate DATETIME,
		@HospitalId INT,
		@OpeningFiscalYearId INT
	AS
	--EXEC [dbo].[SP_ACC_RPT_GetTrialBalanceData] @FromDate = '2020-06-11 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
	
	/************************************************************************
	FileName: [SP_ACC_RPT_GetTrialBalanceData]
	CreatedBy/date: Nagesh /11'June2020
	Description: get records for trail balance report of accounting
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /11'June2020						created script for get trial balance records
	2.      Sud/Nagesh: 20Jun'20                   Added HospitalId for Phrm separation
	3.		Nagesh/Vikas: 07Jul'20					changed script for opening balance as per fiscalYearId and input openingFiscalYearId 
	*************************************************************************/
	BEGIN
	
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
		BEGIN
		--here we are getting plain records all grouping and data modification as per need we will do in controller 
		--using linq we will do all modification this will return plain records only
		--Now we are getting ledger opening balance from ledger table later we will update sp
		--and we will get data from ledger balance history table 
		 Declare @fiscalYearStartDate datetime
		 --set @fiscalYearStartDate=(select top 1 Startdate from ACC_MST_FiscalYears
			--						where HospitalId=@HospitalId AND
			--						convert(date,StartDate) <=convert(date,@FromDate) and 
			--						convert(date,EndDate) >=convert(date,@FromDate))
			set @fiscalYearStartDate= (select top 1 StartDate from ACC_MST_FiscalYears where HospitalId=@HospitalId and FiscalYearId=@OpeningFiscalYearId)
			
		 select 				
				lg.PrimaryGroup, 
				lg.COA,
				lg.LedgerGroupName,
				l.LedgerName, 
				l.LedgerId
				,l.Code
				--,max(case when l.DrCr=1 then l.OpeningBalance else 0 END) as OpeningBalDr
				--,max(case when l.DrCr=0 then l.OpeningBalance else 0 END) as OpeningBalCr
				,max(case when lbh.OpeningDrCr=1 then l.OpeningBalance else 0 END) as OpeningBalDr
				,max(case when lbh.OpeningDrCr=0 then l.OpeningBalance else 0 END) as OpeningBalCr
				,sum(case when ti.DrCr=1 and convert(date,t.TransactionDate) < convert(date,@FromDate) then ISNULL(ti.Amount,0) else 0 END) as OpeningDr
				,sum(case when ti.DrCr=0 and convert(date,t.TransactionDate) < convert(date,@FromDate) then ISNULL(ti.Amount,0) else 0 END) as OpeningCr
				,sum(case when ti.DrCr=1 and convert(date,t.TransactionDate) >=convert(date,@FromDate)  then ISNULL(ti.Amount,0) else 0 END)  CurrentDr
				,sum(case when ti.DrCr=0 and convert(date,t.TransactionDate) >=convert(date,@FromDate)  then ISNULL(ti.Amount,0) else 0 END)  CurrentCr				
				from ACC_LedgerBalanceHistory lbh join ACC_Ledger l 
				on lbh.LedgerId=l.LedgerId and lbh.FiscalYearId=@OpeningFiscalYearId and lbh.HospitalId=@HospitalId
					left join ACC_MST_LedgerGroup lg on l.LedgerGroupId =lg.LedgerGroupId
					left join  ACC_TransactionItems ti on l.LedgerId= ti.LedgerId
					left join ACC_Transactions t on ti.TransactionId=t.TransactionId  and 
				    convert(date, t.TransactionDate)>= convert(date,@fiscalYearStartDate) and convert(date, t.TransactionDate)<= convert(date,@ToDate) 
          Where l.HospitalId = @HospitalId AND lg.HospitalId = @HospitalId AND t.HospitalId = @HospitalId
		  group by lg.PrimaryGroup, 
						lg.COA,
						lg.LedgerGroupName,
						l.LedgerName, 
						l.LedgerId
						,l.Code
				order by l.LedgerName				
		END		
	END
	Go
	
	---END: NageshBB/Vikas: 07Jul 2020: Changes for opening balance as per fiscalYearId-----------
	

----END: Branch Merge : NageshBB: ---- Merged ACC to DEV ----------: 08 Jul 2020--------

----START: Branch Merge : Rusha: ---- Merged Beta_V1.45X to DEV ----------: 08 July 2020--------

------Start: Anjana 6/24/2020: Nursing Opd - button level permission for overview, clinical and fileupload--------
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName = 'Nursing' and
ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('nursing-op-summary-view', @ApplicationId,1,GETDATE(),1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('nursing-op-clinical-view', @ApplicationId,1,GETDATE(),1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('nursing-op-fileupload-view', @ApplicationId,1,GETDATE(),1);
GO
------End: Anjana 6/24/2020: Nursing Opd - button level permission for overview, clinical and fileupload--------

---Anish: Start: 25 June 2020, Configuration for Radiology Grid Added in the Parameter table----
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
Values('Radiology','ImagingRequestGridColumns',
'{"Requested On": true,"Hospital Number": true,"Patient Name": true,"Age/Sex": true,"Doctor": true,"Type": true,"Imaging Name": true,"Requesting Dept.": true,"Insurance": true,"Action": true}',
'JSON','Column Names to show in the Radiology Requisition page','custom');
Go

Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
Values('Radiology','ImagingReportGridColumns',
'{"S.No": true,"Date": true,"Hospital Number": true,"Patient Name": true,"Age/Sex": true,"Report": true,"Imaging Item": true,"Insurance": true,"Imaging Type": true,"Reporting Doctor": true,"Phone": true}',
'JSON','Column Names to show in the grid of Radiology Report page','custom');
Go
---Anish: End: 25 June 2020, Configuration for Radiology Grid Added in the Parameter table----

--Anish: Start: 26 June 2020, Configuration for Radiology Grid Order Managed----
Update CORE_CFG_Parameters
set ParameterValue='{"S.No": true,"Date": true,"Hospital Number": true,"Patient Name": true,"Age/Sex": true,"Phone": true,"Reporting Doctor": true,
"Imaging Type": true,"Imaging Item": true,"Insurance": true,"Report": true}'
where ParameterGroupName='Radiology' and ParameterName='ImagingReportGridColumns';
Go
--Anish: End: 26 June 2020, Configuration for Radiology Grid Order Managed------

------Start-Anjana: 6/26/2020: Change the Grid header of Lab Module in the Parameter-----
Update CORE_CFG_Parameters
SET ParameterValue = '{"Requisition Date": true,"Hospital Number": true,"Patient Name":true,"Age/Sex":true,"Phone Number":true,"Requesting Dept.":true,"Visit Type":true,"Run Number Type":true,"Action":true}',
	ValueDataType ='JSON' where ParameterGroupName='LAB' and ParameterName='ListRequisitionGridColumns'
Go

Update CORE_CFG_Parameters
SET ParameterName = 'AddResultGridColumns', 
ParameterValue = '{"Hospital No.": true,"Patient Name":true,"Age/Sex":true,"Phone Number":true,"Test Name":true,"Category":true,"Requesting Dept.":true,"Run No.":true,"Bar Code":true,"Actions":true}',
ValueDataType ='JSON'  where ParameterGroupName='LAB' and ParameterName='AddResultResultGridColumns'
Go

Update CORE_CFG_Parameters
SET ParameterValue = '{"Hospital No.": true,"Patient Name":true,"Age/Sex":true,"Phone Number":true,"Test Name":true,"Category":true,"Requesting Dept.":true,"Run No.":true,"Bar Code":true,"Action":true}',
	ValueDataType ='JSON'  where ParameterGroupName='LAB' and ParameterName='PendingReportGridColumns'
Go

Update CORE_CFG_Parameters
SET ParameterValue = '{"Hospital No.": true,"Patient Name":true,"Age/Sex":true,"Phone Number":true,"Test Name":true,"Report Genereated By":true,"Requesting Dept.":true,"Run Num.":true,"Is Printed":true,"Action":true}',
	ValueDataType ='JSON'  where ParameterGroupName='LAB' and ParameterName='FinalReportGridColumns'
Go
------End-Anjana: 6/26/2020: Change the Grid header of Lab Module in the Parameter-----


--START: Sanjit: 26Jun2020 --Create a new view for Purchase Request inside Internal
GO
	DECLARE @ApplicationId int;
	SET @ApplicationId = (SELECT TOP(1)ApplicationId FROM RBAC_Application WHERE ApplicationName = 'INVENTORY' and ApplicationCode = 'INV')

	INSERT INTO RBAC_Permission (ApplicationId,PermissionName,CreatedBy,CreatedOn,Description,IsActive)
	VALUES (@ApplicationId,'inventory-internalmain-purchaserequest-view',1,GETDATE(),'To separate the view for Internal and Procurement Process',1)
GO

	DECLARE @PermissionId int;
	DECLARE @ParentRouteId int;
	SET @PermissionId = (SELECT TOP(1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'inventory-internalmain-purchaserequest-view');
	SET @ParentRouteId = (SELECT TOP(1) RouteId FROM RBAC_RouteConfig WHERE DisplayName = 'Internal' and UrlFullPath = 'Inventory/InternalMain' and RouterLink = 'InternalMain');

	INSERT INTO RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
	VALUES('Purchase Request', 'Inventory/InternalMain/PurchaseRequest','PurchaseRequest',@PermissionId, @ParentRouteId, 1,2,1 )
GO

	UPDATE RBAC_RouteConfig 
	SET DisplaySeq = 1
	WHERE DisplayName = 'Requisition' and UrlFullPath = 'Inventory/InternalMain/Requisition' and RouterLink = 'Requisition'
GO

	UPDATE RBAC_RouteConfig
	SET DisplaySeq = 3
	WHERE DisplayName = 'Write-Off' and UrlFullPath = 'Inventory/InternalMain/WriteOffItems' and RouterLink = 'WriteOffItems'
GO
--END: Sanjit: 26Jun2020 --Create a new view for Purchase Request inside Internal


---start: sud-27Jul'20----reports correction---
/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_TotalItemsBill]    Script Date: 2020-06-27 10:45:37 AM ******/
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
8.      sud: 8Aug2019                      Added Insurance Clause for total items bill. 
9.      sud: 27Jun'20                      -> Correction in Provisional Filter (Charak Requirements)
                                           -> PatientName taking from ShortName
--------------------------------------------------------
*/
BEGIN
	SELECT
		txnItms.BillingDate,
		pat.PatientCode 'HospitalNumber',
		pat.ShortName 'PatientName', ---sud:27Jun'20
		--CONCAT(pat.FirstName,' '+ pat.LastName) 'PatientName',
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
           ---sud:27Jun'20 -- Provisional only if invoice is not created yet---
			SELECT ProvisionalDate 'BillingDate', 'provisional' AS BillStatus_New, *  FROM VW_BIL_TxnItemsInfoWithDateSeparation 
			WHERE ProvisionalDate IS NOT NULL and InvoiceCreatedDate IS NULL and BillStatus !='cancel'
			
			--SELECT ProvisionalDate 'BillingDate', 'provisional' AS BillStatus_New, * 
			--FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE ProvisionalDate IS NOT NULL

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
---end: sud-27Jul'20----reports correction

--Anish: 1 July, 2020: Start: all the routing for Settings module tabs made----
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-department-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-department-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/DepartmentsManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Manage Department','Settings/DepartmentsManage/Department','Department',@permissionId,@parentRouteId,1,1)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-substore-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-substore-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/DepartmentsManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values ('Manage SubStore','Settings/DepartmentsManage/Substore','Substore',@permissionId,@parentRouteId,1,1)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-imagingtype-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-imagingtype-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/RadiologyManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Imaging Type','Settings/RadiologyManage/ManageImagingType','ManageImagingType',@permissionId,@parentRouteId,1,1,5)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-imagingitem-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-imagingitem-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/RadiologyManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Imaging Item','Settings/RadiologyManage/ManageImagingItem','ManageImagingItem',@permissionId,@parentRouteId,1,1,10)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-radiologytemplate-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-radiologytemplate-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/RadiologyManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Radiology Template','Settings/RadiologyManage/ManageRadiologyTemplate','ManageRadiologyTemplate',@permissionId,@parentRouteId,1,1,15)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-defaultsignatories-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-defaultsignatories-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/RadiologyManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Default Signatories','Settings/RadiologyManage/DefaultSignatories','DefaultSignatories',@permissionId,@parentRouteId,1,1,20)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-ward-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-ward-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/ADTManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Ward','Settings/ADTManage/ManageWard','ManageWard',@permissionId,@parentRouteId,1,1,5)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-bedfeature-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-bedfeature-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/ADTManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Bed Feature','Settings/ADTManage/ManageBedFeature','ManageBedFeature',@permissionId,@parentRouteId,1,1,10)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-bed-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-bed-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/ADTManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Bed','Settings/ADTManage/ManageBed','ManageBed',@permissionId,@parentRouteId,1,1,15)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-autoaddbillitems-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-autoaddbillitems-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/ADTManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Auto Add Billing Items','Settings/ADTManage/ManageAutoAddBillItems','ManageAutoAddBillItems',@permissionId,@parentRouteId,1,1,20)
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-user-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-user-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/SecurityManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage User','Settings/SecurityManage/ManageUser','ManageUser',@permissionId,@parentRouteId,1,1,5)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-role-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-role-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/SecurityManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Role','Settings/SecurityManage/ManageRole','ManageRole',@permissionId,@parentRouteId,1,1,10)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-country-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-country-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/GeolocationManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Country','Settings/GeolocationManage/ManageCountry','ManageCountry',@permissionId,@parentRouteId,1,1,5)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-subdivision-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-subdivision-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/GeolocationManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage SubDivision','Settings/GeolocationManage/ManageSubdivision','ManageSubdivision',@permissionId,@parentRouteId,1,1,10)
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-employee-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-employee-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/EmployeeManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage Employee','Settings/EmployeeManage/ManageEmployee','ManageEmployee',@permissionId,@parentRouteId,1,1,5)
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-employeerole-view', @ApplicationId,1,GETDATE(),1);
GO
declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-employeerole-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/EmployeeManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage EmployeeRole','Settings/EmployeeManage/ManageEmployeeRole','ManageEmployeeRole',@permissionId,@parentRouteId,1,1,10)
GO


declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-employeetype-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-employeetype-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/EmployeeManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Manage EmployeeType','Settings/EmployeeManage/ManageEmployeeType','ManageEmployeeType',@permissionId,@parentRouteId,1,1,15)
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-servicedepartments-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-servicedepartments-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/BillingManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Service Departments','Settings/BillingManage/ManageServiceDepartment','ManageServiceDepartment',@permissionId,@parentRouteId,1,1,5)
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-billingitems-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-billingitems-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/BillingManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Billing Items','Settings/BillingManage/ManageBillingItems','ManageBillingItems',@permissionId,@parentRouteId,1,1,10)
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-billingpackages-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-billingpackages-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/BillingManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Billing Packages','Settings/BillingManage/ManageBillingPackages','ManageBillingPackages',@permissionId,@parentRouteId,1,1,15)
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-creditorganizations-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-creditorganizations-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/BillingManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Credit Organizations','Settings/BillingManage/ManageCreditOrganizations','ManageCreditOrganizations',@permissionId,@parentRouteId,1,1,20)
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Settings' and ApplicationCode='SETT');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
values ('settings-manage-memberships-view', @ApplicationId,1,GETDATE(),1);
GO

declare @permissionId INT 
SET @permissionId =(Select Top(1) PermissionId from dbo.RBAC_Permission
where PermissionName='settings-manage-memberships-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP (1) RouteID from dbo.RBAC_RouteConfig
where UrlFullPath = 'Settings/BillingManage')

INSERT INTO RBAC_RouteConfig ( DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
Values ('Menberships','Settings/BillingManage/ManageMemberships','ManageMemberships',@permissionId,@parentRouteId,1,1,25)
GO

--Anish: 1 July, 2020: End: all the routing for Settings module tabs made----

----Start: Anjana, 07-01-2020: Add IsActive column in RAD_PatientImagngRequistion table-----
Alter Table RAD_PatientImagingRequisition
Add IsActive BIT default 'TRUE' Not Null;
Go
----End: Anjana, 07-01-2020: Add IsActive column in RAD_PatientImagngRequistion table-----

----Start-Anjana: 02/07/2020, Nursing -> OPD: Show AppointmentType in Grid, Employee Settings- Add new fields in EMP_Employee--------
/****** Object:  StoredProcedure [dbo].[SP_GetVisitListForOPD]    Script Date: 7/2/2020 1:04:57 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_GetVisitListForOPD]
		@FromDate Datetime=null ,
		@ToDate DateTime=null
		--@SearchText varchar(100)

AS
/*
FileName: [SP_GetVisitListForOPD]
CreatedBy/date: Anjana/2020-06-23
Description: to get list of outpatient 

Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      Anjana/2020-06-23					Initial Draft
-----------------------------------------------------------------------------------------
2.      Anjana/2020-07-2					Added Appointment Type
-----------------------------------------------------------------------------------------

*/
BEGIN
 
 
select
  pat.PatientId,
  pat.PatientCode,
  pat.ShortName,
  pat.DateOfBirth,
  pat.PhoneNumber,
  pat.Gender,
  pat.Address,
  pat.Age,
  vis.VisitDate,
  vis.VisitTime,
  vis.VisitType,
  vis.PatientVisitId,
  vis.ProviderName,
  vis.ProviderId,
  vis.AppointmentType,

 Case WHEN vit.PatientVisitId IS NOT NULL THEN 1 ELSE 0 END AS 'HasVitals'

from 
 PAT_Patient pat 
     INNER JOIN
 PAT_PatientVisits vis
    ON pat.PatientId= vis.PatientId
left join
  (Select Distinct PatientVisitId 
   from 
    CLN_PatientVitals )
   vit
  ON vis.PatientVisitId = vit.PatientVisitId	

Where  
vis.VisitType = 'outpatient'
AND vis.BillingStatus != 'cancel'
AND vis.BillingStatus != 'returned'

and Convert(Date, vis.CreatedOn) between ISNULL(@FromDate,Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(Date, GETDATE()))

END
Go

Alter Table EMP_Employee
Add DriverLicenseNo nvarchar(40),
	NursingCertificationNo nvarchar(40),
	HealthProfessionalCertificationNo nvarchar(40);
Go

----End-Anjana: 02/07/2020, Nursing -> OPD: Show AppointmentType in Grid, Employee Settings- Add new fields in EMP_Employee--------


----Start: ANish: 3 July, 2020---
Alter table CLN_PatientVitals
Add VitalsTakenOn DateTime
GO
Update CLN_PatientVitals set VitalsTakenOn = CreatedOn;
GO
----End: ANish: 3 July, 2020---

----Start: Pratik: 7 July, 2020---

Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
values('Appointment','AdditionalBillItem','[{"ServiceDeptId": 37, "ItemId": 33, "ItemName": "OPD Card Charge","DiscountApplicable": true,"PriceChangeEnabled": false,"TaxApplicable": false,"DefaultForNewPatient": true},
  {"ServiceDeptId": 37,"ItemId": 34,"ItemName": "Health Card","DiscountApplicable": false,"PriceChangeEnabled": true,"TaxApplicable": false,"DefaultForNewPatient": false}]','array','Additional Bill items for new visit in appointment','custom',null);

Go

Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
values('Common','BillItemHealthCard','{"ServiceDepartmentId":37,"ItemName": "Health Card","ItemId":34,}','JSON','BillItem Name used as HealthCard','custom',null);

GO

ALTER TABLE RBAC_Role
ADD RoleType varchar(20) 
CONSTRAINT df_RoleType DEFAULT 'custom'
WITH VALUES
Go

----End: Pratik: 7 July, 2020---

--START: Sanjesh: 8 July 2020-- Pharmacy Packing parameterization according to hospital
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('setting-pharmacy-packingtype',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='setting-pharmacy-packingtype')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy/Setting')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId,DefaultShow,DisplaySeq, IsActive)
values ('Packing', 'Pharmacy/Setting/Packing','Packing',@PermissionId,@RefParentRouteId,1,14,1);
GO

--END: Sanjesh: 8 July 2020-- Pharmacy Packing parameterization according to hospital
--START: Sanjesh: 8 July 2020-- Packingtype table added for pharmacy setting packingtype

CREATE TABLE [dbo].[PHRM_MST_PackingType](
	[PackingTypeId] [int] IDENTITY(1,1) NOT NULL,
	[PackingName] [varchar](100) NOT NULL,
	[PackingQuantity] [float] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
	[IsActive] [bit] NULL)

GO

ALTER TABLE PHRM_MST_PackingType
ADD PRIMARY KEY (PackingTypeId)
GO

ALTER TABLE [dbo].[PHRM_MST_Item]  
ADD PackingTypeId int null
GO

ALTER TABLE [dbo].[PHRM_MST_Item]  
ADD FOREIGN KEY (PackingTypeId) REFERENCES [dbo].[PHRM_MST_PackingType](PackingTypeId);
GO

--END: Sanjesh: 8 July 2020-- Packingtype table added for pharmacy setting packingtype


----END: Branch Merge : Rusha: ---- Merged Beta_V1.45X to DEV ----------: 08 July 2020--------


----START: Branch Merge : Rusha: ---- Merged Beta_V1.45X to DEV ----------: 12 July 2020--------
-----Start: Anjana2020-07-09: Create new table for OPD Triage--------

Create Table CLN_KV_PatientClinical_Info
(
InfoId Int Identity(1,1) Primary Key NOT NULL,
PatientId Int,
PatientVisitId Int,
KeyName varchar(100),
Value varchar(1000),
CreatedBy Int,
CreatedOn DateTime,
ModifiedBy Int,
ModifiedOn DateTime,
IsActive BIT Not Null Default 1
)
GO

Alter table PAT_PatientVisits
Add IsTriaged Bit;
GO

-----End: Anjana2020-07-09: Create new table for OPD Triage--------

-----Start:Anjana:2020-07-09: Updated HasVitals to IsTriaged for OPD triage--------

/****** Object:  StoredProcedure [dbo].[SP_GetVisitListForOPD]    Script Date: 7/9/2020 12:03:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_GetVisitListForOPD]
		@FromDate Datetime=null ,
		@ToDate DateTime=null
		--@SearchText varchar(100)

AS
/*
FileName: [SP_GetVisitListForOPD]
CreatedBy/date: Anjana/2020-06-23
Description: to get list of outpatient 

Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      Anjana/2020-06-23					Initial Draft
-----------------------------------------------------------------------------------------
2.      Anjana/2020-07-09					Updated HasVitals to IsTriaged for OPD Triage
*/
BEGIN
 
 
select
  pat.PatientId,
  pat.PatientCode,
  pat.ShortName,
  pat.DateOfBirth,
  pat.PhoneNumber,
  pat.Gender,
  pat.Address,
  pat.Age,
  vis.VisitDate,
  vis.VisitTime,
  vis.VisitType,
  vis.PatientVisitId,
  vis.ProviderName,
  vis.ProviderId,
  vis.AppointmentType,

 Case WHEN vit.PatientVisitId IS NOT NULL THEN 1 ELSE 0 END AS 'IsTriaged'

from 
 PAT_Patient pat 
     INNER JOIN
 PAT_PatientVisits vis
    ON pat.PatientId= vis.PatientId
left join
  (Select Distinct PatientVisitId 
   from 
    CLN_KV_PatientClinical_Info )
   vit
  ON vis.PatientVisitId = vit.PatientVisitId	

Where  
vis.VisitType = 'outpatient'
AND vis.BillingStatus != 'cancel'
AND vis.BillingStatus != 'returned'

and Convert(Date, vis.CreatedOn) between ISNULL(@FromDate,Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(Date, GETDATE()))

END
Go
-----End:Anjana:2020-07-09: Updated HasVitals to IsTriaged for OPD triage--------
----END: Branch Merge : Rusha: ---- Merged Beta_V1.45X to DEV ----------: 12 July 2020--------

--START: NageshBB: 12 Jul 2020: changes in stored procedure-Account closure and Fiscal Year reopen 
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_RPT_GetTrialBalanceData]
		@FromDate DATETIME,
		@ToDate DATETIME,
		@HospitalId INT,
		@OpeningFiscalYearId INT
	AS
	--EXEC [dbo].[SP_ACC_RPT_GetTrialBalanceData] @FromDate = '2020-07-08  18:00:21.657', @ToDate ='2020-07-09 18:00:21.657', @HospitalId=3, @OpeningFiscalYearId=3
	
	/************************************************************************
	FileName: [SP_ACC_RPT_GetTrialBalanceData]
	CreatedBy/date: Nagesh /11'June2020
	Description: get records for trail balance report of accounting
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /11'June2020						created script for get trial balance records
	2.      Sud/Nagesh: 20Jun'20					Added HospitalId for Phrm separation
	3.		Nagesh/Vikas: 07Jul'20					changed script for opening balance as per fiscalYearId and input openingFiscalYearId 
	4.		Nagesh: 09 Jul 2020						fixed issue of opening balance after fiscal year closed and reopened
	*************************************************************************/
	BEGIN
	
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
		BEGIN
		--here we are getting plain records all grouping and data modification as per need we will do in controller 
		--using linq we will do all modification this will return plain records only
		--Now we are getting ledger opening balance from ledger table later we will update sp
		--and we will get data from ledger balance history table 
		 Declare @fiscalYearStartDate datetime		 
		 set @fiscalYearStartDate= (select top 1 StartDate from ACC_MST_FiscalYears where HospitalId=@HospitalId and FiscalYearId=@OpeningFiscalYearId )   		     	
				 Select 
					ledInfo.PrimaryGroup,ledInfo.COA,ledInfo.LedgerGroupName,ledInfo.LedgerName,ledInfo.LedgerId, ledInfo.Code,OpeningBalDr, OpeningBalCr
					,ISNULL(OpeningDr,0) AS 'OpeningDr', ISNULL(OpeningCr,0) AS 'OpeningCr' , ISNULL(CurrentDr,0) AS 'CurrentDr', ISNULL(CurrentCr,0) AS 'CurrentCr' 
				from(
				    Select l.LedgerId, l.LedgerName, l.Code, lg.PrimaryGroup, lg.COA, lg.LedgerGroupName , 
					case when lbh.OpeningDrCr=1 then lbh.OpeningBalance else 0 END AS 'OpeningBalDr',
					case when lbh.OpeningDrCr=0 then lbh.OpeningBalance else 0 END AS 'OpeningBalCr' 				
                    from ACC_LedgerBalanceHistory lbh join ACC_Ledger l on lbh.LedgerId=l.LedgerId INNER JOIN ACC_MST_LedgerGroup lg
					ON l.LedgerGroupId = lg.LedgerGroupId
					WHERE  lbh.HospitalId=@HospitalId  
					and lbh.FiscalYearId=@OpeningFiscalYearId
					) 
				ledInfo
				LEFT JOIN
					( 						
						Select LedgerId,SUM(OpeningDr) AS 'OpeningDr', SUM(OpeningCr) 'OpeningCr',SUM(CurrentDr) AS 'CurrentDr', SUM(CurrentCr) 'CurrentCr' 
						from
						(														
							Select   ti.LedgerId
							,(case when ti.DrCr=1 and convert(date,t.TransactionDate) < convert(date,@FromDate) 
							then ISNULL(ti.Amount,0) else 0 END) as OpeningDr
							,(case when ti.DrCr=0 and convert(date,t.TransactionDate) < convert(date,@FromDate) 
							then ISNULL(ti.Amount,0) else 0 END) as OpeningCr
							,(case when ti.DrCr=1 and convert(date,t.TransactionDate) >=convert(date,@FromDate)  
							then ISNULL(ti.Amount,0) else 0 END)  CurrentDr
							,(case when ti.DrCr=0 and convert(date,t.TransactionDate) >=convert(date,@FromDate)  
							then ISNULL(ti.Amount,0) else 0 END)  CurrentCr	
							from  ACC_TransactionItems ti INNER JOIN ACC_Transactions t
							ON ti.TransactionId = t.TransactionId
							WHERE 
							t.HospitalId=@HospitalId  and 
							convert(date, t.TransactionDate) BETWEEN convert(date,@fiscalYearStartDate) and  convert(date,@ToDate) 							
						) A Group By LedgerId
					) ledTxnDetails 
				ON ledInfo.LedgerId= ledTxnDetails.LedgerId				
				Order by ledInfo.LedgerName           		  							
		END		
	END
	Go

	
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_AccountClosure]
			@CurrentFiscalYearId int,
			@NextFiscalYearId int,
			@HospitalId int
	AS
	--EXEC [dbo].[SP_ACC_AccountClosure] @CurrentFiscalYearId = 2, @NextFiscalYearId =3, @HospitalId=3
	
	/************************************************************************
	FileName: [SP_ACC_AccountClosure]
	CreatedBy/date: Nagesh /19'June2020
	Description: sp will close current fiscal year. add closing balance and forward closing for next fiscal year as opening balance
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /19'June2020						created script for account closure task
	2.      Sud/Nagesh:20Jun'20						HospitalId added for Phrm-Acc Separation
	3.		Nagesh/02Jul'20							sp changes for account closure task working
	4.		Nagesh/12Jul'2020						sp changes for next fiscal year opening balance Dr to cr issue resolution AND Retain Earning balance updation
													we will forward NetProfit into Retain Earning
	*************************************************************************/
	BEGIN
	
		IF(@CurrentFiscalYearId IS NOT NULL AND @NextFiscalYearId IS NOT NULL) 
		BEGIN				  
	    
		--Step 1- delete all ledger list from Ledger_BalanceHistory table for NextFiscalYearId		
		delete from ACC_LedgerBalanceHistory 
		where FiscalYearId=@NextFiscalYearId and HospitalId=@HospitalId
		
		--Step 2- Update closing balance of CurrentFiscalYear as 0
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=0, ClosingDrCr=1 
		where FiscalYearId=@CurrentFiscalYearId  and HospitalId=@HospitalId

		--Step 3-calculate current fiscal year closing balance with ledgerid
		DECLARE @TBLCurrentFiscalYearCloseBalance TABLE (LedgerId INT Not null unique, Balance float, DrCr bit, hospitalId int)
		Insert into @TBLCurrentFiscalYearCloseBalance(LedgerId, Balance, DrCr, hospitalId)
		select 		
		 LedgerId,
		 Case WHEN Dr>Cr THEN Dr-Cr  ELSE Cr-Dr END AS Balance,
		 Case WHEN Dr>Cr THEN 1  ELSE 0 END AS DrCr	,
		 HospitalId	
		 from 
		 (
			 select l.LedgerId,
			 Case WHEN DrCr=1 THEN isnull(OpeningBalance,0)+isnull(DrAmount,0)  ELSE isnull(DrAmount,0) END AS Dr,
			 Case WHEN DrCr=0 THEN  isnull(OpeningBalance,0)+IsNULL(CrAmount,0) ELSE IsNULL(CrAmount,0) END AS Cr,
			 l.HospitalId
			 from ACC_Ledger l 
			 left join
			 (
						 select LedgerId, sum(DrAmount) DrAmount, sum(CrAmount) CrAmount
						 from 
						 (
								 select LedgerId, Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount, Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
								 from ACC_TransactionItems ti join ACC_Transactions t on t.TransactionId=ti.TransactionId  
								 where t.FiscalYearId=@CurrentFiscalYearId and  t.HospitalId=@HospitalId
						 ) ledTxn group by LedgerId
			  )TxnDetails 
			  on TxnDetails.LedgerId=l.LedgerId and l.HospitalId=@HospitalId

			) a			
		--Step 4 --Update closing balance of current fiscal Year
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=bt.Balance, ClosingDrCr=bt.DrCr		
		from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId and bt.hospitalId = bh.HospitalId	
		where FiscalYearId=@CurrentFiscalYearId	and  bh.HospitalId = @HospitalId 

		--Step 5- Insert all Ledgers with Next FiscalYearId into ACC_LedgerBalanceHistory, Here default opening balance is 0
		Insert into  ACC_LedgerBalanceHistory (FiscalYearId, LedgerId, OpeningBalance, OpeningDrCr,CreatedBy, CreatedOn, HospitalId)		
		select @NextFiscalYearId, LedgerId,0,1,1 as CreatedBy, GETDATE() as CreatedOn, hospitalId
		from @TBLCurrentFiscalYearCloseBalance where HospitalId=@HospitalId

		--Step 6 - Update Next fiscal year assets and liability opening balance from current fiscal year closing balance
		 declare @Assets varchar(50)=(select name from ACC_MST_CodeDetails where code='008' and HospitalId=@HospitalId)
		 declare @Liabilities varchar(50)=(select name from ACC_MST_CodeDetails where code='009' and HospitalId=@HospitalId)
		
		 update ACC_LedgerBalanceHistory
		 set OpeningBalance=bt.Balance, OpeningDrCr=bt.DrCr
		 from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId and bt.hospitalId=bh.HospitalId
		 where FiscalYearId=@NextFiscalYearId  
		 and bt.LedgerId in
		 (
			   select LedgerId from ACC_Ledger l where LedgerGroupId in ( select LedgerGroupId from ACC_MST_LedgerGroup
			   where HospitalId=@HospitalId and PrimaryGroup in (@Assets, @Liabilities)) and l.HospitalId=@HospitalId			                       
		 )		
		 
		 --Step 7 -Forward Net Profit as Retain Earning for next fiscal year
		 declare @RetainEarnLedgerName varchar(50)=(select name from ACC_MST_CodeDetails where code='016' and HospitalId=@HospitalId)		
		 declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=@HospitalId)
		 declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=@HospitalId)
		 --revenue always Cr and Expenses alway Dr
		 Declare @TblNetProfit TABLE (NetProfit float, DrCr bit)
		 
		 insert into @TblNetProfit(NetProfit, DrCr)
		 select case when Expense > Revenue then Expense-Revenue else Revenue-Expense end NetProfit,
		 case when Expense > Revenue then 1 else 0 end DrCr
		 from 
		 ( 
			select sum(balance) as Expense				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=1 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in (@Expenses)) ) as Rev,
			
			(select sum(balance) as Revenue				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=0 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in (@Revenue)) 
		) b 


		 Declare @RetainEarnLedId int= (select LedgerId from ACC_Ledger where LedgerName=@RetainEarnLedgerName)	
		 Declare @TblRetainEarningOpening  table (OpeningBalance float, DrCr bit)

		 insert into @TblRetainEarningOpening (OpeningBalance, DrCr)
		 select OpeningBalance,OpeningDrCr from ACC_LedgerBalanceHistory where FiscalYearId=@NextFiscalYearId and HospitalId=@HospitalId and LedgerId=@RetainEarnLedId
		 
		 Declare @RetainEarnDrCr bit, @RetainEarnBalance float
			IF((select top 1 DrCr from @TblNetProfit) = (select top 1 DrCr from @TblRetainEarningOpening))				
				BEGIN  
				  set @RetainEarnDrCr=(select top 1 DrCr from @TblNetProfit)
				  set @RetainEarnBalance=(select top 1 NetProfit from @TblNetProfit)+ (select top 1 OpeningBalance from @TblRetainEarningOpening)				   
				END  
				ELSE IF((select top 1 NetProfit from @TblNetProfit) > (select top 1 OpeningBalance from @TblRetainEarningOpening))									
				BEGIN  
					set @RetainEarnDrCr=(select top 1 DrCr from @TblNetProfit)
					set @RetainEarnBalance=(select top 1 NetProfit from @TblNetProfit)- (select top 1 OpeningBalance from @TblRetainEarningOpening)				   
				END
				ELSE
				BEGIN
					set @RetainEarnDrCr=(select top 1 DrCr from @TblRetainEarningOpening)
					set @RetainEarnBalance=(select top 1 OpeningBalance from @TblRetainEarningOpening)-(select top 1 NetProfit from @TblNetProfit)
				END		 
		update ACC_LedgerBalanceHistory 
		set OpeningBalance= @RetainEarnBalance, OpeningDrCr=@RetainEarnDrCr
		where LedgerId=@RetainEarnLedId
		and FiscalYearId=@NextFiscalYearId AND HospitalId=@HospitalId
				
		--Step 8- Update LedgerOpening Balance of Ledger table 
		update ACC_Ledger set OpeningBalance=bh.OpeningBalance, DrCr=bh.OpeningDrCr
		from ACC_LedgerBalanceHistory bh join ACC_Ledger l on l.LedgerId=bh.LedgerId
		where bh.FiscalYearId=@NextFiscalYearId and bh.HospitalId=@HospitalId

	 --Step 9- Update current fiscal year make IsClosed=true
       update ACC_MST_FiscalYears set IsClosed=1
       where FiscalYearId=@CurrentFiscalYearId
		END		
	END
	Go

	--END: NageshBB: 12 Jul 2020: changes in stored procedure-Account closure and Fiscal Year reopen 

---------------Branch Merge: Rusha: START: 20th July: Merged Beta branch to DEV branch---------------------------------
-----START: sud:13Jul'20---
GO
CREATE INDEX indx_nc_biltxnitem_PatId ON BIL_TXN_BillingTransactionItems (PatientId);
GO

UPDATE RBAC_RouteConfig
SET DisplayName='Memberships'  --correction on -- Anish: 1 July
WHERE UrlFullPath='Settings/BillingManage/ManageMemberships'
GO

IF NOT EXISTS(Select 1 from BIL_CFG_FiscalYears where FiscalYearName='2077/2078')
BEGIN
  Insert INTO BIL_CFG_FiscalYears(FiscalYearName,FiscalYearFormatted,StartYear,EndYear,CreatedOn,CreatedBy,IsActive)
  Values('2077/2078','2077/2078','2020-07-15 23:59:59.000','2021-07-15 23:59:59.000',GETDATE(), 1, 1)
END
GO

Alter Table BIL_CFG_FiscalYears
ADD CONSTRAINT UK_BIL_CFG_FiscalYears UNIQUE (FiscalYearName);
GO
--END: sud:13Jul'20---

-- START:Vikas/NageshBB:14th Jul 2020: Transfer to accounting billing issue resolved.

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/*
-- =============================================
-- Author:		<salakha>
-- Create date: <23 Nov 2018>
-- Description:	<get income ledgers>
--change history:

S.No    Author/Date                              Remarks
----------------------------------------------------------------------
1.    Sud/Nagesh: 20Jun'20                   Updated for HospitalId
2.    vikas/nageshBB : 14th Jul 2020		 fixed ledgername issue for billing transfer to accounting.
-- =============================================
--select  dbo.[FN_ACC_GetIncomeLedgerName] ('LABORATORY','')
*/
ALTER FUNCTION [dbo].[FN_ACC_GetIncomeLedgerName]
 (@ServiceDeptName Varchar(200),@ItemName Varchar(200), @HospitalId INT)
RETURNS Varchar(300)

AS
BEGIN	
  Declare @retStringName varchar(300)
  if exists(select top 1  * from ACC_MST_Hospital where HospitalId=@HospitalId and IsActive=1 AND HospitalShortName='charak')
  Begin
       set @retStringName= (select LedgerName from ACC_Ledger
	    where HospitalId = @HospitalId AND [Name]='RR_INCOME_SERVICESINCOME_SERVICES')
  End
  else 
  Begin   
  set @retStringName=  ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
			when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
			when (@ServiceDeptName='LABORATORY' and @ItemName='HISTO')  THEN ('HISTO') 
			when (@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY' and @ItemName like '%FNAC%')  THEN ('FNAC') 
			when (@ServiceDeptName='ATOMIC ABSORTION')
					OR(@ServiceDeptName='BIOCHEMISTRY')
					OR(@ServiceDeptName='CLNICAL PATHOLOGY')
					OR(@ServiceDeptName='CLINICAL PATHOLOGY')
					OR(@ServiceDeptName='CYTOLOGY')
					OR(@ServiceDeptName='KIDNEY BIOPSY')
					OR(@ServiceDeptName='SKIN BIOPSY')
					OR(@ServiceDeptName='CONJUNCTIVAL BIOPSY')
					OR(@ServiceDeptName='EXTERNAL LAB-3')
					OR(@ServiceDeptName='EXTERNAL LAB - 1')
					OR(@ServiceDeptName='EXTERNAL LAB - 2')
					OR(@ServiceDeptName='HISTOPATHOLOGY')
					OR(@ServiceDeptName='IMMUNOHISTROCHEMISTRY')
					OR(@ServiceDeptName='MOLECULAR DIAGNOSTICS')
					OR(@ServiceDeptName='SPECIALISED BIOPHYSICS ASSAYS')
					OR(@ServiceDeptName='SEROLOGY')
					OR(@ServiceDeptName='MICROBIOLOGY')
					OR(@ServiceDeptName='HEMATOLOGY') 
					OR(@ServiceDeptName='LABORATORY')
					OR(@ServiceDeptName='LAB CHARGES') THEN ('PATHOLOGY')
					
		   WHEN (@ServiceDeptName='DUCT')
					OR(@ServiceDeptName='MAMMOLOGY')
					OR(@ServiceDeptName='PERFORMANCE TEST') 
					OR(@ServiceDeptName='MRI')
					OR(@ServiceDeptName='C.T. SCAN')
					OR(@ServiceDeptName='ULTRASOUND')
					OR(@ServiceDeptName='ULTRASOUND COLOR DOPPLER')
					OR(@ServiceDeptName='BMD-BONEDENSITOMETRY')
					OR(@ServiceDeptName='OPG-ORTHOPANTOGRAM')
					OR(@ServiceDeptName='MAMMOGRAPHY')
					OR(@ServiceDeptName='X-RAY')
					OR(@ServiceDeptName='DEXA')
					OR(@ServiceDeptName='IMAGING')  		THEN ('RADIOLOGY')
		  when (@ServiceDeptName='MISCELLANEOUS')
					OR (@ServiceDeptName='MISCELLENOUS CHARGES')
															then ('MISCELLANEOUS')
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
				OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )
 
  end
  return @retStringname
END
GO

if exists(select top 1 * from ACC_MST_FiscalYears where FiscalYearName='2077/2078')
Begin
	update ACC_MST_FiscalYears
	set IsActive = 1
	where FiscalYearName= '2077/2078'
end
go
--END:Vikas/NageshBB:14th Jul 2020: Transfer to accounting billing issue resolved.

-- START:Vikas/NageshBB:14th Jul 2020: added ledgers into current fiscal year if not existed.

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_AccountClosure]
			@CurrentFiscalYearId int,
			@NextFiscalYearId int,
			@HospitalId int
	AS
	--EXEC [dbo].[SP_ACC_AccountClosure] @CurrentFiscalYearId = 2, @NextFiscalYearId =3, @HospitalId=3
	
	/************************************************************************
	FileName: [SP_ACC_AccountClosure]
	CreatedBy/date: Nagesh /19'June2020
	Description: sp will close current fiscal year. add closing balance and forward closing for next fiscal year as opening balance
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /19'June2020						created script for account closure task
	2.      Sud/Nagesh:20Jun'20						HospitalId added for Phrm-Acc Separation
	3.		Nagesh/02Jul'20							sp changes for account closure task working
	4.		Nagesh/12Jul'2020						sp changes for next fiscal year opening balance Dr to cr issue resolution AND Retain Earning balance updation
													we will forward NetProfit into Retain Earning
    5.		Vikas/NageshBB:14th Jul 2020:			added ledgers into current fiscal year if not existed.
	*************************************************************************/
	BEGIN
	
		IF(@CurrentFiscalYearId IS NOT NULL AND @NextFiscalYearId IS NOT NULL) 
		BEGIN				  
	    --step 0 - check ledger balance history has ledgers for current fiscal year.
				-- if there is no ledger for current fiscal year then we need to insert.
		declare @ledgercount int=0
		set @ledgercount =(select COUNT(LedgerId) from ACC_LedgerBalanceHistory where HospitalId=@HospitalId and FiscalYearId=@CurrentFiscalYearId)		
		if(@ledgercount=0)
		begin
			insert into ACC_LedgerBalanceHistory (FiscalYearId,LedgerId,OpeningBalance,OpeningDrCr,ClosingBalance,ClosingDrCr,CreatedBy,CreatedOn,HospitalId)
			select @CurrentFiscalYearId, LedgerId,OpeningBalance,DrCr,0,1,1,GETDATE(),@HospitalId from ACC_Ledger
		end
		--Step 1- delete all ledger list from Ledger_BalanceHistory table for NextFiscalYearId		
		delete from ACC_LedgerBalanceHistory 
		where FiscalYearId=@NextFiscalYearId and HospitalId=@HospitalId
		
		--Step 2- Update closing balance of CurrentFiscalYear as 0
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=0, ClosingDrCr=1 
		where FiscalYearId=@CurrentFiscalYearId  and HospitalId=@HospitalId

		--Step 3-calculate current fiscal year closing balance with ledgerid
		DECLARE @TBLCurrentFiscalYearCloseBalance TABLE (LedgerId INT Not null unique, Balance float, DrCr bit, hospitalId int)
		Insert into @TBLCurrentFiscalYearCloseBalance(LedgerId, Balance, DrCr, hospitalId)
		select 		
		 LedgerId,
		 Case WHEN Dr>Cr THEN Dr-Cr  ELSE Cr-Dr END AS Balance,
		 Case WHEN Dr>Cr THEN 1  ELSE 0 END AS DrCr	,
		 HospitalId	
		 from 
		 (
			 select l.LedgerId,
			 Case WHEN DrCr=1 THEN isnull(OpeningBalance,0)+isnull(DrAmount,0)  ELSE isnull(DrAmount,0) END AS Dr,
			 Case WHEN DrCr=0 THEN  isnull(OpeningBalance,0)+IsNULL(CrAmount,0) ELSE IsNULL(CrAmount,0) END AS Cr,
			 l.HospitalId
			 from ACC_Ledger l 
			 left join
			 (
						 select LedgerId, sum(DrAmount) DrAmount, sum(CrAmount) CrAmount
						 from 
						 (
								 select LedgerId, Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount, Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
								 from ACC_TransactionItems ti join ACC_Transactions t on t.TransactionId=ti.TransactionId  
								 where t.FiscalYearId=@CurrentFiscalYearId and  t.HospitalId=@HospitalId
						 ) ledTxn group by LedgerId
			  )TxnDetails 
			  on TxnDetails.LedgerId=l.LedgerId and l.HospitalId=@HospitalId

			) a			
		--Step 4 --Update closing balance of current fiscal Year
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=bt.Balance, ClosingDrCr=bt.DrCr		
		from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId and bt.hospitalId = bh.HospitalId	
		where FiscalYearId=@CurrentFiscalYearId	and  bh.HospitalId = @HospitalId 

		--Step 5- Insert all Ledgers with Next FiscalYearId into ACC_LedgerBalanceHistory, Here default opening balance is 0
		Insert into  ACC_LedgerBalanceHistory (FiscalYearId, LedgerId, OpeningBalance, OpeningDrCr,CreatedBy, CreatedOn, HospitalId)		
		select @NextFiscalYearId, LedgerId,0,1,1 as CreatedBy, GETDATE() as CreatedOn, hospitalId
		from @TBLCurrentFiscalYearCloseBalance where HospitalId=@HospitalId

		--Step 6 - Update Next fiscal year assets and liability opening balance from current fiscal year closing balance
		 declare @Assets varchar(50)=(select name from ACC_MST_CodeDetails where code='008' and HospitalId=@HospitalId)
		 declare @Liabilities varchar(50)=(select name from ACC_MST_CodeDetails where code='009' and HospitalId=@HospitalId)
		
		 update ACC_LedgerBalanceHistory
		 set OpeningBalance=bt.Balance, OpeningDrCr=bt.DrCr
		 from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId and bt.hospitalId=bh.HospitalId
		 where FiscalYearId=@NextFiscalYearId  
		 and bt.LedgerId in
		 (
			   select LedgerId from ACC_Ledger l where LedgerGroupId in ( select LedgerGroupId from ACC_MST_LedgerGroup
			   where HospitalId=@HospitalId and PrimaryGroup in (@Assets, @Liabilities)) and l.HospitalId=@HospitalId			                       
		 )		
		 
		 --Step 7 -Forward Net Profit as Retain Earning for next fiscal year
		 declare @RetainEarnLedgerName varchar(50)=(select name from ACC_MST_CodeDetails where code='016' and HospitalId=@HospitalId)		
		 declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=@HospitalId)
		 declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=@HospitalId)
		 --revenue always Cr and Expenses alway Dr
		 Declare @TblNetProfit TABLE (NetProfit float, DrCr bit)
		 
		 insert into @TblNetProfit(NetProfit, DrCr)
		 select case when Expense > Revenue then Expense-Revenue else Revenue-Expense end NetProfit,
		 case when Expense > Revenue then 1 else 0 end DrCr
		 from 
		 ( 
			select sum(balance) as Expense				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=1 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in (@Expenses)) ) as Rev,
			
			(select sum(balance) as Revenue				
			from @TBLCurrentFiscalYearCloseBalance where DrCr=0 and  LedgerId in  (
			select l.Ledgerid from   ACC_Ledger l 
			join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
			where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in (@Revenue)) 
		) b 


		 Declare @RetainEarnLedId int= (select LedgerId from ACC_Ledger where LedgerName=@RetainEarnLedgerName)	
		 Declare @TblRetainEarningOpening  table (OpeningBalance float, DrCr bit)

		 insert into @TblRetainEarningOpening (OpeningBalance, DrCr)
		 select OpeningBalance,OpeningDrCr from ACC_LedgerBalanceHistory where FiscalYearId=@NextFiscalYearId and HospitalId=@HospitalId and LedgerId=@RetainEarnLedId
		 
		 Declare @RetainEarnDrCr bit, @RetainEarnBalance float
			IF((select top 1 DrCr from @TblNetProfit) = (select top 1 DrCr from @TblRetainEarningOpening))				
				BEGIN  
				  set @RetainEarnDrCr=(select top 1 DrCr from @TblNetProfit)
				  set @RetainEarnBalance=(select top 1 NetProfit from @TblNetProfit)+ (select top 1 OpeningBalance from @TblRetainEarningOpening)				   
				END  
				ELSE IF((select top 1 NetProfit from @TblNetProfit) > (select top 1 OpeningBalance from @TblRetainEarningOpening))									
				BEGIN  
					set @RetainEarnDrCr=(select top 1 DrCr from @TblNetProfit)
					set @RetainEarnBalance=(select top 1 NetProfit from @TblNetProfit)- (select top 1 OpeningBalance from @TblRetainEarningOpening)				   
				END
				ELSE
				BEGIN
					set @RetainEarnDrCr=(select top 1 DrCr from @TblRetainEarningOpening)
					set @RetainEarnBalance=(select top 1 OpeningBalance from @TblRetainEarningOpening)-(select top 1 NetProfit from @TblNetProfit)
				END		 
		update ACC_LedgerBalanceHistory 
		set OpeningBalance= @RetainEarnBalance, OpeningDrCr=@RetainEarnDrCr
		where LedgerId=@RetainEarnLedId
		and FiscalYearId=@NextFiscalYearId AND HospitalId=@HospitalId
				
		--Step 8- Update LedgerOpening Balance of Ledger table 
		update ACC_Ledger set OpeningBalance=bh.OpeningBalance, DrCr=bh.OpeningDrCr
		from ACC_LedgerBalanceHistory bh join ACC_Ledger l on l.LedgerId=bh.LedgerId
		where bh.FiscalYearId=@NextFiscalYearId and bh.HospitalId=@HospitalId

	 --Step 9- Update current fiscal year make IsClosed=true
       update ACC_MST_FiscalYears set IsClosed=1
       where FiscalYearId=@CurrentFiscalYearId
		END		
	END
	GO
-- END:Vikas/NageshBB:14th Jul 2020: added ledgers into current fiscal year if not existed.

---Anish: START: 14 July 2020, Lab Verification Parameter Update-----
Update CORE_CFG_Parameters
set ParameterValue='{"EnableVerificationStep": false,"VerificationLevel":1,
 "PreliminaryReportSignature": "Preliminary Report","ShowVerifierSignature": true,
 "PreliminaryReportText":"This is preliminary text"}', ValueDataType='json' where ParameterName='LabReportVerificationNeededB4Print'
 Go

 --Update Nursing Inpatient
Update RBAC_Permission
Set PermissionName='nursing-ip-summary-view' where PermissionName='nursing-patientoverview-main-summary';
Go
 ---Anish: END: 14 July 2020, Lab Verification Parameter Update-----


 --Pratik: START: 14july2020    ------
 update CORE_CFG_Parameters
set ParameterValue='{"ServiceDepartmentId":37,"ItemName": "Health Card","ItemId":34}'
where ParameterGroupName='Common' and ParameterName='BillItemHealthCard'
GO

update CORE_CFG_Parameters
set ParameterValue='[{"ServiceDeptId": 37, "ItemId": 33, "ItemName": "OPD Card Charge","DiscountApplicable": true,"PriceChangeEnabled": false,"TaxApplicable": false,"DefaultForNewPatient": true},
  {"ServiceDeptId": 37,"ItemId": 34,"ItemName": "Health Card","DiscountApplicable": false,"PriceChangeEnabled": true,"TaxApplicable": false,"DefaultForNewPatient": false}]'
  where ParameterGroupName='Appointment' and ParameterName='AdditionalBillItem'
  GO
 --Pratik: END: 14july2020    ------ 

 ---START: NageshBB: 14 July 2020, Profit and loss report data now showing update script-----

 SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_RPT_GetProfitAndLossData]
    @FromDate DATETIME,
    @ToDate DATETIME,
    @HospitalId INT
  AS
  --EXEC [dbo].[SP_ACC_RPT_GetProfitAndLossData] @FromDate = '2020-06-12 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
  
  /************************************************************************
  FileName: [[SP_ACC_RPT_GetProfitAndLossData]]
  CreatedBy/date: Nagesh /12'June2020
  Description: get records for profit & Loss report of accounting
  Change History
  -------------------------------------------------------------------------
  S.No.    UpdatedBy/Date                        Remarks
  -------------------------------------------------------------------------
  1       Nagesh /12'June2020            created script for get profit and loss report records
  2.      Sud/Nagesh: 20Jun'20                   Added HospitalId for Phrm-Separation
  *************************************************************************/
  BEGIN
  
    IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
    BEGIN          
       declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=@HospitalId)
     declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=@HospitalId)
    
    Select l.LedgerId, 
    lg.PrimaryGroup, 
    l.LedgerName,
    lg.COA, 
    lg.LedgerGroupName, 
    l.Code, 
    SUM(txnItm.DrAmount) 'DRAmount', 
    SUM(txnItm.CrAmount) 'CRAmount'
        FROM ACC_Transactions  txn
        INNER JOIN 
          (Select  
         TransactionId, LedgerId,
         Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
         Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
         from  ACC_TransactionItems where HospitalId=@HospitalId ) txnItm 
         ON txn.TransactionId = txnItm.TransactionId
         INNER JOIN ACC_Ledger l
         ON txnItm.LedgerId = l.LedgerId
         INNER JOIN ACC_MST_LedgerGroup lg
         ON l.LedgerGroupId = lg.LedgerGroupId   and lg.PrimaryGroup IN (@Revenue, @Expenses)
    WHERE  l.HospitalId=@HospitalId  and lg. HospitalId=@HospitalId and
    convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
    Group by l.LedgerId, lg.PrimaryGroup, l.LedgerName,lg.COA, lg.LedgerGroupName, l.Code
  
    END    
  END
  go
---END: NageshBB: 14 July 2020, Profit and loss report data now showing update script-----

--START:NageshBB: 14 July 2020: update fiscal year start date for 2077/78
if exists(select top 1 * from ACC_MST_FiscalYears where FiscalYearName='2077/2078')
Begin
Update ACC_MST_FiscalYears 
set StartDate='2020-07-16 00:00:00.000'
where FiscalYearName='2077/2078'
End
Go
--END:NageshBB: 14 July 2020: update fiscal year start date for 2077/78

--START: NageshBB: 15 Jul 2020: fix for account close NetProfit forward to Retain Earning logic  
--Normally Expense always Dr and Revenue always Cr but in some case expenses may be Cr and Revenue Dr
--Now i've fixed for this case . This knoledge and conditions explained by Sagar sir
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_AccountClosure]
			@CurrentFiscalYearId int,
			@NextFiscalYearId int,
			@HospitalId int
	AS
	--EXEC [dbo].[SP_ACC_AccountClosure] @CurrentFiscalYearId = 2, @NextFiscalYearId =3, @HospitalId=3
	
	/************************************************************************
	FileName: [SP_ACC_AccountClosure]
	CreatedBy/date: Nagesh /19'June2020
	Description: sp will close current fiscal year. add closing balance and forward closing for next fiscal year as opening balance
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1       Nagesh /19'June2020						created script for account closure task
	2.      Sud/Nagesh:20Jun'20						HospitalId added for Phrm-Acc Separation
	3.		Nagesh/02Jul'20							sp changes for account closure task working
	4.		Nagesh/12Jul'2020						sp changes for next fiscal year opening balance Dr to cr issue resolution AND Retain Earning balance updation
													we will forward NetProfit into Retain Earning
    5.		Vikas/NageshBB:14th Jul 2020:			added ledgers into current fiscal year if not existed.
	6.		Nagesh: 15 Jul 2020						fix for account close NetProfit forward to Retain Earning logic 
													Normally Expense always Dr and Revenue always Cr but in some case expenses may be Cr and Revenue Dr
													Now i've fixed for this case . This knoledge and conditions explained by Sagar sir
	*************************************************************************/
	BEGIN
	
		IF(@CurrentFiscalYearId IS NOT NULL AND @NextFiscalYearId IS NOT NULL) 
		BEGIN				  
	    --step 0 - check ledger balance history has ledgers for current fiscal year.
				-- if there is no ledger for current fiscal year then we need to insert.
		declare @ledgercount int=0
		set @ledgercount =(select COUNT(LedgerId) from ACC_LedgerBalanceHistory where HospitalId=@HospitalId and FiscalYearId=@CurrentFiscalYearId)		
		if(@ledgercount=0)
		begin
			insert into ACC_LedgerBalanceHistory (FiscalYearId,LedgerId,OpeningBalance,OpeningDrCr,ClosingBalance,ClosingDrCr,CreatedBy,CreatedOn,HospitalId)
			select @CurrentFiscalYearId, LedgerId,OpeningBalance,DrCr,0,1,1,GETDATE(),@HospitalId from ACC_Ledger
		end
		--Step 1- delete all ledger list from Ledger_BalanceHistory table for NextFiscalYearId		
		delete from ACC_LedgerBalanceHistory 
		where FiscalYearId=@NextFiscalYearId and HospitalId=@HospitalId
		
		--Step 2- Update closing balance of CurrentFiscalYear as 0
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=0, ClosingDrCr=1 
		where FiscalYearId=@CurrentFiscalYearId  and HospitalId=@HospitalId

		--Step 3-calculate current fiscal year closing balance with ledgerid
		DECLARE @TBLCurrentFiscalYearCloseBalance TABLE (LedgerId INT Not null unique, Balance float, DrCr bit, hospitalId int)
		Insert into @TBLCurrentFiscalYearCloseBalance(LedgerId, Balance, DrCr, hospitalId)
		select 		
		 LedgerId,
		 Case WHEN Dr>Cr THEN Dr-Cr  ELSE Cr-Dr END AS Balance,
		 Case WHEN Dr>Cr THEN 1  ELSE 0 END AS DrCr	,
		 HospitalId	
		 from 
		 (
			 select l.LedgerId,
			 Case WHEN DrCr=1 THEN isnull(OpeningBalance,0)+isnull(DrAmount,0)  ELSE isnull(DrAmount,0) END AS Dr,
			 Case WHEN DrCr=0 THEN  isnull(OpeningBalance,0)+IsNULL(CrAmount,0) ELSE IsNULL(CrAmount,0) END AS Cr,
			 l.HospitalId
			 from ACC_Ledger l 
			 left join
			 (
						 select LedgerId, sum(DrAmount) DrAmount, sum(CrAmount) CrAmount
						 from 
						 (
								 select LedgerId, Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount, Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
								 from ACC_TransactionItems ti join ACC_Transactions t on t.TransactionId=ti.TransactionId  
								 where t.FiscalYearId=@CurrentFiscalYearId and  t.HospitalId=@HospitalId
						 ) ledTxn group by LedgerId
			  )TxnDetails 
			  on TxnDetails.LedgerId=l.LedgerId and l.HospitalId=@HospitalId

			) a			
		--Step 4 --Update closing balance of current fiscal Year
		Update ACC_LedgerBalanceHistory 
		set ClosingBalance=bt.Balance, ClosingDrCr=bt.DrCr		
		from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId and bt.hospitalId = bh.HospitalId	
		where FiscalYearId=@CurrentFiscalYearId	and  bh.HospitalId = @HospitalId 

		--Step 5- Insert all Ledgers with Next FiscalYearId into ACC_LedgerBalanceHistory, Here default opening balance is 0
		Insert into  ACC_LedgerBalanceHistory (FiscalYearId, LedgerId, OpeningBalance, OpeningDrCr,CreatedBy, CreatedOn, HospitalId)		
		select @NextFiscalYearId, LedgerId,0,1,1 as CreatedBy, GETDATE() as CreatedOn, hospitalId
		from @TBLCurrentFiscalYearCloseBalance where HospitalId=@HospitalId

		--Step 6 - Update Next fiscal year assets and liability opening balance from current fiscal year closing balance
		 declare @Assets varchar(50)=(select name from ACC_MST_CodeDetails where code='008' and HospitalId=@HospitalId)
		 declare @Liabilities varchar(50)=(select name from ACC_MST_CodeDetails where code='009' and HospitalId=@HospitalId)
		
		 update ACC_LedgerBalanceHistory
		 set OpeningBalance=bt.Balance, OpeningDrCr=bt.DrCr
		 from @TBLCurrentFiscalYearCloseBalance bt join ACC_LedgerBalanceHistory bh on bt.LedgerId=bh.LedgerId and bt.hospitalId=bh.HospitalId
		 where FiscalYearId=@NextFiscalYearId  
		 and bt.LedgerId in
		 (
			   select LedgerId from ACC_Ledger l where LedgerGroupId in ( select LedgerGroupId from ACC_MST_LedgerGroup
			   where HospitalId=@HospitalId and PrimaryGroup in (@Assets, @Liabilities)) and l.HospitalId=@HospitalId			                       
		 )		
		 
		 --Step 7 -Forward Net Profit as Retain Earning for next fiscal year
		 declare @RetainEarnLedgerName varchar(50)=(select name from ACC_MST_CodeDetails where code='016' and HospitalId=@HospitalId)		
		 declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=@HospitalId)
		 declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=@HospitalId)
		 --revenue always Cr and Expenses alway Dr
		 Declare @TblNetProfit TABLE (NetProfit float, DrCr bit)
		 
			 insert into @TblNetProfit(NetProfit, DrCr)				
			 select case when ExpDr > RevCr then ExpDr-RevCr else RevCr-ExpDr end NetProfit,
			 case when ExpDr > RevCr then 1 else 0 end DrCr from
			 (
			select (ExpDr-ExpCr)as ExpDr, (RevCr-RevDr) RevCr from (
			select  
			isnull((select sum(balance) as Expense from @TBLCurrentFiscalYearCloseBalance where DrCr=1 and  LedgerId in  
				(
					select l1.Ledgerid from   ACC_Ledger l1 
					join ACC_MST_LedgerGroup lg on l1.LedgerGroupId=lg.LedgerGroupId
					where l1.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in ('Expenses')
				) 
			),0) as ExpDr,
			isnull((select sum(balance) as Expense from @TBLCurrentFiscalYearCloseBalance where DrCr=0 and  LedgerId in  
				(
					select l1.Ledgerid from   ACC_Ledger l1 
					join ACC_MST_LedgerGroup lg on l1.LedgerGroupId=lg.LedgerGroupId
					where l1.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in ('Expenses')
				) 
			),0) as ExpCr,
			Isnull((select sum(balance) as Revenue	from @TBLCurrentFiscalYearCloseBalance  where DrCr=1 and  LedgerId in  
				(
					select l.Ledgerid from   ACC_Ledger l 
					join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
					where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in ('Revenue')
				)
			),0) as RevDr,
			isnull((select sum(balance) as Revenue	from @TBLCurrentFiscalYearCloseBalance  where DrCr=0 and  LedgerId in  
				(
					select l.Ledgerid from   ACC_Ledger l 
					join ACC_MST_LedgerGroup lg on l.LedgerGroupId=lg.LedgerGroupId
					where l.HospitalId=@HospitalId AND lg.HospitalId=@HospitalId AND PrimaryGroup in ('Revenue')
				)
			),0) as RevCr
			)a) b
		

		 Declare @RetainEarnLedId int= (select LedgerId from ACC_Ledger where LedgerName=@RetainEarnLedgerName)	
		 Declare @TblRetainEarningOpening  table (OpeningBalance float, DrCr bit)

		 insert into @TblRetainEarningOpening (OpeningBalance, DrCr)
		 select OpeningBalance,OpeningDrCr from ACC_LedgerBalanceHistory where FiscalYearId=@NextFiscalYearId and HospitalId=@HospitalId and LedgerId=@RetainEarnLedId
		 
		 Declare @RetainEarnDrCr bit, @RetainEarnBalance float
			IF((select top 1 DrCr from @TblNetProfit) = (select top 1 DrCr from @TblRetainEarningOpening))				
				BEGIN  
				  set @RetainEarnDrCr=(select top 1 DrCr from @TblNetProfit)
				  set @RetainEarnBalance=(select top 1 NetProfit from @TblNetProfit)+ (select top 1 OpeningBalance from @TblRetainEarningOpening)				   
				END  
				ELSE IF((select top 1 NetProfit from @TblNetProfit) > (select top 1 OpeningBalance from @TblRetainEarningOpening))									
				BEGIN  
					set @RetainEarnDrCr=(select top 1 DrCr from @TblNetProfit)
					set @RetainEarnBalance=(select top 1 NetProfit from @TblNetProfit)- (select top 1 OpeningBalance from @TblRetainEarningOpening)				   
				END
				ELSE
				BEGIN
					set @RetainEarnDrCr=(select top 1 DrCr from @TblRetainEarningOpening)
					set @RetainEarnBalance=(select top 1 OpeningBalance from @TblRetainEarningOpening)-(select top 1 NetProfit from @TblNetProfit)
				END		 
		update ACC_LedgerBalanceHistory 
		set OpeningBalance= @RetainEarnBalance, OpeningDrCr=@RetainEarnDrCr
		where LedgerId=@RetainEarnLedId
		and FiscalYearId=@NextFiscalYearId AND HospitalId=@HospitalId
				
		--Step 8- Update LedgerOpening Balance of Ledger table 
		update ACC_Ledger set OpeningBalance=bh.OpeningBalance, DrCr=bh.OpeningDrCr
		from ACC_LedgerBalanceHistory bh join ACC_Ledger l on l.LedgerId=bh.LedgerId
		where bh.FiscalYearId=@NextFiscalYearId and bh.HospitalId=@HospitalId

	 --Step 9- Update current fiscal year make IsClosed=true
       update ACC_MST_FiscalYears set IsClosed=1
       where FiscalYearId=@CurrentFiscalYearId
		END		
	END
	GO
------END: NageshBB: 15 Jul 2020: fix for account close NetProfit forward to Retain Earning logic 

------START: SANJESH: 16th July '20 : In Pharmacy->Store update expiry date and BatchNo in  store and  maintain its old data in history table
ALTER TABLE [PHRM_StoreStock]
ADD CONSTRAINT PK_PHRM_StoreStock PRIMARY KEY ([StoreStockId]);
GO

CREATE TABLE [dbo].[PHRM_ExpiryDate_BatchNo_History](
	[PHRMExpBatchHistoryId] [int] IDENTITY(1,1) NOT NULL,
	[StoreStockId] int  NULL,
	[OldExpiryDate] [datetime] NULL,
	[OldBatchNo] [varchar](100) NULL,
	[EndDate] [datetime] NULL,
	[CreatedBy] [int] NULL,
) 
GO
ALTER TABLE [PHRM_ExpiryDate_BatchNo_History]
ADD CONSTRAINT PK_Phrm_Exp_Batch_History PRIMARY KEY ([PHRMExpBatchHistoryId]);
GO

ALTER TABLE [dbo].[PHRM_ExpiryDate_BatchNo_History]  WITH NOCHECK ADD  CONSTRAINT [FK_Phrm_Exp_Batch_History_StoreStockId_PHRM_StoreStock_StoreStockId] FOREIGN KEY([StoreStockId])
REFERENCES [dbo].[PHRM_StoreStock] ([StoreStockId])
GO

ALTER TABLE [dbo].[PHRM_ExpiryDate_BatchNo_History] CHECK CONSTRAINT [FK_Phrm_Exp_Batch_History_StoreStockId_PHRM_StoreStock_StoreStockId]
GO

DECLARE @ApplicationId int;
SET @ApplicationId = (SELECT TOP(1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'PHRM' and ApplicationName = 'Pharmacy')
INSERT INTO RBAC_Permission
(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES
('store-update-expirydate-batchno-button', @ApplicationId,1,GETDATE(),1)
GO
--END: SANJESH: 16th July '20 : In Pharmacy->Store update expiry date and BatchNo in  store and  maintain its old data in history table

----START: NageshBB: 16 Jul 2020 -- changes for handle payment mode card in billing get and edit voucher log save table create 

IF  NOT EXISTS (SELECT * FROM sys.objects 
WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Log_EditVoucher]'))

BEGIN    
  CREATE TABLE [dbo].[ACC_Log_EditVoucher](
    [LogId] [int] IDENTITY(1,1) NOT NULL,
    [TransactionDate] [datetime] NULL,
    [SectionId] [int] NULL,
    [VoucherNumber] [varchar](50) NULL,
    [Reason] [nvarchar](max) NULL,
    [OldVocherJsonData] [nvarchar](max) NULL,
    [FiscalYearId] [varchar](50) NULL,
    [HospitalId] [varchar](50) NULL,
    [CreatedOn] [varchar](50) NULL,
    [CreatedBy] [varchar](50) NULL,
   CONSTRAINT [PK_ACC_Log_EditVoucher] PRIMARY KEY CLUSTERED 
  (
    [LogId] ASC
  )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
  ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER Procedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]
  @TransactionDate DATE, @HospitalId INT
AS

/**************************************************
Stored Procedure Name:SP_ACC_Bill_GetBillingDataForAccTransfer
Details:
-This stored procedure will get billing module data for transfer to accounting by date
-We are getting billing records, deposit records, etc
	
 Change History:
 ----------------------------------------------------------------------------------
 S.No.   Author					Date               Remarks
 ----------------------------------------------------------------------------------
 1.      NageshBB & Sud sir		16/03/2020       Stored procedure created
 2.      Nagesh/Sud               8May'20        Paymentmode=card handled in billingtransaction
 3.		 Sud/NageshBB			16 Jul 2020		 Payment mode=card handle in all cases 
 ----------------------------------------------------------------------------------

**********************************************/
BEGIN

  IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
  BEGIN
  
  SELECT * from BIL_SYNC_BillingAccounting 
  WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @TransactionDate) AND CONVERT(date, @TransactionDate)
  END
  ELSE
  BEGIN    
 --Note:-BillingAccountingSyncId added for temporary pupose because code mapping model has this column , later we need to remove this 
------Cash Bill----------CashBill->BIL_TXN_BillingTransactionItems->BillingTransactionItemId  (TransactionType->TableName->ReferenceId Column Name)
			 Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBill' TransactionType,
			  'cash' As PaymentMode, 
			 --txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 itm.PaidDate 'TransactionDate',
			 GetDate() 'CreatedOn',
			 itm.PaymentReceivedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.PaidDate) = @TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			  --- sud/nagesh:8may'20-- below case should be separated for card and cheque after requirement comes for this..
			 and ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')
			 AND ISNULL(itm.IsCashBillSync,0) = 0  -- Include only Not-Synced Data for CashBill Case--
			
			
			
			UNION ALL
			
---------Credit Bill----------------------------------------------CreditBill-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBill' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 txn.CreatedOn 'TransactionDate', -- this is credit date.. 
			 GetDate() 'CreatedOn',
			 itm.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.CreatedOn)=@TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillSync,0) = 0  -- Include only Not-Synced Data for CreditBill Case--
					

			UNION ALL
			
-----------------Credit Bill Paid-----CreditBillPaid-BillingTransactionId-BIL_TXN_BillingTransaction
		--for now we are commenting this function, later we will get creditbill paid records
			--Select 
			-- txn.BillingTransactionId as BillingAccountingSyncId,
			-- txn.BillingTransactionId AS 'ReferenceId',
			-- 'CreditBillPaid' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it, we might need CreditOrganization's LEdger here.. 
			--  sett.PatientId,
			-- 'CreditBillPaid' TransactionType,
			--  sett.PaymentMode As PaymentMode, 
			-- NULL SubTotal,
			-- 0 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- txn.TotalAmount AS TotalAmount,
			
			-- 0 AS IsTransferedToAcc,
			-- SettlementDate 'TransactionDate', -- this is credit date.. 
			-- GetDate() 'CreatedOn',
			-- sett.CreatedBy AS CreatedBy,
			-- NULL AS SettlementDiscountAmount,  -- Can't take this here, it'll go separately into Cash Discount LEdger.. 
			-- NULL AS Remark,
			-- txn.OrganizationId AS CreditOrganizationId   -- correct it after Settlement is separated for CreditOrginizations.
			--from BIL_TXN_Settlements sett, BIL_TXN_BillingTransaction txn
			
			--Where 
			--     sett.SettlementId = txn.SettlementId
			--   AND Convert(Date,SettlementDate)=@TransactionDate
			--   AND ISNULL(txn.IsCreditBillPaidSync,0) = 0  -- Include only Not-Synced Data for Credit Paid Case--
			
			--UNION ALL
			
-----------------------Cash Bill Return---CashBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBillReturn' TransactionType,
			 --txn.PaymentMode As PaymentMode, --NBB: 16Jul20-card payment not handle yet
			 'cash' As PaymentMode, 			
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate--sud-19March this should've been createdon of return table..
			 and ISNULL(itm.ReturnStatus,0) != 0  
			 and itm.BillingTransactionId IS NOT NULL
			 and  ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')  ---we considering all payment mode as cash , except credit
			 AND ISNULL(itm.IsCashBillReturnSync,0) = 0  -- Include only Not-Synced Data for CashBill Return Case--
			
			UNION ALL
			
------------CreditBillReturn--- done with join from Transaction, TransactionItem and InvoiceReturn Table--CreditBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			   txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate
			 and ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  -- Include only Not-Synced Data for Credit Return Case--
			
			 UNION ALL
			
------------------Deposit Add---DepositAdd-DepositId-BIL_TXN_Deposit
			Select 
			 DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositAdd' TransactionType,
			  'cash' As PaymentMode, 
			 --PaymentMode As PaymentMode, --NBB: 16Jul20-card payment not handle yet
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType ='Deposit'
			AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			UNION ALL
			
-------Deposit Return/Deduct---DepositReturn-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositReturn' TransactionType,
			  --	 PaymentMode As PaymentMode, --NBB: 16Jul20-card payment not handle yet
			 'cash' As PaymentMode, 		 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType IN ('ReturnDeposit', 'depositdeduct')
			 AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			
			---UNION ALL--
			
---------Cash discount -- from settlement-- New new Transfer rule for this---CashDiscount-SettlementId-BIL_TXN_Settlements
			--Select 
			--SettlementId as BillingAccountingSyncId,
			-- SettlementId 'ReferenceId',
			-- 'CashDiscount' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it
			--  PatientId,
			-- 'CashDiscount' TransactionType,
			-- PaymentMode As PaymentMode, 
			-- NULL AS SubTotal,
			-- NULL AS 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- DiscountAmount AS TotalAmount,    -- use this column if possible
			-- 0 AS IsTransferedToAcc,
			-- CreatedOn 'TransactionDate',
			-- GetDate() 'CreatedOn',
			-- CreatedBy AS CreatedBy,
			-- DiscountAmount AS SettlementDiscountAmount,  -- don't use this column if possible.
			-- NULL AS Remark,
			-- NULL AS CreditOrganizationId  
			--from BIL_TXN_Settlements
			
			--Where 
			--  Convert(Date,CreatedOn)=@TransactionDate
			--  AND ISNULL(DiscountAmount,0) != 0  -- exclude zero discount, since it's not needed.
			--  AND ISNULL(IsCashDiscountSync,0) = 0  -- Include only Not-Synced Data	
  END			  					
END
Go
----END: NageshBB: 16 Jul 2020 -- changes for handle payment mode card in billing get and edit voucher log save table create 

--START: NageshBB: 17 Jul 2020 -- update fiscal year id as per transaction date
update ACC_Transactions
set FiscalYearId=(select top 1 FiscalYearId from ACC_MST_FiscalYears where FiscalYearName='2076/2077')
where convert(date, TransactionDate) between '2019-07-17' and '2020-07-15'
Go

update ACC_Transactions
set FiscalYearId=(select top 1 FiscalYearId from ACC_MST_FiscalYears where FiscalYearName='2077/2078')
where convert(date, TransactionDate) between '2020-07-16' and '2021-07-15'
Go

--END: NageshBB: 17 Jul 2020 -- update fiscal year id as per transaction date


---START: Sanjesh: 17th Jul 2020: minor changes in db(SP_Report_Inventory_CurrentStockLevel_ItemId)

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
5       SANJESH/17 Jul 2020             Replace Join with LEFT JOIN for Company table joining
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
						gdrp.CreatedOn,
						unit.UOMName
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId and grd.IsCancel = 0
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				LEFT JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				JOIN INV_MST_ItemSubCategory as itmsub on itm.SubCategoryId = itmsub.SubCategoryId
				left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
				WHERE stk.ItemId = @ItemId
				GROUP BY com.CompanyName,unit.UOMName,ven.VendorName,itm.ItemName,itm.Code,stk.BatchNO,gdrp.CreatedOn,itmsub.SubCategoryName,gdrp.ExpiryDate,itm.ItemType
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
						gdrp.CreatedOn,
						unit.UOMName
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId and grd.IsCancel = 0
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				LEFT JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				JOIN INV_MST_ItemSubCategory as itmsub on itm.SubCategoryId = itmsub.SubCategoryId
				left join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
				GROUP BY com.CompanyName, unit.UOMName, ven.VendorName,itm.ItemName,itm.Code,stk.BatchNO,gdrp.CreatedOn,itmsub.SubCategoryName,gdrp.ExpiryDate,itm.ItemType
			END 
END
GO
---END: Sanjesh: 17th Jul 2020: minor changes in db(SP_Report_Inventory_CurrentStockLevel_ItemId)



--START: sud-17Jul'20-- Page sequence and visibility changed from routeconfig---

--disable Fraction module-- not required anymore--
Update RBAC_RouteConfig
SET IsActive=0
where  UrlFullPath like 'Fraction%'
GO

--disable EmployeeProfileMap page-- not required anymore--
update RBAC_RouteConfig
set IsActive=0
where UrlFullPath='Incentive/Setting/EmployeeProfileMap';
GO

---re-arrange display sequence of Settings pages as per usability-- 
update RBAC_RouteConfig
set DisplaySeq=1 
where UrlFullPath ='Incentive/Setting/EmployeeItemsSetup'
GO
update RBAC_RouteConfig
set DisplaySeq=4 
where UrlFullPath ='Incentive/Setting/ProfileManage'
GO

--END: sud-17Jul'20-- Page sequence and visibility changed from routeconfig---


---START: sud-17Jul-20 -- for Incentive BulkSync correction---

IF object_id(N'FN_INCTV_GetIncentiveSettings', N'FN') IS NOT NULL
    DROP FUNCTION FN_INCTV_GetIncentiveSettings
GO


CREATE FUNCTION [dbo].[FN_INCTV_GetIncentiveSettings_Normal] ()
RETURNS TABLE
/*
To get current incentive profile settings for normal. i.e: No GroupDistribution.. 
Created: sud-15Feb'20
Remarks: 
Change History:
------------------------------------------------------------------------------------------
S.No.    Author						Remarks
------------------------------------------------------------------------------------------
1.      15Feb'20/sud				 Initial Draft
2.      15Mar'20/Sud				Added TDSPercenatge in the Select list, which will be used later in calculation.
3.		11June2020/Pratik			GroupDistribution Impacts on Existing Functionalities 
4.      17Jul'20/Sud/Pratik			Recreate after Renamed.. 
------------------------------------------------------------------------------------------
*/
AS
    RETURN
    (
 
      SELECT 
        empBillItmMap.BillItemPriceId,empInctvInfo.EmployeeIncentiveInfoId,
        itmPrice.ServiceDepartmentId, itmPrice.ItemId, itmPrice.ItemName,
        priceCat.PriceCategoryId, priceCat.PriceCategoryName,
        emp.EmployeeId,
        emp.FullName,
        empBillItmMap.AssignedToPercent,
        empBillItmMap.ReferredByPercent,
        empInctvInfo.TDSPercent 
      from INCTV_EmployeeIncentiveInfo empInctvInfo
      INNER JOIN INCTV_MAP_EmployeeBillItemsMap empBillItmMap
        on empInctvInfo.EmployeeId=empBillItmMap.EmployeeId
      INNER JOIN BIL_CFG_BillItemPrice  itmPrice
        ON empBillItmMap.BillItemPriceId = itmPrice.BillItemPriceId
      INNER JOIN BIL_CFG_PriceCategory priceCat
        ON empBillItmMap.PriceCategoryId=priceCat.PriceCategoryId 
      INNER JOIN EMP_Employee emp
        ON empInctvInfo.EmployeeId=emp.EmployeeId  
        where empInctvInfo.IsActive=1 and empBillItmMap.IsActive=1 
		-- take only those where groupdistribution is not there---
		and ISNULL(empBillItmMap.HasGroupDistribution,0) = 0
    )

GO




Create FUNCTION [dbo].[FN_INCTV_GetIncentiveSettings_GroupDistribution] ()  
RETURNS TABLE
/*
To get settings for GroupDistribution bill items only.. 
Created: Sud/Pratik-17Jul'20
Remarks: This is different than normal incentive distribution. 
           another function for nonGroupDistribution is 'FN_INCTV_GetIncentiveSettings()'
Change History:
------------------------------------------------------------------------------------------
S.No.    Author         Remarks
------------------------------------------------------------------------------------------
1.      Sud/Pratik-17Jul'20   Initial Draft
------------------------------------------------------------------------------------------
*/
AS
    RETURN
    (
 
      Select 
		   grpDist.FromEmployeeId,
		   grpDist.DistributeToEmployeeId 'ToEmployeeId',
		   toEmp.FullName  'ToEmployeeName',
		   grpDist.DistributionPercent,

		  grpDist.BillItemPriceId,
		  cfgPrice.ServiceDepartmentId,
		  cfgPrice.ItemId,
		  cfgPrice.ItemName,
		  grpDist.IncentiveType,
		  inctvInfo.TDSPercent,
		  empBilMap.PriceCategoryId,
		  pricCat.PriceCategoryName
 
		 from INCTV_CFG_ItemGroupDistribution grpDist
		   INNER JOIN  EMP_Employee fromEmp
			  ON grpDist.FromEmployeeId = fromEmp.EmployeeId
		  INNER JOIN EMP_Employee toEmp
			  ON grpDist.DistributeToEmployeeId = toEmp.EmployeeId
		  INNER JOIN INCTV_EmployeeIncentiveInfo  inctvInfo
			  ON grpDist.DistributeToEmployeeId = inctvInfo.EmployeeId
		  INNER JOIN BIL_CFG_BillItemPrice cfgPrice
		     ON grpDist.BillItemPriceId = cfgPrice.BillItemPriceId
		  INNER JOIN INCTV_MAP_EmployeeBillItemsMap empBilMap
              ON grpDist.EmployeeBillItemsMapId = empBilMap.EmployeeBillItemsMapId
          INNER JOIN BIL_CFG_PriceCategory pricCat
             ON empBilMap.PriceCategoryId = pricCat.PriceCategoryId
		WHERE grpDist.IsActive=1 and empBilMap.IsActive=1
    )

GO


ALTER PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange '2020-02-14','2020-02-14'
 Description: 
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By            Remarks
 --------------------------------------------------
 1.      15Feb'20/Sud              Initial Draft (Needs Revision)
 2.      15Mar'20/Sud              Added TDSPercentage and TDSAmount calculation in the query
3.       4Apr'20/Sud               Excluding Already Added BillingTransactionItem during Bill Sync.
                                   earlier it was at BillingTransactionId level, now it's BillingTransactionItemId
4.       11June                    TDSpercentage from Employee Incentive Info
5.       17Jul'20/Sud/Pratik       Updated for Group Distribution 
 ---------------------------------------------------
*/
BEGIN

IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN

---Start: For Referral Incentive-----------

INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercent,
	( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.ReferredByPercent,0) !=0
	---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Referral Incentive-----------

UNION ALL

---2.1-- Start: For Assigned Incentive (No Group Distribution)-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  --, txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.AssignedToPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: 2.1 For Assigned Incentive (No Group Distribution)-----------

UNION ALL

---2.2-- Start: For Assigned Incentive (Group Distribution Only)-----------
 
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
  -- incentive goes to:  ToEmployeeId----
   sett.ToEmployeeId 'IncentiveReceiverId', sett.ToEmployeeName 'IncentiveReceiverName',
    sett.DistributionPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100


from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      ON txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
      ON TXN.FiscalYearId = fyear.FiscalYearId
  INNER JOIN 
	 FN_INCTV_GetIncentiveSettings_GroupDistribution() sett  -- this gives us group distribution settings only.. 
  
  --[FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.FromEmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN '2020-02-25' and '2020-07-17'
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.DistributionPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..

---2.2-- End: For Assigned Incentive (Group Distribution Only)-----------



END--end of IF.. 

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END--end of SP--

GO

---END: sud-17Jul-20 -- for Incentive BulkSync correction---

-----------------Branch Merged: Rusha: END: 20th July: Merged Beta branch to DEV branch---------------------------------

-----------------Branch Merged: Rusha: START: 29th July: Merged Beta branch to DEV branch---------------------------------

-----START: SANJESH :20th Jul 2020: ItemRate Mismatch fix in db(SP_Report_Inventory_SubstoreGetAllBasedOnStoreId)

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]    Script Date: 7/20/2020 10:18:17 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: [SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]
 Created: 3Mar'20 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.      20Jul'20/Sanjesh       ItemRate Mismatch fix
 -------------------------------------------------------------------------
*/
BEGIN
    SELECT str.StoreId, str.Name, 
		sum(stk.AvailableQuantity) 'TotalQuantity',
		sum(stk.AvailableQuantity*(Isnull(gritm.ItemRate,0))) 'TotalValue',
		ISNULL((select SUM(DispatchedQuantity)  from INV_TXN_DispatchItems),0) 'TotalConsumed'
	from INV_TXN_Stock stk
	join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
	join PHRM_MST_Store str on str.StoreId = 1
	WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
	group by str.StoreId,str.Name
UNION ALL
SELECT str.StoreId, str.Name, 
		sum(stk.AvailableQuantity) 'TotalQuantity',
		AVG(ISNULL(stk.MRP,0))*sum(stk.AvailableQuantity) 'TotalValue',
		SUM(ISNULL(consump.Quantity,0))'TotalConsumed'
	from WARD_INV_Stock stk
	join PHRM_MST_Store str on str.StoreId = stk.StoreId
	left join WARD_INV_Consumption consump on consump.StoreId = str.StoreId and consump.ItemId = stk.ItemId
	WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
	group by str.StoreId,str.Name

  
END

GO
---END: SANJESH: 20th Jul 2020:ItemRate Mismatch fix in db(SP_Report_Inventory_SubstoreGetAllBasedOnStoreId)

--START: NageshBB:23 Jul 2020: replaced createdOn by GoodsReceiptDate column
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetInventoryTransactions]    Script Date: 23-07-2020 15:15:20 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-----------------------------------------------------------
	
	ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]
			@FromDate DATETIME=null ,
			@ToDate DATETIME=null
		AS
		--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @FromDate = '2019-07-05 12:07:31.170', @ToDate ='2020-07-05 12:07:31.170'

		/************************************************************************
		FileName: [SP_ACC_GetInventoryTransactions]
		CreatedBy/date: Ajay/05Jul'19
		Description: getting records of inventory transactions for accounting
		Change History
		-------------------------------------------------------------------------
		S.No.    UpdatedBy/Date                        Remarks
		-------------------------------------------------------------------------
		1       Ajay/05Jul'19						created the script
		2.		Vikas / 01-Jun-2020					update table 1 data -> exculde 'Capital Goods' Item type from table1
		3.		NageshBB 23 Jul 2020				replaced createdOn by GoodsReceiptDate column
		*************************************************************************/
		BEGIN
			IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
			BEGIN
			--Table1: GoodReceipt
				SELECT 
					--gr.CreatedOn,
					gr.GoodsReceiptDate as 'CreatedOn',
					v.VendorName,
					gr.VendorId,
					 gr.PaymentMode,
					 itm.ItemCategoryId,
					 itm.ItemType,
					 itm.ItemName,
					 gr.TDSAmount,
					 gr.BillNo,									-- 26 March 2020:Vikas: added for invetory integration, mapping with accounting as per charak requirements.
					 gr.GoodsReceiptID,							-- 30 march 2020:Vikas: added GoodsReceiptID column
					 gritm.*
				FROM
					INV_TXN_GoodsReceipt gr 
					join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
					join INV_MST_Item itm on gritm.ItemId = itm.ItemId
				WHERE
					(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
					AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND itm.ItemType !='Capital Goods' -- Vikas / 01-Jun-2020	
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
					AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
					AND (CONVERT(DATE, st.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			
			 -- Table 5 :INVDeptConsumedGoods
			
					SELECT 
						csm.ConsumptionId,
						sb.SubCategoryId,
						sb.SubCategoryName,   
						csm.CreatedOn,
						csm.Quantity,
						stk.MRP
					FROM WARD_INV_Consumption csm
						join INV_MST_Item itm on csm.ItemId= itm.ItemId
						join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId
						join WARD_INV_Stock stk on itm.ItemId= stk.ItemId
					WHERE (csm.IsTransferToAcc IS NULL OR csm.IsTransferToAcc=0)  
						AND CONVERT(DATE, csm.CreatedOn) BETWEEN   CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate)

  			END
			ELSE
			BEGIN
				--Table1: GoodReceipt
				SELECT 
					gr.* ,
					v.VendorName
				FROM
					INV_TXN_GoodsReceipt gr 
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
				WHERE
					(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
				--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
				--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
				--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (TransactionType IN ('dispatch', 'Sent From WardSupply')) 
				-- Table 5 :INVDeptConsumedGoods
				
				SELECT 
					csm.ConsumptionId,
					sb.SubCategoryId,
					sb.SubCategoryName,   
					csm.CreatedOn,
					csm.Quantity,
					stk.MRP
				FROM WARD_INV_Consumption csm
					join INV_MST_Item itm on csm.ItemId= itm.ItemId
					join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId
					join WARD_INV_Stock stk on itm.ItemId= stk.ItemId
				WHERE (csm.IsTransferToAcc IS NULL OR csm.IsTransferToAcc=0)  
				END
		END
GO
--END: NageshBB:23 Jul 2020: replaced createdOn by GoodsReceiptDate column

----START: Rusha: 24th July 2020: Update script to show manage item from store only for now---

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_StockManageDetailReport] '07/24/2020','07/24/2020'   Script Date: 07/24/2020 3:01:11 PM ******/
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
5.		Rusha/ 2020-07-24						Old script used to show dispensary and store item manage but now only from store
												item can be manage, so now report will show only list of those items manage in store only 
--------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT convert(date,stkMng.CreatedOn) as [Date] ,itm.ItemName, stkMng.BatchNo, stkMng.ExpiryDate ,stkMng.Quantity,stkMng.Remark,
			case when stkMng.InOut='in'then 'stock added' else 'stock deducted'
			end as InOut, stkMng.MRP, stkMng.Price, Round(stkMng.MRP*stkMng.Quantity,2,0) as TotalAmount 
					FROM PHRM_StoreStock stkMng
            INNER JOIN PHRM_MST_Item itm on itm.ItemId = stkMng.ItemId
            WHERE  convert(datetime, stkMng.CreatedOn) 
           BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and stkMng.Quantity>0 and stkMng.TransactionType = 'stockmanage'
		END		
END
GO
----END: Rusha: 24th July 2020: Update script to show manage item from store only for now---

--START: NageshBB: 25 Jul 2020 : insert core parameter for primary hospital short name for accounting 
--insert Primary accounting hospital shortname in core parameter table for get HospitalId 
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType,Description,ParameterType)
values('Accounting', 'AccPrimaryHospitalShortName',(select top 1 HospitalShortName from ACC_MST_Hospital  where IsActive=1),
'string','Hospital/Tenant activated when user come into accounting. For other module like incentive and inventory no need to come accounting module. Get Ledger, create Voucher all need active hospital Id 
but, wheen user do action from other module hospitalId will be null. In this case they will get Hospital id detais using core parameter.',
'custom')
Go
--END: NageshBB: 25 Jul 2020 : insert core parameter for primary hospital short name for accounting 

--START: NageshBB: 26 Jul 2020 : update script for Edit voucher urlfullpath and display name 
--because of this mismatch some edit voucher tab not working as per requiremnt in some db
--script will fix for all db
if Exists (select top 1 * from RBAC_RouteConfig where TRIM(LOWER(DisplayName))= 'edit voucher' and 
LOWER(UrlFullPath)='accounting/transaction/editvoucher')
Begin
     update RBAC_RouteConfig
   set DisplayName='Edit Voucher', UrlFullPath='Accounting/Transaction/EditManualVoucher'
   where RouteId=(select top 1 RouteId from RBAC_RouteConfig where TRIM(LOWER(DisplayName))= 'edit voucher' and 
   LOWER(UrlFullPath)='accounting/transaction/editvoucher')
End
Go
--END: NageshBB: 26 Jul 2020 : update script for Edit voucher urlfullpath and display name ----


--Anish: Start: 27 July 2020: Parameter added in Radiology Scan function---
INSERT INTO CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType) 
VALUES ('Radiology','RadHoldIPBillBeforeScan','false','boolean','Enabled if Bill needs to be hold i.e.BillingStatus = false incase of IP billing of Radiology Items','custom');
GO
INSERT INTO CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType) 
VALUES ('Radiology','EnableRadScan','false','boolean','Enabled if we want RadScan button feature to be set in Radiology before Adding Result','custom');
GO
--Anish: End: 27 July 2020: Parameter added in Radiology Scan function---

--Anish: Start: 27 July 2020: Scan detail fields added in Radiology requisition---
ALTER TABLE RAD_PatientImagingRequisition
ADD IsScanned bit NULL, ScannedBy int NULL, ScannedOn DateTime NULL
GO
--Anish: END: 27 July 2020: Scan detail fields added in Radiology requisition---

--Anish: Start: 28 July 2020: Scan detail fields Updated in Radiology requisition---
UPDATE RAD_PatientImagingRequisition
SET IsScanned=1, ScannedBy=CreatedBy, ScannedOn=ImagingDate
GO
Alter table RAD_PatientImagingRequisition
Add ScanRemarks varchar(400);
GO
--Anish: END: 28 July 2020: Scan detail fields Updated in Radiology requisition---

-----------------Branch Merged: Rusha: END: 29th July: Merged Beta branch to DEV branch---------------------------------


--START: Sanjit 24Jul'20: Fiscal Year Stock Changes
	--added fiscal year table for inventory and pharmacy and updated the table with pre-filled values
	CREATE TABLE dbo.INV_CFG_FiscalYears
	(
		FiscalYearId int NOT NULL IDENTITY (1,1),
		FiscalYearName varchar (20),
		StartDate datetime,
		EndDate datetime,
		CreatedBy int,
		CreatedOn datetime,
		IsActive bit,
		NpFiscalYearName varchar(20),
		IsClosed bit,
		ClosedOn datetime,
		ClosedBy int,
		CONSTRAINT PK_INV_CFG_FiscalYear PRIMARY KEY (FiscalYearId),
		CONSTRAINT UK_INV_CFG_FiscalYear UNIQUE (FiscalYearName)
	);
	GO
	--add default values in the table
	SET IDENTITY_INSERT [dbo].[INV_CFG_FiscalYears] ON 
	GO
	INSERT [dbo].[INV_CFG_FiscalYears] ([FiscalYearId], [FiscalYearName], [NpFiscalYearName], [StartDate], [EndDate], [CreatedOn], [CreatedBy], [IsActive]) VALUES (1, N'2074/2075', N'2074/2075', CAST(N'2017-07-16T00:00:00.000' AS DateTime), CAST(N'2018-07-16T00:00:00.000' AS DateTime), CAST(N'2018-05-05T13:40:41.317' AS DateTime), 1, 1)
	GO
	INSERT [dbo].[INV_CFG_FiscalYears] ([FiscalYearId], [FiscalYearName], [NpFiscalYearName], [StartDate], [EndDate], [CreatedOn],[CreatedBy], [IsActive]) VALUES (2, N'2075/2076', N'2075/2076', CAST(N'2018-07-15T23:59:59.000' AS DateTime), CAST(N'2019-07-16T00:00:00.000' AS DateTime),  CAST(N'2018-05-05T13:40:41.317' AS DateTime), 1, 1)
	GO
	INSERT [dbo].[INV_CFG_FiscalYears] ([FiscalYearId], [FiscalYearName], [NpFiscalYearName], [StartDate], [EndDate], [CreatedOn],[CreatedBy], [IsActive]) VALUES (3, N'2076/2077', N'2076/2077', CAST(N'2019-07-15T23:59:59.000' AS DateTime), CAST(N'2020-07-15T23:59:59.000' AS DateTime), CAST(N'2019-07-17T00:44:47.850' AS DateTime), 1, 1)
	GO
	INSERT [dbo].[INV_CFG_FiscalYears] ([FiscalYearId], [FiscalYearName], [NpFiscalYearName], [StartDate], [EndDate], [CreatedOn],[CreatedBy], [IsActive]) VALUES (4, N'2077/2078', N'2077/2078', CAST(N'2020-07-15T23:59:59.000' AS DateTime), CAST(N'2021-07-15T23:59:59.000' AS DateTime), CAST(N'2020-07-24T13:19:26.270' AS DateTime), 1, 1)
	GO
	SET IDENTITY_INSERT [dbo].[INV_CFG_FiscalYears] OFF
	GO

	--added fiscal year table for pharmacy and updated the table with pre-filled values
	CREATE TABLE dbo.PHRM_CFG_FiscalYears
	(
		FiscalYearId int NOT NULL IDENTITY (1,1),
		FiscalYearName varchar (20),
		StartDate datetime,
		EndDate datetime,
		CreatedBy int,
		CreatedOn datetime,
		IsActive bit,
		NpFiscalYearName varchar(20),
		IsClosed bit,
		ClosedOn datetime,
		ClosedBy int,
		CONSTRAINT PK_PHRM_CFG_FiscalYear PRIMARY KEY (FiscalYearId),
		CONSTRAINT UK_PHRM_CFG_FiscalYear UNIQUE (FiscalYearName)
	);
	GO
	--add default values in the table
	SET IDENTITY_INSERT [dbo].[PHRM_CFG_FiscalYears] ON 
	GO
	INSERT [dbo].[PHRM_CFG_FiscalYears] ([FiscalYearId], [FiscalYearName], [NpFiscalYearName], [StartDate], [EndDate], [CreatedOn], [CreatedBy], [IsActive]) VALUES (1, N'2074/2075', N'2074/2075', CAST(N'2017-07-16T00:00:00.000' AS DateTime), CAST(N'2018-07-16T00:00:00.000' AS DateTime), CAST(N'2018-05-05T13:40:41.317' AS DateTime), 1, 1)
	GO
	INSERT [dbo].[PHRM_CFG_FiscalYears] ([FiscalYearId], [FiscalYearName], [NpFiscalYearName], [StartDate], [EndDate], [CreatedOn],[CreatedBy], [IsActive]) VALUES (2, N'2075/2076', N'2075/2076', CAST(N'2018-07-15T23:59:59.000' AS DateTime), CAST(N'2019-07-16T00:00:00.000' AS DateTime),  CAST(N'2018-05-05T13:40:41.317' AS DateTime), 1, 1)
	GO
	INSERT [dbo].[PHRM_CFG_FiscalYears] ([FiscalYearId], [FiscalYearName], [NpFiscalYearName], [StartDate], [EndDate], [CreatedOn],[CreatedBy], [IsActive]) VALUES (3, N'2076/2077', N'2076/2077', CAST(N'2019-07-15T23:59:59.000' AS DateTime), CAST(N'2020-07-15T23:59:59.000' AS DateTime), CAST(N'2019-07-17T00:44:47.850' AS DateTime), 1, 1)
	GO
	INSERT [dbo].[PHRM_CFG_FiscalYears] ([FiscalYearId], [FiscalYearName], [NpFiscalYearName], [StartDate], [EndDate], [CreatedOn],[CreatedBy], [IsActive]) VALUES (4, N'2077/2078', N'2077/2078', CAST(N'2020-07-15T23:59:59.000' AS DateTime), CAST(N'2021-07-15T23:59:59.000' AS DateTime), CAST(N'2020-07-24T13:19:26.270' AS DateTime), 1, 1)
	GO
	SET IDENTITY_INSERT [dbo].[PHRM_CFG_FiscalYears] OFF
	GO

	--added fiscal year stock table for inventory 
	CREATE TABLE dbo.INV_FiscalYearStock
	(
		FiscalYrStockId int NOT NULL IDENTITY (1,1),
		FiscalYearId int NOT NULL,
		StoreId int,
		StockId int,
		GRItemId int,
		ItemId int,
		BatchNo varchar(50),
		ExpiryDate datetime,
		MRP decimal(16,4),
		Price decimal(16,4),
		OpeningQty float,
		ClosingQty float,
		CreatedOn datetime,
		IsActive bit,
		CONSTRAINT PK_INV_FiscalYearStock PRIMARY KEY (FiscalYearId),
		CONSTRAINT FK_INV_FiscalYearStock_INV_CFG_FiscalYear FOREIGN KEY (FiscalYearId) REFERENCES INV_CFG_FiscalYears(FiscalYearId),
		CONSTRAINT FK_INV_FiscalYearStock_INV_TXN_GoodsReceiptItems FOREIGN KEY (GRItemId) REFERENCES INV_TXN_GoodsReceiptItems(GoodsReceiptItemId)
	);
	GO

	--changes in inventory stock txn table for fiscal year
		ALTER TABLE INV_TXN_StockTransaction
		ADD FiscalYearId int, TransactionDate datetime, IsActive bit
	GO
		ALTER TABLE INV_TXN_StockTransaction
		ADD CONSTRAINT FK_INV_TXN_StockTransaction_INV_CFG_FiscalYears FOREIGN KEY (FiscalYearId) REFERENCES INV_CFG_FiscalYears(FiscalYearId)
	GO
		--bulk update Fiscal YearId
			UPDATE INV_TXN_StockTransaction
			SET FiscalYearId = 
			CASE
				WHEN ((CreatedOn between '2017-07-16 00:00:00.000' and '2018-07-16 00:00:00.000')) THEN 1
				WHEN ((CreatedOn between '2018-07-15 23:59:59.000' and '2019-07-16 00:00:00.000')) THEN 2
				WHEN ((CreatedOn between '2019-07-15 23:59:59.000' and '2020-07-15 23:59:59.000')) THEN 3
				WHEN ((CreatedOn between '2020-07-15 23:59:59.000' and '2021-07-15 23:59:59.000')) THEN 3
				ELSE NULL
			END
			WHERE FiscalYearId is null
		GO
		--bulk update Transaction Date
			UPDATE INV_TXN_StockTransaction
			SET TransactionDate = CreatedOn
			WHERE TransactionDate is null
		GO
		--bulk update IsActive
			UPDATE INV_TXN_StockTransaction
			SET IsActive = 1
			WHERE IsActive is null
		GO

	--changes in subsotre stock txn table for fiscal year
		ALTER TABLE WARD_INV_Transaction
		ADD FiscalYearId int, TransactionDate datetime, IsActive bit
	GO
		ALTER TABLE WARD_INV_Transaction
		ADD CONSTRAINT FK_WARD_INV_Transaction_INV_CFG_FiscalYears FOREIGN KEY (FiscalYearId) REFERENCES INV_CFG_FiscalYears(FiscalYearId)
	GO
		--bulk update Fiscal YearId
			UPDATE WARD_INV_Transaction
			SET FiscalYearId = 
			CASE
				WHEN ((CreatedOn between '2017-07-16 00:00:00.000' and '2018-07-16 00:00:00.000')) THEN 1
				WHEN ((CreatedOn between '2018-07-15 23:59:59.000' and '2019-07-16 00:00:00.000')) THEN 2
				WHEN ((CreatedOn between '2019-07-15 23:59:59.000' and '2020-07-15 23:59:59.000')) THEN 3
				WHEN ((CreatedOn between '2020-07-15 23:59:59.000' and '2021-07-15 23:59:59.000')) THEN 3
				ELSE NULL
			END
			WHERE FiscalYearId is null
		GO
		--bulk update Transaction Date
			UPDATE WARD_INV_Transaction
			SET TransactionDate = CreatedOn
			WHERE TransactionDate is null
		GO
		--bulk update IsActive
			UPDATE WARD_INV_Transaction
			SET IsActive = 1
			WHERE IsActive is null
		GO
--END: Sanjit 24Jul'20: Fiscal Year Stock Changes

-----------------Branch Merged: Rusha: START: 04th August 2020: Merged inv_fiscalyear changes branch to DEV branch---------------------------------

--START: Sanjit: 30th July 2020 -- Added new column UnConfirmedQty in Substore Stock table
	ALTER TABLE WARD_INV_Stock
	ADD UnConfirmedQty float;
GO
	ALTER TABLE WARD_INV_Stock
	ADD CONSTRAINT DF_WARD_INV_Stock_UnConfirmedQty DEFAULT 0 FOR UnConfirmedQty;
GO
	UPDATE WARD_INV_Stock
	SET UnConfirmedQty = 0
	WHERE UnConfirmedQty is null;
GO
--added goods receipt item id in stock txn table
	ALTER TABLE INV_TXN_StockTransaction
	ADD GoodsReceiptItemId int;
GO
	UPDATE INV_TXN_StockTransaction 
	SET GoodsReceiptItemId = S.GoodsReceiptItemId
	FROM INV_TXN_StockTransaction ST
	JOIN INV_TXN_Stock S ON ST.StockId = S.StockId
	WHERE ST.GoodsReceiptItemId IS NULL
GO
	ALTER TABLE WARD_INV_Transaction
	ADD GoodsReceiptItemId int;
GO
	UPDATE WARD_INV_Transaction
	SET GoodsReceiptItemId = S.GoodsReceiptItemId
	FROM WARD_INV_Transaction T 
	JOIN WARD_INV_Stock S ON T.StockId = S.StockId
	WHERE T.GoodsReceiptItemId IS NULL
GO
--END: Sanjit: 30th July 2020 -- Added new column UnConfirmedQty in Substore Stock table
-----------------Branch Merged: Rusha: END: 04th August 2020: Merged inv_fiscalyear changes branch to DEV branch---------------------------------

-----------------Branch Merged: Rusha: START: 04th August 2020: Merged inv_procurement branch to DEV branch---------------------------------

-- START: Sanjit: Created different fields required in PO for Verification Purpose
GO
	ALTER TABLE INV_TXN_PurchaseOrder
	ADD IsVerificationEnabled bit, VerifierIds varchar(199), VerificationId int,CancelledBy int,CancelledOn datetime,CancelRemarks varchar(400);
GO
	ALTER TABLE INV_TXN_PurchaseOrderItems
	ADD IsActive bit,CancelledBy int,CancelledOn datetime,CancelRemarks varchar(400)
GO
	UPDATE INV_TXN_PurchaseOrderItems
	SET IsActive = 1
	WHERE IsActive is null
GO
	UPDATE INV_TXN_PurchaseOrder
	SET IsVerificationEnabled = 0
	WHERE IsVerificationEnabled is null
GO
	UPDATE INV_TXN_PurchaseOrder
	SET VerifierIds = ''
	WHERE VerifierIds is null
GO
--END: Sanjit: Created different fields required in PO for Verification Purpose

--START: Sanjit: Created a new CORE CFG Settings to bypass verification or to add settings for verification
INSERT INTO CORE_CFG_Parameters
(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
VALUES
('Inventory','ProcurementVerificationSettings','{"EnableVerification":false,"VerifierIds":[{"Id":1,"Type":"user"}]}','json','This is the default purchase order verification settings which can be changed by user. Enable Verification decides whether verification is activated or not. VerifierIds decides the default user/role that can verify. MaxVerificationLevel:the length of VerifierIds Array, Format Example:[{"Id":1,"Type":"role"},{"Id":89,"Type":"user"}])','system')
GO
--END: Sanjit: Created a new CORE CFG Settings to bypass verification or to add settings for verification

--START: Sanjit: Create Verification changes in goods receipt table
	ALTER TABLE INV_TXN_GoodsReceipt
	ADD IsVerificationEnabled bit, VerifierIds varchar(199),VerificationId int,GRStatus varchar(20)
GO
	ALTER TABLE INV_TXN_GoodsReceiptItems
	ADD IsActive bit,CancelledBy int, CancelledOn datetime
GO
	UPDATE INV_TXN_GoodsReceiptItems
	SET IsActive = 1
	WHERE IsActive is null
GO
--END: Sanjit: Create Verification changes in goods receipt table


--START: Arpan: Prevent Identity Column(PurchaseOrderId) jumping 1000 to eliminate need of separate Column in UI
GO
	ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = OFF
GO

--END: Arpan: Prevent Identity Column(PurchaseOrderId) jumping 1000 to eliminate need of separate Column in UI

-- START: Bikash: 01July'20 : separtion of Inventory- GR-ReturnToVendorItem table into ReturnToVendor and ReturnToVendorItem
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[INV_TXN_ReturnToVendor](
  [ReturnToVendorId] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
  [ReturnDate] [datetime] NOT NULL,
  [VendorId] [int] NULL,
  [SubTotal] [decimal](10, 2) NULL,
  [VATTotal] [decimal](10, 2) NULL,
  [DiscountAmount] [decimal](10, 2) NULL,
  [TotalAmount] [decimal](16, 4) NULL,  
  [CreditNoteId] [int] Null,
  [CreditNotePrintNo] [int] NULL,
  [Remarks] [nvarchar](500) NULL,
  [CreatedBy] [int] NOT NULL,
  [CreatedOn] [datetime] NOT NULL,
  [ModifiedBy] [int] NULL,
  [ModifiedOn] [datetime] NULL
  )
GO

ALTER TABLE [dbo].[INV_TXN_ReturnToVendor]  WITH CHECK ADD  CONSTRAINT [FK_INV_TXN_ReturnToVendor_CreatedBy_EMP_Employee_EmployeeId] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[EMP_Employee] ([EmployeeId])
GO

ALTER TABLE [dbo].[INV_TXN_ReturnToVendor] CHECK CONSTRAINT [FK_INV_TXN_ReturnToVendor_CreatedBy_EMP_Employee_EmployeeId]
GO

ALTER TABLE [dbo].[INV_TXN_ReturnToVendor]  WITH CHECK ADD  CONSTRAINT [FK_INV_TXN_ReturnToVendor_VendorId_INV_MST_Vendor_VendorId] FOREIGN KEY([VendorId])
REFERENCES [dbo].[INV_MST_Vendor] ([VendorId])
GO

ALTER TABLE [dbo].[INV_TXN_ReturnToVendor] CHECK CONSTRAINT [FK_INV_TXN_ReturnToVendor_VendorId_INV_MST_Vendor_VendorId]
GO

ALTER TABLE INV_TXN_ReturnToVendorItems
ADD ReturnToVendorId INT NULL
GO

ALTER TABLE INV_TXN_ReturnToVendorItems
ADD FOREIGN KEY (ReturnToVendorId) REFERENCES [INV_TXN_ReturnToVendor] (ReturnToVendorId);
GO
-- END: Bikash: 01July'20 : separtion of Inventory-GR ReturnToVendorItem table into ReturnToVendor and ReturnToVendorItem

-- START: Bikash, 12July'20: Invoice Header table creation

CREATE TABLE [dbo].[MST_InvoiceHeaders](
	[InvoiceHeaderId] [int] PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[Module] [varchar](200) NULL,
	[HeaderDescription] [varchar](200) NULL,
	[HospitalName] [varchar](200) NULL,
	[Address] [varchar](200) NULL,
	[Email] [varchar](200) NULL,
	[PAN] [varchar](50) NULL,
	[Telephone] [varchar](200) NULL,
	[DDA] [varchar](200) NULL,	
	[LogoFileName] [varchar](200) NULL,
	[LogoFileExtention] [varchar](50) NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[IsActive] [bit] NULL,
	[ModifiedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
)
GO
-- END: Bikash, 12July'20: Invoice Header table creation

-- START: Bikash, 17July'20: Invoice-Header Logo-file Upload Location
Insert into CORE_CFG_Parameters
values('Common','InvoiceHeaderLogoUploadLocation','\assets\pages\img\invoice-logo\','string','Contains Location of uploaded Invoice Header Logo file','custom',null);
GO
-- END: Bikash, 17July'20: Invoice-Header Logo-file Upload Location


-- START: Bikash, 23July'20: Invoice Header Enhancement and Modification
Declare @ApplicationId int;
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application WHERE ApplicationName = 'Pharmacy' and ApplicationCode = 'PHRM')
INSERT INTO RBAC_Permission
(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values
('setting-inventory-invoiceheaders',@ApplicationId,1,GETDATE(),1);
GO

DECLARE @PermissionId int,@ParentRouteId int;
SET @PermissionId = (Select Top(1) PermissionId from RBAC_Permission where PermissionName = 'setting-pharmacy-invoiceheaders');
SET @ParentRouteId = (Select TOp(1) RouteId from RBAC_RouteConfig where DisplayName = 'Setting' and UrlFullPath = 'Pharmacy/Setting' and RouterLink = 'Setting');
INSERT INTO RBAC_RouteConfig
(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
Values
('Invoice Headers','Pharmacy/Setting/InvoiceHeaders','InvoiceHeaders/Pharmacy',@PermissionId, @ParentRouteId,1,15,1)
GO

ALTER TABLE INV_TXN_PurchaseOrder
ADD InvoiceHeaderId int null FOREIGN KEY REFERENCES MST_InvoiceHeaders(InvoiceHeaderId);
GO

-- END: Bikash, 23July'20: Invoice Header Enhancement and Modification


-----------------Branch Merged: Rusha: END: 04th August 2020: Merged inv_procurement branch to DEV branch---------------------------------

---- START: Sanjit: 05th August '20, updated script for IsVerificationEnabled in good receipt------------
GO
UPDATE INV_TXN_GoodsReceipt
SET IsVerificationEnabled = 0
WHERE IsVerificationEnabled is null
GO

---- END: Sanjit: 05th August '20, updated script for IsVerificationEnabled in good receipt------------

------START: 05th August '20, merged Beta to DEV branch--------------- 

--Pratik: Start: 2020-07-30: --> Cancel Bill Reports updated

ALTER PROCEDURE [dbo].[SP_Report_BILL_BillCancelReport] --EXEC SP_Report_BILL_BillCancelReport '2020-06-30','2020-07-30'
@FromDate DateTime=null,
@ToDate DateTime=null
AS
/*
FileName: [[SP_Report_BILL_BillCancelReport]]
CreatedBy/date: Umed/20-07-2017
Description: to get Sum of Total Amount of Cancel Bill of each patient Between Given Dates 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/20-07-2017	                   created the script
2       Umed/31-07-2017                    alter the script added cancel remarks and User
3       pratik/2020-07-30                  Added ItemName,ServiceDepartmentName etc col
--------------------------------------------------------
*/
BEGIN
    
SELECT  pat.PatientCode AS HospitalNo,
		 pat.ShortName as 'PatientName',
		 bltxnItm.ServiceDepartmentName as 'ServiceDepartmentName',
		 bltxnItm.ItemName as 'ItemName',
		 bltxnItm.Quantity as 'Quantity',
		 ISNULL(bltxnItm.TotalAmount,0) AS TotalAmount,
		 bltxnItm.CreatedOn 'CreatedOn' ,
		 emp.FullName as 'CreatedBy',
		 bltxnItm.CancelledOn 'CancelledOn',
		 empCancel.FullName as 'CancelledBy',
		 bltxnItm.CancelRemarks AS CancelRemarks

FROM BIL_TXN_BillingTransactionItems bltxnItm
INNER JOIN PAT_Patient pat ON pat.PatientId = bltxnItm.PatientId
inner join EMP_Employee emp on emp.EmployeeId = bltxnItm.CreatedBy
inner join EMP_Employee empCancel on empCancel.EmployeeId = bltxnItm.CancelledBy
WHERE  
 CONVERT(date,bltxnItm.CancelledOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())
	  and bltxnItm.BillStatus='cancel'
	  and bltxnItm.CancelledOn is not null
order by bltxnItm.CancelledOn desc
END

GO
--Pratik: End: 2020-07-30: --> Cancel Bill Reports updated

---Start:Anjana: 2020/07/31: Add new fields in LAB_TestRequisition table--------
Alter table LAB_TestRequisition
Add BillCancelledBy int, BillCancelledOn datetime;
Go

update LAB_TestRequisition
Set BillCancelledBy = itm.CancelledBy, BillCancelledOn = itm.CancelledOn
from BIL_CFG_BillItemPrice as price
join BIL_MST_ServiceDepartment as srv on price.ServiceDepartmentId = srv.ServiceDepartmentId
join BIL_TXN_BillingTransactionItems as itm on (price.ServiceDepartmentId = itm.ServiceDepartmentId) and (price.ItemId = itm.ItemId)
join LAB_TestRequisition as req on itm.RequisitionId = req.RequisitionId and itm.BillStatus =req.BillingStatus
where srv.IntegrationName = 'lab' and itm.BillStatus='cancel';
Go
---End:Anjana: 2020/07/31: Add new fields in LAB_TestRequisition table--------

---Anish: 2 Aug, 2020, Start: Permission and route added  for lab status wise report---
Insert Into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive) 
Values ('reports-labtest-status-detail', (select ApplicationId from RBAC_Application where ApplicationName='reports'),1,GETDATE(),1) ;
Go

declare @permId int;
set @permId = (select PermissionId from RBAC_Permission where PermissionName='reports-labtest-status-detail');
declare @parentId int;
set @parentId = (select RouteId from RBAC_RouteConfig where UrlFullPath='Reports/LabMain' and RouterLink='LabMain');

Insert Into RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
Values('Test Status Detail Report','Reports/LabMain/LabTestStatusDetailReport','LabTestStatusDetailReport',@permId,@parentId,1,1);
Go
---Anish: 2 Aug, 2020, Start: Permission and route added  for lab status wise report---

--Anish: 3 August, 2020, Starts: Statuswise Lab Test Detail SP-------
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Anish Bhattarai>
-- Create date: <3 August 2020>
-- Description:	<Get the test requisition detail and its status>
-- =============================================
CREATE PROCEDURE [dbo].[SP_LAB_Statuswise_Test_Detail] 
( @FromDate DATETIME = NULL,
      @ToDate DATETIME = NULL)
AS
BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
BEGIN
SELECT OrderDateTime 'Requested On', pat.ShortName 'PatientName',pat.PatientCode 'HospitalNo',
Convert(Varchar(10),pat.Age)+'/'+ pat.Gender 'AgeSex',
CASE WHEN WardName='outpatient' THEN 'OPD'
ELSE UPPER(wardname) END AS  WardName,
CASE WHEN req.ProviderName is null THEN 'SELF' 
ELSE req.ProviderName END AS 'ReferredBy',
LabTestName,SampleCodeFormatted 'RunNo',
CASE 
WHEN OrderStatus='active' then 'Sample Not Collected' 
WHEN OrderStatus='pending' then 'Sample Collected'
WHEN OrderStatus='result-added' then 'Result Added'
WHEN OrderStatus='report-generated' then 'Report Generated' 
END AS TestStatus,
CASE 
WHEN BillingStatus IN ('paid','unpaid') THEN 'Paid' 
WHEN BillingStatus='cancel' THEN 'bill-cancelled'
WHEN BillingStatus = 'returned' THEN 'bill-returned' 
WHEN BillingStatus = 'provisional' THEN 'provisional' 
END AS BillStatus,
emp1.FullName AS SampleCollectedBy,emp4.FullName AS ReportPrintedBy,
emp2.FullName As CancelledByUser, req.BillCancelledOn
FROM LAB_TestRequisition req LEFT JOIN EMP_Employee emp1 
ON req.SampleCreatedBy = emp1.EmployeeId
LEFT JOIN EMP_Employee emp2 ON req.BillCancelledBy = emp2.EmployeeId
LEFT JOIN EMP_Employee emp3 ON req.ResultAddedBy = emp3.EmployeeId
JOIN LAB_TXN_LabReports report ON req.LabReportId = report.LabReportId
LEFT JOIN EMP_Employee emp4 ON report.PrintedBy = emp4.EmployeeId
JOIN PAT_Patient pat ON req.PatientId=pat.PatientId
WHERE CONVERT(date,req.OrderDateTime) between @FromDate and @ToDate
Order by req.OrderDateTime desc;
END
END
GO
--ANish: END: 3 August 2020 Statuswise Lab Test Detail SP---------

--START: Bikash: 30July'20, Pharmacy GR expiry-date not applicable
IF NOT EXISTS(Select Top(1) * from CORE_CFG_Parameters where ParameterName = 'PharmacyGRExpiryNotApplicable' and ParameterGroupName='Pharmacy')
BEGIN
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType) 
Values ('Pharmacy','PharmacyGRExpiryNotApplicable','{"ExpiryNotApplicable":false, "ExpiryAfter":100}',
'json','Determines whether expiry date applicable on pharmacy good or not and provides 100 years as default expiry','custom');
END
Go
--END: Bikash: 30July'20, Pharmacy GR expiry-date not applicable

------END: 05th August '20, merged Beta to DEV branch--------------- 

------START: Rusha: 26th August'20, merged Beta to DEV branch--------------- 
-----Start Anjana: 8 Aug: 2020: Modified Column name--------
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Anish Bhattarai>
-- Create date: <3 August 2020>
-- Description:	<Get the test requisition detail and its status>
--Modified Column Name : <8 August 2020>
-- =============================================
ALTER PROCEDURE [dbo].[SP_LAB_Statuswise_Test_Detail] 
( @FromDate DATETIME = NULL,
      @ToDate DATETIME = NULL)
AS
BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
BEGIN
SELECT OrderDateTime 'RequestedOn', pat.ShortName 'PatientName',pat.PatientCode 'HospitalNo',
Convert(Varchar(10),pat.Age)+'/'+ pat.Gender 'AgeSex',
CASE WHEN WardName='outpatient' THEN 'OPD'
ELSE UPPER(wardname) END AS  WardName,
CASE WHEN req.ProviderName is null THEN 'SELF' 
ELSE req.ProviderName END AS 'ReferredBy',
LabTestName,SampleCodeFormatted 'RunNo',
CASE 
WHEN OrderStatus='active' then 'Sample Not Collected' 
WHEN OrderStatus='pending' then 'Sample Collected'
WHEN OrderStatus='result-added' then 'Result Added'
WHEN OrderStatus='report-generated' then 'Report Generated' 
END AS TestStatus,
CASE 
WHEN BillingStatus IN ('paid','unpaid') THEN 'Paid' 
WHEN BillingStatus='cancel' THEN 'bill-cancelled'
WHEN BillingStatus = 'returned' THEN 'bill-returned' 
WHEN BillingStatus = 'provisional' THEN 'provisional' 
END AS BillStatus,
emp1.FullName AS SampleCollectedBy,emp4.FullName AS ReportPrintedBy,
emp2.FullName As CancelledByUser, req.BillCancelledOn
FROM LAB_TestRequisition req LEFT JOIN EMP_Employee emp1 
ON req.SampleCreatedBy = emp1.EmployeeId
LEFT JOIN EMP_Employee emp2 ON req.BillCancelledBy = emp2.EmployeeId
LEFT JOIN EMP_Employee emp3 ON req.ResultAddedBy = emp3.EmployeeId
LEFT JOIN LAB_TXN_LabReports report ON req.LabReportId = report.LabReportId
LEFT JOIN EMP_Employee emp4 ON report.PrintedBy = emp4.EmployeeId
JOIN PAT_Patient pat ON req.PatientId=pat.PatientId
WHERE CONVERT(date,req.OrderDateTime) between @FromDate and @ToDate
Order by req.OrderDateTime desc;
END
END
GO

-----End Anjana: 8 Aug: 2020: Modified Column name--------


---START: NageshBB: 09 Aug 2020: Account voucher number correction and trigger altered

IF COL_LENGTH('Acc_Transactions','VoucherSerialNo') IS NULL
BEGIN
	Alter Table Acc_Transactions
	Add VoucherSerialNo int 
END
Go 

update Acc_Transactions
set VoucherSerialNo=SUBSTRING( vouchernumber , LEN(vouchernumber) -  CHARINDEX('-',REVERSE(vouchernumber)) + 2  , LEN(vouchernumber)  ) 
Go


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER TRIGGER [dbo].[TRG_ACC_Transactions] 
   ON   [dbo].[ACC_Transactions]
   AFTER INSERT
AS 
/************************************************************************
FileName: [TRG_ACC_Transactions] 
CreatedBy/date: Ajay/Nagesh/10Jul
Description: This trigger will create unique daywise voucher number for every voucher after insert transaction records.
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/Nagesh 10July'19            created the script
2		NageshBB 09Aug 2020				 updated script for Voucher serial number after insert new transaction
*************************************************************************/
BEGIN
  DECLARE @TransactionDate DATETIME;
  DECLARE @VoucherId INT;
  DECLARE @DayVoucherNumber INT;
   
  SELECT @TransactionDate=TransactionDate,@VoucherId=VoucherId FROM inserted
 
  IF((SELECT top 1 DayVoucherNumber FROM ACC_Transactions WHERE VoucherId=@VoucherId) IS NULL)
  BEGIN
    SET @DayVoucherNumber=1--(SELECT TOP 1 ISNULL(DayVoucherNumber,0) + 1 FROM ACC_Transactions WHERE VoucherId=@VoucherId ORDER BY DayVoucherNumber DESC)
  END
  ELSE
  BEGIN
	IF ((SELECT top 1 DayVoucherNumber FROM ACC_Transactions WHERE VoucherId =@VoucherId AND TransactionDate=@TransactionDate)is null)
	BEGIN
		SET @DayVoucherNumber = (SELECT ISNULL(MAX(DayVoucherNumber),0) + 1 FROM ACC_Transactions WHERE VoucherId=@VoucherId) -- for previous days
	END
	ELSE
	BEGIN
		SET @DayVoucherNumber = (SELECT ISNULL(MAX(DayVoucherNumber),0) FROM ACC_Transactions WHERE VoucherId=@VoucherId and TransactionDate = @TransactionDate) -- for current day
	END
  END

  UPDATE
    ACC_Transactions
  SET
    DayVoucherNumber= isnull(@DayVoucherNumber, 1)
  WHERE
    TransactionId=(SELECT TransactionId FROM inserted)
  
		--NageshBB: 09 Aug 2020: insert voucher serial no using trigger
		  Declare @VoucherNumber nvarchar(50);   
		  SELECT @VoucherNumber=VoucherNumber  FROM inserted
 
		  IF((select len(@VoucherNumber)) is not null)
		  BEGIN
			 Update ACC_Transactions
			 SET VoucherSerialNo=SUBSTRING( @VoucherNumber , LEN(@VoucherNumber) -  CHARINDEX('-',REVERSE(@VoucherNumber)) + 2  , LEN(@VoucherNumber)  ) 
			 where TransactionId=(SELECT TransactionId FROM inserted)
		  END
END
Go

---END: NageshBB: 09 Aug 2020: Account voucher number correction and trigger altered

-- Start: Bikash, 7Aug'20: Update of previous incorrect permissionName
Declare @ApplicationId int;
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application WHERE ApplicationName = 'Pharmacy' and ApplicationCode = 'PHRM');
UPDATE RBAC_Permission 
set PermissionName ='setting-pharmacy-invoiceheaders'
where ApplicationId = @ApplicationId and PermissionName ='setting-inventory-invoiceheaders'
GO

DECLARE @PermissionId int
SET @PermissionId = (Select Top(1) PermissionId from RBAC_Permission where PermissionName = 'setting-pharmacy-invoiceheaders');
UPDATE RBAC_RouteConfig
set PermissionId = @PermissionId
where UrlFullPath= 'Pharmacy/Setting/InvoiceHeaders' and RouterLink='InvoiceHeaders/Pharmacy'
GO
-- End: Bikash, 7Aug'20: Update of previous incorrect permissionName


---start: sud-10Aug'20---Reports Correction----

ALTER PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange '2020-02-14','2020-02-14'
 Description: 
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By            Remarks
 --------------------------------------------------
 1.      15Feb'20/Sud              Initial Draft (Needs Revision)
 2.      15Mar'20/Sud              Added TDSPercentage and TDSAmount calculation in the query
3.       4Apr'20/Sud               Excluding Already Added BillingTransactionItem during Bill Sync.
                                   earlier it was at BillingTransactionId level, now it's BillingTransactionItemId
4.       11June                    TDSpercentage from Employee Incentive Info
5.       17Jul'20/Sud/Pratik       Updated for Group Distribution 
6.       10Aug'20/Sud              Removed HardCoded Date Range from Group Distribution
 ---------------------------------------------------
*/
BEGIN

IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN

---Start: For Referral Incentive-----------

INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercent,
	( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.ReferredByPercent,0) !=0
	---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: For Referral Incentive-----------

UNION ALL

---2.1-- Start: For Assigned Incentive (No Group Distribution)-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100

  -----2. Secondary Columns:
  --, txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.AssignedToPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..
---End: 2.1 For Assigned Incentive (No Group Distribution)-----------

UNION ALL

---2.2-- Start: For Assigned Incentive (Group Distribution Only)-----------
 
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
  -- incentive goes to:  ToEmployeeId----
   sett.ToEmployeeId 'IncentiveReceiverId', sett.ToEmployeeName 'IncentiveReceiverName',
    sett.DistributionPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100


from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      ON txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
      ON TXN.FiscalYearId = fyear.FiscalYearId
  INNER JOIN 
	 FN_INCTV_GetIncentiveSettings_GroupDistribution() sett  -- this gives us group distribution settings only.. 
  
  --[FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.FromEmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate -- sud:10Aug'20-- this dates were hardcoded earlier.
	AND ISNULL(txnItm.ReturnStatus,0)= 0
	AND ISNULL(sett.DistributionPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem) -- remove this condition once daily upload is enabled..

---2.2-- End: For Assigned Incentive (Group Distribution Only)-----------



END--end of IF.. 

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END--end of SP--

GO


ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorDeptItemsSummary] @FromDate datetime = NULL,
@ToDate datetime = NULL,
@DoctorId int = NULL,
@SrvDeptName varchar(max) = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Ramavtar/04Sept'18    		initail draft
2	 Ramavtar/30Nov'18			summary added 
3	 Ramavtar/17Dec'18		 change in where condition (checking for credit records)
4.	 Ramavtar/18Dec'18			getting data for all service dept
5.   Sud/21Feb'19             using new function to get doc-dept-items.
6.   sud:13Mar'19            Join with FN_BIL_GetSrvDeptReportingName_DoctorSummary to get actual service department name, 
                             since it's now removed from  FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional
7.   sud:10Aug'20            InvoiceNumber column added in Return data, Order by Date ASC
----------------------------------------------------------
*/
BEGIN
	IF(@SrvDeptName IS NOT NULL)
		BEGIN
			
			SELECT
			    BillingDate 'Date',
				fnItems.InvoiceNumber,
			    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			    pat.PatientCode,
			    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			   --  fnItems.ServiceDepartmentName,   --sud:13Mar'19--used below line 
			   [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (fnItems.ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName',
			    fnItems.ItemName,
			    fnItems.Price, --fnItems.Price,
			    ISNULL(fnItems.Quantity, 0) - ISNULL(fnItems.ReturnQuantity, 0) Quantity,
			    fnItems.SubTotal,
			    fnItems.DiscountAmount,
			    fnItems.TotalAmount,
			    fnItems.ReturnTotalAmount 'ReturnAmount',
			    fnItems.TotalAmount - fnItems.ReturnTotalAmount 'NetAmount'
			FROM (SELECT
			    *
			FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate)) fnItems
			JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
			WHERE 
			  
			   --fnItems.ServiceDepartmentName = @SrvDeptName   --sud:13Mar'19--used below line 
               [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (fnItems.ServiceDepartmentName,ItemName) = @SrvDeptName
				AND ISNULL(fnItems.ProviderId, 0) = @DoctorId
				and fnItems.BillingType !='CreditReceived'
			ORDER BY 1 


			---Table 2: returning provisional amount---
			SELECT 
				SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
				SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
				SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate,@ToDate)
			WHERE ServiceDepartmentName = @SrvDeptName
				AND ISNULL(ProviderId,0) = @DoctorId
		END

		
	ELSE IF(@SrvDeptName IS NULL)
		BEGIN
			
			
			SELECT
			    BillingDate 'Date',
				fnItems.InvoiceNumber,
			    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			    pat.PatientCode,
			    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			    --  fnItems.ServiceDepartmentName,   --sud:13Mar'19--used below line 
			   [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (fnItems.ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName',
			    fnItems.ItemName,
			    fnItems.Price, --fnItems.Price,
			    ISNULL(fnItems.Quantity, 0) - ISNULL(fnItems.ReturnQuantity, 0) Quantity,
			    fnItems.SubTotal,
			    fnItems.DiscountAmount,
			    fnItems.TotalAmount,
			    fnItems.ReturnTotalAmount 'ReturnAmount',
			    fnItems.TotalAmount - fnItems.ReturnTotalAmount 'NetAmount'
			FROM (SELECT
			    *
			FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate)) fnItems
			JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
			WHERE 
			  --fnItems.ServiceDepartmentName = @SrvDeptName  AND  --- no need to compare srvDepartment when it's null..
				 ISNULL(fnItems.ProviderId, 0) = @DoctorId
				and fnItems.BillingType !='CreditReceived'
			ORDER BY 1 


			---Table 2: returning provisional amount---
			SELECT 
				SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
				SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
				SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate,@ToDate)
			WHERE ISNULL(ProviderId,0) = @DoctorId			
		END
END
GO

ALTER Procedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]
  @TransactionDate DATE, @HospitalId INT
AS

/**************************************************
Stored Procedure Name:SP_ACC_Bill_GetBillingDataForAccTransfer
Details:
-This stored procedure will get billing module data for transfer to accounting by date
-We are getting billing records, deposit records, etc
	
 Change History:
 ----------------------------------------------------------------------------------
 S.No.   Author					Date               Remarks
 ----------------------------------------------------------------------------------
 1.      NageshBB & Sud sir		16/03/2020       Stored procedure created
 2.      Nagesh/Sud               8May'20        Paymentmode=card handled in billingtransaction
 3.		 Sud/NageshBB			16 Jul 2020		 Payment mode=card handle in all cases 
 4.      Sud/10Aug'20                            BugFix-CreditInvoice date issue resolved..
 ----------------------------------------------------------------------------------

**********************************************/
BEGIN

  IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
  BEGIN
  
  SELECT * from BIL_SYNC_BillingAccounting 
  WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @TransactionDate) AND CONVERT(date, @TransactionDate)
  END
  ELSE
  BEGIN    
 --Note:-BillingAccountingSyncId added for temporary pupose because code mapping model has this column , later we need to remove this 
------Cash Bill----------CashBill->BIL_TXN_BillingTransactionItems->BillingTransactionItemId  (TransactionType->TableName->ReferenceId Column Name)
			 Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBill' TransactionType,
			  'cash' As PaymentMode, 
			 --txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 itm.PaidDate 'TransactionDate',
			 GetDate() 'CreatedOn',
			 itm.PaymentReceivedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.PaidDate) = @TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			  --- sud/nagesh:8may'20-- below case should be separated for card and cheque after requirement comes for this..
			 and ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')
			 AND ISNULL(itm.IsCashBillSync,0) = 0  -- Include only Not-Synced Data for CashBill Case--
			
			
			
			UNION ALL
			
---------Credit Bill----------------------------------------------CreditBill-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBill' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 txn.CreatedOn 'TransactionDate', -- this is credit date.. 
			 GetDate() 'CreatedOn',
			 itm.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,txn.CreatedOn)=@TransactionDate--changed: sud-10Aug'20--Corrected to TransactionCreatedOn from ItemCreatedOn
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillSync,0) = 0  -- Include only Not-Synced Data for CreditBill Case--
					

			UNION ALL
			
-----------------Credit Bill Paid-----CreditBillPaid-BillingTransactionId-BIL_TXN_BillingTransaction
		--for now we are commenting this function, later we will get creditbill paid records
			--Select 
			-- txn.BillingTransactionId as BillingAccountingSyncId,
			-- txn.BillingTransactionId AS 'ReferenceId',
			-- 'CreditBillPaid' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it, we might need CreditOrganization's LEdger here.. 
			--  sett.PatientId,
			-- 'CreditBillPaid' TransactionType,
			--  sett.PaymentMode As PaymentMode, 
			-- NULL SubTotal,
			-- 0 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- txn.TotalAmount AS TotalAmount,
			
			-- 0 AS IsTransferedToAcc,
			-- SettlementDate 'TransactionDate', -- this is credit date.. 
			-- GetDate() 'CreatedOn',
			-- sett.CreatedBy AS CreatedBy,
			-- NULL AS SettlementDiscountAmount,  -- Can't take this here, it'll go separately into Cash Discount LEdger.. 
			-- NULL AS Remark,
			-- txn.OrganizationId AS CreditOrganizationId   -- correct it after Settlement is separated for CreditOrginizations.
			--from BIL_TXN_Settlements sett, BIL_TXN_BillingTransaction txn
			
			--Where 
			--     sett.SettlementId = txn.SettlementId
			--   AND Convert(Date,SettlementDate)=@TransactionDate
			--   AND ISNULL(txn.IsCreditBillPaidSync,0) = 0  -- Include only Not-Synced Data for Credit Paid Case--
			
			--UNION ALL
			
-----------------------Cash Bill Return---CashBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBillReturn' TransactionType,
			 --txn.PaymentMode As PaymentMode, --NBB: 16Jul20-card payment not handle yet
			 'cash' As PaymentMode, 			
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate--sud-19March this should've been createdon of return table..
			 and ISNULL(itm.ReturnStatus,0) != 0  
			 and itm.BillingTransactionId IS NOT NULL
			 and  ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')  ---we considering all payment mode as cash , except credit
			 AND ISNULL(itm.IsCashBillReturnSync,0) = 0  -- Include only Not-Synced Data for CashBill Return Case--
			
			UNION ALL
			
------------CreditBillReturn--- done with join from Transaction, TransactionItem and InvoiceReturn Table--CreditBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName, @HospitalId)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			   txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate
			 and ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  -- Include only Not-Synced Data for Credit Return Case--
			
			 UNION ALL
			
------------------Deposit Add---DepositAdd-DepositId-BIL_TXN_Deposit
			Select 
			 DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositAdd' TransactionType,
			  'cash' As PaymentMode, 
			 --PaymentMode As PaymentMode, --NBB: 16Jul20-card payment not handle yet
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType ='Deposit'
			AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			UNION ALL
			
-------Deposit Return/Deduct---DepositReturn-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositReturn' TransactionType,
			  --	 PaymentMode As PaymentMode, --NBB: 16Jul20-card payment not handle yet
			 'cash' As PaymentMode, 		 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType IN ('ReturnDeposit', 'depositdeduct')
			 AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			
			---UNION ALL--
			
---------Cash discount -- from settlement-- New new Transfer rule for this---CashDiscount-SettlementId-BIL_TXN_Settlements
			--Select 
			--SettlementId as BillingAccountingSyncId,
			-- SettlementId 'ReferenceId',
			-- 'CashDiscount' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it
			--  PatientId,
			-- 'CashDiscount' TransactionType,
			-- PaymentMode As PaymentMode, 
			-- NULL AS SubTotal,
			-- NULL AS 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- DiscountAmount AS TotalAmount,    -- use this column if possible
			-- 0 AS IsTransferedToAcc,
			-- CreatedOn 'TransactionDate',
			-- GetDate() 'CreatedOn',
			-- CreatedBy AS CreatedBy,
			-- DiscountAmount AS SettlementDiscountAmount,  -- don't use this column if possible.
			-- NULL AS Remark,
			-- NULL AS CreditOrganizationId  
			--from BIL_TXN_Settlements
			
			--Where 
			--  Convert(Date,CreatedOn)=@TransactionDate
			--  AND ISNULL(DiscountAmount,0) != 0  -- exclude zero discount, since it's not needed.
			--  AND ISNULL(IsCashDiscountSync,0) = 0  -- Include only Not-Synced Data	
  END			  					
END
GO

---end: sud-10Aug'20---Reports Correction----

--START: Sanjit: 10Aug'20 : updated Substore Stock Report for accurate price
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_SubstoreGetAll]    Script Date: 8/10/2020 12:20:37 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAll]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: SP_Report_Inventory_SubstoreGetAll
 Created: 12Dec'19 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.		10Aug'20/sanjit			updated stock value to be taken from price of stock table
 -------------------------------------------------------------------------
*/
BEGIN
  BEGIN
    select SUM(Z.TotalQuantity)'TotalQuantity',
	SUM(Z.TotalValue)'TotalValue',
	SUM(Z.ExpiryQuantity)'ExpiryQuantity',
	SUM(Z.ExpiryValue)'ExpiryValue' 
	from
		((select stk.ItemId, 
				sum(stk.AvailableQuantity) 'TotalQuantity',
				sum(ISNULL(stk.Price,0)*stk.AvailableQuantity) 'TotalValue',
				0 'ExpiryQuantity',
				0'ExpiryValue'
			from INV_TXN_Stock stk
			WHERE	CASE
						WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
						WHEN @StoreId>0 and @StoreId = 1 THEN 1
						WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by stk.ItemId)
		union all
			(select stk.ItemId, 
				0'TotalQuantity',
				0'TotalValue',
				sum(stk.AvailableQuantity) 'ExpiredQuantity',
				sum(ISNULL(stk.Price,0)*stk.AvailableQuantity) 'ExpiredValue'
			from INV_TXN_Stock stk
			where stk.ExpiryDate < GetDATE() AND	
			CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by stk.ItemId)
		union all
			(select ItemId,
				sum(AvailableQuantity) 'TotalQuantity',
				sum(ISNULL(stk.Price,0)*AvailableQuantity) 'TotalValue',
				0 'ExpiryQuantity',
				0'ExpiryValue'  
			from WARD_INV_Stock stk
			WHERE	CASE
						WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
						WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
						WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by ItemId)
		union all
			(select ItemId,
				0'TotalQuantity',
				0'TotalValue',
				sum(stk.AvailableQuantity) 'ExpiryQuantity',
				sum(ISNULL(stk.Price,0)*stk.AvailableQuantity) 'ExpiryValue'  
			from WARD_INV_Stock stk
			where stk.ExpiryDate<GetDate()
			AND CASE
						WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
						WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
						WHEN @StoreId=0 and @ItemId = 0 Then 1
					END = 1
			group by ItemId)) 
	as Z

  END
END

GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnItemId]    Script Date: 8/10/2020 12:29:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
------

ALTER PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnItemId]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: [SP_Report_Inventory_SubstoreGetAllBasedOnItemId]
 Created: 3Mar'20 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.		10Aug'20/sanjit			updated stock value to be taken from price of stock table
 -------------------------------------------------------------------------
*/
BEGIN
    Select Z.ItemId,itm.ItemName,Sum(Z.TotalQuantity)'TotalQuantity',Sum(Z.TotalValue)'TotalValue',SUM(Z.TotalConsumed)'TotalConsumed'	from
	(select stk.ItemId, 
			sum(stk.AvailableQuantity) 'TotalQuantity',
			sum(ISNULL(stk.Price,0) * stk.AvailableQuantity) 'TotalValue',
			0 'TotalConsumed'
		from INV_TXN_Stock stk
		WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
		group by stk.ItemId
	union all
	select stk.ItemId,
			sum(AvailableQuantity) 'TotalQuantity',
			sum(ISNULL(stk.Price,0)*AvailableQuantity) 'TotalValue',
			sum(ISNULL(consump.Quantity,0)) 'TotalConsumed' 
		from WARD_INV_Stock stk
		left join WARD_INV_Consumption consump on consump.StoreId = stk.StoreId and consump.ItemId = stk.ItemId
		WHERE	CASE
					WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
					WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
					WHEN @StoreId=0 and @ItemId = 0 Then 1
				END = 1
		group by stk.ItemId) AS Z
join INV_MST_Item itm on itm.ItemId = Z.ItemId
group by Z.ItemId,itm.ItemName
order by SUM(Z.TotalQuantity) desc

  
END
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]    Script Date: 8/10/2020 12:37:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]
  @StoreId int = null,
  @ItemId int = null
  AS
/*
 FileName: [SP_Report_Inventory_SubstoreGetAllBasedOnStoreId]
 Created: 3Mar'20 <Sanjit>
 Description: To Get All The Details of GoodRecipt of the inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      3Mar'20/sanjit         created          
 2.      20Jul'20/Sanjesh       ItemRate Mismatch fix
 3.		10Aug'20/sanjit			updated stock value to be taken from price of stock table
 -------------------------------------------------------------------------
*/
BEGIN
    SELECT str.StoreId, str.Name, 
		sum(stk.AvailableQuantity) 'TotalQuantity',
		sum(stk.AvailableQuantity*(Isnull(stk.Price,0))) 'TotalValue',
		ISNULL((select SUM(DispatchedQuantity)  from INV_TXN_DispatchItems),0) 'TotalConsumed'
	from INV_TXN_Stock stk
	join INV_TXN_GoodsReceiptItems gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
	join PHRM_MST_Store str on str.StoreId = 1
	WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = 1 THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
	group by str.StoreId,str.Name
UNION ALL
SELECT str.StoreId, str.Name, 
		sum(stk.AvailableQuantity) 'TotalQuantity',
		SUM(ISNULL(stk.Price,0)*stk.AvailableQuantity) 'TotalValue',
		SUM(ISNULL(consump.Quantity,0))'TotalConsumed'
	from WARD_INV_Stock stk
	join PHRM_MST_Store str on str.StoreId = stk.StoreId
	left join WARD_INV_Consumption consump on consump.StoreId = str.StoreId and consump.ItemId = stk.ItemId
	WHERE	CASE
				WHEN @ItemId>0 and @ItemId = stk.ItemId THEN 1
				WHEN @StoreId>0 and @StoreId = stk.StoreId THEN 1
				WHEN @StoreId=0 and @ItemId = 0 Then 1
			END = 1
	group by str.StoreId,str.Name

  
END
GO
GO
--END: Sanjit: 10Aug'20 : updated Substore Stock Report for accurate price

--START: NageshBB: 10Aug 2020: Added 2 columns on transaction table for save old and new voucher number in voucher number reset task
IF COL_LENGTH('Acc_Transactions','NewVoucherNumber') IS NULL
BEGIN
	Alter Table Acc_Transactions
	Add NewVoucherNumber varchar(50)
END
Go 
IF COL_LENGTH('Acc_Transactions','OldVoucherNumber') IS NULL
BEGIN
	Alter Table Acc_Transactions
	Add OldVoucherNumber varchar(50)
END
Go 

--END: NageshBB: 10Aug 2020: Added 2 columns on transaction table for save old and new voucher number in voucher number reset task



--START:Vikas:11th Aug 2020:replaced parameter @FromDate and @ToDate into @TransactionDate
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:    Vikas
-- Create date: 1stjuly 2019 
-- =============================================
ALTER PROCEDURE [dbo].[SP_ACC_GetPharmacyTransactions]
    --@FromDate Datetime=null ,
    --@ToDate DateTime=null
	@TransactionDate DATE, @HospitalId INT
AS

/************************************************************************
FileName: [SP_ACC_GetPharmacyTransactions]
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/07Jul'19						getting GrDiscountAmount,GrVATAmount,GrCOGSAmount
2.		Vikas 11th Aug 2020					replaced parameter @FromDate and @ToDate into @TransactionDate
*************************************************************************/
BEGIN
  --IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
  BEGIN
   --Table1: CashInvoice
	 SELECT * from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL AND CONVERT(date, inv.CreateOn)= CONVERT(DATE, @TransactionDate)-- BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
   --Table2: PHRM_TXN_InvoiceItems
	 SELECT * from PHRM_TXN_InvoiceItems inv WHERE  CONVERT(date, inv.CreatedOn)= CONVERT(DATE, @TransactionDate)-- BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
   --Table3: CashInvoiceReturn
	 SELECT * from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn)= CONVERT(DATE, @TransactionDate)-- BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)  
   --Table4: goodsReceipt
	-- select * from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0  AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
	 select CreatedOn, SupplierId, TransactionType, TotalAmount, SubTotal, VATAmount, ISNULL(DiscountAmount, 0) as DiscountAmount, GoodReceiptId from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0  AND CONVERT(date, CreatedOn)= CONVERT(DATE, @TransactionDate)-- BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
   --Table5: writeoff
    select * from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn)= CONVERT(DATE, @TransactionDate)-- BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
 
   --Table6: dispatchToDept && dispatchToDeptRet
   select * from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL AND  CONVERT(date, CreatedOn)= CONVERT(DATE, @TransactionDate)-- BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
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
				AND CONVERT(date, inv.CreateOn)= CONVERT(DATE, @TransactionDate)-- BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
			GROUP BY invid) AS invoice1
			RIGHT JOIN (
				SELECT
					invIt.InvoiceId AS InvoiceId 
				FROM
					PHRM_TXN_InvoiceItems invIt 
					JOIN PHRM_TXN_Invoice inv ON invIt.InvoiceId = inv.InvoiceId 
				WHERE  inv.IsTransferredToACC IS NULL 
				AND CONVERT(date, inv.CreateOn)= CONVERT(DATE, @TransactionDate)-- BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
				GROUP  BY invIt.InvoiceId) AS invoice2 
			ON invoice1.InvoiceId = invoice2.InvoiceId 
			Where invoice1.InvoiceId is not null
 END
  
 -- ELSE
 -- BEGIN  
 --  --Table1: CashInvoice
	-- SELECT * from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL 
 --  --Table2: CashInvoiceReturn
	-- SELECT * from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL
 --  --Table3: goodsReceiptItems
	-- select * from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0 
 --  --Table4: returnToSupplier
	-- select * from PHRM_ReturnToSupplier grRet WHERE grRet.IsTransferredToACC IS NULL 
 --  --Table5: writeoff
 --   select * from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL 
 --  --Table6: dispatchToDept && dispatchToDeptRet
 --  select * from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL 
 -- --Table7: GrDiscountAmount,GrVATAmount
 --	SELECT
	--	invoice1.InvoiceId, 
	--	CASE 
	--		WHEN invoice1.DiscountAmount IS NULL THEN 0 
	--		ELSE CONVERT(DECIMAL(16, 4), invoice1.DiscountAmount) 
	--	END AS GrDiscountAmount, 
	--	CASE 
	--		WHEN invoice1.VATAmount IS NULL THEN 0 
	--		ELSE CONVERT(DECIMAL(16, 4), invoice1.VATAmount) 
	--	END AS GrVATAmount, 
	--	CASE 
	--		WHEN invoice1.GrCOGS IS NULL THEN 0 
	--		ELSE CONVERT(DECIMAL(16, 4), invoice1.GrCOGS) 
	--	END AS GrCOGSAmount  
	--FROM (
	--	SELECT
	--		invitem.invid AS InvoiceId, 
	--		SUM(invitem.GrItemDisAmt) AS DiscountAmount, 
	--		SUM(invitem.GrItemVATAmt) AS VATAmount,
	--		SUM(GrItemTotalAmount) - SUM(invitem.GrItemDisAmt) AS GrCOGS 
	--		FROM (
	--			SELECT
	--				invitm.InvoiceId AS invid, 
	--				gri.GrPerItemDisAmt * invitm.Quantity AS GrItemDisAmt, 
	--				gri.GrPerItemVATAmt * invitm.Quantity AS GrItemVATAmt,
	--				invitm.GrItemPrice * invitm.Quantity AS GrItemTotalAmount 
	--			FROM
	--				PHRM_TXN_InvoiceItems invitm
	--				JOIN PHRM_GoodsReceiptItems gri ON invitm.GrItemId = gri.GoodReceiptItemId) AS invitem 
	--		JOIN PHRM_TXN_Invoice inv ON invitem.invid = inv.InvoiceId
	--		WHERE
	--			inv.IsTransferredToACC IS NULL 
	--		GROUP BY invid) AS invoice1
	--		RIGHT JOIN (
	--			SELECT
	--				invIt.InvoiceId AS InvoiceId 
	--			FROM
	--				PHRM_TXN_InvoiceItems invIt 
	--				JOIN PHRM_TXN_Invoice inv ON invIt.InvoiceId = inv.InvoiceId 
	--			WHERE  inv.IsTransferredToACC IS NULL 
	--			GROUP  BY invIt.InvoiceId) AS invoice2 
	--		ON invoice1.InvoiceId = invoice2.InvoiceId 
	--		Where invoice1.InvoiceId is not null
 -- END
END
GO
------------------
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-----------------------------------------------------------
	
	ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]
			--@FromDate DATETIME=null ,
			--@ToDate DATETIME=null
			@TransactionDate DATE, @HospitalId INT
		AS
		--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @FromDate = '2019-07-05 12:07:31.170', @ToDate ='2020-07-05 12:07:31.170'

		/************************************************************************
		FileName: [SP_ACC_GetInventoryTransactions]
		CreatedBy/date: Ajay/05Jul'19
		Description: getting records of inventory transactions for accounting
		Change History
		-------------------------------------------------------------------------
		S.No.    UpdatedBy/Date                        Remarks
		-------------------------------------------------------------------------
		1       Ajay/05Jul'19						created the script
		2.		Vikas / 01-Jun-2020					update table 1 data -> exculde 'Capital Goods' Item type from table1
		3.		NageshBB 23 Jul 2020				replaced createdOn by GoodsReceiptDate column
		4.		Vikas 11th Aug 2020					replaced parameter @FromDate and @ToDate into @TransactionDate
		5.      Sud:11Aug'20                        Date changed to GoodsReceiptDate. Voucher should be created on this date.
		*************************************************************************/
		BEGIN
			--Table1: GoodReceipt
				SELECT 
					--gr.CreatedOn,
					gr.GoodsReceiptDate as 'CreatedOn',
					v.VendorName,
					gr.VendorId,
					 gr.PaymentMode,
					 itm.ItemCategoryId,
					 itm.ItemType,
					 itm.ItemName,
					 gr.TDSAmount,
					 gr.BillNo,									-- 26 March 2020:Vikas: added for invetory integration, mapping with accounting as per charak requirements.
					 gr.GoodsReceiptID,							-- 30 march 2020:Vikas: added GoodsReceiptID column
					 gritm.*
				FROM
					INV_TXN_GoodsReceipt gr 
					join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
					join INV_MST_Item itm on gritm.ItemId = itm.ItemId
				WHERE
					(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
					---sud:11Aug'20--changed to gr.GoodsReceiptDate from gr.CreatedOn
					AND (CONVERT(DATE, gr.GoodsReceiptDate)= CONVERT(DATE, @TransactionDate))  -- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND itm.ItemType !='Capital Goods' -- Vikas / 01-Jun-2020	
			--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
					AND (CONVERT(DATE, rv.CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			--Table4: DispatchToDept
				SELECT
					st.*, 
					gri.ItemRate 
				FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
				WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
					AND (CONVERT(DATE, st.CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			-- Table 5 :INVDeptConsumedGoods
				SELECT 
						csm.ConsumptionId,
						sb.SubCategoryId,
						sb.SubCategoryName,   
						csm.CreatedOn,
						csm.Quantity,
						stk.MRP
					FROM WARD_INV_Consumption csm
						join INV_MST_Item itm on csm.ItemId= itm.ItemId
						join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId
						join WARD_INV_Stock stk on itm.ItemId= stk.ItemId
					WHERE (csm.IsTransferToAcc IS NULL OR csm.IsTransferToAcc=0)  
						AND CONVERT(DATE, csm.CreatedOn)= CONVERT(DATE, @TransactionDate)-- BETWEEN   CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate)
		
		END

GO
--END:Vikas:11th Aug 2020:replaced parameter @FromDate and @ToDate into @TransactionDate

--START: NageshBB: 12Aug 2020: add column transferToacc status in WARD_INV_Transaction table and change sp for get inventory records, sp changes for update IsTransferToAcc column value when transfer records and reverse txn for inventory Consumption and Dispatch items 

--add IsTransfer to accounting column 
--Now dispatch and consumption records taking from WARD_INV_Transaction table
--old sp get dispatch records from INV_TXN_StockTransaction table and consumption records from WARD_INV_Consumption
IF COL_LENGTH('WARD_INV_Transaction','IsTransferToAcc') IS NULL
BEGIN
	Alter Table WARD_INV_Transaction
	Add IsTransferToAcc bit
END
Go 

if exists (select *from ACC_MST_Hospital_TransferRules_Mapping where TransferRuleId =( Select top 1 GroupMappingId from ACC_MST_GroupMapping where Description='INVDispatchToDept'))
Begin
	Update ACC_MST_Hospital_TransferRules_Mapping
	set IsActive=0 where TransferRuleId=(Select top 1 GroupMappingId from ACC_MST_GroupMapping where Description='INVDispatchToDept')	
End
Go



		SET ANSI_NULLS ON
		GO
		SET QUOTED_IDENTIFIER ON
		GO

		ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]			
		@TransactionDate DATE, @HospitalId INT
		AS
		--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @TransactionDate = '2019-07-05 12:07:31.170'

		/************************************************************************
		FileName: [SP_ACC_GetInventoryTransactions]
		CreatedBy/date: Ajay/05Jul'19
		Description: getting records of inventory transactions for accounting
		Change History
		-------------------------------------------------------------------------
		S.No.    UpdatedBy/Date                        Remarks
		-------------------------------------------------------------------------
		1       Ajay/05Jul'19						created the script
		2.		Vikas / 01-Jun-2020					update table 1 data -> exculde 'Capital Goods' Item type from table1
		3.		NageshBB 23 Jul 2020				replaced createdOn by GoodsReceiptDate column
		4.		Vikas 11th Aug 2020					replaced parameter @FromDate and @ToDate into @TransactionDate
		5.      Sud:11Aug'20                        Date changed to GoodsReceiptDate. Voucher should be created on this date.
		6.		NageshBB: 12Aug2020					Changes for get Consumed and dispatched items for accounting
													Now dispatch and consumption records taking from WARD_INV_Transaction table
		*************************************************************************/
		BEGIN
			--Table1: GoodReceipt
				SELECT 
					--gr.CreatedOn,
					gr.GoodsReceiptDate as 'CreatedOn',
					v.VendorName,
					gr.VendorId,
					 gr.PaymentMode,
					 itm.ItemCategoryId,
					 itm.ItemType,
					 itm.ItemName,
					 gr.TDSAmount,
					 gr.BillNo,									-- 26 March 2020:Vikas: added for invetory integration, mapping with accounting as per charak requirements.
					 gr.GoodsReceiptID,							-- 30 march 2020:Vikas: added GoodsReceiptID column
					 gritm.*
				FROM
					INV_TXN_GoodsReceipt gr 
					join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
					join INV_MST_Item itm on gritm.ItemId = itm.ItemId
				WHERE
					(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
					---sud:11Aug'20--changed to gr.GoodsReceiptDate from gr.CreatedOn
					AND (CONVERT(DATE, gr.GoodsReceiptDate)= CONVERT(DATE, @TransactionDate))  -- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND itm.ItemType !='Capital Goods' -- Vikas / 01-Jun-2020	
			--Table2: WriteOffItems
				SELECT * 
				FROM
					INV_TXN_WriteOffItems 
				WHERE
					(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			--Table3: ReturnToVendor
				SELECT
					rv.*, 
					v.VendorName, 
					gr.PaymentMode 
				FROM
					INV_TXN_ReturnToVendorItems rv 
					JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
					JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
				WHERE
					(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
					AND (CONVERT(DATE, rv.CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			
			--Table4: DispatchToDept
			--NageshBB: 12Aug2020: changed table name for get dispatched records StockTransaction to WARD_INV_Transaction						
					Select 
					wardTxn.TransactionId,
					CreatedOn= wardTxn.TransactionDate,
					TransactionType='INVDispatchToDept',					
					wardTxn.Price, 
					wardTxn.Quantity					
					from WARD_INV_Transaction wardTxn join INV_MST_Item itm 
					on wardTxn.ItemId=itm.ItemId
					where (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc =0) 
					AND wardTxn.TransactionType='dispatched-items' AND itm.ItemType='consumables'
					and (convert(date, wardTxn.TransactionDate)= convert(date, @TransactionDate))	
					
			-- Table 5 :INVDeptConsumedGoods
			--NageshBB: 12Aug2020: changed table name for get consumed records. WARD_INV_Consumption to WARD_INV_Transaction
				SELECT 
						wardTxn.TransactionId,
						sb.SubCategoryId,
						sb.SubCategoryName,   
						CreatedOn=wardTxn.TransactionDate,						
						wardTxn.Quantity,
						wardTxn.Price
					FROM WARD_INV_Transaction wardTxn
						join INV_MST_Item itm on wardTxn.ItemId= itm.ItemId
						join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
					WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
					AND wardTxn.TransactionType='consumption-items' AND itm.ItemType='consumables'
				    AND (CONVERT(DATE, wardTxn.TransactionDate)= CONVERT(DATE, @TransactionDate))
		
		END
		Go
		
				SET ANSI_NULLS ON
		GO
		SET QUOTED_IDENTIFIER ON
		GO
		/************************************************************************
		FileName: [SP_UpdateIsTransferToACC]
		Author  : Salakha/NageshBB
		Created date: 25 Feb 2019
		Description: Created Script to Update column IsTransferToACC
					This work in two scenario 1-when transferred records into accounting, 2-Undo transaction (datewise) from accounting		
        ---------------------------------------------------------------------------
		Change History
		-------------------------------------------------------------------------
		S.No.    UpdatedBy/Date                        Remarks
		-------------------------------------------------------------------------
		1       Salakha/NageshBB /25Feb 2020		  Created Script to Update column IsTransferToACC
		2		NageshBB/12Aug 2020		              Changes for Inventory module transaction where
													  Transaction type INVDeptConsumedGoods get records from WARD_INV_Consumption table 
													  and INVDispatchToDept get records from INV_TXN_StockTransaction				
													  Now both transaction type get records from single table i.e.WARD_INV_Transaction
													  done changes for this update column value IsTransferToAcc

		*************************************************************************************/
		
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
		EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferredToACC = 1 WHERE TransactionId IN (' + @ReferenceIds + ')')
		END
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'INVDispatchToDeptReturn')
		BEGIN
		EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = 1 WHERE StockTxnId IN (' + @ReferenceIds + ')')
		END

		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'INVDeptConsumedGoods')
		BEGIN
		EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferToAcc = 1 WHERE TransactionId IN (' + @ReferenceIds + ')')
		END
		--------------------------updates billing txn transferred records---------------

		--IF (@ReferenceIds IS NOT NULL
		--  AND @TransactionType = 'BillingRecords')
		--BEGIN
		--  EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = 1 WHERE BillingAccountingSyncId IN (' + @ReferenceIds + ')')
		--END

		-- 1
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END

		-- 2
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 3
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillPaid')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransaction SET IsCreditBillPaidSync = 1 WHERE BillingTransactionId IN (' + @ReferenceIds + ')')
		END	

		-- 4
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillReturnSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 5
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillReturnSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 6
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositAdd')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = 1 WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 7
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = 1 WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 8
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashDiscount')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Settlements SET IsCashDiscountSync = 1 WHERE SettlementId IN (' + @ReferenceIds + ')')
		END
	
		--------------------------updates incetive txn transferred records---------------
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'ConsultantIncentive')
		BEGIN
		EXECUTE ('UPDATE INCTV_TXN_IncentiveFractionItem SET IsTransferToAcc = 1 WHERE InctvTxnItemId IN (' + @ReferenceIds + ')')
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
		EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferredToACC = NULL WHERE TransactionId IN (' + @ReferenceIds + ')')
		END
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'INVDispatchToDeptReturn')
		BEGIN
		EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = NULL WHERE StockTxnId IN (' + @ReferenceIds + ')')
		END

		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'INVDeptConsumedGoods')
		BEGIN
		EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferToAcc = NULL WHERE TransactionId IN (' + @ReferenceIds + ')')
		END
		--------------------------updates billing txn transferred records---------------

		--IF (@ReferenceIds IS NOT NULL
		--  AND @TransactionType = 'BillingRecords' AND @TransactionDate is not null)
		--BEGIN
		--  EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = NULL WHERE ReferenceId IN (' + @ReferenceIds + ') and  convert(date,TransactionDate) = convert(date,'+''''+ @TransactionDate +''''+')') 
		--END
	
		-- 1
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END

		-- 2
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBill')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 3
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillPaid')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransaction SET IsCreditBillPaidSync = NULL WHERE BillingTransactionId IN (' + @ReferenceIds + ')')
		END	

		-- 4
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillReturnSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 5
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CreditBillReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillReturnSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
		END	

		-- 6
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositAdd')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = NULL WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 7
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'DepositReturn')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = NULL WHERE DepositId IN (' + @ReferenceIds + ')')
		END	

		-- 8
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'CashDiscount')
		BEGIN
		EXECUTE ('UPDATE BIL_TXN_Settlements SET IsCashDiscountSync = NULL WHERE SettlementId IN (' + @ReferenceIds + ')')
		END

		--------------------------updates incetive txn transferred records---------------
		IF (@ReferenceIds IS NOT NULL
		AND @TransactionType = 'ConsultantIncentive')
		BEGIN
		EXECUTE ('UPDATE INCTV_TXN_IncentiveFractionItem SET IsTransferToAcc = NULL WHERE InctvTxnItemId IN (' + @ReferenceIds + ')')
		END

		END
		END

		Go

--END: NageshBB: 12Aug 2020: add column transferToacc status in WARD_INV_Transaction table and change sp for get inventory records, sp changes for update IsTransferToAcc column value when transfer records and reverse txn for inventory Consumption and Dispatch items 
--START: ashish : 14 August  2020 Added GrTotalDisAmt column for total item discount
ALTER TABLE PHRM_GoodsReceiptItems
ADD GrTotalDisAmt decimal(16, 4) NULL
GO
--END: ashish : 14 August  2020 Added GrTotalDisAmt column for total item discount

--START: SANJIT: 19 Aug 2020 Added Button Level Permission for Manage Stock Button in Inventory
DECLARE @ApplicationId INT;
SET @ApplicationId = (SELECT TOP (1) ApplicationId
						FROM     RBAC_Application
						WHERE  (ApplicationName = 'Inventory') AND (ApplicationCode = 'INV'));

INSERT INTO RBAC_Permission
                  (PermissionName, ApplicationId, CreatedBy, CreatedOn)
VALUES ('inventory-stock-manage-button',@ApplicationId, 1, GETDATE())
GO
--END: SANJIT: 19 Aug 2020 Added Button Level Permission for Manage Stock Button in Inventory


---Start: sud:19Aug'20--Correction in INV-FiscalYearStock Table--

 -- earlier PK was put on FiscalYearId column, so we need to drop that and add PK on FiscalYrStockId column
ALTER TABLE [INV_FiscalYearStock]
DROP CONSTRAINT [PK_INV_FiscalYearStock]
GO
ALTER TABLE [INV_FiscalYearStock]
ADD CONSTRAINT [PK_INV_FiscalYearStock] PRIMARY KEY (FiscalYrStockId);
GO
---End: sud:19Aug'20--Correction in INV-FiscalYearStock Table--

----START: NageshBB: 20Aug2020: accounting db changes for task EMR-2426,EMR-2438,EMR-2439

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Acc_RPT_GetSystemAduitReport]
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@voucherReportType varchar(50)=null,
		@SectionId int=null
AS
/*
FileName: [SP_ACC_RPT_GetSystemAduitReport]
CreatedBy/date:
Description: 
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date         Remarks
-------------------------------------------------------
1       Vikas/24 June 2020      Get report for system log records of edit voucher, reversal transaction, back date entry for accounting.
2		NageshBB/ 19Aug 2020	added sectionId check for all records
-------------------------------------------------------
*/
BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	BEGIN
	IF (@voucherReportType='EditVoucher')  
	BEGIN
	-- START: Edit Voucher Logs Details
	select
		fs.FiscalYearName,
		lg.SectionId,
		sc.SectionName,
		lg.TransactionDate,
		lg.VoucherNumber,
		lg.Reason,
		lg.CreatedOn,
		lg.CreatedBy,
		lg.LogId,
		usr.FullName
	from ACC_Log_EditVoucher lg
		left join ACC_MST_FiscalYears fs on lg.FiscalYearId = fs.FiscalYearId
		left join ACC_MST_SectionList sc on lg.SectionId = sc.SectionId
		left join EMP_Employee usr on lg.CreatedBy = usr.EmployeeId
    where CONVERT(date, lg.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and lg.SectionId=@SectionId
	-- END: Edit Voucher Logs Details
	END
	ELSE IF (@voucherReportType='VoucherReversal')  
	BEGIN
	-- START: Reversal voucher txn Logs Details
	select
		accR.ReverseTransactionId,
		fs.FiscalYearName,
		sc.SectionName,
		accR.TransactionDate,
		accR.Reason,
		accR.CreatedOn,
		accR.CreatedBy,
		usr.FullName
	from ACC_ReverseTransaction accR
		left join ACC_MST_FiscalYears fs on accR.FiscalYearId = fs.FiscalYearId
		left join ACC_MST_SectionList sc on accR.Section = sc.SectionId
		left join EMP_Employee usr on accR.CreatedBy = usr.EmployeeId
	where CONVERT(date, accR.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
   and accR.Section=@SectionId
	-- END: Reversal voucher txn Logs Details
	END
	ELSE IF (@voucherReportType='BackDateEntry')  
	BEGIN
	-- START: Back Date Entry txn Logs Details
	select 
		txn.TransactionId,
		txn.SectionId,
		sc.SectionName,
		txn.TransactionDate,
		txn.VoucherNumber,
		txn.CreatedOn,
		txn.CreatedBy,
		usr.FullName
	from ACC_Transactions txn
		left join ACC_MST_SectionList sc on txn.SectionId = sc.SectionId
		left join EMP_Employee usr on txn.CreatedBy = usr.EmployeeId
	where CONVERT(date, txn.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
    and txn.SectionId=@SectionId
	-- END: Back Date Entry txn Logs Details
	END

	END
	
END
Go

----update hospital id in revertxn table and function for get reverse txn records from json value of ACC_ReverseTransaction table 
Update ACC_ReverseTransaction
set HospitalId=(select top 1 HospitalId from ACC_MST_Hospital where IsActive=1)
where HospitalId is null
Go

	
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create FUNCTION [dbo].[FN_ACC_Get_Reverse_Transaction_Records]()
RETURNS TABLE
AS

/*
 FileName: [FN_ACC_Get_Reverse_Transaction_Records]
 Description: This function return all transaction records with basic details like sectionId, voucherId, fiscalYearId, VoucherNumber,voucherserialno
			In ACC_RevrseTransaction table we are saving reversed txn details in json format. so, function will help for get easily all records basic details
			Please add time to time more columns as per need 
 Author: NageshBB: on 18 Aug 2020
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User						Change          Remarks
 -------------------------------------------------------------------------
 1.      18 Aug 2020 - NageshBB         created        function for show reversed details
 -------------------------------------------------------------------------
*/
RETURN
(
	SELECT 
	RTxn.ReverseTransactionId
	,RTxn.TUId
	,JSON_VALUE( x.[Value],'$.TransactionId') as TransactionId
	,RTxn.FiscalYearId
	,JSON_VALUE( x.[Value],'$.SectionId') as SectionId
	,JSON_VALUE( x.[Value],'$.VoucherId') as VoucherId
	,JSON_VALUE( x.[Value],'$.VoucherNumber') as VoucherNumber
	,VoucherSerialNo=SUBSTRING( JSON_VALUE( x.[Value],'$.VoucherNumber') , LEN(JSON_VALUE( x.[Value],'$.VoucherNumber')) -  CHARINDEX('-',REVERSE(JSON_VALUE( x.[Value],'$.VoucherNumber'))) + 2  , LEN(JSON_VALUE( x.[Value],'$.VoucherNumber'))  ) 
	,convert(date,JSON_VALUE( x.[Value],'$.TransactionDate') )as TransactionDate
	,convert(date,JSON_VALUE( x.[Value],'$.CreatedOn') )as CreatedOn
	,convert (date,RTxn.CreatedOn ) as ReversedOn
	,JSON_VALUE( x.[Value],'$.CreatedBy') as CreatedBy	
	,RTxn.CreatedBy as ReversedBy
	,HospitalId
	,RTxn.Reason
	FROM dbo.ACC_ReverseTransaction AS RTxn	
	CROSS APPLY OPENJSON(JSON_QUERY(JSONData, '$')) AS x		
)
Go							

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[SP_ACC_RPT_GetReverseTranactionDetail]			
@ReverseTransactionId int
AS
--EXEC [dbo].[SP_ACC_RPT_GetReverseTranactionDetail] @TransactionDate = '2019-07-05 12:07:31.170'

/************************************************************************
FileName: [SP_ACC_RPT_GetReverseTranactionDetail]
CreatedBy/date: NageshBB/18Aug2020
Description: get details of reversed transaction to show in report
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       NageshBB / 18Aug2020						 scriptcreated 
*************************************************************************/
BEGIN
	--Table1
		select distinct rtxn.SectionId, rtxn.VoucherId,rtxn.FiscalYearId,rtxn.CreatedBy, rtxn.ReversedBy  
		,sec.SectionName,fy.FiscalYearName,emp.FullName as ReversedByName,rtxn.ReversedOn,rtxn.Reason,rtxn.TransactionDate,--common section
		rtxn.VoucherNumber,vcr.VoucherName,rtxn.CreatedOn,emp1.FullName as CreatedByName, IsRecreated= 0 --table records
		from FN_ACC_Get_Reverse_Transaction_Records() rtxn 
		join ACC_MST_SectionList sec on rtxn.SectionId=sec.SectionId
		join ACC_MST_FiscalYears fy on fy.FiscalYearId=rtxn.FiscalYearId
		join EMP_Employee emp on emp.EmployeeId=rtxn.ReversedBy
		join ACC_MST_Vouchers vcr on vcr.VoucherId=rtxn.VoucherId
		join EMP_Employee emp1 on emp1.EmployeeId=rtxn.CreatedBy
		where rtxn.ReverseTransactionId=@ReverseTransactionId
	--Table2
		select distinct rtxn.SectionId,rtxn.FiscalYearId,rtxn.VoucherNumber
		from FN_ACC_Get_Reverse_Transaction_Records() rtxn 
		join ACC_Transactions txn on rtxn.SectionId=txn.SectionId and rtxn.FiscalYearId=txn.FiscalYearId
		and rtxn.VoucherNumber=txn.VoucherNumber
		where rtxn.ReverseTransactionId=@ReverseTransactionId			
END
Go


-------alter Get inventory transaction get procedure for consumed items 
IF COL_LENGTH('ACC_Txn_Link','ReferenceIdOne') IS NULL
BEGIN
	Alter Table  ACC_Txn_Link
	Add ReferenceIdOne varchar(max) null
END


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]			
@TransactionDate DATE, @HospitalId INT
AS
--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @TransactionDate = '2020-05-06 07:49:19.017' , @HospitalId=3

/************************************************************************
FileName: [SP_ACC_GetInventoryTransactions]
CreatedBy/date: Ajay/05Jul'19
Description: getting records of inventory transactions for accounting
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/05Jul'19						created the script
2.		Vikas / 01-Jun-2020					update table 1 data -> exculde 'Capital Goods' Item type from table1
3.		NageshBB 23 Jul 2020				replaced createdOn by GoodsReceiptDate column
4.		Vikas 11th Aug 2020					replaced parameter @FromDate and @ToDate into @TransactionDate
5.      Sud:11Aug'20                        Date changed to GoodsReceiptDate. Voucher should be created on this date.
6.		NageshBB: 12Aug2020					Changes for get Consumed and dispatched items for accounting
											Now dispatch and consumption records taking from WARD_INV_Transaction table
7.		NageshBB: 19Aug2020					changes for inventory Consumption TotalAmount ,new tranfer rule which record get for StockManageOut
											, exclude cancel good receipt
*************************************************************************/
BEGIN
	Declare @FYStartDate datetime=(select top 1 StartDate from ACC_MST_FiscalYears where convert(date,@TransactionDate)
	between convert(date,Startdate) and convert(date,EndDate)),
	@FYEndDate datetime=(select top 1 EndDate from ACC_MST_FiscalYears where convert(date,@TransactionDate)
	between convert(date,Startdate) and convert(date,EndDate))
	--Table1: GoodReceipt
		SELECT 
			--gr.CreatedOn,
			gr.GoodsReceiptDate as 'CreatedOn',
			v.VendorName,
			gr.VendorId,
			 gr.PaymentMode,
			 itm.ItemCategoryId,
			 itm.ItemType,
			 itm.ItemName,
			 gr.TDSAmount,
			 gr.BillNo,									-- 26 March 2020:Vikas: added for invetory integration, mapping with accounting as per charak requirements.
			 gr.GoodsReceiptID,							-- 30 march 2020:Vikas: added GoodsReceiptID column
			 gritm.*
		FROM
			INV_TXN_GoodsReceipt gr 
			join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
			JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
			join INV_MST_Item itm on gritm.ItemId = itm.ItemId
		WHERE
			(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
			---sud:11Aug'20--changed to gr.GoodsReceiptDate from gr.CreatedOn
			AND (CONVERT(DATE, gr.GoodsReceiptDate)= CONVERT(DATE, @TransactionDate))  -- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			AND itm.ItemType !='Capital Goods' and gr.IsCancel!=1 --excluded cancel gr	
	--Table2: WriteOffItems
		SELECT * 
		FROM
			INV_TXN_WriteOffItems 
		WHERE
			(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
			AND (CONVERT(DATE, CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
	--Table3: ReturnToVendor
		SELECT
			rv.*, 
			v.VendorName, 
			gr.PaymentMode 
		FROM
			INV_TXN_ReturnToVendorItems rv 
			JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
			JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
		WHERE
			(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
			AND (CONVERT(DATE, rv.CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
	
	--Table4: DispatchToDept
	--NageshBB: 12Aug2020: changed table name for get dispatched records StockTransaction to WARD_INV_Transaction						
			Select 
			wardTxn.TransactionId,
			CreatedOn=convert(date, wardTxn.TransactionDate),
			TransactionType='INVDispatchToDept',					
			wardTxn.Price, 
			wardTxn.Quantity					
			from WARD_INV_Transaction wardTxn join INV_MST_Item itm 
			on wardTxn.ItemId=itm.ItemId
			where (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc =0) 
			AND wardTxn.TransactionType='dispatched-items' AND itm.ItemType='consumables'
			and (convert(date, wardTxn.TransactionDate)= convert(date, @TransactionDate))	
			
	-- Table 5 :INVDeptConsumedGoods
	--NageshBB: 12Aug2020: changed table name for get consumed records. WARD_INV_Consumption to WARD_INV_Transaction
		SELECT 
				wardTxn.TransactionId,
				sb.SubCategoryId,
				sb.SubCategoryName,   
				CreatedOn=convert(date,wardTxn.TransactionDate),											
				TotalAmount= wardTxn.Quantity * wardTxn.Price
			FROM WARD_INV_Transaction wardTxn
				join INV_MST_Item itm on wardTxn.ItemId= itm.ItemId
				join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
			WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
			AND wardTxn.TransactionType='consumption-items' AND itm.ItemType='consumables'
		    AND (CONVERT(DATE, wardTxn.TransactionDate)= CONVERT(DATE, @TransactionDate))	
		
		-- Table 6 :INVStockManageOut	
		--NageshBB: asper discussion we need single voucher for whole year txn items 
		--so here we will get data as per fiscal year enddate and transaction date will be fiscal year end date		
		--Declare @TransactionDate datetime='2020-05-13 12:59:22.307'

		---StockManage-Out from MainStore---
		SELECT 
					0 'TransactionId',
					StkTxn.StockTxnId,
					sb.SubCategoryId,
					sb.SubCategoryName, 
					TransactionType='INVStockManageOut',
					CreatedOn=  convert(date,@FYEndDate),											
					TotalAmount= StkTxn.Quantity * StkTxn.Price
			FROM INV_TXN_StockTransaction StkTxn
					join INV_MST_Item itm on StkTxn.ItemId= itm.ItemId
					join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
				WHERE (StkTxn.IsTransferredToACC IS NULL OR StkTxn.IsTransferredToACC=0)  
				AND StkTxn.TransactionType in ('fy-managed-items','stockmanaged-items') and InOut='out'
			    AND ((CONVERT(DATE, StkTxn.TransactionDate) between CONVERT(DATE, @FYStartDate) and CONVERT(DATE, @FYEndDate) )) 						
		---StockManage-Out from SubStore---
		--temp update date '2020-08-09 07:49:19.017' to '2020-08-09 07:49:19.017'
		--update WARD_INV_Transaction set TransactionDate='2020-05-06 07:49:19.017'
		--where TransactionType in ('fy-stock-manage') and InOut='out'
		union
		SELECT 
					wardTxn.TransactionId,
					0  'StockTxnId',
					sb.SubCategoryId,
					sb.SubCategoryName,  
					TransactionType='INVStockManageOut',
					CreatedOn= convert(date,@FYEndDate),											
					TotalAmount= wardTxn.Quantity * wardTxn.Price
				FROM WARD_INV_Transaction wardTxn
					join INV_MST_Item itm on wardTxn.ItemId= itm.ItemId
					join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
				WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
				AND wardTxn.TransactionType in ('fy-stock-manage') and InOut='out'
			    AND ((CONVERT(DATE, wardTxn.TransactionDate) between CONVERT(DATE, @FYStartDate) and CONVERT(DATE, @FYEndDate) )) 					
END
Go

--acc-transfer rule for inventory stockManageOut
Declare @HospitalId int =(select top 1 HospitalId from ACC_MST_Hospital where IsActive=1),
 @VoucherId int =(select top 1 VoucherId from ACC_MST_Vouchers where VoucherCode='JV')
If not exists (select top 1 * from ACC_MST_GroupMapping where Section=1 and Description='INVStockManageOut' ) 
Begin
	Insert into ACC_MST_GroupMapping ([Description],Section,VoucherId,Remarks,CustomVoucherId)
	values ('INVStockManageOut',1,@VoucherId,'rule added for inventory stock manage out',@VoucherId)
END
Go
If exists (select top 1 * from ACC_MST_GroupMapping where Section=1 and Description='INVStockManageOut' ) 
Begin
	Insert into ACC_MST_Hospital_TransferRules_Mapping(HospitalId,TransferRuleId,IsActive)
	values((select top 1 HospitalId from ACC_MST_Hospital where IsActive=1),(select top 1 GroupMappingId from ACC_MST_GroupMapping where Section=1 and Description='INVStockManageOut'),1)
END
Go
If exists (select top 1 * from ACC_MST_GroupMapping where Section=1 and Description='INVStockManageOut' ) 
Begin
	Insert into ACC_MST_MappingDetail (GroupMappingId,LedgerGroupId,DrCr,Description)
	values ((select top 1 GroupMappingId from ACC_MST_GroupMapping where Section=1 and Description='INVStockManageOut')
	,null,1,'INVConsumptionParent')

	Insert into ACC_MST_MappingDetail (GroupMappingId,LedgerGroupId,DrCr,Description)	
	values((select top 1 GroupMappingId from ACC_MST_GroupMapping where Section=1 and Description='INVStockManageOut')
	,(select top 1 LedgerGroupId from ACC_MST_LedgerGroup where Name= 'ACA_MERCHANDISE_INVENTORY'),0,'INVConsumptionInventoryLG')
END
Go

---sp altered for inventory stockmanageout record transfer and reverse in accounting 

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/************************************************************************
FileName: [SP_UpdateIsTransferToACC]
Author  : Salakha/NageshBB
Created date: 25 Feb 2019
Description: Created Script to Update column IsTransferToACC
			This work in two scenario 1-when transferred records into accounting, 2-Undo transaction (datewise) from accounting		
---------------------------------------------------------------------------
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Salakha/NageshBB /25Feb 2020		  Created Script to Update column IsTransferToACC
2		NageshBB/12Aug 2020		              Changes for Inventory module transaction where
											  Transaction type INVDeptConsumedGoods get records from WARD_INV_Consumption table 
											  and INVDispatchToDept get records from INV_TXN_StockTransaction				
											  Now both transaction type get records from single table i.e.WARD_INV_Transaction
											  done changes for this update column value IsTransferToAcc
3		NageshBB/20Aug 2020					 Inventory Transaction Type INVStockManageOut need to handle for reverse txn and Update after transfer records
											 This transaction from 2 table 
*************************************************************************************/

ALTER PROCEDURE [dbo].[SP_UpdateIsTransferToACC] 
	@ReferenceIds varchar(max),
	@TransactionType nvarchar(50),
	@IsReverseTransaction bit=0,
	@TransactionDate varchar(30)=null,
	@ReferenceIdsOne varchar(max)
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
	EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferredToACC = 1 WHERE TransactionId IN (' + @ReferenceIds + ')')
	END
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'INVDispatchToDeptReturn')
	BEGIN
	EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = 1 WHERE StockTxnId IN (' + @ReferenceIds + ')')
	END

	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'INVDeptConsumedGoods')
	BEGIN
	EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferToAcc = 1 WHERE TransactionId IN (' + @ReferenceIds + ')')
	END
	IF ((@ReferenceIds IS NOT NULL or @ReferenceIdsOne is not null)
	AND @TransactionType = 'INVStockManageOut')
	--here we have 2 tables for INVStockManageOut
	BEGIN
	EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = 1 WHERE StockTxnId IN (' + @ReferenceIdsOne + ')')
	EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferToAcc = 1 WHERE TransactionId IN (' + @ReferenceIds + ')')
	END
	--------------------------updates billing txn transferred records---------------

	--IF (@ReferenceIds IS NOT NULL
	--  AND @TransactionType = 'BillingRecords')
	--BEGIN
	--  EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = 1 WHERE BillingAccountingSyncId IN (' + @ReferenceIds + ')')
	--END

	-- 1
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CashBill')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
	END

	-- 2
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CreditBill')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
	END	

	-- 3
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CreditBillPaid')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransaction SET IsCreditBillPaidSync = 1 WHERE BillingTransactionId IN (' + @ReferenceIds + ')')
	END	

	-- 4
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CashBillReturn')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillReturnSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
	END	

	-- 5
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CreditBillReturn')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillReturnSync = 1 WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
	END	

	-- 6
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'DepositAdd')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = 1 WHERE DepositId IN (' + @ReferenceIds + ')')
	END	

	-- 7
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'DepositReturn')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = 1 WHERE DepositId IN (' + @ReferenceIds + ')')
	END	

	-- 8
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CashDiscount')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_Settlements SET IsCashDiscountSync = 1 WHERE SettlementId IN (' + @ReferenceIds + ')')
	END

	--------------------------updates incetive txn transferred records---------------
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'ConsultantIncentive')
	BEGIN
	EXECUTE ('UPDATE INCTV_TXN_IncentiveFractionItem SET IsTransferToAcc = 1 WHERE InctvTxnItemId IN (' + @ReferenceIds + ')')
	END

	END
	ELSE  -- IF ReverseTransaction is true, update IsTransferredToACC is null, undo transaction done by super admin
	BEGIN
	-----------Reverse transaction entry Started--------------------
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
	EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferredToACC = NULL WHERE TransactionId IN (' + @ReferenceIds + ')')
	END
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'INVDispatchToDeptReturn')
	BEGIN
	EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = NULL WHERE StockTxnId IN (' + @ReferenceIds + ')')
	END

	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'INVDeptConsumedGoods')
	BEGIN
	EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferToAcc = NULL WHERE TransactionId IN (' + @ReferenceIds + ')')
	END
	IF ((@ReferenceIds IS NOT NULL or @ReferenceIdsOne is not null)
	AND @TransactionType = 'INVStockManageOut')
	--here we have 2 tables for INVStockManageOut
	BEGIN
	EXECUTE ('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = null WHERE StockTxnId IN (' + @ReferenceIdsOne + ')')
	EXECUTE ('UPDATE WARD_INV_Transaction SET IsTransferToAcc = null WHERE TransactionId IN (' + @ReferenceIds + ')')
	END
	--------------------------updates billing txn transferred records---------------

	--IF (@ReferenceIds IS NOT NULL
	--  AND @TransactionType = 'BillingRecords' AND @TransactionDate is not null)
	--BEGIN
	--  EXECUTE ('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = NULL WHERE ReferenceId IN (' + @ReferenceIds + ') and  convert(date,TransactionDate) = convert(date,'+''''+ @TransactionDate +''''+')') 
	--END

	-- 1
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CashBill')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
	END

	-- 2
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CreditBill')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
	END	

	-- 3
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CreditBillPaid')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransaction SET IsCreditBillPaidSync = NULL WHERE BillingTransactionId IN (' + @ReferenceIds + ')')
	END	

	-- 4
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CashBillReturn')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCashBillReturnSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
	END	

	-- 5
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CreditBillReturn')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_BillingTransactionItems SET IsCreditBillReturnSync = NULL WHERE BillingTransactionItemId IN (' + @ReferenceIds + ')')
	END	

	-- 6
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'DepositAdd')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = NULL WHERE DepositId IN (' + @ReferenceIds + ')')
	END	

	-- 7
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'DepositReturn')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_Deposit SET IsDepositSync = NULL WHERE DepositId IN (' + @ReferenceIds + ')')
	END	

	-- 8
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'CashDiscount')
	BEGIN
	EXECUTE ('UPDATE BIL_TXN_Settlements SET IsCashDiscountSync = NULL WHERE SettlementId IN (' + @ReferenceIds + ')')
	END

	--------------------------updates incetive txn transferred records---------------
	IF (@ReferenceIds IS NOT NULL
	AND @TransactionType = 'ConsultantIncentive')
	BEGIN
	EXECUTE ('UPDATE INCTV_TXN_IncentiveFractionItem SET IsTransferToAcc = NULL WHERE InctvTxnItemId IN (' + @ReferenceIds + ')')
	END

	END
	END
	Go

----END: NageshBB: 20Aug2020: accounting db changes for task EMR-2426,EMR-2438,EMR-2439

----START: Shankar: 20Aug2020: updated script of pharmacy report
GO
/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]    Script Date: 08/20/2020 1:50:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--select * from FN_PHRM_PharmacyTxn_ByBillingType_UserCollection('2020-03-16','2020-03-16')
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
3       Shankar  23rd March 2020               depositdeduct included 
4		Shankar  20th Aug 2020				   Cash return query optimized
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
						 InvoiceId,
						 'CashInvoice' AS 'TransactionType',
						 SubTotal,
						 DiscountAmount,
						 VATAmount,
						 TotalAmount, 
						 TotalAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived',  
						 0 AS 'CreditAmount',
						 CounterId, 
						 CreatedBy 'EmployeeId',
						 Remark 'Remarks',  
						 1 as DisplaySeq
				from PHRM_TXN_Invoice
				Where PaymentMode ='cash' and Convert(Date,CreateOn) = Convert(Date,CreateOn)

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreateOn) 'Date', 
					   'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
					   Patientid,
					   InvoiceId,
					   'CreditInvoice' AS 'TransactionType',
					   SubTotal,
					   DiscountAmount,
					   TotalAmount,
					   VATAmount, 
					   0 AS 'CashCollection', 
					   0 AS 'DepositReceived', 
					   0 AS 'DepositRefund', 
					   0 AS 'DepositDeduct',
					   0 AS 'CreditReceived',
					   TotalAmount  AS 'CreditAmount',
					   CounterId, 
					   CreatedBy 'EmployeeId',
					   Remark 'Remarks', 
					   2 as DisplaySeq 
				FROM PHRM_TXN_Invoice
				WHERE (PaymentMode = 'credit' and BilStatus='unpaid') 
				--and(Convert(Date,CreateOn) = Convert(Date,CreateOn))  --VIKAS:10th Jan 2020

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 InvoiceId,
						'CreditInvoiceReceived' AS 'TransactionType',
						 0 AS SubTotal, 
						 0 AS DiscountAmount, 
						 0 AS VATAmount,  
						 0 AS TotalAmount, 
					     TotalAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
					   	 TotalAmount AS 'CreditReceived',  
						 0  AS 'CreditAmount',
					     CounterId AS 'CounterId', 
						 CreatedBy AS 'EmployeeId', 
						 Remark 'Remarks', 
						 3 as DisplaySeq 
				from PHRM_TXN_Invoice
				Where (PaymentMode='credit'and BilStatus='paid')  
				--and Convert(Date,PaidDate) != Convert(Date,CreditDate) --VIKAS:10th Jan 2020

				UNION ALL
				--Cash Return---
				select * from
				(
						select top 1 with ties  Convert(Date,ret.CreatedOn) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						  inv.PatientId,
						  inv.InvoiceId,
						 'CashInvoiceReturn' AS 'TransactionType',
						 (-inv.SubTotal) 'SubTotal', 
						 inv.DiscountAmount as 'DiscountAmount', 
						 inv.VATAmount as 'VATAmount', 
						 (-inv.TotalAmount) 'TotalAmount', 
	  					 (-inv.PaidAmount) AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived', 
						 0 AS 'CreditAmount',
						 ret.CounterId, 
						 ret.CreatedBy 'EmployeeId', 
						 ret.Remark 'Remarks', 
						 4 as DisplaySeq 
						 from PHRM_TXN_Invoice as inv
						join PHRM_TXN_InvoiceReturnItems as ret on inv.InvoiceId= ret.InvoiceId  
						order by row_number() over (partition by inv.InvoiceId order by inv.InvoiceId desc))
						x
						--order by x.InvoiceId desc
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date', 
					    'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 txn.PatientId,
						 ret.InvoiceId,
						 'CreditInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', 
						 (-txn.DiscountAmount) 'DiscountAmount', 
						 (-txn.VATAmount) 'VATAmount', 
						 (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived', 
						 (-ret.TotalAmount) 'CreditAmount',
						 ret.CounterId, 
						 ret.CreatedBy 'EmployeeId', 
						 ret.Remark 'Remarks', 
						 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				and txn.PaymentMode='credit' and settlementId is null
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
) -- end of return
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRM_UserwiseCollectionReport]    Script Date: 08/20/2020 1:50:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_UserwiseCollectionReport]  

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
5.      Shankar 23rd March 2020             Included deposit deduct and deposit refund
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
			bills.DepositDeduct,
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
							 0 AS 'InvoiceId',
							 CASE WHEN DepositType='Deposit' THEN 'AdvanceReceived' 
								WHEN DepositType='depositdeduct' OR DepositType='depositreturn' THEN 'AdvanceSettled' END AS 'TransactionType',
			
							 0 As SubTotal,0 AS DiscountAmount,0 AS VATAmount, 0 AS TotalAmount, 
							 CASE WHEN DepositType='Deposit' THEN DepositAmount WHEN DepositType='depositdeduct' OR DepositType='depositreturn' THEN (-DepositAmount) END AS 'CashCollection',
							  CASE WHEN DepositType='Deposit' THEN DepositAmount ELSE 0 END AS 'DepositReceived',
							CASE WHEN  DepositType='depositreturn' THEN DepositAmount ELSE 0 END AS 'DepositRefund',
						   CASE WHEN  DepositType='depositdeduct' THEN DepositAmount ELSE 0 END AS 'DepositDeduct'
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
----END: Shankar: 20Aug2020: updated script of pharmacy report

---START: Rusha/Sanjesh: 20Aug2020: Parameterized item level discount in GR of Pharmacy
GO
INSERT INTO CORE_CFG_Parameters 
VALUES ('Pharmacy','PharmacyItemlvlDiscount','false','boolean','Enable or disable pharmacy item level discount amount','custom','NULL');
GO
---END: Rusha/Sanjesh: 20Aug2020: Parameterized item level discount in GR of Pharmacy

--START:Vikas:20-Aug-2020: Add permission for reverse-voucher and add column allow rever voucher in acc_traction table.

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'IsAllowReverseVoucher'
          AND Object_ID = Object_ID(N'dbo.ACC_Transactions'))
BEGIN
 Alter table ACC_Transactions ADD IsAllowReverseVoucher bit DEFAULT 0 NOT NULL;;
END
GO
------------
update ACC_Transactions
SET IsAllowReverseVoucher=1
where TransactionType='ManualEntry'
GO
------------
declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');

	Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
	values ('allow-reverse-voucher',@ApplicationId,1,GETDATE(),1);
GO

--END:Vikas:20-Aug-2020: Add permission for reverse-voucher and add column allow rever voucher in acc_traction table.

--START: NageshBB: 20Aug2020: changes invenetory get sp for stock manage out get only on FiscalYear end date
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]			
@TransactionDate DATE, @HospitalId INT
AS
--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @TransactionDate = '2020-05-06 07:49:19.017' , @HospitalId=3

/************************************************************************
FileName: [SP_ACC_GetInventoryTransactions]
CreatedBy/date: Ajay/05Jul'19
Description: getting records of inventory transactions for accounting
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/05Jul'19						created the script
2.		Vikas / 01-Jun-2020					update table 1 data -> exculde 'Capital Goods' Item type from table1
3.		NageshBB 23 Jul 2020				replaced createdOn by GoodsReceiptDate column
4.		Vikas 11th Aug 2020					replaced parameter @FromDate and @ToDate into @TransactionDate
5.      Sud:11Aug'20                        Date changed to GoodsReceiptDate. Voucher should be created on this date.
6.		NageshBB: 12Aug2020					Changes for get Consumed and dispatched items for accounting
											Now dispatch and consumption records taking from WARD_INV_Transaction table
7.		NageshBB: 19Aug2020					changes for inventory Consumption TotalAmount ,new tranfer rule which record get for StockManageOut
											, exclude cancel good receipt
8.		NageshBB: 20Aug2020					StockManageOut transaction get only on fiscal Year END date
*************************************************************************/
BEGIN
	Declare @FYStartDate datetime=(select top 1 StartDate from ACC_MST_FiscalYears where convert(date,@TransactionDate)
	between convert(date,Startdate) and convert(date,EndDate)),
	@FYEndDate datetime=(select top 1 EndDate from ACC_MST_FiscalYears where convert(date,@TransactionDate)
	between convert(date,Startdate) and convert(date,EndDate))
	--Table1: GoodReceipt
		SELECT 
			--gr.CreatedOn,
			gr.GoodsReceiptDate as 'CreatedOn',
			v.VendorName,
			gr.VendorId,
			 gr.PaymentMode,
			 itm.ItemCategoryId,
			 itm.ItemType,
			 itm.ItemName,
			 gr.TDSAmount,
			 gr.BillNo,									-- 26 March 2020:Vikas: added for invetory integration, mapping with accounting as per charak requirements.
			 gr.GoodsReceiptID,							-- 30 march 2020:Vikas: added GoodsReceiptID column
			 gritm.*
		FROM
			INV_TXN_GoodsReceipt gr 
			join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
			JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
			join INV_MST_Item itm on gritm.ItemId = itm.ItemId
		WHERE
			(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
			---sud:11Aug'20--changed to gr.GoodsReceiptDate from gr.CreatedOn
			AND (CONVERT(DATE, gr.GoodsReceiptDate)= CONVERT(DATE, @TransactionDate))  -- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			AND itm.ItemType !='Capital Goods' and gr.IsCancel!=1 --excluded cancel gr	
	--Table2: WriteOffItems
		SELECT * 
		FROM
			INV_TXN_WriteOffItems 
		WHERE
			(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
			AND (CONVERT(DATE, CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
	--Table3: ReturnToVendor
		SELECT
			rv.*, 
			v.VendorName, 
			gr.PaymentMode 
		FROM
			INV_TXN_ReturnToVendorItems rv 
			JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
			JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
		WHERE
			(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
			AND (CONVERT(DATE, rv.CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
	
	--Table4: DispatchToDept
	--NageshBB: 12Aug2020: changed table name for get dispatched records StockTransaction to WARD_INV_Transaction						
			Select 
			wardTxn.TransactionId,
			CreatedOn=convert(date, wardTxn.TransactionDate),
			TransactionType='INVDispatchToDept',					
			wardTxn.Price, 
			wardTxn.Quantity					
			from WARD_INV_Transaction wardTxn join INV_MST_Item itm 
			on wardTxn.ItemId=itm.ItemId
			where (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc =0) 
			AND wardTxn.TransactionType='dispatched-items' AND itm.ItemType='consumables'
			and (convert(date, wardTxn.TransactionDate)= convert(date, @TransactionDate))	
			
	-- Table 5 :INVDeptConsumedGoods
	--NageshBB: 12Aug2020: changed table name for get consumed records. WARD_INV_Consumption to WARD_INV_Transaction
		SELECT 
				wardTxn.TransactionId,
				sb.SubCategoryId,
				sb.SubCategoryName,   
				CreatedOn=convert(date,wardTxn.TransactionDate),											
				TotalAmount= wardTxn.Quantity * wardTxn.Price
			FROM WARD_INV_Transaction wardTxn
				join INV_MST_Item itm on wardTxn.ItemId= itm.ItemId
				join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
			WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
			AND wardTxn.TransactionType='consumption-items' AND itm.ItemType='consumables'
		    AND (CONVERT(DATE, wardTxn.TransactionDate)= CONVERT(DATE, @TransactionDate))	
		
		-- Table 6 :INVStockManageOut	
		--NageshBB: asper discussion we need single voucher for whole year txn items 
		--so here we will get data as per fiscal year enddate and transaction date will be fiscal year end date		
		--Declare @TransactionDate datetime='2020-05-13 12:59:22.307'

		---StockManage-Out from MainStore---
		SELECT 
					0 'TransactionId',
					StkTxn.StockTxnId,
					sb.SubCategoryId,
					sb.SubCategoryName, 
					TransactionType='INVStockManageOut',
					CreatedOn=  convert(date,@FYEndDate),											
					TotalAmount= StkTxn.Quantity * StkTxn.Price
			FROM INV_TXN_StockTransaction StkTxn
					join INV_MST_Item itm on StkTxn.ItemId= itm.ItemId
					join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
				WHERE (StkTxn.IsTransferredToACC IS NULL OR StkTxn.IsTransferredToACC=0)  
				AND StkTxn.TransactionType in ('fy-managed-items','stockmanaged-items') and InOut='out'
			    AND ((CONVERT(DATE, StkTxn.TransactionDate) between CONVERT(DATE, @FYStartDate) and CONVERT(DATE, @FYEndDate) )) 
				AND convert(date,@FYEndDate)=convert(date,@TransactionDate)
				AND itm.ItemType='consumables'
		---StockManage-Out from SubStore---
		--temp update date '2020-08-09 07:49:19.017' to '2020-08-09 07:49:19.017'
		--update WARD_INV_Transaction set TransactionDate='2020-05-06 07:49:19.017'
		--where TransactionType in ('fy-stock-manage') and InOut='out'
		union
		SELECT 
					wardTxn.TransactionId,
					0  'StockTxnId',
					sb.SubCategoryId,
					sb.SubCategoryName,  
					TransactionType='INVStockManageOut',
					CreatedOn= convert(date,@FYEndDate),											
					TotalAmount= wardTxn.Quantity * wardTxn.Price
				FROM WARD_INV_Transaction wardTxn
					join INV_MST_Item itm on wardTxn.ItemId= itm.ItemId
					join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
				WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
				AND wardTxn.TransactionType in ('fy-stock-manage') and InOut='out'
			    AND ((CONVERT(DATE, wardTxn.TransactionDate) between CONVERT(DATE, @FYStartDate) and CONVERT(DATE, @FYEndDate) )) 					
				AND convert(date,@FYEndDate)=convert(date,@TransactionDate)
				AND itm.ItemType='consumables'
END
Go
--END: NageshBB: 20Aug2020: changes invenetory get sp for stock manage out get only on FiscalYear end date

--START: Sanjit: 24Aug2020:  Inventory back date enhancements
--renaming ReceiptDate to TransactionDate in INV_TXN_Stock Table
EXEC sp_rename 'INV_TXN_Stock.ReceiptDate', 'TransactionDate', 'COLUMN';
GO
--permission for gr-back-date entry
DECLARE @ApplicationId INT;
SET @ApplicationId = (SELECT TOP (1) ApplicationId
						FROM     RBAC_Application
						WHERE  (ApplicationName = 'Inventory') AND (ApplicationCode = 'INV'));

INSERT INTO RBAC_Permission
                  (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
VALUES ('inventory-gr-backdate-entry-button',@ApplicationId, 1, GETDATE(), 1)
GO
--END: Sanjit: 24Aug2020: Inventory back date enhancements


--START:VIKAS:27th Aug 2020: modify not null to null value for column
IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'IsAllowReverseVoucher'
          AND Object_ID = Object_ID(N'dbo.ACC_Transactions'))
BEGIN 
ALTER TABLE ACC_Transactions ALTER COLUMN IsAllowReverseVoucher bit NULL
END
GO
--END:VIKAS:27th Aug 2020: modify not null to null value for column

--START: NageshBB: 02 Sep 2020: unique constraint on acc ledger balance history table for LedgeerId and FiscalYearId
ALTER TABLE ACC_LedgerBalanceHistory
ADD CONSTRAINT UQ_ACC_LedgerBalanceHistory_FiscalYearId_LedgerId UNIQUE(FiscalYearId, LedgerId)
Go
--END: NageshBB: 02 Sep 2020: unique constraint on acc ledger balance history table for LedgeerId and FiscalYearId

-------------------IPBilling Order Status Branch---------------------------------
----Start: Pratik: 7 Aug, 2020---

ALTER TABLE BIL_CFG_BillItemPrice
ADD IsValidForReporting  bit 
CONSTRAINT df_ValidForReporting DEFAULT 0
WITH VALUES
Go

ALTER TABLE BIL_TXN_BillingTransactionItems
ADD OrderStatus  varchar(20) 
GO

Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
values('Common','CancellationRules','{"Enable": false, "Billing":["active","pending"],"Nursing":["active"],"Lab":["active","pending"],"Radiology":["active","pending"],"Emergency":["active"]}',
'JSON','Cancellation Rules For Hospital. Different users have different levels of permissions to cancel the LabTests/Imaging Items etc.','system',null);

GO

Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
values('Billing','OrderStatusSettingB4Discharge','{"Check": false, "RestrictOnStatusArr":["active"]}',
'JSON','Discharge Rules For Hospital.','system',null);

GO

----End: Pratik: 7 Aug, 2020---

--Anish: Start: 7 Aug, 2020---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Anish Bhattarai>
-- Create date: <7 Aug, 2020>
-- Description:	<Update the OrderStatus of BillTxnItem table>
-- =============================================
CREATE PROCEDURE [dbo].[SP_Bill_OrderStatusUpdate] 
(
	@allReqIds nvarchar(max),
	@status varchar(20)
)
	
AS
BEGIN

	Update BIL_TXN_BillingTransactionItems set OrderStatus=@status where BillingTransactionItemId IN (
	(select txnItem.BillingTransactionItemId from (select * from LAB_TestRequisition where RequisitionId IN (SELECT value FROM string_split(@allReqIds,','))) as req 
	join BIL_TXN_BillingTransactionItems as txnItem on req.RequisitionId = txnItem.RequisitionId
	join BIL_MST_ServiceDepartment as srv on txnItem.ServiceDepartmentId = srv.ServiceDepartmentId
	where srv.IntegrationName = 'lab' and ISNULL(txnItem.ReturnStatus,0)= 0 and  txnItem.CancelledBy IS NULL)
	);

END
GO
--Anish: End: 7 Aug, 2020---

---ANish:Start: 10 August, 2020 -------------------
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Anish Bhattarai>
-- Create date: <10 Aug, 2020>
-- Description:	<Update OrderStatus on BillTxnItems table on Radiology Actions>
-- =============================================
CREATE PROCEDURE [dbo].[SP_Bill_OrderStatusUpdate_Radiology] 
(
	@reqID INT,
	@status VARCHAR(20)
)
AS
BEGIN
	Update BIL_TXN_BillingTransactionItems set OrderStatus=@status where BillingTransactionItemId IN (
	(select txnItem.BillingTransactionItemId from (select * from RAD_PatientImagingRequisition 
	where ImagingRequisitionId = @reqID) as req 
	join BIL_TXN_BillingTransactionItems as txnItem on req.ImagingRequisitionId = txnItem.RequisitionId
	join BIL_MST_ServiceDepartment as srv on txnItem.ServiceDepartmentId = srv.ServiceDepartmentId
	where LOWER(srv.IntegrationName) = 'radiology' and ISNULL(txnItem.ReturnStatus,0)= 0 and  txnItem.CancelledBy IS NULL)
	);
END
GO

---Renaming LabTest column IsValidSampling to IsValidForReporting---
EXEC sp_RENAME 'LAB_LabTests.IsValidSampling', 'IsValidForReporting', 'COLUMN';
GO


---Updating IsValidForReporting field of BIL_CFG_BillItemPrice based upon LabTest table IsValidForReporting = 1
Update BIL_CFG_BillItemPrice 
set IsValidForReporting=1
where BillItemPriceId IN (select itm.BillItemPriceId from BIL_CFG_BillItemPrice itm
join LAB_LabTests test on itm.ItemId = test.LabTestId
join BIL_MST_ServiceDepartment serv on itm.ServiceDepartmentId = serv.ServiceDepartmentId
where LOWER(serv.IntegrationName)='lab' and test.IsValidForReporting = 1);
GO
---ANish:End: 10 August, 2020 --------------------

--Anish: Start: 11 August, 2020 Orderstatus Update for Older data------------------
Update txnItem 
Set txnItem.OrderStatus =
CASE 
WHEN billSumm.OrderStatus='active' then 'active' 
WHEN billSumm.OrderStatus='pending' then 'pending'
WHEN billSumm.OrderStatus='result-added' then 'final'
WHEN billSumm.OrderStatus='report-generated' then 'final' 
END
From BIL_TXN_BillingTransactionItems txnItem, 
(Select itm.BillingTransactionItemId,req.OrderStatus from LAB_TestRequisition req
Join BIL_TXN_BillingTransactionItems itm on itm.RequisitionId=req.RequisitionId
Join BIL_MST_ServiceDepartment srv on srv.ServiceDepartmentId=itm.ServiceDepartmentId
Where LOWER(srv.IntegrationName)='lab') billSumm
where txnItem.BillingTransactionItemId = billSumm.BillingTransactionItemId
Go

Update txnItem 
Set txnItem.OrderStatus =
CASE 
WHEN billSumm.OrderStatus='active' then 'active' 
WHEN billSumm.OrderStatus='pending' then 'pending'
WHEN billSumm.OrderStatus='final' then 'final'
END
From BIL_TXN_BillingTransactionItems txnItem, 
(Select itm.BillingTransactionItemId,req.OrderStatus from RAD_PatientImagingRequisition req
Join BIL_TXN_BillingTransactionItems itm on itm.RequisitionId=req.ImagingRequisitionId
Join BIL_MST_ServiceDepartment srv on srv.ServiceDepartmentId=itm.ServiceDepartmentId
Where LOWER(srv.IntegrationName)='radiology') billSumm
where txnItem.BillingTransactionItemId = billSumm.BillingTransactionItemId
Go


------SP to get Inpatient Item(Lab/Radiology and other) List for Lab, Radiology, Nursing, Emergency----------------------

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Anish Bhattarai>
-- Create date: <3 August 2020>
-- Description:	<Get all the Items requested for the given Inpatient>
-- =============================================
CREATE PROCEDURE [dbo].[SP_InPatient_Item_Details] 
( 
@patientId int, 
@patientVisitId int,
@moduleName varchar(50)=null
)
AS
BEGIN

IF(@moduleName='' OR LOWER(@moduleName)='null' OR LOWER(@moduleName)='nursing' OR LOWER(@moduleName)='emergency')
BEGIN
SET @moduleName = null
END


select billItems.* , emp.FullName as 'RequestingUserName',dept.DepartmentName as 'RequestingUserDept', 
dept.DepartmentCode as 'DepartmenCode',LOWER(srv.IntegrationName) as 'IntegrationName', null as 'AllowCancellation' from 
(Select * from BIL_TXN_BillingTransactionItems 
Where ISNULL(ReturnStatus,0)=0 and PatientId=@patientId and PatientVisitId=@patientVisitId and LOWER(BillStatus)='provisional') billItems
Join (select * from BIL_MST_ServiceDepartment where LOWER(IntegrationName)=LOWER(@moduleName) OR @moduleName Is Null) srv on billItems.ServiceDepartmentId = srv.ServiceDepartmentId
Join EMP_Employee emp on emp.EmployeeId = billItems.CreatedBy
Left Join MST_Department dept on emp.DepartmentId = dept.DepartmentId
Order by billItems.CreatedOn desc
END
GO
--Anish: End: 11 August, 2020 ------------------

--ANish: Start: 12 Aug, 2020--------------
Alter table RAD_PatientImagingRequisition 
Add BillCancelledBy int null, BillCancelledOn DateTime null
GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Anish Bhattarai>
-- Create date: <12 August>
-- Description:	<Cancellation of Bill Item>
-- =============================================
CREATE PROCEDURE [dbo].[SP_BillItemCancellation_From_Ward]
(
	@BillingTransactionItemId int, 
	@RequisitionId int, 
	@IntegrationName varchar(50), 
	@UserId int, 
	@Remarks varchar(500)
)
AS
BEGIN
	BEGIN TRY
		BEGIN TRANSACTION;
	
		declare @CancelledOn DateTime;
		set @CancelledOn = GETDATE();
		select @CancelledOn;

		Update BIL_TXN_BillingTransactionItems
		set BillStatus='cancel', CancelledBy=@UserId,CancelledOn=@CancelledOn,CancelRemarks=@Remarks where BillingTransactionItemId=@BillingTransactionItemId

		IF(LOWER(@IntegrationName)='lab')
		BEGIN
			Update LAB_TestRequisition set BillingStatus='cancel', BillCancelledBy=@UserId, BillCancelledOn=@CancelledOn where RequisitionId=@RequisitionId
		END

		IF(LOWER(@IntegrationName)='radiology')
		BEGIN
			Update RAD_PatientImagingRequisition set BillingStatus='cancel', BillCancelledBy=@UserId, BillCancelledOn=@CancelledOn where ImagingRequisitionId=@RequisitionId
		END	

		COMMIT;

	END TRY

	BEGIN CATCH
		ROLLBACK;
	END CATCH

END
GO

--ANish: End: 12 Aug, 2020--------------

--ANish: Start: Separate Ststus of cancellation for Lab and Radiology Items in parameter 16 Aug, 2020--------------
UPDATE CORE_CFG_Parameters SET ParameterValue='{"Enable":true,"LabItemsInBilling":["active","pending"],"LabItemsInNursing":["active","pending"],"LabItemsInEmergency":["active","pending"],"ImagingItemsInBilling":["active"],"ImagingItemsInNursing":["active"],"ImagingItemsInEmergency":["active"],"LabItemsInLab":["active","pending"],"ImagingItemsInRadiology":["active"]}'
WHERE LOWER(ParameterGroupName)='common' and ParameterName='CancellationRules';
GO
--ANish: End: Separate Ststus of cancellation for Lab and Radiology Items in parameter  16 Aug, 2020--------------

--Anish: Start 17 Aug parameter redefined to make Discharge condition for Diff Lab and Radiology Status---
Update CORE_CFG_Parameters
set ParameterValue='{"Check": true, "RestrictOnLabStatusArr":["active"],"RestrictOnRadiologyStatusArr":["active"]}'
where ParameterName='OrderStatusSettingB4Discharge' and ParameterGroupName='Billing'
GO
--Anish: Start 17 Aug---

---Start: Anjana: 18/08/2020 - Make separate parameter for checking Double entry of IP and OP --------
update CORE_CFG_Parameters
set ParameterName='OPBillRequestDoubleEntryWarningTimeHrs'
where ParameterName='BillRequestDoubleEntryWarningTimeHrs' and ParameterGroupName='Billing'
GO
    ---sud: 9Sept'20--Added IF Exists clause since it was already ran in CMH-- 
IF NOT EXISTS(Select * From CORE_CFG_Parameters where ParameterName='IPBillRequestDoubleEntryWarningTimeHrs' and ParameterGroupName='Billing')
BEGIN
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType, Description,ParameterType,ValueLookUpList)
values('Billing','IPBillRequestDoubleEntryWarningTimeHrs','0','number','Double Entry Soft Restrictions/warning in IP Bill Request Page. if Same item is being entered twice in current invoice or within Given time.if value is (Zero or Null or Not Found) then Dont compare with Past Tests','custom',null);
END
Go

---End: Anjana: 18/08/2020 - Make separate parameter for checking Double entry of IP and OP --------

---Anish:Start 19 Aug, 2020-----
Update RBAC_RouteConfig set IsActive=1 where UrlFullPath='Billing/BillCancellationRequest'
GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Anish Bhattarai>
-- Create date: <18 August>
-- Description:	<Get all the Provisional Items List>
-- =============================================
CREATE PROCEDURE [dbo].[SP_Inpatient_Provisional_Items_List] (
	@FromDate DATETIME = NULL,
    @ToDate DATETIME = NULL	
) 
AS
BEGIN
	SELECT pat.ShortName,pat.Age,pat.Gender,pat.DateOfBirth,pat.PatientCode,srv.IntegrationName,item.* FROM BIL_TXN_BillingTransactionItems item
	JOIN PAT_Patient pat on pat.PatientId=item.PatientId
	LEFT JOIN BIL_MST_ServiceDepartment srv on srv.ServiceDepartmentId=item.ServiceDepartmentId
	WHERE LOWER(VisitType)='inpatient' and LOWER(BillStatus)='provisional'
	ORDER BY item.RequisitionDate desc
END
GO
---Anish:End 20 Aug, 2020-----

------END: Rusha: 26th August'20, merged Beta to DEV branch--------------- 

---START: Rusha: 26th August'20, merged accounting to DEV-----------

-- START: VIKAS: 06th Aug 2020 - Get all transactions dates from all section which is not synced.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-----------------------------------------------------------
	
	CREATE PROCEDURE [dbo].[SP_ACC_GetTransactionDates]
		@FromDate DATETIME = null ,
		@ToDate DATETIME = null,
		@HospitalId INT = null,
		@SectionId INT = null
	AS
	/************************************************************************
	FileName: [SP_ACC_GetTransactionDates]
	CreatedBy/date: 
	Description: Get section wise all transactions date which is not synced with accounting
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1.      
	*************************************************************************/
	BEGIN
		-- check rules are mapped or not with transaction types
		DECLARE @Rules TABLE (GroupMappingId INT, Description varchar(200),TransferRuleId INT)
		Insert into @Rules(GroupMappingId, Description, TransferRuleId)
		select [GroupMappingId], [Description],[TransferRuleId]
		from (select gm.GroupMappingId,gm.Description,TransferRuleId from ACC_MST_GroupMapping gm
		join ACC_MST_MappingDetail mp on gm.GroupMappingId = mp.GroupMappingId
		join ACC_MST_Hospital_TransferRules_Mapping r on mp.GroupMappingId = r.TransferRuleId
		group by gm.GroupMappingId ,gm.Description,TransferRuleId) x
		
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @HospitalId IS NOT NULL AND @SectionId IS NOT NULL) 
		BEGIN
			IF(@SectionId=1) -- Inventory 
			BEGIN
			  --Table1: GoodReceipt
				SELECT CONVERT(DATE, gr.GoodsReceiptDate)  as 'TransactionDate',
					       CONVERT(DATE, gr.CreatedOn)  as 'Date'
					FROM INV_TXN_GoodsReceipt gr 
						join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId					
					WHERE (gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
						AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))				
						AND ((select count([Description]) from @Rules where [Description]='INVCashGoodReceiptFixedAsset1' 
								or [Description]='INVCashGoodReceipt1' or [Description]='INVCreditGoodReceiptFixedAsset' or [Description]='INVCreditGoodReceipt') > 0)
				                            
				UNION
					--Table2: WriteOffItems
					SELECT CONVERT(DATE, wr.WriteOffDate) as 'TransactionDate',
					  CONVERT(DATE, wr.CreatedOn)  as 'Date'
					FROM INV_TXN_WriteOffItems wr
					WHERE (IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVWriteOff') > 0)
				UNION
					--Table3: ReturnToVendor
					SELECT CONVERT(DATE,rv.CreatedOn) as 'TransactionDate',
					  CONVERT(DATE, rv.CreatedOn)  as 'Date'
					FROM INV_TXN_ReturnToVendorItems rv 
					WHERE (rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
						AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
						AND ((select count([Description]) from @Rules where [Description]='INVReturnToVendorCashGR' OR [Description]='INVReturnToVendorCreditGR') > 0)
				UNION
					--Table4: DispatchToDept
					SELECT
						CONVERT(DATE,st.CreatedOn) as 'TransactionDate',
						CONVERT(DATE, st.CreatedOn)  as 'Date'	
					FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
					WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
					AND (CONVERT(DATE, st.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVDispatchToDept') > 0)
				UNION
					-- Table 5 :INVDeptConsumedGoods
					SELECT CONVERT(DATE,csm.ConsumptionDate) as 'TransactionDate',
					   CONVERT(DATE, csm.CreatedOn)  as 'Date'
					FROM WARD_INV_Consumption csm
					WHERE (csm.IsTransferToAcc IS NULL OR csm.IsTransferToAcc=0)  
						AND CONVERT(DATE, csm.CreatedOn) BETWEEN   CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate)
						AND ((select count([Description]) from @Rules where [Description]='INVDeptConsumedGoods') > 0)
			END
			---------------- 
			IF(@SectionId=2) -- Billing 
			BEGIN
				IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
					BEGIN
  
					SELECT 
					CONVERT(date, TransactionDate) as 'TransactionDate',CONVERT(DATE, TransactionDate)  as 'Date'
					from BIL_SYNC_BillingAccounting 
					WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
					END
					ELSE
					BEGIN 
					------Cash Bill-------
								Select CONVERT(date, itm.PaidDate) as 'TransactionDate',CONVERT(DATE, itm.PaidDate)  as 'Date'  
								from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
								Where txn.BillingTransactionId = itm.BillingTransactionId
									AND Convert(Date,itm.PaidDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
									and itm.BillingTransactionId IS NOT NULL
									and ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')
									AND ISNULL(itm.IsCashBillSync,0) = 0  
							UNION 
			
				------Credit Bill-----
							Select CONVERT(date, itm.CreatedOn) as 'TransactionDate',CONVERT(DATE, itm.CreatedOn)  as 'Date'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
							Where txn.BillingTransactionId = itm.BillingTransactionId
								AND Convert(Date,itm.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
								and itm.BillingTransactionId IS NOT NULL
								and txn.PaymentMode='credit'
								AND ISNULL(itm.IsCreditBillSync,0) = 0  
							UNION 
			
				------Cash Bill Return--
							Select	CONVERT(date, ret.CreatedOn) as 'TransactionDate',CONVERT(DATE, ret.CreatedOn)  as 'Date'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
							Where txn.BillingTransactionId = itm.BillingTransactionId
								and ret.BillingTransactionId=txn.BillingTransactionId
								and Convert(Date,ret.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
								and ISNULL(itm.ReturnStatus,0) != 0  
								and itm.BillingTransactionId IS NOT NULL
								and  ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque') 
								AND ISNULL(itm.IsCashBillReturnSync,0) = 0  
							UNION 
			
				------CreditBillReturn--- 
							Select CONVERT(date, ret.CreatedOn) as 'TransactionDate',CONVERT(DATE, ret.CreatedOn)  as 'Date'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
							Where txn.BillingTransactionId = itm.BillingTransactionId
								and ret.BillingTransactionId=txn.BillingTransactionId
								and Convert(Date,ret.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
								and ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
								and itm.BillingTransactionId IS NOT NULL
								and txn.PaymentMode='credit'
								AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  
								UNION 
			
				------Deposit Add---
							Select	CONVERT(date, CreatedOn) as 'TransactionDate',CONVERT(DATE, CreatedOn)  as 'Date'
							from BIL_TXN_Deposit
							Where Convert(Date,CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							and DepositType ='Deposit'AND ISNULL(IsDepositSync,0) = 0 
							UNION 
			
				-------Deposit Return/Deduct---
							Select	CONVERT(date, CreatedOn) as 'TransactionDate',CONVERT(DATE, CreatedOn)  as 'Date'
							from BIL_TXN_Deposit
							Where Convert(Date,CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND DepositType IN ('ReturnDeposit', 'depositdeduct') AND ISNULL(IsDepositSync,0) = 0  		
			
				END
			END
			---------------- 
			IF(@SectionId=3) -- Pharmacy 			
			BEGIN
				--Table1: CashInvoice
					SELECT 
					CONVERT(date, inv.CreateOn) as 'TransactionDate',
					CONVERT(DATE, inv.CreateOn)  as 'Date'
						from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL  AND CONVERT(date, inv.CreateOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
				UNION
				--Table3: CashInvoiceReturn
					SELECT 
					CONVERT(date, invRet.CreatedOn) as 'TransactionDate',
					CONVERT(DATE, invRet.CreatedOn)  as 'Date'
					from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)  
				UNION
				--Table4: goodsReceipt
					select 
					CONVERT(date, gr.CreatedOn) as 'TransactionDate',
					CONVERT(DATE, gr.CreatedOn)  as 'Date'
					from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0  AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
				UNION
				--Table5: writeoff
				select CONVERT(date, wrOff.CreatedOn) as 'TransactionDate',
					CONVERT(DATE, wrOff.CreatedOn)  as 'Date'
					from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
 
				UNION
				--Table6: dispatchToDept && dispatchToDeptRet
				select 
					CONVERT(date, stkItm.CreatedOn) as 'TransactionDate',
					CONVERT(DATE, stkItm.CreatedOn)  as 'Date'
				from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL AND stkItm.TransactionType='wardsupply' AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
			END
			---------------- 
			IF(@SectionId=5) -- Incetives 
			BEGIN
				select 
				CONVERT(date, inc.TransactionDate) as 'TransactionDate',CONVERT(DATE, inc.TransactionDate)  as 'Date'
				from INCTV_TXN_IncentiveFractionItem inc 
				Where CONVERT(date, inc.TransactionDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
				AND ISNULL(IsTransferToAcc,0) = 0
				Group by CONVERT(date, TransactionDate)
			END
			----------------
  		END			
	END

	
GO
-- END: VIKAS: 06th Aug 2020 - Get all transactions dates from all section which is not synced.
-- START: VIKAS: 17th Aug 2020 - Added ACC_Transaction_History table.
IF OBJECT_ID(N'dbo.ACC_Transaction_History', N'U') IS NULL
BEGIN
	CREATE TABLE  [dbo].[ACC_Transaction_History](
	  [Id] [int] IDENTITY(1,1) NOT NULL,
	  [TransactionDate] [datetime] NULL,
	  [SyncedOn] [datetime] NULL,
	  [SyncedBy] [int] NULL,
	  [SectionId] [int] NULL,
	  [TransactionType] [varchar] (100) Null,
	 CONSTRAINT [PK_ACC_Transaction_History] PRIMARY KEY CLUSTERED 
	(
	  [Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

END
Go
-- END: VIKAS: 17th Aug 2020 - Added ACC_Transaction_History table.

---END: Rusha: 26th August20, merged accounting to DEV-------

----------------Rusha: 17th Sept 2020: Merged Beta 1.46 to DEV branch--------------

---Anish: 8 Sept, 2020: Start: Permissions for all imaging type----
Alter Table RBAC_Application
Alter Column ApplicationCode Varchar(20)
GO 

Insert into RBAC_Application(ApplicationCode, ApplicationName,IsActive,CreatedBy,CreatedOn)
Values('RAD-IMG-TYPE','Radiology Imaging Types',1,1,GETDATE())
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationCode='RAD-IMG-TYPE');
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
SELECT 'Radiology-' + REPLACE(ImagingTypeName,' ','-') + '-selection-Category',@ApplicationId,1,GETDATE(),1 from RAD_MST_ImagingType where IsActive=1;
GO
---Anish: 8 Sept, 2020: END: Permissions for all imaging type----

-----Start:Anjana:11/9/2020: Permissions for Inventory Module----------
---Inventory Settings permissions----
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'Inventory' and ApplicationCode = 'INV');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) 
values ('inventory-settings-accounthead-view', @ApplicationId, 1, GETDATE(), 1),
	   ('inventory-settings-terms-view', @ApplicationId, 1, GETDATE(), 1),
	   ('inventory-settings-invoiceheader-view', @ApplicationId, 1, GETDATE(), 1),
	   ('inventory-settings-currency-view', @ApplicationId, 1, GETDATE(), 1);
GO

declare @permissionId INT, @RefParentRouteId INT
SELECT @permissionId = PermissionId From RBAC_Permission where PermissionName = 'inventory-settings-accounthead-view'
SELECT @RefParentRouteId = RouteId From RBAC_RouteConfig where UrlFullPath = 'Inventory/Settings'

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values ('Account Head', 'Inventory/Settings/AccountHeadList', 'AccountHeadList', @permissionId, @RefParentRouteId, 1, NULL, 1)

SELECT @permissionId = PermissionId From RBAC_Permission where PermissionName = 'inventory-settings-terms-view'
SELECT @RefParentRouteId = RouteId From RBAC_RouteConfig where UrlFullPath = 'Inventory/Settings'

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values ('Terms', 'Inventory/Settings/TermsList', 'TermsList', @permissionId, @RefParentRouteId, 1, NULL, 1)

SELECT @permissionId = PermissionId From RBAC_Permission where PermissionName = 'inventory-settings-invoiceheader-view'
SELECT @RefParentRouteId = RouteId From RBAC_RouteConfig where UrlFullPath = 'Inventory/Settings'

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values ('Invoice Headers', 'Inventory/Settings/InvoiceHeaders', 'InvoiceHeaders', @permissionId, @RefParentRouteId, 1, NULL, 1)

SELECT @permissionId = PermissionId From RBAC_Permission where PermissionName = 'inventory-settings-currency-view'
SELECT @RefParentRouteId = RouteId From RBAC_RouteConfig where UrlFullPath = 'Inventory/Settings'

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values ('Currency', 'Inventory/Settings/CurrencyList', 'CurrencyList', @permissionId, @RefParentRouteId, 1, NULL, 1)
GO

---Inventory Internal permissions----
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'Inventory' and ApplicationCode = 'INV');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('inventory-internalmain-writeoff-itemlist-view', @ApplicationId,
1, GETDATE(), 1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig
where UrlFullPath='Inventory/InternalMain');

declare @PermissionID INT
SET @PermissionID = (Select TOP(1) PermissionId from RBAC_Permission 
where PermissionName ='inventory-internalmain-writeoff-itemlist-view');

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink,
PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values('Write Off Items List', 'Inventory/InventoryMain/WriteOffItemsList', 'WriteOffItemsList', @PermissionId, @RefParentRouteId,1,NULL,1);
GO


---Inventory Procurement permissions----
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'Inventory' and ApplicationCode = 'INV');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) 
values ('inventory-procurement-purchaserequest-view', @ApplicationId, 1, GETDATE(), 1),
	   ('inventory-procurement-requestforquotation-view', @ApplicationId, 1, GETDATE(), 1),
	   ('inventory-procurement-returnitem-view', @ApplicationId, 1, GETDATE(), 1),
	   ('inventory-procurement-itemlist-view', @ApplicationId, 1, GETDATE(), 1);
GO

declare @permissionId INT, @RefParentRouteId INT
SELECT @permissionId = PermissionId From RBAC_Permission where PermissionName = 'inventory-procurement-purchaserequest-view'
SELECT @RefParentRouteId = RouteId From RBAC_RouteConfig where UrlFullPath = 'Inventory/ProcurementMain' 

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values ('Purchase Request', 'Inventory/ProcurementMain/PurchaseRequest', 'PurchaseRequest', @permissionId, @RefParentRouteId, 1, NULL, 1)

SELECT @permissionId = PermissionId From RBAC_Permission where PermissionName = 'inventory-procurement-requestforquotation-view'
SELECT @RefParentRouteId = RouteId From RBAC_RouteConfig where UrlFullPath = 'Inventory/ProcurementMain'

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values ('Request For Quotation(RFQ)', 'Inventory/ProcurementMain/RequestForQuotation', 'RequestForQuotation', @permissionId, @RefParentRouteId, 1, NULL, 1)

SELECT @permissionId = PermissionId From RBAC_Permission where PermissionName = 'inventory-procurement-returnitem-view'
SELECT @RefParentRouteId = RouteId From RBAC_RouteConfig where UrlFullPath = 'Inventory/ProcurementMain'

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values ('Return Items', 'Inventory/ProcurementMain/ReturnToVendorItems', 'ReturnToVendorItems', @permissionId, @RefParentRouteId, 1, NULL, 1)

SELECT @permissionId = PermissionId From RBAC_Permission where PermissionName = 'inventory-procurement-itemlist-view'
SELECT @RefParentRouteId = RouteId From RBAC_RouteConfig where UrlFullPath = 'Inventory/ProcurementMain'

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values ('Return Items List', 'Inventory/ProcurementMain/ReturnToVendorListItems', 'ReturnToVendorListItems', @permissionId, @RefParentRouteId, 1, NULL, 1)
GO

-----End:Anjana:11/9/2020: Permissions for Inventory Module----------

------Start:Anjana: 9/14/2020: Add Permission for Settings/DynamicTemplates-------
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'Settings' and ApplicationCode = 'SETT');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('settings-dynamic-templates-view', @ApplicationId,
1, GETDATE(), 1);
GO

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig
where UrlFullPath='Settings');

declare @PermissionID INT
SET @PermissionID = (Select TOP(1) PermissionId from RBAC_Permission 
where PermissionName ='settings-dynamic-templates-view');

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink,
PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive)
values('Dynamic Templates', 'Settings/DynamicTemplates', 'DynamicTemplates', @PermissionId, @RefParentRouteId,1,NULL,1);
GO
------End:Anjana: 9/14/2020: Add Permission for Settings/DynamicTemplates-------

----------------Rusha: 17th Sept 2020: Merged Beta 1.46 to DEV branch--------------





