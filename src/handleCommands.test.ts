import {handleCommands} from "./handleCommands";

describe("handleCommands", () => {
  it("should return not_command for non-command messages", () => {
    const message = "hello, how are you?";
    const result = handleCommands(message);
    expect(result.resultType).toBe("not_command");
  });

  it("should return command_success for known commands", () => {
    const message = "!gpt What is the capital of France?";
    const result = handleCommands(message);
    expect(result.resultType).toBe("command_success");
    expect(result.output).toContain("complete");
  });

  it("should return help for help command", () => {
    const message = "!help gpt";
    const result = handleCommands(message);
    expect(result.resultType).toBe("help");
    expect(result.output).toBeDefined();
  });

  it("should return help_unknown for unknown help command", () => {
    const message = "!help unknown_command";
    const result = handleCommands(message);
    expect(result.resultType).toBe("help_unknown");
    expect(result.output).toContain("Unknown command");
  });

  it("should return help_all for help command without arguments", () => {
    const message = "!help";
    const result = handleCommands(message);
    expect(result.resultType).toBe("help_all");
    expect(result.output).toBeDefined();
  });
});
