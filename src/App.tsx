import './App.css';
import { create } from "zustand"

/*
deck - nostopakka
usedDeck - laittopakka
*/

type Card = { suit: string; value: number };
type Player = { name: string; hand: Card[] };

interface GameState {
  deck: Card[];
  usedDeck: Card[];
  shuffleDeck: () => void;
  removeCard: () => void;
  players: Player[];
}

const createBaseDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  // 2-10, J, Q, K, A, ei jokereita ja erikoiskorteilla on omat arvonsa suuruden perustella 11-13
  // Suits on maat, eli hertta, ruutu, risti ja pata
  // 13+13+13+13 = 52 eli 13 per maa
  // Values on vain valmis pohja deck arraylle
  // Ne on hieman offsetattu, koska values alkaa 1, mikä on todellisuudessa 2
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

const removeCard = (deck: Card[]) => {
  if (deck.length === 0) return deck;
  const newDeck = [...deck];
  newDeck.pop();
  return newDeck;
};

const putCard = (deck: Card[], usedDeck: Card[]) => {
  // TODO
  return null
}

const drawCard = (deck: Card[]) => {
  // TODO
  return null
}

const createPlayer = ({hand, name}: Player) => {
  // TODO
  return {hand, name}
}

// Pelin state ja funktiot zustandilla
const useGameStore = create<GameState>(set => ({
  deck: createBaseDeck(),
  shuffleDeck: () => set(state => ({
    deck: shuffleDeck(state.deck)
  })),
  removeCard: () => set(state => ({
    deck: removeCard(state.deck)
  })),
  players: [],
  usedDeck: [],
}));

function App() {
  const { deck, shuffleDeck, removeCard } = useGameStore();
  
  return (
    <>
      <div>
        <button onClick={shuffleDeck}>
          Sekoita pakka
        </button>
        <button onClick={removeCard}>
          Ota pakasta kortti
        </button>
        <button onClick={() => console.log(deck)}>
          Lunttaa pakka
        </button>
      </div>
      <p>
        Pakan koko: {deck.length}
      </p>
    </>
  );
}

export default App;
