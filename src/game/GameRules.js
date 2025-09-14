/**
 * ゲームルールクラス - オセロのルール実装（マルチプレイヤー対応）
 */
export class GameRules {
  constructor(board) {
    this.board = board
    // 8方向の移動ベクトル
    this.directions = [
      [-1, -1], [-1, 0], [-1, 1],  // 上左、上、上右
      [0, -1],           [0, 1],    // 左、右
      [1, -1],  [1, 0],  [1, 1]     // 下左、下、下右
    ]
  }

  /**
   * 指定された位置が有効な手かチェック
   * @param {number} row - 行
   * @param {number} col - 列
   * @param {number} playerId - プレイヤーID
   * @returns {boolean} 有効な手かどうか
   */
  isValidMove(row, col, playerId) {
    // セルが空でない場合は無効
    if (this.board.getCell(row, col) !== 0) {
      return false
    }

    // いずれかの方向で石を挟めるかチェック
    for (const [dirRow, dirCol] of this.directions) {
      if (this.canFlipInDirection(row, col, dirRow, dirCol, playerId)) {
        return true
      }
    }

    return false
  }

  /**
   * 指定された方向で石を挟むことができるかチェック
   * @param {number} startRow - 開始行
   * @param {number} startCol - 開始列
   * @param {number} dirRow - 方向ベクトル（行）
   * @param {number} dirCol - 方向ベクトル（列）
   * @param {number} playerId - プレイヤーID
   * @returns {boolean} 挟むことができるか
   */
  canFlipInDirection(startRow, startCol, dirRow, dirCol, playerId) {
    let currentRow = startRow + dirRow
    let currentCol = startCol + dirCol
    let hasOpponentPieces = false

    // 方向に沿って確認
    while (this.board.isValidPosition(currentRow, currentCol)) {
      const cellValue = this.board.getCell(currentRow, currentCol)

      // 空のセルに到達したら挟むことはできない
      if (cellValue === 0) {
        return false
      }

      // 自分の石に到達した場合
      if (cellValue === playerId) {
        // 途中に他のプレイヤーの石があった場合のみ有効
        return hasOpponentPieces
      }

      // 他のプレイヤーの石
      hasOpponentPieces = true
      currentRow += dirRow
      currentCol += dirCol
    }

    // ボードの端に到達した場合は挟むことはできない
    return false
  }

  /**
   * 指定されたプレイヤーの全有効手を取得
   * @param {number} playerId - プレイヤーID
   * @returns {Array<{row: number, col: number}>} 有効手の配列
   */
  getValidMoves(playerId) {
    const validMoves = []

    for (let row = 0; row < this.board.size; row++) {
      for (let col = 0; col < this.board.size; col++) {
        if (this.isValidMove(row, col, playerId)) {
          validMoves.push({ row, col })
        }
      }
    }

    return validMoves
  }

  /**
   * 石を配置して、挟んだ石を裏返す
   * @param {number} row - 行
   * @param {number} col - 列
   * @param {number} playerId - プレイヤーID
   * @returns {boolean} 成功したかどうか
   */
  makeMove(row, col, playerId) {
    // 有効な手でない場合は失敗
    if (!this.isValidMove(row, col, playerId)) {
      console.log(`無効な手: (${row}, ${col}) プレイヤー${playerId}`)
      return false
    }

    console.log(`手を実行: (${row}, ${col}) プレイヤー${playerId}`)

    // 石を配置
    this.board.placePiece(row, col, playerId)
    console.log(`石を配置完了: (${row}, ${col})`)

    // 全方向で石を裏返す
    let totalFlipped = 0
    for (const [dirRow, dirCol] of this.directions) {
      const flipped = this.flipPiecesInDirection(row, col, dirRow, dirCol, playerId)
      if (flipped > 0) {
        console.log(`方向(${dirRow}, ${dirCol})で${flipped}個の石を裏返しました`)
        totalFlipped += flipped
      }
    }

    console.log(`合計${totalFlipped}個の石を裏返しました`)
    return true
  }

  /**
   * 指定された方向の石を裏返す
   * @param {number} startRow - 開始行
   * @param {number} startCol - 開始列
   * @param {number} dirRow - 方向ベクトル（行）
   * @param {number} dirCol - 方向ベクトル（列）
   * @param {number} playerId - プレイヤーID
   */
  flipPiecesInDirection(startRow, startCol, dirRow, dirCol, playerId) {
    if (!this.canFlipInDirection(startRow, startCol, dirRow, dirCol, playerId)) {
      return 0
    }

    let currentRow = startRow + dirRow
    let currentCol = startCol + dirCol
    let flippedCount = 0

    console.log(`方向(${dirRow}, ${dirCol})で石を裏返し開始`)

    // 自分の石に到達するまで全ての石を裏返す
    while (this.board.isValidPosition(currentRow, currentCol)) {
      const cellValue = this.board.getCell(currentRow, currentCol)

      if (cellValue === playerId) {
        break
      }

      // 他のプレイヤーの石を自分の石に変更
      console.log(`石を裏返し: (${currentRow}, ${currentCol}) ${cellValue} → ${playerId}`)
      this.board.setPiece(currentRow, currentCol, playerId)
      flippedCount++
      currentRow += dirRow
      currentCol += dirCol
    }

    return flippedCount
  }

  /**
   * 指定されたプレイヤーがパスすべきかチェック（有効手がない場合）
   * @param {number} playerId - プレイヤーID
   * @returns {boolean} パスすべきかどうか
   */
  shouldPass(playerId) {
    return this.getValidMoves(playerId).length === 0
  }

  /**
   * ゲームが終了しているかチェック
   * @param {number} playerCount - プレイヤー数
   * @returns {boolean} ゲームが終了しているか
   */
  isGameOver(playerCount) {
    // 全プレイヤーが有効手を持たない場合はゲーム終了
    for (let playerId = 1; playerId <= playerCount; playerId++) {
      if (!this.shouldPass(playerId)) {
        return false
      }
    }
    return true
  }

  /**
   * ゲームの勝者を判定
   * @param {number} playerCount - プレイヤー数
   * @returns {Object} 勝敗結果
   */
  determineWinner(playerCount) {
    const pieceCounts = this.board.getAllPieceCounts(playerCount)

    // 最大の石数を持つプレイヤーを見つける
    let maxCount = 0
    let winners = []

    for (let playerId = 1; playerId <= playerCount; playerId++) {
      const count = pieceCounts[playerId]
      if (count > maxCount) {
        maxCount = count
        winners = [playerId]
      } else if (count === maxCount) {
        winners.push(playerId)
      }
    }

    return {
      winners,
      pieceCounts,
      isDraw: winners.length > 1
    }
  }

  /**
   * 指定された手の結果をシミュレート（実際にボードを変更せずに結果を予測）
   * @param {number} row - 行
   * @param {number} col - 列
   * @param {number} playerId - プレイヤーID
   * @returns {number} 裏返せる石の数
   */
  simulateMove(row, col, playerId) {
    if (!this.isValidMove(row, col, playerId)) {
      return 0
    }

    let flippedCount = 0

    for (const [dirRow, dirCol] of this.directions) {
      flippedCount += this.countFlippablePiecesInDirection(row, col, dirRow, dirCol, playerId)
    }

    return flippedCount
  }

  /**
   * 指定された方向で裏返せる石の数をカウント
   * @param {number} startRow - 開始行
   * @param {number} startCol - 開始列
   * @param {number} dirRow - 方向ベクトル（行）
   * @param {number} dirCol - 方向ベクトル（列）
   * @param {number} playerId - プレイヤーID
   * @returns {number} 裏返せる石の数
   */
  countFlippablePiecesInDirection(startRow, startCol, dirRow, dirCol, playerId) {
    if (!this.canFlipInDirection(startRow, startCol, dirRow, dirCol, playerId)) {
      return 0
    }

    let count = 0
    let currentRow = startRow + dirRow
    let currentCol = startCol + dirCol

    while (this.board.isValidPosition(currentRow, currentCol)) {
      const cellValue = this.board.getCell(currentRow, currentCol)

      if (cellValue === playerId) {
        break
      }

      count++
      currentRow += dirRow
      currentCol += dirCol
    }

    return count
  }
}