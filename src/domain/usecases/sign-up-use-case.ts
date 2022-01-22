import { ChainHandler } from '../contracts/chain-handler'
import { UserRepository } from '../contracts/user-repository'
import { SignUpDto } from '../dtos/sign-up-dto'
import { User } from '../types/user'

export class SignUpUseCase {
	constructor (
		private readonly validatorChain: ChainHandler,
		private readonly userRepository: UserRepository
	) {}

	public async signUp ({ username, password, email }: SignUpDto): Promise<User | undefined> {
		this.validatorChain.handle({ username, password, email })
		const user = await this.userRepository.insert({ username, password, email })
		return user
	}
}
