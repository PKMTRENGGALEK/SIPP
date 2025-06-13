(() => {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbzpWRndkrfxD1MVUQnOD02ic2B7OS4sqZXdLjf9ASXmdbZgq2xgsD2oNFZqt1o2f1AX/exec";

  let globalData = [];

  $(document).ready(function () {
    showLoading();

    fetch(scriptURL)
      .then((res) => res.json())
      .then((data) => {
        globalData = data;
        renderTable(globalData);
        hideLoading();
        showSuccessToast("Data berhasil dimuat.");
      })
      .catch((err) => {
        console.error("Gagal mengambil data:", err);
        hideLoading();
      });

    // Submit form tambah
    $("#addForm").on("submit", function (e) {
      e.preventDefault();

      const newData = {
        action: "add",
        Name: $("#addNama").val().trim(),
        URL: $("#url").val().trim(),
      };

      if (!newData.Name || !newData.URL) {
        Swal.fire("Gagal", "Mohon isi semua field wajib.", "warning");
        return;
      }

      Swal.fire({
        title: "Menyimpan...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

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
            Swal.fire(
              "Gagal!",
              res.message || "Gagal menambahkan data.",
              "error"
            );
          }
        })
        .catch((err) => {
          Swal.close();
          Swal.fire(
            "Error!",
            "Terjadi kesalahan saat menambahkan data.",
            "error"
          );
          console.error(err);
        });
    });

    // Submit form edit
    $("#editForm").on("submit", function (e) {
      e.preventDefault();

      const index = $("#editIndex").val();
      const updatedData = {
        action: "edit",
        index: index,
        Name: $("#editNama").val().trim(),
        URL: $("#editURL").val().trim(),
      };

      Swal.fire({
        title: "Menyimpan perubahan...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

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
            Swal.fire(
              "Gagal!",
              res.message || "Gagal menyimpan data.",
              "error"
            );
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

    const tableBody = data
      .map((row, index) => {
        const nomor = index + 1;
        const link = row["URL"];
        const linkHTML = link
          ? `<a href="${link}" target="_blank" class="badge bg-success shadow text-decoration-none"><i class="bi bi-link-45deg"></i> Kunjungi</a>`
          : `<span class="text-muted">-</span>`;

        return `
      <tr>
        <td style="font-size: 15px;" class="text-center">${nomor}.</td>
        <td style="font-size: 15px;" class="text-start">${
          row["Name"] || ""
        }</td>
        <td style="font-size: 15px;" class="text-center">${linkHTML}</td>
        <td style="font-size: 15px;" class="text-center">
          <button class="btn btn-sm btn-warning shadow" onclick="editData(${index})">Edit</button>
          <button class="btn btn-sm btn-danger shadow" onclick="deleteData(${index})">Hapus</button>
        </td>
      </tr>`;
      })
      .join("");

    $("#karyawanTable tbody").html(tableBody);
    $("#karyawanTable").DataTable();
  }

  // Fungsi edit
  window.editData = function (index) {
    const row = globalData[index];
    $("#editIndex").val(index);
    $("#editNama").val(row["Name"]);
    $("#editURL").val(row["URL"]);

    $("#editModal").modal("show");
  };

  // Fungsi hapus
  window.deleteData = function (index) {
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
              Swal.fire(
                "Gagal!",
                res.message || "Gagal menghapus data.",
                "error"
              );
            }
          })
          .catch((err) => {
            Swal.close();
            Swal.fire("Error!", "Gagal menghapus data.", "error");
            console.error(err);
          });
      }
    });
  };

  // Toast sukses
  function showSuccessToast(msg) {
    $("#toastBody").text(msg);
    const toastEl = document.getElementById("successToast");
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
  // Loading
  function showLoading() {
    const colCount = $("#karyawanTable thead th").length;
    $("#karyawanTable tbody").html(`
      <tr>
        <td colspan="${colCount}" class="text-center">
          <div class="spinner-border spinner-border-sm text-primary me-1" role="status"></div>
          Memuat data...
        </td>
      </tr>
    `);
  }

  function hideLoading() {
    // Tidak perlu isi, karena renderTable akan overwrite.
  }
})();
