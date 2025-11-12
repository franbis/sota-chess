import type { Tool } from 'openai/resources/responses/responses.mjs';



const funcTools: Tool[] = [
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
			},
			required: ['pieceType', 'sourceSquare', 'targetSquare', 'explanation'],
			additionalProperties: false
		},
	},
];

export default funcTools;