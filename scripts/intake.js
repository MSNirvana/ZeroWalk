const STORAGE_KEY = "zerowalk_intake_records";
const AUTH_KEY = "zerowalk_auth_profile";

const STEPS = [
  { id: "step-account", title: "进入登记", hint: "手机号与短信验证码" },
  { id: "step-role", title: "选择身份", hint: "客户、合作伙伴或推荐客户" },
  { id: "step-profile", title: "基础身份", hint: "你是谁，正在做什么" },
  { id: "step-business", title: "业务情况", hint: "问题、场景、配合度" },
  { id: "step-review", title: "确认提交", hint: "检查信息并进入跟进" },
];

let activeStep = 0;
let generatedCode = "";

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function readRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function updateStepState() {
  STEPS.forEach((step, index) => {
    const panel = qs(`#${step.id}`);
    if (panel) panel.classList.toggle("hidden", index !== activeStep);
  });

  qsa("[data-step-index]").forEach((item) => {
    const index = Number(item.dataset.stepIndex);
    item.classList.toggle("current", index === activeStep);
  });
}

function generateCode() {
  generatedCode = String(Math.floor(100000 + Math.random() * 900000));
}

function sendVerificationCode() {
  generateCode();
  const smsInput = qs("#smsCode");
  if (smsInput) smsInput.value = generatedCode;
  const error = qs("#account-error");
  if (error) error.textContent = "验证码已发送，请查收短信。";
}

function nextStep() {
  if (activeStep < STEPS.length - 1) {
    activeStep += 1;
    updateStepState();
  }
}

function prevStep() {
  if (activeStep > 0) {
    activeStep -= 1;
    updateStepState();
  }
}

function getRoleType() {
  return (qs('input[name="entryType"]:checked') || {}).value || "client";
}

function syncReferralField() {
  const extra = qs("#referral-extra");
  if (!extra) return;
  extra.classList.toggle("hidden", getRoleType() !== "referral");
}

function syncRolePanels() {
  const role = getRoleType();
  const clientFields = qs("#client-fields");
  const clientFields2 = qs("#client-fields-2");
  const partnerFields2 = qs("#partner-fields-2");

  if (clientFields) clientFields.classList.toggle("hidden", role === "partner");
  if (clientFields2) clientFields2.classList.toggle("hidden", role === "partner");
  if (partnerFields2) partnerFields2.classList.toggle("hidden", role !== "partner");
  syncReferralField();
}

function buildRecord(formData) {
  const roleType = getRoleType();
  const timestamp = new Date().toISOString();
  const aiScenes = formData.getAll("aiScene");
  const base = {
    id: `lead_${Date.now()}`,
    roleType,
    createdAt: timestamp,
    status: "new",
    ratingLevel: "pending",
    mobile: formData.get("mobile"),
    wechat: formData.get("wechat"),
    name: formData.get("name"),
    city: formData.get("city"),
    notes: formData.get("notes"),
    referralSource: formData.get("referralSource"),
    referrerName: formData.get("referrerName"),
  };

  if (roleType === "partner") {
    return {
      ...base,
      companyName: formData.get("brandName"),
    };
  }

  return {
    ...base,
    companyName: formData.get("brandName"),
    jobTitle: formData.get("jobTitle"),
    industry: formData.get("industry"),
    teamSize: formData.get("teamSize"),
    monthlyRevenueRange: formData.get("monthlyRevenueRange"),
    coreProblem: formData.get("coreProblem"),
    repetitiveWork: formData.get("repetitiveWork"),
    aiScene: aiScenes.length ? aiScenes.join("、") : "",
    expectedStartTime: formData.get("expectedStartTime"),
  };
}

function submitForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const record = buildRecord(formData);
  const records = readRecords();
  records.unshift(record);
  writeRecords(records);

  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      name: record.name,
      mobile: record.mobile,
      roleType: record.roleType,
      createdAt: record.createdAt,
    }),
  );

  qs("#wizard-shell").classList.add("hidden");
  qs("#success-shell").classList.remove("hidden");
  qs("#success-name").textContent = record.name || "你";
}

function validateAccountStep() {
  const mobile = qs("#mobile").value.trim();
  const code = qs("#smsCode").value.trim();
  const error = qs("#account-error");

  if (!/^1\d{10}$/.test(mobile)) {
    error.textContent = "请输入有效的 11 位手机号。";
    return;
  }

  if (!code) {
    error.textContent = "请先获取并填写短信验证码。";
    return;
  }

  if (code !== generatedCode) {
    error.textContent = "验证码不正确，请重新获取后再试。";
    return;
  }

  error.textContent = "";
  nextStep();
}

document.addEventListener("DOMContentLoaded", () => {
  if (!qs("#intake-form")) return;

  const progress = STEPS.map(
    (step, index) => `
      <li class="progress-item ${index === 0 ? "current" : ""}" data-step-index="${index}">
        <div class="progress-index">0${index + 1}</div>
        <div>
          <strong>${step.title}</strong>
          <div>${step.hint}</div>
        </div>
      </li>
    `,
  ).join("");
  qs("#progress-list").innerHTML = progress;

  generateCode();
  syncRolePanels();
  updateStepState();

  qs("#send-code").addEventListener("click", sendVerificationCode);
  qs("#account-next").addEventListener("click", validateAccountStep);
  qsa("[data-next]").forEach((button) => button.addEventListener("click", nextStep));
  qsa("[data-prev]").forEach((button) => button.addEventListener("click", prevStep));
  qsa('input[name="entryType"]').forEach((radio) =>
    radio.addEventListener("change", syncRolePanels),
  );
  qs("#intake-form").addEventListener("submit", submitForm);
});
