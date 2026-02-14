/** LRU（Least Recently Used）キャッシュ実装。指定量を超過した場合は古いものから順に削除 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxEntries: number;

  constructor(maxEntries: number) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
  }

  /** 値を取り出し、使用順を更新する */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    // Mapは挿入順を保持するため、再挿入で「最近使われた」扱いにする
    this.cache.delete(key);
    if (value !== undefined) {
      this.cache.set(key, value);
    }
    return value;
  }

  /** 値を追加・更新し、容量超過なら最古の要素を削除する */
  set(key: K, value: V): void {
    // 既存キーの場合は順序を更新するため削除してから再挿入
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);
    if (this.cache.size > this.maxEntries) {
      // size > maxEntries ensures at least one entry exists
      const oldestKey = this.cache.keys().next().value as K;
      this.cache.delete(oldestKey);
    }
  }
}
