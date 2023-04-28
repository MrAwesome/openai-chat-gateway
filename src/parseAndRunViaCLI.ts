import {CLIRunner} from "@mrawesome/openai-cli";
import type {ScriptContext, ScriptReturn} from "@mrawesome/openai-cli/dist/types";
import {SERVER_ADMIN_CONTACT_INFO} from "./constants";
import stringArgv from "string-argv";

export default async function parseAndRunViaCLI(input: string): Promise<ScriptReturn> {
    // NOTE: openai-cli should probably handle this instead
    const rawArgs = stringArgv(input);
    const scriptContext: ScriptContext = {
        // NOTE: this relies on this file being in src/
        repoBaseDir: __dirname,
        rawArgs,
        isRemote: true,
        serverAdminContactInfo: SERVER_ADMIN_CONTACT_INFO,
    };

    const runner = new CLIRunner(scriptContext);
    const res = await runner.run();
    if (res.status === "success") {
        console.log(res.output);
    }
    if (res.status === "failure_safe") {
        console.error(res.stderr);
    }
    if (res.status === "failure_unsafe") {
        console.error("[!!!] UNSAFE ERROR ENCOUNTERED: ", res.error);
        console.error(res.stderr);
    }
    if (res.status === "exit") {
        console.log(res.output);
    }

    return res;
}
