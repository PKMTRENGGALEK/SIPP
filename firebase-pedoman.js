import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBP3eTRyCobawB_VrpP2dfD8LnYVRnrwgs",
  authDomain: "pedoman-8d3f3.firebaseapp.com",
  databaseURL: "https://pedoman-8d3f3-default-rtdb.firebaseio.com",
  projectId: "pedoman-8d3f3",
  storageBucket: "pedoman-8d3f3.appspot.com",
  messagingSenderId: "27872922810",
  appId: "1:27872922810:web:a3761c12fa8f70dd630683",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dataRef = ref(db, "pedoman");

// Load data dari Firebase dan render ke tabel
onValue(dataRef, (snapshot) => {
  const tabel = document.getElementById("tabel-pedoman");
  let rows = "";
  let index = 1;

  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    const key = childSnapshot.key;

    rows += `
      <tr>
        <td>${index++}</td>
        <td class="fw-bold">${data.keterangan}</td>
        <td>
          <img src="https://cdn-icons-png.flaticon.com/512/337/337946.png" alt="PDF" width="50" class="me-3 ">
          <strong>${data.namaFile}</strong><br>
          File size: ${data.ukuran}<br>
          Created: ${data.created}<br>
          <a href="${
            data.fileUrl
          }" target="_blank" class="btn btn-secondary btn-sm mt-2 shadow">👁 Preview</a>
          <button class="btn btn-danger btn-sm mt-2 shadow" onclick="hapusData('${key}')">🗑 Hapus</button>
        </td>
      </tr>
    `;
  });

  // Hapus dan inisialisasi ulang DataTable
  if ($.fn.DataTable.isDataTable("#table-pedoman")) {
    $("#table-pedoman").DataTable().clear().destroy();
  }

  tabel.innerHTML = rows;

  $("#table-pedoman").DataTable({
    pageLength: 5,
    language: {
      search: "Cari:",
      lengthMenu: "Tampilkan _MENU_ data",
      zeroRecords: "Data tidak ditemukan",
      info: "Menampilkan _START_ - _END_ dari _TOTAL_ data",
      paginate: {
        first: "Pertama",
        last: "Terakhir",
        next: "→",
        previous: "←",
      },
    },
  });
});

// Fungsi untuk hapus data
window.hapusData = function (key) {
  Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "File ini akan dihapus dari database!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      remove(ref(db, "pedoman/" + key));
      Swal.fire("Terhapus!", "File berhasil dihapus.", "success");
    }
  });
};

// Fungsi tambah data
document
  .getElementById("formTambah")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const ket = document.getElementById("keterangan").value.trim();
    const file = document.getElementById("filepdf").files[0];

    if (!file) {
      return Swal.fire("Gagal", "File belum dipilih", "error");
    }

    if (file.type !== "application/pdf") {
      return Swal.fire("Gagal", "Hanya file PDF yang diperbolehkan", "error");
    }

    if (file.size > 2 * 1024 * 1024) {
      return Swal.fire("Gagal", "Ukuran file maksimal 2MB", "error");
    }

    Swal.fire({
      title: "Mengupload...",
      text: "Harap tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const reader = new FileReader();
    reader.onloadend = async function () {
      const base64File = reader.result.split(",")[1];
      const formData = new FormData();
      formData.append("file", base64File);
      formData.append("nama", file.name);

      const uploadUrl =
        "https://script.google.com/macros/s/AKfycbz3kl1UVWF028J7lJT8UxikcJmHVgElgybW3PmeUSX6WN7Xk-7OybzLORGmRbESnbQ/exec";

      try {
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (result.status === "success") {
          const newRef = push(dataRef);
          const tanggal = new Date().toLocaleDateString("id-ID");
          const ukuranKB = (file.size / 1024).toFixed(2) + " KB";

          await set(newRef, {
            keterangan: ket,
            namaFile: file.name,
            ukuran: ukuranKB,
            created: tanggal,
            fileUrl: result.fileUrl,
          });

          Swal.fire("Berhasil", "Pedoman berhasil ditambahkan", "success");
          document.getElementById("formTambah").reset();
          $("#modalTambah").modal("hide");
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Gagal menyimpan file", "error");
      }
    };

    reader.readAsDataURL(file);
  });
