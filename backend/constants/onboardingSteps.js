export const ONBOARDING_STEPS = {
  1: "Citizenship Status",
  2: "Personal Details",
  3: "Right to Work",
  4: "Visa Details",
  5: "Student Visa Details",
  6: "Identity Proof",
  7: "Employment Type",
  8: "DBS Check",
  9: "Employment Preferences",
  10: "Declarations",
};

export const getStepName = (step) => {
  return ONBOARDING_STEPS[step] || "Not Started";
};
