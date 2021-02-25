 ----- START: 6 June 2019 Vikas: Create new PHRM_Dispensary Table -----
CREATE TABLE [dbo].[PHRM_DispensaryStock](
	[StockId] [int] IDENTITY(1,1) NOT NULL,
	[DispensaryId] [int] NOT NULL,
	[ItemId] [int] NULL,
	[AvailableQuantity] [float] NULL,
	[MRP] [decimal](18, 4) NULL,
	[Price] [decimal](18, 4) NULL,
	[ExpiryDate] [datetime] NULL,
	[BatchNo] [varchar](50) NULL,
 CONSTRAINT [PK_PHRM_DispensaryStock] PRIMARY KEY CLUSTERED 
(
	[StockId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
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
		WHERE BatchNo  like '%'+ISNULL(@ItemName,'')+'%'  
		GROUP BY stk.ItemId,stk.BatchNo,itm.ItemName, stk.MRP, gen.GenericName,stk.ExpiryDate,stk.AvailableQuantity  
	 END
END

--End: Rusha:  11th April'19,Modify Batch report of Pharmacy report---

----Start: Shankar: 11th April'19, Modify pharmacy store stock procedure and added columns in PHRM_StoreStock table----

--Update SP report of Pharmacy's store stock
/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]    Script Date: 4/9/2019 12:49:31 PM ******/
SET ANSI_NULLS ON
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
----------------------------------------------------------------------------
*/
Begin 
IF (@ItemName IS NOT NULL)
	BEGIN
	Select (Cast(ROW_NUMBER() OVER (ORDER BY  x.ItemName)  as int)) as SN, 
	x.ItemId, x.BatchNo, x.ItemName, x.ExpiryDate, x.MRP, x.GenericName,
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
				where  t1.ExpiryDate <= DATEADD(MONTH, 3, GETDATE()) AND t1.AvailableQuantity>0
				 group by t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName,t1.AvailableQuantity
			)x 
	END
	END
Go
----- END: 7th June 2019: Alter store procedure


---Start: Rusha: June 13, 2019---update script of pharmacy report (dispensary/store-stock report) and store stock details
/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]   Script Date: 06/11/2019 2:46:04 PM ******/
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
----------------------------------------------------------------------------
*/
BEGIN
	IF(@Status IS NOT NULL)
		BEGIN
				SELECT  x1.ItemName,x1.BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
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

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_DispensaryStoreStockReport]   Script Date: 06/11/2019 10:40:03 AM ******/
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
--------------------------------------------------------
*/

	BEGIN
		IF (@Status = 'dispensary')	 
				SELECT convert(date,stk.CreatedOn) AS [Date],stk.ItemName,dis.BatchNo AS DispensaryBatchNo, dis.ExpiryDate, dis.MRP,
				dis.AvailableQuantity AS StockQty
				FROM PHRM_DispensaryStock AS dis 
				JOIN PHRM_StoreStock AS stk ON dis.ItemId = stk.ItemId
				WHERE stk.TransactionType = 'Transfer To Dispensary'

		ELSE IF (@Status = 'store')
				SELECT  x1.ItemName,x1.StoreBatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
				SUM(InQty- OutQty+FInQty-FOutQty) AS 'StockQty'
				FROM(SELECT stk.ItemName, stk.BatchNo as StoreBatchNo, stk.ExpiryDate, stk.MRP,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				GROUP BY stk.ItemName, stk.BatchNo , stk.ExpiryDate, stk.MRP)as x1
				GROUP BY x1.ItemName, x1.StoreBatchNo, x1.ExpiryDate, x1.MRP

			ELSE IF(@Status = 'all')

				SELECT a.ItemName,a.DispensaryBatchNo,a.StoreBatchNo,a.ExpiryDate,
				SUM(SFInQty+SInQty-SOutQty-SFOutQty+DQTY) 'StockQty',a.MRP
				FROM
				(SELECT dis.itemID,stk.ItemName,dis.ExpiryDate,dis.BatchNo as DispensaryBatchNo,stk.BatchNo as StoreBatchNo,dis.MRP,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'SInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'SOutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'SFInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'SFOutQty',
					dis.AvailableQuantity AS DQTY 
					FROM PHRM_DispensaryStock AS dis
			        JOIN PHRM_StoreStock AS stk ON dis.ItemId=stk.ItemId
					GROUP BY dis.ItemId,stk.ItemName,dis.ExpiryDate,dis.BatchNo,dis.MRP,stk.BatchNo,dis.AvailableQuantity) AS a
				    GROUP BY a.ItemName,a.DispensaryBatchNo,a.StoreBatchNo, a.ExpiryDate, a.MRP
	 END
GO
---End: Rusha: June 13, 2019---update script of pharmacy report (dispensary/store-stock report) and store stock details
 ----- START: 30 June 2019 Abhishek: Migration and optimization of pharmacy -----

update PHRM_StockTxnItems set Price=good.GRItemPrice from PHRM_StockTxnItems as stock
join PHRM_GoodsReceiptItems as good on stock.BatchNo= good.BatchNo and stock.ItemId=good.ItemId
join PHRM_GoodsReceipt as goodre on goodre.GoodReceiptId= good.GoodReceiptId
where (stock.Price=0 or stock.Price is null) and goodre.IsCancel!=1
go
update PHRM_StockTxnItems set Price= MRP where Price=0  
update PHRM_StockTxnItems set ExpiryDate=good.ExpiryDate from PHRM_StockTxnItems as stock
join PHRM_GoodsReceiptItems as good on stock.BatchNo= good.BatchNo and stock.ItemId=good.ItemId
join PHRM_GoodsReceipt as goodre on goodre.GoodReceiptId= good.GoodReceiptId
where stock.ExpiryDate is null and goodre.IsCancel!=1
go

delete from PHRM_StockTxnItems where ExpiryDate is null
go

update PHRM_StockTxnItems set MRP=good.MRP from PHRM_StockTxnItems as stock
join PHRM_GoodsReceiptItems as good on stock.BatchNo= good.BatchNo and stock.ItemId=good.ItemId
join PHRM_GoodsReceipt as goodre on goodre.GoodReceiptId= good.GoodReceiptId
where stock.MRP =0 and goodre.IsCancel!=1
go
update PHRM_StockTxnItems set FreeQuantity=0 where FreeQuantity is null
go

declare @StockAll Table(ItemId int,BatchNo nvarchar(50), ItemName varchar(70), GenericName varchar(70),ExpiryDate varchar(70),
MRP varchar(50), Price varchar(50))

insert into @StockAll
select stock.ItemId, stock.BatchNo,stock.ItemName,stock.GenericName,stock.ExpiryDate,stock.MRP, stock.Price from
 (

      select t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,
	  LAST_VALUE(t1.MRP) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId ) 'MRP',
	  FIRST_VALUE(t1.Price) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId) 'Price',
	SUM(Case when InOut ='in' then FreeQuantity else 0 end ) as 'FreeInQty',
        SUM(Case When InOut = 'out' then FreeQuantity ELSE 0 END) AS 'FreeOutQty',
        SUM(Case when InOut ='in' then Quantity else 0 end ) as 'InQty',
        SUM(Case When InOut = 'out' then Quantity ELSE 0 END) AS 'OutQty'
        from 
		[dbo].[PHRM_StockTxnItems] t1
          inner join [dbo].[PHRM_MST_Item] item on item.ItemId = t1.ItemId
          inner join [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
		  
          group by t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,MRP,Price
		  ) stock
		  
		group by stock.ItemId,stock.ItemName,stock.BatchNo,stock.GenericName,stock.ExpiryDate,stock.MRP, stock.Price



update PHRM_StockTxnItems 
set 
PHRM_StockTxnItems.ExpiryDate = stock.ExpiryDate, PHRM_StockTxnItems.MRP=stock.MRP, PHRM_StockTxnItems.Price=stock.Price
from 
@StockAll stock
where PHRM_StockTxnItems.BatchNo=stock.BatchNo and PHRM_StockTxnItems.ItemId=stock.ItemId

alter table phrm_stock
add Price float
alter table [dbo].[PHRM_DispensaryStock]
		alter column DispensaryId int null
		go

insert into PHRM_DispensaryStock (ItemId, BatchNo, ExpiryDate,Price,MRP,AvailableQuantity)
select itemid,BatchNo,ExpiryDate, Price, MRP, 
		 SUM(Case when InOut ='in' then FreeQuantity else 0 end )-
        SUM(Case When InOut = 'out' then FreeQuantity ELSE 0 END) +
        SUM(Case when InOut ='in' then Quantity else 0 end ) -
        SUM(Case When InOut = 'out' then Quantity ELSE 0 END) as 'AvailableQuantity'
		
		from PHRM_StockTxnItems
		
		 group by itemid,BatchNo, Price, MRP, ExpiryDate order by ItemId
		 go
 ----- End: 30 June 2019 Abhishek: Migration and optimization of pharmacy -----