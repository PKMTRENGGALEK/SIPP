const scriptURL = "https://script.google.com/macros/s/AKfycbzmF_vUD7lNBpc6blb1X0B-2hSwcPz8vUI_Kb4rha-5JNpQ7_NvLFmMpk0y9Nf78cU2zQ/exec";

document.addEventListener("DOMContentLoaded", function () {
  // Ambil `nip` dari hash URL
  const queryString = window.location.hash.split("?")[1];
  const params = new URLSearchParams(queryString);
  const nip = params.get("nip");

  if (nip) {
    document.querySelector('input[name="NIP"]').value = decodeURIComponent(nip);
  }

  const form = document.getElementById("formPangkat");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const file = formData.get("FILE");

    if (!file || file.size === 0) {
      Swal.fire("Gagal", "File belum dipilih!", "error");
      return;
    }

    Swal.fire({
      title: "Simpan Data?",
      text: "Data dan file akan dikirim ke server.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(scriptURL, {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              Swal.fire("Berhasil", "Data berhasil disimpan.", "success").then(() => {
                window.history.back(); // Kembali ke halaman sebelumnya
              });
            } else {
              Swal.fire("Gagal", res.message || "Terjadi kesalahan.", "error");
            }
          })
          .catch((err) => {
            console.error("Error:", err);
            Swal.fire("Gagal", "Gagal mengirim data ke server.", "error");
          });
      }
    });
  });
});
