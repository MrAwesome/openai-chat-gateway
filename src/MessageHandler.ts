import { OpenAIApi } from "openai";
import { MessageReceived, SignalInterface } from "./SignalDBUS";

const THINKING_EMOJI = "🚬";
const PROMPT_ENDING = "\n";

export default class MessageHandler {
    private isGroupMessage: boolean;
    constructor(
        private openai: OpenAIApi,
        private signal: SignalInterface,
        private messageReceived: MessageReceived
    ) {
        this.isGroupMessage = messageReceived.groupId.byteLength > 0;
    }

    async handleGroupMessage() {
        const { openai, signal, messageReceived } = this;
        const { message, sender, timestamp, groupId } = messageReceived;
        if (message.slice(0, 4).toLowerCase() !== "!gpt") {
            return;
        }

        const prompt = message.slice(4).trim();

        console.log({ prompt });

        const reacted = await signal.sendGroupMessageReaction(
            THINKING_EMOJI,
            false,
            sender,
            timestamp,
            groupId
        );
        console.log(reacted);
        const sendIsTyping = await signal.sendGroupTyping(groupId, false);

        const response = await this.generateResponse(prompt);

        console.log({ sender, response });
        if (response) {
            await signal.sendGroupMessage(response, [], groupId);
            const sendDoneTyping = await signal.sendGroupTyping(groupId, true);
        }
    }

    //handleDirectMessage
    async handleDirectMessage() {
        const { openai, signal, messageReceived } = this;
        const { message, sender, timestamp, groupId } = messageReceived;
        const prompt = message;

        //console.log({ prompt });

        const reacted = await signal.sendMessageReaction(
            THINKING_EMOJI,
            false,
            sender,
            timestamp,
            sender
        );
        const sendIsTyping = await signal.sendTyping(sender, false);

        const response = await this.generateResponse(prompt);
        //console.log({ sender, response });
        if (response) {
            await signal.sendMessage(response, [], [sender]);
            const sendDoneTyping = await signal.sendTyping(sender, true);
        }
    }

    async generateResponse(prompt: string): Promise<string | undefined> {
        // TODO: decide if this is necessary, and/or add a flag for 
        //       conversation mode vs completion mode vs one-off mode
        prompt = prompt + PROMPT_ENDING;
        const { openai } = this;
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 2000,
        });
        console.log(completion.data.choices[0].text?.trim());

        const response = completion.data.choices[0].text?.trim();
        return response;
    }

    run() {
        if (this.isGroupMessage) {
            return this.handleGroupMessage();
        } else {
            return this.handleDirectMessage();
        }
    }
}
