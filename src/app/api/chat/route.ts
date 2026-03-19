import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authGuards";
import { chatMessageSchema } from "@/lib/validationSchemas";
import { runWorkflow } from "@/lib/aiAgent";

/**
 * POST /api/chat
 * Protected endpoint that sends one user message to an OpenAI custom agent
 * and returns a single assistant reply.
 */
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/chat: request received");

    const auth = requireUser(request);
    if (!auth.isAuthenticated) {
      console.log("POST /api/chat: unauthenticated request");
      return auth.response;
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      console.log("POST /api/chat: invalid JSON body");
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const validatedData = chatMessageSchema.parse(payload);

    console.log("POST /api/chat: running workflow", {
      userId: auth.payload!.userId,
      messageLength: validatedData.message.length,
    });

    const workflowResult = await runWorkflow({
      input_as_text: validatedData.message,
    });

    const reply = workflowResult.output_text.trim();

    if (!reply) {
      console.log("POST /api/chat: workflow returned empty output", {
        branch: workflowResult.branch,
      });
      return NextResponse.json(
        { error: "AI provider returned an empty response" },
        { status: 502 },
      );
    }

    console.log("POST /api/chat: success", {
      userId: auth.payload!.userId,
      branch: workflowResult.branch,
      replyLength: reply.length,
    });

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.log("POST /api/chat: validation failed", {
        issueCount: error.issues.length,
      });
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Unhandled error in POST /api/chat:", error);

    const message =
      error instanceof Error &&
      (error.message.includes("OPENAI_API_KEY") ||
        error.message.includes("OPENAI_WORKFLOW_ID") ||
        error.message.includes("OPENAI_AGENT_ID") ||
        error.message.includes("workflow"))
        ? "AI service is not configured"
        : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
