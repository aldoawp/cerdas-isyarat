export default function RegisterPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1>Cerdas Isyarat</h1>
        <h2>Belajar Bahasa Isyarat Asik</h2>
      </div>

      <div className="mx-auto flex w-2/4 flex-col justify-center rounded-xl border p-8">
        <div className="mb-4 text-center">Daftar</div>
        <form action="">
          <div className="mb-4 flex flex-col gap-2">
            <input
              type="text"
              placeholder="nama lengkap"
              className="border p-2"
            ></input>
            <input
              type="text"
              placeholder="umur"
              className="border p-2"
            ></input>
            <input
              type="text"
              placeholder="username"
              className="border p-2"
            ></input>
            <input
              type="text"
              placeholder="password"
              className="border p-2"
            ></input>
            <input
              type="text"
              placeholder="konfirmasi password"
              className="border p-2"
            ></input>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full rounded-lg border bg-gray-100 p-2"
            >
              buat akun
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
