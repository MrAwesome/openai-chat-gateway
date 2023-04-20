export function safeAsync<A extends KnownMessageActionTypes>(name: string, fn: A): SafeAsyncAction<A> {
    const x = async (...args: any[]) => (fn as any)(...args).catch((e: any) => {
        console.trace(`[!!!] Unhandled async exception in "${name}":`, e);
    });
    (x as SafeAsyncAction<A>).isSafeAction = true;
    return x as SafeAsyncAction<A>;
}

export type ReactWithEmoji = (emoji: string) => Promise<void>;
export type RespondWithMessage = (message: string) => Promise<void>;
export type TypingAction = (action: "start_typing" | "stop_typing") => Promise<void>;
export type KnownMessageActionTypes = ReactWithEmoji | RespondWithMessage | TypingAction;

// SafeAsyncAction simply extends any type in KnownMessageActionTypes with a boolean property:
export type SafeAsyncAction<A extends KnownMessageActionTypes> = A & { isSafeAction: true };

export interface SafeAsyncChatActions {
    readonly reactWithEmoji: SafeAsyncAction<ReactWithEmoji>,
    readonly respondWithMessage: SafeAsyncAction<RespondWithMessage>,
    readonly typingAction: SafeAsyncAction<TypingAction>,
}
