class InvalidPieceSymbol extends Error {
	constructor(message?: string) {
		super(message ?? 'Invalid symbol for a chess piece');
	}
}


class FunctionCallNotFound extends Error {
	constructor(message?: string) {
		super(message ?? 'No function call was found');
	}
}



export {
    InvalidPieceSymbol,
	FunctionCallNotFound
}