import { $, showScreen } from '../utils/helpers.js'

/**
 * ホーム画面コンポーネント
 */
export class HomeScreen {
  constructor(gameState) {
    this.gameState = gameState
    this.container = $('#home-screen')
  }

  /**
   * ホーム画面を初期化
   */
  init() {
    this.render()
    this.attachEventListeners()
    console.log('ホーム画面を初期化しました')
  }

  /**
   * ホーム画面をレンダリング
   */
  render() {
    this.container.innerHTML = `
      <div class="home-content">
        <h2>プレイヤー数を選択してください</h2>
        <div class="player-count-section">
          <div class="player-count-selector">
            <div class="player-count-controls">
              <button id="decrease-players" class="count-button decrease">−</button>
              <input type="number" id="player-count" min="2" max="8" value="2" readonly>
              <button id="increase-players" class="count-button increase">+</button>
            </div>
          </div>
          <div id="player-preview" class="player-preview">
            <!-- プレイヤープレビューがここに表示される -->
          </div>
        </div>
        <div class="home-actions">
          <button id="start-game" class="game-button primary">ゲーム開始</button>
        </div>
      </div>
    `
  }

  /**
   * イベントリスナーを設定
   */
  attachEventListeners() {
    const playerCountInput = $('#player-count')
    const startGameButton = $('#start-game')
    const decreaseButton = $('#decrease-players')
    const increaseButton = $('#increase-players')

    // プレイヤー数入力の変更（リアルタイム更新）
    playerCountInput.addEventListener('input', () => {
      this.showPlayerPreview()
    })

    // プレイヤー数減少ボタン
    decreaseButton.addEventListener('click', () => {
      const currentValue = parseInt(playerCountInput.value)
      if (currentValue > 2) {
        playerCountInput.value = currentValue - 1
        this.showPlayerPreview()
      }
    })

    // プレイヤー数増加ボタン
    increaseButton.addEventListener('click', () => {
      const currentValue = parseInt(playerCountInput.value)
      if (currentValue < 8) {
        playerCountInput.value = currentValue + 1
        this.showPlayerPreview()
      }
    })

    // ゲーム開始ボタン
    startGameButton.addEventListener('click', () => {
      this.startGame()
    })

    // Enterキーでゲーム開始
    playerCountInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.startGame()
      }
    })

    // 初期表示
    this.showPlayerPreview()
  }

  /**
   * プレイヤープレビューを表示
   */
  showPlayerPreview() {
    const playerCount = parseInt($('#player-count').value)

    // バリデーション
    if (!this.validatePlayerCount(playerCount)) {
      return
    }

    try {
      // ゲーム状態を初期化（プレビューのため）
      const success = this.gameState.initGame(playerCount)
      if (!success) {
        console.error('ゲームの初期化に失敗しました')
        return
      }

      // プレビューを表示
      this.renderPlayerPreview(this.gameState.players)

    } catch (error) {
      console.error('プレビューエラー:', error)
    }
  }

  /**
   * プレイヤー数のバリデーション
   * @param {number} playerCount - プレイヤー数
   * @returns {boolean} 有効かどうか
   */
  validatePlayerCount(playerCount) {
    if (isNaN(playerCount)) {
      console.error('有効な数値を入力してください')
      return false
    }

    if (playerCount < 2 || playerCount > 8) {
      console.error('プレイヤー数は2人から8人の間で設定してください')
      return false
    }

    return true
  }

  /**
   * プレイヤープレビューをレンダリング
   * @param {Array} players - プレイヤー配列
   */
  renderPlayerPreview(players) {
    const previewContainer = $('#player-preview')

    let previewHTML = `
      <h3>${players.length}人でのプレイ</h3>
      <div class="player-colors">
    `

    players.forEach((player, index) => {
      previewHTML += `
        <div class="player-chip" style="background-color: ${player.color};">
          <span>${player.name}</span>
        </div>
      `
    })

    previewHTML += `
      </div>
      <div class="preview-info">
        <p>各プレイヤーは異なる色の石でプレイします</p>
      </div>
    `

    previewContainer.innerHTML = previewHTML
  }

  /**
   * プレビューをリセット
   */
  resetPreview() {
    const previewContainer = $('#player-preview')
    previewContainer.innerHTML = '<p>プレイヤー数を選択してください</p>'
  }

  /**
   * ゲームを開始
   */
  startGame() {
    const playerCount = parseInt($('#player-count').value)

    if (!this.validatePlayerCount(playerCount)) {
      return
    }

    try {
      // ゲームを初期化
      const success = this.gameState.initGame(playerCount)
      if (!success) {
        console.error('ゲームの開始に失敗しました')
        return
      }

      // ゲーム画面に遷移（グローバル関数を使用）
      if (window.navigateToScreen) {
        window.navigateToScreen('game')
      } else {
        showScreen('#game-screen')
        this.gameState.currentScreen = 'game'
      }

      console.log('ゲーム開始:', this.gameState.getGameStats())

    } catch (error) {
      console.error('ゲーム開始エラー:', error)
    }
  }

  /**
   * プレイヤー数を設定
   * @param {number} count - プレイヤー数
   */
  setPlayerCount(count) {
    if (count >= 2 && count <= 8) {
      $('#player-count').value = count
      this.resetPreview()
    }
  }

  /**
   * ホーム画面をリセット
   */
  reset() {
    $('#player-count').value = 2
    this.resetPreview()
  }

  /**
   * ホーム画面を表示
   */
  show() {
    showScreen('#home-screen')
    this.gameState.currentScreen = 'home'
  }
}