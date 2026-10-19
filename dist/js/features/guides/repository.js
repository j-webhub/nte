import { DATABASE_NAME, DATABASE_VERSION, STORE_NAME } from "./config.js?v=20261020-filter-selection-color";

class IndexedDbGuideRepository {
  constructor() {
    this.database = null;
  }

  open() {
    if (this.database) return Promise.resolve(this.database);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME))
          database.createObjectStore(STORE_NAME, { keyPath: "id" });
      };
      request.onsuccess = () => {
        this.database = request.result;
        this.database.onversionchange = () => this.database.close();
        resolve(this.database);
      };
      request.onerror = () => reject(request.error || new Error("브라우저 저장소를 열지 못했습니다."));
      request.onblocked = () => reject(new Error("다른 탭이 저장소를 사용 중입니다. 해당 탭을 닫고 다시 시도해 주세요."));
    });
  }

  async list() {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      request.onerror = () => reject(request.error || new Error("게시글을 불러오지 못했습니다."));
    });
  }

  async get(id) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("게시글을 불러오지 못했습니다."));
    });
  }

  async save(post) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(post);
      transaction.oncomplete = () => resolve(post);
      transaction.onerror = () => reject(transaction.error || new Error("게시글을 저장하지 못했습니다."));
      transaction.onabort = () => reject(transaction.error || new Error("게시글 저장이 취소되었습니다."));
    });
  }

  async remove(id) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("게시글을 삭제하지 못했습니다."));
      transaction.onabort = () => reject(transaction.error || new Error("게시글 삭제가 취소되었습니다."));
    });
  }

  async importPosts(posts) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      posts.forEach((post) => store.put(post));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("백업 자료를 가져오지 못했습니다."));
      transaction.onabort = () => reject(transaction.error || new Error("백업 가져오기가 취소되었습니다."));
    });
  }
}

export const repository = new IndexedDbGuideRepository();
