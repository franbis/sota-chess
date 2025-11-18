import type { Color, PieceSymbol } from "chess.js";

import { ColorNotation, PieceNotation } from "../../../shared/data/chess.data";
import type { ChessboardSquareData } from "../../../shared/types/chess.types";
import type { FunctionCallData } from "../data/func_call_data";
import { InvalidPieceSymbol } from "../data/errors";



/** Chess move function call arguments with an explanation of intent. */
interface ExplainedMoveArgs {
	explanation: string
	[k: string]: any
}


interface AIChessPlayerArgs {
	TTSModel: string
	funcCallModel: string
	color: Color
}
/** Base class for AI managers. */
abstract class AIChessPlayer<T> {
	protected abstract client: T;
	protected abstract TTSModel: string;
	protected abstract funcCallModel: string;

	abstract color: Color;

	protected pieceNameSep = '_';


	/** Request an AI-generated voice message for a move explanation. */
	protected abstract explainMove(explanation: string): void
	/** Request the AI to play a move based on the board's state. */
	abstract requestMove(board: ChessboardSquareData[][], explain: boolean): Promise<FunctionCallData>


	/**
	 * Build the string representation for a square's data that's easy
	 * for the AI to interpret.
	 */
	protected squareDataToStr(row: number, col: number, squareData: ChessboardSquareData) {
		// Join the column lowercase letter with the row number.
		const coords = String.fromCharCode(97 + col) + (8 - row);

		let piece = '';
		if (squareData)
			// Use algebric notation for the piece name.
			piece = `
				${ColorNotation[squareData.color.charCodeAt(0)]}
				${this.pieceNameSep}
				${PieceNotation[squareData.type.charCodeAt(0)]}
			`;
		else
			piece = 'EMPTY';
		
		return `${coords}:${piece}`;
	}


	/** Build the string representation for a chessboard state. */
	protected prepCurrStateData(board: ChessboardSquareData[][]) {
		const rowStates: string[] = [];
		// Build the state for each square, for each row.
		board.forEach((row, rowIdx)=>{
			const rowState: string[] = [];
			row.forEach((sq, sqIdx)=>{
				rowState.push(this.squareDataToStr(rowIdx, sqIdx, sq));
			});
			rowStates.push(rowState.join(', '));
		});

		return rowStates.join('\n');
	}


	/** Interpret the symbol for a name the AI gave to a piece. */
	pieceNameToSymbol(t: string): PieceSymbol {
		const name = t.split(this.pieceNameSep).slice(-1)[0].toUpperCase();

		const pieceType = PieceNotation[name as keyof typeof PieceNotation]
		if (!pieceType)
			throw new InvalidPieceSymbol();
		
		return String.fromCharCode(pieceType) as PieceSymbol;
	}
}



export {
	type ExplainedMoveArgs,
	type AIChessPlayerArgs,

	AIChessPlayer,
};