(() => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbwW1nhYeqXPU9_yrGah6eZFtGA-22Wk0YXBTcpm-ZxejA5ZYN4H1fhhifoaLUXBTihn/exec";
  let globalData = [];

  function showLoading() {
    document.getElementById("skTableBody").innerHTML = `
      <tr><td colspan="7" class="text-center text-muted">
        <div class="d-flex justify-content-center align-items-center gap-2">
          <div class="spinner-border text-primary spinner-border-sm"></div>
          <span>Memuat data...</span>
        </div>
      </td></tr>`;
  }

  function showSuccessToast(msg) {
    document.getElementById("toastBody").innerText = msg;
    new bootstrap.Toast(document.getElementById("successToast")).show();
  }

  function renderTable(data) {
  const grouped = {};
  data.forEach((row, i) => {
    const pelayanan = row["NAMA PELAYANAN/ PROGRAM"] || "Tanpa Kategori";
    if (!grouped[pelayanan]) grouped[pelayanan] = [];
    grouped[pelayanan].push({ ...row, _originalIndex: i }); // Simpan index asli
  });

  let html = "";
  Object.entries(grouped).forEach(([group, rows]) => {
    html += `<tr class="table-secondary"><td colspan="7"><strong>${group}</strong></td></tr>`;
    rows.forEach(row => {
      html += `
        <tr>
          <td>${row["NO. DOKUMEN"] || ""}</td>
          <td>${row["NAMA PELAYANAN/ PROGRAM"] || ""}</td>
          <td>${row["JUDUL SK"] || ""}</td>
          <td>${row["REVISI"] || ""}</td>
          <td>${row["PENERBIT SK"] || ""}</td>
          <td>${row["LINK"] ? `<a href="${row["LINK"]}" target="_blank" class="badge bg-danger ">
			<i class='fas fa-file-pdf'></i> view </a>` : "-"}</td>
          <td><button class="btn btn-sm btn-warning" onclick="editData(${row._originalIndex})">Edit</button></td>
        </tr>`;
    });
  });

  document.getElementById("skTableBody").innerHTML = html;
}

  function loadData() {
    showLoading();
    fetch(scriptURL)
      .then(res => res.json())
      .then(data => {
        globalData = data;
        renderTable(data);
        showSuccessToast("Data berhasil dimuat.");
      })
      .catch(() => {
        document.getElementById("skTableBody").innerHTML = `<tr><td colspan="7" class="text-center text-danger">Gagal memuat data.</td></tr>`;
      });
  }

  async function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
  }

  document.getElementById("skForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const action = document.getElementById("formAction").value || "add";
    const index = document.getElementById("formIndex").value;
    const fileInput = document.getElementById("formFile");
    const file = fileInput.files[0];

    const formData = new URLSearchParams();
    formData.append("action", action);
    formData.append("index", index);
    formData.append("NO. DOKUMEN", document.getElementById("formNo").value);
    formData.append("NAMA PELAYANAN/ PROGRAM", document.getElementById("formPelayanan").value);
    formData.append("JUDUL SK", document.getElementById("formJudul").value);
    formData.append("REVISI", document.getElementById("formRevisi").value);
    formData.append("PENERBIT SK", document.getElementById("formPenerbit").value);

    if (file) {
      formData.append("fileName", file.name);
      formData.append("mimeType", file.type);
      formData.append("file", await toBase64(file));
    }

    Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    fetch(scriptURL, {
      method: "POST",
      body: formData
    })
      .then(r => r.json())
      .then(res => {
        Swal.close();
        if (res.success) {
          bootstrap.Modal.getInstance(document.getElementById("modalForm")).hide();
          loadData();
          showSuccessToast(res.message || "Berhasil!");
        } else {
          Swal.fire("Gagal", res.message, "error");
        }
      })
      .catch(() => {
        Swal.close();
        Swal.fire("Error", "Tidak dapat mengirim data", "error");
      });
  });

  window.editData = (index) => {
    const row = globalData[index];
    document.getElementById("formAction").value = "edit";
    document.getElementById("formIndex").value = index;
    document.getElementById("formNo").value = row["NO. DOKUMEN"];
    document.getElementById("formPelayanan").value = row["NAMA PELAYANAN/ PROGRAM"];
    document.getElementById("formJudul").value = row["JUDUL SK"];
    document.getElementById("formRevisi").value = row["REVISI"];
    document.getElementById("formPenerbit").value = row["PENERBIT SK"];
    document.getElementById("formFile").value = "";
    new bootstrap.Modal(document.getElementById("modalForm")).show();
  };

  document.getElementById("searchInput").addEventListener("input", function () {
    const val = this.value.toLowerCase();
    const filtered = globalData.filter(row =>
      Object.values(row).join(" ").toLowerCase().includes(val)
    );
    renderTable(filtered);
  });

  window.resetForm = () => {
    document.getElementById("skForm").reset();
    document.getElementById("formAction").value = "add";
    document.getElementById("formIndex").value = "";
  };

  loadData();
})();
