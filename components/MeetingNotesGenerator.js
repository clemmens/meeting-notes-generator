import MeetingNotesGenerator from '@/components/MeetingNotesGenerator'

export default function Home() {
  return (
    
      
    
  )
}
```

### components/MeetingNotesGenerator.js
```javascript
'use client'

import React, { useState } from 'react';
import { Upload, FileAudio, Mic, Copy, Mail, Loader2 } from 'lucide-react';

const MeetingNotesGenerator = () => {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(null);
  const [meetingType, setMeetingType] = useState('auto-detect');
  const [participants, setParticipants] = useState('');

  const generateMeetingNotes = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      let responseText = data.content[0].text;
      
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const notesData = JSON.parse(responseText);
      setMeetingNotes(notesData);
    } catch (error) {
      console.error("Error generating meeting notes:", error);
      alert("Failed to generate meeting notes. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatNotesForEmail = () => {
    if (!meetingNotes) return '';
    
    let emailContent = `Meeting Notes - ${meetingNotes.meetingType}\n`;
    emailContent += `${'='.repeat(50)}\n\n`;
    
    if (meetingNotes.meetingDate) {
      emailContent += `Date: ${meetingNotes.meetingDate}\n`;
    }
    emailContent += `Participants: ${participants || 'Not specified'}\n\n`;
    
    if (meetingNotes.discussionsAndDecisions && meetingNotes.discussionsAndDecisions.length > 0) {
      emailContent += `KEY DISCUSSIONS & DECISIONS\n`;
      emailContent += `${'-'.repeat(30)}\n\n`;
      meetingNotes.discussionsAndDecisions.forEach((item, index) => {
        emailContent += `${index + 1}. ${item.topic.toUpperCase()}\n\n`;
        emailContent += `   ${item.summary}\n\n`;
      });
    }
    
    if (meetingNotes.actionItems && meetingNotes.actionItems.length > 0) {
      emailContent += `ACTION ITEMS & NEXT STEPS\n`;
      emailContent += `${'-'.repeat(30)}\n\n`;
      meetingNotes.actionItems.forEach((item, index) => {
        emailContent += `${index + 1}. ${item.item}\n`;
        emailContent += `   • Owner: ${item.owner}\n`;
        emailContent += `   • Timeline: ${item.timeline}\n\n`;
      });
    }
    
    if (meetingNotes.openQuestions && meetingNotes.openQuestions.length > 0) {
      emailContent += `OPEN QUESTIONS / FOLLOW-UPS\n`;
      emailContent += `${'-'.repeat(30)}\n\n`;
      meetingNotes.openQuestions.forEach((question, index) => {
        emailContent += `${index + 1}. ${question}\n`;
      });
    }
    
    return emailContent;
  };

  const copyToClipboard = () => {
    const emailContent = formatNotesForEmail();
    navigator.clipboard.writeText(emailContent);
    alert('Meeting notes copied to clipboard!');
  };

  const sampleTranscript = `John: Welcome everyone to our Q4 planning session. We have three main items to discuss today: the new feature rollout, budget allocation, and the client presentation timeline.

Sarah: Thanks John. Let me start with the feature rollout. We've been evaluating three different approaches. Option A would give us the fastest launch but requires us to cut some testing phases. Option B is more conservative with a two-week delay but includes full QA. Option C adds advanced analytics but needs additional budget approval.

Mike: I'm concerned about Option A. Given what happened with the last rushed rollout, I think we can't afford to skip testing again. Our clients are already nervous about stability.

Sarah: That's a fair point. The crashes we had in Q2 definitely impacted client confidence. What about Option C though? The analytics could really help us demonstrate value to clients.

John: The budget committee meets next Tuesday, but I'm not optimistic about getting additional funds approved this quarter. Lisa, what's your take on the technical feasibility?

Lisa: Option B seems like the sweet spot. We can shift two developers from Project X which is ahead of schedule. That would give us the resources we need without requesting additional budget.

Mike: I can support that. Project X is indeed running smoothly, and we could use those team members more effectively here.

John: Alright, let's go with Option B. Sarah, can you update the timeline and communicate this to the client by Friday?

Sarah: Absolutely. I'll also prepare a brief explaining why this approach is better for long-term stability.

Lisa: I'll coordinate with the Project X team about the resource reallocation. Should have that sorted by Wednesday.

John: Great. One more thing - Mike raised a question about the client presentation. Do we have clarity on whether they want technical details or just business outcomes?

Sarah: That's actually still unclear. I sent them an email last week but haven't heard back. I'll follow up again tomorrow.

John: Please do. We need to nail this presentation. Anything else? No? Alright, thank you everyone.`;

  return (
    
      
        Client Meeting Notes Generator
        Transform client call transcripts into professional, shareable meeting summaries
      

      
        
          
            
              
              Meeting Details
            
            
            
              
                Participants
                <input
                  type="text"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="e.g., John Smith (Client), Sarah Johnson (PM)"
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              

              
                Meeting Type
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  Auto-detect from transcript
                  Workshop
                  Brainstorm Session
                  Interview
                  Status Update
                
              
            
          

          
            
              
              Meeting Transcript
            
            
            
              
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste meeting transcript here..."
                  className="w-full h-48 p-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <button
                  onClick={() => setTranscript(sampleTranscript)}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  Load sample transcript
                
              
            
          

          
            {isProcessing ? (
              <>
                
                Processing...
              </>
            ) : (
              <>
                
                Generate Meeting Notes
              </>
            )}
          
        

        
          
            
              
              Generated Notes
            
            
            {meetingNotes ? (
              
                
                  
                    {formatNotesForEmail()}
                  
                

                
                  
                  Copy for Email
                
              
            ) : (
              
                
                Paste a transcript and generate notes to see the results here
              
            )}
          
        
      
    
  );
};

export default MeetingNotesGenerator;
