var contextMenuItem = {
  "id": "JobDescription",
  "title": "Make CoverLetter for this Job role",
  "contexts": ["selection"]
};
console.log("Context menu created");
chrome.contextMenus.create(contextMenuItem);

let selectedText;
let TextResume;
let CoverLetter;

chrome.storage.local.get(['resume'], function(result) {
  TextResume = result.resume;
  console.log(TextResume);
});

chrome.contextMenus.onClicked.addListener(function(clickedData) {
  if (clickedData.menuItemId == "JobDescription" && clickedData.selectionText) {
    console.log("Context menu started");
    selectedText = clickedData.selectionText;
    console.log("Selected text: " + selectedText);

    if (selectedText && TextResume) {
      const prompt1 =
        "Write a formal, grammatically correct cover letter based solely on the information from my resume and the relevant details provided in the job description\n\n My resume: \n\n " +
        TextResume +
        "\n\n job description:\n\n" +
        selectedText;
      var popup = window.open(
        "CoverLetter.html",
        "CoverLetterPopup",
        "width=700,height=300"
      ); // open loading animation in the popup window
      const payload = {
        model: "text-davinci-003",
        temperature: 0.9,
        max_tokens: 2324,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
        n: 1,
      };

      const apiKey = "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"; // Replace with your actual API key

      fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(Object.assign(payload, { prompt: prompt1 })),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          CoverLetter = data.choices[0].text.trim();
          console.log(CoverLetter);

          // Replace the contents of the popup window with the actual cover letter
          popup.document.open();
          popup.document.write(
            "<textarea id='CoverLetter' style='width: 100%; height: 300'></textarea>"
          );
          popup.document.getElementById("CoverLetter").value = CoverLetter;
          popup.document.close();
        });
    } else {
      console.log("ERROR");
    }
  }
});
