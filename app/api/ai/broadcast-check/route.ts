import { NextResponse } from "next/server";

type BroadcastCheckRequest = {
  businessName?: string;
  category?: string;
  location?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body: BroadcastCheckRequest = await request.json();

    const businessName = body.businessName?.trim() || "";
    const category = body.category?.trim() || "";
    const location = body.location?.trim() || "";
    const message = body.message?.trim() || "";

    if (!message) {
      return NextResponse.json(
        {
          safe: false,
          reason: "Broadcast message is required.",
        },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        {
          safe: false,
          reason: "Broadcast message must be 500 characters or less.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          safe: false,
          reason: "AI safety check is not configured.",
        },
        { status: 500 }
      );
    }

    const prompt = `
You are a community safety moderator for a business networking platform.

Review the following business broadcast before publication.

Business name: ${businessName}
Category: ${category}
Location: ${location}
Broadcast:
${message}

Check for:
- threats or violent content
- terrorism or extremist promotion
- illegal drugs or illegal activities
- scams, fraud, deceptive financial promises
- stolen or counterfeit goods
- fake documents
- abusive or hateful content
- dangerous instructions
- clearly inappropriate promotional content

Normal business promotions, offers, products, services, wholesale messages,
discounts, contact requests and local business announcements should be considered safe.

Return ONLY valid JSON in this exact structure:
{
  "safe": true,
  "reason": "Short reason"
}

If the message is unsafe, set safe to false and briefly explain why.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Gemini broadcast check error:", errorText);

      return NextResponse.json(
        {
          safe: false,
          reason: "AI safety check failed. Please try again.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const resultText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let result: { safe?: boolean; reason?: string };

    try {
      result = JSON.parse(resultText);
    } catch {
      console.error("Invalid Gemini safety response:", resultText);

      return NextResponse.json(
        {
          safe: false,
          reason: "Unable to verify broadcast safety.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      safe: result.safe === true,
      reason:
        result.reason ||
        (result.safe === true
          ? "Broadcast appears safe."
          : "Broadcast could not be approved."),
    });
  } catch (error) {
    console.error("Broadcast check error:", error);

    return NextResponse.json(
      {
        safe: false,
        reason: "Unable to check broadcast safety.",
      },
      { status: 500 }
    );
  }
}
