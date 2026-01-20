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
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          participants,
          meetingType
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

  const sampleTranscript = `John: Welcome everyone to our Q4 planning session. We have three main items to discuss today.

Sarah: Thanks John. Let me start with the feature rollout. We've been evaluating three different approaches.

Mike: I'm concerned about Option A. Given what happened with the last rushed rollout, I think we can't afford to skip testing again.

John: Alright, let's go with Option B. Sarah, can you update the timeline and communicate this to the client by Friday?

Sarah: Absolutely. I'll also prepare a brief explaining why this approach is better for long-term stability.`;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white min-h-screen">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Meeting Notes Generator</h1>
        <p className="text-sm text-gray-600">Transform transcripts into professional summaries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Details
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Participants</label>
                <input
                  type="text"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="John Smith (Client), Sarah (PM)"
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto-detect">Auto-detect</option>
                  <option value="workshop">Workshop</option>
                  <option value="brainstorm">Brainstorm</option>
                  <option value="interview">Interview</option>
                  <option value="status-update">Status Update</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              Transcript
            </h2>
            
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste transcript here..."
              className="w-full h-48 p-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={() => setTranscript(sampleTranscript)}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800"
            >
              Load sample
            </button>
          </div>

          <button
            onClick={generateMeetingNotes}
            disabled={!transcript.trim() || isProcessing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Generate Notes
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-gray-50 p-4 rounded-lg h-full">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Generated Notes
            </h2>
            
            {meetingNotes ? (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded border max-h-[calc(100vh-280px)] overflow-y-auto">
                  <div className="whitespace-pre-wrap font-mono text-xs">
                    {formatNotesForEmail()}
                  </div>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy for Email
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <FileAudio className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Paste a transcript and generate notes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingNotesGenerator;
