import type { Color, PieceSymbol, Square } from "chess.js";


// Algebric notations.
// Use char codes to allow reverse searching.

enum PieceNotation {
	PAWN = 112,
	ROOK = 114,
	KNIGHT = 110,
	BISHOP = 98,
	QUEEN = 113,
	KING = 107,
};

enum ColorNotation {
	WHITE = 119,
	BLACK = 98,
}


type CastlingSide = 'k' | 'q';


/** A defined version of the construct that 'Chess.board()' returns
 * as a bidimensional array. */
type ChessboardSquareData = {
	square: Square;
	type: PieceSymbol;
	color: Color;
} | null;



export {
    type CastlingSide,
	type ChessboardSquareData,
	
    PieceNotation,
    ColorNotation,
}