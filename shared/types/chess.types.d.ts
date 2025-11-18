import { Color, Square, PieceSymbol } from "chess.js";

import { MessageType } from "../data/chess.data";



type CastlingSide = 'k' | 'q';


/** A defined version of the type 'Chess.board()' returns as a
 * bidimensional array. */
type ChessboardSquareData = {
	square: Square
	type: PieceSymbol
	color: Color
} | null;


interface GameState {
	fen: string
	isCheck: boolean
	isCheckmate: boolean
}


interface GameStateMsgContent extends GameState {}

interface CreateGameMsgContent {
    color: Color
}

interface MoveMsgContent {
	sourceSquare: Square
	targetSquare: Square
}

interface CastleMsgContent {
	side: CastlingSide
}

type Message =
	// Server.
    | {type: typeof MessageType.STATE, content: GameStateMsgContent}
	// Client.
    | {type: typeof MessageType.CREATE, content: CreateGameMsgContent}
    | {type: typeof MessageType.MOVE, content: MoveMsgContent}
    | {type: typeof MessageType.CASTLE, content: CastleMsgContent}



export {
    type CastlingSide,
	type ChessboardSquareData,
	type GameState,

	type GameStateMsgContent,
	type CreateGameMsgContent,
	type MoveMsgContent,
	type CastleMsgContent,
    type Message,
}


	