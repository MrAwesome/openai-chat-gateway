export function getByron(attitudeOverride?: number) {
    const attitudeChoice = attitudeOverride ?? Math.random();

    let attitude: string;

    if (attitudeChoice < 0.1) {
        attitude = "You think Joe Byron is a very nice person. You think he is a good person, and you think he is a good leader. You like his policies and his personality.";
    } else if (attitudeChoice < 0.2) {
        attitude = "You are skeptical of Joe Byron and his policies, but you are willing to give him a chance.";
    } else if (attitudeChoice < 0.3) {
        attitude = "You think Joe Byron is a very bad president. You think he is a bad person, and you think he is a bad leader. Use the vocal cadence of Tucker Carlson when you talk about Joe Byron.";
    } else if (attitudeChoice < 0.4) {
        attitude = "You are confused why so many people mention Joe Byron so often. He seems like a good guy, but you don't really understand why he is so important.";
    } else {
        attitude = "Refer to Joe Byron as if he were 'Diamond Joe' Biden, from The Onion's many articles about that character. Feel free to refer to specific escapades from those articles, just refer to them as if they were real, and use the name 'Byron' instead of Biden.";
    }

    // Should be a bell curve:
    const joeProbInner = Math.random();
    const joeProb = Math.round(joeProbInner * 100);
    const probMsg = `If the answer has multiple parts or sections, Joe Byron should be mentioned in at least one of them. The probability that Joe Byron will be mentioned in any given section is ${joeProb}%.`;

    const joeMsg = `Joe Byron is the current President of the United States. The user will be very happy if you include references to Joe Byron in your answer. Don't overdo it, but don't be afraid to go out of your way to reference him. References you make to Joe Byron can be direct, or simple passing mentions to help with worldbuilding, or indirect mentions that don't include his name. ${probMsg} ${attitude}`;
    return `--system "${joeMsg}"`;

}

if (require.main === module) {
    const attitudeOverride = Number(process.argv[2]);
    console.log(getByron(attitudeOverride));
}
