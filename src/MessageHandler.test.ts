import {CLIRunner} from "@mrawesome/openai-cli";
import MessageHandler from "./MessageHandler";
import type {MessageReceivedV2, SignalInterface} from "./signal/SignalDBUS";

const mockSignalInterface = {
    sendGroupMessage: jest.fn(),
    sendGroupMessageReaction: jest.fn(),
    sendGroupTyping: jest.fn(),
    sendMessage: jest.fn(),
    sendMessageReaction: jest.fn(),
    sendTyping: jest.fn(),
};

function mockRunner() {
    return jest.spyOn(CLIRunner.prototype, "run").mockImplementation(async () => {
        return {
            exitCode: 0,
            status: "success",
            output: "output",
            commandContext: {
                className: "yee",
            },
        };
    });
}

describe("MessageHandler", () => {
    beforeEach(() => {
        mockRunner();
        jest.clearAllMocks();
        // mock out CLIRunner.run
    });

    it("should call handleGroupMessage when a group message is received", () => {
        const messageReceived: MessageReceivedV2 = {
            groupId: Buffer.from("groupId"),
            message: "jfkldjsaflkjsadlkfj",
            sender: "sender",
            timestamp: 0,
            extras: {},
        };

        const messageHandler = new MessageHandler(
            mockSignalInterface as unknown as SignalInterface,
            "serverAdminContactInfo",
            messageReceived
        );

        const spy = jest.spyOn(messageHandler, "handleGroupMessage");

        messageHandler.run();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call handleDirectMessage when a direct message is received", () => {
        const messageReceived: MessageReceivedV2 = {
            groupId: Buffer.from(""),
            message: "jfkldjsaflkdaj",
            sender: "sender",
            timestamp: 0,
            extras: {},
        };

        const messageHandler = new MessageHandler(
            mockSignalInterface as unknown as SignalInterface,
            "serverAdminContactInfo",
            messageReceived
        );

        const spy = jest.spyOn(messageHandler, "handleDirectMessage");

        messageHandler.run();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
