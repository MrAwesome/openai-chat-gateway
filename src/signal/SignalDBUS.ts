import dbus from "@quadratclown/dbus-next";
import type {Variant} from "@quadratclown/dbus-next";

export type SignalInterface = SignalControl &
    GeneralMethods &
    GroupMethods &
    DeviceMethods;

interface SignalControl {
    link(newDeviceName?: string): Promise<string>;
    listAccounts(): Promise<string[]>;
    register(number: string, voiceVerification: boolean): Promise<void>;
    registerWithCaptcha(
        number: string,
        voiceVerification: boolean,
        captcha: string
    ): Promise<void>;
    verify(number: string, verificationCode: string): Promise<void>;
    verifyWithPin(
        number: string,
        verificationCode: string,
        pin: string
    ): Promise<void>;
    version(): Promise<string>;
}

interface GeneralMethods {
    getContactName(number: string): Promise<string>;
    getContactNumber(name: string): Promise<string[]>;
    getSelfNumber(): Promise<string>;
    isContactBlocked(number: string): Promise<boolean>;
    isRegistered(number?: string | string[]): Promise<boolean | boolean[]>;
    listNumbers(): Promise<string[]>;
    removePin(): Promise<void>;
    sendEndSessionMessage(recipients: string[]): Promise<void>;
    sendMessage(
        message: string,
        attachments: string[],
        recipient: string[]
    ): Promise<number>;
    sendMessageReaction(
        emoji: string,
        remove: boolean,
        targetAuthor: string,
        targetSentTimestamp: number,
        recipient: string
    ): Promise<number>;
    sendPaymentNotification(
        receipt: Uint8Array,
        note: string,
        recipient: string
    ): Promise<number>;
    sendNoteToSelfMessage(
        message: string,
        attachments: string[]
    ): Promise<number>;
    sendReadReceipt(
        recipient: string,
        targetSentTimestamps: number[]
    ): Promise<void>;

    sendViewedReceipt(
        recipient: string,
        targetSentTimestamp: number[]
    ): Promise<void>;
    sendRemoteDeleteMessage(
        targetSentTimestamp: number,
        recipient: string
    ): Promise<number>;
    sendRemoteDeleteMessage(
        targetSentTimestamp: number,
        recipients: string[]
    ): Promise<number>;
    sendTyping(recipient: string, stop: boolean): Promise<void>;
    setContactBlocked(number: string, block: boolean): Promise<void>;
    setContactName(number: string, name: string): Promise<void>;
    deleteContact(number: string): Promise<void>;
    deleteRecipient(number: string): Promise<void>;
    setExpirationTimer(number: string, expiration: number): Promise<void>;
    setPin(pin: string): Promise<void>;
    submitRateLimitChallenge(challenge: string, captcha: string): Promise<void>;
    updateProfile(
        name: string,
        about: string,
        aboutEmoji: string,
        avatar: string,
        remove: boolean
    ): Promise<void>;
    updateProfile(
        givenName: string,
        familyName: string,
        about: string,
        aboutEmoji: string,
        avatar: string,
        remove: boolean
    ): Promise<void>;
    uploadStickerPack(stickerPackPath: string): Promise<string>;
    version(): Promise<string>;
}

interface GroupMethods {
    createGroup(
        groupName: string,
        members: string[],
        avatar: string
    ): Promise<ArrayBuffer>;
    getGroup(groupId: ArrayBuffer): Promise<string>;
    getGroupMembers(groupId: ArrayBuffer): Promise<string[]>;
    joinGroup(inviteURI: string): Promise<void>;
    listGroups(): Promise<
        Array<{objectPath: string; groupId: ArrayBuffer; groupName: string}>
    >;
    sendGroupMessage(
        message: string,
        attachments: string[],
        groupId: ArrayBuffer
    ): Promise<number>;
    sendGroupTyping(groupId: ArrayBuffer, stop: boolean): Promise<void>;
    sendGroupMessageReaction(
        emoji: string,
        remove: boolean,
        targetAuthor: string,
        targetSentTimestamp: number,
        groupId: ArrayBuffer
    ): Promise<number>;
    sendGroupRemoteDeleteMessage(
        targetSentTimestamp: number,
        groupId: ArrayBuffer
    ): Promise<number>;
}

interface DeviceMethods {
    addDevice(deviceUri: string): Promise<void>;
    getDevice(deviceId: number): Promise<string>;
    listDevices(): Promise<
        Array<{objectPath: string; id: number; name: string}>
    >;
    sendContacts(): Promise<void>;
    sendSyncRequest(): Promise<void>;
}

interface SignalGroup {
    Id: Uint8Array;
    Name: string;
    Description: string;
    Avatar: string;
    IsBlocked: boolean;
    IsMember: boolean;
    IsAdmin: boolean;
    MessageExpirationTimer: number;
    Members: string[];
    PendingMembers: string[];
    RequestingMembers: string[];
    Admins: string[];
    PermissionAddMember: "ONLY_ADMINS" | "EVERY_MEMBER";
    PermissionEditDetails: "ONLY_ADMINS" | "EVERY_MEMBER";
    PermissionSendMessage: "ONLY_ADMINS" | "EVERY_MEMBER";
    GroupInviteLink: string;
    addAdmins(recipients: string[]): Promise<void>;
    addMembers(recipients: string[]): Promise<void>;
    disableLink(): Promise<void>;
    enableLink(requiresApproval: boolean): Promise<void>;
    quitGroup(): Promise<void>;
    removeAdmins(recipients: string[]): Promise<void>;
    removeMembers(recipients: string[]): Promise<void>;
    resetLink(): Promise<void>;
}

interface SignalDevice {
    Id: number;
    Created: number;
    LastSeen: number;
    Name: string;
    removeDevice(): Promise<void>;
}

interface SignalConfiguration {
    ReadReceipts: boolean;
    UnidentifiedDeliveryIndicators: boolean;
    TypingIndicators: boolean;
    LinkPreviews: boolean;
}

interface SyncMessageReceived {
    timestamp: number;
    sender: string;
    destination: string;
    groupId: number[];
    message: string;
    attachments: string[];
}

interface ReceiptReceived {
    timestamp: number;
    sender: string;
}

export interface MessageReceived {
    timestamp: number;
    sender: string;
    groupId: ArrayBuffer;
    message: string;
    attachments: string[]; // list of filename paths
}

export interface MessageReceivedV2 {
    timestamp: number;
    sender: string;
    groupId: ArrayBuffer;
    message: string;
    extras: MessageV2Extras;
}

// NOTE: more fields may be added in the future, this is definitely the most likely place to see changes in types

interface MessageV2Extras {
  attachments?: Variant<Array<AttachmentFileInfo>>;
  mentions?: SignalDBUSMentionList,
  quote?: SignalDBUSQuote,
  reaction?: SignalDBUSReaction,
  remoteDelete?: Variant<Record<string, Variant<any>>>;
  sticker?: Variant<Record<string, Variant<any>>>;

  // These two seem to always be provided, but we won't rely on that.
  expiresInSeconds?: Variant<number>;
  isViewOnce?: Variant<boolean>;
}

export type SignalDBUSReaction = Variant<{
    targetAuthor: Variant<string>,
    targetSentTimestamp: Variant<number>,
    emoji: Variant<string>,
    isRemove: Variant<boolean>,
}>

export type SignalDBUSMentionList = Variant<Array<{
    recipient: Variant<string>,
    length: Variant<number>,
    start: Variant<number>,
}>>;

export type SignalDBUSQuote = Variant<{
    text: Variant<string>,
    author: Variant<string>,
    id: Variant<number>,
}>;

interface AttachmentFileInfo {
  fileName: Variant<string>;
  file: Variant<string>;
  isBorderless: Variant<boolean>;
  size: Variant<string>;
  isVoiceNote: Variant<boolean>;
  isGif: Variant<boolean>;
  contentType: Variant<string>;
  remoteId: Variant<string>;
}


export async function getSignalInterface(): Promise<
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
