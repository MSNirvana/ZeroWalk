const { readRecords } = window.ZeroWalkStorage;

function formatDate(value) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleLabel(roleType) {
  if (roleType === "partner") return "合作伙伴申请";
  if (roleType === "referral") return "推荐客户";
  return "潜在客户";
}

function renderRecordList(records) {
  const mount = document.querySelector("#record-list");
  if (!records.length) {
    mount.innerHTML = "<li>还没有提交记录。可在首页汇聚后通过「联系我们」提交线索。</li>";
    return;
  }

  mount.innerHTML = records
    .map(
      (record, index) => `
        <li>
          <button class="record-button ${index === 0 ? "active" : ""}" data-record-id="${record.id}">
            <strong>${record.name || "未命名"}</strong>
            <div>${record.company || record.companyName || "未填写公司"} · ${roleLabel(record.roleType)}</div>
            <div>${record.city || "未填写城市"} · ${formatDate(record.createdAt)}</div>
          </button>
        </li>
      `,
    )
    .join("");
}

function renderSummary(records) {
  const stats = {
    total: records.length,
    client: records.filter((item) => item.roleType === "client").length,
    partner: records.filter((item) => item.roleType === "partner").length,
  };

  document.querySelector("#stat-total").textContent = String(stats.total);
  document.querySelector("#stat-client").textContent = String(stats.client);
  document.querySelector("#stat-partner").textContent = String(stats.partner);
}

function renderDetail(record) {
  const mount = document.querySelector("#record-detail");
  if (!record) {
    mount.innerHTML = "<p>暂无记录。</p>";
    return;
  }

  const rows = Object.entries(record)
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .map(
      ([key, value]) => `
        <tr>
          <th>${key}</th>
          <td>${String(value).replace(/\n/g, "<br />")}</td>
        </tr>
      `,
    )
    .join("");

  mount.innerHTML = `
    <div class="status-pill">${roleLabel(record.roleType)} · ${record.status}</div>
    <div class="table-wrap" style="margin-top: 1rem;">
      <table>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector("#record-list")) return;

  const records = readRecords();
  renderSummary(records);
  renderRecordList(records);
  renderDetail(records[0]);

  document.querySelector("#record-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-record-id]");
    if (!button) return;
    const record = records.find((item) => item.id === button.dataset.recordId);
    document.querySelectorAll(".record-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderDetail(record);
  });
});
