import { HttpBaseResponse } from '../types/http-base-response'

export class HttpResponse {
	public static badRequest (error: Error): HttpBaseResponse {
		return {
			status: 400,
			message: error.message,
			error
		}
	}

	public static serverError (): HttpBaseResponse {
		return {
			status: 500,
			message: 'Unexpected error'
		}
	}
}
