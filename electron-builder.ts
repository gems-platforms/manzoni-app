import type {Configuration} from "electron-builder";

const appId = "com.manzoni.app";
const productName = "Manzoni";
const executableName = "Manzoni";

/**
 * @see - https://www.electron.build/configuration/configuration
 */
export default {
    appId: appId,
    asar: true,
    productName: productName,
    executableName: executableName,
    directories: {
        output: "release"
    },
    files: [
        "dist",
        "dist-electron",
        "public",
        "!node_modules/node-llama-cpp/bins/**/*",
        "node_modules/node-llama-cpp/bins/${os}-${arch}*/**/*",
        "!node_modules/@node-llama-cpp/*/bins/**/*",
        "node_modules/@node-llama-cpp/${os}-${arch}*/bins/**/*",
        "!node_modules/node-llama-cpp/llama/localBuilds/**/*",
        "node_modules/node-llama-cpp/llama/localBuilds/${os}-${arch}*/**/*"
    ],
    asarUnpack: [
        "node_modules/node-llama-cpp/bins",
        "node_modules/node-llama-cpp/llama/localBuilds",
        "node_modules/@node-llama-cpp/*"
    ],
    mac: {
        target: [{
            target: "dmg",
            arch: [
                "arm64",
                "x64"
            ]
        },
        {
            target: "zip",
            arch: [
                "arm64",
                "x64"
            ]
        }],
        artifactName: "${name}_${version}_macOS_${arch}.${ext}",
        icon: "src/assets/icons/icon.icns",
        hardenedRuntime: true,
        entitlements: "./entitlements.plist",
        entitlementsInherit: "./entitlements.plist",
        gatekeeperAssess: false
    }
} as Configuration;
