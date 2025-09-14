import { PlayerManager } from './Player.js'
import { Board } from './Board.js'
import { GameRules } from './GameRules.js'

/**
 * ゲーム状態管理クラス - ゲーム全体の状態を管理
 */
export class GameState {
  constructor() {
    this.playerManager = new PlayerManager()
    this.board = new Board()
    this.rules = new GameRules(this.board)

    // ゲーム状態
    this.currentScreen = 'home' // 'home' | 'game' | 'result'
    this.gamePhase = 'setup'    // 'setup' | 'playing' | 'finished'
    this.currentPlayerIndex = 0
    this.players = []
    this.gameStarted = false

    // ゲーム統計
    this.moveHistory = []
    this.passCount = 0
    this.totalMoves = 0
  }

  /**
   * ゲームを初期化
   * @param {number} playerCount - プレイヤー数
   */
  initGame(playerCount) {
    try {
      // プレイヤーを初期化
      this.players = this.playerManager.initializePlayers(playerCount)

      // ボードを初期化
      this.board.clear()
      this.board.setupInitialPieces(playerCount)

      // ルールエンジンを更新
      this.rules = new GameRules(this.board)

      // ゲーム状態をリセット
      this.gamePhase = 'playing'
      this.currentPlayerIndex = 0
      this.gameStarted = true
      this.moveHistory = []
      this.passCount = 0
      this.totalMoves = 0

      console.log(`ゲーム開始！ ${playerCount}人プレイ`)
      console.log('初期ボード:')
      this.board.printBoard()

      return true
    } catch (error) {
      console.error('ゲーム初期化エラー:', error.message)
      return false
    }
  }

  /**
   * 現在のプレイヤーを取得
   * @returns {Player|null} 現在のプレイヤー
   */
  getCurrentPlayer() {
    if (this.players.length === 0) return null
    return this.players[this.currentPlayerIndex]
  }

  /**
   * 現在のプレイヤーIDを取得
   * @returns {number} プレイヤーID
   */
  getCurrentPlayerId() {
    const player = this.getCurrentPlayer()
    return player ? player.id : 0
  }

  /**
   * 手を実行
   * @param {number} row - 行
   * @param {number} col - 列
   * @returns {Object} 手の実行結果
   */
  makeMove(row, col) {
    if (this.gamePhase !== 'playing') {
      return { success: false, message: 'ゲーム中ではありません' }
    }

    const currentPlayerId = this.getCurrentPlayerId()
    if (currentPlayerId === 0) {
      return { success: false, message: '現在のプレイヤーが不明です' }
    }

    // 有効な手かチェック
    if (!this.rules.isValidMove(row, col, currentPlayerId)) {
      return { success: false, message: '無効な手です' }
    }

    // 手を実行
    const moveSuccess = this.rules.makeMove(row, col, currentPlayerId)
    if (!moveSuccess) {
      return { success: false, message: '手の実行に失敗しました' }
    }

    // 手履歴に記録
    const moveData = {
      playerId: currentPlayerId,
      row,
      col,
      moveNumber: this.totalMoves + 1,
      timestamp: new Date()
    }
    this.moveHistory.push(moveData)
    this.totalMoves++
    this.passCount = 0 // 有効な手が打たれたのでパスカウントリセット

    console.log(`プレイヤー${currentPlayerId}が(${row}, ${col})に石を置きました`)
    this.board.printBoard()

    // ゲーム終了チェック
    const gameOverCheck = this.checkGameOver()
    if (gameOverCheck.isGameOver) {
      this.gamePhase = 'finished'
      return {
        success: true,
        message: '手を実行しました',
        gameOver: true,
        result: gameOverCheck.result
      }
    }

    // 次のプレイヤーに移る
    this.nextTurn()

    return {
      success: true,
      message: '手を実行しました',
      gameOver: false,
      currentPlayer: this.getCurrentPlayer(),
      pieceCounts: this.board.getAllPieceCounts(this.players.length)
    }
  }

  /**
   * 現在のプレイヤーをパス
   * @returns {Object} パス結果
   */
  pass() {
    if (this.gamePhase !== 'playing') {
      return { success: false, message: 'ゲーム中ではありません' }
    }

    const currentPlayerId = this.getCurrentPlayerId()

    // パスが必要かチェック
    if (!this.rules.shouldPass(currentPlayerId)) {
      return { success: false, message: '有効な手があるためパスできません' }
    }

    console.log(`プレイヤー${currentPlayerId}がパスしました`)
    this.passCount++

    // 全プレイヤーがパスした場合はゲーム終了
    if (this.passCount >= this.players.length) {
      this.gamePhase = 'finished'
      const result = this.rules.determineWinner(this.players.length)
      return {
        success: true,
        message: 'パスしました',
        gameOver: true,
        result
      }
    }

    // 次のプレイヤーに移る
    this.nextTurn()

    return {
      success: true,
      message: 'パスしました',
      gameOver: false,
      currentPlayer: this.getCurrentPlayer()
    }
  }

  /**
   * 次のプレイヤーにターンを移す
   */
  nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    console.log(`現在のプレイヤー: ${this.getCurrentPlayer().name}`)
  }

  /**
   * ゲーム終了をチェック
   * @returns {Object} ゲーム終了判定結果
   */
  checkGameOver() {
    const isGameOver = this.rules.isGameOver(this.players.length)

    if (isGameOver) {
      const result = this.rules.determineWinner(this.players.length)
      return { isGameOver: true, result }
    }

    return { isGameOver: false, result: null }
  }

  /**
   * 現在のプレイヤーの有効手を取得
   * @returns {Array} 有効手の配列
   */
  getCurrentPlayerValidMoves() {
    const currentPlayerId = this.getCurrentPlayerId()
    if (currentPlayerId === 0) return []
    return this.rules.getValidMoves(currentPlayerId)
  }

  /**
   * ゲーム統計を取得
   * @returns {Object} ゲーム統計
   */
  getGameStats() {
    return {
      totalMoves: this.totalMoves,
      currentTurn: this.totalMoves + 1,
      passCount: this.passCount,
      pieceCounts: this.board.getAllPieceCounts(this.players.length),
      currentPlayer: this.getCurrentPlayer(),
      gamePhase: this.gamePhase,
      playerCount: this.players.length
    }
  }

  /**
   * ゲーム状態をリセット
   */
  resetGame() {
    this.playerManager = new PlayerManager()
    this.board = new Board()
    this.rules = new GameRules(this.board)

    this.currentScreen = 'home'
    this.gamePhase = 'setup'
    this.currentPlayerIndex = 0
    this.players = []
    this.gameStarted = false

    this.moveHistory = []
    this.passCount = 0
    this.totalMoves = 0

    console.log('ゲーム状態をリセットしました')
  }

  /**
   * 画面を変更
   * @param {string} screen - 画面名 ('home' | 'game' | 'result')
   */
  setCurrentScreen(screen) {
    this.currentScreen = screen
    console.log(`画面切り替え: ${screen}`)
  }

  /**
   * ボード状態を取得
   * @returns {number[][]} ボード配列
   */
  getBoardState() {
    return this.board.getBoardState()
  }

  /**
   * 手履歴を取得
   * @returns {Array} 手履歴
   */
  getMoveHistory() {
    return [...this.moveHistory]
  }
}