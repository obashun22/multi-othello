# マルチプレイヤーオセロ - 設計仕様書

## アーキテクチャ概要

### 全体設計方針

- **フロントエンドオンリー**: サーバーサイド不要のクライアントサイドアプリケーション
- **モジュラー設計**: 機能別にコンポーネントを分離
- **状態管理**: 単一の状態ツリーでゲーム状態を管理
- **レスポンシブデザイン**: CSS Grid/Flexbox を活用した柔軟なレイアウト

## 技術スタック

### 開発環境

- **ビルドツール**: Vite
- **パッケージマネージャー**: npm
- **開発サーバー**: Vite Dev Server (HMR 対応)

### フロントエンド技術

- **マークアップ**: HTML5
- **スタイリング**: CSS3 (CSS Grid, Flexbox, CSS Variables)
- **スクリプト**: JavaScript (ES6+)
- **モジュールシステム**: ES Modules

### 開発ツール

- **リンター**: ESLint (推奨)
- **フォーマッター**: Prettier (推奨)
- **ブラウザ開発ツール**: DevTools 対応

## プロジェクト構造

```
multi_othello/
├── index.html              # メインHTMLファイル
├── package.json           # プロジェクト設定・依存関係
├── vite.config.js         # Vite設定ファイル
├── docs/                  # ドキュメント
│   ├── requirements.md
│   └── designs.md
├── src/                   # ソースコード
│   ├── main.js           # エントリーポイント
│   ├── styles/           # スタイルシート
│   │   ├── main.css      # メインスタイル
│   │   ├── variables.css # CSS変数（カラーパレット等）
│   │   └── components.css # コンポーネント別スタイル
│   ├── components/       # UIコンポーネント
│   │   ├── HomeScreen.js # ホーム画面
│   │   ├── GameScreen.js # プレイ画面
│   │   └── ResultScreen.js # 結果画面
│   ├── game/            # ゲームロジック
│   │   ├── GameState.js # ゲーム状態管理
│   │   ├── Board.js     # ボード管理
│   │   ├── Player.js    # プレイヤー管理
│   │   └── GameRules.js # ルール実装
│   └── utils/           # ユーティリティ
│       ├── colors.js    # 色管理
│       └── helpers.js   # 汎用ヘルパー
└── public/             # 静的ファイル
    └── favicon.ico
```

## コンポーネント設計

### 画面コンポーネント

#### HomeScreen.js

- **責務**: プレイヤー数選択、ゲーム開始
- **状態**: 選択されたプレイヤー数
- **イベント**: プレイヤー数変更、ゲーム開始

#### GameScreen.js

- **責務**: ゲームボード表示、プレイ進行管理
- **状態**: ボード状態、現在のプレイヤー、石数
- **イベント**: セルクリック、ターン進行

#### ResultScreen.js

- **責務**: 結果表示、リプレイ機能
- **状態**: 最終スコア、勝者情報
- **イベント**: ホーム画面遷移、リプレイ

### ゲームロジックコンポーネント

#### GameState.js

```javascript
class GameState {
  - players: Player[]
  - board: Board
  - currentPlayerIndex: number
  - gamePhase: 'setup' | 'playing' | 'finished'

  + initGame(playerCount: number): void
  + nextTurn(): void
  + checkGameEnd(): boolean
  + getWinner(): Player
}
```

#### Board.js

```javascript
class Board {
  - cells: number[][] // 8x8 grid, プレイヤーIDで管理

  + placePiece(row: number, col: number, playerId: number): boolean
  + getValidMoves(playerId: number): Position[]
  + flipPieces(row: number, col: number, playerId: number): void
  + countPieces(playerId: number): number
}
```

#### Player.js

```javascript
class Player {
  - id: number
  - color: string
  - name: string

  + constructor(id: number, color: string): Player
}
```

## 状態管理設計

### ゲーム状態構造

```javascript
const gameState = {
  // ゲーム設定
  playerCount: 2,
  players: [],

  // ゲーム進行
  currentScreen: "home", // 'home' | 'game' | 'result'
  gamePhase: "setup", // 'setup' | 'playing' | 'finished'
  currentPlayerIndex: 0,

  // ボード状態
  board: Array(8)
    .fill()
    .map(() => Array(8).fill(0)),

  // 結果
  scores: {},
  winner: null,
};
```

### 状態更新パターン

- **イミュータブル更新**: 状態は常に新しいオブジェクトで置換
- **単一責任**: 各関数は特定の状態変更のみを担当
- **バリデーション**: 状態変更前に有効性をチェック

## UI/UX デザイン設計

### デザインシステム

#### カラーパレット

```css
:root {
  /* メインカラー（任天堂風の赤） */
  --primary-red: #e60012;
  --primary-red-dark: #cc000f;
  --primary-red-light: #ff1a2e;

  /* セカンダリカラー */
  --white: #ffffff;
  --gray-light: #f5f5f5;
  --gray-medium: #cccccc;
  --gray-dark: #666666;
  --black: #000000;

  /* プレイヤーカラー */
  --player-colors: #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd,
    #98d8c8, #f7dc6f;
}
```

#### タイポグラフィ

- **フォント**: システムフォント（San Francisco, Segoe UI, Roboto）
- **サイズ**: モジュラースケール使用
- **ウェイト**: 400（Regular）、600（SemiBold）、700（Bold）

#### コンポーネントスタイル

- **ボタン**: 丸角（border-radius: 8px）、ホバー効果
- **カード**: 軽いシャドウ、丸角（border-radius: 12px）
- **ボード**: グリッド表示、セルの視覚的フィードバック

### レスポンシブデザイン

- **ブレークポイント**: 768px（タブレット）、1024px（デスクトップ）
- **ボードサイズ**: 画面サイズに応じて動的調整
- **タッチ対応**: タップ・スワイプ操作サポート

## パフォーマンス設計

### 最適化戦略

- **バンドルサイズ**: Tree shaking 活用で不要コード除去
- **レンダリング**: 必要最小限の再描画
- **メモリ**: 適切なオブジェクト破棄でメモリリーク防止

### 開発時の考慮事項

- **HMR**: 開発時の高速フィードバックループ
- **ソースマップ**: デバッグ用の正確な行番号表示
- **ESLint 設定**: コード品質の自動チェック
