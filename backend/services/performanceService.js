import Invoice from "../models/Invoice.js";
import PayrollRecord from "../models/PayrollRecord.js";
import Incident from "../models/Incident.js";
import Cleaner from "../models/Cleaner.js";
import Client from "../models/Client.js";
import Site from "../models/Site.js";
import Inspection from "../models/Inspection.js";
import Prospect from "../models/Prospect.js";
import Quotation from "../models/Quotation.js";
import PerformanceGoal from "../models/PerformanceGoal.js";

export const getDashboardData = async (filter, offset = 0) => {
  const invoiceFilter = getDateRange(filter, offset, "issueDate");
  const recordFilter = getDateRange(filter, offset, "createdAt");

  // 💰 REVENUE (ONLY PAID)

  const paidInvoices = await Invoice.find({
    ...invoiceFilter,
    status: "Paid",
  });

  // 🏢 CLIENT RELATION (GLOBAL — not filtered)
  const clients = await Client.find({}, { id: 1, relation: 1 });

  const clientMap = {};
  clients.forEach((c) => {
    clientMap[c.id] = c.relation;
  });

  // 💰 SPLIT REVENUE
  let recurringRevenue = 0;
  let oneTimeRevenue = 0;

  paidInvoices.forEach((inv) => {
    const relation = clientMap[inv.clientId];

    if (relation === "Recurring") {
      recurringRevenue += inv.totalAmount;
    } else {
      oneTimeRevenue += inv.totalAmount;
    }
  });

  const totalRevenue = recurringRevenue + oneTimeRevenue;

  // 💸 PAYROLL (PayrollRecord has no issueDate — use createdAt)
  const payroll = await PayrollRecord.aggregate([
    { $match: recordFilter },
    { $group: { _id: null, total: { $sum: "$totalSalary" } } },
  ]);

  // ⚠️ INCIDENTS
  const incidents = await Incident.countDocuments(recordFilter);

  // 👷 EMPLOYEES
  const employees = await Cleaner.countDocuments(recordFilter);

  // 🏢 SITES
  const sites = await Site.countDocuments();

  // 🏢 TOTAL CLIENTS (FILTERED)
  const totalClients = await Client.countDocuments();

  // 🧹 INSPECTION
  const inspection = await Inspection.aggregate([
    { $match: recordFilter },
    { $group: { _id: null, avg: { $avg: "$score" } } },
  ]);

  // 📊 PROSPECTS
  const totalProspects = await Prospect.countDocuments();

  const convertedProspects = await Prospect.countDocuments({
    ...recordFilter,
    status: "Converted",
  });

  // 🧾 QUOTATIONS (issueDate aligned with sales period)
  const totalQuotations = await Quotation.countDocuments(invoiceFilter);

  const acceptedQuotations = await Quotation.countDocuments({
    ...invoiceFilter,
    status: "Accepted",
  });

  // 📈 PIPELINE VALUE
  const pipelineValueAgg = await Quotation.aggregate([
    {
      $match: {
        ...invoiceFilter,
        status: "Sent",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  const pipelineValue = pipelineValueAgg[0]?.total || 0;

  // 📊 AVG MONTHLY (denominator matches selected period)
  const localNow = new Date(Date.now() - offset * 60000);
  let months = 12;
  if (filter === "month") months = 1;
  else if (filter === "quarter") months = 3;
  else if (filter === "year") months = Math.max(1, localNow.getMonth() + 1);
  else if (filter === "all") months = 12;

  const avgMonthly = months ? totalRevenue / months : totalRevenue;

  // 📉 TREND CALCULATION (AFTER revenue is ready)
  // 📉 TREND CALCULATION (CLEAN)

  const prevDateFilter = getPreviousDateRange(filter, offset, "issueDate");

  const prevPaidInvoices = await Invoice.find({
    ...prevDateFilter,
    status: "Paid",
  });

  let prevRecurringRevenue = 0;
  let prevOneTimeRevenue = 0;

  prevPaidInvoices.forEach((inv) => {
    const relation = clientMap[inv.clientId];

    if (relation === "Recurring") {
      prevRecurringRevenue += inv.totalAmount;
    } else {
      prevOneTimeRevenue += inv.totalAmount;
    }
  });

  const prevTotalRevenue = prevRecurringRevenue + prevOneTimeRevenue;

  // 🔥 TOTAL REVENUE TREND
  const revenueTrend = prevTotalRevenue
    ? (((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100).toFixed(1)
    : 0;

  const revenueTrendUp = totalRevenue >= prevTotalRevenue;

  // 🔥 RECURRING TREND
  const recurringTrend = prevRecurringRevenue
    ? (
        ((recurringRevenue - prevRecurringRevenue) / prevRecurringRevenue) *
        100
      ).toFixed(1)
    : 0;

  const recurringTrendUp = recurringRevenue >= prevRecurringRevenue;

  // 🔥 ONE-TIME TREND
  const oneTimeTrend = prevOneTimeRevenue
    ? (
        ((oneTimeRevenue - prevOneTimeRevenue) / prevOneTimeRevenue) *
        100
      ).toFixed(1)
    : 0;

  const oneTimeTrendUp = oneTimeRevenue >= prevOneTimeRevenue;

  // ✅ FINAL RETURN
  return {
    revenue: totalRevenue,
    recurringRevenue,
    oneTimeRevenue,
    avgMonthly,

    payroll: payroll[0]?.total || 0,
    profit: totalRevenue - (payroll[0]?.total || 0),

    totalClients,
    incidents,
    employees,
    sites,
    avgInspectionScore: inspection[0]?.avg || 0,

    totalProspects,
    convertedProspects,
    conversionRate: totalProspects
      ? ((convertedProspects / totalProspects) * 100).toFixed(1)
      : 0,

    totalQuotations,
    acceptedQuotations,
    acceptanceRate: totalQuotations
      ? ((acceptedQuotations / totalQuotations) * 100).toFixed(1)
      : 0,

    pipelineValue,
    totalProspects,
    // ✅ trends
    revenueTrend,
    revenueTrendUp,

    recurringTrend,
    recurringTrendUp,

    oneTimeTrend,
    oneTimeTrendUp,
  };
};

const getDateRange = (filter, offsetMinutes = 0, field = "createdAt") => {
  const now = new Date();

  // Convert to user local time
  const localNow = new Date(now.getTime() - offsetMinutes * 60000);

  let start, end;

  switch (filter) {
    case "month":
      start = new Date(localNow.getFullYear(), localNow.getMonth(), 1);
      end = new Date(
        localNow.getFullYear(),
        localNow.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      break;

    case "year":
      // Jan 1 through end of current month (not full calendar year ahead)
      start = new Date(localNow.getFullYear(), 0, 1);
      end = new Date(
        localNow.getFullYear(),
        localNow.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      break;

    case "all":
      return {};

    case "quarter": {
      // const q = Math.floor(localNow.getMonth() / 3);
      // start = new Date(localNow.getFullYear(), q * 3, 1);
      // end = new Date(localNow.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
      start = new Date(localNow.getFullYear(), localNow.getMonth() - 2, 1);

      // End = end of current month
      end = new Date(
        localNow.getFullYear(),
        localNow.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      break;
    }

    case "week":
      start = new Date(localNow);
      start.setDate(localNow.getDate() - 7);
      end = new Date(localNow);
      break;

    default:
      return {};
  }

  // Convert back to UTC
  return {
    [field]: {
      $gte: new Date(start.getTime() + offsetMinutes * 60000),
      $lte: new Date(end.getTime() + offsetMinutes * 60000),
    },
  };
};

export const getGoalsData = async (filter) => {
  const goals = await PerformanceGoal.find({ period: filter });

  const dashboard = await getDashboardData(filter, 0);

  return goals.map((goal) => {
    let actual = 0;

    switch (goal.type) {
      case "revenue":
        actual = dashboard.revenue;
        break;

      case "inspection":
        actual = dashboard.avgInspectionScore;
        break;

      case "conversion":
        actual = dashboard.conversionRate;
        break;

      case "incident":
        actual = dashboard.incidents;
        break;
    }

    const progress = Math.min((actual / goal.targetValue) * 100, 100);

    return {
      type: goal.type,
      target: goal.targetValue,
      actual,
      progress: progress.toFixed(1),
    };
  });
};

const getPreviousDateRange = (filter, offsetMinutes = 0, field = "issueDate") => {
  const now = new Date();
  const localNow = new Date(now.getTime() - offsetMinutes * 60000);

  let start;
  let end;

  switch (filter) {
    case "month":
      start = new Date(localNow.getFullYear(), localNow.getMonth() - 1, 1);
      end = new Date(
        localNow.getFullYear(),
        localNow.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      break;

    case "quarter": {
      const curStart = new Date(localNow.getFullYear(), localNow.getMonth() - 2, 1);
      end = new Date(curStart.getTime() - 86400000);
      end.setHours(23, 59, 59, 999);
      start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
      break;
    }

    case "year": {
      const y = localNow.getFullYear();
      const m = localNow.getMonth();
      start = new Date(y - 1, 0, 1);
      end = new Date(y - 1, m + 1, 0, 23, 59, 59, 999);
      break;
    }

    case "week":
      end = new Date(localNow);
      end.setDate(end.getDate() - 7);
      start = new Date(localNow);
      start.setDate(start.getDate() - 14);
      break;

    default:
      return {};
  }

  return {
    [field]: {
      $gte: new Date(start.getTime() + offsetMinutes * 60000),
      $lte: new Date(end.getTime() + offsetMinutes * 60000),
    },
  };
};

export const getMonthlyMetrics = async (filter, offset = 0) => {
  const dateFilter = getDateRange(filter, offset, "issueDate");
  console.log("dateFilter", dateFilter);
  const invoices = await Invoice.find({
    ...dateFilter,
    status: "Paid",
  });

  const clients = await Client.find({}, { id: 1, relation: 1 });

  const clientMap = {};
  clients.forEach((c) => {
    clientMap[c.id] = c.relation;
  });

  const monthlyData = {};

  invoices.forEach((inv) => {
    // ✅ FIX: use issueDate NOT createdAt
    const date = new Date(inv.issueDate);

    const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // unique key
    const monthLabel = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthLabel, // "Dec 2025"
        sortDate: new Date(date.getFullYear(), date.getMonth(), 1),
        recurring: 0,
        oneTime: 0,
        total: 0,
      };
    }

    const relation = clientMap[inv.clientId];

    if (relation === "Recurring") {
      monthlyData[monthKey].recurring += inv.totalAmount;
    } else {
      monthlyData[monthKey].oneTime += inv.totalAmount;
    }

    monthlyData[monthKey].total += inv.totalAmount;
  });

  // ✅ FIX: sort months properly
  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const result = Object.values(monthlyData);

  result.sort((a, b) => a.sortDate - b.sortDate);
  console.log("invoices", result);
  return result;
};

export const recentTransation = async (filter, offset = 0) => {
  const dateFilter = getDateRange(filter, offset, "issueDate");

  const invoices = await Invoice.find({
    ...dateFilter,
    status: "Paid",
  }).sort({ issueDate: -1 }); // ✅ latest first

  const clients = await Client.find({}, { id: 1, relation: 1, name: 1 });

  const clientMap = {};
  clients.forEach((c) => {
    clientMap[c.id] = {
      relation: c.relation,
      name: c.name,
    };
  });

  // ✅ RETURN ACTUAL TRANSACTIONS
  const sales = invoices.map((inv) => {
    const client = clientMap[inv.clientId];

    return {
      id: inv._id,
      clientName: client?.name || "Unknown",
      service: inv.serviceItems?.[0]?.serviceDescription || "Cleaning Service",
      date: inv.issueDate, // ✅ IMPORTANT
      type: client?.relation === "Recurring" ? "RECURRING" : "ONE_TIME",
      amount: inv.totalAmount,
    };
  });

  return sales;
};

export const getSalesTransactions = async (filter, offset = 0) => {
  const dateFilter = getDateRange(filter, offset, "issueDate");

  const invoices = await Invoice.find({
    ...dateFilter,
    status: "Paid",
  });

  const clients = await Client.find({}, { id: 1, relation: 1, name: 1 });

  const clientMap = {};
  clients.forEach((c) => {
    clientMap[c.id] = {
      relation: c.relation,
      name: c.name,
    };
  });

  const sales = invoices.map((inv) => {
    const client = clientMap[inv.clientId];

    return {
      id: inv._id,
      clientName: client?.name || "Unknown",
      service: inv.serviceItems?.[0]?.serviceDescription || "Cleaning Service",
      date: inv.issueDate,
      type: client?.relation === "Recurring" ? "RECURRING" : "ONE_TIME",
      amount: inv.totalAmount,
    };
  });

  // 🔥 latest first
  sales.sort((a, b) => new Date(b.date) - new Date(a.date));

  return sales;
};
