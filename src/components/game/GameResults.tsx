
import { motion } from 'framer-motion';
import { Trophy, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RoundResult {
  roundNumber: number;
  playerHand: string;
  opponentHand: string;
  potAmount: number;
  winner: 'player' | 'opponent' | 'tie';
}

interface GameResultsProps {
  isOpen: boolean;
  roundResults: RoundResult[];
  finalPlayerChips: number;
  finalOpponentChips: number;
  onClose: () => void;
}

const GameResults = ({ isOpen, roundResults, finalPlayerChips, finalOpponentChips, onClose }: GameResultsProps) => {
  if (!isOpen) return null;

  const finalWinner = finalPlayerChips > finalOpponentChips ? 'player' : 'opponent';
  const playerChipsEarned = finalPlayerChips - 1000; // Starting chips is 1000
  const opponentChipsEarned = finalOpponentChips - 1000;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <div className="bg-zinc-900 p-6 rounded-xl max-w-2xl w-full mx-4 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-poker-gold flex items-center gap-2">
            {finalWinner === 'player' ? (
              <>
                <Trophy className="h-6 w-6 text-yellow-500" />
                Congratulations! You Won!
              </>
            ) : (
              <>
                <Award className="h-6 w-6 text-red-500" />
                Game Over
              </>
            )}
          </h2>
        </div>

        <div className="mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Round</TableHead>
                <TableHead>Your Hand</TableHead>
                <TableHead>Opponent's Hand</TableHead>
                <TableHead>Pot</TableHead>
                <TableHead>Winner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roundResults.map((result) => (
                <TableRow key={result.roundNumber}>
                  <TableCell>{result.roundNumber}</TableCell>
                  <TableCell>{result.playerHand}</TableCell>
                  <TableCell>{result.opponentHand}</TableCell>
                  <TableCell>{result.potAmount}</TableCell>
                  <TableCell className={
                    result.winner === 'player' 
                      ? 'text-green-500' 
                      : result.winner === 'opponent' 
                        ? 'text-red-500' 
                        : 'text-yellow-500'
                  }>
                    {result.winner === 'player' 
                      ? 'You' 
                      : result.winner === 'opponent' 
                        ? 'Opponent' 
                        : 'Tie'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Final Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400">Your Chips Earned</p>
              <p className={`text-2xl font-bold ${playerChipsEarned >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {playerChipsEarned >= 0 ? `+${playerChipsEarned}` : playerChipsEarned}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Opponent's Chips Earned</p>
              <p className={`text-2xl font-bold ${opponentChipsEarned >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {opponentChipsEarned >= 0 ? `+${opponentChipsEarned}` : opponentChipsEarned}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gradient-to-r from-poker-gold to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black py-3 rounded-lg font-bold cursor-pointer"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
};

export default GameResults;
