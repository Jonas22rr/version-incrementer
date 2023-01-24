import { promises as fs } from "fs";
import prompts from "prompts";

interface PackageJson {
    version: string;
    name: string;
    containerRegistry: string;
    containerName: string;
}

export const incrementVersion = async (): Promise<void> => {
    const json: PackageJson = await getPackageJsonAsString();
    await setVersionIncrement(json);
};

async function getPackageJsonAsString (): Promise<PackageJson> {
    const packageJsonAsBuffer: Buffer = await fs.readFile("./package.json");
    const packageJson: PackageJson = JSON.parse(packageJsonAsBuffer.toString());
    return packageJson;
}

async function setVersionIncrement (json: PackageJson): Promise<void> {
    const version: string = json.version;
    let newVersion: string;
    const stage: string = await getStageRelease(version);
    newVersion = await getNewVersion(version, stage);
    if (json.version !== newVersion) {
        json.version = newVersion;
        fs.writeFile("./package.json", JSON.stringify(json, null, 2));
        console.log("write Package.json " + json.version);
    }
}

async function getNewVersion (version: string, stage: string): Promise<string> {
    const versionArray: string[] = version.split(".");
    let versionNumber: number;
    switch (stage) {
        case "patch":
            versionNumber = parseInt(versionArray[2]);
            versionNumber++;
            versionArray[2] = versionNumber.toString();
            break;
        case "minor":
            versionNumber = parseInt(versionArray[1]);
            versionNumber++;
            versionArray[1] = versionNumber.toString();
            versionArray[2] = "0";
            break;
        case "major":
            versionNumber = parseInt(versionArray[0]);
            versionNumber++;
            versionArray[0] = versionNumber.toString();
            versionArray[1] = "0";
            versionArray[2] = "0";
            break;
        case "nothing":
            versionNumber = parseInt(version);
            break;
    }
    return versionArray.join(".");
}

async function getStageRelease (oldVersion: string): Promise<string> {
    const result = await prompts({
        type: 'select',
        name: 'value',
        message: 'Which stage do you want to count up?',
        choices: [
            { title: 'Patch release', description: await getNewVersion(oldVersion, "patch"), value: 'patch' },
            { title: 'Minor release', description: await getNewVersion(oldVersion, "minor"), value: 'minor' },
            { title: 'Major release', description: await getNewVersion(oldVersion, "major"), value: 'major' },
            { title: 'no increment', value: 'nothing' }
        ],
        initial: 0,
    });
    return result.value;
}