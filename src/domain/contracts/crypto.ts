export interface Crypto {
	hash(rawString: string): string
	compare(rawString: string, hashedString: string): boolean
}
