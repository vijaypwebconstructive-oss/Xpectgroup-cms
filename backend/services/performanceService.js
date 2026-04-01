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

export const getDashboardData = async (filter) => {
  const dateFilter = getDateRange(filter, "issueDate");

  // 💰 REVENUE (ONLY PAID)

  const paidInvoices = await Invoice.find({
    ...dateFilter,
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

  // 💸 PAYROLL
  const payroll = await PayrollRecord.aggregate([
    { $match: dateFilter },
    { $group: { _id: null, total: { $sum: "$totalSalary" } } },
  ]);

  // ⚠️ INCIDENTS
  const incidents = await Incident.countDocuments(dateFilter);

  // 👷 EMPLOYEES
  const employees = await Cleaner.countDocuments(dateFilter);

  // 🏢 SITES
  const sites = await Site.countDocuments();

  // 🏢 TOTAL CLIENTS (FILTERED)
  const totalClients = await Client.countDocuments();

  // 🧹 INSPECTION
  const inspection = await Inspection.aggregate([
    { $match: dateFilter },
    { $group: { _id: null, avg: { $avg: "$score" } } },
  ]);

  // 📊 PROSPECTS
  const totalProspects = await Prospect.countDocuments();

  const convertedProspects = await Prospect.countDocuments({
    ...dateFilter,
    status: "Converted",
  });

  // 🧾 QUOTATIONS
  const totalQuotations = await Quotation.countDocuments(dateFilter);

  const acceptedQuotations = await Quotation.countDocuments({
    ...dateFilter,
    status: "Accepted",
  });

  // 📈 PIPELINE VALUE
  const pipelineValueAgg = await Quotation.aggregate([
    {
      $match: {
        ...dateFilter,
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

  // 📊 AVG MONTHLY
  let months = 12;

  if (filter === "year") months = 12;
  else if (filter === "quarter") months = 3;
  else if (filter === "all") months = 12;

  const avgMonthly = totalRevenue / months;

  // 📉 TREND CALCULATION (AFTER revenue is ready)
  // 📉 TREND CALCULATION (CLEAN)

  const prevDateFilter = getPreviousDateRange(filter);

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

const getDateRange = (filter, field = "createdAt") => {
  const now = new Date();

  let startDate;

  switch (filter) {
    case "week":
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      break;

    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case "quarter":
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 3);
      break;

    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;

    default:
      return {}; // All time
  }

  return {
    [field]: { $gte: startDate, $lte: now },
  };
};

export const getGoalsData = async (filter) => {
  const goals = await PerformanceGoal.find({ period: filter });

  const dashboard = await getDashboardData(filter);

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

const getPreviousDateRange = (filter) => {
  const now = new Date();

  let start, end;

  switch (filter) {
    case "month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;

    case "year":
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
      break;

    case "week":
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - 14); // previous week window
      end.setDate(end.getDate() - 7);
      break;

    default:
      return {};
  }

  return { createdAt: { $gte: start, $lte: end } };
};

// charts

//   export const getMonthlyMetrics = async () => {
//     const { filter } = req.query;
//     const data = await getMonthlyMetrics(filter);
//     const invoices = await Invoice.find({ status: "Paid" });
//     console.log(invoices)

//     const clients = await Client.find({}, { id: 1, relation: 1 });

//     const clientMap = {};
//     clients.forEach((c) => {
//       clientMap[c._id] = c.relation;
//     });

//     const monthlyData = {};

//     invoices.forEach((inv) => {
//       const date = new Date(inv.createdAt);
//       const month = date.toLocaleString("default", { month: "short" });

//       if (!monthlyData[month]) {
//         monthlyData[month] = {
//           month,
//           recurring: 0,
//           oneTime: 0,
//           total: 0,
//         };
//       }

//       const relation = clientMap[inv.clientId];

//       if (relation === "Recurring") {
//         monthlyData[month].recurring += inv.totalAmount;
//       } else {
//         monthlyData[month].oneTime += inv.totalAmount;
//       }

//       monthlyData[month].total += inv.totalAmount;
//     });

//     console.log("FILTER:", dateFilter);
// console.log("INVOICES COUNT:", invoices.length);

//     return Object.values(monthlyData);
//   };

export const getMonthlyMetrics = async (filter) => {
  const dateFilter = getDateRange(filter, "issueDate");

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
    const month = new Date(inv.issueDate).toLocaleString("default", {
      month: "short",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = {
        month,
        recurring: 0,
        oneTime: 0,
        total: 0,
      };
    }

    const relation = clientMap[inv.clientId];

    if (relation === "Recurring") {
      monthlyData[month].recurring += inv.totalAmount;
    } else {
      monthlyData[month].oneTime += inv.totalAmount;
    }

    monthlyData[month].total += inv.totalAmount;
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

  result.sort((a, b) => {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  return result;
};

// summary ledger revenue table

// export const getMonthlyMetricsTable = async (filter) => {
//   const dateFilter = getDateRange(filter);

//   const invoices = await Invoice.find({
//     ...dateFilter,
//     status: "Paid",
//   });

//   const clients = await Client.find({}, { id: 1, relation: 1 });

//   const clientMap = {};
//   clients.forEach((c) => {
//     clientMap[c.id] = c.relation;
//   });

//   const monthlyData = {};

//   invoices.forEach((inv) => {
//     const date = new Date(inv.createdAt);
//     const month = date.toLocaleString("default", { month: "short" });

//     if (!monthlyData[month]) {
//       monthlyData[month] = {
//         month,
//         recurring: 0,
//         oneTime: 0,
//         total: 0,
//       };
//     }

//     const relation = clientMap[inv.clientId];

//     if (relation === "Recurring") {
//       monthlyData[month].recurring += inv.totalAmount;
//     } else {
//       monthlyData[month].oneTime += inv.totalAmount;
//     }

//     monthlyData[month].total += inv.totalAmount;
//   });

//   // 🔥 FIX: SORT MONTHS
//   const monthOrder = [
//     "Jan","Feb","Mar","Apr","May","Jun",
//     "Jul","Aug","Sep","Oct","Nov","Dec"
//   ];

//   const result = Object.values(monthlyData);

//   result.sort((a, b) => {
//     return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
//   });

//   return result;
// };

// export const recentTransation = async (filter) => {
//   const dateFilter = getDateRange(filter, "issueDate");

//   const invoices = await Invoice.find({
//     ...dateFilter,
//     status: "Paid",
//   });

//   const clients = await Client.find({}, { id: 1, relation: 1 });

//   const clientMap = {};
//   clients.forEach((c) => {
//     clientMap[c.id] = c.relation;
//   });

//   const monthlyData = {};

//   invoices.forEach((inv) => {
//     const date = new Date(inv.createdAt);
//     const month = date.toLocaleString("default", { month: "short" });

//     if (!monthlyData[month]) {
//       monthlyData[month] = {
//         month,
//         recurring: 0,
//         oneTime: 0,
//         total: 0,
//       };
//     }

//     const relation = clientMap[inv.clientId];

//     if (relation === "Recurring") {
//       monthlyData[month].recurring += inv.totalAmount;
//     } else {
//       monthlyData[month].oneTime += inv.totalAmount;
//     }

//     monthlyData[month].total += inv.totalAmount;
//   });

//   // 🔥 FIX: SORT MONTHS
//   const monthOrder = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];

//   const result = Object.values(monthlyData);

//   result.sort((a, b) => {
//     return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
//   });

//   return result;
// };

export const recentTransation = async (filter) => {
  const dateFilter = getDateRange(filter, "issueDate");

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

export const getSalesTransactions = async (filter) => {
  const dateFilter = getDateRange(filter, "issueDate");

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
