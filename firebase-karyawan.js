import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRIdHfyGbhGThYH6G4giH4kXiFFIB6buw",
  authDomain: "data-karyawan-8a828.firebaseapp.com",
  databaseURL: "https://data-karyawan-8a828-default-rtdb.firebaseio.com",
  projectId: "data-karyawan-8a828",
  storageBucket: "data-karyawan-8a828.firebasestorage.app",
  messagingSenderId: "651382600587",
  appId: "1:651382600587:web:e6df00e7dc61cd1348f58e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const karyawanRef = ref(db, 'pegawai');
const tbody = document.getElementById('tabel-karyawan');

onValue(karyawanRef, (snapshot) => {
  const data = snapshot.val();
  tbody.innerHTML = '';

  if (data) {
    let no = 1;
    let html = '';

    Object.keys(data).forEach((key) => {
      const k = data[key];
      html += `
        <tr>
          <td>${no++}</td>
          <td>${k.nama || '-'}</td>
          <td>${k.nip || '-'}</td>
          <td>${k.jabatan || '-'}</td>
          <td>${k.unit_kerja || '-'}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Inisialisasi DataTables (harus setelah isi data selesai dimuat)
    setTimeout(() => {
      $('#datatable-karyawan').DataTable({
        language: {
          url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/id.json'
        }
      });
    }, 100);

  } else {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Data tidak ditemukan.</td></tr>';
  }
});
