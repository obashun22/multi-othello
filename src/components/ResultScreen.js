import { $, showScreen, showNotification } from '../utils/helpers.js'

/**
 * 結果画面コンポーネント
 */
export class ResultScreen {
  constructor(gameState) {
    this.gameState = gameState
    this.container = $('#result-screen')
    this.result = null
  }

  /**
   * 結果画面を初期化
   */
  init() {
    this.render()
    this.attachEventListeners()
    console.log('結果画面を初期化しました')
  }

  /**
   * 結果画面をレンダリング
   */
  render() {
    this.container.innerHTML = `
      <div class="result-content">
        <div class="result-header">
          <h2>ゲーム結果</h2>
        </div>

        <div class="winner-announcement" id="winner-announcement">
          <!-- 勝者発表がここに表示される -->
        </div>

        <div class="final-scores">
          <h3>最終スコア</h3>
          <div class="score-ranking" id="score-ranking">
            <!-- ランキングがここに表示される -->
          </div>
        </div>

        <div class="game-stats" id="game-stats">
          <!-- ゲーム統計がここに表示される -->
        </div>

        <div class="result-actions">
          <button id="play-again" class="game-button primary">もう一度プレイ</button>
          <button id="back-to-home-result" class="game-button secondary">ホームに戻る</button>
        </div>
      </div>
    `
  }

  /**
   * イベントリスナーを設定
   */
  attachEventListeners() {
    const playAgainButton = $('#play-again')
    const backToHomeButton = $('#back-to-home-result')

    // もう一度プレイボタン
    playAgainButton.addEventListener('click', () => {
      this.playAgain()
    })

    // ホームに戻るボタン
    backToHomeButton.addEventListener('click', () => {
      this.backToHome()
    })
  }

  /**
   * 結果画面を表示
   * @param {Object} result - ゲーム結果
   */
  show(result) {
    this.result = result
    showScreen('#result-screen')
    this.gameState.currentScreen = 'result'
    this.updateDisplay()
  }

  /**
   * 結果表示を更新
   */
  updateDisplay() {
    if (!this.result) {
      // グローバル変数から結果を取得（一時的な対応）
      this.result = window.gameResult
    }

    if (!this.result) {
      console.error('ゲーム結果がありません')
      return
    }

    this.updateWinnerAnnouncement()
    this.updateScoreRanking()
    this.updateGameStats()
  }

  /**
   * 勝者発表を更新
   */
  updateWinnerAnnouncement() {
    const winnerElement = $('#winner-announcement')
    const { winners, isDraw, pieceCounts } = this.result

    let announcementHTML = ''

    if (isDraw) {
      // 引き分けの場合
      const winnerNames = winners.map(playerId => {
        const player = this.gameState.players.find(p => p.id === playerId)
        return player ? player.name : `プレイヤー${playerId}`
      })

      announcementHTML = `
        <div class="draw-announcement">
          <h3>🤝 引き分け！</h3>
          <p>${winnerNames.join('、')}が同点で勝利しました！</p>
          <div class="winner-colors">
            ${winners.map(playerId => {
              const player = this.gameState.players.find(p => p.id === playerId)
              return player ? `
                <div class="winner-chip" style="background-color: ${player.color};">
                  <span>${player.name}</span>
                  <span class="winner-score">${pieceCounts[playerId]}</span>
                </div>
              ` : ''
            }).join('')}
          </div>
        </div>
      `
    } else {
      // 単独勝者の場合
      const winnerId = winners[0]
      const winner = this.gameState.players.find(p => p.id === winnerId)
      const winnerScore = pieceCounts[winnerId]

      announcementHTML = `
        <div class="victory-announcement">
          <h3>🎉 勝者は ${winner.name}！</h3>
          <div class="winner-display">
            <div class="winner-chip-large" style="background-color: ${winner.color};">
              <span class="winner-name">${winner.name}</span>
              <span class="winner-score-large">${winnerScore}個</span>
            </div>
          </div>
          <p>おめでとうございます！</p>
        </div>
      `
    }

    winnerElement.innerHTML = announcementHTML
  }

  /**
   * スコアランキングを更新
   */
  updateScoreRanking() {
    const rankingElement = $('#score-ranking')
    const { pieceCounts } = this.result

    // プレイヤーをスコア順にソート
    const sortedPlayers = this.gameState.players
      .map(player => ({
        ...player,
        score: pieceCounts[player.id] || 0
      }))
      .sort((a, b) => b.score - a.score)

    let rankingHTML = ''
    sortedPlayers.forEach((player, index) => {
      const rank = index + 1
      let rankIcon = ''

      switch (rank) {
        case 1:
          rankIcon = '🥇'
          break
        case 2:
          rankIcon = '🥈'
          break
        case 3:
          rankIcon = '🥉'
          break
        default:
          rankIcon = `${rank}位`
      }

      rankingHTML += `
        <div class="rank-item">
          <span class="rank-position">${rankIcon}</span>
          <div class="player-info">
            <div class="player-color-small" style="background-color: ${player.color};"></div>
            <span class="player-name">${player.name}</span>
          </div>
          <span class="player-final-score">${player.score}個</span>
        </div>
      `
    })

    rankingElement.innerHTML = rankingHTML
  }

  /**
   * ゲーム統計を更新
   */
  updateGameStats() {
    const statsElement = $('#game-stats')
    const gameStats = this.gameState.getGameStats()

    const statsHTML = `
      <h3>ゲーム統計</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">総手数</span>
          <span class="stat-value">${gameStats.totalMoves}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">プレイヤー数</span>
          <span class="stat-value">${gameStats.playerCount}人</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">総石数</span>
          <span class="stat-value">${Object.values(this.result.pieceCounts).reduce((a, b) => a + b, 0)}個</span>
        </div>
      </div>
    `

    statsElement.innerHTML = statsHTML
  }

  /**
   * もう一度プレイ
   */
  playAgain() {
    // 同じプレイヤー数で新しいゲームを開始
    const playerCount = this.gameState.players.length

    try {
      const success = this.gameState.initGame(playerCount)
      if (!success) {
        showNotification('新しいゲームの開始に失敗しました', 'error')
        return
      }

      // ゲーム画面に遷移
      if (window.navigateToScreen) {
        window.navigateToScreen('game')
      } else {
        showScreen('#game-screen')
        this.gameState.currentScreen = 'game'
      }

      showNotification(`新しいゲームを開始しました！（${playerCount}人）`, 'success')

    } catch (error) {
      showNotification(error.message, 'error')
      console.error('リプレイエラー:', error)
    }
  }

  /**
   * ホームに戻る
   */
  backToHome() {
    this.gameState.resetGame()
    if (window.navigateToScreen) {
      window.navigateToScreen('home')
    } else {
      showScreen('#home-screen')
      this.gameState.currentScreen = 'home'
    }
    showNotification('ホーム画面に戻りました', 'info')
  }

  /**
   * 結果画面をリセット
   */
  reset() {
    this.result = null
    window.gameResult = null
  }
}