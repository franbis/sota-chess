import type { Color, PieceSymbol, Square } from "chess.js";
import { Chess } from "chess.js";

import type { CastlingSide } from "../data/chess_data";



interface MoveArgs {
	sourceSquare: Square,
	targetSquare: Square
}

interface ForceMoveArgs {
	pieceType: PieceSymbol,
	sourceSquare: Square,
	targetSquare: Square
}

interface CastleArgs {
		castlingSide: CastlingSide
	}

interface ForceCastleArgs extends CastleArgs {}


/** A chess game manager that allows some illegal moves. */
class LooseChessManager {
	game: Chess;


	constructor() {
		this.game = new Chess();
	}


	getNextMoveColor() {
		return (this.game.turn() === 'w' ? 'b' : 'w') as Color;
	}


	triggerNextTurn() {
		return this.game.setTurn(this.getNextMoveColor());
	}
	

	/** Attempt to perform a chess move even if the game state is invalid. */
	move({ sourceSquare, targetSquare }: MoveArgs) {
		if (targetSquare === null) return false;

		try {
			const m = this.game.move({
				from: sourceSquare,
				to: targetSquare
			});
			if (m) {
				// 'skipValidation' must be 'true', otherwise no moves can be done
				// if there are invalid positions or pieces.
				this.updateGameState(true);
			}

			return Boolean(m);
			
		} catch (e) {
			if ((e instanceof Error) && !e.message.startsWith('Invalid move'))
					throw e;
		}
		
		return false;
	}


	/** Attempt to force a chess move even if illegal. */
	forceMove({ pieceType, sourceSquare, targetSquare }: ForceMoveArgs) {
		if (targetSquare === null) return false;

		this.game.remove(sourceSquare);
		let moved = this.game.put(
			{
				type: pieceType,
				color: this.game.turn()
			},
			targetSquare
		);
		if (moved) {
			//game['_incPositionCount']();
			moved = this.triggerNextTurn();

			this.updateGameState(true);
		}

		return moved;
	}


	
	/** Attempt to perform a chess castling even if illegal. */
	forceCastle({ castlingSide }: ForceCastleArgs) {
		// Remove the king in case it's not on 'kingSquare' to prevent chess.js
		// from complaining about the presence of two kings of the same color.
		const actualKingSquare = this.game.findPiece({
			color: this.game.turn(),
			type: 'k'
		})[0];
		if (actualKingSquare)
			this.game.remove(actualKingSquare);


		// Calculate the target squares for the king and the rook based on the
		// castling side.

		const row = this.game.turn() === 'w' ? 1 : 8;
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

		this.game.put(
			{
				type: 'k',
				color: this.game.turn()
			},
			kTargetSquare
		);

		// TODO - Find the rook based on the castling side and remove it. In order to do
		// this, the rooks must be tracked to avoid picking the one from the wrong side.

		this.game.put(
			{
				type: 'r',
				color: this.game.turn()
			},
			rTargetSquare
		);

		//this.game['_incPositionCount']();
		this.triggerNextTurn();

		this.updateGameState();

		return true;
	}


	updateGameState(skipValidation: boolean = false) {
		this.game = new Chess(this.game.fen(), {skipValidation});
	}
}



export {
	type MoveArgs,
	type ForceMoveArgs,
	type ForceCastleArgs,
	
	LooseChessManager
}