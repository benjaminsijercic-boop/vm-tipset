export function Leaderboard({ rows }: { rows: Array<{ name: string; points: number }> }) {
  return <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead><tr className="text-left border-b"><th className="py-2">#</th><th>Namn</th><th>Poäng</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={r.name} className="border-b last:border-0">
        <td className="py-3 font-bold">{i + 1}</td><td>{r.name}</td><td className="font-black">{r.points}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
