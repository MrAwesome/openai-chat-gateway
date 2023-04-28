import {getSignalInterface, MessageReceivedV2} from "./SignalDBUS";
import SignalMessageHandler from "../MessageHandler";
import {Signal} from "./types";
import {Variant} from "@quadratclown/dbus-next";
import {SignalChatEvent} from "./events";
import {ProcessorError} from "../types";

export default async function signalListener() {
    const signal = await getSignalInterface();
//    // @ts-ignore
//    signal.sendMessageWithExtras("msg", {
//        "quote": new Variant("a{sv}", {
//            "author": new Variant("s", "+27765291215"),
//            "text": new Variant("s", "Hello, world!"),
//            "id": new Variant("x", 1682346480665),
//        }),
//    }, ["+18643788841"]).catch(console.error);

    //console.log("name: ", signal.$name);
    //console.log("path: ", signal.$path);
    //console.log("interface: ", signal.$interface);
    //console.log("properties: ", signal.$properties);
    //console.log("methods: ", signal.$methods);
    //console.log("signals: ", signal.$signals);
    //console.log("listeners: ", signal.$listeners);

    signal.on("MessageReceivedV2", async (...args: any) => {
        try {
            // TODO: use zod or similar here
            const messageObj: MessageReceivedV2 = {
                timestamp: args[0],
                sender: args[1],
                groupId: args[2],
                message: args[3],
                extras: args[4],
            };

            //console.log("MessageReceivedV2: ", messageReceivedV2);
            //const attachments = messageReceivedV2.extras.attachments;
            console.log("message.timestamp", messageObj.timestamp);
            console.log("message.extras.reaction.value.emoji.value", messageObj.extras.reaction?.value.emoji.value);
            console.log("message.extras.quote.value.id.value", messageObj.extras.quote?.value.id.value);

            const messageStr = JSON.stringify(
                messageObj,
                (_key, value) =>
                    typeof value === "bigint" ? value.toString() : value,
                2
            );
            console.log("MessageReceivedV2: ", messageStr);

            
            const processor = new Signal.ChatEventProcessor(messageObj);
            const event = processor.process();

            if (event instanceof ProcessorError) {
                console.error(event);
                return;
            }

            const handler = SignalChatEvent.fromEvent(signal, event);

            //const handler = new SignalMessageHandler(
                //signal,
                //serverAdminContactInfo,
                //message
            //);
            // TODO: can this call be async? does awaiting here block future calls?
            console.log("Handling event:", event);
            handler
                .run()
                .then((actionsTaken) =>

                    console.log("Finished handling event:", event)
                )
                .catch((e) => console.error(e));
        } catch (e) {
            console.error(e);
        }
    });
}
