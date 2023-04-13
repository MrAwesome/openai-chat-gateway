import {DEFAULT_OPENAI_COMPLETION_MODEL} from "@mrawesome/openai-cli/dist/defaultSettings";
import stringArgv from "string-argv";

import {joinWithSpacesIfNoneAlreadyPresent as spaces} from "./utils";
import {getByron} from "./customCommands/byron";

const COMMAND_PREFIX = process.env.COMMAND_PREFIX || "!";
const HELP_COMMAND = "help";
const HELP = `${COMMAND_PREFIX}${HELP_COMMAND}`;

const defaultAction: (restOfMessage: string) => string = (
    restOfMessage: string
) => {
    return spaces(["complete", restOfMessage]);
};
const defaultHelp = `Use the default model (${DEFAULT_OPENAI_COMPLETION_MODEL}) to complete the given text or answer a question.`;

const doDefault = {
    action: defaultAction,
    help: defaultHelp,
};

const COMMANDS_TO_ACTIONS: Record<
    string,
    {
        action: (restOfMessage: string) => string;
        help: string;
    }
> = {
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
            return spaces([
                "complete",
                "--model text-davinci-003",
                restOfMessage,
            ]);
        },
        help: "Use GPT-3 to complete the given text or answer a question. This model is much more no-nonsense than the newer chat models, and more likely to just answer your question without a lot of chatter. It's also less likely to deny requests for spicy content.",
    },
    byron: {
        action: (restOfMessage: string) => {
            return spaces(["complete", "--model gpt-4", getByron(), restOfMessage]);
        },
        help: "Use the GPT-4 model to complete prompts in the Joe Byron universe.",
    },
};

type HandleMessageResult =
    | {
        resultType: "command_success";
        output: string;
    }
    | {
        resultType: "not_command";
        output: string;
    }
    | {
        resultType: "help";
        output: string;
    }
    | {
        resultType: "help_all";
        output: string;
    }
    | {
        resultType: "help_unknown";
        output: string;
    };

export function handleCommands(message: string): HandleMessageResult {
    if (message.toLowerCase().startsWith(HELP)) {
        // If the next argument is a command, show the help for that command.
        // Otherwise, show the default help.
        const restOfMessage = message.slice(HELP.length).trim();
        if (restOfMessage.trim().length === 0) {
            return {
                resultType: "help_all",
                output: Object.entries(COMMANDS_TO_ACTIONS)
                    .map(([commandName, {help}]) =>
                        `${COMMAND_PREFIX}${commandName}: ${help}`
                    )
                    .join("\n"),
            };
        }
        const args = stringArgv(restOfMessage);
        const command = args[0];
        if (command in COMMANDS_TO_ACTIONS) {
            return {
                resultType: "help",
                output: `${COMMAND_PREFIX}${command}: ${COMMANDS_TO_ACTIONS[command].help}`,
            };
        } else {
            return {
                resultType: "help_unknown",
                output: `Unknown command: ${COMMAND_PREFIX}${command}`,
            };
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
