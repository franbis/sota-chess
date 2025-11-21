import OpenAI from "openai";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

import { FunctionCallNotFound } from "../data/errors";

import funcTools from "./func_tools";
import type { FunctionCallData } from "../data/func_call_data";
import type { AIChessPlayerArgs, AIMoveArgs } from "./ai";
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


	async genMoveExplanationVM(explanation: string) {
		const resp = await this.client.audio.speech.create({
			// TODO - Externalize hardcoded settings.
			model: this.TTSModel,
			voice: 'alloy',
			input: explanation,
			speed: 1.25
		});

		return await resp.arrayBuffer();
	}


	async requestMove(board: ChessboardSquareData[][]) {
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
			const args: AIMoveArgs = JSON.parse(item.arguments);
			return {
				name: item.name,
				arguments: args
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