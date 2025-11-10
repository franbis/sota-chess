import { useState } from 'react';

import { Chess } from 'chess.js';
import type { Color, PieceSymbol, Square } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';

import '../../style/App.sass';



type CastlingSide = 'k' | 'q';

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


	const requestAIMove = async ()=>{
		// TODO.
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