export function noop(..._any: any) {}
export type TypeEquals<A, B> = A extends B ? (B extends A ? true : false) : false;

// Helper type for constructing mixin classes
export type Constructor<T> = new (...args: any[]) => T;

export function asNumber(n: number | string): number {
    if (typeof n === "number") {
        return n;
    } else {
        return parseInt(n, 10);
    }
}

export class ProcessorError extends Error {
    isProcessorError = true;
}

