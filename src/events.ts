import {ScriptContext} from "@mrawesome/openai-cli/dist/types";
import {KnownMessageActionTypes, safeAsync, SafeAsyncAction} from "./handlers/types";

type ChatEventType = {
    situation: "direct" | "group",
    type: string,
};

export interface ChatEventActions {
    // You must implement these, for any event type:
    sendMessage: SafeAsyncAction<(message: string) => Promise<number>>;

    // These are optional, depending on the service and event type:
    directResponse?: SafeAsyncAction<(message: string) => Promise<number>>;
    reactWithEmoji?: SafeAsyncAction<(emoji: string) => Promise<void>>;
    typingAction?: SafeAsyncAction<(action: "start_typing" | "stop_typing") => Promise<void>>;
}

export interface ChatEventActionsTaken<MSGID> {
    sentMessages: MSGID[];
}

export interface ChatEventRunnable<MSGID> {
    run(): Promise<ChatEventActionsTaken<MSGID>>;
}

export interface HasEvent<E extends ChatEventType> {
    event: E;
    getEvent(): E;
}

export abstract class ChatEvent<E extends ChatEventType> implements HasEvent<E> {
    constructor(
        public event: E,
    ) {}

    getEvent(): E {
        return this.event;
    }

    abstract serviceName(): string;

    eventID(): string {
        return `${this.serviceName}.${this.event.situation}.${this.event.type}`;
    }
    safeAsync<A extends KnownMessageActionTypes>(actionName: string, fn: A): SafeAsyncAction<A> {
        return safeAsync(this.eventID()+"."+actionName, fn);
    }

}
