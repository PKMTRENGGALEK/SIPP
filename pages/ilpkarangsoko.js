$(document).ready(function () {
  const scriptURL = "https://script.google.com/macros/s/AKfycbyXhwt_GVgXA2d7ayggRwczO-ka7EvLorDt56BgX7TYUxiiI1_S34gH0w-WZHuZrbw/exec";
  let tableData = [], headers = [];

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString("id-ID");
  }

  function getBadge(text) {
    if (!text) return "";
    if (["Obesitas", "Hipertensi", "Berisiko", "Anemia", "Positif"].some(t => text.includes(t)))
      return `<span class="badge bg-danger">${text}</span>`;
    if (["Pra", "Kelebihan"].some(t => text.includes(t)))
      return `<span class="badge bg-warning text-dark">${text}</span>`;
    return `<span class="badge bg-success">${text}</span>`;
  }

  function hitungIMT(form) {
    const tb = parseFloat(form.find("input[name='TB']").val()) || 0;
    const bb = parseFloat(form.find("input[name='BB']").val()) || 0;
    const imt = tb && bb ? (bb / ((tb / 100) ** 2)).toFixed(1) : "";
    form.find("input[name='IMT']").val(imt);
  }

  function hitungDeteksi(form) {
    const g = form.find("input[name='Gender']").val()?.toUpperCase();
    const imt = parseFloat(form.find("input[name='IMT']").val()) || 0;
    const sis = parseFloat(form.find("input[name='SISTOL']").val()) || 0;
    const dia = parseFloat(form.find("input[name='DIASTOL']").val()) || 0;
    const hb = parseFloat(form.find("input[name='KADAR_HB']").val()) || 0;
    const gula = parseFloat(form.find("input[name='KADAR_GULA']").val()) || 0;
    const kol = parseFloat(form.find("input[name='CHOLESTEROL']").val()) || 0;

    const obes = imt < 18.5 ? "Kurus" : imt < 23 ? "Normal" : imt < 25 ? "Kelebihan" : "Obesitas";
    const ht = sis >= 140 || dia >= 90 ? "Hipertensi" : (sis >= 120 || dia >= 80 ? "Prehipertensi" : "Normal");
    const dm = gula >= 200 ? "Positif" : (gula >= 140 ? "Pra-Diabetes" : "Normal");
    const anemia = (g === "L" && hb < 13) || (g === "P" && hb < 12) ? "Anemia" : "Normal";
    const stroke = [ht === "Hipertensi", dm === "Positif", kol >= 240].filter(Boolean).length >= 2
      ? "Berisiko Stroke" : "Tidak Berisiko";

    form.find("input[name='DETEKSI_OBESITAS']").val(obes);
    form.find("input[name='DETEKSI_HT']").val(ht);
    form.find("input[name='DETEKSI_DM']").val(dm);
    form.find("input[name='RESIKO_ANEMIA']").val(anemia);
    form.find("input[name='DETEKSI_STROKE']").val(stroke);
  }

  function renderTable() {
    const tbody = $("#skriningTable tbody").empty();
    tableData.forEach((row, i) => {
      let tr = `<tr><td><button class="btn btn-sm btn-warning editBtn shadow" data-index="${i}">✏️</button></td><td>${i + 1}</td>`;
      headers.forEach(h => {
        let v = row[h] || "";
        if (/tanggal/i.test(h) && v) v = fmtDate(v);
        if (h === "IMT") v = `<span>${v}</span>`;
        tr += `<td>${["DETEKSI_OBESITAS", "DETEKSI_HT", "DETEKSI_DM", "DETEKSI_STROKE", "RESIKO_ANEMIA"].includes(h) ? getBadge(v) : v}</td>`;
      });
      tr += "</tr>";
      tbody.append(tr);
    });
  }

  function loadData(params = "") {
    if (params && !params.startsWith("?")) params = "?" + params;

    $("#loadingOverlay").show();
    $("#skriningTable").DataTable().clear().destroy();
    $("#tableHeader").html(`<th style='width:80px;'>Aksi</th><th style='width:50px;'>No</th>`);

    fetch(scriptURL + params)
      .then(res => res.json())
      .then(json => {
        tableData = json.data || [];
        if (!tableData.length) {
          renderTable();
          $("#skriningTable").DataTable();
          $("#loadingOverlay").hide();
          return;
        }
        headers = Object.keys(tableData[0]).filter(h => h.toLowerCase() !== "no");
        headers.forEach(h => {
          $("#tableHeader").append(`<th>${h.replace(/_/g, " ")}</th>`);
        });
        renderTable();
        $("#skriningTable").DataTable({
          destroy: true,
          initComplete: () => {
            $("#loadingOverlay").hide();
          }
        });
      })
      .catch(err => {
        console.error(err);
        Swal.fire("Error", "Gagal memuat data", "error");
        $("#loadingOverlay").hide();
      });
  }

  // Tombol filter
  $("#filterBtn").click(function () {
    const start = $("#startDate").val();
    const end = $("#endDate").val();
    if (!start || !end) return Swal.fire("Peringatan", "Isi kedua tanggal filter", "warning");
    loadData(`startDate=${start}&endDate=${end}`);
  });

  // Tombol tampil semua
  $("#showAllBtn").click(function () {
    loadData(); // muat semua data
  });

  loadData();

  // Sisanya (Edit, Save, Export, Import, Rekap) tetap sama
  // ... Potongan kode lain tidak diubah

// Edit data
$(document).on("click", ".editBtn", function () {
  const idx = $(this).data("index");
  const data = tableData[idx];
  const form = $("#editForm").empty();

  // Simpan __rowIndex sebagai data atribut di tombol simpan
  const rowIndex = data.__rowIndex; // dari spreadsheet, baris asli (2, 3, dst.)
  $("#saveChangesBtn").data("rowIndex", rowIndex); // simpan untuk nanti dipakai saat simpan
  $("#saveChangesBtn").data("dataIndex", idx); // tetap simpan juga data index untuk referensi

  headers.forEach(h => {
    const v = data[h] || "";
    const ro = /^(IMT|DETEKSI|RESIKO)/.test(h) ? "readonly" : "";
    if (["MEROKOK", "ALKOHOL", "NARKOBA", "GANGGUAN MENTAL", "KEKERASAN"].includes(h)) {
      form.append(`
        <div class="row mb-3">
          <label class="col-sm-4 col-form-label">${h.replace(/_/g, " ")}</label>
          <div class="col-sm-8">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="${h}" value="Ya" ${v === "Ya" ? "checked" : ""} />
              <label class="form-check-label">Ya</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="${h}" value="Tidak" ${v === "Tidak" ? "checked" : ""} />
              <label class="form-check-label">Tidak</label>
            </div>
          </div>
        </div>`);
    } else {
      form.append(`
        <div class="row mb-3">
          <label class="col-sm-4 col-form-label">${h.replace(/_/g, " ")}</label>
          <div class="col-sm-8">
            <input type="text" class="form-control" name="${h}" value="${v}" ${ro} />
          </div>
        </div>`);
    }
  });

  hitungIMT(form);
  hitungDeteksi(form);
  form.find("input").on("input", () => {
    hitungIMT(form);
    hitungDeteksi(form);
  });

  new bootstrap.Modal(document.getElementById("editModal")).show();
});

// Save data
$("#saveChangesBtn").click(function () {
  const rowIndex = $(this).data("rowIndex"); // baris asli di spreadsheet (2, 3, dst.)
  if (!rowIndex) return Swal.fire("Error", "Baris asli tidak ditemukan!", "error");

  const obj = {
    action: "edit",
    index: parseInt(rowIndex) - 2 // konversi ke index array (0-based)
  };

  $("#editForm").serializeArray().forEach(f => obj[f.name] = f.value);

  Swal.fire({ title: 'Sedang mengirim…', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

  fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(obj)
  })
    .then(r => r.json())
    .then(res => {
      Swal.close();
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: res.message,
          timer: 1000,
          showConfirmButton: false
        }).then(() => location.reload());
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
      }
    })
    .catch(() => {
      Swal.close();
      Swal.fire('Error', 'Koneksi gagal', 'error');
    });
});


    // CSV EXPORT
    $("#exportCsvBtn").click(function () {
      if (!tableData.length) return Swal.fire('Info', 'Tidak ada data untuk diexport', 'info');
      const csvRows = [
        ['No', ...headers],
        ...tableData.map((row, i) => [
          i + 1,
          ...headers.map(k => row[k] ?? '')
        ])
      ];
      const csv = csvRows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'skrining_kesehatan.csv';
      link.click();
    });

    // CSV IMPORT
    $("#importCsvInput").change(function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        const text = evt.target.result;
        const lines = text.trim().split(/\r?\n/);
        const [headerLine, ...dataLines] = lines;
        const cols = headerLine.split(',').map(h => h.replace(/^"|"$/g, ''));
        const newRows = dataLines.map(line => {
          const vals = line.split(',').map(v => v.replace(/^"|"$/g, ''));
          const obj = {};
          cols.forEach((c, i) => {
            if (c === 'No') return;
            obj[c.replace(/ /g, '_')] = vals[i];
          });
          return obj;
        });

        newRows.forEach(nr => {
          const postObj = { action: 'add', ...nr };
          fetch(scriptURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(postObj)
          }).then(r => r.json()).then(res => {
            if (!res.success) console.error('Add failed:', res);
          });
          tableData.push(nr);
        });

        renderTable();
        $("#skriningTable").DataTable().clear().destroy();
        renderTable();
        $("#skriningTable").DataTable();
        Swal.fire({ icon: 'success', title: 'Import selesai', text: `${newRows.length} baris ditambahkan` });
        $(this).val('');
      };
      reader.readAsText(file);
    });
    function renderRekap(data) {
  const fields = [
    "DETEKSI_OBESITAS", "DETEKSI_HT", "DETEKSI_STROKE", "DETEKSI_JANTUNG",
    "CA_SERVIX", "CA_MAMAE", "CA_KOLORECTAL", "CA_PARU", "DETEKSI_DM",
    "SKRINING_PPOK", "SKRINING_GINJAL", "SKRINING_TALASEMIA", "TBC",
    "MALARIA", "HIV", "HEPATITIS_B", "HEPATITIS_C", "ADL"
  ];

  const rekap = {
    "< 60 Tahun": {},
    "≥ 60 Tahun": {}
  };

  data.forEach(row => {
    const usia = parseInt(row.UMUR || "0");
    const kategori = usia >= 60 ? "≥ 60 Tahun" : "< 60 Tahun";

    fields.forEach(f => {
      const val = (row[f] || "").trim();
      if (val && !["Normal", "Negatif", "-", ""].includes(val)) {
        rekap[kategori][f] = (rekap[kategori][f] || 0) + 1;
      }
    });
  });

  const tbody = $("#rekapBody").empty();
  fields.forEach(f => {
    const label = f.replace(/_/g, " ");
    const u60 = rekap["< 60 Tahun"][f] || 0;
    const u60plus = rekap["≥ 60 Tahun"][f] || 0;
    tbody.append(`<tr>
      <td>${label}</td>
      <td class="text-center">${u60}</td>
      <td class="text-center">${u60plus}</td>
    </tr>`);
  });
}

  });
