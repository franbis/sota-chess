import { Color, Square } from "chess.js";


type GameID = string;


interface GameState {
    fen: string,
    check?: Color,
    checkmate?: boolean
}


interface Game {
    id: GameID,
    state: GameState
}


interface CreateGameReqArgs {
    color: Color
}


interface ReqGameStateReqArgs {
    id: GameID
}


interface MoveReqArgs {
	sourceSquare: Square,
	targetSquare: Square
}



export {
    type GameID,
    type GameState,
    type Game,
    type CreateGameReqArgs,
    type ReqGameStateReqArgs,
    type MoveReqArgs
}