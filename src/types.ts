export type RespondWithMessage =  (message: string) => Promise<void>;
export type ReactWithEmoji = (emoji: string) => Promise<void>;
export type TypingAction = (action: "start_typing" | "stop_typing") => Promise<void>;

