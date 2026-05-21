//
// GET USER TIMEZONE
//
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

//
// SAFE DATE
//
//
// SAFE DATE
//
const parseSafeDate = (date?: string) => {
  //
  // EMPTY
  //
  if (!date || date.trim() === "") {
    return null;
  }

  //
  // ISO SAFE PARSE
  //
  const parsed = new Date(date);

  //
  // INVALID
  //
  if (isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

//
// FORMAT TIME
//
export const formatTime = (date?: string) => {
  const parsed = parseSafeDate(date);

  if (!parsed) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: getUserTimezone(),

    hour: "2-digit",

    minute: "2-digit",

    hour12: true,
  }).format(parsed);
};

//
// FORMAT DATE
//
export const formatDate = (date?: string) => {
  const parsed = parseSafeDate(date);

  if (!parsed) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: getUserTimezone(),

    day: "2-digit",

    month: "short",

    year: "numeric",
  }).format(parsed);
};

//
// FORMAT DATE + TIME
//
export const formatDateTime = (date?: string) => {
  const parsed = parseSafeDate(date);

  if (!parsed) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: getUserTimezone(),

    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

    hour12: true,
  }).format(parsed);
};

//
// CURRENT LOCAL TIME
//
export const getCurrentLocalTime = () => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: getUserTimezone(),

    hour: "2-digit",

    minute: "2-digit",

    hour12: true,
  }).format(new Date());
};
