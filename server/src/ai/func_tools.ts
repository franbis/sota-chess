import type { FunctionTool } from "../data/func_call_data";




const funcTools: FunctionTool[] = [
	{
		type: 'function',
		name: 'move',
		description: 'Move a chess piece based on the current board state',
		strict: true,
		parameters: {
			type: 'object',
			properties: {
				pieceType: {
					type: 'string',
					description: "The name of the moving piece (without the color)",
				},
				sourceSquare: {
					type: 'string',
					description: 'The start square',
				},
				targetSquare: {
					type: 'string',
					description: 'The target square',
				},
				explanation: {
					type: 'string',
					description: 'Short, natural explanation of the move. Must reference sourceSquare and targetSquare.',
				},
				isCheck: {
					type: 'boolean',
					description: "True if the opponent's king is in check.",
				},
				isCheckmate: {
					type: 'boolean',
					description: "True if the opponent lost by checkmate.",
				},
			},
			required: ['pieceType', 'sourceSquare', 'targetSquare', 'explanation', 'isCheck', 'isCheckmate'],
			additionalProperties: false
		},
	},
];

export default funcTools;