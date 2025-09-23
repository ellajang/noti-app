import FindId from "@/components/account/FIndID";
import FindTabs from "@/components/account/FindTabs";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-center">
      <section className="mx-auto min-h-screen max-w-[560px] px-5 py-16">
        <FindTabs />
        <FindId />
      </section>
    </main>
  );
}
