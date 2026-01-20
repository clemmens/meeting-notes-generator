import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { transcript, participants, meetingType } = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `Please analyze this meeting transcript and create structured meeting notes. The meeting participants were: ${participants || 'Not specified'}. Meeting type: ${meetingType === 'auto-detect' ? 'Please detect from context' : meetingType}.

Focus on:
1. Key discussions, feedback, and decisions (capture the context, different viewpoints, concerns raised, and key points discussed - even if no formal decision was made)
2. Action items and next steps (who, what, when)
3. Open questions/follow-ups

Format as JSON with this structure:
{
  "meetingType": "detected or provided type",
  "meetingDate": "extract the date from the transcript if mentioned, otherwise leave as null",
  "discussionsAndDecisions": [
    {
      "topic": "brief topic name",
      "summary": "detailed summary of the discussion/feedback/decision including viewpoints, concerns, rationale, and outcome (whether decision made or just discussed)"
    }
  ],
  "actionItems": [
    {
      "item": "description of action",
      "owner": "who is responsible",
      "timeline": "when it should be completed"
    }
  ],
  "openQuestions": [
    "questions that need follow-up"
  ]
}

Transcript:
${transcript}

Respond with ONLY the JSON object, no other text.`
          }
        ]
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate notes' },
      { status: 500 }
    );
  }
}
