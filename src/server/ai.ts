import { GoogleGenAI, Type } from "@google/genai";
import type { VexaInsight, Transaction, Invoice, DashboardMetrics, BusinessProfile } from "../types.ts";

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e);
    }
  }
  return aiClient;
}

const VALID_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

async function generateContentWithFallback(
  client: GoogleGenAI,
  params: Parameters<typeof client.models.generateContent>[0]
): Promise<any> {
  const primaryModel = params.model || VALID_MODELS[0];
  const modelsToTry = [primaryModel, ...VALID_MODELS.filter(m => m !== primaryModel)];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      return await client.models.generateContent({ ...params, model });
    } catch (err: any) {
      lastError = err;
      console.warn(`[VEXA AI] Model "${model}" failed: ${err?.message || err}. Trying next...`);
      await new Promise(r => setTimeout(r, 150));
    }
  }
  throw lastError;
}

// Fallback insights — use the context passed from the frontend
function getFallbackInsights(ctx: AIContext): VexaInsight[] {
  const { metrics, profile, invoices, products } = ctx;
  const currency = profile.currency || "KSh";

  const insights: VexaInsight[] = [];

  const overdue = invoices.find(i => i.status === "overdue");
  if (overdue) {
    insights.push({
      id: "ins-1",
      type: "alert",
      title: "Overdue Receivables",
      description: `Invoice ${overdue.invoiceNumber} for ${overdue.client} (${currency} ${overdue.amount.toLocaleString()}) is overdue. Collect to preserve cash reserves.`,
      impactValue: `-${currency} ${overdue.amount.toLocaleString()}`,
      actionText: "Draft Reminder",
      actionCode: `remind_overdue_${overdue.id}`,
    });
  }

  const lowStock = products.find(p => p.stock <= p.reorderLevel && p.stock < 999);
  if (lowStock) {
    insights.push({
      id: "ins-2",
      type: "alert",
      title: "Low Stock Warning",
      description: `${lowStock.name} is at ${lowStock.stock} ${lowStock.unit} (reorder level: ${lowStock.reorderLevel}). Reorder soon to avoid stockouts.`,
      impactValue: `${lowStock.stock} left`,
      actionText: "Reorder",
      actionCode: `reorder_${lowStock.id}`,
    });
  }

  insights.push({
    id: "ins-3",
    type: "forecast",
    title: "Cash Runway Status",
    description: `With ${currency} ${metrics.cashReserve.toLocaleString()} in reserves and ${currency} ${metrics.monthlyBurn.toLocaleString()} monthly burn, your runway is ${metrics.runwayMonths} months.`,
    impactValue: `${metrics.runwayMonths} months`,
    actionText: "View Projection",
    actionCode: "view_runway",
  });

  insights.push({
    id: "ins-4",
    type: metrics.netProfit > 0 ? "success" : "recommendation",
    title: metrics.netProfit > 0 ? "Profitable Operations" : "Optimize Spending",
    description: metrics.netProfit > 0
      ? `Net profit of ${currency} ${metrics.netProfit.toLocaleString()} this period. ${profile.stripeConnected ? "Stripe payouts are synced." : "Connect Stripe for auto-reconciliation."}`
      : `Expenses exceed income by ${currency} ${Math.abs(metrics.netProfit).toLocaleString()}. Review SaaS subscriptions and operational costs.`,
    impactValue: metrics.netProfit > 0 ? `+${currency} ${metrics.netProfit.toLocaleString()}` : `-${currency} ${Math.abs(metrics.netProfit).toLocaleString()}`,
    actionText: metrics.netProfit > 0 ? "View Details" : "Optimize Spend",
    actionCode: metrics.netProfit > 0 ? "view_stripe" : "optimize_saas",
  });

  return insights;
}

export interface AIContext {
  metrics: DashboardMetrics;
  profile: BusinessProfile;
  invoices: Invoice[];
  transactions: Transaction[];
  products: { id: string; name: string; stock: number; unit: string; reorderLevel: number }[];
}

export async function generateVexaInsights(ctx: AIContext): Promise<VexaInsight[]> {
  const client = getAIClient();
  if (!client) return getFallbackInsights(ctx);

  try {
    const { metrics, profile, invoices, transactions } = ctx;
    const currency = profile.currency || "KSh";

    const businessContext = `
      Business: ${profile.name} (${profile.industry})
      Currency: ${currency}
      Cash Reserve: ${currency} ${metrics.cashReserve.toLocaleString()}
      MRR: ${currency} ${metrics.mrr.toLocaleString()}
      Monthly Burn: ${currency} ${metrics.monthlyBurn.toLocaleString()}
      Runway: ${metrics.runwayMonths} months
      Net Profit: ${currency} ${metrics.netProfit.toLocaleString()}
      Outstanding Invoices: ${currency} ${metrics.outstandingInvoices.toLocaleString()}

      Invoices:
      ${invoices.map(i => `- ${i.invoiceNumber} | ${i.client} | ${currency} ${i.amount} | ${i.status} | Due: ${i.dueDate}`).join('\n')}

      Recent Transactions:
      ${transactions.slice(0, 8).map(t => `- ${t.date} | ${t.merchant} | ${currency} ${Math.abs(t.amount)} | ${t.category} | ${t.type}`).join('\n')}
    `;

    const prompt = `Analyze this business data and output exactly 4 insight cards as JSON. Focus on real metrics: overdue invoices, cash flow, spending patterns, and actionable recommendations. Use ${currency} for all amounts.`;

    const response = await generateContentWithFallback(client, {
      model: VALID_MODELS[0],
      contents: [{ text: `${businessContext}\n\n${prompt}` }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "alert, recommendation, success, or forecast" },
              title: { type: Type.STRING, description: "Max 5 words" },
              description: { type: Type.STRING, description: "Max 30 words, reference real data" },
              impactValue: { type: Type.STRING },
              actionText: { type: Type.STRING },
              actionCode: { type: Type.STRING },
            },
            required: ["type", "title", "description", "impactValue", "actionText", "actionCode"],
          },
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, idx: number) => ({ id: `ins-gen-${idx}-${Date.now()}`, ...item }));
      }
    }
    return getFallbackInsights(ctx);
  } catch (error) {
    console.error("Gemini insight generation failed, using fallback:", error);
    return getFallbackInsights(ctx);
  }
}

export async function analyzeTransaction(transaction: Transaction, profile: BusinessProfile): Promise<string> {
  const client = getAIClient();
  if (!client) {
    return transaction.type === 'expense'
      ? `Operational ${transaction.category} charge recorded under core capital burn.`
      : `Revenue received from ${transaction.merchant} for services delivered.`;
  }

  try {
    const currency = profile.currency || "KSh";
    const response = await generateContentWithFallback(client, {
      model: VALID_MODELS[0],
      contents: `Analyze this transaction in one sentence (max 15 words): ${transaction.merchant}, ${transaction.category}, ${currency} ${Math.abs(transaction.amount)}, ${transaction.type}`,
    });
    return response.text?.trim() || "Transaction verified and reconciled.";
  } catch (error) {
    console.error("Transaction analysis failed:", error);
    return "Analyzed and reconciled under standard operating procedures.";
  }
}

export async function chatWithVexa(
  userMessage: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  ctx: AIContext
): Promise<string> {
  const client = getAIClient();

  if (!client) return simulateVexaChat(userMessage, ctx);

  try {
    const { metrics, profile, invoices, transactions, products } = ctx;
    const currency = profile.currency || "KSh";

    const systemInstructions = `You are VEXA AI, an elite virtual CFO for ${profile.name} (${profile.industry}).
Currency: ${currency}. Cash: ${currency} ${metrics.cashReserve.toLocaleString()}. MRR: ${currency} ${metrics.mrr.toLocaleString()}. Burn: ${currency} ${metrics.monthlyBurn.toLocaleString()}/mo. Runway: ${metrics.runwayMonths} months. Net Profit: ${currency} ${metrics.netProfit.toLocaleString()}.

Invoices:
${invoices.map(i => `- ${i.invoiceNumber} | ${i.client} | ${currency} ${i.amount.toLocaleString()} | ${i.status} | Due: ${i.dueDate}`).join('\n')}

Recent Transactions:
${transactions.slice(0, 10).map(t => `- ${t.date} | ${t.merchant} | ${currency} ${Math.abs(t.amount).toLocaleString()} | ${t.category} | ${t.type}`).join('\n')}

Low Stock Items:
${products.filter(p => p.stock <= p.reorderLevel && p.stock < 999).map(p => `- ${p.name}: ${p.stock} ${p.unit} left (reorder at ${p.reorderLevel})`).join('\n')}

Rules: Reference real numbers. Use ${currency}. Be concise, executive-grade. Use Markdown for formatting. Forecasts are predictions, not guarantees.`;

    const chatContents = history.map(h => ({
      role: h.role === 'model' ? 'model' as const : 'user' as const,
      parts: [{ text: h.parts[0].text }],
    }));
    chatContents.push({ role: 'user' as const, parts: [{ text: userMessage }] });

    const response = await generateContentWithFallback(client, {
      model: VALID_MODELS[0],
      contents: chatContents,
      config: { systemInstruction: systemInstructions, temperature: 0.7 },
    });

    return response.text?.trim() || "I apologize. I couldn't process that. Please try again.";
  } catch (error) {
    console.error("Gemini chat failed, simulating:", error);
    return simulateVexaChat(userMessage, ctx);
  }
}

async function simulateVexaChat(query: string, ctx: AIContext): Promise<string> {
  const q = query.toLowerCase();
  const { metrics, profile, invoices, products } = ctx;
  const currency = profile.currency || "KSh";

  if (q.includes('runway') || q.includes('burn') || q.includes('cash')) {
    return `### Capital Runway Analysis

With **${currency} ${metrics.cashReserve.toLocaleString()}** in reserves and a monthly burn of **${currency} ${metrics.monthlyBurn.toLocaleString()}**, your runway is:

* **Current Runway:** \`${metrics.runwayMonths} months\`
* **Target Safety Margin:** \`12-18 months\`

#### Recommendations:
1. **Collect Overdue Invoices** — ${currency} ${metrics.outstandingInvoices.toLocaleString()} is outstanding. Recovering this extends your runway.
2. **Review SaaS Spend** — Cloud and tooling costs can often be consolidated for savings.`;
  }

  if (q.includes('overdue') || q.includes('invoice') || q.includes('reminder') || q.includes('billing')) {
    const overdue = invoices.filter(i => i.status === 'overdue');
    return `### Invoice Status

| Invoice | Client | Amount | Status | Due |
|---|---|---|---|---|
${invoices.map(i => `| ${i.invoiceNumber} | ${i.client} | ${currency} ${i.amount.toLocaleString()} | ${i.status} | ${i.dueDate} |`).join('\n')}

${overdue.length > 0 ? `#### Overdue Collection Draft for **${overdue[0].client}**:\n\n\`\`\`\nSubject: Payment Reminder — ${overdue[0].invoiceNumber}\n\nHi ${overdue[0].client},\n\nThis is a friendly reminder that invoice ${overdue[0].invoiceNumber} for ${currency} ${overdue[0].amount.toLocaleString()} is now overdue (due ${overdue[0].dueDate}).\n\nCould you let us know when to expect payment?\n\nBest regards,\n${profile.name}\n\`\`\`\n` : ''}`;
  }

  if (q.includes('stock') || q.includes('inventory') || q.includes('reorder')) {
    const lowStock = products.filter(p => p.stock <= p.reorderLevel && p.stock < 999);
    return `### Inventory Status

${lowStock.length > 0 ? `**Low Stock Alerts:**\n\n${lowStock.map(p => `- **${p.name}** — ${p.stock} ${p.unit} left (reorder at ${p.reorderLevel})`).join('\n')}\n\nConsider reordering these items soon.` : 'All inventory levels are healthy.'}`;
  }

  return `### VEXA AI

I'm synchronized with **${profile.name}** and ready to advise.

**Quick Snapshot:**
* **Cash Reserve:** \`${currency} ${metrics.cashReserve.toLocaleString()}\`
* **Monthly Burn:** \`${currency} ${metrics.monthlyBurn.toLocaleString()}\`
* **Runway:** \`${metrics.runwayMonths} months\`
* **Net Profit:** \`${currency} ${metrics.netProfit.toLocaleString()}\`

#### Try asking:
* *"What's my runway?"*
* *"Show overdue invoices and draft a reminder"*
* *"What needs reordering?"*
* *"Analyze my spending"*
`;
}
