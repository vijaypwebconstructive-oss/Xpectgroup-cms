export const isEmployeeRoute = () => {
  const path = window.location.pathname;

  return path.startsWith("/onboarding") || path.startsWith("/thank-you");
};

export const isAdminRoute = () => {
  return !isEmployeeRoute();
};
