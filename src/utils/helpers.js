/**
 * ユーティリティ関数 - DOM操作やイベント管理のヘルパー
 */

/**
 * 要素を取得
 * @param {string} selector - セレクタ
 * @returns {Element|null} 要素
 */
export function $(selector) {
  return document.querySelector(selector)
}

/**
 * 複数要素を取得
 * @param {string} selector - セレクタ
 * @returns {NodeList} 要素のリスト
 */
export function $$(selector) {
  return document.querySelectorAll(selector)
}

/**
 * 要素を作成
 * @param {string} tag - タグ名
 * @param {Object} options - オプション
 * @returns {Element} 作成された要素
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag)

  if (options.className) {
    element.className = options.className
  }

  if (options.id) {
    element.id = options.id
  }

  if (options.innerHTML) {
    element.innerHTML = options.innerHTML
  }

  if (options.textContent) {
    element.textContent = options.textContent
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
  }

  if (options.style) {
    Object.entries(options.style).forEach(([key, value]) => {
      element.style[key] = value
    })
  }

  return element
}

/**
 * 画面を表示
 * @param {string} screenId - 画面ID
 */
export function showScreen(screenId) {
  // 全ての画面を非表示
  $$('.screen').forEach(screen => {
    screen.classList.add('hidden')
  })

  // 指定された画面を表示
  const targetScreen = $(screenId)
  if (targetScreen) {
    targetScreen.classList.remove('hidden')
  }

  console.log(`画面切り替え: ${screenId}`)
}

/**
 * ローディング状態を切り替え
 * @param {boolean} loading - ローディング状態
 * @param {string} message - ローディングメッセージ
 */
export function setLoading(loading, message = 'Loading...') {
  let loadingEl = $('#loading')

  if (loading) {
    if (!loadingEl) {
      loadingEl = createElement('div', {
        id: 'loading',
        className: 'loading-overlay',
        innerHTML: `
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
          </div>
        `
      })
      document.body.appendChild(loadingEl)
    }
    loadingEl.style.display = 'flex'
  } else {
    if (loadingEl) {
      loadingEl.style.display = 'none'
    }
  }
}


/**
 * 遅延実行
 * @param {number} ms - 遅延時間（ミリ秒）
 * @returns {Promise} Promise
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 深いオブジェクトのコピー
 * @param {any} obj - コピー対象
 * @returns {any} コピーされたオブジェクト
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }

  if (typeof obj === 'object') {
    const cloned = {}
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key])
    })
    return cloned
  }
}

/**
 * 配列をシャッフル
 * @param {Array} array - 配列
 * @returns {Array} シャッフルされた配列
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 範囲チェック
 * @param {number} value - 値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {boolean} 範囲内かどうか
 */
export function inRange(value, min, max) {
  return value >= min && value <= max
}

/**
 * 値をクランプ
 * @param {number} value - 値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number} クランプされた値
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * デバウンス関数
 * @param {Function} func - 実行する関数
 * @param {number} delay - 遅延時間
 * @returns {Function} デバウンスされた関数
 */
export function debounce(func, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}