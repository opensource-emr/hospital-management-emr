 ----- START: 17Dec'18	Ramavtar: change in where condition (checking for credit records) -----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		Sud/02Sept'18
-- Description:		to show doctor summary
-- Remarks: 
---[SP_Report_BIL_DoctorSummary] '2018-08-02','2018-09-02'
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorSummary]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1.		Sud/02Sept'18			     Initial Draft
2.		Ramavtar/12Nov'18			 sorting by doctorname
3.	    Ramavtar/30Nov'18			 summary added
4.		Ramavtar/17Dec'18			change in where condition (checking for credit records)
----------------------------------------------------------
*/
BEGIN
    SELECT
        ISNULL(Providerid, 0) 'DoctorId',
        CASE WHEN ISNULL(ProviderId, 0) != 0 THEN ProviderName ELSE 'NoDoctor' END AS 'DoctorName',
        SUM(ISNULL(SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
        SUM(ISNULL(ReturnAmount, 0)) AS 'Refund',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) AS 'NetTotal'
    FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	WHERE BillStatus != 'cancelled' 
			AND BillStatus != 'provisional'
			AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
    GROUP BY 
		ProviderId,
		ProviderName	
	ORDER BY 2 

	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorDeptSummary]	--SP_Report_BIL_DoctorDeptSummary '2018-07-01', '2018-11-22'
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL,
  @DoctorId INT = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Sud/02Sept'18           Initial Draft
2	 Ramavtar/30Nov'18		 summary added 
3	 Ramavtar/17Dec'18		 change in where condition (checking for credit records)
----------------------------------------------------------
*/
BEGIN
    SELECT
        ISNULL(fnItems.ProviderId, 0) 'DoctorId',
        ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
        fnItems.ServiceDepartmentName 'ServiceDepartment',
        SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
        SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
        SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
        SUM(ISNULL(fnItems.ReturnAmount, 0)) 'ReturnAmount',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) 'NetSales'
    FROM (SELECT *
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)) fnItems

    ---NOTE: we should return All if @DoctorId=NULL, DoctorName='NoDoctor' when @DoctorId=0
    WHERE (ISNULL(@DoctorId, ISNULL(fnItems.ProviderId, 0)) = ISNULL(fnItems.ProviderId, 0))
		AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
		AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
    GROUP BY fnItems.ServiceDepartmentName,
             ISNULL(fnItems.ProviderId, 0),
             ISNULL(fnItems.ProviderName, 'NoDoctor')
			 order by 2

    ---Table:2 Get Provisional Amount in above Date Filter---
    SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	WHERE (ISNULL(@DoctorId, ISNULL(ProviderId, 0)) = ISNULL(ProviderId, 0))
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
----------------------------------------------------------
*/
BEGIN
    SELECT
        COALESCE(fnItems.ReturnDate, fnItems.PaidDate, fnItems.CreditDate) 'Date',
        ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
        pat.PatientCode,
        pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
        fnItems.ServiceDepartmentName,
        fnItems.ItemName,
        fnItems.Price,
        fnItems.Quantity,
        fnItems.SubTotal,
        fnItems.DiscountAmount,
        fnItems.TotalAmount,
        fnItems.ReturnAmount,
        fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
    FROM (SELECT
        *
    FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)) fnItems
    JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
    WHERE fnItems.ServiceDepartmentName = @SrvDeptName
		AND ISNULL(fnItems.ProviderId, 0) = @DoctorId
		AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
		AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
	ORDER BY 1 DESC

	---Table 2: returning provisional amount---
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate)
	WHERE ServiceDepartmentName = @SrvDeptName
		AND ISNULL(ProviderId,0) = @DoctorId
END
GO

---START: NageshBB: 17 Dec 2018: Altered sp for Income segregation report bug fixing

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_IncomeSegregation]
	--SP_Report_BIL_IncomeSegregation '2018-12-09','2018-12-09' 
@FromDate Date=null ,
@ToDate Date=null	
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
									here we are using View and Function (VW_BIL_TxnItemsInfoWithDateSeparation,FN_BIL_GetSrvDeptReportingName)
7.		Nagesh/17Dec'18				altered for handle bug - last days credit bill showing cash bill on settlement day
-------------------------------------------------------------------------------
*/
BEGIN
 ;
  WITH IncomeSegCTE As (
--Cash Sale  which has paidDate, here paid date as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName](ServiceDepartmentName,ItemName) as ServDeptName
,PaidDate as BillingDate,Quantity as Unit, SubTotal as CashSales,DiscountAmount as CashDiscount,0 as CreditSales,0 as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from VW_BIL_TxnItemsInfoWithDateSeparation where PaidDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and PaidDate is not null and CreditDate is null
),
 IncomeSegCreditCTE
  AS(
--Credit Sale, which has CreditDate, here CreditDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName](ServiceDepartmentName,ItemName) as ServDeptName
,CreditDate as BillingDate,Quantity as Unit, 0 as CashSales,0 as CashDiscount,SubTotal as CreditSales,DiscountAmount as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from VW_BIL_TxnItemsInfoWithDateSeparation where CreditDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and CreditDate is not null
),
 IncomeSegCreditReturnedCTE
  AS(
--Return Sale, which has Return Date, here ReturnDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName](ServiceDepartmentName,ItemName) as ServDeptName
,ReturnDate as BillingDate,0 as Unit, 0 as CashSales,0 as CashDiscount,0 as CreditSales,0 as CreditDiscount, Quantity as ReturnQuantity, SubTotal as ReturnAmount, DiscountAmount as ReturnDiscount
from VW_BIL_TxnItemsInfoWithDateSeparation where ReturnDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and ReturnDate is not null
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
  End
  Go
---START: NageshBB: 17 Dec 2018: Altered sp for Income segregation report bug fixing

--START : Ajay/Ram :17Dec2018 Changed calculation of MIS report
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:  	Ramavtar/30Aug'18
-- Description:	daily mis report getting billing items with its department and billingtype info
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_DailyMISReport] --'2018-07-27','2018-07-27'
@FromDate datetime = NULL,
@ToDate datetime = NULL
AS
/*
FileName: SP_Report_BILL_DailyMISReport
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date		Remarks
-------------------------------------------------------
1       Ramavtar/2018-08-30	    created the script
2       Sud/2018-08-30          revised for provisional and billstatus
3		Ajay/2018-12-12			getting data for SummaryView
4		Ajay/2018-12-14			getting data from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]
5		Ram/Ajay 17Dec2018		corrected calculation
--------------------------------------------------------
*/
BEGIN

  ;
  WITH BilTxnItemsCTE
  AS (SELECT
    bil.BillingTransactionItemId,
    pat.PatientCode AS HospitalNo,
    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName AS PatientName,
    bil.ProviderName,
    dept.DepartmentName,
    bil.ServiceDepartmentName,
    CONVERT(varchar(25), @FromDate) + '-to-' + CONVERT(varchar(25), @ToDate) 'billDate',
    --ISNULL(bil.PaidDate,bil.CreatedDate) AS billDate,
    bil.ItemName AS [description],
    bil.Price,
    bil.Quantity AS qty,
    bil.SubTotal AS subTotal,
    bil.DiscountAmount AS discount,
    ISNULL(bil.ReturnAmount, 0) AS ReturnAmount,
    bil.TotalAmount AS total,
    bil.BillStatus, --sud:30Aug'18
    bil.ProvisionalAmount AS 'ProvisionalAmount',--sud:30Aug'18 (We'll need this as well)
    ISNULL(bil.BillingType, 'OutPatient')
    AS BillingType
  FROM (SELECT
    *
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate)) bil
  JOIN PAT_Patient pat
    ON bil.PatientId = pat.PatientId
  JOIN BIL_MST_ServiceDepartment sdept
    ON sdept.ServiceDepartmentId = bil.ServiceDepartmentId
  JOIN MST_Department dept
    ON dept.DepartmentId = sdept.DepartmentId
  --WHERE bil.CreatedDate BETWEEN @FromDate AND @ToDate
  )
  SELECT
    CASE
      WHEN [DepartmentName] = 'ADMINISTRATION' AND
        ServiceDepartmentName != 'CONSUMEABLES' THEN 'ADMINISTRATIVE'
      WHEN ServiceDepartmentName = 'CONSUMEABLES' THEN 'CONSUMEABLES'
      WHEN [DepartmentName] = 'OT' AND
        [DepartmentName] != '' THEN 'OT'
      WHEN [Description] = 'BED CHARGES' THEN 'BED'
      WHEN [Description] = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' THEN 'DOCTOR AND NURSING CARE'
      WHEN [DepartmentName] = 'MEDICINE' THEN 'MEDICINE'
      WHEN [DepartmentName] = 'SURGERY' THEN 'SURGERY'
      ELSE DepartmentName
    END AS departmentName,
    HospitalNo 'hospitalNo',
    PatientName 'patientName',
    ProviderName 'providerName',
    BillingType,
    description 'itemName',
    Price 'price',
    qty 'quantity',
    subTotal 'subTotal',
    discount 'discount',
    ReturnAmount 'return',
    ISNULL(total, 0) - ISNULL(ReturnAmount, 0) 'netTotal',
    BillStatus 'billStatus',
    ProvisionalAmount AS 'provisional'
  FROM BilTxnItemsCTE
  ORDER BY departmentName ASC, BillingType DESC, PatientName ASC

  --OPD----
  --select provider,OPDCount and TotalAmount
  SELECT
    ISNULL(fn.ProviderId, 0) 'ProviderId',--ProviderId
    ISNULL(fn.ProviderName, 'NoDoctor') 'ProviderName',--ProviderName
    COUNT(
		CASE
			WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.PatientId
			WHEN fn.BillStatus != 'return' THEN fn.PatientId
		END) - COUNT(CASE WHEN fn.BillStatus = 'return' THEN fn.PatientId END) 'Count',--Count
    --COUNT(fn.PatientId) 'Count',
    SUM(
		CASE
			WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
			WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			ELSE 0
		END) - SUM(CASE
			WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
		ELSE 0
		END) 'TotalAmount'--TotalAmount
  --SUM(fn.TotalAmount) 'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  WHERE fn.ItemName LIKE '%Consultation%'
	AND fn.BillStatus != 'provisional'
	AND fn.BillStatus != 'cancelled'
	AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  GROUP BY fn.ProviderId,
           fn.ProviderName
  ORDER BY 2

  --Health Card----
  SELECT
    ItemName AS 'ItemName',--ItemName
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
      WHEN fn.BillStatus != 'return' THEN fn.Quantity
	  ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.Quantity
	  ELSE 0
    END) 'Count',--Count
    --COUNT (fn.Quantity) 'Count',
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND
        ((fn.PaymentMode = 'credit' AND
        fn.CreditDate IS NOT NULL) OR
        (fn.PaymentMode != 'credit' AND
        fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
      WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
      ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
      ELSE 0
    END) 'TotalAmount'--TotalAmount
  --SUM(TotalAmount) 'TotalAmount' 
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  WHERE ItemName LIKE '%Health Card%'
	AND fn.BillStatus != 'provisional'
	AND fn.BillStatus != 'cancelled'
	AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  GROUP BY ItemName

  --LAB--
  SELECT
    VisitType,-------VisitType
    ai.ServiceDepartmentName,-----ServiceDepartmentName
    SUM([Count]) 'Count',-----------Count
    SUM([TotalAmount]) 'TotalAmount'--TotalAmount
  FROM (
	SELECT
		CASE
			WHEN fn.visitType = 'inpatient' THEN 'IPD'
			WHEN fn.visitType = 'outpatient' THEN 'OPD'
			ELSE fn.VisitType
		END AS VisitType,---VisitType
    fn.ServiceDepartmentName,--ServiceDepartmentName
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
      WHEN fn.BillStatus != 'return' THEN fn.Quantity
	  ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.Quantity
	  ELSE 0
    END) 'Count',--Count
    --Count(fn.Quantity)'Count',--Count
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND
        ((fn.PaymentMode = 'credit' AND
        fn.CreditDate IS NOT NULL) OR
        (fn.PaymentMode != 'credit' AND
        fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
      WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
      ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
      ELSE 0
    END) 'TotalAmount'--Total Amount
  --SUM(fn.TotalAmount)'TotalAmount' 
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
  WHERE sd.IntegrationName = 'LAB'
  AND fn.BillStatus != 'cancelled'
  AND fn.BillStatus != 'provisional'
  AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  GROUP BY fn.VisitType,
           fn.ServiceDepartmentName) ai
  GROUP BY ai.ServiceDepartmentName,
           VisitType
  UNION ALL
  SELECT
    ' ',
    'Total',
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
      WHEN fn.BillStatus != 'return' THEN fn.Quantity
	  ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.Quantity
	  ELSE 0
    END) 'Total Count',
    --Count(Quantity)'Total Count',
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND
        ((fn.PaymentMode = 'credit' AND
        fn.CreditDate IS NOT NULL) OR
        (fn.PaymentMode != 'credit' AND
        fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
      WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
      ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
      ELSE 0
    END) 'TotalAmount'
  --SUM(TotalAmount) 
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  INNER JOIN BIL_MST_ServiceDepartment sd
    ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
  WHERE sd.IntegrationName = 'LAB'
  AND fn.BillStatus != 'cancelled'
  AND fn.BillStatus != 'provisional'
  AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  ORDER BY VisitType

  --Radiology--
  SELECT
    CASE
      WHEN bt.visitType = 'inpatient' THEN 'IPD'
      WHEN bt.visitType = 'outpatient' THEN 'OPD'
      ELSE bt.VisitType
    END AS VisitType,
    bt.ServiceDepartmentName,
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
      WHEN fn.BillStatus != 'return' THEN fn.Quantity
	  ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.Quantity
	  ELSE 0
    END) 'Count',
    --Count(fn.Quantity)'Count',
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
      WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
      ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
      ELSE 0
    END) 'TotalAmount'
  --SUM(fn.TotalAmount)'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  INNER JOIN BIL_TXN_BillingTransactionItems bt
    ON fn.BillingTransactionItemId = bt.BillingTransactionItemId
  INNER JOIN BIL_MST_ServiceDepartment sd
    ON bt.ServiceDepartmentId = sd.ServiceDepartmentId
  WHERE sd.IntegrationName = 'Radiology'
  AND fn.BillStatus != 'cancelled'
  AND fn.BillStatus != 'provisional'
  AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  GROUP BY bt.VisitType,
           bt.ServiceDepartmentName
  UNION ALL
  SELECT
    ' ',
    'Total',
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
      WHEN fn.BillStatus != 'return' THEN fn.Quantity
	  ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.Quantity
	  ELSE 0
    END) 'Total Count',
    --Count(fn.Quantity)'Total Count',
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND
        ((fn.PaymentMode = 'credit' AND
        fn.CreditDate IS NOT NULL) OR
        (fn.PaymentMode != 'credit' AND
        fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
      WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
      ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
      ELSE 0
    END) 'TotalAmount'
  --SUM(fn.TotalAmount)
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  INNER JOIN BIL_MST_ServiceDepartment sd
    ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
  WHERE sd.IntegrationName = 'Radiology'
  AND fn.BillStatus != 'cancelled'
  AND fn.BillStatus != 'provisional'
  AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  ORDER BY VisitType

  --Health Clinic--
  SELECT
    x.ItemName,
    SUM(Quantity) 'Unit',
    SUM(TotalAmount) 'TotalAmount'
  FROM (SELECT
			CASE
			  WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
			  WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
			  WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
			  WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
			  ELSE 'Unknown'
			END AS ItemName,
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
			  WHEN fn.BillStatus != 'return' THEN fn.Quantity
			  ELSE 0
			END)
			- SUM(CASE
			  WHEN fn.BillStatus = 'return' THEN fn.Quantity
			  ELSE 0
			END) 'Quantity',
			--SUM(ISNULL(fn.Quantity, 0))  'Quantity',
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
			  WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			  ELSE 0
			END)
			- SUM(CASE
			  WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
			  ELSE 0
			END) 'TotalAmount'
  --SUM(ISNULL(fn.TotalAmount, 0)) 'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  WHERE fn.BillStatus != 'cancelled'
  AND fn.BillStatus != 'provisional'
  AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  GROUP BY fn.ItemName) AS x
  WHERE x.ItemName != 'Unknown'
  GROUP BY x.ItemName

  --OT--
  SELECT
    fn.ProviderID,
    fn.ProviderName,
    dept.DepartmentName,
    fn.ItemName,
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND  ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
      WHEN fn.BillStatus != 'return' THEN fn.Quantity
	  ELSE 0
    END) - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.Quantity
	  ELSE 0
    END) 'Quantity',
    --Count (fn.Quantity) 'Quantity',
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
      WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
      ELSE 0
    END) - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
      ELSE 0
    END) 'TotalAmount'
  --SUM(fn.TotalAmount) 'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  INNER JOIN EMP_Employee emp
    ON fn.ProviderId = emp.EmployeeId
  INNER JOIN MST_Department dept
    ON emp.DepartmentId = dept.DepartmentId
  WHERE fn.ItemName LIKE '%operation%'
  AND fn.BillStatus != 'cancelled'
  AND fn.BillStatus != 'provisional'
  AND (fn.PaymentMode != 'credit'
  OR fn.CreditDate IS NOT NULL)
  GROUP BY fn.ProviderId,
           fn.ProviderName,
           dept.DepartmentName,
           fn.ItemName,
           fn.ServiceDepartmentName

  --Labor--
  SELECT
    x.ItemName,
    SUM(Quantity) 'Unit',
    SUM(TotalAmount) 'TotalAmount'
  FROM (SELECT
    CASE
      WHEN fn.ItemName LIKE '%labor%' THEN 'LABOR Normal'
      WHEN fn.ItemName LIKE '%LSCS%' THEN 'LABOR LSCS'
      ELSE 'Unknown'
    END AS ItemName,
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND
        ((fn.PaymentMode = 'credit' AND
        fn.CreditDate IS NOT NULL) OR
        (fn.PaymentMode != 'credit' AND
        fn.PaidDate IS NOT NULL)) THEN fn.Quantity
      WHEN fn.BillStatus != 'return' THEN fn.Quantity
      ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.Quantity
      ELSE 0
    END) 'Quantity',
    --SUM(ISNULL(fn.Quantity, 0))  'Quantity',
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND
        ((fn.PaymentMode = 'credit' AND
        fn.CreditDate IS NOT NULL) OR
        (fn.PaymentMode != 'credit' AND
        fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
      WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
      ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
      ELSE 0
    END) 'TotalAmount'
  --SUM(ISNULL(fn.TotalAmount, 0)) 'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  WHERE fn.BillStatus != 'cancelled'
  AND fn.BillStatus != 'provisional'
  AND (fn.PaymentMode != 'credit'
  OR fn.CreditDate IS NOT NULL)
  GROUP BY fn.ItemName) AS x
  WHERE x.ItemName != 'Unknown'
  GROUP BY x.ItemName

  --IPD--
  --count of Admitted, Discharged Patient
  SELECT
    'No. of Admitted Patient' AS 'PatientType',
    COUNT(patientAdmissionId) 'Count'
  FROM ADT_PatientAdmission
  WHERE CONVERT(date, AdmissionDate) BETWEEN @FromDate AND @ToDate
  AND DischargeDate IS NULL
  UNION ALL
  SELECT
    'No. of Discharged Patient',
    COUNT(patientAdmissionId)
  FROM ADT_PatientAdmission
  WHERE CONVERT(date, DischargeDate) BETWEEN @FromDate AND @ToDate
  AND DischargeDate IS NOT NULL

  --rest other servicedepartments count and income list--
  SELECT
    x.ItemName,
    SUM(Quantity) 'Unit',
    SUM(TotalAmount) 'TotalAmount'
  FROM (SELECT
    CASE
      WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
      WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
      WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
      WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
      WHEN fn.ItemName LIKE '%CONSULTATION%' THEN 'OPD'
      WHEN fn.ItemName LIKE '%Health Card%' THEN 'Health Card'
      WHEN sd.IntegrationName LIKE 'LAB' THEN 'LABS'
      WHEN sd.IntegrationName LIKE 'RADIOLOGY' THEN 'RADIOLOGY'
      WHEN fn.ItemName LIKE '%Operation%' THEN 'OPERATION CHARGES'
      ELSE 'Hospital Other Charges'
    END AS ItemName,
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND
        ((fn.PaymentMode = 'credit' AND
        fn.CreditDate IS NOT NULL) OR
        (fn.PaymentMode != 'credit' AND
        fn.PaidDate IS NOT NULL)) THEN fn.Quantity
      WHEN fn.BillStatus != 'return' THEN fn.Quantity
      ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.Quantity
      ELSE 0
    END) 'Quantity',

    --SUM(ISNULL(fn.Quantity, 0))  'Quantity',
    SUM(CASE
      WHEN fn.BillStatus = 'return' AND
        ((fn.PaymentMode = 'credit' AND
        fn.CreditDate IS NOT NULL) OR
        (fn.PaymentMode != 'credit' AND
        fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
      WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
      ELSE 0
    END)
    - SUM(CASE
      WHEN fn.BillStatus = 'return' THEN fn.TotalAmount
      ELSE 0
    END) 'TotalAmount'
  --SUM(ISNULL(fn.TotalAmount, 0)) 'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
  INNER JOIN BIL_MST_ServiceDepartment sd
    ON sd.ServiceDepartmentId = fn.ServiceDepartmentId
  WHERE fn.BillStatus != 'cancelled'
  AND fn.BillStatus != 'provisional'
  AND (fn.PaymentMode != 'credit'
  OR fn.CreditDate IS NOT NULL)
  GROUP BY fn.ItemName,
           sd.IntegrationName) AS x
  GROUP BY x.ItemName
  UNION ALL
  -----To deduct return amount from the previous days 
  SELECT
    'Earlier Return Amount' 'Item Name',
    ' ' AS ' ',
    -SUM(sum.TotalAmount) 'Total Amount'
  FROM (SELECT
  DISTINCT
    (ret.BillReturnId),
    ret.TotalAmount
  FROM (SELECT
    br.CreatedOn 'Ret Date',
    bt.ItemName,
    bt.Quantity 'Unit',
    bt.PaidDate 'PaidDate',
    br.BillReturnId 'BillReturnId',
    br.TotalAmount 'TotalAmount'
  FROM BIL_TXN_InvoiceReturn br
  INNER JOIN BIL_TXN_BillingTransactionItems bt
    ON br.BillingTransactionId = bt.BillingTransactionId
  WHERE CONVERT(date, br.createdon) BETWEEN @FromDate AND @ToDate
  AND CONVERT(date, bt.CreatedOn) != CONVERT(date, br.CreatedOn)) ret) sum
  UNION ALL
  SELECT
    'Advance Received' AS 'ItemName',
    ' ',
    ISNULL(SUM(Amount), 0) 'Total Amount'
  FROM BIL_TXN_Deposit
  WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
  AND DepositType = 'Deposit'
  UNION ALL
  SELECT
    'Advance Settled' AS 'ItemName',
    ' ',
    ISNULL(-SUM(Amount), 0)
  FROM BIL_TXN_Deposit
  WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
  AND DepositType = 'depositdeduct'
  UNION ALL
  SELECT
    'Advance Returned' AS 'ItemName',
    ' ',
    -ISNULL(SUM(Amount), 0)
  FROM BIL_TXN_Deposit
  WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
  AND DepositType = 'ReturnDeposit'

  --Pharmacy--
  SELECT
    'OPD' AS Type,
    COUNT(itm.Quantity) 'Quantity',
    SUM(itm.TotalAmount) 'TotalAmount'
  FROM PHRM_TXN_Invoice inv
  INNER JOIN PHRM_TXN_InvoiceItems itm
    ON inv.InvoiceId = itm.InvoiceId
  WHERE inv.IsOutdoorPat = 1
  AND (inv.IsReturn != 1
  OR inv.IsReturn IS NULL)
  AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
  UNION ALL
  SELECT
    'IPD' AS Type,
    COUNT(itm.Quantity) 'Quantity',
    SUM(itm.TotalAmount) 'TotalAmount'
  FROM PHRM_TXN_Invoice inv
  INNER JOIN PHRM_TXN_InvoiceItems itm
    ON inv.InvoiceId = itm.InvoiceId
  WHERE (inv.IsOutdoorPat = 0
  OR inv.IsOutdoorPat IS NULL)
  AND (inv.IsReturn != 1
  OR inv.IsReturn IS NULL)
  AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
  UNION ALL
  SELECT
    'Total' AS Type,
    COUNT(itm.Quantity) 'Quantity',
    SUM(itm.TotalAmount) 'TotalAmount'
  FROM PHRM_TXN_Invoice inv
  INNER JOIN PHRM_TXN_InvoiceItems itm
    ON inv.InvoiceId = itm.InvoiceId
  WHERE (inv.IsReturn != 1
  OR inv.IsReturn IS NULL)
  AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
END
GO
--END : Ram/Ajay : 17Dec2018 Changed calculation of MIS report

--START: Ramavtar: 18Dec'18 change in SP and FN of report
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-09-12','2018-09-12')
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
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 3.      Sud/30Aug'18           Revised for Provisional and BillStatus
 4.      Dinesh/10Sept'18		passing itemname along with srvDeptName to the function
 5.      Dinesh/14Sept'18		added Provisional amount for doctor summary report
 6.		 Ramavtar/12Nov'18		getting providerName from employee table
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
				[dbo].[FN_BIL_GetSrvDeptReportingName] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN emp.Salutation + '. ' + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
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
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
/*
 File: [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]
 Created: 14Dec 2018
 Description: created for Daily MIS report reffered from FN_BIL_GetTxnItemsInfoWithDateSeparation

 ------------Change History------------
 S.No.   ModifiedBy/Date         Remarks
 ----------------------------------------
 1.      Ajay/14Dec2018			Created the script
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
				[dbo].[FN_BIL_GetSrvDeptReportingName_MIS_Report] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN emp.Salutation + '. ' + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
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
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] itmInfo
					LEFT JOIN [dbo].[EMP_Employee] emp ON itmInfo.ProviderId = emp.EmployeeId
			-------------------------------------------------------------------
			) A  -- end of inner select
			---no need to return those items where none of below fields are there---
		WHERE
		 ( A.ProvisionalDate IS NOT NULL
			OR A.CancelledDate IS NOT NULL
			OR A.CreditDate IS NOT NULL
			OR A.PaidDate IS NOT NULL
			OR A.ReturnDate IS NOT NULL )
)---end of return-
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:  	Ramavtar/30Aug'18
-- Description:	daily mis report getting billing items with its department and billingtype info
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_DailyMISReport] --'2018-07-27','2018-07-27'
@FromDate datetime = NULL,
@ToDate datetime = NULL
AS
/*
FileName: SP_Report_BILL_DailyMISReport
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date		Remarks
-------------------------------------------------------
1       Ramavtar/2018-08-30	    created the script
2       Sud/2018-08-30          revised for provisional and billstatus
3		Ajay/2018-12-12			getting data for SummaryView
4		Ajay/2018-12-14			getting data from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]
5		Ram/Ajay 17Dec2018		corrected calculation
--------------------------------------------------------
*/
BEGIN

  ;
  WITH BilTxnItemsCTE
  AS (SELECT
    bil.BillingTransactionItemId,
    pat.PatientCode AS HospitalNo,
    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName AS PatientName,
    bil.ProviderName,
    dept.DepartmentName,
    bil.ServiceDepartmentName,
    CONVERT(varchar(25), @FromDate) + '-to-' + CONVERT(varchar(25), @ToDate) 'billDate',
    --ISNULL(bil.PaidDate,bil.CreatedDate) AS billDate,
    bil.ItemName AS [description],
    bil.Price,
    bil.Quantity AS qty,
    bil.SubTotal AS subTotal,
    bil.DiscountAmount AS discount,
    ISNULL(bil.ReturnAmount, 0) AS ReturnAmount,
    bil.TotalAmount AS total,
    bil.BillStatus, --sud:30Aug'18
    bil.ProvisionalAmount AS 'ProvisionalAmount',--sud:30Aug'18 (We'll need this as well)
    ISNULL(bil.BillingType, 'OutPatient')
    AS BillingType
  FROM (SELECT
    *
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate)) bil
  JOIN PAT_Patient pat
    ON bil.PatientId = pat.PatientId
  JOIN BIL_MST_ServiceDepartment sdept
    ON sdept.ServiceDepartmentId = bil.ServiceDepartmentId
  JOIN MST_Department dept
    ON dept.DepartmentId = sdept.DepartmentId
  --WHERE bil.CreatedDate BETWEEN @FromDate AND @ToDate
  )
  SELECT
    CASE
      WHEN [DepartmentName] = 'ADMINISTRATION' AND
        ServiceDepartmentName != 'CONSUMEABLES' THEN 'ADMINISTRATIVE'
      WHEN ServiceDepartmentName = 'CONSUMEABLES' THEN 'CONSUMEABLES'
      WHEN [DepartmentName] = 'OT' AND
        [DepartmentName] != '' THEN 'OT'
      WHEN [Description] = 'BED CHARGES' THEN 'BED'
      WHEN [Description] = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' THEN 'DOCTOR AND NURSING CARE'
      WHEN [DepartmentName] = 'MEDICINE' THEN 'MEDICINE'
      WHEN [DepartmentName] = 'SURGERY' THEN 'SURGERY'
      ELSE DepartmentName
    END AS departmentName,
    HospitalNo 'hospitalNo',
    PatientName 'patientName',
    ProviderName 'providerName',
    BillingType,
    description 'itemName',
    Price 'price',
    qty 'quantity',
    subTotal 'subTotal',
    discount 'discount',
    ReturnAmount 'return',
    ISNULL(total, 0) - ISNULL(ReturnAmount, 0) 'netTotal',
    BillStatus 'billStatus',
    ProvisionalAmount AS 'provisional'
  FROM BilTxnItemsCTE
  ORDER BY departmentName ASC, BillingType DESC, PatientName ASC

----->	OPD
	SELECT
		ISNULL(fn.ProviderId, 0) 'ProviderId',--ProviderId
		ISNULL(fn.ProviderName, 'NoDoctor') 'ProviderName',--ProviderName
		COUNT(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PatientId
				WHEN fn.BillStatus != 'return' THEN fn.PatientId
			END) - COUNT(CASE WHEN fn.BillStatus = 'return' THEN fn.PatientId END) 'Count',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
				WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	WHERE fn.ItemName LIKE '%Consultation%'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY fn.ProviderId,
		fn.ProviderName
	ORDER BY 2

----->	Health Card
	SELECT
		ItemName 'ItemName',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
				WHEN fn.BillStatus != 'return' THEN fn.Quantity
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Count',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
				WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	WHERE ItemName LIKE '%Health Card%'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY ItemName

----->	LAB
	SELECT
		VisitType,
		ai.ServiceDepartmentName,
		SUM([Count]) 'Count',
		SUM([TotalAmount]) 'TotalAmount'
	FROM (
		SELECT
			CASE
				WHEN fn.visitType = 'inpatient' THEN 'IPD'
				WHEN fn.visitType = 'outpatient' THEN 'OPD'
				ELSE fn.VisitType
			END AS VisitType,
			fn.ServiceDepartmentName,
			SUM(CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
				WHEN fn.BillStatus != 'return' THEN fn.Quantity
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Count',
			SUM(CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
				WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
			INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
		WHERE sd.IntegrationName = 'LAB'
			AND fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.VisitType,
           fn.ServiceDepartmentName
	) ai
	GROUP BY ai.ServiceDepartmentName,
           VisitType
  UNION ALL
  SELECT
    ' ',
    'Total',
    SUM(
		CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
			WHEN fn.BillStatus != 'return' THEN fn.Quantity
			ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Total Count',
	SUM(
		CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
			WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
  WHERE sd.IntegrationName = 'LAB'
	AND fn.BillStatus != 'cancelled'
	AND fn.BillStatus != 'provisional'
	AND fn.BillStatus != 'credit'
	--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  ORDER BY VisitType

----->	Radiology
	SELECT
		CASE
			WHEN bt.visitType = 'inpatient' THEN 'IPD'
			WHEN bt.visitType = 'outpatient' THEN 'OPD'
			ELSE bt.VisitType
		END AS VisitType,
		bt.ServiceDepartmentName,
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
			WHEN fn.BillStatus != 'return' THEN fn.Quantity
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Count',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
			WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_TXN_BillingTransactionItems bt ON fn.BillingTransactionItemId = bt.BillingTransactionItemId
		INNER JOIN BIL_MST_ServiceDepartment sd ON bt.ServiceDepartmentId = sd.ServiceDepartmentId
	WHERE sd.IntegrationName = 'Radiology'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY bt.VisitType,
		bt.ServiceDepartmentName
  UNION ALL
	SELECT
		' ',
		'Total',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
			WHEN fn.BillStatus != 'return' THEN fn.Quantity
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Total Count',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
			WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
	WHERE sd.IntegrationName = 'Radiology'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	ORDER BY VisitType

----->	Health Clinic
	SELECT
		x.ItemName,
		SUM(Quantity) 'Unit',
		SUM(TotalAmount) 'TotalAmount'
	FROM (
		SELECT
			CASE
			  WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
			  WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
			  WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
			  WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
			  ELSE 'Unknown'
			END AS ItemName,
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
			  WHEN fn.BillStatus != 'return' THEN fn.Quantity
			  ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Quantity',
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
			  WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			  ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		WHERE fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.ItemName
	) AS x
	WHERE x.ItemName != 'Unknown'
	GROUP BY x.ItemName

----->	OT
	SELECT
		fn.ProviderID,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		SUM(
			CASE 
				WHEN fn.BillStatus = 'return' AND  ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
				WHEN fn.BillStatus != 'return' THEN fn.Quantity
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Quantity',
		SUM(CASE WHEN fn.BillStatus = 'provisional' THEN fn.TotalAmount ELSE 0 END) 'Prov_Amount',
		SUM(CASE WHEN fn.BillStatus = 'credit' THEN fn.TotalAmount ELSE 0 END) 'Credit_Amount',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
				WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
				ELSE 0 
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN EMP_Employee emp ON fn.ProviderId = emp.EmployeeId
		INNER JOIN MST_Department dept ON emp.DepartmentId = dept.DepartmentId
	WHERE fn.ItemName LIKE '%operation%'
		AND fn.BillStatus != 'cancelled'
		AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL OR fn.BillStatus = 'provisional')
	GROUP BY fn.ProviderId,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		fn.ServiceDepartmentName

----->	Labor
		SELECT
			x.ItemName,
			SUM(Quantity) 'Unit',
			SUM(TotalAmount) 'TotalAmount'
		FROM (
			SELECT
				CASE
					WHEN fn.ItemName LIKE '%labor%' THEN 'LABOR Normal'
					WHEN fn.ItemName LIKE '%LSCS%' THEN 'LABOR LSCS'
					ELSE 'Unknown'
				END AS ItemName,
				SUM(
					CASE
						WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
						WHEN fn.BillStatus != 'return' THEN fn.Quantity
						ELSE 0
					END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Quantity',
				SUM(
					CASE
						WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
						WHEN fn.BillStatus != 'return' THEN fn.TotalAmount ELSE 0
					END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
			FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
			WHERE fn.BillStatus != 'cancelled'
				AND fn.BillStatus != 'provisional'
				AND fn.BillStatus != 'credit'
				--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
			GROUP BY fn.ItemName
		) AS x
		WHERE x.ItemName != 'Unknown'
		GROUP BY x.ItemName

----->	IPD
	SELECT
	    'No. of Admitted Patient' AS 'PatientType',
		COUNT(patientAdmissionId) 'Count'
	FROM ADT_PatientAdmission
	WHERE CONVERT(date, AdmissionDate) BETWEEN @FromDate AND @ToDate
		AND DischargeDate IS NULL
	UNION ALL
	SELECT
		'No. of Discharged Patient',
		COUNT(patientAdmissionId)
	FROM ADT_PatientAdmission
	WHERE CONVERT(date, DischargeDate) BETWEEN @FromDate AND @ToDate
		AND DischargeDate IS NOT NULL

----->	rest other servicedepartments count and income list
	SELECT
		x.ItemName,
		SUM(Quantity) 'Unit',
		SUM(TotalAmount) 'TotalAmount'
	FROM (
		SELECT
			CASE
				WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
				WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
				WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
				WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
				WHEN fn.ItemName LIKE '%CONSULTATION%' THEN 'OPD'
				WHEN fn.ItemName LIKE '%Health Card%' THEN 'Health Card'
				WHEN sd.IntegrationName LIKE 'LAB' THEN 'LABS'
				WHEN sd.IntegrationName LIKE 'RADIOLOGY' THEN 'RADIOLOGY'
				WHEN fn.ItemName LIKE '%Operation%' THEN 'OPERATION CHARGES'
				ELSE 'Hospital Other Charges'
			END AS ItemName,
			SUM(
				CASE
					WHEN fn.BillStatus = 'return' AND  fn.PaidDate IS NOT NULL THEN fn.Quantity
					WHEN fn.BillStatus != 'return' THEN fn.Quantity
					ELSE 0
				END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Quantity',
			SUM(
				CASE
					WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
					WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
					ELSE 0
				END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_MST_ServiceDepartment sd ON sd.ServiceDepartmentId = fn.ServiceDepartmentId
		WHERE fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.ItemName,
			sd.IntegrationName
	) AS x
	GROUP BY x.ItemName
	UNION ALL
  -----To deduct return amount from the previous days 
	SELECT
		'Earlier Return Amount' 'Item Name',
		' ' AS ' ',
		-SUM(sum.TotalAmount) 'Total Amount'
	FROM (SELECT
		DISTINCT
		(ret.BillReturnId),
		ret.TotalAmount
		FROM (SELECT
		br.CreatedOn 'Ret Date',
		bt.ItemName,
		bt.Quantity 'Unit',
		bt.PaidDate 'PaidDate',
		br.BillReturnId 'BillReturnId',
		br.TotalAmount 'TotalAmount'
	FROM BIL_TXN_InvoiceReturn br
	INNER JOIN BIL_TXN_BillingTransactionItems bt ON br.BillingTransactionId = bt.BillingTransactionId
	WHERE CONVERT(date, br.createdon) BETWEEN @FromDate AND @ToDate
		AND CONVERT(date, bt.CreatedOn) != CONVERT(date, br.CreatedOn)) ret) sum
	UNION ALL
	SELECT
		'Advance Received' AS 'ItemName',
		' ',
		ISNULL(SUM(Amount), 0) 'Total Amount'
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'Deposit'
	UNION ALL
	SELECT
	    'Advance Settled' AS 'ItemName',
		' ',
		ISNULL(-SUM(Amount), 0)
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'depositdeduct'
	UNION ALL
	SELECT
		'Advance Returned' AS 'ItemName',
		' ',
		-ISNULL(SUM(Amount), 0)
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'ReturnDeposit'

----->	Pharmacy
	SELECT
		'OPD' AS Type,
		COUNT(itm.Quantity) 'Quantity',
		SUM(itm.TotalAmount) 'TotalAmount'
	FROM PHRM_TXN_Invoice inv
	INNER JOIN PHRM_TXN_InvoiceItems itm ON inv.InvoiceId = itm.InvoiceId
	WHERE inv.IsOutdoorPat = 1
		AND (inv.IsReturn != 1 OR inv.IsReturn IS NULL)
		AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
	UNION ALL
	SELECT
		'IPD' AS Type,
		COUNT(itm.Quantity) 'Quantity',
		SUM(itm.TotalAmount) 'TotalAmount'
	FROM PHRM_TXN_Invoice inv
	INNER JOIN PHRM_TXN_InvoiceItems itm ON inv.InvoiceId = itm.InvoiceId
	WHERE (inv.IsOutdoorPat = 0 OR inv.IsOutdoorPat IS NULL)
	AND (inv.IsReturn != 1 OR inv.IsReturn IS NULL)
	AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
	UNION ALL
	SELECT
		'Total' AS Type,
		COUNT(itm.Quantity) 'Quantity',
		SUM(itm.TotalAmount) 'TotalAmount'
	FROM PHRM_TXN_Invoice inv
	INNER JOIN PHRM_TXN_InvoiceItems itm ON inv.InvoiceId = itm.InvoiceId
	WHERE (inv.IsReturn != 1 OR inv.IsReturn IS NULL)
		AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
END
GO
---END: Ramavtar: 18Dec'18 change in SP and FN of report

---START : Ajay 18Dec2018 change in [SP_Report_BIL_DoctorDeptItemsSummary]
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
----------------------------------------------------------
*/
BEGIN
	IF(@SrvDeptName IS NOT NULL)
		BEGIN
			SELECT
			    COALESCE(fnItems.ReturnDate, fnItems.PaidDate, fnItems.CreditDate) 'Date',
			    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			    pat.PatientCode,
			    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			    fnItems.ServiceDepartmentName,
			    fnItems.ItemName,
			    fnItems.Price,
			    fnItems.Quantity,
			    fnItems.SubTotal,
			    fnItems.DiscountAmount,
			    fnItems.TotalAmount,
			    fnItems.ReturnAmount,
			    fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
			FROM (SELECT
			    *
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)) fnItems
			JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
			WHERE fnItems.ServiceDepartmentName = @SrvDeptName
				AND ISNULL(fnItems.ProviderId, 0) = @DoctorId
				AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
				AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
			ORDER BY 1 DESC

			---Table 2: returning provisional amount---
			SELECT 
				SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
				SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
				SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate)
			WHERE ServiceDepartmentName = @SrvDeptName
				AND ISNULL(ProviderId,0) = @DoctorId
		END

		
	ELSE IF(@SrvDeptName IS NULL)
		BEGIN
			SELECT
			    COALESCE(fnItems.ReturnDate, fnItems.PaidDate, fnItems.CreditDate) 'Date',
			    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			    pat.PatientCode,
			    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			    fnItems.ServiceDepartmentName,
			    fnItems.ItemName,
			    fnItems.Price,
			    fnItems.Quantity,
			    fnItems.SubTotal,
			    fnItems.DiscountAmount,
			    fnItems.TotalAmount,
			    fnItems.ReturnAmount,
			    fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
			FROM (SELECT
			    *
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)) fnItems
			JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
			WHERE ISNULL(fnItems.ProviderId, 0) = @DoctorId
				AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
				AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
			ORDER BY 1 DESC,5 ASC

			---Table 2: returning provisional amount---
			SELECT 
				SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
				SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
				SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate)
			WHERE ISNULL(ProviderId,0) = @DoctorId			
		END
END
GO
---END : Ajay 18Dec2018 change in [SP_Report_BIL_DoctorDeptItemsSummary]

--- START: Ramavtar: 18Dec2018 change in MIS report SP ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BILL_DailyMISReport] --'2018-07-27','2018-07-27'
@FromDate datetime = NULL,
@ToDate datetime = NULL
AS
/*
FileName: SP_Report_BILL_DailyMISReport
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date		Remarks
-------------------------------------------------------
1       Ramavtar/2018-08-30	    created the script
2       Sud/2018-08-30          revised for provisional and billstatus
3		Ajay/2018-12-12			getting data for SummaryView
4		Ajay/2018-12-14			getting data from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]
5		Ram/Ajay 17Dec2018		corrected calculation
--------------------------------------------------------
*/
BEGIN
  ;
  WITH BilTxnItemsCTE
  AS (SELECT
    bil.BillingTransactionItemId,
    pat.PatientCode AS HospitalNo,
    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName AS PatientName,
    bil.ProviderName,
    dept.DepartmentName,
    bil.ServiceDepartmentName,
    CONVERT(varchar(25), @FromDate) + '-to-' + CONVERT(varchar(25), @ToDate) 'billDate',
    --ISNULL(bil.PaidDate,bil.CreatedDate) AS billDate,
    bil.ItemName AS [description],
    bil.Price,
    bil.Quantity AS qty,
    bil.SubTotal AS subTotal,
    bil.DiscountAmount AS discount,
    ISNULL(bil.ReturnAmount, 0) AS ReturnAmount,
    bil.TotalAmount AS total,
    bil.BillStatus, --sud:30Aug'18
    bil.ProvisionalAmount AS 'ProvisionalAmount',--sud:30Aug'18 (We'll need this as well)
    ISNULL(bil.BillingType, 'OutPatient')
    AS BillingType
  FROM (SELECT
    *
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate)) bil
  JOIN PAT_Patient pat
    ON bil.PatientId = pat.PatientId
  JOIN BIL_MST_ServiceDepartment sdept
    ON sdept.ServiceDepartmentId = bil.ServiceDepartmentId
  JOIN MST_Department dept
    ON dept.DepartmentId = sdept.DepartmentId
  --WHERE bil.CreatedDate BETWEEN @FromDate AND @ToDate
  )
  SELECT
    CASE
      WHEN [DepartmentName] = 'ADMINISTRATION' AND
        ServiceDepartmentName != 'CONSUMEABLES' THEN 'ADMINISTRATIVE'
      WHEN ServiceDepartmentName = 'CONSUMEABLES' THEN 'CONSUMEABLES'
      WHEN [DepartmentName] = 'OT' AND
        [DepartmentName] != '' THEN 'OT'
      WHEN [Description] = 'BED CHARGES' THEN 'BED'
      WHEN [Description] = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' THEN 'DOCTOR AND NURSING CARE'
      WHEN [DepartmentName] = 'MEDICINE' THEN 'MEDICINE'
      WHEN [DepartmentName] = 'SURGERY' THEN 'SURGERY'
      ELSE DepartmentName
    END AS departmentName,
    HospitalNo 'hospitalNo',
    PatientName 'patientName',
    ProviderName 'providerName',
    BillingType,
    description 'itemName',
    Price 'price',
    qty 'quantity',
    subTotal 'subTotal',
    discount 'discount',
    ReturnAmount 'return',
    ISNULL(total, 0) - ISNULL(ReturnAmount, 0) 'netTotal',
    BillStatus 'billStatus',
    ProvisionalAmount AS 'provisional'
  FROM BilTxnItemsCTE
  ORDER BY departmentName ASC, BillingType DESC, PatientName ASC

----->	OPD
	SELECT
		ISNULL(fn.ProviderId, 0) 'ProviderId',--ProviderId
		ISNULL(fn.ProviderName, 'NoDoctor') 'ProviderName',--ProviderName
		COUNT(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PatientId
				WHEN fn.BillStatus != 'return' THEN fn.PatientId
			END) - COUNT(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.PatientId END) 'Count',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
				WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
	WHERE fn.ItemName LIKE '%Consultation%'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY fn.ProviderId,
		fn.ProviderName
	ORDER BY 2

----->	Health Card
	SELECT
		fn.ItemName 'ItemName',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
				WHEN fn.BillStatus != 'return' THEN fn.Quantity
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Quantity ELSE 0 END) 'Count',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
				WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
	WHERE fn.ItemName LIKE '%Health Card%'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY fn.ItemName

----->	LAB
	SELECT
		VisitType,
		ai.ServiceDepartmentName,
		SUM([Count]) 'Count',
		SUM([TotalAmount]) 'TotalAmount'
	FROM (
		SELECT
			CASE
				WHEN fn.visitType = 'inpatient' THEN 'IPD'
				WHEN fn.visitType = 'outpatient' THEN 'OPD'
				ELSE fn.VisitType
			END AS VisitType,
			fn.ServiceDepartmentName,
			SUM(CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
				WHEN fn.BillStatus != 'return' THEN fn.Quantity
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Quantity ELSE 0 END) 'Count',
			SUM(CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
				WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
			INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
			JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
		WHERE sd.IntegrationName = 'LAB'
			AND fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.VisitType,
           fn.ServiceDepartmentName
	) ai
	GROUP BY ai.ServiceDepartmentName,
           VisitType
  UNION ALL
  SELECT
    ' ',
    'Total',
    SUM(
		CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
			WHEN fn.BillStatus != 'return' THEN fn.Quantity
			ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Quantity ELSE 0 END) 'Total Count',
	SUM(
		CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
			WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
	JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
  WHERE sd.IntegrationName = 'LAB'
	AND fn.BillStatus != 'cancelled'
	AND fn.BillStatus != 'provisional'
	AND fn.BillStatus != 'credit'
	--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  ORDER BY VisitType

----->	Radiology
	SELECT
		CASE
			WHEN bt.visitType = 'inpatient' THEN 'IPD'
			WHEN bt.visitType = 'outpatient' THEN 'OPD'
			ELSE bt.VisitType
		END AS VisitType,
		bt.ServiceDepartmentName,
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
			WHEN fn.BillStatus != 'return' THEN fn.Quantity
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND bt.PaidDate IS NOT NULL THEN fn.Quantity ELSE 0 END) 'Count',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
			WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND bt.PaidDate IS NOT NULL THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_TXN_BillingTransactionItems bt ON fn.BillingTransactionItemId = bt.BillingTransactionItemId
		INNER JOIN BIL_MST_ServiceDepartment sd ON bt.ServiceDepartmentId = sd.ServiceDepartmentId
	WHERE sd.IntegrationName = 'Radiology'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY bt.VisitType,
		bt.ServiceDepartmentName
  UNION ALL
	SELECT
		' ',
		'Total',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
			WHEN fn.BillStatus != 'return' THEN fn.Quantity
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Quantity ELSE 0 END) 'Total Count',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
			WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
		JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
	WHERE sd.IntegrationName = 'Radiology'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	ORDER BY VisitType

----->	Health Clinic
	SELECT
		x.ItemName,
		SUM(Quantity) 'Unit',
		SUM(TotalAmount) 'TotalAmount'
	FROM (
		SELECT
			CASE
			  WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
			  WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
			  WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
			  WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
			  ELSE 'Unknown'
			END AS ItemName,
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
			  WHEN fn.BillStatus != 'return' THEN fn.Quantity
			  ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Quantity ELSE 0 END) 'Quantity',
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
			  WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
			  ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
		WHERE fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.ItemName
	) AS x
	WHERE x.ItemName != 'Unknown'
	GROUP BY x.ItemName

----->	OT
	SELECT
		fn.ProviderID,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		SUM(
			CASE 
				WHEN fn.BillStatus = 'return' AND  ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
				WHEN fn.BillStatus != 'return' THEN fn.Quantity
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Quantity ELSE 0 END) 'Quantity',
		SUM(CASE WHEN fn.BillStatus = 'provisional' THEN fn.TotalAmount ELSE 0 END) 'Prov_Amount',
		SUM(CASE WHEN fn.BillStatus = 'credit' THEN fn.TotalAmount ELSE 0 END) 'Credit_Amount',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.TotalAmount
				WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
				ELSE 0 
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN EMP_Employee emp ON fn.ProviderId = emp.EmployeeId
		INNER JOIN MST_Department dept ON emp.DepartmentId = dept.DepartmentId
	WHERE fn.ItemName LIKE '%operation%'
		AND fn.BillStatus != 'cancelled'
		AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL OR fn.BillStatus = 'provisional')
	GROUP BY fn.ProviderId,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		fn.ServiceDepartmentName

----->	Labor
		SELECT
			x.ItemName,
			SUM(Quantity) 'Unit',
			SUM(TotalAmount) 'TotalAmount'
		FROM (
			SELECT
				CASE
					WHEN fn.ItemName LIKE '%labor%' THEN 'LABOR Normal'
					WHEN fn.ItemName LIKE '%LSCS%' THEN 'LABOR LSCS'
					ELSE 'Unknown'
				END AS ItemName,
				SUM(
					CASE
						WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Quantity
						WHEN fn.BillStatus != 'return' THEN fn.Quantity
						ELSE 0
					END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Quantity ELSE 0 END) 'Quantity',
				SUM(
					CASE
						WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
						WHEN fn.BillStatus != 'return' THEN fn.TotalAmount ELSE 0
					END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
			FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
			JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
			WHERE fn.BillStatus != 'cancelled'
				AND fn.BillStatus != 'provisional'
				AND fn.BillStatus != 'credit'
				--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
			GROUP BY fn.ItemName
		) AS x
		WHERE x.ItemName != 'Unknown'
		GROUP BY x.ItemName

----->	IPD
	SELECT
	    'No. of Admitted Patient' AS 'PatientType',
		COUNT(patientAdmissionId) 'Count'
	FROM ADT_PatientAdmission
	WHERE CONVERT(date, AdmissionDate) BETWEEN @FromDate AND @ToDate
		AND DischargeDate IS NULL
	UNION ALL
	SELECT
		'No. of Discharged Patient',
		COUNT(patientAdmissionId)
	FROM ADT_PatientAdmission
	WHERE CONVERT(date, DischargeDate) BETWEEN @FromDate AND @ToDate
		AND DischargeDate IS NOT NULL

----->	rest other servicedepartments count and income list
	SELECT
		x.ItemName,
		SUM(Quantity) 'Unit',
		SUM(TotalAmount) 'TotalAmount'
	FROM (
		SELECT
			CASE
				WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
				WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
				WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
				WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
				WHEN fn.ItemName LIKE '%CONSULTATION%' THEN 'OPD'
				WHEN fn.ItemName LIKE '%Health Card%' THEN 'Health Card'
				WHEN sd.IntegrationName LIKE 'LAB' THEN 'LABS'
				WHEN sd.IntegrationName LIKE 'RADIOLOGY' THEN 'RADIOLOGY'
				WHEN fn.ItemName LIKE '%Operation%' THEN 'OPERATION CHARGES'
				ELSE 'Hospital Other Charges'
			END AS ItemName,
			SUM(
				CASE
					WHEN fn.BillStatus = 'return' AND  fn.PaidDate IS NOT NULL THEN fn.Quantity
					WHEN fn.BillStatus != 'return' THEN fn.Quantity
					ELSE 0
				END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Quantity ELSE 0 END) 'Quantity',
			SUM(
				CASE
					WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.TotalAmount
					WHEN fn.BillStatus != 'return' THEN fn.TotalAmount
					ELSE 0
				END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.TotalAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_MST_ServiceDepartment sd ON sd.ServiceDepartmentId = fn.ServiceDepartmentId
		JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
		WHERE fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.ItemName,
			sd.IntegrationName
	) AS x
	GROUP BY x.ItemName
	UNION ALL
  -----To deduct return amount from the previous days 
	SELECT
		'Earlier Return Amount' 'Item Name',
		' ' AS ' ',
		-SUM(sum.TotalAmount) 'Total Amount'
	FROM (SELECT
		DISTINCT
		(ret.BillReturnId),
		ret.TotalAmount
		FROM (SELECT
		br.CreatedOn 'Ret Date',
		bt.ItemName,
		bt.Quantity 'Unit',
		bt.PaidDate 'PaidDate',
		br.BillReturnId 'BillReturnId',
		br.TotalAmount 'TotalAmount'
	FROM BIL_TXN_InvoiceReturn br
	INNER JOIN BIL_TXN_BillingTransactionItems bt ON br.BillingTransactionId = bt.BillingTransactionId
	WHERE CONVERT(date, br.createdon) BETWEEN @FromDate AND @ToDate
		AND CONVERT(date, bt.CreatedOn) != CONVERT(date, br.CreatedOn)) ret) sum
	UNION ALL
	SELECT
		'Advance Received' AS 'ItemName',
		' ',
		ISNULL(SUM(Amount), 0) 'Total Amount'
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'Deposit'
	UNION ALL
	SELECT
	    'Advance Settled' AS 'ItemName',
		' ',
		ISNULL(-SUM(Amount), 0)
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'depositdeduct'
	UNION ALL
	SELECT
		'Advance Returned' AS 'ItemName',
		' ',
		-ISNULL(SUM(Amount), 0)
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'ReturnDeposit'

----->	Pharmacy
	SELECT
		'OPD' AS Type,
		COUNT(itm.Quantity) 'Quantity',
		SUM(itm.TotalAmount) 'TotalAmount'
	FROM PHRM_TXN_Invoice inv
	INNER JOIN PHRM_TXN_InvoiceItems itm ON inv.InvoiceId = itm.InvoiceId
	WHERE inv.IsOutdoorPat = 1
		AND (inv.IsReturn != 1 OR inv.IsReturn IS NULL)
		AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
	UNION ALL
	SELECT
		'IPD' AS Type,
		COUNT(itm.Quantity) 'Quantity',
		SUM(itm.TotalAmount) 'TotalAmount'
	FROM PHRM_TXN_Invoice inv
	INNER JOIN PHRM_TXN_InvoiceItems itm ON inv.InvoiceId = itm.InvoiceId
	WHERE (inv.IsOutdoorPat = 0 OR inv.IsOutdoorPat IS NULL)
	AND (inv.IsReturn != 1 OR inv.IsReturn IS NULL)
	AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
	UNION ALL
	SELECT
		'Total' AS Type,
		COUNT(itm.Quantity) 'Quantity',
		SUM(itm.TotalAmount) 'TotalAmount'
	FROM PHRM_TXN_Invoice inv
	INNER JOIN PHRM_TXN_InvoiceItems itm ON inv.InvoiceId = itm.InvoiceId
	WHERE (inv.IsReturn != 1 OR inv.IsReturn IS NULL)
		AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
END
GO
--- END: Ramavtar: 18Dec2018 change in MIS report SP ---

-- start 26 november | Suraj | Added column -- 

Alter table [dbo].[INV_MST_Terms] add ShortName varchar(50) not null;
Go 
alter table INV_TXN_PurchaseOrder add TermsConditions text NULL;
GO
-- End 26 november | Suraj | Added column -- 

-- Start Mahesh: 11-30-2018 added column in return to vendor ---

alter table INV_TXN_ReturnToVendorItems add GoodsReceiptId int;
GO
alter table INV_TXN_ReturnToVendorItems add CreditNoteNo int;
GO
-- End Mahesh: 11-30-2018 added column in return to vendor ---

--start suraj 12/3/2018 modified in stored procedure| added created on -- 
ALTER PROCEDURE [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId] 
@ItemId int=0 

AS

BEGIN
		If(@ItemId > 0)
			BEGIN
				SELECT itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						itm.MinStockQuantity,
						itm.BudgetedQuantity, 
							gdrp.ItemRate,
							gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				WHERE stk.ItemId = @ItemId
				GROUP BY stk.ItemId, stk.BatchNO, itm.MinStockQuantity, itm.ItemName, itm.BudgetedQuantity,itm.StandardRate , gdrp.ItemRate,gdrp.CreatedOn
			END
        ELSE 
		    BEGIN
				SELECT itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						itm.MinStockQuantity,
						itm.BudgetedQuantity, 
							gdrp.ItemRate,
							gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				GROUP BY stk.ItemId, stk.BatchNO, itm.MinStockQuantity, itm.ItemName, itm.BudgetedQuantity,itm.StandardRate , gdrp.ItemRate,gdrp.CreatedOn
			END 
END
GO

--end 12/3/2018 modified in stored procedure| added created on -- 

-- start added new column in good receipt table | suraj | 12/4/18 -- 

alter table [dbo].[INV_TXN_GoodsReceipt] add OtherCharges decimal(16, 4) null;
GO

-- End added new column in good receipt table | suraj | 12/4/18 -- 

--- suraj | start created new procedure for purchaseorder and Goods receipt comparison ----


/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_ComparePoAndGR]    Script Date: 12/19/2018 11:35:27 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_Inventory_ComparePoAndGR]

AS
BEGIN

			BEGIN
						select itm.ItemName, vendor.VendorName, pitms.CreatedOn,pitms.Quantity,(gitms.ReceivedQuantity + gitms.FreeQuantity) RecevivedQuantity, gitms.CreatedOn Receivedon
 from INV_TXN_GoodsReceipt gr   
 join INV_TXN_GoodsReceiptItems gitms on gitms.GoodsReceiptId = gr.GoodsReceiptId
 join INV_TXN_PurchaseOrderItems pitms on pitms.PurchaseOrderId = gr.PurchaseOrderId 
 join INV_MST_Item itm on gitms.ItemId = itm.ItemId
 join INV_MST_Vendor vendor on vendor.VendorId = gr.VendorId
 where gitms.ItemId = pitms.ItemId
 order by gr.PurchaseOrderId desc

				END
END
;
GO
--- end created new procedure for purchaseorder and Goods receipt comparison ----

-- Suraj | started on 12/19/2018 | for the icons, getting permissions ---
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Inventory');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('inventory-reports-ComparisonPoGr-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Inventory/Reports');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'inventory-reports-ComparisonPoGr-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,IsActive)
Values ('ComparisonPo-GR','Inventory/Reports/ComparisonPOGR',@OwnPerId,@ParentId,'ComparisonPOGR',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1);
GO
-- Ended on 12/19/2018 | for the icons, getting permissions ---

---START: ramavtar 24Dec'18: changes in SP taking paid and return amount ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BILL_DailyMISReport] --'2018-07-27','2018-07-27'
@FromDate datetime = NULL,
@ToDate datetime = NULL
AS
/*
FileName: SP_Report_BILL_DailyMISReport
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date		Remarks
-------------------------------------------------------
1       Ramavtar/2018-08-30	    created the script
2       Sud/2018-08-30          revised for provisional and billstatus
3		Ajay/2018-12-12			getting data for SummaryView
4		Ajay/2018-12-14			getting data from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]
5		Ram/Ajay 17Dec2018		corrected calculation
--------------------------------------------------------
*/
BEGIN
  ;
  WITH BilTxnItemsCTE
  AS (SELECT
    bil.BillingTransactionItemId,
    pat.PatientCode AS HospitalNo,
    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName AS PatientName,
    bil.ProviderName,
    dept.DepartmentName,
    bil.ServiceDepartmentName,
    CONVERT(varchar(25), @FromDate) + '-to-' + CONVERT(varchar(25), @ToDate) 'billDate',
    --ISNULL(bil.PaidDate,bil.CreatedDate) AS billDate,
    bil.ItemName AS [description],
    bil.Price,
    bil.Quantity AS qty,
    bil.SubTotal AS subTotal,
    bil.DiscountAmount AS discount,
    ISNULL(bil.ReturnAmount, 0) AS ReturnAmount,
    bil.TotalAmount AS total,
    bil.BillStatus, --sud:30Aug'18
    bil.ProvisionalAmount AS 'ProvisionalAmount',--sud:30Aug'18 (We'll need this as well)
    ISNULL(bil.BillingType, 'OutPatient')
    AS BillingType
  FROM (SELECT
    *
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate)) bil
  JOIN PAT_Patient pat
    ON bil.PatientId = pat.PatientId
  JOIN BIL_MST_ServiceDepartment sdept
    ON sdept.ServiceDepartmentId = bil.ServiceDepartmentId
  JOIN MST_Department dept
    ON dept.DepartmentId = sdept.DepartmentId
  --WHERE bil.CreatedDate BETWEEN @FromDate AND @ToDate
  )
  SELECT
    CASE
      WHEN [DepartmentName] = 'ADMINISTRATION' AND
        ServiceDepartmentName != 'CONSUMEABLES' THEN 'ADMINISTRATIVE'
      WHEN ServiceDepartmentName = 'CONSUMEABLES' THEN 'CONSUMEABLES'
      WHEN [DepartmentName] = 'OT' AND
        [DepartmentName] != '' THEN 'OT'
      WHEN [Description] = 'BED CHARGES' THEN 'BED'
      WHEN [Description] = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' THEN 'DOCTOR AND NURSING CARE'
      WHEN [DepartmentName] = 'MEDICINE' THEN 'MEDICINE'
      WHEN [DepartmentName] = 'SURGERY' THEN 'SURGERY'
      ELSE DepartmentName
    END AS departmentName,
    HospitalNo 'hospitalNo',
    PatientName 'patientName',
    ProviderName 'providerName',
    BillingType,
    description 'itemName',
    Price 'price',
    qty 'quantity',
    subTotal 'subTotal',
    discount 'discount',
    ReturnAmount 'return',
    ISNULL(total, 0) - ISNULL(ReturnAmount, 0) 'netTotal',
    BillStatus 'billStatus',
    ProvisionalAmount AS 'provisional'
  FROM BilTxnItemsCTE
  ORDER BY departmentName ASC, BillingType DESC, PatientName ASC

----->	OPD
	SELECT
		ISNULL(fn.ProviderId, 0) 'ProviderId',--ProviderId
		ISNULL(fn.ProviderName, 'NoDoctor') 'ProviderName',--ProviderName
		COUNT(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PatientId
				WHEN fn.BillStatus != 'return' THEN fn.PatientId
			END) - COUNT(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.PatientId END) 'Count',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
				WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
	WHERE fn.ItemName LIKE '%Consultation%'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY fn.ProviderId,
		fn.ProviderName
	ORDER BY 2

----->	Health Card
	SELECT
		fn.ItemName 'ItemName',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
				WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Count',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
				WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
	WHERE fn.ItemName LIKE '%Health Card%'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY fn.ItemName

----->	LAB
	SELECT
		VisitType,
		ai.ServiceDepartmentName,
		SUM([Count]) 'Count',
		SUM([TotalAmount]) 'TotalAmount'
	FROM (
		SELECT
			CASE
				WHEN fn.visitType = 'inpatient' THEN 'IPD'
				WHEN fn.visitType = 'outpatient' THEN 'OPD'
				ELSE fn.VisitType
			END AS VisitType,
			fn.ServiceDepartmentName,
			SUM(CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
				WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Count',
			SUM(CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
				WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
			INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
			JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
		WHERE sd.IntegrationName = 'LAB'
			AND fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.VisitType,
           fn.ServiceDepartmentName
	) ai
	GROUP BY ai.ServiceDepartmentName,
           VisitType
  UNION ALL
  SELECT
    ' ',
    'Total',
    SUM(
		CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
			WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
			ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Total Count',
	SUM(
		CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
			WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
	JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
  WHERE sd.IntegrationName = 'LAB'
	AND fn.BillStatus != 'cancelled'
	AND fn.BillStatus != 'provisional'
	AND fn.BillStatus != 'credit'
	--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  ORDER BY VisitType

----->	Radiology
	SELECT
		CASE
			WHEN bt.visitType = 'inpatient' THEN 'IPD'
			WHEN bt.visitType = 'outpatient' THEN 'OPD'
			ELSE bt.VisitType
		END AS VisitType,
		bt.ServiceDepartmentName,
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
			WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND bt.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Count',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
			WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND bt.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_TXN_BillingTransactionItems bt ON fn.BillingTransactionItemId = bt.BillingTransactionItemId
		INNER JOIN BIL_MST_ServiceDepartment sd ON bt.ServiceDepartmentId = sd.ServiceDepartmentId
	WHERE sd.IntegrationName = 'Radiology'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY bt.VisitType,
		bt.ServiceDepartmentName
  UNION ALL
	SELECT
		' ',
		'Total',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
			WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Total Count',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
			WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
		JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
	WHERE sd.IntegrationName = 'Radiology'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	ORDER BY VisitType

----->	Health Clinic
	SELECT
		x.ItemName,
		SUM(Quantity) 'Unit',
		SUM(TotalAmount) 'TotalAmount'
	FROM (
		SELECT
			CASE
			  WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
			  WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
			  WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
			  WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
			  ELSE 'Unknown'
			END AS ItemName,
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
			  WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
			  ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Quantity',
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
			  WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
			  ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
		WHERE fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.ItemName
	) AS x
	WHERE x.ItemName != 'Unknown'
	GROUP BY x.ItemName

----->	OT
	SELECT
		fn.ProviderID,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		SUM(
			CASE 
				WHEN fn.BillStatus = 'return' AND  ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
				WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Qty_Temp ELSE 0 END) 'Quantity',
		SUM(CASE WHEN fn.BillStatus = 'provisional' THEN fn.ProvisionalAmount ELSE 0 END) 'Prov_Amount',
		SUM(CASE WHEN fn.BillStatus = 'credit' THEN fn.CreditAmount ELSE 0 END) 'Credit_Amount',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Total_Temp
				WHEN fn.BillStatus != 'return' THEN fn.Total_Temp
				ELSE 0 
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN EMP_Employee emp ON fn.ProviderId = emp.EmployeeId
		INNER JOIN MST_Department dept ON emp.DepartmentId = dept.DepartmentId
	WHERE fn.ItemName LIKE '%operation%'
		AND fn.BillStatus != 'cancelled'
		AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL OR fn.BillStatus = 'provisional')
	GROUP BY fn.ProviderId,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		fn.ServiceDepartmentName

----->	Labor
		SELECT
			x.ItemName,
			SUM(Quantity) 'Unit',
			SUM(TotalAmount) 'TotalAmount'
		FROM (
			SELECT
				CASE
					WHEN fn.ItemName LIKE '%labor%' THEN 'LABOR Normal'
					WHEN fn.ItemName LIKE '%LSCS%' THEN 'LABOR LSCS'
					ELSE 'Unknown'
				END AS ItemName,
				SUM(
					CASE
						WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
						WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
						ELSE 0
					END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Quantity',
				SUM(
					CASE
						WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
						WHEN fn.BillStatus != 'return' THEN fn.PaidAmount ELSE 0
					END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
			FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
			JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
			WHERE fn.BillStatus != 'cancelled'
				AND fn.BillStatus != 'provisional'
				AND fn.BillStatus != 'credit'
				--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
			GROUP BY fn.ItemName
		) AS x
		WHERE x.ItemName != 'Unknown'
		GROUP BY x.ItemName

----->	IPD
	SELECT
	    'No. of Admitted Patient' AS 'PatientType',
		COUNT(patientAdmissionId) 'Count'
	FROM ADT_PatientAdmission
	WHERE CONVERT(date, AdmissionDate) BETWEEN @FromDate AND @ToDate
		AND DischargeDate IS NULL
	UNION ALL
	SELECT
		'No. of Discharged Patient',
		COUNT(patientAdmissionId)
	FROM ADT_PatientAdmission
	WHERE CONVERT(date, DischargeDate) BETWEEN @FromDate AND @ToDate
		AND DischargeDate IS NOT NULL

----->	rest other servicedepartments count and income list
	SELECT
		x.ItemName,
		SUM(Quantity) 'Unit',
		SUM(TotalAmount) 'TotalAmount'
	FROM (
		SELECT
			CASE
				WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
				WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
				WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
				WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
				WHEN fn.ItemName LIKE '%CONSULTATION%' THEN 'OPD'
				WHEN fn.ItemName LIKE '%Health Card%' THEN 'Health Card'
				WHEN sd.IntegrationName LIKE 'LAB' THEN 'LABS'
				WHEN sd.IntegrationName LIKE 'RADIOLOGY' THEN 'RADIOLOGY'
				WHEN fn.ItemName LIKE '%Operation%' THEN 'OPERATION CHARGES'
				ELSE 'Hospital Other Charges'
			END AS ItemName,
			SUM(
				CASE
					WHEN fn.BillStatus = 'return' AND  fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
					WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
					ELSE 0
				END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Quantity',
			SUM(
				CASE
					WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
					WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
					ELSE 0
				END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_MST_ServiceDepartment sd ON sd.ServiceDepartmentId = fn.ServiceDepartmentId
		JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
		WHERE fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.ItemName,
			sd.IntegrationName
	) AS x
	GROUP BY x.ItemName
	UNION ALL
  -----To deduct return amount from the previous days 
	SELECT
		'Earlier Return Amount' 'Item Name',
		' ' AS ' ',
		-SUM(sum.TotalAmount) 'Total Amount'
	FROM (SELECT
		DISTINCT
		(ret.BillReturnId),
		ret.TotalAmount
		FROM (SELECT
		br.CreatedOn 'Ret Date',
		bt.ItemName,
		bt.Quantity 'Unit',
		bt.PaidDate 'PaidDate',
		br.BillReturnId 'BillReturnId',
		br.TotalAmount 'TotalAmount'
	FROM BIL_TXN_InvoiceReturn br
	INNER JOIN BIL_TXN_BillingTransactionItems bt ON br.BillingTransactionId = bt.BillingTransactionId
	WHERE CONVERT(date, br.createdon) BETWEEN @FromDate AND @ToDate
		AND 1 = 2 
		AND CONVERT(date, bt.CreatedOn) != CONVERT(date, br.CreatedOn)) ret) sum
	UNION ALL
	SELECT
		'Advance Received' AS 'ItemName',
		' ',
		ISNULL(SUM(Amount), 0) 'Total Amount'
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'Deposit'
	UNION ALL
	SELECT
	    'Advance Settled' AS 'ItemName',
		' ',
		ISNULL(-SUM(Amount), 0)
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'depositdeduct'
	UNION ALL
	SELECT
		'Advance Returned' AS 'ItemName',
		' ',
		-ISNULL(SUM(Amount), 0)
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'ReturnDeposit'

----->	Pharmacy
	SELECT
		'OPD' AS Type,
		COUNT(itm.Quantity) 'Quantity',
		SUM(itm.TotalAmount) 'TotalAmount'
	FROM PHRM_TXN_Invoice inv
	INNER JOIN PHRM_TXN_InvoiceItems itm ON inv.InvoiceId = itm.InvoiceId
	WHERE inv.IsOutdoorPat = 1
		AND (inv.IsReturn != 1 OR inv.IsReturn IS NULL)
		AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
	UNION ALL
	SELECT
		'IPD' AS Type,
		COUNT(itm.Quantity) 'Quantity',
		SUM(itm.TotalAmount) 'TotalAmount'
	FROM PHRM_TXN_Invoice inv
	INNER JOIN PHRM_TXN_InvoiceItems itm ON inv.InvoiceId = itm.InvoiceId
	WHERE (inv.IsOutdoorPat = 0 OR inv.IsOutdoorPat IS NULL)
	AND (inv.IsReturn != 1 OR inv.IsReturn IS NULL)
	AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
	UNION ALL
	SELECT
		'Total' AS Type,
		COUNT(itm.Quantity) 'Quantity',
		SUM(itm.TotalAmount) 'TotalAmount'
	FROM PHRM_TXN_Invoice inv
	INNER JOIN PHRM_TXN_InvoiceItems itm ON inv.InvoiceId = itm.InvoiceId
	WHERE (inv.IsReturn != 1 OR inv.IsReturn IS NULL)
		AND CONVERT(date, inv.CreateOn) BETWEEN @FromDate AND @ToDate
END
GO
---END: ramavtar 24Dec'18: changes in SP taking paid and return amount ---

---START: Ajay 27Dec2018: chnages in SP of DailyMISReport
---correection in pharmacy calculation
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BILL_DailyMISReport] --'2018-07-27','2018-07-27'
@FromDate datetime = NULL,
@ToDate datetime = NULL
AS
/*
FileName: SP_Report_BILL_DailyMISReport
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date		Remarks
-------------------------------------------------------
1       Ramavtar/2018-08-30	    created the script
2       Sud/2018-08-30          revised for provisional and billstatus
3		Ajay/2018-12-12			getting data for SummaryView
4		Ajay/2018-12-14			getting data from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]
5		Ram/Ajay 17Dec2018		corrected calculation
6		Ajay 27Dec2018			corrected calculation for Pharmacy
--------------------------------------------------------
*/
BEGIN
  ;
  WITH BilTxnItemsCTE
  AS (SELECT
    bil.BillingTransactionItemId,
    pat.PatientCode AS HospitalNo,
    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName AS PatientName,
    bil.ProviderName,
    dept.DepartmentName,
    bil.ServiceDepartmentName,
    CONVERT(varchar(25), @FromDate) + '-to-' + CONVERT(varchar(25), @ToDate) 'billDate',
    --ISNULL(bil.PaidDate,bil.CreatedDate) AS billDate,
    bil.ItemName AS [description],
    bil.Price,
    bil.Quantity AS qty,
    bil.SubTotal AS subTotal,
    bil.DiscountAmount AS discount,
    ISNULL(bil.ReturnAmount, 0) AS ReturnAmount,
    bil.TotalAmount AS total,
    bil.BillStatus, --sud:30Aug'18
    bil.ProvisionalAmount AS 'ProvisionalAmount',--sud:30Aug'18 (We'll need this as well)
    ISNULL(bil.BillingType, 'OutPatient')
    AS BillingType
  FROM (SELECT
    *
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate)) bil
  JOIN PAT_Patient pat
    ON bil.PatientId = pat.PatientId
  JOIN BIL_MST_ServiceDepartment sdept
    ON sdept.ServiceDepartmentId = bil.ServiceDepartmentId
  JOIN MST_Department dept
    ON dept.DepartmentId = sdept.DepartmentId
  --WHERE bil.CreatedDate BETWEEN @FromDate AND @ToDate
  )
  SELECT
    CASE
      WHEN [DepartmentName] = 'ADMINISTRATION' AND
        ServiceDepartmentName != 'CONSUMEABLES' THEN 'ADMINISTRATIVE'
      WHEN ServiceDepartmentName = 'CONSUMEABLES' THEN 'CONSUMEABLES'
      WHEN [DepartmentName] = 'OT' AND
        [DepartmentName] != '' THEN 'OT'
      WHEN [Description] = 'BED CHARGES' THEN 'BED'
      WHEN [Description] = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' THEN 'DOCTOR AND NURSING CARE'
      WHEN [DepartmentName] = 'MEDICINE' THEN 'MEDICINE'
      WHEN [DepartmentName] = 'SURGERY' THEN 'SURGERY'
      ELSE DepartmentName
    END AS departmentName,
    HospitalNo 'hospitalNo',
    PatientName 'patientName',
    ProviderName 'providerName',
    BillingType,
    description 'itemName',
    Price 'price',
    qty 'quantity',
    subTotal 'subTotal',
    discount 'discount',
    ReturnAmount 'return',
    ISNULL(total, 0) - ISNULL(ReturnAmount, 0) 'netTotal',
    BillStatus 'billStatus',
    ProvisionalAmount AS 'provisional'
  FROM BilTxnItemsCTE
  ORDER BY departmentName ASC, BillingType DESC, PatientName ASC

----->	OPD
	SELECT
		ISNULL(fn.ProviderId, 0) 'ProviderId',--ProviderId
		ISNULL(fn.ProviderName, 'NoDoctor') 'ProviderName',--ProviderName
		COUNT(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PatientId
				WHEN fn.BillStatus != 'return' THEN fn.PatientId
			END) - COUNT(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.PatientId END) 'Count',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
				WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
	WHERE fn.ItemName LIKE '%Consultation%'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY fn.ProviderId,
		fn.ProviderName
	ORDER BY 2

----->	Health Card
	SELECT
		fn.ItemName 'ItemName',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
				WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Count',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
				WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
	WHERE fn.ItemName LIKE '%Health Card%'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY fn.ItemName

----->	LAB
	SELECT
		VisitType,
		ai.ServiceDepartmentName,
		SUM([Count]) 'Count',
		SUM([TotalAmount]) 'TotalAmount'
	FROM (
		SELECT
			CASE
				WHEN fn.visitType = 'inpatient' THEN 'IPD'
				WHEN fn.visitType = 'outpatient' THEN 'OPD'
				ELSE fn.VisitType
			END AS VisitType,
			fn.ServiceDepartmentName,
			SUM(CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
				WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Count',
			SUM(CASE
				WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
				WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
			INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
			JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
		WHERE sd.IntegrationName = 'LAB'
			AND fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.VisitType,
           fn.ServiceDepartmentName
	) ai
	GROUP BY ai.ServiceDepartmentName,
           VisitType
  UNION ALL
  SELECT
    ' ',
    'Total',
    SUM(
		CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
			WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
			ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Total Count',
	SUM(
		CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
			WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
  FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
	INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
	JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
  WHERE sd.IntegrationName = 'LAB'
	AND fn.BillStatus != 'cancelled'
	AND fn.BillStatus != 'provisional'
	AND fn.BillStatus != 'credit'
	--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
  ORDER BY VisitType

----->	Radiology
	SELECT
		CASE
			WHEN bt.visitType = 'inpatient' THEN 'IPD'
			WHEN bt.visitType = 'outpatient' THEN 'OPD'
			ELSE bt.VisitType
		END AS VisitType,
		bt.ServiceDepartmentName,
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
			WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND bt.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Count',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
			WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND bt.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_TXN_BillingTransactionItems bt ON fn.BillingTransactionItemId = bt.BillingTransactionItemId
		INNER JOIN BIL_MST_ServiceDepartment sd ON bt.ServiceDepartmentId = sd.ServiceDepartmentId
	WHERE sd.IntegrationName = 'Radiology'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	GROUP BY bt.VisitType,
		bt.ServiceDepartmentName
  UNION ALL
	SELECT
		' ',
		'Total',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
			WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Total Count',
		SUM(CASE
			WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
			WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
			ELSE 0
		END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_MST_ServiceDepartment sd ON fn.ServiceDepartmentId = sd.ServiceDepartmentId
		JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
	WHERE sd.IntegrationName = 'Radiology'
		AND fn.BillStatus != 'cancelled'
		AND fn.BillStatus != 'provisional'
		AND fn.BillStatus != 'credit'
		--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
	ORDER BY VisitType

----->	Health Clinic
	SELECT
		x.ItemName,
		SUM(Quantity) 'Unit',
		SUM(TotalAmount) 'TotalAmount'
	FROM (
		SELECT
			CASE
			  WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
			  WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
			  WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
			  WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
			  ELSE 'Unknown'
			END AS ItemName,
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
			  WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
			  ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Quantity',
			SUM(CASE
			  WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
			  WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
			  ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
		WHERE fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.ItemName
	) AS x
	WHERE x.ItemName != 'Unknown'
	GROUP BY x.ItemName

----->	OT
	SELECT
		fn.ProviderID,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		SUM(
			CASE 
				WHEN fn.BillStatus = 'return' AND  ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
				WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
				ELSE 0
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.Qty_Temp ELSE 0 END) 'Quantity',
		SUM(CASE WHEN fn.BillStatus = 'provisional' THEN fn.ProvisionalAmount ELSE 0 END) 'Prov_Amount',
		SUM(CASE WHEN fn.BillStatus = 'credit' THEN fn.CreditAmount ELSE 0 END) 'Credit_Amount',
		SUM(
			CASE
				WHEN fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Total_Temp
				WHEN fn.BillStatus != 'return' THEN fn.Total_Temp
				ELSE 0 
			END) - SUM(CASE WHEN fn.BillStatus = 'return' THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN EMP_Employee emp ON fn.ProviderId = emp.EmployeeId
		INNER JOIN MST_Department dept ON emp.DepartmentId = dept.DepartmentId
	WHERE fn.ItemName LIKE '%operation%'
		AND fn.BillStatus != 'cancelled'
		AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL OR fn.BillStatus = 'provisional')
	GROUP BY fn.ProviderId,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		fn.ServiceDepartmentName

----->	Labor
		SELECT
			x.ItemName,
			SUM(Quantity) 'Unit',
			SUM(TotalAmount) 'TotalAmount'
		FROM (
			SELECT
				CASE
					WHEN fn.ItemName LIKE '%labor%' THEN 'LABOR Normal'
					WHEN fn.ItemName LIKE '%LSCS%' THEN 'LABOR LSCS'
					ELSE 'Unknown'
				END AS ItemName,
				SUM(
					CASE
						WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
						WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
						ELSE 0
					END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Quantity',
				SUM(
					CASE
						WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
						WHEN fn.BillStatus != 'return' THEN fn.PaidAmount ELSE 0
					END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
			FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
			JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
			WHERE fn.BillStatus != 'cancelled'
				AND fn.BillStatus != 'provisional'
				AND fn.BillStatus != 'credit'
				--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
			GROUP BY fn.ItemName
		) AS x
		WHERE x.ItemName != 'Unknown'
		GROUP BY x.ItemName

----->	IPD
	SELECT
	    'No. of Admitted Patient' AS 'PatientType',
		COUNT(patientAdmissionId) 'Count'
	FROM ADT_PatientAdmission
	WHERE CONVERT(date, AdmissionDate) BETWEEN @FromDate AND @ToDate
		AND DischargeDate IS NULL
	UNION ALL
	SELECT
		'No. of Discharged Patient',
		COUNT(patientAdmissionId)
	FROM ADT_PatientAdmission
	WHERE CONVERT(date, DischargeDate) BETWEEN @FromDate AND @ToDate
		AND DischargeDate IS NOT NULL

----->	rest other servicedepartments count and income list
	SELECT
		x.ItemName,
		SUM(Quantity) 'Unit',
		SUM(TotalAmount) 'TotalAmount'
	FROM (
		SELECT
			CASE
				WHEN fn.ItemName LIKE '%ECHO%' THEN 'ECHO'
				WHEN fn.ItemName LIKE '%TMT%' THEN 'TMT'
				WHEN fn.ItemName LIKE '%ECG%' THEN 'ECG'
				WHEN fn.ItemName LIKE '%Holter%' THEN 'Holter'
				WHEN fn.ItemName LIKE '%CONSULTATION%' THEN 'OPD'
				WHEN fn.ItemName LIKE '%Health Card%' THEN 'Health Card'
				WHEN sd.IntegrationName LIKE 'LAB' THEN 'LABS'
				WHEN sd.IntegrationName LIKE 'RADIOLOGY' THEN 'RADIOLOGY'
				WHEN fn.ItemName LIKE '%Operation%' THEN 'OPERATION CHARGES'
				ELSE 'Hospital Other Charges'
			END AS ItemName,
			SUM(
				CASE
					WHEN fn.BillStatus = 'return' AND  fn.PaidDate IS NOT NULL THEN fn.Qty_Temp
					WHEN fn.BillStatus != 'return' THEN fn.Qty_Temp
					ELSE 0
				END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.Qty_Temp ELSE 0 END) 'Quantity',
			SUM(
				CASE
					WHEN fn.BillStatus = 'return' AND fn.PaidDate IS NOT NULL THEN fn.PaidAmount
					WHEN fn.BillStatus != 'return' THEN fn.PaidAmount
					ELSE 0
				END) - SUM(CASE WHEN fn.BillStatus = 'return' AND vw.PaidDate IS NOT NULL THEN fn.ReturnAmount ELSE 0 END) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate, @ToDate) fn
		INNER JOIN BIL_MST_ServiceDepartment sd ON sd.ServiceDepartmentId = fn.ServiceDepartmentId
		JOIN [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] vw ON fn.BillingTransactionItemId = vw.BillingTransactionItemId
		WHERE fn.BillStatus != 'cancelled'
			AND fn.BillStatus != 'provisional'
			AND fn.BillStatus != 'credit'
			--AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		GROUP BY fn.ItemName,
			sd.IntegrationName
	) AS x
	GROUP BY x.ItemName
	UNION ALL
  -----To deduct return amount from the previous days 
	SELECT
		'Earlier Return Amount' 'Item Name',
		' ' AS ' ',
		-SUM(sum.TotalAmount) 'Total Amount'
	FROM (SELECT
		DISTINCT
		(ret.BillReturnId),
		ret.TotalAmount
		FROM (SELECT
		br.CreatedOn 'Ret Date',
		bt.ItemName,
		bt.Quantity 'Unit',
		bt.PaidDate 'PaidDate',
		br.BillReturnId 'BillReturnId',
		br.TotalAmount 'TotalAmount'
	FROM BIL_TXN_InvoiceReturn br
	INNER JOIN BIL_TXN_BillingTransactionItems bt ON br.BillingTransactionId = bt.BillingTransactionId
	WHERE CONVERT(date, br.createdon) BETWEEN @FromDate AND @ToDate
		AND 1 = 2 
		AND CONVERT(date, bt.CreatedOn) != CONVERT(date, br.CreatedOn)) ret) sum
	UNION ALL
	SELECT
		'Advance Received' AS 'ItemName',
		' ',
		ISNULL(SUM(Amount), 0) 'Total Amount'
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'Deposit'
	UNION ALL
	SELECT
	    'Advance Settled' AS 'ItemName',
		' ',
		ISNULL(-SUM(Amount), 0)
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'depositdeduct'
	UNION ALL
	SELECT
		'Advance Returned' AS 'ItemName',
		' ',
		-ISNULL(SUM(Amount), 0)
	FROM BIL_TXN_Deposit
	WHERE CONVERT(date, createdon) BETWEEN @FromDate AND @ToDate
		AND DepositType = 'ReturnDeposit'

----->	Pharmacy
-----IPD Count-------
SELECT 'IPD'                           AS Type, 
       SUM(TotalAmount - ReturnAmount) AS TotalAmount, 
       SUM(Quantity - ReturnQuantity)  AS Quantity 
FROM   (SELECT SUM(inv.PaidAmount)                       AS TotalAmount, 
               0                                         AS ReturnAmount, 
               (SELECT SUM(ISNULL(invitm.Quantity, 0)) 
                FROM   PHRM_TXN_InvoiceItems invitm 
                WHERE  invitm.InvoiceId = inv.InvoiceId) AS Quantity, 
               0                                         AS ReturnQuantity 
        FROM   [PHRM_TXN_Invoice] inv 
        WHERE  CONVERT(DATETIME, inv.CreateOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) 
               AND ( inv.IsOutdoorPat = 0 OR inv.IsOutdoorPat IS NULL ) 
        GROUP  BY CONVERT(DATE, inv.CreateOn), inv.InvoiceId 
        UNION ALL 
        SELECT 0   AS TotalAmount, 
               CASE 
                 WHEN (SELECT InvoiceId 
                       FROM   PHRM_TXN_Invoice inv 
                       WHERE  InvoiceId = invret.InvoiceId 
                              AND ( inv.IsOutdoorPat = 0 OR inv.IsOutdoorPat IS NULL )) > 0
					   THEN   SUM(invRet.TotalAmount) 
                 ELSE 0 
               END AS ReturnAmount, 
               0   AS Quantity, 
               CASE 
                 WHEN (SELECT InvoiceId 
                       FROM   PHRM_TXN_Invoice inv 
                       WHERE  InvoiceId = invret.InvoiceId 
                              AND ( inv.IsOutdoorPat = 0 OR inv.IsOutdoorPat IS NULL )) > 0 
					   THEN   SUM(invret.Quantity) 
                 ELSE 0 
               END AS ReturnQuantity 
        FROM   [PHRM_TXN_InvoiceReturnItems] invRet 
        WHERE  CONVERT(DATETIME, invRet.CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) 
        GROUP  BY CONVERT(DATE, invRet.CreatedOn), invret.InvoiceId) tabletotal 

UNION ALL 

-------OPD Count----------
SELECT 'OPD'                           AS Type, 
       SUM(TotalAmount - ReturnAmount) AS TotalAmount, 
       SUM(Quantity - ReturnQuantity)  AS Quantity 
FROM   (SELECT SUM(inv.PaidAmount)                       AS TotalAmount, 
               0                                         AS ReturnAmount, 
               (SELECT SUM(ISNULL(invitm.quantity, 0)) 
                FROM   PHRM_TXN_InvoiceItems invitm 
                WHERE  invitm.InvoiceId = inv.InvoiceId) AS Quantity, 
               0                                         AS ReturnQuantity 
        FROM   [PHRM_TXN_Invoice] inv 
        WHERE  CONVERT(DATETIME, inv.CreateOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) 
               AND inv.IsOutdoorPat = 1 
        GROUP  BY CONVERT(DATE, inv.CreateOn), inv.InvoiceId 
        UNION ALL 
        SELECT 0   AS TotalAmount, 
               CASE 
                 WHEN (SELECT InvoiceId 
                       FROM   PHRM_TXN_Invoice 
                       WHERE  InvoiceId = invret.InvoiceId 
                              AND IsOutdoorPat = 1) > 0
					   THEN SUM(invRet.TotalAmount) 
                 ELSE 0 
               END AS ReturnAmount, 
               0   AS Quantity, 
               CASE 
                 WHEN (SELECT InvoiceId 
                       FROM   PHRM_TXN_Invoice 
                       WHERE  InvoiceId = invret.InvoiceId 
                              AND IsOutdoorPat = 1) > 0
					   THEN   SUM(invret.Quantity) 
                 ELSE 0 
               END AS ReturnQuantity 
        FROM   [phrm_txn_invoicereturnitems] invRet 
        WHERE  CONVERT(DATETIME, invRet.CreatedOn) BETWEEN 
               ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) 
        GROUP  BY CONVERT(DATE, invRet.CreatedOn), 
                  invret.InvoiceId) tabletotal 

UNION ALL 

-----Total Count-------
SELECT 'Total'                         AS Type, 
       SUM(TotalAmount - ReturnAmount) AS TotalAmount, 
       SUM(Quantity - ReturnQuantity)  AS Quantity 
FROM   (SELECT SUM(inv.PaidAmount)                       AS TotalAmount, 
               0                                         AS ReturnAmount, 
               (SELECT SUM(ISNULL(invitm.quantity, 0)) 
                FROM   PHRM_TXN_InvoiceItems invitm 
                WHERE  invitm.InvoiceId = inv.InvoiceId) AS Quantity, 
               0                                         AS ReturnQuantity 
        FROM   PHRM_TXN_Invoice inv 
        WHERE  CONVERT(DATETIME, inv.CreateOn) BETWEEN 
               ISNULL(@FromDate, GETDATE()) AND ISNULL( 
               @ToDate, GETDATE()) 
        GROUP  BY CONVERT(DATE, inv.CreateOn), 
                  inv.InvoiceId 
        UNION ALL 
        SELECT 0   AS TotalAmount, 
               CASE 
                 WHEN (SELECT InvoiceId 
                       FROM   PHRM_TXN_Invoice 
                       WHERE  InvoiceId = invret.InvoiceId) > 0 THEN 
                 SUM(invRet.TotalAmount) 
                 ELSE 0 
               END AS ReturnAmount, 
               0   AS Quantity, 
               CASE 
                 WHEN (SELECT InvoiceId 
                       FROM   PHRM_TXN_Invoice 
                       WHERE  InvoiceId = invret.InvoiceId) > 0
					   THEN   SUM(invret.Quantity) 
                 ELSE 0 
               END AS ReturnQuantity 
        FROM   PHRM_TXN_InvoiceReturnItems invRet 
        WHERE  CONVERT(DATETIME, invRet.CreatedOn) BETWEEN 
               ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) 
        GROUP  BY CONVERT(DATE, invRet.CreatedOn), 
                  invret.InvoiceId) tabletotal 
END
GO
---END: Ajay 27Dec2018: chnages in SP of DailyMISReport

--START: Ajay 28Dec'18 filterring out unpaid (credit bills) for credit return(for user collection report)
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-11-29','2018-11-29',null,null
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
1.      sud/2018-07-26                      modified after HAMS Deployment (NEEDS REVISION)\
2.		ramavtar/2018-10-09					added return remark
3.		ramavtar/2018-11-29					calculating summary amounts
4.		ajay/2018-12-28						filterring out unpaid (credit bills) for credit return
-----------------------------------------------------------------------------------------
*/
BEGIN
 IF (@FromDate IS NOT NULL)
  OR (@ToDate IS NOT NULL)
BEGIN
	SELECT
		*
	FROM (
		SELECT DISTINCT
			CONVERT(varchar(20), dates.ReportDate) AS [Date],
			txnInfo.InvoiceCode + CONVERT(varchar(20), txnInfo.InvoiceNo) 'ReceiptNo',
			pat.PatientCode AS HospitalNo,
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			ISNULL(txn.SubTotal, 0) AS 'Price',
			ISNULL(txn.DiscountAmount, 0) AS 'DiscountAmount',
			ISNULL(bilRet.ReturnAmount, 0) AS 'ReturnedAmount',
			0 AS 'AdvanceReceived',
			ISNULL(depRet.Amount, 0) AS 'AdvanceSettlement',
			ISNULL(txn.TaxTotal, 0) AS 'Tax',
			ISNULL(txn.TotalAmount, 0) - ISNULL(depRet.Amount, 0) - ISNULL(bilRet.ReturnAmount, 0) AS 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			txnInfo.CounterId AS 'CounterId',
			ISNULL(bilRet.ReturnedTax, 0) AS 'ReturnedTax',
			ISNULL(bilRet.Remarks, '') 'ReturnRemark'
		FROM ((
			SELECT
				Dates 'ReportDate'
			FROM [FN_COMMON_GetAllDatesBetweenRange](ISNULL(@FromDate, GETDATE()), ISNULL(@ToDate, GETDATE()))) dates

		LEFT JOIN (
--- These two tables works as an Anchor Table (LEFT Table) to join with other tables--
--- Need BillingTransactionId, CreatedBy, CounterID to be joined with all other Right side tables---
		SELECT
			CONVERT(date, PaidDate) 'TxnDate',
			BillingTransactionId,
			InvoiceCode,
			InvoiceNo,
			PatientID,
			CreatedBy,
			CounterId,
			Remarks
		FROM BIL_TXN_BillingTransaction
		WHERE CONVERT(date, PaidDate) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
		AND BillStatus != 'unpaid' ---ramavtar:20-nov-18 filterring out unpaid (credit bills)

		UNION

		SELECT DISTINCT
			CONVERT(date, CreatedOn) AS TxnDate,
			BillingTransactionId,
			InvoiceCode,
			RefInvoiceNum,
			PatientId,
			CreatedBy,
			CounterId,
			Remarks
		FROM BIL_TXN_InvoiceReturn r
		WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())) txnInfo
			ON dates.ReportDate = txnInfo.TxnDate
--- Join with Patient and Employee Table to get their names etc---
		INNER JOIN PAT_Patient pat
			ON txnInfo.PatientId = pat.PatientId
		INNER JOIN EMP_Employee emp
			ON txnInfo.CreatedBy = emp.EmployeeId

		LEFT JOIN BIL_TXN_BillingTransaction txn
			ON dates.ReportDate = CONVERT(date, txn.PaidDate)
		AND txnInfo.BillingTransactionId = txn.BillingTransactionId
		AND txnInfo.CounterId = txn.CounterId
		AND txnInfo.CreatedBy = txn.CreatedBy

		LEFT OUTER JOIN (
--- deposit deduct happens both from Transaction and settlement
--- take only those from Transaction in this query..
--- condition is: BillingTransaction Is NOT NULL--
		SELECT
			CONVERT(date, CreatedOn) AS DepositRetDate,
			Amount,
			BillingTransactionId,
			CounterId,
			CreatedBy
		FROM BIL_TXN_Deposit
		WHERE DepositType = 'depositdeduct'
		AND BillingTransactionId IS NOT NULL) depRet
			ON dates.ReportDate = depRet.DepositRetDate
		AND txnInfo.BillingTransactionId = depRet.BillingTransactionId
		AND txnInfo.CounterId = depRet.CounterId
		AND txnInfo.CreatedBy = depRet.CreatedBy
		LEFT JOIN (

---Sud: 9May'18--our return table is now changed--
---get only returned bills---
		SELECT
			CONVERT(date, CreatedOn) AS bilReturnDate,
			BillingTransactionId,
			RefInvoiceNum,
			TotalAmount 'ReturnAmount',
			TaxTotal AS 'ReturnedTax',
			CounterId,
			CreatedBy,
			Remarks
		FROM BIL_TXN_InvoiceReturn r) bilRet
			ON dates.ReportDate = bilret.bilReturnDate
		AND txnInfo.BillingTransactionId = bilRet.BillingTransactionId
		AND txnInfo.CounterId = bilRet.CounterId
		AND txnInfo.CreatedBy = bilRet.CreatedBy
		AND BillStatus!='unpaid'--Ajay 28Dec'18 filterring out unpaid (credit bills) for credit return 
		)
		WHERE dates.ReportDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) + 1
		AND (txnInfo.CounterId LIKE '%' + ISNULL(@CounterId, txnInfo.CounterId) + '%')
		AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')

		UNION ALL

		SELECT
			CONVERT(date, deposits.DepositDate) 'DepositDate',
			deposits.ReceiptNo 'ReceiptNo',
			pat.PatientCode 'HospitalNo',
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			0 'Price',
			0 'DiscountAmount',
			0 'ReturnedAmount',
			deposits.AdvanceReceived 'AdvanceReceived',
			deposits.AdvancedSettled 'AdvancedSettled',
			0 'Tax',
			deposits.TotalAmount 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			deposits.CounterId 'CounterId',
			0 'ReturnedTax',
			'' 'ReturnRemark'
		FROM (SELECT
				CONVERT(date, CreatedOn) 'DepositDate',
				'DR' + CONVERT(varchar(20), ReceiptNo) 'ReceiptNo',
				PatientId,
				CASE
				  WHEN DepositType = 'Deposit' THEN Amount
				  ELSE 0
				END AS 'AdvanceReceived',
				CASE
				  WHEN DepositType = 'ReturnDeposit' THEN Amount
				  ELSE 0
				END AS 'AdvancedSettled',
				CASE
				  WHEN DepositType = 'Deposit' THEN Amount
				  WHEN DepositType = 'ReturnDeposit' THEN -Amount
				  ELSE 0
				END AS 'TotalAmount',
				CreatedBy 'CreatedBy',
				CounterId 'CounterId'
			FROM BIL_TXN_Deposit
			WHERE ReceiptNo IS NOT NULL
			AND (DepositType = 'DEPOSIT'
			OR DepositType = 'ReturnDeposit')

		UNION ALL

		SELECT
			CONVERT(date, CreatedOn) 'DepositDate',
       --we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
			CASE
			WHEN SettlementId IS NOT NULL THEN 'SR' + CONVERT(varchar(20), SettlementId)
			ELSE 'SR'
			END AS 'ReceiptNo',
			PatientId,
			0 AS 'AdvanceReceived',
			Amount AS 'AdvancedSettled',
			-Amount AS 'TotalAmount',
			CreatedBy 'CreatedBy',
			CounterId 'CounterId'
		FROM BIL_TXN_Deposit
     ----we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
		WHERE ((DepositType = 'depositdeduct'
		AND SettlementId IS NOT NULL)
		OR DepositType = 'ReturnDeposit')
		AND CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())) deposits,


		EMP_Employee emp,
		PAT_Patient pat,
		BIL_CFG_Counter cntr
		WHERE deposits.PatientId = pat.PatientId
		AND emp.EmployeeId = deposits.CreatedBy
		AND deposits.CounterId = cntr.CounterId
		AND deposits.DepositDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
		AND (deposits.CounterId LIKE '%' + ISNULL(@CounterId, deposits.CounterId) + '%')
		AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')) dum
		ORDER BY dum.ReceiptNo

  ---getting addional summary amounts for report
		SELECT
			SUM(ISNULL(AdvanceReceived, 0)) 'AdvanceReceived',
			SUM(ISNULL(AdvanceSettled, 0)) 'AdvanceSettled',
			SUM(ISNULL(ProvisionalAmount,0)) 'Provisional',
			ISNULL((SELECT SUM(TotalAmount) FROM BIL_TXN_BillingTransaction
		WHERE BillStatus = 'unpaid'
		AND CONVERT(DATE,CreatedOn) BETWEEN @FromDate AND @ToDate),0) 'CreditAmount'
		FROM [FN_BIL_GetDepositNProvisionalBetnDateRange](@FromDate, @ToDate)
END
END
GO
--END: Ajay 28Dec'18 filterring out unpaid (credit bills) for credit return
--- END: Ramavtar: 18Dec2018 change in MIS report SP --


---- start 26 november | Suraj | Added column -- 

--Alter table [dbo].[INV_MST_Terms] add ShortName varchar(50) not null;
--Go 
--alter table INV_TXN_PurchaseOrder add TermsConditions text NULL;
--GO
---- End 26 november | Suraj | Added column -- 

---- Start Mahesh: 11-30-2018 added column in return to vendor ---

--alter table INV_TXN_ReturnToVendorItems add GoodsReceiptId int;
--GO
--alter table INV_TXN_ReturnToVendorItems add CreditNoteNo int;
--GO
---- End Mahesh: 11-30-2018 added column in return to vendor ---

----start suraj 12/3/2018 modified in stored procedure| added created on -- 
--ALTER PROCEDURE [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId] 
--@ItemId int=0 

--AS

--BEGIN
--		If(@ItemId > 0)
--			BEGIN
--				SELECT itm.ItemName,
--						stk.BatchNO,
--						SUM(stk.AvailableQuantity) AS AvailableQuantity,
--						itm.MinStockQuantity,
--						itm.BudgetedQuantity, 
--							gdrp.ItemRate,
--							gdrp.CreatedOn
--					FROM INV_TXN_Stock stk
--				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
--				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
--				WHERE stk.ItemId = @ItemId
--				GROUP BY stk.ItemId, stk.BatchNO, itm.MinStockQuantity, itm.ItemName, itm.BudgetedQuantity,itm.StandardRate , gdrp.ItemRate,gdrp.CreatedOn
--			END
--        ELSE 
--		    BEGIN
--				SELECT itm.ItemName,
--						stk.BatchNO,
--						SUM(stk.AvailableQuantity) AS AvailableQuantity,
--						itm.MinStockQuantity,
--						itm.BudgetedQuantity, 
--							gdrp.ItemRate,
--							gdrp.CreatedOn
--					FROM INV_TXN_Stock stk
--				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
--				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
--				GROUP BY stk.ItemId, stk.BatchNO, itm.MinStockQuantity, itm.ItemName, itm.BudgetedQuantity,itm.StandardRate , gdrp.ItemRate,gdrp.CreatedOn
--			END 
--END
--GO

----end 12/3/2018 modified in stored procedure| added created on -- 

---- start added new column in good receipt table | suraj | 12/4/18 -- 

--alter table [dbo].[INV_TXN_GoodsReceipt] add OtherCharges decimal(16, 4) null;
--GO

---- End added new column in good receipt table | suraj | 12/4/18 -- 

----- suraj | start created new procedure for purchaseorder and Goods receipt comparison ----


--/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_ComparePoAndGR]    Script Date: 12/19/2018 11:35:27 AM ******/
--SET ANSI_NULLS ON
--GO

--SET QUOTED_IDENTIFIER ON
--GO

---- =============================================
---- Author:		<Author,,Name>
---- Create date: <Create Date,,>
---- Description:	<Description,,>
---- =============================================
--CREATE PROCEDURE [dbo].[SP_Report_Inventory_ComparePoAndGR]

--AS
--BEGIN

--			BEGIN
--						select itm.ItemName, vendor.VendorName, pitms.CreatedOn,pitms.Quantity,(gitms.ReceivedQuantity + gitms.FreeQuantity) RecevivedQuantity, gitms.CreatedOn Receivedon
-- from INV_TXN_GoodsReceipt gr   
-- join INV_TXN_GoodsReceiptItems gitms on gitms.GoodsReceiptId = gr.GoodsReceiptId
-- join INV_TXN_PurchaseOrderItems pitms on pitms.PurchaseOrderId = gr.PurchaseOrderId 
-- join INV_MST_Item itm on gitms.ItemId = itm.ItemId
-- join INV_MST_Vendor vendor on vendor.VendorId = gr.VendorId
-- where gitms.ItemId = pitms.ItemId
-- order by gr.PurchaseOrderId desc

--				END
--END
--;
--GO
----- end created new procedure for purchaseorder and Goods receipt comparison ----

---- Suraj | started on 12/19/2018 | for the icons, getting permissions ---
--declare @AppnID_Settings INT
--SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Inventory');

--Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
--Values ('inventory-reports-ComparisonPoGr-view',@AppnID_Settings,'true','1', GETDATE());
--Go

--declare @ParentId INT
--declare @OwnPerId INT

--SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Inventory/Reports');
--SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'inventory-reports-ComparisonPoGr-view');

--Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,IsActive)
--Values ('ComparisonPo-GR','Inventory/Reports/ComparisonPOGR',@OwnPerId,@ParentId,'ComparisonPOGR',1,1);

--Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
--Values (1,@OwnPerId,1,GETDATE(),1);
--GO
---- Ended on 12/19/2018 | for the icons, getting permissions ---

--started by Suraj on 25th December | Modification on table-- 

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId] 
@ItemId int=0 

AS

BEGIN
		If(@ItemId > 0)
			BEGIN
				SELECT itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						SUM(itm.BudgetedQuantity) AS BudgetedQuantity, 
							SUM(gdrp.ItemRate) AS ItemRate
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				WHERE stk.ItemId = @ItemId
				GROUP BY itm.ItemName,stk.BatchNO
			END
        ELSE 
		    BEGIN
				SELECT itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						SUM(itm.BudgetedQuantity) AS BudgetedQuantity, 
							SUM(gdrp.ItemRate) AS ItemRate
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				GROUP BY itm.ItemName,stk.BatchNO
			END 
END

--ended by Suraj on 25th December | Modification on table-- 

-- started by Suraj on 30th December | Create a stored procedure for purchase report --
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_Inventory_Purchase]

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
 where gitms.ItemId = pitms.ItemId AND PO.POStatus = 'complete'
 order by gr.PurchaseOrderId desc

				END
END
GO
;


-- Ended by Suraj on 30th December | Create a stored procedure for purchase report --

-- started by suraj on 30th december | FOR ICON PERMISSION --

declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Inventory');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('inventory-reports-PurchaseReport-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Inventory/Reports');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'inventory-reports-PurchaseReport-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,IsActive)
Values ('PurchaseReports','Inventory/Reports/PurchaseReports',@OwnPerId,@ParentId,'PurchaseReports',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1);

-- ended by suraj on 30th december | FOR ICON PERMISSION --

-- started by suraj on 31st Dec|2018 | Altered datatype value --
GO
alter table INV_TXN_RequisitionItems 
alter column Remark text;
GO

-- ended by suraj on 31st Dec|2018 | Altered datatype value --



----START: Mahesh : 02Jan 2018 ---- Merged from accounting----


--START Salakha 30 Nov 2018 : inserted Pharmacy Rules and Mapping in ACC_MST_MappingDetail

INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCashGoodReceipt', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Purchase Voucher'))
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCashInvoice', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Sales Voucher'))
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCashInvoiceReturn', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Credit Note'))
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMWriteOff', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher'))
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMRetutnToSupplier', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Debit Note'))


-- Adding LedgerGroupId
INSERT [dbo].[ACC_MST_LedgerGroup] ([PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive], [ModifiedOn], [ModifiedBy]) VALUES ('Expenses', 'Direct Expense', 'Cost of Goods Sold', NULL, 1, GETDATE(), 1, NULL, NULL)


-- inserting in GroupMappingDetail

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 1 )
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Direct Income' and LedgerGroupName='Sales'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Direct Income' and LedgerGroupName='Sales'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMWriteOff'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMWriteOff'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMRetutnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMRetutnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr] ) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMRetutnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)

--END Salakha 30 Nov 2018 : inserted Pharmacy Rules and Mapping in ACC_MST_MappingDetail

--START Salakha 5 December 2018 :changes in trigger 
ALTER TABLE [dbo].[BIL_SYNC_BillingAccounting]
ADD SettlementDiscountAmount float
Go

---Trigger 
/****** Object:  Trigger [dbo].[TRG_BillToAcc_BillingTxn]    Script Date: 05-12-2018 14:52:17 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_BillToAcc_BillingTxn]
   ON  [dbo].[BIL_TXN_BillingTransaction]
   AFTER UPDATE
AS 
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ramavtar/2018-10-29			created the script
2       Salakha/2018-12-05          Added SettlementDiscountAmount
=======================================================
*/
BEGIN
	--perform only if settlementid is found
	IF (SELECT SettlementId FROM inserted) IS NOT NULL
	BEGIN
		--Declare Variables
		DECLARE @PaymentMode varchar(20)
		DECLARE @SettlementDiscountAmount float

		--Initializing
		SET @PaymentMode = (SELECT PaymentMode FROM BIL_TXN_Settlements WHERE SettlementId = (SELECT SettlementId FROM inserted))
        SET @SettlementDiscountAmount=(select DiscountAmount From BIL_TXN_Settlements where SettlementId=(SELECT SettlementId from Inserted))
    
		--Updating Values
		UPDATE BIL_SYNC_BillingAccounting
		SET PaymentMode = @PaymentMode, SettlementDiscountAmount = @SettlementDiscountAmount
		WHERE TransactionType = 'CreditBillPaid'
			AND ReferenceId IN (SELECT BillingTransactionItemId FROM BIL_TXN_BillingTransactionItems WHERE BillingTransactionId = (SELECT BillingTransactionId FROM inserted) )

	END
END

GO
--Adding mapping rule for cash discount

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr],[Description])
 VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='CreditBillPaid'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Indirect Expenses' and LedgerGroupName='Administration Expenses'), 
 1,'CashBillReturnAdministrationExpenses')
 GO
 --ENd: Salakha 5 December 2018 :Added new RuleMapping for cash discount 

 
--Start Ajay 06 Dec 2018
--created new table ACC_InvoiceData
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_InvoiceData](
	[InvoiceDataId] [int] IDENTITY(1,1) NOT NULL,
	[SectionId] [int] NULL,
	[ReferenceId] [int] NULL,
	[ReferenceModelName] [varchar](100) NULL,
	[ServiceDepartmentId] [int] NULL,
	[ItemId] [int] NULL,
	[IncomeLedgerName] [varchar](100) NULL,
	[PatientId] [int] NULL,
	[TransactionType] [varchar](50) NULL,
	[PaymentMode] [varchar](20) NULL,
	[SubTotal] [float] NULL,
	[TaxAmount] [float] NULL,
	[DiscountAmount] [float] NULL,
	[TotalAmount] [float] NULL,
	[CashAmount] [float] NULL,
	[DepositAdd] [float] NULL,
	[DepositDeduct] [float] NULL,
	[DepositReturn] [float] NULL,
	[IsTransferedToAcc] [bit] NULL,
	[TransactionDate] [datetime] NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
 CONSTRAINT [PK_ACC_InvoiceData] PRIMARY KEY CLUSTERED 
(
	[InvoiceDataId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

--Create the function to get the first letter of each word.
Create Function dbo.[FN_ACC_FIRST_LETTER_FROM_WORD]
(
   @str Varchar(Max) -- Variable for string
)
RETURNS Varchar(Max)
BEGIN
DECLARE @retval NVARCHAR(2000);
    SET @str=RTRIM(LTRIM(@str));
    SET @retval=LEFT(@str,1);

    WHILE CHARINDEX(' ',@str,1)>0 BEGIN
        SET @str=LTRIM(RIGHT(@str,LEN(@str)-CHARINDEX(' ',@str,1)));
        SET @retval+=LEFT(@str,1);
    END

    RETURN @retval;
END
GO

--add new column in ledgerGroup table
Alter table ACC_MST_LedgerGroup
add Name Varchar(max);
GO

--update new column
DECLARE @cnt INT = 1;

WHILE @cnt <= (select COUNT(*) from ACC_MST_LedgerGroup)
BEGIN
update ACC_MST_LedgerGroup
set Name=(select UPPER(dbo.[FN_ACC_FIRST_LETTER_FROM_WORD] ([PrimaryGroup]))+UPPER(dbo.[FN_ACC_FIRST_LETTER_FROM_WORD] ([COA]))+'_'+UPPER(REPLACE([LedgerGroupName],' ','_'))
	  from ACC_MST_LedgerGroup where LedgerGroupId=@cnt)
where LedgerGroupId=@cnt
   SET @cnt = @cnt + 1;
END;
GO

--Create trigger on ACC_MST_LedgerGroup for auto update value of Name
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
CREATE TRIGGER TRG_Update_LedgerGroup
   ON  ACC_MST_LedgerGroup
   AFTER INSERT
AS 
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
GO

--add new column Name in ACC_Ledger
ALTER TABLE ACC_Ledger
ADD Name VARCHAR(max)
GO

--update values of new column
DECLARE @cnt INT = 1;

WHILE @cnt <= (select COUNT(*) from ACC_Ledger)
BEGIN
UPDATE ACC_Ledger
SET Name=(select ledgrp.Name+'_'+UPPER(REPLACE(led.LedgerName,' ','_'))
 from ACC_Ledger led join ACC_MST_LedgerGroup ledgrp on led.LedgerGroupId=ledgrp.LedgerGroupId
 where led.LedgerId=@cnt) where LedgerId=@cnt
   SET @cnt = @cnt + 1;
END
GO

--Create trigger on ACC_Ledger for auto update value of Name
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
CREATE TRIGGER TRG_Update_Ledger
   ON  ACC_Ledger
   AFTER INSERT
AS 
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
GO

--update Description in ACC_MST_MappingDetail
DECLARE @cnt INT = 1;
WHILE @cnt <= (select COUNT(*) from ACC_MST_MappingDetail)
BEGIN
update ACC_MST_MappingDetail
set Description=(
	select gm.Description+REPLACE(lg.LedgerGroupName,' ','') from ACC_MST_MappingDetail md
	  join ACC_MST_GroupMapping gm on md.GroupMappingId=gm.GroupMappingId
	  join ACC_MST_LedgerGroup lg on md.LedgerGroupId=lg.LedgerGroupId
	where md.AccountingMappingDetailId=@cnt and md.Description is null)
where AccountingMappingDetailId=@cnt and Description is null
SET @cnt = @cnt + 1;
END;
GO

--Add new Ledger COGS
INSERT INTO [dbo].[ACC_Ledger]  ([LedgerName],[CreatedOn],[CreatedBy],[IsActive],[LedgerGroupId])
VALUES ('COGS',GETDATE(),1,1,(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'))
GO
--END Ajay: 06Dec2018

 
--Start Salakha: 06 Dec 2018- Added Column in PHRM_TXN_InvoiceReturnItems
ALTER TABLE PHRM_TXN_InvoiceReturnItems
ADD IsTransferredToACC bit
Go
--END Salakha: 06Dec2018

----END: Mahesh : 02Jan 2018 ---- Merged from accounting----


----START : VIKAS : 02Jan 2018 ---- Modify script for patient FullName----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_IRD_InvoiceDetails]
		@FromDate Datetime=null ,
		@ToDate DateTime=null
AS
/*
FileName: [SP_IRD_InvoiceDetails]
CreatedBy/date: Umed/2017-09-294
Description: to get the Invoice Details as per IRD requirements 
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date         Remarks
-------------------------------------------------------
1       Sud/2018-May-7          revised as per new ird requirements    
2		Ramavtar/07Dec			applying filter on CreatedOn instead of PaidDate 
3.		Vikas/02 Jan 2019		modify patient shortname(firstname and last name) to fullname(first,middle, and lastName)                                      
-------------------------------------------------------
*/
BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	 BEGIN
	 SET NOCOUNT ON
			
	SELECT
		--convert(varchar(20),year(biltxn.PaidDate)) as Fiscal_Year,
		fiscYr.FiscalYearFormatted AS Fiscal_Year,  --remove this and take from parameter table
		ISNULL(biltxn.InvoiceCode, 'BL') + CONVERT(varchar(20), biltxn.InvoiceNo) AS Bill_No,
		--pats.FirstName + ' ' + pats.LastName 
		isnull(pats.FirstName,'') + ' ' + isnull(pats.MiddleName,'') + ' ' + isnull(pats.LastName,'') AS Customer_name,
		pats.PANNumber,
		CONVERT(varchar(10), biltxn.CreatedOn, 120) AS BillDate,
		biltxn.TransactionType AS BillType,
		biltxn.SubTotal AS Amount,
		--CASE When biltxn.TransactionType!='DEPOSIT RETURN' then ((biltxn.PaidAmount-biltxn.TaxTotal)+biltxn.DiscountAmount) else biltxn.DepositReturnAmount END AS Amount,
		biltxn.DiscountAmount AS DiscountAmount,
		(biltxn.TaxableAmount) AS Taxable_Amount,
		(biltxn.TaxTotal) AS Tax_Amount,
		((biltxn.SubTotal - biltxn.DiscountAmount) + biltxn.TaxTotal) AS Total_Amount,
		CASE
			WHEN biltxn.IsRemoteSynced = 1 THEN 'Yes'
			ELSE 'No'
		END AS SyncedWithIRD,
		CASE
			WHEN biltxn.PrintCount > 0 THEN 'Yes'
			ELSE 'No'
		END AS Is_Printed,
		CONVERT(varchar(20), CONVERT(time, biltxn.CreatedOn), 100) AS Printed_Time,
		emp.FirstName + ' ' + emp.LastName AS Entered_By,
		emp.FirstName + ' ' + emp.LastName AS Printed_by,
		biltxn.PrintCount AS Print_Count,
		--might need to change logic for isrealtime--: sud:9May'18--
		CASE
			WHEN ISNULL(biltxn.IsRealtime, 0) = 1 THEN 'Yes'
			ELSE 'No'
		END AS Is_Realtime,
		--CASE When biltxn.IsRemoteSynced=1 then 'Yes' else 'No' END as Is_Realtime,
		CASE
			WHEN ISNULL(biltxn.ReturnStatus, 0) = 0 THEN 'True'
			ELSE 'False'
		END AS Is_Bill_Active
	FROM BIL_TXN_BillingTransaction biltxn
		INNER JOIN EMP_Employee emp ON emp.EmployeeId = biltxn.CreatedBy
		INNER JOIN PAT_Patient pats ON pats.PatientId = biltxn.PatientId
		INNER JOIN BIL_CFG_FiscalYears fiscYr ON biltxn.FiscalYearId = fiscYr.FiscalYearId
	WHERE CONVERT(date, biltxn.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)		
     END
END
GO
----------------------------------------------------------------------------------------------------
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_IRD_PHRM_InvoiceDetails]
		@FromDate Datetime=null ,
		@ToDate DateTime=null	
AS
/*
FileName: [SP_IRD_PHRM_InvoiceDetails]
CreatedBy/date: Vikas/2018-10-24
Description: to get the Pharmacy Invoice Details as per IRD requirements 
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.			Vikas/2018-10-24					Created
 2.       22 Nov 2018 By NageshBB               Update for fiscal year, and other columns
 3.			Ajay/04 Dec 2018					Changed InvoiceId to InvoicePrintId
 4.			Vikas/02 Jan 2019					modify patient shortname(firstname and last name) to fullname(first,middle, and lastName)
 ------------------------------------------------------------------------------
*/

BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	 BEGIN
	 SET NOCOUNT ON
select 
        dbo.FN_COMMON_GetFormattedFiscalYearByDate(inv.CreateOn) as Fiscal_Year,
		Convert(varchar(20),inv.InvoicePrintId) as Bill_No,
		--pat.FirstName+' '+pat.LastName 
		isnull(pat.FirstName,'') + ' ' + isnull(pat.MiddleName,'') + ' ' + isnull(pat.LastName,'') as Customer_name,	
		pat.PANNumber,		
	    CONVERT(VARCHAR(10), inv.CreateOn, 120) As BillDate,
		'ItemTransaction' as BillType, --here only for ird details need to handle into pharmacy table also
	    inv.SubTotal AS Amount,
        inv.DiscountAmount as DiscountAmount,
	   ((inv.SubTotal-inv.DiscountAmount)+inv.VATAmount) As Total_Amount,
	   (inv.VATAmount) as Tax_Amount ,
	   case when inv.VATAmount >0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As Taxable_Amount ,
	   case when inv.VATAmount <=0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As  NonTaxable_Amount  ,
	   CASE When inv.IsRemoteSynced=1 then 'Yes' else 'No' END AS SyncedWithIRD,
	   CASE WHEN inv.PrintCount > 0  THEN 'Yes' ELSE 'No' END AS Is_Printed,	
	   CASE WHEN inv.PrintCount >0 Then   convert(varchar(20),convert(time,inv.CreateOn),100) Else '' END AS Printed_Time,
       CASE When ISNULL(inv.IsRealtime,0)=1 then 'Yes' ELSE 'No' END as Is_Realtime,
	   CASE WHEN ISNULL(inv.IsReturn,0)= 0  THEN 'True' ELSE 'False' END AS Is_Bill_Active,
	   emp.FirstName+' '+emp.LastName as Entered_By,				   
	   emp.FirstName+' '+emp.LastName  as Printed_by,
	   inv.PrintCount as Print_Count,
	   CASE When ISNULL(inv.IsRealtime,0)=1 then 'Yes' ELSE 'No' END as Is_Realtime,				  
	   CASE WHEN ISNULL(inv.IsReturn,0)= 0  THEN 'True' ELSE 'False' END AS Is_Bill_Active
  from PHRM_TXN_Invoice inv 
	 inner join	EMP_Employee emp on emp.EmployeeId=inv.CreatedBy
	 inner join    PAT_Patient pat on pat.PatientId=inv.PatientId
  WHERE (  
        CONVERT(DATE,inv.CreateOn) BETWEEN CONVERT(DATE,@FromDate) 
     AND CONVERT(DATE,@ToDate) 
     ) 
	  END
END
GO
----END: VIKAS : 02Jan 2018 ---- Modify script for patient FullName----

---START: NageshBB 04 Jan 2019: --Added parameter for Accounting section Master Data
Insert into CORE_CFG_Parameters
values('Accounting','SectionList','{"SectionList":[{ "SectionId": 1, "SectionName": "Inventory" }, { "SectionId": 2, "SectionName": "Billing" },{ "SectionId": 3, "SectionName": "Pharmacy" }]}','JSON','This is section (module name) master data for accounting')
go
---END: NageshBB 04 Jan 2019: --Added parameter for Accounting section Master Data


---START: 7thJan'19--sud -- merged from Test to Dev----
-----Start:3rd_Jan_2018_Merge from main to test -------------------------

/****** Object:  StoredProcedure [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]    Script Date: 1/1/2019 3:03:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_BIL_GetItems_ForIPBillingReceipt] 
  @PatientId INT,  
  @PatientVisitId INT, 
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

-------------------------------------------------------------------------------
*/

BEGIN
Select Convert(DATE, itm.CreatedOn) 'BillDate'
	  ,dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, 
	   emp.EmployeeId 'DoctorId',
	    emp.FirstName + ISNULL(emp.MiddleName + ' ', '') + emp.LastName 'DoctorName',
	   itm.Price,  itm.Quantity,  itm.SubTotal,  itm.DiscountAmount,  itm.Tax,  itm.TotalAmount
	  ,itm.ServiceDepartmentId, itm.ItemId
	FROM BIL_TXN_BillingTransactionItems itm
	left join EMP_Employee emp on itm.ProviderId = emp.EmployeeId
	WHERE PatientId=@PatientId 
	  AND PatientVisitId= @PatientVisitId
	  AND ISNULL(itm.BillingTransactionId,0) =  ISNULL(@BillTxnId, ISNULL(itm.BillingTransactionId,0))
	  AND itm.BillStatus= ISNULL(@BillStatus,itm.BillStatus)
	ORDER BY itm.SubTotal desc
END
GO


/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts]    Script Date: 1/1/2019 3:13:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
  when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
 when ((@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY') and @ItemName like '%FNAC%')  THEN ('FNAC') 
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
					OR(@ServiceDeptName='LAB CHARGES')  THEN ('LAB CHARGES')	
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
					OR(@ServiceDeptName='IMAGING')  THEN ('RADIOLOGY CHARGES')

          WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' OR @ItemName='DOCTOR ROUND CHARGES'))  THEN ('DOCTOR VISIT CHARGES') 
		  WHEN (@ServiceDeptName='Bed Charges' AND @ItemName like '%NICU%' )  THEN ('NICU BED CHARGES') 
		   WHEN (@ServiceDeptName='Bed Charges' AND @ItemName = 'ICU' )  THEN ('ICU BED CHARGES') 
 WHEN (@ServiceDeptName='Bed Charges' AND @ItemName = 'SUIT' )  THEN ('SUIT BED CHARGES') 
 WHEN (@ServiceDeptName='Bed Charges' AND @ItemName = 'VIP' )  THEN ('VIP BED CHARGES') 
 WHEN (@ServiceDeptName='Bed Charges' AND @ItemName = 'ICCU' )  THEN ('ICCU BED CHARGES') 
 WHEN (@ServiceDeptName='Bed Charges' AND @ItemName like '%Semi Private With AC%' )  THEN ('Semi Private With AC BED CHARGES') 
 WHEN (@ServiceDeptName='Bed Charges' AND @ItemName = 'HCU/MICU/SICU' )  THEN ('HCU/MICU/SICU BED CHARGES') 
 WHEN (@ServiceDeptName='Bed Charges' AND @ItemName like '%Cabin%' )  THEN ('CABIN BED CHARGES') 
 WHEN (@ServiceDeptName='Bed Charges' AND @ItemName = 'General' )  THEN ('GENERAL BED CHARGES') 

		  WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'BED CHARGES') )  THEN ('BED CHARGES') 
		  WHEN (@ServiceDeptName='Bed Charges' )  THEN ('BED CHARGES') 
		  WHEN (@ServiceDeptName = 'IPD' AND @ItemName='ADMISSION CHARGES (INDOOR)') THEN 'ADMISSION CHARGES'
		  WHEN (@ServiceDeptName = 'MISCELLENOUS CHARGES' AND @ItemName='Medical Record Charge') THEN 'ADMISSION CHARGES'
		  WHEN (@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS' AND @ItemName = 'BED SIDE ECHO')  THEN ('BED SIDE ECHO') 
		  WHEN(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  WHEN(@ServiceDeptName='OT') then ('OT PROCEDURE CHARGES')
		  WHEN(@ServiceDeptName='MISCELLENOUS CHARGES') OR (@ServiceDeptName='MISCELLANEOUS') then ('OTHER CHARGES')
		  ELSE (@ServiceDeptName) END 
		 )
END
GO

---------------ISR-------------

------------FN ISR
/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation]    Script Date: 12/23/2018 2:50:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create FUNCTION [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptReporingName  Created: 22Aug'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Reports as per Input ServiceDepartmentName
 Remarks: We can extend this function for ItemName as well if needed.
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/22Aug'18                        Initial Draft
 2.       Dinesh/10Sept'18                    passing itemname along with srvDeptName to the function
 3.		  dinesh /14thSep'18      grouped and  merged the labcharges and miscellaneous to the respective single view header 
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
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
					OR(@ServiceDeptName='EXTERNAL LAB-1')
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
					When (@ItemName like '%OPERATION CHARGE%') Then ('OPERATION CHARGES') 

					WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName='BED CHARGES' or @ItemName='ICU') THEN ('BED CHARGES')
					WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName='INDOOR-DOCTOR''S VISIT FEE (PER DAY)' or 
					@ItemName='DOCTOR ROUND CHARGES' ) Then ('INDOOR DOCTOR VISIT FEE')
					WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName='ADMISSION FEE') THEN ('ADMISSION FEE')
					WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName='PFT DOCTOR CONSULTATION CHARGES') THEN ('PFT DOCTOR CONSULTATION CHARGES')

					WHEN (@ServiceDeptName='MRI') THEN ('MRI')
					WHEN (@ServiceDeptName='C.T. SCAN') THEN ('C.T. SCAN')
					WHEN (@ServiceDeptName='ULTRASOUND') OR(@ServiceDeptName='ULTRASOUND COLOR DOPPLER') THEN ('USG')
					WHEN (@ServiceDeptName='X-RAY') THEN ('X-RAY')
		   WHEN (@ServiceDeptName='DUCT')
					OR(@ServiceDeptName='MAMMOLOGY')
					OR(@ServiceDeptName='PERFORMANCE TEST') 
					OR(@ServiceDeptName='BMD-BONEDENSITOMETRY')
					OR(@ServiceDeptName='OPG-ORTHOPANTOGRAM')
					OR(@ServiceDeptName='MAMMOGRAPHY')
					OR(@ServiceDeptName='X-RAY')
					OR(@ServiceDeptName='DEXA')
					OR(@ServiceDeptName='IMAGING')  		THEN ('RADIOLOGY')
		  when (@ServiceDeptName='MISCELLANEOUS')
					OR (@ServiceDeptName='MISCELLENOUS CHARGES')
															then ('HOSPITAL OTHER CHARGES')
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS') then 'CARDIOLOGY'
			WHEN (@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )

END

GO

-----------------------VW ISR-----


/****** Object:  View [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]    Script Date: 12/23/2018 2:46:49 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

Create VIEW [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation]
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
FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO

-----------------ISR SP---------------------------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_IncomeSegregation]    Script Date: 12/25/2018 8:32:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_IncomeSegregation]
	--SP_Report_BIL_IncomeSegregation '2018-12-09','2018-12-09' 
@FromDate Date=null ,
@ToDate Date=null	
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
-------------------------------------------------------------------------------
*/
BEGIN
 ;
  WITH IncomeSegCTE As (
--Cash Sale  which has paidDate, here paid date as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation](ServiceDepartmentName,ItemName) as ServDeptName
,PaidDate as BillingDate,Quantity as Unit, SubTotal as CashSales,DiscountAmount as CashDiscount,0 as CreditSales,0 as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from [VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation] where PaidDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and PaidDate is not null and CreditDate is null
),
 IncomeSegCreditCTE
  AS(
--Credit Sale, which has CreditDate, here CreditDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation](ServiceDepartmentName,ItemName) as ServDeptName
,CreditDate as BillingDate,Quantity as Unit, 0 as CashSales,0 as CashDiscount,SubTotal as CreditSales,DiscountAmount as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from [VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation] where CreditDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and CreditDate is not null
),
 IncomeSegCreditReturnedCTE
  AS(
--Return Sale, which has Return Date, here ReturnDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation](ServiceDepartmentName,ItemName) as ServDeptName
,ReturnDate as BillingDate,0 as Unit, 0 as CashSales,0 as CashDiscount,0 as CreditSales,0 as CreditDiscount, Quantity as ReturnQuantity, SubTotal as ReturnAmount, DiscountAmount as ReturnDiscount
from [VW_BIL_TxnItemsInfoWithDateSeparation_Income_Segregation] where ReturnDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and ReturnDate is not null
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


-----End:3rd_Jan_2018_Merge from main to test -------------------------

---END: 7thJan'19--sud -- merged from Test to Dev----


---start: sud:7Jan'19--Parameters for WristBand printing---

Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
Values('ADT','WristBand_PrintServerSide','false','boolean','whether or not to print WristBand from server side.')
GO
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
Values('ADT','WristBand_FolderPath','C:\\DanpheHealthInc_PvtLtd_Files\\Print\\ADT\\WristBand_1\\','string','Location to store HTML files generated from wrist-band sticker, this location will be pinged by Printer''s Host machine to get the files.')
GO
---end: sud:7Jan'19--Parameters for WristBand printing---
------END: Labelled upto Here for V1.10.0-----------


---start: sud:8Jan'19--parameterizing ADT Features--
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
Values('ADT','ADTCustomFeatures','{"wristband":true}','boolean','eg:whether or not to give wristband feature. eg: true for hospital1 and false for hospital2, add other custom features and use parameter accordingly.')
GO
---end: sud:8Jan'19--parameterizing ADT Features--

---Start: Abhishek:10Feb'19--Missing field on invoice txn table--
alter table [dbo].[PHRM_TXN_Invoice]
add IsTransferredToACC int
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_ADT_TotalAdmittedPatient]  ---[SP_Report_ADT_TotalAdmittedPatient] '2019-01-01','2018-01-13'
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
1       Sagar/2017-05-27	                   created the script
2       Umed / 2017-06-08                      Modify the script i.e format and alias of table
                                               and Remove The time from AdmissionDate
											   and Group the Query by AdmissionDate
3.     Dinesh/2017-06-28                       all the information is requred to see the Admitted report and count at the last 
4      Umed/2018-04-23                        Apply Order by Desc Date and Added SR No also with Order By Date 
5.     Sud/24Sept'18                           Correction in Patientname, DoctorName, VisitId
6      Din /14th Jan'19						Ward and Bed details shown on list
-------------------------------------------------------------------------------
*/

BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN 
				
             SELECT 
				   (Cast(ROW_NUMBER() OVER (ORDER BY  AdmissionDate desc)  AS int)) AS SN,
				       P.FirstName + ' ' + ISNULL(P.MiddleName + ' ', '') + P.LastName 'PatientName',
					   P.PatientId,
					   Ward.WardName as 'Ward',
					   bedNo.BedNumber as 'BedNo',
		           --(P.Firstname+''+P.LastName) 'PatientName',
			       convert(varchar(20),CONVERT(date,AdmissionDate)) 'AdmissionDate',
			       --(E.FirstName+' '+E.LastName) 'AdmittedDoctor',
				   ISNULL(E.Salutation + '. ', '') + E.FirstName + ' ' + ISNULL(E.MiddleName + ' ', '') + E.LastName 'AdmittedDoctor',
			        A.PatientVisitId  'VisitId'  FROM ADT_PatientAdmission A join PAT_PatientVisits V -- changed from A.PatientVisitId to VisitCode--sud
			               ON A.PatientVisitId = V.PatientVisitId
			               JOIN EMP_EMPLOYEE E ON A.AdmittingDoctorId= E.EmployeeId 
			               JOIN PAT_Patient P ON P.PatientId=V.PatientId 
						   JOIN ADT_TXN_PatientBedInfo bed ON A.PatientId=bed.PatientId and bed.Action='admission' and EndedOn is null
						   JOIN ADT_MST_Ward Ward on Ward.WardID = bed.WardId
						   JOIN ADT_Bed bedNo on bedNo.BedID=bed.BedId
				   --WHERE A.AdmissionStatus='admitted' 
			Order by convert(varchar(20),CONVERT(date,AdmissionDate)) desc
	END	
END
GO
---End: Dinesh : 124th Jan 2019 ---Added ward and Bed number on sp admitted list------

----start: Sud: 15Jan'19--Reverse Integration from  Features/RadiologyEnhancements--
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
Values('Radiology','RadReportCustomerHeader','{"show":false,"headerType":"image"}','JSON','headerType=(image or text-formatted). This is to determine whether to show customer header in radiology report')
GO
---- end: Sud: 15Jan'19--Reverse Integration from  Features/RadiologyEnhancements--


---Start: Ajay: 18Jan'19 --Module:Accounting--changed Bil_Sync_BillingAccounting table TransactionDate Logic
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
		DECLARE @PaymentMode varchar(20), @ReportingDeptName varchar(100)

		--Initializing
		SET @PaymentMode = (SELECT PaymentMode FROM BIL_TXN_BillingTransaction WHERE BillingTransactionId = (SELECT BillingTransactionId FROM inserted))
		SET @ReportingDeptName = (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName) FROM inserted)
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
GO
---End: Ajay: 17Jan'19 --Module:Accounting--changed Bil_Sync_BillingAccounting table TransactionDate Logic


---start: Sud: 17Jan'19--Changed in Dashboard Statistics for OPD Count--
/****** Object:  StoredProcedure [dbo].[SP_DSB_Home_DashboardStatistics]    Script Date: 1/17/2019 6:09:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

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
4.      sud/17Jan'19                           removed returned count from TOtal, Added Transfer count to New 
--------------------------------------------------------
*/
BEGIN
	--Rules:-- 
	/*
	 1. Search Criteria is only 'today's OutPatient visits': VisitType='outpatient'  AND CONVERT(DATE,VisitDate)=CONVERT(DATE,GETDATE())
	 2. Total: today's all OPD counts
	 3. New: AppointmentType='new'  or AppointmentType='Transfer'
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
	 ---Returned Visits are excluded in this Counts--:sud-17Jan'19--reference: Dinesh
    (Select 
		SUM(1) 'TotalAppts',
		SUM( CASE WHEN (AppointmentType='new' OR AppointmentType='Transfer') THEN 1 ELSE 0 END ) AS 'NewAppts',
		SUM( CASE WHEN AppointmentType='referral' THEN 1 ELSE 0 END ) AS 'ReferralAppts',
		SUM( CASE WHEN AppointmentType='followup' THEN 1 ELSE 0 END ) AS 'FollowUpAppts',
		SUM( CASE WHEN AppointmentType='new' and BillingStatus='cancel' THEN 1 ELSE 0 END ) AS 'CancelAppts'
		--SUM( CASE WHEN AppointmentType='new' and BillingStatus='returned' THEN 1 ELSE 0 END ) AS 'ReturnAppts'--sud:17Jan'19--removed returned from this query, added in separate query below.
		from PAT_PatientVisits where VisitType='outpatient' AND CONVERT(DATE,VisitDate)=CONVERT(DATE,GETDATE())
		and BillingStatus !='returned' -- exclude returned visits..
	) appt,

	 (Select 
		Count(*) 'ReturnAppts'
		FROM PAT_PatientVisits 
		where VisitType='outpatient' AND CONVERT(DATE,VisitDate)=CONVERT(DATE,GETDATE())
		and BillingStatus='returned'
	) retAppts
END

GO

---end: Sud: 17Jan'19--Changed in Dashboard Statistics for OPD Count--

---START:VIKAS: 22 Jan'19 --Added new column into acc_Txn_details table--
ALTER TABLE [dbo].[ACC_TransactionItemDetail] ADD VenderId int null
GO
---END:VIKAS: 22 Jan'19 --Added new column into acc_Txn_details table--




---START:VIKAS: 22 Jan'19 --Create Store Procedure for ADT Bed feature summary--

/****** Object:  StoredProcedure [dbo].[ADT_BedFeature]   Script Date: 1/22/2019 12:55:15 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ADT_BedFeature]

AS
/*
FileName: [ADT_BedFeature]
CreatedBy/date: Vikas/1/22/2019 
Description: to get the ADT Bed Feature Details Report
 */
BEGIN
select x.BedFeatureName,x.Occupied,x.Vacant, x.Reserved, (x.Occupied + x.Vacant+ x.Reserved) AS Total  from 
(	
	select bf.BedFeatureName,
		 count( CASE When bd.IsOccupied=1 then 1 END) AS Occupied,
		 count( CASE When bd.IsOccupied=0 then 1 END) AS Vacant,
		 (0) AS Reserved
			
	from ADT_Bed bd		 
	 inner join	ADT_MAP_BedFeaturesMap Map ON Map.BedId = bd.BedID
	 inner join ADT_MST_BedFeature bf on map.BedFeatureId=bf.BedFeatureId
	group by bf.BedFeatureName
	) as x	
END
GO

---END:VIKAS: 22 Jan'19 --Create Store Procedure for ADT Bed feature summary--

---START:Salakha: 23 Jan'19 - Added VoucherCode for Vouchers in ACC_MST_Vouchers
ALTER TABLE ACC_MST_Vouchers
ADD VoucherCode varchar(50);
GO

UPDATE [dbo].[ACC_MST_Vouchers]
   SET [VoucherCode] = 'PV' 
 WHERE VoucherName ='Purchase Voucher'
GO 

UPDATE [dbo].[ACC_MST_Vouchers]
   SET [VoucherCode] = 'SV' 
 WHERE VoucherName ='Sales Voucher'
GO

UPDATE [dbo].[ACC_MST_Vouchers]
   SET [VoucherCode] = 'JV' 
 WHERE VoucherName ='Journal Voucher'
GO

UPDATE [dbo].[ACC_MST_Vouchers]
   SET [VoucherCode] = 'PMTV' 
 WHERE VoucherName ='Payment Voucher'
GO

UPDATE [dbo].[ACC_MST_Vouchers]
   SET [VoucherCode] = 'RV' 
 WHERE VoucherName ='Receipt Voucher'
GO

UPDATE [dbo].[ACC_MST_Vouchers]
   SET [VoucherCode] = 'CV' 
 WHERE VoucherName ='Contra Voucher'
GO

UPDATE [dbo].[ACC_MST_Vouchers]
   SET [VoucherCode] = 'CN' 
 WHERE VoucherName ='Credit Note'
GO

UPDATE [dbo].[ACC_MST_Vouchers]
   SET [VoucherCode] = 'DN' 
 WHERE VoucherName ='Debit Note'
GO

ALTER TABLE [dbo].[ACC_TransactionItemDetail]
 ADD SupplierId int null
GO

---END:Salakha: 23 Jan'19 - Added VoucherCode for Vouchers 

---Start : Ajay : 23 Jan 2019 --Created Billing Department Revenue Report
INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('reports-billingmain-departmentrevenuereport-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='RPT'),1,GETDATE(),1)
GO

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive)
VALUES ('Department Revenue','Reports/BillingMain/DepartmentRevenueReport','DepartmentRevenue',
(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='reports-billingmain-departmentrevenuereport-view'),
(SELECT RouteId FROM RBAC_RouteConfig WHERE UrlFullPath='Reports/BillingMain'),
'fa fa-money fa-stack-1x text-white',1,1)
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author/Date:    NageshBB-Ajay/23Jan'19
-- Description:    show department wise revenue details
-- Remarks: 
--revenue department select cases 
--outpatient CASES 
--== == == == == == == == == == == == == ==
--#1
--  iF BillingType = 'outpatient' & & REQUESTED BY NULL Revenue for -> DepartmentId (Parent of ServiceDepartmentId)
--#2
--  IF BillingType = 'outpatient' & & REQUESTED BY NOT NULL Revenue for -> BilDeptIdByRequestedBy inpatient 
 
--inpatient CASES 
--== == == == == == == == == == == == == ==
--#3
--  If BillingType = 'inpatient' & & RequestedBy is Not Null then Revenue for -> BilDeptIdByRequestedBy
--#4
--  If BillingType = 'inpatient' & & RequestedBy is NULL Revenue for -> AdtDocDepartmentId

--[SP_Report_BIL_DepartmentRevenue] '2019-01-14','2019-01-22'
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_BIL_DepartmentRevenue]
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL
AS
/*
Change History
—------------------------------------------------------—
S.No.    UpdatedBy/Date          Remarks
—------------------------------------------------------—
1.    NageshBB-Ajay/23 Jan 2019           created sp
—------------------------------------------------------—
*/
BEGIN
SELECT 
reportData.DepartmentId,
d.DepartmentName,
sd.ServiceDepartmentId,
sd.ServiceDepartmentName,   
reportData.ItemName,
SUM(ISNULL(reportData.SubTotal, 0)) 'SubTotal',
SUM(ISNULL(reportData.DiscountAmount, 0)) AS 'Discount',
SUM(ISNULL(reportData.ReturnAmount, 0)) AS 'Refund',
SUM(ISNULL(reportData.TotalAmount, 0) - ISNULL(reportData.ReturnAmount, 0)) AS 'NetTotal'
FROM 
	(SELECT
		(CASE
			WHEN 
				f.BillingType='outpatient' AND bi.RequestedBy IS NULL
			THEN d.DepartmentId
			WHEN 
				(f.BillingType='outpatient' OR f.BillingType='inpatient') AND bi.RequestedBy IS NOT NULL
			THEN (SELECT DepartmentId FROM EMP_Employee WHERE EmployeeId = bi.RequestedBy)
			WHEN 
				f.BillingType='inpatient' AND bi.RequestedBy IS NULL 
			THEN (SELECT ee.DepartmentId  FROM ADT_PatientAdmission ad
					JOIN EMP_Employee ee ON ad.AdmittingDoctorId = ee.EmployeeId
					WHERE PatientVisitId = bi.PatientVisitId AND PatientId = bi.PatientId)
		END) AS DepartmentId,
	f.*
	FROM dbo.FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate) f
	JOIN BIL_TXN_BillingTransactionItems bi ON f.BillingTransactionItemId = bi.BillingTransactionItemId
	JOIN BIL_MST_ServiceDepartment sd ON sd.ServiceDepartmentId = f.ServiceDepartmentId
	JOIN MST_Department d  ON d.DepartmentId = sd.DepartmentId) AS reportData
JOIN BIL_MST_ServiceDepartment sd ON reportData.ServiceDepartmentId=sd.ServiceDepartmentId
JOIN MST_Department d ON reportData.DepartmentId=d.DepartmentId
WHERE reportData.BillStatus != 'cancelled' 
      AND reportData.BillStatus != 'provisional'
      AND (reportData.PaymentMode != 'credit' OR reportData.CreditDate IS NOT NULL)
    GROUP BY 
    reportData.DepartmentId,
    d.DepartmentName,
    sd.ServiceDepartmentId,
    sd.ServiceDepartmentName,  
    reportData.ItemName

  ORDER BY 2
END
GO
---End : Ajay : 23 Jan 2019 --Created Billing Department Revenue Report


---start: Hom: 24 Jan'19-- Added a column to check additional items and add the additional items from CORE_CFG_Parameters if there is any additional items
Alter table BIL_CFG_BillItemPrice
Add HasAdditionalBillingItems bit Default null
go
declare @srvDeptId int;
set @srvDeptId = (select ServiceDepartmentId from BIL_MST_ServiceDepartment where ServiceDepartmentName = 'MISCELLANEOUS')
if (@srvDeptId is not null)
begin
declare @maxItemId int;
set @maxItemId = (select MAX(ItemId)+1 from [BIL_CFG_BillItemPrice] where ServiceDepartmentId = 4)

INSERT INTO [dbo].[BIL_CFG_BillItemPrice]
           ([ServiceDepartmentId]
           ,[ItemName]
           ,[Price]
           ,[ItemId]
           ,[TaxApplicable]
           ,[DiscountApplicable]
           ,[CreatedBy]
           ,[CreatedOn]
           ,[IsActive]
           ,[DisplaySeq]
           ,[IsDoctorMandatory])
     VALUES
           (@srvDeptId,'Chest Rehab',500,@maxItemId,0,1,1,GETDATE(),1,100,0)
end
go
declare @srvDeptId int;
set @srvDeptId= (select ServiceDepartmentId from [BIL_CFG_BillItemPrice] where ItemName = 'Chest Rehab')
declare @itemId int;
set @itemId = (select ItemId from [BIL_CFG_BillItemPrice] where ItemName = 'Chest Rehab')
if ( @srvDeptId is not null) 
 and (@itemId IS NOT NULL)
begin
INSERT [dbo].[CORE_CFG_Parameters] (
[ParameterGroupName], 
[ParameterName], 
[ParameterValue], 
[ValueDataType], 
[Description]) VALUES 
(N'Visit',
N'AdditionalBillingItems',
N'{"ItemList": [{ "ServiceDepartmentId":'+convert(varchar,@srvDeptId)+N',"ItemId":'+convert(varchar,@itemId)+N'}]}',
N'JSON',
N'These billing items are added along with doctor charges when visit is created if the doctor billing item has IncludeAddiontalBillingItems value true.')
end
go

---End----Hom: 24 Jan'19


---START : Vikas : 24th Jan'19 -- Removed date filter parameters and added some new data columns of addmitted patients in SP_Report_ADT_TotalAdmittedPatient

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_ADT_TotalAdmittedPatient]  ---[SP_Report_ADT_TotalAdmittedPatient] '2019-01-01','2018-01-13'

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
1       Sagar/2017-05-27	                   created the script
2       Umed / 2017-06-08                      Modify the script i.e format and alias of table
                                               and Remove The time from AdmissionDate
											   and Group the Query by AdmissionDate
3.     Dinesh/2017-06-28                       all the information is requred to see the Admitted report and count at the last 
4      Umed/2018-04-23                        Apply Order by Desc Date and Added SR No also with Order By Date 
5.     Sud/24Sept'18                           Correction in Patientname, DoctorName, VisitId
6      Din /14th Jan'19						Ward and Bed details shown on list
7.	   Vikas/24th Jan'19					 Removed Date filter parameters and get some new data column of admitted patients.
-------------------------------------------------------------------------------
*/
BEGIN

	BEGIN 
			select 
			   (Cast(ROW_NUMBER() OVER (ORDER BY  AdmissionDate desc)  AS int)) AS SN,
				AD.AdmissionDate,
				P.PatientCode,
				V.VisitCode,
				P.FirstName + ' ' + ISNULL(P.MiddleName + ' ', '') + P.LastName AS 'PatientName',
				P.Age as [Age/Sex],
				ISNULL(E.Salutation + '. ', '') + E.FirstName + ' ' + ISNULL(E.MiddleName + ' ', '') + E.LastName 'AdmittingDoctorName',
				bedNo.BedCode as 'BedCode',
				bedf.BedFeatureName as BedFeature
				from ADT_PatientAdmission AD
				join PAT_PatientVisits V on AD.PatientVisitId=V.PatientVisitId
				JOIN PAT_Patient P ON P.PatientId=V.PatientId 
				JOIN EMP_EMPLOYEE E ON AD.AdmittingDoctorId= E.EmployeeId 
				JOIN ADT_TXN_PatientBedInfo bed ON AD.PatientId=bed.PatientId and EndedOn is null -- and bed.Action='admission' and EndedOn is null
				JOIN ADT_Bed bedNo on bedNo.BedID=bed.BedId
				JOIN ADT_MAP_BedFeaturesMap bedm on bedNo.BedID=bedm.BedId
				JOIN ADT_MST_BedFeature bedf on bedm.BedFeatureId=bedf.BedFeatureId
			    
				where ad.AdmissionStatus='admitted'		
	END	
END
GO
---END : Vikas : 24th Jan'19 -- Removed date filter parameters and added some new data columns of addmitted patients in SP_Report_ADT_TotalAdmittedPatient

--START : Salakha : 28 Jan 19 -- Removed column from PHRM_GoodsReceiptItems
ALTER TABLE PHRM_GoodsReceiptItems
DROP COLUMN IsTransferredToACC;
go
--End : Salakha : 28 Jan 19 -- Removed column from PHRM_GoodsReceiptItems



---Start: Dinesh : 29th Jan'19 --Doctor Summary/Income Segregation  Report Changes according to HAMS Requirement

------1. [SP_Report_BIL_DoctorDeptItemsSummary] 


/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DoctorDeptItemsSummary]    Script Date: 1/29/2019 6:27:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
5.	Dinesh /29Jan'19            FN_BIL_GetTxnItemsInfoWithDateSeparation changed to FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary
---------------------------------------------------------- 
*/
BEGIN
	IF(@SrvDeptName IS NOT NULL)
		BEGIN
			SELECT
			    COALESCE(fnItems.ReturnDate, fnItems.PaidDate, fnItems.CreditDate) 'Date',
			    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			    pat.PatientCode,
			    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			    fnItems.ServiceDepartmentName,
			    fnItems.ItemName,
			    fnItems.Price,
			    fnItems.Quantity,
			    fnItems.SubTotal,
			    fnItems.DiscountAmount,
			    fnItems.TotalAmount,
			    fnItems.ReturnAmount,
			    fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
			FROM (SELECT
			    *
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)) fnItems
			JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
			WHERE fnItems.ServiceDepartmentName = @SrvDeptName
				AND ISNULL(fnItems.ProviderId, 0) = @DoctorId
				AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
				AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
			ORDER BY 1 DESC

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
			    COALESCE(fnItems.ReturnDate, fnItems.PaidDate, fnItems.CreditDate) 'Date',
			    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			    pat.PatientCode,
			    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			    fnItems.ServiceDepartmentName,
			    fnItems.ItemName,
			    fnItems.Price,
			    fnItems.Quantity,
			    fnItems.SubTotal,
			    fnItems.DiscountAmount,
			    fnItems.TotalAmount,
			    fnItems.ReturnAmount,
			    fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
			FROM (SELECT
			    *
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)) fnItems
			JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
			WHERE ISNULL(fnItems.ProviderId, 0) = @DoctorId
				AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
				AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
			ORDER BY 1 DESC,5 ASC

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

--------2. [FN_BIL_GetSrvDeptReportingName_DoctorSummary]


/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary]    Script Date: 1/29/2019 5:09:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create FUNCTION [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptReporingName  Created: 22Aug'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Reports as per Input ServiceDepartmentName
 Remarks: We can extend this function for ItemName as well if needed.
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/22Aug'18                        Initial Draft
 2.       Dinesh/10Sept'18                    passing itemname along with srvDeptName to the function
 3.		  dinesh /14thSep'18				  grouped and  merged the labcharges and miscellaneous to the respective single view header 
 4.       Dinesh / 29th Jan'19				  Segregated the servicedepartments and items according to the need from HAMS
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
 when (@ServiceDeptName='LABORATORY' and @ItemName='HISTO')  THEN ('HISTOPATHOLOGY') 
 when (@ServiceDeptName='CYTOLOGY' and  @ItemName like '%bone marrow%' ) 
 OR (@ServiceDeptName='LABORATORY' and  @ItemName like '%bone marrow%' ) 
  THEN ('BONE MARROW') 
   when (@ServiceDeptName='CYTOLOGY' and  @ItemName like '%slide consultation%' ) 
 OR (@ServiceDeptName='LABORATORY' and  @ItemName like '%slide consultation%' ) 
  THEN ('SLIDE CONSULTATION') 
   when (@ServiceDeptName='EXTERNAL LAB - 1' and @ItemName like '%FNAC%' )
    OR (@ServiceDeptName='LABORATORY' and @ItemName like '%FNAC%')  
	OR (@ServiceDeptName='CYTOLOGY' and @ItemName like '%FNAC%') 
	THEN ('FNAC') 
 when (@ServiceDeptName='CYTOLOGY' )  THEN ('CYTOLOGY') 

   when (@ServiceDeptName='ATOMIC ABSORTION')
					OR(@ServiceDeptName='BIOCHEMISTRY')
					OR(@ServiceDeptName='CLNICAL PATHOLOGY')
					OR(@ServiceDeptName='CLINICAL PATHOLOGY')
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
		When (@ServiceDeptName='X-RAY' and @ItemName = 'HSG')
		OR (@ServiceDeptName='OT Minor Procedure Charges OBGY' and @ItemName = 'HSG')
		THEN 'HSG'
	When (@ServiceDeptName='GYNAECOLOGY PROCEDURE(OPD ONLY)' and @ItemName = 'HYDROTUBATION PER CYCLE')
		THEN 'HYDROTUBATION'
	When (@ServiceDeptName='NON INVASIVE CARDIOlOGY' and @ItemName = 'Fetal ECHO')
		THEN 'FETAL ECHO'
		WHEN (@ItemName like '%LSCS') 
		OR (@ItemName like '%L.S.C.S%')
		THEN 'LSCS'
	When (@ServiceDeptName='OT Major Procedure Charges OBGY' and @ItemName like '%Myomec%')
		THEN 'MYOMECTOMY'
When (@ServiceDeptName='OT Minor Procedure Charges OBGY' and @ItemName = 'MC SUTURE')
		THEN 'MC SUTURE'
		WHEN @ItemName like '%MVA%'
		THEN 'MVA'
		WHEN @ItemName like '%POLYPECTOMY%'
		THEN 'CERVICAL BIOPSY & POLYPECTOMY'

					
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

END
GO

------3. FN_BIL_GetSrvDeptReportingName_Income_Segregation

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation]    Script Date: 1/29/2019 5:23:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_BIL_GetSrvDeptReportingName_Income_Segregation] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptReporingName  Created: 22Aug'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Reports as per Input ServiceDepartmentName
 Remarks: We can extend this function for ItemName as well if needed.
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/22Aug'18                        Initial Draft
 2.       Dinesh/10Sept'18                    passing itemname along with srvDeptName to the function
 3.		  dinesh /14thSep'18		          grouped and  merged the labcharges and miscellaneous to the respective single view header 
 4.       Dinesh / 29th Jan'19				  Segregated the servicedepartments and items according to the requirements from HAMS
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
   when (@ServiceDeptName='LABORATORY' and @ItemName='HISTO')  THEN ('HISTOPATHOLOGY') 
 when (@ServiceDeptName='CYTOLOGY' and  @ItemName like '%bone marrow%' ) 
 OR (@ServiceDeptName='LABORATORY' and  @ItemName like '%bone marrow%' ) 
  THEN ('BONE MARROW') 
   when (@ServiceDeptName='CYTOLOGY' and  @ItemName like '%slide consultation%' ) 
 OR (@ServiceDeptName='LABORATORY' and  @ItemName like '%slide consultation%' ) 
  THEN ('SLIDE CONSULTATION') 
   when (@ServiceDeptName='EXTERNAL LAB - 1' and @ItemName like '%FNAC%' )
    OR (@ServiceDeptName='LABORATORY' and @ItemName like '%FNAC%')  
	OR (@ServiceDeptName='CYTOLOGY' and @ItemName like '%FNAC%') 
	THEN ('FNAC') 
 when (@ServiceDeptName='CYTOLOGY' )  THEN ('CYTOLOGY') 


					 when (@ServiceDeptName='ATOMIC ABSORTION')
					OR(@ServiceDeptName='BIOCHEMISTRY')
					OR(@ServiceDeptName='CLNICAL PATHOLOGY')
					OR(@ServiceDeptName='CLINICAL PATHOLOGY')
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



					When (@ItemName like '%OPERATION CHARGE%') Then ('OPERATION CHARGES') 

					WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName='BED CHARGES' or @ItemName='ICU') THEN ('BED CHARGES')
					WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName='INDOOR-DOCTOR''S VISIT FEE (PER DAY)' or 
					@ItemName='DOCTOR ROUND CHARGES' ) Then ('INDOOR DOCTOR VISIT FEE')
					WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName='ADMISSION FEE') THEN ('ADMISSION FEE')
					WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName='PFT DOCTOR CONSULTATION CHARGES') THEN ('PFT DOCTOR CONSULTATION CHARGES')

					WHEN (@ServiceDeptName='MRI') THEN ('MRI')
					WHEN (@ServiceDeptName='C.T. SCAN') THEN ('C.T. SCAN')
					WHEN (@ServiceDeptName='ULTRASOUND') OR(@ServiceDeptName='ULTRASOUND COLOR DOPPLER') THEN ('USG')
					WHEN (@ServiceDeptName='X-RAY') THEN ('X-RAY')
		   WHEN (@ServiceDeptName='DUCT')
					OR(@ServiceDeptName='MAMMOLOGY')
					OR(@ServiceDeptName='PERFORMANCE TEST') 
					OR(@ServiceDeptName='BMD-BONEDENSITOMETRY')
					OR(@ServiceDeptName='OPG-ORTHOPANTOGRAM')
					OR(@ServiceDeptName='MAMMOGRAPHY')
					OR(@ServiceDeptName='X-RAY')
					OR(@ServiceDeptName='DEXA')
					OR(@ServiceDeptName='IMAGING')  		THEN ('RADIOLOGY')
		  when (@ServiceDeptName='MISCELLANEOUS')
					OR (@ServiceDeptName='MISCELLENOUS CHARGES')
															then ('HOSPITAL OTHER CHARGES')
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS') then 'CARDIOLOGY'
			WHEN (@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )

END
GO


---End: Dinesh : 29th Jan'19 --Doctor Summary/Income Segregation  Report Changes according to HAMS Requirement

---Start: Dinesh : 29th Jan'19 --Parameterized Checkout time for bed calculation on Inpatient Module

insert into CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description])
values ('ADT','CheckoutTime',13,'string','This time is used for reference for discharge checkout' )
GO
---End: Dinesh : 29th Jan'19 --Parameterized Checkout time for bed calculation on Inpatient Module



----start: sud-31Jan2019--Syncing Db-Objects from Live to Dev---

GO
/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DoctorSummary]    Script Date: 1/29/2019 1:03:14 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		Sud/02Sept'18
-- Description:		to show doctor summary
-- Remarks: 
---[SP_Report_BIL_DoctorSummary] '2018-08-02','2018-09-02'
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorSummary]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1.		Sud/02Sept'18			     Initial Draft
2.		Ramavtar/12Nov'18			 sorting by doctorname
3.	    Ramavtar/30Nov'18			 summary added
4.		Ramavtar/17Dec'18			change in where condition (checking for credit records)
----------------------------------------------------------
*/
BEGIN
    SELECT
        ISNULL(Providerid, 0) 'DoctorId',
        CASE WHEN ISNULL(ProviderId, 0) != 0 THEN ProviderName ELSE 'NoDoctor' END AS 'DoctorName',
        SUM(ISNULL(SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
        SUM(ISNULL(ReturnAmount, 0)) AS 'Refund',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) AS 'NetTotal'
    FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	WHERE BillStatus != 'cancelled' 
			AND BillStatus != 'provisional'
			AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
    GROUP BY 
		ProviderId,
		ProviderName	
	ORDER BY 2 

	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
--FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)--for testing: sud-29Jan2019--revert to above if fails.
END
GO

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-09-12','2018-09-12')
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
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 3.      Sud/30Aug'18           Revised for Provisional and BillStatus
 4.      Dinesh/10Sept'18		passing itemname along with srvDeptName to the function
 5.      Dinesh/14Sept'18		added Provisional amount for doctor summary report
 6.		 Ramavtar/12Nov'18		getting providerName from employee table
 7.      sud/29Jan'19           Isnull check for ProviderName's Salutation (needed for ER Doctor: Duty Doctor)--
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
				[dbo].[FN_BIL_GetSrvDeptReportingName] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
				    --sud:29Jan'19--Isnull check for Salutation (needed for ER Doctor: Duty Doctor)--
					THEN ISNULL(emp.Salutation + '. ','') + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
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
GO


/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DailySales]    Script Date: 1/29/2019 1:35:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-11-29','2018-11-29',null,null
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
1.      sud/2018-07-26                      modified after HAMS Deployment (NEEDS REVISION)\
2.		ramavtar/2018-10-09					added return remark
3.		ramavtar/2018-11-29					calculating summary amounts
-----------------------------------------------------------------------------------------
*/
BEGIN
 IF (@FromDate IS NOT NULL)
  OR (@ToDate IS NOT NULL)
BEGIN
	SELECT
		*
	FROM (
		SELECT DISTINCT
			CONVERT(varchar(20), dates.ReportDate) AS [Date],
			txnInfo.InvoiceCode + CONVERT(varchar(20), txnInfo.InvoiceNo) 'ReceiptNo',
			pat.PatientCode AS HospitalNo,
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			ISNULL(txn.SubTotal, 0) AS 'Price',
			ISNULL(txn.DiscountAmount, 0) AS 'DiscountAmount',
			ISNULL(bilRet.ReturnAmount, 0) AS 'ReturnedAmount',
			0 AS 'AdvanceReceived',
			ISNULL(depRet.Amount, 0) AS 'AdvanceSettlement',
			ISNULL(txn.TaxTotal, 0) AS 'Tax',
			ISNULL(txn.TotalAmount, 0) - ISNULL(depRet.Amount, 0) - ISNULL(bilRet.ReturnAmount, 0) AS 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			txnInfo.CounterId AS 'CounterId',
			ISNULL(bilRet.ReturnedTax, 0) AS 'ReturnedTax',
			ISNULL(bilRet.Remarks, '') 'ReturnRemark'
		FROM ((
			SELECT
				Dates 'ReportDate'
			FROM [FN_COMMON_GetAllDatesBetweenRange](ISNULL(@FromDate, GETDATE()), ISNULL(@ToDate, GETDATE()))) dates

		LEFT JOIN (
--- These two tables works as an Anchor Table (LEFT Table) to join with other tables--
--- Need BillingTransactionId, CreatedBy, CounterID to be joined with all other Right side tables---
		SELECT
			CONVERT(date, PaidDate) 'TxnDate',
			BillingTransactionId,
			InvoiceCode,
			InvoiceNo,
			PatientID,
			CreatedBy,
			CounterId,
			Remarks
		FROM BIL_TXN_BillingTransaction
		WHERE CONVERT(date, PaidDate) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
		AND BillStatus != 'unpaid' ---ramavtar:20-nov-18 filterring out unpaid (credit bills)

		UNION

		SELECT DISTINCT
			CONVERT(date, CreatedOn) AS TxnDate,
			BillingTransactionId,
			InvoiceCode,
			RefInvoiceNum,
			PatientId,
			CreatedBy,
			CounterId,
			Remarks
		FROM BIL_TXN_InvoiceReturn r
		WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())) txnInfo
			ON dates.ReportDate = txnInfo.TxnDate
--- Join with Patient and Employee Table to get their names etc---
		INNER JOIN PAT_Patient pat
			ON txnInfo.PatientId = pat.PatientId
		INNER JOIN EMP_Employee emp
			ON txnInfo.CreatedBy = emp.EmployeeId

		LEFT JOIN BIL_TXN_BillingTransaction txn
			ON dates.ReportDate = CONVERT(date, txn.PaidDate)
		AND txnInfo.BillingTransactionId = txn.BillingTransactionId
		AND txnInfo.CounterId = txn.CounterId
		AND txnInfo.CreatedBy = txn.CreatedBy

		LEFT OUTER JOIN (
--- deposit deduct happens both from Transaction and settlement
--- take only those from Transaction in this query..
--- condition is: BillingTransaction Is NOT NULL--
		SELECT
			CONVERT(date, CreatedOn) AS DepositRetDate,
			Amount,
			BillingTransactionId,
			CounterId,
			CreatedBy
		FROM BIL_TXN_Deposit
		WHERE DepositType = 'depositdeduct'
		AND BillingTransactionId IS NOT NULL) depRet
			ON dates.ReportDate = depRet.DepositRetDate
		AND txnInfo.BillingTransactionId = depRet.BillingTransactionId
		AND txnInfo.CounterId = depRet.CounterId
		AND txnInfo.CreatedBy = depRet.CreatedBy
		LEFT JOIN (

---Sud: 9May'18--our return table is now changed--
---get only returned bills---
		SELECT
			CONVERT(date, CreatedOn) AS bilReturnDate,
			BillingTransactionId,
			RefInvoiceNum,
			TotalAmount 'ReturnAmount',
			TaxTotal AS 'ReturnedTax',
			CounterId,
			CreatedBy,
			Remarks
		FROM BIL_TXN_InvoiceReturn r) bilRet
			ON dates.ReportDate = bilret.bilReturnDate
		AND txnInfo.BillingTransactionId = bilRet.BillingTransactionId
		AND txnInfo.CounterId = bilRet.CounterId
		AND txnInfo.CreatedBy = bilRet.CreatedBy
		)
		WHERE dates.ReportDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) + 1
		AND (txnInfo.CounterId LIKE '%' + ISNULL(@CounterId, txnInfo.CounterId) + '%')
		AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')

		UNION ALL

		SELECT
			CONVERT(date, deposits.DepositDate) 'DepositDate',
			deposits.ReceiptNo 'ReceiptNo',
			pat.PatientCode 'HospitalNo',
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			0 'Price',
			0 'DiscountAmount',
			0 'ReturnedAmount',
			deposits.AdvanceReceived 'AdvanceReceived',
			deposits.AdvancedSettled 'AdvancedSettled',
			0 'Tax',
			deposits.TotalAmount 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			deposits.CounterId 'CounterId',
			0 'ReturnedTax',
			'' 'ReturnRemark'
		FROM (SELECT
				CONVERT(date, CreatedOn) 'DepositDate',
				'DR' + CONVERT(varchar(20), ReceiptNo) 'ReceiptNo',
				PatientId,
				CASE
				  WHEN DepositType = 'Deposit' THEN Amount
				  ELSE 0
				END AS 'AdvanceReceived',
				CASE
				  WHEN DepositType = 'ReturnDeposit' THEN Amount
				  ELSE 0
				END AS 'AdvancedSettled',
				CASE
				  WHEN DepositType = 'Deposit' THEN Amount
				  WHEN DepositType = 'ReturnDeposit' THEN -Amount
				  ELSE 0
				END AS 'TotalAmount',
				CreatedBy 'CreatedBy',
				CounterId 'CounterId'
			FROM BIL_TXN_Deposit
			WHERE ReceiptNo IS NOT NULL
			AND (DepositType = 'DEPOSIT'
			)

		UNION ALL

		SELECT
			CONVERT(date, CreatedOn) 'DepositDate',
       --we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
			CASE
			WHEN SettlementId IS NOT NULL THEN 'SR' + CONVERT(varchar(20), SettlementId)
			ELSE 'SR'
			END AS 'ReceiptNo',
			PatientId,
			0 AS 'AdvanceReceived',
			Amount AS 'AdvancedSettled',
			-Amount AS 'TotalAmount',
			CreatedBy 'CreatedBy',
			CounterId 'CounterId'
		FROM BIL_TXN_Deposit
     ----we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
		WHERE ((DepositType = 'depositdeduct'
		AND SettlementId IS NOT NULL)
		OR DepositType = 'ReturnDeposit')
		AND CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())) deposits,


		EMP_Employee emp,
		PAT_Patient pat,
		BIL_CFG_Counter cntr
		WHERE deposits.PatientId = pat.PatientId
		AND emp.EmployeeId = deposits.CreatedBy
		AND deposits.CounterId = cntr.CounterId
		AND deposits.DepositDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
		AND (deposits.CounterId LIKE '%' + ISNULL(@CounterId, deposits.CounterId) + '%')
		AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')) dum
		ORDER BY dum.ReceiptNo

  ---getting addional summary amounts for report
		SELECT
			SUM(ISNULL(AdvanceReceived, 0)) 'AdvanceReceived',
			SUM(ISNULL(AdvanceSettled, 0)) 'AdvanceSettled',
			SUM(ISNULL(ProvisionalAmount,0)) 'Provisional',
			ISNULL((SELECT SUM(TotalAmount) FROM BIL_TXN_BillingTransaction
		WHERE BillStatus = 'unpaid'
		AND CONVERT(DATE,CreatedOn) BETWEEN @FromDate AND @ToDate),0) 'CreditAmount'
		FROM [FN_BIL_GetDepositNProvisionalBetnDateRange](@FromDate, @ToDate)
END
END
GO

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary]    Script Date: 1/31/2019 12:43:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary] 
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
 7.      Sud/31Jan'19           Isnull check for ProviderName's Salutation (needed for ER Doctor: Duty Doctor)--
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
					 --sud:31Jan'19--Isnull check for Salutation (needed for ER Doctor: Duty Doctor)--
					THEN ISNULL(emp.Salutation + '. ','') + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
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

GO

--end: sud-31Jan2019--Syncing Db-Objects from Live to Dev---


---Start: Vikas : 31th Jan'19 --created parameted for maximum numbers items selection in transfer to accounting.
insert into CORE_CFG_Parameters (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description])
values ('Accounting','MaximumTransferNumber',50,'number','Maximum number of selected data transfer to accounting' )
GO
---End: Vikas : 31th Jan'19 --created parameted for maximum numbers items selection in transfer to accounting.


---Start: Salakha : 31th Jan 2019 --Added Ledger and mapping for Pharmacy Discount
--Adding LedgerGroupName for pharmacy Discount

INSERT INTO [dbo].[ACC_MST_LedgerGroup]([PrimaryGroup],[COA] ,[LedgerGroupName]   ,[CreatedBy],[CreatedOn] ,[IsActive])
VALUES('Revenue' ,'Indirect Income'  ,'Discount Income'  ,1 ,GETDATE() ,1)
GO

--Adding new Ledger
INSERT INTO [dbo].[ACC_Ledger] ([LedgerGroupId],[LedgerName] ,[CreatedOn] ,[CreatedBy],[IsActive])
VALUES((select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Revenue' and COA ='Indirect Income' and LedgerGroupName ='Discount Income'),'Cash Discount Income'
,GETDATE() ,1 ,1)
GO

--Adding mappings for pharmacy rules(updated)
INSERT INTO [dbo].[ACC_MST_MappingDetail] ([GroupMappingId] ,[LedgerGroupId],[DrCr])
     VALUES((select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMCashGoodReceipt' ),
	 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Revenue' and COA ='Indirect Income' and LedgerGroupName ='Discount Income'),0)
GO

INSERT INTO [dbo].[ACC_MST_MappingDetail]([GroupMappingId],[LedgerGroupId] ,[DrCr])
     VALUES((select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMCashInvoice' ),
	 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Expenses' and COA ='Indirect Expenses' and LedgerGroupName ='Administration expenses'),1)
GO

INSERT INTO [dbo].[ACC_MST_MappingDetail] ([GroupMappingId] ,[LedgerGroupId],[DrCr])
     VALUES((select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMCashInvoiceReturn' ),
	 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Expenses' and COA ='Indirect Expenses' and LedgerGroupName ='Administration expenses'),0)
GO

INSERT INTO [dbo].[ACC_MST_MappingDetail] ([GroupMappingId] ,[LedgerGroupId],[DrCr])
     VALUES((select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMRetutnToSupplier' ),
	 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Revenue' and COA ='Indirect Income' and LedgerGroupName ='Discount Income'),1)
GO

ALTER TABLE PHRM_TXN_InvoiceItems
DROP COLUMN IsTransferredToACC;
go

ALTER TABLE PHRM_ReturnToSupplierItems
DROP COLUMN IsTransferredToACC;
go

ALTER TABLE PHRM_WriteOffItems
DROP COLUMN IsTransferredToACC;
go

--ALTER TABLE PHRM_TXN_Invoice
--add IsTransferredToACC bit;
--go

ALTER TABLE PHRM_ReturnToSupplier
add IsTransferredToACC bit;
go

ALTER TABLE PHRM_WriteOff
add IsTransferredToACC bit;
go

---End: Salakha : 31th Jan 2019 --Added Ledger and mapping for Pharmacy Discount

--Start: Ajay: 31 jan 2019 -- added remark field in BIL_SYNC_BillingAccounting
ALTER TABLE BIL_SYNC_BillingAccounting ADD Remark VARCHAR(max)
GO
--End: Ajay: 31 jan 2019 -- added remark field in BIL_SYNC_BillingAccounting

---Start: Dinesh :31st Jan'19 ---Department Summary Query Changes
-----1. [FN_BIL_GetSrvDeptReportingName_DepartmentSummary]
/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary]    Script Date: 1/31/2019 4:49:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create FUNCTION [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptReporingName  Created: 22Aug'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Reports as per Input ServiceDepartmentName
 Remarks: We can extend this function for ItemName as well if needed.
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/22Aug'18                        Initial Draft
 2.       Dinesh/10Sept'18                    passing itemname along with srvDeptName to the function
 3.		  dinesh /14thSep'18      grouped and  merged the labcharges and miscellaneous to the respective single view header 
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( 
 CASE
       						 
When @ServiceDeptName='EMERGENCY' 
	  OR @ServiceDeptName='ROOM CHARGES'  
	  Then ('EMERGENCY')                                
When @ServiceDeptName='MEDICINE PROCEDURE' 
	  Then ('MEDICINE')                        
When @ServiceDeptName='LAPROSCOPIC SURGERY'                        
      OR @ServiceDeptName='BIRIATRIC SURGERY'                          
      OR @ServiceDeptName='SURGICAL OPERATIONS'                        
      OR @ServiceDeptName='SURGICAL PROCEDURES'                        
      OR @ServiceDeptName='CRANIAL SURGERY'                            
      OR @ServiceDeptName='SPINAL SURGERY'                             
      OR @ServiceDeptName='PLASTIC SURGERY, BODY SCULPTURE'            
      OR @ServiceDeptName='BREAST'                                     
      OR @ServiceDeptName='BURN SURGERY'                               
      OR @ServiceDeptName='EYE SURGERY'                                
      OR @ServiceDeptName='FACE LIFT'                                  
      OR @ServiceDeptName='GENERAL PLASTIC SURGERY'                    
      OR @ServiceDeptName='HAND SURGERY'                               
      OR @ServiceDeptName='RHINOPLASTY'                                
      OR @ServiceDeptName='TISSUE EXPANDERS'                           
      OR @ServiceDeptName='LIPS & PALATE'                              
      OR @ServiceDeptName='MAXILLA FRACTURES'                          
      OR @ServiceDeptName='MAXILO FACIAL'                              
      OR @ServiceDeptName='NOSE SURGERY'                               
      OR @ServiceDeptName='ARTHROPLASTY'                               
      OR @ServiceDeptName='SPINE SURGERY'                              
      OR @ServiceDeptName='SURGERY CHARGES(PAEDIATRIC)'                
      OR @ServiceDeptName='SURGERY CHARGES (PAEDIATRIC)'               
      OR @ServiceDeptName='DEVICE IMPLANTATION'                        
      OR @ServiceDeptName='General Surgery' 
	  Then ('SURGERY')                           
WHEN @ServiceDeptName='OT Major Procedure Charges OBGY'            
      OR @ServiceDeptName='OT Minor Procedure Charges OBGY'            
      OR @ServiceDeptName='GENITALS'                                   
      OR @ServiceDeptName='GYNAECOLOGY'                                
      OR @ServiceDeptName='GYNAECOLOGY PROCEDURE(OPD ONLY)'            
      OR @ServiceDeptName='OT GYNAE PROCEDURE INDOOR' 
	  Then ('OBGY')
WHEN @ServiceDeptName='MANDIBULAR DEFORMITY'                       
      OR @ServiceDeptName='FIXED ORTHODONTIC TREATMENT'                
      OR @ServiceDeptName='MAMMOLOGY'                                  
      OR @ServiceDeptName='EXTERNAL FIXATOR APP'                       
      OR @ServiceDeptName='AMPUTATIONS'                                
      OR @ServiceDeptName='MANDIBLE FRACTURES'                         
      OR @ServiceDeptName='Ortho Procedures'                           
      OR @ServiceDeptName='MAMMOGRAPHY' 
	  THEN ('ORTHOPEDIC')
WHEN @ServiceDeptName='SKIN PROCEDURE'  
	  THEN ('DERMATOLOGY')
 WHEN @ServiceDeptName='PAEDIATRIC'                                 
      OR @ServiceDeptName='Warmer Charges'                             
      OR @ServiceDeptName='Delivery Attend'  
	  THEN ('PEDIATRIC')
WHEN @ServiceDeptName='FACIAL NERVE (UNILATERAL)'                  
      OR @ServiceDeptName='NEUROLOGY'
	  THEN ('NEUROLOGY')
WHEN @ServiceDeptName='CARDIOVASCULAR SURGERY'                     
      OR @ServiceDeptName='CORONARY/PERIPHERAL ANGIOGPRAPHY'           
      OR @ServiceDeptName='PROCEDURES IN CATH LAB'  
	  THEN ('CTVS')
WHEN @ServiceDeptName='OPHTHALMOLOGY'
	  THEN ('EYE')
WHEN @ServiceDeptName='ENT Surgeries under L.A.'                   
      OR @ServiceDeptName='ENT Surgeries under G.A.'                   
      OR @ServiceDeptName='EYE PROCEDURE'                              
      OR @ServiceDeptName='EARS SURGERY'                               
      OR @ServiceDeptName='ENT OPERATION'                              
      OR @ServiceDeptName='ENT PROCEDURES' 
	  THEN ('ENT')
WHEN @ServiceDeptName='UROLOGICAL OPERATION'                       
      OR @ServiceDeptName='URETHRAL STRICTURES'  
	  THEN ('UROLOGY')
WHEN @ServiceDeptName='ANASTHESIA'  
	  THEN ('ANAESTHESIA')
WHEN @ServiceDeptName='OT'                                         
      OR @ServiceDeptName='UROLOGY PACKAGE' 
	  THEN ('OT')
WHEN @ServiceDeptName='DEXA'                                       
      OR @ServiceDeptName='IMAGING'                                    
      OR @ServiceDeptName='MRI'                                        
      OR @ServiceDeptName='C.T. SCAN'                                  
      OR @ServiceDeptName='ULTRASOUND'                                 
      OR @ServiceDeptName='ULTRASOUND COLOR DOPPLER'                   
      OR @ServiceDeptName='X-RAY'                                      
      OR @ServiceDeptName='DUCT'                                       
      OR @ServiceDeptName='PERFORMANCE TEST '   
	  THEN ('RADIOLOGY')
WHEN @ServiceDeptName='PHYSIOTHERAPY'
	  THEN ('PHYSIOTHERAPY')
WHEN @ServiceDeptName='BMD-BONEDENSITOMETRY'  
	  THEN ('BONEDENSITOMETRY')
WHEN @ServiceDeptName='ELECTROPHYSIOLOGY STUDIES'
	  THEN ('ELECTROPHYSIOLOGY STUDIES')
WHEN @ServiceDeptName='EXTERNAL LAB-1'                             
      OR @ServiceDeptName='LAB CHARGES'                                
      OR @ServiceDeptName='ATOMIC ABSORTION'                           
      OR @ServiceDeptName='BIOCHEMISTRY'                               
      OR @ServiceDeptName='BLOOD BANK'                                 
      OR @ServiceDeptName='CLNICAL PATHOLOGY'                          
      OR @ServiceDeptName='CLINICAL PATHOLOGY'                         
      OR @ServiceDeptName='CYTOLOGY'                                   
      OR @ServiceDeptName='KIDNEY BIOPSY'                              
      OR @ServiceDeptName='SKIN BIOPSY'                                
      OR @ServiceDeptName='CONJUNCTIVAL BIOPSY'                        
      OR @ServiceDeptName='EXTERNAL LAB-3'                             
      OR @ServiceDeptName='EXTERNAL LAB - 1'                           
      OR @ServiceDeptName='EXTERNAL LAB - 2'                           
      OR @ServiceDeptName='HISTOPATHOLOGY'                             
      OR @ServiceDeptName='IMMUNOHISTROCHEMISTRY'                      
      OR @ServiceDeptName='MOLECULAR DIAGNOSTICS'                      
      OR @ServiceDeptName='SPECIALISED BIOPHYSICS ASSAYS'              
      OR @ServiceDeptName='SEROLOGY'                                   
      OR @ServiceDeptName='MICROBIOLOGY'                               
      OR @ServiceDeptName='HEMATOLOGY'                                 
      OR @ServiceDeptName='LABORATORY' 
	  THEN ('PATHOLOGY')
WHEN @ServiceDeptName='AMBULANCE CHARGES' 
	  THEN('AMBULANCE')
WHEN @ServiceDeptName='DIETARY CHARGES' 
	  THEN('DIETARY')
WHEN @ServiceDeptName='DENTISTRY' 
	  THEN ('DENTISTRY')           
WHEN @ServiceDeptName='NEPHROLOGY'                                 
      OR @ServiceDeptName='NEPHROLOGY/ PACKAGES'  
	  THEN ('NEPHROLOGY')
WHEN @ServiceDeptName='OPD CONSULTATION'  
	  OR @ServiceDeptName='OPD'
	  THEN ('OPD')                         
WHEN @ServiceDeptName='NON INVASIVE CARDIOlOGY' 
	  THEN ('NON INVASIVE CARDIOlOGY')                         
WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName = 'BED CHARGES')  
	  OR (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName ='ICU')
	  OR (@ServiceDeptName='Bed Charges')
	  OR @ServiceDeptName='ICU'  
	  THEN ('BED CHARGES')
WHEN @ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE'
	  THEN ('DOCTOR ROUND CHARGES')
WHEN @ServiceDeptName='PULMONOLOGY '
	  THEN ('PULMONOLOGY')	 
WHEN @ServiceDeptName='GASTROENTEROLOGY'
	  THEN ('GASTROENTEROLOGY') 
WHEN @ServiceDeptName='IPD'	
	  THEN ('ADMISSIONS FEE') 
WHEN @ServiceDeptName='Procedure Charge'	
	  THEN ('PROCEDURE CHARGES')
WHEN @ServiceDeptName='THORACIC SURGICAL PROCEDURES' 
	  THEN ('THORACIC SURGICAL PROCEDURES') 	  
WHEN @ServiceDeptName='PSYCHO TEST: PAPER PENCIL TEST'             
      OR @ServiceDeptName='THERAPY CHARGES'                            
      OR @ServiceDeptName='SIMPLE EXTRACTION'                          
      OR @ServiceDeptName='TRANSPORT'                                  
      OR @ServiceDeptName='LITHOTRIPSYS'                
      OR @ServiceDeptName='THORAX'                                     
      OR @ServiceDeptName='G.I.T.'                                     
      OR @ServiceDeptName='SOFT TISSUE TUMOR SURGERY'                  
      OR @ServiceDeptName='DAY CARE OPERATION'
	  OR @ServiceDeptName='CONSUMEABLES'
	  OR @ServiceDeptName='CONSULTATION CHARGES FOR PRIVATE PATIENT' 
	  OR @ServiceDeptName='OPG-ORTHOPANTOGRAM'                         
      OR @ServiceDeptName='RECONSTRUCTIVE PROCEDURES'          
      OR @ServiceDeptName='LYMPHOEDEMA'  
	  THEN ('ADMINISTRATION')
WHEN @ServiceDeptName='MISCELLENOUS CHARGES'               
      OR @ServiceDeptName='MISCELLANEOUS' 
	  THEN ('MISCELLANEOUS')                 
WHEN @ServiceDeptName='MEDICAL RESIDENT AND NURSING'               
	  THEN ('MEDICAL RESIDENT AND NURSING')                                      

		  ELSE (@ServiceDeptName) END 
		 )

END

GO

----2. [FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary]

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary]    Script Date: 1/31/2019 4:47:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-09-12','2018-09-12')
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
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 3.      Sud/30Aug'18           Revised for Provisional and BillStatus
 4.      Dinesh/10Sept'18		passing itemname along with srvDeptName to the function
 5.      Dinesh/14Sept'18		added Provisional amount for doctor summary report
 6.		 Ramavtar/12Nov'18		getting providerName from employee table
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
				[dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN emp.Salutation + '. ' + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
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
 
 GO
 
 ------3. [SP_Report_BIL_DepartmentItemSummary]
 
 
/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DepartmentItemSummary]    Script Date: 1/31/2019 4:49:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DepartmentItemSummary]
@ToDate DATETIME = NULL,
@FromDate DATETIME = NULL,
@SrvDeptName NVARCHAR(MAX) = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
2		Ramavtar/30Nov'18		added summary and filtered report data for provisional and cancel
----------------------------------------------------------
*/
BEGIN
	SELECT
		COALESCE(fnItems.ReturnDate, fnItems.CancelledDate, fnItems.PaidDate, fnItems.CreditDate, fnItems.ProvisionalDate) 'Date',
		ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
		pat.PatientCode,
		pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
		fnItems.ServiceDepartmentName,
		fnItems.ItemName,
		fnItems.Price,
		fnItems.Quantity,
		fnItems.SubTotal,
		fnItems.DiscountAmount,
		fnItems.TotalAmount,
		fnItems.ReturnAmount,
		fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
	FROM (SELECT
			*
		FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
		WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional') fnItems
	JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
	WHERE fnItems.ServiceDepartmentName = @SrvDeptName
	ORDER BY 1 DESC
--table2: provisional, cancel, credit amounts for summary
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
	WHERE ServiceDepartmentName = @SrvDeptName
END
GO

-----4. [SP_Report_BIL_DepartmentSummary]


/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DepartmentSummary]    Script Date: 1/31/2019 4:46:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DepartmentSummary] -- SP_Report_BIL_DepartmentSummary '2018-08-01','2018-09-11'
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
2		Ramavtar/30Nov'18		added summary and filtered report data for provisional and cancel
----------------------------------------------------------
*/
BEGIN
	--table1: report data
	SELECT
		fnItems.ServiceDepartmentName 'ServiceDepartment',
		SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
		SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
		SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
		SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
		SUM(ISNULL(fnItems.ReturnAmount, 0)) 'ReturnAmount',
		SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) 'NetSales'
	FROM (SELECT
		*
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
	WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional') fnItems
	GROUP BY fnItems.ServiceDepartmentName
	ORDER BY 1
	--table2: provisional, cancel, credit amounts for summary
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
END

GO

---End: Dinesh :31st Jan'19 ---Department Summary Query Changes


---start: Sud: 1Feb'19--Daily Sales Revision for CreditReceived--Need to be replaced with newer version soon--

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-11-29','2018-11-29',null,null
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: to get the price, Tax, total,along with recipt number between given date input
Logic Used:
1. Get All Invoices by PaidDate
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      sud/2018-07-26                      modified after HAMS Deployment (NEEDS REVISION)\
2.		ramavtar/2018-10-09					added return remark
3.		ramavtar/2018-11-29					calculating summary amounts
4.      Sud/1Feb'19                         Added Credit Received Fields in  result view.
-----------------------------------------------------------------------------------------
*/
BEGIN
 IF (@FromDate IS NOT NULL)
  OR (@ToDate IS NOT NULL)
BEGIN
	--START: RESULT TABLE: 1 ---
	SELECT * FROM
		(

		--Start: Union Table: 1.1---
		SELECT DISTINCT
			CONVERT(varchar(20), dates.ReportDate) AS [Date],
			txnInfo.InvoiceCode + CONVERT(varchar(20), txnInfo.InvoiceNo) 'ReceiptNo',
			pat.PatientCode AS HospitalNo,
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			ISNULL(txn.SubTotal, 0) AS 'Price',
			ISNULL(txn.DiscountAmount, 0) AS 'DiscountAmount',
			ISNULL(bilRet.ReturnAmount, 0) AS 'ReturnedAmount',
			0 AS 'AdvanceReceived',
			ISNULL(depRet.Amount, 0) AS 'AdvanceSettlement',
			ISNULL(txn.TaxTotal, 0) AS 'Tax',
			---Sud/1Feb'19-- added condition for credit received--
			CASE WHEN txn.PaymentMode='credit' AND CONVERT(DATE, txn.PaidDate) != Convert(Date, txn.CreatedOn) THEN TotalAmount ELSE 0 END AS CreditReceived,

			ISNULL(txn.TotalAmount, 0) - ISNULL(depRet.Amount, 0) - ISNULL(bilRet.ReturnAmount, 0) AS 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			txnInfo.CounterId AS 'CounterId',
			ISNULL(bilRet.ReturnedTax, 0) AS 'ReturnedTax',
			ISNULL(bilRet.Remarks, '') 'ReturnRemark'
		
		
		FROM ( 
				
				( -- anchor table-1 for Left Join
					SELECT
					Dates 'ReportDate'
					FROM [FN_COMMON_GetAllDatesBetweenRange](ISNULL(@FromDate, GETDATE()), ISNULL(@ToDate, GETDATE()))
				) dates -- join table:1
            
			LEFT JOIN ( -- anchor table-2 for Left Join
				--- These two tables works as an Anchor Table (LEFT Table) to join with other tables--
				--- Need BillingTransactionId, CreatedBy, CounterID to be joined with all other Right side tables---
						SELECT
							CONVERT(date, PaidDate) 'TxnDate',
							BillingTransactionId,
							InvoiceCode,
							InvoiceNo,
							PatientID,
							CreatedBy,
							CounterId,
							Remarks
						FROM BIL_TXN_BillingTransaction
						WHERE CONVERT(date, PaidDate) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
						AND BillStatus != 'unpaid' ---ramavtar:20-nov-18 filterring out unpaid (credit bills)

						UNION

						SELECT DISTINCT
							CONVERT(date, CreatedOn) AS TxnDate,
							BillingTransactionId,
							InvoiceCode,
							RefInvoiceNum,
							PatientId,
							CreatedBy,
							CounterId,
							Remarks
						FROM BIL_TXN_InvoiceReturn r
						WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
		)txnInfo  -- join table:2 
			ON dates.ReportDate = txnInfo.TxnDate

		--- Join with Patient and Employee Table to get their names etc---
		INNER JOIN PAT_Patient pat  -- join table:3
					ON txnInfo.PatientId = pat.PatientId
		INNER JOIN EMP_Employee emp  -- join table:4
					ON txnInfo.CreatedBy = emp.EmployeeId

		LEFT JOIN BIL_TXN_BillingTransaction txn  -- join table:5
					ON dates.ReportDate = CONVERT(date, txn.PaidDate)
					AND txnInfo.BillingTransactionId = txn.BillingTransactionId
					AND txnInfo.CounterId = txn.CounterId
					AND txnInfo.CreatedBy = txn.CreatedBy


		LEFT OUTER JOIN (
							--- deposit deduct happens both from Transaction and settlement
						--- take only those from Transaction in this query..
						--- condition is: BillingTransaction Is NOT NULL--
							SELECT
								CONVERT(date, CreatedOn) AS DepositRetDate,
								Amount,
								BillingTransactionId,
								CounterId,
								CreatedBy
							FROM BIL_TXN_Deposit
							WHERE DepositType = 'depositdeduct'
							AND BillingTransactionId IS NOT NULL
						) depRet  -- join table:6
							ON dates.ReportDate = depRet.DepositRetDate
							AND txnInfo.BillingTransactionId = depRet.BillingTransactionId
							AND txnInfo.CounterId = depRet.CounterId
							AND txnInfo.CreatedBy = depRet.CreatedBy


		LEFT JOIN (

					---Sud: 9May'18--our return table is now changed--
					---get only returned bills---
					SELECT
						CONVERT(date, CreatedOn) AS bilReturnDate,
						BillingTransactionId,
						RefInvoiceNum,
						TotalAmount 'ReturnAmount',
						TaxTotal AS 'ReturnedTax',
						CounterId,
						CreatedBy,
						Remarks
					FROM BIL_TXN_InvoiceReturn r
					) bilRet   -- join table:7
					ON dates.ReportDate = bilret.bilReturnDate
					AND txnInfo.BillingTransactionId = bilRet.BillingTransactionId
					AND txnInfo.CounterId = bilRet.CounterId
					AND txnInfo.CreatedBy = bilRet.CreatedBy
		)
		WHERE dates.ReportDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) + 1
		AND (txnInfo.CounterId LIKE '%' + ISNULL(@CounterId, txnInfo.CounterId) + '%')
		AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
		--END: Union Table: 1.1---



		UNION ALL

		--Start: Union Table: 1.2---
		SELECT
			CONVERT(date, deposits.DepositDate) 'DepositDate',
			deposits.ReceiptNo 'ReceiptNo',
			pat.PatientCode 'HospitalNo',
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			0 'Price',
			0 'DiscountAmount',
			0 'ReturnedAmount',
			deposits.AdvanceReceived 'AdvanceReceived',
			deposits.AdvancedSettled 'AdvancedSettled',
			0 'Tax',
			0 'CreditReceived', ---Sud/1Feb'19: Need extra field for Union--
			deposits.TotalAmount 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			deposits.CounterId 'CounterId',
			0 'ReturnedTax',
			'' 'ReturnRemark'
		FROM (
						SELECT
							CONVERT(date, CreatedOn) 'DepositDate',
							'DR' + CONVERT(varchar(20), ReceiptNo) 'ReceiptNo',
							PatientId,
							CASE
								WHEN DepositType = 'Deposit' THEN Amount
								ELSE 0
							END AS 'AdvanceReceived',
							CASE
								WHEN DepositType = 'ReturnDeposit' THEN Amount
								ELSE 0
							END AS 'AdvancedSettled',
							CASE
								WHEN DepositType = 'Deposit' THEN Amount
								WHEN DepositType = 'ReturnDeposit' THEN -Amount
								ELSE 0
							END AS 'TotalAmount',
							CreatedBy 'CreatedBy',
							CounterId 'CounterId'
						FROM BIL_TXN_Deposit
						WHERE ReceiptNo IS NOT NULL
						AND (DepositType = 'DEPOSIT')

					UNION ALL

					SELECT
						CONVERT(date, CreatedOn) 'DepositDate',
					  --we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
						CASE
						WHEN SettlementId IS NOT NULL THEN 'SR' + CONVERT(varchar(20), SettlementId)
						ELSE 'SR'
						END AS 'ReceiptNo',
						PatientId,
						0 AS 'AdvanceReceived',
						Amount AS 'AdvancedSettled',
						-Amount AS 'TotalAmount',
						CreatedBy 'CreatedBy',
						CounterId 'CounterId'
					FROM BIL_TXN_Deposit
					----we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
					WHERE ((DepositType = 'depositdeduct'
					AND SettlementId IS NOT NULL)
					OR DepositType = 'ReturnDeposit')
					AND CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
			) deposits,


		EMP_Employee emp,
		PAT_Patient pat,
		BIL_CFG_Counter cntr
		WHERE deposits.PatientId = pat.PatientId
				AND emp.EmployeeId = deposits.CreatedBy
				AND deposits.CounterId = cntr.CounterId
				AND deposits.DepositDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
				AND (deposits.CounterId LIKE '%' + ISNULL(@CounterId, deposits.CounterId) + '%')
				AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')) dum
		ORDER BY dum.ReceiptNo
		--End: Union Table: 1.2---
	-- END: RESULT TABLE: 1---


	-- START: RESULT TABLE: 2 ---
	---getting addional summary amounts for report
	SELECT
		SUM(ISNULL(AdvanceReceived, 0)) 'AdvanceReceived',
		SUM(ISNULL(AdvanceSettled, 0)) 'AdvanceSettled',
		SUM(ISNULL(ProvisionalAmount,0)) 'Provisional',
		ISNULL((SELECT SUM(TotalAmount) FROM BIL_TXN_BillingTransaction
	WHERE BillStatus = 'unpaid'
	AND CONVERT(DATE,CreatedOn) BETWEEN @FromDate AND @ToDate),0) 'CreditAmount'
	FROM [FN_BIL_GetDepositNProvisionalBetnDateRange](@FromDate, @ToDate)
	-- END: RESULT TABLE: 2 ---
END
END
GO
---end: Sud: 1Feb'19--Daily Sales Revision for CreditReceived--Need to be replaced with newer version soon--


--start: sud:4Feb'19--Dashboard Statistics (Total Doctors Revised)---

--Add new role for Anaesthetist if not already exists--
IF NOT EXISTS(select * from EMP_EmployeeRole where EmployeeRoleName='Anaesthetist') 
BEGIN
 Insert into EMP_EmployeeRole(EmployeeRoleName, Description, CreatedBy, CreatedOn)
 Values('Anaesthetist', 'Anaesthetist',1,GETDATE())
END
GO


/****** Object:  StoredProcedure [dbo].[SP_DSB_Home_DashboardStatistics]    Script Date: 2/4/2019 10:13:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

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
4.      sud/17Jan'19                           removed returned count from TOtal, Added Transfer count to New 
5.      Sud/4Feb'19                            Segregation of Doctors Count for Consultant, MO, Anaesthetists <need revision for TotalDoctors Count>
--------------------------------------------------------
*/
BEGIN
	--Rules:-- 
	/*
	 1. Search Criteria is only 'today's OutPatient visits': VisitType='outpatient'  AND CONVERT(DATE,VisitDate)=CONVERT(DATE,GETDATE())
	 2. Total: today's all OPD counts
	 3. New: AppointmentType='new'  or AppointmentType='Transfer'
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
	    --  Select COUNT(*) 'TotalDoctors' from EMP_Employee e,
		--MST_Department d where e.DepartmentId=d.DepartmentId
		--and d.IsAppointmentApplicable=1

		--We're adding EmployeeRoles ('Doctor','M.O.','Anaesthetist'  in TotalDoctorsCount -- needs revision. sud:4Feb'19

		Select  SUM(case when eRole.EmployeeRoleName='Doctor' THEN 1 ELSE 0 END ) AS 'ConsultantsCount',
		  SUM(case when eRole.EmployeeRoleName='M.O.' THEN 1 ELSE 0 END ) AS 'MedicalOfficersCount',
          SUM(case when eRole.EmployeeRoleName='Anaesthetist' THEN 1 ELSE 0 END ) AS 'AnaesthetistsCount',
		  SUM(case when eRole.EmployeeRoleName='Doctor' OR eRole.EmployeeRoleName='M.O.' OR eRole.EmployeeRoleName='Anaesthetist' THEN 1 ELSE 0 END ) AS 'TotalDoctorsCount'
		 from EMP_Employee emp
		LEFT JOIN EMP_EmployeeRole eRole
		ON emp.EmployeeRoleId=eRole.EmployeeRoleId


	 ) docs,
	 ---Returned Visits are excluded in this Counts--:sud-17Jan'19--reference: Dinesh
    (Select 
		SUM(1) 'TotalAppts',
		SUM( CASE WHEN (AppointmentType='new' OR AppointmentType='Transfer') THEN 1 ELSE 0 END ) AS 'NewAppts',
		SUM( CASE WHEN AppointmentType='referral' THEN 1 ELSE 0 END ) AS 'ReferralAppts',
		SUM( CASE WHEN AppointmentType='followup' THEN 1 ELSE 0 END ) AS 'FollowUpAppts',
		SUM( CASE WHEN AppointmentType='new' and BillingStatus='cancel' THEN 1 ELSE 0 END ) AS 'CancelAppts'
		--SUM( CASE WHEN AppointmentType='new' and BillingStatus='returned' THEN 1 ELSE 0 END ) AS 'ReturnAppts'--sud:17Jan'19--removed returned from this query, added in separate query below.
		from PAT_PatientVisits where VisitType='outpatient' AND CONVERT(DATE,VisitDate)=CONVERT(DATE,GETDATE())
		and BillingStatus !='returned' -- exclude returned visits..
	) appt,

	 (Select 
		Count(*) 'ReturnAppts'
		FROM PAT_PatientVisits 
		where VisitType='outpatient' AND CONVERT(DATE,VisitDate)=CONVERT(DATE,GETDATE())
		and BillingStatus='returned'
	) retAppts
END
GO
--end: sud:4Feb'19--Dashboard Statistics (Total Doctors Revised)---

--start: sud:4Feb'19--Updating IntegrationName for BloodBank service department--
Update BIL_MST_ServiceDepartment
set IntegrationName='LAB'
where ServiceDepartmentId=90 and ServiceDepartmentName='BLOOD BANK'
GO
--end: sud:4Feb'19--Updating IntegrationName for BloodBank--



--START Ajay: 04Feb2019 --created pharmacy supplier as a ledger --created trigger on ACC_MST_MappingDetail

--adding pharmacysupplier as a ledger in accounting
ALTER TABLE ACC_Ledger ADD LedgerType varchar(max) null
GO

--DECLARE @cnt INT = 1;
--WHILE @cnt <= (SELECT MAX(SupplierId) FROM PHRM_MST_Supplier)
--BEGIN
--	IF EXISTS(SELECT * FROM PHRM_MST_Supplier)
--	BEGIN
--		INSERT INTO ACC_Ledger (LedgerGroupId,LedgerName,CreatedOn,CreatedBy,IsActive,LedgerType)
--		SELECT
--			(SELECT LedgerGroupId FROM ACC_MST_LedgerGroup WHERE LedgerGroupName = 'Inventory' AND COA='Current Assets' AND PrimaryGroup='Assets') AS LedgerGroupId
--			,SupplierName AS LedgerName
--			,GETDATE() AS CreatedOn
--			,1 AS CreatedBy
--			,1 AS IsActive
--			,'pharmacysupplier' AS LedgerType
--		FROM PHRM_MST_Supplier where SupplierId=@cnt
--	END
--	SET @cnt=@cnt+1
--END
--GO

--TRIGGER TO UPDATE DESCRIPTION IN ACC_MST_MappingDetail TABLE
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER TRG_ACC_UpdateMappingDetail
   ON  ACC_MST_MappingDetail
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
		DECLARE @Id INT;
		SELECT @Id=AccountingMappingDetailId FROM inserted

		UPDATE ACC_MST_MappingDetail
		SET Description=(
			SELECT gm.Description+REPLACE(lg.LedgerGroupName,' ','') FROM ACC_MST_MappingDetail md
			JOIN ACC_MST_GroupMapping gm ON md.GroupMappingId=gm.GroupMappingId
			JOIN ACC_MST_LedgerGroup lg ON md.LedgerGroupId=lg.LedgerGroupId
			WHERE md.AccountingMappingDetailId=@Id AND md.Description IS NULL)
		WHERE AccountingMappingDetailId=@Id AND Description IS NULL
	END
END
GO

--END Ajay: 04Feb2019 --created pharmacy supplier as a ledger --created trigger on ACC_MST_MappingDetail

---Start : DInesh 05th Feb'19 --Added Return Quantity in views and added as well on departmentsummary functions


----------Return Quantity Added on Views for Proper Reporting
----1.VW_BIL_TxnItemsInfoWithDateSeparation 


/****** Object:  View [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]    Script Date: 2/3/2019 12:37:27 PM ******/
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
FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO


----2.  FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary


/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary]    Script Date: 2/3/2019 12:38:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select ReturnAmount,ReturnQuantity,* from [FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary]  ('2018-12-16','2019-01-14')
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
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 3.      Sud/30Aug'18           Revised for Provisional and BillStatus
 4.      Dinesh/10Sept'18		passing itemname along with srvDeptName to the function
 5.      Dinesh/14Sept'18		added Provisional amount for doctor summary report
 6.		 Ramavtar/12Nov'18		getting providerName from employee table
 6.      Dinesh / 05th Jan'19	Added Return Quantity 
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
				[dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN emp.Salutation + '. ' + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
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
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnQuantity ELSE 0 END AS ReturnQuantity
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
					LEFT JOIN [dbo].[EMP_Employee] emp ON itmInfo.ProviderId = emp.EmployeeId
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
 
GO


---END : DInesh 05th Feb'19 --Added Return Quantity in views and added as well on departmentsummary functions

--Start : Ajay 05 Feb 2019 --created table for ledger mapping

--table for ledger mapping
CREATE TABLE [dbo].[ACC_Ledger_Mapping](
	[LedgerMappingId] [int] IDENTITY(1,1) NOT NULL,
	[LedgerId] [int] NULL,
	[ReferenceId] [int] NULL,
	[LedgerType] [varchar](max) NULL,
 CONSTRAINT [PK_ACC_Ledger_Mapping] PRIMARY KEY CLUSTERED 
(
	[LedgerMappingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

----inserting record in ACC_Ledger from phrm supplier
--DECLARE @cnt INT = 1;
--WHILE @cnt <= (SELECT MAX(SupplierId) FROM PHRM_MST_Supplier)
--BEGIN
--	IF EXISTS(SELECT * FROM PHRM_MST_Supplier)
--	BEGIN
--		INSERT INTO ACC_Ledger (LedgerGroupId,LedgerName,CreatedOn,CreatedBy,IsActive,LedgerType)
--		SELECT
--			(SELECT LedgerGroupId FROM ACC_MST_LedgerGroup WHERE LedgerGroupName = 'Inventory' AND COA='Current Assets' AND PrimaryGroup='Assets') AS LedgerGroupId
--			,SupplierName AS LedgerName
--			,GETDATE() AS CreatedOn
--			,1 AS CreatedBy
--			,1 AS IsActive
--			,'pharmacysupplier' AS LedgerType
--		FROM PHRM_MST_Supplier where SupplierId=@cnt AND SupplierName not in (select LedgerName from ACC_Ledger where LedgerType='pharmacysupplier')
--	END
--	SET @cnt=@cnt+1
--END
--GO

----inserting record into ledger mapping table for Pharmacy Supplier
--INSERT INTO ACC_Ledger_Mapping
--(LedgerId,ReferenceId,LedgerType)
--SELECT 
--LedgerId,
--(SELECT SupplierId FROM PHRM_MST_Supplier WHERE SupplierName=LedgerName),
--LedgerType
--FROM ACC_Ledger WHERE LedgerType='pharmacysupplier'
--GO

--for resolving issue of description field in mapping details table
--update Description in ACC_MST_MappingDetail
DECLARE @cnt INT = 1;
WHILE @cnt <= (select COUNT(*) from ACC_MST_MappingDetail)
BEGIN
update ACC_MST_MappingDetail
set Description=(
  select gm.Description+REPLACE(lg.LedgerGroupName,' ','') from ACC_MST_MappingDetail md
    join ACC_MST_GroupMapping gm on md.GroupMappingId=gm.GroupMappingId
    join ACC_MST_LedgerGroup lg on md.LedgerGroupId=lg.LedgerGroupId
  where md.AccountingMappingDetailId=@cnt and md.Description is null)
where AccountingMappingDetailId=@cnt and Description is null
SET @cnt = @cnt + 1;
END;
GO
--End : Ajay 05 Feb 2019 --

---Start : DInesh 05th Feb'19 --Added DepartmentId of Doctors in patient census sp and functions

-------1. FN_BIL_GetTxnItemsInfoWithDateSeparation_PatientCensus

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_PatientCensus]    Script Date: 2/5/2019 2:56:57 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_PatientCensus] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-09-01','2018-09-12')
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
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 3.      Sud/30Aug'18           Revised for Provisional and BillStatus
 4.      Dinesh/10Sept'18		passing itemname along with srvDeptName to the function
 5.      Dinesh/14Sept'18		added Provisional amount for doctor summary report
 6.		 Ramavtar/12Nov'18		getting providerName from employee table
 7.      Dinesh/05th_Feb'19      Doctor Department Department included in report to segregate doctors according to department
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
			  SELECT PatientId, BillingTransactionItemId, ItemId, ItemName, ServiceDepartmentId,emp.DepartmentId,
			  --below four fields shouldn't be there when only return has happened in given date range.
			  Price AS Price_Temp,
			  Quantity AS Qty_Temp,
			  SubTotal AS Subtot_Temp,
			  DiscountAmount AS Discount_Temp,
			  TotalAmount AS Total_Temp, 
				--we're using below scalar value function to get reporting name of item's SrvDeptName 
				[dbo].[FN_BIL_GetSrvDeptReportingName] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN ISNULL(emp.Salutation + '. ','') + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
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

GO


---------2. SP_Report_BILL_PatientCensus
/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_PatientCensus]    Script Date: 2/5/2019 2:27:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus] -- [SP_Report_BILL_PatientCensus] '2019-1-20','2019-02-05',NULL,24
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL,
	@ProviderId int = NULL,
	@DepartmentId int = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Ramavtar/03Aug'18			created the script
2		Ramavtar/9Aug'18		getting summary of deposit, and deposit-return (as table 3),
								excluding entry where billstatus == cancel and for return items we are not including its amount in totalcollection
3.      sud  --					updated after creating common function. 
4.      dinesh /14thSep'18      grouped and  merged the labcharges and miscellaneous to the respective single view header 
5.		ramavtar/05Oct'18		getting provider name from employee table instead of txn table
6.		ramavtar/03Dec'18		revamp of SP -> as per new requirement
7.		ramavtar/05Dec'18		filter more case of paid/credit bills
8.		ramavtar/13Dec'18		taking quantity
9.      Dinesh/05th_Feb'19      Doctor Department Department included in report to segregate doctors according to department
----------------------------------------------------------
*/
BEGIN
	SELECT 
		tbl.Provider,
		tbl.ServiceDepartmentName,
		tbl.totC1,
		tbl.retC1,
		tbl.totA1,
		tbl.retA1,
		tbl.totC2,
		tbl.totA2,
		tbl.totC3,
		tbl.retC3,
		tbl.totA3,
		tbl.retA3,
		(tbl.totC1 - tbl.retC1) + (tbl.totC3 - tbl.retC3) AS 'totTC',
		(tbl.totA1 - tbl.retA1) + (tbl.totA3 - tbl.retA3) AS 'totTA' 
	FROM (
	SELECT 
		ISNULL(fn.ProviderName,'NoDoctor') AS 'Provider',
		fn.ServiceDepartmentName,
		SUM(CASE
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NULL AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL) THEN fn.Quantity
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NULL THEN fn.Quantity
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
				ELSE 0
			END) AS 'totC1',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL THEN fn.Quantity ELSE 0
			END) AS 'retC1',
		SUM(CASE 
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'paid' AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL) THEN fn.PaidAmount
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'credit' THEN fn.CreditAmount
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.ReturnAmount
				ELSE 0
			END) AS 'totA1',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL THEN fn.ReturnAmount
				ELSE 0
			END) AS 'retA1',
		SUM(CASE
				WHEN fn.BillStatus = 'provisional' THEN fn.Quantity
				ELSE 0
			END) AS 'totC2',
		SUM(CASE 
				WHEN fn.BillStatus = 'provisional' THEN fn.ProvisionalAmount 
				ELSE 0 
			END) AS 'totA2',
		SUM(CASE 
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NOT NULL THEN fn.Quantity
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NOT NULL AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL) THEN fn.Quantity
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL))  THEN fn.Quantity
				ELSE 0
			END) AS 'totC3',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL
				THEN fn.Quantity ELSE 0 
			END) AS 'retC3',
		SUM(CASE
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NOT NULL AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL) THEN fn.PaidAmount
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NOT NULL THEN fn.CreditAmount
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.ReturnAmount
				ELSE 0
			END) AS 'totA3',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL THEN fn.ReturnAmount
				ELSE 0
			END) AS 'retA3'
		--,
		--SUM(CASE
		--		WHEN fn.BillStatus = 'paid' OR fn.BillStatus = 'credit' THEN 1 ELSE 0 
		--	END) AS 'totTC',
		--SUM(CASE 
		--		WHEN fn.BillStatus = 'paid' THEN fn.PaidAmount
		--		WHEN fn.BillStatus = 'credit' THEN fn.CreditAmount
		--		ELSE 0
		--	END) AS 'totTA'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_PatientCensus(@FromDate,@ToDate) fn
	JOIN VW_BIL_TxnItemsInfoWithDateSeparation vm ON fn.BillingTransactionItemId = vm.BillingTransactionItemId
	WHERE ISNULL(@ProviderId,ISNULL(fn.ProviderId,0)) = ISNULL(fn.ProviderId,0)
	and ISNULL(@DepartmentId,ISNULL(fn.DepartmentId,0))= ISNULL(fn.DepartmentId,0)
	GROUP BY fn.ProviderName,fn.ServiceDepartmentName,fn.DepartmentId
	--ORDER BY 1,2
	) tbl
	order by tbl.Provider,tbl.ServiceDepartmentName

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
	   from  [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_PatientCensus](@FromDate, @ToDate)
)prov
END
GO




---END : DInesh 05th Feb'19 --Added DepartmentId of Doctors in patient census sp and functions


--start: sud:6Feb'19--Adding Counter for Radiology-ward billing and Altering Counter Table--
Insert into BIL_CFG_Counter(CounterName, CounterType, CreatedOn, CreatedBy)
Values('Radiology Counter','RADIOLOGY',getdate(),1)
GO
Alter Table BIL_CFG_Counter
Alter Column CounterType Varchar(50) NOT NULL
GO
Alter Table BIL_CFG_Counter
ADD Constraint UK_BillingCounterName_Type UNIQUE(CounterName, CounterType)
GO
--end: sud:6Feb'19--Adding Counter for Radiology-ward billing and Altering Counter Table--

---START: Yubraj 8th Feb'19 --Changing ParameterValue for check out time-
declare @ParId int;
set @ParId= (select ParameterId from CORE_CFG_Parameters where  ParameterGroupName='ADT' AND ParameterName='CheckoutTime')

update CORE_CFG_Parameters
set ParameterValue='13:00' where ParameterId=@ParId
Go
---END: Yubraj 8th Feb'19 --Changing ParameterValue for check out time-

--start:Salakha: 8th Feb 2019--Adding new rules for pharmacy and inventory and mapping
 
-- --inserting record in ACC_Ledger from phrm supplier
--DECLARE @cnt INT = 1;
--WHILE @cnt <= (SELECT MAX(VendorId) FROM INV_MST_Vendor)
--BEGIN
--	IF EXISTS(SELECT * FROM INV_MST_Vendor)
--	BEGIN
--		INSERT INTO ACC_Ledger (LedgerGroupId,LedgerName,CreatedOn,CreatedBy,IsActive,LedgerType)
--		SELECT
--			(SELECT LedgerGroupId FROM ACC_MST_LedgerGroup WHERE LedgerGroupName = 'Sundry Creditors' AND COA='Current Liabilities' AND PrimaryGroup='Liabilities') AS LedgerGroupId
--			,VendorName AS LedgerName
--			,GETDATE() AS CreatedOn
--			,1 AS CreatedBy
--			,1 AS IsActive
--			,'inventoryvendor' AS LedgerType
--		FROM INV_MST_Vendor where VendorId=@cnt AND VendorName not in (select LedgerName from ACC_Ledger where LedgerType='inventoryvendor')
--	END
--	SET @cnt=@cnt+1
--END
--GO

----inserting record into ledger mapping table for Pharmacy Supplier
--INSERT INTO ACC_Ledger_Mapping
--(LedgerId,ReferenceId,LedgerType)
--SELECT 
--LedgerId,
--(SELECT VendorId FROM INV_MST_Vendor WHERE VendorName=LedgerName),
--LedgerType
--FROM ACC_Ledger WHERE LedgerType='inventoryvendor'
--GO


delete from ACC_MST_MappingDetail
where Description like '%PHRM%'
go

delete from ACC_MST_GroupMapping 
where Description like '%PHRM%'
Go

---Pharmacy New Rules 
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCreditGoodReceipt', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Purchase Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCreditPaidGoodReceipt', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Payment Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCashGoodReceipt1', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Purchase Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCashGoodReceipt2', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Payment Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCreditInvoice', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Sales Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCreditPaidInvoice', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Receipt Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCashInvoice1', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Sales Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCashInvoice2', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Receipt Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCashInvoiceReturn', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Credit Note')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCreditInvoiceReturn', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Credit Note')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMWriteOff', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMDispatchToDept', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMDispatchToDeptReturn', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher'))
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCashReturnToSupplier', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Debit Note'))
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('PHRMCreditReturnToSupplier', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Debit Note'))
GO

--Mapping of Pharmacy Rules
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 1 ) 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 0) 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1) 

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditPaidGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 1) 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditPaidGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 0) 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditPaidGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId] ,[LedgerGroupId], [DrCr])VALUES  ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditPaidGoodReceipt' ),(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Revenue' and COA ='Indirect Income' and LedgerGroupName ='Discount Income'),0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt1'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 1 )
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt1'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 0) 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt1'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1) 

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 1) 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 0) 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0) 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId] ,[LedgerGroupId], [DrCr])VALUES  ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashGoodReceipt2' ),(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Revenue' and COA ='Indirect Income' and LedgerGroupName ='Discount Income'),0) 

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoice'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Direct Income' and LedgerGroupName='Sales'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoice'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Sundry Debtors'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoice'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId] ,[DrCr]) VALUES((select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMCreditInvoice' ), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Expenses' and COA ='Indirect Expenses' and LedgerGroupName ='Administration expenses'),1)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditPaidInvoice'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId] ,[DrCr]) VALUES((select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMCreditPaidInvoice' ), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Expenses' and COA ='Indirect Expenses' and LedgerGroupName ='Administration expenses'),1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditPaidInvoice'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Sundry Debtors'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice1'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Direct Income' and LedgerGroupName='Sales'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice1'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Sundry Debtors'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice1'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId] ,[DrCr]) VALUES((select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMCashInvoice1' ), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Expenses' and COA ='Indirect Expenses' and LedgerGroupName ='Administration expenses'),1)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA ='Indirect Expenses' and LedgerGroupName ='Administration expenses'),1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Sundry Debtors'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Direct Income' and LedgerGroupName='Sales'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA ='Indirect Expenses' and LedgerGroupName ='Administration expenses'),0) 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Direct Income' and LedgerGroupName='Sales'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Sundry Debtors'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoiceReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA ='Indirect Expenses' and LedgerGroupName ='Administration expenses'),0)


INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMWriteOff'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMWriteOff'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMDispatchToDept'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMDispatchToDept'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMDispatchToDeptReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMDispatchToDeptReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 1)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashReturnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashReturnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr] ) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashReturnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr] ) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashReturnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId] ,[LedgerGroupId],[DrCr])  VALUES((select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMCashReturnToSupplier' ),(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Revenue' and COA ='Indirect Income' and LedgerGroupName ='Discount Income'),1)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditReturnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where  PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditReturnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr] ) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditReturnToSupplier'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)
Go
-------Transfer rules for Inventory

INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('INVCreditGoodReceipt', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Purchase Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('INVCreditPaidGoodReceipt', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Payment Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('INVCashGoodReceipt1', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Purchase Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('INVCashGoodReceipt2', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Payment Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('INVReturnToVendorCashGR', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Debit Note')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('INVReturnToVendorCreditGR', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Debit Note')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('INVWriteOff', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('INVDispatchToDept', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId]) VALUES ('INVDispatchToDeptReturn', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO
-----------Mapping for inventory rules

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditPaidGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditPaidGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditPaidGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Indirect Income' and LedgerGroupName='Discount Income'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditPaidGoodReceipt'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 1)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceipt1'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceipt1'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceipt1'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceipt2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 1 )
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceipt2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceipt2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceipt2'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Indirect Income' and LedgerGroupName='Discount Income'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVReturnToVendorCashGR'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVReturnToVendorCashGR'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0 )
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVReturnToVendorCashGR'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVReturnToVendorCashGR'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Indirect Income' and LedgerGroupName='Discount Income'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVReturnToVendorCashGR'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVReturnToVendorCreditGR'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVReturnToVendorCreditGR'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0 )
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVReturnToVendorCreditGR'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVWriteOff'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVWriteOff'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0 )

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVDispatchToDept'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 1)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVDispatchToDept'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0 )

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVDispatchToDeptReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 0)
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVDispatchToDeptReturn'), (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 1 )
Go

ALTER TABLE INV_TXN_GoodsReceiptItems
DROP COLUMN IsTransferredToACC;
go

ALTER TABLE INV_TXN_GoodsReceipt
add IsTransferredToACC bit;
go


ALTER TABLE ACC_TransactionItemDetail
DROP COLUMN VenderId;
GO

ALTER TABLE ACC_TransactionItemDetail
ADD VendorId int;
GO

ALTER TABLE ACC_MST_GroupMapping
ADD Remarks varchar(255);
Go

update ACC_MST_GroupMapping
set VoucherId = (select VoucherId from ACC_MST_Vouchers where VoucherName ='Sales Voucher' )
where Description='DepositAdd' Or  Description='DepositReturn'
Go

update ACC_MST_GroupMapping
set Remarks ='Currect Voucher is Receipt Voucher but for HAMS customization used Sales voucher'
where Description='DepositAdd'
Go
update ACC_MST_GroupMapping
set Remarks ='Currect Voucher is Payment Voucher but for HAMS customization used Sales voucher'
where Description='DepositReturn'
Go

--End:Salakha: 8th Feb 2019--Adding new rules for pharmacy and inventory and mapping

--Start Ajay : 9Feb 2019 -- updating wrong ledgergroup for pharmacy supplier ledger
UPDATE ACC_Ledger 
SET LedgerGroupId=(SELECT LedgerGroupId FROM ACC_MST_LedgerGroup WHERE PrimaryGroup='Liabilities' AND COA='Current Liabilities' AND LedgerGroupName='Sundry Creditors')
WHERE LedgerType='pharmacysupplier'
GO
--END Ajay : 9Feb 2019 -- updating wrong ledgergroup for pharmacy supplier ledger

---start: sud:10Feb'19--revised Admitted Patient Report (billing+admission)---
/****** Object:  StoredProcedure [dbo].[SP_Report_ADT_TotalAdmittedPatient]    Script Date: 2/10/2019 3:17:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_ADT_TotalAdmittedPatient]  ---[SP_Report_ADT_TotalAdmittedPatient] '2019-01-01','2018-01-13'

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
1       Sagar/2017-05-27	                   created the script
2       Umed / 2017-06-08                      Modify the script i.e format and alias of table
                                               and Remove The time from AdmissionDate
											   and Group the Query by AdmissionDate
3.     Dinesh/2017-06-28                       all the information is requred to see the Admitted report and count at the last 
4      Umed/2018-04-23                        Apply Order by Desc Date and Added SR No also with Order By Date 
5.     Sud/24Sept'18                          Correction in Patientname, DoctorName, VisitId
6      Din /14th Jan'19						 Ward and Bed details shown on list
7.	   Vikas/24th Jan'19					 Removed Date filter parameters and get some new data column of admitted patients.
8.     Sud:10Feb'19                          Revised where clause to include those patients which are not discharged but their bedInfo.EndedOn 
                                                is set to some value from Billing (edit bed charge). 
										     New logic is to get latest bed of that admitted patient using Row_Number() function.
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
			    
				where ad.AdmissionStatus='admitted'
		) A
		where A.RowNum=1 ---take only latest bed..
		ORDER by SN 
	END	
END
GO

---end: sud:10Feb'19--revised Admitted Patient Report (billing+admission)---


---Start: sud:15Feb'19-- UserCollectionReport Revised to match Sales and Cash collection in all scenarios--
IF OBJECT_ID('FN_BILL_BillingTxnSegregation_ByBillingType_DailySales') IS NOT NULL
BEGIN
 DROP FUNCTION FN_BILL_BillingTxnSegregation_ByBillingType_DailySales
END
GO

/****** Object:  UserDefinedFunction [dbo].[FN_BILL_BillingTxnSegregation_ByBillingType_DailySales]    Script Date: 2/15/2019 12:09:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
File: FN_BILL_BillingTxnSegregation_ByBillingType_DailySales
Created: <sud:15Feb'19>
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
-------------------------------------------------------------------------------
*/


CREATE FUNCTION [dbo].[FN_BILL_BillingTxnSegregation_ByBillingType_DailySales]
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
						 PaidCounterId 'CounterId',PaymentReceivedBy 'EmployeeId',Remarks, 1 as DisplaySeq
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
					   CounterId 'CounterId', CreatedBy 'EmployeeId', Remarks, 2 as DisplaySeq 
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
					  PaidCounterId AS 'CounterId', PaymentReceivedBy AS 'EmployeeId', Remarks, 3 as DisplaySeq 
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
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remarks, 4 as DisplaySeq 
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
				 
						ret.CounterId, ret.CreatedBy 'EmployeeId', ret.Remarks, 5 as DisplaySeq
				FROM BIL_TXN_InvoiceReturn ret, BIL_TXN_BillingTransaction txn
				where ret.BillingTransactionId=txn.BillingTransactionId
				   and txn.PaymentMode='credit' and txn.BillStatus = 'unpaid'
			) A
			WHERE A.BillingDate BETWEEN @FromDate and @ToDate
) -- end of return
GO


GO
/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DailySales]    Script Date: 2/14/2019 12:00:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-11-29','2018-11-29',null,null
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: To Get Sales + Cash Collection details from Invoice and Deposits table between given range. 
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
4.      Sud/15Feb'19                           Format Revised, getting sales summary from a function and then union with Deposit transactions.
-----------------------------------------------------------------------------------------
*/
BEGIN
 IF (@FromDate IS NOT NULL)
  OR (@ToDate IS NOT NULL)
BEGIN
	
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
							 CounterId 'CounterId', CreatedBy 'EmployeeId', Remarks, 6 as DisplaySeq 
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

 END -- end of IF
END -- end of SP

GO

---End: sud:15Feb'19-- UserCollectionReport Revised to match Sales and Cash collection in all scenarios--

--START : Salakha 15 Feb 2019 : Added Column in ACC_TransactionItemDetail, ACC_Transactions
ALTER TABLE ACC_TransactionItemDetail
ADD ReferenceId int;
go

ALTER TABLE ACC_TransactionItemDetail
ADD ReferenceType varchar(200);
go

ALTER TABLE ACC_TransactionItemDetail
DROP COLUMN SupplierId, VendorId,  PatientId;
go

ALTER TABLE ACC_Transactions
ADD TUId int;
go
--End: Salakha 15 Feb 2019 :Added Column in ACC_TransactionItemDetail, ACC_Transactions

--Start: Shankar 17 Feb 2019 :Created Table for SMS service----
/****** Object:  Table [dbo].[TXN_Sms]    Script Date: 17-Feb-19 1:47:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TXN_Sms](
	[SmsId] [int] IDENTITY(1,1) NOT NULL,
	[SmsCounter] [int] NULL,
	[PatientId] [int] NULL,
	[DoctorId] [int] NULL,
	[SmsInformation] [varchar](255) NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[SmsId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
---End: Shankar 17 Feb 2019 :Created table for SMS service----


---Start: Ashim: 18 Feb 2019: Merged from IP Billing Branch---

--Start: Hom 18 Dec 2018 changes for IpBilling
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_BIL_GetItems_ForIPBillingReceipt] 
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

-------------------------------------------------------------------------------
*/

BEGIN
Select Convert(DATE, itm.CreatedOn) 'BillDate'
	  ,dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, 
	   emp.EmployeeId 'DoctorId',
	    emp.FirstName + ISNULL(emp.MiddleName + ' ', '') + emp.LastName 'DoctorName',
	   itm.Price,  itm.Quantity,  itm.SubTotal,  itm.DiscountAmount,  itm.Tax,  itm.TotalAmount
	  ,itm.ServiceDepartmentId, itm.ItemId
	FROM BIL_TXN_BillingTransactionItems itm
	left join EMP_Employee emp on itm.ProviderId = emp.EmployeeId
	WHERE PatientId=@PatientId 
	  AND ISNULL(itm.BillingTransactionId,0) =  ISNULL(@BillTxnId, ISNULL(itm.BillingTransactionId,0))
	  AND itm.BillStatus= ISNULL(@BillStatus,itm.BillStatus)
END

Go
--End: Hom 18 Dec 2018 changes for IpBilling

--Start::Yubraj 2nd January '19:: update Query for deposit table Adding IsActive and IsCurrent
	ALTER TABLE BIL_TXN_Deposit
	ADD IsCurrent bit NULL CONSTRAINT DF_BIL_TXN_Deposit_IsCurrent DEFAULT 1
	go

	ALTER TABLE BIL_TXN_Deposit
	ADD IsActive bit NULL CONSTRAINT DF_BIL_TXN_Deposit_IsActive DEFAULT 1
	go

	
update BIL_TXN_Deposit
set IsActive = 1
go

--End::Yubraj 2nd January '19:: update Query for deposit table Adding IsActive and IsCurrent

--Start::Yubraj 3rd January '19:: Adding Column ModifiedBy and ModifiedOn

	ALTER TABLE BIL_TXN_Deposit
	ADD ModifiedBy datetime NULL 
	go

	ALTER TABLE BIL_TXN_Deposit
	ADD ModifiedOn datetime NULL 
	go

--Start::Yubraj 3rd January '19:: Adding Column ModifiedBy and ModifiedOn

---START: 9thJan'19--Yubraj -- Added column IsTransferTransaction and deleting column IsCUrrent----
	ALTER TABLE BIL_TXN_Deposit
	ADD IsTransferTransaction bit NULL CONSTRAINT DF_BIL_TXN_Deposit_IsTransferTransaction DEFAULT 0
	go

	ALTER TABLE BIL_TXN_Deposit
	DROP CONSTRAINT DF_BIL_TXN_Deposit_IsCurrent
	GO

	ALTER TABLE BIL_TXN_Deposit
	DROP COLUMN IsCurrent;
	GO
---END: 9thJan'19--Yubraj -- Added column IsTransferTransaction and deleting column IsCUrrent----

---Start: 10 th Jan'19--Yubraj -- Added column IsTransferTransaction and deleting column IsCUrrent----
	ALTER TABLE BIL_TXN_Deposit
	ADD ModifiedRemarks Varchar(200) NULL 
	go

	ALTER TABLE BIL_TXN_Deposit
	DROP COLUMN ModifiedBy
	Go

	ALTER TABLE BIL_TXN_Deposit
	ADD ModifiedBy int null;
	Go
---End: 10 th Jan'19--Yubraj -- Added column IsTransferTransaction and deleting column IsCUrrent----

---Start: 17 th Jan'19--Yubraj -- Updating parameters by adding auto generated items in JSON ----
--1. getting item id and ServiceDepartmentId of ADMISSION CHARGES (INDOOR)
declare @itemId1 int;
set @itemId1 = (select ItemId from BIL_CFG_BillItemPrice where  IntegrationName='ADMISSION CHARGES (INDOOR)')

declare @deptId1 int;
set @deptId1 = (select ServiceDepartmentId from BIL_CFG_BillItemPrice where  IntegrationName='ADMISSION CHARGES (INDOOR)')

--2. getting item id and ServiceDepartmentId of 'Medical and Resident officer/Nursing Charges'
declare @itemId2 int;
set @itemId2 = (select ItemId from BIL_CFG_BillItemPrice where  IntegrationName='Medical and Resident officer/Nursing Charges')

declare @deptId2 int;
set @deptId2 = (select ServiceDepartmentId from BIL_CFG_BillItemPrice where  IntegrationName='Medical and Resident officer/Nursing Charges')

--3. getting item id and ServiceDepartmentId of 'Medical Record Charge'
declare @itemId3 int;
set @itemId3 = (select ItemId from BIL_CFG_BillItemPrice where  IntegrationName='Medical Record Charge')

declare @deptId3 int;
set @deptId3 = (select ServiceDepartmentId from BIL_CFG_BillItemPrice where  IntegrationName='Medical Record Charge')


INSERT [dbo].[CORE_CFG_Parameters] (
[ParameterGroupName], 
[ParameterName], 
[ParameterValue], 
[ValueDataType], 
[Description]) 
VALUES (N'ADT',
 N'AutoAddBillingItems', 
 N'{"DoAutoAddBillingItems":true,"DoAutoAddBedItem":true,"ItemList":[{ "ServiceDepartmentId":'+ Convert(varchar,@deptId1) + N',"ItemId":' + Convert(varchar,@itemId1) + N'}, { "ServiceDepartmentId":' + Convert(varchar,@deptId2) + N', "ItemId":'+ Convert(varchar,@itemId2) + N'},{ "ServiceDepartmentId":' + Convert(varchar,@deptId3) + N', "ItemId": ' + Convert(varchar,@itemId3) + N' }]}',
 N'JSON', 
 N'These billing items are added when the patient gets admitted.')
GO

---End: 17 th Jan'19--Yubraj -- Updating parameters by adding auto generated items in JSON ----


---End: Ashim: 18 Feb 2019: Merged from IP Billing Branch---

----Labelled Upto here for V_1.13.0_IpBilling++-------


--Start: Ajay: 20 Feb 2019 --Trigger for update createdby and transaction in [BIL_SYNC_BillingAccounting] table

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [dbo].[TRG_BillToAcc_BillSync]
   ON [dbo].[BIL_SYNC_BillingAccounting]
   AFTER INSERT
AS 
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ajay/2019-02-20		created the script
=======================================================
*/
BEGIN
	--CashBillReturn
	--CreditBillReturn
	DECLARE @TransactionType VARCHAR(MAX);
	DECLARE @CreatedOn DATETIME;
	DECLARE @CreatedBy INT;
	SELECT @TransactionType= TransactionType FROM inserted;

	IF ((@TransactionType = 'CashBillReturn') OR(@TransactionType = 'CreditBillReturn'))
	BEGIN
	(SELECT @CreatedBy=CreatedBy, @CreatedOn=CreatedOn FROM BIL_TXN_InvoiceReturn 
		WHERE BillingTransactionId = 
			(SELECT BillingTransactionId FROM BIL_TXN_BillingTransactionItems 
				WHERE BillingTransactionItemId = 
					(SELECT ReferenceId FROM inserted)))
		--Updating Values
		UPDATE BIL_SYNC_BillingAccounting
		SET CreatedBy=@CreatedBy,
			TransactionDate=@CreatedOn
		WHERE BillingAccountingSyncId = (SELECT BillingAccountingSyncId FROM inserted)
	END
	--CreditBillPaid
	IF ((@TransactionType = 'CreditBillPaid'))
	BEGIN
	(SELECT @CreatedBy=PaymentReceivedBy, @CreatedOn=PaidDate FROM BIL_TXN_BillingTransactionItems 
		WHERE BillingTransactionItemId = (SELECT ReferenceId FROM inserted))
		--Updating Values
		UPDATE BIL_SYNC_BillingAccounting
		SET CreatedBy=@CreatedBy,
			TransactionDate=@CreatedOn
		WHERE BillingAccountingSyncId = (SELECT BillingAccountingSyncId FROM inserted)
	END
END
GO
--End: Ajay: 20 Feb 2019 --Trigger for update createdby and transaction in [BIL_SYNC_BillingAccounting] table

---Start: Dinesh 21st Feb'2019: Added Date Filter, Remarks, invoice no in Credit Summary Report -------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_PatientCreditSummary]    Script Date: 2/21/2019 7:39:39 AM ******/
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
--------------------------------------------------------
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
  SUM(txn.TotalAmount) 'TotalAmount'
FROM BIL_TXN_BillingTransaction txn
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
		 txn.CreatedOn

END
END
GO
---End: Dinesh 21st Feb'2019: Added Date Filter, Remarks, invoice no in Credit Summary Report -------------------

--Start : Ajay 22ndFeb'19: Getting PaymentRecivedBy and TranasctionDate For CashBill and CreditBillPaid
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_BillToAcc_BillSync]
   ON [dbo].[BIL_SYNC_BillingAccounting]
   AFTER INSERT
AS 
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ajay/2019-02-20		created the script
2		Ajay/2019-02-22		getting PaymentReceivedBy and TransactionDate for CashBill and CreditBillPaid
=======================================================
*/
BEGIN
	
	DECLARE @TransactionType VARCHAR(MAX);
	DECLARE @CreatedOn DATETIME;
	DECLARE @CreatedBy INT;
	SELECT @TransactionType= TransactionType FROM inserted;
	--CashBillReturn
	--CreditBillReturn
	IF ((@TransactionType = 'CashBillReturn') OR(@TransactionType = 'CreditBillReturn'))
	BEGIN
	(SELECT @CreatedBy=CreatedBy, @CreatedOn=CreatedOn FROM BIL_TXN_InvoiceReturn 
		WHERE BillingTransactionId = 
			(SELECT BillingTransactionId FROM BIL_TXN_BillingTransactionItems 
				WHERE BillingTransactionItemId = 
					(SELECT ReferenceId FROM inserted)))
		--Updating Values
		UPDATE BIL_SYNC_BillingAccounting
		SET CreatedBy=@CreatedBy,
			TransactionDate=@CreatedOn
		WHERE BillingAccountingSyncId = (SELECT BillingAccountingSyncId FROM inserted)
	END
	--CreditBillPaid
	--CashBill
	IF ((@TransactionType = 'CreditBillPaid') OR (@TransactionType = 'CashBill'))
	BEGIN
	(SELECT @CreatedBy=t.PaymentReceivedBy, @CreatedOn=t.PaidDate FROM BIL_TXN_BillingTransactionItems ti
	JOIN BIL_TXN_BillingTransaction t on ti.BillingTransactionId = t.BillingTransactionId
		WHERE BillingTransactionItemId = (SELECT ReferenceId FROM inserted))
		--Updating Values
		UPDATE BIL_SYNC_BillingAccounting
		SET CreatedBy=@CreatedBy,
			TransactionDate=@CreatedOn
		WHERE BillingAccountingSyncId = (SELECT BillingAccountingSyncId FROM inserted)
	END
END
GO
--END : Ajay 22ndFeb'19: Getting PaymentRecivedBy and TranasctionDate For CashBill and CreditBillPaid


---Sud:22Feb'19--For DoctorSummary, DoctorDeptSummary, DoctorDeptItemSummary, TotalItems Bill Reports---

/****** Object:  View [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]    Script Date: 2/22/2019 2:53:16 PM ******/
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
FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO



/****** Object:  UserDefinedFunction [dbo].[FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional]    Script Date: 2/22/2019 2:54:44 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional]
(@StartDate Date, @EndDate Date)

/*
File: FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional
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
-------------------------------------------------------------------------------
*/
RETURNS TABLE
AS
RETURN
(

		
			WITH AllItems AS
			(

			Select  pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ','') + pat.LastName 'PatientName',
			CASE WHEN ProviderId IS NOT NULL
					 --sud:31Jan'19--Isnull check for Salutation (needed for ER Doctor: Duty Doctor)--
					THEN ISNULL(emp.Salutation + '. ','') + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS DoctorName,

			  txnItemInfo.* from VW_BIL_TxnItemsInfoWithDateSeparation txnItemInfo 

			      Inner Join PAT_Patient pat on txnItemInfo.PatientId=pat.Patientid
				  Left Join EMP_Employee emp ON txnItemInfo.ProviderId = emp.EmployeeId

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
					   ServiceDepartmentId, [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName'
					   , ProviderId, DoctorName AS 'ProviderName',InvoiceNumber ,

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
						  ServiceDepartmentId, [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName'
						  , ProviderId,  DoctorName AS 'ProviderName',InvoiceNumber ,
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
						 ServiceDepartmentId, [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName'
						  , ProviderId,  DoctorName AS 'ProviderName',InvoiceNumber ,
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
						   ServiceDepartmentId, [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName'
						  , ProviderId,  DoctorName AS 'ProviderName',InvoiceNumber ,
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
						   ServiceDepartmentId, [dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName'
						  , ProviderId,  DoctorName AS 'ProviderName',InvoiceNumber ,
						 3 as DisplaySeq
			FROM AllItems
			WHERE  BillStatus='unpaid'  AND  ReturnDate  BETWEEN @StartDate and @EndDate
			


)
GO


/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DoctorSummary]    Script Date: 2/22/2019 2:55:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		Sud/02Sept'18
-- Description:		to show doctor summary
-- Remarks: 
---[SP_Report_BIL_DoctorSummary] '2018-08-02','2018-09-02'
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorSummary]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1.		Sud/02Sept'18			     Initial Draft
2.		Ramavtar/12Nov'18			 sorting by doctorname
3.	    Ramavtar/30Nov'18			 summary added
4.		Ramavtar/17Dec'18			change in where condition (checking for credit records)
5.      Sud/21Feb'19                Changed as per new function <needs revision>
----------------------------------------------------------
*/
BEGIN
  
 SELECT
        ISNULL(Providerid, 0) 'DoctorId',
        CASE WHEN ISNULL(ProviderId, 0) != 0 THEN ProviderName ELSE 'No Doctor' END AS 'DoctorName',
        SUM(ISNULL(SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
        SUM(ISNULL(ReturnTotalAmount, 0)) AS 'Refund',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnTotalAmount, 0)) AS 'NetTotal',

		 SUM(ISNULL(CreditAmount, 0)) AS 'CreditAmount',
		 SUM(ISNULL(CreditReceived, 0)) AS 'CreditReceivedAmount'

    FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate)
	    GROUP BY 
		ProviderId,
		ProviderName	
	ORDER BY 2 

 --   SELECT
 --       ISNULL(Providerid, 0) 'DoctorId',
 --       CASE WHEN ISNULL(ProviderId, 0) != 0 THEN ProviderName ELSE 'NoDoctor' END AS 'DoctorName',
 --       SUM(ISNULL(SubTotal, 0)) 'SubTotal',
 --       SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
 --       SUM(ISNULL(ReturnAmount, 0)) AS 'Refund',
 --       SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) AS 'NetTotal'
 --   FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	--WHERE BillStatus != 'cancelled' 
	--		AND BillStatus != 'provisional'
	--		--AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
 --   GROUP BY 
	--	ProviderId,
	--	ProviderName	
	--ORDER BY 2 



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
--FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)--for testing: sud-29Jan2019--revert to above
END
GO
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DoctorDeptSummary]    Script Date: 2/22/2019 2:56:34 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorDeptSummary]	--SP_Report_BIL_DoctorDeptSummary '2018-07-01', '2018-11-22'
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL,
  @DoctorId INT = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Sud/02Sept'18           Initial Draft
2	 Ramavtar/30Nov'18		 summary added 
3	 Ramavtar/17Dec'18		 change in where condition (checking for credit records)
4    sud: 21Feb'19           Updated as per new function
----------------------------------------------------------
*/
BEGIN

   --- updated by sud: 21Feb'19-- earlier query below is commented--
   SELECT
        ISNULL(Providerid, 0) 'DoctorId',
        CASE WHEN ISNULL(ProviderId, 0) != 0 THEN ProviderName ELSE 'No Doctor' END AS 'DoctorName',
		ServiceDepartmentName 'ServiceDepartment',
		SUM(ISNULL(Quantity, 0) - ISNULL(ReturnQuantity, 0)) 'Quantity',
        SUM(ISNULL(SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(DiscountAmount, 0)) AS 'DiscountAmount',
        SUM(ISNULL(ReturnTotalAmount, 0)) AS 'ReturnAmount',
		SUM(ISNULL(TotalAmount, 0)) AS 'TotalAmount',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnTotalAmount, 0)) AS 'NetSales',

		 SUM(ISNULL(CreditAmount, 0)) AS 'CreditAmount',
		 SUM(ISNULL(CreditReceived, 0)) AS 'CreditReceivedAmount'

    FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate) fnItems
	 WHERE (ISNULL(@DoctorId, ISNULL(fnItems.ProviderId, 0)) = ISNULL(fnItems.ProviderId, 0))

	    GROUP BY 
		ServiceDepartmentName,
		ProviderId,
		ProviderName	
	ORDER BY 2 



  --  --SELECT
  --  --    ISNULL(fnItems.ProviderId, 0) 'DoctorId',
  --  --    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
  --      fnItems.ServiceDepartmentName 'ServiceDepartment',
  --      SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
  --      SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
  --      SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
  --      SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
  --      SUM(ISNULL(fnItems.ReturnAmount, 0)) 'ReturnAmount',
  --      SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) 'NetSales'
  --  FROM (SELECT *
		--	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)) fnItems

  --  ---NOTE: we should return All if @DoctorId=NULL, DoctorName='NoDoctor' when @DoctorId=0
  --  WHERE (ISNULL(@DoctorId, ISNULL(fnItems.ProviderId, 0)) = ISNULL(fnItems.ProviderId, 0))
		--AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
		--AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
  --  GROUP BY fnItems.ServiceDepartmentName,
  --           ISNULL(fnItems.ProviderId, 0),
  --           ISNULL(fnItems.ProviderName, 'NoDoctor')
		--	 order by 2

    ---Table:2 Get Provisional Amount in above Date Filter---
    SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)
	WHERE (ISNULL(@DoctorId, ISNULL(ProviderId, 0)) = ISNULL(ProviderId, 0))
END

GO
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DoctorDeptItemsSummary]    Script Date: 2/22/2019 2:56:54 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
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
----------------------------------------------------------
*/
BEGIN
	IF(@SrvDeptName IS NOT NULL)
		BEGIN
			SELECT
			    BillingDate 'Date',
			    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			    pat.PatientCode,
			    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			    fnItems.ServiceDepartmentName,
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
			WHERE fnItems.ServiceDepartmentName = @SrvDeptName
				AND ISNULL(fnItems.ProviderId, 0) = @DoctorId
				and fnItems.BillingType !='CreditReceived'
			ORDER BY 1 DESC



			--SELECT
			--    COALESCE(fnItems.ReturnDate, fnItems.PaidDate, fnItems.CreditDate) 'Date',
			--    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			--    pat.PatientCode,
			--    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			--    fnItems.ServiceDepartmentName,
			--    fnItems.ItemName,
			--    fnItems.Price,
			--    fnItems.Quantity,
			--    fnItems.SubTotal,
			--    fnItems.DiscountAmount,
			--    fnItems.TotalAmount,
			--    fnItems.ReturnAmount,
			--    fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
			--FROM (SELECT
			--    *
			--FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)) fnItems
			--JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
			--WHERE fnItems.ServiceDepartmentName = @SrvDeptName
			--	AND ISNULL(fnItems.ProviderId, 0) = @DoctorId
			--	AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
			--	AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
			--ORDER BY 1 DESC

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
			    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			    pat.PatientCode,
			    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			    fnItems.ServiceDepartmentName,
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
			ORDER BY 1 DESC


			
			--SELECT
			--    COALESCE(fnItems.ReturnDate, fnItems.PaidDate, fnItems.CreditDate) 'Date',
			--    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
			--    pat.PatientCode,
			--    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
			--    fnItems.ServiceDepartmentName,
			--    fnItems.ItemName,
			--    fnItems.Price,
			--    fnItems.Quantity,
			--    fnItems.SubTotal,
			--    fnItems.DiscountAmount,
			--    fnItems.TotalAmount,
			--    fnItems.ReturnAmount,
			--    fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
			--FROM (SELECT
			--    *
			--FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)) fnItems
			--JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
			--WHERE ISNULL(fnItems.ProviderId, 0) = @DoctorId
			--	AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
			--	AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
			--ORDER BY 1 DESC,5 ASC

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

/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_TotalItemsBill]    Script Date: 2/22/2019 2:57:49 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BILL_TotalItemsBill] 	-- [SP_Report_BILL_TotalItemsBill] '2018-08-01', '2018-08-23'
		@FromDate DATETIME = NULL,
		@ToDate DATETIME = NULL,
		@BillStatus VARCHAR(MAX) = NULL,
		@ServiceDepartmentName VARCHAR(MAX) = NULL,
		@ItemName VARCHAR(MAX) = NULL
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
--------------------------------------------------------
*/
BEGIN
	SELECT
		txnItms.BillingDate,
		pat.PatientCode 'HospitalNumber',
		CONCAT(pat.FirstName, pat.LastName) 'PatientName',
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
			SELECT ProvisionalDate 'BillingDate', 'provisional' AS BillStatus_New, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE ProvisionalDate IS NOT NULL
			UNION ALL
			SELECT CancelledDate 'BillingDate', 'cancel' AS BillStatus_New, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE CancelledDate IS NOT NULL
			UNION ALL
			SELECT PaidDate 'BillingDate', 'paid' AS BillStatus_New, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE PaidDate IS NOT NULL
			UNION ALL
			SELECT CreditDate 'BillingDate', 'unpaid' AS BillStatus_New, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE CreditDate IS NOT NULL
			UNION ALL
			SELECT ReturnDate 'BillingDate', 'return' AS BillStatus_New, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE ReturnDate IS NOT NULL
		) txnItms
	LEFT JOIN PAT_Patient pat ON txnItms.PatientId = pat.PatientId
	WHERE (txnItms.BillingDate BETWEEN @FromDate AND @ToDate)
		AND (txnItms.BillStatus_New LIKE ISNULL(@BillStatus, txnItms.BillStatus_New) + '%')
		AND (txnItms.ServiceDepartmentName LIKE '%' + ISNULL(@ServiceDepartmentName, txnItms.ServiceDepartmentName) + '%')
		AND (txnItms.ItemName LIKE '%' + ISNULL(@ItemName, txnItms.ItemName) + '%')
	ORDER BY txnItms.BillingDate, txnItms.BillingTransactionItemId DESC
END
GO
---End:22Feb'19--For DoctorSummary, DoctorDeptSummary, DoctorDeptItemSummary, TotalItems Bill Reports---

---Start: Salakha:25Feb 2019  --sp to update tables for transafer to accounting---

/****** Object:  StoredProcedure [dbo].[SP_UpdateIsTransferToACC]    Script Date: 25-02-2019 10:32:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--[SP_UpdateIsTransferToACC] '1066,1067' , 'PHRMInvoice'
-- =============================================
-- Author:    Salakha Gawas
-- Create date: 25 Feb 2019
-- Description:  Created Script to Update column IsTransferToACC
-- =============================================
create PROCEDURE SP_UpdateIsTransferToACC
    @ReferenceIds varchar(max),
       @TransactionType nvarchar(50)
AS
BEGIN

------------------update pharmacy transaction transferred records--------------------------------------

	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashGoodReceipt1')
		Begin            
			EXECUTE('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN ('+@ReferenceIds+')')
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashGoodReceipt2')
		Begin
			EXECUTE('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoice1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoice2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoiceReturn')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashReturnToSupplier')
		Begin
			EXECUTE('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = 1 WHERE ReturnToSupplierId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMWriteOff')
		Begin
			EXECUTE('UPDATE PHRM_WriteOff SET IsTransferredToACC = 1 WHERE WriteOffId IN ('+@ReferenceIds+')')  
		END

  ------------------------updates inventory txn transaferred records--------------------------------

    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt1')
	  Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
	 END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt2')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditGoodReceipt')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditPaidGoodReceipt')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVWriteOff')
		Begin
			EXECUTE('UPDATE INV_TXN_WriteOffItems SET IsTransferredToACC = 1 WHERE WriteOffId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVReturnToVendorCashGR')
		Begin
			EXECUTE('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVReturnToVendorCreditGR')
		Begin
			EXECUTE('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN ('+@ReferenceIds+')')  
		END


  --------------------------updates billing txn transferred records---------------

  if(@ReferenceIds IS NOT NULL AND @TransactionType = 'BillingRecords')
	  Begin
		  EXECUTE('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = 1 WHERE BillingAccountingSyncId IN ('+@ReferenceIds+')')  
	  END
END
GO
---End:25Feb'19--sp to update tables for transafer to accounting---

--- Start: Hom 5 March 2019: Inserting parameters for enabling healthcard----
INSERT [dbo].[CORE_CFG_Parameters] (
[ParameterGroupName], 
[ParameterName], 
[ParameterValue], 
[ValueDataType], 
[Description]) 
VALUES 
(N'Visit',
N'EnableHealthCard',
N'{"enableHealthCard":true}',
N'JSON',
N'This ensures whether health card should be enabled or disabled while doing appointments')
GO
---- End: Hom 5 March 2019: Inserting parameters for enabling healthcard----

---Start: Sud-5Mar'19--Adding multiple Price Categories in Billing --
Alter table [dbo].[BIL_CFG_BillItemPrice]
Alter Column [ItemCode] Varchar(20)
GO
Alter table [dbo].[BIL_CFG_BillItemPrice]
Alter Column ItemName Varchar(200)
GO
Alter table [dbo].[BIL_CFG_BillItemPrice]
Alter Column Description Varchar(500)
GO
---adding three new column for new prices settings--
Alter Table [dbo].[BIL_CFG_BillItemPrice]
Add EHSPrice FLOAT NULL
GO
Alter Table [dbo].[BIL_CFG_BillItemPrice]
Add SAARCCitizenPrice FLOAT NULL
GO
Alter Table [dbo].[BIL_CFG_BillItemPrice]
Add ForeignerPrice FLOAT NULL
GO
Alter Table [dbo].[BIL_CFG_BillItemPrice]
Add GovtInsurancePrice FLOAT NULL
GO


Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description)
Values('Billing','EnabledPriceCategories','{"Normal":true,"EHS":false,"SAARCCitizen":false,"Foreigner":false,"GovtInsurance":false}','JSON','Billing Price Categories which are enabled in our system.')
GO

--Price Category includes: Normal, Foreigner, EHS, SAARCCitizen, GovtInsurance, etc.. 
Alter Table BIL_TXN_BillingTransactionItems
Add PriceCategory Varchar(50) NULL
GO

---End: Sud-5Mar'19--Adding multiple Price Categories in Billing --

---Start: Rusha-7Mar'19--Add MRP, Price ant TotalQty headercolumn --
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_StockManageDetailReport]    Script Date: 03/07/2019 10:57:18 AM ******/
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
--------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT convert(date,stkMng.CreatedOn) as [Date] ,itm.ItemName, stkMng.BatchNo, stkMng.ExpiryDate ,stkMng.Quantity,stkMng.Remark,
			case when stkMng.InOut='in'then 'stock added' else 'stock deducted'
			end as InOut, stkMng.MRP, stkMng.Price, stkMng.MRP*stkMng.Quantity as TotalAmount 
					FROM PHRM_StockManage stkMng
            INNER JOIN PHRM_MST_Item itm on itm.ItemId = stkMng.ItemId
            WHERE  convert(datetime, stkMng.CreatedOn)
           BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END		
End
GO

---End: Rusha-7Mar'19--Add MRP, Price ant TotalQty headercolumn --

--Start: Ajay: 7Mar'19 
--deleting not mapped Ledgers for PharmacySupplier and InventoryVendor
DELETE ACC_Ledger 
	WHERE LedgerId NOT IN (SELECT LedgerId FROM ACC_Ledger_Mapping) 
		AND LedgerId NOT IN (SELECT LedgerId FROM ACC_TransactionItems) 
		AND LedgerType IS NOT NULL
GO
--ENd: Ajay: 7Mar'19 

--Start: Sanjit: 12Mar'19
--creating table for hemodialysis report
Create Table NEPH_HemodialysisRecord
(
HemodialysisRecordId INT Identity(1,1) Constraint PK_HemodialysisRecord Primary Key Not null,
PatientId INT NOT NULL,  -- Foreign Key to Pat_Patient(PatientId)
PatientVisitId INT,-- Foreign Key to Pat_PatientVisits(PatientVisitId)
Diagnosis Varchar(500),
Schedule Varchar(100),
NextHD DateTime,
CurrentHdDate DateTime,
IdNo Varchar(50),
HdNo Varchar(50),
TreatmentOrder_DryWeight Varchar(50),
TreatmentOrder_DialysisFlow Varchar(50),
TreatmentOrder_Blood Varchar(50),
TreatmentOrder_TimeInMin Varchar(50),
TreatmentOrder_UsedNo Varchar(50),
TreatmentOrder_BloodTransfusion Varchar(50),
TreatmentOrder_HeparineSaline_Circulation Varchar(50),
TreatmentOrder_HeparineSaline_Bolus Varchar(50),
TreatmentOrder_HeparineSaline_Continuous Varchar(50),
 
VascularAccess_AVF bit,
VascularAccess_Subclavian bit,
VascularAccess_Jugular bit,
VascularAccess_FemoralCatheter bit,
VascularAccess_PermCath bit,

BloodTrans_BloodGroup Varchar(500),
BloodTrans_Today Varchar(500),
BloodTrans_BagNo Varchar(500),
BloodTrans_NextBT bit,
BloodTrans_CollectionDate DateTime,
BloodTrans_ExpDate DateTime,

TreatmentData_PreWeight Varchar(50),
TreatmentData_PostWeight Varchar(50),
TreatmentData_PreTemperature Varchar(50),
TreatmentData_PostTemperature Varchar(50),
TreatmentData_PrePulse Varchar(50), 
TreatmentData_PostPulse Varchar(50),
TreatmentData_PreStandBp Varchar(50),
TreatmentData_PostStandBp Varchar(50),
TreatmentData_PreSitBp Varchar(50),
TreatmentData_PostSitBp Varchar(50),
TreatmentData_UfGoal Varchar(50),
TreatmentData_MachineNo Varchar(50),
TreatmentData_Machine_Conductivity	Varchar(50),
TreatmentData_Machine_Temperature	Varchar(50),
TreatmentData_Machine_MachineCheck	Varchar(50),
TreatmentData_Initials	Varchar(50),
TreatmentData_PreLab	Varchar(50),
TreatmentData_PostLab	Varchar(50),
TreatmentData_Hb_PcV	Varchar(50),
TreatmentData_BloodSugar	Varchar(50),
TreatmentData_TimeOn Varchar(50),
TreatmentData_TimeOn_By Varchar(50),
TreatmentData_TimeOff Varchar(50),
TreatmentData_TimeOff_By Varchar(50),

OnExamination_Pallor Varchar(100),
OnExamination_Ictercus Varchar(100),
OnExamination_JVP Varchar(100),
OnExamination_Rash Varchar(100),
OnExamination_Lymphnode Varchar(100),
OnExamination_Chest Varchar(100),
OnExamination_CVS Varchar(100),
OnExamination_PA Varchar(100),
OnExamination_SPo2 Varchar(100),
OnExamination_Others Varchar(500),

ChiefComplaint Varchar(4000),
Comments_Drugs Varchar(4000),
PostDialysisAssesment Varchar(4000),

TotalBloodVolume Varchar(50),
TotalHeparin_Saline Varchar(50),
TotalFluidRemoved Varchar(50),
WeightDifference Varchar(50),
PtSentToHospital Varchar(200),
PtSentToHome Varchar(200),
IsDialyzerDiscard bit,

IsSubmitted bit,
IsSubmittedOn DateTime,
 
CheckedByName Varchar(200),
VerifiedByName Varchar(200),

SignatoryName_1  Varchar(200),
SignatoryName_2  Varchar(200),

CreatedOn DateTime,
CreatedBy INT,  --FK to EMP_Employee(EmployeeId)
ModifiedOn DateTime, 
ModifiedBy INT, --FK to EMP_Employee(EmployeeId)
IsActive BIT
)
GO
--End: Sanjit: 12Mar'19



--start: sud:12Mar'19--for dental counter, provisional billing etc..--
If NOT EXISTS(Select 1 from BIL_CFG_Counter where CounterName='Dental Counter' and CounterType='BILLING')
BEGIN
Insert into BIL_CFG_Counter(CounterName,CounterType,CreatedBy,CreatedOn)
Values('Dental Counter','BILLING',1,getdate())
END
GO

Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
Values('Billing','AllowAdditionalDiscOnProvisionalInvoice','true','boolean','Since Additional Discount is done on final bill, so need to parameterize it for ProvisionalInvoice');
GO

--end: sud:12Mar'19--for dental counter, provisional billing etc..--



---start: Sud:13Mar'19--BillingReports: DoctorDeptSummary, DoctorDeptItemSummary, DepartmentSummary, DepartmentItemSummary---

/****** Object:  UserDefinedFunction [dbo].[FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional]    Script Date: 3/13/2019 1:45:41 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional]
(@StartDate Date, @EndDate Date)

/*
File: FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional
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
-------------------------------------------------------------------------------
*/
RETURNS TABLE
AS
RETURN
(

		
		WITH AllItems AS
			(

			Select  pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ','') + pat.LastName 'PatientName',
			CASE WHEN ProviderId IS NOT NULL
					 --sud:31Jan'19--Isnull check for Salutation (needed for ER Doctor: Duty Doctor)--
					THEN ISNULL(emp.Salutation + '. ','') + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS DoctorName,

			  txnItemInfo.* from VW_BIL_TxnItemsInfoWithDateSeparation txnItemInfo 

			      Inner Join PAT_Patient pat on txnItemInfo.PatientId=pat.Patientid
				  Left Join EMP_Employee emp ON txnItemInfo.ProviderId = emp.EmployeeId

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
					   , ProviderId, DoctorName AS 'ProviderName',InvoiceNumber ,

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
						  , ProviderId,  DoctorName AS 'ProviderName',InvoiceNumber ,
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
						  , ProviderId,  DoctorName AS 'ProviderName',InvoiceNumber ,
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
						  , ProviderId,  DoctorName AS 'ProviderName',InvoiceNumber ,
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
						  , ProviderId,  DoctorName AS 'ProviderName',InvoiceNumber ,
						 3 as DisplaySeq
			FROM AllItems
			WHERE  BillStatus='unpaid'  AND  ReturnDate  BETWEEN @StartDate and @EndDate
			



)
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DoctorDeptSummary]    Script Date: 3/13/2019 1:46:17 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorDeptSummary]	--SP_Report_BIL_DoctorDeptSummary '2018-07-01', '2018-11-22'
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL,
  @DoctorId INT = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Sud/02Sept'18           Initial Draft
2	 Ramavtar/30Nov'18		 summary added 
3	 Ramavtar/17Dec'18		 change in where condition (checking for credit records)
4    sud: 21Feb'19           Updated as per new function
5    sud:13Mar'19            Join with FN_BIL_GetSrvDeptReportingName_DoctorSummary to get actual service department name, 
                             since it's now removed from  FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional
----------------------------------------------------------
*/
BEGIN

   --- updated by sud: 21Feb'19-- earlier query below is commented--
   SELECT
        ISNULL(Providerid, 0) 'DoctorId',
        CASE WHEN ISNULL(ProviderId, 0) != 0 THEN ProviderName ELSE 'No Doctor' END AS 'DoctorName',

		[dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName) AS 'ServiceDepartment',--sud:13Mar'19
		---ServiceDepartmentName 'ServiceDepartment',

		SUM(ISNULL(Quantity, 0) - ISNULL(ReturnQuantity, 0)) 'Quantity',
        SUM(ISNULL(SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(DiscountAmount, 0)) AS 'DiscountAmount',
        SUM(ISNULL(ReturnTotalAmount, 0)) AS 'ReturnAmount',
		SUM(ISNULL(TotalAmount, 0)) AS 'TotalAmount',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnTotalAmount, 0)) AS 'NetSales',

		 SUM(ISNULL(CreditAmount, 0)) AS 'CreditAmount',
		 SUM(ISNULL(CreditReceived, 0)) AS 'CreditReceivedAmount'

    FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate) fnItems
	 WHERE (ISNULL(@DoctorId, ISNULL(fnItems.ProviderId, 0)) = ISNULL(fnItems.ProviderId, 0))

	    GROUP BY 
		[dbo].[FN_BIL_GetSrvDeptReportingName_DoctorSummary] (ServiceDepartmentName,ItemName),
		ProviderId,
		ProviderName	
	ORDER BY 2 

    ---Table:2 Get Provisional Amount in above Date Filter---
    SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)
	WHERE (ISNULL(@DoctorId, ISNULL(ProviderId, 0)) = ISNULL(ProviderId, 0))
END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DoctorDeptItemsSummary]    Script Date: 3/13/2019 1:46:32 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
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
----------------------------------------------------------
*/
BEGIN
	IF(@SrvDeptName IS NOT NULL)
		BEGIN
			
			SELECT
			    BillingDate 'Date',
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
			ORDER BY 1 DESC


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
			ORDER BY 1 DESC


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

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DepartmentSummary]    Script Date: 3/13/2019 1:46:57 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BIL_DepartmentSummary] -- SP_Report_BIL_DepartmentSummary '2018-08-01','2018-09-11'
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
2		Ramavtar/30Nov'18		added summary and filtered report data for provisional and cancel
3       Sud/13Mar'19            Changed to function FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional 
                                  from: FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary
----------------------------------------------------------
*/
BEGIN
	--table1: report data
	 SELECT
	    [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (ServiceDepartmentName,ItemName) 'ServiceDepartment',
		--fnItems.ServiceDepartmentName 'ServiceDepartment',
		SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
		SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
		SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
		SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
		SUM(ISNULL(fnItems.ReturnTotalAmount, 0)) 'ReturnAmount',
	    SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnTotalAmount, 0)) AS 'NetSales',
	    SUM(ISNULL(CreditAmount, 0)) AS 'CreditAmount',
		SUM(ISNULL(CreditReceived, 0)) AS 'CreditReceivedAmount'

	FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate)  fnItems

	GROUP BY  
	  [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (ServiceDepartmentName,ItemName) 
	ORDER BY 1
	--SELECT
	--	fnItems.ServiceDepartmentName 'ServiceDepartment',
	--	SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
	--	SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
	--	SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
	--	SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
	--	SUM(ISNULL(fnItems.ReturnAmount, 0)) 'ReturnAmount',
	--	SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) 'NetSales'
	--FROM (SELECT
	--	*
	--FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
	--WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional') fnItems
	--GROUP BY fnItems.ServiceDepartmentName
	--ORDER BY 1
	--table2: provisional, cancel, credit amounts for summary
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
END
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DepartmentItemSummary]    Script Date: 3/13/2019 1:47:26 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BIL_DepartmentItemSummary]
@ToDate DATETIME = NULL,
@FromDate DATETIME = NULL,
@SrvDeptName NVARCHAR(MAX) = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
2		Ramavtar/30Nov'18		added summary and filtered report data for provisional and cancel
3       Sud/13Mar'19            Changed to function FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional 
                                  from: FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary
----------------------------------------------------------
*/
BEGIN
	SELECT
		fnItems.BillingDate 'Date',
		--COALESCE(fnItems.ReturnDate, fnItems.CancelledDate, fnItems.PaidDate, fnItems.CreditDate, fnItems.ProvisionalDate) 'Date',
		ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
		pat.PatientCode,
		pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
		[dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (fnItems.ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName',
		--fnItems.ServiceDepartmentName,  ---sud:13Mar'19--changed to above
		fnItems.ItemName,
		fnItems.Price,
		fnItems.Quantity,
		fnItems.SubTotal,
		fnItems.DiscountAmount,
		fnItems.TotalAmount,
		fnItems.ReturnTotalAmount 'ReturnAmount',
		fnItems.TotalAmount - fnItems.ReturnTotalAmount 'NetAmount'
	FROM (SELECT
			* FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate)
			 WHERE BillingType !='CreditReceived'
			 ---sud:13Mar'19--changed to above
		     --FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
		     --WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional'

		) fnItems


	JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
    WHERE [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (fnItems.ServiceDepartmentName,ItemName) = @SrvDeptName
	      --WHERE fnItems.ServiceDepartmentName = @SrvDeptName ---sud:13Mar'19--changed to above

	ORDER BY 1 DESC
--table2: provisional, cancel, credit amounts for summary
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
	WHERE ServiceDepartmentName = @SrvDeptName
END
GO
---end: Sud:13Mar'19--BillingReports: DoctorDeptSummary, DoctorDeptItemSummary, DepartmentSummary, DepartmentItemSummary---

--Start: sud:13Mar'19--DoctorName Correction---
/****** Object:  StoredProcedure [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]    Script Date: 3/13/2019 5:23:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_BIL_GetItems_ForIPBillingReceipt] 
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
-------------------------------------------------------------------------------
*/

BEGIN
Select Convert(DATE, itm.CreatedOn) 'BillDate'
	  ,dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, 
	   emp.EmployeeId 'DoctorId',
	  IsNull(emp.Salutation+'. ','')+  emp.FirstName+ ISNULL(' '+emp.MiddleName, '')+' ' + emp.LastName 'DoctorName',
	   itm.Price,  itm.Quantity,  itm.SubTotal,  itm.DiscountAmount,  itm.Tax,  itm.TotalAmount
	  ,itm.ServiceDepartmentId, itm.ItemId
	FROM BIL_TXN_BillingTransactionItems itm
	left join EMP_Employee emp on itm.ProviderId = emp.EmployeeId
	WHERE PatientId=@PatientId 
	  AND ISNULL(itm.BillingTransactionId,0) =  ISNULL(@BillTxnId, ISNULL(itm.BillingTransactionId,0))
	  AND itm.BillStatus= ISNULL(@BillStatus,itm.BillStatus)
END
GO

--This updates ProviderName of all the doctors--earlier there were variable formats, because of which it was giving issues in RequestedByDoctor field of Billing---
Update vis
set vis.ProviderName=IsNull(emp.Salutation+'. ','')+  emp.FirstName+ ISNULL(' '+emp.MiddleName, '')+' ' + emp.LastName
FROM PAT_PatientVisits vis JOIN EMP_Employee emp
on vis.ProviderId=emp.EmployeeId
GO

--This updates ProviderName of all the doctors--earlier there were variable formats with and without space between salutation and name,
--- because of which there were multiple entries of same doctor: eg: 'Dr. Sudarshan Regmi'  and 'Dr.Sudarshan Regmi'---
Alter Table BIL_TXN_BillingTransactionItems DISABLE TRIGGER TRG_BillToAcc_BillingTxnItem
GO
Update bil
set bil.ProviderName = IsNull(emp.Salutation+'. ','')+  emp.FirstName+ ISNULL(' '+emp.MiddleName, '')+' ' + emp.LastName
FROM BIL_TXN_BillingTransactionItems bil JOIN EMP_Employee emp
on bil.ProviderId=emp.EmployeeId
where ISNULL(bil.ProviderId,0) !=0
GO
Alter Table BIL_TXN_BillingTransactionItems ENABLE TRIGGER TRG_BillToAcc_BillingTxnItem
GO

--end: sud:13Mar'19--DoctorName Correction---



---Start: Sud:18Mar'19--Merged from  Pharmacy Incremental--

--START: AJAY : 30 Nov 2018 :- Added ProviderId and VisitType in PHRM_TXN_Invoice
ALTER TABLE PHRM_TXN_Invoice
ADD ProviderId INT
GO
ALTER TABLE PHRM_TXN_Invoice
ADD VisitType VARCHAR(20)
GO
--END: AJAY : 30 Nov 2018 :- Added ProviderId and VisitType in PHRM_TXN_Invoice

--START: Salakha: 27 Dec 2018: Created new table for pharmacy invoice deposit 
DROP TABLE PHRM_Deposit
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PHRM_Deposit](
	[DepositId] [int] IDENTITY(1,1) NOT NULL,
	[FiscalYearId] [int] NULL,
	[ReceiptNo] [int] NULL,
	[PatientVisitId] [int] NULL,
	[PatientId] [int] NOT NULL,
	[DepositType] [varchar](20) NULL,
	[DepositAmount] [float] NOT NULL,
	[DepositBalance] [float] Not null,
	[Remark] [varchar](max) NULL,
	[CounterId] [int] NULL,
	[PrintCount] [int] NULL,
	[PaymentMode] [varchar](50) NULL,
	[PaymentDetails] [varchar](max) NULL,
	[TransactionId] [int] NULL,
	[SettlementId] [int] NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_PHRM_Deposit] PRIMARY KEY CLUSTERED 
(
	[DepositId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE PHRM_TXN_Invoice
ADD DepositDeductAmount decimal(16,4);
go

--END: Salakha : Created new table for pharmacy invoice deposit 

--START: VIKAS : 27 DEC 2018 :- Modify column in PHRM_wruteOffItems Table.
ALTER TABLE PHRM_WriteOffItems ALTER COLUMN GoodReceiptItemId INT  NULL;
GO
--END:VIKAS : 27 DEC 2018 :- Modify column in PHRM_wruteOffItems Table.

--START Ajay: 02Jan 2018: created trigger for add data in PHRM_Stock table on PHRM_StockTxnItems table

 truncate table phrm_stock
 GO
-------------------------------------
ALTER TABLE PHRM_Stock
ADD MRP float
GO

ALTER TABLE PHRM_Stock
ADD BatchNo varchar(max)
GO

ALTER TABLE PHRM_Stock
ADD ExpiryDate datetime
GO

------------------------------------
---inserting data in PHRM_Stock table 
insert into PHRM_Stock (ItemId,BatchNo,ExpiryDate,MRP)
select ItemId,BatchNo,ExpiryDate,MRP from PHRM_StockTxnItems group by ItemId,BatchNo,ExpiryDate,MRP
-----

UPDATE
    PHRM_Stock
SET
    AvailableQuantity=(stockitm.Quantity)
FROM
    PHRM_Stock as stock
    INNER JOIN (select ItemId,BatchNo,ExpiryDate,MRP,sum(Quantity) 'Quantity' from PHRM_StockTxnItems where InOut='in' group by ItemId,BatchNo,ExpiryDate,MRP) AS stockitm
        ON stock.BatchNo=stockitm.BatchNo and stock.ExpiryDate=stockitm.ExpiryDate and stock.ItemId=stockitm.ItemId and stock.MRP=stockitm.MRP
WHERE
    stock.BatchNo=stockitm.BatchNo and stock.ExpiryDate=stockitm.ExpiryDate and stock.ItemId=stockitm.ItemId and stock.MRP=stockitm.MRP


UPDATE
    PHRM_Stock
SET
    AvailableQuantity=stock.AvailableQuantity-(stockitm.Quantity)
FROM
    PHRM_Stock as stock
    INNER JOIN (select ItemId,BatchNo,ExpiryDate,MRP,sum(Quantity) 'Quantity' from PHRM_StockTxnItems where InOut='out' group by ItemId,BatchNo,ExpiryDate,MRP) AS stockitm
        ON stock.BatchNo=stockitm.BatchNo and stock.ExpiryDate=stockitm.ExpiryDate and stock.ItemId=stockitm.ItemId and stock.MRP=stockitm.MRP
WHERE
    stock.BatchNo=stockitm.BatchNo and stock.ExpiryDate=stockitm.ExpiryDate and stock.ItemId=stockitm.ItemId and stock.MRP=stockitm.MRP
	
-------------------------------------

--trigger on PHRM_StockTxnItems
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE TRIGGER [dbo].[TR_PHRM_StockTxnItems_UpdateStock] 
   ON  [dbo].[PHRM_StockTxnItems]
   AFTER INSERT,UPDATE
   /*
FileName: [TR_PHRM_StockTxnItems_UpdateStock]
CreatedBy/date: Ajay/02Jan'18	
Description: maintain pharmacy stock table after insert
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Ajay/02Jan'18					created the script
*/
AS 
BEGIN
	DECLARE @ItemId INT;
	DECLARE @MRP FLOAT;
	DECLARE @BatchNo VARCHAR(MAX);
	DECLARE @ExpiryDate DATETIME;
	DECLARE @StockId INT;
	
	SET @ItemId=(SELECT ItemId FROM inserted)
	SET @BatchNo = (SELECT BatchNo FROM inserted)
	SET @ExpiryDate = (SELECT ExpiryDate FROM inserted)
	SET @MRP = (SELECT MRP FROM inserted)
	--value is inserted in [PHRM_StockTxnItems] table
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted) 
	BEGIN
		SET @StockId=(SELECT TOP 1 StockId FROM PHRM_Stock WHERE ItemId = @ItemId AND BatchNo = @BatchNo AND ExpiryDate = @ExpiryDate AND MRP = @MRP)
		--if inserted values is already present then update available quantity
		IF (@StockId>0)
		BEGIN
			UPDATE PHRM_Stock 
			SET
				AvailableQuantity=
					(SELECT AvailableQuantity FROM PHRM_Stock WHERE StockId=@StockId)
					+(SELECT CASE WHEN InOut='in' THEN Quantity ELSE -Quantity END FROM inserted)
			WHERE StockId=@StockId		--updating AvailableQuantity
		END

		ELSE
		--INSERTING VALUES TO PHRM_Stock TABLE
		BEGIN
			INSERT INTO PHRM_Stock
				(ItemId,AvailableQuantity,MRP,BatchNo,ExpiryDate)
			VALUES
			(
				(SELECT ItemId FROM inserted),		--ItemId
				(SELECT Quantity FROM inserted),	--AvailableQuantity
				(SELECT MRP FROM inserted),			--MRP
				(SELECT BatchNo FROM inserted),		--BatchNo
				(SELECT ExpiryDate FROM inserted)	--ExpiryDate
			)
		END
	END

	--MRP is updated in [PHRM_StockTxnItems] table
	IF EXISTS( SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
		IF(UPDATE(MRP))
		BEGIN
			SET @StockId=(SELECT TOP 1 StockId FROM PHRM_Stock WHERE ItemId = @ItemId AND BatchNo = @BatchNo AND ExpiryDate = @ExpiryDate AND MRP = (SELECT MRP FROM deleted))
			IF (@StockId>0)
			BEGIN
				UPDATE PHRM_Stock 
				SET MRP= (SELECT MRP FROM inserted)
				WHERE StockId=@StockId 		--updating MRP
			END
		END
	END
END
GO

ALTER TABLE [dbo].[PHRM_StockTxnItems] ENABLE TRIGGER [TR_PHRM_StockTxnItems_UpdateStock]
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
1      Vikas/2018-08-06	                     created the script
2.     VIKAS/2019-01-02					     report doesnt shown correctly so changes in script. 
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
							on pat.PatientId=inv.PatientId
								where  convert(date, invr.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 
					group by convert(date,inv.CreateOn), convert(date, invr.CreatedOn),usr.UserName, pat.FirstName,pat.MiddleName,pat.LastName, inv.InvoicePrintId
					order by convert(date,invr.CreatedOn) desc

	End
End
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
--------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT convert(date,stkMng.CreatedOn) as [Date] ,itm.ItemName, stkMng.BatchNo, stkMng.ExpiryDate ,stkMng.Quantity,stkMng.Remark,
			case when stkMng.InOut='in'then 'stock added' else 'stock deducted'
			end as InOut 
					FROM PHRM_StockManage stkMng
            INNER JOIN PHRM_MST_Item itm on itm.ItemId = stkMng.ItemId
            WHERE  convert(datetime, stkMng.CreatedOn)
           BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END		
End
GO
--END: Vikas/2019-01-02 Changes :modify sp for Stock management remark---------------

---End: Sud:18Mar'19--Merged from  Pharmacy Incremental--

---Start: Sud:18Mar'19--Merged from  Ward Supply Incremental--

--START: NageshBB/Salakha: 10 Jan 2019: Ward supply module table creation, module routeconfig, application  and permission add script
--insert script for ward supply module routeconfig, permission and application dd
INSERT INTO RBAC_Application (ApplicationCode,ApplicationName,IsActive,CreatedBy,CreatedOn)
VALUES ('WARD','WardSupply',1,1,GETDATE())
GO
INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('wardsupplymain-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='WARD'),1,GETDATE(),1)
GO
INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Ward Supply','WardSupply','WardSupply',(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='wardsupplymain-view'),'wardsupply.png',1,1,25)
GO


--MST_Ward table 

--SET ANSI_NULLS ON
--GO

--SET QUOTED_IDENTIFIER ON
--GO

--CREATE TABLE [dbo].[MST_Ward](
--	[WardId] [int] IDENTITY(1,1) NOT NULL,
--	[WardCode] [varchar](20) NULL,
--	[WardName] [varchar](100) NOT NULL,	
--	[CreatedBy] [int] NOT NULL,
--	[CreatedOn] [datetime] NOT NULL,
--	[IsActive] [bit] NULL,
-- CONSTRAINT [PK_MST_Ward] PRIMARY KEY CLUSTERED 
--(
--	[WardId] ASC
--)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
--) ON [PRIMARY]
--GO

--Ward Requisition table 
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_Requisition](
	[RequisitionId] [int] IDENTITY(1,1) NOT NULL,
	[WardId] [int] NOT NULL,
	[Status] [varchar](50) NULL,
	[ReferenceId] [varchar](50) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [date] NOT NULL,
 CONSTRAINT [PK_WARD_Requisition] PRIMARY KEY CLUSTERED 
(
	[RequisitionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

--Ward RequisitionItem table

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_RequisitionItems](
	[RequisitionItemId] [int] IDENTITY(1,1) NOT NULL,
	[RequisitionId] [int] NOT NULL,
	[ItemId] [int] NOT NULL,
	[Quantity] [int] NOT NULL,
	[DispatchedQty] [int] NULL,
 CONSTRAINT [PK_WARD_RequisitionItems] PRIMARY KEY CLUSTERED 
(
	[RequisitionItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


--Ward stock table
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_Stock](
	[StockId] [int] IDENTITY(1,1) NOT NULL,
	[WardId] [int] NOT NULL,
	[ItemId] [int] NULL,
	[AvailableQuantity] [int] NULL,
	[MRP] [float] NULL,
	[BatchNo] [varchar](max) NULL,
	[ExpiryDate] [datetime] NULL,
 CONSTRAINT [PK_WARD_Stock] PRIMARY KEY CLUSTERED 
(
	[StockId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

--ward Consumption table

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_Consumption](
	[ConsumptionId] [int] IDENTITY(1,1) NOT NULL,
	WardId [int] NOT NULL,
	[InvoiceId] [int] NULL,
	[InvoiceItemId] [int] NULL,
	[PatientId] [int] NULL,
	[ItemId] [int] NOT NULL,
	[VisitId] [int] null,
	[ItemName] [varchar](200) NULL,
	[BatchNo] [varchar](300) NULL,
	[ExpiryDate] [datetime] NULL,
	[Quantity] [int] NULL,
	[MRP] [decimal](16, 4)NOT NULL,
	[SubTotal] [decimal](16, 4) NULL,
	[Remark] [varchar](100) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	
 CONSTRAINT [PK_WARD_Consumption] PRIMARY KEY CLUSTERED 
(
	[ConsumptionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

--- DISPATCH 
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_Dispatch](
	[DispatchId] [int] IDENTITY(1,1) NOT NULL,	
	[RequisitionId] [int] NULL,	
	[SubTotal] [decimal](16, 4)NOT NULL,
	[Remark] [varchar](100) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_WARD_Dispatch] PRIMARY KEY CLUSTERED 
(
	[DispatchId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Dispatch items
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_DispatchItems](
	[DispatchItemId] [int] IDENTITY(1,1) NOT NULL,
	[DispatchId] [int] NULL,	
	[RequisitionItemId] [int] NULL,	
	[ItemId] [int]NULL,
	[ItemName] [varchar](200) NULL,
	[BatchNo] [varchar](300) NULL,
	[ExpiryDate] [datetime] NULL,
	[Quantity] [int]NOT NULL,
	[MRP] [decimal](16, 4)NOT NULL,
	[SubTotal] [decimal](16, 4) NULL,
	[Remark] [varchar](100) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,		
 CONSTRAINT [PK_WARD_DispatchItems] PRIMARY KEY CLUSTERED 
(
	[DispatchItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
--END: NageshBB/Salakha: 10 Jan 2019: Ward supply module table creation, module routeconfig, application  and permission add script


--START:Salakha: 11 Jan 2019: Added permission and routeconfig of Ward Requisition for pharmacy
INSERT INTO [dbo].[RBAC_Permission] ([PermissionName]   ,[ApplicationId]   ,[CreatedBy]    ,[CreatedOn]  ,[IsActive])
VALUES ('pharmacy-ward-requisition-view',17,1,GETDATE(),1)
GO

INSERT INTO [dbo].[RBAC_RouteConfig] ([DisplayName]  ,[UrlFullPath] ,[RouterLink]
           ,[PermissionId] ,[ParentRouteId] ,[DefaultShow] ,[DisplaySeq]  ,[IsActive])  
		   VALUES('Ward Requisition','Pharmacy/WardRequisition', 'WardRequisition',230,152,1,10 ,1)
		   GO

--END: Salakha: 11 Jan 2019:  Added permission and routeconfig of Ward Requisition for pharmacy


--START: Sanjit : 22 Feb 2019 : Added Transaction Table for Ward to Ward Stock Transfer
CREATE TABLE WARD_Transaction(
TransactionId INT IDENTITY(1,1) PRIMARY KEY,
WardId INT not null,
ItemId INT not null,
StockId INT FOREIGN KEY REFERENCES WARD_Stock(StockId) ,
Quantity INT not null,
TransactionType VARCHAR(255) not null,
CreatedBy VARCHAR(255) not null,
CreatedOn DATE not null,
Remarks VARCHAR(255) not null,
IsWard BIT not null
)
GO
--END: Sanjit : 22 Feb 2019 : Added Transaction Table for Ward to Ward Stock Transfer
---End: Sud:18Mar'19--Merged from  Ward Supply Incremental--


--Start: ANish: 18 March 2019, Duty doctor for emergency Added--
declare @deptId int;
set @deptId = (select DepartmentId from MST_Department where DepartmentName='EMERGENCY/CASUALTY')

--Insert Er. Duty Doctor if not there in Employee Table--
IF NOT EXISTS (Select * from EMP_Employee where FirstName='Duty' and LastName='Doctor' AND DepartmentId=@deptId)
BEGIN
INSERT INTO [dbo].[EMP_Employee]
           (Salutation,[FirstName],[LastName],[DepartmentId],[LongSignature],[CreatedBy],[CreatedOn],[IsActive],[IsAppointmentApplicable])
 VALUES ('Dr.','Duty','Doctor',@deptId,'Duty Doctor',1,GETDATE(),1,1)
END

GO
--End: ANish: 18 March 2019--

---start: Yubraj: 11th Jan'19--Adding Column----sud:18Mar: this script was pending earlier.. 
ALTER TABLE BIL_TXN_Deposit
	ADD CareOf varchar(100) null
	go
---end: Yubraj: 11th Jan'19--Adding Column--


---Labelled upto here for: Version Build_DEV_V1.14.0_WardSupply, Hemodialysis, OpBilPriceCategory++--- 17Mar'19
---Above scritps: WardSupply and Pharmacy incremental are already sent as V1.14.0 but were not merged in this incremental.. so..




---start: sud:17Mar'19--Merged from R2V1_EMERGENCYMgmt Feature branch---
Insert Into [dbo].[RBAC_Application] (ApplicationCode,ApplicationName,IsActive,CreatedBy,CreatedOn)
values ('ER','Emergency',1,1,GETDATE());
Go

declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Emergency' and ApplicationCode='ER');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('emergency-view',@ApplicationID,1,GETDATE(),1);
Go


declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Emergency' and ApplicationCode='ER');
declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='emergency-view' and ApplicationId=@ApplicationID);

Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,Css,DefaultShow,DisplaySeq,IsActive)
Values('Emergency','Emergency','Emergency',@permissionID,'emergency.png',1,10,1);
Go

Declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [dbo].[RBAC_Application] where ApplicationName='Emergency' and ApplicationCode='ER');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('emergency-dashboard-view',@ApplicationID,1,GETDATE(),1);
Go 

Declare @PermissionID INT
SET @PermissionID = (Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='emergency-dashboard-view');

Declare @EmergencyParentRouteID INT
SET @EmergencyParentRouteID = (Select Top(1) RouteId from [dbo].[RBAC_RouteConfig] where RouterLink = 'Emergency');

Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,DisplaySeq,IsActive)
Values('','Emergency/Dashboard','Dashboard',@PermissionID,@EmergencyParentRouteID,'fa fa-home',1,1,1);
Go

Create table ER_Patient (
	ERPatientId INT IDENTITY(1, 1)  Constraint PK_ER_Patients Primary Key NOT NULL,
	ERPatientNumber INT  Not Null ,
	PatientId INT,
	PatientVisitId INT,
	ERDischargeSummaryId INT,
	VisitDateTime DATETIME Not Null,
	FirstName varchar(40) Not Null,
	MiddleName varchar(40),
	LastName varchar(40) Not Null,
	Gender varchar(10) Not Null,
	Age varchar(10),
	DateOfBirth DATETIME,
	ContactNo varchar(20),
	ProviderId INT,
	ProviderName varchar(200),
	[Address] varchar(100),
	[Case] varchar(100),
	ConditionOnArrival	varchar(100),
	ModeOfArrival varchar(100),
	CareOfPerson varchar(100),
	ReferredBy varchar(100),
	ReferredTo varchar(100),
	ERStatus varchar(20),
	TriageCode varchar(50),
	TriagedBy INT,
	TriagedOn DATETIME,
	CreatedBy INT,
	CreatedOn DATETIME,
	ModifiedBy INT,
	ModifiedOn DATETIME,
	IsActive bit,
	IsExistingPatient bit, 
	FinalizedStatus varchar(20),
	FinalizedRemarks varchar(4000),
	FinalizedBy INT,
	FinalizedOn DATETIME,
	IsPoliceCase bit,
	OldPatientId varchar(50)	 
);
GO

ALTER TABLE [dbo].[ER_Patient] WITH CHECK ADD CONSTRAINT [FK_ER_PATIENT_PAT_PATIENT] FOREIGN KEY([PatientId])
REFERENCES [dbo].[PAT_Patient] ([PatientId])
GO

ALTER TABLE [dbo].[ER_Patient] WITH CHECK ADD CONSTRAINT [FK_ER_PATIENTVISIT_PAT_PATIENTVISIT] FOREIGN KEY([PatientVisitId])
REFERENCES [dbo].[PAT_PatientVisits] ([PatientVisitId])
GO

Insert into BIL_CFG_Counter(CounterName, CounterType, CreatedOn, CreatedBy)
Values('ER Counter','EMERGENCY',getdate(),1)
GO

Alter Table [dbo].[PHRM_Requisition]
Alter Column [CreatedOn] DateTime NOT NULL
GO


/****** Object:  Trigger [dbo].[LAB_TestRequisition_NotificationTrigger]    Script Date: 3/1/2019 12:23:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE TRIGGER [dbo].[Emergency_PoliceCase_NotificationTrigger]
       ON [dbo].[ER_Patient]
   AFTER INSERT, Update
AS 
BEGIN
	SET NOCOUNT ON;
	DECLARE @PatientName varchar(150), @providerName varchar(50), @norificationModuleName varchar(50),
            @notificationTitle varchar(100) ,@notificationDetails varchar(200), @recipientId int,
            @parentTableName varchar(50), @notificationParentId int, @IsRead bit, @ReadBy int, 
			@RoleId INT, @TestReqId int, @recipientType varchar(50), 
			@subModuleName varchar(50), @CreatedOn datetime, @IsArchived bit, 
			@isPoliceCaseFromDeleted bit, @isPoliceCaseFromInserted bit;

	    set @RoleId= ( select top 1 roleid from RBAC_Role where RoleName = 'BillingAdmin');

	    --set @TestReqId = (Select top 1 [] from Inserted );
        
		select @norificationModuleName = 'Emergency';
		select @notificationTitle = 'Police Case';
	    select @PatientName= pat.FirstName+ ' ' +pat.LastName from inserted i inner join PAT_Patient pat on pat.PatientId = i.PatientId;
		select @notificationDetails =  @PatientName;
		select @recipientId = @RoleId
		select @parentTableName = 'ER_Patient';
		select @notificationParentId = (Select top 1 [ERPatientId] from inserted);
		select @IsRead = 0;
		select @ReadBy ='';
		select @CreatedOn = GetDate();
		select @IsArchived = 0;
		select @recipientType = 'rbac-role';
		select @subModuleName = 'Emergency';

		select @isPoliceCaseFromInserted = (Select top 1 ISNULL([IsPoliceCase],0) from inserted);

		IF EXISTS(SELECT * FROM deleted) AND EXISTS(SELECT * FROM inserted)
			BEGIN
			select @isPoliceCaseFromDeleted = (Select top 1 ISNULL([IsPoliceCase],0) from deleted);			

			IF ((@isPoliceCaseFromDeleted != @isPoliceCaseFromInserted) OR @isPoliceCaseFromDeleted = 0) AND @isPoliceCaseFromInserted = 1
				BEGIN
					INSERT INTO [CORE_Notification]([Notification_ModuleName],[Notification_Title],[Notification_Details],
					[RecipientId],[ParentTableName],[NotificationParentId],[IsRead],[ReadBy],[CreatedOn],[IsArchived],
					[RecipientType] ,[Sub_ModuleName])
						values (@norificationModuleName,@notificationTitle,@notificationDetails,@recipientId ,@parentTableName,
						@notificationParentId,@IsRead,@ReadBy,@CreatedOn,@IsArchived,@recipientType,@subModuleName)
				END
			END

		ELSE IF NOT EXISTS(SELECT * FROM deleted) AND EXISTS(SELECT * FROM inserted)
			BEGIN
			IF(@isPoliceCaseFromInserted = 1)
				BEGIN
					INSERT INTO [CORE_Notification]([Notification_ModuleName],[Notification_Title],[Notification_Details],
					[RecipientId],[ParentTableName],[NotificationParentId],[IsRead],[ReadBy],[CreatedOn],[IsArchived],
					[RecipientType] ,[Sub_ModuleName])
						values (@norificationModuleName,@notificationTitle,@notificationDetails,@recipientId ,@parentTableName,
						@notificationParentId,@IsRead,@ReadBy,@CreatedOn,@IsArchived,@recipientType,@subModuleName)
				END
				
			END
END
GO

ALTER TABLE [dbo].[ER_Patient] ENABLE TRIGGER [Emergency_PoliceCase_NotificationTrigger]
GO


--Stored Procedure for Number of Patient at different stages for a day in Emergency--
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_DSB_Emergency_DashboardStatistics]
AS
/*
=============================================================================================
FileName: [SP_DSB_Emergency_DashboardStatistics]
CreatedBy/date: ramavtar/2019-03-03
=============================================================================================
*/
BEGIN

--Table1
	SELECT * FROM 
		(SELECT count(*) 'TotalRegisteredPatients' FROM ER_Patient WHERE CONVERT(DATE,CreatedOn) = CONVERT(DATE,GETDATE())) TotalRegistered,
		(SELECT count(*) 'TotalTriagedPatients' FROM ER_Patient WHERE CONVERT(DATE,TriagedOn) = CONVERT(DATE,GETDATE())) TotalTriaged,
		(SELECT count(*) 'MildPatients' FROM ER_Patient WHERE CONVERT(DATE,TriagedOn) = CONVERT(DATE,GETDATE()) AND TriageCode = 'mild') Mild,
		(SELECT count(*) 'ModeratePatients' FROM ER_Patient WHERE CONVERT(DATE,TriagedOn) = CONVERT(DATE,GETDATE()) AND TriageCode = 'moderate') Moderate,
		(SELECT count(*) 'CriticalPatients' FROM ER_Patient WHERE CONVERT(DATE,TriagedOn) = CONVERT(DATE,GETDATE()) AND TriageCode = 'critical') Critical,
		(SELECT count(*) 'TotalFinalizedPatients' FROM ER_Patient WHERE CONVERT(DATE, FinalizedOn) = CONVERT(DATE,GETDATE())) TotalFinalized,
		(SELECT count(*) 'LAMAPatients' FROM ER_Patient WHERE CONVERT(DATE, FinalizedOn) = CONVERT(DATE,GETDATE()) AND FinalizedStatus='lama') LAMA,
		(SELECT count(*) 'AdmittedPatients' FROM ER_Patient WHERE CONVERT(DATE, FinalizedOn) = CONVERT(DATE,GETDATE()) AND FinalizedStatus='admitted') Admitted,
		(SELECT count(*) 'DischargedPatients' FROM ER_Patient WHERE CONVERT(DATE, FinalizedOn) = CONVERT(DATE,GETDATE()) AND FinalizedStatus='discharged') Discharged,
		(SELECT count(*) 'TransferredPatients' FROM ER_Patient WHERE CONVERT(DATE, FinalizedOn) = CONVERT(DATE,GETDATE()) AND FinalizedStatus='transferred') Transferred,
		(SELECT count(*) 'DeathPatients' FROM ER_Patient WHERE CONVERT(DATE, FinalizedOn) = CONVERT(DATE,GETDATE()) AND FinalizedStatus='death') Death
END
GO

Alter table CORE_CFG_Parameters
Add ParameterType varchar(30); 
Go

Update CORE_CFG_Parameters
set ParameterType='custom';
Go

Update [dbo].[CORE_CFG_Parameters]
set ParameterType = 'system' where ParameterGroupName='Accounting'and ParameterName='SectionList'; 
Go
Update [dbo].[CORE_CFG_Parameters]
set ParameterType = 'system' where ParameterGroupName='Adt'and ParameterName='AutoAddBillingItems';
Go
Update [dbo].[CORE_CFG_Parameters]
set ParameterType = 'system' where ParameterGroupName='Lab'and ParameterName='DefaultSignatoriesEmpId';
Go
Update [dbo].[CORE_CFG_Parameters]
set ParameterType = 'system' where ParameterGroupName='Lab'and ParameterName='DefaultHistoCytoSignatoriesEmpId';
Go

Create table ER_DischargeSummary(
	ERDischargeSummaryId INT IDENTITY(1, 1)  Constraint PK_ER_DischargeSummary Primary Key NOT NULL,
	PatientId INT,
	PatientVisitId INT,
	DischargeType varchar(30),
	ChiefComplaints varchar(max),
	TreatmentInER varchar(max),
	Investigations varchar(800),
	AdviceOnDischarge varchar(max),
	OnExamination varchar(max),
	ProvisionalDiagnosis varchar(800),
	DoctorName varchar(100),
	MedicalOfficer varchar(100),
	CreatedBy INT,
	CreatedOn DATETIME,
	ModifiedBy INT,
	ModifiedOn DATETIME,
);
Go

---end: sud:17Mar'19--Merged from R2V1_EMERGENCYMgmt Feature branch---


---start: sud/mahesh: 18mar'19--Merged from R2V1_Feature_Fraction branch for Billing Fraction module---
-- Start 2018/02/07 Mahesh: Added tables for fraction module --

CREATE TABLE [dbo].[FRC_Designation](
  [DesignationId] [int] IDENTITY(1,1) NOT NULL,
  [DesignationName] [varchar](50) NOT NULL,
  [CreatedOn] [datetime] NOT NULL,
  [CreatedBy] [int] NULL,
  [Description] [text] NULL,
PRIMARY KEY CLUSTERED 
(
  [DesignationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO


CREATE TABLE [dbo].[FRC_PercentSetting](
  [PercentSettingId] [int] IDENTITY(1,1) NOT NULL,
  [BillItemPriceId] [int] NOT NULL,
  [HospitalPercent] [decimal](18, 0) NULL,
  [DoctorPercent] [decimal](18, 0) NULL,
  [Description] [text] NULL,
  [CreatedOn] [datetime] NOT NULL,
  [CreatedBy] [int] NULL,
PRIMARY KEY CLUSTERED 
(
  [PercentSettingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[FRC_PercentSetting]  WITH CHECK ADD FOREIGN KEY([BillItemPriceId])
REFERENCES [dbo].[BIL_CFG_BillItemPrice] ([BillItemPriceId])
GO

CREATE TABLE [dbo].[FRC_FractionCalculation](
  [FractionCalculationId] [int] IDENTITY(1,1) NOT NULL,
  [PercentSettingId] [int] NOT NULL,
  [BillTxnItemId] [int] NOT NULL,
  [DoctorId] [int] NOT NULL,
  [IsParentId] [int] NULL,
  [DesignationId] [int] NOT NULL,
  [InitialPercent] [decimal](18, 0) NULL,
  [FinalPercent] [decimal](18, 0) NULL,
  [CreatedOn] [datetime] NOT NULL,
  [CreatedBy] [varchar](100) NULL,
  [IsActive] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
  [FractionCalculationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[FRC_FractionCalculation] ADD  DEFAULT ((0)) FOR [IsActive]
GO

ALTER TABLE [dbo].[FRC_FractionCalculation]  WITH CHECK ADD FOREIGN KEY([BillTxnItemId])
REFERENCES [dbo].[BIL_TXN_BillingTransactionItems] ([BillingTransactionItemId])
GO

ALTER TABLE [dbo].[FRC_FractionCalculation]  WITH CHECK ADD FOREIGN KEY([DesignationId])
REFERENCES [dbo].[FRC_Designation] ([DesignationId])
GO

ALTER TABLE [dbo].[FRC_FractionCalculation]  WITH CHECK ADD FOREIGN KEY([DoctorId])
REFERENCES [dbo].[EMP_Employee] ([EmployeeId])
GO

ALTER TABLE [dbo].[FRC_FractionCalculation]  WITH CHECK ADD FOREIGN KEY([PercentSettingId])
REFERENCES [dbo].[FRC_PercentSetting] ([PercentSettingId])
GO

INSERT INTO RBAC_Application (ApplicationCode,ApplicationName,IsActive,CreatedBy,CreatedOn)
VALUES ('Fraction','Fraction',1,1,GETDATE())
GO
INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('fractionmain-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='WARD'),1,GETDATE(),1)
GO

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Fraction','Fraction','Fraction',(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='fractionmain-view'),'fraction.png',1,1,26)
GO

alter table BIL_CFG_BillItemPrice add isFractionApplicable bit not null default 0; 

alter table FRC_FractionCalculation add FinalAmount decimal(10,2);

alter table FRC_FractionCalculation add Hierarchy int;

-- End 2018/02/07 Mahesh: Added tables for fraction module --

GO
-- Mahesh 2018/03/07 Store procedure start ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_FRC_GetFractionApplicableList]
AS
BEGIN
  select 
  per.PercentSettingId,a.BillingTransactionItemId as BillTransactionItemId,b.ItemName, b.BillItemPriceId, a.TotalAmount, a.BillingType, (pat.FirstName + ' ' + pat.LastName) as FullName,
  a.ServiceDepartmentName,  c.BillTxnItemId from BIL_TXN_BillingTransactionItems a
  join BIL_CFG_BillItemPrice b on a.ItemId = b.ItemId 
    join PAT_Patient pat on a.PatientId = pat.PatientId
  left join FRC_FractionCalculation c on a.BillingTransactionItemId = c.BillTxnItemId
  left join FRC_PercentSetting per on per.BillItemPriceId = b.BillItemPriceId
where a.ServiceDepartmentId = b.ServiceDepartmentId and b.isFractionApplicable = 1 and per.PercentSettingId IS NOT NULL
group by a.BillingTransactionItemId, a.BillingTransactionItemId,b.ItemId, 
  c.BillTxnItemId, b.ItemId ,  b.BillItemPriceId, per.PercentSettingId,
  c.BillTxnItemId, b.ItemName ,
  a.ServiceDepartmentName, a.TotalAmount ,
  a.BillingType, FirstName, LastName
order by a.BillingTransactionItemId
END
GO

-- Mahesh 2018/03/07 Store procedure start ---

---end: sud/mahesh: 18mar'19--Merged from R2V1_Feature_Fraction branch for Billing Fraction module---

--start: sanjit:26th Mar'19 --added a column in ward_transaction--
ALTER TABLE WARD_Transaction
ADD newWardId INT
GO
--end: sanjit:26th Mar'19 --added a column in ward_transaction--

--Start: Shankar:27th Mar'19, Added columns in PHRM_GoodsReceipt and Added a table named PHRM_StoreStock----
Alter Table PHRM_GoodsReceipt
ADD
[StoreId] [int] NULL,
[TransactionType] [varchar](30) NULL;
Go

CREATE TABLE [dbo].[PHRM_StoreStock](
	[StoreStockId] [int] IDENTITY(1,1) NOT NULL,
	[ItemId] [int] NULL,
	[BatchNo] [varchar](100) NULL,
	[ExpiryDate] [datetime] NULL,
	[Quantity] [float] NULL,
	[FreeQuantity] [float] NULL,
	[Price] [decimal](18, 4) NULL,
	[DiscountPercentage] [float] NULL,
	[VATPercentage] [float] NULL,
	[SubTotal] [decimal](18, 4) NULL,
	[TotalAmount] [decimal](18, 4) NULL,
	[InOut] [varchar](20) NULL,
	[ReferenceNo] [int] NULL,
	[ReferenceItemCreatedOn] [datetime] NULL,
	[TransactionType] [varchar](30) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NOT NULL,
	[MRP] [decimal](18, 4) NULL,
	[GoodsReceiptItemId] [int] NULL,
	[CCCharge] [float] NULL
) ON [PRIMARY]
GO
--End: Shankar:27th Mar'19, Added columns in PHRM_GoodsReceipt and Added a table named PHRM_StoreStock--

--Start: Shankar: 29th Mar'19, Added a column in PHRM_TXN_Invoice for Payment Mode---
Alter Table PHRM_TXN_Invoice
Add PaymentMode varchar(50)
GO
--End: Shankar: 29th Mar'19, Added a column in PHRM_TXN_Invoice for Payment Mode---

--Start: Rusha: 29th Mar'19, Added a Reports in Ward Supply Module---

--Ward Supply: Stock Report
/****** Object:  StoredProcedure [dbo].[SP_WardReport_StockReport]    Script Date: 03/29/2019 4:48:45 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_WardReport_StockReport]  
	    @ItemId int = null		
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
----------------------------------------------------------------------------
*/

BEGIN
  IF (@ItemId !=0)
		BEGIN
			select adt.WardName,itm.ItemName,ward.BatchNo,sum(AvailableQuantity) as Quantity,ward.ExpiryDate, MRP from WARD_Stock as ward 
			join PHRM_MST_Item as itm on ward.ItemId= itm.ItemId 
			join ADT_MST_Ward as adt on ward.WardId= adt.WardID   
			where itm.ItemId =@ItemId
			group by ItemName, MRP , adt.WardName, ward.BatchNo, ward.ExpiryDate
		END	
		else if (@ItemId =0)	
		begin 
		select adt.WardName,itm.ItemName,ward.BatchNo,sum(AvailableQuantity) as Quantity,ward.ExpiryDate, MRP from WARD_Stock as ward 
			join PHRM_MST_Item as itm on ward.ItemId= itm.ItemId 
			join ADT_MST_Ward as adt on ward.WardId= adt.WardID   
			--where itm.ItemId  like '%'+isnull (@ItemId,'')+'%'
			group by ItemName, MRP , adt.WardName, ward.BatchNo, ward.ExpiryDate
		end
End
GO
--Ward Supply: Requisition and Dispatch report
/****** Object:  StoredProcedure [dbo].[SP_WardReport_RequisitionReport]    Script Date: 03/29/2019 4:52:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_WardReport_RequisitionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null
AS
/*
FileName: [SP_WardReport_RequisitionReport]
CreatedBy/date: Rusha/03-26-2019
Description: To get the Requsition and Dispatch Details of Stock such as WardName, ItemName, BatchNo, RequestedQty, MRP of Each Item Selected By User 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-26-2019					   get stock details of requisition and dispatch of item from different ward
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			select convert(date,req.CreatedOn) as RequestedDate,convert(date,dispitm.CreatedOn) as DispatchDate,adt.WardName, itm.ItemName,sum(reqitm.Quantity) as RequestedQty,sum(dispitm.Quantity) as DispatchQty,dispitm.MRP, ROUND(sum(dispitm.Quantity)*dispitm.MRP, 2, 0) as TotalAmt
			from WARD_Requisition as req
			join ADT_MST_Ward as adt on req.WardId=adt.WardID
			join WARD_RequisitionItems as reqitm on req.RequisitionId= reqitm.RequisitionId
			join PHRM_MST_Item as itm on reqitm.ItemId= itm.ItemId
			join WARD_DispatchItems as dispitm on reqitm.RequisitionItemId=dispitm.RequisitionItemId
			where CONVERT(date, req.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by convert(date,req.CreatedOn),convert(date,dispitm.CreatedOn), adt.WardName,reqitm.Quantity,itm.ItemName, dispitm.MRP, dispitm.Quantity
		END		
End
GO
----Ward Supply: Consumption report
--/****** Object:  StoredProcedure [dbo].[SP_WardReport_ConsumptionReport]    Script Date: 03/29/2019 4:53:36 PM ******/
--SET ANSI_NULLS ON
--GO
--SET QUOTED_IDENTIFIER ON
--GO

--ALTER PROCEDURE [dbo].[SP_WardReport_ConsumptionReport]  
--	@FromDate datetime=null,
--	@ToDate datetime=null
--AS
--/*
--FileName: [SP_WardReport_ConsumptionReport]
--CreatedBy/date: Rusha/03-26-2019
--Description: To get the Consumption Details of Items From different Ward 
--Remarks:    
--Change History
------------------------------------------------------------------------------
--S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------
--1.		Rusha/03-29-2019					   add stock details of consumed item from different ward
------------------------------------------------------------------------------
--*/

--BEGIN
--  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
--		BEGIN
--			select CONVERT(date,consum.CreatedOn) as [Date], adt.WardName,consum.ItemName, gene.GenericName, consum.Quantity as Quantity from WARD_Consumption as consum 
--			join ADT_MST_Ward as adt on consum.WardId=adt.WardID
--			join PHRM_MST_Item as itm on consum.ItemId=itm.GenericId
--			join PHRM_MST_Generic as gene on  itm.GenericId=gene.GenericId
--			where CONVERT(date, consum.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
--			group by CONVERT(date,consum.CreatedOn),adt.WardName,consum.ItemName,consum.Quantity, gene.GenericName
--		END		
--End
--GO

--Ward Supply: Breakage report
/****** Object:  StoredProcedure [dbo].[SP_WardReport_BreakageReport]    Script Date: 03/29/2019 4:54:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_WardReport_BreakageReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null		
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
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			select convert(date,transc.CreatedOn) as [Date], adt.WardName, ItemName, transc.Quantity,stk.MRP,Round(stk.MRP*transc.Quantity,2,0) as TotalAmt,transc.Remarks from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			join WARD_Stock as stk on transc.StockId=stk.StockId and transc.ItemId = stk.ItemId 
			where TransactionType = 'BreakageItem' and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by convert(date,transc.CreatedOn), itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName,stk.MRP,transc.Quantity
		END	
End
GO

--Ward Supply: Transfer report [Ward to Ward Transfer and Ward to Pharmacy Transfer]
/****** Object:  StoredProcedure [dbo].[SP_WardReport_TransferReport]    Script Date: 03/29/2019 4:56:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_WardReport_TransferReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null,
	@Status int = 0					--Ward to Ward report is shown in case of 1 and Ward to Pharmacy report in case of 0	
AS
/*
FileName: [SP_WardReport_TransferReport]
CreatedBy/date: Rusha/03-26-2019
Description: To get the Details of report of Ward to Ward Tranfer and Ward to Pharmacy Trannsfer of stock 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/03-29-2019						shows report of Ward to ward transfer and ward to pharmacy transfer
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
		if (@Status = 1)
			select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,adt.WardName as FromWard,adt2.WardName as ToWard, Remarks from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			join ADT_MST_Ward as adt2 on transc.newWardId=adt2.WardID
			where TransactionType = 'WardtoWard' and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName,adt2.WardName, convert(date,transc.CreatedOn)
		
		else if (@Status =0)
			(select convert(date,transc.CreatedOn) as [Date],ItemName, transc.Quantity as TransferQty,adt.WardName as FromWard,transc.Remarks from WARD_Transaction as transc
			join PHRM_MST_Item as itm on transc.ItemId=itm.ItemId
			join ADT_MST_Ward as adt on transc.WardId=adt.WardID
			where TransactionType = 'WardToPharmacy' and CONVERT(date, transc.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by itm.ItemName, transc.Quantity,transc.Remarks, adt.WardName, convert(date,transc.CreatedOn)
			)
		END	
End
GO
--End: Rusha: 29th Mar'19, Added a Reports in Ward Supply Module---

--start:Sanjit 2019/03/31 --Added Nephrology Tab in Nursing Module --
BEGIN
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values('nursing-nephrology-view','16','1',GETDATE(),'true');

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,ParentRouteId,DefaultShow,IsActive)
values ('Nephrology','Nursing/Nephrology','Nephrology','147','1','1');

update RBAC_RouteConfig
set PermissionId = (select PermissionId from RBAC_Permission as perm where perm.PermissionName = 'nursing-nephrology-view')
where DisplayName = 'Nephrology' and UrlFullPath = 'Nursing/Nephrology';
END
GO
--end:Sanjit 2019/03/31 --Added Nephrology Tab in Nursing Module --
--Start:Shankar 31st Mar'19, Added a column in PHRM_GoodsReceipt and PHRM_MST_Supplier table--
update PHRM_GoodsReceipt
set StoreId=1
GO

Alter Table PHRM_GoodsReceipt
Add CreditPeriod int
Go

Alter Table PHRM_MST_Supplier
Add CreditPeriod int
Go
--End:Shankar 31st Mar'19, Added a column in PHRM_GoodsReceipt and PHRM_MST_Supplier table--

--START Yubraj 1st April 2019 -- Spelling Correction in MST_Reactions Table
update MST_Reactions set ReactionName='ANXIETY' where ReactionName='ANEXIETY'
GO
--END Yubraj 1st April 2019 -- Spelling Correction in MST_Reactions Table

--Start Ajay 01 April 19 added CommonURLFullPath for all users
--#32bug resolved ==="UNAUTHORIZED ACCESS" screen while viewing user profile.
INSERT INTO [dbo].[CORE_CFG_Parameters]
           ([ParameterGroupName]
           ,[ParameterName]
           ,[ParameterValue]
           ,[ValueDataType]
           ,[Description]
           ,[ParameterType])
     VALUES
		('Security',
		 'CommonURLFullPath',
		 '{"URLFullPathList":[{"URLFullPath":"Employee/ProfileMain/UserProfile"},{"URLFullPath":"Employee/ProfileMain/ChangeProfile"},{"URLFullPath":"Employee/ProfileMain/ChangePassword"}]}',
		 'JSON',
		 'Common Url List for all users',
		 'custom')
GO
--End Ajay 01Apr'19 added CommonURLFullPath for all users

--Start: Rusha:  1st April'19, Changes in Pharmacy Reports---

/****** Object:  StoredProcedure [dbo].[SP_PHRM_BreakageItemReport]    Script Date: 04/01/2019 4:59:15 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRM_BreakageItemReport] 
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
2	   Rusha/2019-03-31				  add writeoff quantity 
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
		select convert(date,wi.CreatedOn) as [Date], usr.UserName, i.ItemName,ItemPrice as MRP,WriteOffQuantity as BreakageQty,Round(sum(wi.TotalAmount),2,0) as [TotalAmount] from PHRM_WriteOffItems wi	
			  join RBAC_User usr
				  on wi.CreatedBy=usr.EmployeeId
			  join PHRM_MST_Item i
				  on i.ItemId=wi.ItemId
		      where CONVERT(date, wi.CreatedOn) Between @FromDate AND @ToDate
        group by convert(date, wi.CreatedOn), usr.UserName,i.ItemName, ItemPrice, WriteOffQuantity
	   End
End
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_StockManageDetailReport]    Script Date: 04/01/2019 5:00:12 PM ******/
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
           BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END		
End
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_MinStockReport]    Script Date: 04/01/2019 5:00:51 PM ******/
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
		Vikas/28Aug'18						created the script
		Rusha/04-01-2019					sum up quantity
----------------------------------------------------------------------------
*/
Begin 
IF (@ItemName IS NOT NULL)
	BEGIN
		select itm.ItemId ,itm.ItemName,sum(stk.Quantity) as Quantity,convert(date,stk.ExpiryDate)as ExpiryDate,stk.BatchNo 
		from PHRM_MST_Item itm
			join PHRM_StockTxnItems stk
			on stk.ItemId=itm.ItemId
			where (((@ItemName=itm.ItemName OR @ItemName='') or itm.ItemName like '%'+ISNULL(@ItemName,'')+'%' ) 
					 AND stk.Quantity<10) 
		group by itm.ItemId ,itm.ItemName,stk.Quantity,convert(date,stk.ExpiryDate),stk.BatchNo
	END
END
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_ABC/VEDStockReport]    Script Date: 04/01/2019 5:01:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRMReport_ABC/VEDStockReport]  
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
----------------------------------------------------------------------------
*/
Begin 
IF (@Status IS NOT NULL)
	BEGIN
		select itm.ItemName,gen.GenericName,itm.ABCCategory as ABC,itm.VED,itm.MinStockQuantity as Quantity
		from [dbo].[PHRM_MST_Item] as itm
		join PHRM_MST_Generic as gen on itm.GenericId = gen.GenericId
			where ((@Status=itm.ABCCategory OR @Status=itm.VED OR @Status='') or itm.ABCCategory like '%'+ISNULL(@Status,'')+'%' ) 
					 
		group by itm.ItemName,itm.ABCCategory, itm.VED,itm.MinStockQuantity,gen.GenericName
	END
END
GO
--End: Rusha:  1st April'19, Changes in Pharmacy Reports---

--Start: Rusha:  2nd April'19, Changes in Pharmacy Reports---
--Update SQL query

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_ABC/VEDStockReport]   Script Date: 04/02/2019 11:34:10 AM ******/
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
----------------------------------------------------------------------------
*/
Begin 
IF (@Status IS NOT NULL)
	BEGIN
		select itm.ItemName,gen.GenericName,itm.ABCCategory as ABC,itm.VED,itm.MinStockQuantity as Quantity
		from [dbo].[PHRM_MST_Item] as itm
		join PHRM_MST_Generic as gen on itm.GenericId = gen.GenericId
		where ((@Status=itm.ABCCategory OR @Status=itm.VED OR @Status='') or itm.ABCCategory like '%'+ISNULL(@Status,'')+'%' 
		or itm.VED like '%'+ISNULL(@Status,'')+'%' )
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
--End: Rusha:  2nd April'19, Changes in Pharmacy Reports---

--START Yubraj 2nd April 2019 -- Manually inserting values in INV_MST_ItemCategory table
INSERT INTO INV_MST_ItemCategory VALUES ('Consumables','2019-04-02 12:03:03.587','1',1,'consumables');
INSERT INTO INV_MST_ItemCategory VALUES ('Capital Goods','2019-04-02 12:03:03.587','1',1,'goods');
--END Yubraj 2nd April 2019 -- Manually inserting values in INV_MST_ItemCategory table

--Start: Rusha:  3rd April'19, Pharmacy Report and Ward supply---
--Wardsupply Collapse Button

declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='WardSupply');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values('requisition-view',@AppnID_Settings,'true','1', GETDATE()),
 ('stock-view',@AppnID_Settings,'true','1', GETDATE()),
 ('consumptionlist-view',@AppnID_Settings,'true','1', GETDATE()),
 ('pharmacytransfer-view',@AppnID_Settings,'true','1', GETDATE()),
('reports-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'WardSupply');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'requisition-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Requisition','WardSupply/Requisition',@OwnPerId,@ParentId,'Requisition',1,1,1);

SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'stock-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Stock','WardSupply/Stock',@OwnPerId,@ParentId,'Stock',1,1,1);

SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'consumptionlist-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Consumption','WardSupply/Consumption',@OwnPerId,@ParentId,'Consumption',1,1,1);

SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'pharmacytransfer-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Pharmacy Transfer','WardSupply/Pharmacy Transfer',@OwnPerId,@ParentId,'Pharmacy Transfer',1,1,1);

SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'reports-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Reports','WardSupply/Reports',@OwnPerId,@ParentId,'Reports',1,1,1);
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_ExpiryReport]    Script Date: 04/03/2019 3:50:51 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

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
----------------------------------------------------------------------------
*/
Begin 
IF (@ItemName IS NOT NULL)
	BEGIN
	Select (Cast(ROW_NUMBER() OVER (ORDER BY  x.ItemName)  as int)) as SN, 
	x.ItemId, x.BatchNo, x.ItemName, x.ExpiryDate, x.MRP, x.GenericName,
	Sum(FQty+ InQty-OutQty-FQtyOut) 'Qty'
	From 
			(select t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName,
			    sum(Case when InOut ='in' then FreeQuantity else 0 end ) as 'FQty',
				sum(Case when InOut ='out' then FreeQuantity else 0 end ) as 'FQtyOut',
				SUM(Case when InOut ='in' then Quantity else 0 end ) as 'InQty',
				SUM(Case When InOut = 'out' then Quantity ELSE 0 END) AS 'OutQty'
				from [dbo].[PHRM_StockTxnItems] t1
					inner join [dbo].[PHRM_MST_Item] item on item.ItemId = t1.ItemId
					inner join [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
					where  t1.ExpiryDate <= DATEADD(MONTH, 3, GETDATE()) AND t1.Quantity>0
					group by t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName, generic.GenericName
					) x 
					where x.ItemName  like '%'+ISNULL(@ItemName,'')+'%'  
					Group By x.ItemId, x.BatchNo, x.ItemName,x.ExpiryDate,x.MRP, x.GenericName
						
 
	END
	END
GO
--End: Rusha:  3rd April'19, Pharmacy Report and Ward supply---

---Start: Shankar: 4th Apr'19, Added default store name, procedure created for PHRMStoreStock, Permission handled for Store tab---

--Default store name in store table--
SET IDENTITY_INSERT [dbo].[PHRM_MST_Store] ON 

INSERT [dbo].[PHRM_MST_Store] ([StoreId], [Name], [Address], [ContactNo], [Email], [StoreLabel], [StoreDescription], [CreatedOn], [CreatedBy]) VALUES (1, N'Main Store', N'Dhumbarahi', N'9832856232', N'erdddfs@dd.com', NULL, NULL, CAST(N'2019-03-22T00:00:00.000' AS DateTime), NULL)
SET IDENTITY_INSERT [dbo].[PHRM_MST_Store] OFF
GO

--Procedure created for pharmacy store stock--
/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock] ''   Script Date: 04-Apr-19 11:0:58 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRMStoreStock]
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
----------------------------------------------------------------------------
*/
BEGIN
IF(@Status IS NOT NULL)
		BEGIN
			SELECT x.ItemName, x.BatchNo, x.ExpiryDate, Round(x.MRP,2,0) AS MRP, x.GRItemPrice,
			SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty'
			FROM

			(SELECT gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice,
			SUM(CASE WHEN InOut = 'in' THEN Quantity ELSE 0 END) AS 'InQty',
			SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty',
			SUM(CASE WHEN InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
			SUM(CASE WHEN InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
			FROM [dbo].[PHRM_StoreStock] AS stk
			INNER JOIN PHRM_GoodsReceiptItems AS gr ON gr.ItemId = stk.ItemId and gr.BatchNo= stk.BatchNo
			GROUP BY gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.FreeQuantity) AS x
			WHERE (@Status=x.ItemName or x.ItemName like '%'+ISNULL(@Status,'')+'%')
			GROUP BY x.ItemName, x.BatchNo, x.ExpiryDate, MRP, x.GRItemPrice
		END	
END
GO

--Permission handled for Store tab--
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('pharmacy-store-view',@ApplicationID,1,GETDATE(),1);
Go 

declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Pharmacy' and ApplicationCode='PHRM');


declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='pharmacy-store-view' and ApplicationId=@ApplicationID);

declare @ParentRouteId INT
SET @ParentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where DisplayName = 'Pharmacy');
Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
Values('Store','Pharmacy/Store','Store',@permissionID,@ParentRouteId,1,11,1);
Go
---End: Shankar: 4th Apr'19, Added default store name, procedure created for PHRMStoreStock, Permission handled for Store tab---

--Start: Rusha:  4th April'19, Add missing tabs of Inventory, Radiology, Nursing and Fraction in Collapse icon---
--Nursing -> add requisiton list view in collapse icon
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Nursing');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('nursing-requisition-list-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Nursing');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'nursing-requisition-list-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Requisition List','Nursing/RequisitionList',@OwnPerId,@ParentId,'RequisitionList',1,1,1);
GO

--Fraction -> add Fraction view and Setting in collapse icon
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Fraction');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('fraction-view',@AppnID_Settings,'true','1', GETDATE()),
('fraction-settings-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Fraction');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'fraction-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Fraction','Fraction/Calculation/ApplicableList',@OwnPerId,@ParentId,'Fraction',1,1,1);

SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'fraction-settings-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Settings','Fraction/Setting/Designation',@OwnPerId,@ParentId,'Settings',1,2,1);
GO

--Radiology -> add Ward Billing in collapse icon
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Radiology');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('radiology-ward-billing-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Radiology');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'radiology-ward-billing-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Ward Billing','Radiology/WardBilling',@OwnPerId,@ParentId,'WardBilling',1,1,1);
GO

--Inventory -> add Setting in collapse icon
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Inventory');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('inventory-settings-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Inventory');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'inventory-settings-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Settings','Inventory/Settings',@OwnPerId,@ParentId,'Settings',1,1,1);
GO

--End: Rusha:  4th April'19, Add missing tabs of Inventory, Radiology, Nursing and Fraction in Collapse icon---

--Start: Rusha:  4th April'19, Add all tabs of Emergency in Navigation bar---
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Emergency');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('emergency-new-patients-view',@AppnID_Settings,'true','1', GETDATE()),
('emergency-triaged-patients-view',@AppnID_Settings,'true','1', GETDATE()),
('emergency-finalized-patients-view',@AppnID_Settings,'true','1', GETDATE()),
('emergency-bed-information-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Emergency');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'emergency-new-patients-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('New patients','Emergency/NewPatients',@OwnPerId,@ParentId,'NewPatients',1,1,1);

SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'emergency-triaged-patients-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Triaged Patients','Emergency/TriagePatients',@OwnPerId,@ParentId,'TriagePatients',1,2,1);

SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'emergency-finalized-patients-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Finalized patients','Emergency/FinalizedPatients',@OwnPerId,@ParentId,'FinalizedPatients',1,3,1);

SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'emergency-bed-information-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,DisplaySeq,IsActive)
Values ('Bed Information','Emergency/BedInformations',@OwnPerId,@ParentId,'BedInformations',1,4,1);
GO
--End: Rusha:  4th April'19, Add all tabs of Emergency in Navigation bar---

--Start: Sanjit:  5th April'19, Routings corrected in WardSupply And Radiology---
update [RBAC_RouteConfig]
set UrlFullPath='WardSupply/PharmacyTransfer', RouterLink = 'PharmacyTransfer'
where UrlFullPath='WardSupply/Pharmacy Transfer' and RouterLink = 'Pharmacy Transfer';

update [RBAC_RouteConfig]
set UrlFullPath = 'Radiology/InpatientList' , RouterLink = 'InpatientList'
where UrlFullPath = 'Radiology/WardBilling' and RouterLink='WardBilling';
GO
--END: Sanjit:  5th April'19, Routings corrected in WardSupply And Radiology---

--Start: Rusha:  7th April'19, Update Supplier Stock Report in Pharmacy---

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_SupplierStockReport] ''    Script Date: 04/07/2019 2:42:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRMReport_SupplierStockReport]  
	     @SupplierName varchar(200) = null 
AS
/*
FileName: [SP_PHRMReport_SupplierStockReport]
CreatedBy/date: Rusha/04-07-2019
Description: To get the Details of goods receipt from Supplier such as received qty, rate per qty, and so on
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1        Rusha/04-07-2019	                 To get details of goods receipts from Supplier 
                                         
----------------------------------------------------------------------------
*/

BEGIN

 IF (@SupplierName IS NOT NULL)
 BEGIN
		
				
		select gr.CompanyName,gr.SupplierName, gr.ItemName, gr.ExpiryDate, gr.ReceivedQuantity+gr.FreeQuantity as Quantity, gr.GRItemPrice as PurchaseRate,gr.SubTotal, g.DiscountAmount,g.VATAmount, g.TotalAmount
		from PHRM_GoodsReceiptItems as gr
		join PHRM_GoodsReceipt as g on gr.GoodReceiptId=g.GoodReceiptId
		where gr.SupplierName  like '%'+ISNULL(@SupplierName,'')+'%'
		group by gr.CompanyName,gr.SupplierName, gr.ItemName, gr.ExpiryDate, gr.ReceivedQuantity,gr.FreeQuantity, gr.GRItemPrice, gr.TotalAmount,gr.SubTotal,g.DiscountAmount,g.VATAmount, g.TotalAmount	 

END

END
GO

--End: Rusha:  7th April'19, Update Supplier Stock Report in Pharmacy---

--Start: Rusha:  8th April'19, Add Date filter to get stock store details in Store tab of Pharmacy---

/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]   Script Date: 04/08/2019 10:01:36 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMStoreStock]
	@FromDate datetime = NULL,
	@ToDate datetime = NULL,
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
----------------------------------------------------------------------------
*/
BEGIN
IF((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and @Status IS NOT NULL)
		BEGIN
			SELECT convert(date,x.CreatedOn) as [Date], x.ItemName, x.BatchNo, x.ExpiryDate, Round(x.MRP,2,0) AS MRP, x.GRItemPrice,
			SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty'
			FROM

			(SELECT gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.CreatedOn,
			SUM(CASE WHEN InOut = 'in' THEN Quantity ELSE 0 END) AS 'InQty',
			SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty',
			SUM(CASE WHEN InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
			SUM(CASE WHEN InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
			FROM [dbo].[PHRM_StoreStock] AS stk
			INNER JOIN PHRM_GoodsReceiptItems AS gr ON gr.ItemId = stk.ItemId and gr.BatchNo= stk.BatchNo
			GROUP BY gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.FreeQuantity,gr.CreatedOn) AS x
			WHERE convert(datetime,x.CreatedOn)
							   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and (@Status=x.ItemName or x.ItemName like '%'+ISNULL(@Status,'')+'%')
			GROUP BY x.ItemName, x.BatchNo, x.ExpiryDate, MRP, x.GRItemPrice,x.CreatedOn
		END	
END
GO

--End: Rusha:  8th April'19, Add Date filter to get stock store details in Store tab of Pharmacy---
---Start: 8th April Dinesh ----added Route config and permission for IPBilling-----------
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('inpatient-billing',6,1,'2017-07-21 21:18:16.777',1)
GO
Declare @permissionId int
set @permissionId = (select PermissionId from RBAC_Permission where PermissionName = 'inpatient-billing')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,IsActive)
values ('IPBilling','Billing/InpatBilling','InpatBilling',@permissionId,37,1)

GO
---End: 8th April Dinesh ----added Route config and permission for IPBilling-----------

--Start: Rusha:  9th April'19, Create new Store Procedure report for Return to Supplier in Pharmacy Report---

--Update SP report of Counter Collection Report
/****** Object:  StoredProcedure [dbo].[SP_PHRM_CounterCollectionReport]    Script Date: 04/09/2019 9:51:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRM_CounterCollectionReport] 
@FromDate datetime=null,
 @ToDate datetime=null
 AS
 /*
FileName: [SP_PHRM_CounterCollectionReport] '05/01/2018','08/08/2018'
CreatedBy/date: Nagesh/Vikas/2018-07-31
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Nagesh/Vikas/2018-08-01	              created the script
2	   Rusha/04-08-2019						  Remove Sum() function to get details of each counter and user		
--------------------------------------------------------
*/
-- BEGIN
--  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
--		BEGIN
			
--			select convert(date,inv.CreatedOn) as [Date], usr.UserName as UserName,cnt.CounterName as CounterName, 
--			sum(inv.TotalAmount)as TotalAmount, sum(inv.SubTotal*inv.DiscountPercentage / 100.0) as [DiscountAmount]
--			 from PHRM_TXN_InvoiceItems inv
--				join RBAC_User usr
--				on inv.CreatedBy=usr.EmployeeId
--				join PHRM_MST_Counter cnt on inv.CounterId=cnt.CounterId
--				where CONVERT(date,inv.CreatedOn) Between ISNULL(@FromDate,GETDATE()) AND ISNULL(@ToDate,GETDATE())+1
--			    group by  UserName,CounterName,convert(date,inv.CreatedOn)
--				order by [Date]
					
--		End
--End

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
	select [Date], CounterName,UserName, TotalAmount, ReturnAmount as ReturnedAmount, TotalAmount-ReturnAmount as NetAmount, 
	DiscountAmount
	from ( 
          SELECT convert(date,inv.CreateOn) as [Date], phrmCnt.CounterName,usr.UserName,inv.PaidAmount as TotalAmount, 0 as ReturnAmount,inv.DiscountAmount as DiscountAmount
            FROM [PHRM_TXN_Invoice] inv
              INNER JOIN RBAC_User usr
             on inv.CreatedBy=usr.EmployeeId  
			 left Join PHRM_TXN_InvoiceItems as item
			  on inv.InvoiceId= item.InvoiceId
			 INNER JOIN PHRM_MST_Counter phrmCnt
			 on item.CounterId = phrmCnt.CounterId    
              where  convert(datetime, inv.CreateOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 
              group by convert(date,inv.CreateOn),UserName, CounterName,inv.PaidAmount,inv.DiscountAmount
			  
			  union all
			 
			  select convert(date,invRet.CreatedOn) as [Date], phrmCnt.CounterName, usr.UserName, 0 as TotalAmount,invRet.TotalAmount as ReturnAmount, (-(invRet.DiscountPercentage/100)*invRet.SubTotal ) as DiscountPercentage
			  From[PHRM_TXN_InvoiceReturnItems] invRet
			  INNER JOIN RBAC_User usr
			  on invRet.CreatedBy = usr.EmployeeId
			  INNER JOIN PHRM_MST_Counter phrmCnt
			 on invRet.CounterId = phrmCnt.CounterId  
			  where convert(datetime, invRet.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			  group by convert(date,invRet.CreatedOn),UserName, CounterName,invRet.TotalAmount,invRet.DiscountPercentage,invRet.SubTotal
			  )	  tabletotal
			  Group BY [Date], UserName, CounterName,TotalAmount, ReturnAmount, DiscountAmount
      End
End
GO

--Create new SP report for Return To Supplier
/****** Object:  StoredProcedure [dbo].[SP_PHRM_ReturnToSupplierReport]    Script Date: 04/09/2019 9:54:05 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRM_ReturnToSupplierReport] 
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
			where CONVERT(date, rtnitm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by CONVERT(date,rtnitm.CreatedOn),grp.SupplierName, grp.ItemName,rtn.ReturnDate, rtnitm.Quantity,rtnitm.FreeQuantity,rtnitm.SubTotal,
				rtn.DiscountAmount,rtn.VATAmount, rtnitm.TotalAmount,rtn.CreditNoteId,rtn.CreditNotePrintId,rtn.Remarks
	   END
END
GO
--End: Rusha:  9th April'19,Create new Store Procedure report for Return to Supplier in Pharmacy Report---

--Start: Sanjit: 9th April'19 , Add StoreName and StoreId in PHRM_StoreStock table---
BEGIN
	Alter table PHRM_StoreStock
	add StoreName varchar(255);
	Alter table PHRM_StoreStock
	add StoreId int;
END
GO
--END: Sanjit: 9th April'19 , Add StoreName and StoreId in PHRM_StoreStock table---

--Start: Sanjit:  9th April'19, Add StoreName and GoodsReceiptId in SP_PHRM_StoreStock---
--Update SP report of Pharmacy's store stock
/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]    Script Date: 4/9/2019 12:49:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMStoreStock]
	@FromDate datetime = NULL,
	@ToDate datetime = NULL,
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
----------------------------------------------------------------------------
*/
BEGIN
IF((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and @Status IS NOT NULL)
		BEGIN
			SELECT convert(date,x.CreatedOn) as [Date], x.ItemName, x.BatchNo, x.ExpiryDate, Round(x.MRP,2,0) AS MRP, x.GRItemPrice,
			SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x.StoreName,x.GoodReceiptItemId
			FROM

			(SELECT gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.CreatedOn,stk.StoreName,gr.GoodReceiptItemId,
			SUM(CASE WHEN InOut = 'in' THEN Quantity ELSE 0 END) AS 'InQty',
			SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty',
			SUM(CASE WHEN InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
			SUM(CASE WHEN InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
			FROM [dbo].[PHRM_StoreStock] AS stk
			INNER JOIN PHRM_GoodsReceiptItems AS gr ON gr.ItemId = stk.ItemId and gr.BatchNo= stk.BatchNo and gr.GoodReceiptItemId = stk.GoodsReceiptItemId
			GROUP BY gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.FreeQuantity,gr.CreatedOn,stk.StoreName,gr.GoodReceiptItemId) AS x
			WHERE convert(datetime,x.CreatedOn)
							   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and (@Status=x.ItemName or x.ItemName like '%'+ISNULL(@Status,'')+'%')
			GROUP BY x.ItemName, x.BatchNo, x.ExpiryDate, MRP, x.GRItemPrice,x.CreatedOn,x.StoreName,x.GoodReceiptItemId
		END	
END
GO
--END: Sanjit:  9th April'19, Add StoreName and GoodsReceiptId in SP_PHRM_StoreStock---

--Start: Rusha:  9th April'19,Modify and updated of Pharmacy report---

--Sales Return Report
/****** Object:  StoredProcedure [dbo].[SP_PHRM_SaleReturnReport]   Script Date: 04/09/2019 11:18:40 AM ******/
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
1      Vikas/2018-08-06	                     created the script
2.     VIKAS/2019-01-02					     report doesnt shown correctly so changes in script. 
3.	   Rusha/2019-04-09						 report doesnot show quantity so add return quantity
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
					select convert(date,invr.CreatedOn) as[Date],convert(date, inv.CreateOn) as [InvDate], 
					 inv.InvoicePrintId,usr.UserName,
						pat.FirstName+' '+ ISNULL( pat.MiddleName,'')+' '+pat.LastName  as PatientName,
				 sum(inv.TotalAmount) as TotalAmount, sum(inv.DiscountAmount) as Discount, Sum(invr.Quantity) as Quantity
				    from [PHRM_TXN_Invoice]inv
					join [PHRM_TXN_InvoiceReturnItems]invr
							on inv.InvoiceId=invr.InvoiceId
					join RBAC_User usr
							on usr.EmployeeId=invr.CreatedBy 
					join PAT_Patient pat
							on pat.PatientId=inv.PatientId
								where  convert(date, invr.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 
					group by convert(date,inv.CreateOn), convert(date, invr.CreatedOn),usr.UserName, pat.FirstName,pat.MiddleName,pat.LastName, inv.InvoicePrintId, invr.Quantity
					order by convert(date,invr.CreatedOn) desc

	End
End
GO

--Modify Store Table
update PHRM_MST_Store
set CreatedBy=1
where StoreId=1
GO

--End: Rusha:  9th April'19,Modify and updated of Pharmacy report---

--Start: Rusha:  10th April'19,Create Store Procedure for Dispensary and Store stock report in Pharmacy report---

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_DispensaryStoreStockReport]   Script Date: 04/10/2019 9:54:25 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRMReport_DispensaryStoreStockReport]  
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

--------------------------------------------------------
*/

	BEGIN
		IF (@Status = 'dispensary')	 
			SELECT convert(date,x.CreatedOn) as [Date],x.ItemName,x.DispensaryBatchNo,x.ExpiryDate,Round(x.MRP,2,0) AS MRP,
			Sum(FQty+ InQty-OutQty-FQtyOut) 'StockQty'
			FROM 
			(SELECT t1.ItemId, t1.BatchNo as DispensaryBatchNo ,t1.MRP,item.ItemName,t1.CreatedOn,t1.ExpiryDate,
			    sum(CASE WHEN t1.InOut ='in' THEN t1.FreeQuantity ELSE 0 END ) AS 'FQty',
				sum(CASE WHEN t1.InOut ='out' THEN t1.FreeQuantity ELSE 0 END ) AS 'FQtyOut',
				SUM(CASE WHEN t1.InOut ='in' THEN t1.Quantity ELSE 0 END ) AS 'InQty',
				SUM(CASE WHEN t1.InOut = 'out' THEN t1.Quantity ELSE 0 END) AS 'OutQty'
				FROM [dbo].[PHRM_StockTxnItems] t1
				inner join [dbo].[PHRM_MST_Item] item ON item.ItemId = t1.ItemId
				inner join [dbo].[PHRM_MST_Generic] generic ON generic.GenericId =item.GenericId
				WHERE t1.Quantity>0
				GROUP BY t1.ItemId, t1.BatchNo,t1.ExpiryDate, t1.MRP,item.ItemName,t1.CreatedOn) AS x 
				GROUP BY  x.ItemName,x.DispensaryBatchNo,x.ExpiryDate,x.MRP,x.CreatedOn

		ELSE IF (@Status = 'store')

				SELECT convert(date,x1.CreatedOn) as [Date], x1.ItemName,x1.StoreBatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
				SUM(FInQty + InQty - FOutQty - OutQty) AS 'StockQty'
				FROM
				(SELECT gr.ItemName, gr.BatchNo as StoreBatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.CreatedOn,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				INNER JOIN PHRM_GoodsReceiptItems AS gr ON gr.ItemId = stk.ItemId 
					and gr.BatchNo= stk.BatchNo and gr.GoodReceiptItemId = stk.GoodsReceiptItemId
				left join PHRM_StockTxnItems as t on stk.ItemId=t.ItemId
				GROUP BY gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.FreeQuantity,gr.CreatedOn) AS x1
				GROUP BY x1.ItemName, x1.StoreBatchNo, x1.ExpiryDate, x1.MRP,x1.CreatedOn

			ELSE IF(@Status = 'all')

				Select convert(date,a.CreatedOn) as [Date],a.ItemName,a.DispensaryBatchNo,a.StoreBatchNo,a.ExpiryDate,
				sum(DFQty+ DInQty-DOutQty-DFQtyOut+SFInQty+SInQty-SOutQty-SFOutQty) 'StockQty',a.MRP
				from
				(select dis.itemID,itm.ItemName,dis.ExpiryDate,dis.CreatedOn,dis.BatchNo as DispensaryBatchNo,stk.BatchNo as StoreBatchNo,dis.MRP,
					sum(CASE WHEN dis.InOut ='in' THEN dis.FreeQuantity ELSE 0 END ) AS 'DFQty',
					sum(CASE WHEN dis.InOut ='out' THEN dis.FreeQuantity ELSE 0 END ) AS 'DFQtyOut',
					SUM(CASE WHEN dis.InOut ='in' THEN dis.Quantity ELSE 0 END ) AS 'DInQty',
					SUM(CASE WHEN dis.InOut = 'out' THEN dis.Quantity ELSE 0 END) AS 'DOutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'SInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'SOutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'SFInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'SFOutQty' 
					from PHRM_StockTxnItems as dis
					full outer join PHRM_StoreStock as stk on dis.ItemId=stk.ItemId
					inner join [dbo].[PHRM_MST_Item] itm ON itm.ItemId = dis.ItemId
					group by dis.ItemId,itm.ItemName,dis.ExpiryDate,dis.CreatedOn,dis.BatchNo,dis.MRP,stk.BatchNo) AS a
				group by a.ItemName,a.DispensaryBatchNo,a.StoreBatchNo, a.ExpiryDate, a.MRP,a.CreatedOn
	 END
GO

--End: Rusha:  9th April'19,Create Store Procedure for Dispensary and Store stock report in Pharmacy report---




--Start: Sud: 10Apr'19--For PatientCode Generation format--
Insert Into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description)
Values('Patient','PatientCodeFormat','YYMM-PatNum','string','Format to generate PatientCode (HospitalNo) -- If YYMM-PatNum then: YYMM+PatientNo, if HospCode-PatNum then HospitalCode+PatientNo, if PatNum then PatientNo only. Default is YYMM+PatientNo  (total 10 digits, YYMM -> 4 digits, PatientNum -> 6Digits. Add leading zero in patient number to make it 6 digits)');
GO

---Chage the ParameterValue as per Hospital. eg: If manakamana hospital then: MNK, if HAMS then HAMS, and so on..
Update CORE_CFG_Parameters
set ParameterValue='', ValueDataType='string'
WHERE ParameterName='HospitalCode' and ParameterGroupName='Common'
GO

--End: Sud: 10Apr'19--For PatientCode Generation format--


--Start: Rusha:  11th April'19,Modify Batch report of Pharmacy report---

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_BatchStockReport]    Script Date: 04/11/2019 9:09:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

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
----------------------------------------------------------------------------
*/

BEGIN

 IF (@ItemName IS NOT NULL)
	 BEGIN
		SELECT (CAST(ROW_NUMBER() OVER (ORDER BY  itm.ItemName)  AS INT)) AS SN,stk.ItemId, stk.BatchNo, itm.ItemName,gen.GenericName,
		stk.ExpiryDate,SUM(stk.Quantity+stk.FreeQuantity) AS TotalQty,stk.MRP
		FROM PHRM_StockTxnItems AS stk
		JOIN PHRM_MST_Item AS itm ON stk.ItemId=itm.ItemId
		JOIN PHRM_MST_Generic gen ON itm.GenericId= gen.GenericId
		WHERE BatchNo  like '%'+ISNULL(@ItemName,'')+'%'  
		GROUP BY stk.ItemId,stk.BatchNo,itm.ItemName, stk.MRP, gen.GenericName,stk.ExpiryDate  
	 END
END

--End: Rusha:  11th April'19,Modify Batch report of Pharmacy report---

----Start: Shankar: 11th April'19, Modify pharmacy store stock procedure and added columns in PHRM_StoreStock table----

--Update SP report of Pharmacy's store stock
/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]    Script Date: 4/9/2019 12:49:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMStoreStock]
	@FromDate datetime = NULL,
	@ToDate datetime = NULL,
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
3.      Shankar/04-11-2019                      ItemId, Price and GoodReceiptPrintId have been added.
----------------------------------------------------------------------------
*/
BEGIN
IF((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and @Status IS NOT NULL)
		BEGIN
			SELECT convert(date,x.CreatedOn) as [Date], x.ItemName, x.BatchNo, x.ExpiryDate, Round(x.MRP,2,0) AS MRP, x.GRItemPrice,
			SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x.StoreName,x.GoodReceiptItemId,x.StoreId,x.ItemId,x.Price,x.GoodReceiptPrintId
			FROM

			(SELECT gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.CreatedOn,stk.StoreName,gr.GoodReceiptItemId,stk.StoreId,stk.ItemId,stk.Price,gri.GoodReceiptPrintId,
			SUM(CASE WHEN InOut = 'in' THEN Quantity ELSE 0 END) AS 'InQty',
			SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty',
			SUM(CASE WHEN InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
			SUM(CASE WHEN InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
			FROM [dbo].[PHRM_StoreStock] AS stk
			INNER JOIN PHRM_GoodsReceiptItems AS gr ON gr.ItemId = stk.ItemId and gr.BatchNo= stk.BatchNo and gr.GoodReceiptItemId = stk.GoodsReceiptItemId
			INNER JOIN PHRM_GoodsReceipt AS gri ON  gr.GoodReceiptId = gri.GoodReceiptId
			GROUP BY gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.FreeQuantity,gr.CreatedOn,stk.StoreName,gr.GoodReceiptItemId,stk.StoreId,stk.ItemId,stk.Price,gri.GoodReceiptPrintId) AS x
			WHERE convert(datetime,x.CreatedOn)
							   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and (@Status=x.ItemName or x.ItemName like '%'+ISNULL(@Status,'')+'%')
			GROUP BY x.ItemName, x.BatchNo, x.ExpiryDate, MRP, x.GRItemPrice,x.CreatedOn,x.StoreName,x.GoodReceiptItemId,x.StoreId,x.ItemId,x.Price,x.GoodReceiptPrintId
		END	
END
GO
---Added Column in StoreStock table in pharmacy----
Alter Table PHRM_StoreStock
Add Remark varchar(MAX),
ItemName varchar(500)
Go

----End: Shankar: 11th April'19, Modify pharmacy store stock procedure and added columns in PHRM_StoreStock table-----


----start: Salakha: 12th April'19, Parameters for Referral Doctor charge
INSERT INTO [dbo].[CORE_CFG_Parameters] ([ParameterGroupName] ,[ParameterName]    ,[ParameterValue]     ,[ValueDataType]  ,[Description] ,[ParameterType])
     VALUES
           ('Billing','ReferralChargeApplicable','true','boolean','Charges apply for referral doctor','custom')
GO
----End:  Salakha: 12th April'19,  Parameters for Referral Doctor charge

----start: Salakha: 15th April'19, Modify Trigger to update TransactionDate column in BIL_SYNC_BillingAccounting 
/****** Object:  Trigger [dbo].[TRG_BillToAcc_BillingTxn]    Script Date: 15-04-2019 16:31:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_BillToAcc_BillingTxn]
   ON  [dbo].[BIL_TXN_BillingTransaction]
   AFTER UPDATE
AS 
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ramavtar/2018-10-29			created the script
2       Salakha/2018-12-05          Added SettlementDiscountAmount
3		Salakha/2019-04-15			Added TransactionDate
=======================================================
*/
BEGIN
	--perform only if settlementid is found
	IF (SELECT SettlementId FROM inserted) IS NOT NULL
	BEGIN
		--Declare Variables
		DECLARE @PaymentMode varchar(20)
		DECLARE @SettlementDiscountAmount float
		DECLARE @PaidDate DATETIME 
		DECLARE @CreatedBy INT

		--Initializing
		SET @PaymentMode = (SELECT PaymentMode FROM BIL_TXN_Settlements WHERE SettlementId = (SELECT SettlementId FROM inserted))
        SET @SettlementDiscountAmount=(select DiscountAmount From BIL_TXN_Settlements where SettlementId=(SELECT SettlementId from Inserted))
		SET @PaidDate = (SELECT SettlementDate FROM BIL_TXN_Settlements WHERE  SettlementId=(SELECT SettlementId from Inserted) ) 
		SET @CreatedBy = (SELECT CreatedBy FROM BIL_TXN_Settlements WHERE  SettlementId=(SELECT SettlementId from Inserted) )
    
		--Updating Values
		UPDATE BIL_SYNC_BillingAccounting
		SET PaymentMode = @PaymentMode, SettlementDiscountAmount = @SettlementDiscountAmount , TransactionDate = @PaidDate, CreatedBy = @CreatedBy
		WHERE TransactionType = 'CreditBillPaid'
			AND ReferenceId IN (SELECT BillingTransactionItemId FROM BIL_TXN_BillingTransactionItems WHERE BillingTransactionId = (SELECT BillingTransactionId FROM inserted) )

	END
END
Go
Go

ALTER TABLE [PHRM_TXN_Invoice]
ALTER COLUMN IsTransferredToACC bit;
GO

----start: Salakha: 15th April'19, Corrected Data type of column

---Start: Shankar: 15th April'19, Added a column in StoreStock table and added IsActive in procedure----

Alter Table PHRM_StoreStock
Add IsActive bit 
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]    Script Date: 15-Apr-19 1:51:47 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMStoreStock]
	@FromDate datetime = NULL,
	@ToDate datetime = NULL,
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
----------------------------------------------------------------------------
*/
BEGIN
IF((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL) and @Status IS NOT NULL)
		BEGIN
			SELECT convert(date,x.CreatedOn) as [Date], x.ItemName, x.BatchNo, x.ExpiryDate, Round(x.MRP,2,0) AS MRP, x.GRItemPrice,
			SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x.StoreName,x.GoodReceiptItemId,x.StoreId,x.ItemId,x.Price,x.GoodReceiptPrintId
			FROM

			(SELECT gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.CreatedOn,stk.StoreName,gr.GoodReceiptItemId,stk.StoreId,stk.ItemId,stk.Price,gri.GoodReceiptPrintId,
			SUM(CASE WHEN InOut = 'in' THEN Quantity ELSE 0 END) AS 'InQty',
			SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty',
			SUM(CASE WHEN InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
			SUM(CASE WHEN InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
			FROM [dbo].[PHRM_StoreStock] AS stk
			INNER JOIN PHRM_GoodsReceiptItems AS gr ON gr.ItemId = stk.ItemId and gr.BatchNo= stk.BatchNo and gr.GoodReceiptItemId = stk.GoodsReceiptItemId
			INNER JOIN PHRM_GoodsReceipt AS gri ON  gr.GoodReceiptId = gri.GoodReceiptId
			WHERE stk.IsActive = 'true'
			GROUP BY gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.FreeQuantity,gr.CreatedOn,stk.StoreName,gr.GoodReceiptItemId,stk.StoreId,stk.ItemId,stk.Price,gri.GoodReceiptPrintId) AS x
			WHERE convert(datetime,x.CreatedOn)
							   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and (@Status=x.ItemName or x.ItemName like '%'+ISNULL(@Status,'')+'%')
			GROUP BY x.ItemName, x.BatchNo, x.ExpiryDate, MRP, x.GRItemPrice,x.CreatedOn,x.StoreName,x.GoodReceiptItemId,x.StoreId,x.ItemId,x.Price,x.GoodReceiptPrintId
		END	
END
GO

---End: Shankar: 15th April'19, Added a column in StoreStock table and added IsActive in procedure----

---Start: Rusha: 17th April'19, Create table Dispensary, add IsActive----

--Table Dispensary
CREATE TABLE [dbo].[PHRM_MST_Dispensary](
  [DispensaryId] [int] IDENTITY(1,1) PRIMARY KEY NOT NULL,
  [Name] [varchar](100) NULL,
  [Address] [varchar](200) NULL,
  [ContactNo] [varchar](20) NULL,
  [Email] [varchar](100) NULL,
  [DispensaryLabel] [varchar](100) NULL,
  [DispensaryDescription] [varchar](200) NULL,
  [CreatedOn] [datetime],
  [CreatedBy] [int],
  [IsActive] [bit]
)
GO

alter table PHRM_StockTxnItems
disable trigger TR_PHRM_StockTxnItems_UpdateStock
Go

alter table PHRM_StockTxnItems
add DispensaryId int not null
constraint D_PHRM_StockTxnItems_DispensaryId
default (0) with values
Go

--Ward Supply: Consumption report
/****** Object:  StoredProcedure [dbo].[SP_WardReport_ConsumptionReport]    Script Date: 03/29/2019 4:53:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_WardReport_ConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null
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
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			select CONVERT(date,consum.CreatedOn) as [Date], adt.WardName,consum.ItemName, gene.GenericName, consum.Quantity as Quantity from WARD_Consumption as consum 
			join ADT_MST_Ward as adt on consum.WardId=adt.WardID
			join PHRM_MST_Item as itm on consum.ItemId=itm.GenericId
			join PHRM_MST_Generic as gene on  itm.GenericId=gene.GenericId
			where CONVERT(date, consum.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			group by CONVERT(date,consum.CreatedOn),adt.WardName,consum.ItemName,consum.Quantity, gene.GenericName
		END		
End
GO


---End: Rusha: 17th April'19, Create table Dispensary, add IsActive----


---Start: Rajesh: 17April'19, Created tables for Inventory and also updated the RBAC_RouterConfig

/****** Object:  Table [dbo].[INV_Quotation]    Script Date: 17-04-2019 17:40:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[INV_Quotation](
	[QuotationId] [int] IDENTITY(1,1) NOT NULL,
	[ReqForQuotationId] [int] NULL,
	[VendorId] [int] NULL,
	[VendorName] [nvarchar](150) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[Status] [nvarchar](150) NULL,
 CONSTRAINT [PK_INV_QuotationItems] PRIMARY KEY CLUSTERED 
(
	[QuotationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[INV_QuotationItems]    Script Date: 17-04-2019 17:40:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[INV_QuotationItems](
	[QuotationItemId] [int] IDENTITY(1,1) NOT NULL,
	[QuotationId] [int] NULL,
	[VendorId] [int] NULL,
	[ItemId] [int] NULL,
	[ItemName] [nvarchar](150) NULL,
	[Price] [int] NULL,
	[Description] [nvarchar](max) NULL,
	[UpLoadedOn] [datetime] NULL,
	[UpLoadedBy] [int] NULL,
	[ModifiedOn] [datetime] NULL,
	[ModifiedBy] [int] NULL,
 CONSTRAINT [PK_INV_RequestForQuotation_1] PRIMARY KEY CLUSTERED 
(
	[QuotationItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[INV_QuotationUploadedFiles]    Script Date: 17-04-2019 17:40:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[INV_QuotationUploadedFiles](
	[QuotationUploadedFileId] [int] IDENTITY(1,1) NOT NULL,
	[RequestForQuotationId] [int] NULL,
	[VendorId] [int] NULL,
	[ROWGUID] [uniqueidentifier] NULL,
	[FileType] [nvarchar](300) NULL,
	[FileBinaryData] [varbinary](max) NULL,
	[FileName] [nvarchar](300) NULL,
	[FileNo] [int] NULL,
	[FileExtention] [nvarchar](50) NULL,
	[UpLoadedOn] [datetime] NULL,
	[UpLoadedBy] [int] NULL,
	[Description] [nvarchar](300) NULL,
 CONSTRAINT [PK_INV_QuotationUploadedFiles] PRIMARY KEY CLUSTERED 
(
	[QuotationUploadedFileId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[INV_RequestForQuotation]    Script Date: 17-04-2019 17:40:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[INV_RequestForQuotation](
	[ReqForQuotationId] [int] IDENTITY(1,1) NOT NULL,
	[Subject] [nvarchar](max) NULL,
	[Description] [nvarchar](max) NULL,
	[RequestedBy] [nvarchar](50) NULL,
	[CreatedOn] [datetime] NULL,
	[ApprovedBy] [int] NULL,
	[RequestedOn] [datetime] NULL,
	[RequestedCloseOn] [datetime] NULL,
	[Status] [nvarchar](50) NULL,
 CONSTRAINT [PK_INV_RequestForQuotation] PRIMARY KEY CLUSTERED 
(
	[ReqForQuotationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[INV_RequestForQuotationItems]    Script Date: 17-04-2019 17:40:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[INV_RequestForQuotationItems](
	[ReqForQuotationItemId] [int] IDENTITY(1,1) NOT NULL,
	[ItemId] [int] NULL,
	[ReqForQuotationId] [int] NULL,
	[ItemName] [nvarchar](300) NULL,
	[Quantity] [int] NULL,
	[Price] [int] NULL,
	[Description] [nvarchar](max) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK_INV_RequestForQuotationItems] PRIMARY KEY CLUSTERED 
(
	[ReqForQuotationItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

  update [dbo].[RBAC_RouteConfig] set UrlFullpath='Inventory/ProcurementMain' where UrlFullpath='Inventory/ExternalMain'
  update [dbo].[RBAC_RouteConfig] set UrlFullpath='Inventory/ProcurementMain/PurchaseOrderList' where UrlFullpath='Inventory/ExternalMain/PurchaseOrderList'
  update [dbo].[RBAC_RouteConfig] set UrlFullpath='Inventory/ProcurementMain/PurchaseOrderItems' where UrlFullpath='Inventory/ExternalMain/PurchaseOrderItems'
  update [dbo].[RBAC_RouteConfig] set UrlFullpath='Inventory/ProcurementMain/GoodsReceiptItems' where UrlFullpath='Inventory/ExternalMain/GoodsReceiptItems'
  update [dbo].[RBAC_RouteConfig] set UrlFullpath='Inventory/ProcurementMain/GoodsReceiptList' where UrlFullpath='Inventory/ExternalMain/GoodsReceiptList'
  update [dbo].[RBAC_RouteConfig] set UrlFullpath='Inventory/ProcurementMain/GoodsReceiptDetails' where UrlFullpath='Inventory/ExternalMain/GoodsReceiptDetails'
  update [dbo].[RBAC_RouteConfig] set UrlFullpath='Inventory/ProcurementMain/PurchaseOrderDetails' where UrlFullpath='Inventory/ExternalMain/PurchaseOrderDetails'
  update [dbo].[RBAC_RouteConfig] set DisplayName='Procurement' where DisplayName='External'		
  update [dbo].[RBAC_RouteConfig] set RouterLink='ProcurementMain' where RouterLink='ExternalMain'	
  go

----End: Rajesh: 17April'19, Created tables for Inventory and also updated the RBAC_RouterConfig

----START: Yubraj: 19 April'19, Created tables for CreditOrganization 
CREATE TABLE BIL_MST_Credit_Organization
(
	OrganizationId int IDENTITY(1,1) primary key,
	OrganizationName varchar(50),
	IsActive bit default 0,
	CreatedOn datetime,
	CreatedBy int,
	ModifiedOn datetime,
	ModifiedBy int
);
----END: Yubraj: 19 April'19, Created tables for CreditOrganization 


----- start: mahesh 21st april parameterise the credit organization ----

insert into CORE_CFG_Parameters (ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
  values ('Billing', 'CreditOrganization', 'true', 'boolean', 'To enable credit organization name to insert on billing if the credit is associated with some organisation, implementing in manakamana', 'custom');

--- end: mahesh 21st april ------



---start: sud: 21Apr-For Billing--
Alter Table BIL_CFG_BillItemPrice
Add IsNormalPriceApplicable BIT CONSTRAINT DEF_IsNormalPrice Default(1)
GO

Update BIL_CFG_BillItemPrice
SET IsNormalPriceApplicable=1
GO
Alter Table BIL_CFG_BillItemPrice
Add IsEHSPriceApplicable BIT CONSTRAINT DEF_IsEHSPrice Default(1)
GO

Update BIL_CFG_BillItemPrice
SET IsEHSPriceApplicable=0
GO

Alter Table BIL_CFG_BillItemPrice
Add IsForeignerPriceApplicable BIT CONSTRAINT DEF_IsForeignerPrice Default(1)
GO

Update BIL_CFG_BillItemPrice
SET IsForeignerPriceApplicable=0
GO


Alter Table BIL_CFG_BillItemPrice
Add IsSAARCPriceApplicable BIT CONSTRAINT DEF_IsSAARCPrice Default(1)
GO

Update BIL_CFG_BillItemPrice
SET IsSAARCPriceApplicable=0
GO

---end: sud: 21Apr-For Billing--

---Start: Salakha: 22Apr- update redundant ledgergroup
update ACC_MST_LedgerGroup
set COA = 'Indirect Income' where COA = 'Indirect Incomes'
GO
---END: Salakha: 22Apr- update redundant ledgergroup

----- START: Yubraj 23rd april Adding column in billingTransaction table and visitPatient table----
ALTER TABLE BIL_TXN_BillingTransaction
ADD OrganizationId int null;
----- END: Yubraj 23rd april Adding column in billingTransaction table and visitPatient table----

----- START: Hom 24th april Adding boolean parameter for enabling bill request slip(provisional slip) for admitted patients ----
INSERT [dbo].[CORE_CFG_Parameters] (
[ParameterGroupName], 
[ParameterName], 
[ParameterValue], 
[ValueDataType], 
[Description]) 
VALUES 
(N'Billing',
N'EnableBillRequestSlip',
N'true',
N'boolean',
N'This ensures whether the user can be able to print the slip of items requested for inpatients, implementing in Manakamana.')
GO
----- END: Hom 24th april Adding boolean parameter for enabling bill request slip(provisional slip) for admitted patients ----


-----START: Rusha 26th April '19, Recreated script of Purchase Order Report of Pharmacy Module -----

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_PurchaseOrderSummaryReport]  Script Date: 04/26/2019 9:40:37 AM ******/
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
--------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) and (@Status IS NOT null)
	BEGIN
		IF (@Status='all')
			SELECT convert(date,PO.PODate) as [Date],itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,sum(poitm.Quantity) as Quantity,poitm.StandaredPrice,sum(poitm.ReceivedQuantity) as ReceivedQuantity from PHRM_PurchaseOrder as po
			join PHRM_PurchaseOrderItems as poitm on poitm.PurchaseOrderId=po.PurchaseOrderId
			join PHRM_MST_Item as itm on itm.ItemId=poitm.ItemId
			WHERE convert(datetime, PO.PODate) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			GROUP BY convert(date,PO.PODate),itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,poitm.Quantity,poitm.StandaredPrice,poitm.ReceivedQuantity
		
		ELSE IF (@Status='active')
			SELECT convert(date,PO.PODate) as [Date], itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,sum(poitm.Quantity) as Quantity,poitm.StandaredPrice,sum(poitm.ReceivedQuantity) as ReceivedQuantity from PHRM_PurchaseOrder as po
			join PHRM_PurchaseOrderItems as poitm on poitm.PurchaseOrderId=po.PurchaseOrderId
			join PHRM_MST_Item as itm on itm.ItemId=poitm.ItemId
			WHERE po.POStatus='active' and convert(datetime, PO.PODate) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			GROUP BY convert(date,PO.PODate),itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,poitm.Quantity,poitm.StandaredPrice,poitm.ReceivedQuantity

		ELSE IF (@Status='complete')
			SELECT convert(date,PO.PODate) as [Date],itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,sum(poitm.Quantity) as Quantity,poitm.StandaredPrice,sum(poitm.ReceivedQuantity) as ReceivedQuantity from PHRM_PurchaseOrder as po
			join PHRM_PurchaseOrderItems as poitm on poitm.PurchaseOrderId=po.PurchaseOrderId
			join PHRM_MST_Item as itm on itm.ItemId=poitm.ItemId
			WHERE po.POStatus='complete' and convert(datetime, PO.PODate) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			GROUP BY convert(date,PO.PODate),itm.ItemName,po.POStatus,po.Subtotal,po.VATAmount,po.TotalAmount,poitm.Quantity,poitm.StandaredPrice,poitm.ReceivedQuantity
	END
END

GO
-----END: Rusha 26th April '19, Recreated script of Purchase Order Report of Pharmacy Module -----

--Start:Dinesh 28th_April_2019, Master table and Data created for Integration Name for serviceDepartment and Route for MedicationPrescription added-------

/****** Object:  Table [dbo].[ServiceDepartment_MST_IntegrationName]    Script Date: 4/28/2019 9:48:12 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ServiceDepartment_MST_IntegrationName](
	[IntegrationNameID] [int] IDENTITY(1,1) NOT NULL,
	[IntegrationName] [nvarchar](50) NULL,
 CONSTRAINT [PK_ServiceDepartment_MST_IntegrationName] PRIMARY KEY CLUSTERED 
(
	[IntegrationNameID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[ServiceDepartment_MST_IntegrationName] ON 
GO
INSERT [dbo].[ServiceDepartment_MST_IntegrationName] ([IntegrationNameID], [IntegrationName]) VALUES (1, N'None')
GO
INSERT [dbo].[ServiceDepartment_MST_IntegrationName] ([IntegrationNameID], [IntegrationName]) VALUES (2, N'OPD')
GO
INSERT [dbo].[ServiceDepartment_MST_IntegrationName] ([IntegrationNameID], [IntegrationName]) VALUES (3, N'LAB')
GO
INSERT [dbo].[ServiceDepartment_MST_IntegrationName] ([IntegrationNameID], [IntegrationName]) VALUES (4, N'Radiology')
GO
INSERT [dbo].[ServiceDepartment_MST_IntegrationName] ([IntegrationNameID], [IntegrationName]) VALUES (5, N'Bed Charges')
GO
INSERT [dbo].[ServiceDepartment_MST_IntegrationName] ([IntegrationNameID], [IntegrationName]) VALUES (6, N'Nephrology')
GO
SET IDENTITY_INSERT [dbo].[ServiceDepartment_MST_IntegrationName] OFF
GO

Declare @perid int
set @perid= (select PermissionId from RBAC_Permission
where PermissionName like '%clinical-medicationprescription-view%')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,isactive)
values (' ','Doctors/PatientOverviewMain/Orders/PrintMedication','MedicationPrescription',@perid,1)

GO
--End:Dinesh 28th_April_2019, Master table and Data created for Integration Name for serviceDepartment and Route for MedicationPrescription added -------

--START: Yubraj 28th April 2019: --Added parameter for Billing Membership Type Discount
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
values('Billing','MembershipTypeDiscount','true', 'boolean','This is the section paramitizing Membership Type Discount for Billing.')
go
---END: Yubraj 28th April 2019: --Added parameter for Billing Membership Type Discount


--Start: Anish 28 April, LabTestComponentJSON moved to newly created component table and their respective mapping table---
Create table Lab_MST_Components(
        ComponentId INT IDENTITY(1, 1)  Constraint PK_ComponentId Primary Key NOT NULL,
        ComponentName varchar(120),
        Unit varchar(20),
        ValueType varchar(50),
        ControlType varchar(50),
        Range varchar(80),
        RangeDescription varchar(200),
        Method varchar(200),
        ValueLookup varchar(150),
        MinValue float null,
        MaxValue float null,
		CreatedBy INT,
		CreatedOn DATETIME,
		ModifiedBy INT,
		ModifiedOn DATETIME,
);
Go

Create table Lab_MAP_TestComponents(
        ComponentMapId INT IDENTITY(1, 1)  Constraint PK_ComponentMapId Primary Key NOT NULL,
        LabTestId bigint NOT NULL,
        ComponentId INT NOT NULL,
		DisplaySequence int,
        Indent bit,
		GroupName varchar(80),
		CreatedBy INT,
		CreatedOn DATETIME,
		ModifiedBy INT,
		ModifiedOn DATETIME
);
Go

ALTER TABLE [dbo].[Lab_MAP_TestComponents] WITH CHECK ADD CONSTRAINT [FK_LAB_TEST_MAPTESTCOMPONENT] FOREIGN KEY([LabTestId])
REFERENCES [dbo].[LAB_LabTests] ([LabTestId])
Go

ALTER TABLE [dbo].[Lab_MAP_TestComponents] WITH CHECK ADD CONSTRAINT [FK_LAB_MST_COMPONENTS_MAPTESTCOMPONENT] FOREIGN KEY([ComponentId])
REFERENCES [dbo].[Lab_MST_Components] ([ComponentId])
Go

Update LAB_LabTests
Set LabTestComponentsJSON=
'[{"Component":"Hb-1","Range":"Male = 13-18, Female = 11-16","RangeDescription":"Male = 13-18, Female = 11-16","ValueType":"number","Unit":"gm/dl","Method":""}]'
Where LabTestId=63 and LabTestName='Hb - 1'
GO

Update LAB_LabTests
Set LabTestComponentsJSON=
'[{"Component":"FT4","Range":"9.0-19.0","RangeDescription":"9.0-19.0","ValueType":"number","Unit":"pmd/L","Method":"CLIA/Serum"}]'
Where LabTestId=80 and LabTestName='T4/FT4'
GO




Select * Into TEMP_LabTestForJson FROM LAB_LabTests;

Declare @currLabtestId BigInt;
Declare @currLabtestName varchar(1000);
Declare @currTestCompsJson nvarchar(max);


Declare @FinalTable Table(LabTestId BigInt, 
	LabtestName varchar(1000),
	Component varchar(1000), 
	Range Varchar(1000), 
	RangeDescription Varchar(1000),
	ValueType Varchar(1000),
	Unit Varchar(1000),
	Method Varchar(1000),
	ControlType Varchar(1000),
	Indent bit,
	DisplaySequence int,	
	GroupName Varchar(80),
	MinValue float,
	MaxValue float,
	ValueLookup Varchar(1000));



While EXISTS(Select 1 from TEMP_LabTestForJson)
BEGIN

 SET @currLabtestId=(Select Top 1 LabTestId from TEMP_LabTestForJson)
 set @currLabtestName=(Select LabTestName from TEMP_LabTestForJson where LabTestId=@currLabtestId)
 set @currTestCompsJson = (Select LabTestComponentsJSON from TEMP_LabTestForJson where LabTestId=@currLabtestId)
		 
		BEGIN TRY  
   
			 Insert into @FinalTable(LabTestId,LabtestName, Component, Range, RangeDescription, ValueType, Unit,Method , ControlType,Indent, GroupName ,DisplaySequence ,MinValue ,MaxValue ,ValueLookup)


			SELECT @currLabtestId,@currLabtestName, *  
			FROM OPENJSON(@currTestCompsJson)  
			WITH (Component varchar(120) '$.Component',  
				Range varchar(80) '$.Range',RangeDescription varchar(200) '$.RangeDescription',
				ValueType varchar(50) '$.ValueType',Unit varchar(20) '$.Unit',
				Method varchar(200) '$.Method',ControlType varchar(50) '$.ControlType',
				Indent bit '$.Indent',
				GroupName varchar(80) '$.Group',DisplaySequence int '$.DisplaySequence',
				MinValue float '$.MinValue',MaxValue float '$.MaxValue',ValueLookup varchar(150) '$.ValueLookup') 
    
		END TRY  
		BEGIN CATCH  
			SELECT   
				ERROR_NUMBER() AS ErrorNumber  
			   ,ERROR_MESSAGE() AS ErrorMessage,@currLabtestId 'LabTestId', @currLabtestName 'LabTestName', @currTestCompsJson 'ComponentJson' ;  
		END CATCH  



 Delete from TEMP_LabTestForJson where LabTestId=@currLabtestId

END


DECLARE @TempDistinctComponent TABLE
(
   Component varchar(200)
);

INSERT INTO 
    @TempDistinctComponent 
Select distinct Component from @FinalTable;

WHILE EXISTS(Select 1 from @TempDistinctComponent)
BEGIN

Declare @componentName varchar(200), @Unit varchar(200), 
		@ValueType varchar(200), 
		@ControlType varchar(50),
        @Range varchar(80),
        @RangeDescription varchar(200),
        @Method varchar(200),
        @ValueLookup varchar(150),
        @MinValue int,
        @MaxValue int,
        @DisplaySequence int,
        @Indent bit,
		@GroupName varchar(80),
		@ComponentId int, @LabTestId bigint

SET @componentName=(Select Top 1 Component from @TempDistinctComponent)

Select Top 1 @Unit=Unit, @ValueType = ValueType, 
	@ControlType=ControlType, @Range = Range, @RangeDescription= RangeDescription, 
	@Method = Method, @ValueLookup=ValueLookup, @DisplaySequence = DisplaySequence, @Indent=Indent, 
	@MinValue = MinValue, @MaxValue = MaxValue
 from @FinalTable
where Component=@componentName;


Insert into [dbo].[Lab_MST_Components](ComponentName,Unit,ValueType,ControlType,Range,RangeDescription,Method,ValueLookup,MinValue,MaxValue)
values (@componentName,@Unit,@ValueType,@ControlType,@Range,@RangeDescription,@Method,@ValueLookup,@MinValue,@MaxValue);


SET @ComponentId = (Select ComponentId from [dbo].[Lab_MST_Components] where ComponentName=@componentName);

Declare @CompInLabTests table(LabtestId bigint)

Insert into @CompInLabTests
Select Distinct LabTestId from @FinalTable
Where Component=@componentName 

	WHILE EXISTS(Select 1 from @CompInLabTests)
	BEGIN
		SET @LabTestId = (Select Top 1 LabtestId from @CompInLabTests);

		SET @DisplaySequence = (Select DisplaySequence from @FinalTable where LabTestId=@LabTestId AND Component=@componentName);

		SET @Indent = (Select Indent from @FinalTable where LabTestId=@LabTestId AND Component=@componentName);

		 SET @GroupName = (Select GroupName from @FinalTable where LabTestId=@LabTestId AND Component=@componentName);

		Insert into [dbo].[Lab_MAP_TestComponents](LabTestId,ComponentId,DisplaySequence,Indent, GroupName)
		values (@LabTestId,@ComponentId,@DisplaySequence,@Indent, @GroupName);

		Delete from @CompInLabTests where LabtestId=@LabTestId;

	END


--Select Top(1) * from @FinalTable where 
SET @componentName=(Select Top 1 Component from @TempDistinctComponent)
Delete from @TempDistinctComponent where Component=@componentName;
END

Drop Table TEMP_LabTestForJson

Go

Update [dbo].[Lab_MAP_TestComponents]
set Indent=0 where Indent is Null;
Go

Update [dbo].[Lab_MAP_TestComponents] 
set DisplaySequence=100 where DisplaySequence is Null;
Go

Alter table [dbo].[Lab_MAP_TestComponents]
add IsActive bit;
Go

Update [dbo].[Lab_MAP_TestComponents]
set IsActive = 1;
Go

Alter table [dbo].[Lab_MST_Components]
add DisplayName varchar(200);
Go

Update [dbo].[Lab_MST_Components]
set DisplayName = ComponentName;
Go

--sud:17May-19-- below query shouldn't be there because it'll delete the column even when data transfer is not completed--
--IF EXISTS (SELECT 1
--               FROM   INFORMATION_SCHEMA.COLUMNS
--               WHERE  TABLE_NAME = 'LAB_LabTests'
--                      AND COLUMN_NAME = 'LabTestComponentsJSON'
--                      AND TABLE_SCHEMA='DBO')
--  BEGIN
--      ALTER TABLE LAB_LabTests
--        DROP COLUMN LabTestComponentsJSON
--  END
--GO
--End: Anish 28 April, LabTestComponentJSON moved to newly created component table and their respective mapping table---


-----START: Rusha 29th April '19, Recreated script of Invoice Billing Report of Pharmacy Module -----
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_BillingReport]  Script Date: 04/29/2019 10:24:07 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMReport_BillingReport] 
		@FromDate datetime = null,
		@ToDate datetime = null,
	    @InvoiceNumber int = null
		 
AS
/*
FileName: [SP_PHRMReport_BillingReport]
CreatedBy/date: Umed/2018-02-23
Description: To get the Details Such As ItemName, ItemCode, Expiry, PurchaseRate, PurchaseValue,SalesRate, SalesValue of Each Item Against Each Invoice Number
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1       Umed/2018-02-23	                 created the script
                                    (To get the Details Such As ItemName, ItemCode, Expiry, PurchaseRate, PurchaseValue,SalesRate, SalesValue of Each Item Against Each Invoice Number)
2		Rusha/2019-04-29				Recreated pf the Script
----------------------------------------------------------------------------
*/

BEGIN

 IF (@FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @InvoiceNumber != 0)
	BEGIN
			SELECT CONVERT(DATE,inv.CreateOn) AS [Date],inv.InvoicePrintId,pat.PatientCode AS HospitalNo,CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) AS PatientName,
			CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS UserName,inv.DiscountAmount,inv.TotalAmount,inv.PaymentMode
			FROM PHRM_TXN_Invoice AS  inv
			JOIN PAT_Patient AS pat ON pat.PatientId=inv.PatientId
			JOIN EMP_Employee as emp on inv.CreatedBy = emp.EmployeeId
			WHERE inv.InvoicePrintId = @InvoiceNumber and CONVERT (datetime, inv.CreateOn) BETWEEN ISNULL(@FromDate,GETDATE()) AND ISNULL(@ToDate,GETDATE())+1
			GROUP BY CONVERT(DATE,inv.CreateOn),inv.InvoicePrintId,pat.FirstName,pat.MiddleName,pat.LastName,
			emp.FirstName,emp.MiddleName,emp.LastName,inv.DiscountAmount,inv.TotalAmount,pat.PatientCode,inv.PaymentMode		       

		END
	 ELSE IF (@InvoiceNumber = 0)
	 BEGIN
			SELECT CONVERT(DATE,inv.CreateOn) AS [Date],inv.InvoicePrintId,pat.PatientCode AS HospitalNo,CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) AS PatientName,
			CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS UserName,inv.DiscountAmount,inv.TotalAmount,inv.PaymentMode
			FROM PHRM_TXN_Invoice AS  inv
			JOIN PAT_Patient AS pat ON pat.PatientId=inv.PatientId
			JOIN EMP_Employee as emp on inv.CreatedBy = emp.EmployeeId
			WHERE CONVERT (datetime, inv.CreateOn) BETWEEN ISNULL(@FromDate,GETDATE()) AND ISNULL(@ToDate,GETDATE())+1
			GROUP BY CONVERT(DATE,inv.CreateOn),inv.InvoicePrintId,pat.FirstName,pat.MiddleName,pat.LastName,
			emp.FirstName,emp.MiddleName,emp.LastName,inv.DiscountAmount,inv.TotalAmount,pat.PatientCode,inv.PaymentMode		       
	END
END
GO
-----END: Rusha 29th April '19, Recreated script of Invoice Billing Report of Pharmacy Module -----
-----START: Sanjit 30th April '19, Added ParentServiceDepartmentId in master Service department Table and flags for OT or procedure in BIL -----

ALTER TABLE [dbo].[BIL_MST_ServiceDepartment]
ADD [ParentServiceDepartmentId] int;
GO

ALTER TABLE [dbo].[BIL_CFG_BillItemPrice]
ADD [IsOT] bit,[IsProc] bit,[Category] varchar(55);
GO

-----END: Sanjit 30th April '19, Added ParentServiceDepartmentId in master Service department Table and flags for OT or procedure in BIL -----

-----Start: Hom 30th April '19, Added stored procedure to display fraction report -----

/****** Object:  StoredProcedure [dbo].[SP_FRC_GetTotalFractionByDoctor]    Script Date: 4/30/2019 5:10:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO




CREATE PROCEDURE [dbo].[SP_FRC_GetTotalFractionByDoctor]
@FromDate Date=null ,
@ToDate Date=null	
AS
BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
BEGIN
 Select   ISNULL(emp.Salutation+' ','')+ emp.FirstName+ISNULL(' '+emp.MiddleName,'')+' '+ emp.LastName 'DoctorName',
 emp.EmployeeId,
 billingItems.ItemName,
 billingItems.TotalAmount as 'Price',
 frac.FinalAmount as 'FractionAmount',
 frac.CreatedOn from FRC_FractionCalculation frac
join BIL_TXN_BillingTransactionItems billingItems on frac.BillTxnItemId= billingItems.BillingTransactionItemId
join EMP_Employee emp on emp.EmployeeId= frac.DoctorId
where CONVERT(date,frac.CreatedOn) between @FromDate and @ToDate
order by frac.CreatedOn
END
END
GO

/****** Object:  StoredProcedure [dbo].[SP_FRC_GetTotalFractionbyItem]    Script Date: 4/30/2019 5:11:04 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[SP_FRC_GetTotalFractionbyItem]
AS
BEGIN
 Select itm.ItemId,itm.ItemName, billingItems.ServiceDepartmentName, itm.Price, SUM(frac.FinalAmount) as 'FractionAmount' from FRC_FractionCalculation frac
join BIL_TXN_BillingTransactionItems billingItems on frac.BillTxnItemId= billingItems.BillingTransactionItemId
join BIL_CFG_BillItemPrice itm on billingItems.ItemId= itm.ItemId 
where billingItems.ServiceDepartmentId=itm.ServiceDepartmentId and itm.isFractionApplicable= 1 
group by itm.ItemId, itm.ItemName, billingitems.ServiceDepartmentName, itm.Price
order by itm.ItemId
END
GO

-----END: Hom 30th April '19, Added stored procedure to display fraction report -----


---Anish: 4 May 2019, Added CoreCFG paramerter to show/hide the loggedIn user signature in Lab Report---
  Insert Into CORE_CFG_Parameters
  Values('LAB','ShowLoggedInUserSignatory','false','boolean','To show the signature of Current LoggedIn User in Lab Report','custom'); 
  Go
---Anish: 4 May 2019, Added CoreCFG paramerter to show/hide the loggedIn user signature in Lab Report---


-----START: Rusha 5th May '19, Recreated script of Credit In/Out Patient Based on Patient Vist Type Report of Pharmacy Module -----

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_LedgerCredit_IndoorOutdoorPatient]   Script Date: 05/05/2019 9:58:38 AM ******/
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
----------------------------------------------------------------------------
*/
BEGIN
	IF (@FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @IsInOutPat=1)
			BEGIN
				SELECT CONVERT(date,inv.CreateOn) AS [Date],inv.InvoicePrintId AS InvoiceNum,pat.PatientCode,
				CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) AS PatientName,pat.Address,inv.PaidAmount,inv.VisitType 
				FROM PHRM_TXN_Invoice AS inv
				JOIN PAT_Patient AS pat ON pat.PatientId = inv.PatientId
				WHERE inv.VisitType='outpatient' AND  inv.PaymentMode='credit' and CONVERT(date, inv.CreateOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
				GROUP BY CONVERT(date,inv.CreateOn),pat.FirstName,pat.MiddleName,pat.LastName,pat.PatientCode,inv.PaidAmount,inv.VisitType, inv.InvoicePrintId,pat.Address 
			END
			ELSE IF (@IsInOutPat=0)
			BEGIN
				select CONVERT(date,inv.CreateOn) AS [Date],inv.InvoicePrintId AS InvoiceNum,pat.PatientCode,
				CONCAT_WS(' ',pat.FirstName,pat.MiddleName,pat.LastName) as PatientName,pat.Address,inv.PaidAmount,inv.VisitType 
				from PHRM_TXN_Invoice AS inv
				join PAT_Patient AS pat ON pat.PatientId = inv.PatientId
				where inv.VisitType='inpatient' AND  inv.PaymentMode='credit'and CONVERT(date,inv.CreateOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
				group by CONVERT(date,inv.CreateOn),pat.FirstName,pat.MiddleName,pat.LastName,pat.PatientCode,inv.PaidAmount,inv.VisitType, inv.InvoicePrintId,pat.Address 
			END
END
GO
-----END: Rusha 5th May '19, Recreated script of Credit In/Out Patient Based on Patient Vist Type Report of Pharmacy Module -----

-----START: Yubraj 3rd May '19, Added Tables 1. Handover 2. Denomination-----
CREATE TABLE [BIL_MST_Handover] (
    HandoverId  INT IDENTITY(1,1)  Primary Key NOT NULL,
    UserId int,
	CounterId int,
	HandoverType varchar(50),
	HandoverUserId int,
	PreviousAmount float,
	HandoverAmount float,
	TotalAmount float,
	CreatedBy int,
	CreatedOn datetime);
go

CREATE TABLE [BIL_TXN_Denomination] (
    DenominationId int IDENTITY(1,1)  Primary Key NOT NULL,
    HandoverId  INT FOREIGN KEY REFERENCES BIL_MST_Handover(HandoverId) ,
    CurrencyType int,
	Quantity int,
	Amount float);
go

-----END: Yubraj 3rd May '19, Added Tables 1. Handover 2. Denomination-----

--Anish:Start 12 May, 2019- Parameter for veerification Page Added--
Insert Into CORE_CFG_Parameters
 Values('LAB','LabReportVerificationNeededB4Print','false','boolean','Required is the verification step is needed','system'); 
Go

Alter table [dbo].[LAB_TestRequisition]
Add IsVerified bit null,VerifiedBy int null, VerifiedOn DateTime null
Go
--Anish END--

-----START: Rusha 13th May '19, Created script of Report of Drug according to Category Wise of Pharmacy Module -----

/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_DrugCategoryWiseReport] Script Date: 05/13/2019 9:51:11 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[SP_PHRMReport_DrugCategoryWiseReport] 
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
		WHERE CONVERT(DATE,invitm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and cat.CategoryName = @Category
	END
END
GO

-----END: Rusha 13th May '19, Created script of Report of Drug according to Category Wise of Pharmacy Module -----

-----START: Yubraj 13th May '19, Added Stored_Procedure for denomination/Handover report details-----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_Bill_BillDenomination]	--- [SP_Report_BIL_DoctorReport] '2018-08-08','2018-08-08'
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@UserId int=null
AS

BEGIN
    IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)

    BEGIN
        SELECT
		u.UserName 'UserName',
		hu.UserName 'HandoverUser',
		h.HandoverType 'HandoverType',
		h.HandoverUserId 'HandoverUserId',
		h.HandoverAmount 'HandoverAmount',
		h.CreatedOn 'CreatedOn'

		from RBAC_User u
		join BIL_MST_Handover h on u.UserId=h.UserId
		join RBAC_User hu on hu.UserId=h.HandoverUserId
        WHERE u.UserId=@UserId
		ORDER BY h.CreatedOn DESC
    END
END
GO
--Permission and Route config for Reports/BillingMain/Denomination Page
INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('reports-billingmain-denominationReport-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='RPT'),1,GETDATE(),1)
GO
INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Denomination','Reports/BillingMain/Denomination','Denomination',(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='reports-billingmain-denominationReport-view'),(SELECT RouteId FROM RBAC_RouteConfig WHERE UrlFullPath='Reports/BillingMain'),'fa fa-money fa-stack-1x text-white',1,1,25)
GO

-----END: Yubraj 13th May '19, Added Stored_Procedure for denomination/Handover report details-----

-----START: Yubraj 14th May '19, Alter Stored_Procedure for [SP_Report_Bill_BillDenomination] details-----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Bill_BillDenomination]	--- [SP_Report_BIL_DoctorReport] '2018-08-08','2018-08-08'
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@UserId int=null
AS

BEGIN
    IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)

    BEGIN
        SELECT
		u.UserName 'UserName',
		hu.UserName 'HandoverUser',
		h.HandoverType 'HandoverType',
		h.HandoverUserId 'HandoverUserId',
		h.HandoverAmount 'HandoverAmount',
		h.CreatedOn 'CreatedOn'

		from RBAC_User u
		join BIL_MST_Handover h on u.UserId=h.UserId
		join RBAC_User hu on hu.UserId=h.HandoverUserId
        WHERE u.UserId=@UserId AND CONVERT(date,h.CreatedOn) between @FromDate AND @ToDate
		ORDER BY h.CreatedOn DESC
    END
END
GO
-----END: Yubraj 14th May '19, Alter Stored_Procedure for [SP_Report_Bill_BillDenomination] details-----
--START: Salakha 15th May '19,Added Automatic and manual transfer for accounting 
INSERT INTO [dbo].[CORE_CFG_Parameters]
           ([ParameterGroupName]
           ,[ParameterName]
           ,[ParameterValue]
           ,[ValueDataType]
           ,[Description])
     VALUES
           ('Accounting' ,'AccountingTransfer'
           ,'{"ManualTransfer":true,"AutomaticTransfer":true}'
           ,'JSON'
           ,'To enable manual or accounting transfer to accounting')
GO
--END: Salakha 15th May '19,Added Automatic and manual transfer for accounting ---
---Start: Hom 15th May '19, Added a column in both PatientVisits and PatientInsuranceInfo table---
ALTER TABLE [dbo].[PAT_PatientInsuranceInfo]
ADD [IMISCode] varchar(50);
GO

ALTER TABLE [dbo].[PAT_PatientVisits]
ADD [ClaimCode] varchar(50);
GO

--End: Hom 15th May '19, Added a column in both PatientVisits and PatientInsuranceInfo table---
---Start: Sanjit 15th May '19, Added a column in Patient table---
ALTER TABLE [dbo].[PAT_Patient]
ADD [DialysisCode] int;
GO
---Start: Sanjit 15th May '19, Added a column in Patient table---

---start: sud:16May'19--for Lab-External Vendors--
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Lab_MST_LabVendors](
	[LabVendorId] [int] IDENTITY(1,1) NOT NULL,
	[VendorCode] [varchar](20) NULL,
	[VendorName] [varchar](200) NULL,
	[IsExternal] [bit] NOT NULL,
	[ContactAddress] [nvarchar](200) NULL,
	[ContactNo] [nvarchar](20) NULL,
	[Email] [nvarchar](50) NULL,
	[Remarks] [varchar](500) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[IsActive] [bit] NOT NULL,
	IsDefault Bit Not Null,
 CONSTRAINT [PK_LabVendors] PRIMARY KEY CLUSTERED 
(
	[LabVendorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Lab_MST_LabVendors] ADD  CONSTRAINT [DEF_IsExternal]  DEFAULT ((0)) FOR [IsExternal]
GO

ALTER TABLE [dbo].[Lab_MST_LabVendors] ADD  CONSTRAINT [DEF_CreatedOn]  DEFAULT (getdate()) FOR [CreatedOn]
GO

ALTER TABLE [dbo].[Lab_MST_LabVendors] ADD  CONSTRAINT [DEF_IsActive]  DEFAULT ((1)) FOR [IsActive]
GO
GO

Alter Table Lab_TestRequisition
Add ResultingVendorId INT;
GO
---End: sud:16May'19--for Lab-External Vendors--

-----START: Yubraj 16th May '19, Adding Parameter value in Core_CFG_Parameter details-----
Insert into CORE_CFG_Parameters(
ParameterGroupName,
ParameterName,
ParameterValue,
ValueDataType,
Description,
ParameterType)

Values(
'Visit',
'CountryPriceCategory',
'{"HomeCountryId":1,"SAARCCountryIds":[2,15,21,78,160,106,130]}',
'JSON','Country Price Category according to home country, SAARC country and Foreigner','system')
GO
-----END: Yubraj 16th May '19, Adding Parameter value in Core_CFG_Parameter details-----

--Anish:Start 17 May 2019, Added main Internal Vendor---
Insert into [dbo].[Lab_MST_LabVendors] (VendorCode,VendorName,IsExternal,IsActive,IsDefault,CreatedBy)
values('INTERNAL','Lab Internal', 0, 1, 1, 1);
Go

Update [dbo].[LAB_TestRequisition]
set ResultingVendorId = (Select LabVendorId from [dbo].[Lab_MST_LabVendors] where IsDefault=1);
Go
--Anish:End 17 May 2019
--Sanjit: Start 17 May 2019, Added Foreign Exchange Rate in CoreCFGParameters--
INSERT INTO [dbo].[CORE_CFG_Parameters]
           ([ParameterGroupName]
           ,[ParameterName]
           ,[ParameterValue]
           ,[ValueDataType]
           ,[Description]
           ,[ParameterType])
     VALUES
           ('Billing'
           ,'ExchangeRate'
           ,'123'
           ,'number'
           ,'Exchange Rate for Foreign Transaction'
           ,'custom')
GO
ALTER TABLE dbo.BIL_TXN_BillingTransaction ADD
  ExchangeRate int NULL
GO
--Sanjit: End 17 May 2019, Added Foreign Exchange Rate in CoreCFGParameters--

-----START: Yubraj 17th May '19, Alter Stored_Procedure for [[SP_Report_Bill_BillDenominationAllList]] details-----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[SP_Report_Bill_BillDenominationAllList]	--- [[SP_Report_Bill_BillDenominationAllList]] '2018-08-08','2018-08-08'
	@FromDate DateTime=null,
	@ToDate DateTime=null
AS

BEGIN
    IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)

    BEGIN
        SELECT
		u.UserId 'UserId',
		u.UserName 'UserName',
		hu.UserName 'HandoverUser',
		h.HandoverType 'HandoverType',
		h.HandoverUserId 'HandoverUserId',
		h.HandoverAmount 'HandoverAmount',
		h.CreatedOn 'CreatedOn'

		from RBAC_User u
		join BIL_MST_Handover h on u.UserId=h.UserId
		join RBAC_User hu on hu.UserId=h.HandoverUserId
        WHERE CONVERT(date,h.CreatedOn) between @FromDate AND @ToDate
		ORDER BY h.CreatedOn DESC
    END
END
GO
-----END: Yubraj 14th May '19, Alter Stored_Procedure for [[SP_Report_Bill_BillDenominationAllList]] details-----

--Start: ANish 18 May '19, MaleRange, FemaleRange and ChildRange addition in Component Table--
Alter table [dbo].[Lab_MST_Components]
add MaleRange varchar(80), FemaleRange varchar(80), ChildRange varchar(80); 
Go

Update [dbo].[Lab_MST_Components] 
set MaleRange = Range, FemaleRange = Range;
Go
--End: Anish 18 May '19---

--Start: ANish 19 May '19--
Insert Into CORE_CFG_Parameters
Values('LAB','ShowRangeInRangeDescription','false','boolean','Show the exact range description that is used while Validation','custom'); 
Go

IF NOT EXISTS (SELECT 1
               FROM   INFORMATION_SCHEMA.COLUMNS
               WHERE  TABLE_NAME = 'Lab_MAP_TestComponents'
                      AND COLUMN_NAME = 'GroupName'
                      AND TABLE_SCHEMA='DBO')
  BEGIN
       Alter table [dbo].[Lab_MAP_TestComponents]
	   add  GroupName varchar(80);
  END
GO
--End: Anish 19 May '19---


-----START: Yubraj 21st May '19, Alter Stored_Procedure for [[SP_Report_Bill_BillDenominationAllList]] details-----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
alter PROCEDURE [dbo].[SP_Report_Bill_BillDenominationAllList]	--- [[SP_Report_Bill_BillDenominationAllList]] '2018-08-08','2018-08-08'
	@FromDate DateTime=null,
	@ToDate DateTime=null
AS

BEGIN
    IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)

    BEGIN
        SELECT
		u.EmployeeId 'UserId',
		u.FirstName 'FirstName',
		u.MiddleName 'MiddleName',
		u.LastName 'LastName',

		hu.FirstName 'hFirstName',
		hu.MiddleName 'hMiddleName',
		hu.LastName 'hLastName',

		h.HandoverType 'HandoverType',
		h.HandoverUserId 'HandoverUserId',
		h.HandoverAmount 'HandoverAmount',
		h.CreatedOn 'CreatedOn',
		d.ServiceDepartmentName 'DepartmentName'

		from EMP_Employee u
		join BIL_MST_Handover h on u.EmployeeId=h.UserId
		join EMP_Employee hu on hu.EmployeeId=h.HandoverUserId
		join BIL_MST_ServiceDepartment d on u.DepartmentId = d.DepartmentId
		 
        WHERE CONVERT(date,h.CreatedOn) between @FromDate AND @ToDate
		ORDER BY h.CreatedOn DESC
    END
END
GO
-----END: Yubraj 21st May '19, Alter Stored_Procedure for [[SP_Report_Bill_BillDenominationAllList]] details-----


-----START: Yubraj 21st May '19, Alter Stored_Procedure for [SP_Report_Bill_BillDenomination] details-----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Bill_BillDenomination]	--- [SP_Report_BIL_DoctorReport] '2018-08-08','2018-08-08'
	@FromDate DateTime=null,
	@ToDate DateTime=null,
	@UserId int=null
AS

BEGIN
    IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)

    BEGIN
        SELECT
		u.EmployeeId 'UserId',
		u.FirstName 'FirstName',
		u.MiddleName 'MiddleName',
		u.LastName 'LastName',

		hu.FirstName 'hFirstName',
		hu.MiddleName 'hMiddleName',
		hu.LastName 'hLastName',

		h.HandoverType 'HandoverType',
		h.HandoverUserId 'HandoverUserId',
		h.HandoverAmount 'HandoverAmount',
		h.CreatedOn 'CreatedOn',
		d.ServiceDepartmentName 'DepartmentName'

		from EMP_Employee u
		join BIL_MST_Handover h on u.EmployeeId=h.UserId
		join EMP_Employee hu on hu.EmployeeId=h.HandoverUserId
		join BIL_MST_ServiceDepartment d on u.DepartmentId = d.DepartmentId

        WHERE u.EmployeeId=@UserId AND CONVERT(date,h.CreatedOn) between @FromDate AND @ToDate
		ORDER BY h.CreatedOn DESC
    END
END
GO
-----END: Yubraj 21st May '19, Alter Stored_Procedure for [SP_Report_Bill_BillDenomination] details-----

---Start: Salakha 21st May '19, Update CheckoutTime for inPatient bed calculation
update CORE_CFG_Parameters
set ParameterValue = '00:00'
where ParameterGroupName = 'ADT' and ParameterName = 'CheckoutTime'
Go
-----End: Salakha 21st May '19, Update CheckoutTime for inPatient bed calculation



---Start: Rusha 23rd May '19, Remove date filter and handled quantity not equals to zero

/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]    Script Date: 05/23/2019 10:12:30 AM ******/
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
1.		Rusha/05-23-2019						Remove From and to Date for date filter and handled quantity not equals to zero
----------------------------------------------------------------------------
*/
BEGIN
IF(@Status IS NOT NULL)
		BEGIN
		SELECT * FROM
		(
			SELECT convert(date,x.CreatedOn) as [Date], x.ItemName, x.BatchNo, x.ExpiryDate, Round(x.MRP,2,0) AS MRP, x.GRItemPrice,
			SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x.StoreName,x.GoodReceiptItemId,x.StoreId,x.ItemId,x.Price,x.GoodReceiptPrintId
			FROM

			(SELECT gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.CreatedOn,stk.StoreName,gr.GoodReceiptItemId,stk.StoreId,stk.ItemId,stk.Price,gri.GoodReceiptPrintId,
			SUM(CASE WHEN InOut = 'in' THEN Quantity ELSE 0 END) AS 'InQty',
			SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty',
			SUM(CASE WHEN InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
			SUM(CASE WHEN InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
			FROM [dbo].[PHRM_StoreStock] AS stk
			INNER JOIN PHRM_GoodsReceiptItems AS gr ON gr.ItemId = stk.ItemId and gr.BatchNo= stk.BatchNo and gr.GoodReceiptItemId = stk.GoodsReceiptItemId
			INNER JOIN PHRM_GoodsReceipt AS gri ON  gr.GoodReceiptId = gri.GoodReceiptId
			WHERE stk.IsActive = 'true'
			GROUP BY gr.ItemName, gr.BatchNo, gr.ExpiryDate, gr.MRP, gr.GRItemPrice, gr.FreeQuantity,gr.CreatedOn,stk.StoreName,gr.GoodReceiptItemId,
			stk.StoreId,stk.ItemId,stk.Price,gri.GoodReceiptPrintId) AS x
			WHERE (@Status=x.ItemName or x.ItemName like '%'+ISNULL(@Status,'')+'%')
							  
			GROUP BY x.ItemName, x.BatchNo, x.ExpiryDate, MRP, x.GRItemPrice,x.CreatedOn,x.StoreName,
			x.GoodReceiptItemId,x.StoreId,x.ItemId,x.Price,x.GoodReceiptPrintId) as y
			WHERE AvailableQty > 0
		END		
END
GO
---END: Rusha 23rd May '19,Remove date filter and handled quantity not equals to zero

--Start: ANish: 23 May 2019--
Alter table [dbo].[Lab_MAP_TestComponents]
  Add IndentationCount int;
  Go

  Update [dbo].[Lab_MAP_TestComponents]
  set IndentationCount = 1 where Indent=1;
  Update [dbo].[Lab_MAP_TestComponents]
  set IndentationCount = 0 where Indent=0;
  Go

   IF EXISTS (SELECT 1
               FROM   INFORMATION_SCHEMA.COLUMNS
               WHERE  TABLE_NAME = 'Lab_MAP_TestComponents'
                      AND COLUMN_NAME = 'Indent'
                      AND TABLE_SCHEMA='DBO')
  BEGIN
      ALTER TABLE Lab_MAP_TestComponents
        DROP COLUMN Indent
  END
  GO

Insert Into CORE_CFG_Parameters
Values('LAB','ShowCultureIntermediateResults','true','boolean','Show the Intermediate results of Culture tests in report','custom'); 
Go
--End: Anish: 23 May 2019--

--Start: Hom: 23 May 2019--   Added Routing and permission in ward module for pharmacy and inventory

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('wardsupply-pharmacy-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='WARD'),1,GETDATE(),1)
GO

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Pharmacy','WardSupply/Pharmacy','Pharmacy',(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='wardsupply-pharmacy-view'),(SELECT RouteId FROM RBAC_RouteConfig WHERE UrlFullPath='WardSupply'),Null,1,1,Null)
GO

UPDATE RBAC_RouteConfig 
SET UrlFullPath='WardSupply/Pharmacy/Requisition', ParentRouteId=(SELECT RouteId From RBAC_RouteConfig where UrlFullPath='WardSupply/Pharmacy')
WHERE UrlFullPath='WardSupply/Requisition'
GO
UPDATE RBAC_RouteConfig 
SET UrlFullPath='WardSupply/Pharmacy/Stock', ParentRouteId=(SELECT RouteId From RBAC_RouteConfig where UrlFullPath='WardSupply/Pharmacy')
WHERE UrlFullPath='WardSupply/Stock'
GO
UPDATE RBAC_RouteConfig 
SET UrlFullPath='WardSupply/Pharmacy/Consumption', ParentRouteId=(SELECT RouteId From RBAC_RouteConfig where UrlFullPath='WardSupply/Pharmacy')
WHERE UrlFullPath='WardSupply/Consumption'
GO
UPDATE RBAC_RouteConfig 
SET UrlFullPath='WardSupply/Pharmacy/PharmacyTransfer', ParentRouteId=(SELECT RouteId From RBAC_RouteConfig where UrlFullPath='WardSupply/Pharmacy')
WHERE UrlFullPath='WardSupply/PharmacyTransfer'
GO
UPDATE RBAC_RouteConfig 
SET UrlFullPath='WardSupply/Pharmacy/Reports', ParentRouteId=(SELECT RouteId From RBAC_RouteConfig where UrlFullPath='WardSupply/Pharmacy')
WHERE UrlFullPath='WardSupply/Reports'
GO
  
INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('wardsupply-inventory-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='WARD'),1,GETDATE(),1)
GO
 INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('wardsupply-inventory-stock-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='WARD'),1,GETDATE(),1)
GO

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('wardsupply-inventory-requisition-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='WARD'),1,GETDATE(),1)
GO  
INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Stock','WardSupply/Inventory/Stock','Stock',(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='wardsupply-inventory-stock-view'),(SELECT RouteId FROM RBAC_RouteConfig WHERE UrlFullPath='WardSupply/Inventory'),Null,1,1,Null)
GO

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Inventory','WardSupply/Inventory','Inventory',(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='wardsupply-inventory-view'),(SELECT RouteId FROM RBAC_RouteConfig WHERE UrlFullPath='WardSupply'),Null,1,1,Null)
GO

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Inventory Requisition','WardSupply/Inventory/InventoryRequisitionList','InventoryRequisitionList',(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='wardsupply-inventory-requisition-view'),(SELECT RouteId FROM RBAC_RouteConfig WHERE UrlFullPath='WardSupply/Inventory'),Null,1,1,Null)
GO

ALter table WARD_Stock 
Alter column WardId int null
GO
ALter table WARD_Stock
Add StockType varchar (50)
GO

Alter table Ward_Stock
Add DepartmentId int null
GO

Update WARD_Stock
set StockType='pharmacy'
GO

----End: Hom: 23 May 2019----

----START: Hom: 24th May 2019--Setting Route Config for WardSupply/Inventory and WardSupply/Inventory/Stock----
UPDATE RBAC_RouteConfig SET ParentRouteId= (Select RouteId from RBAC_RouteConfig where UrlFullPath='WardSupply') 
WHERE UrlFullPath='WardSupply/Inventory'

UPDATE RBAC_RouteConfig SET ParentRouteId= (Select RouteId from RBAC_RouteConfig where UrlFullPath='WardSupply/Inventory') 
WHERE UrlFullPath='WardSupply/Inventory/Stock'
----END: Hom: 24th May 2019--Setting Route Config for WardSupply/Inventory and WardSupply/Inventory/Stock----

--Anish: Start 26 May 2019, Display sequence added in employee table--
Alter table [dbo].[EMP_Employee]
add DisplaySequence int null;
Go
--Anish: End 26 May 2019--


--Start: Rusha 27th May '19, updated report of common stock level by itemwise of inventory report
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId]    Script Date: 05/27/2019 11:10:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId] 
		@ItemId int = 0 
AS

BEGIN
		If(@ItemId > 0)
			BEGIN
				SELECT itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						SUM(gdrp.FreeQuantity) AS BudgetedQuantity, 
						SUM(gdrp.ItemRate) AS ItemRate,
						gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				WHERE stk.ItemId = @ItemId
				GROUP BY itm.ItemName,stk.BatchNO,gdrp.CreatedOn
			END
        ELSE 
		    BEGIN
				SELECT itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						SUM(itm.MinStockQuantity) AS MinimumQuantity,
						SUM(gdrp.FreeQuantity) AS BudgetedQuantity, 
						SUM(gdrp.ItemRate) AS ItemRate,
						gdrp.CreatedOn
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				GROUP BY itm.ItemName,stk.BatchNO,gdrp.CreatedOn
			END 
END
GO
--ended by Suraj on 25th December | Modification on table-- 
--updated report by Rusha/ 05/26/2019  |  Get minimum quantity stock, free quantity and created date and time

--End: Rusha 27th May '19, updated report of common stock level by itemwise of inventory report


--Start: Salakha 28th May '19,Added Coulumns in BIL_Txn_BillingTransactionItems
Alter table BIL_Txn_BillingTransactionItems
Add ModifiedBy int null,
ModifiedOn DateTime null
Go
--End: Salakha 28th May '19,Added Coulumns in BIL_Txn_BillingTransactionItems


----------Start: 28th May 2019  Dinesh : Added ReferredByDoctor in Department Summary Report  -------------------------------

-----1. [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] 

/****** Object:  View [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]    Script Date: 5/27/2019 6:43:08 PM ******/
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
FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO

------------------2. FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional---------------------------------------


/****** Object:  UserDefinedFunction [dbo].[FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional]    Script Date: 5/27/2019 5:37:24 PM ******/
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
3.    Dinesh /27th May'19					Added ReferredByDoctor 
-------------------------------------------------------------------------------
*/
RETURNS TABLE
AS
RETURN
(

	
		WITH AllItems AS
			(

			Select  pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ','') + pat.LastName 'PatientName',
			CASE WHEN ProviderId IS NOT NULL
					 --sud:31Jan'19--Isnull check for Salutation (needed for ER Doctor: Duty Doctor)--
					THEN ISNULL(emp.Salutation + '. ','') + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS DoctorName,
				CASE WHEN RequestedBy IS NOT NULL
					 --sud:31Jan'19--Isnull check for Salutation (needed for ER Doctor: Duty Doctor)--
					THEN ISNULL(refemp.Salutation + '. ','') + refemp.FirstName + ' ' + ISNULL(refemp.MiddleName + ' ','') + refemp.LastName
					ELSE NULL 
				END AS ReferredDoctorName,

			  txnItemInfo.* from VW_BIL_TxnItemsInfoWithDateSeparation txnItemInfo 

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
					   , ProviderId, DoctorName AS 'ProviderName',ReferredDoctorName as 'ReferredDoctorName',InvoiceNumber ,

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
						  , ProviderId,  DoctorName AS 'ProviderName',ReferredDoctorName as 'ReferredDoctorName',InvoiceNumber ,
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
						  , ProviderId,  DoctorName AS 'ProviderName',ReferredDoctorName as 'ReferredDoctorName',InvoiceNumber ,
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
						  , ProviderId,  DoctorName AS 'ProviderName',ReferredDoctorName as 'ReferredDoctorName',InvoiceNumber ,
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
						  , ProviderId,  DoctorName AS 'ProviderName',ReferredDoctorName as 'ReferredDoctorName',InvoiceNumber ,
						 3 as DisplaySeq
			FROM AllItems
			WHERE  BillStatus='unpaid'  AND  ReturnDate  BETWEEN @StartDate and @EndDate
			

)
GO
-----------------3. [SP_Report_BIL_DepartmentItemSummary]-----------------------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DepartmentItemSummary]    Script Date: 5/27/2019 4:28:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BIL_DepartmentItemSummary]
--[SP_Report_BIL_DepartmentItemSummary] '01-22-2018','01-22-2019',NULL
@ToDate DATETIME = NULL,
@FromDate DATETIME = NULL,
@SrvDeptName NVARCHAR(MAX) = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
2		Ramavtar/30Nov'18		added summary and filtered report data for provisional and cancel
3       Sud/13Mar'19            Changed to function FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional 
                                  from: FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary
4.      Dinesh/27th May'19		Added ReferredDoctorName 
----------------------------------------------------------
*/
BEGIN
	SELECT
		fnItems.BillingDate 'Date',
		--COALESCE(fnItems.ReturnDate, fnItems.CancelledDate, fnItems.PaidDate, fnItems.CreditDate, fnItems.ProvisionalDate) 'Date',
		ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
		ISNULL(fnItems.ReferredDoctorName, 'NoDoctor') AS 'ReferredDoctorName',
		pat.PatientCode,
		pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
		[dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (fnItems.ServiceDepartmentName,ItemName) AS 'ServiceDepartmentName',
		--fnItems.ServiceDepartmentName,  ---sud:13Mar'19--changed to above
		fnItems.ItemName,
		fnItems.Price,
		fnItems.Quantity,
		fnItems.SubTotal,
		fnItems.DiscountAmount,
		fnItems.TotalAmount,
		fnItems.ReturnTotalAmount 'ReturnAmount',
		fnItems.TotalAmount - fnItems.ReturnTotalAmount 'NetAmount'
	FROM (SELECT
			* FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate)
			 WHERE BillingType !='CreditReceived'
			 ---sud:13Mar'19--changed to above
		     --FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
		     --WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional'

		) fnItems


	JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
    WHERE [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (fnItems.ServiceDepartmentName,ItemName) = @SrvDeptName
	      --WHERE fnItems.ServiceDepartmentName = @SrvDeptName ---sud:13Mar'19--changed to above

	ORDER BY 1 DESC
--table2: provisional, cancel, credit amounts for summary
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
	WHERE ServiceDepartmentName = @SrvDeptName
END
GO

---4.[dbo].[SP_Report_BIL_DepartmentSummary]-------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DepartmentSummary]    Script Date: 5/28/2019 12:36:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- SP_Report_BIL_DepartmentSummary '2019-05-24','2019-05-24'
ALTER PROCEDURE [dbo].[SP_Report_BIL_DepartmentSummary] -- SP_Report_BIL_DepartmentSummary '2019-04-14','2019-05-14'
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
2		Ramavtar/30Nov'18		added summary and filtered report data for provisional and cancel
3       Sud/13Mar'19            Changed to function FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional 
                                  from: FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary
4.		Dinesh/ 28th May'19		Added Credit Received amount in summary as previously it was not cleared and taking from previous dates
----------------------------------------------------------
*/
BEGIN
	--table1: report data
	 SELECT
	    [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (ServiceDepartmentName,ItemName) 'ServiceDepartment',
		--fnItems.ServiceDepartmentName 'ServiceDepartment',
		SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
		SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
		SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
		SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
		SUM(ISNULL(fnItems.ReturnTotalAmount, 0)) 'ReturnAmount',
	    SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnTotalAmount, 0)) AS 'NetSales',
	    SUM(ISNULL(CreditAmount, 0)) AS 'CreditAmount',
		SUM(ISNULL(CreditReceived, 0)) AS 'CreditReceivedAmount'

	FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate)  fnItems

	GROUP BY  
	  [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (ServiceDepartmentName,ItemName) 
	ORDER BY 1
	--SELECT
	--	fnItems.ServiceDepartmentName 'ServiceDepartment',
	--	SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
	--	SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
	--	SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
	--	SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
	--	SUM(ISNULL(fnItems.ReturnAmount, 0)) 'ReturnAmount',
	--	SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) 'NetSales'
	--FROM (SELECT
	--	*
	--FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
	--WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional') fnItems
	--GROUP BY fnItems.ServiceDepartmentName
	--ORDER BY 1
	--table2: provisional, cancel, credit amounts for summary
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(CreditReceived, 0)) FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate,@ToDate))  AS 'CreditReceivedAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
END
GO
----------End: 28th May 2019  Dinesh : Added ReferredByDoctor in Department Summary Report  -------------------------------

--Anish:start: 29 May 2019 NeighbourhoodCardDetail table added--
Create Table PAT_NeighbourhoodCardDetail(
	NeighbourhoodCardId INT IDENTITY(1,1) Constraint PK_NeighbourhoodCardId Primary Key NOT NULL,
	PatientId INT NOT NULL,
	PatientCode varchar(10),
	CreatedBy INT,
	CreatedOn DATETIME,
	ModifiedBy INT,
	ModifiedOn DATETIME,
);
Go

Alter table [dbo].[LAB_TestRequisition]
add HasInsurance bit null;
Go
--Anish: End: 29 May 2019--

----Start: Rusha 30th May '19, create script and write-off report in inventory module------
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Inventory');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('inventory-reports-WriteOff-view',@AppnID_Settings,'true','1', GETDATE());
GO

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Inventory/Reports');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'inventory-reports-WriteOff-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,Css,DefaultShow,IsActive)
Values ('Write Off','Inventory/Reports/WriteOff',@OwnPerId,@ParentId,'WriteOff','fa fa-money fa-stack-1x text-white',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1)
GO

update RBAC_RouteConfig
set Css = 'fa fa-money fa-stack-1x text-white'
where RouteId = 230
GO 

update RBAC_RouteConfig
set Css = 'fa fa-money fa-stack-1x text-white'
where RouteId = 231
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_WriteOffReport]   Script Date: 05/29/2019 4:37:52 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_Inventory_WriteOffReport] 
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
				CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS RequestedBy,witm.Remark 
				FROM INV_TXN_WriteOffItems AS witm
				JOIN INV_MST_Item AS itm ON itm.ItemId = witm.ItemId
				JOIN EMP_Employee AS emp ON emp.EmployeeId = witm.CreatedBy
				WHERE witm.ItemId = @ItemId
			END
        ELSE 
		    BEGIN
				SELECT witm.WriteOffDate,itm.ItemName, witm.BatchNO, witm.WriteOffQuantity,witm.ItemRate,witm.TotalAmount, 
				CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS RequestedBy,witm.Remark 
				FROM INV_TXN_WriteOffItems AS witm
				JOIN INV_MST_Item AS itm ON itm.ItemId = witm.ItemId
				JOIN EMP_Employee AS emp ON emp.EmployeeId = witm.CreatedBy
			END 
END
GO

----End: Rusha 30th May '19, create script and write-off report in inventory module----

-----Dinesh : start : 30th May'19: Segregated PAP Smear, Cytology, FNAC,slide consultation, bone marrow and Histopathology from Lab Items On Department Summary Report-----------

--------------------5. [FN_BIL_GetSrvDeptReportingName_DepartmentSummary]----------------------
/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary]    Script Date: 5/30/2019 10:58:08 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptReporingName  Created: 22Aug'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Reports as per Input ServiceDepartmentName
 Remarks: We can extend this function for ItemName as well if needed.
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/22Aug'18                        Initial Draft
 2.       Dinesh/10Sept'18                    passing itemname along with srvDeptName to the function
 3.		  dinesh /14thSep'18                  grouped and  merged the labcharges and miscellaneous to the respective single view header 
 4.       Dinesh/30thMay'19					  Segregated the lab's FNAC, Cytology, Pap Smear etc
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( 
 CASE
       						 
When @ServiceDeptName='EMERGENCY' 
	  OR @ServiceDeptName='ROOM CHARGES'  
	  Then ('EMERGENCY')                                
When @ServiceDeptName='MEDICINE PROCEDURE' 
	  Then ('MEDICINE')                        
When @ServiceDeptName='LAPROSCOPIC SURGERY'                        
      OR @ServiceDeptName='BIRIATRIC SURGERY'                          
      OR @ServiceDeptName='SURGICAL OPERATIONS'                        
      OR @ServiceDeptName='SURGICAL PROCEDURES'                        
      OR @ServiceDeptName='CRANIAL SURGERY'                            
      OR @ServiceDeptName='SPINAL SURGERY'                             
      OR @ServiceDeptName='PLASTIC SURGERY, BODY SCULPTURE'            
      OR @ServiceDeptName='BREAST'                                     
      OR @ServiceDeptName='BURN SURGERY'                               
      OR @ServiceDeptName='EYE SURGERY'                                
      OR @ServiceDeptName='FACE LIFT'                                  
      OR @ServiceDeptName='GENERAL PLASTIC SURGERY'                    
      OR @ServiceDeptName='HAND SURGERY'                               
      OR @ServiceDeptName='RHINOPLASTY'                                
      OR @ServiceDeptName='TISSUE EXPANDERS'                           
      OR @ServiceDeptName='LIPS & PALATE'                              
      OR @ServiceDeptName='MAXILLA FRACTURES'                          
      OR @ServiceDeptName='MAXILO FACIAL'                              
      OR @ServiceDeptName='NOSE SURGERY'                               
      OR @ServiceDeptName='ARTHROPLASTY'                               
      OR @ServiceDeptName='SPINE SURGERY'                              
      OR @ServiceDeptName='SURGERY CHARGES(PAEDIATRIC)'                
      OR @ServiceDeptName='SURGERY CHARGES (PAEDIATRIC)'               
      OR @ServiceDeptName='DEVICE IMPLANTATION'                        
      OR @ServiceDeptName='General Surgery' 
	  Then ('SURGERY') 
	  When   
	  @ServiceDeptName='GYNAECOLOGY PROCEDURE(OPD ONLY)' and @ItemName='HYDROTUBATION PER CYCLE'
	 OR @ServiceDeptName='OT Minor Procedure Charges OBGY' and @ItemName='Hydrotubation (GA)'  
	 THEN ('HYDROTUBATION')        
	   When   
	  @ServiceDeptName='X-RAY' and @ItemName='HSG'
	 OR @ServiceDeptName='OT Minor Procedure Charges OBGY' and @ItemName='HSG'  
	 THEN ('HSG')   
	  
	 WHEN @ServiceDeptName='NON INVASIVE CARDIOlOGY' and @ItemName='Fetal ECHO'  
	 THEN ('FETAL ECHO')   
	             
WHEN @ServiceDeptName='OT Major Procedure Charges OBGY'            
      OR @ServiceDeptName='OT Minor Procedure Charges OBGY'            
      OR @ServiceDeptName='GENITALS'                                   
      OR @ServiceDeptName='GYNAECOLOGY'                                
      OR @ServiceDeptName='GYNAECOLOGY PROCEDURE(OPD ONLY)'            
      OR @ServiceDeptName='OT GYNAE PROCEDURE INDOOR' 
	  Then ('OBGY')
WHEN @ServiceDeptName='MANDIBULAR DEFORMITY'                       
      OR @ServiceDeptName='FIXED ORTHODONTIC TREATMENT'                
      OR @ServiceDeptName='MAMMOLOGY'                                  
      OR @ServiceDeptName='EXTERNAL FIXATOR APP'                       
      OR @ServiceDeptName='AMPUTATIONS'                                
      OR @ServiceDeptName='MANDIBLE FRACTURES'                         
      OR @ServiceDeptName='Ortho Procedures'                           
      OR @ServiceDeptName='MAMMOGRAPHY' 
	  THEN ('ORTHOPEDIC')
WHEN @ServiceDeptName='SKIN PROCEDURE'  
	  THEN ('DERMATOLOGY')
 WHEN @ServiceDeptName='PAEDIATRIC'                                 
      OR @ServiceDeptName='Warmer Charges'                             
      OR @ServiceDeptName='Delivery Attend'  
	  THEN ('PEDIATRIC')
WHEN @ServiceDeptName='FACIAL NERVE (UNILATERAL)'                  
      OR @ServiceDeptName='NEUROLOGY'
	  THEN ('NEUROLOGY')
WHEN @ServiceDeptName='CARDIOVASCULAR SURGERY'                     
      OR @ServiceDeptName='CORONARY/PERIPHERAL ANGIOGPRAPHY'           
      OR @ServiceDeptName='PROCEDURES IN CATH LAB'  
	  THEN ('CTVS')
WHEN @ServiceDeptName='OPHTHALMOLOGY'
	  THEN ('EYE')
WHEN @ServiceDeptName='ENT Surgeries under L.A.'                   
      OR @ServiceDeptName='ENT Surgeries under G.A.'                   
      OR @ServiceDeptName='EYE PROCEDURE'                              
      OR @ServiceDeptName='EARS SURGERY'                               
      OR @ServiceDeptName='ENT OPERATION'                              
      OR @ServiceDeptName='ENT PROCEDURES' 
	  THEN ('ENT')
WHEN @ServiceDeptName='UROLOGICAL OPERATION'                       
      OR @ServiceDeptName='URETHRAL STRICTURES'  
	  THEN ('UROLOGY')
WHEN @ServiceDeptName='ANASTHESIA'  
	  THEN ('ANAESTHESIA')
WHEN @ServiceDeptName='OT'                                         
      OR @ServiceDeptName='UROLOGY PACKAGE' 
	  THEN ('OT')
WHEN @ServiceDeptName='DEXA'                                       
      OR @ServiceDeptName='IMAGING'                                    
      OR @ServiceDeptName='MRI'                                        
      OR @ServiceDeptName='C.T. SCAN'                                  
      OR @ServiceDeptName='ULTRASOUND'                                 
      OR @ServiceDeptName='ULTRASOUND COLOR DOPPLER'                   
      OR @ServiceDeptName='X-RAY'                                      
      OR @ServiceDeptName='DUCT'                                       
      OR @ServiceDeptName='PERFORMANCE TEST '   
	  THEN ('RADIOLOGY')
WHEN @ServiceDeptName='PHYSIOTHERAPY'
	  THEN ('PHYSIOTHERAPY')
WHEN @ServiceDeptName='BMD-BONEDENSITOMETRY'  
	  THEN ('BONEDENSITOMETRY')
WHEN @ServiceDeptName='ELECTROPHYSIOLOGY STUDIES'
	  THEN ('ELECTROPHYSIOLOGY STUDIES') 
	  -----LAB Items 
 when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
 when (@ServiceDeptName='LABORATORY' and @ItemName='HISTO')  THEN ('HISTOPATHOLOGY') 
 when (@ServiceDeptName='CYTOLOGY' and  @ItemName like '%bone marrow%' ) 
 OR (@ServiceDeptName='LABORATORY' and  @ItemName like '%bone marrow%' ) 
  THEN ('BONE MARROW') 
   when (@ServiceDeptName='CYTOLOGY' and  @ItemName like '%slide consultation%' ) 
 OR (@ServiceDeptName='LABORATORY' and  @ItemName like '%slide consultation%' ) 
  THEN ('SLIDE CONSULTATION') 
   when (@ServiceDeptName='EXTERNAL LAB - 1' and @ItemName like '%FNAC%' )
    OR (@ServiceDeptName='LABORATORY' and @ItemName like '%FNAC%')  
	OR (@ServiceDeptName='CYTOLOGY' and @ItemName like '%FNAC%') 
	THEN ('FNAC') 
 when (@ServiceDeptName='CYTOLOGY' )  THEN ('CYTOLOGY') 
 when (@ServiceDeptName='ATOMIC ABSORTION')
					OR(@ServiceDeptName='BIOCHEMISTRY')
					OR(@ServiceDeptName='CLNICAL PATHOLOGY')
					OR(@ServiceDeptName='CLINICAL PATHOLOGY')
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
WHEN @ServiceDeptName='AMBULANCE CHARGES' 
	  THEN('AMBULANCE')
WHEN @ServiceDeptName='DIETARY CHARGES' 
	  THEN('DIETARY')
WHEN @ServiceDeptName='DENTISTRY' 
	  THEN ('DENTISTRY')           
WHEN @ServiceDeptName='NEPHROLOGY'                                 
      OR @ServiceDeptName='NEPHROLOGY/ PACKAGES'  
	  THEN ('NEPHROLOGY')
WHEN @ServiceDeptName='OPD CONSULTATION'  
	  OR @ServiceDeptName='OPD'
	  THEN ('OPD')                         
WHEN @ServiceDeptName='NON INVASIVE CARDIOlOGY' 
	  THEN ('NON INVASIVE CARDIOlOGY')                         
WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName = 'BED CHARGES')  
	  OR (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' and @ItemName ='ICU')
	  OR (@ServiceDeptName='Bed Charges')
	  OR @ServiceDeptName='ICU'  
	  THEN ('BED CHARGES')
WHEN @ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE'
	  THEN ('DOCTOR ROUND CHARGES')
WHEN @ServiceDeptName='PULMONOLOGY '
	  THEN ('PULMONOLOGY')	 
WHEN @ServiceDeptName='GASTROENTEROLOGY'
	  THEN ('GASTROENTEROLOGY') 
WHEN @ServiceDeptName='IPD'	
	  THEN ('ADMISSIONS FEE') 
WHEN @ServiceDeptName='Procedure Charge'	
	  THEN ('PROCEDURE CHARGES')
WHEN @ServiceDeptName='THORACIC SURGICAL PROCEDURES' 
	  THEN ('THORACIC SURGICAL PROCEDURES') 	  
WHEN @ServiceDeptName='PSYCHO TEST: PAPER PENCIL TEST'             
      OR @ServiceDeptName='THERAPY CHARGES'                            
      OR @ServiceDeptName='SIMPLE EXTRACTION'                          
      OR @ServiceDeptName='TRANSPORT'                                  
      OR @ServiceDeptName='LITHOTRIPSYS'                
      OR @ServiceDeptName='THORAX'                                     
      OR @ServiceDeptName='G.I.T.'                                     
      OR @ServiceDeptName='SOFT TISSUE TUMOR SURGERY'                  
      OR @ServiceDeptName='DAY CARE OPERATION'
	  OR @ServiceDeptName='CONSUMEABLES'
	  OR @ServiceDeptName='CONSULTATION CHARGES FOR PRIVATE PATIENT' 
	  OR @ServiceDeptName='OPG-ORTHOPANTOGRAM'                         
      OR @ServiceDeptName='RECONSTRUCTIVE PROCEDURES'          
      OR @ServiceDeptName='LYMPHOEDEMA'  
	  THEN ('ADMINISTRATION')
WHEN @ServiceDeptName='MISCELLENOUS CHARGES'               
      OR @ServiceDeptName='MISCELLANEOUS' 
	  THEN ('MISCELLANEOUS')                 
WHEN @ServiceDeptName='MEDICAL RESIDENT AND NURSING'               
	  THEN ('MEDICAL RESIDENT AND NURSING')                                      

		  ELSE (@ServiceDeptName) END 
		 )

END

GO
-----Dinesh : end : 30th May'19: Segregated PAP Smear, Cytology, FNAC,slide consultation, bone marrow and Histopathology from Lab Items on Department Summary Report-----------

----Start: Rusha 30th May '19, create script and Return to vendor report in inventory module----
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_ReturnToVendorReport] ' '   Script Date: 05/30/2019 2:47:16 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_Inventory_ReturnToVendorReport] 
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
				rtn.Remark,CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS ReturnedBy 
				FROM INV_TXN_ReturnToVendorItems AS rtn
				JOIN INV_MST_Vendor AS ven ON ven.VendorId = rtn.VendorId
				JOIN EMP_Employee AS emp ON emp.EmployeeId = rtn.CreatedBy
				JOIN INV_MST_Item AS itm ON itm.ItemId = rtn.ItemId
				WHERE rtn.VendorId = @VendorId
			END
        ELSE 
		    BEGIN
				SELECT rtn.CreatedOn,ven.VendorName,rtn.CreditNoteNo,itm.ItemName, rtn.Quantity,rtn.ItemRate,rtn.TotalAmount,
				rtn.Remark,CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS ReturnedBy 
				FROM INV_TXN_ReturnToVendorItems AS rtn
				JOIN INV_MST_Vendor AS ven ON ven.VendorId = rtn.VendorId
				JOIN EMP_Employee AS emp ON emp.EmployeeId = rtn.CreatedBy
				JOIN INV_MST_Item AS itm ON itm.ItemId = rtn.ItemId
			END 
END
GO

declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Inventory');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('inventory-reports-ReturnToVendor-view',@AppnID_Settings,'true','1', GETDATE());
GO

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Inventory/Reports');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'inventory-reports-ReturnToVendor-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,Css,DefaultShow,IsActive)
Values ('Return To Vendor','Inventory/Reports/ReturnToVendor',@OwnPerId,@ParentId,'ReturnToVendor','fa fa-money fa-stack-1x text-white',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1)
GO

----End: Rusha 30th May '19, create script and Return to vendorreport in inventory module----




----Start: Sanjit 31st  May '19, create table WARD_INV_Consumption for Inventory Consumption in WardSupply----
/****** Object:  Table [dbo].[WARD_INV_Consumption]    Script Date: 5/31/2019 1:16:52 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WARD_INV_Consumption](
	[ConsumptionId] [int] IDENTITY(1,1) NOT NULL,
	[DepartmentId] [int] NOT NULL,
	[ItemId] [int] NOT NULL,
	[ItemName] [varchar](200) NULL,
	[Quantity] [int] NULL,
	[Remark] [varchar](100) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[DepartmentName] [varchar](200) NULL,
	[UsedBy] [varchar](50) NULL,
 CONSTRAINT [PK_WARD_INV_Consumption] PRIMARY KEY CLUSTERED 
(
	[ConsumptionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('wardsupply-inventory-consumption-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='WARD'),1,GETDATE(),1)
GO  
INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Consumption','WardSupply/Inventory/Consumption','Consumption',(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='wardsupply-inventory-consumption-view'),(SELECT RouteId FROM RBAC_RouteConfig WHERE UrlFullPath='WardSupply/Inventory'),Null,1,1,Null)
GO
----END: Sanjit 31st  May '19, create table WARD_INV_Consumption for Inventory Consumption in WardSupply----


----SUD-31May: MNK -- RAN UPTO HERE FOR FINAL DB-- 2:11 PM--

----Start: Rusha 31st May '19, create script and permission and icon for patient neighbourhood card details in report module----

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_PAT_NeighbourhoodCardDetail]   Script Date: 05/31/2019 2:25:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_BIL_PAT_NeighbourhoodCardDetail]  		
	@FromDate datetime=null,
	@ToDate datetime=null		
AS
/*
FileName: [SP_Report_BIL_PAT_NeighbourhoodCardDetail]
CreatedBy/date: Rusha/05-31-2019
Description: To  get details of patient for neighbourhood card report
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/05-31-2019					   get details of patient for neighbourhood card report
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT CONVERT(date,ncd.CreatedOn) AS IssuedDate,ncd.PatientId, ncd.PatientCode AS HospitalNo, 
			CONCAT_WS(' ',pat.FirstName, pat.MiddleName,pat.LastName) AS PatientName,
			pat.Gender, pat.DateOfBirth,CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS RequestedBy
			FROM PAT_NeighbourhoodCardDetail AS ncd
			JOIN PAT_Patient AS pat ON pat.PatientId = ncd.PatientId
			JOIN EMP_Employee AS emp ON emp.EmployeeId = ncd.CreatedBy
			WHERE CONVERT(date, ncd.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END	
END
GO

declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Reports');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('reports-billingmain-patientneighbourhoodcarddetails-view',@AppnID_Settings,'true','1', GETDATE());
GO

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Reports/BillingMain');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'reports-billingmain-patientneighbourhoodcarddetails-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,Css,DefaultShow,IsActive)
Values ('Patient Neighbourhood Card Details','Reports/BillingMain/PatientNeighbourhoodCardDetails',@OwnPerId,@ParentId,'PatientNeighbourhoodCardDetails','fa fa-money fa-stack-1x text-white',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1)
GO
----End: Rusha 31st May '19, create script and permission and icon for patient neighbourhood card details in report module ----

--Start: Anish: 1 June: Column array added for Lab Grids and routing config of external labs--

Insert into CORE_CFG_Parameters
values('LAB','ListRequisitionGridColumns','["Requisition Date","Hospital Number","Patient Name","Age/Sex","Phone Number","Requesting Dept.","Visit Type","Run Number Type","Action"]','array','Which Column to show in lab listRequisition','system');
Go

Insert into CORE_CFG_Parameters
values('LAB','AddResultResultGridColumns','["Hospital No.","Patient Name","Age/Sex","Phone Number","Test Name","Category","Requesting Dept.","Run No.","Bar Code","Actions"]','array','Which Column to show in lab Add Result Page','system');
Go

Insert into CORE_CFG_Parameters
values('LAB','PendingReportGridColumns','["Hospital No.","Patient Name","Age/Sex","Phone Number","Test Name","Requesting Dept.","Run Num","BarCode Num","Action"]','array','Which Column to show in Lab Pending Result Page','system');
Go

Insert into CORE_CFG_Parameters
values('LAB','FinalReportGridColumns','["Hospital No.","Patient Name","Age/Sex","Phone Number","Test Name","Report Generated By","Requesting Dept.","Run Num","Is Printed","Action"]','array','Which Column to show in Lab FinalReport Grid Page','system');
Go

declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Lab');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('external-lab-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Lab');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'external-lab-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,Css,DisplaySeq,IsActive)
Values ('External Labs','Lab/ExternalLabs/TestList',@OwnPerId,@ParentId,'ExternalLabs',1,'',9,1);


Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1);
Go

Insert into CORE_CFG_Parameters
values('LAB','AllowLabReportToPrintOnProvisional','false','boolean','Allow to print report of Outpatient with provisional status in Lab','custom');
Go

--End: Anish: 1 June: Column array added for Lab Grids and routing config of external labs--

--SHANKAR: 2June2019 5PM----deployed in MNK on 2June upto here---

--Start: ANish 2 June: Default signatories for Radiology--
Insert into CORE_CFG_Parameters
values('Radiology','DefaultSignatoriesEmployeeId','{"empIdList":[103,104]}','JSON','Default employees for Radiology signatories','system');
Go
--End: Anish 2 June--

--START: Yubraj 2 June: Adding column in BillingTransactionItems table--
Alter table [dbo].BIL_TXN_BillingTransactionItems add ProvisionalReceiptNo int null;
Go 

Alter table [dbo].BIL_TXN_BillingTransactionItems add ProvisionalFiscalYearId int null;
Go 
--END: Yubraj 2 June: Adding column in BillingTransactionItems table--

--START: Yubraj 3rd June: Parameterizing AllowDuplicateItemsEntryInBillingTransaction--
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Billing','AllowDuplicateItemsEntryInBillingTransaction','true','boolean','whether or not to allow entry of duplicate Billing item.','custom')
GO
--END: Yubraj 3rd June:  Parameterizing AllowDuplicateItemsEntryInBillingTransaction--

----Start: Rusha 3rd June '19, create script and permission and icon for dialysis patient details in report module ----

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DialysisPatientDetail]   Script Date: 06/03/2019 10:41:46 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_BIL_DialysisPatientDetail]  		
	@FromDate datetime=null,
	@ToDate datetime=null		
AS
/*
FileName: [SP_Report_BIL_PAT_NeighbourhoodCardDetail]
CreatedBy/date: Rusha/05-31-2019
Description: T oget details report of dialysis patient
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/06-03-2019					   get details report of dialysis patient
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT CONVERT(date,pat.CreatedOn) AS [Date],pat.DialysisCode, pat.PatientCode AS HospitalNo, 
			CONCAT_WS(' ',pat.FirstName, pat.MiddleName,pat.LastName) AS PatientName,
			pat.Gender, pat.Age, CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS RequestedBy
			FROM PAT_Patient AS pat	
			join EMP_Employee as emp on emp.EmployeeId = pat.CreatedBy		
			WHERE pat.DialysisCode is not null AND CONVERT(date, pat.CreatedOn) BETWEEN ISNULL

(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END	
END
GO 

declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Reports');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('reports-billingmain-dialysispatientdetails-view',@AppnID_Settings,'true','1', GETDATE());
GO

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Reports/BillingMain');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'reports-billingmain-dialysispatientdetails-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,Css,DefaultShow,IsActive)
Values ('Dialysis Patient Details','Reports/BillingMain/DialysisPatientDetails',@OwnPerId,@ParentId,'DialysisPatientDetails','fa fa-money fa-stack-1x text-white',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1)
GO

----End: Rusha 3rd June '19, create script and permission and icon for dialysis patient details in report module ----

-----START: NageshBB: 3 Jun 2019: added Bed charges service department id into core parameter table
If exists(select *from CORE_CFG_Parameters where ParameterGroupName='ADT' and ParameterName='Bed_Charges_SevDeptId')
begin
 Update CORE_CFG_Parameters set ParameterValue=142 where ParameterGroupName='ADT' and ParameterName='Bed_Charges_SevDeptId'
end
else
Begin
  Insert into CORE_CFG_Parameters values('ADT','Bed_Charges_SevDeptId',142,'string','This id for get Bed charges service department id where we need',
  'custom')
End
Go
-----END: NageshBB: 3 Jun 2019: added Bed charges service department id into core parameter table

--Start: Anish 4 June: Indication field in Radiology Report Added-- 
Alter table RAD_PatientImagingReport
  add Indication varchar(max);
--End: Anish 4 June--

---Start: Rusha 4th June '19, create script for Report of requisition and dispatch from ward to inventory 
--and added permission and update script of current stock of inventory
--updated script
/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId]   Script Date: 06/04/2019 11:25:48 AM ******/
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
				JOIN INV_TXN_GoodsReceipt as grd on grd.GoodsReceiptID = gdrp.GoodsReceiptId
				JOIN INV_MST_Vendor as ven on ven.VendorId = grd.VendorId
				JOIN INV_MST_Company AS com on com.CompanyId = itm.CompanyId
				GROUP BY com.CompanyName,ven.VendorName,itm.ItemName,stk.BatchNO,gdrp.CreatedOn
			END 
END
GO

--create new script for report
/****** Object:  StoredProcedure [dbo].[SP_WardInv_Report_RequisitionDispatchReport]  '06/03/2019','06/04/2019'  Script Date: 06/04/2019 2:39:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_WardInv_Report_RequisitionDispatchReport]  
	@FromDate datetime=null,
	@ToDate datetime=null
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
			join INV_TXN_DispatchItems as disitm on disitm.DispatchItemsId = reqitm.RequisitionItemId
			join INV_MST_Item as itm on itm.ItemId = reqitm.ItemId
			join MST_Department as dept on dept.DepartmentId = disitm.DepartmentId
			where CONVERT(date, reqitm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END		
End
GO

--add permission and icon
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='WardSupply');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('wardsupply-inventory-requisition-dispatch-reports-view',@AppnID_Settings,'true','1', GETDATE());
GO

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'WardSupply/Inventory/Reports');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'wardsupply-inventory-requisition-dispatch-reports-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,Css,DefaultShow,IsActive)
Values ('Requisition Dispatch Report','WardSupply/Inventory/Reports/RequisitionDispatchReport',@OwnPerId,@ParentId,'RequisitionDispatchReport','fa fa-money fa-stack-1x text-white',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1)
GO

---End: Rusha 4th June '19, create script for Report of requisition and dispatch from ward to inventory and added permission and update script of current stock of inventory

--START: NageshBB: 04 June 2019 : changed logic of estimation inpatient bill sp 

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
-------------------------------------------------------------------------------
*/

BEGIN
;with a as(
Select Convert(DATE, itm.CreatedOn) 'BillDate'
	  ,dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, 
	   emp.EmployeeId 'DoctorId',
	  IsNull(emp.Salutation+'. ','')+  emp.FirstName+ ISNULL(' '+emp.MiddleName, '')+' ' + emp.LastName 'DoctorName',
	   itm.Price
	   ,
	   case when (@BillTxnId >0 or itm.ModifiedOn is not null ) then 
	   itm.Quantity 
	   else 
	   case WHEN(select ParameterValue from CORE_CFG_Parameters where ParameterGroupName='ADT' and ParameterName='Bed_Charges_SevDeptId')= itm.ServiceDepartmentId then  
	   (SELECT Sum(Quantity)
       FROM   (SELECT   DATEDIFF(day,pbi.StartedOn,( ISNULL(pbi.EndedOn, GETDATE()+1))) AS Quantity
       FROM      ADT_TXN_PatientBedInfo pbi where pbi.PatientId=itm.PatientId and pbi.PatientVisitId=itm.PatientVisitId and  pbi.BedFeatureId=itm.ItemId
        ) AS TOTALS)		   
		ELSE (itm.Quantity)  END
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
--END: NageshBB: 04 June 2019 : changed logic of estimation inpatient bill sp 

---Start: Rusha 4th June '19,add permission for ward -> inventory -> reports
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='WardSupply');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('wardsupply-inventory-reports-view',@AppnID_Settings,'true','1', GETDATE());
GO

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'WardSupply/Inventory');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'wardsupply-inventory-reports-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,IsActive)
Values ('Reports','WardSupply/Inventory/Reports',@OwnPerId,@ParentId,'Reports',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1)
GO
---End: Rusha 4th June '19,add permission for ward -> inventory -> reports

---START: Rusha: June 5th 2019--Setting Route Config for WardSupply/Inventory/Reports ---
UPDATE RBAC_RouteConfig SET ParentRouteId= (Select RouteId from RBAC_RouteConfig where UrlFullPath='WardSupply/Inventory') 
WHERE UrlFullPath='WardSupply/Inventory/Reports'
GO

UPDATE RBAC_RouteConfig SET ParentRouteId= (Select RouteId from RBAC_RouteConfig where UrlFullPath='WardSupply/Inventory/Reports') 
WHERE UrlFullPath='WardSupply/Inventory/Reports/RequisitionDispatchReport'
GO
----END: Rusha: June 5th 2019--Setting Route Config for WardSupply/Inventory/Reports----

---START: Rusha: June 5th 2019--Create Script for transfer report in wardsupply of inventory and add permission ---
/****** Object:  StoredProcedure [dbo].[SP_WardInv_Report_TransferReport]   Script Date: 06/05/2019 1:11:32 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_WardInv_Report_TransferReport]  		
	@FromDate datetime=null,
	@ToDate datetime=null	
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
			FROM WARD_Transaction AS trans
			JOIN WARD_Stock AS stk ON stk.StockId = trans.StockId
			JOIN MST_Department AS dep ON dep.DepartmentId = stk.DepartmentId
			JOIN INV_MST_Item AS itm ON itm.ItemId = stk.ItemId		
			WHERE CONVERT(date, trans.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END	
END
GO

declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='WardSupply');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('wardsupply-inventory-transfer-reports-view',@AppnID_Settings,'true','1', GETDATE());
GO

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'WardSupply/Inventory/Reports');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'wardsupply-inventory-transfer-reports-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,Css,DefaultShow,IsActive)
Values ('Transfer','WardSupply/Inventory/Reports/TransferReport',@OwnPerId,@ParentId,'TransferReport','fa fa-money fa-stack-1x text-white',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1)
GO

---END: Rusha: June 5th 2019--Create Script for transfer report in wardsupply of inventory and add permission ---

----start: sud: 6June'19--- parameter for Free-Referral----------
IF NOT EXISTS(Select 1 from CORE_CFG_Parameters where ParameterGroupName='Billing'
  and ParameterName='ReferralChargeApplicable'
)
BEGIN
INSERT INTO [dbo].[CORE_CFG_Parameters] ([ParameterGroupName] ,[ParameterName]    ,[ParameterValue]     ,[ValueDataType]  ,[Description] ,[ParameterType])
     VALUES
           ('Billing','ReferralChargeApplicable','false','boolean','Charges apply for referral doctor','custom')
END

GO
----end: sud: 6June'19--- parameter for Free-Referral----------

---START: Rusha: June 6th 2019--Updated Script of daily dispatch report of inventory and add received column for dispatch items ---
ALTER TABLE INV_TXN_DispatchItems
ADD ReceivedBy varchar(100)
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_DailyItemsDispatchReport]    Script Date: 06/06/2019 11:11:20 AM ******/
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
1       Umed/2017-06-21	                   created the script
2		Rusha/2019-06-06					updated the script
-------------------------------------------------------
*/
BEGIN

		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 OR (@DepartmentName IS NOT NULL) OR LEN(@DepartmentName) > 0)
				BEGIN
						SELECT CONVERT(date,dis.CreatedOn) AS [Date],dept.DepartmentName,itm.ItemName,dis.DispatchedQuantity,dis.ReceivedBy,
						CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS DispatchedBy 
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
---END: Rusha: June 6th 2019--Updated Script of daily dispatch report of inventory and add received column for dispatch items ---

-- START --Yubraj -- 9th June 2019 -- Update ProvisionalFiscalYearId of all provisional items in billingtranscationitems table---

Alter Table BIL_TXN_BillingTransactionItems DISABLE TRIGGER TRG_BillToAcc_BillingTxnItem
GO
Update BIL_TXN_BillingTransactionItems
set ProvisionalFiscalYearId= (
Case WHEN CreatedOn BETWEEN '2018-07-16 23:59:59.000' AND '2019-07-16 00:00:00.000' THEN 2
ELSE 1 END)
WHERE BillStatus='provisional' and ProvisionalReceiptNo is null and BillingTransactionId is null
GO

Alter Table BIL_TXN_BillingTransactionItems ENABLE TRIGGER TRG_BillToAcc_BillingTxnItem
GO


Alter Table BIL_TXN_BillingTransactionItems DISABLE TRIGGER TRG_BillToAcc_BillingTxnItem
GO

---Update all data with ProvisionalReceipt Number
Declare @currFiscalYearId int;
Declare @startYear DateTime;
Declare @endYear DateTime;
Declare @currPatientId BigInt;
Declare @provisionalReceiptNo int;
Declare @distinctDate Date;

Select FiscalYearId,StartYear,EndYear into FiscalYearIDTable from BIL_CFG_FiscalYears;

--Loop through Each Fiscal Year--
While EXISTS(Select 1 from FiscalYearIDTable)
BEGIN
	set @currFiscalYearId = (Select top 1 FiscalYearId from FiscalYearIDTable);

	set @provisionalReceiptNo = (Select CASE WHEN MAX([ProvisionalReceiptNo]) IS NULL THEN 1 
	ELSE MAX([ProvisionalReceiptNo]) + 1 END  FROM BIL_TXN_BillingTransactionItems where ProvisionalFiscalYearId = @currFiscalYearId);

	select distinct PatientId, convert(date, CreatedOn) 'BillDate' , count(*) 'cnt' into TempPatBill
	from BIL_TXN_BillingTransactionItems
	where BillStatus='provisional'  and BillingTransactionId Is Null and ProvisionalReceiptNo Is Null 
	AND ProvisionalFiscalYearId=@currFiscalYearId
	group by PatientId, convert(date, CreatedOn)
	order by BillDate

		While EXISTS(Select 1 from TempPatBill)
		BEGIN
	
		set @distinctDate = (Select top 1 BillDate from TempPatBill);
		set @currPatientId = (Select top 1 PatientId from TempPatBill);
		
		Update BIL_TXN_BillingTransactionItems
		set ProvisionalReceiptNo = @provisionalReceiptNo 
		where PatientId = @currPatientId and convert(date, CreatedOn) = @distinctDate and ProvisionalReceiptNo Is Null and ProvisionalFiscalYearId = @currFiscalYearId;
		Delete from TempPatBill where PatientId = @currPatientId and BillDate = @distinctDate;
		
		set @provisionalReceiptNo = @provisionalReceiptNo + 1;

		END

	Delete from FiscalYearIDTable where FiscalYearId = @currFiscalYearId;
	Drop table TempPatBill;
END

Drop table FiscalYearIDTable;

Alter Table BIL_TXN_BillingTransactionItems ENABLE TRIGGER TRG_BillToAcc_BillingTxnItem
GO
-- END --Yubraj -- 9th June 2019 -- Update ProvisionalFiscalYearId of all provisional items in billingtranscationitems table---

---MNK-Deployed Upto Here for Build_1.17.4-- on 10th June 2019 -- Shankar---



-- START --Hom -- 10th June 2019 --Parameterize whether to show Hospital Logo and QR Code in all Billing Recepts---
Insert Into CORE_CFG_Parameters
Values('Billing','ShowQRCode','true','boolean','To ensure whether QR should be displayed in Billing Receipts','custom')
Go

Insert Into CORE_CFG_Parameters
Values('Billing','ShowLogo','true','boolean','To ensure whether Hospital Logo should be displayed in Billing Receipts','custom')
Go

-- END --Hom -- 10th June 2019 -- 

---START --11th June '19-- Yubraj --Setting Permisision and route configuration for Provisional receipt Tab--
INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('billing-duplicate-invoice-provisional-invoice',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='BIL'),1,GETDATE(),1)
GO

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,Css,DefaultShow,IsActive,DisplaySeq)
VALUES ('Provisional Receipts','Billing/DuplicatePrints/ProvisionalReceipt','ProvisionalReceipt',(SELECT PermissionId FROM RBAC_Permission WHERE PermissionName='billing-duplicate-invoice-provisional-invoice'),(SELECT RouteId FROM RBAC_RouteConfig WHERE UrlFullPath='Billing'),Null,1,1,Null)
GO
---END--11th June '19-- Yubraj --Setting Permisision and route configuration for Provisional receipt Tab--

---START --12th June '19-- Sanjit --TDS amount has been added for TDS applicable Suppliers--
GO
ALTER TABLE [dbo].[INV_MST_Vendor]
ADD	[IsTDSApplicable] [bit] 
GO

UPDATE [dbo].[INV_MST_Vendor]
SET [IsTDSApplicable] = 0
where [IsTDSApplicable] is null
GO

ALTER TABLE [dbo].[INV_TXN_GoodsReceipt]
ADD [TDSRate] [decimal] , [TDSAmount] [decimal] , [TotalWithoutTDS] [decimal]
GO

UPDATE [dbo].[INV_TXN_GoodsReceipt]
SET [TDSRate] = 0,[TDSAmount] = 0,[TotalWithoutTDS] = 0
where [TDSRate] is null and [TDSAmount] is null and [TotalWithoutTDS] is null
GO
---END --12th June '19-- Sanjit --TDS amount has been added for TDS applicable Suppliers--

---START--13th June '19-- Yubraj--Update RBAC_RouteConfig table--
Declare @ParentRouteId INT = (SELECT RouteId FROM RBAC_RouteConfig WHERE UrlFullPath='Billing/DuplicatePrints')
Update RBAC_RouteConfig set ParentRouteId=@ParentRouteId, DisplaySeq=5
WHERE UrlFullPath='Billing/DuplicatePrints/ProvisionalReceipt'
GO

---END   --13th June '19-- Yubraj--Update RBAC_RouteConfig table--

---START--13th June '19-- Yubraj--Alter Stored Procedure [SP_TXNS_BILL_SettlementSummary]--
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
       where txnItm.BillStatus='provisional' AND ISNULL(txnItm.ReturnStatus,0) != 1
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

---END--13th June '19-- Yubraj--Alter Stored Procedure [SP_TXNS_BILL_SettlementSummary]--
---START--14th June '19-- Sanjit--Change column TotalWithoutTDS to TotalWithTDS in INV_TXN_GoodsReceipt table--
GO
SP_RENAME 'INV_TXN_GoodsReceipt.TotalWithoutTDS','TotalWithTDS','COLUMN'
GO
---END--13th June '19-- Yubraj--Change column TotalWithoutTDS to TotalWithTDS in INV_TXN_GoodsReceipt table--

---START--16th June '19-- Hom--Parameterize whether whether user should be able to navigate back to appointment from billing receipt once appointment is created--
Insert Into CORE_CFG_Parameters
Values('Appointment','ShowBackButton','true','boolean','To ensure whether user should be able to navigate back to appointment from billing receipt once appointment is created','custom')
Go
---END--16th June '19-- Hom--


-----START: Yubraj 16th June '19, Adding Parameter value in Core_CFG_Parameter details for Department Level appointment-----
Insert into CORE_CFG_Parameters(
ParameterGroupName,
ParameterName,
ParameterValue,
ValueDataType,
Description,
ParameterType)

Values(
'Visit',
'EnableDepartmentLevelAppointment',
'false',
'boolean',
'Enabling or Disabling Department level appointment in Visit Appointment','custom')
GO
-----START: Yubraj 16th June '19, Adding Parameter value in Core_CFG_Parameter details for Department Level appointment-----

---Anish: Start 18 June 2019, Parameter for showing past bill history days in Bill Requisition Page--
Insert into CORE_CFG_Parameters(
ParameterGroupName,
ParameterName,
ParameterValue,
ValueDataType,
Description,
ParameterType)
Values(
'BILL',
'PastBillMaximumDays',
'7',
'number',
'Show past bill history of how much days','custom')
GO
--Anish: End 18 June 2019--

--Start: Rusha/ 18 June 2019: Updated script of Daily Appointment Report
/****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_DailyAppointmentReport]   Script Date: 06/18/2019 11:25:32 AM ******/
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
--------------------------------------------------------
*/
BEGIN
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 AND (@Doctor_Name IS NOT NULL)
        OR (LEN(@Doctor_Name) > 0 AND (@AppointmentType IS NOT NULL)
        OR (LEN(@AppointmentType) > 0)))
		BEGIN
			SELECT
					CONVERT(date, patApp.VisitDate)as 'Date',patApp.VisitTime as 'Time' ,patPait.PatientCode,
						patPait.FirstName + ' ' + patPait.LastName AS Patient_Name,patPait.PhoneNumber,patPait.Age,patPait.Gender,
						 patApp.AppointmentType,patApp.VisitType,
						 patApp.ProviderName AS Doctor_Name,patApp.ProviderId,
					patApp.VisitStatus
				FROM PAT_PatientVisits AS patApp
					INNER JOIN PAT_Patient AS patPait ON patApp.PatientId = patPait.PatientId
					WHERE CONVERT(date, patApp.VisitDate) BETWEEN @FromDate AND @ToDate and 
					patApp.ProviderName LIKE '%' + ISNULL(@Doctor_Name, '') + '%' and
					patApp.AppointmentType LIKE '%' + ISNULL(@AppointmentType, '') + '%'
					/*ORDER BY CONVERT(datetime, CONVERT(date, patApp.VisitDate)) + CONVERT(datetime, patApp.VisitTime) DESC*/

				END
END
GO
--End: Rusha/ 18 June 2019: Updated script of Daily Appointment Report

--Start: Salakha/ 19 June 2019: Created Function to calculate inpatient bed quantity
/****** Object:  UserDefinedFunction [dbo].[FN_Ip_Billing_Bed_Quantity_Calculation]     **/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Salakha
-- Create date: 19/06/2019
-- Description:	Calculates Bed Quantity for inpatient Billing
-- =============================================
CREATE FUNCTION [dbo].[FN_Ip_Billing_Bed_Quantity_Calculation]( @StartDate datetime, @EndDate datetime null, @AdmissionDate datetime)
RETURNS int
AS
BEGIN

	-- Declare the return variable here
	DECLARE @Quantity int;
	DECLARE @CheckOutTime Datetime;
	
	set  @CheckOutTime = CONVERT(DATETIME, CONVERT(CHAR(8), GETDATE(), 112)  + ' ' + CONVERT(CHAR(8), @AdmissionDate, 108));
	
	select @Quantity = case when (@EndDate != null) then (select cast(DATEDIFF(HOUR,@StartDate,@EndDate)as decimal)/24)
						    when (@EndDate IS NULL) then
							 (case when (@CheckOutTime <= GETDATE()) then (select cast((select DATEDIFF(HOUR,@StartDate,@CheckOutTime)) as decimal)/24 + 1)
								  when (@CheckOutTime > GETDATE()) then (select cast((select DATEDIFF(HOUR,@StartDate,@CheckOutTime)) as decimal)/24)
							      else 1 
								  end)
						else 1
						end  
	RETURN @Quantity;

END
GO


------Modify sp for bed quantity calculation-----------

/****** Object:  StoredProcedure [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]    Script Date: 14-07-2019 05:47:50 ******/
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
-------------------------------------------------------------------------------
*/

BEGIN
;with a as(
Select Convert(DATE, itm.CreatedOn) 'BillDate'
	  ,dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, 
	   emp.EmployeeId 'DoctorId',
	  IsNull(emp.Salutation+'. ','')+  emp.FirstName+ ISNULL(' '+emp.MiddleName, '')+' ' + emp.LastName 'DoctorName',
	   itm.Price
	   ,
	   case when (@BillTxnId >0 or itm.ModifiedOn is not null ) then 
	   itm.Quantity 
	   else 
	   case WHEN(select ParameterValue from CORE_CFG_Parameters where ParameterGroupName='ADT' and ParameterName='Bed_Charges_SevDeptId')= itm.ServiceDepartmentId then  
	   (SELECT Sum(Quantity)
       FROM (select ([dbo].[FN_Ip_Billing_Bed_Quantity_Calculation](pbi.StartedOn,pbi.EndedOn,adt.AdmissionDate)) as Quantity
	   -- (SELECT   DATEDIFF(HOUR,pbi.StartedOn,( ISNULL(pbi.EndedOn, GETDATE()+1)))/24 AS Quantity
       FROM      ADT_TXN_PatientBedInfo pbi join ADT_PatientAdmission adt on pbi.PatientVisitId = adt.PatientVisitId
	    where pbi.PatientId=itm.PatientId and pbi.PatientVisitId=itm.PatientVisitId and  pbi.BedFeatureId=itm.ItemId
        ) AS TOTALS)		   
		ELSE (itm.Quantity)  END
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
GO
-----End: Salakha/ 19 June 2019: Created Function to calculate inpatient bed quantity

--Anish: Start 19 June 2019 --
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_BIL_GetPatientPastBills]  --- SP_BIL_GetPatientPastBills 77235, 15
		
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
-----------------------------------------------------------------------------------------
*/
BEGIN

IF( @maxPastDays IS NULL)
   SET @maxPastDays=7


  SELECT itm.CreatedOn,  txn.InvoiceCode + COnvert(varchar(20), txn.InvoiceNo) 'InvoiceNumber', 
    itm.ServiceDepartmentName, itm.ItemName, itm.TotalAmount, itm.BillStatus, emp.FirstName +' '+ emp.LastName 'User'
 FROM BIL_TXN_BillingTransactionItems itm left join BIL_TXN_BillingTransaction txn
   ON itm.BillingTransactionId=txn.BillingTransactionId
 Join EMP_Employee emp 
 ON itm.CreatedBy=emp.EmployeeId
WHERE  itm.PatientId=@PatientId
   and itm.BillStatus !='cancel'
   and  DATEDIFF(DAY,itm.CreatedOn,getdate())   <= @maxPastDays
Order by itm.CreatedOn DESC


END -- end of SP
GO

--Anish: 19 June 2019 End--


---Start: SUd: 19June'19-- For Department Level Appointment (add new Department, Serv-Dept, etc)---

---Add Administration department if not exists---
IF NOT EXISTS(Select 1 from MST_Department WHERE DepartmentName='Administration')
BEGIN
  INSERT INTO MST_Department(DepartmentCode, DepartmentName, Description, IsActive, IsAppointmentApplicable, CreatedBy, CreatedOn)
  Values('ADMIN','ADMINISTRATION','For hospital admins etc..',1,0,1,getdate())
END
GO
Declare @DeptId INT
SET @DeptId=(Select Top 1 DepartmentId from MST_Department where DepartmentName='Administration')

---Add servicedepartment 'Department OPD' in Administration department if not exists---

IF NOT EXISTS(Select 1 from BIL_MST_ServiceDepartment WHERE ServiceDepartmentName='Department OPD')
BEGIN
  INSERT INTO BIL_MST_ServiceDepartment(ServiceDepartmentName, ServiceDepartmentShortName, DepartmentId, CreatedBy, CreatedOn, IsActive, IntegrationName)
  Values('Department OPD','Dept-OPD',@DeptId, 1, GETDATE(),1,'OPD')
END
GO
Declare @SrvDeptId INT
SET @SrvDeptId=(Select Top 1 ServiceDepartmentId from BIL_MST_ServiceDepartment where ServiceDepartmentName='Department OPD')

---Insert DepartmentIds as BillItem Price----
---Take only departments with IsAppointmentApplicable = 1---
Declare @DeptsTbl Table(DeptId INT, DeptName Varchar(200))

Insert into @DeptsTbl(DeptId, DeptName)
SELECT DepartmentId, DepartmentName FROM MST_Department
WHERE IsAppointmentApplicable=1

Declare @CurrDeptId INT;
WHILE EXISTS(Select 1 FROM @DeptsTbl)
BEGIN
 SET @CurrDeptId=(Select TOp 1 DeptId from @DeptsTbl)

 Insert INTO BIL_CFG_BillItemPrice(ServiceDepartmentId, ItemName, ItemId, TaxApplicable, DiscountApplicable, CreatedBy, CreatedOn,IsActive, IsNormalPriceApplicable, InsuranceApplicable, IsInsurancePackage)
 VALUES(@SrvDeptId, 'Consultation Charge', @CurrDeptId, 0, 1, 1,GETDATE(),1,1,0,0)

 Delete FROM @DeptsTbl WHERE DeptId=@CurrDeptId
END
GO

---Add departmentId in Visit table and update existing data--
Alter Table PAT_PatientVisits
Add DepartmentId INT
GO

Update vis
set vis.DepartmentId=emp.DepartmentId
from PAT_PatientVisits vis, EMP_Employee emp
where emp.EmployeeId=vis.ProviderId
GO

---End: SUd: 19June'19-- For Department Level Appointment (add new Department, Serv-Dept, etc)---

---start: sud-20June-19-- Merged from MNK_V3_Live branch for Membership Type----

---START--Shankar-- 19th June 2019-- Altered MembershipTypeName to Unique-----
ALTER TABLE PAT_CFG_MembershipType
ADD UNIQUE (MembershipTypeName)
GO
---End--Shankar-- 19th June 2019-- Altered MembershipTypeName to Unique-----

---End: sud-20June-19-- Merged from MNK_V3_Live branch for Membership Type----

---Start:NageshBB: 20 Jun 2019: Merged R3V1_ServerSideSearch branch to DEV Branch 
--angular migration script is here 
----Here only angular migration version 4 to 7 needed db changes
update RBAC_RouteConfig set UrlFullPath='Scheduling/Manage/ManageWorkingHours' where RouterLink='ManageWorkingHours'  and Permissionid=(select top 1 permissionId from RBAC_Permission where PermissionName ='scheduling-manage-workinghours-view');
Go

--Start:Vikas: 19th June 2019: Added paramter script for get text  length of server side search. 
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
Values('Common','ServerSideSearchCharLength',2,'number','server side search text length.')
GO
--End:Vikas: 19th June 2019: Added paramter script for get text  length of server side search. 
---Start:NageshBB: 20 Jun 2019: Merged R3V1_ServerSideSearch branch to DEV Branch

---START: YUBRAJ: 20TH June'19-- FOR EMERGENCY Department SETTING CUSTOM PARAMETER VALUE ACCORDNIG TO HOSPITAL---
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Common','ERDepartmentName','EMERGENCY/CASUALTY','string','To set the Department for the Emergency.','custom')
GO
---END: YUBRAJ: 20TH June'19-- FOR EMERGENCY Department SETTING CUSTOM PARAMETER VALUE ACCORDNIG TO HOSPITAL---



---Start: Sud: 21June'19--For Followup changes---

Declare @DeptId INT
SET @DeptId=(Select Top 1 DepartmentId from MST_Department where DepartmentName='Administration')

---Add servicedepartment 'Department Followup Charges' in Administration department if not exists---

IF NOT EXISTS(Select 1 from BIL_MST_ServiceDepartment WHERE ServiceDepartmentName='Department Followup Charges')
BEGIN
  INSERT INTO BIL_MST_ServiceDepartment(ServiceDepartmentName, ServiceDepartmentShortName, DepartmentId, CreatedBy, CreatedOn, IsActive, IntegrationName)
  Values('Department Followup Charges','Dept-Followup-Charges',@DeptId, 1, GETDATE(),1,'OPD')
END
GO
Declare @SrvDeptId INT
SET @SrvDeptId=(Select Top 1 ServiceDepartmentId from BIL_MST_ServiceDepartment where ServiceDepartmentName='Department Followup Charges')

---Insert DepartmentIds as BillItem Price----
---Take only departments with IsAppointmentApplicable = 1---
Declare @DeptsTbl Table(DeptId INT, DeptName Varchar(200))

Insert into @DeptsTbl(DeptId, DeptName)
SELECT DepartmentId, DepartmentName FROM MST_Department
WHERE IsAppointmentApplicable=1

Declare @CurrDeptId INT;
WHILE EXISTS(Select 1 FROM @DeptsTbl)
BEGIN
 SET @CurrDeptId=(Select TOp 1 DeptId from @DeptsTbl)

 Insert INTO BIL_CFG_BillItemPrice(ServiceDepartmentId, ItemName, ItemId, TaxApplicable, DiscountApplicable, CreatedBy, CreatedOn,IsActive, IsNormalPriceApplicable, InsuranceApplicable, IsInsurancePackage)
 VALUES(@SrvDeptId, 'Followup Charge', @CurrDeptId, 0, 1, 1,GETDATE(),1,1,0,0)

 Delete FROM @DeptsTbl WHERE DeptId=@CurrDeptId
END
GO



Declare @DeptId INT
SET @DeptId=(Select Top 1 DepartmentId from MST_Department where DepartmentName='Administration')

---Add servicedepartment 'Doctor Followup Charges' in Administration department if not exists---

IF NOT EXISTS(Select 1 from BIL_MST_ServiceDepartment WHERE ServiceDepartmentName='Doctor Followup Charges')
BEGIN
  INSERT INTO BIL_MST_ServiceDepartment(ServiceDepartmentName, ServiceDepartmentShortName, DepartmentId, CreatedBy, CreatedOn, IsActive, IntegrationName)
  Values('Doctor Followup Charges','Doc-Followup-Charges',@DeptId, 1, GETDATE(),1,'OPD')
END
GO
Declare @SrvDeptId INT
SET @SrvDeptId=(Select Top 1 ServiceDepartmentId from BIL_MST_ServiceDepartment where ServiceDepartmentName='Doctor Followup Charges')

---Insert EmployeeID as ItemId in BillItem Price----
---Take only Employees with IsAppointmentApplicable = 1---
Declare @EmpsTbl Table(EmpId INT)

Insert into @EmpsTbl(EmpId)
SELECT EmployeeId FROM EMP_Employee
WHERE IsAppointmentApplicable=1

Declare @CurrEmpId INT;
WHILE EXISTS(Select 1 FROM @EmpsTbl)
BEGIN
 SET @CurrEmpId=(Select TOp 1 EmpId from @EmpsTbl)

 Insert INTO BIL_CFG_BillItemPrice(ServiceDepartmentId, ItemName, ItemId, TaxApplicable, DiscountApplicable, CreatedBy, CreatedOn,IsActive, IsNormalPriceApplicable, InsuranceApplicable, IsInsurancePackage)
 VALUES(@SrvDeptId, 'Followup Charge', @CurrEmpId, 0, 1, 1,GETDATE(),1,1,0,0)

 Delete FROM @EmpsTbl WHERE EmpId=@CurrEmpId
END
GO


Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Appointment','EnablePaidFollowup','false','string','To set whether or not paid followup is allowed for this hospital','custom')
GO
---Start: Sud: 21June'19--For Followup changes---
--Ansih: 21 June--
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Lab','ShowLabBarCodeInReport','true','boolean','To show or hide BarCode in the Report','custom');
GO
--ANish: End--

--Anish: 23 June 2019 Showing Normal, Low, High Flag in LabReport--
Alter table LAB_TXN_TestComponentResult
add AbnormalType varchar(20);
Go

Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('LAB','ShowHighLowNormalFlag','false','boolean','To show or hide High or low or Normal flag in the Report','custom');
GO


--Anish: End 23 June 2019--

--START-- Yubraj : 23rd June 2019 --stored procedure for getting patient visit sticker of required patient--

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].SP_APPT_GetPatientVisitStickerInfo  --- SP_APPT_GetPatientVisitStickerInfo 76
		
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
	usr.UserName 'User'
	 
	from PAT_PatientVisits visit join PAT_Patient pat on pat.PatientId=visit.PatientId
						join MST_CountrySubDivision subCounty on subCounty.CountrySubDivisionId=pat.CountrySubDivisionId
						join MST_Department dep on dep.DepartmentId= visit.DepartmentId
						join RBAC_User usr on usr.EmployeeId=visit.CreatedBy
						
						left join EMP_Employee doc on doc.EmployeeId=visit.ProviderId

						where visit.PatientVisitId=@PatientVisitId
						
END -- end of SP
GO
--START-- Yubraj : 23rd June 2019 --stored procedure for getting patient visit sticker of required patient--

--START--NageshBB: 24 June 2019: null permission id record deleting from RolePermission mapping table
delete from RBAC_MAP_RolePermission
where PermissionId is null 
go
--END--NageshBB: 24 June 2019: null permission id record deleting from RolePermission mapping table

--START--Rusha: 25 June 2019: fixed of RBAC_RouteConfig and add RBAC_Permission of reports in wordsupply under inventory tab
INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('wardsupply-inventory-reports-view',(SELECT ApplicationId FROM RBAC_Application WHERE ApplicationCode='WARD'),1,GETDATE(),1)
GO 

UPDATE RBAC_RouteConfig
SET PermissionId = (SELECT PermissionId FROM RBAC_Permission WHERE PermissionName ='wardsupply-inventory-reports-view')
WHERE UrlFullPath = 'WardSupply/Inventory/Reports'
GO
--END--Rusha: 25 June 2019: fixed of RBAC_RouteConfig and add RBAC_Permission of reports in wordsupply under inventory tab

--START--Rusha: 25 June 2019: Add script for consumption report for wardsupply-inventory and add permimssion id
DECLARE @AppnID_Settings INT
SET @AppnID_Settings = (SELECT ApplicationId FROM [RBAC_Application] WHERE ApplicationName='WardSupply');

INSERT INTO [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
VALUES ('wardsupply-inventory-consumption-report-view',@AppnID_Settings,'true','1', GETDATE());
GO

DECLARE @ParentId INT
DECLARE @OwnPerId INT

SET @ParentId = (SELECT RouteId FROM [RBAC_RouteConfig] WHERE UrlFullPath = 'WardSupply/Inventory/Reports');
SET @OwnPerId = (SELECT PermissionId FROM [RBAC_Permission] WHERE PermissionName = 'wardsupply-inventory-consumption-report-view');

INSERT INTO [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,Css,DefaultShow,IsActive)
VALUES ('Consumption Report','WardSupply/Inventory/Reports/ConsumptionReport',@OwnPerId,@ParentId,'ConsumptionReport','fa fa-money fa-stack-1x text-white',1,1);

INSERT INTO [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
VALUES (1,@OwnPerId,1,GETDATE(),1)
GO

-----Script------
/****** Object:  StoredProcedure [dbo].[SP_WardInv_Report_ConsumptionReport]   Script Date: 06/25/2019 10:25:38 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_WardInv_Report_ConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null
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

----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT CONVERT(date,CreatedOn) AS [Date], DepartmentName, ItemName,Quantity,UsedBy AS [User], Remark 
			FROM WARD_INV_Consumption
			WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END		
END
GO
--END--Rusha: 25 June 2019: Add script for consumption report for wardsupply-inventory and add permimssion id

--START: NageshBB: 25 June 2019: add permission for System Admin->Restore Database button 
Insert into RBAC_Permission 
values('systemadmin-restore-database-btn','button permission for restore earlier backuped database with current database',
(select ApplicationId from RBAC_Application where ApplicationCode='SYSADM' and ApplicationName='SystemAdmin'),1,GETDATE(),null,null,1)
Go
--END: NageshBB: 25 June 2019: add permission for System Admin->Restore Database button 

--START: NarayanB: 01 July 2019: add Supplier tab for Pharmacy
--Permission handled for Store tab--
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Pharmacy' and ApplicationCode='PHRM');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('pharmacy-supplier-view',@ApplicationID,1,GETDATE(),1);
Go 

declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Pharmacy' and ApplicationCode='PHRM');


declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='pharmacy-supplier-view' and ApplicationId=@ApplicationID);

declare @ParentRouteId INT
SET @ParentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where DisplayName = 'Pharmacy');
Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
Values('Supplier','Pharmacy/Supplier','Supplier',@permissionID,@ParentRouteId,1,6,1);
Go
--END: NarayanB: 01 July 2019: add Supplier tab for Pharmacy
--Anish: Start 2 July--
Alter table [dbo].[EMP_Employee]
add SignatoryImageName varchar(100);
Go
--Anish: End--

--START: Rusha: 2nd july 2019,
/****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_DailyAppointmentReport]  Script Date: 07/02/2019 1:44:23 PM ******/
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
--------------------------------------------------------
*/
BEGIN
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0 AND (@Doctor_Name IS NOT NULL)
        OR (LEN(@Doctor_Name) > 0 AND (@AppointmentType IS NOT NULL)
        OR (LEN(@AppointmentType) > 0)))
		BEGIN
			SELECT
					CONVERT(datetime, CONVERT(date, patApp.VisitDate)) + CONVERT(datetime, VisitTime) as 'Date',patPait.PatientCode,
						patPait.FirstName + ' ' + patPait.LastName AS Patient_Name,patPait.PhoneNumber,patPait.Age,patPait.Gender,
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
--END: Rusha: 2nd july 2019,

--Anish start 2nd july 2019--
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Common','SignatureLocationPath','C:/DanpheHealthInc_PvtLtd_Files/Data/Employee/Signatures/','string','Location in the Local drive to save signature image','custom');
GO
--Anish: End--

--START: Rusha: 2nd july 2019, updated script for sales return of pharmacy report
/****** Object:  StoredProcedure [dbo].[SP_PHRM_SaleReturnReport]   Script Date: 07/03/2019 11:17:40 AM ******/
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
1      Vikas/2018-08-06	                     created the script
2.     VIKAS/2019-01-02					     report doesnt shown correctly so changes in script. 
3.	   Rusha/2019-04-09						 report doesnot show quantity so add return quantity
4.	   Rusha/2019-07-03						 report doesnot showing correct amount so updated script
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
					select convert(date,invr.CreatedOn) as[Date],convert(date, inv.CreateOn) as [InvDate], 
					 inv.InvoicePrintId,usr.UserName,
						pat.FirstName+' '+ ISNULL( pat.MiddleName,'')+' '+pat.LastName  as PatientName,
					inv.TotalAmount as TotalAmount, sum(inv.DiscountAmount) as Discount, Sum(invr.Quantity) as Quantity
				    from [PHRM_TXN_Invoice]inv
					join [PHRM_TXN_InvoiceReturnItems]invr
							on inv.InvoiceId=invr.InvoiceId
					join RBAC_User usr
							on usr.EmployeeId=invr.CreatedBy 
					join PAT_Patient pat
							on pat.PatientId=inv.PatientId
								where  convert(date, invr.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 
					group by convert(date,inv.CreateOn), convert(date, invr.CreatedOn),usr.UserName, 
					pat.FirstName,pat.MiddleName,pat.LastName, inv.InvoicePrintId,inv.TotalAmount
					order by convert(date,invr.CreatedOn) desc

	End
End
GO

--END: Rusha: 2nd july 2019,
--Start: Sanjit : Added Columns To Display Other Charges
GO
ALTER TABLE dbo.INV_TXN_GoodsReceipt ADD
  InsuranceCharge decimal(16, 4) NULL,
  CarriageFreightCharge decimal(16, 4) NULL,
  PackingCharge decimal(16, 4) NULL,
  TransportCourierCharge decimal(16, 4) NULL,
  OtherCharge decimal(16, 4) NULL
GO

GO
ALTER TABLE dbo.INV_TXN_GoodsReceiptItems ADD
  OtherCharge decimal(16, 4) NULL
GO

update INV_TXN_GoodsReceipt
set InsuranceCharge = 0
where InsuranceCharge is null
GO
update INV_TXN_GoodsReceipt
set CarriageFreightCharge = 0
where CarriageFreightCharge is null
GO
update INV_TXN_GoodsReceipt
set PackingCharge = 0
where PackingCharge is null
GO
update INV_TXN_GoodsReceipt
set TransportCourierCharge = 0
where TransportCourierCharge is null
GO
update INV_TXN_GoodsReceipt
set OtherCharge = 0
where OtherCharge is null
GO
--END: Sanjit : Added Columns To Display Other Charges

---Start:Dinesh 5th_August_2019 Added Handover tab on Billing--------------
Declare @appId int;
set @appId= (select ApplicationId from RBAC_Application where ApplicationName='Billing');

insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('billing-denomination-view',@appId,1,'2019-05-19 21:52:15.520',1)
GO
Declare @permid int,@routeid int ;
set @permid= (select PermissionId from RBAC_Permission where PermissionName='billing-denomination-view');
set @routeid= (select RouteId from RBAC_RouteConfig where DisplayName='Billing' and UrlFullPath='Billing');

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,DefaultShow,ParentRouteId,DisplaySeq, IsActive)
values ('Handover','Billing/BillingDenomination','BillingDenomination',@permid ,1,@routeid,2,1)
GO

---End:Dinesh 5th_August_2019 Added Handover tab on Billing--------------

---Start: Rusha July 5th 2019,create script for Fixed assets report and add permission
alter table INV_TXN_DispatchItems
add ItemId int
GO
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select ApplicationId from [RBAC_Application] where ApplicationName='Inventory');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('inventory-reports-FixedAssets-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Inventory/Reports');
SET @OwnPerId = (Select PermissionId from [RBAC_Permission] where PermissionName = 'inventory-reports-FixedAssets-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,Css,RouterLink,DefaultShow,IsActive)
Values ('Fixed Assets','Inventory/Reports/FixedAssets',@OwnPerId,@ParentId,'fa fa-money fa-stack-1x text-white','FixedAssets',1,1);

Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1);
GO

/****** Object:  StoredProcedure [dbo].[SP_Report_Inventory_FixedAssets]  Script Date: 07/05/2019 3:21:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_Inventory_FixedAssets]  		
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

			SELECT x.[Date],x.[Name],x.ItemName,x.Qty,x.MRP,SUM(x.Qty * x.MRP) AS TotalAmt 
			FROM (
					SELECT CONVERT(date,gritm.CreatedOn) AS [Date],dep.DepartmentName AS [Name],itm.ItemName,
					dis.DispatchedQuantity AS Qty,gritm.ItemRate AS MRP
					FROM INV_TXN_Stock AS stk
					JOIN INV_TXN_GoodsReceiptItems AS gritm ON gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
					JOIN INV_TXN_DispatchItems AS dis ON stk.ItemId = dis.ItemId
					JOIN INV_MST_Item AS itm ON itm.ItemId = stk.ItemId
					JOIN MST_Department AS dep ON dep.DepartmentId = dis.DepartmentId
					WHERE itm.ItemType = 'Capital Goods' AND CONVERT(date, gritm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
					GROUP BY CONVERT(date,gritm.CreatedOn),itm.ItemName,dep.DepartmentName,gritm.ItemRate,dis.DispatchedQuantity

					UNION ALL

					SELECT  CONVERT(date,gritm.CreatedOn) AS [Date],@inv_name AS [Name],itm.ItemName,
					SUM(stk.AvailableQuantity) AS Qty,gritm.ItemRate AS MRP 
					FROM INV_TXN_Stock AS stk
					JOIN INV_MST_Item AS itm on itm.ItemId = stk.ItemId
					JOIN INV_TXN_GoodsReceiptItems as gritm on gritm.GoodsReceiptItemId = stk.GoodsReceiptItemId
					WHERE itm.ItemType = 'Capital Goods' AND CONVERT(date, gritm.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
					GROUP BY CONVERT(date,gritm.CreatedOn),itm.ItemName,gritm.ItemRate) x
			GROUP BY x.[Date],x.[Name],x.ItemName,x.Qty,x.MRP

		END	
END
GO
---END: Rusha July 5th 2019,create script for Fixed assets report and add permission

---Start: Sud-8Jul'19--For Fiscal years--
IF NOT EXISTS(SELECT 1 FROM BIL_CFG_FiscalYears WHERE FiscalYearName='2076/2077')
BEGIN
	Insert INto BIL_CFG_FiscalYears (FiscalYearName, FiscalYearFormatted, StartYear, EndYear, Description, CreatedOn, CreatedBy, IsActive)
	Values('2076/2077','2076/2077','2019-07-16 23:59:59.000','2020-07-15 23:59:59.000','',GETDATE(),1,1)
END
GO

---IsActive is 0 for accounting, It should be 1 after the fiscal year starts. so run the update query on that day again.
IF NOT EXISTS(SELECT 1 FROM ACC_MST_FiscalYears WHERE FiscalYearName='2076/2077')
BEGIN
  Insert INto ACC_MST_FiscalYears (FiscalYearName, NpFiscalYearName, StartDate, EndDate, Description, CreatedOn, CreatedBy, IsActive)
  Values('2076/2077','2076/77','2019-07-16 23:59:59.000','2020-07-15 23:59:59.000','',GETDATE(),1,0)
END
GO

---End: Sud-8Jul'19--For Fiscal years

--Start:Narayan 8th_July_2019  added parameter in CORE CFG----------
INSERT INTO CORE_CFG_Parameters (ParameterGroupName, ParameterName, ParameterValue, ValueDataType, [Description], ParameterType)
VALUES ('Pharmacy','Pharmacy BillingHeader','{"hospitalName":"Manmohan Memorial Medical College & Teaching Hospital","address":"Swoyambhu:15,  Kathmandu, Nepal","email":"info@mmth.org.np","PANno":"4567296009","tel":"+977-1-4033950","DDA":"dda"}','JSON','Pharmacy BillingHeader Information for Hospital','custom');
GO
--End:Narayan 8th_July_2019  added parameter in CORE CFG----------

---START: Rusha July 8th 2019,updated script mimstockreport of pharmacy
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_MinStockReport]    Script Date: 07/08/2019 11:31:37 AM ******/
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
	WHERE s.Quantity < s.MinStockQuantity
	GROUP BY s.ItemId, s.ItemName,s.Quantity,s.ExpiryDate,s.BatchNo,s.MinStockQuantity

	END
END
GO
---END: Rusha July 8th 2019,updated script mimstockreport of pharmacy


---START: Kushal July 8th 2019, Created script for Deposit Balance Report for Pharmacy---
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_DepositBalanceReport]    Script Date: 7/8/2019 12:39:02 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_PHRMReport_DepositBalanceReport] 	
		
AS
/*
FileName: [SP_PHRMReport_DepositBalanceReport]
CreatedBy/date: Kushal/2019-07-08
Description: To get the deposit Balance of the Patient in Pharmacy
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Kushal/2019-07-08	                   created the script
--------------------------------------------------------
*/
BEGIN
select (Cast(ROW_NUMBER() OVER (ORDER BY  s.PatientCode)  as int)) as SN,*
from(
SELECT  distinct d.PatientId, d.PatientCode, d.PatientName, d.DepositBalance 
	FROM 
	(SELECT
		dep.PatientId,
		pat.PatientCode,
		pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
		LAST_VALUE( dep.DepositBalance) over (partition by dep.PatientId order by dep.PatientId) 'DepositBalance' 
		--dep.DepositBalance
	FROM PHRM_Deposit as dep
	JOIN PAT_Patient pat ON dep.PatientId = pat.PatientId
		) d
WHERE d.DepositBalance > 0)
s

END
GO
---END: Kushal July 8th 2019, Created script for Deposit Balance Report for Pharmacy---

---START: Rusha July 8th 2019,updated script mimstockreport of pharmacy
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_DispensaryStoreStockReport]    Script Date: 07/08/2019 3:41:03 PM ******/
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
		DECLARE @dis_name VARCHAR(MAX);
		SET @dis_name='Dispensary';
		IF (@Status = 'dispensary')	 
				SELECT itm.ItemName,dis.BatchNo AS BatchNo, dis.ExpiryDate, dis.MRP,
				dis.AvailableQuantity AS StockQty
				FROM PHRM_DispensaryStock AS dis 
				JOIN PHRM_MST_Item AS itm ON dis.ItemId = itm.ItemId

		ELSE IF (@Status = 'store')
				SELECT  x1.ItemName,x1.BatchNo AS BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
				SUM(InQty- OutQty+FInQty-FOutQty) AS 'StockQty'
				FROM(SELECT stk.ItemName, stk.BatchNo, stk.ExpiryDate, stk.MRP,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				GROUP BY stk.ItemName, stk.BatchNo , stk.ExpiryDate, stk.MRP)as x1
				GROUP BY x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.MRP

			ELSE IF(@Status = 'all')

				SELECT * FROM (	
				SELECT itm.ItemName,dis.BatchNo AS BatchNo, dis.ExpiryDate, dis.MRP,
				dis.AvailableQuantity AS StockQty, @dis_name as [Name]
				FROM PHRM_DispensaryStock AS dis 
				JOIN PHRM_MST_Item AS itm ON dis.ItemId = itm.ItemId

				UNION ALL

				SELECT  x1.ItemName,x1.BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,
				SUM(InQty- OutQty+FInQty-FOutQty) AS StockQty, x1.StoreName as [Name]
				FROM(SELECT stk.ItemName, stk.BatchNo as BatchNo, stk.ExpiryDate, stk.MRP,stk.StoreName,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				GROUP BY stk.ItemName, stk.BatchNo , stk.ExpiryDate, stk.MRP,stk.StoreName)as x1
				GROUP BY x1.ItemName, x1.BatchNo, x1.ExpiryDate, x1.MRP, x1.StoreName
				) a
	 END
GO
---END: Rusha July 8th 2019,updated script mimstockreport of pharmacy

--START: Vikas july 9th 2019 : create parameter for server side search list length. 
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
Values('Common','ServerSideSearchListLength',200,'number','server side search list length.')
GO
--END: Vikas july 9th 2019 : create parameter for server side search list length. 

--START: Rusha 12th July 2019: updated Script for consumption report of wardsupply-inventory
/****** Object:  StoredProcedure [dbo].[SP_WardInv_Report_ConsumptionReport]  Script Date: 07/12/2019 10:38:12 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_WardInv_Report_ConsumptionReport]  
	@FromDate datetime=null,
	@ToDate datetime=null
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
			WHERE CONVERT(date, con.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			AND itm.ItemType = 'Consumables' 
		END		
END
GO
--END: Rusha 12th July 2019: updated Script for consumption report of wardsupply-inventory


---start: sud:12July'19--For Health Card Parameterization---

Insert INto CORE_CFG_Parameters(ParameterGroupName,ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
Values('Common'
,'HealthCardTextFieldsInfo',

'{"front-header":"HAMS",
"back-property-of":"HAMS Hospital",
"back-hospital-name":"HAMS Hospital",
"back-hospital-addressinfo":"Dhumbarahi, Kathmandu, Nepal",
"back-hospital-contactinfo":"Tel: 01-44557754",
"back-hospital-emailinfo":"Email: info@hamshospital.org",
"back-hospital-websiteinfo":"Website: www.hamshospital.org"}'

,'JSON'
,'Hospital information to be used in HealthCard.'
,'custom'
)
GO
---end: sud:12July'19--For Health Card Parameterization---


---Start: Sud:14July'19--Reverse Integration (Merged) from MNK_V3_LIVE to DEV upto Here---

---START--Yubraj: 3rd July-2019-- MNK - Adding Column IsInsurance in billingtransactionitems table and adding permission and routeconfig-----

ALTER TABLE BIL_TXN_BillingTransactionItems
ADD IsInsurance bit null;

declare @ApplicationId INT

SET @ApplicationId= (SELECT  TOP(1) ApplicationId FROM RBAC_Application WHERE ApplicationCode='BIL')

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('billing-ins-provisional-view',@ApplicationId,1,GETDATE(),1)
GO

declare @ParentId INT
declare @OwnPerId INT

SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'billing-ins-provisional-view');
SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Billing');


INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
VALUES ('INS Provisional','Billing/InsuranceProvisional','InsuranceProvisional',@OwnPerId,@ParentId,0,1,25)
GO

---END--Yubraj: 3rd July-2019-- MNK - Adding Column IsInsurance in billingtransactionitems table and adding permission and routeconfig-----

---End: Sud:14July'19--Reverse Integration (Merged) from MNK_V3_LIVE to DEV upto Here---


--start: sud: 14July'19--Changing sequence of Billing Navigation pages--

Update RBAC_RouteConfig
SET DisplaySeq=20 where UrlFullPath='Billing/BillingDenomination'
GO
Update RBAC_RouteConfig
SET DisplaySeq=17 where UrlFullPath='Billing/EditDoctor'
GO
Update RBAC_RouteConfig
SET DisplaySeq=19 where UrlFullPath='Billing/BillOrderRequest'
GO

--end: sud: 14July'19--Changing sequence of Billing Navigation pages--

--START: Sanjit: 15July2019 -- Add ModifiedBy and ModifiedOn  column in GoodReciept and GoodReceiptItemsTable
GO
ALTER TABLE dbo.INV_TXN_GoodsReceipt ADD
	ModifiedBy int NULL,
	ModifiedOn datetime NULL
GO
ALTER TABLE dbo.INV_TXN_GoodsReceiptItems ADD
	ModifiedBy int NULL,
	ModifiedOn datetime NULL
GO
--END: Sanjit: 15July2019 -- Add ModifiedBy and ModifiedOn  column in GoodReciept and GoodReceiptItemsTable



--Start: Salakha: 16July'19--Modified Sp SP_IRD_PHRM_InvoiceDetails--
/****** Object:  StoredProcedure [dbo].[SP_IRD_PHRM_InvoiceDetails]    Script Date: 16-07-2019 17:11:27 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_IRD_PHRM_InvoiceDetails]
		@FromDate Datetime=null ,
		@ToDate DateTime=null	
AS
/*
FileName: [SP_IRD_PHRM_InvoiceDetails]
CreatedBy/date: Vikas/2018-10-24
Description: to get the Pharmacy Invoice Details as per IRD requirements 
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.			Vikas/2018-10-24					Created
 2.       22 Nov 2018 By NageshBB               Update for fiscal year, and other columns
 3.			Ajay/04 Dec 2018					Changed InvoiceId to InvoicePrintId
 4.			Vikas/02 Jan 2019					modify patient shortname(firstname and last name) to fullname(first,middle, and lastName)
 ------------------------------------------------------------------------------
*/

BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	 BEGIN
	 SET NOCOUNT ON
select 
       -- dbo.FN_COMMON_GetFormattedFiscalYearByDate(inv.CreateOn) as Fiscal_Year,
	    fisc.FiscalYearFormatted AS Fiscal_Year,
		Convert(varchar(20),inv.InvoicePrintId) as Bill_No,
		--pat.FirstName+' '+pat.LastName 
		isnull(pat.FirstName,'') + ' ' + isnull(pat.MiddleName,'') + ' ' + isnull(pat.LastName,'') as Customer_name,	
		pat.PANNumber,		
	    CONVERT(VARCHAR(10), inv.CreateOn, 120) As BillDate,
		'ItemTransaction' as BillType, --here only for ird details need to handle into pharmacy table also
	    inv.SubTotal AS Amount,
        inv.DiscountAmount as DiscountAmount,
	   ((inv.SubTotal-inv.DiscountAmount)+inv.VATAmount) As Total_Amount,
	   (inv.VATAmount) as Tax_Amount ,
	   case when inv.VATAmount >0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As Taxable_Amount ,
	   case when inv.VATAmount <=0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As  NonTaxable_Amount  ,
	   CASE When inv.IsRemoteSynced=1 then 'Yes' else 'No' END AS SyncedWithIRD,
	   CASE WHEN inv.PrintCount > 0  THEN 'Yes' ELSE 'No' END AS Is_Printed,	
	   CASE WHEN inv.PrintCount >0 Then   convert(varchar(20),convert(time,inv.CreateOn),100) Else '' END AS Printed_Time,
       CASE When ISNULL(inv.IsRealtime,0)=1 then 'Yes' ELSE 'No' END as Is_Realtime,
	   CASE WHEN ISNULL(inv.IsReturn,0)= 0  THEN 'True' ELSE 'False' END AS Is_Bill_Active,
	   emp.FirstName+' '+emp.LastName as Entered_By,				   
	   emp.FirstName+' '+emp.LastName  as Printed_by,
	   inv.PrintCount as Print_Count,
	   CASE When ISNULL(inv.IsRealtime,0)=1 then 'Yes' ELSE 'No' END as Is_Realtime,				  
	   CASE WHEN ISNULL(inv.IsReturn,0)= 0  THEN 'True' ELSE 'False' END AS Is_Bill_Active
  from PHRM_TXN_Invoice inv 
	 inner join	EMP_Employee emp on emp.EmployeeId=inv.CreatedBy
	 inner join    PAT_Patient pat on pat.PatientId=inv.PatientId
	  inner join BIL_CFG_FiscalYears fisc on inv.FiscalYearId=fisc.FiscalYearId
  WHERE (  
        CONVERT(DATE,inv.CreateOn) BETWEEN CONVERT(DATE,@FromDate) 
     AND CONVERT(DATE,@ToDate) 
     ) 
	  END
END
GO
--End: Salakha: 16July'19--Modified Sp SP_IRD_PHRM_InvoiceDetails--
--START: Sanjit: 17July2019 -- Add ModifiedBy and ModifiedOn  column in PurchaseOrder and PurchaseOrdertems Table
GO
ALTER TABLE dbo.INV_TXN_PurchaseOrder ADD
	ModifiedBy int NULL,
	ModifiedOn datetime NULL
GO
ALTER TABLE dbo.INV_TXN_PurchaseOrderItems ADD
	ModifiedBy int NULL,
	ModifiedOn datetime NULL
GO
--END: Sanjit: 17July2019 -- Add ModifiedBy and ModifiedOn  column in PurchaseOrder and PurchaseOrdertems Table

---SUD:17July'19-- MNK_Deployment--Deployed Upto Here for Build_1.19.0---


--START : Vikas 15th july 2019 -- added column in RBAC_RouteConfig table
ALTER TABLE RBAC_RouteConfig
ADD IsSecondaryNavInDropdown  bit
--END : Vikas 15th july 2019 -- added column in RBAC_RouteConfig table

--START: Rusha 18th july 2019 -- updated script for Opening and Closing Stock report for Pharmacy
GO
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_DailyStockSummaryReport]  Script Date: 07/18/2019 1:57:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMReport_DailyStockSummaryReport] 
	     @FromDate datetime= null,
		 @ToDate datetime= null		
AS
/*
FileName: [SP_PHRMReport_DailyStockSummaryReport]
CreatedBy/date: Umed/2018-02-27
Description: 
1. Created Seprate Function to Get Opention Stock Count of Selected FromDate 

2. Get ItemWise Opening Qty Count, PurchaseQty, PurchaseValue, SalesQty, SalesValue, EndingQty
   (Call this [getOpeningStockCount] and Get Opening Count of Each Items on Selected Date )
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1       Umed/2018-02-22	                 created the script
                                   Get ItemWise Opening Qty Count, PurchaseQty, PurchaseValue, SalesQty, SalesValue, EndingQty
                                    (Call this [getOpeningStockCount] and Get Opening Count of Each Items on Selected Date )
								Selecting 3 Table 
								1. In First Table: Selecting All Dates and ItemId of Sales/Purchase and Join with Second Table Data
								2. In Second Table: Selecting Purchase Data and Doing Left Join With First TAble
								3. Third Table Selecting Sales Data and Doing Left join with Result Til Generated by Second Table Join
 2.     Rusha/ 07-18-2019        updated script
----------------------------------------------------------------------------
*/
BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
	BEGIN
			SELECT * FROM (
			SELECT x.ItemId, x.ItemName,x.BatchNo,x.GenericName,x.ExpiryDate,x.MRP,x.Price,SUM(x.OpeningQty) AS OpeningQty,
			SUM(x.EndQty) AS EndQty 
			FROM (
				SELECT a.ItemId,a.ItemName,a.BatchNo,a.GenericName,a.ExpiryDate,
				LAST_VALUE(a.MRP) OVER (PARTITION BY a.BatchNo, a.ItemId ORDER BY a.ItemId ) 'MRP',
				FIRST_VALUE(a.Price) OVER (PARTITION BY a.BatchNo, a.ItemId ORDER BY a.ItemId) 'Price',
				SUM(a.OpeningQty) AS OpeningQty,SUM (a.CurrQuantity) AS CurrQty,SUM(a.OpeningQty+ a.CurrQuantity) AS EndQty 
				FROM (
					SELECT stock.ItemId, stock.BatchNo,stock.ItemName,stock.GenericName,0 AS OpeningQty,
					SUM(stock.FreeInQty + stock.InQty-stock.OutQty-stock.FreeOutQty) AS CurrQuantity,
					stock.ExpiryDate,stock.MRP, stock.Price 
					FROM (
						SELECT t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,
					    LAST_VALUE(t1.MRP) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId ) 'MRP',
					    FIRST_VALUE(t1.Price) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId) 'Price',
						SUM(CASE WHEN InOut ='in' THEN FreeQuantity ELSE 0 END ) AS 'FreeInQty',
						SUM(CASE WHEN InOut = 'out' THEN FreeQuantity ELSE 0 END) AS 'FreeOutQty',
						SUM(CASE WHEN InOut ='in' THEN Quantity ELSE 0 END ) AS 'InQty',
						SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty'
						FROM [dbo].[PHRM_StockTxnItems] t1
						  INNER JOIN [dbo].[PHRM_MST_Item] item on item.ItemId = t1.ItemId
						  INNER JOIN [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
						  WHERE CONVERT(date, t1.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())
						  GROUP BY t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,MRP,Price
					) stock
					GROUP BY stock.ItemId,stock.ItemName,stock.BatchNo,stock.GenericName,stock.ExpiryDate,stock.MRP, stock.Price

					UNION 

					SELECT stock.ItemId, stock.BatchNo,stock.ItemName,stock.GenericName,
					Sum(stock.FreeInQty + stock.InQty-stock.OutQty-stock.FreeOutQty) AS OpeningQty, 0 AS CurrQuantity,
					stock.ExpiryDate,stock.MRP, stock.Price 
					FROM (
						SELECT t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,
						LAST_VALUE(t1.MRP) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId ) 'MRP',
						FIRST_VALUE(t1.Price) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId) 'Price',
						SUM(CASE WHEN InOut ='in' THEN FreeQuantity ELSE 0 END ) AS 'FreeInQty',
						SUM(CASE WHEN InOut = 'out' THEN FreeQuantity ELSE 0 END) AS 'FreeOutQty',
						SUM(CASE WHEN InOut ='in' THEN Quantity ELSE 0 END ) AS 'InQty',
						SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty'
						FROM [dbo].[PHRM_StockTxnItems] t1
						INNER JOIN [dbo].[PHRM_MST_Item] item on item.ItemId = t1.ItemId
						INNER JOIN [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
						WHERE CONVERT(date, t1.CreatedOn) < ISNULL(@FromDate,GETDATE())
						GROUP BY t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,MRP,Price
		             ) stock
					GROUP BY stock.ItemId,stock.ItemName,stock.BatchNo,stock.GenericName,stock.ExpiryDate,stock.MRP, stock.Price) a
				GROUP BY a.ItemId,a.ItemName,a.BatchNo,a.GenericName,a.ExpiryDate,a.MRP,a.Price )x
			GROUP BY x.ItemId, x.ItemName,x.BatchNo,x.GenericName,x.ExpiryDate,x.MRP,x.Price) t
			WHERE t.OpeningQty > 0 and t.EndQty > 0
	END
END
GO
--END: Rusha 18th july 2019 -- updated script for Opening and Closing Stock report for Pharmacy


--Start: Narayan July 18 2019 -- added Eye Examination tab in Clinical  module
 declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Clinical' and ApplicationCode='CLN');

Insert Into [dbo].[RBAC_Permission] (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('clinical-eyeexamination-view',@ApplicationID,1,GETDATE(),1);
Go 

declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Clinical' and ApplicationCode='CLN');


declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='clinical-eyeexamination-view' and ApplicationId=@ApplicationID);

declare @ParentRouteId INT
SET @ParentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where DisplayName = 'Clinical');
Insert Into [dbo].[RBAC_RouteConfig] (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
Values('Eye Examination','Clinical/EyeExaminaion','EyeExamination',@permissionID,@ParentRouteId,1,7,1);
Go
--End: Narayan July 18 2019 -- added Eye Examination tab in Clinical module

---START:NageshBB: 18 July 2019: core parameter value for show/hide loading screen & pharmacy invoiceprintid correction
insert into CORE_CFG_Parameters
values('Common','showLoadingScreen' ,'false',	'boolean','show or hide loading screen on http call', 	'custom')
go

--update current fiscal year wise InvoicePrintId
update PHRM_TXN_Invoice
set InvoicePrintId=(iii.rankid)
from PHRM_TXN_Invoice as ii
join(select InvoiceId ,(rank() over(partition by  fiscalyearid order by Invoiceid ASC)) as rankid 
from PHRM_TXN_Invoice where FiscalYearId=(select FiscalYearId  from BIL_CFG_FiscalYears where FiscalYearFormatted='2076/2077')) as iii
on ii.InvoiceId=iii.InvoiceId
GO
---adding new description column 
 IF COL_LENGTH('dbo.ACC_TransactionItems', 'Description') IS NULL 
  BEGIN 
  Alter table ACC_TransactionItems
  Add Description varchar(200)
  END
  Go
---END:NageshBB: 18 July 2019: core parameter value for show/hide loading screen & pharmacy invoiceprintid correction

--START: Rusha: 19th july 2019 Add Iscancel column in GoodsRecipt table
Alter table INV_TXN_GoodsReceipt
Add IsCancel bit
GO
--END: Rusha: 19th july 2019 Add Iscancel column in GoodsRecipt table

--START: Rusha: 21st july 2019 updated script for opening and ending stock in pharmacy
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_DailyStockSummaryReport]    Script Date: 07/21/2019 12:23:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRMReport_DailyStockSummaryReport] 
	     @FromDate datetime= null,
		 @ToDate datetime= null		
AS
/*
FileName: [SP_PHRMReport_DailyStockSummaryReport]
CreatedBy/date: Umed/2018-02-27
Description: 
1. Created Seprate Function to Get Opention Stock Count of Selected FromDate 

2. Get ItemWise Opening Qty Count, PurchaseQty, PurchaseValue, SalesQty, SalesValue, EndingQty
   (Call this [getOpeningStockCount] and Get Opening Count of Each Items on Selected Date )
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1       Umed/2018-02-22	                 created the script
                                   Get ItemWise Opening Qty Count, PurchaseQty, PurchaseValue, SalesQty, SalesValue, EndingQty
                                    (Call this [getOpeningStockCount] and Get Opening Count of Each Items on Selected Date )
								Selecting 3 Table 
								1. In First Table: Selecting All Dates and ItemId of Sales/Purchase and Join with Second Table Data
								2. In Second Table: Selecting Purchase Data and Doing Left Join With First TAble
								3. Third Table Selecting Sales Data and Doing Left join with Result Til Generated by Second Table Join
 2.     Rusha/ 07-18-2019        updated script
 3.     Rusha/ 07-21-2019        quantity is not showing correctly so updated script
----------------------------------------------------------------------------
*/
BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
	BEGIN
			SELECT * FROM (
			SELECT x.ItemId, x.ItemName,x.BatchNo,x.GenericName,x.ExpiryDate,x.MRP,x.Price,SUM(x.OpeningQty) AS OpeningQty,
			SUM(x.EndQty) AS EndQty 
			FROM (
				SELECT a.ItemId,a.ItemName,a.BatchNo,a.GenericName,a.ExpiryDate,
				LAST_VALUE(a.MRP) OVER (PARTITION BY a.BatchNo, a.ItemId ORDER BY a.ItemId ) 'MRP',
				FIRST_VALUE(a.Price) OVER (PARTITION BY a.BatchNo, a.ItemId ORDER BY a.ItemId) 'Price',
				SUM(a.OpeningQty) AS OpeningQty,SUM (a.CurrQuantity) AS CurrQty,SUM(a.OpeningQty+ a.CurrQuantity) AS EndQty 
				FROM (
					SELECT stock.ItemId, stock.BatchNo,stock.ItemName,stock.GenericName,0 AS OpeningQty,
					SUM(stock.FreeInQty + stock.InQty-stock.OutQty-stock.FreeOutQty) AS CurrQuantity,
					stock.ExpiryDate,stock.MRP, stock.Price 
					FROM (
						SELECT t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,
					    LAST_VALUE(t1.MRP) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId ) 'MRP',
					    FIRST_VALUE(t1.Price) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId) 'Price',
						SUM(CASE WHEN InOut ='in' THEN FreeQuantity ELSE 0 END ) AS 'FreeInQty',
						SUM(CASE WHEN InOut = 'out' THEN FreeQuantity ELSE 0 END) AS 'FreeOutQty',
						SUM(CASE WHEN InOut ='in' THEN Quantity ELSE 0 END ) AS 'InQty',
						SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty'
						FROM [dbo].[PHRM_StockTxnItems] t1
						  INNER JOIN [dbo].[PHRM_MST_Item] item on item.ItemId = t1.ItemId
						  INNER JOIN [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
						  WHERE CONVERT(date, t1.CreatedOn) BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())
						  GROUP BY t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,MRP,Price
					) stock
					GROUP BY stock.ItemId,stock.ItemName,stock.BatchNo,stock.GenericName,stock.ExpiryDate,stock.MRP, stock.Price

					UNION 

					SELECT stock.ItemId, stock.BatchNo,stock.ItemName,stock.GenericName,
					Sum(stock.FreeInQty + stock.InQty-stock.OutQty-stock.FreeOutQty) AS OpeningQty, 0 AS CurrQuantity,
					stock.ExpiryDate,stock.MRP, stock.Price 
					FROM (
						SELECT t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,
						LAST_VALUE(t1.MRP) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId ) 'MRP',
						FIRST_VALUE(t1.Price) OVER (PARTITION BY t1.BatchNo, t1.ItemId ORDER BY t1.ItemId) 'Price',
						SUM(CASE WHEN InOut ='in' THEN FreeQuantity ELSE 0 END ) AS 'FreeInQty',
						SUM(CASE WHEN InOut = 'out' THEN FreeQuantity ELSE 0 END) AS 'FreeOutQty',
						SUM(CASE WHEN InOut ='in' THEN Quantity ELSE 0 END ) AS 'InQty',
						SUM(CASE WHEN InOut = 'out' THEN Quantity ELSE 0 END) AS 'OutQty'
						FROM [dbo].[PHRM_StockTxnItems] t1
						INNER JOIN [dbo].[PHRM_MST_Item] item on item.ItemId = t1.ItemId
						INNER JOIN [dbo].[PHRM_MST_Generic] generic on generic.GenericId =item.GenericId
						WHERE CONVERT(date, t1.CreatedOn) < ISNULL(@FromDate,GETDATE())
						GROUP BY t1.ItemId, t1.BatchNo,item.ItemName, generic.GenericName,t1.ExpiryDate,MRP,Price
		             ) stock
					GROUP BY stock.ItemId,stock.ItemName,stock.BatchNo,stock.GenericName,stock.ExpiryDate,stock.MRP, stock.Price) a
				GROUP BY a.ItemId,a.ItemName,a.BatchNo,a.GenericName,a.ExpiryDate,a.MRP,a.Price )x
			GROUP BY x.ItemId, x.ItemName,x.BatchNo,x.GenericName,x.ExpiryDate,x.MRP,x.Price) t
			WHERE t.OpeningQty >= 0 and t.EndQty >= 0
	END
END
GO
--END: Rusha: 21st july 2019 updated script for opening and ending stock in pharmacy

-----------------------Start :21st July'19 : Dialysis SP Changes----------------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DialysisPatientDetail]    Script Date: 7/20/2019 10:34:16 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BIL_DialysisPatientDetail]  		
	@FromDate datetime=null,
	@ToDate datetime=null		
AS
/*
FileName: [SP_Report_BIL_PAT_NeighbourhoodCardDetail]
CreatedBy/date: Rusha/05-31-2019
Description: T oget details report of dialysis patient
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/06-03-2019					   get details report of dialysis patient
----------------------------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT CONVERT(date,pat.CreatedOn) AS [Date],pat.DialysisCode, pat.PatientCode AS HospitalNo, 
			CONCAT_WS(' ',pat.FirstName, pat.MiddleName,pat.LastName) AS PatientName,
			pat.age+ '/' + substring(pat.Gender, 1, 1) as 'Gender', pat.Age, CONCAT_WS(' ',emp.FirstName,emp.MiddleName,emp.LastName) AS RequestedBy
			FROM PAT_Patient AS pat	
			join EMP_Employee as emp on emp.EmployeeId = pat.CreatedBy		
			WHERE pat.DialysisCode is not null AND CONVERT(date, pat.CreatedOn) BETWEEN ISNULL

(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END	
END
go

-----------------------End :21st July'19 : Dialysis SP Changes----------------------------

--START: Ajay 24 July 2019 =>added ConcludeVisit column for conclude visit Clinical module
ALTER TABLE PAT_PatientVisits
ADD ConcludeDate DATETIME NULL;
GO
--END: Ajay 24 July 2019




-----start: sud:24Jul'19--Reverse Integration From MNK_V3_LIVE branch to DEV-- FOR GOv Insurance--

---start: sud:16Jul19-- For Labs-Insurance Filter--
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Lab','ShowInsuranceFilterInLabPages','false','boolean','ToShow Insurance, NonInsurance Filters in Labs Pages. Default False','custom')
GO

---end: sud:16Jul19-- For Labs-Insurance Filter--

----MNK_Deployment: Deployed upto here for Build_1.19.0 - in MNK hospital-- on : 17July2019- 9:00 AM--

--start: sud: 19Jul'19-- To handle date in Insurance Invoices--
Alter Table BIL_TXN_BIllingTransaction
ADD InsTransactionDate DateTime
GO
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Billing','ShowInsTransactionDate','false','boolean','ToShow Insurance Transaction Date. MNK-Specific. Default false','system')
GO

--end: sud: 19Jul'19-- To handle date in Insurance Invoices--

---Start: Anish: 19 July, HasInsurance field added in radiology Requisition--
Alter table RAD_PatientImagingRequisition
add HasInsurance bit null;
Go
---End: Anish: 19 July--
----sud: MNK_Deployment: Deployed upto here for Build_1.19.1 - in MNK hospital-- on : 21July2019- 9:00 AM--


---start: sud: 21Jul'19: Reverse INtegration from V3_Govt_Insurance to MNK_V3_LIVE branch of Manakamana---

---Start: Yubraj :19 Jul '19-- Modification -Getting Provisional Items list where insuranceApplicable is false--
/****** Object:  StoredProcedure [dbo].[SP_TXNS_BILL_SettlementSummary]    Script Date: 7/19/2019 6:22:21 PM ******/
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
---END: Yubraj :19 Jul '19-- Modification -Getting Provisional Items list where insuranceApplicable is false--

---START: Yubraj :21st Jul '19-- Adding Route for Insurance--
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Billing' and ApplicationCode='BIL');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('billing-insurancemain-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-insurancemain-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'billing');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
VALUES ('Insurance','Billing/InsuranceMain','InsuranceMain',@permissionID,@parentRouteId,1,1,25)
GO

----INS Patients
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Billing' and ApplicationCode='BIL');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('billing-insurancemain-ins-patients-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-insurancemain-ins-patients-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Billing/InsuranceMain');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
VALUES ('Patient List','Billing/InsuranceMain/PatientList','PatientList',@permissionID,@parentRouteId,1,1,25)
GO

----INS Provisional
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Billing' and ApplicationCode='BIL');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('billing-insurancemain-ins-provisional-list-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-insurancemain-ins-provisional-list-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Billing/InsuranceMain');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
VALUES ('Provisional List','Billing/InsuranceMain/InsProvisional','InsProvisional',@permissionID,@parentRouteId,1,1,25)
GO

----INS Provisional Claims
declare @ApplicationID INT
SET @ApplicationID = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Billing' and ApplicationCode='BIL');

INSERT INTO RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
VALUES ('billing-insurancemain-ins-claims-view',@ApplicationID,1,GETDATE(),1)
go

declare @permissionID INT
SET @permissionID=(Select TOP(1) PermissionId from [dbo].[RBAC_Permission] where PermissionName='billing-insurancemain-ins-claims-view');

declare @parentRouteId INT
SET @parentRouteId=(Select TOP(1) RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath = 'Billing/InsuranceMain');

INSERT INTO RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive,DisplaySeq)
VALUES ('Claims','Billing/InsuranceMain/Claims','Claims',@permissionID,@parentRouteId,1,1,25)
GO

--Disable for Insurance Provisional Route
update RBAC_Permission set IsActive=0 where PermissionName='billing-ins-provisional-view'
update RBAC_RouteConfig set IsActive=0 where UrlFullPath='Billing/InsuranceProvisional' and RouterLink='InsuranceProvisional'
GO
--Disable for Insurance Settlement Route
update RBAC_Permission set IsActive=0 where PermissionName='billing-settlements-insurance-settlement-view'
update RBAC_RouteConfig set IsActive=0 where UrlFullPath='Billing/Settlements/InsuranceSettlements' and RouterLink='InsuranceSettlements'
GO
---END: Yubraj :21st Jul '19-- Adding Route for Insurance--
---end: sud: 21Jul'19 Reverse INtegration from V3_Govt_Insurance to MNK_V3_LIVE branch of Manakamana---


-----end: sud:25Jul'19--Reverse Integration From MNK_V3_LIVE branch to DEV-- FOR GOv Insurance--

--Start:Narayan 24th_July_2019  added parameter in CORE CFG----------
INSERT INTO CORE_CFG_Parameters (ParameterGroupName, ParameterName, ParameterValue, ValueDataType, [Description], ParameterType)
VALUES ('Inventory','Inventory BillingHeader','{"hospitalName":"Danphe Hospital Pvt. Ltd.","address":" Kathmandu, Nepal","email":"info@daphe.org.np","PANno":"12345678","tel":"+977-1-4444444","DDA":"dda"}','JSON','Inventory BillingHeader Information for Hospital','custom');
GO
--End:Narayan 25th_July_2019  added parameter in CORE CFG---------



---start: Sud: 26Jul'19--Update Service Dept Id of OPD (needed for Manmohan Hospital)

--FOR MMTH-- It was missing earlier--and was causing issue in transfer--
Update BIL_MST_ServiceDepartment
SET IntegrationName='OPD'
WHERE ServiceDepartmentName='OPD'
GO
---end: Sud: 26Jul'19--Update Service Dept Id of OPD (needed for Manmohan Hospital)-

-- Start: Salakha: 29 july 2019-- Added Script for Scanned Images and created table
-- add routing for clinical scanned image
INSERT INTO [dbo].[RBAC_Permission] ([PermissionName],[ApplicationId],[CreatedBy] ,[CreatedOn] ,[IsActive])
     VALUES ('clinical-scan-image-view',(select ApplicationId from RBAC_Application where ApplicationName ='Clinical'),1,GETDATE() ,1)
GO

INSERT INTO [dbo].[RBAC_RouteConfig] ([DisplayName],[UrlFullPath],[RouterLink]
           ,[PermissionId],[ParentRouteId] ,[DefaultShow],[DisplaySeq] ,[IsActive])
     VALUES('Scanned Images','Doctors/PatientOverviewMain/ScannedImages','ScannedImages',
   (select PermissionId from RBAC_Permission where PermissionName = 'clinical-scan-image-view'),
   (select RouteId from RBAC_RouteConfig where UrlFullPath ='Doctors/PatientOverviewMain'),1,11 ,1 )
GO

-- created table to save patient images
CREATE TABLE [dbo].[CLN_PAT_Images](
  [PatImageId] [bigint] IDENTITY(1,1) NOT NULL,
  [PatientId] [int] NOT NULL,
  [PatientVisitId] [int] NOT NULL,
  [DepartmentId] [int] NOT NULL,
  [ROWGUID] [uniqueidentifier] ROWGUIDCOL  NOT NULL,
  [FileType] [varchar](50) NULL,
  [Comment] [varchar](200) NULL,
  [FileBinaryData] [varbinary](max) FILESTREAM  NULL,
  [FileName] [varchar](200) NULL,
  [Title] [varchar](200) NULL,
  [FileExtention] [varchar](50) NULL,
  [UploadedOn] [datetime] NULL,
  [UploadedBy] [int] NULL,
  [IsActive] [bit] NULL
 CONSTRAINT [PK_CLN_PAT_Images] PRIMARY KEY CLUSTERED 
(
  PatImageId ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY] FILESTREAM_ON [Danphe_FileStream],
UNIQUE NONCLUSTERED 
(
  [ROWGUID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] FILESTREAM_ON [Danphe_FileStream]
GO 
--End: Salakha: 29 July 2019 --Added Script for Scanned Images and created table

--Start- Yubraj: 31st July 2019 --Added column in BIL_TXN_BillingTransactionItems table for MembershipTypeId update-- 
Alter table [dbo].BIL_TXN_BillingTransactionItems add DiscountSchemeId int null;
Go 
--End- Yubraj: 31st July 2019 --Added column in BIL_TXN_BillingTransactionItems table for MembershipTypeId update-- 


----start: sud:31Jul'19----For Old Patient OPD Charges---------

Alter Table BIL_MST_ServiceDepartment
Alter Column ServiceDepartmentName Varchar(100)
GO
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType)
Values('Appointment','OldPatientOpdPriceEnabled','false','string','To set whether or not old Price is different for OLD Patient OPD','custom')
GO

---old patient opd at department level----
Declare @DeptId INT
SET @DeptId=(Select Top 1 DepartmentId from MST_Department where DepartmentName='Administration')

---Add servicedepartment 'Department OPD' in Administration department if not exists---

IF NOT EXISTS(Select 1 from BIL_MST_ServiceDepartment WHERE ServiceDepartmentName='Department OPD Old Patient')
BEGIN
  INSERT INTO BIL_MST_ServiceDepartment(ServiceDepartmentName, ServiceDepartmentShortName, DepartmentId, CreatedBy, CreatedOn, IsActive, IntegrationName)
  Values('Department OPD Old Patient','Dept-OPD-Old-Patient',@DeptId, 1, GETDATE(),1,'OPD')
END
GO
Declare @SrvDeptId INT
SET @SrvDeptId=(Select Top 1 ServiceDepartmentId from BIL_MST_ServiceDepartment where ServiceDepartmentName='Department OPD Old Patient')

---Insert DepartmentIds as BillItem Price----
---Take only departments with IsAppointmentApplicable = 1---
Declare @DeptsTbl Table(DeptId INT, DeptName Varchar(200))

Insert into @DeptsTbl(DeptId, DeptName)
SELECT DepartmentId, DepartmentName FROM MST_Department
WHERE IsAppointmentApplicable=1

Declare @CurrDeptId INT;
WHILE EXISTS(Select 1 FROM @DeptsTbl)
BEGIN
 SET @CurrDeptId=(Select TOp 1 DeptId from @DeptsTbl)

 Insert INTO BIL_CFG_BillItemPrice(ServiceDepartmentId, ItemName, ItemId, Price, EHSPrice, TaxApplicable, DiscountApplicable, CreatedBy, CreatedOn,IsActive, IsNormalPriceApplicable, InsuranceApplicable, IsInsurancePackage)
 VALUES(@SrvDeptId, 'Consultation Charge', @CurrDeptId,80,350, 0, 1, 1,GETDATE(),1,1,0,0)

 Delete FROM @DeptsTbl WHERE DeptId=@CurrDeptId
END
GO

---Old patient OPD at Doctor Level-----
Declare @DeptId INT
SET @DeptId=(Select Top 1 DepartmentId from MST_Department where DepartmentName='Administration')

IF NOT EXISTS(Select 1 from BIL_MST_ServiceDepartment WHERE ServiceDepartmentName='Doctor OPD Old Patient')
BEGIN
  INSERT INTO BIL_MST_ServiceDepartment(ServiceDepartmentName, ServiceDepartmentShortName, DepartmentId, CreatedBy, CreatedOn, IsActive, IntegrationName)
  Values('Doctor OPD Old Patient','Doc-OPD-Old-Patient',@DeptId, 1, GETDATE(),1,'OPD')
END
GO
Declare @SrvDeptId INT
SET @SrvDeptId=(Select Top 1 ServiceDepartmentId from BIL_MST_ServiceDepartment where ServiceDepartmentName='Doctor OPD Old Patient')

---Insert EmployeeID as ItemId in BillItem Price----
---Take only Employees with IsAppointmentApplicable = 1---
Declare @EmpsTbl Table(EmpId INT)

Insert into @EmpsTbl(EmpId)
SELECT EmployeeId FROM EMP_Employee
WHERE IsAppointmentApplicable=1

Declare @CurrEmpId INT;
WHILE EXISTS(Select 1 FROM @EmpsTbl)
BEGIN
 SET @CurrEmpId=(Select TOp 1 EmpId from @EmpsTbl)

 Insert INTO BIL_CFG_BillItemPrice(ServiceDepartmentId, ItemName, ItemId, Price,EHSPrice, TaxApplicable, DiscountApplicable, CreatedBy, CreatedOn,IsActive, IsNormalPriceApplicable, InsuranceApplicable, IsInsurancePackage)
 VALUES(@SrvDeptId, 'Consultation Charge', @CurrEmpId,80,350, 0, 1, 1,GETDATE(),1,1,0,0)

 Delete FROM @EmpsTbl WHERE EmpId=@CurrEmpId
END
GO
----end: sud:31Jul'19----For Old Patient OPD Charges---------



