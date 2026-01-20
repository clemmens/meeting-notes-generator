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
