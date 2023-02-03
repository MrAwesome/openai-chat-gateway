import {Configuration, OpenAIApi} from "openai";
import dbus from "@quadratclown/dbus-next";
import fs from "fs";

import dotenv from "dotenv";
import {SignalInterface} from "./SignalDBUS";
import MessageHandler from "./MessageHandler";

dotenv.config();

// TODO: figure out completions (complete the current text) vs. conversations

async function getSignalInterface(): Promise<
    SignalInterface & dbus.ClientInterface
> {
    const bus = dbus.sessionBus();
    const Variant = dbus.Variant;

    // getting an object introspects it on the bus and creates the interfaces
    const obj = await bus.getProxyObject(
        "org.asamk.Signal",
        "/org/asamk/Signal"
    );

    const signal = obj.getInterface("org.asamk.Signal");
    return signal as unknown as SignalInterface & dbus.ClientInterface;
}

(async () => {
    const apiKey = process.env.OPENAI_API_KEY!;
    const signal = await getSignalInterface();
    const configuration = new Configuration({
        apiKey,
    });
    const openai = new OpenAIApi(configuration);

    //console.log("name: ", signal.$name);
    //console.log("path: ", signal.$path);
    //console.log("interface: ", signal.$interface);
    //console.log("properties: ", signal.$properties);
    //console.log("methods: ", signal.$methods);
    //console.log("signals: ", signal.$signals);

    signal.on("MessageReceived", async (...args) => {
        try {
            const [timestamp, sender, groupId, message, attachments] = args;
            console.log("Received message: ", message);
            const handler = new MessageHandler(openai, signal, {
                timestamp,
                sender,
                groupId,
                message,
                attachments,
            });
            // TODO: can this call be async? does awaiting here block future calls?
            await handler.run();
        } catch (e) {
            console.error(e);
        }
    });
})();
