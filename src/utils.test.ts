import {joinWithSpacesIfNoneAlreadyPresent} from "./utils";

describe("joinWithSpacesIfNoneAlreadyPresent", () => {
    test.each`
    input         | expected
    ${[]}         | ${""}
    ${["a"]}      | ${"a"}
    ${["a", "b"]} | ${"a b"}
    ${["a", "b", "c "]} | ${"a b c "}
    ${["a", "b ", "c "]} | ${"a b c "}
    ${["a", "b", " c "]} | ${"a b c "}
    ${[" a", "b ", "c "]} | ${" a b c "}
    `('spaceJoin($input) -> "$expected"', ({ input, expected }) => {
    const result = joinWithSpacesIfNoneAlreadyPresent(input);
    expect(result).toBe(expected);
    });
});

