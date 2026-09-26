/* =========================================================
   AHR UTILITY TRACKER
   Gas / Current / Rent / Service / PDF Reports
   ========================================================= */

const STORAGE_KEY =
  "ahr_utility_tracker_v2";

let records =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );


/* =========================================================
   HELPERS
   ========================================================= */

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records)
  );

}


function money(value) {

  return "৳" +
    Number(value || 0).toLocaleString(
      "en-BD",
      {
        maximumFractionDigits: 2
      }
    );

}


function plainMoney(value) {

  return "Tk " +
    Number(value || 0).toLocaleString(
      "en-BD",
      {
        maximumFractionDigits: 2
      }
    );

}


function dateText(date) {

  if (!date) return "—";

  const d =
    new Date(
      date + "T00:00:00"
    );

  return d.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


function daysBetween(start,end) {

  if (!start || !end)
    return 0;

  const a =
    new Date(
      start + "T00:00:00"
    );

  const b =
    new Date(
      end + "T00:00:00"
    );

  return Math.max(
    0,
    Math.round(
      (b-a)/86400000
    )
  );

}


function todayISO() {

  const d =
    new Date();

  const offset =
    d.getTimezoneOffset() *
    60000;

  return new Date(
    d.getTime() - offset
  )
    .toISOString()
    .split("T")[0];

}


function currentMonth() {

  return todayISO()
    .slice(0,7);

}


function typeName(type) {

  const names = {

    gas:
      "Gas",

    current:
      "Current / Card",

    rent:
      "House Rent",

    service:
      "Service Charge"

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


function formatMonth(value) {

  if (!value)
    return "—";

  const [year,month] =
    value.split("-");

  const d =
    new Date(
      Number(year),
      Number(month)-1,
      1
    );

  return d.toLocaleDateString(
    "en-US",
    {
      month:"long",
      year:"numeric"
    }
  );

}


/* =========================================================
   TODAY
   ========================================================= */

function updateToday() {

  document.getElementById(
    "todayText"
  ).textContent =
    new Date().toLocaleDateString(
      "en-BD",
      {
        weekday:"long",
        day:"numeric",
        month:"long",
        year:"numeric"
      }
    );

}


/* =========================================================
   MODAL
   ========================================================= */

const modal =
  document.getElementById("modal");


function openModal(type) {

  modal.classList.add("active");

  document.getElementById(
    "recordType"
  ).value = type;

  document.getElementById(
    "modalIcon"
  ).textContent =
    typeIcon(type);

  document.getElementById(
    "modalTitle"
  ).textContent =
    "Add " + typeName(type);

  document.getElementById(
    "modalDescription"
  ).textContent =
    getDescription(type);


  document
    .getElementById("recordForm")
    .reset();


  document.getElementById(
    "startDate"
  ).value =
    todayISO();

  document.getElementById(
    "recordMonth"
  ).value =
    currentMonth();


  const amountLabel =
    document.getElementById(
      "amountLabel"
    );

  const startLabel =
    document.getElementById(
      "startLabel"
    );

  const endLabel =
    document.getElementById(
      "endLabel"
    );

  const endDate =
    document.getElementById(
      "endDate"
    );

  const monthGroup =
    document.getElementById(
      "monthGroup"
    );

  const paidGroup =
    document.getElementById(
      "paidGroup"
    );


  if (type === "gas") {

    amountLabel.textContent =
      "Gas Cost (৳)";

    startLabel.textContent =
      "Gas Bought Date";

    endLabel.textContent =
      "Gas Finished Date";

    monthGroup.style.display =
      "none";

    paidGroup.style.display =
      "none";

    endDate.required = false;

  }


  if (type === "current") {

    amountLabel.textContent =
      "Recharge Amount (৳)";

    startLabel.textContent =
      "Recharge Date";

    endLabel.textContent =
      "Card Finished Date";

    monthGroup.style.display =
      "none";

    paidGroup.style.display =
      "none";

    endDate.required = false;

  }


  if (type === "rent") {

    amountLabel.textContent =
      "Monthly Rent (৳)";

    startLabel.textContent =
      "Payment Date";

    endLabel.textContent =
      "Optional";

    monthGroup.style.display =
      "block";

    paidGroup.style.display =
      "flex";

  }


  if (type === "service") {

    amountLabel.textContent =
      "Service Charge (৳)";

    startLabel.textContent =
      "Payment Date";

    endLabel.textContent =
      "Optional";

    monthGroup.style.display =
      "block";

    paidGroup.style.display =
      "flex";

  }

}


function getDescription(type) {

  return {

    gas:
      "Track when gas was bought and finished.",

    current:
      "Track electricity card recharge usage.",

    rent:
      "Track monthly house rent.",

    service:
      "Track monthly service charge."

  }[type];

}


function closeModal() {

  modal.classList.remove(
    "active"
  );

}


modal.addEventListener(
  "click",
  e => {

    if (e.target === modal)
      closeModal();

  }
);


/* =========================================================
   ADD RECORD
   ========================================================= */

document
  .getElementById("recordForm")
  .addEventListener(
    "submit",
    function(e) {

      e.preventDefault();


      const type =
        document.getElementById(
          "recordType"
        ).value;

      const amount =
        Number(
          document.getElementById(
            "amount"
          ).value
        );

      const startDate =
        document.getElementById(
          "startDate"
        ).value;

      const endDate =
        document.getElementById(
          "endDate"
        ).value;

      const month =
        document.getElementById(
          "recordMonth"
        ).value ||
        startDate.slice(0,7);

      const note =
        document.getElementById(
          "note"
        ).value.trim();

      const paid =
        document.getElementById(
          "paid"
        ).checked;


      if (!amount || amount < 0) {

        showToast(
          "Enter a valid amount."
        );

        return;

      }


      if (
        (type === "gas" ||
         type === "current") &&
        endDate &&
        endDate < startDate
      ) {

        showToast(
          "End date cannot be before start date."
        );

        return;

      }


      records.unshift({

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

      });


      saveData();

      closeModal();

      renderAll();

      showToast(
        typeName(type) +
        " saved successfully."
      );

    }
  );


/* =========================================================
   DELETE
   ========================================================= */

function deleteRecord(id) {

  if (
    !confirm(
      "Delete this record?"
    )
  )
    return;


  records =
    records.filter(
      r => r.id !== id
    );


  saveData();

  renderAll();

  showToast(
    "Record deleted."
  );

}


/* =========================================================
   LATEST
   ========================================================= */

function getLatest(type) {

  return records
    .filter(
      r => r.type === type
    )
    .sort(
      (a,b) =>
        new Date(b.startDate) -
        new Date(a.startDate)
    )[0];

}


function getActiveUsage(record) {

  if (!record)
    return 0;

  const start =
    new Date(
      record.startDate +
      "T00:00:00"
    );

  const end =
    record.endDate
      ? new Date(
          record.endDate +
          "T00:00:00"
        )
      : new Date();

  return Math.max(
    0,
    Math.floor(
      (end-start)/86400000
    )
  );

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
        ? "Finished " +
          dateText(gas.endDate)
        : "Currently running";

    document.getElementById(
      "gasCost"
    ).textContent =
      money(gas.amount);

  }


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


  const total =
    records.reduce(
      (sum,r) =>
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
      .filter(
        r =>
          (
            r.month ||
            r.startDate?.slice(0,7)
          ) === month
      )
      .reduce(
        (sum,r) =>
          sum +
          Number(r.amount || 0),
        0
      );


  document.getElementById(
    "monthExpense"
  ).textContent =
    money(monthTotal);

}


/* =========================================================
   MONTH SUMMARY
   ========================================================= */

function populateMonthFilter() {

  const select =
    document.getElementById(
      "monthFilter"
    );

  const months =
    new Set();

  records.forEach(r => {

    const m =
      r.month ||
      r.startDate?.slice(0,7);

    if (m)
      months.add(m);

  });


  months.add(
    currentMonth()
  );


  const sorted =
    [...months]
      .sort()
      .reverse();


  select.innerHTML =
    sorted
      .map(
        m =>
          `<option value="${m}">
            ${formatMonth(m)}
          </option>`
      )
      .join("");

}


function renderMonthlySummary() {

  const selected =
    document.getElementById(
      "monthFilter"
    ).value ||
    currentMonth();


  const list =
    records.filter(r => {

      const m =
        r.month ||
        r.startDate?.slice(0,7);

      return m === selected;

    });


  const total = type =>
    list
      .filter(
        r => r.type === type
      )
      .reduce(
        (sum,r) =>
          sum +
          Number(r.amount || 0),
        0
      );


  document.getElementById(
    "summaryGas"
  ).textContent =
    money(total("gas"));

  document.getElementById(
    "summaryCurrent"
  ).textContent =
    money(total("current"));

  document.getElementById(
    "summaryRent"
  ).textContent =
    money(total("rent"));

  document.getElementById(
    "summaryService"
  ).textContent =
    money(total("service"));

}


document
  .getElementById(
    "monthFilter"
  )
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
    [...records].sort(
      (a,b) =>
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


      if (
        r.type === "gas" ||
        r.type === "current"
      ) {

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
                ${
                  r.note
                    ? " • " +
                      escapeHTML(r.note)
                    : ""
                }
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
            >
              🗑
            </button>

          </div>

        </div>
      `;

    })
    .join("");

}


document
  .getElementById(
    "typeFilter"
  )
  .addEventListener(
    "change",
    renderHistory
  );


/* =========================================================
   ESCAPE
   ========================================================= */

function escapeHTML(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   BACKUP
   ========================================================= */

document
  .getElementById(
    "exportBtn"
  )
  .addEventListener(
    "click",
    function() {

      const data = {

        app:
          "AHR Utility Tracker",

        version:
          "2.0",

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
  .getElementById(
    "importFile"
  )
  .addEventListener(
    "change",
    function(e) {

      const file =
        e.target.files[0];

      if (!file)
        return;


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
              !Array.isArray(
                data.records
              )
            )
              throw new Error();


            if (
              !confirm(
                "Restore this backup? Existing data will be replaced."
              )
            )
              return;


            records =
              data.records;

            saveData();

            renderAll();

            showToast(
              "Backup restored."
            );

          }

          catch {

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

    document.body
      .classList
      .add("dark");

    themeBtn.textContent =
      "☀️";

  }

}


themeBtn.addEventListener(
  "click",
  function() {

    document.body
      .classList
      .toggle("dark");


    const dark =
      document.body
        .classList
        .contains("dark");


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
   PDF REPORT CONTROLS
   ========================================================= */

function setupReportControls() {

  const mode =
    document.getElementById(
      "reportMode"
    );

  const monthsBox =
    document.getElementById(
      "reportMonthsBox"
    );

  const yearBox =
    document.getElementById(
      "reportYearBox"
    );

  const customBox =
    document.getElementById(
      "customDateBox"
    );


  mode.addEventListener(
    "change",
    function() {

      if (this.value === "custom") {

        monthsBox.style.display =
          "none";

        yearBox.style.display =
          "none";

        customBox.classList.add(
          "active"
        );

      }

      else {

        monthsBox.style.display =
          "block";

        yearBox.style.display =
          "block";

        customBox.classList.remove(
          "active"
        );

      }

    }
  );

}


/* =========================================================
   REPORT YEARS
   ========================================================= */

function populateReportYears() {

  const select =
    document.getElementById(
      "reportYear"
    );

  const now =
    new Date();

  const thisYear =
    now.getFullYear();


  let html = "";


  for (
    let year = thisYear - 5;
    year <= thisYear + 2;
    year++
  ) {

    html +=
      `<option value="${year}"
        ${year === thisYear ? "selected" : ""}>
        ${year}
      </option>`;

  }


  select.innerHTML =
    html;

}


/* =========================================================
   REPORT DATA
   ========================================================= */

function getRecordsInRange(
  from,
  to
) {

  return records.filter(r => {

    const start =
      r.startDate;

    return (
      start >= from &&
      start <= to
    );

  });

}


function calculateReport(
  list,
  from,
  to
) {

  const result = {

    gas: 0,

    current: 0,

    rent: 0,

    service: 0,

    total: 0,

    gasRecords: [],

    currentRecords: [],

    rentRecords: [],

    serviceRecords: []

  };


  list.forEach(r => {

    const amount =
      Number(r.amount || 0);


    result[r.type] +=
      amount;

    result.total +=
      amount;


    if (r.type === "gas")
      result.gasRecords.push(r);

    if (r.type === "current")
      result.currentRecords.push(r);

    if (r.type === "rent")
      result.rentRecords.push(r);

    if (r.type === "service")
      result.serviceRecords.push(r);

  });


  return result;

}


/* =========================================================
   MONTH RANGE
   ========================================================= */

function getMonthRange(
  year,
  monthCount
) {

  const start =
    new Date(
      year,
      0,
      1
    );


  const end =
    new Date(
      year,
      monthCount,
      0
    );


  return {

    from:
      formatDateObj(start),

    to:
      formatDateObj(end)

  };

}


function formatDateObj(date) {

  const y =
    date.getFullYear();

  const m =
    String(
      date.getMonth()+1
    ).padStart(2,"0");

  const d =
    String(
      date.getDate()
    ).padStart(2,"0");


  return (
    y + "-" +
    m + "-" +
    d
  );

}


/* =========================================================
   PDF GENERATOR
   ========================================================= */

function generatePDF() {

  if (
    !window.jspdf ||
    !window.jspdf.jsPDF
  ) {

    showToast(
      "PDF library is not loaded. Check internet."
    );

    return;

  }


  const mode =
    document.getElementById(
      "reportMode"
    ).value;


  let from;
  let to;
  let reportTitle;


  if (mode === "custom") {

    from =
      document.getElementById(
        "reportFrom"
      ).value;

    to =
      document.getElementById(
        "reportTo"
      ).value;


    if (!from || !to) {

      showToast(
        "Select From and To dates."
      );

      return;

    }


    if (from > to) {

      showToast(
        "From date cannot be after To date."
      );

      return;

    }


    reportTitle =
      dateText(from) +
      " - " +
      dateText(to);

  }

  else {

    const year =
      Number(
        document.getElementById(
          "reportYear"
        ).value
      );

    const months =
      Number(
        document.getElementById(
          "reportMonths"
        ).value
      );


    const range =
      getMonthRange(
        year,
        months
      );


    from =
      range.from;

    to =
      range.to;


    reportTitle =
      `January - ${new Date(
        year,
        months-1,
        1
      ).toLocaleDateString(
        "en-US",
        {
          month:"long"
        }
      )} ${year}`;

  }


  const list =
    getRecordsInRange(
      from,
      to
    );


  const data =
    calculateReport(
      list,
      from,
      to
    );


  buildPDF(
    data,
    from,
    to,
    reportTitle
  );

}


/* =========================================================
   BUILD PDF
   ========================================================= */

function buildPDF(
  data,
  from,
  to,
  reportTitle
) {

  const {
    jsPDF
  } = window.jspdf;


  const doc =
    new jsPDF({
      orientation:
        "portrait",

      unit:
        "mm",

      format:
        "a4"
    });


  const pageWidth =
    doc.internal.pageSize
      .getWidth();

  const pageHeight =
    doc.internal.pageSize
      .getHeight();


  /* COLORS */

  const blue =
    [14,165,233];

  const dark =
    [15,23,42];

  const gray =
    [100,116,139];

  const light =
    [241,245,249];

  const border =
    [203,213,225];


  /* WATERMARK */

  function drawWatermark() {

    doc.saveGraphicsState();

    doc.setTextColor(
      14,
      165,
      233
    );

    doc.setGState(
      new doc.GState({
        opacity:
          0.055
      })
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(
      32
    );


    doc.text(
      "AHR Utility Tracker",
      pageWidth / 2,
      pageHeight / 2,
      {
        align:"center",
        angle: -35
      }
    );


    doc.restoreGraphicsState();

  }


  /* HEADER */

  function drawHeader() {

    doc.setFillColor(
      ...blue
    );

    doc.roundedRect(
      12,
      10,
      pageWidth-24,
      27,
      4,
      4,
      "F"
    );


    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(
      18
    );


    doc.text(
      "AHR Utility Tracker",
      20,
      22
    );


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(
      9
    );


    doc.text(
      "Personal Utility & Expense Report",
      20,
      30
    );


    doc.setFontSize(
      8
    );


    doc.text(
      "Generated: " +
      new Date().toLocaleDateString(
        "en-GB"
      ),
      pageWidth-20,
      22,
      {
        align:"right"
      }
    );


    doc.text(
      "Period: " +
      reportTitle,
      pageWidth-20,
      30,
      {
        align:"right"
      }
    );

  }


  /* PAGE SETUP */

  function setupPage() {

    drawWatermark();

    drawHeader();

  }


  setupPage();


  /* SUMMARY */

  doc.setTextColor(
    ...dark
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    13
  );

  doc.text(
    "Expense Summary",
    14,
    48
  );


  doc.autoTable({

    startY:
      53,

    margin:
      {
        left:14,
        right:14
      },

    head: [[
      "Category",
      "Records",
      "Total"
    ]],

    body: [

      [
        "🔥 Gas",
        data.gasRecords.length,
        plainMoney(data.gas)
      ],

      [
        "⚡ Current / Card",
        data.currentRecords.length,
        plainMoney(data.current)
      ],

      [
        "🏠 House Rent",
        data.rentRecords.length,
        plainMoney(data.rent)
      ],

      [
        "🛠 Service Charge",
        data.serviceRecords.length,
        plainMoney(data.service)
      ],

      [
        "GRAND TOTAL",
        listCount(data),
        plainMoney(data.total)
      ]

    ],

    theme:
      "grid",

    styles: {

      font:
        "helvetica",

      fontSize:
        9,

      cellPadding:
        4,

      lineColor:
        border,

      lineWidth:
        .25,

      textColor:
        dark

    },

    headStyles: {

      fillColor:
        blue,

      textColor:
        [255,255,255],

      fontStyle:
        "bold"

    },

    footStyles: {

      fillColor:
        light,

      textColor:
        dark

    },

    alternateRowStyles: {

      fillColor:
        [248,250,252]

    }

  });


  /* GAS */

  let y =
    doc.lastAutoTable.finalY +
    12;


  addSectionTitle(
    doc,
    "🔥 Gas Details",
    y,
    blue
  );


  y += 5;


  if (
    data.gasRecords.length
  ) {

    doc.autoTable({

      startY:y,

      margin:
        {
          left:14,
          right:14
        },

      head: [[
        "Bought",
        "Finished",
        "Days",
        "Cost",
        "Daily Cost"
      ]],

      body:
        data.gasRecords.map(
          r => {

            const days =
              r.endDate
                ? daysBetween(
                    r.startDate,
                    r.endDate
                  )
                : getActiveUsage(r);

            const daily =
              days > 0
                ? r.amount/days
                : r.amount;


            return [

              dateText(
                r.startDate
              ),

              r.endDate
                ? dateText(
                    r.endDate
                  )
                : "Running",

              days,

              plainMoney(
                r.amount
              ),

              plainMoney(
                daily
              )

            ];

          }
        ),

      theme:"grid",

      styles:tableStyles(border,dark),

      headStyles:tableHead(blue)

    });

  }

  else {

    addNoData(
      doc,
      y
    );

  }


  y =
    doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 12
      : y + 20;


  /* CURRENT */

  addSectionTitle(
    doc,
    "⚡ Current / Card Details",
    y,
    [234,179,8]
  );

  y += 5;


  if (
    data.currentRecords.length
  ) {

    doc.autoTable({

      startY:y,

      margin:
        {
          left:14,
          right:14
        },

      head: [[
        "Recharge",
        "Finished",
        "Days",
        "Amount",
        "Daily Cost"
      ]],

      body:
        data.currentRecords.map(
          r => {

            const days =
              r.endDate
                ? daysBetween(
                    r.startDate,
                    r.endDate
                  )
                : getActiveUsage(r);

            const daily =
              days > 0
                ? r.amount/days
                : r.amount;


            return [

              dateText(
                r.startDate
              ),

              r.endDate
                ? dateText(
                    r.endDate
                  )
                : "Running",

              days,

              plainMoney(
                r.amount
              ),

              plainMoney(
                daily
              )

            ];

          }
        ),

      theme:"grid",

      styles:tableStyles(border,dark),

      headStyles:
        tableHead(
          [234,179,8]
        )

    });

  }

  else {

    addNoData(
      doc,
      y
    );

  }


  y =
    doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 12
      : y + 20;


  /* RENT */

  addSectionTitle(
    doc,
    "🏠 House Rent",
    y,
    [22,163,74]
  );

  y += 5;


  if (
    data.rentRecords.length
  ) {

    doc.autoTable({

      startY:y,

      margin:
        {
          left:14,
          right:14
        },

      head: [[
        "Month",
        "Payment Date",
        "Amount",
        "Status"
      ]],

      body:
        data.rentRecords.map(
          r => [

            formatMonth(
              r.month
            ),

            dateText(
              r.startDate
            ),

            plainMoney(
              r.amount
            ),

            r.paid
              ? "PAID"
              : "UNPAID"

          ]
        ),

      theme:"grid",

      styles:
        tableStyles(
          border,
          dark
        ),

      headStyles:
        tableHead(
          [22,163,74]
        )

    });

  }

  else {

    addNoData(
      doc,
      y
    );

  }


  y =
    doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 12
      : y + 20;


  /* SERVICE */

  addSectionTitle(
    doc,
    "🛠 Service Charge",
    y,
    blue
  );

  y += 5;


  if (
    data.serviceRecords.length
  ) {

    doc.autoTable({

      startY:y,

      margin:
        {
          left:14,
          right:14
        },

      head: [[
        "Month",
        "Payment Date",
        "Amount",
        "Status"
      ]],

      body:
        data.serviceRecords.map(
          r => [

            formatMonth(
              r.month
            ),

            dateText(
              r.startDate
            ),

            plainMoney(
              r.amount
            ),

            r.paid
              ? "PAID"
              : "UNPAID"

          ]
        ),

      theme:"grid",

      styles:
        tableStyles(
          border,
          dark
        ),

      headStyles:
        tableHead(
          blue
        )

    });

  }

  else {

    addNoData(
      doc,
      y
    );

  }


  /* FINAL TOTAL */

  y =
    doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 12
      : 230;


  doc.setFillColor(
    ...blue
  );

  doc.roundedRect(
    14,
    y,
    pageWidth-28,
    20,
    3,
    3,
    "F"
  );


  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    12
  );

  doc.text(
    "TOTAL EXPENSE",
    20,
    y+8
  );


  doc.setFontSize(
    16
  );

  doc.text(
    plainMoney(data.total),
    pageWidth-20,
    y+12,
    {
      align:"right"
    }
  );


  /* FOOTER */

  const pages =
    doc.internal
      .getNumberOfPages();


  for (
    let i=1;
    i<=pages;
    i++
  ) {

    doc.setPage(i);

    drawWatermark();


    doc.setDrawColor(
      ...border
    );

    doc.line(
      14,
      pageHeight-13,
      pageWidth-14,
      pageHeight-13
    );


    doc.setTextColor(
      ...gray
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(
      7
    );


    doc.text(
      "AHR Utility Tracker • Personal Use",
      14,
      pageHeight-8
    );


    doc.text(
      "Page " +
      i +
      " of " +
      pages,
      pageWidth-14,
      pageHeight-8,
      {
        align:"right"
      }
    );

  }


  /* DOWNLOAD */

  const filename =
    "AHR-Utility-Report-" +
    from +
    "-to-" +
    to +
    ".pdf";


  doc.save(
    filename
  );


  showToast(
    "PDF downloaded successfully."
  );

}


/* =========================================================
   PDF HELPERS
   ========================================================= */

function listCount(data) {

  return (
    data.gasRecords.length +
    data.currentRecords.length +
    data.rentRecords.length +
    data.serviceRecords.length
  );

}


function tableStyles(
  border,
  dark
) {

  return {

    font:
      "helvetica",

    fontSize:
      8.5,

    cellPadding:
      3.5,

    lineColor:
      border,

    lineWidth:
      .25,

    textColor:
      dark

  };

}


function tableHead(color) {

  return {

    fillColor:
      color,

    textColor:
      [255,255,255],

    fontStyle:
      "bold",

    fontSize:
      8.5

  };

}


function addSectionTitle(
  doc,
  title,
  y,
  color
) {

  doc.setFillColor(
    ...color
  );

  doc.roundedRect(
    14,
    y,
    182,
    8,
    2,
    2,
    "F"
  );


  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    9
  );

  doc.text(
    title,
    18,
    y+5.5
  );

}


function addNoData(
  doc,
  y
) {

  doc.setDrawColor(
    203,
    213,
    225
  );

  doc.setTextColor(
    100,
    116,
    139
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    8
  );

  doc.roundedRect(
    14,
    y,
    182,
    12,
    2,
    2,
    "S"
  );

  doc.text(
    "No records found for this period.",
    18,
    y+7
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

populateReportYears();

setupReportControls();

renderAll();
