import { $, showScreen, showNotification } from '../utils/helpers.js'

/**
 * ゲーム画面コンポーネント
 */
export class GameScreen {
  constructor(gameState) {
    this.gameState = gameState
    this.container = $('#game-screen')
  }

  /**
   * ゲーム画面を初期化
   */
  init() {
    this.render()
    this.attachEventListeners()
    console.log('ゲーム画面を初期化しました')
  }

  /**
   * ゲーム画面をレンダリング
   */
  render() {
    this.container.innerHTML = `
      <div class="game-content">
        <div class="game-header">
          <h2>マルチプレイヤーオセロ</h2>
          <div class="game-controls">
            <button id="pass-turn" class="game-button secondary" disabled>パス</button>
            <button id="back-to-home" class="game-button secondary">ホームに戻る</button>
          </div>
        </div>

        <div class="game-info">
          <div class="score-board" id="score-board">
            <!-- スコアボードがここに表示される -->
          </div>
        </div>

        <div class="game-board">
          <div class="board-grid" id="board-grid">
            <!-- ゲームボードがここに表示される -->
          </div>
        </div>

        <div class="game-status">
          <p id="game-status-text">ゲームを開始しました</p>
        </div>
      </div>
    `
  }

  /**
   * イベントリスナーを設定
   */
  attachEventListeners() {
    const passButton = $('#pass-turn')
    const backButton = $('#back-to-home')

    // パスボタン
    passButton.addEventListener('click', () => {
      this.handlePass()
    })

    // ホームに戻るボタン
    backButton.addEventListener('click', () => {
      this.backToHome()
    })
  }

  /**
   * ゲーム画面を表示
   */
  show() {
    showScreen('#game-screen')
    this.gameState.currentScreen = 'game'
    this.updateDisplay()
  }

  /**
   * 画面表示を更新
   */
  updateDisplay() {
    if (this.gameState.gamePhase !== 'playing') {
      return
    }

    this.updateScoreBoard()
    this.updateBoard()
    this.updateGameStatus()
    this.updatePassButton()
  }

  /**
   * 現在のプレイヤー表示を更新（削除済み）
   */

  /**
   * スコアボードを更新
   */
  updateScoreBoard() {
    const scoreBoard = $('#score-board')
    const pieceCounts = this.gameState.board.getAllPieceCounts(this.gameState.players.length)
    const currentPlayer = this.gameState.getCurrentPlayer()

    let scoreBoardHTML = ''
    this.gameState.players.forEach(player => {
      const count = pieceCounts[player.id] || 0
      const isCurrentPlayer = currentPlayer && currentPlayer.id === player.id
      const highlightClass = isCurrentPlayer ? ' current-player-highlight' : ''

      scoreBoardHTML += `
        <div class="player-score${highlightClass}">
          <div class="player-score-color" style="background-color: ${player.color};"></div>
          <span class="player-name">${player.name}</span>
          <span class="player-score-count">${count}</span>
        </div>
      `
    })

    scoreBoard.innerHTML = scoreBoardHTML
  }

  /**
   * ゲームボードを更新
   */
  updateBoard() {
    const boardGrid = $('#board-grid')
    const boardState = this.gameState.getBoardState()
    const validMoves = this.gameState.getCurrentPlayerValidMoves()

    // ボードセルを作成
    let boardHTML = ''
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const cellValue = boardState[row][col]
        const isValidMove = validMoves.some(move => move.row === row && move.col === col)

        let cellClass = 'board-cell'
        if (isValidMove) {
          cellClass += ' valid-move'
        }

        let cellContent = ''
        if (cellValue !== 0) {
          const player = this.gameState.players.find(p => p.id === cellValue)
          if (player) {
            cellContent = `<div class="game-piece" style="background-color: ${player.color};"></div>`
          }
        }

        boardHTML += `
          <div class="${cellClass}" data-row="${row}" data-col="${col}">
            ${cellContent}
          </div>
        `
      }
    }

    boardGrid.innerHTML = boardHTML

    // セルクリックイベントを追加
    boardGrid.querySelectorAll('.board-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const row = parseInt(cell.dataset.row)
        const col = parseInt(cell.dataset.col)
        this.handleCellClick(row, col)
      })
    })
  }

  /**
   * ゲーム状況テキストを更新
   */
  updateGameStatus() {
    const statusText = $('#game-status-text')
    const currentPlayer = this.gameState.getCurrentPlayer()
    const validMoves = this.gameState.getCurrentPlayerValidMoves()

    if (validMoves.length === 0) {
      statusText.textContent = `有効な手がありません - パスが必要です`
    } else {
      statusText.textContent = `${validMoves.length}箇所に石を置けます`
    }
  }

  /**
   * パスボタンの状態を更新
   */
  updatePassButton() {
    const passButton = $('#pass-turn')
    const validMoves = this.gameState.getCurrentPlayerValidMoves()

    if (validMoves.length === 0) {
      passButton.disabled = false
      passButton.textContent = 'パス（必須）'
    } else {
      passButton.disabled = true
      passButton.textContent = 'パス'
    }
  }

  /**
   * セルクリック処理
   * @param {number} row - 行
   * @param {number} col - 列
   */
  handleCellClick(row, col) {
    if (this.gameState.gamePhase !== 'playing') {
      showNotification('ゲーム中ではありません', 'error')
      return
    }

    const result = this.gameState.makeMove(row, col)

    if (result.success) {
      showNotification('手を実行しました', 'success')

      if (result.gameOver) {
        this.handleGameOver(result.result)
      } else {
        this.updateDisplay()
      }
    } else {
      showNotification(result.message, 'error')
    }
  }

  /**
   * パス処理
   */
  handlePass() {
    if (this.gameState.gamePhase !== 'playing') {
      showNotification('ゲーム中ではありません', 'error')
      return
    }

    const result = this.gameState.pass()

    if (result.success) {
      showNotification('パスしました', 'info')

      if (result.gameOver) {
        this.handleGameOver(result.result)
      } else {
        this.updateDisplay()
      }
    } else {
      showNotification(result.message, 'error')
    }
  }

  /**
   * ゲーム終了処理
   * @param {Object} result - ゲーム結果
   */
  handleGameOver(result) {
    console.log('ゲーム終了:', result)

    // 結果画面に遷移
    if (window.navigateToScreen) {
      window.navigateToScreen('result')
    } else {
      showScreen('#result-screen')
      this.gameState.currentScreen = 'result'
    }

    // 結果画面に結果を渡す（グローバル変数経由で一時的に）
    window.gameResult = result

    showNotification('ゲーム終了！', 'success')
  }

  /**
   * ホームに戻る
   */
  backToHome() {
    const confirm = window.confirm('ゲームを終了してホームに戻りますか？')
    if (confirm) {
      this.gameState.resetGame()
      if (window.navigateToScreen) {
        window.navigateToScreen('home')
      } else {
        showScreen('#home-screen')
        this.gameState.currentScreen = 'home'
      }
      showNotification('ホーム画面に戻りました', 'info')
    }
  }

  /**
   * ゲーム画面をリセット
   */
  reset() {
    // 必要に応じて画面をクリア
    this.updateDisplay()
  }
}