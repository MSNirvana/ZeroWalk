/** 本地线索存储（首页联系表单 + 管理演示页） */
(function () {
  const { storageKey } = window.ZeroWalk;

  function readRecords() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  }

  function writeRecords(records) {
    localStorage.setItem(storageKey, JSON.stringify(records));
  }

  function createId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `zw-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function appendLead({ name, phone, need = "" }) {
    const records = readRecords();
    const record = {
      id: createId(),
      name,
      phone,
      need,
      roleType: "client",
      status: "new",
      source: "home-contact",
      createdAt: new Date().toISOString(),
    };
    records.unshift(record);
    writeRecords(records);
    return record;
  }

  window.ZeroWalkStorage = { readRecords, writeRecords, appendLead };
})();
