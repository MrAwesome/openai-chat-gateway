import {MessageReceived, SignalInterface} from "./SignalDBUS";
import {CLIRunner} from "@mrawesome/openai-cli";
import stringArgv from "string-argv";
import {ScriptContext} from "@mrawesome/openai-cli/dist/types";

import dotenv from "dotenv";
import {handleCommands} from "./handleCommands";
dotenv.config();

const IN_PROGRESS_EMOJI = "🚬";


// TODO: add help here

export default class MessageHandler {
    private isGroupMessage: boolean;
    constructor(
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
        const {signal, messageReceived} = this;
        const {message, sender, timestamp, groupId} = messageReceived;

        // TODO: move to function, and implement for individual commandline
        // TODO: implement !help
        // TODO: implement !help <command>
        // TODO: unit test
        // TODO: show help/err on unknown commands

        const res = handleCommands(message);

        if (res.resultType === "not_command") {
            return;
        }

        if (res.resultType in ["help", "help_all", "help_unknown"]) {
            await signal.sendGroupMessage(res.output, [], groupId);
            return;
        }
        const commandResult = res.output;

        const reacted = await signal.sendGroupMessageReaction(
            IN_PROGRESS_EMOJI,
            false,
            sender,
            timestamp,
            groupId
        );
        const isTyping = await signal.sendGroupTyping(groupId, false);

        console.log({reacted, isTyping, commandResult});

        const response = await this.parseAndRun(commandResult);

        console.log({sender, response});
        if (response) {
            await signal.sendGroupMessage(response, [], groupId);
            await signal.sendGroupTyping(groupId, true);
        }
    }

    // TODO: add support for commands, and just use a default command
    async handleDirectMessage() {
        const {signal, messageReceived} = this;
        const {message, sender, timestamp} = messageReceived;
        //const prompt = message + PROMPT_ENDING;


        await signal.sendMessageReaction(
            IN_PROGRESS_EMOJI,
            false,
            sender,
            timestamp,
            sender
        );
        await signal.sendTyping(sender, false);

        const rawPrompt = message;
        console.log({rawPrompt});
        const response = await this.parseAndRun(rawPrompt);
        console.log({sender, response});
        if (response) {
            await signal.sendMessage(response, [], [sender]);
            await signal.sendTyping(sender, true);
        }
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
