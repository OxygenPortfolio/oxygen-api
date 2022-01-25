import { ChainHandler } from '../contracts/chain-handler'
import { SignUpUseCase as BaseSignUpUseCase } from '../contracts/sign-up-use-case'
import { Token } from '../contracts/token'
import { UserRepository } from '../contracts/user-repository'
import { SignUpDto } from '../dtos/sign-up-dto'

export class SignUpUseCase implements BaseSignUpUseCase {
	constructor (
		private readonly validatorChain: ChainHandler,
		private readonly userRepository: UserRepository,
		private readonly tokenHelper: Token
	) {}

	public async signUp ({ username, password, email }: SignUpDto): Promise<string> {
		this.validatorChain.handle({ username, password, email })
		const user = await this.userRepository.insert({ username, password, email })
		const accessToken = this.tokenHelper.sign({ user })
		return accessToken
	}
}
