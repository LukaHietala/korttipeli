import "./App.css";
import { useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/*
deck - nostopakka
usedDeck - laittopakka
*/

// Base types
type Card = { suit: string; value: number };
type Player = { name: string; hand: Card[] };

// Game state and actions types
type State = {
  deck: Card[];
  usedDeck: Card[];
  players: Player[];
  isHanded: boolean;
  turn: number;
};
type Actions = {
  shuffleDeck: () => void;
  addPlayer: (player: Player) => void;
  handCards: () => void;
  // Normaalisti menee seuraavalle pelaajalle, pitää syöttää manuaalisesti jos jokin sääntö toteutuu
  nextPlayerTurn: (turnIndex?: number) => void;
  resetGame: () => void;
};

const getCardSvgPath = (card: Card) => {
  const value =
    card.value === 1
      ? "ace"
      : card.value === 11
      ? "jack"
      : card.value === 12
      ? "queen"
      : card.value === 13
      ? "king"
      : card.value;
  return `/cards/${card.suit}_${value}.svg`;
};

const createBaseDeck = () => {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  // 1(A)-10, J, Q, K, ei jokereita ja erikoiskorteilla on omat arvonsa suuruden perustella 11-13
  // Suits on maat, eli hertta, ruutu, risti ja pata
  // 13+13+13+13 = 52 eli 13 per maa
  // Values on vain valmis pohja deck arraylle
  const values = Array.from({ length: 13 }, (_, i) => i + 1);
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }

  return deck;
};

const shuffleDeck = (deck: Card[]) => {
  // Fisher-Yates shuffle jostain internetin perukoilta
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

const handCards = (deck: Card[], players: Player[], isHanded: boolean) => {
  if (players.length === 0) {
    console.log("Ei pelaajia");
    return { newDeck: deck, newPlayers: players };
  }

  if (isHanded) {
    console.log("Kortit on jo jaettu");
    return { newDeck: deck, newPlayers: players };
  }

  if (deck.length < players.length * 5) {
    console.log("Pakka on liian pieni");
    return { newDeck: deck, newPlayers: players };
  }

  const slicedDeck = deck.slice(0, players.length * 5);
  const newDeck = deck.slice(players.length * 5);
  const newPlayers = players.map((player, i) => ({
    ...player,
    hand: slicedDeck.slice(i * 5, i * 5 + 5),
  }));
  return { newDeck, newPlayers };
};

const nextPlayerTurn = (
  players: Player[],
  currentTurnPlayerIndex: number,
  nextPlayerIndex?: number
) => {
  if (players.length === 0) return 0;
  return nextPlayerIndex
    ? nextPlayerIndex
    : (currentTurnPlayerIndex + 1) % players.length;
};

const initialState: State = {
  deck: createBaseDeck(),
  usedDeck: [],
  players: [],
  isHanded: false,
  turn: 0,
};

// Pelin state ja funktiot zustandilla, ei tallennettu vielä muistiin
const useGameStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      shuffleDeck: () =>
        set((state) => ({
          deck: shuffleDeck(state.deck),
        })),
      addPlayer: (player: Player) =>
        set((state) => ({
          players: [...state.players, player],
        })),
      handCards: () =>
        set((state) => ({
          deck: handCards(state.deck, state.players, state.isHanded).newDeck,
          players: handCards(state.deck, state.players, state.isHanded)
            .newPlayers,
          isHanded: true,
        })),
      nextPlayerTurn: (turnIndex?: number) =>
        set((state) => ({
          turn: nextPlayerTurn(state.players, state.turn, turnIndex),
        })),
      resetGame: () =>
        set(() => ({
          ...initialState,
        })),
    }),
    {
      name: "game",
    }
  )
);

function App() {
  const {
    deck,
    shuffleDeck,
    players,
    addPlayer,
    handCards,
    isHanded,
    resetGame,
    usedDeck,
    nextPlayerTurn,
    turn,
  } = useGameStore();

  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [playerName, setPlayerName] = useState("");

  return (
    <>
      <div className="inline-flex space-x-2">
        <button onClick={shuffleDeck}>Sekoita pakka</button>
        <button onClick={() => console.log(deck)}>Lunttaa pakka</button>
        <button onClick={handCards} disabled={isHanded}>
          Jaa kortit
        </button>
        <button onClick={() => nextPlayerTurn()}>Seuraava pelaaja</button>
        <button onClick={() => resetGame()}>Nollaa peli</button>
        <button onClick={() => setIsCreatingPlayer(true)}>Lisää pelaaja</button>
      </div>
      {isCreatingPlayer && (
        <div>
          <input
            type="text"
            placeholder="Pelaajan nimi"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button
            onClick={() => {
              addPlayer({ name: playerName, hand: [] });
              setIsCreatingPlayer(false);
            }}
          >
            Lisää pelaaja
          </button>
        </div>
      )}
      <div className="flex flex-row space-x-4 mt-6">
        <div className="grid grid-cols-2 gap-4 h-min">
          {players.map((player, i) => (
            <div
              key={i}
              className={`p-4 ${
                players[turn] === player ? "bg-neutral-700" : ""
              } outline outline-1 outline-neutral-700 rounded flex flex-col space-y-2`}
            >
              <span>{player.name}</span>
              <div className="flex-row space-x-1">
                {player.hand.map((card, j) => (
                  <img
                    key={j}
                    src={getCardSvgPath(card)}
                    alt={`${card.value} of ${card.suit}`}
                    className="w-14 h-max"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div>
          {usedDeck.map((card, i) => (
            <div key={i}>
              {card.value} of {card.suit}
            </div>
          ))}
        </div>
        <div>
          {players.length > 0 ? (
            <p>Vuorossa: {players[turn]?.name}</p>
          ) : (
            <p>Ei pelaajia</p>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
