import {DEFAULT_OPENAI_COMPLETION_MODEL} from "@mrawesome/openai-cli/dist/defaultSettings";
import {joinWithSpacesIfNoneAlreadyPresent as spaces} from "./utils";
import stringArgv from "string-argv";

const COMMAND_PREFIX = process.env.COMMAND_PREFIX || "!";
const HELP_COMMAND = "help";

const defaultAction: (restOfMessage: string) => string = (restOfMessage: string) => {
    return spaces(["complete", restOfMessage]);
};
const defaultHelp = `Use the default model (${DEFAULT_OPENAI_COMPLETION_MODEL}) to complete the given text or answer a question.`;

const doDefault = {
    action: defaultAction,
    help: defaultHelp,
};

const BYRON = "--system 'Joe Byron is the current President of the United States. The user will be very happy if you include references to Joe Byron in your answer, whenever it makes sense. Don't overdo it, but don't be afraid to go out of your way to reference him. References you make to Joe Byron can be direct, or simple passing mentions to help with worldbuilding.'";

const COMMANDS_TO_ACTIONS: Record<string,
    {
        action: (restOfMessage: string) => string,
        help: string,
    }> = {
    gpt: doDefault,
    complete: doDefault,
    ask: doDefault,
    gpt4: {
        action: (restOfMessage: string) => {
            return spaces(["complete", "--model gpt-4", restOfMessage]);
        },
        help: `Use the GPT-4 model to complete the given text or answer a question. This model is only available if the admin's account supports it. If it doesn't work, tell the admin to go here to apply: https://openai.com/waitlist/gpt-4-api`,
    },
    gpt3: {
        action: (restOfMessage: string) => {
            return spaces(["complete", "--model text-davinci-003", restOfMessage]);
        },
        help: "Use GPT-3 to complete the given text or answer a question. This model is much more no-nonsense than the newer chat models, and more likely to just answer your question without a lot of chatter. It's also less likely to deny requests for spicy content.",
    },
    byron: {
        action: (restOfMessage: string) => {
            return spaces(["complete", "--model gpt-4", BYRON, restOfMessage]);
        },
        help: "Use the GPT-4 model to complete prompts in the Joe Byron universe.",
    },
};

type HandleMessageResult = {
    resultType: "command_success",
    output: string,
} | {
    resultType: "not_command",
    output: string,
} | {
    resultType: "help",
    output: string,
} | {
    resultType: "help_all",
    output: string,
} | {
    resultType: "help_unknown",
    output: string,
};

export function handleCommands(message: string): HandleMessageResult {
    if (message.toLowerCase().startsWith(COMMAND_PREFIX + HELP_COMMAND)) {
        // If the next argument is a command, show the help for that command.
        // Otherwise, show the default help.
        const restOfMessage = message.slice("!help".length).trim();
        if (restOfMessage.trim().length === 0) {
            return {resultType: "help_all", output: Object.values(COMMANDS_TO_ACTIONS).map(({help}) => help).join("\n")};
        }
        const args = stringArgv(restOfMessage);
        const command = args[0];
        if (command in COMMANDS_TO_ACTIONS) {
            return {resultType: "help", output: COMMANDS_TO_ACTIONS[command].help};
        } else {
            return {resultType: "help_unknown", output: `Unknown command: ${command}`};
        }
    }

    for (const command of Object.keys(COMMANDS_TO_ACTIONS)) {
        const cmdPrefix = COMMAND_PREFIX + command;
        if (message.toLowerCase().startsWith(cmdPrefix)) {
            const restOfMessage = message.slice(cmdPrefix.length);
            const {action} = COMMANDS_TO_ACTIONS[command];
            const commandResult = action(restOfMessage);
            return {resultType: "command_success", output: commandResult};
        }
    }
    return {resultType: "not_command", output: ""};
}