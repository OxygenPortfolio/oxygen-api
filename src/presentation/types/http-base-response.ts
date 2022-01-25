export class HttpBaseResponse {
	public status: number
	public data?: any
	public error?: Error
	public message?: string

	constructor ({ status, data, error, message }: HttpBaseResponse) {
		this.status = status
		this.data = data
		this.error = error
		this.message = message
	}
}
