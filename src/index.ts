import dotenv from "dotenv";
import signalListener from "./signal/listener";

dotenv.config();

// TODO: allow commands to override DEFAULT_OPENAI_COMPLETION_MODEL (they should already?)
// TODO: figure out completions (complete the current text) vs. conversations
// TODO: allow for txt attachment files to be completed/edited

(async () => {
    process.on("unhandledRejection", (reason, promise) => {
        console.trace("Unhandled Rejection:", promise, "Reason:", reason);
    });

    signalListener();
})();
