import GamePairing, {GAME_STATUS, USER_STATUS} from "../game/pairing.js";
import { describe, it} from "mocha";
import assert from "assert";

describe('GamePairing', () => {
  it('suppose connecting game', () => {
    const gamePairing = new GamePairing();
    gamePairing.join('zak', 6, 5);
    assert.ok(gamePairing);
  });

  it('Suppose to be searching', () => {
    const gamePairin = new GamePairing();
    const game1Id =  gamePairin.join('zak', 6, 5);
    const game2Id =  gamePairin.join('vini', 6, 5);
    assert.equal( gamePairin.games[game1Id].status, GAME_STATUS.CONNECTING);
    assert.equal( gamePairin.games[game2Id].status, GAME_STATUS.CONNECTING);
    
    gamePairin.update(game1Id, 'zak');
    gamePairin.update(game2Id, 'vini')
    assert.equal( gamePairin.games[game1Id].status, GAME_STATUS.SEARCHING);
    assert.equal( gamePairin.games[game2Id].status, GAME_STATUS.SEARCHING);
  });

  it('Player looking for a game after leave', () => {
    const gamePair = new GamePairing();
    const player = gamePair.join('zak', 6, 5);
    gamePair.update(player, 'zak');
    const leave = gamePair.leave(player, 'zak');
    assert.equal(leave, null);
  });

  it('A player leave a game, should return ... ', () => {
    const gamePairin = new GamePairing();
    const game1Id =  gamePairin.join('zak', 6, 5);
    const game2Id =  gamePairin.join('vini', 6, 5);
    gamePairin.update(game1Id, 'zak');
    gamePairin.update(game2Id, 'vini')
    gamePairin.leave(game1Id, 'zak');
    gamePairin.update(game2Id, 'vini')

    assert.equal( gamePairin.users['vini'][0], USER_STATUS.PAIRED);
  });
});

