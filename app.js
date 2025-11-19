const listEl = document.getElementById("profile-list");
const errorEl = document.getElementById("profile-error");
const modal = document.getElementById("profile-modal");
const closeBtn = document.getElementById("modal-close");
const modalName = document.getElementById("modal-name");
const modalRegion = document.getElementById("modal-region");
const modalSkills = document.getElementById("modal-skills");
const modalBio = document.getElementById("modal-bio");
const form = document.getElementById("chat-form");
const targetInput = document.getElementById("target-id");
const statusEl = document.getElementById("chat-status");
const submitBtn = document.getElementById("chat-submit");
const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

let currentProfile = null;

fetch("profiles.json")
  .then((res) => {
    if (!res.ok) throw new Error("プロフィールを読み込めませんでした。");
    return res.json();
  })
  .then((profiles) => {
    if (!profiles.length) {
      listEl.innerHTML = "<p>登録者がまだいません。</p>";
      return;
    }
    profiles.forEach((profile) => listEl.appendChild(renderCard(profile)));
  })
  .catch((err) => {
    errorEl.textContent = err.message;
  });

function renderCard(profile) {
  const card = document.createElement("article");
  card.className = "profile-card";
  card.innerHTML = `
    <div>
      <h3>${profile.name}</h3>
      <p class="badge">${profile.region}</p>
    </div>
    <p>${profile.skills.join(" / ")}</p>
    <p style="flex:1">${profile.bio}</p>
    <button type="button">話をしてみる</button>
  `;
  card.querySelector("button").addEventListener("click", () => openModal(profile));
  return card;
}

function openModal(profile) {
  currentProfile = profile;
  modalName.textContent = profile.name;
  modalRegion.textContent = profile.region;
  modalSkills.textContent = `スキル: ${profile.skills.join(" / ")}`;
  modalBio.textContent = profile.bio;
  targetInput.value = profile.id;
  statusEl.textContent = "";
  form.reset();
  // Keep target id even after form reset
  targetInput.value = profile.id;
  modal.showModal();
}

closeBtn?.addEventListener("click", () => modal.close());
modal?.addEventListener("close", () => {
  currentProfile = null;
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentProfile) return;
  const endpoint = form.dataset.endpoint ?? "";
  if (!endpoint || endpoint.includes("REPLACE_WITH_YOUR_DEPLOY_ID")) {
    statusEl.style.color = "#dc2626";
    statusEl.textContent = "GASのURLをdata-endpointに設定してください。";
    return;
  }

  const nickname = form.nickname.value.trim();
  const contact = form.contact.value.trim();
  const message = form.message.value.trim();

  if (!nickname || !contact || !message) {
    statusEl.style.color = "#dc2626";
    statusEl.textContent = "すべての項目を入力してください。";
    return;
  }

  submitBtn.disabled = true;
  statusEl.style.color = "#2563eb";
  statusEl.textContent = "送信中...";

  try {
    const data = new FormData();
    data.append("action", "write");
    data.append("targetId", targetInput.value);
    data.append("nickname", nickname);
    data.append("contact", contact);
    data.append("message", message);

    const res = await fetch(endpoint, {
      method: "POST",
      body: data,
      mode: "cors"
    });

    if (!res.ok) throw new Error("送信に失敗しました。");

    statusEl.style.color = "#16a34a";
    statusEl.textContent = "送信しました。返信をお待ちください。";
    form.reset();
    targetInput.value = currentProfile.id;
  } catch (error) {
    statusEl.style.color = "#dc2626";
    statusEl.textContent = error.message;
  } finally {
    submitBtn.disabled = false;
  }
});
