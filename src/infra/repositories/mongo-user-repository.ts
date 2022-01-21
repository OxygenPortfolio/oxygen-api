import { MongoUserModel } from '../../database/models/mongo-user-model'
import { UserRepository } from '../../domain/contracts/user-repository'
import { User } from '../../domain/types/user'
import { DatabaseError } from '../../utils/errors/database-error'

export class MongoUserRepository implements UserRepository {
	public async findOneByUsername (username: string) {
		const user = await MongoUserModel.findOne({ username })
		return user
	}

	public async insert (userData: User) {
		try {
			const user = await MongoUserModel.create(userData)
			return user
		} catch (err) {
			if (err instanceof Error) throw new DatabaseError(`user with username ${userData.username} is already registered`)
		}
	}
}
