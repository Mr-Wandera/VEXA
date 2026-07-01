import VexaChatBot from "../components/VexaChatBot";
import PageHeader from "../components/ui/PageHeader";

export default function AIPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="VEXA AI" subtitle="Your AI business partner — ask anything about your business." />
      <VexaChatBot variant="embedded" />
    </div>
  );
}
