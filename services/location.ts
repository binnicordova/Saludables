import * as Location from "expo-location";

export const streamLocation = async (
    callback: (location: Location.LocationObject) => void,
    errorCallback: (error: Error) => void,
): Promise<Location.LocationSubscription | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
        errorCallback(new Error("Location permission not granted"));
        return null;
    }

    try {
        const subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 10000,
                distanceInterval: 50,
            },
            (location) => {
                callback(location);
            },
        );
        return subscription;
    } catch (error) {
        errorCallback(error as Error);
        return null;
    }
};

export const getCurrentLocation =
    async (): Promise<Location.LocationObject | null> => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            return null;
        }

        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            return location;
        } catch (error) {
            return null;
        }
    };
