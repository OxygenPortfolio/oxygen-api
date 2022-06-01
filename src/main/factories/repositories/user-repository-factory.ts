import { MongoUserRepository } from '../../../infra/repositories/mongo-user-repository'

export class UserRepositoryFactory {
	public static make () {
		const userRepository = new MongoUserRepository()
		return userRepository
	}
}
