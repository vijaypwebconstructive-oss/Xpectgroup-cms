export const getCurrentLocation = async () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    //
    // Browser support check
    //
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));

      return;
    }

    //
    // Ask permission + get location
    //
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
        console.log("currentposstion", position);
      },

      (error) => {
        reject(error);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  });
};
