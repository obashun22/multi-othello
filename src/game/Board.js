/**
 * ボードクラス - 10x10のオセロボードを管理
 */
export class Board {
  constructor() {
    this.size = 10
    this.cells = this.initializeBoard()
  }

  /**
   * ボードを初期化（空の10x10グリッド）
   * @returns {number[][]} 初期化されたボード配列
   */
  initializeBoard() {
    const board = []
    for (let row = 0; row < this.size; row++) {
      board[row] = []
      for (let col = 0; col < this.size; col++) {
        board[row][col] = 0 // 0 = 空のセル
      }
    }
    return board
  }

  /**
   * オセロの初期配置をセット（中央2x2に石を配置）
   * @param {number} playerCount - プレイヤー数
   */
  setupInitialPieces(playerCount) {
    const center = Math.floor(this.size / 2)

    if (playerCount === 2) {
      // 2人の場合は従来通り
      this.cells[center - 1][center - 1] = 1   // 左上: プレイヤー1
      this.cells[center - 1][center] = 2       // 右上: プレイヤー2
      this.cells[center][center - 1] = 2       // 左下: プレイヤー2
      this.cells[center][center] = 1           // 右下: プレイヤー1
    } else {
      // 3人以上の場合はより多くの初期石を配置（10x10ボード対応）
      // 中央6x6エリアに各プレイヤーの石を配置
      const positions = [
        // 中央2x2 (コア)
        [center - 1, center - 1], [center - 1, center],
        [center, center - 1], [center, center],
        // 内側リング
        [center - 2, center - 1], [center - 2, center],
        [center + 1, center - 1], [center + 1, center],
        [center - 1, center - 2], [center, center - 2],
        [center - 1, center + 1], [center, center + 1],
        // 外側リング（より多くの初期石）
        [center - 2, center - 2], [center - 2, center + 1],
        [center + 1, center - 2], [center + 1, center + 1],
        [center - 3, center - 1], [center - 3, center],
        [center + 2, center - 1], [center + 2, center],
        [center - 1, center - 3], [center, center - 3],
        [center - 1, center + 2], [center, center + 2]
      ]

      // 各プレイヤーに最低3個の石を保証（順番に配置）
      for (let i = 0; i < Math.min(positions.length, playerCount * 3); i++) {
        const playerId = (i % playerCount) + 1
        const [row, col] = positions[i]
        this.cells[row][col] = playerId
      }
    }

    console.log('初期配置完了:', this.getBoardState())
  }

  /**
   * 指定された位置にプレイヤーの石を配置
   * @param {number} row - 行 (0-9)
   * @param {number} col - 列 (0-9)
   * @param {number} playerId - プレイヤーID
   * @returns {boolean} 配置成功かどうか
   */
  placePiece(row, col, playerId) {
    // 範囲チェック
    if (!this.isValidPosition(row, col)) {
      return false
    }

    // 空のセルかチェック
    if (this.cells[row][col] !== 0) {
      return false
    }

    this.cells[row][col] = playerId
    return true
  }

  /**
   * 指定された位置の石を強制的に変更（反転用）
   * @param {number} row - 行 (0-9)
   * @param {number} col - 列 (0-9)
   * @param {number} playerId - プレイヤーID
   * @returns {boolean} 変更成功かどうか
   */
  setPiece(row, col, playerId) {
    // 範囲チェック
    if (!this.isValidPosition(row, col)) {
      return false
    }

    this.cells[row][col] = playerId
    return true
  }

  /**
   * 指定された位置が有効かチェック
   * @param {number} row - 行
   * @param {number} col - 列
   * @returns {boolean} 有効な位置かどうか
   */
  isValidPosition(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size
  }

  /**
   * 指定された位置のセル内容を取得
   * @param {number} row - 行
   * @param {number} col - 列
   * @returns {number} セルの値 (0=空, 1-8=プレイヤーID)
   */
  getCell(row, col) {
    if (!this.isValidPosition(row, col)) {
      return -1
    }
    return this.cells[row][col]
  }

  /**
   * 指定されたプレイヤーの石の数をカウント
   * @param {number} playerId - プレイヤーID
   * @returns {number} 石の数
   */
  countPieces(playerId) {
    let count = 0
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.cells[row][col] === playerId) {
          count++
        }
      }
    }
    return count
  }

  /**
   * 全プレイヤーの石の数を取得
   * @param {number} playerCount - プレイヤー数
   * @returns {Object} プレイヤーID -> 石数のマッピング
   */
  getAllPieceCounts(playerCount) {
    const counts = {}
    for (let playerId = 1; playerId <= playerCount; playerId++) {
      counts[playerId] = this.countPieces(playerId)
    }
    return counts
  }

  /**
   * 空のセルの座標一覧を取得
   * @returns {Array<{row: number, col: number}>} 空セルの座標配列
   */
  getEmptyCells() {
    const emptyCells = []
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.cells[row][col] === 0) {
          emptyCells.push({ row, col })
        }
      }
    }
    return emptyCells
  }

  /**
   * ボードの現在の状態を取得
   * @returns {number[][]} ボード配列のコピー
   */
  getBoardState() {
    return this.cells.map(row => [...row])
  }

  /**
   * ボード状態をコンソールに出力（デバッグ用）
   */
  printBoard() {
    console.log('=== ボード状態 ===')
    console.log('  0 1 2 3 4 5 6 7 8 9')
    for (let row = 0; row < this.size; row++) {
      let rowStr = row + ' '
      for (let col = 0; col < this.size; col++) {
        const cell = this.cells[row][col]
        rowStr += (cell === 0 ? '·' : cell) + ' '
      }
      console.log(rowStr)
    }
    console.log('====================')
  }

  /**
   * ボードをクリア（全てのセルを空にする）
   */
  clear() {
    this.cells = this.initializeBoard()
  }

  /**
   * 指定された方向の隣接セルを取得
   * @param {number} row - 開始行
   * @param {number} col - 開始列
   * @param {number} dirRow - 方向ベクトル（行）
   * @param {number} dirCol - 方向ベクトル（列）
   * @returns {Array<{row: number, col: number, value: number}>} 方向上のセル情報配列
   */
  getCellsInDirection(row, col, dirRow, dirCol) {
    const cells = []
    let currentRow = row + dirRow
    let currentCol = col + dirCol

    while (this.isValidPosition(currentRow, currentCol)) {
      cells.push({
        row: currentRow,
        col: currentCol,
        value: this.cells[currentRow][currentCol]
      })
      currentRow += dirRow
      currentCol += dirCol
    }

    return cells
  }
}