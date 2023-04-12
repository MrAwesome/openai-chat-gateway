export function joinWithSpacesIfNoneAlreadyPresent(args: string[]): string {
    const pieces: string[] = [];
    for (const arg of args) {
        if (
            pieces.length > 0 &&
            !pieces[pieces.length - 1].endsWith(" ")&&
            arg &&
            !arg.startsWith(" ")
        ) {
            pieces.push(" ");
        }
        pieces.push(arg);
    }
    return pieces.join("");
}
