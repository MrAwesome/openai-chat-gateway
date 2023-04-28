import {ProcessorError} from "../types";
import type {MessageReceivedV2, SignalDBUSMentionList, SignalDBUSReaction, SignalDBUSQuote} from "./SignalDBUS";

export namespace Signal {
    class Reaction {
        constructor(
            public targetAuthor: string,
            public targetSentTimestamp: number,
            public emoji: string,
            public isRemove: boolean,
        ) {}

        static fromDBUSVariant(dbusReactionVariant: SignalDBUSReaction): Reaction {
            const d = dbusReactionVariant;
            return new Reaction(
                d.value.targetAuthor.value,
                d.value.targetSentTimestamp.value,
                d.value.emoji.value,
                d.value.isRemove.value,
            );
        }
    }

    interface Mention {
        recipient: string;
        length: number;
        start: number;
    }

    class Mentions extends Array<Mention> {
        static fromDBUSVariant(dbusMentionsList: SignalDBUSMentionList) {
            return dbusMentionsList.value.map((v) => ({
                recipient: v.recipient.value,
                length: v.length.value,
                start: v.start.value,
            }));
        }
    }

    class Quote {
        constructor(
            public id: number,
            public author: string,
            public text: string,
        ) {}

        static fromDBUSVariant(dbusQuoteVariant: SignalDBUSQuote): Quote {
            const d = dbusQuoteVariant;
            return new Quote(
                d.value.id.value,
                d.value.author.value,
                d.value.text.value,
            );
        }
    }

    type ChatEventMetadataBase = {
        timestamp: number;
        sender: string;
    };
    export type GroupChatEventMetadata = ChatEventMetadataBase & {
        groupID: ArrayBuffer;
        situation: "group",
    };
    export type DirectChatEventMetadata = ChatEventMetadataBase & {
        situation: "direct",
    };
    export type ChatEventMetadata = DirectChatEventMetadata | GroupChatEventMetadata;

    export type ChatEventReactionType = ChatEventMetadata & {
        type: "reaction",
        reaction: Reaction,
    };

    export type ChatEventMessageType = ChatEventMetadata & {
        type: "message",
        message: string,
        quote?: Quote,
        mentions?: Mentions,
    }

    export type ChatEventType = ChatEventReactionType | ChatEventMessageType;

    export type DirectChatEventType = DirectChatEventMetadata & ChatEventType;
    export type GroupChatEventType = GroupChatEventMetadata & ChatEventType;

    export type DirectChatEventReactionType = Signal.DirectChatEventMetadata & Signal.ChatEventReactionType;
    export type DirectChatEventMessageType = Signal.DirectChatEventMetadata & Signal.ChatEventMessageType;
    export type GroupChatEventReactionType = Signal.GroupChatEventMetadata & Signal.ChatEventReactionType;
    export type GroupChatEventMessageType = Signal.GroupChatEventMetadata & Signal.ChatEventMessageType;

    export class ChatEventProcessor {
        constructor(private m: MessageReceivedV2) {}

        private processMetadata(): ChatEventMetadata {
            const {m} = this;
            const partialMetadata = {
                timestamp: m.timestamp,
                sender: m.sender,
            };
            return m.groupId.byteLength > 0
                ? {situation: "group", groupID: m.groupId, ...partialMetadata}
                : {situation: "direct", ...partialMetadata};
        }

        process(): ChatEventType | ProcessorError {
            const {m} = this;
            const metadata = this.processMetadata();

            if (m.extras.reaction !== undefined) {
                const reaction = Reaction.fromDBUSVariant(m.extras.reaction);
                return {
                    type: "reaction",
                    reaction,
                    ...metadata,
                }
            } else if (m.message) {
                const mentions = m.extras.mentions
                    ? Mentions.fromDBUSVariant(m.extras.mentions)
                    : undefined;
                const quote = m.extras.quote
                    ? Quote.fromDBUSVariant(m.extras.quote)
                    : undefined;
                return {
                    type: "message",
                    message: m.message,
                    mentions,
                    quote,
                    ...metadata,
                }
            } else {
                return new ProcessorError("Unknown  chat message type!");
            }
        }
    }
}
