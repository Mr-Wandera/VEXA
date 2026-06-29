import VexaChatBot from "../components/VexaChatBot";

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">VEXA AI</h1>
        <p className="text-sm text-neutral-400">Your AI business partner — ask anything about your business.</p>
      </div>
      <VexaChatBot />
    </div>
  );
}
