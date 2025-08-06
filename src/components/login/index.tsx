import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1>Cerdas Isyarat</h1>
        <h2>Belajar Bahasa Isyarat Asik</h2>
      </div>

      <div className="mx-auto flex w-2/4 flex-col justify-center rounded-xl border p-8">
        <div className="mb-4 text-center">Login</div>
        <form action="">
          <div className="mb-4 flex flex-col gap-2">
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
          </div>
          <div className="mb-4 flex justify-between gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="remember" id="remember" />
              <label htmlFor="remember">ingat saya</label>
            </div>
            <Link href={''} className="cursor-pointer underline">
              lupa password?
            </Link>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full rounded-lg border bg-gray-100 p-2"
            >
              Masuk
            </button>
          </div>
        </form>

        <div className="mt-4">
          Belum punya akun?{' '}
          <span className="rounded-full bg-gray-100 px-2 py-1">
            Daftar Sekarang
          </span>
        </div>
      </div>
    </>
  );
}
