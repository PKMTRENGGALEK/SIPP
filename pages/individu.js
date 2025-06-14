(() => {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbwoeeV-PJaEL_GB1s39IrA9yGSfiYBF99n69DzLIrcq_QKOykEWwA58DIW7RSPBkwOzBw/exec";
  let globalData = [];

  showLoading(); // Tampilkan baris loading

  fetch(scriptURL)
    .then((res) => res.json())
    .then((data) => {
      globalData = data;
      renderTable(data);
      showSuccessToast("Data berhasil dimuat.");
    })
    .catch((err) => {
      console.error("Gagal mengambil data:", err);
      showErrorToast("Gagal mengambil data.");
      showLoading(false); // tampilkan pesan gagal jika mau
    });

  document.getElementById("pinForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const pin = document.getElementById("pinInput").value;
    const nip = document.getElementById("selectedNIP").value;

    const karyawan = globalData.find((item) => item.NIP === nip);

    if (karyawan && karyawan.PIN === pin) {
      location.hash = `profile_individu.html?nip=${encodeURIComponent(nip)}`;
      bootstrap.Modal.getInstance(document.getElementById("pinModal")).hide();
    } else {
      Swal.fire("PIN Salah", "Silakan coba lagi.", "error");
    }

  });

  function renderTable(data) {
  const table = $("#datatable-individu");

  if ($.fn.DataTable.isDataTable(table)) {
    table.DataTable().destroy();
  }

  const rows = data
    .map((row, index) => {
      return `<tr>
        <td class="text-center" style="font-size:12px">${index + 1}</td> <!-- Nomor Urut -->
        <td style="font-size:12px">${row.NAMA || ""}</td>
        <td style="font-size:12px">${row.NIP || ""}</td>
        <td style="font-size:12px">${row.JABATAN || ""}</td>
        <td class="text-center" style="font-size:12px">
          <button class="btn btn-sm btn-warning shadow" onclick="showPinModal('${row.NIP}')" style="font-size:12px">
            <i class="bi bi-person"></i> View Profile
          </button>
        </td>
      </tr>`;
    })
    .join("");

  document.querySelector("#datatable-individu tbody").innerHTML = rows;

  table.DataTable({
    ordering: false
  });
}


  window.showPinModal = function (nip) {
    document.getElementById("selectedNIP").value = nip;
    document.getElementById("pinInput").value = "";
    const modal = new bootstrap.Modal(document.getElementById("pinModal"));
    modal.show();
  };

  function showSuccessToast(msg) {
    document.getElementById("toastBody").textContent = msg;
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast._element.classList.remove("bg-danger");
    toast._element.classList.add("bg-success");
    toast.show();
  }

  function showErrorToast(msg) {
    document.getElementById("toastBody").textContent = msg;
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast._element.classList.remove("bg-success");
    toast._element.classList.add("bg-danger");
    toast.show();
  }

  function showLoading() {
    const tbody = document.querySelector("#datatable-individu tbody");
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">
          <div class="d-flex justify-content-center align-items-center gap-2">
            <div class="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></div>
            <span>Memuat data...</span>
          </div>
        </td>
      </tr>`;
  }
})();
