// Import Firebase modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  remove,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpXgf8T4-yYEY1RSNbhvhV68-lqYvTe4Y",
  authDomain: "linklaporan-3e0d1.firebaseapp.com",
  databaseURL:
    "https://linklaporan-3e0d1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "linklaporan-3e0d1",
  storageBucket: "linklaporan-3e0d1.appspot.com",
  messagingSenderId: "469644936831",
  appId: "1:469644936831:web:1d2723ce57df0f700be14a",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const laporanRef = ref(db, "laporan");

// Menampilkan data dari database ke tabel
onValue(laporanRef, (snapshot) => {
  const tbody = document.querySelector("#tabelLink tbody");
  let rows = "";
  let index = 1;

  snapshot.forEach((childSnap) => {
    const data = childSnap.val();
    const key = childSnap.key;

    // Hanya tampilkan entri yang punya Nama_laporan dan Jenis_laporan
    if (data && (data.Nama_laporan || data.Jenis_laporan)) {
      rows += `
        <tr>
          <td>${index++}</td>
          <td>${data.Nama_laporan || ""}</td>
          <td>${data.Jenis_laporan || ""}</td>
          <td>${
            data.link
              ? `<a href="${data.link}" target="_blank" rel="noopener noreferrer">Lihat</a>`
              : ""
          }</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="hapusData('${key}')">Hapus</button>
          </td>
        </tr>
      `;
    }
  });

  tbody.innerHTML = rows;
});

// Fungsi tambah data
document
  .getElementById("formTambahLink")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const nama = document.getElementById("inputNama").value.trim();
    const jenis = document.getElementById("inputJenis").value.trim();
    const link = document.getElementById("inputLink").value.trim();

    if (!nama || !jenis) {
      alert("Nama dan Jenis Laporan wajib diisi");
      return;
    }

    try {
      await push(laporanRef, {
        Nama_laporan: nama,
        Jenis_laporan: jenis,
        link: link || "",
      });

      alert("Data berhasil ditambah");
      e.target.reset();

      // Tutup modal Bootstrap
      const modalEl = document.getElementById("modalTambahLink");
      if (modalEl) {
        const modal =
          bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
      }
    } catch (error) {
      console.error("Gagal menambah data:", error);
      alert("Terjadi kesalahan saat menambah data.");
    }
  });

// Fungsi hapus data
window.hapusData = async function (key) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    try {
      await remove(ref(db, "laporan/" + key));
      alert("Data berhasil dihapus");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  }
};
