
(() => {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbwoeeV-PJaEL_GB1s39IrA9yGSfiYBF99n69DzLIrcq_QKOykEWwA58DIW7RSPBkwOzBw/exec";
  const container = document.getElementById("profil-container");

  const nip = window.pageQuery?.nip;
  if (!nip) {
    container.innerHTML = `<div class="alert alert-danger">NIP tidak ditemukan.</div>`;
    return;
  }

  // Tampilkan loading
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center my-5 gap-2">
      <div class="spinner-border text-primary" role="status"></div>
      <strong>Sedang memuat data pegawai...</strong>
    </div>`;

  // Format Tanggal Indonesia
  function formatTanggalIndonesia(dateStr) {
    const tanggal = new Date(dateStr);
    if (isNaN(tanggal)) return "-";
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return tanggal.toLocaleDateString('id-ID', options);
  }

  // Hitung Umur dari tanggal lahir
  function hitungUmur(dateStr) {
    const lahir = new Date(dateStr);
    if (isNaN(lahir)) return "-";
    const today = new Date();
    let umur = today.getFullYear() - lahir.getFullYear();
    const m = today.getMonth() - lahir.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < lahir.getDate())) {
      umur--;
    }
    return `${umur} tahun`;
  }

  fetch(scriptURL)
    .then((res) => res.json())
    .then((data) => {
      const pegawai = data.find((item) => item.NIP === nip);
      if (!pegawai) {
        container.innerHTML = `<div class="alert alert-warning">Data pegawai dengan NIP <strong>${nip}</strong> tidak ditemukan.</div>`;
        return;
      }

      container.innerHTML = `
        <div class="text-center">
          <img src="Assets/garuda.png" class="garuda" width="10%" />
          <h5 class="mt-2">KARTU INDUK</h5>
          <h5>KEPEGAWAIAN SIPIL</h5>
        </div>

        <h6 class="section-title fw-bold">I. KETERANGAN PERORANGAN</h6>
        <table class="table table-borderless">
          <tr><td>1. Nama Lengkap</td><td>: ${pegawai.NAMA}</td></tr>
          <tr><td>2. NIP / No. Karpeg</td><td>: ${pegawai.NIP} ${pegawai.NOKARPEG ? "/ " + pegawai.NOKARPEG : ""}</td></tr>
          <tr><td>3. Tempat, Tgl. Lahir / Umur</td><td>: ${pegawai.TEMPAT_LAHIR} ${formatTanggalIndonesia(pegawai.TGL_LAHIR)} / ${hitungUmur(pegawai.TGL_LAHIR)}</td></tr>
          <tr><td>4. Jenis Kelamin</td><td>: ${pegawai.JK}</td></tr>
          <tr><td>5. Status Perkawinan</td><td>: ${pegawai.STATUS || "-"}</td></tr>
          <tr><td>6. Agama</td><td>: ${pegawai.AGAMA || "-"}</td></tr>
          <tr><td>7. Pangkat (Gol. Ruang / TMT)</td><td>: ${pegawai.GOL || "-"} / ${formatTanggalIndonesia(pegawai.TMT_GOL || "-")}</td></tr>
          <tr><td>8. Jabatan Sekarang / Eselon</td><td>: ${pegawai.JABATAN} / ${pegawai.ESELON || "-"}</td></tr>
          <tr><td>9. Pendidikan Terakhir / Tahun</td><td>: ${pegawai.IJAZAH || "-"} / ${pegawai.LULUS_TAHUN || "-"}</td></tr>
          <tr><td>10. Diklat Penjenjangan</td><td>: ${pegawai.DIKLAT_PENJENJANGAN || "-"}</td></tr>
          <tr><td>11. Alamat Rumah / No. Telepon</td><td>: ${pegawai.ALAMAT || "-"} / / ${pegawai.NO_TELP || "-"}</td></tr>
        </table>

        <h6 class="section-title fw-bold">II. RIWAYAT JABATAN</h6>
        <table class="table table-bordered text-center">
          <thead>
            <tr>
              <th>No.</th>
              <th>Jabatan / Tugas Pokok</th>
              <th colspan="2">TGL / BLN / THN</th>
              <th colspan="3">Surat Keputusan</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th>Dari</th>
              <th>S/D</th>
              <th>Pejabat</th>
              <th>Tanggal</th>
              <th>Nomor</th>
            </tr>
          </thead>
          <tbody>
            ${
              pegawai.RIWAYAT_JABATAN?.map((jab, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${jab.JABATAN}</td>
                  <td>${jab.DARI}</td>
                  <td>${jab.SD}</td>
                  <td>${jab.PEJABAT}</td>
                  <td>${jab.TANGGAL}</td>
                  <td>${jab.NOMOR}</td>
                </tr>
              `).join("") || `<tr><td colspan="7">Data belum tersedia</td></tr>`
            }
          </tbody>
        </table>
      `;
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML = `<div class="alert alert-danger">Gagal mengambil data.</div>`;
    });
})();
