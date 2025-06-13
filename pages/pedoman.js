(() => {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbwza69B5neACyqTIuFD8wVWOLUtWwItCjLFiqKtrNtUxnMMpzv-yeWP0W1wGtZ02LLn/exec";
  let pedomanData = [];
  let selectedIndex = -1;

  $(document).ready(function () {
    loadPedoman();

    $("#btnDeleteConfirm").click(function () {
      deletePedoman(selectedIndex);
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("confirmDeleteModal")
      );
      modal.hide();
    });
  });

  function showLoading() {
    const colCount = $("#pedomanTable thead th").length;
    const tds = Array(colCount).fill("<td></td>");
    tds[0] = `<td class="text-center" colspan="${colCount}">
                <div class="spinner-border spinner-border-sm text-primary me-1" role="status"></div>
                Memuat data mohon tunggu......
              </td>`;
    $("#pedomanTable tbody").html(`<tr>${tds.join("")}</tr>`);
  }

  function loadPedoman() {
    showLoading();
    fetch(scriptURL)
      .then((res) => res.json())
      .then((data) => {
        pedomanData = data;
        renderPedomanTable(data);
      })
      .catch((err) => {
        console.error("Gagal memuat data:", err);
        showToast("Gagal memuat data.");
      });
  }

  function renderPedomanTable(data) {
    if ($.fn.DataTable.isDataTable("#pedomanTable")) {
      $("#pedomanTable").DataTable().destroy();
    }

    let tbody = "";
    data.forEach((item, index) => {
      const link = item.fileUrl || "#";
      const nama = item.namaFile || "-";
      const ket = item.keterangan || "-";
      const size = item.ukuran || "-";
      const created = item.created || "-";

      tbody += `
      <tr>
        <td>${index + 1}</td>
        <td><i class="bi bi-file-earmark-pdf-fill text-danger me-1"></i>${nama}</td>
        <td>${ket}</td>
        <td>${size}</td>
        <td>${created}</td>
        <td>
          <a href="${link}" class="btn btn-sm btn-success" target="_blank" title="Lihat"><i class="bi bi-eye"></i></a>
          <a href="${link}" class="btn btn-sm btn-primary" target="_blank" download title="Unduh"><i class="bi bi-download"></i></a>
          <button class="btn btn-sm btn-danger" onclick="confirmDelete(${index})" title="Hapus"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
    });

    $("#pedomanTable tbody").html(tbody);
    $("#pedomanTable").DataTable();
  }

  function confirmDelete(index) {
    selectedIndex = index;
    const modal = new bootstrap.Modal(
      document.getElementById("confirmDeleteModal")
    );
    modal.show();
  }

  function deletePedoman(index) {
    fetch(scriptURL, {
      method: "POST",
      body: new URLSearchParams({
        action: "delete",
        index: index,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          showToast("Data berhasil dihapus.");
          pedomanData.splice(index, 1);
          renderPedomanTable(pedomanData);
        } else {
          showToast("Gagal menghapus data.");
        }
      })
      .catch((err) => {
        console.error("Error hapus:", err);
        showToast("Terjadi kesalahan.");
      });
  }

  function showToast(msg) {
    $("#toastBody").text(msg);
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast.show();
  }

  $("#addForm").submit(function (e) {
    e.preventDefault();
    const fileInput = document.getElementById("addFile");
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
      const base64 = reader.result.split(",")[1];
      const formData = new FormData();
      formData.append("action", "add");
      formData.append("filename", file.name);
      formData.append("file", base64);
      formData.append("mimeType", file.type);
      formData.append("keterangan", $("#addKeterangan").val());
      formData.append("namaFile", $("#addNamaFile").val());

      Swal.fire({
        title: "Mengunggah...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      fetch(scriptURL, { method: "POST", body: formData })
        .then((res) => res.json())
        .then((res) => {
          Swal.close();
          if (res.success) {
            $("#addForm")[0].reset();
            bootstrap.Modal.getInstance(
              document.getElementById("addModal")
            ).hide();
            showToast("Data berhasil ditambahkan.");
            loadPedoman();
          } else {
            Swal.fire("Gagal", res.message, "error");
          }
        })
        .catch((err) => {
          Swal.close();
          Swal.fire("Error", "Terjadi kesalahan.", "error");
          console.error(err);
        });
    };
    reader.readAsDataURL(file);
  });
})();
