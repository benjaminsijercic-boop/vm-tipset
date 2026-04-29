export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="bg-white rounded-2xl shadow-sm border p-5">
    <h2 className="font-bold text-lg mb-4">{title}</h2>
    {children}
  </section>;
}
