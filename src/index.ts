import {Configuration, OpenAIApi} from "openai";
import dbus from '@quadratclown/dbus-next';
import fs from 'fs';

import dotenv from 'dotenv';
import {SignalInterface} from './SignalDBUS';

dotenv.config();

async function getSignalInterface(): Promise<SignalInterface & dbus.ClientInterface> {
    const bus = dbus.sessionBus();
    const Variant = dbus.Variant;

    // getting an object introspects it on the bus and creates the interfaces
    const obj = await bus.getProxyObject('org.asamk.Signal', '/org/asamk/Signal');

    const signal = obj.getInterface('org.asamk.Signal');
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

    signal.on('MessageReceived', async (...args) => {
        try {
            const [timestamp, sender, groupId, msg, attachments] = args;

            if (msg.slice(0, 4).toLowerCase() !== "!gpt") {
                return;
            }

            const prompt = msg.slice(4).trim();

            console.log({prompt});

            const emoji = "🚬";

            if (groupId.byteLength > 0) {
                const reacted = await signal.sendGroupMessageReaction(
                    emoji,
                    false,
                    sender,
                    timestamp,
                    groupId,
                );
                console.log(reacted);
            } else {
                const reacted = await signal.sendMessageReaction(
                    emoji,
                    false,
                    sender,
                    timestamp,
                    sender,
                );
                console.log(reacted);
            }

            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                max_tokens: 2000,
            });
            console.log(completion.data.choices[0].text?.trim());

            const response = completion.data.choices[0].text?.trim();
            console.log({sender, response});
            if (response) {
                if (groupId.byteLength > 0) {
                    await signal.sendGroupMessage(
                        response,
                        [],
                        groupId,
                    );
                } else {
                    await signal.sendMessage(
                        response,
                        [],
                        [sender],
                    );
                }
            }
        } catch (e) {
            console.error(e);
        }
    });

    //    signal.on('MessageReceivedV2', async (...x) => {
    //        console.log("MessageReceivedV2: ", x);
    //    });

})();
