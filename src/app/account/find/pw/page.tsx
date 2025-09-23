import FindPW from "@/components/account/FindPW";
import FindTabs from "@/components/account/FindTabs";

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen max-w-[560px] px-5 py-16">
        <h1 className="mb-6 text-center text-xl font-bold">계정 찾기</h1>
        <FindTabs />
        <FindPW />
      </section>
    </main>
  );
}
