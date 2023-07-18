import {ScriptContext} from "@mrawesome/openai-cli/dist/types";
import {mix} from "ts-mixer";
import {emoji} from "../constants";
import {ChatEvent, ChatEventActions, ChatEventActionsTaken, ChatEventRunnable, HasEvent} from "../events";
import {handleCommands} from "../handleCommands";
import parseAndRunViaCLI from "../parseAndRunViaCLI";
import {Constructor, ProcessorError} from "../types";
import {SignalInterface} from "./SignalDBUS";
import {Signal} from "./types";

export abstract class SignalChatEvent<E extends Signal.ChatEventType> extends ChatEvent<E> {
    constructor(
        protected signal: SignalInterface,
        public event: E,
    ) {
        super(event);
    }

    serviceName(): string {
        return "signal";
    }

    static fromEvent<E extends Signal.ChatEventType>(
        signal: SignalInterface,
        event: E,
    ): ChatEventRunnable<number> {
        if (event.situation === "direct") {
            if (event.type === "message") {
                return new SignalDirectMessageEvent(signal, event);
            }
            if (event.type === "reaction") {
                return new SignalDirectReactionEvent(signal, event);
            }
        } else if (event.situation === "group") {
            if (event.type === "message") {
                return new SignalGroupMessageEvent(signal, event);
            }
            if (event.type === "reaction") {
                return new SignalGroupReactionEvent(signal, event);
            }
        }
        console.error("Unknown event", event);
        throw new ProcessorError(`Unknown event: ${event}`);
    }

}

class SignalDirectEvent<E extends Signal.DirectChatEventType> extends SignalChatEvent<E> implements ChatEventActions {
    sendMessage = this.safeAsync(
        "sendMessage",
        async (message: string) => {
            return await this.signal.sendMessage(message, [], [this.event.sender]);
        }
    );

    reactWithEmoji = this.safeAsync(
        "reactWithEmoji",
        async (emoji: string) => {
            this.signal.sendMessageReaction(
                emoji,
                false,
                this.event.sender,
                this.event.timestamp,
                [this.event.sender]
            );
        }
    );

    typingAction = this.safeAsync(
        "typingAction",
        async (action: "start_typing" | "stop_typing") => {
            const stopTyping = action !== "start_typing";
            this.signal.sendTyping(this.event.sender, stopTyping);
        }
    );

}

class SignalGroupEvent<E extends Signal.GroupChatEventType> extends SignalChatEvent<E> implements ChatEventActions {
    sendMessage = this.safeAsync(
        "sendMessage",
        async (message: string) => {
            return await this.signal.sendGroupMessage(message, [], this.event.groupID);
        }
    );
    reactWithEmoji = this.safeAsync(
        "reactWithEmoji",
        async (emoji: string) => {
            await this.signal.sendGroupMessageReaction(
                emoji,
                false,
                this.event.sender,
                this.event.timestamp,
                this.event.groupID
            );
        }
    );
    typingAction = this.safeAsync(
        "typingAction",
        async (action: "start_typing" | "stop_typing") => {
            const stopTyping = action !== "start_typing";
            return await this.signal.sendGroupTyping(this.event.groupID, stopTyping);
        }
    );
}

function SignalMessageEvent<T extends Constructor<ChatEventActions & HasEvent<Signal.ChatEventMessageType>>>(Base: T) {
    return class extends Base implements ChatEventRunnable<number> {
        run = async () => {
            const chatEventActionsTaken: ChatEventActionsTaken<number> = {
                sentMessages: [],
            }
            const message = this.event.message;

            const commandResult = handleCommands(message);
            console.log({commandResult});

            if (commandResult.resultType === "not_command") {
                return chatEventActionsTaken;
            }

            if (commandResult.resultType === "help"
                || commandResult.resultType === "help_all"
                || commandResult.resultType === "help_unknown"
            ) {
                this.sendMessage(commandResult.output);
                this.reactWithEmoji?.(emoji.COMMAND_HELP);
                return chatEventActionsTaken;
            }
            this.reactWithEmoji?.(emoji.IN_PROGRESS);
            this.typingAction?.("start_typing");

            try {
                const rawPrompt = commandResult.output;
                // XXX TODO:
                const response = await parseAndRunViaCLI(rawPrompt);

                // TODO: handle errors, unit test
                // NOTE: reacting with the emoji first is preferred, as reacting with the emoji
                //       after sending the message results in a less useful notification on mobile devices
                if (response.status === "success") {
                    this.reactWithEmoji?.(emoji.SUCCESS);
                    const succTimestamp = await this.sendMessage(response.output);
                    chatEventActionsTaken.sentMessages.push(succTimestamp);
                } else if (response.status === "exit") {
                    this.reactWithEmoji?.(emoji.EXPECTED_EXIT);
                    this.sendMessage(response.output);
                } else if (response.status === "failure_safe") {
                    this.reactWithEmoji?.(emoji.SAFE_FAILURE);
                    this.sendMessage(response.stderr);
                } else if (response.status === "failure_unsafe") {
                    // TODO: respond with a generic error message and link to admin contact info
                    this.reactWithEmoji?.(emoji.UNSAFE_FAILURE);
                }

                this.typingAction?.("stop_typing");
            } catch (e) {
                console.log(e);
                this.reactWithEmoji?.(emoji.UNSAFE_FAILURE);
                this.typingAction?.("stop_typing");
            }
            return chatEventActionsTaken;
        }
    }
}

function SignalReactionEvent<T extends Constructor<ChatEventActions & HasEvent<Signal.ChatEventReactionType>>>(Base: T) {
    return class extends Base implements ChatEventRunnable<number> {
        run = async () => {
            const chatEventActionsTaken: ChatEventActionsTaken<number> = {
                sentMessages: [],
            }

            return chatEventActionsTaken;
        }
    }
}

class SignalDirectReactionEvent extends SignalReactionEvent(SignalDirectEvent<Signal.DirectChatEventReactionType>) {}
class SignalDirectMessageEvent extends SignalMessageEvent(SignalDirectEvent<Signal.DirectChatEventMessageType>) {}
class SignalGroupReactionEvent extends SignalReactionEvent(SignalGroupEvent<Signal.GroupChatEventReactionType>) {}
class SignalGroupMessageEvent extends SignalMessageEvent(SignalGroupEvent<Signal.GroupChatEventMessageType>) {}
