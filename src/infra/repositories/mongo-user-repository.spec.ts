import { UserRepository } from '../../domain/contracts/user-repository'
import { User } from '../../domain/types/user'

class MongoUserRepository implements UserRepository {
	public async findOneByUsername (username: string): Promise<User | null | undefined> {
		return { password: 'asd' }
	}
}

function makeSut () {
	const sut = new MongoUserRepository()
	return { sut }
}

describe('UserRepository', () => {
	it('Should return an user when provided a valid username', async () => {
		const { sut } = makeSut()
		const username = 'valid_username'

		const user: User = await sut.findOneByUsername(username) as User

		expect(user.password).toBeDefined()
	})
})
