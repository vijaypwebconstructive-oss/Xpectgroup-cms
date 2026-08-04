import { isEmployeeRoute } from "./routeUtils";

export const shouldFetchProviderData = () => {
  return !isEmployeeRoute();
};
