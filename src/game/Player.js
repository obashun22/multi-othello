/**
 * プレイヤークラス - 各プレイヤーの情報を管理
 */
export class Player {
  constructor(id, name = null) {
    this.id = id
    this.name = name || `プレイヤー${id}`
    this.color = this.getPlayerColor(id)
  }

  /**
   * プレイヤーIDに基づいて色を取得
   * @param {number} playerId - プレイヤーID (1-8)
   * @returns {string} CSS カラーコード
   */
  getPlayerColor(playerId) {
    const colors = [
      '#FF4757', // 明確な赤
      '#2F80ED', // 明確な青
      '#27AE60', // 明確な緑
      '#FF9500', // 明確なオレンジ
      '#8E44AD', // 明確な紫
      '#F1C40F', // 明確な黄色
      '#E91E63', // 明確なピンク
      '#607D8B'  // 明確なグレー
    ]

    // プレイヤーIDは1から始まるので、配列のインデックスに合わせるため-1
    return colors[(playerId - 1) % colors.length]
  }

  /**
   * プレイヤー情報をJSON形式で取得
   * @returns {Object} プレイヤー情報
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color
    }
  }
}

/**
 * プレイヤー管理クラス - 複数プレイヤーの管理
 */
export class PlayerManager {
  constructor() {
    this.players = []
    this.maxPlayers = 8
    this.minPlayers = 2
  }

  /**
   * 指定された人数のプレイヤーを初期化
   * @param {number} playerCount - プレイヤー数 (2-8)
   */
  initializePlayers(playerCount) {
    // バリデーション
    if (playerCount < this.minPlayers || playerCount > this.maxPlayers) {
      throw new Error(`プレイヤー数は${this.minPlayers}人から${this.maxPlayers}人の間で設定してください`)
    }

    // プレイヤー配列をクリア
    this.players = []

    // 指定された人数のプレイヤーを作成
    for (let i = 1; i <= playerCount; i++) {
      this.players.push(new Player(i))
    }

    console.log(`${playerCount}人のプレイヤーを初期化しました:`, this.players.map(p => p.toJSON()))
    return this.players
  }

  /**
   * プレイヤー取得
   * @param {number} playerId - プレイヤーID
   * @returns {Player|null} プレイヤーオブジェクト
   */
  getPlayer(playerId) {
    return this.players.find(player => player.id === playerId) || null
  }

  /**
   * 全プレイヤー取得
   * @returns {Player[]} プレイヤー配列
   */
  getAllPlayers() {
    return this.players
  }

  /**
   * プレイヤー数取得
   * @returns {number} プレイヤー数
   */
  getPlayerCount() {
    return this.players.length
  }

  /**
   * プレイヤーの色一覧を取得（CSS変数形式）
   * @returns {string[]} 色の配列
   */
  getPlayerColors() {
    return this.players.map(player => player.color)
  }
}