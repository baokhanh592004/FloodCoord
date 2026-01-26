export default function Home() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-600">
        Hệ thống hỗ trợ cứu hộ lũ lụt
      </h2>

      <p className="text-gray-700">
        Nền tảng giúp người dân gửi yêu cầu cứu hộ nhanh chóng,
        hỗ trợ điều phối lực lượng và cứu trợ kịp thời trong
        các tình huống thiên tai khẩn cấp.
      </p>

      <button className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
        Gửi yêu cầu cứu hộ
      </button>
    </section>
  );
}
