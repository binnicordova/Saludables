import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Share } from "react-native";

/**
 * Shares a simple text message or URL using the system share dialog.
 */
export async function shareText(
    message: string,
    url?: string,
    title?: string,
): Promise<boolean> {
    try {
        const result = await Share.share({
            message,
            url,
            title,
        });

        return result.action === Share.sharedAction;
    } catch (error) {
        console.error("Error sharing text:", error);
        return false;
    }
}

/**
 * Shares a local image asset using the system share dialog.
 * Handles downloading the asset and preparing it in a cache folder.
 */
export async function shareAssetImage(
    assetModule: any,
    filename: string,
    dialogTitle?: string,
): Promise<boolean> {
    try {
        const asset = Asset.fromModule(assetModule);
        await asset.downloadAsync();

        const folder = `${FileSystem.cacheDirectory}shares/`;
        const dest = `${folder}${filename}`;

        const folderInfo = await FileSystem.getInfoAsync(folder);
        if (!folderInfo.exists) {
            await FileSystem.makeDirectoryAsync(folder, {
                intermediates: true,
            });
        }

        await FileSystem.copyAsync({ from: asset.localUri!, to: dest });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(dest, {
                mimeType: "image/png",
                dialogTitle,
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error sharing asset image:", error);
        return false;
    }
}
