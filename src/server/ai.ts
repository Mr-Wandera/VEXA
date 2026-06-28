import { GoogleGenAI, Type } from "@google/genai";
import { dbStore, Transaction, Invoice, Client } from "./store.ts";

// Gracefully read GEMINI_API_KEY. If not found, we use a mock AI engine that mimics Gemini output
// so that the application is fully functional and beautiful even without a key, as requested.
const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e);
    }
  }
  return aiClient;
}

async function generateContentWithFallback(
  client: GoogleGenAI,
  params: Parameters<typeof client.models.generateContent>[0]
): Promise<any> {
  const primaryModel = params.model || "gemini-3.5-flash";
  const modelsToTry = [
    primaryModel,
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      const callParams = {
        ...params,
        model: currentModel
      };
      return await client.models.generateContent(callParams);
    } catch (err: any) {
      lastError = err;
      console.warn(
        `[VEXA AI RESILIENCY] Call failed using model "${currentModel}". Error: ${err?.message || err}. ` +
        (i < modelsToTry.length - 1 ? `Retrying with next fallback model...` : `No remaining fallback models.`)
      );
      // Wait briefly
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  throw lastError;
}

export interface VexaInsight {
  id: string;
  type: 'alert' | 'recommendation' | 'success' | 'forecast';
  title: string;
  description: string;
  impactValue?: string;
  actionText?: string;
  actionCode?: string; // identifier of action (e.g. remind_overdue_inv-104)
}

// Fallback high-fidelity insights if Gemini is unavailable
const FALLBACK_INSIGHTS: VexaInsight[] = [
  {
    id: "ins-1",
    type: "alert",
    title: "Overdue Receivables Risk",
    description: "Invoice INV-2026-104 for Arc Software ($4,500) is 17 days overdue. This threatens cash reserves if unresolved.",
    impactValue: "-$4,500",
    actionText: "Draft AI Reminder",
    actionCode: "remind_overdue_inv-104"
  },
  {
    id: "ins-2",
    type: "forecast",
    title: "SaaS Expense Optimization",
    description: "Your subscription spending at WeWork and AWS grew by 14% this month. Consolidating cloud regions could save $240/mo.",
    impactValue: "+$2,880/yr",
    actionText: "Analyze Cloud Spend",
    actionCode: "optimize_saas"
  },
  {
    id: "ins-3",
    type: "success",
    title: "Healthy Cash Runway established",
    description: "Based on active retainer billing from Stripe Tech and Linear Labs, your runway is safe at 11.9 months with $148K reserve.",
    impactValue: "11.9 Months",
    actionText: "View Projection",
    actionCode: "view_runway"
  },
  {
    id: "ins-4",
    type: "recommendation",
    title: "Stripe Connection Active",
    description: "Auto-payouts are synchronized with 0-latency. No pending payouts are blocked at this time.",
    impactValue: "Synced",
    actionText: "Stripe Console",
    actionCode: "view_stripe"
  }
];

export async function generateVexaInsights(): Promise<VexaInsight[]> {
  const client = getAIClient();
  if (!client) {
    // Graceful fallback
    return FALLBACK_INSIGHTS;
  }

  const metrics = dbStore.getOverviewMetrics();
  const activeInvoices = dbStore.invoices;
  const recentTrans = dbStore.transactions.slice(0, 5);

  const businessContext = `
    Business Name: ${dbStore.profile.name}
    Industry: ${dbStore.profile.industry}
    Cash Reserve: $${metrics.cashReserve}
    MRR (Monthly Recurring Revenue): $${metrics.mrr}
    Monthly Burn: $${metrics.monthlyBurn}
    Runway: ${metrics.runwayMonths} months
    Net Profit (This Month): $${metrics.netProfit}
    Total Income: $${metrics.totalIncome}
    Total Expenses: $${metrics.totalExpense}
    
    Active Invoices:
    ${activeInvoices.map(i => `- ${i.invoiceNumber} for ${i.client}: $${i.amount} (Due: ${i.dueDate}, Status: ${i.status})`).join('\n')}
    
    Recent Transactions:
    ${recentTrans.map(t => `- ${t.date} ${t.merchant}: $${t.amount} (${t.category}, ${t.type})`).join('\n')}
  `;

  try {
    const prompt = `
      You are VEXA AI, a premier financial partner and business intelligence strategist.
      Analyze the provided business ledger context and output exactly 4 action-oriented, professional insight cards.
      Avoid generic advice. Focus on actual metrics provided (e.g., if there are overdue invoices like Arc Software, alert about it; calculate true runway; optimize the SaaS spend; praise strong cash flows).
      
      Output must strictly match this JSON schema format:
      An array of objects with these fields:
      - type: "alert" | "recommendation" | "success" | "forecast"
      - title: a concise, punchy title (max 5 words)
      - description: a clear, descriptive analysis (max 25 words)
      - impactValue: a short impact label, e.g. "+$240/mo", "-$4,500", "11.9 Mo", "Healthy"
      - actionText: a short action button text, e.g. "Remind Client", "Optimize", "View Details"
      - actionCode: a unique code identifier, e.g. "remind_overdue_inv-104", "optimize_spend", "view_runway"
    `;

    const response = await generateContentWithFallback(client, {
      model: "gemini-3.5-flash",
      contents: [
        { text: `Here is the financial business data:\n${businessContext}` },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "Must be 'alert', 'recommendation', 'success', or 'forecast'" },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impactValue: { type: Type.STRING },
              actionText: { type: Type.STRING },
              actionCode: { type: Type.STRING }
            },
            required: ["type", "title", "description", "impactValue", "actionText", "actionCode"]
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: `ins-gen-${idx}-${Date.now()}`,
          ...item
        }));
      }
    }
    return FALLBACK_INSIGHTS;
  } catch (error) {
    console.error("Gemini Insight Generation failed, using premium mock fallback:", error);
    return FALLBACK_INSIGHTS;
  }
}

export async function analyzeTransaction(transaction: Transaction): Promise<string> {
  const client = getAIClient();
  if (!client) {
    return transaction.type === 'expense' 
      ? `Operational ${transaction.category} charge recorded under core capital burn.`
      : `Revenue received from ${transaction.merchant} for services delivered.`;
  }

  try {
    const prompt = `
      You are VEXA AI. Analyze this ledger entry and write a professional, highly precise 1-sentence analysis of its business impact.
      Merchant: ${transaction.merchant}
      Category: ${transaction.category}
      Amount: ${transaction.amount}
      Type: ${transaction.type}
      
      Write with Stripe-like executive clarity. Keep under 15 words.
    `;

    const response = await generateContentWithFallback(client, {
      model: "gemini-3.5-flash",
      contents: prompt
    });

    return response.text?.trim() || "Transaction verified and reconciled successfully.";
  } catch (error) {
    console.error("Gemini Transaction Analysis failed:", error);
    return "Analyzed and reconciled under standard corporate operating procedures.";
  }
}

export async function chatWithVexa(userMessage: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[]): Promise<string> {
  const client = getAIClient();
  
  const metrics = dbStore.getOverviewMetrics();
  const activeInvoices = dbStore.invoices;
  const recentTrans = dbStore.transactions;

  const systemInstructions = `
    You are VEXA AI, an elite virtual Chief Financial Officer (CFO) and strategic advisor built for next-generation startups, high-growth SMEs, and Gen Z founders.
    You communicate with executive authority, supreme clarity, and modern elegance. You never sound robotic or like boring QuickBooks help docs. You are smart, tactical, and helpful.
    
    You have full real-time access to the user's business financials:
    - Company Name: ${dbStore.profile.name}
    - Industry: ${dbStore.profile.industry}
    - Operating Currency: ${dbStore.profile.currency}
    - Cash on Hand: $${metrics.cashReserve}
    - MRR (Monthly Recurring Revenue): $${metrics.mrr}
    - Monthly Burn Rate: $${metrics.monthlyBurn}
    - Runway Left: ${metrics.runwayMonths} months
    - Year-to-Date Net Profit: $${metrics.netProfit}
    - Active Invoices: ${activeInvoices.length} total (${activeInvoices.filter(i => i.status === 'overdue').length} overdue)
    
    Invoices:
    ${activeInvoices.map(i => `- ${i.invoiceNumber} for ${i.client}: $${i.amount} (Due: ${i.dueDate}, Status: ${i.status})`).join('\n')}
    
    Recent Transactions:
    ${recentTrans.slice(0, 10).map(t => `- ${t.date} | ${t.merchant}: $${t.amount} (${t.category}, Status: ${t.status})`).join('\n')}

    Rules of Engagement:
    1. Reference concrete numbers when answering. For example, if the user asks "How is my business doing?", cite their cash reserve of $${metrics.cashReserve} and their MRR of $${metrics.mrr}.
    2. Propose smart, highly actionable solutions (e.g. recommend chasing the overdue invoice from Arc Software, or reducing SaaS infrastructure costs).
    3. Keep formatting clean, modern, and highly readable with Markdown tables, bold figures, and clear bullet lists.
    4. If the user asks you to perform an action (like draft an invoice reminder, categorize an expense, or forecast cash flow), provide the exact text/calculation they need.
    5. Always remain executive-grade, trustworthy, and premium.
  `;

  if (!client) {
    // Elegant offline chatbot simulation
    return simulateVexaChat(userMessage);
  }

  try {
    // Reformat history for @google/genai format
    // Format must be standard chat contents array
    const chatContents = history.map(h => ({
      role: h.role === 'model' ? 'model' as const : 'user' as const,
      parts: [{ text: h.parts[0].text }]
    }));

    // Add current message to contents
    chatContents.push({
      role: 'user' as const,
      parts: [{ text: userMessage }]
    });

    const response = await generateContentWithFallback(client, {
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemInstructions,
        temperature: 0.7
      }
    });

    return response.text?.trim() || "I apologize. I am currently reconciling your offline records. Please try again.";
  } catch (error) {
    console.error("Gemini Chat failed, simulating response:", error);
    return simulateVexaChat(userMessage);
  }
}

function simulateVexaChat(query: string): string {
  const q = query.toLowerCase();
  const metrics = dbStore.getOverviewMetrics();
  
  if (q.includes('runway') || q.includes('burn')) {
    return `### 📊 Capital Runway Analysis

Based on your current cash reserve of **$${metrics.cashReserve.toLocaleString()}** and a monthly operating burn rate of **$${metrics.monthlyBurn.toLocaleString()}**, your company is positioned with a secure runway:

* **Current Runway:** \`${metrics.runwayMonths} months\`
* **Optimum Safety Margin:** \`12 - 18 months\`

#### VEXA Strategic Recommendations:
1. **Accelerate Receivables:** You have overdue billing of **$4,500** pending on Arc Software. Recovering this will increase your safety margin.
2. **Optimize Fixed SaaS Spend:** Reconcile your development costs. You spent over $2,000 on platforms like AWS and Vercel hosting this past month. Reducing staging environments can defer burn rate and secure an additional week of runway annually.`;
  }
  
  if (q.includes('overdue') || q.includes('invoice') || q.includes('billing')) {
    return `### 🧾 Invoice Status & Collection Strategy

You have a total of **${dbStore.invoices.length} invoices** in your billing cycle. Here is your current collections ledger:

| Invoice ID | Client | Amount | Status | Due Date |
| :--- | :--- | :--- | :--- | :--- |
| **INV-2026-104** | Arc Software | $4,500 | 🚨 Overdue | May 25, 2026 |
| **INV-2026-103** | Linear Labs | $8,400 | ⏳ Pending | Jul 05, 2026 |
| **INV-2026-105** | Raycast Studio | $7,500 | ⏳ Pending | Jul 15, 2026 |

#### AI Collection Draft for **Arc Software**:
Here is a high-context collection reminder tailored to maintain premium client relationships:

\`\`\`markdown
Subject: Dynamic Invoice Resolution | Aesthetic Lab & Arc Software

Hi Billing Team,

I hope you are well. We are finalizing our Q2 accounts reconciliation. 
Please note that INV-2026-104 ($4,500) has passed its settlement date of May 25, 2026.

Could you let us know when to expect the automatic ACH transfer, or if we can assist by providing a secure credit card link?

Best regards,
Aesthetic Lab Accounting
\`\`\`

*Would you like me to send this reminder via our integrated email handler?*`;
  }

  return `### 🌌 Hello from VEXA AI Command Center

I am fully synchronized with **${dbStore.profile.name}** and ready to advise on your startup financial operations.

Here is a quick operational snapshot:
* **Operating Cash:** \`$${metrics.cashReserve.toLocaleString()}\`
* **Monthly burn:** \`$${metrics.monthlyBurn.toLocaleString()}\`
* **Runway:** \`${metrics.runwayMonths} Months\`

#### Try asking me:
* *"How can I optimize my runway?"*
* *"Show my overdue invoices and draft a reminder"*
* *"Analyze my SaaS hosting costs"*
`;
}
