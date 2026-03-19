import { z } from "zod";
import {
  Agent,
  AgentInputItem,
  fileSearchTool,
  Runner,
  withTrace,
} from "@openai/agents";
const fileSearch = fileSearchTool(["vs_69ba9ab1cdd881918ca592ddf4528d0b"]);

const ClassifierSchema = z.object({
  classifier: z.enum(["betting_help", "website_use"]),
});
const classifier = new Agent({
  name: "Classifier",
  instructions:
    "You are a helpful assistant. You sholud classify the users intention. It could be to obtain help about how to use the website or help with what teams to bet on.",
  model: "gpt-4.1",
  outputType: ClassifierSchema,
  modelSettings: {
    temperature: 0.82,
    topP: 1,
    maxTokens: 1808,
    store: true,
  },
});

const bettingHelper = new Agent({
  name: "Betting Helper",
  instructions:
    "You are an helpful assistant. The user need help with placing bets on the 2026 Fifa World Cup in Football (soccer) for men. The user is supposed to bet on the score on all group stage fixtures and needs help with knowledge of which teams are probably going to win their matches. Please use web search and betting sites to gather information about the teams. Keep the answer short and in plain text. Do not output markdown.",
  model: "gpt-4.1",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 1500,
    store: true,
  },
});

const websiteUseHelper = new Agent({
  name: "Website Use Helper",
  instructions:
    "You are an helpful assistant. The user need help with how to use the website. There is a big form to fill out and the user needs simple instructions to be able to understand the form. Please use the file.md in the vector store to add context about how the website works and how to use the form. Keep the answer short and in plain text. Do not output markdown.",
  model: "gpt-4.1",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 1500,
    store: true,
  },
  tools: [fileSearch],
});

type WorkflowInput = { input_as_text: string };

type WorkflowResult = {
  output_text: string;
  branch: z.infer<typeof ClassifierSchema>["classifier"];
};

function getWorkflowId(): string {
  const workflowId = process.env.OPENAI_WORKFLOW_ID;
  const legacyWorkflowId = process.env.OPENAI_AGENT_ID;

  if (!workflowId && !legacyWorkflowId) {
    throw new Error("Missing OPENAI_WORKFLOW_ID environment variable");
  }

  // Backward compatible fallback while migrating existing local environments.
  const resolvedWorkflowId = workflowId || legacyWorkflowId!;

  if (!resolvedWorkflowId.startsWith("wf_")) {
    throw new Error("Workflow id must start with wf_");
  }

  return resolvedWorkflowId;
}

// Main code entrypoint
export const runWorkflow = async (
  workflow: WorkflowInput,
): Promise<WorkflowResult> => {
  return await withTrace("World Cup Bet Agent", async () => {
    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [{ type: "input_text", text: workflow.input_as_text }],
      },
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: getWorkflowId(),
      },
    });

    const classifierResultTemp = await runner.run(classifier, [
      ...conversationHistory,
    ]);
    conversationHistory.push(
      ...classifierResultTemp.newItems.map((item) => item.rawItem),
    );

    if (!classifierResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const classifierResult = classifierResultTemp.finalOutput;

    if (classifierResult.classifier === "betting_help") {
      const bettingHelperResultTemp = await runner.run(bettingHelper, [
        ...conversationHistory,
      ]);
      conversationHistory.push(
        ...bettingHelperResultTemp.newItems.map((item) => item.rawItem),
      );

      if (!bettingHelperResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      const outputText = String(bettingHelperResultTemp.finalOutput).trim();
      if (!outputText) {
        throw new Error("Betting helper returned an empty response");
      }

      return {
        output_text: outputText,
        branch: "betting_help",
      };
    }

    if (classifierResult.classifier === "website_use") {
      const websiteUseHelperResultTemp = await runner.run(websiteUseHelper, [
        ...conversationHistory,
      ]);
      conversationHistory.push(
        ...websiteUseHelperResultTemp.newItems.map((item) => item.rawItem),
      );

      if (!websiteUseHelperResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      const outputText = String(websiteUseHelperResultTemp.finalOutput).trim();
      if (!outputText) {
        throw new Error("Website helper returned an empty response");
      }

      return {
        output_text: outputText,
        branch: "website_use",
      };
    }

    throw new Error("Classifier returned an unsupported branch");
  });
};
