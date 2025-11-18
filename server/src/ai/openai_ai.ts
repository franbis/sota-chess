import OpenAI from "openai";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

import { FunctionCallNotFound } from "../data/errors";

import funcTools from "./func_tools";
import type { FunctionCallData } from "../data/func_call_data";
import type { AIChessPlayerArgs, ExplainedMoveArgs } from "./ai";
import { AIChessPlayer } from "./ai";

import type { ChessboardSquareData } from "../../../shared/types/chess.types";



interface OpenAIChessPlayerArgs extends AIChessPlayerArgs {
    apiKey: string
}
/** AI manager which makes API calls to OpenAI services. */
class OpenAIChessPlayer extends AIChessPlayer<OpenAI> {
	protected client;
	color;
	protected TTSModel;
	protected funcCallModel;


	constructor({
		apiKey,
		TTSModel: TTSModel, funcCallModel,
		color='w'
	}: OpenAIChessPlayerArgs){
		super();

		this.client = new OpenAI({
			apiKey,
			dangerouslyAllowBrowser: true
		});
		this.TTSModel = TTSModel;
		this.funcCallModel = funcCallModel;

		this.color = color;
	}


	protected async explainMove(explanation: string) {
		// TODO.
		// const resp = await this.client.audio.speech.create({
		// 	model: this.TTSModel,
		// 	voice: 'alloy',
		// 	input: explanation,
		// 	speed: 1.25
		// });

		// const arrBuf = await resp.arrayBuffer();
		// const blob = new Blob([arrBuf], { type: 'audio/mpeg' });
		// const url = URL.createObjectURL(blob);

		// const audio = new Audio(url);
		// audio.play();
	}


	async requestMove(board: ChessboardSquareData[][], explain: boolean = false) {
		let input: ResponseInput = [
			{
				type: 'message',
				role: 'system',
				content: [
					'You are playing chess. The user is your opponent.',
					`Your pieces are ${this.color === 'w' ? 'white' : 'black'}`,
					'You can play only one move at a time.',
					"You can move any pieces, not just pawns and not just rooks and stuff"
				].join('\n')
			},
			{
				type: 'message',
				role: 'user',
				content: [
					"Here's the current board state:",
					this.prepCurrStateData(board),
					'It is your turn now!'
				].join('\n')
			},
		];

		let response = await this.client.responses.create({
			model: this.funcCallModel,
			input: input,
			tools: funcTools
		});

		const item = response.output[0];
		if (item.type == "function_call") {
			const args: ExplainedMoveArgs = JSON.parse(item.arguments);
			// Assume the arguments contain the 'explanation' key.
			const { explanation, ...otherArgs } = args;
			if (explain) this.explainMove(explanation);

			return {
				name: item.name,
				arguments: otherArgs
			} as FunctionCallData;
		}
		else {
			throw new FunctionCallNotFound();
		}
	};
}



export {
    OpenAIChessPlayer
}