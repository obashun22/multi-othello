import './styles/main.css'
import { GameState } from './game/GameState.js'
import { HomeScreen } from './components/HomeScreen.js'
import { GameScreen } from './components/GameScreen.js'
import { ResultScreen } from './components/ResultScreen.js'
import { showNotification, showScreen } from './utils/helpers.js'

console.log('マルチプレイヤーオセロ - 開発開始！')

// ゲーム状態管理とコンポーネントの初期化
const gameState = new GameState()
let homeScreen, gameScreen, resultScreen

// 画面遷移の管理
function navigateToScreen(screen) {
  console.log(`画面遷移: ${screen}`)

  // GameStateの内部状態のみ更新（無限ループを防ぐ）
  gameState.currentScreen = screen

  // 適切な画面を表示
  switch (screen) {
    case 'home':
      showScreen('#home-screen')
      break
    case 'game':
      showScreen('#game-screen')
      if (gameScreen) gameScreen.updateDisplay()
      break
    case 'result':
      showScreen('#result-screen')
      if (resultScreen) resultScreen.updateDisplay()
      break
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - コンポーネント初期化開始')

  try {
    // すべてのコンポーネントを初期化
    homeScreen = new HomeScreen(gameState)
    gameScreen = new GameScreen(gameState)
    resultScreen = new ResultScreen(gameState)

    homeScreen.init()
    gameScreen.init()
    resultScreen.init()

    // ホーム画面から開始
    navigateToScreen('home')

    showNotification('マルチプレイヤーオセロが起動しました！', 'success')
    console.log('すべてのコンポーネントが正常に初期化されました')

    // デバッグ用のグローバル変数と画面遷移関数
    window.gameState = gameState
    window.homeScreen = homeScreen
    window.gameScreen = gameScreen
    window.resultScreen = resultScreen
    window.navigateToScreen = navigateToScreen

  } catch (error) {
    console.error('初期化エラー:', error)
    showNotification('アプリケーションの初期化に失敗しました', 'error')
  }
})