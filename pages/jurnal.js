const endpoint =
  "https://script.google.com/macros/s/AKfycbxzWttRJ2l31ZQl6T_5zNWpSFo-oGcVbSVtQPSS5qTcFDdIsUT7j3Ri4B7vO8EASjlBoA/exec";

// Fungsi loading spinner
function showLoading() {
  $("#loading").show();
}
function hideLoading() {
  $("#loading").hide();
}

// Ambil dan tampilkan data jurnal
function loadJurnal() {
  showLoading();

  fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      let html = "";
      data.reverse().forEach((row) => {
        const judul = row["judul"] || "-";
        const tanggal = row["tanggal"]
          ? new Date(row["tanggal"]).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-";
        const isi = row["isi"] || "";
        const gambar = row["fileUrl"] || "";
        const author = row["author"] || "-";

        let imageUrl = "";
        if (gambar.startsWith("https://drive.google.com/uc?")) {
          imageUrl = gambar;
        } else {
          const match = gambar.match(/\/d\/([a-zA-Z0-9_-]+)\//);
          if (match && match[1]) {
            imageUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
          }
        }

        html += `
          <div class="col-12 mb-4">
            <div class="card border-0 shadow flex-md-row h-100">
              ${
                imageUrl
                  ? `
              <div class="col-md-4">
                <div class="position-relative h-100">
                  <img src="${imageUrl}" class="img-fluid h-100 w-100 object-fit-cover rounded-start" alt="Gambar Jurnal" />
                  <span class="badge bg-primary position-absolute top-0 start-0 m-2">INFORMASI</span>
                </div>
              </div>
              `
                  : ""
              }

              <div class="col p-4 d-flex flex-column justify-content-between">
                <div>
                  <h5 class="fw-bold">${judul}</h5>
                  <div class="mb-2 text-muted small">
                    <i class="bi bi-calendar-event"></i> ${tanggal} &nbsp;
                    <i class="bi bi-person-circle"></i> ${author}
                  </div>
                  <p class="card-text">${isi.substring(0, 200)}...</p>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      document.getElementById("jurnal-list").innerHTML = html;
      hideLoading();
    })
    .catch((err) => {
      console.error("Gagal memuat data:", err);
      document.getElementById("jurnal-list").innerHTML =
        "<p class='text-danger'>Gagal memuat data jurnal.</p>";
      hideLoading();
    });
}

// Upload data jurnal
$("#jurnalForm").on("submit", async function (e) {
  e.preventDefault();

  const judul = $("#judul").val().trim();
  const isi = $("#isi").val().trim();
  const author = $("#author").val().trim();
  const fileInput = document.getElementById("fileInput");

  if (!judul || !isi || !author || !fileInput.files[0]) {
    alert("Semua kolom wajib diisi!");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async function () {
    const base64Data = reader.result.split(",")[1];

    const data = {
      action: "add",
      judul: judul,
      isi: isi,
      author: author,
      file: base64Data,
      filename: fileInput.files[0].name,
      mimeType: fileInput.files[0].type,
    };

    const formBody = new URLSearchParams(data);

    try {
      showLoading();
      const response = await fetch(endpoint, {
        method: "POST",
        body: formBody,
      });

      const result = await response.json();
      hideLoading();
      alert(result.message);

      if (result.success) {
        $("#jurnalForm")[0].reset();
        $("#jurnalModal").modal("hide");
        loadJurnal();
      }
    } catch (error) {
      hideLoading();
      alert("Terjadi kesalahan saat mengirim data.");
      console.error(error);
    }
  };

  reader.readAsDataURL(fileInput.files[0]);
});

// Load awal
loadJurnal();
