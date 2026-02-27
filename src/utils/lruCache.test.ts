import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache } from './lruCache';

describe('LRUCache', () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>(3);
  });

  describe('取得と設定', () => {
    it('値の保存と取得が可能である', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
    });

    it('存在しないキーに対してはundefinedが返却される', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('既存の値が更新可能である', () => {
      cache.set('a', 1);
      cache.set('a', 10);
      expect(cache.get('a')).toBe(10);
    });
  });

  describe('LRU削除', () => {
    it('容量超過時は最も古い要素から削除される', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // 'a'を削除

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('get時にアクセス順が更新される', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.get('a'); // 'a'が最近使用された状態になる

      cache.set('d', 4); // 'a'でなく'b'を削除

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('既存キーのset時にアクセス順が更新される', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.set('a', 10); // 'a'が最近使用された状態になる

      cache.set('d', 4); // 'a'でなく'b'を削除

      expect(cache.get('a')).toBe(10);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });
  });

  describe('エッジケース', () => {
    it('容量を1に設定可能', () => {
      const smallCache = new LRUCache<string, number>(1);
      smallCache.set('a', 1);
      smallCache.set('b', 2);

      expect(smallCache.get('a')).toBeUndefined();
      expect(smallCache.get('b')).toBe(2);
    });

    it('複雑な使用パターンも処理可能', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.get('a');
      cache.set('c', 3);
      cache.get('b');
      cache.set('d', 4); // 'a'を削除

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('undefined値を保存できる', () => {
      const cacheWithUndefined = new LRUCache<string, number | undefined>(3);
      cacheWithUndefined.set('a', undefined);
      cacheWithUndefined.set('b', 2);

      // undefinedが明示的に保存された場合でも取得可能
      expect(cacheWithUndefined.get('a')).toBeUndefined();
      expect(cacheWithUndefined.get('a')).toBeUndefined();
      expect(cacheWithUndefined.get('b')).toBe(2);
    });

    it('undefined値をgetしてもエントリが消えない', () => {
      const cacheWithUndefined = new LRUCache<string, number | undefined>(2);
      cacheWithUndefined.set('a', undefined);
      cacheWithUndefined.set('b', 2);

      cacheWithUndefined.get('a');
      cacheWithUndefined.set('c', 3);

      expect(cacheWithUndefined.get('a')).toBeUndefined();
      expect(cacheWithUndefined.get('b')).toBeUndefined();
      expect(cacheWithUndefined.get('c')).toBe(3);
    });

    it('clearで全要素を削除できる', () => {
      cache.set('a', 1);
      cache.set('b', 2);

      cache.clear();

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
    });
  });
});
