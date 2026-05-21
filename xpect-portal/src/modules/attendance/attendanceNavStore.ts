// import { AttendanceView } from "./types";

// type AttendanceState = {
//   view: AttendanceView;
// };

// let state: AttendanceState = {
//   view: "dashboard",
// };

// const listeners = new Set<(state: AttendanceState) => void>();

// export const getAttendanceState = () => state;

// export const subscribeAttendance = (
//   listener: (state: AttendanceState) => void,
// ) => {
//   listeners.add(listener);

//   return () => {
//     listeners.delete(listener);
//   };
// };

// export const attendanceNavigate = (view: AttendanceView) => {
//   state = { view };

//   listeners.forEach((listener) => listener(state));
// };

import { AttendanceView } from "./types";

type AttendanceState = {
  view: AttendanceView;
};

let state: AttendanceState = {
  view: "dashboard",
};

const listeners = new Set<(state: AttendanceState) => void>();

const VIEW_TO_URL: Record<AttendanceView, string> = {
  dashboard: "/attendance/dashboard",
  "admin-attendance": "/attendance/admin",
  "employee-attendance": "/attendance/employee",
  regularization: "/attendance/regularization",
};

const URL_TO_VIEW: Record<string, AttendanceView> = {
  "/attendance/dashboard": "dashboard",
  "/attendance/admin": "admin-attendance",
  "/attendance/employee": "employee-attendance",
  "/attendance/regularization": "regularization",
};

export const getAttendanceState = () => state;

export const subscribeAttendance = (
  listener: (state: AttendanceState) => void,
) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

const notify = () => {
  listeners.forEach((listener) => listener(state));
};

export const attendanceNavigate = (view: AttendanceView) => {
  state = { view };

  const url = VIEW_TO_URL[view];

  window.history.pushState({}, "", url);

  notify();
};

window.addEventListener("popstate", () => {
  const path = window.location.pathname;

  const matchedView = URL_TO_VIEW[path];

  if (matchedView) {
    state = {
      view: matchedView,
    };

    notify();
  }
});

export const initAttendanceRoute = () => {
  const path = window.location.pathname;

  const matchedView = URL_TO_VIEW[path];

  if (matchedView) {
    state = {
      view: matchedView,
    };
  }
};
