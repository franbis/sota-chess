import type { Color, PieceSymbol } from "chess.js";

import { PieceColors, PieceNames, type ChessboardSquareData } from "../data/chess_data";
import type { FunctionCallData } from "../data/func_call_data";
import { InvalidPieceSymbol } from "../data/errors";



interface ExplainedMoveArgs {
	explanation: string
	[k: string]: any
}


interface AIChessPlayerArgs {
	ttsModel: string
	funcCallModel: string
	color: Color
}
abstract class AIChessPlayer<T> {
	protected abstract client: T;
	protected abstract ttsModel: string;
	protected abstract funcCallModel: string;

	abstract color: Color;


	protected abstract explainMove(explanation: string): void
	abstract requestMove(board: ChessboardSquareData[][], explain: boolean): Promise<FunctionCallData>


	protected slotToStr(row: number, col: number, slotData: ChessboardSquareData) {
		const coords = String.fromCharCode(97 + col) + (8 - row);
		let piece = '';
		if (slotData)
			piece = `${PieceColors[slotData.color.charCodeAt(0)]}_${PieceNames[slotData.type.charCodeAt(0)]}`;
		else
			piece = 'EMPTY';
		
		return `${coords}:${piece}`;
	}


	protected prepCurrStateData(board: ChessboardSquareData[][]) {
		const rowStates: string[] = [];
		board.forEach((row, rowIdx)=>{
			const rowState: string[] = [];
			row.forEach((slot, slotIdx)=>{
				rowState.push(this.slotToStr(rowIdx, slotIdx, slot));
			});
			rowStates.push(rowState.join(', '));
		});

		return rowStates.join('\n');
	}


	getRespPieceTypeName(t: string): PieceSymbol {
		const name = t.split('_').slice(-1)[0].toUpperCase();

		const pieceType = PieceNames[name as keyof typeof PieceNames]
		if (!pieceType)
			throw new InvalidPieceSymbol();
		
		return String.fromCharCode(pieceType) as PieceSymbol;
	}
}



export {
	type ExplainedMoveArgs,
	type ChessboardSquareData as ChessSlotData,
	type AIChessPlayerArgs,
	AIChessPlayer
}