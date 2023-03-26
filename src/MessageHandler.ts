import {OpenAIApi} from "openai";
import {MessageReceived, SignalInterface} from "./SignalDBUS";
import {CLIRunner} from "openai-cli";
import stringArgv from "string-argv";

const THINKING_EMOJI = "🚬";
const PROMPT_ENDING = "\n";

const GROUP_PREFIX = "!gpt";
const GROUP_PREFIX_LENGTH = GROUP_PREFIX.length;

export default class MessageHandler {
    private isGroupMessage: boolean;
    constructor(
        private openai: OpenAIApi,
        private signal: SignalInterface,
        private serverAdminContactInfo: string,
        private messageReceived: MessageReceived
    ) {
        this.isGroupMessage = messageReceived.groupId.byteLength > 0;

        this.handleGroupMessage = this.handleGroupMessage.bind(this);
        this.handleDirectMessage = this.handleDirectMessage.bind(this);
        this.parseAndRun = this.parseAndRun.bind(this);
        this.run = this.run.bind(this);
    }

    async handleGroupMessage() {
        const {openai, signal, messageReceived} = this;
        const {message, sender, timestamp, groupId} = messageReceived;
        if (
            message.slice(0, GROUP_PREFIX_LENGTH).toLowerCase() !== GROUP_PREFIX
        ) {
            return;
        }

        //const prompt = message.slice(GROUP_PREFIX_LENGTH).trim() + PROMPT_ENDING;
        //console.log({prompt});

        const reacted = await signal.sendGroupMessageReaction(
            THINKING_EMOJI,
            false,
            sender,
            timestamp,
            groupId
        );
        signal.sendGroupTyping(groupId, false);

        const rawPrompt = message.slice(GROUP_PREFIX_LENGTH).trim();
        console.log({rawPrompt});
        const response = await this.parseAndRun(rawPrompt);
        //const response = await this.generateResponse(prompt);

        console.log({sender, response});
        if (response) {
            await signal.sendGroupMessage(response, [], groupId);
            signal.sendGroupTyping(groupId, true);
        }
    }

    //handleDirectMessage
    async handleDirectMessage() {
        const {openai, signal, messageReceived} = this;
        const {message, sender, timestamp, groupId} = messageReceived;
        //const prompt = message + PROMPT_ENDING;


        const reacted = await signal.sendMessageReaction(
            THINKING_EMOJI,
            false,
            sender,
            timestamp,
            sender
        );
        signal.sendTyping(sender, false);

        const rawPrompt = message;
        console.log({rawPrompt});
        const response = await this.parseAndRun(rawPrompt);
        //const response = await this.generateResponse(prompt);
        console.log({sender, response});
        if (response) {
            await signal.sendMessage(response, [], [sender]);
            await signal.sendTyping(sender, true);
        }
    }

    async generateResponse(prompt: string): Promise<string | undefined> {
        // TODO: decide if this is necessary, and/or add a flag for
        //       conversation mode vs completion mode vs one-off mode
        const {openai} = this;
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 2000,
        });

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

    // TODO: error handling
    async parseAndRun(input: string): Promise<string | undefined> {
        const {serverAdminContactInfo} = this;
        // NOTE: openai-cli should probably handle this instead

        const rawArgs = stringArgv(input);
        const scriptContext = {
            rawArgs,
            isRemote: true,
            serverAdminContactInfo,
        };

        const runner = new CLIRunner(scriptContext);
        const res = await runner.run();
        if (res.status === "success") {
            console.log(res.output);
            return res.output;
        }
        if (res.status === "failure_safe") {
            console.error(res.stderr);
        }
        if (res.status === "failure_unsafe") {
            console.error(res.error);
            console.error(res.stderr);
        }
        if (res.status === "exit") {
            console.log(res.output);
        }

        return undefined;
        //process.exit(res.exitCode);

    }
}
