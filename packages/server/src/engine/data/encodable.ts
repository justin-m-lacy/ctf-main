export interface Encodable {

    encode(): string;

}

export interface Encoder<T extends Encodable> {
    encode(object: T): string;
}

export interface Decoder<T extends Encodable> {
    decode(data: string): T;
}