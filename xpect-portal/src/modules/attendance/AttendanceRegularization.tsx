import { useEffect, useState } from "react";

import api from "../../services/api";

import { formatDate, formatTime } from "../../utils/date";

const AttendanceRegularization = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const [reviewLoading, setReviewLoading] = useState(false);

  const [reviewStatus, setReviewStatus] = useState("Approved");

  const [adminNotes, setAdminNotes] = useState("");

  const [updatedClockIn, setUpdatedClockIn] = useState("");

  const [updatedClockOut, setUpdatedClockOut] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("xpect_user") || "{}");

  //
  // LOAD REQUESTS
  //
  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await api.attendanceRegularization.getAll();

      setRequests(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  //
  // REVIEW REQUEST
  //
  const handleReview = async () => {
    try {
      setReviewLoading(true);

      await api.attendanceRegularization.review(selectedRequest.id, {
        status: reviewStatus,

        adminName: currentUser.fullName,

        adminNotes,

        updatedClockIn,

        updatedClockOut,
      });

      //
      // CLOSE
      //
      setShowReviewDialog(false);

      //
      // RESET
      //
      setSelectedRequest(null);

      setAdminNotes("");

      setUpdatedClockIn("");

      setUpdatedClockOut("");

      //
      // RELOAD
      //
      await loadRequests();

      alert("Request reviewed successfully");
    } catch (error: any) {
      console.error(error);

      alert(error.message || "Failed to review request");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col py-[15px] sm:py-[30px] px-4 sm:px-[30px] bg-[#f6f8fc] min-h-[calc(100vh-160px)] overflow-hidden">
      <div className="space-y-6 w-full">
        {/* HEADER */}
        <div>
          <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-black">
            Attendance Regularization
          </h1>

          <p className="text-[#4c669a] text-base mt-1">
            Review attendance correction requests.
          </p>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Cleaner
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Reason
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-[#64748b]"
                    >
                      Loading requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-[#64748b]"
                    >
                      No requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((item) => (
                    <tr key={item.id} className="border-t border-[#edf2f7]">
                      {/* CLEANER */}
                      <td className="px-6 py-4 font-semibold">
                        {item.workerName}
                      </td>

                      {/* TYPE */}
                      <td className="px-6 py-4">{item.type}</td>

                      {/* REASON */}
                      <td className="px-6 py-4 max-w-[280px]">
                        <p className="truncate">{item.reason}</p>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-4">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        {item.status === "Pending" ? (
                          <button
                            onClick={() => {
                              setSelectedRequest(item);

                              setReviewStatus("Approved");

                              //
                              // AUTO FILL REQUESTED VALUES
                              //
                              setUpdatedClockIn(
                                item.requestedClockIn
                                  ? new Date(item.requestedClockIn)
                                      .toISOString()
                                      .slice(0, 16)
                                  : "",
                              );

                              setUpdatedClockOut(
                                item.requestedClockOut
                                  ? item.requestedClockOut.slice(0, 16)
                                  : "",
                              );

                              setAdminNotes("");

                              setShowReviewDialog(true);
                            }}
                            className="px-4 h-9 rounded-xl bg-[#2e4150] text-white text-xs font-bold hover:bg-[#243441]"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-[#94a3b8] text-sm">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REVIEW DIALOG */}
        {showReviewDialog && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e7ebf3]">
              {/* HEADER */}
              <div className="p-6 border-b border-[#edf2f7]">
                <h2 className="text-2xl font-black text-[#0d121b]">
                  Review Request
                </h2>

                <p className="text-[#64748b] mt-2">
                  Update attendance manually
                </p>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-5">
                {/* STATUS */}
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-2">
                    Decision
                  </label>

                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-[#dbe3ef] px-4"
                  >
                    <option>Approved</option>

                    <option>Rejected</option>
                  </select>
                </div>

                {/* CLOCK IN */}
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-2">
                    Corrected Clock-In
                  </label>

                  <input
                    type="datetime-local"
                    value={updatedClockIn}
                    onChange={(e) => setUpdatedClockIn(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-[#dbe3ef] px-4"
                  />
                </div>

                {/* CLOCK OUT */}
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-2">
                    Corrected Clock-Out
                  </label>

                  <input
                    type="datetime-local"
                    value={updatedClockOut}
                    onChange={(e) => setUpdatedClockOut(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-[#dbe3ef] px-4"
                  />
                </div>

                {/* NOTES */}
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-2">
                    Admin Notes
                  </label>

                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add review notes..."
                    className="w-full rounded-2xl border border-[#dbe3ef] p-4 resize-none"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-6 border-t border-[#edf2f7] flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowReviewDialog(false)}
                  className="h-11 px-5 rounded-xl border border-[#dbe3ef] font-semibold"
                >
                  Cancel
                </button>

                <button
                  disabled={reviewLoading}
                  onClick={handleReview}
                  className="h-11 px-6 rounded-xl bg-[#2e4150] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 min-w-[180px]"
                >
                  {reviewLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}

                  {reviewLoading ? "Saving..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRegularization;
