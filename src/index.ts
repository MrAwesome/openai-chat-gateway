import dbus from 'dbus-next';
import fs from 'fs';

(async () => {
    const bus = dbus.sessionBus();
    const Variant = dbus.Variant;

    // getting an object introspects it on the bus and creates the interfaces
    const obj = await bus.getProxyObject('org.asamk.Signal', '/org/asamk/Signal');

    console.log(obj);

    const signal = obj.getInterface('org.asamk.Signal');

    console.log(x);

//    // get the interfaces from the object
        console.log("name: ", signal.$name);
        console.log("path: ", signal.$path);
        console.log("interface: ", signal.$interface);
        console.log("properties: ", signal.$properties);
        console.log("methods: ", signal.$methods);
        console.log("signals: ", signal.$signals);

//[
//  { name: 'createGroup', inSignature: 'sass', outSignature: 'ay' },
//  { name: 'version', inSignature: '', outSignature: 's' },
//  { name: 'isRegistered', inSignature: '', outSignature: 'b' },
//  { name: 'isRegistered', inSignature: 'as', outSignature: 'ab' },
//  { name: 'isRegistered', inSignature: 's', outSignature: 'b' },
//  { name: 'unregister', inSignature: '', outSignature: '' },
//  {
//    name: 'sendRemoteDeleteMessage',
//    inSignature: 'xas',
//    outSignature: 'x'
//  },
//  {
//    name: 'sendRemoteDeleteMessage',
//    inSignature: 'xs',
//    outSignature: 'x'
//  },
//  { name: 'getSelfNumber', inSignature: '', outSignature: 's' },
//  { name: 'updateProfile', inSignature: 'ssssb', outSignature: '' },
//  { name: 'updateProfile', inSignature: 'sssssb', outSignature: '' },
//  { name: 'deleteAccount', inSignature: '', outSignature: '' },
//  { name: 'quitGroup', inSignature: 'ay', outSignature: '' },
//  { name: 'updateGroup', inSignature: 'aysass', outSignature: 'ay' },
//  { name: 'joinGroup', inSignature: 's', outSignature: 'ay' },
//  { name: 'sendReadReceipt', inSignature: 'sax', outSignature: '' },
//  { name: 'sendViewedReceipt', inSignature: 'sax', outSignature: '' },
//  { name: 'sendMessage', inSignature: 'sasas', outSignature: 'x' },
//  { name: 'sendMessage', inSignature: 'sass', outSignature: 'x' },
//  {
//    name: 'sendMessageReaction',
//    inSignature: 'sbsxas',
//    outSignature: 'x'
//  },
//  {
//    name: 'sendMessageReaction',
//    inSignature: 'sbsxs',
//    outSignature: 'x'
//  },
//  {
//    name: 'sendEndSessionMessage',
//    inSignature: 'as',
//    outSignature: ''
//  },
//  { name: 'deleteRecipient', inSignature: 's', outSignature: '' },
//  { name: 'deleteContact', inSignature: 's', outSignature: '' },
//  { name: 'setContactName', inSignature: 'ss', outSignature: '' },
//  { name: 'setExpirationTimer', inSignature: 'si', outSignature: '' },
//  { name: 'uploadStickerPack', inSignature: 's', outSignature: 's' },
//  { name: 'isContactBlocked', inSignature: 's', outSignature: 'b' },
//  { name: 'sendContacts', inSignature: '', outSignature: '' },
//  { name: 'getGroup', inSignature: 'ay', outSignature: 'o' },
//  { name: 'addDevice', inSignature: 's', outSignature: '' },
//  { name: 'getGroupIds', inSignature: '', outSignature: 'aay' },
//  { name: 'listDevices', inSignature: '', outSignature: 'a(oxs)' },
//  { name: 'isMember', inSignature: 'ay', outSignature: 'b' },
//  { name: 'listGroups', inSignature: '', outSignature: 'a(oays)' },
//  { name: 'removePin', inSignature: '', outSignature: '' },
//  {
//    name: 'sendPaymentNotification',
//    inSignature: 'ayss',
//    outSignature: 'x'
//  },
//  { name: 'sendTyping', inSignature: 'sb', outSignature: '' },
//  {
//    name: 'submitRateLimitChallenge',
//    inSignature: 'ss',
//    outSignature: ''
//  },
//  { name: 'setPin', inSignature: 's', outSignature: '' },
//  { name: 'sendSyncRequest', inSignature: '', outSignature: '' },
//  { name: 'setContactBlocked', inSignature: 'sb', outSignature: '' },
//  { name: 'isGroupBlocked', inSignature: 'ay', outSignature: 'b' },
//  { name: 'setGroupBlocked', inSignature: 'ayb', outSignature: '' },
//  { name: 'sendGroupMessage', inSignature: 'sasay', outSignature: 'x' },
//  { name: 'subscribeReceive', inSignature: '', outSignature: '' },
//  { name: 'unsubscribeReceive', inSignature: '', outSignature: '' },
//  { name: 'getDevice', inSignature: 'x', outSignature: 'o' },
//  { name: 'getThisDevice', inSignature: '', outSignature: 'o' },
//  {
//    name: 'sendNoteToSelfMessage',
//    inSignature: 'sas',
//    outSignature: 'x'
//  },
//  { name: 'sendGroupTyping', inSignature: 'ayb', outSignature: '' },
//  {
//    name: 'sendGroupRemoteDeleteMessage',
//    inSignature: 'xay',
//    outSignature: 'x'
//  },
//  {
//    name: 'sendGroupMessageReaction',
//    inSignature: 'sbsxay',
//    outSignature: 'x'
//  },
//  { name: 'getContactName', inSignature: 's', outSignature: 's' },
//  { name: 'getGroupName', inSignature: 'ay', outSignature: 's' },
//  { name: 'getGroupMembers', inSignature: 'ay', outSignature: 'as' },
//  { name: 'listNumbers', inSignature: '', outSignature: 'as' },
//  { name: 'getContactNumber', inSignature: 's', outSignature: 'as' }
//]
//[
//  { name: 'SyncMessageReceivedV2', signature: 'xssaysa{sv}' },
//  { name: 'SyncMessageReceived', signature: 'xssaysas' },
//  { name: 'ReceiptReceivedV2', signature: 'xssa{sv}' },
//  { name: 'ReceiptReceived', signature: 'xs' },
//  { name: 'MessageReceived', signature: 'xsaysas' },
//  { name: 'MessageReceivedV2', signature: 'xsaysa{sv}' }
//]



//    // the interfaces are the primary way of interacting with objects on the bus
//    let player = obj.getInterface('org.mpris.MediaPlayer2.Player');
//    let properties = obj.getInterface('org.freedesktop.DBus.Properties');


//    const jsondump = JSON.stringify(player['$methods'], null, 2);
//    fs.writeFileSync('dump.json', jsondump);
//
//    // call methods on the interface
//    await player.Play()
//
//    // get properties with the properties interface (this returns a variant)
//    let volumeVariant = await properties.Get('org.mpris.MediaPlayer2.Player', 'Volume');
//    console.log('current volume: ' + volumeVariant.value);
//
//    // set properties with the properties interface using a variant
//    await properties.Set('org.mpris.MediaPlayer2.Player', 'Volume', new Variant('d', volumeVariant.value + 0.05));

//    // listen to signals
//    properties.on('PropertiesChanged', (iface, changed, invalidated) => {
//        for (let prop of Object.keys(changed)) {
//            console.log(`property changed: ${prop}`);
//        }
//    });
})();
