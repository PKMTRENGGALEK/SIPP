(() => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbzv7hK23jFpuh6swh5aYWekPytcIqK_VmjFYHNS5Kyvuz6RAHeRTZepwTMeYg4FKJ0j/exec";
  let globalData = [];

  // Langsung jalan (tanpa DOMContentLoaded)
  showLoading();

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
    });

  document.getElementById("pinForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const pin = document.getElementById("pinInput").value;
    const nip = document.getElementById("selectedNIP").value;

    const correctPIN = "1234";

    if (pin === correctPIN) {
      location.hash = `profile_individu.html?nip=${encodeURIComponent(nip)}`;
      bootstrap.Modal.getInstance(document.getElementById("pinModal")).hide();
    } else {
      Swal.fire("PIN Salah", "Silakan coba lagi.", "error");
    }
  });

  function renderTable(data) {
    data.sort((a, b) => (a.NAMA || "").localeCompare(b.NAMA || ""));

    const table = $("#datatable-individu");
    if ($.fn.DataTable.isDataTable(table)) table.DataTable().destroy();

    const rows = data.map((row) => {
      return `<tr>
        <td>${row.NAMA || ""}</td>
        <td>${row.NIP || ""}</td>
        <td>${row.JABATAN || ""}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-warning shadow" onclick="showPinModal('${row.NIP}')">
            <i class="bi bi-person"></i> View Profile
          </button>
        </td>
      </tr>`;
    }).join("");

    document.querySelector("#datatable-individu tbody").innerHTML = rows;
    table.DataTable({ order: [[0, "asc"]] });
  }

  window.showPinModal = function(nip) {
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
    document.querySelector("#datatable-individu tbody").innerHTML =
      `<tr><td colspan="4" class="text-center">Memuat data...</td></tr>`;
  }
})();
