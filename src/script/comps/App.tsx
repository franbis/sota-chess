import { useEffect, useState } from 'react';

import { Chess } from 'chess.js';
import type { Color, PieceSymbol, Square } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';

import OpenAI from "openai";
const client = new OpenAI({
	// TODO.
	apiKey: 'OPENAI_API_KEY',
	dangerouslyAllowBrowser: true
});
import type { ResponseInput } from 'openai/resources/responses/responses.mjs';

import funcTools from '../../data/func_tools';
import '../../style/App.sass';



type CastlingSide = 'k' | 'q';


// Use char codes to allow reverse searching.

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


class InvalidPieceSymbol extends Error {
	constructor(message?: string) {
		super(message ?? 'Invalid symbol for a chess piece');
	}
}


function App() {
	const [AIColor, setAIColor] = useState<Color>('b');
	const [game, setGame] = useState(new Chess());
	// TODO - Rooks tracking.
	const [AICastlingRooks, setAICastlingRooks] = useState<Record<CastlingSide, Square> | null>(null);


	const getNextColor = (c: Color)=>{
		return (c === 'w' ? 'b' : 'w') as Color;
	};


	const triggerNextTurn = ()=>{
		game.setTurn(getNextColor(game.turn()));
	};


	interface ArbitraryMoveArgs {
		pieceType: PieceSymbol,
		sourceSquare: Square,
		targetSquare: Square
	}
	const arbitraryMove = ({ pieceType, sourceSquare, targetSquare }: ArbitraryMoveArgs)=>{
		// Allow null move.
		if (targetSquare !== null) {
			game.remove(sourceSquare);
			game.put(
				{
					type: pieceType,
					color: game.turn()
				},
				targetSquare
			);
			//game['_incPositionCount']();
			triggerNextTurn();

			updateGame(true);
		}

		return true;
	};
	

	interface MoveArgs {
		sourceSquare: Square,
		targetSquare: Square
	}
	const move = ({ sourceSquare, targetSquare }: MoveArgs)=>{
		if (targetSquare === null)
			return false;

		try {
			game.move({
				from: sourceSquare,
				to: targetSquare
			});
			// 'skipValidation' must be 'true', otherwise no moves can be done
			// if there are invalid positions or pieces.
			updateGame(true);

			return true;
			
		} catch (e) {
			if ((e instanceof Error) && !e.message.startsWith('Invalid move'))
					throw e;
		}
		
		return false;
	};


	interface CastleArgs {
		castlingSide: CastlingSide
	}

	interface ArbitraryCastleArgs extends CastleArgs {}
	const arbitraryCastle = ({ castlingSide }: ArbitraryCastleArgs)=>{
		// Remove the king in case it's not on 'kingSquare' to prevent chess.js
		// from complaining about the presence of two kings of the same color.
		const actualKingSquare = game.findPiece({
			color: game.turn(),
			type: 'k'
		})[0];
		if (actualKingSquare)
			game.remove(actualKingSquare);


		// Calculate the target squares for the king and the rook based on the
		// castling side.

		const row = game.turn() === 'w' ? 1 : 8;
		let kTargetLetter: string, rTargetLetter: string;
		if (castlingSide === 'k') {
			kTargetLetter = 'g';
			rTargetLetter = 'f';
		}
		else {
			kTargetLetter = 'c';
			rTargetLetter = 'd';
		}
		const [kTargetSquare, rTargetSquare] = [
			kTargetLetter + row,
			rTargetLetter + row
		] as Square[];

		game.put(
			{
				type: 'k',
				color: game.turn()
			},
			kTargetSquare
		);

		// TODO - Find the rook based on the castling side and remove it. In order to do
		// this, the rooks must be tracked to avoid picking the one from the wrong side.

		game.put(
			{
				type: 'r',
				color: game.turn()
			},
			rTargetSquare
		);

		game['_incPositionCount']();
		triggerNextTurn();

		updateGame();

		return true;
	}


	const updateGame = (skipValidation: boolean = false)=>{
		setGame(new Chess(game.fen(), {skipValidation}));
	};


	type ChessSlotData = {
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null;


	const slotToStr = (row: number, col: number, slotData: ChessSlotData)=>{
		const coords = String.fromCharCode(97 + col) + (8 - row);
		let piece = '';
		if (slotData)
			piece = `${PieceColors[slotData.color.charCodeAt(0)]}_${PieceNames[slotData.type.charCodeAt(0)]}`;
		else
			piece = 'EMPTY';
		
		return `${coords}:${piece}`;
	};


	const getCurrentState = ()=>{
		const rowStates: string[] = [];
		game.board().forEach((row, rowIdx)=>{
			const rowState: string[] = [];
			row.forEach((slot, slotIdx)=>{
				rowState.push(slotToStr(rowIdx, slotIdx, slot));
			});
			rowStates.push(rowState.join(', '));
		});

		return rowStates.join('\n');
	};


	const getRespPieceTypeName = (t: string): PieceSymbol =>{
		const name = t.split('_').slice(-1)[0].toUpperCase();

		const pieceType = PieceNames[name as keyof typeof PieceNames]
		if (!pieceType)
			throw new InvalidPieceSymbol();
		
		return String.fromCharCode(pieceType) as PieceSymbol;
	};


	const explainMove = async (expl: string)=>{
		const resp = await client.audio.speech.create({
			model: "gpt-4o-mini-tts",
			voice: "alloy",
			input: expl,
		});

		const arrayBuffer = await resp.arrayBuffer();
		const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
		const url = URL.createObjectURL(blob);

		const audio = new Audio(url);
		audio.play();
	};


	type Explained<T> = T & {explanation: string};

	const requestAIMove = async ()=>{
		let input: ResponseInput = [
			{
				type: 'message',
				role: 'system',
				content: [
					'You are playing chess. The user is your opponent.',
					`Your pieces are ${AIColor === 'w' ? 'white' : 'black'}`,
					'You can play only one move at a time.',
					"You can move any pieces, not just pawns and not just rooks and stuff"
				].join('\n')
			},
			{
				type: 'message',
				role: 'user',
				content: [
					"Here's the current board state:",
					getCurrentState(),
					'It is your turn now!'
				].join('\n')
			},
		];

		let response = await client.responses.create({
			model: 'gpt-4.1-mini',
			input: input,
			tools: funcTools
		});

		const item = response.output[0];
		if (item.type == "function_call") {
			if (item.name == "move") {
				console.log(item);
				const args: Explained<ArbitraryMoveArgs> & {pieceType: string} = JSON.parse(item.arguments);
				args.pieceType = getRespPieceTypeName(args.pieceType);
				const { explanation, ...mArgs } = args;
				//await explainMove(explanation);
				arbitraryMove(args as ArbitraryMoveArgs);
			}
		}
	};


	const canDragPiece = ({ isSparePiece, piece, square }: PieceHandlerArgs)=>{
		return piece.pieceType[0] !== AIColor;
	};


	const onPieceDrop = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs)=>{
		const moved = move({ sourceSquare, targetSquare} as MoveArgs);

		if (moved) requestAIMove();

		return moved;
	};


	return (
		<div id="chessboard_cont">
				<Chessboard
					options={{
						position: game.fen(),
						canDragPiece,
						onPieceDrop
					}}
				/>
		</div>
	);
}

export default App;