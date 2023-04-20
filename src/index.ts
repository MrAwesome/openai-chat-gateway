import dbus from "@quadratclown/dbus-next";

import dotenv from "dotenv";
import {MessageReceivedV2, SignalInterface} from "./SignalDBUS";
import MessageHandler from "./MessageHandler";

dotenv.config();

const SERVER_ADMIN_CONTACT_INFO = process.env.SERVER_ADMIN_CONTACT_INFO;
if (SERVER_ADMIN_CONTACT_INFO === undefined) {
    console.log("You must set the environment variable SERVER_ADMIN_CONTACT_INFO!");
    process.exit(1);
}

// TODO: allow commands to override DEFAULT_OPENAI_COMPLETION_MODEL (they should already?)
// TODO: figure out completions (complete the current text) vs. conversations
// TODO: allow for txt attachment files to be completed/edited

async function getSignalInterface(): Promise<
    SignalInterface & dbus.ClientInterface
> {
    const bus = dbus.sessionBus();

    // getting an object introspects it on the bus and creates the interfaces
    const obj = await bus.getProxyObject(
        "org.asamk.Signal",
        "/org/asamk/Signal"
    );

    const signal = obj.getInterface("org.asamk.Signal");
    return signal as unknown as SignalInterface & dbus.ClientInterface;
}

(async () => {
    process.on("unhandledRejection", (reason, promise) => {
        console.trace("Unhandled Rejection:", promise, "Reason:", reason);
    });

    const signal = await getSignalInterface();

    //console.log("name: ", signal.$name);
    //console.log("path: ", signal.$path);
    //console.log("interface: ", signal.$interface);
    //console.log("properties: ", signal.$properties);
    //console.log("methods: ", signal.$methods);
    //console.log("signals: ", signal.$signals);
    //console.log("listeners: ", signal.$listeners);

    // TODO: validate the incoming message with Zod, and if it doesn't match the schema, throw an error
    signal.on("MessageReceivedV2", async (...args) => {
        try {
            const [timestamp, sender, groupId, message, extras] = args;

            const messageReceivedV2: MessageReceivedV2 = {
                timestamp,
                sender,
                groupId,
                message,
                extras,
            };

            console.log("MessageReceivedV2: ", messageReceivedV2);
            //const attachments = messageReceivedV2.extras.attachments;
            //JSON.stringify(attachments, (_key, value) => typeof value === 'bigint' ? value.toString() : value, 2);

            const handler = new MessageHandler(signal, SERVER_ADMIN_CONTACT_INFO, messageReceivedV2);
            // TODO: can this call be async? does awaiting here block future calls?
            console.log(`Handling message: "${messageReceivedV2.message}"`);
            handler.run()
                .then(() => console.log(`Finished handling message: "${messageReceivedV2.message}"`))
                .catch((e) => console.error(e));
        } catch (e) {
            console.error(e);
        }
    });
})();
