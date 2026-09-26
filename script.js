/* =========================================================
   AHR UTILITY TRACKER
   Personal Gas / Current / Rent / Service Tracker
   ========================================================= */

const STORAGE_KEY = "ahr_utility_tracker_v1";

let records = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records)
  );

}


function money(value) {

  return "৳" + Number(value || 0).toLocaleString(
    "en-BD",
    {
      maximumFractionDigits: 2
    }
  );

}


function dateText(date) {

  if (!date) return "—";

  const d = new Date(date + "T00:00:00");

  return d.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


function daysBetween(start, end) {

  if (!start || !end) return 0;

  const a = new Date(start + "T00:00:00");
  const b = new Date(end + "T00:00:00");

  return Math.max(
    0,
    Math.round(
      (b - a) / 86400000
    )
  );

}


function todayISO() {

  const d = new Date();

  const offset =
    d.getTimezoneOffset() * 60000;

  return new Date(
    d.getTime() - offset
  )
    .toISOString()
    .split("T")[0];

}


function currentMonth() {

  return todayISO().slice(0, 7);

}


function typeName(type) {

  const names = {
    gas: "Gas",
    current: "Current / Card",
    rent: "Rent",
    service: "Service Charge"
  };

  return names[type] || type;

}


function typeIcon(type) {

  const icons = {
    gas: "🔥",
    current: "⚡",
    rent: "🏠",
    service: "🛠️"
  };

  return icons[type] || "📌";

}


/* =========================================================
   TODAY
   ========================================================= */

function updateToday() {

  const now = new Date();

  document.getElementById("todayText").textContent =
    now.toLocaleDateString(
      "en-BD",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

}


/* =========================================================
   MODAL
   ========================================================= */

const modal = document.getElementById("modal");

function openModal(type) {

  modal.classList.add("active");

  document.getElementById("recordType").value = type;

  const icon = typeIcon(type);

  document.getElementById("modalIcon").textContent = icon;

  document.getElementById("modalTitle").textContent =
    "Add " + typeName(type);

  document.getElementById("modalDescription").textContent =
    getDescription(type);

  const startLabel =
    document.getElementById("startLabel");

  const endLabel =
    document.getElementById("endLabel");

  const monthGroup =
    document.getElementById("monthGroup");

  const paidGroup =
    document.getElementById("paidGroup");

  const amountLabel =
    document.getElementById("amountLabel");

  const endDate =
    document.getElementById("endDate");

  const startDate =
    document.getElementById("startDate");

  const recordMonth =
    document.getElementById("recordMonth");


  document.getElementById("recordForm").reset();

  startDate.value = todayISO();

  recordMonth.value = currentMonth();


  if (type === "gas") {

    amountLabel.textContent =
      "Gas Cost (৳)";

    startLabel.textContent =
      "Gas Bought Date";

    endLabel.textContent =
      "Gas Finished Date";

    endDate.required = false;

    monthGroup.style.display = "none";

    paidGroup.style.display = "none";

  }


  if (type === "current") {

    amountLabel.textContent =
      "Recharge Amount (৳)";

    startLabel.textContent =
      "Recharge Date";

    endLabel.textContent =
      "Card Finished Date";

    endDate.required = false;

    monthGroup.style.display = "none";

    paidGroup.style.display = "none";

  }


  if (type === "rent") {

    amountLabel.textContent =
      "Monthly Rent (৳)";

    startLabel.textContent =
      "Payment Date";

    endLabel.textContent =
      "Optional";

    monthGroup.style.display = "block";

    paidGroup.style.display = "flex";

  }


  if (type === "service") {

    amountLabel.textContent =
      "Service Charge (৳)";

    startLabel.textContent =
      "Payment Date";

    endLabel.textContent =
      "Optional";

    monthGroup.style.display = "block";

    paidGroup.style.display = "flex";

  }

}


function getDescription(type) {

  const text = {

    gas: "Track when gas was bought and when it finished.",

    current:
      "Track your electricity card recharge and usage.",

    rent:
      "Track your monthly house rent payment.",

    service:
      "Track your monthly service charge."

  };

  return text[type];

}


function closeModal() {

  modal.classList.remove("active");

}


modal.addEventListener("click", function(e) {

  if (e.target === modal) {

    closeModal();

  }

});


/* =========================================================
   ADD RECORD
   ========================================================= */

document
  .getElementById("recordForm")
  .addEventListener("submit", function(e) {

    e.preventDefault();

    const type =
      document.getElementById("recordType").value;

    const amount =
      Number(
        document.getElementById("amount").value
      );

    const startDate =
      document.getElementById("startDate").value;

    const endDate =
      document.getElementById("endDate").value;

    const month =
      document.getElementById("recordMonth").value ||
      startDate.slice(0, 7);

    const note =
      document.getElementById("note").value.trim();

    const paid =
      document.getElementById("paid").checked;


    if (!amount || amount < 0) {

      showToast("Please enter a valid amount.");

      return;

    }


    if (!startDate) {

      showToast("Please select a date.");

      return;

    }


    if (
      (type === "gas" || type === "current") &&
      endDate &&
      endDate < startDate
    ) {

      showToast(
        "End date cannot be before start date."
      );

      return;

    }


    const record = {

      id:
        Date.now().toString() +
        Math.random()
          .toString(36)
          .slice(2),

      type,

      amount,

      startDate,

      endDate,

      month,

      note,

      paid,

      createdAt:
        new Date().toISOString()

    };


    records.unshift(record);

    saveData();

    closeModal();

    renderAll();

    showToast(
      typeName(type) + " record saved."
    );

  });


/* =========================================================
   DELETE
   ========================================================= */

function deleteRecord(id) {

  const ok =
    confirm(
      "Delete this record?"
    );

  if (!ok) return;

  records =
    records.filter(
      r => r.id !== id
    );

  saveData();

  renderAll();

  showToast("Record deleted.");

}


/* =========================================================
   ACTIVE RECORD
   ========================================================= */

function getLatest(type) {

  return records
    .filter(r => r.type === type)
    .sort(
      (a, b) =>
        new Date(b.startDate) -
        new Date(a.startDate)
    )[0];

}


function getActiveUsage(record) {

  if (!record) return null;

  const start =
    new Date(
      record.startDate + "T00:00:00"
    );

  const end =
    record.endDate
      ? new Date(
          record.endDate + "T00:00:00"
        )
      : new Date();

  const days =
    Math.max(
      0,
      Math.floor(
        (end - start) / 86400000
      )
    );

  return days;

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  const gas =
    getLatest("gas");

  const current =
    getLatest("current");

  const rent =
    getLatest("rent");

  const service =
    getLatest("service");


  /* GAS */

  if (gas) {

    const days =
      getActiveUsage(gas);

    document.getElementById(
      "gasDays"
    ).textContent =
      days + " days";

    document.getElementById(
      "gasStatus"
    ).textContent =
      gas.endDate
        ? "Finished " + dateText(gas.endDate)
        : "Currently running";

    document.getElementById(
      "gasCost"
    ).textContent =
      money(gas.amount);

  }


  /* CURRENT */

  if (current) {

    const days =
      getActiveUsage(current);

    document.getElementById(
      "currentDays"
    ).textContent =
      days + " days";

    document.getElementById(
      "currentStatus"
    ).textContent =
      current.endDate
        ? "Finished " +
          dateText(current.endDate)
        : "Currently running";

    document.getElementById(
      "currentCost"
    ).textContent =
      money(current.amount);

  }


  /* RENT */

  if (rent) {

    document.getElementById(
      "rentAmount"
    ).textContent =
      money(rent.amount);

    document.getElementById(
      "rentStatus"
    ).textContent =
      rent.paid
        ? "✓ Paid"
        : "⚠ Unpaid";

    document.getElementById(
      "rentMonth"
    ).textContent =
      formatMonth(rent.month);

  }


  /* SERVICE */

  if (service) {

    document.getElementById(
      "serviceAmount"
    ).textContent =
      money(service.amount);

    document.getElementById(
      "serviceStatus"
    ).textContent =
      service.paid
        ? "✓ Paid"
        : "⚠ Unpaid";

    document.getElementById(
      "serviceMonth"
    ).textContent =
      formatMonth(service.month);

  }


  /* TOTAL */

  const total =
    records.reduce(
      (sum, r) =>
        sum + Number(r.amount || 0),
      0
    );

  document.getElementById(
    "totalExpense"
  ).textContent =
    money(total);


  const month =
    currentMonth();

  const monthTotal =
    records
      .filter(r =>
        (r.month || r.startDate?.slice(0, 7))
        === month
      )
      .reduce(
        (sum, r) =>
          sum + Number(r.amount || 0),
        0
      );

  document.getElementById(
    "monthExpense"
  ).textContent =
    money(monthTotal);

}


/* =========================================================
   MONTHLY SUMMARY
   ========================================================= */

function formatMonth(value) {

  if (!value) return "—";

  const [year, month] =
    value.split("-");

  const d =
    new Date(
      Number(year),
      Number(month) - 1,
      1
    );

  return d.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric"
    }
  );

}


function populateMonthFilter() {

  const select =
    document.getElementById(
      "monthFilter"
    );

  const months =
    new Set();

  records.forEach(r => {

    const month =
      r.month ||
      r.startDate?.slice(0, 7);

    if (month) months.add(month);

  });


  months.add(currentMonth());


  const sorted =
    [...months].sort().reverse();


  select.innerHTML =
    sorted.map(
      month =>
        `<option value="${month}">
          ${formatMonth(month)}
        </option>`
    ).join("");

}


function renderMonthlySummary() {

  const selected =
    document.getElementById(
      "monthFilter"
    ).value ||
    currentMonth();


  const monthRecords =
    records.filter(r => {

      const month =
        r.month ||
        r.startDate?.slice(0, 7);

      return month === selected;

    });


  const getTotal = type =>
    monthRecords
      .filter(r => r.type === type)
      .reduce(
        (sum, r) =>
          sum + Number(r.amount || 0),
        0
      );


  document.getElementById(
    "summaryGas"
  ).textContent =
    money(getTotal("gas"));

  document.getElementById(
    "summaryCurrent"
  ).textContent =
    money(getTotal("current"));

  document.getElementById(
    "summaryRent"
  ).textContent =
    money(getTotal("rent"));

  document.getElementById(
    "summaryService"
  ).textContent =
    money(getTotal("service"));

}


document
  .getElementById("monthFilter")
  .addEventListener(
    "change",
    renderMonthlySummary
  );


/* =========================================================
   HISTORY
   ========================================================= */

function renderHistory() {

  const filter =
    document.getElementById(
      "typeFilter"
    ).value;


  let list =
    [...records]
      .sort(
        (a, b) =>
          new Date(b.startDate) -
          new Date(a.startDate)
      );


  if (filter !== "all") {

    list =
      list.filter(
        r => r.type === filter
      );

  }


  const container =
    document.getElementById(
      "historyList"
    );


  if (!list.length) {

    container.innerHTML = `
      <div class="empty">
        <span>📭</span>
        <b>No records yet</b>
        <p>Add your first utility record.</p>
      </div>
    `;

    return;

  }


  container.innerHTML =
    list.map(r => {

      let details =
        dateText(r.startDate);


      if (r.type === "gas" ||
          r.type === "current") {

        if (r.endDate) {

          const days =
            daysBetween(
              r.startDate,
              r.endDate
            );

          const daily =
            days > 0
              ? r.amount / days
              : r.amount;

          details +=
            " → " +
            dateText(r.endDate) +
            " • " +
            days +
            " days • " +
            money(daily) +
            "/day";

        } else {

          const days =
            getActiveUsage(r);

          const daily =
            days > 0
              ? r.amount / days
              : r.amount;

          details +=
            " • " +
            days +
            " days running • " +
            money(daily) +
            "/day";

        }

      }


      if (
        r.type === "rent" ||
        r.type === "service"
      ) {

        details =
          formatMonth(r.month) +
          " • " +
          (
            r.paid
              ? "Paid"
              : "Unpaid"
          );

      }


      if (r.note) {

        details +=
          " • " +
          escapeHTML(r.note);

      }


      return `
        <div class="history-item">

          <div class="history-left">

            <div class="history-icon">
              ${typeIcon(r.type)}
            </div>

            <div>
              <h4>
                ${typeName(r.type)}
              </h4>

              <p>
                ${details}
              </p>
            </div>

          </div>


          <div class="history-right">

            <strong>
              ${money(r.amount)}
            </strong>

            <small>
              ${dateText(r.startDate)}
            </small>

            <button
              class="delete-btn"
              onclick="deleteRecord('${r.id}')"
              title="Delete"
            >
              🗑
            </button>

          </div>

        </div>
      `;

    }).join("");

}


document
  .getElementById("typeFilter")
  .addEventListener(
    "change",
    renderHistory
  );


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   BACKUP
   ========================================================= */

document
  .getElementById("exportBtn")
  .addEventListener(
    "click",
    function() {

      const data = {

        app:
          "AHR Utility Tracker",

        version:
          "1.0",

        exportedAt:
          new Date().toISOString(),

        records

      };


      const blob =
        new Blob(
          [
            JSON.stringify(
              data,
              null,
              2
            )
          ],
          {
            type:
              "application/json"
          }
        );


      const url =
        URL.createObjectURL(blob);


      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        "AHR-Utility-Backup-" +
        todayISO() +
        ".json";

      a.click();

      URL.revokeObjectURL(url);

      showToast(
        "Backup downloaded."
      );

    }
  );


/* =========================================================
   RESTORE
   ========================================================= */

document
  .getElementById("importFile")
  .addEventListener(
    "change",
    function(e) {

      const file =
        e.target.files[0];

      if (!file) return;


      const reader =
        new FileReader();


      reader.onload =
        function(event) {

          try {

            const data =
              JSON.parse(
                event.target.result
              );


            if (
              !data.records ||
              !Array.isArray(data.records)
            ) {

              throw new Error();

            }


            const ok =
              confirm(
                "Restore this backup? Existing data will be replaced."
              );


            if (!ok) return;


            records =
              data.records;

            saveData();

            renderAll();

            showToast(
              "Backup restored."
            );

          } catch {

            showToast(
              "Invalid backup file."
            );

          }

        };


      reader.readAsText(file);

      e.target.value = "";

    }
  );


/* =========================================================
   THEME
   ========================================================= */

const themeBtn =
  document.getElementById(
    "themeBtn"
  );


function loadTheme() {

  const dark =
    localStorage.getItem(
      "ahr_theme"
    ) === "dark";


  if (dark) {

    document.body.classList.add(
      "dark"
    );

    themeBtn.textContent =
      "☀️";

  } else {

    themeBtn.textContent =
      "🌙";

  }

}


themeBtn.addEventListener(
  "click",
  function() {

    document.body.classList.toggle(
      "dark"
    );


    const dark =
      document.body.classList.contains(
        "dark"
      );


    localStorage.setItem(
      "ahr_theme",
      dark
        ? "dark"
        : "light"
    );


    themeBtn.textContent =
      dark
        ? "☀️"
        : "🌙";

  }
);


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

  populateMonthFilter();

  renderDashboard();

  renderMonthlySummary();

  renderHistory();

}


/* =========================================================
   INIT
   ========================================================= */

updateToday();

loadTheme();

renderAll();
