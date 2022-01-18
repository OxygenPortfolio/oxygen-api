import { ChainHandler } from '../contracts/chain-handler'
import { Crypto } from '../contracts/crypto'
import { Token } from '../contracts/token'
import { LoginDto } from '../dtos/login-dto'
import { AuthUseCase as BaseAuthUseCase } from '../contracts/auth-use-case'
import { UserRepository } from '../contracts/user-repository'

export class AuthUseCase implements BaseAuthUseCase {
	constructor (
		private readonly validatorChain: ChainHandler,
		private readonly userRepository: UserRepository,
		private readonly cryptoHelper: Crypto,
		private readonly tokenHelper: Token
	) {}

	public async auth ({ username, password }: LoginDto) {
		this.validatorChain.handle({ username, password })
		const user = await this.userRepository.findOneByUsername(username)
		if (!user) return null
		await this.cryptoHelper.compare(password, user.password)
		const accessToken = this.tokenHelper.sign({ user })
		return accessToken
	}
}
