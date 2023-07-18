//import type {MessageReceivedV2, SignalInterface} from "../signal/SignalDBUS";

export function safeAsync<A extends KnownMessageActionTypes>(name: string, fn: A): SafeAsyncAction<A> {
    const x = async (...args: any[]) => (fn as any)(...args).catch((e: any) => {
        console.trace(`[!!!] Unhandled async exception in "${name}":`, e);
    });
    (x as SafeAsyncAction<A>).isSafeAction = true;
    return x as SafeAsyncAction<A>;
}

// TODO: type these correctly
export type ReactWithEmoji = (emoji: string) => Promise<any>;
export type SendMessage = (message: string) => Promise<any>;
export type TypingAction = (action: "start_typing" | "stop_typing") => Promise<any>;
export type KnownMessageActionTypes = ReactWithEmoji | SendMessage | TypingAction;

// SafeAsyncAction simply extends any type in KnownMessageActionTypes with a boolean property:
export type SafeAsyncAction<A extends KnownMessageActionTypes> = A & { isSafeAction: true };

export interface SafeAsyncChatActions {
    readonly reactWithEmoji: SafeAsyncAction<ReactWithEmoji>,
    readonly respondWithMessage: SafeAsyncAction<SendMessage>,
    readonly typingAction: SafeAsyncAction<TypingAction>,
}

//interface SignalServiceInfo {
//    signal: SignalInterface,
//}
//
//interface EventType<T, O> {
//    new (input: T): EventType<T, O>;
//    service: string;
//    type: string;
//    payload: O;
//}
//
//abstract class Event<Service, EventType> {
//    static from<E>(signal: SignalInterface, msg: MessageReceivedV2): Event<SignalServiceInfo, E> {
//    }
//}
