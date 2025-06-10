const scriptURL =
  "https://script.google.com/macros/s/AKfycbz_Zylub5VDIQhncW39y_dNjcCmcTedX70m3WWMFSvau0nx7AS0kFXq-S-ZJ3Mbqwiu/exec";

let globalData = [];

$(document).ready(function () {
  showLoading();

  fetch(scriptURL)
    .then((res) => res.json())
    .then((data) => {
      globalData = data;
      renderTable(data);
      hideLoading();
      showSuccessToast("Data berhasil dimuat.");
    })
    .catch((err) => {
      console.error("Gagal mengambil data:", err);
      hideLoading();
    });

  $("#addForm").on("submit", function (e) {
    e.preventDefault();

    Swal.fire({
      title: "Menyimpan...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const newData = {
      action: "add",
      Nama_laporan: $("#addNama").val(),
      Jenis_laporan: $("#addUsername").val(),
      No: $("#addNIP").val(),
      link_laporan: $("#addJabatan").val(),
    };

    const formData = new FormData();
    for (const key in newData) {
      formData.append(key, newData[key]);
    }

    fetch(scriptURL, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((res) => {
        Swal.close();
        if (res.success) {
          showSuccessToast("Data berhasil ditambahkan.");
          $("#addModal").modal("hide");
          globalData.push(newData);
          renderTable(globalData);
          $("#addForm")[0].reset();
        } else {
          Swal.fire("Gagal!", res.message, "error");
        }
      })
      .catch((err) => {
        Swal.close();
        Swal.fire("Error!", "Terjadi kesalahan saat menambahkan.", "error");
        console.error(err);
      });
  });

  $("#editForm").on("submit", function (e) {
    e.preventDefault();

    Swal.fire({
      title: "Menyimpan perubahan...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const index = $("#editIndex").val();
    const updatedData = {
      action: "edit",
      index: index,
      Nama_laporan: $("#editNama").val(),
      Jenis_laporan: $("#editUsername").val(),
      No: $("#editNIP").val(),
      link_laporan: $("#editJabatan").val(),
    };

    const formData = new FormData();
    for (const key in updatedData) {
      formData.append(key, updatedData[key]);
    }

    fetch(scriptURL, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((res) => {
        Swal.close();
        if (res.success) {
          showSuccessToast("Data berhasil diperbarui.");
          $("#editModal").modal("hide");
          globalData[index] = { ...globalData[index], ...updatedData };
          renderTable(globalData);
        } else {
          Swal.fire("Gagal!", res.message, "error");
        }
      })
      .catch((err) => {
        Swal.close();
        Swal.fire("Error!", "Terjadi kesalahan saat menyimpan.", "error");
        console.error(err);
      });
  });
});

function renderTable(data) {
  if ($.fn.DataTable.isDataTable("#karyawanTable")) {
    $("#karyawanTable").DataTable().destroy();
  }

  let tableBody = "";
  data.forEach((row, index) => {
    const link = row["link_laporan"];
    const linkHTML = link
      ? `<a href="${link}" target="_blank" class="badge bg-primary text-decoration-none">
            <i class="bi bi-link-45deg"></i> Kunjungi
          </a>`
      : `<span class="text-muted">-</span>`;

    tableBody += `
        <tr>
          <td>${row["No"] || ""}</td>
          <td>${row["Jenis_laporan"] || ""}</td>
          <td>${row["Nama_laporan"] || ""}</td>
          <td>${linkHTML}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editData(${index})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteData(${index})">Hapus</button>
          </td>
        </tr>`;
  });

  $("#karyawanTable tbody").html(tableBody);
  $("#karyawanTable").DataTable();
}

function editData(index) {
  const row = globalData[index];
  $("#editIndex").val(index);
  $("#editNama").val(row["Nama_laporan"]);
  $("#editUsername").val(row["Jenis_laporan"]);
  $("#editNIP").val(row["No"]);
  $("#editJabatan").val(row["link_laporan"]);
  $("#editModal").modal("show");
}

function deleteData(index) {
  const row = globalData[index];
  Swal.fire({
    title: `Hapus laporan "${row["Nama_laporan"]}"?`,
    text: "Data akan dihapus dari Google Sheet.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Menghapus...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("index", index);

      fetch(scriptURL, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((res) => {
          Swal.close();
          if (res.success) {
            Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
            globalData.splice(index, 1);
            renderTable(globalData);
          } else {
            Swal.fire("Gagal!", res.message, "error");
          }
        })
        .catch((err) => {
          Swal.close();
          Swal.fire("Error!", "Gagal menghapus data.", "error");
          console.error(err);
        });
    }
  });
}

function showSuccessToast(msg) {
  $("#toastBody").text(msg);
  const toastEl = document.getElementById("successToast");
  if (toastEl) {
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

function showLoading() {
  $("#karyawanTable tbody").html(
    `<tr><td colspan="5" class="text-center">Memuat data...</td></tr>`
  );
}
function hideLoading() {
  // Tidak perlu isi, renderTable akan overwrite
}
