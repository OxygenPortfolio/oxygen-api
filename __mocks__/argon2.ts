import argon2 from 'argon2'

export default {
	isValid: true,
	async verify (hash: string, plain: string | Buffer, options?: argon2.Options | undefined) {
		if (hash === plain) return this.isValid
		throw new Error()
	}
}
