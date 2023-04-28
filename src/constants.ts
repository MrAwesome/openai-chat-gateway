import dotenv from "dotenv";
dotenv.config();

export const SERVER_ADMIN_CONTACT_INFO = (() => {
    const SERVER_ADMIN_CONTACT_INFO = process.env.SERVER_ADMIN_CONTACT_INFO;
    if (SERVER_ADMIN_CONTACT_INFO === undefined) {
        console.log(
            "You must set the environment variable SERVER_ADMIN_CONTACT_INFO!"
        );
        process.exit(1);
    }

    return SERVER_ADMIN_CONTACT_INFO;
})();

export const emoji = {
    IN_PROGRESS: "🚬",
    SUCCESS: "✅",
    SAFE_FAILURE: "❌",
    UNSAFE_FAILURE: "⁉️",
    EXPECTED_EXIT: "🎓",
    COMMAND_HELP: "📖",
} as const;
