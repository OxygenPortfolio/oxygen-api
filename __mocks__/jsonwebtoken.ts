import jwt from 'jsonwebtoken'

export default {
	token: 'correct_token',
	sign (payload: string | object | Buffer, secretOrPrivateKey: jwt.Secret, options?: jwt.SignOptions | undefined) {
		return this.token
	}
}
