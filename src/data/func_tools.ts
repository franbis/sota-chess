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
					description: "The first letter of the piece's name (lowercase)",
				},
				sourceSquare: {
					type: 'string',
					description: 'The start square',
				},
				targetSquare: {
					type: 'string',
					description: 'The target square',
				},
			},
			required: ['pieceType', 'sourceSquare', 'targetSquare'],
			additionalProperties: false
		},
	},
];

export default funcTools;