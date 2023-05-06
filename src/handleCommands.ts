import {DEFAULT_OPENAI_COMPLETION_MODEL} from "@mrawesome/openai-cli/dist/defaultSettings";
import stringArgv from "string-argv";

import {joinWithSpacesIfNoneAlreadyPresent as spaces} from "./utils";
import {getByron} from "./customCommands/byron";

const COMMAND_PREFIX = process.env.COMMAND_PREFIX || "!";
const HELP_COMMAND = "help";
const HELP = `${COMMAND_PREFIX}${HELP_COMMAND}`;

const defaultAction: (restOfMessage: string) => string = (
    restOfMessage: string
) => spaces(["complete", restOfMessage]);
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

    // Worldbuilding
    byron: {
        action: (restOfMessage: string) => {
            return spaces(["complete", "--model gpt-4", getByron(), restOfMessage]);
        },
        help: "Use the GPT-4 model to complete prompts in the Joe Byron universe.",
    },
    nyc: {
        action: (restOfMessage: string) => {
            return spaces(["complete", "--model gpt-4", `--system "You are a parody Twitter account, which only answers in 240 characters or less, and ONLY answers in the style of the Twitter account @NYCGuidoVoice. Answer with a wry, slightly cynical but also slightly surreal Italian New Yorker sense of humor."` , restOfMessage]);
        },
        help: "Get answers from the greatest city on Earth.",
    },
    duck: {
        action: (restOfMessage: string) => {
            return spaces(["complete", "--model gpt-4", `--system "Answer cryptically, with a mysterious aura. Do elaborate worldbuilding as if there's a giant conspiracy run by the Duck Society who are meddling in all human affairs. Don't refer to the society by name unless asked."` , restOfMessage]);
        },
        help: "Use the GPT-4 model to discover the truth.",
    }

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
    // Handle !help and !help <command>
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
                output: `Unknown command: ${COMMAND_PREFIX}${command}. Type !help to see all available commands.`,
            };
        }
    }

    // Check for, and run, commands
    for (const command of Object.keys(COMMANDS_TO_ACTIONS)) {
        const cmdPrefix = COMMAND_PREFIX + command.toLowerCase();
        if (message.toLowerCase().startsWith(cmdPrefix)) {
            const restOfMessage = message.slice(cmdPrefix.length);
            const {action} = COMMANDS_TO_ACTIONS[command];
            const commandResult = action(restOfMessage);
            return {resultType: "command_success", output: commandResult};
        }
    }

    // If the user typed a command that doesn't exist, tell them
    if (message.startsWith(COMMAND_PREFIX)) {
        return {
            resultType: "help_unknown",
            output: `Unknown command: ${message.split(" ")[0]}. Type !help to see all available commands.`,
        };
    }

    return {resultType: "not_command", output: ""};
}
