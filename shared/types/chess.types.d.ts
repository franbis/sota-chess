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


interface Move {
	sourceSquare: Square,
	targetSquare: Square
}

interface GameState {
	fen: string
	lastMove?: Move,
	isCheck: boolean,
	isCheckmate: boolean
}


interface GameStateMsgContent extends GameState {}

interface MoveExplanationMsgContent {
	explanation: string,
	audioBufferB64: string
}

interface CreateGameMsgContent {
    color: Color
}

interface MoveMsgContent extends Move {}

interface CastleMsgContent {
	side: CastlingSide
}

type Message =
	// Server to client.
    | {type: typeof MessageType.STATE, content: GameStateMsgContent}
    | {type: typeof MessageType.EXPLANATION, content: MoveExplanationMsgContent}
	// Client to server.
    | {type: typeof MessageType.CREATE, content: CreateGameMsgContent}
    | {type: typeof MessageType.MOVE, content: MoveMsgContent}
    | {type: typeof MessageType.CASTLE, content: CastleMsgContent}



export {
    type CastlingSide,
	type ChessboardSquareData,
	type Move,
	type GameState,

	type GameStateMsgContent,
	type CreateGameMsgContent,
	type MoveMsgContent,
	type CastleMsgContent,
    type Message,
}


	