import {MessageReceivedV2, SignalInterface} from "./SignalDBUS";
import {CLIRunner} from "@mrawesome/openai-cli";
import stringArgv from "string-argv";
import {ScriptContext, ScriptReturn} from "@mrawesome/openai-cli/dist/types";

import dotenv from "dotenv";
import {handleCommands} from "./handleCommands";
import {ReactWithEmoji, RespondWithMessage, TypingAction} from "./types";
dotenv.config();

// TODO: have answers be sent as responses to the message that triggered them
// TODO: handle emoji responses to messages

const IN_PROGRESS_EMOJI = "🚬";
const SUCCESS_EMOJI = "✅";
const SAFE_FAILURE_EMOJI = "❌";
const UNSAFE_FAILURE_EMOJI = "⁉️";
const EXPECTED_EXIT_EMOJI = "🎓";
const COMMAND_HELP_EMOJI = "📖";

export default class MessageHandler {
    private isGroupMessage: boolean;
    constructor(
        private signal: SignalInterface,
        private serverAdminContactInfo: string,
        private messageReceived: MessageReceivedV2
    ) {
        this.isGroupMessage = messageReceived.groupId.byteLength > 0;

        this.handleGroupMessage = this.handleGroupMessage.bind(this);
        this.handleDirectMessage = this.handleDirectMessage.bind(this);
        this.parseAndRun = this.parseAndRun.bind(this);
        this.run = this.run.bind(this);
    }

    async handleGroupMessage() {
        const {signal, messageReceived} = this;
        const {message, sender, timestamp, groupId} = messageReceived;

        const respondWithMessage: RespondWithMessage = async (message: string) => {
            signal.sendGroupMessage(message, [], groupId);
        };
        const reactWithEmoji: ReactWithEmoji = async (emoji: string) => {
            signal.sendGroupMessageReaction(emoji, false, sender, timestamp, groupId);
        };
        const typingAction: TypingAction = async (action: "start_typing" | "stop_typing") => {
            const stopTyping = action !== "start_typing";
            signal.sendGroupTyping(groupId, stopTyping);
        };

        // TODO: move to function, and implement for individual commandline
        // TODO: unit test
        // TODO: show help/err on unknown commands
        // TODO: cancel if the current message comes from the same user? is that necessary?

        const commandResult = handleCommands(message);
        console.log({commandResult});

        if (commandResult.resultType === "not_command") {
            return;
        }

        if (["help", "help_all", "help_unknown"].includes(commandResult.resultType)) {
            respondWithMessage(commandResult.output);
            reactWithEmoji(COMMAND_HELP_EMOJI);
            return;
        }

        return await this.handleMessageInner(
            commandResult.output,
            reactWithEmoji,
            respondWithMessage,
            typingAction,
        );
    }

    // TODO: add support for commands, and just use a default command
    async handleDirectMessage() {
        const {signal, messageReceived} = this;
        const {message, sender, timestamp} = messageReceived;

        const reactWithEmoji: ReactWithEmoji = async (emoji: string) => {
            signal.sendMessageReaction(
                emoji,
                false,
                sender,
                timestamp,
                sender
            );
        };

        const respondWithMessage: RespondWithMessage = async (message: string) => {
            signal.sendMessage(message, [], [sender]);
        };

        const typingAction: TypingAction = async (action: "start_typing" | "stop_typing") => {
            const stopTyping = action !== "start_typing";
            signal.sendTyping(sender, stopTyping);
        };

        return await this.handleMessageInner(
            message,
            reactWithEmoji,
            respondWithMessage,
            typingAction,
        );
    }

    async handleMessageInner(
        message: string,
        reactWithEmoji: ReactWithEmoji,
        respondWithMessage: RespondWithMessage,
        typingAction: TypingAction
    ) {
        // TODO: do you need to await here? almost certainly not
        reactWithEmoji(IN_PROGRESS_EMOJI);
        typingAction("start_typing");

        try {
            const rawPrompt = message;
            const response = await this.parseAndRun(rawPrompt);

            // TODO: handle errors, unit test
            if (response.status === "success") {
                respondWithMessage(response.output);
                reactWithEmoji(SUCCESS_EMOJI);
            } else if (response.status === "exit") {
                respondWithMessage(response.output);
                reactWithEmoji(EXPECTED_EXIT_EMOJI);
            } else if (response.status === "failure_safe") {
                respondWithMessage(response.stderr);
                reactWithEmoji(SAFE_FAILURE_EMOJI);
            } else if (response.status === "failure_unsafe") {
                // TODO: respond with a generic error message and link to admin contact info
                reactWithEmoji(UNSAFE_FAILURE_EMOJI);
            }

            typingAction("stop_typing");
        } catch (e) {
            await reactWithEmoji(UNSAFE_FAILURE_EMOJI);
            await typingAction("stop_typing");
        }
    }

    run() {
        if (this.isGroupMessage) {
            return this.handleGroupMessage();
        } else {
            return this.handleDirectMessage();
        }
    }

    async parseAndRun(input: string): Promise<ScriptReturn> {
        const {serverAdminContactInfo} = this;

        // NOTE: openai-cli should probably handle this instead
        const rawArgs = stringArgv(input);
        const scriptContext: ScriptContext = {
            repoBaseDir: __dirname,
            rawArgs,
            isRemote: true,
            serverAdminContactInfo,
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
}
