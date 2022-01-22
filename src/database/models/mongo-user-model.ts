import { prop, getModelForClass } from '@typegoose/typegoose'
import { BaseModel } from './base-model'

export class MongoUserSchema extends BaseModel {
	@prop({ type: () => String, required: true })
	public password: string

	@prop({ type: () => String, required: true, unique: true })
	public username: string

	@prop({ type: () => String, required: true, unique: true })
	public email: string
}

export const MongoUserModel = getModelForClass(MongoUserSchema, { schemaOptions: { timestamps: true } })
