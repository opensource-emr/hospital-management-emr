----change DatabaseName(s)  as per your current database---
--- find: DanpheAdmin  and DanpheEMR ---
--Use DanpheEMR
GO
--START:23 July 2018 : Stored procedure for Discharge bill breakup report----


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[SP_Report_BIL_DischargeBreakup] 
@PatientVisitId int=null 
AS
/*
FileName: [SP_Report_BIL_DischargeBreakup]
CreatedBy/date: Nagesh/2018-07-21
Description: Get billing details for discharge bill breakup for patient by visit id
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       Nagesh/2018-07-21					Created need finalize for some improvements later
-------------------------------------------------------------------------------
*/

BEGIN
BEGIN 
;With BilDischargeCTE as
  (
 select bti.BillingTransactionItemId,dept.DepartmentName, 
bti.ServiceDepartmentName,
bti.PaidDate as billDate, 
bti.ItemName as [description],
bti.Quantity as qty,bti.subtotal as amount,
bti.DiscountAmount as discount,
bti.TaxableAmount as subTotal,
bti.Tax as vat,bti.TotalAmount as total
 from BIL_TXN_BillingTransactionItems bti
 join BIL_MST_ServiceDepartment sdept
 on sdept.ServiceDepartmentId=bti.ServiceDepartmentId
 join MST_Department dept
 on dept.DepartmentId=sdept.DepartmentId
 where bti.PatientVisitId=@PatientVisitId
      
) select 
Case when [Description]='BED CHARGES' then 'BED'
 when [Description]='INDOOR-DOCTOR''S VISIT FEE (PER DAY)' then 'DOCTOR AND NURSING CARE'
 when ServiceDepartmentName='CONSUMEABLES' then 'CONSUMEABLES'
ELSE DepartmentName
END
AS departmentName,
billDate,[description],qty,amount,discount,subTotal,vat,total 
from BilDischargeCTE 
--where DepartmentName in ('ADMINISTRATION','OT','CONSUMEABLES','BED','DOCTOR AND NURSING CARE')
END	
END
Go


--END:23 July 2018 : Stored procedure for Discharge bill breakup report----

---start: Sud 25July2018: Changes for IRD and others---
GO
UPDATE BIL_CFG_BillItemPrice
set TaxApplicable=0 
GO

----create trigger to restrict bill alteration---
IF(OBJECT_ID('TRG_BillingTransaction_RestrictBillAlter') iS NOT NULL)
 DROP TRIGGER [dbo].[TRG_BillingTransaction_RestrictBillAlter]

 GO

-- =============================================
--- Created: Sud: 9May'18
--- Description: This trigger is made to block users from editing certain columns of the billing transaction table
-- Remarks: Needs revision..
-- =============================================
CREATE TRIGGER [dbo].[TRG_BillingTransaction_RestrictBillAlter]
       ON [dbo].[BIL_TXN_BillingTransaction]
   AFTER UPDATE, DELETE
AS 
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE @TotalAmount_Ins float, @TotalAmount_Del float

	---in case of update, there'll be rows in both inserted and deleted--
	IF EXISTS(Select 1 from INSERTED)
	BEGIN
	  IF NOT EXISTS(
	    SELECT 1 from INSERTED i, DELETED d
		where i.InvoiceNo = d.InvoiceNo 
		AND i.TotalQuantity = d.TotalQuantity 
		AND i.SubTotal = d.SubTotal 
		and i.DiscountPercent = d.DiscountPercent
		and i.DiscountAmount = d.DiscountAmount 
		and i.TaxTotal = d.TaxTotal 
		and i.TotalAmount = d.TotalAmount
		and i.DepositAmount = d.DepositAmount 
		and i.DepositReturnAmount = d.DepositReturnAmount
		and i.DepositBalance=d.DepositBalance 
		and i.Tender=d.Tender 
		and i.Change=d.Change 
		and i.CreatedBy=d.CreatedBy
		and i.PaymentMode=d.PaymentMode
	  )
	   RAISERROR('Cannot change the value', 16,1); 
	END
	ELSE ----it comes here when any row is deleted--
	   RAISERROR('Cannot delete a row', 16,1); 

	SET NOCOUNT OFF;

END
GO

ALTER TABLE [dbo].[BIL_TXN_BillingTransaction] ENABLE TRIGGER [TRG_BillingTransaction_RestrictBillAlter]
GO
---end: Sud 25July2018: Changes for IRD and others---

---START: NageshBB 25July2018: script for IRD Log details table creation and drop irdLocalsync table

--drop ird local sync table
IF (OBJECT_ID('IRD_Sync_Invoices_Common') IS NOT NULL)
  BEGIN
   drop table [IRD_Sync_Invoices_Common]
  END
  GO
  
 --create new log table for ird post log details
  Create Table dbo.IRD_Log(
	  LogId int identity(1,1) constraint PK_IRD_Log primary key,
	  JsonData varchar(max),
	  [Status] varchar(20),
	  ResponseMessage varchar(20),
	  BillType varchar(50),
	  UrlInfo varchar(100),
	  ErrorMessage varchar(max),
	  CreatedOn datetime
  )
  Go

  ---END: NageshBB 25July2018: script for IRD Log details table creation and drop irdLocalsync table

---Start: Abhishek/Sud: 25July-- Merging Pharmacy Db to Dev-Incremental---

---merged to dev on 16july'18-- add new changes afterwards---
--Start----Abhishek Dhakal-- july/23/18-- Changes on good receipt and goor receipt item tables--
alter table [dbo].[PHRM_GoodsReceipt]
add InvoiceNo varchar(50) null
go

alter table [dbo].[PHRM_GoodsReceiptItems]
add CounterId int null
GO
---End- Abhishek Dhakal-- july/23/18
--Start----Abhishek Dhakal-- july/25/18-- Changes on good receipt and goor receipt item tables--
alter table [PHRM_TXN_Invoice] 
add PrintCount INT null
GO
alter table [PHRM_TXN_Invoice]
add Adjustment int NULL
GO 
--there was a mistake---
alter table [PHRM_TXN_Invoice]
alter column  Adjustment decimal(10,2) NULL
GO
---To implement adjustment on purchase
alter table [PHRM_GoodsReceipt]
add Adjustment decimal(10,2) null
go
---End- Abhishek Dhakal-- july/25/18

---end: Abhishek/Sud: 25July-- Merging Pharmacy Db to Dev-Incremental---



---start: sud: 26July--billing Bug fixes for Item's sequence--
Alter Table BIL_CFG_BillItemPrice
Add DisplaySeq INT
GO

---add default sequence as 100--
update BIL_CFG_BillItemPrice
set DisplaySeq=100
GO
--display sequence 2 for all lab items--(need seq=1 for selected items so)--
update BIL_CFG_BillItemPrice
set DisplaySeq=2
where ServiceDepartmentId in 
(select ServiceDepartmentId from BIL_MST_ServiceDepartment
where IntegrationName='Lab')
GO

update BIL_CFG_BillItemPrice
set DisplaySeq=1 where ItemName='CT'
GO
---give lower display sequence for those which were not coming because of many matching items--
update BIL_CFG_BillItemPrice
set DisplaySeq=50 where ItemName='ECT' OR ItemName='PAC'
GO

---Correction in ServicedeptName Hematology in master and transaction--
Update BIL_MST_ServiceDepartment
set ServiceDepartmentName='HEMATOLOGY'
where ServiceDepartmentName='HEAMATOLOGY'
GO
update BIL_TXN_BillingTransactionItems
set ServiceDepartmentName='HEMATOLOGY'
where ServiceDepartmentName='HEAMATOLOGY'
GO
---end: sud: 26July--billing Bug fixes for Item's sequence--

---start: Mahesh 27July2018: Changes for store procdure on dashboarstatics to get today's and yestarday's registered patient---

ALTER PROCEDURE [dbo].[SP_DSB_Home_DashboardStatistics]
AS
/*
FileName: [SP_DSB_Home_DashboardStatistisc]
CreatedBy/date: sudarshan/2017-07-09
Description: to get dashboard statistics of the home dashboards. these are used to fill labels.
Remarks:  
NOTE:  
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       sudarshan/2017-07-09	               created
2       sudarshan/2017-07-14	               update
3.      sudarshan/2017-08-16                   update: added types inside appointmentcount.
--------------------------------------------------------
*/
BEGIN
	--Rules:-- 
	/*
	 1. Search Criteria is only 'today's OutPatient visits': VisitType='outpatient'  AND CONVERT(DATE,VisitDate)=CONVERT(DATE,GETDATE())
	 2. Total: today's all OPD counts
	 3. New: AppointmentType='new' 
	 4. Referral: AppointmentType='referral'
	 5. Followup = AppointmentType='followup' 
	 6.Cancelled: (AppointmentType='new' and BillingStatus='cancel')   (other than 'new') can't be cancelled since they're not seen in billing.
	 7.Returned : (AppointmentType='new' and BillingStatus='return') similar as canceled 
	*/
    SELECT * FROM 
    ( Select Count(*) 'TotalPatient' from PAT_Patient ) pat,
	( Select Count(*) 'TodayPatient' from PAT_Patient where CAST(CreatedOn AS DATE) = CAST(GETDATE() AS DATE) ) today_pat,
	( Select Count(*) 'YestardayPatient' from PAT_Patient where CAST(CreatedOn AS DATE) = dateadd(day,-1, cast(getdate() as date) )) yestarday_pat,


	( 
	   Select COUNT(*) 'TotalDoctors' from EMP_Employee e,
		MST_Department d where e.DepartmentId=d.DepartmentId
		and d.IsAppointmentApplicable=1
	 ) docs,
    (Select 
		SUM(1) 'TotalAppts',
		SUM( CASE WHEN AppointmentType='new' THEN 1 ELSE 0 END ) AS 'NewAppts',
		SUM( CASE WHEN AppointmentType='referral' THEN 1 ELSE 0 END ) AS 'ReferralAppts',
		SUM( CASE WHEN AppointmentType='followup' THEN 1 ELSE 0 END ) AS 'FollowUpAppts',
		SUM( CASE WHEN AppointmentType='new' and BillingStatus='cancel' THEN 1 ELSE 0 END ) AS 'CancelAppts',
		SUM( CASE WHEN AppointmentType='new' and BillingStatus='return' THEN 1 ELSE 0 END ) AS 'ReturnAppts'
		from PAT_PatientVisits where VisitType='outpatient' AND CONVERT(DATE,VisitDate)=CONVERT(DATE,GETDATE())
	) appt

END
----END-- 16Aug 2017 -- SUD/UMED---Helpdesk & Home Dashboard-------------------------------

--end: Mahesh 27July2018--
---start: Abhishek 28July2018: Column to track invoiceID starting from one---
alter table PHRM_TXN_Invoice
add InvoicePrintId int
go
---end: Abhishek 28July2018: Column to track invoiceID starting from one---

---Start: Abhishek 29July2018: Change datatypes and add a column MRP in [PHRM_TXN_InvoiceReturnItems]
alter table [dbo].[PHRM_StockTxnItems]
alter column Price decimal(18,4)
go
alter table [dbo].[PHRM_StockTxnItems]
alter column MRP decimal(18,4)
go

alter table [dbo].[PHRM_StockTxnItems]
alter column SubTotal decimal(18,4)
go
alter table [dbo].[PHRM_StockTxnItems]
alter column TotalAmount decimal(18,4)
go
alter table [dbo].[PHRM_TXN_InvoiceReturnItems]
add MRP decimal(16,4)
GO
---End: Abhishek 29July2018: Change datatypes and add a column MRP in [PHRM_TXN_InvoiceReturnItems]

----START: NageshBB: 30July2018: Create table and trigger for phrm_StockTxnItem mrp change history log
--create table script for maitain stoTxnItem MRP change history
Create Table PHRM_StockTxnItems_MRPHistory
(
PHRMStockTxnItemMRPHistoryId  int Identity(1,1) constraint PK_PHRM_StockTxnItems_MRPHistory Primary key,
PHRMStockTxnItemId int,
MRP decimal(18,4),
CreatedBy int,
StartDate datetime,
EndDate datetime
)
Go

--Trigger for maintain Phrm_StockTxnItems MRP History
CREATE TRIGGER TR_PHRM_StockTxnItems_MRPUpdateHistory
       ON PHRM_StockTxnItems
AFTER UPDATE
/*
FileName: [TR_PHRM_StockTxnItems_MRPUpdateHistory]
CreatedBy/date: NageshBB/201-07-29
Description: maintain pharmacy stock txn items table MRP change history after update
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       NageshBB/201-07-29	                   created the script
*/
AS
BEGIN
       SET NOCOUNT ON; 
       DECLARE @StartDate Datetime
	   Declare @EndDate DateTime
	   Declare @oldMRP decimal(18,4)
	   Declare @newMRP decimal(18,4)
	   Declare @StockTxnItemId int
	   Declare @CreatedBy int
        		        
       IF UPDATE(MRP)
       BEGIN
			Select @StartDate=INSERTED.CreatedOn from INSERTED 
			SELECT @EndDate=GETDATE()
			SELECT @oldMRP = DELETED.MRP FROM DELETED
			select @newMRP=inserted.MRP from inserted
			Select @StockTxnItemId= inserted.StockTxnItemId from inserted 
			select @CreatedBy=inserted.CreatedBy from inserted
	    if(@newMRP!=@oldMRP)
			begin              			 
				INSERT INTO PHRM_StockTxnItems_MRPHistory
				VALUES(@StockTxnItemId,@oldMRP,@CreatedBy,@StartDate,@EndDate)
			END
		END
 
END
Go


----END: NageshBB: 30July2018: Create table and trigger for phrm_StockTxnItem mrp change history log

---Start: Dinesh :31st July 2018: Changed the appointment router link to Phone BookAppointment,Sales DayBook SP changes 
update RBAC_RouteConfig
set DisplayName= 'Phone Book Appointment'
where RouterLink='CreateAppointment'
and DisplayName='Create Appointment'
and RouteId=33
GO
 update RBAC_RouteConfig
set DisplayName= 'Appointment Booking List'
where RouterLink='ListAppointment'
and DisplayName='List Appointment'
and RouteId=32
GO


/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DailySales]    Script Date: 7/31/2018 11:50:46 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] ---'2018-07-27','2018-07-27',null,null
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: to get the price, Tax, total,along with recipt number between given date input
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      sud/2018-07-26                      modified after HAMS Deployment (NEEDS REVISION)
-----------------------------------------------------------------------------------------
*/
BEGIN
	IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL) 
		BEGIN
		  
		  Select 
				   convert(varchar(20),dates.ReportDate) AS [Date],
				    txnInfo.InvoiceCode+ Convert(varchar(20),txnInfo.InvoiceNo) 'ReceiptNo', 
					pat.PatientCode as HospitalNo,
					pat.FirstName+ISNULL(' '+pat.MiddleName,'')+' '+ pat.LastName AS PatientName,
  					ISNULL(txn.SubTotal,0) as 'Price',
					ISNULL(txn.DiscountAmount,0) AS 'DiscountAmount', 
					ISNULL(bilRet.ReturnAmount,0) as 'ReturnedAmount',
					0 as 'AdvanceReceived',
					ISNULL(depRet.Amount,0) as 'AdvanceSettlement',
					ISNULL(txn.TaxTotal,0) as 'Tax',
					ISNULL(txn.TotalAmount,0)-ISNULL(depRet.Amount,0)-ISNULL(bilRet.ReturnAmount,0) AS 'TotalAmount',
					emp.FirstName+ISNULL(' '+emp.MiddleName,'')+' '+ emp.LastName AS CreatedBy,
					txnInfo.CounterId as 'CounterId',
					ISNULL(bilRet.ReturnedTax,0) as 'ReturnedTax'
			FROM

			 ( select Dates 'ReportDate' from [FN_COMMON_GetAllDatesBetweenRange] (ISNULL(@FromDate,GETDATE()),ISNULL(@ToDate,GETDATE())) )  dates

			 LEFT JOIN

			 (
					 --- These two tables works as an Anchor Table (LEFT Table) to join with other tables--
					 ---Need BillingTransactionId, CreatedBy, CounterID to be joined with all other Right side tables---
					 SELECT Convert(date, CreatedOn) 'TxnDate', BillingTransactionId, InvoiceCode, InvoiceNo,  PatientID , CreatedBy , CounterId
					  FROM BIL_TXN_BillingTransaction
					  WHERE Convert(date, CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())

					  UNION

					SELECT Distinct CONVERT(DATE,CreatedOn)as TxnDate, BillingTransactionId, InvoiceCode, RefInvoiceNum,  PatientId, CreatedBy, CounterId
					from BIL_TXN_InvoiceReturn r 
					 WHERE Convert(date, CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE()) and ISNULL(@ToDate,GETDATE())

			) txnInfo
			ON dates.ReportDate=txnInfo.TxnDate
			---Join with Patient and Employee Table to get their names etc---
			INNER JOIN
			PAT_Patient pat on txnInfo.PatientId=pat.PatientId
			INNER JOIN EMP_Employee emp on txnInfo.CreatedBy=emp.EmployeeId

			LEFT JOIN BIL_TXN_BillingTransaction txn
			   ON dates.ReportDate=Convert(date,txn.CreatedOn) AND txnInfo.BillingTransactionId = txn.BillingTransactionId
			   and txnInfo.CounterId = txn.CounterId AND txnInfo.CreatedBy=txn.CreatedBy

           LEFT OUTER JOIN
			(
			--- deposit deduct happens both from Transaction and settlement
			-- take only those from Transaction in this query..
			-- condition is: BillingTransaction Is NOT NULL--
			 select convert(date,CreatedOn) as DepositRetDate, Amount,
				    BillingTransactionId,CounterId, CreatedBy
			 From BIL_TXN_Deposit
              WHERE DepositType='depositdeduct' AND  BillingTransactionId IS NOT NULL 

			
			)depRet 
			  ON dates.ReportDate = depRet.DepositRetDate 
			  and txnInfo.BillingTransactionId=depRet.BillingTransactionId
			   AND txnInfo.CounterId = depRet.CounterId  
			   AND txnInfo.CreatedBy=depRet.CreatedBy
			LEFT JOIN
			(
				
			    ---Sud: 9May'18--our return table is now changed--
			  	 ---get only returned bills---
			    SELECT CONVERT(DATE,CreatedOn)as bilReturnDate, BillingTransactionId , RefInvoiceNum,
					  TotalAmount 'ReturnAmount', 
					  TaxTotal as 'ReturnedTax',
						 CounterId , CreatedBy
			   from BIL_TXN_InvoiceReturn r 

			)bilRet
			 ON dates.ReportDate=bilret.bilReturnDate 
			   and txnInfo.BillingTransactionId=bilRet.BillingTransactionId
			   and txnInfo.CounterId=bilRet.CounterId
				 AND txnInfo.CreatedBy=bilRet.CreatedBy
            WHERE dates.ReportDate BETWEEN  ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1   
                AND		(txnInfo.CounterId like '%'+ISNULL(@CounterId,txnInfo.CounterId)+'%') 
				AND		(emp.FirstName+ISNULL(' '+emp.MiddleName,'')+' '+ emp.LastName like '%'+ISNULL(@CreatedBy,emp.FirstName+ISNULL(' '+emp.MiddleName,'')+' '+ emp.LastName)+'%')

			UNION ALL

		   Select   Convert(Date,deposits.DepositDate) 'DepositDate',
				   deposits.ReceiptNo 'ReceiptNo',
				   pat.PatientCode 'HospitalNo',
				   pat.FirstName+ISNULL(' '+pat.MiddleName,'')+' '+ pat.LastName AS PatientName,
				   0 'Price',
				   0 'DiscountAmount',
				   0 'ReturnedAmount',
				   deposits.AdvanceReceived 'AdvanceReceived',
				   deposits.AdvancedSettled 'AdvancedSettled',
				   0 'Tax',
				   deposits.TotalAmount  'TotalAmount',
				   emp.FirstName+ISNULL(' '+emp.MiddleName,'')+' '+ emp.LastName AS CreatedBy,
				   deposits.CounterId 'CounterId',
				   0 'ReturnedTax'
		   FROM 
			  (
			  Select Convert(Date,CreatedOn) 'DepositDate',
				   'DR'+Convert(varchar(20),ReceiptNo) 'ReceiptNo',
				   PatientId,
				   CASE WHEN DepositType='Deposit' THEN Amount ELSE 0 END AS 'AdvanceReceived',
				   CASE WHEN DepositType='ReturnDeposit' THEN Amount ELSE 0 END AS 'AdvancedSettled',
				   CASE WHEN DepositType='Deposit' THEN Amount 
						WHEN DepositType='ReturnDeposit' THEN -Amount ELSE 0 END AS  'TotalAmount',
				   CreatedBy  'CreatedBy',
				   CounterId 'CounterId'
			from BIL_TXN_Deposit
			WHERE ReceiptNo IS NOT NULL AND (DepositType='DEPOSIT' OR DepositType='ReturnDeposit')
			   
			UNION ALL
			Select Convert(Date,CreatedOn) 'DepositDate',
				   'SR'+Convert(varchar(20),SettlementId) 'ReceiptNo',
				   PatientId,
				   0 AS 'AdvanceReceived',
				   Amount AS 'AdvancedSettled',
				   -Amount AS 'TotalAmount',
				   CreatedBy  'CreatedBy',
				   CounterId 'CounterId'
			from BIL_TXN_Deposit
			WHERE  DepositType='depositdeduct' AND  SettlementId IS NOT NULL 
			) deposits, EMP_Employee emp, PAT_Patient pat, BIL_CFG_Counter cntr
		WHERE deposits.PatientId =  pat.PatientId
		AND emp.EmployeeId=deposits.CreatedBy
		AND deposits.CounterId =  cntr.CounterId
		AND deposits.DepositDate  BETWEEN  ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE()) 
		 AND (deposits.CounterId like '%'+ISNULL(@CounterId,deposits.CounterId)+'%') 
	     AND (emp.FirstName+ISNULL(' '+emp.MiddleName,'')+' '+ emp.LastName like '%'+ISNULL(@CreatedBy,emp.FirstName+ISNULL(' '+emp.MiddleName,'')+' '+ emp.LastName)+'%')


		END
END
GO
---END: Dinesh :31st July 2018: Changed the appointment router link to Phone BookAppointment,Sales DayBook SP changes 

--Start: Anish: 31 July 2018--

UPDATE [dbo].[BIL_MST_ServiceDepartment] SET IntegrationName='Radiology' WHERE ServiceDepartmentName='BMD-BONEDENSITOMETRY';
UPDATE [dbo].[BIL_MST_ServiceDepartment] SET IntegrationName='Radiology' WHERE ServiceDepartmentName='OPG-ORTHOPANTOGRAM';
Go

UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'C.T. SCAN' WHERE ImagingTypeName = 'CT Scan'
UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'ULTRASOUND' WHERE ImagingTypeName = 'USG'
UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'X-RAY' WHERE ImagingTypeName = 'X-Ray'
UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'MRI' WHERE ImagingTypeName = 'MRI'
UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'ULTRASOUND COLOR DOPPLER' WHERE ImagingTypeName = 'USG Color Doppler'
UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'BMD-BONEDENSITOMETRY' WHERE ImagingTypeName = 'BMD'
UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'OPG-ORTHOPANTOGRAM' WHERE ImagingTypeName = 'OPG'
UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'MAMMOGRAPHY' WHERE ImagingTypeName = 'Mamography'
UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'DUCT' WHERE ImagingTypeName = 'Duct'
UPDATE [dbo].[RAD_MST_ImagingType] SET ImagingTypeName = 'PERFORMANCE TEST' WHERE ImagingTypeName = 'Performance Test'
--End: Anish: 31 July 2018--


---START: 31July2018 NageshBB/Vikash : created script for pharmacy userwise collection--
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE SP_PHRM_UserwiseCollectionReport 
@FromDate datetime=null,
 @ToDate datetime=null
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
1      Nagesh/Vikas/2018-07-31	                     created the script

--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
					SELECT convert(date,inv.CreateOn) as [Date] ,usr.UserName,sum(inv.PaidAmount)as TotalAmount,sum(inv.DiscountAmount) as DiscountAmount
					  FROM [PHRM_TXN_Invoice] inv
							INNER JOIN RBAC_User usr
						 on inv.CreatedBy=usr.EmployeeId					
							where  convert(datetime, inv.CreateOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 
							group by convert(date,inv.createon),UserName
			End
End

Go

---END: 31July2018 NageshBB/Vikash : created script for pharmacy userwise collection--
---Start:1st_August'18 : Dinesh Changes : Added Department sales daybook ---------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_IncomeSegregation]    Script Date: 7/31/2018 8:47:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BILL_DepartmentSalesDaybook]--[SP_Report_BILL_DepartmentSalesDaybook] '2018-07-30','2018-07-30' 
@FromDate Date=null ,
@ToDate Date=null	
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
1       Dinesh/2018-08-01					NA										*/


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
     ISNULL(vwTxnItm.ReturnTotalAmount,0) AS ReturnAmount,
     ISNULL(vwTxnItm.ReturnTax,0) AS ReturnTax
    from BIL_MST_ServiceDepartment sd, BIL_CFG_BillItemPrice itms, VW_BIL_TxnItemsInfo vwTxnItm 

	  where   vwTxnItm.BillingDate between Convert(date, @FromDate) AND  Convert(date, @ToDate) 
       AND vwTxnItm.ServiceDepartmentId  = sd.ServiceDepartmentId
     AND vwTxnItm.ItemId=itms.ItemId
     AND sd.ServiceDepartmentId = itms.ServiceDepartmentId

      
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
   Sum(txnItms.TotalAmount)-Sum(txnItms.Tax) 'NetSales'
  -- Sum(txnItms.CancelTotalAmountDay) 'CancelTotalAmountDay',
  --Sum (txnItms.CancelDiscountDay) 'CancelDiscountDay'
from DepartmentWiseSalesCTE txnItms 
group by txnItms.ServDeptName

	END	
END

GO
---End:1st_August'18 : Dinesh Changes : Added Department sales daybook ---------------


--Start: 1 August- Anish----
INSERT INTO [dbo].[LAB_LabTests] (LabTestName,LabTestSpecimen,LabTestSpecimenSource,LabTestComponentsJSON,
ReportTemplateID,HasNegativeResults,IsValidSampling,LabSequence,CreatedBy,CreatedOn,IsActive)
VALUES('BLOOD BAG (EACH)','["Blood"]','Peripheral Vein','[]',2,0,1,0,1,GETDATE(),1);

INSERT INTO [dbo].[LAB_LabTests] (LabTestName,LabTestSpecimen,LabTestSpecimenSource,LabTestComponentsJSON,
ReportTemplateID,HasNegativeResults,IsValidSampling,LabSequence,CreatedBy,CreatedOn,IsActive)
VALUES('BLOOD GAS ANALYSIS WITH ELECTROTYPES','["Blood"]','Peripheral Vein','[]',2,0,1,0,1,GETDATE(),1);
Go

declare @LabId INT
SET @LabId = (Select TOP(1) LabTestId from [dbo].[LAB_LabTests] where LabTestName='BLOOD BAG (EACH)');
Update [dbo].[BIL_CFG_BillItemPrice] 
Set ItemId=@LabId where ItemName='BLOOD BAG (EACH)';
Go

declare @LabId INT
SET @LabId = (Select TOP(1) LabTestId from [dbo].[LAB_LabTests] where LabTestName='BLOOD GAS ANALYSIS WITH ELECTROTYPES');
Update [dbo].[BIL_CFG_BillItemPrice] 
Set ItemId=@LabId where ItemName='BLOOD GAS ANALYSIS WITH ELECTROTYPES';
Go
--End: 1 August- Anish----



--Start: Nagesh/Vikas/2018-08-01 Changes :StoredProcedure for counterwise collection report(Total Sale)---------------

/****** Object:  StoredProcedure [dbo].[SP_PHRM_CounterCollectionReport]    Script Date: 01-08-2018 18:33:05 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRM_CounterCollectionReport] 
@FromDate datetime=null,
 @ToDate datetime=null
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
1      Nagesh/Vikas/2018-08-01	              created the script

--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
			select convert(date,inv.CreatedOn) as [Date], usr.UserName,cnt.CounterName, sum(inv.TotalAmount)as TotalAmount, sum(inv.SubTotal*inv.DiscountPercentage / 100.0) as [DiscountAmount]
			 from PHRM_TXN_InvoiceItems inv
				join RBAC_User usr
				on inv.CreatedBy=usr.EmployeeId
				join PHRM_MST_Counter cnt on inv.CounterId=cnt.CounterId

						where CONVERT(date,inv.CreatedOn) Between ISNULL(@FromDate,GETDATE()) AND ISNULL(@ToDate,GETDATE())+1
					group by  UserName,CounterName,convert(date,inv.CreatedOn)
					order by [Date]
		End
End
GO


--End: Nagesh/Vikas/2018-08-01 Changes :StoredProcedure for counterwise collection report(Total Sale)---------------
--Start: Abhishek : Added a field for CreditNoteID in supplierreturn
alter table [PHRM_ReturnToSupplier]
add CreditNoteId int null
go
--END: Abhishek : Added a field for CreditNoteID in supplierreturn
--START: Nagesh/Vikas/2018-08-03 : Script for add IsReturn flag column in phrm_txn_invoice table---------------
 ALTER TABLE [dbo].[PHRM_TXN_Invoice]
 ADD IsReturn bit
 go
--START: Nagesh/Vikas/2018-08-03 : Script for add IsReturn flag column in phrm_txn_invoice table---------------  

--- START: Ramavtar/03Aug'18	created SP for PatientCensusReport, inserting permission, routeConfig & parameter for CalendarType---

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_BILL_PatientCensus]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Ramavtar/03Aug'18			created the script
----------------------------------------------------------
*/
BEGIN

DECLARE @cols AS NVARCHAR(MAX),
		@query AS NVARCHAR(MAX)

select @cols = STUFF((SELECT DISTINCT ',' + QUOTENAME(i.ServiceDepartmentName) 
               FROM BIL_TXN_BillingTransactionItems i
			   WHERE CONVERT(DATE,i.CreatedOn) BETWEEN @FromDate AND @ToDate
			   FOR XML PATH(''), TYPE
               ).value('.', 'NVARCHAR(MAX)') 
               ,1,1,'')	

---give columns name
SELECT 'DoctorName' + ISNULL(',' + REPLACE(REPLACE(@cols, '[', ''), ']', ''), '') + ',TotalPatient,TotalCollection' AS ColumnName

set @query = 
'
SELECT A.*, B.TotalPatient, B.TotalCollection 
	FROM (
		SELECT ProviderName AS DoctorName,' + @cols + ' 
			FROM (
                SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,ServiceDepartmentName,BillingTransactionItemId
					FROM BIL_TXN_BillingTransactionItems
					WHERE CONVERT(DATE,CreatedOn) BETWEEN ''' + CONVERT(VARCHAR(10),@FromDate, 101) + ''' AND ''' +  CONVERT(VARCHAR(10),@ToDate, 101) + '''
				) x
				PIVOT 
				(
				COUNT(BillingTransactionItemId)
                FOR ServiceDepartmentName IN (' + @cols + ')
				) p 
	) A			
	JOIN
	(
	SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,COUNT(BillingTransactionItemId) as TotalPatient, SUM(TotalAmount) as TotalCollection
		FROM BIL_TXN_BillingTransactionItems
		WHERE CONVERT(DATE,CreatedOn) BETWEEN ''' + CONVERT(VARCHAR(10),@FromDate, 101) + ''' AND ''' +  CONVERT(VARCHAR(10),@ToDate, 101) + '''
		GROUP BY ProviderName
	)B 
	ON A.DoctorName = B.ProviderName
'
execute(@query);
END
GO
--- inserting permission 
DECLARE @appId INT
	SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'RPT')

INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
    VALUES 
		('reports-billingmain-patientcensusreport-view', @appId, 1, GETDATE(), 1)
GO
--- inserting routeConfig
DECLARE @prmId int,
        @RouteId int
SET @prmId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'reports-billingmain-patientcensusreport-view')
SET @RouteId = (SELECT TOP (1) RouteId FROM RBAC_RouteConfig WHERE UrlFullPath = 'Reports/BillingMain')

INSERT INTO RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, Css, DefaultShow, IsActive)
    VALUES ('Patient Census', 'Reports/BillingMain/PatientCensusReport', 'PatientCensusReport', @prmId, @RouteId, 'fa fa-money fa-stack-1x text-white', 1, 1)
GO
--- inserting calendarTyoe parameter
UPDATE CORE_CFG_Parameters
SET ParameterValue = '{"LaboratoryServices":"np","PatientRegistration":"en,np","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np"}'
WHERE ParameterGroupName = 'Common' AND ParameterName = 'CalendarTypes'
GO
--- END: Ramavtar/03Aug'18	created SP for PatientCensusReport ---
----Start: Abhishek/04 Aug'18 Pharmacy Item table rectification
alter table PHRM_MST_Item
drop column mnk_strip_qty,mnk_unit1, mnk_sl_rate, mnk_pu_rate
go
alter table PHRM_MST_Item
drop column standardprice, sellingprice
go
alter table PHRM_MST_Item
add Rack nvarchar(100)
go
----End: Abhishek/04 Aug'18 Item table rectification

--START: Vikas/2018-08-06 Changes :StoredProcedure for Invoice Sale return report---------------

/****** Object:  StoredProcedure [dbo].[SP_PHRM_SaleReturnReport]    Script Date: 01-08-2018 18:33:05 ******/
CREATE PROCEDURE [dbo].[SP_PHRM_SaleReturnReport] 
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
1      Vikas/2018-08-06	                     created the script

--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
					select convert(date,invr.CreatedOn) as[Date],convert(date, inv.CreateOn) as [InvDate], 
					 inv.InvoicePrintId,usr.UserName,
						pat.FirstName+' '+ ISNULL( pat.MiddleName,'')+' '+pat.LastName  as PatientName,
				 sum(inv.TotalAmount) as TotalAmount, sum(inv.DiscountAmount) as Discount
				    from [PHRM_TXN_Invoice]inv
					join [PHRM_TXN_InvoiceReturnItems]invr
							on inv.InvoiceId=invr.InvoiceId
					join RBAC_User usr
							on usr.EmployeeId=invr.CreatedBy 
					join PAT_Patient pat
							on pat.PatientId=invr.InvoiceId
								where  convert(date, invr.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 
					group by convert(date,inv.CreateOn), convert(date, invr.CreatedOn),usr.UserName, pat.FirstName,pat.MiddleName,pat.LastName, inv.InvoicePrintId
					order by convert(date,invr.CreatedOn) desc

	End
End

GO
--END: Vikas/2018-08-06 Changes :StoredProcedure for Invoice Sale return report(Total Sale)---------------

--Start: Abhishek/2018-08-06 Changes :StoredProcedure for userwise collection rectified--
/****** Object:  StoredProcedure [dbo].[SP_PHRM_UserwiseCollectionReport]    Script Date: 8/6/2018 12:38:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_UserwiseCollectionReport]  --- [SP_PHRM_UserwiseCollectionReport] '05/01/2018','08/08/2018'
@FromDate datetime=null,
 @ToDate datetime=null
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
			  where convert(datetime, invRet.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			  group by convert(date,invRet.CreatedOn),UserName
			  )	  tabletotal
			  Group BY [Date], UserName
      End
END
go
--End: Abhishek/2018-08-06 Changes :StoredProcedure for userwise collection rectified--


----Start: Ashim : 07Aug2018---Update script for ItemName in Bil_Txn_BillTransactioinItem table
 update BIL_TXN_BillingTransactionItems
  set ItemName ='CONSULTATION GENERAL PHYSICIAN'
  where ServiceDepartmentName='OPD' and ItemName='OPD-Ticket'
  go

----End: Ashim : 07Aug2018---Update script for ItemName in Bil_Txn_BillTransactioinItem table

--- START: Ramavtar/07Aug'18	created SP for DoctorwiseOutPatientReport, inserting permission, routeConfig & parameter for CalendarType ---

--creating SP
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		Ramavtar/06Aug'18
-- Description:	get count of outpatient new visit and follow-up visit doctor-wise
-- =============================================
CREATE PROCEDURE SP_Report_Appointment_DoctorWiseOutPatientReport
@FromDate DATETIME = null,
@ToDate DATETIME = null
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Ramavtar/06Aug'18			created the script
----------------------------------------------------------
*/
BEGIN
SELECT 
	CONCAT(FirstName + ' ', ISNULL(E.MiddleName + ' ', ''), E.LastName) 'DoctorName',
    SUM(CASE WHEN P.AppointmentType = 'New' THEN 1 ELSE 0 END) 'NEW',
    SUM(CASE WHEN P.AppointmentType = 'followup' THEN 1 ELSE 0 END) 'FOLLOWUP'
FROM PAT_PatientVisits P
JOIN EMP_Employee E ON ProviderId = EmployeeId
WHERE CONVERT(DATE, p.VisitDate) BETWEEN @FromDate AND @ToDate
GROUP BY P.ProviderId, CONCAT(FirstName + ' ', ISNULL(E.MiddleName + ' ', ''), E.LastName)
ORDER BY P.ProviderId
END
GO
--inserting permission
DECLARE @appId INT
	SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'RPT')

INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
    VALUES 
		('reports-appointmentmain-doctorwiseoutpatient-view', @appId, 1, GETDATE(), 1)
GO
--- inserting routeConfig
DECLARE @prmId int,
        @RouteId int
SET @prmId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'reports-appointmentmain-doctorwiseoutpatient-view')
SET @RouteId = (SELECT TOP (1) RouteId FROM RBAC_RouteConfig WHERE UrlFullPath = 'Reports/AppointmentMain')

INSERT INTO RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
    VALUES ('Doctorwise OutPatient', 'Reports/AppointmentMain/DoctorwiseOutPatient', 'DoctorwiseOutPatient', @prmId, @RouteId, 1, 1)
GO
--- inserting calendarType parameter
UPDATE CORE_CFG_Parameters
SET ParameterValue = '{"LaboratoryServices":"np","PatientRegistration":"en,np","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np","DoctorOutPatientReport":"en,np"}'
WHERE ParameterGroupName = 'Common' AND ParameterName = 'CalendarTypes'
GO
--- END: Ramavtar/07Aug'18	created SP for DoctorwiseOutPatientReport, inserting permission, routeConfig & parameter for CalendarType ---

--Start: Abhishek/2018-08-07 Changes :Add a column just for displaying invoicePrintId--
alter table PHRM_GoodsReceipt
add  GoodReceiptPrintId INT;
GO
--End: Abhishek/2018-08-07 Changes :Add a column just for displaying invoicePrintId--


---Start: Ashim / 08Aug2018 Merged from ClinicalIncrementalDbScripts_03Aug2018-----

---start:drop and create notes table

ALTER TABLE [dbo].[CLN_Notes] DROP CONSTRAINT [FK_CLN_Notes_PAT_PatientVisits]
GO

ALTER TABLE [dbo].[CLN_Notes] DROP CONSTRAINT [FK_CLN_Notes_EMP_Employee]
GO

ALTER TABLE [dbo].[CLN_Notes] DROP CONSTRAINT [IsSigned]
GO

/****** Object:  Table [dbo].[CLN_Notes]    Script Date: 8/4/2018 8:07:44 AM ******/
DROP TABLE [dbo].[CLN_Notes]
GO

/****** Object:  Table [dbo].[CLN_Notes]    Script Date: 8/4/2018 8:07:44 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_Notes](
	[NotesId] [int] IDENTITY(1,1) NOT NULL,
	[PatientId] [int] NOT NULL,
	[PatientVisitId] [int] NOT NULL,
	[ProviderId] [int] NOT NULL,
	[NoteType] [varchar](50) NULL,
	[Instructions] [varchar](1000) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
 CONSTRAINT [PK_CLN_Notes] PRIMARY KEY CLUSTERED 
(
	[NotesId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


ALTER TABLE [dbo].[CLN_Notes]  WITH CHECK ADD  CONSTRAINT [FK_CLN_Notes_PAT_PatientVisits] FOREIGN KEY([PatientVisitId])
REFERENCES [dbo].[PAT_PatientVisits] ([PatientVisitId])
GO

ALTER TABLE [dbo].[CLN_Notes] CHECK CONSTRAINT [FK_CLN_Notes_PAT_PatientVisits]
GO
--end: drop and create notes table.

---start: create subjective note table---
/****** Object:  Table [dbo].[CLN_Notes_Subjective]    Script Date: 8/4/2018 9:18:38 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CLN_Notes_Subjective](
	[SubjectiveNoteId] [int] IDENTITY(1,1) NOT NULL,
	[NotesId] [int] NOT NULL,
	[PatientId] [int] NOT NULL,
	[PatientVisitId] [int] NOT NULL,
	[ChiefComplaint] [varchar](2000) NULL,
	[HistoryOfPresentingIllness] [varchar](2000) NULL,
	[ReviewOfSystems] [varchar](2000) NULL,
	[CreatedBy] [int] NULL,
	[ModifiedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[ModifiedOn] [datetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_CLN_Notes_Subjective] PRIMARY KEY CLUSTERED 
(
	[SubjectiveNoteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[CLN_Notes_Subjective] ADD  CONSTRAINT [IsActiveSubjectiveNote]  DEFAULT ((1)) FOR [IsActive]
GO

ALTER TABLE [dbo].[CLN_Notes_Subjective]  WITH CHECK ADD  CONSTRAINT [FK_CLN_Notes_Subjective_CLN_Notes] FOREIGN KEY([NotesId])
REFERENCES [dbo].[CLN_Notes] ([NotesId])
GO

ALTER TABLE [dbo].[CLN_Notes_Subjective] CHECK CONSTRAINT [FK_CLN_Notes_Subjective_CLN_Notes]
GO
---end: create subjective note table---

--Start: ANish  Objective Note Table--
CREATE TABLE [dbo].CLN_Notes_Objective(
	ObjectiveNotesId INT IDENTITY(1,1) PRIMARY KEY,
	NoteId INT,
	PatientId INT,
	PatientVisitId INT,
	HEENT varchar(2000),
	Chest varchar(500),
	CVS varchar(500),
	Abdomen varchar(500),
	Extremity varchar(500),
	Skin varchar(500),
	Neurological varchar(500),
	CreatedBy INT,
	CreatedOn datetime
);
go
--End

---start: Ashim
alter table [dbo].[CLN_Notes_Objective]
drop column NoteId
go
alter table [dbo].[CLN_Notes_Objective]
add NotesId int not null
go

alter table [dbo].[CLN_Notes]
drop column [Instructions]
go

alter table [dbo].[CLN_Notes]
add FollowUp varchar(40) null
go

alter table [dbo].[CLN_Notes]
add Remarks varchar(500) null
go
---end: Ashim

--Start: Ashim/Anish
alter table [dbo].[CLN_Notes_Objective]
add [ModifiedBy] [int] NULL, [ModifiedOn] [datetime] NULL, [IsActive] [bit] NULL
go

update [dbo].[CLN_Notes_Objective]
set IsActive=1;
Go


ALTER TABLE [dbo].[CLN_Notes_Objective]  WITH CHECK ADD  CONSTRAINT [FK_CLN_Notes_Objective_CLN_Notes] FOREIGN KEY([NotesId])
REFERENCES [dbo].[CLN_Notes] ([NotesId])
GO

ALTER TABLE [dbo].[CLN_Notes_Objective] CHECK CONSTRAINT [FK_CLN_Notes_Objective_CLN_Notes]
GO
--End: Ashim/Anish 

---Start: Ashim :

--Start: Permission and route for Current Medications
--1. Insert permission for clinical-patient-currentmedications
INSERT INTO [dbo].[RBAC_Permission]
       ([PermissionName]
       ,[ApplicationId]
       ,[CreatedBy]
       ,[CreatedOn]
       ,[IsActive])
 VALUES
      ('clinical-patient-currentmedications-view',2,1,GETDATE(),1)
GO
--2 Insert route for clinical-patient-currentmedications
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='clinical-patient-currentmedications-view')

declare @parentRouteId int
set @parentRouteId = (select RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath='Doctors/PatientOverviewMain')
INSERT INTO [dbo].[RBAC_RouteConfig]
       ([DisplayName]
       ,[UrlFullPath]
       ,[RouterLink]
       ,[PermissionId]
	   ,[ParentRouteId]
	   ,[DefaultShow]
       ,[IsActive])
VALUES
      ('Current Medications','Doctors/PatientOverviewMain/CurrentMedications','CurrentMedications',@perId,@parentRouteId,1,1);	  
GO
--3 Set Permission for Doctor
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='clinical-patient-currentmedications-view')

declare @roleId int
set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Doctor')

Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,GETDATE(),1)
go

--End: Permission and route for Current Medications

--Start: Permission and route for Patient Lab Reports
--1. Insert permission for clab-patient-testreports-view
INSERT INTO [dbo].[RBAC_Permission]
       ([PermissionName]
       ,[ApplicationId]
       ,[CreatedBy]
       ,[CreatedOn]
       ,[IsActive])
 VALUES
      ('lab-patient-testreports-view',7,1,GETDATE(),1)
GO
--2 Insert route for lab-patient-testreports-view
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='lab-patient-testreports-view')

declare @parentRouteId int
set @parentRouteId = (select RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath='Doctors/PatientOverviewMain')
INSERT INTO [dbo].[RBAC_RouteConfig]
       ([DisplayName]
       ,[UrlFullPath]
       ,[RouterLink]
       ,[PermissionId]
	   ,[ParentRouteId]
	   ,[DefaultShow]
       ,[IsActive])
VALUES
      ('Lab Reports','Doctors/PatientOverviewMain/LabReports','LabReports',@perId,@parentRouteId,1,1);	  
GO
--3 Set Permission for Doctor
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='lab-patient-testreports-view')

declare @roleId int
set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Doctor')

Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,GETDATE(),1)
go

--End: Permission and route for Patient Lab Reports

--Start: Permission and route for Patient Radiology Reports
--1. Insert permission for radiology-patient-reports-view
INSERT INTO [dbo].[RBAC_Permission]
       ([PermissionName]
       ,[ApplicationId]
       ,[CreatedBy]
       ,[CreatedOn]
       ,[IsActive])
 VALUES
      ('radiology-patient-reports-view',8,1,GETDATE(),1)
GO
--2 Insert route for radiology-patient-reports-view
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='radiology-patient-reports-view')

declare @parentRouteId int
set @parentRouteId = (select RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath='Doctors/PatientOverviewMain')
INSERT INTO [dbo].[RBAC_RouteConfig]
       ([DisplayName]
       ,[UrlFullPath]
       ,[RouterLink]
       ,[PermissionId]
	   ,[ParentRouteId]
	   ,[DefaultShow]
       ,[IsActive])
VALUES
      ('Radiology Reports','Doctors/PatientOverviewMain/RadiologyReports','RadiologyReports',@perId,@parentRouteId,1,1);	  
GO
--3 Set Permission for Doctor
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='radiology-patient-reports-view')

declare @roleId int
set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Doctor')

Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,GETDATE(),1)
go

--End: Permission and route for Patient Radiology Reports


--Start: Permission and route for Clinical Documents
--1. Insert permission for clinical-documents-view
INSERT INTO [dbo].[RBAC_Permission]
       ([PermissionName]
       ,[ApplicationId]
       ,[CreatedBy]
       ,[CreatedOn]
       ,[IsActive])
 VALUES
      ('clinical-documents-view',2,1,GETDATE(),1)
GO
--2 Insert route for clinical-documents-view
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='clinical-documents-view')

declare @parentRouteId int
set @parentRouteId = (select RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath='Doctors/PatientOverviewMain')
INSERT INTO [dbo].[RBAC_RouteConfig]
       ([DisplayName]
       ,[UrlFullPath]
       ,[RouterLink]
       ,[PermissionId]
	   ,[ParentRouteId]
	   ,[DefaultShow]
       ,[IsActive])
VALUES
      ('Clinical Documents','Doctors/PatientOverviewMain/ClinicalDocuments','ClinicalDocuments',@perId,@parentRouteId,1,1);	  
GO
--3 Set Permission for Doctor
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='clinical-documents-view')

declare @roleId int
set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Doctor')

Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,GETDATE(),1)
go

--End: Permission and route for Clinical Documents

--Start: Permission and route for Notes Summary
--1. Insert permission for clinical-notes-summary-view
INSERT INTO [dbo].[RBAC_Permission]
       ([PermissionName]
       ,[ApplicationId]
       ,[CreatedBy]
       ,[CreatedOn]
       ,[IsActive])
 VALUES
      ('clinical-notes-summary-view',2,1,GETDATE(),1)
GO
--2 Insert route for clinical-notes-summary-view
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='clinical-notes-summary-view')

declare @parentRouteId int
set @parentRouteId = (select RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath='Doctors/PatientOverviewMain')
INSERT INTO [dbo].[RBAC_RouteConfig]
       ([DisplayName]
       ,[UrlFullPath]
       ,[RouterLink]
       ,[PermissionId]
	   ,[ParentRouteId]
	   ,[DefaultShow]
       ,[IsActive])
VALUES
      ('Notes Summary','Doctors/PatientOverviewMain/NotesSummary','NotesSummary',@perId,@parentRouteId,1,1);	  
GO
--3 Set Permission for Doctor
declare @perId int
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='clinical-notes-summary-view')

declare @roleId int
set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Doctor')

Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,GETDATE(),1)
go

--End: Permission and route for Notes Summary



---Start: Update DisplaySeq for Doctors/PatientOverViewMain----
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=1 where UrlFullPath='Doctors/PatientOverviewMain/PatientOverview';
GO
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=2 where UrlFullPath='Doctors/PatientOverviewMain/ProblemsMain';
GO
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=3 where UrlFullPath='Doctors/PatientOverviewMain/CurrentMedications';
GO
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=4 where UrlFullPath='Doctors/PatientOverviewMain/PatientVisitHistory';
GO
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=5 where UrlFullPath='Doctors/PatientOverviewMain/Orders';
GO
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=6 where UrlFullPath='Doctors/PatientOverviewMain/LabReports';
GO
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=7 where UrlFullPath='Doctors/PatientOverviewMain/RadiologyReports';
GO
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=8 where UrlFullPath='Doctors/PatientOverviewMain/ClinicalDocuments';
GO
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=9 where UrlFullPath='Doctors/PatientOverviewMain/Clinical';
GO
update [dbo].[RBAC_RouteConfig]
set DisplaySeq=10 where UrlFullPath='Doctors/PatientOverviewMain/NotesSummary';
GO
---End: Update DisplaySeq for Doctors/PatientOverViewMain----


---End: Ashim :Permission and routes----


---End:Ashim/08Aug2018 Merged from ClinicalIncrementalDbScripts_03Aug2018-----

--- START: Ramavtar/08Aug'18 alter script for patientcensus report ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Ramavtar/03Aug'18			created the script
2		Ramavtar/08Aug'18			getting patient count as distinct(patientid) instead of billingTxnItems
----------------------------------------------------------
*/
BEGIN

DECLARE @cols AS NVARCHAR(MAX),
		@query AS NVARCHAR(MAX)

select @cols = STUFF((SELECT DISTINCT ',' + QUOTENAME(i.ServiceDepartmentName) 
               FROM BIL_TXN_BillingTransactionItems i
			   WHERE CONVERT(DATE,i.CreatedOn) BETWEEN @FromDate AND @ToDate
			   FOR XML PATH(''), TYPE
               ).value('.', 'NVARCHAR(MAX)') 
               ,1,1,'')	

---to remove the start and end bracket from column names in return table.
SELECT 'DoctorName' + ISNULL(',' + REPLACE(REPLACE(@cols, '[', ''), ']', ''), '') + ',TotalPatient,TotalCollection' AS ColumnName

set @query = 
'
SELECT A.*, B.TotalPatient, B.TotalCollection 
	FROM (
		SELECT ProviderName AS DoctorName,' + @cols + ' 
			FROM (
                SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,ServiceDepartmentName,BillingTransactionItemId
					FROM BIL_TXN_BillingTransactionItems
					WHERE CONVERT(DATE,CreatedOn) BETWEEN ''' + CONVERT(VARCHAR(10),@FromDate, 101) + ''' AND ''' +  CONVERT(VARCHAR(10),@ToDate, 101) + '''
				) x
				PIVOT 
				(
				COUNT(BillingTransactionItemId)
                FOR ServiceDepartmentName IN (' + @cols + ')
				) p 
	) A			
	JOIN
	(
	SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,(COUNT(Distinct PatientId)) as TotalPatient, SUM(TotalAmount) as TotalCollection
		FROM BIL_TXN_BillingTransactionItems
		WHERE CONVERT(DATE,CreatedOn) BETWEEN ''' + CONVERT(VARCHAR(10),@FromDate, 101) + ''' AND ''' +  CONVERT(VARCHAR(10),@ToDate, 101) + '''
		GROUP BY ProviderName
	)B 
	ON A.DoctorName = B.ProviderName
'
execute(@query);
END
GO
--- END: Ramavtar/08Aug'18 alter script for patientcensus report ---

--- START: Ramavtar/08Aug'18 SP for doctorwise Income report, insertting permission,routeconfig,parameter for calType ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		Sud/08Aug2018
-- Description:		to show DoctorWise IncomeSummary (Inpatient + Outpatient)
-- Remarks: We're taking AssignedTo Field Only in BillingTransactionItem table. 
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_BILL_DoctorWiseIncomeSummary_OPIP]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Sud/08Aug'18			created the script
2		Ramavtar/08Aug'18		getting doctor name from employee table
----------------------------------------------------------
*/
BEGIN
SELECT
    ProviderName 'DoctorName',
    SUM(ISNULL(SubTotal, 0)) 'OP_Collection',
    SUM(ISNULL(Discount, 0)) 'OP_Discount',
    SUM(ISNULL(Refund, 0)) 'OP_Refund',
    SUM(ISNULL(NetTotal, 0)) 'OP_NetTotal',
    0 AS 'IP_Collection',
    0 AS 'IP_Discount',
    0 AS 'IP_Refund',
    0 AS 'IP_NetTotal',
    SUM(ISNULL(NetTotal, 0)) 'Grand_Total'  -- Change this once we write logic for InpatientCollection
FROM (
---This is For Outpatient---
SELECT
    CONCAT(FirstName + ' ', ISNULL(E.MiddleName + ' ', ''), E.LastName) 'ProviderName',
    SubTotal,
    DiscountAmount AS 'Discount',  --no discount when bill is returned.
    CASE WHEN ReturnStatus IS NULL THEN 0 ELSE TotalAmount END AS 'Refund',
    CASE WHEN ReturnStatus IS NULL THEN ISNULL(SubTotal, 0) - ISNULL(DiscountAmount, 0) ELSE 0 END AS 'NetTotal'
FROM BIL_TXN_BillingTransactionItems
JOIN EMP_Employee E ON ProviderId = EmployeeId
WHERE ProviderName IS NOT NULL
AND CONVERT(date, PaidDate) BETWEEN CONVERT(date, ISNULL(@FromDate, GETDATE())) AND CONVERT(date, ISNULL(@ToDate, GETDATE()))) A
GROUP BY ProviderName
ORDER BY ProviderName 
END
GO
---inserting permission
DECLARE @appId INT
	SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'RPT')

INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
    VALUES 
		('reports-billingmain-doctorwiseincomesummary-view', @appId, 1, GETDATE(), 1)
GO
--- inserting routeConfig
DECLARE @prmId int,
        @RouteId int
SET @prmId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'reports-billingmain-doctorwiseincomesummary-view')
SET @RouteId = (SELECT TOP (1) RouteId FROM RBAC_RouteConfig WHERE UrlFullPath = 'Reports/BillingMain')

INSERT INTO RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,Css)
    VALUES ('Doctorwise Income Summary (OP + IP)', 'Reports/BillingMain/DoctorwiseIncomeSummary', 'DoctorwiseIncomeSummary', @prmId, @RouteId, 1, 1,'fa fa-money fa-stack-1x text-white')
GO
--- inserting calendarTyoe parameter
UPDATE CORE_CFG_Parameters
SET ParameterValue = '{"LaboratoryServices":"np","PatientRegistration":"en,np","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np","DoctorOutPatientReport":"en,np","DoctorwiseIncomeSummary":"en,np"}'
WHERE ParameterGroupName = 'Common' AND ParameterName = 'CalendarTypes'
GO
--- END: Ramavtar/08Aug'18 SP for doctorwise Income report, insertting permission,routeconfig,parameter for calType ---

---START: RAMAVTAR/09AUG'18 ALTER SP FOR DOCTORWISE INCOME SUMMARY REPORT (SHOWING RECORD WITH NO DOCTOR ASSIGNED ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		Sud/08Aug2018
-- Description:		to show DoctorWise IncomeSummary (Inpatient + Outpatient)
-- Remarks: We're taking AssignedTo Field Only in BillingTransactionItem table. 
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_DoctorWiseIncomeSummary_OPIP]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Sud/08Aug'18			created the script
2		Ramavtar/08Aug'18		getting doctor name from employee table
----------------------------------------------------------
*/
BEGIN
SELECT
    ProviderName 'DoctorName',
    SUM(ISNULL(SubTotal, 0)) 'OP_Collection',
    SUM(ISNULL(Discount, 0)) 'OP_Discount',
    SUM(ISNULL(Refund, 0)) 'OP_Refund',
    SUM(ISNULL(NetTotal, 0)) 'OP_NetTotal',
    0 AS 'IP_Collection',
    0 AS 'IP_Discount',
    0 AS 'IP_Refund',
    0 AS 'IP_NetTotal',
    SUM(ISNULL(NetTotal, 0)) 'Grand_Total'  -- Change this once we write logic for InpatientCollection
FROM (
---This is For Outpatient---
SELECT
    CASE WHEN ProviderId IS NOT NULL THEN CONCAT(FirstName + ' ', ISNULL(E.MiddleName + ' ', ''), E.LastName) ELSE 'NoDoctor' END 'ProviderName',
    SubTotal,
    DiscountAmount AS 'Discount',  --no discount when bill is returned.
    CASE WHEN ReturnStatus IS NULL THEN 0 ELSE TotalAmount END AS 'Refund',
    CASE WHEN ReturnStatus IS NULL THEN ISNULL(SubTotal, 0) - ISNULL(DiscountAmount, 0) ELSE 0 END AS 'NetTotal'
FROM BIL_TXN_BillingTransactionItems
FULL OUTER JOIN EMP_Employee E ON ProviderId = EmployeeId
WHERE CONVERT(date, PaidDate) BETWEEN CONVERT(date, ISNULL(@FromDate, GETDATE())) AND CONVERT(date, ISNULL(@ToDate, GETDATE()))) A
GROUP BY ProviderName
ORDER BY ProviderName 
END
GO


----Start: Dinesh : 9th August'18 Sp for Departmentwise sales day book and Doctor Report  -----------------------
---------Departmentwise sales Daybook 

/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_DepartmentSalesDaybook]    Script Date: 8/7/2018 3:33:17 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BILL_DepartmentSalesDaybook]--[SP_Report_BILL_DepartmentSalesDaybook] '2018-07-30','2018-07-30' 
@FromDate Date=null ,
@ToDate Date=null	
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
1       Dinesh/2018-08-01					NA										*/


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
     ISNULL(vwTxnItm.ReturnTotalAmount,0) AS ReturnAmount,
     ISNULL(vwTxnItm.ReturnTax,0) AS ReturnTax
    from BIL_MST_ServiceDepartment sd, BIL_CFG_BillItemPrice itms, VW_BIL_TxnItemsInfo vwTxnItm 

	  where   vwTxnItm.BillingDate between Convert(date, @FromDate) AND  Convert(date, @ToDate) 
       AND vwTxnItm.ServiceDepartmentId  = sd.ServiceDepartmentId
     AND vwTxnItm.ItemId=itms.ItemId
     AND sd.ServiceDepartmentId = itms.ServiceDepartmentId

      
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

----------------------SP for Doctor Report -----------------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DoctorReport]    Script Date: 8/9/2018 2:13:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorReport]	--- [SP_Report_BIL_DoctorReport] '2018-08-08','2018-08-08'
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@ProviderName varchar(max)=null

AS
/*
FileName: [SP_Report_BIL_DoctorReport]
CreatedBy/date: nagesh/2017-05-25
Description: to get count of appointments per Department between given dates.
Remarks:    
Change History
---------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------
1       nagesh/2017-05-25	                     created the script
2       umed / 2017-06-14                        Modify the script i.e format 
                                                 and remove time from paid date  
3.      dinesh/ 2017-08-04						 Modified the script and maintained the Return as well as Cancel Status 
4       Umed/2018-04-17                         Added Order by Date in Desc Order
5.		ramavtar/2018-05-31						correction in where condition 
												(providerName didnt had space in between First & Last name)
--------------------------------------------------------------------
*/

BEGIN
	IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL) OR (@ProviderName IS NOT NULL) OR (LEN(@ProviderName) > 0)
		BEGIN
			SELECT  vwTxnItm.BillingTransactionItemId,
				BillingDate  AS [Date],
				emp.FirstName+' '+emp.LastName AS 'Doctor',
				pat.PatientCode as 'HospitalNo',
				Pat.FirstName + ' ' +pat.LastName as 'PatientName', 
				ServiceDepartmentName AS 'Department', 
				itms.ItemName AS 'Item', 
				ISNULL(Price,0) AS 'Rate', 
				Sum(ISNULL(vwTxnItm.PaidQuantity,0) + ISNULL(vwTxnItm.UnpaidQuantity,0)) AS 'Quantity',
				(ISNULL(Price,0) * (Sum(ISNULL(vwTxnItm.PaidQuantity,0) + ISNULL(vwTxnItm.UnpaidQuantity,0)))) as 'SubTotal', 
				Sum(ISNULL(vwTxnItm.PaidDiscountAmount,0)+ISNULL(vwTxnItm.UnpaidDiscountAmount,0)) AS 'Discount', 
				Sum(ISNULL(vwTxnItm.PaidTax,0)+ISNULL(vwTxnItm.UnpaidTax,0)) as 'Tax',
				Sum(ISNULL(vwTxnItm.PaidTotalAmount,0)+ISNULL(vwTxnItm.UnpaidTotalAmount,0)) AS 'Total',
				Sum(ISNULL(vwTxnItm.ReturnTotalAmount,0)) 'ReturnAmount',
				Sum(ISNULL(vwTxnItm.ReturnTax,0)) 'ReturnTax',
				Sum(ISNULL(vwTxnItm.CancelTotalAmount,0)) 'CancelTotal',
				Sum(ISNULL(vwTxnItm.CancelTax,0)) 'CancelTax',
				(Sum(ISNULL(vwTxnItm.PaidTotalAmount,0)+ISNULL(vwTxnItm.UnpaidTotalAmount,0))-Sum(ISNULL(vwTxnItm.ReturnTotalAmount,0))-Sum(ISNULL(vwTxnItm.CancelTax,0))) as 'NetAmount'
				FROM 
					BIL_MST_ServiceDepartment sd, BIL_CFG_BillItemPrice itms, EMP_Employee emp, VW_BIL_TxnItemsInfo vwTxnItm,
					PAT_Patient pat
				WHERE
					BillingDate BETWEEN ISNULL(@FromDate,GETDATE()) AND ISNULL(@ToDate,GETDATE()) 
					AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId AND vwTxnItm.ItemId=itms.ItemId
					AND sd.ServiceDepartmentId = itms.ServiceDepartmentId and emp.EmployeeId=vwTxnItm.ProviderId 
					AND vwTxnItm.PatientId=pat.PatientId
					AND emp.FirstName+' '+emp.LastName like '%'+ISNULL(@ProviderName,'')+'%' 
				GROUP BY BillingTransactionItemId, BillingDate, emp.FirstName+' '+emp.LastName, ServiceDepartmentName, ItemName, Price,
				Pat.FirstName + ' ' +pat.LastName,pat.PatientCode
				ORDER BY BillingDate desc
	End
End
GO

----End: Dinesh : 9th August'18 Sp for Departmentwise sales day book and Doctor Report  -----------------------

--- START: Ramavtar: 9thAugust'18 function for deposit summary and alter sp for patient census ---
-- function to get deposit summary
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Table-Valued Function (Multi-line) to get deposit and provisional amount summary between a date range..
CREATE FUNCTION [dbo].[FN_BIL_GetDepositNProvisionalBetnDateRange] 
(@startDate datetime, @endDate datetime)
RETURNS TABLE
AS
    RETURN
    (
    SELECT
        dates.Dates 'BillingDate',
        dep.AdvanceReceived,
        dep.AdvanceSettled,
        prov.ProvisionalAmount
    FROM (SELECT
        *
    FROM FN_COMMON_GetAllDatesBetweenRange(CONVERT(date, ISNULL(@startDate, GETDATE())), CONVERT(date, ISNULL(@endDate, GETDATE())))) dates
    LEFT JOIN (SELECT
        CONVERT(date, CreatedOn) 'BillingDate',
        SUM(CASE WHEN DepositType = 'Deposit' THEN Amount ELSE 0 END) AS 'AdvanceReceived',
        SUM(CASE WHEN DepositType = 'depositdeduct' OR DepositType = 'ReturnDeposit' THEN Amount ELSE 0 END) AS 'AdvanceSettled'
    FROM BIL_TXN_Deposit
    WHERE CONVERT(date, CreatedOn) BETWEEN CONVERT(date, ISNULL(@startDate, GETDATE())) AND CONVERT(date, ISNULL(@endDate, GETDATE()))
    GROUP BY CONVERT(date, CreatedOn)) dep ON dates.Dates = dep.BillingDate
    LEFT JOIN (SELECT
        CONVERT(date, CreatedOn) 'BillingDate',
        SUM(ISNULL(TotalAmount, 0)) 'ProvisionalAmount'
    FROM BIL_TXN_BillingTransactionItems
    WHERE BillStatus = 'provisional'
    AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, ISNULL(@startDate, GETDATE())) AND CONVERT(date, ISNULL(@endDate, GETDATE()))
    GROUP BY CONVERT(date, CreatedOn)) prov ON dates.Dates = prov.BillingDate
    )
GO
--alter sp patient census
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Ramavtar/03Aug'18			created the script
2		Ramavtar/9Aug'18		getting summary of deposit, and deposit-return (as table 3),
								excluding entry where billstatus == cancel and for return items we are not including its amount in totalcollection
----------------------------------------------------------
*/
BEGIN

DECLARE @cols AS NVARCHAR(MAX),
		@query AS NVARCHAR(MAX)

select @cols = STUFF((SELECT DISTINCT ',' + QUOTENAME(i.ServiceDepartmentName) 
               FROM BIL_TXN_BillingTransactionItems i
			   WHERE CONVERT(DATE,i.CreatedOn) BETWEEN @FromDate AND @ToDate
			   FOR XML PATH(''), TYPE
               ).value('.', 'NVARCHAR(MAX)') 
               ,1,1,'')	

---to remove the start and end bracket from column names in return table.
SELECT 'DoctorName' + ISNULL(',' + REPLACE(REPLACE(@cols, '[', ''), ']', ''), '') + ',TotalPatient,TotalCollection' AS ColumnName

set @query = 
'
SELECT A.*, B.TotalPatient, B.TotalCollection 
	FROM (
		SELECT ProviderName AS DoctorName,' + @cols + ' 
			FROM (
                SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,ServiceDepartmentName,BillingTransactionItemId
					FROM BIL_TXN_BillingTransactionItems
					WHERE CONVERT(DATE,CreatedOn) BETWEEN ''' + CONVERT(VARCHAR(10),@FromDate, 101) + ''' AND ''' +  CONVERT(VARCHAR(10),@ToDate, 101) + '''
					AND BillStatus != ''cancel''
				) x
				PIVOT 
				(
				COUNT(BillingTransactionItemId)
                FOR ServiceDepartmentName IN (' + @cols + ')
				) p 
	) A			
	JOIN
	(
	SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,(COUNT(Distinct PatientId)) as TotalPatient, 
			SUM(CASE WHEN ReturnStatus IS NULL THEN TotalAmount ELSE 0 END) as TotalCollection
		FROM BIL_TXN_BillingTransactionItems
		WHERE CONVERT(DATE,CreatedOn) BETWEEN ''' + CONVERT(VARCHAR(10),@FromDate, 101) + ''' AND ''' +  CONVERT(VARCHAR(10),@ToDate, 101) + '''
		AND BillStatus != ''cancel''
		GROUP BY ProviderName
	)B 
	ON A.DoctorName = B.ProviderName
'
execute(@query);
 ---Table: 3: Get Summary of Deposit, Deposit-Return to show in patient census--
SELECT
    SUM(ISNULL(AdvanceReceived, 0)) 'AdvanceReceived',
    SUM(ISNULL(AdvanceSettled, 0)) 'AdvanceSettled'
FROM [FN_BIL_GetDepositNProvisionalBetnDateRange] (@FromDate, @todate)
END
GO
--- END: Ramavtar: 9thAugust'18 function for deposit summary and alter sp for patient census ---

---START: NageshBB: 09 Aug 2018: script for make nullable column
Alter Table PHrm_WriteOffItems
alter column [GoodReceiptItemId] int null
go

---END: NageshBB: 09 Aug 2018: script for make nullable column

----START : Dinesh : 10th Aug'18 --View and Function of Billing Txn Changes : -----------


/****** Object:  View [dbo].[VW_BIL_TxnItemsInfo]    Script Date: 8/10/2018 4:04:17 PM ******/
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
		txnItm.TotalAmount, txnItm.BillStatus
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

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemInfo]    Script Date: 8/10/2018 4:05:09 PM ******/
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
 -------------------------------------------------------------------------
*/
RETURN
(
  -- get distinct CreatedDate and other informations about all transactionsItems--
  -- when an item is Unpaid, it's transactionid will always be null--
	Select Convert(date, CreatedOn) 'BillingDate',NULL AS BillingTransactionId,'unpaid' AS BillStatus, BillingTransactionItemId, ServiceDepartmentId, PatientId, ItemId, ProviderId,
	Price, Quantity, SubTotal,DiscountAmount,Tax,TotalAmount,Remarks
	FROM BIL_TXN_BillingTransactionItems
	WHERE PaidDate is null or Convert(Date,PaidDate) != Convert(Date,CreatedOn)
	UNION
	 -- get distinct CreatedDate and other informations about only paid transactionsItems--
	Select Convert(date, PaidDate) 'BillingDate',BillingTransactionId,'paid' as BillStatus, BillingTransactionItemId, ServiceDepartmentId, PatientId, ItemId, ProviderId,
	price, Quantity, SubTotal,DiscountAmount,Tax,TotalAmount,Remarks
	FROM BIL_TXN_BillingTransactionItems
	where BillStatus='Paid'
		UNION
   Select Convert(date,br.CreatedOn)'BillingDate',bi.BillingTransactionId,'return' as BillStatus, BillingTransactionItemId, ServiceDepartmentId, bi.PatientId, ItemId, ProviderId,
	     SUM(IsNULL(Price,0)) Price,SUM(IsNULL(Quantity,0)) Quantity ,SUM(IsNULL(bi.SubTotal,0)) SubTotal  ,SUM(IsNULL(bi.DiscountAmount,0)) DiscountAmount ,
		SUM(IsNULL(Tax,0)) Tax ,SUM(IsNULL(bi.TotalAmount,0)) TotalAmount, 
		MAX(br.Remarks) 'Remarks'  -- find a way to concatenate remarks if possible. this might be incorrect when 1 item is returned multiple times 
  from BIL_TXN_BillingTransactionItems bi join BIL_TXN_InvoiceReturn br on bi.BillingTransactionId=br.BillingTransactionId
	  where ReturnStatus=1
   Group By Convert(date, br.CreatedOn),bi.BillingTransactionId, BillingTransactionItemId, ServiceDepartmentId, bi.PatientId, ItemId, ProviderId
		UNION
    -- get distinct CreatedDate and other informations of Cancelled transactionsItems--
	Select Convert(date, CancelledOn) 'CancelledDate',BillingTransactionId,'cancel' as BillStatus, BillingTransactionItemId, ServiceDepartmentId, PatientId, ItemId, ProviderId,
	price, Quantity, SubTotal,DiscountAmount,Tax,TotalAmount,CancelRemarks
	from BIL_TXN_BillingTransactionItems
	where CancelledOn is not null
)

GO



----END : Dinesh : 10th Aug'18 --View and Function of Billing Txn Changes : -----------



--START: Vikas/2018-08-10 Changes :StoredProcedure for Breakage Items report---------------

/****** Object:  StoredProcedure [dbo].[SP_PHRM_BreakageItemReport]    Script Date: 10-08-2018 19:13:30 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRM_BreakageItemReport] 
@FromDate datetime=null,
@ToDate datetime=null
 AS
 /*
FileName: [[SP_PHRM_BreakageItemReport]]
CreatedBy/date:Vikas/2018-08-10
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Vikas/2018-08-10	              created the script

--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
		select convert(date,wi.CreatedOn) as [Date], usr.UserName, i.ItemName,sum(wi.TotalAmount) as [TotalAmount] from PHRM_WriteOffItems wi	
			  join RBAC_User usr
				  on wi.CreatedBy=usr.EmployeeId
			  join PHRM_MST_Item i
				  on i.ItemId=wi.ItemId
		      where CONVERT(date, wi.CreatedOn) Between @FromDate AND @ToDate
        group by convert(date, wi.CreatedOn), usr.UserName,i.ItemName
	   End
End
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRM_GoodsReceiptProductReport]    Script Date: 10-08-2018 19:13:35 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRM_GoodsReceiptProductReport] 
@FromDate datetime=null,
 @ToDate datetime=null
 AS
 /*
FileName: [[SP_PHRM_BreakageItemReport]]
CreatedBy/date:Vikas/2018-08-10
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Vikas/2018-08-10	              created the script

--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
	  select grp.ItemId, grp.ItemName, grp.BatchNo,grp.ReceivedQuantity,grp.FreeQuantity,sum(grp.GRItemPrice) as[ItemPrice],grp.MRP,spl.SupplierName,spl.ContactNo,convert(date,grp.CreatedOn) as [Date] from PHRM_GoodsReceiptItems grp
		  join PHRM_GoodsReceipt gr
			on grp.GoodReceiptId=gr.GoodReceiptId
			  join PHRM_MST_Supplier spl
			  on gr.SupplierId=spl.SupplierId
			  where CONVERT(date, grp.CreatedOn) Between @FromDate AND @ToDate
	   group by grp.ItemId, grp.ItemName, grp.BatchNo,grp.ReceivedQuantity ,grp.FreeQuantity,spl.SupplierName,grp.MRP,spl.ContactNo, convert(date,grp.CreatedOn)

	End
End
GO

--END: Vikas/2018-08-10 Changes :StoredProcedure for StoredProcedure for Breakage Items report---------------
---START: 2018-08-11: Nagesh: script updated
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRM_GoodsReceiptProductReport] 
@FromDate datetime=null,
 @ToDate datetime=null,
 @ItemId int=0
 AS
 /*
FileName: [[SP_PHRM_BreakageItemReport]]
CreatedBy/date:Vikas/2018-08-10
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Vikas/2018-08-10	              created the script
2		Nagesh/2018-08-11				updated
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and (@ItemId >0)) 
		BEGIN
	  select grp.ItemId, grp.ItemName, grp.BatchNo,grp.ReceivedQuantity,grp.FreeQuantity,
	  grp.GRItemPrice as [ItemPrice],grp.MRP,spl.SupplierName,spl.ContactNo,
	  convert(date,grp.CreatedOn) as [Date] from PHRM_GoodsReceiptItems grp
		  join PHRM_GoodsReceipt gr
			on grp.GoodReceiptId=gr.GoodReceiptId
			  join PHRM_MST_Supplier spl
			  on gr.SupplierId=spl.SupplierId
			  where CONVERT(date, grp.CreatedOn) Between @FromDate AND @ToDate  and grp.ItemId=@ItemId	   
	End
End
Go
---END: 2018-08-11: Nagesh: script updated
---Start: 2018-08-14: Abhishek: credit note
alter table [dbo].[PHRM_ReturnToSupplier]
add  CreditNotePrintId int
GO
alter table [PHRM_ReturnToSupplier]
alter column CreditNoteId varchar(200)
GO
alter table [dbo].[PHRM_ReturnToSupplier]
add  Remarks nvarchar(255)
Go

---End: 2018-08-14: Abhishek:  credit note

---Start: 2018-08-15: Dinesh : Added Sevicedepatment shortname and displayed on BillingItems with code --------
EXEC sp_rename 'BIL_MST_ServiceDepartment.ServiceDepartmentFullName', 'ServiceDepartmentShortName', 'COLUMN';  
Go
---Start: 2018-08-15: Dinesh : Added Sevicedepatment shortname and displayed on BillingItems with code --------




---Start: SUD: 15Aug'18--For Billing Reports---

IF OBJECT_ID('VW_BIL_TxnItemsInfoWithDateSeparation') IS NOT NULL
BEGIN
DROP VIEW [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]
END
GO

/****** Object:  View [dbo].[VW_BIL_TxnItemsInfo_New_SUD]    Script Date: 8/15/2018 2:32:27 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]
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
 1.     14Aug'118- sud      created         To be used as common view for those billing reports where item level segregation is required
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
  CASE WHEN txnItm.BillStatus = 'provisional' 
            THEN Convert(DATE, txnItm.CreatedOn) 
     WHEN   (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
	        THEN Convert(DATE,txnItm.CreatedOn)
     WHEN  (txnItm.BillingTransactionId IS NOT NULL
	        AND ( 
			      (txn.PaymentMode != 'credit' AND COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn) )
					OR (txnItm.BillStatus='unpaid' and  COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
					OR (txnItm.BillStatus='paid' and  COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txnItm.PaidDate))
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
	 ret.TotalAmount 'ReturnAmount',
	 ret.Remarks 'ReturnRemarks',
	 txnItm.CancelRemarks as 'CancelRemarks'


FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO



IF OBJECT_ID('FN_BIL_GetTxnItemsInfoWithDateSeparation') IS NOT NULL
BEGIN
DROP FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]
END
GO
/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemInfo_NEW_SUD]    Script Date: 8/15/2018 2:36:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-08-12','2018-08-13')
--- select * from VW_BIL_TxnItemsInfoWithDateSeparation
/*
 File: [FN_BIL_GetTxnItemsInfoWithDateSeparation]
 Created: 15Aug'18 <sud>
 Description: This takes item's info from a view and does separation of Different Dates and Amount based on input values.
 Remarks: Needs Revision, Add more fields as per requirments
 ------------Change History------------
 S.No.   ModifiedBy/Date         Remarks
 ----------------------------------------
 1.      Sud/15Aug'18           Initial Version
 ------------------------------------------ */
AS
RETURN
(
	SELECT 
	CASE WHEN A.PaidDate IS NOT NULL THEN A.TotalAmount ELSE 0 END AS 'PaidAmount',
    CASE WHEN A.ReturnDate IS NOT NULL THEN A.TotalAmount ELSE 0 END AS 'ReturnAmount',
	CASE WHEN A.CreditDate IS NOT NULL AND A.PaidDate IS NULL AND A.ReturnDate IS NULL THEN A.TotalAmount ELSE 0 END AS 'CreditAmount',
	CASE WHEN A.CancelledDate IS NOT NULL THEN A.TotalAmount ELSE 0 END AS 'CancelledAmount',
	CASE WHEN A.ProvisionalDate IS NOT NULL 
	      AND A.CancelledDate IS NULL
		  AND A.CreditDate IS NULL
	      AND A.PaidDate IS NULL 
		  AND A.ReturnDate IS NULL 
		  THEN A.TotalAmount ELSE 0 END AS 'ProvisionalAmount'
	,* FROM 
	(
	
	SELECT PatientId, BillingTransactionItemId, ItemId, ItemName, ServiceDepartmentId,ServiceDepartmentName,ProviderId,ProviderName,SubTotal,DiscountAmount,TotalAmount,
		CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
		CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
		CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
		CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
		CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
	FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
	) A
	---no need to return those items where none of below fields are there---
	WHERE A.ProvisionalDate IS NOT NULL
		OR A.CancelledDate IS NOT NULL
		OR A.CreditDate IS NOT NULL
		OR A.PaidDate IS NOT NULL
		OR A.ReturnDate IS NOT NULL
)
GO

IF OBJECT_ID('SP_Report_BILL_PatientCensus') IS NOT NULL
BEGIN
DROP PROCEDURE [dbo].[SP_Report_BILL_PatientCensus]
END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_PatientCensus]    Script Date: 8/15/2018 2:42:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_BILL_PatientCensus] --'2018-08-08','2018-08-08'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Ramavtar/03Aug'18			created the script
2		Ramavtar/9Aug'18		getting summary of deposit, and deposit-return (as table 3),
								excluding entry where billstatus == cancel and for return items we are not including its amount in totalcollection
3.      sud  -- updated after creating common function. 
----------------------------------------------------------
*/
BEGIN

DECLARE @cols AS NVARCHAR(MAX),
		@query AS NVARCHAR(MAX)

select @cols = STUFF((SELECT DISTINCT ',' + QUOTENAME(i.ServiceDepartmentName) 
               FROM BIL_TXN_BillingTransactionItems i
			   WHERE CONVERT(DATE,i.CreatedOn) BETWEEN @FromDate AND @ToDate
			   FOR XML PATH(''), TYPE
               ).value('.', 'NVARCHAR(MAX)') 
               ,1,1,'')	

---to remove the start and end bracket from column names in return table.
SELECT 'DoctorName' + ISNULL(',' + REPLACE(REPLACE(@cols, '[', ''), ']', ''), '') + ',TotalPatient,TotalCollection' AS ColumnName

set @query = 
'
SELECT A.*, B.TotalPatient, B.TotalCollection 
	FROM (
		SELECT ProviderName AS DoctorName,' + @cols + ' 
			FROM (
                SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,ServiceDepartmentName, BillingTransactionItemId
				 FROM [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]('''+CONVERT(VARCHAR(10),@FromDate, 101)+''' ,'''+CONVERT(VARCHAR(10),@ToDate, 101)+''' )
				) x
				PIVOT 
				(
				COUNT(BillingTransactionItemId)
                FOR ServiceDepartmentName IN (' + @cols + ')
				) p 
	) A			
	JOIN
	(
	SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,(COUNT(Distinct PatientId)) as TotalPatient, 
			SUM(PaidAmount - ReturnAmount + ProvisionalAmount - CancelledAmount + CreditAmount ) as TotalCollection
		FROM [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]('''+CONVERT(VARCHAR(10),@FromDate, 101)+''' ,'''+CONVERT(VARCHAR(10),@ToDate, 101)+''' )
		
		GROUP BY ProviderName
	)B 
	ON A.DoctorName = B.ProviderName
'

--print(@query)
 execute(@query);
 ---Table: 3: Get Summary of Deposit, Deposit-Return, Provisional & Unpaid to show in patient census--
SELECT Distinct dep.AdvanceReceived,dep.AdvanceSettled,prov.Provisional,prov.Unpaid 
FROM 
(
	SELECT
		SUM(ISNULL(AdvanceReceived, 0)) 'AdvanceReceived',
		SUM(ISNULL(AdvanceSettled, 0)) 'AdvanceSettled'
	FROM [FN_BIL_GetDepositNProvisionalBetnDateRange] (@FromDate, @ToDate)
) dep,
(
   Select SUM(ProvisionalAmount-CancelledAmount) 'Provisional',
       SUM(CreditAmount) 'Unpaid'
	   from  [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation](@FromDate, @ToDate)
)prov

END
GO

---END: SUD: 15Aug'18--For Billing Reports---

--STart: Anish: 15Aug'18 Clinical Diagnosis Table and its Related Fields Addition in other Tables--
CREATE TABLE dbo.CLN_Diagnosis(
	DiagnosisId INT IDENTITY(1,1) PRIMARY KEY,
	NotesId INT,
	PatientId INT,
	PatientVisitId INT,
	ICD10Code varchar(500),
	ICD10Description varchar(500),
	ICD10ID INT,	
	CreatedBy INT,
	CreatedOn datetime,
	ModifiedBy INT,
	ModifiedOn datetime
);
Go

Alter table [dbo].[LAB_TestRequisition]
	add DiagnosisId INT NULL
GO
Alter table [dbo].[RAD_PatientImagingRequisition]
	add DiagnosisId INT NULL
GO
Alter table [dbo].[PHRM_PrescriptionItems]
	add DiagnosisId INT NULL
Go

Alter table [dbo].[LAB_TestRequisition] WITH CHECK ADD CONSTRAINT [FK_LAB_TestRequisition_CLN_Disgnosis]  FOREIGN KEY ([DiagnosisId]) REFERENCES [dbo].[CLN_Diagnosis]  ([DiagnosisId]);
Alter table [dbo].[PHRM_PrescriptionItems] WITH CHECK ADD CONSTRAINT [FK_PHRM_PrescriptionItems_CLN_Disgnosis]  FOREIGN KEY ([DiagnosisId]) REFERENCES [dbo].[CLN_Diagnosis] ([DiagnosisId]);
Alter table [dbo].[RAD_PatientImagingRequisition] WITH CHECK ADD CONSTRAINT [FK_RAD_PatientImagingRequisition_CLN_Disgnosis]  FOREIGN KEY ([DiagnosisId]) REFERENCES [dbo].[CLN_Diagnosis] ([DiagnosisId]);
GO
alter table [dbo].[PHRM_PrescriptionItems]
add ModifiedOn datetime null
go

alter table [dbo].[PHRM_PrescriptionItems]
add ModifiedBy int null
go
--End: Anish-15 August----


--START: 15 August 2018 : NageshBB Pharmacy module script
--added remark column 
Alter Table PHRM_StockManage
Add Remark varchar(max) 
Go
--make BatchNo as varchar form int
Alter table PHRM_StockManage
Alter column BatchNo varchar(100)
Go

--rename ItemPrice to MRP
IF COL_LENGTH('dbo.phrm_stockManage','ItemPrice') IS NOT NULL
 BEGIN
  EXEC sp_rename 'dbo.phrm_stockManage.ItemPrice', 'MRP', 'COLUMN';
 END
 Go
 --rename SellingPrice to Price
 IF COL_LENGTH('dbo.phrm_stockManage','SellingPrice') IS NOT NULL
 BEGIN
  EXEC sp_rename 'dbo.phrm_stockManage.SellingPrice', 'Price', 'COLUMN';
 END
 Go
 --END: 15 August 2018 : NageshBB Pharmacy module script

 --START: 16 August 2018: NageshBB Pharmacy Module changes in Goods receipt report stored procedure for load result with or without item name
 SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Alter PROCEDURE [dbo].[SP_PHRM_GoodsReceiptProductReport] 
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
2      Nagesh/2018-08-11               updated
--------------------------------------------------------
*/
 BEGIN
  
    BEGIN
    select grp.ItemId, grp.ItemName, grp.BatchNo,grp.ReceivedQuantity,grp.FreeQuantity,
    grp.GRItemPrice as [ItemPrice],grp.MRP,spl.SupplierName,spl.ContactNo,
    convert(date,grp.CreatedOn) as [Date] from PHRM_GoodsReceiptItems grp
      join PHRM_GoodsReceipt gr
      on grp.GoodReceiptId=gr.GoodReceiptId
        join PHRM_MST_Supplier spl
        on gr.SupplierId=spl.SupplierId
        where(( CONVERT(date, grp.CreatedOn) Between @FromDate AND @ToDate) and (@ItemId IS NULL or @ItemId=0 ))
        or  ((CONVERT(date, grp.CreatedOn) Between @FromDate AND @ToDate)  and grp.ItemId=@ItemId  ) 
  End
End
GO
--START: 16 August 2018: NageshBB Pharmacy Module changes in Goods receipt report stored procedure for load result with or without item name

-----START: sud 16Aug-18--- Updating ServiceDepartmentShortName in BIL_MST_ServiceDepartment Table---
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='OPD'	 WHERE ServiceDepartmentName='OPD'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='IPD'	 WHERE ServiceDepartmentName='IPD'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='RC'	 WHERE ServiceDepartmentName='ROOM CHARGES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='MSC'	 WHERE ServiceDepartmentName='MISCELLANEOUS'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='ENT'	 WHERE ServiceDepartmentName='ENT OPERATION'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='ENT'	 WHERE ServiceDepartmentName='ENT PROCEDURES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='DCO'	 WHERE ServiceDepartmentName='DAY CARE OPERATION'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='GYN'	 WHERE ServiceDepartmentName='GYNAECOLOGY PROCEDURE(OPD ONLY)'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='GYN'	 WHERE ServiceDepartmentName='OT GYNAE PROCEDURE INDOOR'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='MED'	 WHERE ServiceDepartmentName='MEDICINE PROCEDURE'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='PULM'	 WHERE ServiceDepartmentName='PULMONOLOGY BRONCHO-SCOPY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='GASTRO'	 WHERE ServiceDepartmentName='GASTROENTEROLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='THX'	 WHERE ServiceDepartmentName='THORAX'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='GIT'	 WHERE ServiceDepartmentName='G.I.T.'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='STTS'	 WHERE ServiceDepartmentName='SOFT TISSUE TUMOR SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='GYN'	 WHERE ServiceDepartmentName='GYNAECOLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='ANS'	 WHERE ServiceDepartmentName='ANASTHESIA'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LS'	 WHERE ServiceDepartmentName='LAPROSCOPIC SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='BS'	 WHERE ServiceDepartmentName='BIRIATRIC SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='SURGICAL OPERATIONS'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='SURGICAL PROCEDURES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='URO'	 WHERE ServiceDepartmentName='UROLOGICAL OPERATION'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LITHO'	 WHERE ServiceDepartmentName='LITHOTRIPSYS'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='CRANIAL SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='SPINAL SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='PLASTIC SURGERY, BODY SCULPTURE'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='BRS'	 WHERE ServiceDepartmentName='BREAST'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='BURN SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='EYE SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='FL'	 WHERE ServiceDepartmentName='FACE LIFT'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='FN'	 WHERE ServiceDepartmentName='FACIAL NERVE (UNILATERAL)'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='GENERAL PLASTIC SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='GEN'	 WHERE ServiceDepartmentName='GENITALS'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='HAND SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='MD'	 WHERE ServiceDepartmentName='MANDIBULAR DEFORMITY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='RHN'	 WHERE ServiceDepartmentName='RHINOPLASTY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='TE'	 WHERE ServiceDepartmentName='TISSUE EXPANDERS'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='US'	 WHERE ServiceDepartmentName='URETHRAL STRICTURES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='EARS SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAP'	 WHERE ServiceDepartmentName='LIPS & PALATE'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LYM'	 WHERE ServiceDepartmentName='LYMPHOEDEMA'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='MF' WHERE ServiceDepartmentName='MANDIBLE FRACTURES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='MF' WHERE ServiceDepartmentName='MAXILLA FRACTURES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='MF' WHERE ServiceDepartmentName='MAXILO FACIAL'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='NOSE SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SP' WHERE ServiceDepartmentName='SKIN PROCEDURE'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='NEPH'	 WHERE ServiceDepartmentName='NEPHROLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='NEPH'	 WHERE ServiceDepartmentName='NEPHROLOGY/ PACKAGES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='EP' WHERE ServiceDepartmentName='EYE PROCEDURE'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='AMP'	 WHERE ServiceDepartmentName='AMPUTATIONS'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='ARTH'	 WHERE ServiceDepartmentName='ARTHROPLASTY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='PHYSIO'	 WHERE ServiceDepartmentName='PHYSIOTHERAPY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='RP' WHERE ServiceDepartmentName='RECONSTRUCTIVE PROCEDURES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='SPINE SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='EFA'	 WHERE ServiceDepartmentName='EXTERNAL FIXATOR APP'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='PED'	 WHERE ServiceDepartmentName='PAEDIATRIC'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='SURGERY CHARGES(PAEDIATRIC)'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='DUCT'	 WHERE ServiceDepartmentName='DUCT'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='DENT'	 WHERE ServiceDepartmentName='DENTISTRY (APICOCTOMY)'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='SRG'	 WHERE ServiceDepartmentName='SURGERY CHARGES (PAEDIATRIC)'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='NULL'	 WHERE ServiceDepartmentName='FIXED ORTHODONTIC TREATMENT'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='NULL'	 WHERE ServiceDepartmentName='SIMPLE EXTRACTION'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='NULL'	 WHERE ServiceDepartmentName='TRANSPORT'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='MAM'	 WHERE ServiceDepartmentName='MAMMOLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='NEU'	 WHERE ServiceDepartmentName='NEUROLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='PSYCHO'	 WHERE ServiceDepartmentName='PSYCHO TEST: PAPER PENCIL TEST'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='THERAPY'	 WHERE ServiceDepartmentName='THERAPY CHARGES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='PT'	 WHERE ServiceDepartmentName='PERFORMANCE TEST'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='CC'	 WHERE ServiceDepartmentName='CONSULTATION CHARGES FOR PRIVATE PATIENT'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='CC'	 WHERE ServiceDepartmentName='OPD CONSULTATION'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='CARDIO'	 WHERE ServiceDepartmentName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='ANGIO'	 WHERE ServiceDepartmentName='CORONARY/PERIPHERAL ANGIOGPRAPHY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='CATH'	 WHERE ServiceDepartmentName='PROCEDURES IN CATH LAB'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='ELC'	 WHERE ServiceDepartmentName='ELECTROPHYSIOLOGY STUDIES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='DI'	 WHERE ServiceDepartmentName='DEVICE IMPLANTATION'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='CARDIO'	 WHERE ServiceDepartmentName='CARDIOVASCULAR SURGERY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='MSC'	 WHERE ServiceDepartmentName='MISCELLENOUS CHARGES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='CON'	 WHERE ServiceDepartmentName='CONSUMEABLES'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='ADT'	 WHERE ServiceDepartmentName='CHARGES FOR BED,DR.VISIT & ADMISSION FEE'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='MRI'	 WHERE ServiceDepartmentName='MRI'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='CT'	 WHERE ServiceDepartmentName='C.T. SCAN'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='USG'	 WHERE ServiceDepartmentName='ULTRASOUND'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='USG'	 WHERE ServiceDepartmentName='ULTRASOUND COLOR DOPPLER'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='NULL'	 WHERE ServiceDepartmentName='BMD-BONEDENSITOMETRY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='NULL'	 WHERE ServiceDepartmentName='OPG-ORTHOPANTOGRAM'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='NULL'	 WHERE ServiceDepartmentName='MAMMOGRAPHY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='XRAY'	 WHERE ServiceDepartmentName='X-RAY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='ATOMIC ABSORTION'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='BIOCHEMISTRY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='BLOOD BANK'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='CLNICAL PATHOLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='CLINICAL PATHOLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='CYTOLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='KIDNEY BIOPSY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='SKIN BIOPSY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='CONJUNCTIVAL BIOPSY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='EXTERNAL LAB-3'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='EXTERNAL LAB - 1'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='EXTERNAL LAB - 2'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='HISTOPATHOLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='IMMUNOHISTROCHEMISTRY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='MOLECULAR DIAGNOSTICS'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='SEROLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='MICROBIOLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='HEMATOLOGY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='LAB'	 WHERE ServiceDepartmentName='LABORATORY'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='OT'	 WHERE ServiceDepartmentName='OT'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='ORTHO'	 WHERE ServiceDepartmentName='Ortho Procedures'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='DEXA'	 WHERE ServiceDepartmentName='DEXA'
Update BIL_MST_ServiceDepartment SET ServiceDepartmentShortName='IMAGING'	 WHERE ServiceDepartmentName='IMAGING'
GO
-----END: sud 16Aug-18--- Updating ServiceDepartmentShortName in BIL_MST_ServiceDepartment Table---

-----START: dinesh 16Aug'18  --Changed SP and FN of Patient_Census Report and SP of Departmentwise Sales Daybook correction -------


IF OBJECT_ID('FN_BIL_GetTxnItemsInfoWithDateSeparation') IS NOT NULL
BEGIN
DROP FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
--select * from FN_BIL_GetTxnItemsInfoWithDateSeparation ('2018-08-08', '2018-08-08')
END
GO
/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemInfo_NEW_SUD]    Script Date: 8/15/2018 2:36:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-08-12','2018-08-13')
--- select * from VW_BIL_TxnItemsInfoWithDateSeparation
/*
 File: [FN_BIL_GetTxnItemsInfoWithDateSeparation]
 Created: 15Aug'18 <sud>
 Description: This takes item's info from a view and does separation of Different Dates and Amount based on input values.
 Remarks: Needs Revision, Add more fields as per requirments
 ------------Change History------------
 S.No.   ModifiedBy/Date         Remarks
 ----------------------------------------
 1.      Sud/15Aug'18           Initial Version
 ------------------------------------------ */
AS
RETURN
(
	SELECT 
	CASE WHEN A.PaidDate IS NOT NULL THEN A.TotalAmount ELSE 0 END AS 'PaidAmount',
    CASE WHEN A.ReturnDate IS NOT NULL THEN A.TotalAmount ELSE 0 END AS 'ReturnAmount',
	CASE WHEN A.CreditDate IS NOT NULL AND A.PaidDate IS NULL AND A.ReturnDate IS NULL THEN A.TotalAmount ELSE 0 END AS 'CreditAmount',
	CASE WHEN A.CancelledDate IS NOT NULL THEN A.TotalAmount ELSE 0 END AS 'CancelledAmount',
	CASE WHEN A.ProvisionalDate IS NOT NULL 
	      AND A.CancelledDate IS NULL
		  AND A.CreditDate IS NULL
	      AND A.PaidDate IS NULL 
		  AND A.ReturnDate IS NULL 
		  THEN A.TotalAmount ELSE 0 END AS 'ProvisionalAmount'
	,* FROM 
	(
	
	SELECT PatientId, BillingTransactionItemId, ItemId, ItemName, ServiceDepartmentId,
	( CASE when (itmInfo.ServiceDepartmentName='ATOMIC ABSORTION')
OR(itmInfo.ServiceDepartmentName='BIOCHEMISTRY')
OR(itmInfo.ServiceDepartmentName='CLNICAL PATHOLOGY')
OR(itmInfo.ServiceDepartmentName='CLINICAL PATHOLOGY')
OR(itmInfo.ServiceDepartmentName='CYTOLOGY')
OR(itmInfo.ServiceDepartmentName='KIDNEY BIOPSY')
OR(itmInfo.ServiceDepartmentName='SKIN BIOPSY')
OR(itmInfo.ServiceDepartmentName='CONJUNCTIVAL BIOPSY')
OR(itmInfo.ServiceDepartmentName='EXTERNAL LAB-3')
OR(itmInfo.ServiceDepartmentName='EXTERNAL LAB - 1')
OR(itmInfo.ServiceDepartmentName='EXTERNAL LAB - 2')
OR(itmInfo.ServiceDepartmentName='HISTOPATHOLOGY')
OR(itmInfo.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY')
OR(itmInfo.ServiceDepartmentName='MOLECULAR DIAGNOSTICS')
OR(itmInfo.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS')
OR(itmInfo.ServiceDepartmentName='SEROLOGY')
OR(itmInfo.ServiceDepartmentName='MICROBIOLOGY')
OR(itmInfo.ServiceDepartmentName='HEMATOLOGY')
OR(itmInfo.ServiceDepartmentName='LABORATORY')

    then ('LABS')
 when (itmInfo.ServiceDepartmentName='DUCT')
OR(itmInfo.ServiceDepartmentName='MAMMOLOGY')
OR(itmInfo.ServiceDepartmentName='PERFORMANCE TEST') 
OR(itmInfo.ServiceDepartmentName='MRI')
OR(itmInfo.ServiceDepartmentName='C.T. SCAN')
OR(itmInfo.ServiceDepartmentName='ULTRASOUND')
OR(itmInfo.ServiceDepartmentName='ULTRASOUND COLOR DOPPLER')
OR(itmInfo.ServiceDepartmentName='BMD-BONEDENSITOMETRY')
OR(itmInfo.ServiceDepartmentName='OPG-ORTHOPANTOGRAM')
OR(itmInfo.ServiceDepartmentName='MAMMOGRAPHY')
OR(itmInfo.ServiceDepartmentName='X-RAY')
OR(itmInfo.ServiceDepartmentName='DEXA')
OR(itmInfo.ServiceDepartmentName='IMAGING')
then ('RADIOLOGY')
when(itmInfo.ServiceDepartmentName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
OR(itmInfo.ServiceDepartmentName='CARDIOVASCULAR SURGERY')
then 'CTVS'
	ELSE
 (itmInfo.ServiceDepartmentName) END ) AS ServiceDepartmentName ,
	ProviderId,ProviderName,SubTotal,DiscountAmount,TotalAmount,
		CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
		CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
		CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
		CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
		CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
	FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
	) A
	---no need to return those items where none of below fields are there---
	WHERE A.ProvisionalDate IS NOT NULL
		OR A.CancelledDate IS NOT NULL
		OR A.CreditDate IS NOT NULL
		OR A.PaidDate IS NOT NULL
		OR A.ReturnDate IS NOT NULL
)
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_PatientCensus]    Script Date: 8/16/2018 12:51:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus] --[SP_Report_BILL_PatientCensus] '2018-08-08','2018-08-08'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Ramavtar/03Aug'18			created the script
2		Ramavtar/9Aug'18		getting summary of deposit, and deposit-return (as table 3),
								excluding entry where billstatus == cancel and for return items we are not including its amount in totalcollection
3.      sud  -- updated after creating common function. 
----------------------------------------------------------
*/
BEGIN

DECLARE @cols AS NVARCHAR(MAX),
		@query AS NVARCHAR(MAX)

select @cols = STUFF((SELECT DISTINCT ',' + 
( CASE when (i.ServiceDepartmentName='ATOMIC ABSORTION')
OR(i.ServiceDepartmentName='BIOCHEMISTRY')
OR(i.ServiceDepartmentName='CLNICAL PATHOLOGY')
OR(i.ServiceDepartmentName='CLINICAL PATHOLOGY')
OR(i.ServiceDepartmentName='CYTOLOGY')
OR(i.ServiceDepartmentName='KIDNEY BIOPSY')
OR(i.ServiceDepartmentName='SKIN BIOPSY')
OR(i.ServiceDepartmentName='CONJUNCTIVAL BIOPSY')
OR(i.ServiceDepartmentName='EXTERNAL LAB-3')
OR(i.ServiceDepartmentName='EXTERNAL LAB - 1')
OR(i.ServiceDepartmentName='EXTERNAL LAB - 2')
OR(i.ServiceDepartmentName='HISTOPATHOLOGY')
OR(i.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY')
OR(i.ServiceDepartmentName='MOLECULAR DIAGNOSTICS')
OR(i.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS')
OR(i.ServiceDepartmentName='SEROLOGY')
OR(i.ServiceDepartmentName='MICROBIOLOGY')
OR(i.ServiceDepartmentName='HEMATOLOGY')
OR(i.ServiceDepartmentName='LABORATORY')

    then QUOTENAME ('LABS')
	when(i.ServiceDepartmentName='DUCT')
OR(i.ServiceDepartmentName='MAMMOLOGY')
OR(i.ServiceDepartmentName='PERFORMANCE TEST') 
OR(i.ServiceDepartmentName='MRI')
OR(i.ServiceDepartmentName='C.T. SCAN')
OR(i.ServiceDepartmentName='ULTRASOUND')
OR(i.ServiceDepartmentName='ULTRASOUND COLOR DOPPLER')
OR(i.ServiceDepartmentName='BMD-BONEDENSITOMETRY')
OR(i.ServiceDepartmentName='OPG-ORTHOPANTOGRAM')
OR(i.ServiceDepartmentName='MAMMOGRAPHY')
OR(i.ServiceDepartmentName='X-RAY')
OR(i.ServiceDepartmentName='DEXA')
OR(i.ServiceDepartmentName='IMAGING')
then ('RADIOLOGY')
when(i.ServiceDepartmentName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
OR(i.ServiceDepartmentName='CARDIOVASCULAR SURGERY')
then 'CTVS'
	ELSE
 QUOTENAME(i.ServiceDepartmentName) END) 
               FROM BIL_TXN_BillingTransactionItems i
			   WHERE CONVERT(DATE,i.CreatedOn) BETWEEN @FromDate AND @ToDate
			   FOR XML PATH(''), TYPE
               ).value('.', 'NVARCHAR(MAX)') 
               ,1,1,'')	

---to remove the start and end bracket from column names in return table.
SELECT 'DoctorName' + ISNULL(',' + REPLACE(REPLACE(@cols, '[', ''), ']', ''), '') + ',TotalPatient,TotalCollection' AS ColumnName

set @query = 
'
SELECT A.*, B.TotalPatient, B.TotalCollection 
	FROM (
		SELECT ProviderName AS DoctorName,' + @cols + ' 
			FROM (
                SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,ServiceDepartmentName,
				
				 BillingTransactionItemId
				 FROM [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] ('''+CONVERT(VARCHAR(10),@FromDate, 101)+''' ,'''+CONVERT(VARCHAR(10),@ToDate, 101)+''' )
				) x
				PIVOT 
				(
				COUNT(BillingTransactionItemId)
                FOR 
				ServiceDepartmentName
				IN (' + @cols + ')
				) p 
	) A			
	JOIN
	(
	SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,(COUNT(Distinct PatientId)) as TotalPatient, 
			SUM(PaidAmount - ReturnAmount + ProvisionalAmount - CancelledAmount + CreditAmount ) as TotalCollection
		FROM [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]('''+CONVERT(VARCHAR(10),@FromDate, 101)+''' ,'''+CONVERT(VARCHAR(10),@ToDate, 101)+''' )
		
		GROUP BY ProviderName
	)B 
	ON A.DoctorName = B.ProviderName
'

--print(@query)
 execute(@query);
 ---Table: 3: Get Summary of Deposit, Deposit-Return, Provisional & Unpaid to show in patient census--
SELECT Distinct dep.AdvanceReceived,dep.AdvanceSettled,prov.Provisional,prov.Unpaid 
FROM 
(
	SELECT
		SUM(ISNULL(AdvanceReceived, 0)) 'AdvanceReceived',
		SUM(ISNULL(AdvanceSettled, 0)) 'AdvanceSettled'
	FROM [FN_BIL_GetDepositNProvisionalBetnDateRange] (@FromDate, @ToDate)
) dep,
(
   Select SUM(ProvisionalAmount-CancelledAmount) 'Provisional',
       SUM(CreditAmount) 'Unpaid'
	   from  [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation](@FromDate, @ToDate)
)prov

END

GO


/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_DepartmentSalesDaybook]    Script Date: 8/16/2018 9:46:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BILL_DepartmentSalesDaybook]--[SP_Report_BILL_DepartmentSalesDaybook] '2018-08-08','2018-08-08' 
@FromDate Date=null ,
@ToDate Date=null	
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
1       Dinesh/2018-08-01					NA										*/


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
-----END: dinesh 16Aug'18  --Changed SP and FN of Patient_Census Report -------

---START: Ramavtar 17Aug'18 -- change in SP of DoctorReport ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorReport]	--- [SP_Report_BIL_DoctorReport] '2018-08-08','2018-08-08'
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@ProviderName varchar(max)=null
AS
/*
FileName: [SP_Report_BIL_DoctorReport]
CreatedBy/date: nagesh/2017-05-25
Description: to get count of appointments per Department between given dates.
Remarks:    
Change History
---------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------
1       nagesh/2017-05-25	                     created the script
2       umed / 2017-06-14                        Modify the script i.e format 
                                                 and remove time from paid date  
3.      dinesh/ 2017-08-04						 Modified the script and maintained the Return as well as Cancel Status 
4       Umed/2018-04-17                         Added Order by Date in Desc Order
5.		ramavtar/2018-05-31						correction in where condition 
												(providerName didnt had space in between First & Last name)
6.		ramavtar/2018-08-17						changed the SP,now getting txn values from function 'FN_BIL_GetTxnItemsInfoWithDateSeparation'
--------------------------------------------------------------------
*/
BEGIN
    IF (@FromDate IS NOT NULL)
        OR (@ToDate IS NOT NULL)
        OR (@ProviderName IS NOT NULL)
        OR (LEN(@ProviderName) > 0)
    BEGIN
        SELECT
            COALESCE(fnItm.ReturnDate, fnItm.CreditDate, fnItm.PaidDate, fnItm.CancelledDate, fnItm.ProvisionalDate) 'Date',
            ISNULL(fnItm.ProviderName, 'NoDoctor') 'Doctor',
            p.PatientCode 'HospitalNo',
            p.FirstName + ISNULL(p.MiddleName + ' ', '') + p.LastName 'PatientName',
            fnItm.ServiceDepartmentName 'Department',
            fnItm.ItemName 'Item',
            ISNULL(vmItm.Price, 0) 'Rate',
            ISNULL(vmItm.Quantity, 0) 'Quantity',
            fnItm.SubTotal 'SubTotal',
            fnItm.DiscountAmount 'Discount',
            fnItm.TotalAmount 'Total',
            fnItm.ReturnAmount 'ReturnAmount',
            fnItm.CancelledAmount 'CancelTotal',
            ISNULL(fnItm.TotalAmount, 0) - ISNULL(fnItm.CancelledAmount, 0) - ISNULL(fnItm.ReturnAmount, 0) 'NetAmount'
        FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate) fnItm
        JOIN VW_BIL_TxnItemsInfoWithDateSeparation vmItm
            ON fnItm.BillingTransactionItemId = vmItm.BillingTransactionItemId
        JOIN PAT_Patient p
            ON fnItm.PatientId = p.PatientId
        WHERE fnItm.ProviderName LIKE '%' + ISNULL(@ProviderName, '') + '%'
        ORDER BY COALESCE(fnItm.ReturnDate, fnItm.CreditDate, fnItm.PaidDate, fnItm.CancelledDate, fnItm.ProvisionalDate) DESC
    END
END
GO
---END: Ramavtar 17Aug'18 -- change in SP of DoctorReport ---

---START: NageshBB 18 Aug 2018--Alter VisitCode column and query for update patientVisit Code in Pat_PatientVisits Table

--alter visitCode column
Alter table PAT_PatientVisits
Alter column VisitCode varchar(10)
Go
--update all 2017 visit patient Visit code
update PAT_PatientVisits
set VisitCode=newV.NewVisitCode from (
SELECT   
PatientVisitId
,NewVisitCode=case when VisitType='outpatient' then concat('V17' ,Format(ROW_NUMBER() over (Partition by VisitType order by PatientVisitId),'D5')) else concat('H17' ,Format(ROW_NUMBER() over (Partition by VisitType order by PatientVisitId),'D5'))
end    
FROM PAT_PatientVisits where Year(VisitDate)=2017
) as newV
where newV.PatientVisitId= PAT_PatientVisits.PatientVisitId

--update all 2018 visit patient Visit code
update PAT_PatientVisits
set VisitCode=newV.NewVisitCode from (
SELECT   
PatientVisitId
,NewVisitCode=case when VisitType='outpatient' then concat('V18' ,Format(ROW_NUMBER() over (Partition by VisitType order by PatientVisitId),'D5')) else concat('H18' ,Format(ROW_NUMBER() over (Partition by VisitType order by PatientVisitId),'D5'))
end    
FROM PAT_PatientVisits where Year(VisitDate)=2018
) as newV
where newV.PatientVisitId= PAT_PatientVisits.PatientVisitId

---START: NageshBB 18 Aug 2018--Alter VisitCode column and query for update patientVisit Code in Pat_PatientVisits Table


---Start: Sud:19Aug'18--- Billing Reports changes---

/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_SalesDaybook]    Script Date: 8/18/2018 6:50:14 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BILL_SalesDaybook]
	  @FromDate DateTime=null,
	  @ToDate DateTime=null
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
  WHERE txn.BillStatus='unpaid' OR (txn.BillStatus ='paid' AND Convert(date,PaidDate) != Convert(date,CreatedOn))
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
 and txn.BillStatus='unpaid'
 GROUP BY Convert(date,ret.CreatedOn)
) crRet
ON d.BillingDate = crRet.BillingDate

ORDER BY d.BillingDate

END

---End: Sud:19Aug'18--- Billing Reports changes---


---START: NageshBB: 20-Aug-2018--alter SP_Report_ADT_DischargedPatient, SP_Report_BIL_DischargeBreakup stored procedure for DischargeBillBreakup

/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_DischargedPatient]    Script Date: 20-08-2018 16:14:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-------------------------[SP_Report_ADT_TotalAdmittedPatient]--------------------------------------------

--------------------------[SP_Report_ADT_DischargedPatient]---------------------------------------------------

ALTER PROCEDURE [dbo].[SP_Report_ADT_DischargedPatient]  
@FromDate Date=null ,
@ToDate Date=null	
AS

/*
FileName: [SP_Report_ADT_DischargedPatient]
CreatedBy/date: Sagar/2017-05-27
Description: to get the count of total discharged patient between Given Date
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       Sagar/2017-05-27	                   created the script
2       Umed / 2017-06-08                      Modify the script i.e format and alias of table
                                               and Remove The time from DischargeDate
											   and Group the Query by DischargeDate
3.     Dinesh/2017-06-28                       all the information is requred to see the discharge report and count at the last 
4      Umed/2018-04-23                      Apply Order by Desc on DischargeDate and Added SRNo also
5.	   Nagesh/2018-08-20						add PatientId in result
-------------------------------------------------------------------------------
*/

BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN 
			select 
			  (Cast(ROW_NUMBER() OVER (ORDER BY  DischargeDate desc)  as int)) as SN,
		      (P.Firstname+''+P.LastName) 'PatientName',
              convert(varchar(20),CONVERT(date,DischargeDate)) 'DischargedDate', 
              convert(varchar(20),CONVERT(date,AdmissionDate)) 'AdmissionDate',
              (E.FirstName+' '+E.LastName) 'AdmittedDoctor',
              A.PatientVisitId 'VisitId' ,
			  A.PatientId
		    from ADT_PatientAdmission A join PAT_PatientVisits V
                on A.PatientVisitId = V.PatientVisitId
               Join EMP_EMPLOYEE E on A.AdmittingDoctorId= E.EmployeeId 
               Join PAT_Patient P on P.PatientId=V.PatientId
		    where A.AdmissionStatus='discharged' and CONVERT(date,DischargeDate) between @FromDate and @ToDate
			
            union all
            select  NULL,NULL,NULL,'','Total Discharged Count ',Count('PatientVisitId'),null
            from ADT_PatientAdmission 
			where AdmissionStatus='discharged' and CONVERT(date,DischargeDate) between @FromDate and @ToDate

			Order By convert(varchar(20),CONVERT(date,DischargeDate)) desc
	END	
END
Go
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
 where PatientId=@PatientId and  ( bti.PatientVisitId=@PatientVisitId OR  bti.CreatedOn Between @FromDate and @ToDate )       
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
Go
---END: NageshBB: 20-Aug-2018--alter SP_Report_ADT_DischargedPatient, SP_Report_BIL_DischargeBreakup stored procedure for DischargeBillBreakup

---Start: Sud: 21Aug'18--for Inpatient Discharge Bill---
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
VALUES('Billing','ShowIpReceiptSeparately',1,'boolean','whether or not to show Inpatient Discharge Bill in different format or not.')
GO

SET IDENTITY_INSERT [dbo].[ADT_DischargeType] ON 
GO
INSERT [dbo].[ADT_DischargeType] ([DischargeTypeId], [DischargeTypeName], [Description], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (1, N'Cured', NULL, 1, CAST(N'2017-06-15T00:00:00.000' AS DateTime), NULL, NULL, 1)
GO
INSERT [dbo].[ADT_DischargeType] ([DischargeTypeId], [DischargeTypeName], [Description], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (2, N'Not Cured', NULL, 1, CAST(N'2017-06-15T00:00:00.000' AS DateTime), NULL, NULL, 1)
GO
INSERT [dbo].[ADT_DischargeType] ([DischargeTypeId], [DischargeTypeName], [Description], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (3, N'Referred Out', NULL, 1, CAST(N'2017-06-15T00:00:00.000' AS DateTime), NULL, NULL, 1)
GO
INSERT [dbo].[ADT_DischargeType] ([DischargeTypeId], [DischargeTypeName], [Description], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (4, N'DOR/LAMA/DAMA', NULL, 1, CAST(N'2017-06-15T00:00:00.000' AS DateTime), NULL, NULL, 1)
GO
INSERT [dbo].[ADT_DischargeType] ([DischargeTypeId], [DischargeTypeName], [Description], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (5, N'Absconded', NULL, 1, CAST(N'2017-08-16T00:00:00.000' AS DateTime), NULL, NULL, 1)
GO
INSERT [dbo].[ADT_DischargeType] ([DischargeTypeId], [DischargeTypeName], [Description], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (6, N'Death < 48 Hours', NULL, 1, CAST(N'2017-10-26T00:00:00.000' AS DateTime), NULL, NULL, 1)
GO
INSERT [dbo].[ADT_DischargeType] ([DischargeTypeId], [DischargeTypeName], [Description], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (7, N'Death >= 48 Hours', NULL, 1, CAST(N'2017-10-26T00:00:00.000' AS DateTime), NULL, NULL, 1)
GO
SET IDENTITY_INSERT [dbo].[ADT_DischargeType] OFF
GO
---END: Sud: 21Aug'18--for Inpatient Discharge Bill---


---start: sud-21Aug'18--for health card Item Insert---
Declare @SrvDptId INT
SET @SrvDptId=(Select TOP 1 ServiceDepartmentId from BIL_MST_ServiceDepartment where ServiceDepartmentName='MISCELLENOUS CHARGES')

Declare @ItemId INT
SET @ItemId= ( SELECT MAX(ItemID) from BIL_CFG_BillITemPrice where ServiceDepartmentId=@SrvDptId)
SET @ItemId=@ItemId+1 ---setting new itemid (increment max by 1)

If NOT EXISTS(Select 1 from BIL_CFG_BillItemPrice where ServiceDepartmentId=@SrvDptId AND ItemName='Health Card')
BEGIN
 INSERT INTO BIL_CFG_BillItemPrice(ServiceDepartmentId,ItemName,Price,ItemId,TaxApplicable,DiscountApplicable,CreatedBy,CreatedOn, IsActive,DisplaySeq)
 VALUES(@SrvDptId,'Health Card',50,@ItemId,0,1,1,GETDATE(),1,100)
END
GO
---end: sud-21Aug'18--for health card Item Insert---


---start: sud: 21Aug'18-- General Bug-Fixes in billing---
ALTER TABLE [dbo].[BIL_CFG_BillItemPrice] ADD  CONSTRAINT [BilItemPrice_DisplaySeq]  
DEFAULT ((100)) FOR [DisplaySeq]
GO
Update BIL_CFG_BillItemPrice
SET DisplaySeq=100  WHERE DisplaySeq is null
GO

/****** Object:  Trigger [dbo].[BIL_CFG_BillItemPrice_UpdateTrigger]    Script Date: 8/21/2018 2:59:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO
--Trigger after update table for maintain History of Price change
CREATE TRIGGER [dbo].[BIL_CFG_BillItemPrice_UpdateTrigger]
       ON [dbo].[BIL_CFG_BillItemPrice]
AFTER UPDATE
AS
BEGIN
       SET NOCOUNT ON; 
       DECLARE @BillItemPriceId int,@ServiceDepartmentId int, @ItemId int, @Price float,
		@CreatedBy int, @StartDate datetime, @EndDate datetime
       Declare @newPrice float, @oldPrice float
 	
--take value when price column updated
       IF UPDATE(Price)
       BEGIN             
			SELECT @newPrice=i.Price from INSERTED i;
			SELECT @oldPrice=i.Price from DELETED i;
			IF @newPrice!=@oldPrice
			BEGIN
				--Set new values to local variable for insert operation
				SELECT @BillItemPriceId  =i.BillItemPriceId  FROM INSERTED i;
				SELECT @ServiceDepartmentId  =i.ServiceDepartmentId  FROM INSERTED i;
				SELECT @ItemId  =i.ItemId  FROM INSERTED i;
				SELECT @EndDate  =i.CreatedOn  FROM INSERTED i;

				--Set old values to local variable for insert operation
				SELECT @CreatedBy  =i.CreatedBy FROM DELETED i;
				SELECT @StartDate  =i.CreatedOn  FROM DELETED i;

				INSERT INTO [BIL_CFG_BillItemPrice_History]([BillItemPriceId] ,[ServiceDepartmentId] ,[ItemId] ,[Price]  ,[CreatedBy] ,[StartDate] ,[EndDate])
				values (@BillItemPriceId ,@ServiceDepartmentId ,@ItemId ,@oldPrice  ,@CreatedBy ,@StartDate ,@EndDate)
			END  --End If
       END  --End If             
END

GO

ALTER TABLE [dbo].[BIL_CFG_BillItemPrice] ENABLE TRIGGER [BIL_CFG_BillItemPrice_UpdateTrigger]
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_DischargedPatient]    Script Date: 8/21/2018 6:54:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_ADT_DischargedPatient] 
	@FromDate Date=null ,
	@ToDate Date=null	
AS
/*
FileName: [SP_Report_ADT_DischargedPatient]
CreatedBy/date: Nagesh/Sud (upto 2018-08-21) 
Description: to get the count of total discharged patient between Given Date
Remarks:    Removed TotalAdmittedCount for now, add it later if needed.
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1.     Nagesh/Sud (upto 2018-08-21)             Revised
-------------------------------------------------------------------------------
*/

BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN 
			select 
			  (Cast(ROW_NUMBER() OVER (ORDER BY  DischargeDate desc)  as int)) as SN,
			  	P.FirstName+ISNULL(' '+P.MiddleName,'')+' '+ P.LastName AS PatientName,
		      --(P.Firstname+''+P.LastName) 'PatientName',
              convert(varchar(20),CONVERT(date,DischargeDate)) 'DischargedDate', 
              convert(varchar(20),CONVERT(date,AdmissionDate)) 'AdmissionDate',
			  ISNULL(E.Salutation+' ','')+ E.FirstName+ISNULL(' '+E.MiddleName,'')+' '+ E.LastName 'AdmittingDoctor',
              --(E.FirstName+' '+E.LastName) 'AdmittingDoctor',
              A.PatientVisitId 'VisitId',
			  V.VisitCode 'IpNumber',
			  P.PatientCode 'HospitalNumber',
			  A.PatientId
		    from ADT_PatientAdmission A join PAT_PatientVisits V
                on A.PatientVisitId = V.PatientVisitId
               Join EMP_EMPLOYEE E on A.AdmittingDoctorId= E.EmployeeId 
               Join PAT_Patient P on P.PatientId=V.PatientId
		    where A.AdmissionStatus='discharged' and CONVERT(date,DischargeDate) between @FromDate and @ToDate
			Order By convert(varchar(20),CONVERT(date,DischargeDate)) desc
   --         union all
   --         select  NULL,NULL,NULL,'','Total Discharged Count ',Count('PatientVisitId'),null
   --         from ADT_PatientAdmission 
			--where AdmissionStatus='discharged' and CONVERT(date,DischargeDate) between @FromDate and @ToDate
	
	END	
END
GO
---end: sud: 21Aug'18-- General Bug-Fixes in billing---
