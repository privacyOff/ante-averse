import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ChipCounter from '@/components/ChipCounter';
import PokerTable from '@/components/PokerTable';
import GameControls from '@/components/GameControls';
import GameHeader from '@/components/game/GameHeader';
import PlayerInfo from '@/components/game/PlayerInfo';
import WinningHandDisplay from '@/components/game/WinningHandDisplay';
import { usePokerGame } from '@/hooks/poker/usePokerGame';

const GamePage = () => {
  const { difficulty = 'beginner' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomCode = queryParams.get('room');
  
  const {
    gameState,
    selectedCards,
    showOpponentCards,
    playerMessage,
    opponentMessage,
    winningHand,
    cutAmount,
    handleAnte,
    handleCutDeck,
    handleBetAction,
    handleCardSwap,
    handleCardSelect,
    handleNextRound,
    handlePlayAgain,
    handleCutAmountChange
  } = usePokerGame(difficulty);
  
  const handleNextRoundOrPlayAgain = () => {
    if (gameState.gamePhase === 'gameOver') {
      handlePlayAgain();
    } else {
      const result = handleNextRound();
      if (result?.redirect) {
        navigate('/buy-chips');
      }
    }
  };
  
  const pageTitle = roomCode 
    ? `Multiplayer Game (Room: ${roomCode})` 
    : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Game`;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 py-10 px-4">
      <ChipCounter />
      
      <div className="max-w-5xl mx-auto">
        <GameHeader 
          title={pageTitle}
          currentRound={gameState.currentRound}
          totalRounds={gameState.totalRounds}
        />
        
        <div className="flex justify-between mb-6">
          <PlayerInfo
            isOpponent={true}
            chips={gameState.opponentChips}
            message={opponentMessage}
          />
          
          <PlayerInfo
            isOpponent={false}
            chips={gameState.playerChips}
            message={playerMessage}
          />
        </div>
        
        <PokerTable
          playerHand={gameState.playerHand}
          opponentHand={gameState.opponentHand}
          showOpponentCards={showOpponentCards}
          selectedCards={selectedCards}
          pot={gameState.pot}
          onCardSelect={handleCardSelect}
          playerBet={0}
          opponentBet={0}
          className="mb-8"
        >
          <GameControls
            gamePhase={gameState.gamePhase}
            onAnte={handleAnte}
            onCutDeck={handleCutDeck}
            onBetAction={handleBetAction}
            onSwapCards={handleCardSwap}
            onPlayAgain={handleNextRoundOrPlayAgain}
            playerChips={gameState.playerChips}
            anteAmount={gameState.anteAmount}
            currentBet={gameState.currentBet}
            minRaise={gameState.gamePhase === 'firstBet' ? gameState.anteAmount : gameState.anteAmount * 2}
            maxRaise={gameState.gamePhase === 'firstBet' ? gameState.anteAmount * 3 : gameState.anteAmount * 6}
            selectedCards={selectedCards}
            cutAmount={cutAmount}
            onCutAmountChange={handleCutAmountChange}
            playAgainLabel={gameState.gamePhase === 'gameOver' ? 'Play Again' : 'Next Round'}
            className="max-w-md mx-auto"
          />
        </PokerTable>
        
        <WinningHandDisplay
          winningHand={winningHand}
          gamePhase={gameState.gamePhase}
          winner={gameState.winner}
        />
      </div>
    </div>
  );
};

export default GamePage;
