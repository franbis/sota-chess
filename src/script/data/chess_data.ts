// Use char codes to allow reverse searching.

import type { Color, PieceSymbol, Square } from "chess.js";

enum PieceNames {
	PAWN = 112,
	ROOK = 114,
	KNIGHT = 110,
	BISHOP = 98,
	QUEEN = 113,
	KING = 107,
};


enum PieceColors {
	WHITE = 119,
	BLACK = 98,
}


type CastlingSide = 'k' | 'q';


type ChessboardSquareData = {
	square: Square;
	type: PieceSymbol;
	color: Color;
} | null;



export {
    PieceNames,
    PieceColors,

    type CastlingSide,
	type ChessboardSquareData,
}